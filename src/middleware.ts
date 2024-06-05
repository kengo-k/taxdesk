import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function middleware(request: NextRequest) {
  const jwt = request.cookies.get('tax_account_app_auth_token')?.value
  const authorizationHeader = request.headers.get('authorization')

  const path = request.nextUrl.pathname
  console.log('Middleware called from ', path)

  if (path.startsWith('/login')) {
    return NextResponse.next()
  }

  if (path.startsWith('/api/public')) {
    return NextResponse.next()
  }

  if (path.startsWith('/api')) {
    if (!authorizationHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authorizationHeader.replace('Bearer ', '')

    try {
      const { error } = await supabase.auth.getUser(token)
      if (error) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.next()
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  if (!jwt) {
    if (path !== '/login') {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  } else {
    if (path === '/login') {
      const homeUrl = new URL('/', request.url)
      return NextResponse.redirect(homeUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
    },
  ],
}
