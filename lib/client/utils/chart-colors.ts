import chroma from 'chroma-js'

// グラフの種類ごとのベースカラー（調和のとれたマイルドなカラーパレット）
const CHART_COLORS = {
  expense: {
    // 費用：黄色/オレンジ系統
    base: '#dda15e', // 黄土色
    secondary: '#9c6644', // 濃い茶色（コントラスト強化）
  },
  income: {
    // 収入：緑系統
    base: '#83b59b', // セージグリーン
    secondary: '#3d6b50', // 濃い森林緑（コントラスト強化）
  },
  asset: {
    // 資産：青/ターコイズ系統
    base: '#6c99bb', // スチールブルー
    secondary: '#2a5078', // 濃いネイビー（コントラスト強化）
  },
} as const

export type ChartType = keyof typeof CHART_COLORS

/**
 * グラフの種類とデータセット数に応じた調和のとれた色の配列を生成
 * @param type グラフの種類
 * @param count データセット数
 * @returns 色の配列
 */
export function getChartColors(type: ChartType, count: number): string[] {
  const { base, secondary } = CHART_COLORS[type]

  // データセット数が0以下の場合は空配列を返す
  if (count <= 0) {
    return []
  }

  // データセット数が1の場合はベースカラーを返す
  if (count === 1) {
    return [base]
  }

  // データセット数が2の場合はベースとセカンダリーを直接返す（最大コントラスト）
  if (count === 2) {
    return [base, secondary]
  }

  // データセット数が3の場合は、より広い範囲の色を生成
  if (count === 3) {
    // 明るめ、中間、暗めの3色を生成
    const light = chroma(base).brighten(0.3).hex()
    const dark = chroma(secondary).darken(0.2).hex()
    return [light, base, dark]
  }

  // データセット数が4〜7の場合
  if (count <= 7) {
    // より広いコントラスト範囲で色を生成
    // ベースよりも明るい色と、セカンダリーよりも暗い色を追加
    const brighterBase = chroma(base).brighten(0.5)
    const darkerSecondary = chroma(secondary).darken(0.3)

    return chroma
      .scale([brighterBase, base, secondary, darkerSecondary])
      .mode('lch')
      .colors(count)
  }

  // 多数のデータセットの場合（8以上）
  // 色相バリエーションを増やしてコントラストを確保
  const colors = []
  const baseHsl = chroma(base).hsl()
  const hueRange = 40 // 色相の変化範囲を広げる（度）

  for (let i = 0; i < count; i++) {
    const ratio = i / (count - 1)

    // 色相をより広い範囲で変化させる
    const hueShift = (ratio - 0.5) * hueRange

    // 明度を0.35〜0.85の広い範囲で変化
    const lightness = 0.35 + ratio * 0.5

    // 彩度も変化させて識別性を向上
    const saturationFactor = 0.8 + Math.sin(ratio * Math.PI) * 0.2
    const saturation = Math.min(
      1,
      Math.max(0.3, chroma(base).get('hsl.s') * saturationFactor),
    )

    // 新しい色を生成
    const newColor = chroma
      .hsl((baseHsl[0] + hueShift / 360) % 1, saturation, lightness)
      .hex()

    colors.push(newColor)
  }

  return colors
}

/**
 * グラフの配色を複数系統組み合わせたカスタムパレットを生成
 * @param types 使用するグラフタイプの配列
 * @param countPerType 各タイプの色の数の配列
 * @returns 色の配列の配列
 */
export function getMultiTypeChartColors(
  types: ChartType[],
  countPerType: number[],
): string[][] {
  return types.map((type, index) =>
    getChartColors(type, countPerType[index] || 1),
  )
}

/**
 * 指定した数のグラデーションカラーを生成（コントラスト強化）
 * @param type グラフの種類
 * @param count 色の数
 * @returns グラデーションの色の配列
 */
export function getGradientColors(type: ChartType, count: number): string[] {
  const { base, secondary } = CHART_COLORS[type]

  // データセット数が0以下の場合は空配列を返す
  if (count <= 0) {
    return []
  }

  // より広いコントラスト範囲でグラデーション色を生成
  const brighterBase = chroma(base).brighten(0.2).alpha(0.85)
  const darkerSecondary = chroma(secondary).darken(0.1).alpha(0.15)

  return chroma.scale([brighterBase, darkerSecondary]).mode('lch').colors(count)
}

/**
 * パステルバージョンの色パレットを生成（コントラスト強化）
 * @param type グラフの種類
 * @param count 色の数
 * @returns パステルカラーの配列
 */
export function getPastelColors(type: ChartType, count: number): string[] {
  const { base, secondary } = CHART_COLORS[type]

  if (count <= 0) {
    return []
  }

  // コントラストのあるパステル調の色を生成
  if (count <= 3) {
    // 少数の場合は明確な差を付ける
    const light = chroma(base).brighten(1.3).desaturate(0.2)
    const mid = chroma(base).brighten(0.6).desaturate(0.1)
    const dark = chroma(secondary).brighten(0.3).desaturate(0.2)

    if (count === 1) return [mid.hex()]
    if (count === 2) return [light.hex(), dark.hex()]
    return [light.hex(), mid.hex(), dark.hex()]
  }

  // それ以外の場合はスケールを使用
  return chroma
    .scale([
      chroma(base).brighten(1.4).desaturate(0.2),
      chroma(base).brighten(0.7).desaturate(0.1),
      chroma(secondary).brighten(0.3).desaturate(0.1),
    ])
    .mode('lch')
    .colors(count)
}

/**
 * モノクロのバリエーションを生成（コントラスト強化）
 * @param type グラフの種類
 * @param count 色の数
 * @returns グレースケールの配列
 */
export function getMonochromeColors(type: ChartType, count: number): string[] {
  // より広いコントラスト範囲
  const ranges = {
    expense: [0.25, 0.8], // 暗め〜明るめ
    income: [0.3, 0.85], // 中暗〜明るめ
    asset: [0.2, 0.75], // 暗め〜中明るめ
  }

  const [darkest, lightest] = ranges[type]

  if (count <= 0) {
    return []
  }

  // 少数の場合は明確な差をつける
  if (count <= 3) {
    const step = (lightest - darkest) / Math.max(1, count - 1)
    return Array.from({ length: count }, (_, i) =>
      chroma.hsl(0, 0, darkest + i * step).hex(),
    )
  }

  // それ以外の場合はスケールを使用
  return chroma
    .scale(['#111111', '#999999', '#ffffff'])
    .domain([0, 0.6, 1])
    .mode('lab')
    .colors(count)
}

/**
 * デモ用：色のサンプルを生成
 * @returns 全カラーテーマのサンプル
 */
export function generateColorSamples() {
  const counts = [2, 3, 5, 7, 10]
  const types: ChartType[] = ['expense', 'income', 'asset']

  const samples: Record<string, Record<ChartType, string[][]>> = {}

  counts.forEach((count) => {
    samples[`count_${count}`] = {
      expense: [getChartColors('expense', count)],
      income: [getChartColors('income', count)],
      asset: [getChartColors('asset', count)],
    }
  })

  return samples
}
