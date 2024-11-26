export type Optional<T> = {
  [K in keyof T]?: T[K] extends object ? T[K] extends Record<string, unknown> ? T[K] : Optional<T[K]> : T[K]
}
