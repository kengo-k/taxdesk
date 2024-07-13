import { NextRequest, NextResponse } from 'next/server'

import AWS from 'aws-sdk'
import { exec } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

import { ConnectionSetting } from '@/connection'
import { getDefault } from '@/constants/cache'
import { REQUEST_ERROR, RESTORE_ERROR } from '@/constants/error'
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

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const backup_id = searchParams.get('backup_id')
  if (backup_id === null) {
    return NextResponse.json(
      ApiResponse.failure('backup_id is required', REQUEST_ERROR),
      {
        status: 500,
        headers: cache.headers,
      },
    )
  }
  const backup_file = `tax-accounting-backup-${backup_id}.sql`

  // Get query for restore from s3 object
  let query: string | undefined
  try {
    query = await getRestoreQuery(Bucket, backup_file)
  } catch (e: any) {
    let message = 'Read from s3 failed'
    let code = null
    if (isAWSError(e)) {
      message = `${message}: ${e.message}`
      code = e.code
    }
    return NextResponse.json(ApiResponse.failure(message, null, code), {
      status: 500,
      headers: cache.headers,
    })
  }

  if (query === undefined) {
    return NextResponse.json(ApiResponse.failureWithAppError(RESTORE_ERROR), {
      status: 500,
      headers: cache.headers,
    })
  }

  // Restore from backup query
  try {
    await restore(query, backup_file)
  } catch (e: any) {
    return NextResponse.json(ApiResponse.failureWithAppError(RESTORE_ERROR), {
      status: 500,
      headers: cache.headers,
    })
  }

  return NextResponse.json(ApiResponse.success('success'), {
    status: 200,
    headers: cache.headers,
  })
}

async function getRestoreQuery(
  bucket: string,
  object_key: string,
): Promise<string | undefined> {
  const params = {
    Bucket: bucket,
    Key: object_key,
  }
  const data = await s3.getObject(params).promise()
  return data.Body?.toString('utf-8')
}

function restore(query: string, save_to: string): Promise<void> {
  const temp_dir = os.tmpdir()
  const backup_path = path.join(temp_dir, save_to)
  fs.writeFileSync(backup_path, query)
  const { user, password, host, port, database } = ConnectionSetting.get()
  process.env.PGPASSWORD = password
  const command = `psql -U ${user} -h ${host} -p ${port} -d ${database} -f "${backup_path}"`
  return new Promise((resolve, reject) => {
    exec(command, (error) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}
