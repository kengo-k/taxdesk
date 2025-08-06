import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

import type { AppDispatch, RootState } from '@/lib/redux/store'

// 型付きフックを使用
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
