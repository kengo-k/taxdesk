import { type NextRequest, NextResponse } from 'next/server'

// 勘定科目別レコード件数の型定義
interface AccountCount {
  accountCode: string // 科目コード
  accountName: string // 科目名
  count: number // この科目の総取引件数
}

// 年度ごとにハードコードされた勘定科目別件数データ
const accountCountsByYear: Record<string, AccountCount[]> = {
  '2021': [
    { accountCode: 'A11', accountName: '現金', count: 32 },
    { accountCode: 'A21', accountName: 'ゆうちょ', count: 65 },
    { accountCode: 'A31', accountName: '売掛金(CCT)', count: 28 },
    { accountCode: 'B11', accountName: '未払給与', count: 22 },
    { accountCode: 'B12', accountName: '未払経費', count: 15 },
    { accountCode: 'B13', accountName: '未払税', count: 3 },
    { accountCode: 'C11', accountName: '資本金', count: 42 },
    { accountCode: 'D11', accountName: '売上', count: 38 },
    { accountCode: 'XX1', accountName: '法人税', count: 0 },
    { accountCode: 'ZZZ', accountName: '繰越', count: 2 },
  ],
  '2022': [
    { accountCode: 'A11', accountName: '現金', count: 38 },
    { accountCode: 'A21', accountName: 'ゆうちょ', count: 72 },
    { accountCode: 'A31', accountName: '売掛金(CCT)', count: 35 },
    { accountCode: 'B11', accountName: '未払給与', count: 27 },
    { accountCode: 'B12', accountName: '未払経費', count: 18 },
    { accountCode: 'B13', accountName: '未払税', count: 2 },
    { accountCode: 'C11', accountName: '資本金', count: 48 },
    { accountCode: 'D11', accountName: '売上', count: 43 },
    { accountCode: 'XX1', accountName: '法人税', count: 0 },
    { accountCode: 'ZZZ', accountName: '繰越', count: 2 },
  ],
  '2023': [
    { accountCode: 'A11', accountName: '現金', count: 45 },
    { accountCode: 'A21', accountName: 'ゆうちょ', count: 85 },
    { accountCode: 'A31', accountName: '売掛金(CCT)', count: 42 },
    { accountCode: 'B11', accountName: '未払給与', count: 33 },
    { accountCode: 'B12', accountName: '未払経費', count: 22 },
    { accountCode: 'B13', accountName: '未払税', count: 1 },
    { accountCode: 'C11', accountName: '資本金', count: 56 },
    { accountCode: 'D11', accountName: '売上', count: 51 },
    { accountCode: 'XX1', accountName: '法人税', count: 0 },
    { accountCode: 'ZZZ', accountName: '繰越', count: 2 },
  ],
  '2024': [
    { accountCode: 'A11', accountName: '現金', count: 53 },
    { accountCode: 'A21', accountName: 'ゆうちょ', count: 97 },
    { accountCode: 'A31', accountName: '売掛金(CCT)', count: 48 },
    { accountCode: 'B11', accountName: '未払給与', count: 39 },
    { accountCode: 'B12', accountName: '未払経費', count: 26 },
    { accountCode: 'B13', accountName: '未払税', count: 2 },
    { accountCode: 'C11', accountName: '資本金', count: 67 },
    { accountCode: 'D11', accountName: '売上', count: 59 },
    { accountCode: 'XX1', accountName: '法人税', count: 0 },
    { accountCode: 'ZZZ', accountName: '繰越', count: 2 },
  ],
  '2025': [
    { accountCode: 'A11', accountName: '現金', count: 61 },
    { accountCode: 'A21', accountName: 'ゆうちょ', count: 108 },
    { accountCode: 'A31', accountName: '売掛金(CCT)', count: 55 },
    { accountCode: 'B11', accountName: '未払給与', count: 45 },
    { accountCode: 'B12', accountName: '未払経費', count: 31 },
    { accountCode: 'B13', accountName: '未払税', count: 1 },
    { accountCode: 'C11', accountName: '資本金', count: 78 },
    { accountCode: 'D11', accountName: '売上', count: 68 },
    { accountCode: 'XX1', accountName: '法人税', count: 0 },
    { accountCode: 'ZZZ', accountName: '繰越', count: 2 },
  ],
}

export async function GET(
  request: NextRequest,
  { params }: { params: { year: string } },
) {
  // 年度パラメータを取得
  const { year } = params

  // 指定された年度のデータを取得（存在しない場合は空配列）
  const accountCounts = accountCountsByYear[year] || []

  // 実際のAPIでは処理に時間がかかることを模擬するために遅延を追加
  await new Promise((resolve) => setTimeout(resolve, 300))

  // データを返す
  return NextResponse.json({
    year,
    accountCounts,
  })
}
