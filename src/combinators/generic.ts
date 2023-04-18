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
  map as _map,
} from 'fp-ts/ReaderTaskEither'
import { of } from 'fp-ts/IO'
import type { Lazy } from 'fp-ts/function'
import { flow, pipe } from 'fp-ts/function'

import type { Combinator, Config, MapError } from '..'

/**
 * Guard the value in the pipeline.
 *
 * @param refinement A {@link Refinement} determine whether the branch should be
 * called
 * @param otherwise Called when the predicate is false
 *
 * @category combinators
 * @since 2.13.0
 */
export const guard = /* #__PURE__ */ <E, F, A, B extends A>(
  refinement: Refinement<A, B>,
  otherwise: MapError<F, A>,
): Combinator<E, A, E | F, B> =>
  chainEitherKW(a => (refinement(a) ? rightE(a) : pipe(a, otherwise, leftE)))

/**
 * Throw if the value meets.
 *
 * @param refinement A {@link Refinement} determine whether the branch
 * should be called
 * @param then Called when the predicate is true
 *
 * @category combinators
 * @since 2.14.0
 *
 */
export const when = /* #__PURE__ */ <E, F, A, B extends A>(
  refinement: Refinement<A, B>,
  then: MapError<F, B>,
): Combinator<E, A, E | F, A> =>
  chainEitherKW(a => (refinement(a) ? pipe(a, then, leftE) : rightE(a)))

/**
 * Fail the execution.
 *
 * This combinator will immediately terminate the execution, any combinators after this will not be called.
 * It's different from an immediately aborted `withSignal` combinator, as `withSignal` will always try to fire
 * the request. This combinator won't send a request to the server at all, which makes it suit for
 * cases where the request params are invalid.
 *
 * @param error
 *
 * @category combinators
 * @since 2.2.1
 */
export const fail = <E, A, F>(error: Lazy<F>): Combinator<E, A, E | F, A> =>
  flow(error, left)

/**
 * Inspect the value
 *
 * @category combinators
 * @since 3.3.0
 */
export const inspect = /* #__PURE__ */ <E, A>(
  inspector: (a: A) => void,
): Combinator<E, A> => chainFirstIOK(flow(inspector, of))

/**
 * Perform a failable operation.
 *
 * @category combinators
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

/**
 * @category combinators
 * @since 3.5.0
 */
export const map =
  /* #__PURE__ */
  <E, A, B>(f: (a: A) => B): Combinator<E, A, E, B> => _map(f)
