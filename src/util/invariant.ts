export function invariant(value: any, message?: string): asserts value {
  if (value) {
    return
  }
  throw new Error(message ?? 'Application error')
}
