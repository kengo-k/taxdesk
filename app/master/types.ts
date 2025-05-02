// 勘定科目分類の型定義
export interface KamokuBunrui {
  id: string
  kamoku_bunrui_cd: string
  kamoku_bunrui_name: string
  kamoku_bunrui_type: string
  kurikoshi_flg: string
  created_at: string
  updated_at: string
}

// 勘定科目の型定義
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
  bunrui?: KamokuBunrui // 表示用に分類情報を保持
  saimokuList?: Saimoku[] // 紐づく細目リスト
}

// 細目の型定義
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
  valid_from: string // 有効期限（開始日）
  valid_to: string // 有効期限（終了日）
}

// 消費税区分の型定義
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
  valid_from: string // 有効期限（開始日）
  valid_to: string // 有効期限（終了日）
}

// 勘定科目と消費税区分の関連付けの型定義
export interface KamokuTaxMapping {
  id: string
  kamoku_cd: string
  tax_category_id: string
  is_default: boolean
  created_at: string
  updated_at: string
  valid_from: string // 有効期限（開始日）
  valid_to: string // 有効期限（終了日）
  kamoku_name?: string // 表示用
  tax_category?: TaxCategory // 表示用
}

// 勘定科目分類タイプのマッピング
export const bunruiTypeMap: Record<string, { name: string; color: string }> = {
  A: { name: "資産", color: "bg-blue-100 text-blue-800" },
  L: { name: "負債", color: "bg-amber-100 text-amber-800" },
  R: { name: "収益", color: "bg-green-100 text-green-800" },
  E: { name: "費用", color: "bg-purple-100 text-purple-800" },
  Z: { name: "その他", color: "bg-gray-100 text-gray-800" },
}

// 勘定科目の性質（借方/貸方）を判定する関数
export const getAccountNature = (bunruiType: string): { name: string; color: string } => {
  // A: 資産、E: 費用 は借方科目（L: 左側）
  // L: 負債・資本、R: 収益 は貸方科目（R: 右側）
  // Z: その他 は不明として扱う
  switch (bunruiType) {
    case "A": // 資産
    case "E": // 費用
      return { name: "L", color: "bg-blue-50 text-blue-700" }
    case "L": // 負債・資本
    case "R": // 収益
      return { name: "R", color: "bg-emerald-50 text-emerald-700" }
    default:
      return { name: "-", color: "bg-gray-100 text-gray-700" }
  }
}

// ダイアログの種類
export type DialogType = "kamoku" | "saimoku" | "tax-category" | "mapping" | "delete"

// 削除対象の種類
export type DeleteType = "kamoku" | "saimoku" | "tax-category" | "mapping"
