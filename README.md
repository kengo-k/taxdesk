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
