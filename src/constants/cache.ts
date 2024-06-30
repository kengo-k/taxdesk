export interface CacheSettings {
  revalidate: number
  headers: { [key: string]: string }
}

export function getDefault(): CacheSettings {
  return {
    revalidate: 60,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0',
    },
  }
}
