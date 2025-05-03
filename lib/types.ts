import { Prisma, PrismaClient } from '@prisma/client'

export type Connection = PrismaClient | Prisma.TransactionClient

export interface FiscalYear {
  id: string
  label: string
  startDate: string
  endDate: string
  isCurrent: boolean
}

export interface AccountItem {
  id: string
  code: string
  name: string
  category: string
  categoryName: string
  isActive: boolean
  description: string
}

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
 * 勘定科目分類の型定義
 */
export interface KamokuBunrui {
  id: string
  kamoku_bunrui_cd: string
  kamoku_bunrui_name: string
  kamoku_bunrui_type: string
  kurikoshi_flg: string
  created_at: string
  updated_at: string
}

/**
 * 勘定科目の型定義
 */
export interface Kamoku {
  id: string
  kamoku_cd: string
  kamoku_full_name: string
  kamoku_ryaku_name: string
  kamoku_kana_name: string
  kamoku_bunrui_cd: string
  description: string
  created_at: string
  updated_at: string
  bunrui?: KamokuBunrui
  saimokuList?: Saimoku[]
}

/**
 * 細目の型定義
 */
export interface Saimoku {
  id: string
  kamoku_cd: string
  saimoku_cd: string
  saimoku_full_name: string
  saimoku_ryaku_name: string
  saimoku_kana_name: string
  description: string
  created_at: string
  updated_at: string
  transaction: string
  valid_from: string
  valid_to: string
}

/**
 * 消費税区分の型定義
 */
export interface TaxCategory {
  id: string
  code: string
  name: string
  description: string
  tax_rate: number
  is_reduced_tax: boolean
  is_taxable: boolean
  is_deductible: boolean
  created_at: string
  updated_at: string
  valid_from: string
  valid_to: string
}

/**
 * 勘定科目と消費税区分の関連付けの型定義
 */
export interface KamokuTaxMapping {
  id: string
  kamoku_cd: string
  tax_category_id: string
  is_default: boolean
  created_at: string
  updated_at: string
  valid_from: string
  valid_to: string
  kamoku_name?: string
  tax_category?: TaxCategory
}

/**
 * 勘定科目の簡易情報の型定義
 */
export interface KamokuBasic {
  kamoku_cd: string
  kamoku_full_name: string
}

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
  status: 'paid' | 'upcoming' | 'overdue'
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
