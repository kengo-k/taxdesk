'use client'

import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Select } from '@mantine/core'

import { AppDispatch, RootState } from '@/store'
import { appActions } from '@/store/app'
import { loadNendo } from '@/store/master'

export default function Page() {
  const dispatch = useDispatch<AppDispatch>()

  const appState = useSelector((state: RootState) => state.app)
  const { data: masters } = useSelector((state: RootState) => state.masters)

  const nendo_list = useMemo(() => {
    const list = masters.nendo_list.map((n) => {
      return {
        value: n.nendo,
        label: n.nendo,
      }
    })
    return [{ value: '', label: 'Not selected' }, ...list]
  }, [masters.nendo_list])

  useEffect(() => {
    dispatch(loadNendo())
  }, [dispatch])

  return (
    <>
      <Select
        value={appState.selected_nendo ?? ''}
        data={nendo_list}
        label="Fiscal Year"
        onChange={(value) => {
          if (value !== null) {
            dispatch(appActions.setNendo(value === '' ? undefined : value))
          }
        }}
        w={150}
        withAsterisk
      />
      <div>HELLO</div>
    </>
  )
}
