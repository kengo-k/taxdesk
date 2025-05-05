import { NextResponse } from 'next/server'

import { ZodCustomIssue, ZodIssue } from 'zod'

/**
 * APIエラーの種類
 */
export enum ApiErrorType {
  /** Unauthorized (401) */
  UNAUTHORIZED = 'UNAUTHORIZED',
  /** Forbidden (403) */
  FORBIDDEN = 'FORBIDDEN',
  /** Not found (404) */
  NOT_FOUND = 'NOT_FOUND',
  /** Validation error (400) */
  VALIDATION = 'VALIDATION',
  /** Internal server error (500) */
  INTERNAL = 'INTERNAL',
}

/**
 * エラー詳細情報の型
 */
export interface ErrorDetail {
  code: string
  message: string
  path?: string[]
}

/**
 * ZodIssue[]をErrorDetail[]に変換する
 */
export function toDetails(issues: ZodIssue[]): ErrorDetail[] {
  return issues.map((issue) => {
    const customIssue = issue as ZodCustomIssue
    return {
      code: customIssue.params?.code || issue.code,
      message: issue.message,
      path: issue.path.map(String),
    }
  })
}

/**
 * APIエラーレスポンスの型
 */
export interface ApiErrorResponse {
  message: string
  code?: string
  details: ErrorDetail[]
  error?: unknown
}

/**
 * APIエラー
 */
export class ApiError extends Error {
  private readonly _type: ApiErrorType
  private readonly _details: ErrorDetail[]
  private readonly _error?: unknown

  constructor(
    message: string,
    type: ApiErrorType,
    details: ErrorDetail[] = [],
    error?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
    this._type = type
    this._details = details
    this._error = error
  }

  get type(): ApiErrorType {
    return this._type
  }

  get details(): ErrorDetail[] {
    return this._details
  }

  get error(): unknown {
    return this._error
  }

  /**
   * Get HTTP status code based on error type
   */
  get statusCode(): number {
    switch (this.type) {
      case ApiErrorType.UNAUTHORIZED:
        return 401
      case ApiErrorType.FORBIDDEN:
        return 403
      case ApiErrorType.NOT_FOUND:
        return 404
      case ApiErrorType.VALIDATION:
        return 400
      case ApiErrorType.INTERNAL:
        return 500
      default:
        return 500
    }
  }

  /**
   * Generate error response
   */
  toResponse(): ApiErrorResponse {
    return {
      message: this.message,
      code: this.type,
      details: this.details,
      ...(this._error ? { error: this._error } : {}),
    }
  }
}

/**
 * Convert error to API response
 */
export function toApiResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(error.toResponse(), {
      status: error.statusCode,
    })
  }

  const apiError = new ApiError(
    'An unexpected error occurred',
    ApiErrorType.INTERNAL,
    [],
    error,
  )

  return NextResponse.json(apiError.toResponse(), {
    status: apiError.statusCode,
  })
}
