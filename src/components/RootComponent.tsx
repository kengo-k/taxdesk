import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import { useRouter } from 'next/navigation'

import { RootState } from '@/store'

export function RootComponent({ children }: { children: React.ReactNode }) {
  const appState = useSelector((state: RootState) => state.app)
  const router = useRouter()
  useEffect(() => {
    if (appState.unauthorized) {
      router.push('/login')
    }
  }, [appState.unauthorized, router])
  return <>{children}</>
}
