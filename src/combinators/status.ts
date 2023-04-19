/**
 * @since 1.0.0
 */
import type { Predicate } from 'fp-ts/Predicate'
import { pipe } from 'fp-ts/function'

import type { Combinator, MapError } from '..'
import { bail, guard } from '..'

/**
 * Guard the `Response` status code.
 *
 * @param statusIsValid An predication whether the status code is valid.
 * @param otherwise An instance of {@link MapError}
 *
 * @category combinators
 * @since 1.0.0
 * @since 4.2.0 A bail version is available
 */
export function ensureStatus<E>(
  predicate: Predicate<number>,
): Combinator<E, Response>
export function ensureStatus<E, F>(
  predicate: Predicate<number>,
  mapError: MapError<F, Response>,
): Combinator<E, Response, E | F>
export function ensureStatus<E, F>(
  predicate: Predicate<number>,
  mapError: MapError<F, Response> = bail,
): Combinator<E, Response, E | F> {
  return guard(
    (resp): resp is Response => pipe(resp.status, predicate),
    mapError,
  )
}
