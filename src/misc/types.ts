import { ApplicationError } from '@/constants/error'

export type Nullable<T> = { [K in keyof T]: T[K] | null }
export type NullableOptional<T> = Partial<Nullable<T>>
export type StringProps<T> = { [P in keyof T]: string }

// Common API response type
export type ApiResponse<T> =
  | {
      error: false
      data: T
    }
  | {
      error: true
      message: string
      errorCode: string | null // Error code generated inside the application
      externalErrorCode: string | null // Error codes received from external systems
    }

// Constructor for ApiResponse
export const ApiResponse = {
  success<T>(data: T): ApiResponse<T> {
    return { error: false, data }
  },
  failure(
    message: string,
    errorCode: string | null = null,
    externalErrorCode: string | null = null,
  ): ApiResponse<never> {
    return { error: true, message, errorCode, externalErrorCode }
  },
  failureWithAppError(apperror: ApplicationError): ApiResponse<never> {
    return {
      error: true,
      message: apperror.message,
      errorCode: apperror.code,
      externalErrorCode: null,
    }
  },
} as const

// Type to hold the return value of the API in state
export type ApiResState<T> = ApiResponse<T> & { loading: boolean }

export function initApiResState<T>(init: T): ApiResState<T> {
  return {
    data: init,
    error: false,
    loading: false,
  }
}
