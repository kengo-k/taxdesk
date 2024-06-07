import { NextRequest, NextResponse } from 'next/server'

import { getDefault } from '@/constants/cache'
import { Factory } from '@/dicontainer'

const cache = getDefault()
export const revalidate = cache.revalidate

export async function GET(
  _: NextRequest,
  { params }: { params: { nendo: string } },
) {
  const service = Factory.getMasterService()
  const saimoku_list = await service.selectSaimokuList(params.nendo)
  return NextResponse.json(
    { data: saimoku_list },
    {
      status: 200,
      headers: cache.headers,
    },
  )
}
