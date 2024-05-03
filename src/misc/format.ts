import { DateTime } from 'luxon'

const DATE_REGEXP_FORMATTED = /^\d{4}\/\d{2}\/\d{2}$/
const DATE_REGEXP_RAW = /^\d{8}$/

type AVAILABLE_FORMATS = 'yyyy/MM/dd' | 'yyyyMMdd' | 'yyyy/MM' | 'dd'

export function fromDateString(datestr: string): DateTime | null {
  let dateTime: DateTime | null = null

  if (DATE_REGEXP_FORMATTED.test(datestr)) {
    dateTime = DateTime.fromFormat(datestr, 'yyyy/MM/dd')
  } else if (DATE_REGEXP_RAW.test(datestr)) {
    dateTime = DateTime.fromFormat(datestr, 'yyyyMMdd')
  } else {
  }

  return dateTime
}

export function formatDate(date: DateTime, format: AVAILABLE_FORMATS): string {
  return date.toFormat(format)
}
