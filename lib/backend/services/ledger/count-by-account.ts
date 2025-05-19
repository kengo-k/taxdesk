import { Connection } from '@/lib/types'

export interface CountByAccountRequest {
  fiscalYear: string
}

export interface CountByAccountItem {
  id: number
  kamoku_cd: string
  kamoku_bunrui_type: string
  saimoku_cd: string
  saimoku_full_name: string
  saimoku_ryaku_name: string
  saimoku_kana_name: string
  count: number
}

export async function countByAccount(
  conn: Connection,
  input: CountByAccountRequest,
): Promise<CountByAccountItem[]> {
  return await conn.$queryRaw<CountByAccountItem[]>`
    select
      min(id) as id,
      min(kamoku_cd) as kamoku_cd,
      min(kamoku_bunrui_type) as kamoku_bunrui_type,
      saimoku_cd,
      min(saimoku_full_name) as saimoku_full_name,
      min(saimoku_ryaku_name) as saimoku_ryaku_name,
      min(saimoku_kana_name) as saimoku_kana_name,
      count(journal_id)::integer as count
    from
      (
        select
          s.*,
          kb.kamoku_bunrui_type,
          j.id as journal_id
        from
          saimoku_masters s
            left join kamoku_masters k on
              s.kamoku_cd = k.kamoku_cd
            left join kamoku_bunrui_masters kb on
              k.kamoku_bunrui_cd = kb.kamoku_bunrui_cd
            left join journals j on
              (s.saimoku_cd = j.karikata_cd or s.saimoku_cd = j.kasikata_cd)
              and j.nendo = ${input.fiscalYear}
              and j.deleted = '0'
      ) as saimoku
    group by
      saimoku_cd
    order by
      saimoku_cd`
}
