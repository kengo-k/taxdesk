import numeral from 'numeral'

export interface PagingRequest {
  page_no: number | undefined
  page_size: number | undefined
}

export interface PagingResponse {
  all_count: number
  from_count: number
  to_count: number
  page_count: number
}

export function getPagingOffset(paging: PagingRequest) {
  if (paging.page_no == null || paging.page_size == null) {
    return 0
  }
  return (paging.page_no - 1) * paging.page_size
}

export class PageNo {
  private _value: number
  private constructor(value: number) {
    this._value = value
  }
  public static create(
    value: string | number | undefined | null,
    default_value: number = 1,
  ): PageNo {
    if (value == null) {
      value = default_value
    } else {
      value = numeral(value).value()
      if (value == null) {
        value = default_value
      }
    }
    return new PageNo(value)
  }
  public get value() {
    return this._value
  }
}

export function toPageNo(page_no: PageNo): number {
  return page_no.value
}

export class PageSize {
  private _value: number
  private constructor(value: number) {
    this._value = value
  }
  public static create(
    value: string | number | undefined | null,
    default_value: number = 10,
  ): PageSize {
    if (value == null) {
      value = default_value
    } else {
      value = numeral(value).value()
      if (value == null) {
        value = default_value
      }
    }
    return new PageSize(value)
  }
  public get value() {
    return this._value
  }
}

export function toPageSize(page_size: PageSize): number {
  return page_size.value
}

export function getPageCount(all_count: number, page_size: PageSize): number {
  return Math.ceil(all_count / page_size.value)
}
