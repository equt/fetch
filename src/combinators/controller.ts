import { chain, chainFirst, local, rightIO } from 'fp-ts/ReaderTaskEither'
import { mapSnd } from 'fp-ts/Tuple'
import { pipe } from 'fp-ts/function'

import type { Lazyable } from '../utils'
import { bail, Combinator, MapError } from '..'
import { eager } from '../utils'

/**
 * Set an abort signal.
 *
 * @param signal Abort signal {@link AbortSignal}
 * @param mapError An instance of {@link MapError}
 *
 * @since 1.0.0
 */
export function withSignal<E, A, F>(
  signal: Lazyable<AbortSignal>,
  mapError: MapError<F>,
): Combinator<E, A, E | F>
export function withSignal<E, A>(
  signal: Lazyable<AbortSignal>,
): Combinator<E, A>
export function withSignal<E, A, F>(
  signal: Lazyable<AbortSignal>,
  mapError: MapError<F> = bail,
): Combinator<E, A, E | F> {
  // How could this even be possible? See the impl details of `mkRequest`
  return local(
    mapSnd(x => ({ signal: eager(signal), _ABORT_MAP_ERROR: mapError, ...x })),
  )
}

/**
 * Set the request timeout.
 *
 * @param milliseconds Duration in milliseconds
 * @param mapError An instance of {@link MapError}
 *
 * @since 1.0.0
 */
export function withTimeout<E, A, F>(
  milliseconds: Lazyable<number>,
  mapError: MapError<F>,
): Combinator<E, A, E | F>
export function withTimeout<E, A>(
  milliseconds: Lazyable<number>,
): Combinator<E, A>
export function withTimeout<E, A, F>(
  milliseconds: Lazyable<number>,
  mapError: MapError<F> = bail,
): Combinator<E, A, E | F> {
  return m => {
    let controller: AbortController

    return pipe(
      rightIO(() => {
        controller = new AbortController()
        return setTimeout(() => controller.abort(), eager(milliseconds))
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
