import { Factory } from '@/dicontainer'
import { ApiResponse, execApi } from '@/misc/api'

export const dynamic = 'force-dynamic'

export const GET = execApi(async (_, params: { nendo: string }) => {
  const service = Factory.getMasterService()
  const saimoku_list = await service.selectSaimokuList(params.nendo)
  return ApiResponse.success(saimoku_list)
})
