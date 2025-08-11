import { Connection } from '@/lib/backend/api-transaction'

export interface PaymentStatusCheck {
  isPaid: boolean
  fiscalYear: string
  month: number
}

/**
 * 指定した日付の月が支払い済みかどうかをチェックする
 * @param conn Database connection
 * @param fiscalYear 会計年度
 * @param date 日付 (YYYYMMDD形式)
 * @returns 支払い状況
 */
export async function checkPaymentStatusByDate(
  conn: Connection,
  fiscalYear: string,
  date: string,
): Promise<PaymentStatusCheck> {
  // 日付から月を抽出 (YYYYMMDD -> MM)
  const monthStr = date.substring(4, 6)
  const month = parseInt(monthStr, 10)

  // 支払い状況をチェック
  const paymentRecord = await conn.payroll_payments.findFirst({
    where: {
      fiscal_year: fiscalYear,
      month: month,
    },
  })

  return {
    isPaid: paymentRecord?.is_paid || false,
    fiscalYear,
    month,
  }
}

/**
 * 複数の日付をまとめて支払い状況チェック
 * @param conn Database connection
 * @param fiscalYear 会計年度
 * @param dates 日付配列 (YYYYMMDD形式)
 * @returns 支払い状況の配列
 */
export async function checkPaymentStatusByDates(
  conn: Connection,
  fiscalYear: string,
  dates: string[],
): Promise<PaymentStatusCheck[]> {
  // 月を抽出してユニークにする
  const months = [
    ...new Set(dates.map((date) => parseInt(date.substring(4, 6), 10))),
  ]

  // 該当する月の支払い状況を一括取得
  const paymentRecords = await conn.payroll_payments.findMany({
    where: {
      fiscal_year: fiscalYear,
      month: {
        in: months,
      },
    },
  })

  // 月別の支払い状況マップを作成
  const paymentMap: Record<number, boolean> = {}
  paymentRecords.forEach((record) => {
    paymentMap[record.month] = record.is_paid
  })

  // 各日付に対する結果を返す
  return dates.map((date) => {
    const month = parseInt(date.substring(4, 6), 10)
    return {
      isPaid: paymentMap[month] || false,
      fiscalYear,
      month,
    }
  })
}
