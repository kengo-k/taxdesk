'use client'

import { Suspense } from 'react'

interface SuspenseWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function SuspenseWrapper({ children, fallback }: SuspenseWrapperProps) {
  return (
    <Suspense fallback={fallback || <div>Loading...</div>}>
      {children}
    </Suspense>
  )
}