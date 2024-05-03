import numeral from 'numeral'

type Months = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
export function getNendoMonth(nendo: number, mm: Months) {
  if (mm < 4) {
    nendo++
  }
  let mmstr = `${mm}`
  if (mmstr.length === 1) {
    mmstr = `0${mmstr}`
  }
  return `${nendo}/${mmstr}`
}

export function isMonth(month: string) {
  const value = numeral(month)
  const n = value.value()
  if (n === null) {
    return false
  }
  return n >= 1 && n <= 12
}
