import { parse } from 'csv-parse/sync'
import fs from 'fs'
import path from 'path'

import { prisma } from '@/lib/db/prisma'
import { Connection } from '@/lib/types'

/**
 * 呼び出し元のファイルパスを取得する関数
 */
function getCallerFilePath() {
  const oldLimit = Error.stackTraceLimit
  Error.stackTraceLimit = 3

  const stack = new Error().stack || ''
  Error.stackTraceLimit = oldLimit

  const stackLines = stack.split('\n')
  return stackLines[3].split('at ')[1]
}

async function readCsvFile<T = any>(filePath: string): Promise<T[]> {
  const csvData = fs.readFileSync(filePath, 'utf8')
  return parse(csvData, { columns: true, skip_empty_lines: true }) as T[]
}

export function withTransactionForTest(
  filenames: string[],
  testFn: (tx: Connection) => Promise<void>,
) {
  const callerFilePath = getCallerFilePath()
  const testDir = path.dirname(callerFilePath)

  return async () => {
    try {
      await prisma.$transaction(async (tx) => {
        // 指定されたファイル/ディレクトリを処理
        const csvFilesToLoad: string[] = []

        for (const name of filenames) {
          const fullPath = path.join(testDir, name)

          try {
            // ディレクトリかファイルかをチェック
            const stats = fs.statSync(fullPath)

            if (stats.isDirectory()) {
              // ディレクトリの場合、その中のCSVファイルをすべて取得
              const files = fs
                .readdirSync(fullPath)
                .filter((file) => file.endsWith('.csv'))
                .map((file) => path.join(name, file)) // 相対パスを保持

              csvFilesToLoad.push(...files)
            } else if (stats.isFile() && name.endsWith('.csv')) {
              // 単一のCSVファイル
              csvFilesToLoad.push(name)
            }
          } catch (error) {
            console.error(
              `ファイルまたはディレクトリの読み込みエラー: ${fullPath}`,
              error,
            )
          }
        }

        // 収集したCSVファイルを読み込み
        for (const csvFile of csvFilesToLoad) {
          const fullPath = path.join(testDir, csvFile)

          // CSVデータをロード
          await importCsvToPrisma(tx, fullPath)
        }

        // テスト関数を実行
        await testFn(tx)
        throw 'rollback'
      })
    } catch (error) {
      if (error !== 'rollback') {
        throw error
      }
    }
  }
}

/**
 * Prismaメタデータから型マップを取得する関数
 */
function getTypeMapFromPrisma(tableName: string): {
  [key: string]: 'string' | 'number' | 'boolean' | 'date' | 'json'
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
  const typeMap: {
    [key: string]: 'string' | 'number' | 'boolean' | 'date' | 'json'
  } = {}
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
    } else if (field.type === 'Json' || field.type === 'Jsonb') {
      typeMap[field.name] = 'json'
    }
    // 他は文字列型として扱う（変換不要）
  }

  return typeMap
}

/**
 * CSVファイルからデータを読み込み指定されたテーブルに挿入
 */
export async function importCsvToPrisma(
  prisma: any,
  csvPath: string,
): Promise<void> {
  const tableName = path.basename(csvPath, '.csv')
  const records = await readCsvFile(csvPath)

  // 型変換を適用
  let convertedRecords = records

  // 指定されたtypeMapがある場合はそれを使用、なければPrismaから自動取得
  const fieldTypeMap = getTypeMapFromPrisma(tableName)

  convertedRecords = records.map((record: any) => {
    const newRecord = { ...record }
    for (const [key, type] of Object.entries(fieldTypeMap)) {
      // 空文字列をSQL NULLとして扱う（フィールドを削除）
      if (newRecord[key] === '') {
        delete newRecord[key] // SQL NULLとして扱うためにフィールドを削除
        continue
      }

      // undefinedでなく、nullでもない場合に型変換を適用
      if (newRecord[key] !== undefined && newRecord[key] !== null) {
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
          case 'json':
            try {
              // 文字列の"null"の場合はJSONのnull値として扱う
              if (newRecord[key] === 'null') {
                newRecord[key] = null
              } else {
                // それ以外はJSONとしてパース
                newRecord[key] = JSON.parse(newRecord[key])
              }
            } catch (error) {
              console.error(`JSON解析エラー (${key}): ${error}`)
              // 解析エラーの場合はnullとして扱う
              newRecord[key] = null
            }
            break
          // stringの場合は変換不要
        }
      }
    }
    return newRecord
  })

  // Prismaの動的テーブルアクセス
  // @ts-ignore - 動的プロパティアクセス
  await prisma[tableName].createMany({
    data: convertedRecords,
  })
}
