import { FC, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import {
  Box,
  Fieldset,
  NativeSelect,
  Select,
  SimpleGrid,
  Stack,
} from '@mantine/core'

import { AppDispatch, RootState } from '@/store'
import { appActions } from '@/store/app'

export const Header: FC = () => {
  const appState = useSelector((state: RootState) => state.app)
  const { data: masters } = useSelector((state: RootState) => state.masters)

  const dispatch = useDispatch<AppDispatch>()

  const router = useRouter()
  const pathname = usePathname()
  const search_params = useSearchParams()

  const nendo_list = useMemo(() => {
    const list = masters.nendo_list.map((n) => {
      return {
        value: n.nendo,
        label: n.nendo,
      }
    })
    return [{ value: '', label: 'Not selected' }, ...list]
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const type_list = useMemo(() => {
    const list = [] as { value: string; label: string }[]
    let index = 0
    const add = (label: string) => {
      list.push({ value: String(index++), label })
    }
    add('Not selected')
    add('Ledger')
    add('Journal')
    return list
  }, [])

  const type = useMemo<string>(() => {
    if (appState.is_ledger) {
      return '1'
    }
    if (appState.is_journal) {
      return '2'
    }
    return '0'
  }, [appState.is_journal, appState.is_ledger])

  return (
    <>
      <Fieldset legend="Select the financial statements to display">
        <Stack>
          <Box w={370}>
            <SimpleGrid cols={2}>
              <Select
                w={150}
                label="Fiscal Year"
                value={appState.selected_nendo ?? ''}
                data={nendo_list}
                onChange={(value) => {
                  if (value !== null) {
                    dispatch(
                      appActions.setNendo(value === '' ? undefined : value),
                    )
                    router.push(`/${value}`)
                  }
                }}
                withAsterisk
              />

              <Select
                value={type}
                data={type_list}
                disabled={appState.selected_nendo === undefined}
                label="Document Type"
                w={150}
                onChange={(value) => {
                  if (value === null) {
                    return
                  }
                  if (value === '0') {
                    dispatch(appActions.showLedger(false))
                    dispatch(appActions.showJournal(false))
                    router.push(
                      `/${appState.selected_nendo}?${new URLSearchParams(search_params.toString())}`,
                    )
                  }
                  if (value === '1') {
                    dispatch(appActions.showLedger(true))
                    dispatch(appActions.showJournal(false))
                    if (appState.selected_ledger_cd) {
                      router.push(
                        `/${appState.selected_nendo}/ledger/${appState.selected_ledger_cd}?${new URLSearchParams(search_params.toString())}`,
                      )
                    }
                  }
                  if (value === '2') {
                    dispatch(appActions.showLedger(false))
                    dispatch(appActions.showJournal(true))
                  }
                }}
                withAsterisk
              />
            </SimpleGrid>
          </Box>
          <Box w={200}>
            <NativeSelect
              label="Account Code"
              withAsterisk
              disabled={!appState.is_ledger}
              value={appState.selected_ledger_cd}
              onChange={(e) => {
                dispatch(
                  appActions.setLedgerCd(
                    e.target.value != null ? e.target.value : undefined,
                  ),
                )
                if (e.target.value != '') {
                  router.push(
                    `/${appState.selected_nendo}/ledger/${e.target.value}`,
                  )
                } else {
                  router.push(`/${appState.selected_nendo}`)
                }
              }}
            >
              <option value=""></option>
              {masters.saimoku_list.map((s) => {
                return (
                  <option key={s.saimoku_cd} value={s.saimoku_cd}>
                    {s.saimoku_cd}: {s.saimoku_full_name}
                  </option>
                )
              })}
            </NativeSelect>
          </Box>
          <NativeSelect
            w={100}
            label={'Month'}
            disabled={!appState.is_ledger}
            value={appState.selected_month}
            onChange={(e) => {
              dispatch(
                appActions.setMonth(
                  e.target.value != null ? e.target.value : undefined,
                ),
              )
              const month = e.currentTarget.value
              if (month !== '') {
                const params = new URLSearchParams(search_params.toString())
                params.set('month', String(month))
                router.push(`${pathname}?${params.toString()}`)
              } else {
                const params = new URLSearchParams(search_params.toString())
                params.delete('month')
                router.push(`${pathname}?${params.toString()}`)
              }
            }}
          >
            <option value=""></option>
            {[4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3].map((month) => {
              return (
                <option key={month} value={String(month)}>
                  {month}月
                </option>
              )
            })}
          </NativeSelect>
        </Stack>
      </Fieldset>
    </>
  )
}
