import { NextRequest, NextResponse } from 'next/server'

import { getDefault } from '@/constants/cache'
import {
  ApplicationError,
  StatusCodeMapping,
  UNEXPECTED_ERROR,
} from '@/constants/error'

// Common API response type
export type ApiResponse<T> =
  | {
      error: null
      data: T
    }
  | {
      error: ApplicationError // Error generated inside the application
      errorDetail: Error | null
    }

// Constructor for ApiResponse
export const ApiResponse = {
  success<T>(data: T): ApiResponse<T> {
    return { error: null, data }
  },
  failure(
    error: ApplicationError,
    errorDetail: Error | null = null,
  ): ApiResponse<never> {
    return { error, errorDetail }
  },
} as const

// Type to hold the return value of the API in state
export type ApiResState<T> = ApiResponse<T> & { loading: boolean }

export function initApiResState<T>(init: T): ApiResState<T> {
  return {
    data: init,
    error: null,
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
        if (response.error) {
          status = StatusCodeMapping[response.error.code]
        }
        return NextResponse.json(response, {
          status,
          headers: cache.headers,
        })
      }
    } catch {
      return NextResponse.json(ApiResponse.failure(UNEXPECTED_ERROR), {
        status: 500,
        headers: cache.headers,
      })
    }
  }
}
