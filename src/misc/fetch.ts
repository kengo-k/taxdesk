import { AUTH_KEY } from '@/constants/storage'

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = localStorage.getItem(AUTH_KEY)
  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    }
  }

  return await fetch(url, options)
}
