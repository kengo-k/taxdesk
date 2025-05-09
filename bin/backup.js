#!/usr/bin/env node

/**
 * Database Backup Tool
 *
 * This tool creates database backups by exporting tables to CSV format using psql
 * and uploading the files to an S3 bucket. It also includes functionality to list
 * recent backups.
 *
 * Environment variables:
 * - DATABASE_URL: Database connection string
 * - AWS_ACCESS_KEY_ID: AWS access key
 * - AWS_SECRET_ACCESS_KEY: AWS secret key
 * - BACKUP_BUCKETS: S3 bucket names (comma-separated)
 * - BACKUP_TARGET_ENV: The environment name (e.g., 'local', 'dev', 'prod')
 *
 * Usage:
 *   node bin/backup.js create
 *   node bin/backup.js list
 */

const { execSync } = require('child_process')
const fs = require('fs-extra')
const path = require('path')
const moment = require('moment')
// AWS SDK v3 imports
const {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} = require('@aws-sdk/client-s3')
const { Upload } = require('@aws-sdk/lib-storage')
const yargs = require('yargs')

// Configuration
const TEMP_DIR = path.join(process.cwd(), 'tmp', 'backup')
const DATE_FORMAT = 'YYYYMMDDHHmmss'

// Ensure required environment variables are set
const requiredEnvVars = [
  'DATABASE_URL',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'BACKUP_BUCKETS',
  'BACKUP_TARGET_ENV',
]

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName],
)
if (missingEnvVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`,
  )
  process.exit(1)
}

// AWS S3 configuration with SDK v3
const s3ClientOptions = {
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION || 'us-east-1', // Default to us-east-1 if not specified
}

// Add endpoint if specified in environment
if (process.env.AWS_ENDPOINT) {
  s3ClientOptions.endpoint = process.env.AWS_ENDPOINT
  console.log(`Using custom endpoint: ${process.env.AWS_ENDPOINT}`)
}

const s3Client = new S3Client(s3ClientOptions)

const buckets = process.env.BACKUP_BUCKETS.split(',').map((b) => b.trim())
const targetEnv = process.env.BACKUP_TARGET_ENV

/**
 * Gets a cleaned database URL suitable for psql (removing query parameters)
 * @returns {string} Clean database URL for psql
 */
function getPsqlConnectionString() {
  const dbUrl = process.env.DATABASE_URL
  // Remove query parameters that psql doesn't understand
  return dbUrl.split('?')[0]
}

/**
 * Executes a SQL query using psql and returns the output
 * @param {string} query - SQL query to execute
 * @returns {string} - Command output
 */
function executeQuery(query) {
  try {
    const connectionString = getPsqlConnectionString()
    return execSync(`psql "${connectionString}" -c "${query}" -t`)
      .toString()
      .trim()
  } catch (error) {
    console.error('Error executing query:', error.message)
    throw error
  }
}

/**
 * Gets a list of all tables in the database, excluding Prisma migration tables
 * @returns {string[]} - Array of table names
 */
function getTables() {
  const query =
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE '_prisma_migrations%' ORDER BY tablename"
  const result = executeQuery(query)
  return result
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

/**
 * Gets the latest migration information from the Prisma migrations table
 * @returns {Object} - Migration information
 */
function getLatestMigration() {
  try {
    const query =
      'SELECT id, checksum, finished_at, migration_name FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 1'
    const result = executeQuery(query)

    if (!result) {
      return { id: 'none', migrationName: 'none', appliedAt: 'none' }
    }

    const parts = result
      .trim()
      .split('|')
      .map((part) => part.trim())
    return {
      id: parts[0],
      migrationName: parts[3],
      appliedAt: parts[2],
    }
  } catch (error) {
    console.error('Error getting latest migration:', error.message)
    return { id: 'error', migrationName: 'error', appliedAt: 'error' }
  }
}

/**
 * Exports a table to CSV using psql's COPY command
 * @param {string} tableName - Name of the table to export
 * @param {string} outputPath - Path to output CSV file
 */
function exportTableToCsv(tableName, outputPath) {
  try {
    const connectionString = getPsqlConnectionString()
    execSync(
      `psql "${connectionString}" -c "\\COPY ${tableName} TO '${outputPath}' WITH CSV HEADER"`,
    )
    console.log(`Exported ${tableName} to ${outputPath}`)
  } catch (error) {
    console.error(`Error exporting table ${tableName}:`, error.message)
    throw error
  }
}

/**
 * Creates metadata file with backup information
 * @param {string} metadataPath - Path to metadata file
 * @param {Object} migrationInfo - Migration information
 * @param {string[]} tables - List of backed up tables
 * @param {string} comment - User comment for this backup
 */
function createMetadataFile(metadataPath, migrationInfo, tables, comment) {
  const metadata = {
    createdAt: new Date().toISOString(),
    environment: targetEnv,
    migrationInfo,
    tables,
    comment,
  }

  fs.writeJsonSync(metadataPath, metadata, { spaces: 2 })
  console.log(`Created metadata file: ${metadataPath}`)
}

/**
 * Uploads a file to S3
 * @param {string} filePath - Path to local file
 * @param {string} bucket - S3 bucket name
 * @param {string} key - S3 object key
 * @returns {Promise} - Upload promise
 */
async function uploadToS3(filePath, bucket, key) {
  const fileContent = fs.readFileSync(filePath)

  try {
    // Using the Upload utility for improved uploads
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucket,
        Key: key,
        Body: fileContent,
      },
    })

    const data = await upload.done()
    console.log(`Uploaded ${filePath} to s3://${bucket}/${key}`)
    return data
  } catch (error) {
    console.error(`Error uploading ${filePath} to S3:`, error.message)
    throw error
  }
}

