'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [required_mfa, setRequiredMfa] = useState(false)

  const login = async (e: any) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/public/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        const { required_mfa } = data.data
        setRequiredMfa(required_mfa)
        if (!required_mfa) {
          router.push('/')
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error)
      }
    } catch (error) {
      setError('An error occurred during login.')
    }
  }

  const verify = async (e: any) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/public/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, email, password }),
      })
      if (response.ok) {
        router.push('/')
      } else {
        const errorData = await response.json()
        setError(errorData.error)
      }
    } catch (error) {
      setError('An error occurred during login.')
    }
  }

  return (
    <div>
      {!required_mfa && (
        <>
          <h1>Login</h1>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button onClick={login}>Login</button>
        </>
      )}
      {required_mfa && (
        <>
          <h1>Verify</h1>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div>
            <label htmlFor="code">Code:</label>
            <input
              type="password"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <button onClick={verify}>Verify</button>
        </>
      )}
    </div>
  )
}
