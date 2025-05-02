/**
 * 取引データの型定義
 */
export interface Transaction {
  id: string
  date: string
  accountCode: string
  accountName: string
  counterpartyAccount: string
  description: string
  debit: number
  credit: number
  summary: string
  balance: number
}

/**
 * 勘定科目別レコード件数の型定義
 */
export interface AccountCount {
  accountCode: string
  accountName: string
  count: number
}

/**
 * ページネーション情報の型定義
 */
export interface Pagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

/**
 * 台帳サービスのインターフェース
 */
export interface LedgerService {
  /**
   * 勘定科目別レコード件数を取得する
   * @param nendo 年度
   */
  getAccountCounts(nendo: string): Promise<AccountCount[]>

  /**
   * 取引データを取得する
   * @param nendo 年度
   * @param options 検索オプション
   */
  getTransactions(
    nendo: string,
    options?: {
      code?: string
      month?: string
      page?: number
      pageSize?: number
    },
  ): Promise<{
    transactions: Transaction[]
    pagination: Pagination
  }>
}
