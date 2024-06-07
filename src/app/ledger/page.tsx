'use client'

import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Select } from '@mantine/core'

import { AppDispatch, RootState } from '@/store'
import { appActions } from '@/store/app'
import { loadNendo, loadSaimoku } from '@/store/master'

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

  const saimoku_list = useMemo(() => {
    const list = masters.saimoku_list.map((s) => {
      return {
        value: `${s.saimoku_cd}`,
        label: `${s.saimoku_cd}: ${s.saimoku_full_name} (${s.count})`,
      }
    })
    return [{ value: '', label: 'Not Selected' }, ...list]
  }, [masters.saimoku_list])

  const month_list = useMemo(() => {
    const list = [] as { value: string; label: string }[]
    list.push(
      ...[4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3].map((month) => ({
        value: `${month}`,
        label: `${month}月`,
      })),
    )
    return [{ value: '', label: 'Not Selected' }, ...list]
  }, [])

  useEffect(() => {
    dispatch(loadNendo())
  }, [dispatch])

  useEffect(() => {
    if (appState.selected_nendo) {
      dispatch(loadSaimoku(appState.selected_nendo))
    }
  }, [dispatch, appState.selected_nendo])

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
      <Select
        value={appState.selected_ledger_cd ?? ''}
        data={saimoku_list}
        label="Account Code"
        onChange={(saimoku_cd) => {
          if (saimoku_cd === null) {
            return
          }
          const ledger_cd = saimoku_cd === '' ? undefined : saimoku_cd
          dispatch(appActions.setLedgerCd(ledger_cd))
        }}
        w={300}
        withAsterisk
      />
      <Select
        value={appState.selected_month ?? ''}
        data={month_list}
        label={'Month'}
        onChange={(month) => {
          if (month === null) {
            return
          }
          dispatch(appActions.setMonth(month === '' ? undefined : month))
        }}
        w={150}
      />
    </>
  )
}
