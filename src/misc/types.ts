export type Nullable<T> = { [K in keyof T]: T[K] | null }
export type NullableOptional<T> = Partial<Nullable<T>>
export type StringProps<T> = { [P in keyof T]: string }
