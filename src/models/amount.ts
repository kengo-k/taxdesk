import numeral from 'numeral'

export class Amount {
  private _value: number
  private constructor(_value: number) {
    this._value = _value
  }
  public get value() {
    return this._value
  }
  public static create(value: number) {
    return new Amount(value)
  }
  public static fromString(value: string): Amount | null {
    const num = numeral(value).value()
    if (num === null) {
      return null
    }
    return Amount.create(num)
  }
  public toFormatedString(): string {
    const num = numeral(this._value)
    return num.format('0,0')
  }
  public toRawString(): string {
    return String(this._value)
  }
}
