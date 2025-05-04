import { parse } from 'csv-parse/sync'
import fs from 'fs'
import path from 'path'

import { PrismaClient } from '@prisma/client'

/**
 * トランザクション内でテストを実行するためのデコレータ
 * 各テストは独立したトランザクション内で実行され、テスト終了時に自動的にロールバックされる
 */
export function TestInTransaction() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const prisma = new PrismaClient()

      try {
        return await prisma.$transaction(async (tx) => {
          // 元のテストメソッドをトランザクション内で実行
          return await originalMethod.apply(this, [tx, ...args])
        })
      } finally {
        await prisma.$disconnect()
      }
    }

    return descriptor
  }
}

/**
 * CSVデータをロードするためのデコレータ
 * 指定されたCSVファイルをテスト前に自動的にロード
 */
export function WithCsvData(
  csvFiles:
    | string[]
    | {
        path: string
        table?: string
        transform?: (record: any) => any
        typeMap?: { [key: string]: 'string' | 'number' | 'boolean' | 'date' }
      }[],
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const prisma = new PrismaClient()

      try {
        return await prisma.$transaction(async (tx) => {
          // 指定されたCSVファイルをロード
          for (const file of csvFiles) {
            if (typeof file === 'string') {
              await importCsvToPrisma(tx, getTableNameFromCsv(file), file)
            } else {
              const { path: filePath, table, transform, typeMap } = file
              await importCsvToPrisma(
                tx,
                table || getTableNameFromCsv(filePath),
                filePath,
                transform,
                typeMap,
              )
            }
          }

          // 元のテストメソッドを実行
          return await originalMethod.apply(this, [tx, ...args])
        })
      } finally {
        await prisma.$disconnect()
      }
    }

    return descriptor
  }
}

/**
 * Prismaメタデータから型マップを取得する関数
 */
function getTypeMapFromPrisma(
  prisma: any,
  tableName: string,
): { [key: string]: 'string' | 'number' | 'boolean' | 'date' } {
  // インスタンスではなくPrismaクラスから直接DMMFにアクセス
  // @ts-ignore - Prismaは@prisma/clientからインポートされていないため
  const dmmf = require('@prisma/client').Prisma.dmmf

  // テーブル名からモデルを特定（dbNameがnullの場合もあるので処理を調整）
  const model = dmmf.datamodel.models.find(
    (m: any) =>
      m.dbName === tableName ||
      m.name.toLowerCase() === tableName.toLowerCase(),
  )

  if (!model) {
    throw new Error(`テーブル '${tableName}' に対応するモデルが見つかりません`)
  }

  // フィールドの型情報からTypeMapを構築
  const typeMap: { [key: string]: 'string' | 'number' | 'boolean' | 'date' } =
    {}
  for (const field of model.fields) {
    // Prismaの型情報をCSVヘルパーの型に変換
    if (
      field.type === 'Int' ||
      field.type === 'Float' ||
      field.type === 'Decimal'
    ) {
      typeMap[field.name] = 'number'
    } else if (field.type === 'Boolean') {
      typeMap[field.name] = 'boolean'
    } else if (field.type === 'DateTime') {
      typeMap[field.name] = 'date'
    }
    // 他は文字列型として扱う（変換不要）
  }

  return typeMap
}

/**
 * CSVファイルを読み込んでPrismaを使ってデータベースに挿入する関数
 */
async function importCsvToPrisma<T>(
  prisma: any,
  tableName: string,
  csvPath: string,
  transformFn?: (record: any) => any,
  typeMap?: { [key: string]: 'string' | 'number' | 'boolean' | 'date' },
): Promise<T[]> {
  // CSVファイルを読み込む
  const csvData = fs.readFileSync(path.join(process.cwd(), csvPath), 'utf8')
  const records = parse(csvData, { columns: true, skip_empty_lines: true })

  // 型変換を適用
  let convertedRecords = records

  // 指定されたtypeMapがある場合はそれを使用、なければPrismaから自動取得
  const fieldTypeMap = typeMap || getTypeMapFromPrisma(prisma, tableName)

  convertedRecords = records.map((record: any) => {
    const newRecord = { ...record }
    for (const [key, type] of Object.entries(fieldTypeMap)) {
      if (newRecord[key] !== undefined) {
        switch (type) {
          case 'number':
            newRecord[key] = Number(newRecord[key])
            break
          case 'boolean':
            newRecord[key] = newRecord[key] === 'true' || newRecord[key] === '1'
            break
          case 'date':
            newRecord[key] = new Date(newRecord[key])
            break
          // stringの場合は変換不要
        }
      }
    }
    return newRecord
  })

  // 必要に応じてデータを変換
  const data = transformFn
    ? convertedRecords.map(transformFn)
    : convertedRecords

  // Prismaの動的テーブルアクセス
  // @ts-ignore - 動的プロパティアクセス
  const result = await prisma[tableName].createMany({
    data,
    skipDuplicates: true,
  })

  console.log(
    `${result.count} records imported to ${tableName} from ${csvPath}`,
  )
  return data
}

/**
 * CSVファイル名からテーブル名を推測するヘルパー関数
 */
function getTableNameFromCsv(csvPath: string): string {
  const filename = csvPath.split('/').pop()?.replace('.csv', '') || ''
  return filename.includes('_') ? filename : `${filename}_masters`
}

/**
 * テスト用の便利なユーティリティを提供するベースクラス
 */
export class TestBase {
  /**
   * Jestの検証関数を使用しやすくするためのラッパー
   */
  expect<T>(actual: T) {
    return expect(actual)
  }
}
