/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const dotenv = require('dotenv')

dotenv.config()

function main() {
  const executeStatement = createClient()

  const files = fs.readdirSync('seed')
  files.forEach((f) => {
    const table = path.basename(f, '.csv')
    let fullpath = path.resolve(`seed/${f}`)
    executeStatement(`truncate table ${table}`)
    executeStatement(
      `\\copy ${table} FROM '${fullpath}' DELIMITER ',' CSV HEADER`,
    )
  })
}

function createClient() {
  const [user, password, host, port, db] = [
    process.env.POSTGRES_USER,
    process.env.POSTGRES_PASSWORD,
    process.env.POSTGRES_HOST,
    process.env.POSTGRES_PORT,
    process.env.POSTGRES_DB,
  ]

  console.log('user:', user)
  console.log('password:', password)
  console.log('host:', host)
  console.log('port:', port)
  console.log('database:', db)

  process.env.PGPASSWORD = password
  return function (statement) {
    execSync(`
        psql \
          -U ${user} \
          -d ${db} \
          -h ${host} \
          -p ${port} \
          -c "${statement}"`)
  }
}

main()
