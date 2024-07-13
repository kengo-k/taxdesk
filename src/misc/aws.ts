import AWS, { AWSError } from 'aws-sdk'

export const isAWSError = (arg: any): arg is AWSError => {
  return (
    arg !== null &&
    typeof arg === 'object' &&
    typeof arg.code === 'string' &&
    typeof arg.message === 'string'
  )
}

export function createS3Client() {
  AWS.config.update({
    region: 'ap-northeast-1',
  })
  const s3 = new AWS.S3()
  const Bucket = process.env.BACKUP_BUCKETS
  return { s3, Bucket }
}
