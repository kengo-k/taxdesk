import { Prisma, PrismaClient } from '@prisma/client'

export type Connection = PrismaClient | Prisma.TransactionClient

export interface FiscalYear {
  id: string
  label: string
  startDate: string
  endDate: string
  isCurrent: boolean
}
