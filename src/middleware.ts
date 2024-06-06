import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  if (path.startsWith('/api/public')) {
    return NextResponse.next()
  }

  if (path.startsWith('/api')) {
    const authorizationHeader = request.headers.get('authorization')
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

  return NextResponse.next()
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
    },
  ],
}
