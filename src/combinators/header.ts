import { local } from 'fp-ts/ReaderTaskEither'
import { mapSnd } from 'fp-ts/Tuple'

import type { Combinator } from '..'

/**
 * Collect {@link HeadersInit} as {@link Record}, where keys and values are both {@link string}
 *
 * @param headers Headers {@link HeadersInit}
 * @returns Record `Record<string, string>`
 *
 * @since 1.0.0
 */
export const toRecord = /* #__PURE__ */ (
  headers: HeadersInit,
): Record<string, string> => {
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers)
  } else if (headers instanceof Headers) {
    const obj: Record<string, string> = {}
    headers.forEach((v, k) => (obj[k] = v))
    return obj
  } else {
    return headers
  }
}

/**
 * Merge two {@link HeadersInit} into one {@link HeadersInit}.
 *
 * @param into The target {@link HeadersInit}, entries might be overwritten.
 * @param from The source {@link HeadersInit}, entries must persist.
 * @returns Headers {@link HeadersInit}
 *
 * @since 1.0.0
 */
export const merge = /* #__PURE__ */ (
  into: HeadersInit,
  from: HeadersInit,
): HeadersInit => ({
  ...toRecord(into),
  ...toRecord(from),
})

/**
 * Set request headers
 *
 * @param headers Headers like {@link HeadersInit}
 *
 * @since 1.0.0
 */
export const withHeaders = /* #__PURE__ */ <E, A>(
  headers: HeadersInit,
): Combinator<E, A> =>
  local(mapSnd(x => ({ headers: merge(headers, x.headers ?? {}), ...x })))
