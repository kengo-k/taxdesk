/**
 * Backup Library - Core functions for database backup and restore operations
 *
 * This library provides the core functionality for creating database backups,
 * listing backups, and restoring from backups. It's designed to be used by
 * both CLI tools and API endpoints.
 *
 * Environment variables required:
 * - DATABASE_URL: Database connection string
 * - AWS_ACCESS_KEY_ID: AWS access key
 * - AWS_SECRET_ACCESS_KEY: AWS secret key
 * - BACKUP_BUCKETS: S3 bucket names (comma-separated)
 * - BACKUP_TARGET_ENV: The environment name (e.g., 'local', 'dev', 'prod')
 */

const { execSync } = require('child_process')
const fs = require('fs-extra')
const path = require('path')
const moment = require('moment')
const {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  HeadObjectCommand,
} = require('@aws-sdk/client-s3')
const { Upload } = require('@aws-sdk/lib-storage')

// Configuration
const TEMP_DIR = path.join(process.cwd(), 'tmp')
const BACKUP_TEMP_DIR = path.join(TEMP_DIR, 'backup')
const RESTORE_TEMP_DIR = path.join(TEMP_DIR, 'restore')
const DATE_FORMAT = 'YYYYMMDDHHmmss'

// Initialize S3 client and configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
})

const buckets = process.env.BACKUP_BUCKETS
  ? process.env.BACKUP_BUCKETS.split(',')
  : []
const targetEnv = process.env.BACKUP_TARGET_ENV || 'local'

/**
 * Gets a clean database connection string for psql
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
 * Gets the current migration name only
 * @returns {string} - Current migration name
 */
function getCurrentMigrationName() {
  try {
    const query =
      'SELECT migration_name FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 1'
    const result = executeQuery(query)

    if (!result || result.trim() === '') {
      console.log('No migrations found in database')
      return 'none'
    }

    const migrationName = result.trim()
    console.log('Current migration:', migrationName)
    return migrationName
  } catch (error) {
    console.error('Error getting current migration name:', error.message)
    return 'error'
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
 * Imports a CSV file into a database table using psql's COPY command
 * @param {string} tableName - Name of the table to import to
 * @param {string} csvPath - Path to CSV file
 */
function importTableFromCsv(tableName, csvPath) {
  try {
    const connectionString = getPsqlConnectionString()
    execSync(
      `psql "${connectionString}" -c "\\COPY ${tableName} FROM '${csvPath}' WITH CSV HEADER"`,
    )
    console.log(`Imported ${tableName} from ${csvPath}`)
  } catch (error) {
    console.error(`Error importing table ${tableName}:`, error.message)
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
 * Check if a string matches a wildcard pattern
 * @param {string} str - String to check
 * @param {string} pattern - Pattern with * wildcard
 * @returns {boolean} - True if matches
 */
function matchWildcard(str, pattern) {
  const regexPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')

  const regex = new RegExp(`^${regexPattern}$`)
  return regex.test(str)
}

/**
 * Format bytes to human readable format
 * @param {number} bytes - Number of bytes
 * @returns {string} - Formatted size string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Downloads a file from S3 to local filesystem
 * @param {string} bucket - S3 bucket name
 * @param {string} key - S3 object key
 * @param {string} localPath - Local file path to save to
 * @returns {Promise}
 */
async function downloadFromS3(bucket, key, localPath) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })

    const { Body } = await s3Client.send(command)
    const content = await streamToString(Body)

    fs.ensureDirSync(path.dirname(localPath))
    fs.writeFileSync(localPath, content)
    console.log(`Downloaded s3://${bucket}/${key} to ${localPath}`)
  } catch (error) {
    console.error(`Error downloading ${key} from S3:`, error.message)
    throw error
  }
}

/**
 * Creates a database backup and uploads it to S3
 * @param {string} comment - Comment for this backup
 * @returns {Promise<Object>} - Backup result information
 */
