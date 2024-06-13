import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'

import { AUTH_ERROR, REQUEST_ERROR } from '@/constants/error'
import { ApiResponse } from '@/misc/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json(ApiResponse.failureWithAppError(REQUEST_ERROR), {
      status: 400,
    })
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(ApiResponse.failureWithAppError(AUTH_ERROR), {
        status: 401,
      })
    }

    const { data: mfaData, error: mfaError } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

    if (mfaError) {
      return NextResponse.json(ApiResponse.failureWithAppError(AUTH_ERROR), {
        status: 401,
      })
    }

    const { session } = data
    if (mfaData.currentLevel === 'aal1' && mfaData.nextLevel === 'aal1') {
      const cookie = cookies()
      cookie.set('sign', session.access_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24,
        path: '/',
      })
      return NextResponse.json(
        ApiResponse.success({
          message: 'Login succeeded.',
          required_mfa: false,
        }),
      )
    } else {
      return NextResponse.json(
        ApiResponse.success({
          message: 'Please authenticate MFA.',
          required_mfa: true,
        }),
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
