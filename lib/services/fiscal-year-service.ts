/**
 * 年度情報の型定義
 */
export interface FiscalYear {
  id: string
  label: string
  startDate: string
  endDate: string
  isCurrent: boolean
}

/**
 * 年度サービスのインターフェース
 */
export interface FiscalYearService {
  /**
   * 年度一覧を取得する
   */
  getFiscalYears(): Promise<FiscalYear[]>
}
