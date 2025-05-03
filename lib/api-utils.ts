import { NextResponse } from "next/server"

/**
 * APIエラーの種類
 */
export enum ApiErrorType {
  /** 認証エラー (401) */
  UNAUTHORIZED = "UNAUTHORIZED",
  /** 権限エラー (403) */
  FORBIDDEN = "FORBIDDEN",
  /** リソースが見つからない (404) */
  NOT_FOUND = "NOT_FOUND",
  /** バリデーションエラー (400) */
  VALIDATION = "VALIDATION",
  /** サーバーエラー (500) */
  SERVER_ERROR = "SERVER_ERROR",
  /** その他のエラー (500) */
  OTHER = "OTHER"
}

/**
 * APIエラークラス
 * サービス層からスローされるエラー
 */
export class ApiError extends Error {
  /** エラーの種類 */
  type: ApiErrorType
  /** 追加のエラー情報 */
  details?: Record<string, any>

  constructor(
    message: string,
    type: ApiErrorType = ApiErrorType.SERVER_ERROR,
    details?: Record<string, any>
  ) {
    super(message)
    this.name = "ApiError"
    this.type = type
    this.details = details
  }

  /**
   * エラータイプに基づいてHTTPステータスコードを取得
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
   * エラーレスポンスを生成
   */
  toResponse(): { success: false; error: string; details?: Record<string, any> } {
    return {
      success: false,
      error: this.message,
      ...(this.details && { details: this.details })
    }
  }
}

type ApiHandler<T> = () => Promise<T>

/**
 * エラーハンドリングのオプション
 */
export interface ErrorOptions {
  /** エラーメッセージ */
  message: string
  /** HTTPステータスコード */
  statusCode?: number
  /** カスタムエラーレスポンス（指定した場合はmessageとstatusCodeは無視される） */
  customResponse?: Record<string, any>
}

/**
 * APIルートハンドラーのボイラープレート
 * try-catchパターンを共通化し、エラーハンドリングを統一する
 *
 * @param handler 実際の処理を行う非同期関数
 * @param defaultErrorMessage ApiError以外のエラーが発生した場合のデフォルトメッセージ
 * @returns NextResponse
 */
export async function apiRouteHandler<T>(
  handler: ApiHandler<T>,
  defaultErrorMessage: string = "予期しないエラーが発生しました"
) {
  try {
    const data = await handler()
    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    // ApiErrorの場合は、そのエラー情報を使用
    if (error instanceof ApiError) {
      console.error(`API Error (${error.type}): ${error.message}`, error)
      return NextResponse.json(
        error.toResponse(),
        { status: error.getStatusCode() }
      )
    }

    // ApiError以外のエラーは、サーバーエラー（500）として扱う
    console.error(`Unhandled Error: ${defaultErrorMessage}`, error)

    // 未処理のエラーをApiErrorに変換
    const apiError = new ApiError(
      defaultErrorMessage,
      ApiErrorType.SERVER_ERROR,
      { originalError: error instanceof Error ? error.message : String(error) }
    )

    return NextResponse.json(
      apiError.toResponse(),
      { status: apiError.getStatusCode() }
    )
  }
}
