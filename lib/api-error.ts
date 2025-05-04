import { NextResponse } from 'next/server'

/**
 * Types of API errors
 */
export enum ApiErrorType {
  /** Authentication error (401) */
  UNAUTHORIZED = 'UNAUTHORIZED',
  /** Permission error (403) */
  FORBIDDEN = 'FORBIDDEN',
  /** Resource not found (404) */
  NOT_FOUND = 'NOT_FOUND',
  /** Validation error (400) */
  VALIDATION = 'VALIDATION',
  /** Server error (500) */
  SERVER_ERROR = 'SERVER_ERROR',
  /** Other errors (500) */
  OTHER = 'OTHER',
}

/**
 * API Error class
 * Error thrown from service layer
 */
export class ApiError extends Error {
  /** Error type */
  type: ApiErrorType
  /** Additional error information */
  details?: Record<string, any>

  constructor(
    message: string,
    type: ApiErrorType = ApiErrorType.SERVER_ERROR,
    details?: Record<string, any>,
  ) {
    super(message)
    this.name = 'ApiError'
    this.type = type
    this.details = details
  }

  /**
   * Get HTTP status code based on error type
   */
  getStatusCode(): number {
    switch (this.type) {
      case ApiErrorType.UNAUTHORIZED:
        return 401
      case ApiErrorType.FORBIDDEN:
        return 403
      case ApiErrorType.NOT_FOUND:
        return 404
      case ApiErrorType.VALIDATION:
        return 400
      case ApiErrorType.SERVER_ERROR:
      case ApiErrorType.OTHER:
      default:
        return 500
    }
  }

  /**
   * Generate error response
   */
  toResponse(): {
    success: false
    error: string
    details?: Record<string, any>
  } {
    return {
      success: false,
      error: this.message,
      ...(this.details && { details: this.details }),
    }
  }
}

/**
 * Convert error to API response
 */
export function toApiResponse(error: unknown): NextResponse {
  // Use error information if it's an ApiError
  if (error instanceof ApiError) {
    console.error(`API Error (${error.type}): ${error.message}`, error)
    return NextResponse.json(error.toResponse(), {
      status: error.getStatusCode(),
    })
  }

  // Treat non-ApiError as server error (500)
  const defaultErrorMessage = 'An unexpected error occurred'
  console.error(`Unhandled Error: ${defaultErrorMessage}`, error)

  // Convert unhandled error to ApiError
  const apiError = new ApiError(
    defaultErrorMessage,
    ApiErrorType.SERVER_ERROR,
    { originalError: error instanceof Error ? error.message : String(error) },
  )

  return NextResponse.json(apiError.toResponse(), {
    status: apiError.getStatusCode(),
  })
}
