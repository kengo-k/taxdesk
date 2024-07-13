import { exec } from 'child_process'
import { DateTime } from 'luxon'

import { ConnectionSetting } from '@/connection'
import { ENVIRONMENT_ERROR, UNEXPECTED_ERROR } from '@/constants/error'
import { ApiResponse, execApi } from '@/misc/api'
import { createS3Client } from '@/misc/aws'

export const dynamic = 'force-dynamic'

export const GET = execApi(async () => {
  let { s3, Bucket } = createS3Client()
  if (!Bucket) {
    return ApiResponse.failure(ENVIRONMENT_ERROR())
  }

  // Get list of backup objects from s3
  const objects = await s3.listObjects({ Bucket }).promise()
  const backup_list = objects.Contents
  if (backup_list === undefined) {
    return ApiResponse.failure(UNEXPECTED_ERROR())
  }

  return ApiResponse.success(
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
  )
})

export const POST = execApi(async () => {
  let { s3, Bucket } = createS3Client()
  if (!Bucket) {
    return ApiResponse.failure(ENVIRONMENT_ERROR())
  }

  const backups = await dumpDatabase()
  const params = {
    Bucket,
    Key: `tax-accounting-backup-${DateTime.local().toFormat('yyyyMMddHHmmss')}.sql`,
    Body: backups,
  }
  await s3.upload(params).promise()

  return ApiResponse.success(null)
})

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
