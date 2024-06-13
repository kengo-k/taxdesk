import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'

import { AUTH_ERROR, REQUEST_ERROR } from '@/constants/error'
import { ApiResponse } from '@/misc/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  const { code, email, password } = await request.json()
  if (!code || !email || !password) {
    return NextResponse.json(ApiResponse.failureWithAppError(REQUEST_ERROR), {
      status: 400,
    })
  }

  const { data: user_data, error: user_error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    })

  if (user_error) {
    return NextResponse.json(ApiResponse.failureWithAppError(AUTH_ERROR), {
      status: 401,
    })
  }

  // get auth level
  const { data: level, error: level_error } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

  if (level_error) {
    return NextResponse.json(ApiResponse.failureWithAppError(AUTH_ERROR), {
      status: 401,
    })
  }

  // return response because authentication has already been completed.
  if (level.currentLevel === level.nextLevel) {
    return NextResponse.json(ApiResponse.success('Login succeeded.'))
  }

  if (level.currentLevel === 'aal1' && level.nextLevel === 'aal2') {
    const factors = user_data.user.factors
    if (!factors) {
      return NextResponse.json(ApiResponse.failureWithAppError(AUTH_ERROR), {
        status: 401,
      })
    }
    let auth = false
    if (factors) {
      for (const factor of factors) {
        const { data: verify_data } =
          await supabase.auth.mfa.challengeAndVerify({
            factorId: factor.id,
            code,
          })
        if (verify_data) {
          auth = true
          break
        }
      }
    }
    if (auth) {
      const cookie = cookies()
      cookie.set('sign', user_data.session.access_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24,
        path: '/',
      })
      return NextResponse.json(ApiResponse.success('Login succeeded.'))
    }
  }

  return NextResponse.json(ApiResponse.failureWithAppError(AUTH_ERROR), {
    status: 401,
  })
}
