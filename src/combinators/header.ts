import type { Combinator, Config } from '../monad'
import { local } from 'fp-ts/ReaderTaskEither'

export const toRecord = (x: HeadersInit): Record<string, string> => {
  if (Array.isArray(x)) {
    return Object.fromEntries(x)
  } else if (x instanceof Headers) {
    const obj: Record<string, string> = {}
    x.forEach((v, k) => (obj[k] = v))
    return obj
  } else {
    return x
  }
}

export const union = (into: HeadersInit, from: HeadersInit): HeadersInit => ({
  ...toRecord(into),
  ...toRecord(from),
})

export const withHeaders = <E extends Error, A>(
  hs: HeadersInit
): Combinator<E, A> =>
  local(
    ({ input, init }): Config => ({
      input,
      init: {
        ...init,
        ...union(hs, init?.headers ?? {}),
      },
    })
  )
