import { DateTime } from 'luxon'
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
  public isInNendo(date: JournalDate) {
    const start = `${this._value}0401`
    const end = `${this._value + 1}0331`
    const raw_date = date.format('yyyyMMdd')
    return raw_date >= start && raw_date <= end
  }
  public getRange(format: AVAILABLE_FORMATS) {
    const start = `${this._value}0401`
    const end = `${this._value + 1}0331`
    return [
      JournalDate.create(start)!.format(format),
      JournalDate.create(end)!.format(format),
    ]
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

function isValidMonth(month: number): month is MonthValue {
  return month >= 1 && month <= 12
}

export class JournalDate {
  private value: DateTime
  private constructor(dateTime: DateTime) {
    this.value = dateTime
  }
  public static create(date: string): JournalDate | null {
    let dateTime: DateTime | null
    if (DATE_REGEXP_FORMATTED.test(date)) {
      dateTime = DateTime.fromFormat(date, 'yyyy/MM/dd')
    } else if (DATE_REGEXP_RAW.test(date)) {
      dateTime = DateTime.fromFormat(date, 'yyyyMMdd')
    } else {
      return null
    }
    return new JournalDate(dateTime)
  }
  public format(format: AVAILABLE_FORMATS): string {
    return this.value.toFormat(format)
  }
}

type MonthValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type AVAILABLE_FORMATS = 'yyyy/MM/dd' | 'yyyyMMdd' | 'yyyy/MM' | 'dd'

const DATE_REGEXP_FORMATTED = /^\d{4}\/\d{2}\/\d{2}$/
const DATE_REGEXP_RAW = /^\d{8}$/
