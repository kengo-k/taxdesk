import { Connection } from '@/lib/backend/api-transaction'

export interface JournalCheckStatusByMonth {
  month: number
  totalCount: number
  checkedCount: number
  uncheckedCount: number
  allChecked: boolean
}

export async function getAllJournalCheckStatuses(
  conn: Connection,
  fiscalYear: string,
): Promise<JournalCheckStatusByMonth[]> {
  // 年度内の全ての仕訳データを取得して月別に集計
  const allJournals = await conn.journals.findMany({
    where: {
      nendo: fiscalYear,
      deleted: '0',
    },
    select: {
      date: true,
      checked: true,
    },
  })

  // 月別に集計
  const monthlyStats: Record<number, { total: number; checked: number }> = {}

  allJournals.forEach((journal) => {
    // date形式: YYYYMMDD
    const monthNum = parseInt(journal.date.substring(4, 6))

    if (!monthlyStats[monthNum]) {
      monthlyStats[monthNum] = { total: 0, checked: 0 }
    }

    monthlyStats[monthNum].total++
    if (journal.checked === '1') {
      monthlyStats[monthNum].checked++
    }
  })

  // 結果を配列に変換
  const results: JournalCheckStatusByMonth[] = Object.entries(monthlyStats).map(
    ([monthStr, stats]) => {
      const month = parseInt(monthStr)
      const uncheckedCount = stats.total - stats.checked

      return {
        month,
        totalCount: stats.total,
        checkedCount: stats.checked,
        uncheckedCount,
        allChecked: uncheckedCount === 0,
      }
    },
  )

  // 月順でソート（4月から3月の順）
  return results.sort((a, b) => {
    if (a.month >= 4 && b.month >= 4) return a.month - b.month
    if (a.month < 4 && b.month < 4) return a.month - b.month
    if (a.month >= 4 && b.month < 4) return -1
    if (a.month < 4 && b.month >= 4) return 1
    return 0
  })
}
