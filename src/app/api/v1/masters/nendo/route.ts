import { NextResponse } from 'next/server'

import { getDefault } from '@/constants/cache'
import { UNEXPECTED_ERROR } from '@/constants/error'
import { Factory } from '@/dicontainer'
import { ApiResponse } from '@/misc/types'

export const dynamic = 'force-dynamic'
const cache = getDefault()

export async function GET() {
  try {
    const service = Factory.getMasterService()
    const nendo_list = await service.selectNendoList()
    return NextResponse.json(ApiResponse.success(nendo_list), {
      status: 200,
      headers: cache.headers,
    })
  } catch {
    return NextResponse.json(
      ApiResponse.failureWithAppError(UNEXPECTED_ERROR),
      {
        status: 500,
        headers: cache.headers,
      },
    )
  }
}
