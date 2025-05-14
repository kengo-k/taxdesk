import { z } from 'zod'

import { ApiError, ApiErrorType, toDetails } from '@/lib/api-error'
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
  // zodのバリデーションを実行
  const validationResult =
    await updateJournalCheckedRequestSchema.safeParseAsync(input)
  if (!validationResult.success) {
    throw new ApiError(
      'バリデーションエラーが発生しました',
      ApiErrorType.VALIDATION,
      toDetails(validationResult.error.errors),
    )
  }

  try {
    // 更新処理 - checkedフィールドのみを更新
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
  } catch (error: any) {
    // Prismaの例外ハンドリング
    if (error.code === 'P2025') {
      // P2025はレコードが見つからないエラー
      throw new ApiError(
        `ID ${input.id} の取引データが見つかりません`,
        ApiErrorType.NOT_FOUND,
        [
          {
            code: 'RECORD_NOT_FOUND',
            message: `ID ${input.id} の取引データが見つかりません`,
            path: ['id'],
          },
        ],
      )
    }
    // その他の例外はそのまま投げる
    throw error
  }
}
