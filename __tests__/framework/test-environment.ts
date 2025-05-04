import { PrismaClient } from '@prisma/client'

import { importCsvToPrisma } from './test-helpers'

export class TestEnvironment {
  private static instance: TestEnvironment
  private prisma: PrismaClient

  private constructor() {
    this.prisma = new PrismaClient()
  }

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
      await this.prisma.nendo_masters.deleteMany()
      await this.prisma.kamoku_bunrui_masters.deleteMany()
      await this.prisma.kamoku_masters.deleteMany()
      await this.prisma.saimoku_masters.deleteMany()
      await importCsvToPrisma(this.prisma, 'seed/nendo_masters.csv')
      await importCsvToPrisma(this.prisma, 'seed/kamoku_bunrui_masters.csv')
      await importCsvToPrisma(this.prisma, 'seed/kamoku_masters.csv')
      await importCsvToPrisma(this.prisma, 'seed/saimoku_masters.csv')
    } catch (error) {
      console.error('Error setting up basic master data:', error)
      throw error
    }
  }

  async cleanup(): Promise<void> {
    await this.prisma.$disconnect()
  }
}
