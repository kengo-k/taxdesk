export type ApplicationErrorCode =
  | 'REQUEST_ERROR'
  | 'AUTH_ERROR'
  | 'DUMP_ERROR'
  | 'RESTORE_ERROR'
  | 'UNEXPECTED_ERROR'

export const REQUEST_ERROR: ApplicationError = {
  code: 'REQUEST_ERROR',
  message: 'Invalid Request.',
}

export const AUTH_ERROR: ApplicationError = {
  code: 'AUTH_ERROR',
  message: 'Login Failed.',
}

export const DUMP_ERROR: ApplicationError = {
  code: 'DUMP_ERROR',
  message: 'Execution of dump failed.',
}

export const RESTORE_ERROR: ApplicationError = {
  code: 'RESTORE_ERROR',
  message: 'Execution of restore failed.',
}

export const UNEXPECTED_ERROR: ApplicationError = {
  code: 'UNEXPECTED_ERROR',
  message: 'Unexpected error occured.',
}

export interface ApplicationError {
  code: ApplicationErrorCode
  message: string
}
