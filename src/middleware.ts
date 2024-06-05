// middleware.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  console.log('Middleware called from ', path)
  if (path.startsWith('/login')) {
    return NextResponse.next()
  }
  if (path.startsWith('/api/public')) {
    return NextResponse.next()
  }

  const token = request.cookies.get('token')?.value
  if (!token) {
    if (path.startsWith('/api')) {
    } else {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  // if (path.startsWith('/api')) {
  //   const token = request.headers.get('Authorization')?.split('Bearer ')[1]
  //   if (!token) {
  //     return NextResponse.json(
  //       { error: 'Authentication token not provided.' },
  //       { status: 401 },
  //     )
  //   }
  // }

  return NextResponse.next()
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
    },
  ],
}
