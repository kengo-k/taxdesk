// 金額のフォーマット
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP').format(amount)
}
