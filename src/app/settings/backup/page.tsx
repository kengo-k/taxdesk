import AWS from 'aws-sdk'
import { exec } from 'child_process'
import { DateTime } from 'luxon'

const dbConfig = {
  host: 'db',
  port: 5432,
  database: 'db',
  user: 'postgres',
  password: 'postgres',
}

function dumpDatabase(): Promise<string> {
  process.env.PGPASSWORD = dbConfig.password
  return new Promise((resolve, reject) => {
    const command = `pg_dump -U ${dbConfig.user} -h ${dbConfig.host} -p ${dbConfig.port} -d ${dbConfig.database}`
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else {
        resolve(stdout)
      }
    })
  })
}

//import { createApiClient } from 'dots-wrapper'

export default async function Page() {
  AWS.config.update({
    region: 'ap-northeast-1', // 例: 'us-west-2'
  })
  const s3 = new AWS.S3()
  const Bucket = process.env.BACKUP_BUCKETS ?? ''

  const backups = await dumpDatabase()

  const params = {
    Bucket,
    Key: `tax-accounting-backup-${DateTime.local().toFormat('yyyyMMddHHmmss')}.sql`,
    Body: backups,
  }

  const response = await s3.upload(params).promise()

  const objects = await s3.listObjects({ Bucket }).promise()
  //const response = await s3.listBuckets().promise()
  //console.log(objects)
  // const token = process.env.DIGITALOCEAN_API_TOKEN ?? ''
  // const dots = createApiClient({ token })
  // const result = await dots.projects.list()
  // console.log(account)
  return <div>HELLO</div>
}
