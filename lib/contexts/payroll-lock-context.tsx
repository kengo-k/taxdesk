'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

import { fetchPaymentStatuses } from '@/lib/utils/payroll-lock-utils'

interface PayrollLockContextType {
  paymentStatuses: Record<number, boolean>
  isLoading: boolean
  refreshPaymentStatuses: (fiscalYear: string) => Promise<void>
}

const PayrollLockContext = createContext<PayrollLockContextType | undefined>(
  undefined,
)

export function PayrollLockProvider({
  children,
  fiscalYear,
}: {
  children: React.ReactNode
  fiscalYear: string
}) {
  const [paymentStatuses, setPaymentStatuses] = useState<
    Record<number, boolean>
  >({})
  const [isLoading, setIsLoading] = useState(true)

  const refreshPaymentStatuses = async (year: string) => {
    setIsLoading(true)
    try {
      const statuses = await fetchPaymentStatuses(year)
      setPaymentStatuses(statuses)
    } catch (error) {
      console.error('Failed to fetch payment statuses:', error)
      setPaymentStatuses({})
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (fiscalYear) {
      refreshPaymentStatuses(fiscalYear)
    }
  }, [fiscalYear])

  return (
    <PayrollLockContext.Provider
      value={{
        paymentStatuses,
        isLoading,
        refreshPaymentStatuses,
      }}
    >
      {children}
    </PayrollLockContext.Provider>
  )
}

export function usePayrollLock() {
  const context = useContext(PayrollLockContext)
  if (context === undefined) {
    throw new Error('usePayrollLock must be used within a PayrollLockProvider')
  }
  return context
}
