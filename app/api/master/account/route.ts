import { type NextRequest, NextResponse } from "next/server"

// 勘定科目分類の型定義
interface KamokuBunrui {
  id: string
  kamoku_bunrui_cd: string
  kamoku_bunrui_name: string
  kamoku_bunrui_type: string
  kurikoshi_flg: string
  created_at: string
  updated_at: string
}

// 勘定科目の型定義
interface Kamoku {
  id: string
  kamoku_cd: string
  kamoku_full_name: string
  kamoku_ryaku_name: string
  kamoku_kana_name: string
  kamoku_bunrui_cd: string
  description: string
  created_at: string
  updated_at: string
  bunrui?: KamokuBunrui // 表示用に分類情報を保持
  saimokuList?: Saimoku[] // 紐づく細目リスト
}

// 細目の型定義
interface Saimoku {
  id: string
  kamoku_cd: string
  saimoku_cd: string
  saimoku_full_name: string
  saimoku_ryaku_name: string
  saimoku_kana_name: string
  description: string
  created_at: string
  updated_at: string
  transaction: string
  valid_from: string // 有効期限（開始日）
  valid_to: string // 有効期限（終了日）
}

// モックデータ
const bunruiData: KamokuBunrui[] = [
  {
    id: "1",
    kamoku_bunrui_cd: "1",
    kamoku_bunrui_name: "資産",
    kamoku_bunrui_type: "A",
    kurikoshi_flg: "1",
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
  },
  {
    id: "2",
    kamoku_bunrui_cd: "2",
    kamoku_bunrui_name: "負債",
    kamoku_bunrui_type: "L",
    kurikoshi_flg: "1",
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
  },
  {
    id: "3",
    kamoku_bunrui_cd: "3",
    kamoku_bunrui_name: "純資産",
    kamoku_bunrui_type: "L",
    kurikoshi_flg: "1",
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
  },
  {
    id: "4",
    kamoku_bunrui_cd: "4",
    kamoku_bunrui_name: "収益",
    kamoku_bunrui_type: "R",
    kurikoshi_flg: "0",
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
  },
  {
    id: "5",
    kamoku_bunrui_cd: "5",
    kamoku_bunrui_name: "費用",
    kamoku_bunrui_type: "E",
    kurikoshi_flg: "0",
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
  },
  {
    id: "6",
    kamoku_bunrui_cd: "6",
    kamoku_bunrui_name: "税金",
    kamoku_bunrui_type: "E",
    kurikoshi_flg: "0",
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
  },
  {
    id: "9",
    kamoku_bunrui_cd: "Z",
    kamoku_bunrui_name: "その他",
    kamoku_bunrui_type: "Z",
    kurikoshi_flg: "0",
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
  },
]

const kamokuData: Kamoku[] = [
  {
    id: "1",
    kamoku_cd: "101",
    kamoku_full_name: "現金",
    kamoku_ryaku_name: "現金",
    kamoku_kana_name: "genkin",
    kamoku_bunrui_cd: "1",
    description: "手元にある現金",
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
  },
  {
    id: "2",
    kamoku_cd: "102",
    kamoku_full_name: "普通預金",
    kamoku_ryaku_name: "普通預金",
    kamoku_kana_name: "futsuuyokin",
    kamoku_bunrui_cd: "1",
    description: "銀行の普通預金口座の残高",
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
  },
  {
    id: "3",
    kamoku_cd: "103",
    kamoku_full_name: "売掛金",
    kamoku_ryaku_name: "売掛金",
    kamoku_kana_name: "urikakekin",
    kamoku_bunrui_cd: "1",
    description: "商品・サービスを販売した際の未回収金額",
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
  },
  {
    id: "4",
    kamoku_cd: "201",
    kamoku_full_name: "買掛金",
    kamoku_ryaku_name: "買掛金",
    kamoku_kana_name: "kaikakekin",
    kamoku_bunrui_cd: "2",
    description: "商品・サービスを仕入れた際の未払金額",
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
  },
  {
    id: "5",
    kamoku_cd: "202",
    kamoku_full_name: "未払金",
    kamoku_ryaku_name: "未払金",
    kamoku_kana_name: "miharaikin",
    kamoku_bunrui_cd: "2",
    description: "商品・サービス以外の未払金額",
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
  },
  {
    id: "6",
    kamoku_cd: "301",
    kamoku_full_name: "資本金",
    kamoku_ryaku_name: "資本金",
    kamoku_kana_name: "shihonkin",
    kamoku_bunrui_cd: "3",
    description: "会社設立時や増資時に出資された金額",
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
  },
  {
    id: "7",
    kamoku_cd: "401",
    kamoku_full_name: "売上高",
    kamoku_ryaku_name: "売上",
    kamoku_kana_name: "uriage",
    kamoku_bunrui_cd: "4",
    description: "商品・サービスの販売による収益",
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
  },
  {
    id: "8",
    kamoku_cd: "501",
    kamoku_full_name: "仕入高",
    kamoku_ryaku_name: "仕入",
    kamoku_kana_name: "shiire",
    kamoku_bunrui_cd: "5",
    description: "商品・サービスの仕入による費用",
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
  },
  {
    id: "9",
    kamoku_cd: "601",
    kamoku_full_name: "法人税等",
    kamoku_ryaku_name: "法人税",
    kamoku_kana_name: "houjinzei",
    kamoku_bunrui_cd: "6",
    description: "法人の所得に対する税金",
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
  },
  {
    id: "99",
    kamoku_cd: "ZZ",
    kamoku_full_name: "繰越",
    kamoku_ryaku_name: "繰越",
    kamoku_kana_name: "kurikoshi",
    kamoku_bunrui_cd: "Z",
    description: "残高を翌年に繰り越す際の仕訳に使用する相手方の科目",
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
  },
]

