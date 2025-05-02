import type React from "react"
import { ReduxProvider } from "@/lib/redux/provider"
import { Header } from "@/components/header"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <ReduxProvider>
          <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
        </ReduxProvider>
      </body>
    </html>
  )
}


import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
