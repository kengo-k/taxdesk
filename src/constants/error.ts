export type ApplicationErrorCode =
  | 'REQUEST_ERROR'
  | 'DUMP_ERROR'
  | 'RESTORE_ERROR'

export const REQUEST_ERROR: ApplicationError = {
  code: 'REQUEST_ERROR',
  message: 'Invalid Request.',
}

export const DUMP_ERROR: ApplicationError = {
  code: 'DUMP_ERROR',
  message: 'Execution of dump failed.',
}

export const RESTORE_ERROR: ApplicationError = {
  code: 'RESTORE_ERROR',
  message: 'Execution of restore failed.',
}

export interface ApplicationError {
  code: ApplicationErrorCode
  message: string
}
