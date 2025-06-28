/**
 * ページネーションリクエストパラメータ
 */
export interface PaginationRequest {
  pageNo: number
  pageSize: number
}

/**
 * ページネーション情報
 */
export interface PaginationInfo {
  /** 現在のページ番号（1から始まる） */
  currentPage: number
  /** 1ページあたりの表示件数 */
  perPage: number
  /** 総件数 */
  totalCount: number
  /** 総ページ数 */
  totalPages: number
  /** 前のページが存在するか */
  hasPreviousPage: boolean
  /** 次のページが存在するか */
  hasNextPage: boolean
  /** 現在のページの最初のアイテムの番号（1から始まる） */
  startItem: number
  /** 現在のページの最後のアイテムの番号（1から始まる） */
  endItem: number
}

/**
 * ページネーションされたレスポンス
 */
export interface PaginationResponse<T> {
  /** ページング情報 */
  pagination: PaginationInfo
  /** データの配列 */
  data: T[]
}

/**
 * ページネーションリクエストパラメータを正規化する
 * @param request ページネーションリクエストパラメータ
 * @returns 正規化されたページネーションリクエストパラメータ
 */
export function normalizePaginationRequest(
  request?: PaginationRequest,
): Required<PaginationRequest> {
  return {
    pageNo: request?.pageNo ?? 1,
    pageSize: request?.pageSize ?? 10,
  }
}

/**
 * ページング情報を計算する
 * @param currentPage 現在のページ番号（1から始まる）
 * @param perPage 1ページあたりの表示件数
 * @param totalCount 総件数
 * @returns ページング情報
 */
export function calculatePagination(
  currentPage: number,
  perPage: number,
  totalCount: number,
): PaginationInfo {
  // 総ページ数を計算
  const totalPages = Math.ceil(totalCount / perPage)

  // 現在のページ番号を有効な範囲に制限
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages))

  // 現在のページの最初と最後のアイテムの番号を計算（1から始まる）
  const startItem = (validCurrentPage - 1) * perPage + 1
  const endItem = Math.min(startItem + perPage - 1, totalCount)

  return {
    currentPage: validCurrentPage,
    perPage,
    totalCount,
    totalPages,
    hasPreviousPage: validCurrentPage > 1,
    hasNextPage: validCurrentPage < totalPages,
    startItem,
    endItem,
  }
}

/**
 * 配列をページネーションする
 * @param data ページネーションするデータの配列
 * @param request ページネーションリクエストパラメータ
 * @returns ページネーションされたレスポンス
 */
export function paginateArray<T>(
  data: T[],
  request?: PaginationRequest,
): PaginationResponse<T> {
  const { pageNo, pageSize } = normalizePaginationRequest(request)
  const pagination = calculatePagination(pageNo, pageSize, data.length)

  // 配列のインデックスは0から始まるため、startItemから1を引く
  const startIndex = pagination.startItem - 1
  const endIndex = pagination.endItem - 1

  const paginatedData = data.slice(startIndex, endIndex + 1)

  return {
    pagination,
    data: paginatedData,
  }
}

/**
 * ページネーションリクエストからSQLのoffset値を計算する
 * @param request ページネーションリクエストパラメータ
 * @returns SQLのoffset値（0から始まる）
 */
export function calculateOffset(request: PaginationRequest): number {
  return (request.pageNo - 1) * request.pageSize
}

/**
 * ページ番号の配列を生成
 * @param currentPage 現在のページ番号
 * @param totalPages 総ページ数
 * @returns ページ番号の配列（...は省略記号）
 */
export function getPageNumbers(
  currentPage: number,
  totalPages: number,
): (number | string)[] {
  const pageNumbers = []
  const maxPagesToShow = 5 // 中央に表示するページ数

  // 常に最初のページを表示
  pageNumbers.push(1)

  // 現在のページの前後のページを表示
  let startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2))
  const endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1)

  // 表示するページが少ない場合は調整
  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(2, endPage - maxPagesToShow + 1)
  }

  // 省略記号を表示するかどうか
  if (startPage > 2) {
    pageNumbers.push('...')
  }

  // 中央のページ番号を追加
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i)
  }

  // 最後のページへの省略記号
  if (endPage < totalPages - 1) {
    pageNumbers.push('...')
  }

  // 常に最後のページを表示（ただし1ページだけの場合は表示しない）
  if (totalPages > 1) {
    pageNumbers.push(totalPages)
  }

  return pageNumbers
}
