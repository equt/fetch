/**
 * @since 1.0.0
 */
import { chain, chainFirst, local, rightIO } from 'fp-ts/ReaderTaskEither'
import { mapSnd } from 'fp-ts/Tuple'
import { pipe } from 'fp-ts/function'

import { bail, Combinator, MapError } from '..'
import { ExtendedRequestInit, SIGNAL } from '../internal'

/**
 * Set an abort signal.
 *
 * Even though you could create multiple abort signals (including both `withSignal` and `withTimeout`),
 * the request will be aborted if any of them is aborted. And only the last combinator will receive the
 * error for handling.
 *
 * @param signal Abort signal {@link AbortSignal}
 * @param mapError An instance of {@link MapError}
 *
 * @category combinators
 * @since 1.0.0
 */
export function withSignal<E, A, F>(
  signal: AbortSignal,
  mapError: MapError<F>,
): Combinator<E, A, E | F>
export function withSignal<E, A>(signal: AbortSignal): Combinator<E, A>
export function withSignal<E, A, F>(
  signal: AbortSignal,
  mapError: MapError<F> = bail,
): Combinator<E, A, E | F> {
  return local(
    mapSnd(
      (x): ExtendedRequestInit<F> => ({ signal, [SIGNAL]: mapError, ...x }),
    ),
  )
}

/**
 * Set the request timeout.
 *
 * Even though you could create multiple abort signals (including both `withSignal` and `withTimeout`),
 * the request will be aborted if any of them is aborted. And only the last combinator will receive the
 * error for handling.
 *
 * @param milliseconds Duration in milliseconds
 * @param mapError An instance of {@link MapError}
 *
 * @category combinators
 * @since 1.0.0
 */
export function withTimeout<E, A, F>(
  milliseconds: number,
  mapError: MapError<F>,
): Combinator<E, A, E | F>
export function withTimeout<E, A>(milliseconds: number): Combinator<E, A>
export function withTimeout<E, A, F>(
  milliseconds: number,
  mapError: MapError<F> = bail,
): Combinator<E, A, E | F> {
  return m => {
    let controller: AbortController

    return pipe(
      rightIO(() => {
        controller = new AbortController()
        return setTimeout(() => controller.abort(), milliseconds)
      }),
      chain(id =>
        pipe(
          m,
          withSignal<E, A, F>(controller.signal, mapError),
          chainFirst(() => rightIO(() => clearTimeout(id))),
        ),
      ),
    )
  }
}
