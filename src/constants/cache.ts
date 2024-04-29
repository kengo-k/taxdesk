export interface CacheSettings {
  revalidate: number
  headers: { [key: string]: string }
}

export function getDefault(): CacheSettings {
  return {
    revalidate: 60,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60',
    },
  }
}
