import {
  LedgerSearchRequest,
  isValidLedgerCreateRequest,
  isValidLedgerUpdateRequest,
} from '@/models/ledger'

import { getDefault } from '@/constants/cache'
import { REQUEST_ERROR } from '@/constants/error'
import { Factory } from '@/dicontainer'
import { ApiResponse, execApi } from '@/misc/api'

export const dynamic = 'force-dynamic'

const cache = getDefault()
export const revalidate = cache.revalidate

export const GET = execApi(
  async (request, params: { nendo: string; ledger_cd: string }) => {
    const search_request = { ...params } as LedgerSearchRequest
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    if (month !== null) {
      search_request.month = month
    }
    const page_no = searchParams.get('page_no')
    if (page_no != null) {
      const page_num = Number(page_no)
      if (isNaN(page_num)) {
        return ApiResponse.failure(REQUEST_ERROR())
      }
      search_request.page_no = page_num
    }
    const service = Factory.getLedgerService()
    const ledger_list = await service.selectLedgerList(search_request)
    return ApiResponse.success(ledger_list)
  },
)

export const POST = execApi(
  async (request, params: { nendo: string; ledger_cd: string }) => {
    const service = Factory.getLedgerService()
    const body = await request.json()
    const create_request = { ...params, ...body }
    const is_valid = isValidLedgerCreateRequest(create_request)
    if (is_valid.success) {
      const last_upserted = await service.createLedger(is_valid.data)
      return ApiResponse.success(last_upserted)
    } else {
      return ApiResponse.failure(REQUEST_ERROR(), is_valid.error)
    }
  },
)

export const PUT = execApi(
  async (request, params: { nendo: string; ledger_cd: string }) => {
    const service = Factory.getLedgerService()
    const body = await request.json()

    const update_request = { ...params, ...body }
    const is_valid = isValidLedgerUpdateRequest(update_request)
    if (is_valid.success) {
      const last_upserted = await service.updateLedger(is_valid.data)
      return ApiResponse.success(last_upserted)
    } else {
      return ApiResponse.failure(REQUEST_ERROR(), is_valid.error)
    }
  },
)
