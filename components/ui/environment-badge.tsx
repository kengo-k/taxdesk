'use client'

import { getEnvironment } from '@/lib/utils/environment'

export function EnvironmentBadge() {
  const environment = getEnvironment()

  // 本番環境の場合
  if (environment === 'production') {
    return (
      <div className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-red-600 text-white">
        Production
      </div>
    )
  }

  // ローカル環境の場合
  return (
    <div className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-blue-200 text-blue-800">
      Local
    </div>
  )
}
