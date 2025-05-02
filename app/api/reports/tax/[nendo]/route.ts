import { type NextRequest, NextResponse } from "next/server"

// 年度データのモック
const yearData = {
  "2021": {
    income: 3000000,
    expense: 2550000,
    profit: 450000,
    taxEstimates: {
      // 法人税関連
      corporateTax: 90000,
      localCorporateTax: 9270,
      totalCorporateTax: 99270,

      // 住民税関連
      prefecturalTax: 900,
      municipalTax: 5400,
      corporateInhabitantTaxPerCapita: 70000,
      totalInhabitantTax: 76300,

      // 事業税関連
      businessTax: 31500,
      specialLocalCorporateTax: 13608,
      totalBusinessTax: 45108,

      // 消費税関連
      consumptionTax: 300000,
      localConsumptionTax: 66000,
      totalConsumptionTax: 366000,

      // 合計
      total: 586678,
    },
    paymentSchedule: [
      {
        period: "2021年度確定申告",
        dueDate: "2022/3/15",
        taxType: "法人税",
        amount: 90000,
        status: "paid",
      },
      {
        period: "2021年度中間申告",
        dueDate: "2021/9/15",
        taxType: "法人税（中間）",
        amount: 45000,
        status: "paid",
      },
      {
        period: "2021年度確定申告",
        dueDate: "2022/3/31",
        taxType: "住民税",
        amount: 76300,
        status: "paid",
      },
      {
        period: "2021年度確定申告",
        dueDate: "2022/3/31",
        taxType: "事業税",
        amount: 45108,
        status: "paid",
      },
      {
        period: "2021年度確定申告",
        dueDate: "2022/3/31",
        taxType: "消費税",
        amount: 366000,
        status: "paid",
      },
      {
        period: "2021年度中間申告",
        dueDate: "2021/11/30",
        taxType: "消費税（中間）",
        amount: 183000,
        status: "paid",
      },
    ],
  },
  "2022": {
    income: 3600000,
    expense: 3000000,
    profit: 600000,
    taxEstimates: {
      // 法人税関連
      corporateTax: 120000,
      localCorporateTax: 12360,
      totalCorporateTax: 132360,

      // 住民税関連
      prefecturalTax: 1200,
      municipalTax: 7200,
      corporateInhabitantTaxPerCapita: 70000,
      totalInhabitantTax: 78400,

      // 事業税関連
      businessTax: 42000,
      specialLocalCorporateTax: 18144,
      totalBusinessTax: 60144,

      // 消費税関連
      consumptionTax: 360000,
      localConsumptionTax: 79200,
      totalConsumptionTax: 439200,

      // 合計
      total: 710104,
    },
    paymentSchedule: [
      {
        period: "2022年度確定申告",
        dueDate: "2023/3/15",
        taxType: "法人税",
        amount: 120000,
        status: "paid",
      },
      {
        period: "2022年度中間申告",
        dueDate: "2022/9/15",
        taxType: "法人税（中間）",
        amount: 60000,
        status: "paid",
      },
      {
        period: "2022年度確定申告",
        dueDate: "2023/3/31",
        taxType: "住民税",
        amount: 78400,
        status: "paid",
      },
      {
        period: "2022年度確定申告",
        dueDate: "2023/3/31",
        taxType: "事業税",
        amount: 60144,
        status: "paid",
      },
      {
        period: "2022年度確定申告",
        dueDate: "2023/3/31",
        taxType: "消費税",
        amount: 439200,
        status: "paid",
      },
      {
        period: "2022年度中間申告",
        dueDate: "2022/11/30",
        taxType: "消費税（中間）",
        amount: 219600,
        status: "paid",
      },
    ],
  },
  "2023": {
    income: 4200000,
    expense: 3480000,
    profit: 720000,
    taxEstimates: {
      // 法人税関連
      corporateTax: 144000,
      localCorporateTax: 14832,
      totalCorporateTax: 158832,

      // 住民税関連
      prefecturalTax: 1440,
      municipalTax: 8640,
      corporateInhabitantTaxPerCapita: 70000,
      totalInhabitantTax: 80080,

      // 事業税関連
      businessTax: 50400,
      specialLocalCorporateTax: 21773,
      totalBusinessTax: 72173,

      // 消費税関連
      consumptionTax: 420000,
      localConsumptionTax: 92400,
      totalConsumptionTax: 512400,

      // 合計
      total: 823485,
    },
    paymentSchedule: [
      {
        period: "2023年度確定申告",
        dueDate: "2024/3/15",
        taxType: "法人税",
        amount: 144000,
        status: "paid",
      },
      {
        period: "2023年度中間申告",
        dueDate: "2023/9/15",
        taxType: "法人税（中間）",
        amount: 72000,
        status: "paid",
      },
      {
        period: "2023年度確定申告",
        dueDate: "2024/3/31",
        taxType: "住民税",
        amount: 80080,
        status: "paid",
      },
      {
        period: "2023年度確定申告",
        dueDate: "2024/3/31",
        taxType: "事業税",
        amount: 72173,
        status: "paid",
      },
      {
        period: "2023年度確定申告",
        dueDate: "2024/3/31",
        taxType: "消費税",
        amount: 512400,
        status: "paid",
      },
      {
        period: "2023年度中間申告",
        dueDate: "2023/11/30",
        taxType: "消費税（中間）",
        amount: 256200,
        status: "paid",
      },
    ],
  },
  "2024": {
    income: 4800000,
    expense: 3960000,
    profit: 840000,
    taxEstimates: {
      // 法人税関連
      corporateTax: 168000,
      localCorporateTax: 17304,
      totalCorporateTax: 185304,

      // 住民税関連
      prefecturalTax: 1680,
      municipalTax: 10080,
      corporateInhabitantTaxPerCapita: 70000,
      totalInhabitantTax: 81760,

      // 事業税関連
      businessTax: 58800,
      specialLocalCorporateTax: 25402,
      totalBusinessTax: 84202,

      // 消費税関連
      consumptionTax: 480000,
      localConsumptionTax: 105600,
      totalConsumptionTax: 585600,

      // 合計
      total: 936866,
    },
    paymentSchedule: [
      {
        period: "2024年度確定申告",
        dueDate: "2025/3/15",
        taxType: "法人税",
        amount: 168000,
        status: "upcoming",
      },
      {
        period: "2024年度中間申告",
        dueDate: "2024/9/15",
        taxType: "法人税（中間）",
        amount: 84000,
        status: "upcoming",
      },
      {
        period: "2024年度確定申告",
        dueDate: "2025/3/31",
        taxType: "住民税",
        amount: 81760,
        status: "upcoming",
      },
      {
        period: "2024年度確定申告",
        dueDate: "2025/3/31",
        taxType: "事業税",
        amount: 84202,
        status: "upcoming",
      },
      {
        period: "2024年度確定申告",
        dueDate: "2025/3/31",
        taxType: "消費税",
        amount: 585600,
        status: "upcoming",
      },
      {
        period: "2024年度中間申告",
        dueDate: "2024/11/30",
        taxType: "消費税（中間）",
        amount: 292800,
        status: "upcoming",
      },
    ],
  },
  "2025": {
    income: 5400000,
    expense: 4320000,
    profit: 1080000,
    taxEstimates: {
      // 法人税関連
      corporateTax: 216000,
      localCorporateTax: 22248,
      totalCorporateTax: 238248,

      // 住民税関連
      prefecturalTax: 2160,
      municipalTax: 12960,
      corporateInhabitantTaxPerCapita: 70000,
      totalInhabitantTax: 85120,

      // 事業税関連
      businessTax: 75600,
      specialLocalCorporateTax: 32659,
      totalBusinessTax: 108259,

      // 消費税関連
      consumptionTax: 540000,
      localConsumptionTax: 118800,
      totalConsumptionTax: 658800,

      // 合計
      total: 1090427,
    },
    paymentSchedule: [
      {
        period: "2025年度確定申告",
        dueDate: "2026/3/15",
        taxType: "法人税",
        amount: 216000,
        status: "upcoming",
      },
      {
        period: "2025年度中間申告",
        dueDate: "2025/9/15",
        taxType: "法人税（中間）",
        amount: 108000,
        status: "upcoming",
      },
      {
        period: "2025年度確定申告",
        dueDate: "2026/3/31",
        taxType: "住民税",
        amount: 85120,
        status: "upcoming",
      },
      {
        period: "2025年度確定申告",
        dueDate: "2026/3/31",
        taxType: "事業税",
        amount: 108259,
        status: "upcoming",
      },
      {
        period: "2025年度確定申告",
        dueDate: "2026/3/31",
        taxType: "消費税",
        amount: 658800,
        status: "upcoming",
      },
      {
        period: "2025年度中間申告",
        dueDate: "2025/11/30",
        taxType: "消費税（中間）",
        amount: 329400,
        status: "upcoming",
      },
    ],
  },
}

// 税率設定のモック
const taxRates = {
  // 法人税関連
  corporateTaxRate: 23.2, // 基本税率
  localCorporateTaxRate: 10.3, // 地方法人税率

  // 住民税関連
  prefecturalTaxRate: 1.0, // 都道府県民税
  municipalTaxRate: 6.0, // 市町村民税
  corporateInhabitantTaxPerCapita: 70000, // 均等割額

  // 事業税関連
  businessTaxRate: 7.0, // 基本税率
  specialLocalCorporateTaxRate: 43.2, // 特別法人事業税率

  // 消費税
  consumptionTaxRate: 10.0, // 消費税率
  localConsumptionTaxRate: 2.2, // 地方消費税率
}

export async function GET(request: NextRequest, { params }: { params: { nendo: string } }) {
  // パスパラメータから年度を取得
  const year = params.nendo || "2024"

  // 指定された年度のデータを取得
  const data = yearData[year] || yearData["2024"]

  // 実際のAPIでは処理に時間がかかることを模擬するために遅延を追加
  await new Promise((resolve) => setTimeout(resolve, 500))

  // データを返す
  return NextResponse.json({
    yearData: data,
    taxRates: taxRates,
  })
}
