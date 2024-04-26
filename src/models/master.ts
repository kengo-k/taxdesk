export interface SaimokuSearchRequest {
  saimoku_cd: string;
}

export interface SaimokuSearchResponse {
  kamoku_cd: string;
  saimoku_cd: string;
  kamoku_bunrui_type: string;
}
