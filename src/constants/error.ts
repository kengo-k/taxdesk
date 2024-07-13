export type ApplicationErrorCode =
  | 'REQUEST_ERROR'
  | 'AUTH_ERROR'
  | 'DUMP_ERROR'
  | 'RESTORE_ERROR'
  | 'UNEXPECTED_ERROR'

export const REQUEST_ERROR = (
  message: string | null = null,
): ApplicationError => ({
  code: 'REQUEST_ERROR',
  message: message ?? 'Invalid request received.',
})

export const AUTH_ERROR = (
  message: string | null = null,
): ApplicationError => ({
  code: 'AUTH_ERROR',
  message: message ?? 'Authorization failed.',
})

export const DUMP_ERROR = (
  message: string | null = null,
): ApplicationError => ({
  code: 'DUMP_ERROR',
  message: message ?? 'Data dump failed.',
})

export const RESTORE_ERROR = (
  message: string | null = null,
): ApplicationError => ({
  code: 'RESTORE_ERROR',
  message: message ?? 'Data restore failed.',
})

export const UNEXPECTED_ERROR = (
  message: string | null = null,
): ApplicationError => ({
  code: 'UNEXPECTED_ERROR',
  message: message ?? 'Unexpected error.',
})

export interface ApplicationError {
  code: ApplicationErrorCode
  message: string
}

export const StatusCodeMapping: { [key in ApplicationErrorCode]: number } = {
  REQUEST_ERROR: 400,
  AUTH_ERROR: 401,
  DUMP_ERROR: 500,
  RESTORE_ERROR: 500,
  UNEXPECTED_ERROR: 500,
}
