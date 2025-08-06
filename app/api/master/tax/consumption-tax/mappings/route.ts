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

// 勘定科目と消費税区分の関連付けの型定義
interface KamokuTaxMapping {
  id: string
  kamoku_cd: string
  tax_category_id: string
  is_default: boolean
  created_at: string
  updated_at: string
  valid_from: string // 有効期限（開始日）
  valid_to: string // 有効期限（終了日）
  kamoku_name?: string // 表示用
  tax_category?: TaxCategory // 表示用
}

// 勘定科目の簡易情報（関連付け表示用）
interface KamokuBasic {
  kamoku_cd: string
  kamoku_full_name: string
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

// 勘定科目の基本情報（表示用）
const kamokuBasicData: KamokuBasic[] = [
  { kamoku_cd: "101", kamoku_full_name: "現金" },
  { kamoku_cd: "102", kamoku_full_name: "普通預金" },
  { kamoku_cd: "103", kamoku_full_name: "売掛金" },
  { kamoku_cd: "201", kamoku_full_name: "買掛金" },
  { kamoku_cd: "202", kamoku_full_name: "未払金" },
  { kamoku_cd: "301", kamoku_full_name: "資本金" },
  { kamoku_cd: "401", kamoku_full_name: "売上高" },
  { kamoku_cd: "501", kamoku_full_name: "仕入高" },
  { kamoku_cd: "601", kamoku_full_name: "法人税等" },
  { kamoku_cd: "ZZ", kamoku_full_name: "繰越" },
]

// 勘定科目と消費税区分の関連付けデータ
const mappingData: KamokuTaxMapping[] = [
  {
    id: "1",
    kamoku_cd: "401",
    tax_category_id: "1",
    is_default: true,
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
    valid_from: "2019-10-01",
    valid_to: "",
  },
  {
    id: "2",
    kamoku_cd: "401",
    tax_category_id: "2",
    is_default: false,
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
    valid_from: "2019-10-01",
    valid_to: "",
  },
  {
    id: "3",
    kamoku_cd: "501",
    tax_category_id: "1",
    is_default: true,
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
    valid_from: "2019-10-01",
    valid_to: "",
  },
  {
    id: "4",
    kamoku_cd: "501",
    tax_category_id: "2",
    is_default: false,
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
    valid_from: "2019-10-01",
    valid_to: "",
  },
  {
    id: "5",
    kamoku_cd: "202",
    tax_category_id: "1",
    is_default: true,
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
    valid_from: "2019-10-01",
    valid_to: "",
  },
  {
    id: "6",
    kamoku_cd: "401",
    tax_category_id: "4",
    is_default: false,
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
    valid_from: "2019-10-01",
    valid_to: "",
  },
  {
    id: "7",
    kamoku_cd: "401",
    tax_category_id: "7",
    is_default: false,
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
  const kamokuCd = searchParams.get("kamoku_cd") || ""

  // 関連付けに関連情報を付与
  const mappingsWithDetails = mappingData.map((mapping) => {
    const kamoku = kamokuBasicData.find((k) => k.kamoku_cd === mapping.kamoku_cd)
    const taxCategory = taxCategoryData.find((t) => t.id === mapping.tax_category_id)
    return {
      ...mapping,
      kamoku_name: kamoku?.kamoku_full_name,
      tax_category: taxCategory,
    }
  })

  // フィルタリング
  let filteredMappings = mappingsWithDetails

  // 勘定科目コードでフィルタリング
  if (kamokuCd) {
    filteredMappings = filteredMappings.filter((mapping) => mapping.kamoku_cd === kamokuCd)
  }

  // 検索語でフィルタリング
  if (searchTerm) {
    const term = searchTerm.toLowerCase()
    filteredMappings = filteredMappings.filter(
      (mapping) =>
        mapping.kamoku_cd.toLowerCase().includes(term) ||
        mapping.kamoku_name?.toLowerCase().includes(term) ||
        mapping.tax_category?.name.toLowerCase().includes(term),
    )
  }

  // 実際のAPIでは処理に時間がかかることを模擬するために遅延を追加
  await new Promise((resolve) => setTimeout(resolve, 300))

  // データを返す
  return NextResponse.json({
    kamokuTaxMappings: filteredMappings,
    // 関連付け作成時に必要な情報も提供
    availableKamoku: kamokuBasicData,
    availableTaxCategories: taxCategoryData,
  })
}

// POST メソッドの実装（新規作成）
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // バリデーション
    if (!data.kamoku_cd || !data.tax_category_id || !data.valid_from) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 })
    }

    // 既存の関連付けをチェック（同じ勘定科目と消費税区分の組み合わせが既に存在するか）
    const existingMapping = mappingData.find(
      (m) =>
        m.kamoku_cd === data.kamoku_cd &&
        m.tax_category_id === data.tax_category_id &&
        ((m.valid_to === "" && data.valid_to === "") ||
          (new Date(m.valid_from) <= new Date(data.valid_to) &&
            (m.valid_to === "" || new Date(m.valid_to) >= new Date(data.valid_from)))),
    )

    if (existingMapping) {
      return NextResponse.json({ error: "同じ勘定科目と消費税区分の組み合わせが既に存在します" }, { status: 409 })
    }

    // 新規IDの生成（実際の実装ではDBが自動生成する）
    const newId = (Math.max(...mappingData.map((item) => Number.parseInt(item.id))) + 1).toString()

    // 新しい関連付けを作成
    const newMapping: KamokuTaxMapping = {
      id: newId,
      kamoku_cd: data.kamoku_cd,
      tax_category_id: data.tax_category_id,
      is_default: data.is_default || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      valid_from: data.valid_from,
      valid_to: data.valid_to || "",
    }

    // 実際の実装ではDBに保存する
    // mappingData.push(newMapping)

    // 関連情報を付与して返す
    const kamoku = kamokuBasicData.find((k) => k.kamoku_cd === newMapping.kamoku_cd)
    const taxCategory = taxCategoryData.find((t) => t.id === newMapping.tax_category_id)
    const mappingWithDetails = {
      ...newMapping,
      kamoku_name: kamoku?.kamoku_full_name,
      tax_category: taxCategory,
    }

    return NextResponse.json({ message: "消費税関連付けを作成しました", mapping: mappingWithDetails }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "消費税関連付けの作成に失敗しました" }, { status: 500 })
  }
}