const saimokuData: Saimoku[] = [
  {
    id: "1",
    kamoku_cd: "102",
    saimoku_cd: "001",
    saimoku_full_name: "三菱UFJ銀行",
    saimoku_ryaku_name: "三菱UFJ",
    saimoku_kana_name: "mitsubishi",
    description: "三菱UFJ銀行の普通預金口座",
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
    transaction: '["2000-01-01 00:00:00+00",)',
    valid_from: "2021-04-01",
    valid_to: "",
  },
  {
    id: "2",
    kamoku_cd: "102",
    saimoku_cd: "002",
    saimoku_full_name: "みずほ銀行",
    saimoku_ryaku_name: "みずほ",
    saimoku_kana_name: "mizuho",
    description: "みずほ銀行の普通預金口座",
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
    transaction: '["2000-01-01 00:00:00+00",)',
    valid_from: "2021-04-01",
    valid_to: "",
  },
  {
    id: "3",
    kamoku_cd: "102",
    saimoku_cd: "003",
    saimoku_full_name: "三井住友銀行",
    saimoku_ryaku_name: "三井住友",
    saimoku_kana_name: "mitsui",
    description: "三井住友銀行の普通預金口座",
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
    transaction: '["2000-01-01 00:00:00+00",)',
    valid_from: "2021-04-01",
    valid_to: "2023-12-31",
  },
  {
    id: "4",
    kamoku_cd: "401",
    saimoku_cd: "001",
    saimoku_full_name: "商品売上",
    saimoku_ryaku_name: "商品売上",
    saimoku_kana_name: "shouhin",
    description: "商品の販売による売上",
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
    transaction: '["2000-01-01 00:00:00+00",)',
    valid_from: "2021-04-01",
    valid_to: "",
  },
  {
    id: "5",
    kamoku_cd: "401",
    saimoku_cd: "002",
    saimoku_full_name: "サービス売上",
    saimoku_ryaku_name: "サービス売上",
    saimoku_kana_name: "service",
    description: "サービスの提供による売上",
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
    transaction: '["2000-01-01 00:00:00+00",)',
    valid_from: "2022-01-01",
    valid_to: "",
  },
  {
    id: "6",
    kamoku_cd: "501",
    saimoku_cd: "001",
    saimoku_full_name: "商品仕入",
    saimoku_ryaku_name: "商品仕入",
    saimoku_kana_name: "shouhin",
    description: "商品の仕入による費用",
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
    transaction: '["2000-01-01 00:00:00+00",)',
    valid_from: "2021-04-01",
    valid_to: "",
  },
  {
    id: "99",
    kamoku_cd: "ZZ",
    saimoku_cd: "ZZZ",
    saimoku_full_name: "繰越",
    saimoku_ryaku_name: "繰越",
    saimoku_kana_name: "kurikoshi",
    description: "残高を翌年に繰り越す際の仕訳に使用する相手方の科目",
    created_at: "2021-03-21 00:00:00",
    updated_at: "2021-03-21 00:00:00",
    transaction: '["2000-01-01 00:00:00+00",)',
    valid_from: "2021-04-01",
    valid_to: "",
  },
]

export async function GET(request: NextRequest) {
  // クエリパラメータを取得
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get("type") || "all"
  const searchTerm = searchParams.get("search") || ""
  const filterBunrui = searchParams.get("filterBunrui") || ""

  // 勘定科目に分類情報を付与
  const kamokuWithBunrui = kamokuData.map((kamoku) => {
    const bunrui = bunruiData.find((b) => b.kamoku_bunrui_cd === kamoku.kamoku_bunrui_cd)
    const relatedSaimoku = saimokuData.filter((s) => s.kamoku_cd === kamoku.kamoku_cd)
    return { ...kamoku, bunrui, saimokuList: relatedSaimoku }
  })

  // 実際のAPIでは処理に時間がかかることを模擬するために遅延を追加
  await new Promise((resolve) => setTimeout(resolve, 500))

  // データを返す
  return NextResponse.json({
    bunruiList: bunruiData,
    kamokuList: kamokuWithBunrui,
    saimokuList: saimokuData,
  })
}
