/**
 * サマリーレポートの型定義
 */
export interface SummaryReport {
  // 現金残高の内訳
  cashBalanceTotal: number
  cashBalanceData: number[]
  cashBalanceLabels: string[]
  cashBalanceAmounts: number[]
  cashBalanceColors: string[]

  // 収入の内訳
  incomeTotal: number
  incomeData: number[]
  incomeLabels: string[]
  incomeAmounts: number[]
  incomeColors: string[]

  // 支出の内訳
  expenseTotal: number
  expenseData: number[]
  expenseLabels: string[]
  expenseAmounts: number[]
  expenseColors: string[]

  // 月別収入データ
  monthlyIncomeData: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      backgroundColor: string
    }>
  }

  // 月別支出データ
  monthlyExpenseData: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      backgroundColor: string
    }>
  }

  // 税金見込み
  taxEstimates: {
    corporateTax: number
    localTax: number
    businessTax: number
    consumptionTax: number
    total: number
  }
}

/**
 * 貸借対照表の項目の型定義
 */
export interface BalanceSheetItem {
  name: string
  amount: number
}

/**
 * 貸借対照表の型定義
 */
export interface BalanceSheet {
  assets: BalanceSheetItem[]
  liabilities: BalanceSheetItem[]
  equity: BalanceSheetItem[]
}

/**
 * 損益計算書の項目の型定義
 */
export interface IncomeStatementItem {
  name: string
  amount: number
}

/**
 * 損益計算書の型定義
 */
export interface IncomeStatement {
  revenue: IncomeStatementItem[]
  expenses: IncomeStatementItem[]
  taxes: IncomeStatementItem[]
}

/**
 * 税金支払いスケジュールの型定義
 */
export interface TaxPaymentSchedule {
  period: string
  dueDate: string
  taxType: string
  amount: number
  status: "paid" | "upcoming" | "overdue"
}

/**
 * 税金情報の型定義
 */
export interface TaxInfo {
  income: number
  expense: number
  profit: number
  taxEstimates: {
    corporateTax: number
    localCorporateTax: number
    totalCorporateTax: number
    prefecturalTax: number
    municipalTax: number
    corporateInhabitantTaxPerCapita: number
    totalInhabitantTax: number
    businessTax: number
    specialLocalCorporateTax: number
    totalBusinessTax: number
    consumptionTax: number
    localConsumptionTax: number
    totalConsumptionTax: number
    total: number
  }
  paymentSchedule: TaxPaymentSchedule[]
}

/**
 * 税率設定の型定義
 */
export interface TaxRates {
  corporateTaxRate: number
  localCorporateTaxRate: number
  prefecturalTaxRate: number
  municipalTaxRate: number
  corporateInhabitantTaxPerCapita: number
  businessTaxRate: number
  specialLocalCorporateTaxRate: number
  consumptionTaxRate: number
  localConsumptionTaxRate: number
}

/**
 * レポートサービスのインターフェース
 */
export interface ReportService {
  /**
   * サマリーレポートを取得する
   * @param year 年度
   */
  getSummaryReport(year: string): Promise<SummaryReport>

  /**
   * 貸借対照表を取得する
   * @param fiscalYear 年度
   * @param month 月
   */
  getBalanceSheet(fiscalYear: string, month: string): Promise<BalanceSheet>

  /**
   * 損益計算書を取得する
   * @param fiscalYear 年度
   * @param period 期間
   */
  getIncomeStatement(fiscalYear: string, period: string): Promise<IncomeStatement>

  /**
   * 税金情報を取得する
   * @param nendo 年度
   */
  getTaxInfo(nendo: string): Promise<{
    yearData: TaxInfo
    taxRates: TaxRates
  }>
}
