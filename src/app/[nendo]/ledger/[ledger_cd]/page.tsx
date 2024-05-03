'use client'

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { Header } from '@/containers/header'
import { LedgerList } from '@/containers/ledger'
import { Month, isMonth } from '@/misc/nendo'
import { removeExtraProperties } from '@/misc/object'
import { AppDispatch } from '@/store'
import { appActions } from '@/store/app'

export default function Page({ params, searchParams }: PageProps) {
  const dispatch = useDispatch<AppDispatch>()
  searchParams = {
    ...SearchParams.default,
    ...removeExtraProperties(searchParams, SearchParams.default),
  }
  const is_valid_month =
    searchParams.month === undefined ? true : isMonth(searchParams.month)

  const has_error = ![is_valid_month].every(Boolean)

  useEffect(() => {
    dispatch(appActions.setNendo(params.nendo))
    dispatch(appActions.showLedger(true))
    dispatch(appActions.setLedgerCd(params.ledger_cd))
  }, [dispatch, params.nendo, params.ledger_cd])

  if (has_error) {
    return <div>無効なパラメータ</div>
  }

  const month =
    searchParams.month === undefined
      ? null
      : new Month(Number(searchParams.month))

  return (
    <>
      <Header />
      <LedgerList
        nendo={params.nendo}
        ledger_cd={params.ledger_cd}
        month={month}
        page_no={1}
        page_size={10}
      />
    </>
  )
}

const SearchParams = {
  default: {
    month: undefined,
    other_cd: undefined,
  } as SearchParams,
}

interface SearchParams {
  readonly month: string | undefined
  readonly other_cd: string | undefined
}

interface PageProps {
  params: {
    readonly nendo: string
    readonly ledger_cd: string
  }
  searchParams: SearchParams
}
