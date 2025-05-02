import { type NextRequest, NextResponse } from "next/server"

// 年度データのモック
const yearData = {
  "2022": {
    // 現金残高の内訳
    cashBalanceTotal: 850000000,
    cashBalanceData: [50, 30, 20],
    cashBalanceLabels: ["三菱UFJ銀行", "みずほ銀行", "三井住友銀行"],
    cashBalanceAmounts: [425000000, 255000000, 170000000],
    cashBalanceColors: ["#1e40af", "#3b82f6", "#60a5fa"],

    // 収入の内訳
    incomeTotal: 3600000,
    incomeData: [45, 35, 20],
    incomeLabels: ["A社", "B社", "C社"],
    incomeAmounts: [1620000, 1260000, 720000],
    incomeColors: ["#047857", "#10b981", "#34d399"],

    // 支出の内訳
    expenseTotal: 3000000,
    expenseData: [35, 25, 20, 10, 10],
    expenseLabels: ["役員報酬", "地代家賃", "消耗品費", "福利厚生費", "通信費"],
    expenseAmounts: [1050000, 750000, 600000, 300000, 300000],
    expenseColors: ["#b45309", "#d97706", "#f59e0b", "#fbbf24", "#fcd34d"],

    // 月別収入データ（4月始まり）
    monthlyIncomeData: {
      labels: ["4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月"],
      datasets: [
        {
          label: "A社",
          data: [130000, 135000, 140000, 145000, 150000, 155000, 160000, 165000, 170000, 120000, 125000, 130000],
          backgroundColor: "#047857",
        },
        {
          label: "B社",
          data: [105000, 110000, 115000, 120000, 125000, 130000, 135000, 140000, 145000, 100000, 105000, 110000],
          backgroundColor: "#10b981",
        },
        {
          label: "C社",
          data: [60000, 65000, 70000, 75000, 80000, 85000, 90000, 95000, 100000, 55000, 60000, 65000],
          backgroundColor: "#34d399",
        },
      ],
    },

    // 月別支出データ（4月始まり）
    monthlyExpenseData: {
      labels: ["4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月"],
      datasets: [
        {
          label: "役員報酬",
          data: [90000, 90000, 90000, 90000, 90000, 90000, 90000, 90000, 90000, 90000, 90000, 90000],
          backgroundColor: "#b45309",
        },
        {
          label: "地代家賃",
          data: [65000, 65000, 65000, 65000, 65000, 65000, 65000, 65000, 65000, 60000, 60000, 60000],
          backgroundColor: "#d97706",
        },
        {
          label: "消耗品費",
          data: [50000, 55000, 50000, 60000, 55000, 65000, 60000, 70000, 65000, 50000, 45000, 55000],
          backgroundColor: "#f59e0b",
        },
        {
          label: "福利厚生費",
          data: [25000, 30000, 25000, 35000, 30000, 40000, 35000, 45000, 40000, 25000, 20000, 30000],
          backgroundColor: "#fbbf24",
        },
        {
          label: "通信費",
          data: [25000, 30000, 25000, 30000, 25000, 30000, 25000, 30000, 25000, 30000, 25000, 30000],
          backgroundColor: "#fcd34d",
        },
      ],
    },

    // 税金見込み
    taxEstimates: {
      corporateTax: 120000, // 法人税
      localTax: 70000, // 住民税
      businessTax: 50000, // 事業税
      consumptionTax: 180000, // 消費税
      total: 420000, // 合計
    },
  },
  "2023": {
    // 現金残高の内訳
    cashBalanceTotal: 920000000,
    cashBalanceData: [45, 35, 20],
    cashBalanceLabels: ["三菱UFJ銀行", "みずほ銀行", "三井住友銀行"],
    cashBalanceAmounts: [414000000, 322000000, 184000000],
    cashBalanceColors: ["#1e40af", "#3b82f6", "#60a5fa"],

    // 収入の内訳
    incomeTotal: 4200000,
    incomeData: [40, 35, 25],
    incomeLabels: ["A社", "B社", "C社"],
    incomeAmounts: [1680000, 1470000, 1050000],
    incomeColors: ["#047857", "#10b981", "#34d399"],

    // 支出の内訳
    expenseTotal: 3480000,
    expenseData: [30, 25, 20, 15, 10],
    expenseLabels: ["役員報酬", "地代家賃", "消耗品費", "福利厚生費", "通信費"],
    expenseAmounts: [1044000, 870000, 696000, 522000, 348000],
    expenseColors: ["#b45309", "#d97706", "#f59e0b", "#fbbf24", "#fcd34d"],

    // 月別収入データ（4月始まり）
    monthlyIncomeData: {
      labels: ["4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月"],
      datasets: [
        {
          label: "A社",
          data: [150000, 155000, 160000, 165000, 170000, 175000, 180000, 185000, 190000, 140000, 145000, 150000],
          backgroundColor: "#047857",
        },
        {
          label: "B社",
          data: [125000, 130000, 135000, 140000, 145000, 150000, 155000, 160000, 165000, 120000, 125000, 130000],
          backgroundColor: "#10b981",
        },
        {
          label: "C社",
          data: [85000, 90000, 95000, 100000, 105000, 110000, 115000, 120000, 125000, 80000, 85000, 90000],
          backgroundColor: "#34d399",
        },
      ],
    },

    // 月別支出データ（4月始まり）
    monthlyExpenseData: {
      labels: ["4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月"],
      datasets: [
        {
          label: "役員報酬",
          data: [90000, 90000, 90000, 90000, 90000, 90000, 90000, 90000, 90000, 90000, 90000, 90000],
          backgroundColor: "#b45309",
        },
        {
          label: "地代家賃",
          data: [75000, 75000, 75000, 75000, 75000, 75000, 75000, 75000, 75000, 70000, 70000, 70000],
          backgroundColor: "#d97706",
        },
        {
          label: "消耗品費",
          data: [60000, 65000, 60000, 70000, 65000, 75000, 70000, 80000, 75000, 60000, 55000, 65000],
          backgroundColor: "#f59e0b",
        },
        {
          label: "福利厚生費",
          data: [45000, 50000, 45000, 55000, 50000, 60000, 55000, 65000, 60000, 45000, 40000, 50000],
          backgroundColor: "#fbbf24",
        },
        {
          label: "通信費",
          data: [30000, 35000, 30000, 35000, 30000, 35000, 30000, 35000, 30000, 35000, 30000, 35000],
          backgroundColor: "#fcd34d",
        },
      ],
    },

    // 税金見込み
    taxEstimates: {
      corporateTax: 144000, // 法人税
      localTax: 84000, // 住民税
      businessTax: 60000, // 事業税
      consumptionTax: 216000, // 消費税
      total: 504000, // 合計
    },
  },
  "2024": {
    // 現金残高の内訳
    cashBalanceTotal: 999999999,
    cashBalanceData: [45, 30, 25],
    cashBalanceLabels: ["三菱UFJ銀行", "みずほ銀行", "三井住友銀行"],
    cashBalanceAmounts: [450000000, 300000000, 249999999],
    cashBalanceColors: ["#1e40af", "#3b82f6", "#60a5fa"],

    // 収入の内訳
    incomeTotal: 4800000,
    incomeData: [40, 35, 25],
    incomeLabels: ["A社", "B社", "C社"],
    incomeAmounts: [1920000, 1680000, 1200000],
    incomeColors: ["#047857", "#10b981", "#34d399"],

    // 支出の内訳
    expenseTotal: 3960000,
    expenseData: [30, 25, 20, 15, 10],
    expenseLabels: ["役員報酬", "地代家賃", "消耗品費", "福利厚生費", "通信費"],
    expenseAmounts: [1188000, 990000, 792000, 594000, 396000],
    expenseColors: ["#b45309", "#d97706", "#f59e0b", "#fbbf24", "#fcd34d"],

    // 月別収入データ（4月始まり）
    monthlyIncomeData: {
      labels: ["4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月"],
      datasets: [
        {
          label: "A社",
          data: [170000, 165000, 180000, 175000, 190000, 185000, 200000, 195000, 210000, 150000, 160000, 155000],
          backgroundColor: "#047857",
        },
        {
          label: "B社",
          data: [145000, 150000, 155000, 160000, 165000, 170000, 175000, 180000, 185000, 130000, 135000, 140000],
          backgroundColor: "#10b981",
        },
        {
          label: "C社",
          data: [105000, 110000, 115000, 120000, 125000, 130000, 135000, 140000, 145000, 90000, 95000, 100000],
          backgroundColor: "#34d399",
        },
      ],
    },

    // 月別支出データ（4月始まり）
    monthlyExpenseData: {
      labels: ["4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月"],
      datasets: [
        {
          label: "役員報酬",
          data: [100000, 100000, 100000, 100000, 100000, 100000, 100000, 100000, 100000, 100000, 100000, 100000],
          backgroundColor: "#b45309",
        },
        {
          label: "地代家賃",
          data: [85000, 85000, 85000, 85000, 85000, 85000, 85000, 85000, 85000, 80000, 80000, 80000],
          backgroundColor: "#d97706",
        },
        {
          label: "消耗品費",
          data: [65000, 75000, 70000, 80000, 75000, 85000, 80000, 90000, 85000, 65000, 60000, 70000],
          backgroundColor: "#f59e0b",
        },
        {
          label: "福利厚生費",
          data: [50000, 60000, 55000, 65000, 60000, 70000, 65000, 75000, 70000, 50000, 45000, 55000],
          backgroundColor: "#fbbf24",
        },
        {
          label: "通信費",
          data: [30000, 35000, 30000, 35000, 30000, 35000, 30000, 35000, 30000, 35000, 30000, 35000],
          backgroundColor: "#fcd34d",
        },
      ],
    },

    // 税金見込み
    taxEstimates: {
      corporateTax: 168000, // 法人税
      localTax: 98000, // 住民税
      businessTax: 70000, // 事業税
      consumptionTax: 252000, // 消費税
      total: 588000, // 合計
    },
  },
}

export async function GET(request: NextRequest) {
  // クエリパラメータから年度を取得
  const searchParams = request.nextUrl.searchParams
  const year = searchParams.get("year") || "2024"

  // 指定された年度のデータを取得
  const data = yearData[year] || yearData["2024"]

  // 実際のAPIでは処理に時間がかかることを模擬するために遅延を追加
  await new Promise((resolve) => setTimeout(resolve, 500))

  // データを返す
  return NextResponse.json(data)
}
