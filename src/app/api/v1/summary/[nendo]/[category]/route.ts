import { NextRequest, NextResponse } from 'next/server'

import { getDefault } from '@/constants/cache'
import { Factory } from '@/dicontainer'

const cache = getDefault()
export const revalidate = cache.revalidate

export async function GET(
  _: NextRequest,
  { params }: { params: { nendo: string; category: string } },
) {
  const service = Factory.getJournalService()
  service.selectCategorySummary(params.nendo, params.category)
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: cache.headers,
    },
  )
}
