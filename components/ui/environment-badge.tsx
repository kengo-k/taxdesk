'use client'

import { getEnvironment } from '@/lib/utils/environment'
import { APP_VERSION } from '@/lib/version'

export function EnvironmentBadge() {
  const environment = getEnvironment()

  if (environment === 'production') {
    return (
      <div className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-pink-200 text-pink-800">
        Production - {APP_VERSION}
      </div>
    )
  }

  return (
    <div className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-blue-200 text-blue-800">
      Local
    </div>
  )
}
