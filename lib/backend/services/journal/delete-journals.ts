import { Connection } from '@/lib/types'

export interface DeleteJournalsRequest {
  fiscal_year: string
  ids: number[]
}

export async function deleteJournals(
  conn: Connection,
  input: DeleteJournalsRequest,
): Promise<number> {
  if (!input.ids.length) {
    return 0
  }

  const result = await conn.journals.updateMany({
    where: {
      id: {
        in: input.ids,
      },
      nendo: input.fiscal_year,
    },
    data: {
      deleted: '1',
      updated_at: new Date(),
    },
  })

  return result.count
}
