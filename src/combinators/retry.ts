import { local } from 'fp-ts/ReaderTaskEither'
import { mapSnd } from 'fp-ts/Tuple'

import type { Combinator } from '..'
import { ExtendedRequestInit, RETRY } from '../internal'

/**
 * Indicating how long should the next retry be delayed.
 *
 * If the value is `undefined` or `null`, the monad will not be retried anymore.
 *
 * It is returned by the {@link Strategy}.
 */
export type Policy = number | undefined | null

/**
 * Strategy will be called if there is an error detected.
 *
 * It is a function that takes the error, the number of times it has been retried,
 * and the **final** {@link RequestInit}.
 *
 * See {@link Policy} for how it works.
 */
export type Strategy<E> = {
  (error: E, times: number, init: RequestInit): Policy
}

/**
 * Retry the whole monad if an error is detected. The order will not affect
 * how this combinator works, and it is allowed to be used multiple times.
 *
 * In case of multiple `retry` combinators, the largest {@link Policy} (delay time)
 * will be used. If all of the {@link Strategy} returns `null` or `undefined`,
 * the monad will not be retried anymore.
 *
 * @param strategy The {@link Strategy}
 *
 * @category combinators
 * @since 4.7.0
 */
export function retry<E, A>(strategy: Strategy<E>): Combinator<E, A> {
  return local(
    mapSnd((x: ExtendedRequestInit<E>): ExtendedRequestInit<E> => {
      if (!x[RETRY]) x[RETRY] = []
      x[RETRY].push(strategy)
      return x
    }),
  )
}
