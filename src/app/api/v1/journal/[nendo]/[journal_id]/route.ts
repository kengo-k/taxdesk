import { NextRequest } from 'next/server'

import numeral from 'numeral'

import { REQUEST_ERROR } from '@/constants/error'
import { Factory } from '@/dicontainer'
import { ApiResponse, execApi } from '@/misc/api'

export const dynamic = 'force-dynamic'

export const DELETE = execApi(
  async (_: NextRequest, params: { nendo: string; journal_id: number }) => {
    const journal_id = numeral(params.journal_id).value()
    if (journal_id === null) {
      return ApiResponse.failure(REQUEST_ERROR)
    }
    const service = Factory.getJournalService()
    const last_deleted = await service.deleteById(journal_id)
    return ApiResponse.success(last_deleted)
  },
)
