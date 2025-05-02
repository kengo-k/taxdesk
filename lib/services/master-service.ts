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
 * マスターサービスのインターフェース
 */
export interface MasterService {
  /**
   * 勘定科目一覧を取得する
   * @param options 検索オプション
   */
  getAccounts(options?: {
    type?: string
    search?: string
    filterBunrui?: string
  }): Promise<{
    bunruiList: KamokuBunrui[]
    kamokuList: Kamoku[]
    saimokuList: Saimoku[]
  }>

  /**
   * 消費税区分一覧を取得する
   * @param search 検索キーワード
   */
  getTaxCategories(search?: string): Promise<{
    taxCategories: TaxCategory[]
  }>

  /**
   * 勘定科目と消費税区分の関連付け一覧を取得する
   * @param options 検索オプション
   */
  getTaxMappings(options?: {
    search?: string
    kamoku_cd?: string
  }): Promise<{
    kamokuTaxMappings: KamokuTaxMapping[]
    availableKamoku: KamokuBasic[]
    availableTaxCategories: TaxCategory[]
  }>

  /**
   * 消費税区分を作成する
   * @param data 消費税区分データ
   */
  createTaxCategory(data: Partial<TaxCategory>): Promise<{
    message: string
    category: TaxCategory
  }>

  /**
   * 勘定科目と消費税区分の関連付けを作成する
   * @param data 関連付けデータ
   */
  createTaxMapping(data: Partial<KamokuTaxMapping>): Promise<{
    message: string
    mapping: KamokuTaxMapping
  }>
}
