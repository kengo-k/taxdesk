import { NextResponse } from 'next/server'

import { getDefault } from '@/constants/cache'
import { Factory } from '@/dicontainer'

export const dynamic = 'force-dynamic'

const cache = getDefault()
export const revalidate = cache.revalidate

export async function GET() {
  const service = Factory.getMasterService()
  const nendo_list = await service.selectNendoList()
  return NextResponse.json(
    { data: nendo_list },
    {
      status: 200,
      headers: cache.headers,
    },
  )
}
