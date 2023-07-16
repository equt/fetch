/**
 * @since 1.0.0
 */
import { local } from 'fp-ts/ReaderTaskEither'
import { mapSnd } from 'fp-ts/Tuple'

import type { Combinator } from '..'

/**
 * Collect `HeadersInit` as `Record`, where keys and values are both `string`
 *
 * @param headers Headers {@link HeadersInit}
 * @returns Record `Record<string, string>`
 *
 * @category utils
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
 * Merge two `HeadersInit` into one `HeadersInit`.
 *
 * @param into The target {@link HeadersInit}, entries might be overwritten.
 * @param from The source {@link HeadersInit}, entries must persist.
 * @returns Headers {@link HeadersInit}
 *
 * @category utils
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
 * Calling this combinator multiple times will merge all of them instead of overriding.
 *
 * @param headers Headers like {@link HeadersInit}
 *
 * @category combinators
 * @since 1.0.0
 */
export const withHeaders = /* #__PURE__ */ <E, A>(
  headers: HeadersInit,
): Combinator<E, A> =>
  local(
    mapSnd(({ headers: original, ...rest }) => ({
      headers: merge(headers, original ?? {}),
      ...rest,
    })),
  )
