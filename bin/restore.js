#!/usr/bin/env node

/**
 * Database Restore Tool - CLI Interface
 *
 * This is a command-line interface for the restore functionality in backup-lib.js
 *
 * Usage:
 *   # Restore from S3 backup
 *   node bin/restore.js --restore "20250509135352"
 *   node bin/restore.js -r "20250509135352"
 *
 *   # Restore from local CSV files
 *   node bin/restore.js --local "seed"
 *   node bin/restore.js -l "seed"
 */

const yargs = require('yargs')
const { restoreFromS3, restoreFromLocal } = require('./backup-lib')

// Parse command line arguments
const argv = yargs
  .option('restore', {
    alias: 'r',
    description: 'Restore from S3 backup with timestamp',
    type: 'string',
  })
  .option('local', {
    alias: 'l',
    description: 'Restore from local CSV files in specified directory',
    type: 'string',
  })
  .check((argv) => {
    if (!argv.restore && !argv.local) {
      throw new Error('Either --restore or --local option is required')
    }
    if (argv.restore && argv.local) {
      throw new Error('Cannot use both --restore and --local options')
    }
    return true
  })
  .help()
  .alias('help', 'h').argv

// Ensure required environment variables are set
const requiredEnvVars = ['DATABASE_URL']

// Add S3-specific environment variables if restoring from S3
if (argv.restore) {
  requiredEnvVars.push(
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'BACKUP_BUCKETS',
    'BACKUP_TARGET_ENV',
  )
}

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName],
)
if (missingEnvVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`,
  )
  process.exit(1)
}

/**
 * Main function
 */
async function main() {
  try {
    if (argv.restore) {
      const result = await restoreFromS3(argv.restore)
      console.log('S3 restore completed:', result)
    } else if (argv.local) {
      const result = await restoreFromLocal(argv.local)
      console.log('Local restore completed:', result)
    }
  } catch (error) {
    console.error('Restore failed:', error.message)
    process.exit(1)
  }
}

// CLIとして直接実行された場合のみmain実行
if (require.main === module) {
  main()
}
