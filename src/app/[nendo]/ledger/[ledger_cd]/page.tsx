'use client'

import { SinglePage } from '@/containers/spa'

export default function Page({ params, searchParams }: PageProps) {
  return (
    <SinglePage
      page_type="Ledger"
      nendo={params.nendo}
      ledger_cd={params.ledger_cd}
      month={searchParams.month}
      other_cd={searchParams.other_cd}
      page_no={searchParams.page_no}
      page_size={searchParams.page_size}
    />
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
