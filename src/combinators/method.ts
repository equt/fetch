import type { Combinator, Config } from '../monad'
import { local } from 'fp-ts/ReaderTaskEither'

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'HEAD' | 'DELETE' | 'OPTION'

export const withMethod = <E extends Error, A>(
  method: HTTPMethod
): Combinator<E, A> =>
  local(
    ({ input, init }): Config => ({
      input,
      init: {
        method,
        ...init,
      },
    })
  )