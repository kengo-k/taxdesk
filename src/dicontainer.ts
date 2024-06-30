import { Container } from 'inversify'

import { PrismaClient } from '@prisma/client'

import { JournalService, JournalServiceImpl } from '@/services/journal'
import { LedgerService, LedgerServiceImpl } from '@/services/ledger'
import { MasterService, MasterServiceImpl } from '@/services/master'

let prisma = getConnection()

function getConnection(): PrismaClient {
  let prisma: PrismaClient
  console.log(`databaseurl: ${process.env.DATABASE_URL}`)
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient()
  } else {
    if (!(global as any).prisma) {
      ;(global as any).prisma = new PrismaClient()
    }
    prisma = (global as any).prisma
  }
  return prisma
}

interface ServiceMap {
  MasterService: MasterService
  LedgerService: LedgerService
  JournalService: JournalService
}

function register<T>(
  container: Container,
  serviceImplementation: new (...args: any[]) => T,
  serviceIdentifier: keyof ServiceMap,
): void {
  container.bind<T>(serviceIdentifier).to(serviceImplementation)
}

const serviceContainer = new Container()
serviceContainer.bind<PrismaClient>('PrismaClient').toConstantValue(prisma)

const registerService = register.bind(null, serviceContainer)
registerService(MasterServiceImpl, 'MasterService')
registerService(LedgerServiceImpl, 'LedgerService')
registerService(JournalServiceImpl, 'JournalService')

function getService<K extends keyof ServiceMap>(key: K): ServiceMap[K] {
  return serviceContainer.get<ServiceMap[K]>(key)
}

export const Factory = {
  getMasterService: () => getService<'MasterService'>('MasterService'),
  getJournalService: () => getService<'JournalService'>('JournalService'),
  getLedgerService: () => getService<'LedgerService'>('LedgerService'),
}

serviceContainer.bind<typeof Factory>('Factory').toConstantValue(Factory)
