#!/usr/bin/env node

/**
 * Database Restore Tool
 *
 * This tool restores database backups from S3, checking for migration compatibility
 * before performing the restore operation.
 *
 * Environment variables:
 * - DATABASE_URL: Database connection string
 * - AWS_ACCESS_KEY_ID: AWS access key
 * - AWS_SECRET_ACCESS_KEY: AWS secret key
 * - BACKUP_BUCKETS: S3 bucket names (comma-separated)
 * - BACKUP_TARGET_ENV: The environment name (e.g., 'local', 'dev', 'prod')
 *
 * Usage:
 *   node bin/restore.js --restore "20250509135352"
 *   node bin/restore.js -r "20250509135352"
 */

const { execSync } = require('child_process')
const fs = require('fs-extra')
const path = require('path')
const {
  S3Client,
  GetObjectCommand,
  HeadObjectCommand,
} = require('@aws-sdk/client-s3')
const yargs = require('yargs')

// Configuration
const TEMP_DIR = path.join(process.cwd(), 'tmp', 'restore')

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
 * Check if a backup exists in S3
 * @param {string} bucket - S3 bucket name
 * @param {string} timestamp - Backup timestamp
 * @returns {Promise<boolean>} - Whether the backup exists
 */
async function checkBackupExists(bucket, timestamp) {
  try {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: `${targetEnv}/${timestamp}/metadata.json`,
    })

    await s3Client.send(command)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Download a file from S3
 * @param {string} bucket - S3 bucket name
 * @param {string} key - S3 object key
 * @param {string} localPath - Local file path
 * @returns {Promise<void>}
 */
async function downloadFromS3(bucket, key, localPath) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })

    const { Body } = await s3Client.send(command)
    const content = await streamToString(Body)
    fs.writeFileSync(localPath, content)
    console.log(`Downloaded ${key} to ${localPath}`)
  } catch (error) {
    console.error(`Error downloading ${key}:`, error.message)
    throw error
  }
}

/**
 * Get metadata for a backup
 * @param {string} bucket - S3 bucket name
 * @param {string} timestamp - Backup timestamp
 * @returns {Promise<Object>} - Backup metadata
 */
async function getBackupMetadata(bucket, timestamp) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: `${targetEnv}/${timestamp}/metadata.json`,
    })

    const { Body } = await s3Client.send(command)
    const content = await streamToString(Body)
    return JSON.parse(content)
  } catch (error) {
    console.error(`Error retrieving metadata for ${timestamp}:`, error.message)
    throw error
  }
}

/**
 * Import a table from CSV using psql's COPY command
 * @param {string} tableName - Name of the table to import
 * @param {string} inputPath - Path to input CSV file
 */
function importTableFromCsv(tableName, inputPath) {
  try {
    const connectionString = getPsqlConnectionString()

    // First truncate the table to avoid conflicts
    execSync(
      `psql "${connectionString}" -c "TRUNCATE TABLE ${tableName} CASCADE"`,
    )

    // Then import data from CSV
    execSync(
      `psql "${connectionString}" -c "\\COPY ${tableName} FROM '${inputPath}' WITH CSV HEADER"`,
    )

    console.log(`Imported ${inputPath} to ${tableName}`)
  } catch (error) {
    console.error(`Error importing table ${tableName}:`, error.message)
    throw error
  }
}

/**
 * Restores a database backup from S3
 * @param {Object} argv - Command line arguments
 */
async function restoreBackup(argv) {
  const timestamp = argv.restore

  if (!timestamp) {
    console.error('Timestamp is required')
    process.exit(1)
  }

  console.log(`Attempting to restore backup: ${timestamp}`)

  // Use the first bucket
  const bucket = buckets[0]

  try {
    // Check if backup exists
    const backupExists = await checkBackupExists(bucket, timestamp)
    if (!backupExists) {
      console.error(`Backup not found: ${timestamp}`)
      process.exit(1)
    }

    // Get backup metadata
    const metadata = await getBackupMetadata(bucket, timestamp)
    console.log(
      `Found backup from ${metadata.createdAt} with comment: ${metadata.comment || 'No comment'}`,
    )

    // Check migration compatibility
    const currentMigration = getLatestMigration()
    const backupMigration = metadata.migrationInfo

    if (currentMigration.migrationName !== backupMigration.migrationName) {
      console.error(`Migration mismatch. Cannot restore backup.`)
      console.error(`Current migration: ${currentMigration.migrationName}`)
      console.error(`Backup migration: ${backupMigration.migrationName}`)
      process.exit(1)
    }

    // Create temp directory for restore
    const restoreDir = path.join(TEMP_DIR, timestamp)
    fs.ensureDirSync(restoreDir)

    try {
      // Download all table files
      const tables = metadata.tables
      for (const table of tables) {
        const key = `${targetEnv}/${timestamp}/${table}.csv`
        const localPath = path.join(restoreDir, `${table}.csv`)
        await downloadFromS3(bucket, key, localPath)
      }

      // Import all tables
      for (const table of tables) {
        const csvPath = path.join(restoreDir, `${table}.csv`)
        importTableFromCsv(table, csvPath)
      }

      console.log('Restore completed successfully!')
    } finally {
      // Clean up temp directory
      fs.removeSync(restoreDir)
      console.log(`Cleaned up temporary directory: ${restoreDir}`)
    }
  } catch (error) {
    console.error('Restore failed:', error.message)
    process.exit(1)
  }
}

// Command line interface
yargs
  .usage('Usage: $0 [options]')
  .option('restore', {
    alias: 'r',
    describe: 'Restore a backup with the specified timestamp',
    type: 'string',
  })
  .example(
    'npm run restore:dev -- --restore "20250509135352"',
    'Restore a backup',
  )
  .example(
    'npm run restore:dev -- -r "20250509135352"',
    'Restore a backup with short option',
  )
  .help()
  .epilogue(
    'For more information, check the comments at the top of this script.',
  )
  .wrap(yargs.terminalWidth())

// Parse arguments
const argv = yargs.argv

// Process command based on options
async function main() {
  if (argv.restore) {
    // Run restore with timestamp
    await restoreBackup(argv)
  } else {
    // If no option is provided, show help
    console.log('Database Restore Tool')
    console.log('-----------------')
    console.log('Available options:')
    console.log(
      '  --restore, -r   Restore a database backup with the specified timestamp',
    )
    console.log('\nUsage examples:')
    console.log(
      '  npm run restore:dev -- --restore "20250509135352"    Restore a backup',
    )
    console.log(
      '  npm run restore:dev -- -r "20250509135352"           Restore a backup with short option',
    )
    console.log('\nFor more details run: npm run restore:dev -- --help')
  }
}

// Run main function
main().catch((error) => {
  console.error('Error:', error.message)
  process.exit(1)
})
