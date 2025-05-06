import { Connection } from '@/lib/types'

export interface ListAccountsRequest {
  fiscalYear: string // TODO Get accounts available within the specified fiscal year (currently unused)
}

export async function listAccounts(
  conn: Connection,
  input: ListAccountsRequest,
): Promise<any> {
  return await conn.$queryRaw<any[]>`
    select
      id,
      saimoku_cd as code,
      saimoku_full_name as name
    from
      saimoku_masters s
    order by code`
}
