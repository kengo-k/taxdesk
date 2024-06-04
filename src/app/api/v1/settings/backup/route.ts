import { NextResponse } from 'next/server'

import AWS from 'aws-sdk'
import { exec } from 'child_process'
import { DateTime } from 'luxon'

import { ConnectionSetting } from '@/connection'
import { getDefault } from '@/constants/cache'

const cache = getDefault()
export const revalidate = cache.revalidate

AWS.config.update({
  region: 'ap-northeast-1',
})

const s3 = new AWS.S3()
const Bucket = process.env.BACKUP_BUCKETS ?? ''

function dumpDatabase(): Promise<string> {
  const { user, password, host, port, database } = ConnectionSetting.get()
  process.env.PGPASSWORD = password
  return new Promise((resolve, reject) => {
    const command = `pg_dump -U ${user} -h ${host} -p ${port} -d ${database} --inserts --clean --if-exists`
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else {
        resolve(stdout)
      }
    })
  })
}

export async function GET() {
  const objects = await s3.listObjects({ Bucket }).promise()
  const response = {
    data: objects.Contents?.map((obj) => ({
      key: obj.Key,
      size: obj.Size,
      createdAt: obj.LastModified,
    })),
  }
  return NextResponse.json(response, {
    status: 200,
    headers: cache.headers,
  })
}

export async function POST() {
  const backups = await dumpDatabase()

  const params = {
    Bucket,
    Key: `tax-accounting-backup-${DateTime.local().toFormat('yyyyMMddHHmmss')}.sql`,
    Body: backups,
  }

  const response = await s3.upload(params).promise()

  return NextResponse.json(response, {
    status: 200,
    headers: cache.headers,
  })
}
