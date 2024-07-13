import { NextResponse } from 'next/server'

import AWS from 'aws-sdk'
import { exec } from 'child_process'
import { DateTime } from 'luxon'

import { BackupItem } from '@/models/backup'

import { ConnectionSetting } from '@/connection'
import { getDefault } from '@/constants/cache'
import { DUMP_ERROR, UNEXPECTED_ERROR } from '@/constants/error'
import { ApiResponse } from '@/misc/api'
import { isAWSError } from '@/misc/aws'

export const dynamic = 'force-dynamic'

const cache = getDefault()
export const revalidate = cache.revalidate

AWS.config.update({
  region: 'ap-northeast-1',
})

const s3 = new AWS.S3()
const Bucket = process.env.BACKUP_BUCKETS ?? ''

export async function GET(): Promise<NextResponse<ApiResponse<BackupItem[]>>> {
  let backup_list: AWS.S3.ObjectList | undefined = undefined

  // Get list of backup objects from s3
  try {
    const objects = await s3.listObjects({ Bucket }).promise()
    backup_list = objects.Contents
  } catch (e) {
    let message = 'List failed'
    let code = null
    if (isAWSError(e)) {
      message = `${message}: ${e.message}`
      code = e.code
    }
    return NextResponse.json(ApiResponse.failure(UNEXPECTED_ERROR), {
      status: 500,
      headers: cache.headers,
    })
  }

  if (backup_list === undefined) {
    return NextResponse.json(ApiResponse.failure(UNEXPECTED_ERROR), {
      status: 500,
    })
  }

  try {
    return NextResponse.json(
      ApiResponse.success(
        backup_list.map((obj) => {
          if (!obj.Key || !obj.Size || !obj.LastModified) {
            throw new Error()
          }
          return {
            key: obj.Key,
            size: obj.Size,
            createdAt: obj.LastModified.toISOString(),
          }
        }),
      ),
      {
        status: 200,
        headers: cache.headers,
      },
    )
  } catch {
    return NextResponse.json(ApiResponse.failure(UNEXPECTED_ERROR), {
      status: 500,
    })
  }
}

export async function POST(): Promise<NextResponse<ApiResponse<null>>> {
  let backups: string | null = null

  try {
    backups = await dumpDatabase()
  } catch (e: any) {
    return NextResponse.json(ApiResponse.failure(DUMP_ERROR), {
      status: 500,
      headers: cache.headers,
    })
  }

  const params = {
    Bucket,
    Key: `tax-accounting-backup-${DateTime.local().toFormat('yyyyMMddHHmmss')}.sql`,
    Body: backups,
  }

  try {
    await s3.upload(params).promise()
    return NextResponse.json(ApiResponse.success(null), {
      status: 200,
      headers: cache.headers,
    })
  } catch (e) {
    let message = 'Upload failed'
    let code = null
    if (isAWSError(e)) {
      message = `${message}: ${e.message}`
      code = e.code
    }
    return NextResponse.json(ApiResponse.failure(UNEXPECTED_ERROR), {
      status: 500,
      headers: cache.headers,
    })
  }
}

function dumpDatabase(): Promise<string> {
  const { user, password, host, port, database } = ConnectionSetting.get()
  process.env.PGPASSWORD = password
  return new Promise((resolve, reject) => {
    const command = `pg_dump -U ${user} -h ${host} -p ${port} -d ${database} --inserts --clean --if-exists`
    exec(command, (error, stdout) => {
      if (error) {
        reject(error)
      } else {
        resolve(stdout)
      }
    })
  })
}
