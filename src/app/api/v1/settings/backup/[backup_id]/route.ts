import { NextRequest, NextResponse } from 'next/server'

import AWS from 'aws-sdk'
import { execSync } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

import { ConnectionSetting } from '@/connection'
import { getDefault } from '@/constants/cache'

const cache = getDefault()
export const revalidate = cache.revalidate

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
  const { user, password, host, port, database } = ConnectionSetting.get()
  process.env.PGPASSWORD = password
  const command = `psql -U ${user} -h ${host} -p ${port} -d ${database} -f "${backup_path}"`

  console.log('command: ', command)
  const result = execSync(command)
  console.log(result)

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
