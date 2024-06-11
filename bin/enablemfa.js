/* eslint-disable no-console */
const { createClient } = require('@supabase/supabase-js')

const express = require('express')
const app = express()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function enablemfa(email, password, friendlyName) {
  // signin
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }
  } catch (e) {
    return { data: null, error: e }
  }

  // enroll mfa
  try {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName,
    })

    if (error) {
      throw error
    }

    const {
      totp: { qr_code, secret, uri },
    } = data

    return { data: { qr_code, uri }, error: null }
  } catch (e) {
    return { data: null, error: e }
  }
}

async function main() {
  const email = process.argv[2]
  const password = process.argv[3]
  const name = process.argv[4]

  if (!email || !password || !name) {
    console.error(
      'Please provide an email, password and friendly_name as command-line arguments.',
    )
    process.exit(1)
  }

  const { data, error } = await enablemfa(email, password, name)
  if (error) {
    console.error('Error: MFA enrollment failed.')
    process.exit(2)
  }

  app.get('/', (_, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MFA enrollment</title>
        </head>
        <body>
          <img src="${data.qr_code}" layout="fill"></img>
        </body>
      </html>
    `)
  })

  app.listen(8000, () => {
    console.log('Server is running on port 8000')
  })
}

main().catch((error) => {
  console.error('An error occurred:', error)
  process.exit(1)
})
