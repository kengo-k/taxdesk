import { NextRequest, NextResponse } from 'next/server'

import { Factory } from '@/dicontainer'
import {
  LedgerSearchRequest,
  isValidLedgerCreateRequest,
} from '@/models/ledger'

export async function GET(
  _: NextRequest,
  { params }: { params: LedgerSearchRequest },
) {
  const service = Factory.getLedgerService()
  const response = await service.selectLedgerList(params)
  return NextResponse.json(response)
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
    return NextResponse.json(response)
  } else {
    NextResponse.json({ error: 'Missing require fields' }, { status: 400 })
  }
}
