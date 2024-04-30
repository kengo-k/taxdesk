'use client'

//import "./globals.css";
import { Provider } from 'react-redux'

import { ColorSchemeScript, MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'

import { store } from '@/store'

const theme = createTheme({
  spacing: {
    sm: '8px',
    md: '12px',
    lg: '20px',
  },
  radius: {
    md: '8px',
    lg: '16px',
  },
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <Provider store={store}>{children}</Provider>
        </MantineProvider>
      </body>
    </html>
  )
}
