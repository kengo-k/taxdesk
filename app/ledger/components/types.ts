// 勘定科目の型定義
export interface AccountCode {
  id: string
  code: string
  label: string
  name?: string
}

// マージされた勘定科目データの型定義
export interface MergedAccount {
  id: string
  code: string
  name: string
  count: number
  label: string
}

// 取引データの型定義
export interface Transaction {
  id: string
  date: string
  accountCode: string
  counterpartyAccount: string
  description: string
  debit: number
  credit: number
  summary: string
  balance: number
  showTooltips: {
    date: boolean
    debit: boolean
    credit: boolean
  }
  errors: {
    date: string
    debit: string
    credit: string
  }
}

// ページネーションの型定義
export interface Pagination {
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
}
