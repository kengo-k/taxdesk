import { NextRequest, NextResponse } from 'next/server'

import AWS from 'aws-sdk'
import { execSync } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

import { getDefault } from '@/constants/cache'

const cache = getDefault()
export const revalidate = cache.revalidate

const dbConfig = {
  host: 'db',
  port: 5432,
  database: 'db',
  user: 'postgres',
  password: 'postgres',
}
process.env.PGPASSWORD = dbConfig.password

AWS.config.update({
  region: 'ap-northeast-1',
})

const s3 = new AWS.S3()
const Bucket = process.env.BACKUP_BUCKETS ?? ''

export async function POST(
  _: NextRequest,
  { params }: { params: { backup_id: string } },
) {
  const backup_file = `tax-accounting-backup-${params.backup_id}.sql`
  const restore_sql = await getObject(Bucket, backup_file)
  if (restore_sql === undefined) {
    return NextResponse.json(
      {},
      {
        status: 500,
        headers: cache.headers,
      },
    )
  }

  const temp_dir = os.tmpdir()
  const backup_path = path.join(temp_dir, backup_file)
  fs.writeFileSync(backup_path, restore_sql)
  // `pg_dump -U ${dbConfig.user} -h ${dbConfig.host} -p ${dbConfig.port} -d ${dbConfig.database} --clean --if-exists`
  process.env.PGPASSWORD = dbConfig.password
  const command = `psql -U ${dbConfig.user} -h ${dbConfig.host} -p ${dbConfig.port} -d ${dbConfig.database} -f "${backup_path}"`
  const result = execSync(command)
  //console.log(result)

  return NextResponse.json(
    {},
    {
      status: 200,
      headers: cache.headers,
    },
  )
}

async function getObject(bucket: string, object_key: string) {
  try {
    const params = {
      Bucket: bucket,
      Key: object_key,
    }
    const data = await s3.getObject(params).promise()
    const content = data.Body?.toString('utf-8')
    return content
  } catch (error) {
    throw error
  }
}
