import { NextRequest, NextResponse } from 'next/server'

import { getDefault } from '@/constants/cache'
import { ApplicationError, UNEXPECTED_ERROR } from '@/constants/error'

// Common API response type
export type ApiResponse<T> =
  | {
      error: false
      data: T
    }
  | {
      error: true
      message: string
      errorCode: ApplicationError | null // Error code generated inside the application
      externalErrorCode: string | null // Error codes received from external systems
      errorDetail: Error | null
    }

// Constructor for ApiResponse
export const ApiResponse = {
  success<T>(data: T): ApiResponse<T> {
    return { error: false, data }
  },
  failure(
    message: string,
    errorCode: ApplicationError | null = null,
    externalErrorCode: string | null = null,
    errorDetail: Error | null = null,
  ): ApiResponse<never> {
    return { error: true, message, errorCode, externalErrorCode, errorDetail }
  },
  failureWithAppError(apperror: ApplicationError): ApiResponse<never> {
    return {
      error: true,
      message: apperror.message,
      errorCode: apperror,
      externalErrorCode: null,
      errorDetail: null,
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

type ApiMainResponse = ApiResponse<any> | [ApiResponse<any>, ResponseInit]

const cache = getDefault()
export const execApi = (
  main: (request: NextRequest, params?: any) => Promise<ApiMainResponse>,
) => {
  return async (
    request: NextRequest,
    { params }: { params: any },
  ): Promise<NextResponse<any>> => {
    try {
      const response = await main(request, params)
      if (response instanceof Array) {
        return NextResponse.json(response[0], response[1])
      } else {
        let status = 200
        if (response.error && response.errorCode) {
          status = response.errorCode.statusCode
        }
        return NextResponse.json(response, {
          status,
          headers: cache.headers,
        })
      }
    } catch {
      return NextResponse.json(
        ApiResponse.failureWithAppError(UNEXPECTED_ERROR),
        {
          status: 500,
          headers: cache.headers,
        },
      )
    }
  }
}
