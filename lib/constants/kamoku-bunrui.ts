export const KAMOKU_BUNRUI = {
  ASSET: 'A', // 資産
  LIABILITY: 'B', // 負債
  EQUITY: 'C', // 純資産
  REVENUE: 'D', // 収益
  EXPENSE: 'E', // 費用
  TAX: 'F', // 法人税等
  CLOSING: 'G', // 決算
} as const

export const KAMOKU_BUNRUI_TYPE = {
  LEFT: 'L', // 左側（借方）
  RIGHT: 'R', // 右側（貸方）
} as const

export type KamokuBunrui = (typeof KAMOKU_BUNRUI)[keyof typeof KAMOKU_BUNRUI]
export type KamokuBunruiType =
  (typeof KAMOKU_BUNRUI_TYPE)[keyof typeof KAMOKU_BUNRUI_TYPE]
