import { Connection } from '@/lib/types'

export interface ListAccountsRequest {
  fiscalYear: string // TODO Get accounts available within the specified fiscal year (currently unused)
}

export interface ListAccountItem {
  id: string
  code: string
  name: string
  ryaku_name: string
  kana_name: string
  description: string
  kamoku_bunrui_type: string
}

export async function listAccounts(
  conn: Connection,
  input: ListAccountsRequest,
): Promise<ListAccountItem[]> {
  return await conn.$queryRaw<ListAccountItem[]>`
    select
      s.id,
      s.saimoku_cd as code,
      s.saimoku_full_name as name,
      s.saimoku_ryaku_name as ryaku_name,
      s.saimoku_kana_name as kana_name,
      s.description as description,
      kbm.kamoku_bunrui_type as kamoku_bunrui_type
    from
      saimoku_masters s
        join kamoku_masters k
          on k.kamoku_cd = s.kamoku_cd
        join kamoku_bunrui_masters kbm
          on kbm.kamoku_bunrui_cd = k.kamoku_bunrui_cd
    order by code`
}
