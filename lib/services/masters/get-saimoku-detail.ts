import { Connection } from '@/lib/types'

export interface SaimokuDetailRequest {
  saimoku_cd: string
}

export interface SaimokuDetailResponse {
  kamoku_cd: string
  saimoku_cd: string
  kamoku_bunrui_type: string
}

export async function getSaimokuDetail(
  conn: Connection,
  input: SaimokuDetailRequest,
): Promise<SaimokuDetailResponse[]> {
  return await conn.$queryRaw<SaimokuDetailResponse[]>`
    select
      k.kamoku_cd,
      s.saimoku_cd,
      b.kamoku_bunrui_type
    from
      saimoku_masters s
        inner join kamoku_masters k on
          k.kamoku_cd = s.kamoku_cd
        inner join kamoku_bunrui_masters b on
          b.kamoku_bunrui_cd = k.kamoku_bunrui_cd
    where
      saimoku_cd = ${input.saimoku_cd}`
}
