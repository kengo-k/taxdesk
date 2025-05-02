import { type NextRequest, NextResponse } from "next/server"

// 消費税区分の型定義
interface TaxCategory {
  id: string
  code: string
  name: string
  description: string
  tax_rate: number
  is_reduced_tax: boolean
  is_taxable: boolean
  is_deductible: boolean
  created_at: string
  updated_at: string
  valid_from: string // 有効期限（開始日）
  valid_to: string // 有効期限（終了日）
}

// 消費税区分データ
const taxCategoryData: TaxCategory[] = [
  {
    id: "1",
    code: "TAXABLE_10",
    name: "課税（標準税率10%）",
    description: "標準税率10%が適用される課税取引",
    tax_rate: 10,
    is_reduced_tax: false,
    is_taxable: true,
    is_deductible: true,
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
    valid_from: "2019-10-01",
    valid_to: "",
  },
  {
    id: "2",
    code: "TAXABLE_8",
    name: "課税（軽減税率8%）",
    description: "軽減税率8%が適用される課税取引（食料品等）",
    tax_rate: 8,
    is_reduced_tax: true,
    is_taxable: true,
    is_deductible: true,
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
    valid_from: "2019-10-01",
    valid_to: "",
  },
  {
    id: "3",
    code: "NON_TAXABLE",
    name: "非課税",
    description: "消費税が課税されない取引（医療費、教育費等）",
    tax_rate: 0,
    is_reduced_tax: false,
    is_taxable: false,
    is_deductible: false,
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
    valid_from: "2019-10-01",
    valid_to: "",
  },
  {
    id: "4",
    code: "EXEMPT",
    name: "免税",
    description: "輸出取引等の免税取引",
    tax_rate: 0,
    is_reduced_tax: false,
    is_taxable: false,
    is_deductible: true,
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
    valid_from: "2019-10-01",
    valid_to: "",
  },
  {
    id: "5",
    code: "OUT_OF_SCOPE",
    name: "対象外",
    description: "消費税の課税対象外の取引",
    tax_rate: 0,
    is_reduced_tax: false,
    is_taxable: false,
    is_deductible: false,
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
    valid_from: "2019-10-01",
    valid_to: "",
  },
  {
    id: "6",
    code: "TAXABLE_5",
    name: "課税（旧税率5%）",
    description: "2014年3月以前の税率5%が適用される取引",
    tax_rate: 5,
    is_reduced_tax: false,
    is_taxable: true,
    is_deductible: true,
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
    valid_from: "2000-01-01",
    valid_to: "2014-03-31",
  },
  {
    id: "7",
    code: "TAXABLE_8_OLD",
    name: "課税（旧税率8%）",
    description: "2014年4月から2019年9月までの税率8%が適用される取引",
    tax_rate: 8,
    is_reduced_tax: false,
    is_taxable: true,
    is_deductible: true,
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
    valid_from: "2014-04-01",
    valid_to: "2019-09-30",
  },
]

export async function GET(request: NextRequest) {
  // クエリパラメータを取得
  const searchParams = request.nextUrl.searchParams
  const searchTerm = searchParams.get("search") || ""

  // 検索フィルタリング
  let filteredCategories = taxCategoryData
  if (searchTerm) {
    const term = searchTerm.toLowerCase()
    filteredCategories = filteredCategories.filter(
      (category) =>
        category.code.toLowerCase().includes(term) ||
        category.name.toLowerCase().includes(term) ||
        category.description.toLowerCase().includes(term),
    )
  }

  // 実際のAPIでは処理に時間がかかることを模擬するために遅延を追加
  await new Promise((resolve) => setTimeout(resolve, 300))

  // データを返す
  return NextResponse.json({
    taxCategories: filteredCategories,
  })
}

// POST メソッドの実装（新規作成）
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // バリデーション
    if (!data.code || !data.name || !data.valid_from) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 })
    }

    // 新規IDの生成（実際の実装ではDBが自動生成する）
    const newId = (Math.max(...taxCategoryData.map((item) => Number.parseInt(item.id))) + 1).toString()

    // 新しい消費税区分を作成
    const newCategory: TaxCategory = {
      id: newId,
      code: data.code,
      name: data.name,
      description: data.description || "",
      tax_rate: data.tax_rate || 0,
      is_reduced_tax: data.is_reduced_tax || false,
      is_taxable: data.is_taxable || false,
      is_deductible: data.is_deductible || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      valid_from: data.valid_from,
      valid_to: data.valid_to || "",
    }

    // 実際の実装ではDBに保存する
    // taxCategoryData.push(newCategory)

    return NextResponse.json({ message: "消費税区分を作成しました", category: newCategory }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "消費税区分の作成に失敗しました" }, { status: 500 })
  }
}
