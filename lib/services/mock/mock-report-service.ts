import type { ReportService, SummaryReport, BalanceSheet, IncomeStatement, TaxInfo, TaxRates } from "../report-service"

export class MockReportService implements ReportService {
  // 年度データのモック
  private yearData: Record<string, SummaryReport> = {
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

  // 貸借対照表データのモック
  private balanceSheetData: Record<string, Record<string, BalanceSheet>> = {
    "2022": {
      "3": {
        assets: [
          { name: "現金", amount: 1000000 },
          { name: "普通預金", amount: 3000000 },
          { name: "売掛金", amount: 2000000 },
          { name: "商品", amount: 1500000 },
          { name: "前払費用", amount: 400000 },
          { name: "建物", amount: 10000000 },
          { name: "減価償却累計額", amount: -2000000 },
          { name: "車両運搬具", amount: 3000000 },
          { name: "減価償却累計額", amount: -1200000 },
          { name: "敷金", amount: 800000 },
        ],
        liabilities: [
          { name: "買掛金", amount: 1500000 },
          { name: "未払金", amount: 500000 },
          { name: "未払法人税等", amount: 1000000 },
          { name: "未払消費税", amount: 400000 },
          { name: "前受金", amount: 200000 },
          { name: "長期借入金", amount: 4000000 },
        ],
        equity: [
          { name: "資本金", amount: 5000000 },
          { name: "資本準備金", amount: 2000000 },
          { name: "繰越利益剰余金", amount: 4900000 },
        ],
      },
      "6": {
        assets: [
          { name: "現金", amount: 1100000 },
          { name: "普通預金", amount: 3200000 },
          { name: "売掛金", amount: 2100000 },
          { name: "商品", amount: 1600000 },
          { name: "前払費用", amount: 420000 },
          { name: "建物", amount: 10000000 },
          { name: "減価償却累計額", amount: -2100000 },
          { name: "車両運搬具", amount: 3000000 },
          { name: "減価償却累計額", amount: -1300000 },
          { name: "敷金", amount: 800000 },
        ],
        liabilities: [
          { name: "買掛金", amount: 1600000 },
          { name: "未払金", amount: 550000 },
          { name: "未払法人税等", amount: 1050000 },
          { name: "未払消費税", amount: 420000 },
          { name: "前受金", amount: 250000 },
          { name: "長期借入金", amount: 4200000 },
        ],
        equity: [
          { name: "資本金", amount: 5000000 },
          { name: "資本準備金", amount: 2000000 },
          { name: "繰越利益剰余金", amount: 5150000 },
        ],
      },
      "9": {
        assets: [
          { name: "現金", amount: 1150000 },
          { name: "普通預金", amount: 3400000 },
          { name: "売掛金", amount: 2200000 },
          { name: "商品", amount: 1650000 },
          { name: "前払費用", amount: 430000 },
          { name: "建物", amount: 10000000 },
          { name: "減価償却累計額", amount: -2200000 },
          { name: "車両運搬具", amount: 3000000 },
          { name: "減価償却累計額", amount: -1350000 },
          { name: "敷金", amount: 800000 },
        ],
        liabilities: [
          { name: "買掛金", amount: 1650000 },
          { name: "未払金", amount: 600000 },
          { name: "未払法人税等", amount: 1100000 },
          { name: "未払消費税", amount: 430000 },
          { name: "前受金", amount: 270000 },
          { name: "長期借入金", amount: 4500000 },
        ],
        equity: [
          { name: "資本金", amount: 5000000 },
          { name: "資本準備金", amount: 2000000 },
          { name: "繰越利益剰余金", amount: 5530000 },
        ],
      },
      "12": {
        assets: [
          { name: "現金", amount: 1200000 },
          { name: "普通預金", amount: 3600000 },
          { name: "売掛金", amount: 2400000 },
          { name: "商品", amount: 1700000 },
          { name: "前払費用", amount: 440000 },
          { name: "建物", amount: 10000000 },
          { name: "減価償却累計額", amount: -2300000 },
          { name: "車両運搬具", amount: 3000000 },
          { name: "減価償却累計額", amount: -1400000 },
          { name: "敷金", amount: 800000 },
        ],
        liabilities: [
          { name: "買掛金", amount: 1700000 },
          { name: "未払金", amount: 620000 },
          { name: "未払法人税等", amount: 1150000 },
          { name: "未払消費税", amount: 440000 },
          { name: "前受金", amount: 290000 },
          { name: "長期借入金", amount: 4800000 },
        ],
        equity: [
          { name: "資本金", amount: 5000000 },
          { name: "資本準備金", amount: 2000000 },
          { name: "繰越利益剰余金", amount: 5930000 },
        ],
      },
    },
    "2023": {
      "3": {
        assets: [
          { name: "現金", amount: 1200000 },
          { name: "普通預金", amount: 3600000 },
          { name: "売掛金", amount: 2400000 },
          { name: "商品", amount: 1700000 },
          { name: "前払費用", amount: 440000 },
          { name: "建物", amount: 11000000 },
          { name: "減価償却累計額", amount: -2300000 },
          { name: "車両運搬具", amount: 3200000 },
          { name: "減価償却累計額", amount: -1400000 },
          { name: "敷金", amount: 900000 },
        ],
        liabilities: [
          { name: "買掛金", amount: 1700000 },
          { name: "未払金", amount: 620000 },
          { name: "未払法人税等", amount: 1150000 },
          { name: "未払消費税", amount: 440000 },
          { name: "前受金", amount: 290000 },
          { name: "長期借入金", amount: 4800000 },
        ],
        equity: [
          { name: "資本金", amount: 5000000 },
          { name: "資本準備金", amount: 2000000 },
          { name: "繰越利益剰余金", amount: 6740000 },
        ],
      },
      "6": {
        assets: [
          { name: "現金", amount: 1220000 },
          { name: "普通預金", amount: 3650000 },
          { name: "売掛金", amount: 2450000 },
          { name: "商品", amount: 1750000 },
          { name: "前払費用", amount: 445000 },
          { name: "建物", amount: 11000000 },
          { name: "減価償却累計額", amount: -2350000 },
          { name: "車両運搬具", amount: 3200000 },
          { name: "減価償却累計額", amount: -1450000 },
          { name: "敷金", amount: 900000 },
        ],
        liabilities: [
          { name: "買掛金", amount: 1750000 },
          { name: "未払金", amount: 635000 },
          { name: "未払法人税等", amount: 1175000 },
          { name: "未払消費税", amount: 445000 },
          { name: "前受金", amount: 295000 },
          { name: "長期借入金", amount: 4900000 },
        ],
        equity: [
          { name: "資本金", amount: 5000000 },
          { name: "資本準備金", amount: 2000000 },
          { name: "繰越利益剰余金", amount: 6815000 },
        ],
      },
      "9": {
        assets: [
          { name: "現金", amount: 1230000 },
          { name: "普通預金", amount: 3700000 },
          { name: "売掛金", amount: 2480000 },
          { name: "商品", amount: 1780000 },
          { name: "前払費用", amount: 448000 },
          { name: "建物", amount: 11000000 },
          { name: "減価償却累計額", amount: -2380000 },
          { name: "車両運搬具", amount: 3200000 },
          { name: "減価償却累計額", amount: -1480000 },
          { name: "敷金", amount: 900000 },
        ],
        liabilities: [
          { name: "買掛金", amount: 1780000 },
          { name: "未払金", amount: 645000 },
          { name: "未払法人税等", amount: 1185000 },
          { name: "未払消費税", amount: 448000 },
          { name: "前受金", amount: 298000 },
          { name: "長期借入金", amount: 4950000 },
        ],
        equity: [
          { name: "資本金", amount: 5000000 },
          { name: "資本準備金", amount: 2000000 },
          { name: "繰越利益剰余金", amount: 6872000 },
        ],
      },
      "12": {
        assets: [
          { name: "現金", amount: 1250000 },
          { name: "普通預金", amount: 3750000 },
          { name: "売掛金", amount: 2500000 },
          { name: "商品", amount: 1800000 },
          { name: "前払費用", amount: 450000 },
          { name: "建物", amount: 11000000 },
          { name: "減価償却累計額", amount: -2400000 },
          { name: "車両運搬具", amount: 3200000 },
          { name: "減価償却累計額", amount: -1500000 },
          { name: "敷金", amount: 900000 },
        ],
        liabilities: [
          { name: "買掛金", amount: 1800000 },
          { name: "未払金", amount: 650000 },
          { name: "未払法人税等", amount: 1200000 },
          { name: "未払消費税", amount: 450000 },
          { name: "前受金", amount: 300000 },
          { name: "長期借入金", amount: 5000000 },
        ],
        equity: [
          { name: "資本金", amount: 5000000 },
          { name: "資本準備金", amount: 2000000 },
          { name: "繰越利益剰余金", amount: 6950000 },
        ],
      },
    },
    "2024": {
      "3": {
        assets: [
          { name: "現金", amount: 1250000 },
          { name: "普通預金", amount: 3750000 },
          { name: "売掛金", amount: 2500000 },
          { name: "商品", amount: 1800000 },
          { name: "前払費用", amount: 450000 },
          { name: "建物", amount: 12000000 },
          { name: "減価償却累計額", amount: -2400000 },
          { name: "車両運搬具", amount: 3500000 },
          { name: "減価償却累計額", amount: -1400000 },
          { name: "敷金", amount: 1000000 },
        ],
        liabilities: [
          { name: "買掛金", amount: 1800000 },
          { name: "未払金", amount: 650000 },
          { name: "未払法人税等", amount: 1200000 },
          { name: "未払消費税", amount: 450000 },
          { name: "前受金", amount: 300000 },
          { name: "長期借入金", amount: 5000000 },
        ],
        equity: [
          { name: "資本金", amount: 5000000 },
          { name: "資本準備金", amount: 2000000 },
          { name: "繰越利益剰余金", amount: 6050000 },
        ],
      },
      "6": {
        assets: [
          { name: "現金", amount: 1300000 },
          { name: "普通預金", amount: 3800000 },
          { name: "売掛金", amount: 2550000 },
          { name: "商品", amount: 1850000 },
          { name: "前払費用", amount: 460000 },
          { name: "建物", amount: 12000000 },
          { name: "減価償却累計額", amount: -2450000 },
          { name: "車両運搬具", amount: 3500000 },
          { name: "減価償却累計額", amount: -1450000 },
          { name: "敷金", amount: 1000000 },
        ],
        liabilities: [
          { name: "買掛金", amount: 1850000 },
          { name: "未払金", amount: 670000 },
          { name: "未払法人税等", amount: 1230000 },
          { name: "未払消費税", amount: 460000 },
          { name: "前受金", amount: 310000 },
          { name: "長期借入金", amount: 5100000 },
        ],
        equity: [
          { name: "資本金", amount: 5000000 },
          { name: "資本準備金", amount: 2000000 },
          { name: "繰越利益剰余金", amount: 6200000 },
        ],
      },
      "9": {
        assets: [
          { name: "現金", amount: 1350000 },
          { name: "普通預金", amount: 3850000 },
          { name: "売掛金", amount: 2600000 },
          { name: "商品", amount: 1900000 },
          { name: "前払費用", amount: 470000 },
          { name: "建物", amount: 12000000 },
          { name: "減価償却累計額", amount: -2500000 },
          { name: "車両運搬具", amount: 3500000 },
          { name: "減価償却累計額", amount: -1500000 },
          { name: "敷金", amount: 1000000 },
        ],
        liabilities: [
          { name: "買掛金", amount: 1900000 },
          { name: "未払金", amount: 690000 },
          { name: "未払法人税等", amount: 1260000 },
          { name: "未払消費税", amount: 470000 },
          { name: "前受金", amount: 320000 },
          { name: "長期借入金", amount: 5200000 },
        ],
        equity: [
          { name: "資本金", amount: 5000000 },
          { name: "資本準備金", amount: 2000000 },
          { name: "繰越利益剰余金", amount: 6330000 },
        ],
      },
      "12": {
        assets: [
          { name: "現金", amount: 1400000 },
          { name: "普通預金", amount: 3900000 },
          { name: "売掛金", amount: 2650000 },
          { name: "商品", amount: 1950000 },
          { name: "前払費用", amount: 480000 },
          { name: "建物", amount: 12000000 },
          { name: "減価償却累計額", amount: -2550000 },
          { name: "車両運搬具", amount: 3500000 },
          { name: "減価償却累計額", amount: -1550000 },
          { name: "敷金", amount: 1000000 },
        ],
        liabilities: [
          { name: "買掛金", amount: 1950000 },
          { name: "未払金", amount: 710000 },
          { name: "未払法人税等", amount: 1290000 },
          { name: "未払消費税", amount: 480000 },
          { name: "前受金", amount: 330000 },
          { name: "長期借入金", amount: 5300000 },
        ],
        equity: [
          { name: "資本金", amount: 5000000 },
          { name: "資本準備金", amount: 2000000 },
          { name: "繰越利益剰余金", amount: 6470000 },
        ],
      },
    },
  }

  // 損益計算書データのモック
  private incomeStatementData: Record<string, Record<string, IncomeStatement>> = {
    "2022": {
      "full-year": {
        revenue: [
          { name: "売上高", amount: 36000000 },
          { name: "受取利息", amount: 12000 },
          { name: "雑収入", amount: 80000 },
        ],
        expenses: [
          { name: "仕入高", amount: 15000000 },
          { name: "役員報酬", amount: 10000000 },
          { name: "給料手当", amount: 7000000 },
          { name: "法定福利費", amount: 1400000 },
          { name: "地代家賃", amount: 2000000 },
          { name: "水道光熱費", amount: 600000 },
          { name: "通信費", amount: 300000 },
          { name: "消耗品費", amount: 400000 },
          { name: "減価償却費", amount: 1000000 },
          { name: "支払利息", amount: 120000 },
          { name: "雑費", amount: 200000 },
        ],
        taxes: [{ name: "法人税等", amount: 1000000 }],
      },
      "first-half": {
        revenue: [
          { name: "売上高", amount: 17000000 },
          { name: "受取利息", amount: 6000 },
          { name: "雑収入", amount: 40000 },
        ],
        expenses: [
          { name: "仕入高", amount: 7000000 },
          { name: "役員報酬", amount: 5000000 },
          { name: "給料手当", amount: 3500000 },
          { name: "法定福利費", amount: 700000 },
          { name: "地代家賃", amount: 1000000 },
          { name: "水道光熱費", amount: 300000 },
          { name: "通信費", amount: 150000 },
          { name: "消耗品費", amount: 200000 },
          { name: "減価償却費", amount: 500000 },
          { name: "支払利息", amount: 60000 },
          { name: "雑費", amount: 100000 },
        ],
        taxes: [{ name: "法人税等", amount: 500000 }],
      },
      "second-half": {
        revenue: [
          { name: "売上高", amount: 19000000 },
          { name: "受取利息", amount: 6000 },
          { name: "雑収入", amount: 40000 },
        ],
        expenses: [
          { name: "仕入高", amount: 8000000 },
          { name: "役員報酬", amount: 5000000 },
          { name: "給料手当", amount: 3500000 },
          { name: "法定福利費", amount: 700000 },
          { name: "地代家賃", amount: 1000000 },
          { name: "水道光熱費", amount: 300000 },
          { name: "通信費", amount: 150000 },
          { name: "消耗品費", amount: 200000 },
          { name: "減価償却費", amount: 500000 },
          { name: "支払利息", amount: 60000 },
          { name: "雑費", amount: 100000 },
        ],
        taxes: [{ name: "法人税等", amount: 500000 }],
      },
      "1": {
        revenue: [
          { name: "売上高", amount: 8500000 },
          { name: "受取利息", amount: 3000 },
          { name: "雑収入", amount: 20000 },
        ],
        expenses: [
          { name: "仕入高", amount: 3500000 },
          { name: "役員報酬", amount: 2500000 },
          { name: "給料手当", amount: 1750000 },
          { name: "法定福利費", amount: 350000 },
          { name: "地代家賃", amount: 500000 },
          { name: "水道光熱費", amount: 150000 },
          { name: "通信費", amount: 75000 },
          { name: "消耗品費", amount: 100000 },
          { name: "減価償却費", amount: 250000 },
          { name: "支払利息", amount: 30000 },
          { name: "雑費", amount: 50000 },
        ],
        taxes: [{ name: "法人税等", amount: 250000 }],
      },
      "2": {
        revenue: [
          { name: "売上高", amount: 8500000 },
          { name: "受取利息", amount: 3000 },
          { name: "雑収入", amount: 20000 },
        ],
        expenses: [
          { name: "仕入高", amount: 3500000 },
          { name: "役員報酬", amount: 2500000 },
          { name: "給料手当", amount: 1750000 },
          { name: "法定福利費", amount: 350000 },
          { name: "地代家賃", amount: 500000 },
          { name: "水道光熱費", amount: 150000 },
          { name: "通信費", amount: 75000 },
          { name: "消耗品費", amount: 100000 },
          { name: "減価償却費", amount: 250000 },
          { name: "支払利息", amount: 30000 },
          { name: "雑費", amount: 50000 },
        ],
        taxes: [{ name: "法人税等", amount: 250000 }],
      },
      "3": {
        revenue: [
          { name: "売上高", amount: 9500000 },
          { name: "受取利息", amount: 3000 },
          { name: "雑収入", amount: 20000 },
        ],
        expenses: [
          { name: "仕入高", amount: 4000000 },
          { name: "役員報酬", amount: 2500000 },
          { name: "給料手当", amount: 1750000 },
          { name: "法定福利費", amount: 350000 },
          { name: "地代家賃", amount: 500000 },
          { name: "水道光熱費", amount: 150000 },
          { name: "通信費", amount: 75000 },
          { name: "消耗品費", amount: 100000 },
          { name: "減価償却費", amount: 250000 },
          { name: "支払利息", amount: 30000 },
          { name: "雑費", amount: 50000 },
        ],
        taxes: [{ name: "法人税等", amount: 250000 }],
      },
      "4": {
        revenue: [
          { name: "売上高", amount: 9500000 },
          { name: "受取利息", amount: 3000 },
          { name: "雑収入", amount: 20000 },
        ],
        expenses: [
          { name: "仕入高", amount: 4000000 },
          { name: "役員報酬", amount: 2500000 },
          { name: "給料手当", amount: 1750000 },
          { name: "法定福利費", amount: 350000 },
          { name: "地代家賃", amount: 500000 },
          { name: "水道光熱費", amount: 150000 },
          { name: "通信費", amount: 75000 },
          { name: "消耗品費", amount: 100000 },
          { name: "減価償却費", amount: 250000 },
          { name: "支払利息", amount: 30000 },
          { name: "雑費", amount: 50000 },
        ],
        taxes: [{ name: "法人税等", amount: 250000 }],
      },
    },
    "2023": {
      "full-year": {
        revenue: [
          { name: "売上高", amount: 42000000 },
          { name: "受取利息", amount: 14000 },
          { name: "雑収入", amount: 90000 },
        ],
        expenses: [
          { name: "仕入高", amount: 17000000 },
          { name: "役員報酬", amount: 11000000 },
          { name: "給料手当", amount: 7700000 },
          { name: "法定福利費", amount: 1540000 },
          { name: "地代家賃", amount: 2200000 },
          { name: "水道光熱費", amount: 660000 },
          { name: "通信費", amount: 330000 },
          { name: "消耗品費", amount: 440000 },
          { name: "減価償却費", amount: 1100000 },
          { name: "支払利息", amount: 132000 },
          { name: "雑費", amount: 220000 },
        ],
        taxes: [{ name: "法人税等", amount: 1100000 }],
      },
      // 他の期間も同様に定義...
    },
    "2024": {
      "full-year": {
        revenue: [
          { name: "売上高", amount: 48000000 },
          { name: "受取利息", amount: 15000 },
          { name: "雑収入", amount: 85000 },
        ],
        expenses: [
          { name: "仕入高", amount: 18000000 },
          { name: "役員報酬", amount: 12000000 },
          { name: "給料手当", amount: 8400000 },
          { name: "法定福利費", amount: 1680000 },
          { name: "地代家賃", amount: 2400000 },
          { name: "水道光熱費", amount: 720000 },
          { name: "通信費", amount: 360000 },
          { name: "消耗品費", amount: 480000 },
          { name: "減価償却費", amount: 1200000 },
          { name: "支払利息", amount: 150000 },
          { name: "雑費", amount: 240000 },
        ],
        taxes: [{ name: "法人税等", amount: 1200000 }],
      },
      // 他の期間も同様に定義...
    },
  }

  // 税金データのモック
  private taxData: Record<
    string,
    {
      yearData: TaxInfo
      taxRates: TaxRates
    }
  > = {
    "2021": {
      yearData: {
        income: 3000000,
        expense: 2550000,
        profit: 450000,
        taxEstimates: {
          corporateTax: 90000,
          localCorporateTax: 9270,
          totalCorporateTax: 99270,
          prefecturalTax: 900,
          municipalTax: 5400,
          corporateInhabitantTaxPerCapita: 70000,
          totalInhabitantTax: 76300,
          businessTax: 31500,
          specialLocalCorporateTax: 13608,
          totalBusinessTax: 45108,
          consumptionTax: 300000,
          localConsumptionTax: 66000,
          totalConsumptionTax: 366000,
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
      taxRates: {
        corporateTaxRate: 23.2,
        localCorporateTaxRate: 10.3,
        prefecturalTaxRate: 1.0,
        municipalTaxRate: 6.0,
        corporateInhabitantTaxPerCapita: 70000,
        businessTaxRate: 7.0,
        specialLocalCorporateTaxRate: 43.2,
        consumptionTaxRate: 10.0,
        localConsumptionTaxRate: 2.2,
      },
    },
    "2022": {
      yearData: {
        income: 3600000,
        expense: 3000000,
        profit: 600000,
        taxEstimates: {
          corporateTax: 120000,
          localCorporateTax: 12360,
          totalCorporateTax: 132360,
          prefecturalTax: 1200,
          municipalTax: 7200,
          corporateInhabitantTaxPerCapita: 70000,
          totalInhabitantTax: 78400,
          businessTax: 42000,
          specialLocalCorporateTax: 18144,
          totalBusinessTax: 60144,
          consumptionTax: 360000,
          localConsumptionTax: 79200,
          totalConsumptionTax: 439200,
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
      taxRates: {
        corporateTaxRate: 23.2,
        localCorporateTaxRate: 10.3,
        prefecturalTaxRate: 1.0,
        municipalTaxRate: 6.0,
        corporateInhabitantTaxPerCapita: 70000,
        businessTaxRate: 7.0,
        specialLocalCorporateTaxRate: 43.2,
        consumptionTaxRate: 10.0,
        localConsumptionTaxRate: 2.2,
      },
    },
    "2023": {
      yearData: {
        income: 4200000,
        expense: 3480000,
        profit: 720000,
        taxEstimates: {
          corporateTax: 144000,
          localCorporateTax: 14832,
          totalCorporateTax: 158832,
          prefecturalTax: 1440,
          municipalTax: 8640,
          corporateInhabitantTaxPerCapita: 70000,
          totalInhabitantTax: 80080,
          businessTax: 50400,
          specialLocalCorporateTax: 21773,
          totalBusinessTax: 72173,
          consumptionTax: 420000,
          localConsumptionTax: 92400,
          totalConsumptionTax: 512400,
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
      taxRates: {
        corporateTaxRate: 23.2,
        localCorporateTaxRate: 10.3,
        prefecturalTaxRate: 1.0,
        municipalTaxRate: 6.0,
        corporateInhabitantTaxPerCapita: 70000,
        businessTaxRate: 7.0,
        specialLocalCorporateTaxRate: 43.2,
        consumptionTaxRate: 10.0,
        localConsumptionTaxRate: 2.2,
      },
    },
    "2024": {
      yearData: {
        income: 4800000,
        expense: 3960000,
        profit: 840000,
        taxEstimates: {
          corporateTax: 168000,
          localCorporateTax: 17304,
          totalCorporateTax: 185304,
          prefecturalTax: 1680,
          municipalTax: 10080,
          corporateInhabitantTaxPerCapita: 70000,
          totalInhabitantTax: 81760,
          businessTax: 58800,
          specialLocalCorporateTax: 25402,
          totalBusinessTax: 84202,
          consumptionTax: 480000,
          localConsumptionTax: 105600,
          totalConsumptionTax: 585600,
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
      taxRates: {
        corporateTaxRate: 23.2,
        localCorporateTaxRate: 10.3,
        prefecturalTaxRate: 1.0,
        municipalTaxRate: 6.0,
        corporateInhabitantTaxPerCapita: 70000,
        businessTaxRate: 7.0,
        specialLocalCorporateTaxRate: 43.2,
        consumptionTaxRate: 10.0,
        localConsumptionTaxRate: 2.2,
      },
    },
    "2025": {
      yearData: {
        income: 5400000,
        expense: 4320000,
        profit: 1080000,
        taxEstimates: {
          corporateTax: 216000,
          localCorporateTax: 22248,
          totalCorporateTax: 238248,
          prefecturalTax: 2160,
          municipalTax: 12960,
          corporateInhabitantTaxPerCapita: 70000,
          totalInhabitantTax: 85120,
          businessTax: 75600,
          specialLocalCorporateTax: 32659,
          totalBusinessTax: 108259,
          consumptionTax: 540000,
          localConsumptionTax: 118800,
          totalConsumptionTax: 658800,
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
      taxRates: {
        corporateTaxRate: 23.2,
        localCorporateTaxRate: 10.3,
        prefecturalTaxRate: 1.0,
        municipalTaxRate: 6.0,
        corporateInhabitantTaxPerCapita: 70000,
        businessTaxRate: 7.0,
        specialLocalCorporateTaxRate: 43.2,
        consumptionTaxRate: 10.0,
        localConsumptionTaxRate: 2.2,
      },
    },
  }

  async getSummaryReport(year: string): Promise<SummaryReport> {
    // 指定された年度のデータを取得
    const data = this.yearData[year] || this.yearData["2024"]

    // 遅延を追加（モック用）
    await new Promise((resolve) => setTimeout(resolve, 500))

    return data
  }

  async getBalanceSheet(fiscalYear: string, month: string): Promise<BalanceSheet> {
    // 指定された年度と月のデータを取得
    const data = this.balanceSheetData[fiscalYear]?.[month] || this.balanceSheetData["2024"]["3"]

    // 遅延を追加（モック用）
    await new Promise((resolve) => setTimeout(resolve, 500))

    return data
  }

  async getIncomeStatement(fiscalYear: string, period: string): Promise<IncomeStatement> {
    // 指定された年度と期間のデータを取得
    const data = this.incomeStatementData[fiscalYear]?.[period] || this.incomeStatementData["2024"]["full-year"]

    // 遅延を追加（モック用）
    await new Promise((resolve) => setTimeout(resolve, 500))

    return data
  }

  async getTaxInfo(nendo: string): Promise<{
    yearData: TaxInfo
    taxRates: TaxRates
  }> {
    // 指定された年度のデータを取得
    const data = this.taxData[nendo] || this.taxData["2024"]

    // 遅延を追加（モック用）
    await new Promise((resolve) => setTimeout(resolve, 500))

    return data
  }
}
