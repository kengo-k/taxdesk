// 金額のフォーマット
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ja-JP").format(amount)
}

// ページ番号の配列を生成
export const getPageNumbers = (currentPage: number, totalPages: number): (number | string)[] => {
  const pageNumbers = []
  const maxPagesToShow = 5 // 中央に表示するページ数

  // 常に最初のページを表示
  pageNumbers.push(1)

  // 現在のページの前後のページを表示
  let startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2))
  const endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1)

  // 表示するページが少ない場合は調整
  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(2, endPage - maxPagesToShow + 1)
  }

  // 省略記号を表示するかどうか
  if (startPage > 2) {
    pageNumbers.push("...")
  }

  // 中央のページ番号を追加
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i)
  }

  // 最後のページへの省略記号
  if (endPage < totalPages - 1) {
    pageNumbers.push("...")
  }

  // 常に最後のページを表示（ただし1ページだけの場合は表示しない）
  if (totalPages > 1) {
    pageNumbers.push(totalPages)
  }

  return pageNumbers
}