/**
 * Creates a database backup and uploads it to S3
 */
async function createBackup(argv) {
  const { comment } = argv
  const timestamp = moment().format(DATE_FORMAT)
  const backupDir = path.join(TEMP_DIR, timestamp)

  // Ensure backup directory exists
  fs.ensureDirSync(backupDir)

  try {
    // Get tables and migration info
    const tables = getTables()
    const migrationInfo = getLatestMigration()

    // Export each table to CSV
    for (const table of tables) {
      const csvPath = path.join(backupDir, `${table}.csv`)
      exportTableToCsv(table, csvPath)
    }

    // Create metadata file
    const metadataPath = path.join(backupDir, 'metadata.json')
    createMetadataFile(metadataPath, migrationInfo, tables, comment)

    // Upload to S3
    for (const bucket of buckets) {
      // Create directory structure in S3: [env]/[date]/[files]
      const s3BasePath = `${targetEnv}/${timestamp}`

      // Upload all files in the backup directory
      const files = fs.readdirSync(backupDir)
      for (const file of files) {
        const filePath = path.join(backupDir, file)
        const s3Key = `${s3BasePath}/${file}`
        await uploadToS3(filePath, bucket, s3Key)
      }

      console.log(`Backup uploaded to s3://${bucket}/${s3BasePath}/`)
    }

    console.log('Backup completed successfully!')
  } catch (error) {
    console.error('Backup failed:', error.message)
    process.exit(1)
  } finally {
    // Clean up temp directory
    fs.removeSync(backupDir)
    console.log(`Cleaned up temporary directory: ${backupDir}`)
  }
}

/**
 * Convert a readable stream to a string
 * @param {Stream} stream - Readable stream
 * @returns {Promise<string>} String content
 */
function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = []
    stream.on('data', (chunk) => chunks.push(chunk))
    stream.on('error', reject)
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  })
}

/**
 * Lists recent backups in S3
 */
async function listBackups() {
  if (buckets.length === 0) {
    console.error('No backup buckets configured')
    return
  }

  // Use the first bucket for listing
  const bucket = buckets[0]
  const prefix = `${targetEnv}/`

  try {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      Delimiter: '/',
    })

    const data = await s3Client.send(command)

    if (!data.CommonPrefixes || data.CommonPrefixes.length === 0) {
      console.log(`No backups found in s3://${bucket}/${prefix}`)
      return
    }

    // Sort by prefix (which includes date)
    const backups = data.CommonPrefixes.map((p) =>
      p.Prefix.replace(prefix, '').replace('/', ''),
    )
      .sort()
      .reverse()

    console.log(`Recent backups in environment '${targetEnv}':\n`)
    console.log('ID | Timestamp | Migration | Comment')
    console.log('-'.repeat(100))

    // Fetch metadata for each backup
    for (let i = 0; i < Math.min(backups.length, 10); i++) {
      const backup = backups[i]
      try {
        // Attempt to get the metadata.json file
        const command = new GetObjectCommand({
          Bucket: bucket,
          Key: `${prefix}${backup}/metadata.json`,
        })

        const { Body } = await s3Client.send(command)
        const content = await streamToString(Body)
        const metadata = JSON.parse(content)

        const comment = metadata.comment || 'No comment'
        const migrationName = metadata.migrationInfo?.migrationName || 'Unknown'
        console.log(`${i + 1}. | ${backup} | ${migrationName} | ${comment}`)
      } catch (error) {
        // If metadata can't be retrieved, show backup without comment
        console.log(`${i + 1}. | ${backup} | Unknown | [Metadata unavailable]`)
      }
    }

    console.log(
      `\nView details: aws s3 ls s3://${bucket}/${prefix}<backup-name>/`,
    )
  } catch (error) {
    console.error('Error listing backups:', error.message)
    process.exit(1)
  }
}

// Command line interface
yargs
  .usage('Usage: $0 [options]')
  .option('create', {
    alias: 'c',
    describe: 'Create a new backup with the specified comment',
    type: 'string',
    conflicts: 'list',
  })
  .option('list', {
    alias: 'l',
    describe: 'List recent backups',
    type: 'boolean',
    conflicts: 'create',
  })
  .example(
    'npm run backup -- --create "Weekly backup"',
    'Create a new backup with comment',
  )
  .example(
    'npm run backup -- -c "Monthly backup"',
    'Create a new backup with short option',
  )
  .example('npm run backup -- --list', 'List recent backups')
  .example('npm run backup -- -l', 'List recent backups with short option')
  .help()
  .epilogue(
    'For more information, check the comments at the top of this script.',
  )
  .wrap(yargs.terminalWidth())

// Parse arguments
const argv = yargs.argv

// Process command based on options
async function main() {
  if (argv.create) {
    // Run backup with comment
    const comment = argv.create
    await createBackup({ comment })
  } else if (argv.list) {
    // List backups
    await listBackups()
  } else {
    // If no option is provided, show help
    console.log('Database Backup Tool')
    console.log('-----------------')
    console.log('Available options:')
    console.log(
      '  --create, -c   Create a new database backup with the specified comment',
    )
    console.log('  --list, -l     List recent backups in S3')
    console.log('\nUsage examples:')
    console.log(
      '  npm run backup -- --create "Weekly backup"    Create a new backup',
    )
    console.log(
      '  npm run backup -- -c "Monthly backup"         Create a new backup with short option',
    )
    console.log(
      '  npm run backup -- --list                      List recent backups',
    )
    console.log(
      '  npm run backup -- -l                          List recent backups with short option',
    )
    console.log('\nFor more details run: npm run backup -- --help')
  }
}

// Run main function
main().catch((error) => {
  console.error('Error:', error.message)
  process.exit(1)
})
