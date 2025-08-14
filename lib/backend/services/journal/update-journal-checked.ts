import { z } from 'zod'

import { ApiError, ApiErrorType, toDetails } from '@/lib/backend/api-error'
import { Connection } from '@/lib/types'

const updateJournalCheckedRequestSchema = z.object({
  id: z.number(),
  fiscal_year: z.string(),
  checked: z.enum(['0', '1']),
})

export type UpdateJournalCheckedRequest = z.infer<
  typeof updateJournalCheckedRequestSchema
>

export async function updateJournalChecked(
  conn: Connection,
  input: UpdateJournalCheckedRequest,
): Promise<void> {
  const validationResult =
    await updateJournalCheckedRequestSchema.safeParseAsync(input)
  if (!validationResult.success) {
    throw new ApiError(
      'バリデーションエラーが発生しました',
      ApiErrorType.VALIDATION,
      toDetails(validationResult.error.errors),
    )
  }

  await conn.journals.update({
    where: {
      id: input.id,
      nendo: input.fiscal_year,
    },
    data: {
      checked: input.checked,
      updated_at: new Date(),
    },
  })
}
