import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { getSupabaseClient } from '@/misc/supabase'

export async function middleware(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    // Skip authentication for public api
    const path = request.nextUrl.pathname
    if (path.startsWith('/api/public')) {
      return NextResponse.next()
    }

    if (path.startsWith('/api')) {
      // Skip authentication if SKIP_AUTH_IN_LOCAL is set to 'true'
      if (process.env.SKIP_AUTH_IN_LOCAL === 'true') {
        return NextResponse.next()
      }

      // If Authorization header is present, validate it first
      const auth_header = request.headers.get('authorization')
      if (auth_header) {
        const sign = auth_header.replace('Bearer ', '')
        const { data: user_data } = await supabase.auth.getUser(sign)
        if (user_data.user) {
          return NextResponse.next()
        }
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // If Authorization header does not exist, get token from cookie
      const cookie = cookies()
      const sign = cookie.get('sign')
      if (!sign) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const { data: user_data } = await supabase.auth.getUser(sign.value)
      if (user_data.user) {
        return NextResponse.next()
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  } catch (e: any) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 500 })
  }
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
    },
  ],
}
