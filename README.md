# Setup Instructions

Follow these steps to set up the project after cloning the repository from Git.

## Database Initialization

1. Set up environment variables:
   Set the following environment variables in the existing `.env` file:

   - POSTGRES_USER
   - POSTGRES_PASSWORD
   - POSTGRES_DB
   - POSTGRES_HOST
   - POSTGRES_PORT

2. Run database migrations:

   ```
   npm run migrate:deploy
   ```

   This command is executed to update the database schema to its latest state. It applies the migrations defined in Prisma, aligning the database structure with the current requirements of the project.

3. Generate Prisma client:

   ```
   npm run migrate:generate
   ```

   This command generates the Prisma client, which provides a type-safe API for database interactions. It ensures the client reflects the current database structure, enabling efficient and safe database operations in your application.

## Test Environment Setup

1. The `.env` file already contains test database settings:

   ```
   # テスト用データベース設定
   POSTGRES_DB_TEST=account_test

   # Database URL for test connection
   DATABASE_URL_FOR_TEST=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB_TEST}
   ```

2. Create a test database:

   ```bash
   npm run test:db:create
   ```

   または直接SQLを実行:

   ```sql
   CREATE DATABASE account_test;
   ```

3. Run migrations on the test database:

   ```bash
   npm run test:db:migrate
   ```

4. Run tests:

   ```bash
   npm test
   ```

   The test framework will automatically use the test database specified by `DATABASE_URL_FOR_TEST` environment variable.

## How to Apply Changes to the Database

1. Modify the schema.prisma file and describe the changes you want to apply.

2. Generate migration files

   ```
   npm run migrate:dev --name <your_migration_name>
   ```

   When you run this command, the following occurs:

   1. Prisma analyzes the schema changes and generates a new migration file in `prisma/migrations`.

   2. The generated migration is automatically applied to the database.

   3. The Prisma client is regenerated to reflect the new schema changes.

   Note: This command should only be used in development environments. For production environments, it is recommended to use `migrate:deploy`.

## Database Backup Tool

The project includes a database backup tool that exports database tables to CSV format and uploads them to an AWS S3 bucket.

### Prerequisites

Before using the backup tool, set the following environment variables:

```
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-northeast-1
AWS_ENDPOINT=https://s3.ap-northeast-1.amazonaws.com
BACKUP_BUCKETS=your_bucket_name
BACKUP_TARGET_ENV=dev
```

### Usage

The backup tool is available as an npm script:

1. **Create a backup with a comment**:

   ```bash
   npm run backup:dev -- --create "Your backup comment"
   ```

   or using the short option:

   ```bash
   npm run backup:dev -- -c "Your backup comment"
   ```

2. **List recent backups**:

   ```bash
   npm run backup:dev -- --list
   ```

   or using the short option:

   ```bash
   npm run backup:dev -- -l
   ```

   The list command displays:

   - Backup timestamp
   - Latest applied Prisma migration name
   - Backup comment

3. **Get help**:

   ```bash
   npm run backup:dev -- --help
   ```

### Backup Structure

The backups are stored in S3 with the following structure:

```
s3://your_bucket_name/environment_name/timestamp/
```

Each backup includes:

- CSV files for each database table
- A metadata.json file with backup information, including your comment

The backup tool automatically removes query parameters from the database connection string to ensure compatibility with the psql command.

## Database Restore Tool

The project includes a complementary database restore tool that enables you to restore data from a previously created backup.

### Prerequisites

The restore tool uses the same environment variables as the backup tool.

### Usage

The restore tool is available as an npm script:

1. **Restore a backup by timestamp**:

   ```bash
   npm run restore:dev -- --restore "20250509135352"
   ```

   or using the short option:

   ```bash
   npm run restore:dev -- -r "20250509135352"
   ```

2. **Get help**:

   ```bash
   npm run restore:dev -- --help
   ```

### Restore Process

The restore process performs the following steps:

1. Verifies that the specified backup timestamp exists in S3
2. Checks that the current database migration matches the backup's migration
   - This prevents restoring data to an incompatible schema version
3. Downloads all CSV files from the backup
4. Truncates each target table and imports the corresponding CSV data
5. Cleans up temporary files

**Note**: The restore operation will fail if the current database schema version (latest migration) does not match the backup's migration version.
