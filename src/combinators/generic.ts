/**
 * @since 2.1.1
 */
import type { Refinement } from 'fp-ts/Refinement'
import type { Either } from 'fp-ts/Either'
import { left as leftE, right as rightE } from 'fp-ts/Either'
import {
  ask,
  chain,
  chainEitherKW,
  chainFirstIOK,
  chainW,
  fromEither,
  left,
  local,
} from 'fp-ts/ReaderTaskEither'
import { of } from 'fp-ts/IO'
import type { Lazy } from 'fp-ts/function'
import { flow, pipe } from 'fp-ts/function'

import type { Combinator, Config, MapError } from '..'

/**
 * Guard the value in the pipeline.
 *
 * @since 2.13.0
 *
 * @param refinement A {@link Refinement} determine whether the branch should be
 * called
 * @param otherwise Called when the predicate is false
 */
export const guard = /* #__PURE__ */ <E, F, A, B extends A>(
  refinement: Refinement<A, B>,
  otherwise: MapError<F, A>,
): Combinator<E, A, E | F, B> =>
  chainEitherKW(a => (refinement(a) ? rightE(a) : pipe(a, otherwise, leftE)))

/**
 * Throw if the value meets.
 *
 * @since 2.14.0
 *
 * @param refinement A {@link Refinement} determine whether the branch
 * should be called
 * @param then Called when the predicate is true
 */
export const when = /* #__PURE__ */ <E, F, A, B extends A>(
  refinement: Refinement<A, B>,
  then: MapError<F, B>,
): Combinator<E, A, E | F, A> =>
  chainEitherKW(a => (refinement(a) ? pipe(a, then, leftE) : rightE(a)))

/**
 * Throw an error
 *
 * @param error
 *
 * @since 2.2.1
 */
export const fail = <E, A, F>(error: Lazy<F>): Combinator<E, A, E | F, A> =>
  flow(error, left)

/**
 * Inspect the value
 *
 * @since 3.3.0
 */
export const inspect = /* #__PURE__ */ <E, A>(
  inspector: (a: A) => void,
): Combinator<E, A> => chainFirstIOK(flow(inspector, of))

/**
 * Abuse version of {@link local}, which might raise an error.
 *
 * @since 2.2.3
 */
// prettier-ignore
export const localE = /* #__PURE__ */
  <E, A, F>(f: (a: Config) => Either<F, Config>): Combinator<E, A, E | F> =>
  m =>
    pipe(
      ask<Config>(),
      chain<Config, F, Config, Config>(flow(f, fromEither)),
      chainW(x =>
        pipe(
          m,
          local(() => x),
        ),
      ),
    )
