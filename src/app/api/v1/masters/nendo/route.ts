import { Factory } from '@/dicontainer'
import { ApiResponse, execApi } from '@/misc/api'

export const dynamic = 'force-dynamic'

export const GET = execApi(async () => {
  const service = Factory.getMasterService()
  const nendo_list = await service.selectNendoList()
  return ApiResponse.success(nendo_list)
})
