import { FC, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch, RootState } from '@/store'
import { appActions } from '@/store/app'
import { loadMasters, selectNendoMap, selectSaimokuMap } from '@/store/master'

import { Month, Nendo } from '@/models/date'
import { SaimokuWithSummary } from '@/models/master'
import { PageNo, PageSize } from '@/models/paging'

import { Header } from '@/containers/header'
import { LedgerList } from '@/containers/ledger'

type PageType = '' | 'Ledger' | 'Journal'

export const SinglePage: FC<{
  page_type: PageType
  nendo?: string
  ledger_cd?: string
  month?: string
  other_cd?: string
  page_no?: string
  page_size?: string
}> = (props) => {
  const dispatch = useDispatch<AppDispatch>()

  const appState = useSelector((state: RootState) => state.app)

  useEffect(() => {
    dispatch(loadMasters(props.nendo))
  }, [dispatch, props.nendo])

  const { loading: is_master_loading, error: is_master_error } = useSelector(
    (state: RootState) => state.masters,
  )

  const nendo_map = useSelector(selectNendoMap)
  const nendo = Nendo.create(props.nendo ?? '', Array.from(nendo_map.keys()))

  const saimoku_map = useSelector(selectSaimokuMap)
  const [is_valid_ledger_cd, ledger_cd] = validateLedgerCd(
    props.ledger_cd,
    saimoku_map,
  )

  const [is_valid_month, month] = Month.create(props.month)

  const page_no = PageNo.create(props.page_no)
  const page_size = PageSize.create(props.page_size)

  useEffect(() => {
    dispatch(appActions.setNendo(props.nendo))
    let is_ledger = false
    let is_journal = false
    if (props.page_type === 'Ledger') {
      is_ledger = true
    }
    if (props.page_type === 'Journal') {
      is_journal = true
    }
    dispatch(appActions.showLedger(is_ledger))
    dispatch(appActions.showJournal(is_journal))
    if (props.ledger_cd) {
      dispatch(appActions.setLedgerCd(props.ledger_cd))
    }
    if (props.month) {
      dispatch(appActions.setMonth(props.month))
    }
  }, [
    dispatch,
    props.ledger_cd,
    props.month,
    props.nendo,
    props.page_type,
    appState.is_ledger,
  ])

  if (is_master_loading) {
    return <div>Now loading...</div>
  }

  if (
    !is_valid_month ||
    !is_valid_ledger_cd ||
    nendo === null ||
    is_master_error
  ) {
    return <div>Error...</div>
  }

  if (props.page_type === '') {
    return <Header />
  }

  if (props.page_type === 'Ledger') {
    if (ledger_cd === null) {
      return <Header />
    }

    return (
      <>
        <Header />
        <LedgerList
          nendo={nendo}
          ledger_cd={ledger_cd}
          month={month}
          page_no={page_no}
          page_size={page_size}
        />
      </>
    )
  }
}

function validateLedgerCd(
  ledger_cd: string | undefined,
  saimoku_map: Map<string, SaimokuWithSummary>,
): [boolean, string | null] {
  if (ledger_cd === undefined) {
    return [true, null]
  }
  const exists = saimoku_map.has(ledger_cd ?? '')
  return [exists, exists ? ledger_cd : null]
}
