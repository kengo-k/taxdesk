#!/usr/bin/env node

/**
 * Database Backup Tool - CLI Interface
 *
 * This is a command-line interface for the backup library.
 * For core functionality, see backup-lib.js
 *
 * Usage:
 *   node bin/backup.js --create "comment"
 *   node bin/backup.js --list
 *   node bin/backup.js --download "pattern"
 */

const yargs = require('yargs')
const {
  createBackup,
  listBackups,
  downloadCsvFiles,
  getBackupStatus,
} = require('./backup-lib')

// Environment variables validation
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
  console.error('Missing required environment variables:')
  missingEnvVars.forEach((varName) => {
    console.error(`  - ${varName}`)
  })
  console.error('\nPlease set these variables and try again.')
  process.exit(1)
}

// Command line interface
yargs
  .usage('Usage: $0 [options]')
  .option('create', {
    alias: 'c',
    describe: 'Create a new backup with the specified comment',
    type: 'string',
    conflicts: ['list', 'download'],
  })
  .option('list', {
    alias: 'l',
    describe: 'List recent backups',
    type: 'boolean',
    conflicts: ['create', 'download'],
  })
  .option('download', {
    alias: 'd',
    describe: 'Download CSV files for tables matching the specified pattern',
    type: 'string',
    conflicts: ['create', 'list'],
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
  .example(
    'npm run backup -- --download "*masters"',
    'Download all master tables',
  )
  .example('npm run backup -- -d "journals"', 'Download a specific table')
  .help()
  .epilogue(
    'For more information, check the comments at the top of this script.',
  )
  .wrap(yargs.terminalWidth())

// Parse arguments
const argv = yargs.argv

// Process command based on options
async function main() {
  try {
    if (argv.create) {
      // Run backup with comment
      const comment = argv.create
      const result = await createBackup(comment)
      console.log('Backup completed:', result)
    } else if (argv.list) {
      // List backups
      const backups = await listBackups()
      console.log(`\nFound ${backups.length} backups`)
    } else if (argv.download) {
      // Download CSV files
      const result = await downloadCsvFiles(argv.download)
      console.log('Download completed:', result)
    } else {
      // If no option is provided, show help
      console.log('Database Backup Tool')
      console.log('-----------------')
      console.log('Available options:')
      console.log(
        '  --create, -c   Create a new database backup with the specified comment',
      )
      console.log('  --list, -l     List recent backups in S3')
      console.log(
        '  --download, -d Download CSV files for tables matching the specified pattern',
      )
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
      console.log(
        '  npm run backup -- --download "*masters"       Download all master tables',
      )
      console.log(
        '  npm run backup -- -d "journals"               Download a specific table',
      )
      console.log('\nFor more details run: npm run backup -- --help')
    }
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

// Export for API usage (backward compatibility)
module.exports = {
  getBackupStatus,
}

// CLIとして直接実行された場合のみmain実行
if (require.main === module) {
  main().catch((error) => {
    console.error('Error:', error.message)
    process.exit(1)
  })
}
