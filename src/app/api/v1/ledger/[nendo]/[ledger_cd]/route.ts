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
  _: NextRequest,
  { params }: { params: LedgerSearchRequest },
) {
  const service = Factory.getLedgerService()
  const response = await service.selectLedgerList(params)
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

  const is_valid = isValidLedgerCreateRequest({ ...params, ...body })
  if (is_valid.success) {
    const response = await service.createLedger(is_valid.data)
    return NextResponse.json(response, {
      status: 200,
      headers: cache.headers,
    })
  } else {
    NextResponse.json({ error: 'Missing require fields' }, { status: 400 })
  }
}
