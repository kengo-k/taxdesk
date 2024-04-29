export type Nullable<T> = { [K in keyof T]: T[K] | null }
export type NullableOptional<T> = Partial<Nullable<T>>
