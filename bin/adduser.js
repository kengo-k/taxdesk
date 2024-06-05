// signUpTool.js
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function signUpUser(email, password) {
  try {
    const { user, session, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      throw error
    }

    console.log('User signed up successfully:')
    console.log('User:', user)
    console.log('Session:', session)
  } catch (error) {
    console.error('Error signing up:', error.message)
  }
}

// コマンドライン引数からユーザー名とパスワードを取得
const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.error(
    'Please provide an email and password as command-line arguments.',
  )
  process.exit(1)
}

signUpUser(email, password)
