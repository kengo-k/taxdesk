import { AWSError } from 'aws-sdk'

export const isAWSError = (arg: any): arg is AWSError => {
  return (
    arg !== null &&
    typeof arg === 'object' &&
    typeof arg.code === 'string' &&
    typeof arg.message === 'string'
  )
}