async function createBackup(comment) {
  const timestamp = moment().format(DATE_FORMAT)
  const backupDir = path.join(BACKUP_TEMP_DIR, timestamp)

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
    const uploadResults = []
    for (const bucket of buckets) {
      const s3BasePath = `${targetEnv}/${timestamp}`

      // Upload all files in the backup directory
      const files = fs.readdirSync(backupDir)
      for (const file of files) {
        const filePath = path.join(backupDir, file)
        const s3Key = `${s3BasePath}/${file}`
        await uploadToS3(filePath, bucket, s3Key)
      }

      uploadResults.push(`s3://${bucket}/${s3BasePath}/`)
      console.log(`Backup uploaded to s3://${bucket}/${s3BasePath}/`)
    }

    console.log('Backup completed successfully!')

    return {
      success: true,
      timestamp,
      comment,
      tables: tables.length,
      locations: uploadResults,
      migrationInfo,
    }
  } catch (error) {
    console.error('Backup failed:', error.message)
    throw error
  } finally {
    // Clean up temp directory
    fs.removeSync(backupDir)
    console.log(`Cleaned up temporary directory: ${backupDir}`)
  }
}

/**
 * Lists recent backups from S3
 * @param {number} limit - Maximum number of backups to return (default: 10)
 * @returns {Promise<Array>} - Array of backup information
 */
async function listBackups(limit = 10) {
  if (buckets.length === 0) {
    throw new Error('No backup buckets configured')
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
      return []
    }

    // Sort by prefix (which includes date)
    const backups = data.CommonPrefixes.map((p) =>
      p.Prefix.replace(prefix, '').replace('/', ''),
    )
      .sort()
      .reverse()

    console.log(`Recent backups in environment '${targetEnv}':\n`)
    console.log('ID | Timestamp | Migration | Comment | Size')
    console.log('-'.repeat(120))

    const backupList = []

    // Fetch metadata for each backup
    for (let i = 0; i < Math.min(backups.length, limit); i++) {
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

        // Get backup folder size by listing all objects in the backup folder
        let totalSize = 0
        try {
          const listObjectsCommand = new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: `${prefix}${backup}/`,
          })
          const objectsData = await s3Client.send(listObjectsCommand)

          if (objectsData.Contents) {
            totalSize = objectsData.Contents.reduce(
              (sum, obj) => sum + (obj.Size || 0),
              0,
            )
          }
        } catch (sizeError) {
          console.warn(
            `Could not get size for backup ${backup}:`,
            sizeError.message,
          )
        }

        const sizeFormatted = formatBytes(totalSize)
        console.log(
          `${i + 1}. | ${backup} | ${migrationName} | ${comment} | ${sizeFormatted}`,
        )

        backupList.push({
          id: backup,
          timestamp: backup,
          migration: migrationName,
          comment,
          size: totalSize,
          sizeFormatted,
          metadata,
        })
      } catch (error) {
        // If metadata can't be retrieved, show backup without comment
        console.log(
          `${i + 1}. | ${backup} | Unknown | No metadata available | Unknown size`,
        )

        backupList.push({
          id: backup,
          timestamp: backup,
          migration: 'Unknown',
          comment: 'No metadata available',
          size: 0,
          sizeFormatted: 'Unknown',
          metadata: null,
        })
      }
    }

    return backupList
  } catch (error) {
    console.error('Error listing backups:', error.message)
    throw error
  }
}

/**
 * Restores database from S3 backup
 * @param {string} timestamp - Backup timestamp to restore from
 * @returns {Promise<Object>} - Restore result information
 */
