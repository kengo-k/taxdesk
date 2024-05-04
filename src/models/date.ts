import numeral from 'numeral'

export function toNendoMonthString(nendo: Nendo, mm: Month) {
  let n = nendo.value
  if (mm.value < 4) {
    n++
  }
  let mmstr = `${mm}`
  if (mmstr.length === 1) {
    mmstr = `0${mmstr}`
  }
  return `${n}/${mmstr}`
}

export function toMonthString(month: Month | null): string | null {
  if (month === null) {
    return null
  }
  return month.toString()
}

export function toNendoString(nendo: Nendo): string {
  return nendo.toString()
}

export class Nendo {
  private _value: number
  private constructor(value: number) {
    this._value = value
  }
  public get value() {
    return this._value
  }
  public static create(
    nendo: string,
    available_nendos: string[],
  ): Nendo | null {
    if (available_nendos.includes(nendo)) {
      const value = numeral(nendo).value()
      if (value === null) {
        return null
      }
      return new Nendo(value)
    }
    return null
  }
  public toString(): string {
    return String(this._value)
  }
}

export class Month {
  private _value: MonthValue
  private constructor(value: MonthValue) {
    this._value = value
  }
  public get value() {
    return this._value
  }
  public static create(month: string | undefined): [boolean, Month | null] {
    if (month === undefined) {
      return [true, null]
    }
    const value = numeral(month).value()
    if (value === null) {
      return [false, null]
    }
    if (isValidMonth(value)) {
      return [true, new Month(value)]
    }
    return [false, null]
  }
  public toString(): string {
    const ret = String(this._value)
    if (ret.length === 1) {
      return `0${ret}`
    }
    return ret
  }
}

type MonthValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

function isValidMonth(month: number): month is MonthValue {
  return month >= 1 && month <= 12
}
