import { NextRequest } from 'next/server'

import { REQUEST_ERROR } from '@/constants/error'
import { Factory } from '@/dicontainer'
import { ApiResponse, execApi } from '@/misc/api'

export const dynamic = 'force-dynamic'

export const POST = execApi(
  async (req: NextRequest, params: { nendo: string }) => {
    const body = await req.json()
    const journalIds = body.journalIds
    if (!Array.isArray(journalIds) || journalIds.length === 0) {
      return ApiResponse.failure(REQUEST_ERROR())
    }
    const service = Factory.getJournalService()
    const result = await service.deleteManyByIds(params.nendo, journalIds)
    return ApiResponse.success(result)
  },
)
