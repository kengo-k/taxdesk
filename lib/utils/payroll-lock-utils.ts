/**
 * 支払い済み給与期間の修正制御ユーティリティ
 */

interface PaymentStatus {
  month: number
  isPaid: boolean
  createdAt: string
}

/**
 * 指定した年度の支払い状況を取得
 */
export async function fetchPaymentStatuses(
  fiscalYear: string,
): Promise<Record<number, boolean>> {
  try {
    const response = await fetch(
      `/api/fiscal-years/${fiscalYear}/payroll/payments`,
    )
    const result = await response.json()

    if (!result.success) {
      console.warn('Failed to fetch payment statuses:', result.message)
      return {}
    }

    const statusMap: Record<number, boolean> = {}
    result.data.forEach((status: PaymentStatus) => {
      statusMap[status.month] = status.isPaid
    })

    return statusMap
  } catch (error) {
    console.error('Error fetching payment statuses:', error)
    return {}
  }
}

/**
 * 日付（YYYYMMDD形式）から月を抽出
 */
export function extractMonthFromDate(date: string): number {
  if (date.length !== 8) {
    throw new Error('Date must be in YYYYMMDD format')
  }
  return parseInt(date.substring(4, 6), 10)
}

/**
 * 指定した日付の月が支払い済みかどうかをチェック
 */
export function isPaymentLocked(
  date: string,
  paymentStatuses: Record<number, boolean>,
): boolean {
  const month = extractMonthFromDate(date)
  return paymentStatuses[month] || false
}

/**
 * 複数の日付が支払い済み期間に含まれるかチェック
 */
export function hasPaymentLockedDates(
  dates: string[],
  paymentStatuses: Record<number, boolean>,
): boolean {
  return dates.some((date) => isPaymentLocked(date, paymentStatuses))
}

/**
 * 支払い済み期間に含まれる月の配列を取得
 */
export function getLockedMonths(
  dates: string[],
  paymentStatuses: Record<number, boolean>,
): number[] {
  const lockedMonths = new Set<number>()

  dates.forEach((date) => {
    if (isPaymentLocked(date, paymentStatuses)) {
      lockedMonths.add(extractMonthFromDate(date))
    }
  })

  return Array.from(lockedMonths).sort()
}

/**
 * ロック期間のエラーメッセージを生成
 */
export function createLockMessage(lockedMonths: number[]): string {
  const monthsText = lockedMonths.join(', ')
  return `${monthsText}月は既に給与支払いが完了しているため、修正できません`
}
