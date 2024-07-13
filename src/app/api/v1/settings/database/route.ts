import AWS from 'aws-sdk'
import { exec } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

import { ConnectionSetting } from '@/connection'
import { REQUEST_ERROR, RESTORE_ERROR } from '@/constants/error'
import { ApiResponse, execApi } from '@/misc/api'

export const dynamic = 'force-dynamic'

AWS.config.update({
  region: 'ap-northeast-1',
})

const s3 = new AWS.S3()
const Bucket = process.env.BACKUP_BUCKETS ?? ''

export const PUT = execApi(async (request) => {
  const { searchParams } = new URL(request.url)
  const backup_id = searchParams.get('backup_id')
  if (backup_id === null) {
    return ApiResponse.failure(REQUEST_ERROR())
  }
  const backup_file = `tax-accounting-backup-${backup_id}.sql`

  // Get query for restore from s3 object
  let query: string | undefined
  try {
    query = await getRestoreQuery(Bucket, backup_file)
  } catch (e: any) {
    let errorDetail = null
    if (e instanceof Error) {
      errorDetail = e
    }
    return ApiResponse.failure(RESTORE_ERROR(), errorDetail)
  }

  if (query === undefined) {
    return ApiResponse.failure(RESTORE_ERROR())
  }

  // Restore from backup query
  try {
    await execRestoreQuery(query, backup_file)
  } catch (e: any) {
    let errorDetail = null
    if (e instanceof Error) {
      errorDetail = e
    }
    return ApiResponse.failure(RESTORE_ERROR(), errorDetail)
  }

  return ApiResponse.success('success')
})

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

function execRestoreQuery(query: string, save_to: string): Promise<void> {
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
