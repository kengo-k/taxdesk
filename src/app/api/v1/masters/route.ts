import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'

import { getDefault } from '@/constants/cache'
import { Factory } from '@/dicontainer'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl!, supabaseKey!)

const cache = getDefault()
export const revalidate = cache.revalidate

export async function GET(request: NextRequest) {
  // let token = request.headers.get('Authorization')?.split('Bearer ')[1]
  // const res = await supabase.auth.signInWithPassword({
  //   email: 'kurobanekengo@gmail.com',
  //   password: '643QKur0suke',
  // })

  // console.log('login result: ', res.data.session?.access_token)
  // const user = await supabase.auth.getUser(res.data.session?.access_token)
  // console.log('user: ', user)

  // if (!token) {
  //   return NextResponse.json(
  //     { error: 'Authentication token not provided.' },
  //     { status: 401 },
  //   )
  // }

  const { searchParams } = new URL(request.url)
  const nendo = searchParams.get('nendo')
  const service = Factory.getMasterService()
  const nendo_list = await service.selectNendoList()
  const kamoku_list = await service.selectKamokuList()
  const saimoku_list = await service.selectSaimokuList(nendo)
  return NextResponse.json(
    { nendo_list, kamoku_list, saimoku_list },
    {
      status: 200,
      headers: cache.headers,
    },
  )
}
