'use client'

import { Provider } from 'react-redux'

import './globals.css'

import {
  Box,
  ColorSchemeScript,
  MantineProvider,
  createTheme,
} from '@mantine/core'
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
          <Box maw={1600} mx={'auto'} p={20}>
            <Provider store={store}>{children}</Provider>
          </Box>
        </MantineProvider>
      </body>
    </html>
  )
}
