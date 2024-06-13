import Cookies from 'js-cookie'

import { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit'

import { appActions } from '@/store/app'

export const error_handler = (
  dispatch: ThunkDispatch<unknown, unknown, UnknownAction>,
  reject: (value: unknown) => any,
) => {
  return async (response: Response): Promise<any> => {
    if (response.ok) {
      return await response.json()
    } else if (response.status === 401) {
      dispatch(appActions.setUnauthorized(true))
      return reject('Unauthorized')
    } else {
      const json = await response.json()
      return reject(json)
    }
  }
}

export async function fetchWithAuth(
  url: string,
  _error_handler: ReturnType<typeof error_handler>,
  options: RequestInit = {},
): Promise<any> {
  // Cookie is httpOnly, so Authorization header is never sent
  const sign = Cookies.get('sign')
  if (sign) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${sign}`,
    }
  }

  const response = await fetch(url, options)
  return _error_handler(response)
}
