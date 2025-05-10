import colorbrewer from 'colorbrewer'

// グラフの種類ごとのベースカラー
const CHART_COLORS = {
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
  asset: {
    base: '#0891b2',
    scheme: 'Blues',
  },
} as const

export type ChartType = keyof typeof CHART_COLORS

// デフォルトの色配列（9色）
const DEFAULT_COLORS = [
  '#1f77b4', // blue
  '#ff7f0e', // orange
  '#2ca02c', // green
  '#d62728', // red
  '#9467bd', // purple
  '#8c564b', // brown
  '#e377c2', // pink
  '#7f7f7f', // gray
  '#bcbd22', // yellow-green
]

/**
 * グラフの種類とデータセット数に応じた色の配列を生成
 * @param type グラフの種類
 * @param count データセット数
 * @returns 色の配列
 */
export function getChartColors(type: ChartType, count: number): string[] {
  const colorInfo = CHART_COLORS[type]
  const maxColors = 9 // colorbrewerの最大色数

  // データセット数が0以下の場合は空配列を返す
  if (count <= 0) {
    return []
  }

  // colorbrewerから色を取得
  const schemeColors =
    colorbrewer[colorInfo.scheme]?.[count] ||
    colorbrewer[colorInfo.scheme]?.[maxColors]

  // colorbrewerから色を取得できなかった場合はデフォルトの色を使用
  if (!schemeColors) {
    return Array.from(
      { length: count },
      (_, i) => DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    )
  }

  // データセット数が最大色数を超える場合、最大色数の色を繰り返し使用
  if (count > maxColors) {
    return Array.from({ length: count }, (_, i) => schemeColors[i % maxColors])
  }

  return schemeColors
}
