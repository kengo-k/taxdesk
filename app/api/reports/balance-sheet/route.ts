import { type NextRequest, NextResponse } from "next/server"

// 貸借対照表データのモック
const balanceSheetData = {
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

export async function GET(request: NextRequest) {
  // クエリパラメータから年度と月を取得
  const searchParams = request.nextUrl.searchParams
  const fiscalYear = searchParams.get("fiscalYear") || "2024"
  const month = searchParams.get("month") || "3"

  // 指定された年度と月のデータを取得
  const data = balanceSheetData[fiscalYear]?.[month] || balanceSheetData["2024"]["3"]

  // 実際のAPIでは処理に時間がかかることを模擬するために遅延を追加
  await new Promise((resolve) => setTimeout(resolve, 500))

  // データを返す
  return NextResponse.json({ balanceSheetData: data })
}
