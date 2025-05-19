import { prisma } from '@/lib/backend/db/prisma'

import { importCsvToPrisma } from './test-helpers'

export class TestEnvironment {
  private static instance: TestEnvironment

  static getInstance(): TestEnvironment {
    if (!this.instance) {
      this.instance = new TestEnvironment()
    }
    return this.instance
  }

  async initialize(): Promise<void> {
    try {
      await this.setupBaseMasterData()
    } catch (error) {
      console.error('Failed to initialize test environment:', error)
      throw error
    }
  }

  private async setupBaseMasterData(): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.journals.deleteMany()
        await tx.saimoku_masters.deleteMany()
        await tx.kamoku_masters.deleteMany()
        await tx.kamoku_bunrui_masters.deleteMany()
        await tx.nendo_masters.deleteMany()
        await importCsvToPrisma(tx, 'seed/nendo_masters.csv')
        await importCsvToPrisma(tx, 'seed/kamoku_bunrui_masters.csv')
        await importCsvToPrisma(tx, 'seed/kamoku_masters.csv')
        await importCsvToPrisma(tx, 'seed/saimoku_masters.csv')
      })
    } catch (error) {
      console.error('Error setting up basic master data:', error)
      throw error
    }
  }
}
