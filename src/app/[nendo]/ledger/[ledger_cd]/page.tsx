'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Header } from '@/containers/header'
import { LedgerList } from '@/containers/ledger'
import { Month, Nendo, isMonth } from '@/misc/nendo'
import { removeExtraProperties } from '@/misc/object'
import { AppDispatch } from '@/store'
import { appActions } from '@/store/app'
import { selectNendoMap } from '@/store/master'

export default function Page({ params, searchParams }: PageProps) {
  const dispatch = useDispatch<AppDispatch>()
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
  const is_valid_month =
    searchParams.month === undefined ? true : isMonth(searchParams.month)

  const is_valid_nendo = nendo_map.has(params.nendo)

  const has_error = ![is_valid_month, is_valid_month].every(Boolean)

  if (has_error) {
    return <div>無効なパラメータ</div>
  }

  const month =
    searchParams.month === undefined
      ? null
      : new Month(Number(searchParams.month))

  const nendo = new Nendo(Number(params.nendo))

  return (
    <>
      <Header />
      <LedgerList
        nendo={nendo}
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
