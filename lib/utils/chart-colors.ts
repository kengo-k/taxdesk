import colorbrewer from 'colorbrewer'

// グラフの種類ごとのベースカラー
export const CHART_COLORS = {
  expense: {
    base: '#2563eb', // blue-600
    scheme: 'Blues',
  },
  income: {
    base: '#16a34a', // green-600
    scheme: 'Greens',
  },
  balance: {
    base: '#9333ea', // purple-600
    scheme: 'Purples',
  },
} as const

type ChartType = keyof typeof CHART_COLORS

/**
 * グラフのデータセット数に応じて適切な色の配列を生成する
 * @param type グラフの種類
 * @param count データセットの数
 * @returns 色の配列（下から上に行くほど濃い色になる）
 */
export function getChartColors(type: ChartType, count: number): string[] {
  const { scheme } = CHART_COLORS[type]
  const colorScale = colorbrewer[scheme]

  // データセット数に応じて適切な色数を選択
  const availableScales = Object.keys(colorScale)
    .map(Number)
    .filter((n) => n >= count)
    .sort((a, b) => a - b)

  if (availableScales.length === 0) {
    // データセット数が多すぎる場合は、最大の色数を繰り返し使用
    const maxScale = Math.max(...Object.keys(colorScale).map(Number))
    const colors = colorScale[maxScale]
    // 色を反転して、下から上に行くほど濃くなるようにする
    return Array.from(
      { length: count },
      (_, i) => colors[colors.length - 1 - (i % colors.length)],
    )
  }

  // 選択された色スケールの色を反転して、下から上に行くほど濃くなるようにする
  const colors = colorScale[availableScales[0]]
  return colors.slice().reverse()
}