async function restoreFromS3(timestamp) {
  if (buckets.length === 0) {
    throw new Error('No backup buckets configured')
  }

  const bucket = buckets[0]
  const prefix = `${targetEnv}/${timestamp}/`
  const restoreDir = path.join(RESTORE_TEMP_DIR, timestamp)

  // Ensure restore directory exists
  fs.ensureDirSync(restoreDir)

  try {
    // Check if backup exists
    const headCommand = new HeadObjectCommand({
      Bucket: bucket,
      Key: `${prefix}metadata.json`,
    })

    await s3Client.send(headCommand)
    console.log(`Found backup ${timestamp} in s3://${bucket}/${prefix}`)

    // Download metadata first
    const metadataPath = path.join(restoreDir, 'metadata.json')
    await downloadFromS3(bucket, `${prefix}metadata.json`, metadataPath)

    // Read metadata to get table list
    const metadata = fs.readJsonSync(metadataPath)
    const tables = metadata.tables

    console.log('Downloading backup files...')

    // Download all CSV files
    for (const table of tables) {
      const csvKey = `${prefix}${table}.csv`
      const csvPath = path.join(restoreDir, `${table}.csv`)
      await downloadFromS3(bucket, csvKey, csvPath)
    }

    console.log('Starting database restore...')

    // Sort tables to handle foreign key dependencies
    const tableOrder = [
      'kamoku_bunrui_masters',
      'kamoku_masters',
      'nendo_masters',
      'saimoku_masters',
      'journals',
      'backups',
    ]

    const sortedTables = []

    // Add tables in dependency order
    for (const table of tableOrder) {
      if (tables.includes(table)) {
        sortedTables.push(table)
      }
    }

    // Add any remaining tables that aren't in the dependency list
    for (const table of tables) {
      if (!sortedTables.includes(table)) {
        sortedTables.push(table)
      }
    }

    // Clear existing data and restore tables
    for (const table of sortedTables) {
      try {
        console.log(`Clearing table ${table}`)
        executeQuery(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`)

        console.log(`Restoring table ${table}`)
        const csvPath = path.join(restoreDir, `${table}.csv`)
        importTableFromCsv(table, csvPath)
      } catch (error) {
        console.error(`Error restoring table ${table}:`, error.message)
        throw error
      }
    }

    console.log('S3 restore completed successfully')

    return {
      success: true,
      timestamp,
      tablesRestored: tables.length,
      metadata,
    }
  } catch (error) {
    console.error('S3 restore failed:', error.message)
    throw error
  } finally {
    // Clean up temp directory
    fs.removeSync(restoreDir)
    console.log(`Cleaned up temporary directory: ${restoreDir}`)
  }
}

/**
 * Restores database from local CSV files
 * @param {string} directory - Directory containing CSV files
 * @returns {Promise<Object>} - Restore result information
 */
async function restoreFromLocal(directory) {
  const csvDir = path.join(process.cwd(), 'tmp', 'restore', directory)

  if (!fs.existsSync(csvDir)) {
    throw new Error(`Directory not found: ${csvDir}`)
  }

  console.log(`Restoring from local directory: ${csvDir}`)

  try {
    // Get all CSV files
    const files = fs
      .readdirSync(csvDir)
      .filter((file) => file.endsWith('.csv'))
      .map((file) => ({
        name: file,
        tableName: path.basename(file, '.csv'),
        path: path.join(csvDir, file),
      }))

    if (files.length === 0) {
      throw new Error(`No CSV files found in ${csvDir}`)
    }

    console.log(`Found ${files.length} CSV files to restore`)

    // Sort files to handle foreign key dependencies
    const tableOrder = [
      'kamoku_bunrui_masters',
      'kamoku_masters',
      'nendo_masters',
      'saimoku_masters',
      'journals',
      'backups',
    ]

    const sortedFiles = []

    // Add files in dependency order
    for (const table of tableOrder) {
      const file = files.find((f) => f.tableName === table)
      if (file) {
        sortedFiles.push(file)
      }
    }

    // Add any remaining files that aren't in the dependency list
    for (const file of files) {
      if (!sortedFiles.find((f) => f.tableName === file.tableName)) {
        sortedFiles.push(file)
      }
    }

    // Clear existing data and restore tables
    for (const file of sortedFiles) {
      try {
        console.log(`Clearing table ${file.tableName}`)
        executeQuery(
          `TRUNCATE TABLE "${file.tableName}" RESTART IDENTITY CASCADE`,
        )

        console.log(`Restoring table ${file.tableName} from ${file.name}`)
        importTableFromCsv(file.tableName, file.path)
      } catch (error) {
        console.error(`Error restoring table ${file.tableName}:`, error.message)
        throw error
      }
    }

    console.log('Local restore completed successfully')

    return {
      success: true,
      directory,
      tablesRestored: files.length,
      tables: sortedFiles.map((f) => f.tableName),
    }
  } catch (error) {
    console.error('Local restore failed:', error.message)
    throw error
  }
}

/**
 * Downloads CSV files for specific tables from the latest backup
 * @param {string} tablePattern - Pattern to match table names (supports wildcards)
 * @returns {Promise<Object>} - Download result information
 */
async function downloadCsvFiles(tablePattern) {
  if (!tablePattern) {
    throw new Error('Table pattern is required')
  }

  console.log(`Searching for tables matching pattern: ${tablePattern}`)

  if (buckets.length === 0) {
    throw new Error('No backup buckets configured')
  }

  // Use the first bucket
  const bucket = buckets[0]
  const prefix = `${targetEnv}/`

  try {
    // List all backups
    const listCommand = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      Delimiter: '/',
    })

    const data = await s3Client.send(listCommand)

    if (!data.CommonPrefixes || data.CommonPrefixes.length === 0) {
      throw new Error(`No backups found in s3://${bucket}/${prefix}`)
    }

    // Sort by timestamp (descending) and get the latest backup
    const backups = data.CommonPrefixes.map((p) =>
      p.Prefix.replace(prefix, '').replace('/', ''),
    )
      .sort()
      .reverse()

    const latestBackup = backups[0]
    console.log(`Using latest backup: ${latestBackup}`)

    // Get metadata to find available tables
    const metadataCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: `${prefix}${latestBackup}/metadata.json`,
    })

    const { Body } = await s3Client.send(metadataCommand)
    const content = await streamToString(Body)
    const metadata = JSON.parse(content)

    // Filter tables based on pattern
    const matchingTables = metadata.tables.filter((table) =>
      matchWildcard(table, tablePattern),
    )

    if (matchingTables.length === 0) {
      throw new Error(`No tables found matching pattern: ${tablePattern}`)
    }

    console.log(`Found ${matchingTables.length} matching tables:`)
    matchingTables.forEach((table) => console.log(`  - ${table}`))

    // Download matching CSV files
    const downloadDir = path.join(TEMP_DIR, 'downloads', latestBackup)
    fs.ensureDirSync(downloadDir)

    const downloadedFiles = []
    for (const table of matchingTables) {
      const csvKey = `${prefix}${latestBackup}/${table}.csv`
      const localPath = path.join(downloadDir, `${table}.csv`)

      await downloadFromS3(bucket, csvKey, localPath)
      downloadedFiles.push(localPath)
    }

    console.log(
      `\nDownloaded ${downloadedFiles.length} files to: ${downloadDir}`,
    )

    return {
      success: true,
      backup: latestBackup,
      pattern: tablePattern,
      tablesDownloaded: matchingTables.length,
      downloadDir,
      files: downloadedFiles,
    }
  } catch (error) {
    console.error('Download failed:', error.message)
    throw error
  }
}

// Test function for API integration
function getBackupStatus() {
  return {
    success: true,
    message: 'バックアップライブラリから呼び出されました',
    timestamp: new Date().toISOString(),
    environment: targetEnv,
    bucketsConfigured: buckets.length,
    tempDirectories: {
      backup: BACKUP_TEMP_DIR,
      restore: RESTORE_TEMP_DIR,
    },
  }
}

// Export all functions for use by CLI tools and APIs
module.exports = {
  // Core backup/restore functions
  createBackup,
  listBackups,
  restoreFromS3,
  restoreFromLocal,
  downloadCsvFiles,

  // Utility functions
  getTables,
  getLatestMigration,
  getCurrentMigrationName,
  getPsqlConnectionString,
  executeQuery,

  // Test function
  getBackupStatus,

  // Configuration
  TEMP_DIR,
  BACKUP_TEMP_DIR,
  RESTORE_TEMP_DIR,
  DATE_FORMAT,
}
