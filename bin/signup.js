/* eslint-disable no-console */
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function signup(email, password) {
  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      throw error
    }
  } catch (e) {
    console.error('Error signing up:', e.message)
    return
  }
}

const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.error(
    'Please provide an email and password as command-line arguments.',
  )
  process.exit(1)
}

signup(email, password)
