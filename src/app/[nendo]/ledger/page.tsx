'use client'

import { SinglePage } from '@/containers/spa'

export default function Page({ params }: PageProps) {
  return <SinglePage page_type="Ledger" nendo={params.nendo} />
}

interface PageProps {
  params: {
    readonly nendo: string
    readonly ledger_cd: string
  }
}
