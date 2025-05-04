export const KAMOKU_BUNRUI = {
  ASSET: '1', // 資産
  LIABILITY: '2', // 負債
  EQUITY: '3', // 資本
  REVENUE: '4', // 収益
  EXPENSE: '5', // 費用
  TAX: '6', // 税金
} as const

export const KAMOKU_BUNRUI_TYPE = {
  LEFT: 'L', // 左側（借方）
  RIGHT: 'R', // 右側（貸方）
} as const

export type KamokuBunrui = (typeof KAMOKU_BUNRUI)[keyof typeof KAMOKU_BUNRUI]
export type KamokuBunruiType =
  (typeof KAMOKU_BUNRUI_TYPE)[keyof typeof KAMOKU_BUNRUI_TYPE]
