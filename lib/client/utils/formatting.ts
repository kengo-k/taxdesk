// 金額のフォーマット
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP').format(amount)
}

// 日付文字列（YYYYMMDD）から曜日の漢字を取得する関数
export const getDayOfWeekKanji = (dateStr: string): string => {
  // 日付が正しいフォーマットでない場合は空文字を返す
  if (!dateStr || !/^\d{8}$/.test(dateStr)) return ''

  try {
    const year = parseInt(dateStr.substring(0, 4))
    const month = parseInt(dateStr.substring(4, 6)) - 1 // Dateオブジェクトでは月は0から始まる
    const day = parseInt(dateStr.substring(6, 8))

    const date = new Date(year, month, day)

    // 日付が有効かチェック
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      return ''
    }

    const dayOfWeek = date.getDay()
    const kanjiDays = ['日', '月', '火', '水', '木', '金', '土']

    return kanjiDays[dayOfWeek]
  } catch (error) {
    return ''
  }
}

// 土日判定関数
export const isWeekend = (dateStr: string): boolean => {
  if (!dateStr || !/^\d{8}$/.test(dateStr)) return false

  try {
    const year = parseInt(dateStr.substring(0, 4))
    const month = parseInt(dateStr.substring(4, 6)) - 1
    const day = parseInt(dateStr.substring(6, 8))

    const date = new Date(year, month, day)

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      return false
    }

    const dayOfWeek = date.getDay()
    return dayOfWeek === 0 || dayOfWeek === 6 // 日曜日(0) または 土曜日(6)
  } catch (error) {
    return false
  }
}
