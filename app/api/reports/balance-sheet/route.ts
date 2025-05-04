import type { NextRequest } from 'next/server'

import { ApiError, ApiErrorType } from '@/lib/api-error'
import { withTransaction } from '@/lib/api-transaction'
import { getFiscalYears } from '@/lib/services/masters/get-fiscal-years'

export async function GET(
  request: NextRequest,
  { params }: { params: { nendo: string } },
) {
  return withTransaction(async (tx) => {
    const fiscalYears = await getFiscalYears(tx)

    if (fiscalYears.length === 0) {
      throw new ApiError('Fiscal year data not found', ApiErrorType.NOT_FOUND)
    }

    return fiscalYears
  })
}
