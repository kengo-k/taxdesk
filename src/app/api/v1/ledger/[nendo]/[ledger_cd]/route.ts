import { NextRequest, NextResponse } from 'next/server'

import { getDefault } from '@/constants/cache'
import { Factory } from '@/dicontainer'
import {
  LedgerSearchRequest,
  isValidLedgerCreateRequest,
} from '@/models/ledger'

const cache = getDefault()
export const revalidate = cache.revalidate

export async function GET(
  request: NextRequest,
  { params }: { params: { nendo: string; ledger_cd: string } },
) {
  const search_request = { ...params } as LedgerSearchRequest
  const { searchParams } = new URL(request.url)
  const month = searchParams.get('month')
  if (month !== null) {
    search_request.month = month
  }
  const service = Factory.getLedgerService()
  const response = await service.selectLedgerList(search_request)
  return NextResponse.json(response, {
    status: 200,
    headers: cache.headers,
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { nendo: string; ledger_cd: string } },
) {
  const service = Factory.getLedgerService()
  const body = await request.json()

  const create_request = { ...params, ...body }
  const is_valid = isValidLedgerCreateRequest(create_request)
  if (is_valid.success) {
    const response = await service.createLedger(is_valid.data)
    return NextResponse.json(response, {
      status: 200,
      headers: cache.headers,
    })
  } else {
    const error = is_valid.error
    return NextResponse.json(
      { message: 'Missing require fields', error },
      { status: 400 },
    )
  }
}
