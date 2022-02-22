import { match } from 'fp-ts/Either'
import type { ReaderTaskEither } from 'fp-ts/ReaderTaskEither'
import type { TaskEither } from 'fp-ts/TaskEither'
import { chain, map, right, tryCatch } from 'fp-ts/TaskEither'
import { snd } from 'fp-ts/Tuple'
import type { Lazy } from 'fp-ts/function'
import { identity, pipe, tupled } from 'fp-ts/function'

import { eager } from './utils'

/**
 * {@link FetchM} Monad Environment.
 *
 * This is the same as the parameters of the {@link fetch} function.
 *
 * @since 1.0.0
 */
export type Config = [string, RequestInit]

/**
 * Main Monad of this package. The stack contains
 *
 * - A Reader of {@link Config}
 * - A {@link TaskEither} represents an asynchronous computation which can yield result `A` or raise an Error of type `E` eventually.
 *
 * @since 1.0.0
 */
export type FetchM<E, A> = ReaderTaskEither<Config, E, A>

/**
 * Inspect the error type for a {@link FetchM}.
 *
 * @since 2.10.0
 */
export type InspectError<M> = M extends FetchM<infer E, unknown> ? E : never

/**
 * Inspect the return type for a {@link FetchM}.
 *
 * @since 2.10.0
 */
export type InspectReturn<M> = M extends FetchM<unknown, infer A> ? A : never

/**
 * A mapping from type `S` to an arbitrary error type `E`.
 *
 * @since 1.0.0
 */
export type MapError<E, S = unknown> = (s: S) => E

/**
 * A built-in instance for {@link MapError}.
 *
 * @param e Arbitrary data to be thrown as an {@link Error}
 *
 * @since 1.0.0
 */
export const bail: MapError<never> = e => {
  if (e instanceof Error) {
    throw e
  } else {
    throw new Error(`${e}`)
  }
}

/**
 * Transform from one {@link FetchM} to another {@link FetchM}.
 *
 * A combinator is an alias for a function mapping from one {@link FetchM} to
 * another {@link FetchM}.
 *
 * Before 2.2.0, previous errors union will always get preserved. But starting
 * from 2.2.0, the type signature is relaxed to allow you to create combinators that
 * recover the errors, or conditionally applied.
 *
 * @since 1.0.0
 */
export type Combinator<E1, A, E2 = E1, B = A> = (
  m: FetchM<E1, A>,
) => FetchM<E2, B>

const buildBaseURL = <E>(config: Config): TaskEither<E, Config> => {
  type ExtendedRequestInit = RequestInit & {
    _BASE_URL: URL | string | undefined
    _BASE_URL_MAP_ERROR: MapError<E>
  }

  const [input, init] = config

  if (
    (init as ExtendedRequestInit)._BASE_URL_MAP_ERROR
    // N.B. _BASE_URL might be undefined
  ) {
    // TODO Remove the internal data
    return pipe(
      tryCatch(
        () =>
          Promise.resolve(
            new URL(input, (init as ExtendedRequestInit)._BASE_URL).href,
          ),
        (init as ExtendedRequestInit)._BASE_URL_MAP_ERROR,
      ),
      map<string, Config>(s => [s, init]),
    )
  }

  return right(config)
}

// NOTE This has to be called after the buildBaseURL, since it assume the `input`
// in the config is always a valid URL.
const buildURLParams = (config: Config): Config => {
  type ExtendedRequestInit = RequestInit & {
    _URL_SEARCH_PARAMS: Record<string, string>
  }

  const [input, init] = config

  if ((init as ExtendedRequestInit)._URL_SEARCH_PARAMS) {
    // We simply assume the input is a valid URL
    const url = new URL(input)
    url.search = new URLSearchParams(
      (init as ExtendedRequestInit)._URL_SEARCH_PARAMS,
    ).toString()
    return [url.href, init]
  }
  return config
}

/**
 * Create an instance of {@link FetchM} by providing how to map possible errors and optional {@link fetch} implementation.
 *
 * @param mapError An instance of {@link MapError}
 * @param fetchImpl An implementation of {@link fetch}
 * @returns An instance of {@link FetchM}
 *
 * @since 1.0.0
 */
