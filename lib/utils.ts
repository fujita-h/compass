export function getAsString(value: string | string[]): string {
    return Array.isArray(value) ? value[0] : value
}

