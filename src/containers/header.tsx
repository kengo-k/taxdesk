import { FC, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { Box, Fieldset, Select, SimpleGrid, Stack } from '@mantine/core'

import { AppDispatch, RootState } from '@/store'
import { appActions } from '@/store/app'

export const Header: FC = () => {
  const appState = useSelector((state: RootState) => state.app)
  const { data: masters } = useSelector((state: RootState) => state.masters)

  const dispatch = useDispatch<AppDispatch>()

  const router = useRouter()
  const pathname = usePathname()
  const search_params = useSearchParams()

  const { rebuildRoute } = useRouteBuilder(router)

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

  const saimoku_list = useMemo(() => {
    const list = masters.saimoku_list.map((s) => {
      return {
        value: `${s.saimoku_cd}`,
        label: `${s.saimoku_cd}: ${s.saimoku_full_name}`,
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

  return (
    <>
      <Fieldset legend="Select the financial statements to display">
        <Stack>
          <Box w={370}>
            <SimpleGrid cols={2}>
              <Select
                value={appState.selected_nendo ?? ''}
                data={nendo_list}
                label="Fiscal Year"
                onChange={(value) => {
                  if (value !== null) {
                    dispatch(
                      appActions.setNendo(value === '' ? undefined : value),
                    )
                    rebuildRoute({ nendo: value })
                  }
                }}
                w={150}
                withAsterisk
              />

              <Select
                value={type}
                data={type_list}
                disabled={appState.selected_nendo === undefined}
                label="Document Type"
                onChange={(value) => {
                  if (value === null) {
                    return
                  }
                  if (value === '0') {
                    dispatch(appActions.showLedger(false))
                    dispatch(appActions.showJournal(false))
                    rebuildRoute({ is_ledger: false, is_journal: false })
                  }
                  if (value === '1') {
                    dispatch(appActions.showLedger(true))
                    dispatch(appActions.showJournal(false))
                    rebuildRoute({ is_ledger: true, is_journal: false })
                  }
                  if (value === '2') {
                    dispatch(appActions.showLedger(false))
                    dispatch(appActions.showJournal(true))
                    rebuildRoute({ is_ledger: false, is_journal: true })
                  }
                }}
                w={150}
                withAsterisk
              />
            </SimpleGrid>
          </Box>
          <Box w={200}>
            <Select
              value={appState.selected_ledger_cd ?? ''}
              data={saimoku_list}
              disabled={!appState.is_ledger}
              label="Account Code"
              onChange={(saimoku_cd) => {
                if (saimoku_cd === null) {
                  return
                }
                const ledger_cd = saimoku_cd === '' ? undefined : saimoku_cd
                dispatch(appActions.setLedgerCd(ledger_cd))
                rebuildRoute({ ledger_cd })
              }}
              withAsterisk
            />
          </Box>
          <Select
            value={appState.selected_month ?? ''}
            data={month_list}
            label={'Month'}
            disabled={!appState.is_ledger}
            onChange={(month) => {
              if (month === null) {
                return
              }
              dispatch(appActions.setMonth(month === '' ? undefined : month))
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
            w={150}
          />
        </Stack>
      </Fieldset>
    </>
  )
}

const useRouteBuilder = (router: ReturnType<typeof useRouter>) => {
  const search_params = useSearchParams()
  const appState = useSelector((state: RootState) => state.app)
  const rebuildRoute = (options: {
    nendo?: string | null
    ledger_cd?: string | null
    month?: string | null
    is_journal?: boolean | null
    is_ledger?: boolean | null
  }) => {
    const default_options = {
      nendo: null,
      ledger_cd: null,
      month: null,
      is_journal: null,
      is_ledger: null,
    }
    options = { ...default_options, ...options }
    const nendo =
      options.nendo === null ? appState.selected_nendo : options.nendo
    const ledger_cd =
      options.ledger_cd === null
        ? appState.selected_ledger_cd
        : options.ledger_cd
    const month =
      options.month === null ? appState.selected_month : options.month
    const is_journal =
      options.is_journal === null ? appState.is_journal : options.is_journal
    const is_ledger =
      options.is_ledger === null ? appState.is_ledger : options.is_ledger

    if (!nendo) {
      router.push('/')
      return
    }
    if (is_journal) {
      router.push(`/${nendo}/journal`)
      return
    }
    if (is_ledger) {
      if (!ledger_cd) {
        router.push(`/${nendo}/ledger`)
        return
      }
      const paths = [`/${nendo}/ledger`]
      paths.push(`${ledger_cd}`)
      const query_string = new URLSearchParams(search_params.toString())
      if (month) {
        query_string.set('month', month)
      }
      const path = `${paths.join('/')}?${query_string}`
      router.push(path)
      return
    }
    router.push(`/${nendo}`)
  }
  return { rebuildRoute }
}
