import { exec } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

import { ConnectionSetting } from '@/connection'
import {
  ENVIRONMENT_ERROR,
  REQUEST_ERROR,
  RESTORE_ERROR,
} from '@/constants/error'
import { ApiResponse, execApi } from '@/misc/api'
import { createS3Client } from '@/misc/aws'

export const dynamic = 'force-dynamic'

export const PUT = execApi(async (request) => {
  const { searchParams } = new URL(request.url)
  const backup_id = searchParams.get('backup_id')
  if (backup_id === null) {
    return ApiResponse.failure(REQUEST_ERROR())
  }

  let { s3, Bucket } = createS3Client()
  if (!Bucket) {
    return ApiResponse.failure(ENVIRONMENT_ERROR())
  }

  // Get query for restore from s3 object
  const backup_file = `tax-accounting-backup-${backup_id}.sql`
  const data = await s3.getObject({ Bucket, Key: backup_file }).promise()
  const query = data.Body?.toString('utf-8')
  if (query === undefined) {
    return ApiResponse.failure(RESTORE_ERROR())
  }

  // Restore from backup query
  await execRestoreQuery(query, backup_file)

  return ApiResponse.success('success')
})

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
