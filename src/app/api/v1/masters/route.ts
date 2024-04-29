import { NextResponse } from 'next/server'

import { getDefault } from '@/constants/cache'
import { Factory } from '@/dicontainer'

const cache = getDefault()

export async function GET() {
  const service = Factory.getMasterService()
  const nendo_list = await service.selectNendoList()
  const kamoku_list = await service.selectKamokuList()
  const saimoku_list = await service.selectSaimokuList()
  return NextResponse.json(
    { nendo_list, kamoku_list, saimoku_list },
    {
      status: 200,
      headers: cache.headers,
    },
  )
}

export const revalidate = cache.revalidate
