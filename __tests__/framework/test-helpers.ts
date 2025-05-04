import { parse } from 'csv-parse/sync'
import fs from 'fs'
import path from 'path'

import { PrismaClient } from '@prisma/client'

import type { Connection } from '@/lib/types'

/**
 * トランザクション内でテストを実行するラッパー関数
 */
export function withTransaction(testFn: (tx: Connection) => Promise<void>) {
  return async () => {
    const prisma = new PrismaClient()

    try {
      await prisma.$transaction(async (tx) => {
        await testFn(tx)
      })
    } finally {
      await prisma.$disconnect()
    }
  }
}

/**
 * CSVファイル名からテーブル名を推測するヘルパー関数
 */
function getTableNameFromCsv(csvPath: string): string {
  const filename = csvPath.split('/').pop()?.replace('.csv', '') || ''
  return filename.includes('_') ? filename : `${filename}_masters`
}

/**
 * CSVファイルを読み込みJavaScriptオブジェクトの配列に変換
 */
async function readCsvFile<T = any>(filePath: string): Promise<T[]> {
  const csvPath = path.join(process.cwd(), filePath)
  const csvData = fs.readFileSync(csvPath, 'utf8')
  return parse(csvData, { columns: true, skip_empty_lines: true }) as T[]
}

/**
 * Prismaメタデータから型マップを取得する関数
 */
function getTypeMapFromPrisma(tableName: string): {
  [key: string]: 'string' | 'number' | 'boolean' | 'date'
} {
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
 * CSVファイルからデータを読み込み指定されたテーブルに挿入
 */
async function importCsvToPrisma<T>(
  prisma: any,
  tableName: string,
  csvPath: string,
  transformFn?: (record: any) => any,
  typeMap?: { [key: string]: 'string' | 'number' | 'boolean' | 'date' },
): Promise<T[]> {
  // CSVファイルを読み込む
  const records = await readCsvFile(csvPath)

  // 型変換を適用
  let convertedRecords = records

  // 指定されたtypeMapがある場合はそれを使用、なければPrismaから自動取得
  const fieldTypeMap = typeMap || getTypeMapFromPrisma(tableName)

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

  // データを変換（オプション）
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
  return data as T[]
}

/**
 * CSVデータをロードしてテストを実行するラッパー関数
 */
export function withCsvData(
  csvFiles:
    | string[]
    | {
        path: string
        table?: string
        transform?: (record: any) => any
        typeMap?: { [key: string]: 'string' | 'number' | 'boolean' | 'date' }
      }[],
  testFn: (tx: Connection) => Promise<void>,
) {
  return async () => {
    const prisma = new PrismaClient()

    try {
      await prisma.$transaction(async (tx) => {
        // CSVファイルのロード
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

        // テスト関数を実行
        await testFn(tx)
      })
    } finally {
      await prisma.$disconnect()
    }
  }
}

/**
 * 便利なアサーション関数
 */
export const expectExt = {
  toHaveLength: (actual: any[], expected: number) => {
    expect(actual).toHaveLength(expected)
  },
  // 他にも必要なカスタムアサーション
}
