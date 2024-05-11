'use client'

import { SinglePage } from '@/containers/spa'

export default function Page({ params }: PageProps) {
  return <SinglePage page_type="" nendo={params.nendo} />
}

interface PageProps {
  params: {
    nendo: string
  }
}
