'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Header } from '@/containers/header'
import { LedgerList } from '@/containers/ledger'
import { removeExtraProperties } from '@/misc/object'
import { Month, Nendo } from '@/models/date'
import { PageNo, PageSize } from '@/models/paging'
import { AppDispatch, RootState } from '@/store'
import { appActions } from '@/store/app'
import { loadMasters, selectNendoMap } from '@/store/master'

export default function Page({ params, searchParams }: PageProps) {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(loadMasters())
  }, [dispatch])

  const { loading: is_master_loading, error: is_master_error } = useSelector(
    (state: RootState) => state.masters,
  )
  const nendo_map = useSelector(selectNendoMap)

  useEffect(() => {
    dispatch(appActions.setNendo(params.nendo))
    dispatch(appActions.showLedger(true))
    dispatch(appActions.setLedgerCd(params.ledger_cd))
  }, [dispatch, params.nendo, params.ledger_cd])

  searchParams = {
    ...SearchParams.default,
    ...removeExtraProperties(searchParams, SearchParams.default),
  }
  const [is_valid_month, month] = Month.create(searchParams.month)

  const nendo = Nendo.create(params.nendo, Array.from(nendo_map.keys()))
  const page_no = PageNo.create(searchParams.page_no)
  const page_size = PageSize.create(searchParams.page_size)

  if (is_master_loading) {
    return <div>Now loading...</div>
  }

  if (!is_valid_month || nendo === null || is_master_error) {
    return <div>Error...</div>
  }

  return (
    <>
      <Header />
      <LedgerList
        nendo={nendo}
        ledger_cd={params.ledger_cd}
        month={month}
        page_no={page_no}
        page_size={page_size}
      />
    </>
  )
}

const SearchParams = {
  default: {
    month: undefined,
    other_cd: undefined,
    page_no: undefined,
    page_size: undefined,
  } as SearchParams,
}

interface SearchParams {
  readonly month: string | undefined
  readonly other_cd: string | undefined
  readonly page_no: string | undefined
  readonly page_size: string | undefined
}

interface PageProps {
  params: {
    readonly nendo: string
    readonly ledger_cd: string
  }
  searchParams: SearchParams
}
