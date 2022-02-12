export function getAsString(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}
