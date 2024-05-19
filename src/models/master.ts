export interface SaimokuSearchRequest {
  saimoku_cd: string
}

export interface SaimokuSearchResponse {
  kamoku_cd: string
  saimoku_cd: string
  kamoku_bunrui_type: string
}

export interface SaimokuWithSummary {
  id: number
  kamoku_cd: string
  kamoku_bunrui_type: string | null
  saimoku_cd: string
  saimoku_full_name: string
  saimoku_ryaku_name: string
  saimoku_kana_name: string
  count: number
}
