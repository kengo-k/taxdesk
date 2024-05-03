export function removeExtraProperties<T extends object>(obj: any, model: T): T {
  const new_obj = {} as any
  Object.keys(model).forEach((key) => {
    if (obj.hasOwnProperty(key)) {
      new_obj[key] = obj[key]
    }
  })
  return new_obj as T
}

export function createQueryString<T>(obj: T, keys: (keyof T)[]): string {
  const params = keys
    .filter((key) => obj[key] !== undefined && obj[key] !== null)
    .map(
      (key) =>
        `${encodeURIComponent(key as string)}=${encodeURIComponent(obj[key] as string)}`,
    )

  return params.join('&')
}