export const mkRequest =
  <E>(mapError: MapError<E>, fetchImpl?: typeof fetch): FetchM<E, Response> =>
  r =>
    pipe(
      buildBaseURL<E>(r),
      map(r => buildURLParams(r)),
      chain(r =>
        tryCatch(
          () => tupled(fetchImpl ?? fetch)(r),
          e => {
            // For two controller combinators, a.k.a., withSignal & withTimeout, we could have
            // two `MapError` passed in. But that is technically not even possible, since the
            // abortion error is raised only when the `fetch` Promise is getting resolved.
            // The trick here is we abuse the reader env to pass the `MapError` down, and when
            // resolving the `fetch` Promise, we search for that special key. So on the user side,
            // it seems like the error handling part `MapError` is right inside the combinator.

            type ExtendedRequestInit = RequestInit & {
              _ABORT_MAP_ERROR: MapError<unknown>
            }

            const init = snd(r)
            if (
              // If the key exists, indicating user has used either of two controller combinators
              (init as ExtendedRequestInit)._ABORT_MAP_ERROR &&
              // and not that the DOMException error only raises on abortion.
              e instanceof DOMException &&
              e.name === 'AbortError'
            ) {
              // We cast the error into `E` to satisfy the compiler, but we know we have set the correct
              // error type in the combinator itself, so the error type union must contain the right
              // type.
              return (init as ExtendedRequestInit)._ABORT_MAP_ERROR(e) as E
            }
            return mapError(e)
          },
        ),
      ),
    )

/**
 * A special instance of {@link FetchM} which always {@link bail}s errors and utilizes global {@link fetch}.
 *
 * @since 1.0.0
 */
export const request = mkRequest(bail)

/**
 * Run the main Monad {@link FetchM}.
 *
 * This is the same as calling {@link fetch} function, or the Monad {@link FetchM} itself.
 *
 * @param input URL
 * @param init Request init {@link RequestInit}
 *
 * @since 1.0.0
 */
export const runFetchM =
  <E, A>(
    input: string | Lazy<string>,
    init?: RequestInit | Lazy<RequestInit>,
  ) =>
  (m: FetchM<E, A>): TaskEither<E, A> =>
    m([eager(input), eager(init) ?? {}])

/**
 * Call {@link runFetchM} returned {@link TaskEither} to produce a {@link Promise}.
 *
 * @param input URL
 * @param init Request init {@link RequestInit}
 *
 * @since 2.11.0
 */
export const runFetchMP =
  <E, A>(
    input: string | Lazy<string>,
    init?: RequestInit | Lazy<RequestInit>,
  ) =>
  (m: FetchM<E, A>) =>
    m([eager(input), eager(init) ?? {}])()

/**
 * Throw the left value from {@link runFetchMP}.
 *
 * @param input URL
 * @param init Request init {@link RequestInit}
 *
 * @since 2.11.0
 */
export const runFetchMPT =
  <E, A>(
    input: string | Lazy<string>,
    init?: RequestInit | Lazy<RequestInit>,
  ) =>
  async (m: FetchM<E, A>) =>
    pipe(
      await m([eager(input), eager(init) ?? {}])(),
      match(e => {
        throw e
      }, identity),
    )

/**
 * The flipped version of {@link runFetchM}.
 *
 * @param m The Monad {@link FetchM}
 *
 * @since 2.7.0
 */
export const runFetchMFlipped =
  <E, A>(m: FetchM<E, A>) =>
  (input: string | Lazy<string>, init?: RequestInit | Lazy<RequestInit>) =>
    m([eager(input), eager(init) ?? {}])

/**
 * Call {@link runFetchMFlipped} returned {@link TaskEither} to produce a {@link Promise}.
 *
 * @param m The Monad {@link FetchM}
 *
 * @since 2.9.0
 */
export const runFetchMFlippedP =
  <E, A>(m: FetchM<E, A>) =>
  (input: string | Lazy<string>, init?: RequestInit | Lazy<RequestInit>) =>
    m([eager(input), eager(init) ?? {}])()

/**
 * Throw the left value from {@link runFetchMFlippedP}.
 *
 * @param m The Monad {@link FetchM}
 *
 * @since 2.9.0
 */
export const runFetchMFlippedPT =
  <E, A>(m: FetchM<E, A>) =>
  async (
    input: string | Lazy<string>,
    init?: RequestInit | Lazy<RequestInit>,
  ) =>
    pipe(
      await m([eager(input), eager(init) ?? {}])(),
      match(e => {
        throw e
      }, identity),
    )
