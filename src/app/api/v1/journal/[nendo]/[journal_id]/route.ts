import { NextRequest, NextResponse } from 'next/server'

import numeral from 'numeral'

import { getDefault } from '@/constants/cache'
import { Factory } from '@/dicontainer'

const cache = getDefault()
export const revalidate = cache.revalidate

export async function PUT(
  request: NextRequest,
  { params }: { params: { nendo: string; ledger_cd: string } },
) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: cache.headers,
    },
  )
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { nendo: string; journal_id: number } },
) {
  const journal_id = numeral(params.journal_id).value()
  if (journal_id === null) {
    return NextResponse.json(
      {},
      {
        status: 400,
        headers: cache.headers,
      },
    )
  }

  const service = Factory.getJournalService()

  try {
    const response = await service.deleteById(journal_id)
    return NextResponse.json(response, {
      status: 200,
      headers: cache.headers,
    })
  } catch (error) {
    return NextResponse.json(
      {},
      {
        status: 404,
        headers: cache.headers,
      },
    )
  }
}
