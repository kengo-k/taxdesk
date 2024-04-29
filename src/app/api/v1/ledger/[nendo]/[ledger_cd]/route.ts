import { NextRequest, NextResponse } from 'next/server'

import { Factory } from '@/dicontainer'
import { LedgerSearchRequest } from '@/models/ledger'

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
  const response = await service.createLedger({
    ...params,
    date: '',
    other_cd: '',
    karikata_value: null,
    kasikata_value: null,
    note: null,
  })
  return NextResponse.json(response)
}
