import type { ReaderTaskEither } from 'fp-ts/ReaderTaskEither'
import type { TaskEither } from 'fp-ts/TaskEither'
import type { Either } from 'fp-ts/Either'
import { match, left, right } from 'fp-ts/Either'
import { identity, pipe } from 'fp-ts/function'
import { BASE_URL, ExtendedRequestInit, RETRY, SIGNAL, U } from './internal'

/**
 * [`FetchM`](#fetchm-type-alias) Monad Environment.
 *
 * This is the same as the parameters of the `fetch` function.
 *
 * @category types
 * @since 1.0.0
 */
export type Config = [string, RequestInit]

/**
 * Main Monad of this package. The stack contains
 *
 * - A Reader of [`Config`](#config-type-alias)
 * - A `TaskEither` represents an asynchronous computation which can yield result `A` or raise an Error of type `E` eventually.
 *
 * @category types
 * @since 1.0.0
 */
export type FetchM<E, A> = ReaderTaskEither<Config, E, A>

/**
 * Inspect the error type for a [`FetchM`](#fetchm-type-alias).
 *
 * @category types
 * @since 2.10.0
 */
export type InspectError<M> = M extends FetchM<infer E, unknown> ? E : never

/**
 * Inspect the return type for a [`FetchM`](#fetchm-type-alias).
 *
 * @category types
 * @since 2.10.0
 */
export type InspectReturn<M> = M extends FetchM<unknown, infer A> ? A : never

/**
 * A mapping from type `S` to an arbitrary error type `E`.
 *
 * @category types
 * @since 1.0.0
 */
export type MapError<E, S = unknown> = (s: S) => E

/**
 * A built-in instance for [`MapError`](#maperror-type-alias).
 *
 * This will directly throw any error.
 *
 * @param e Arbitrary data to be thrown as an {@link Error}
 *
 * @category error handlers
 * @since 1.0.0
 */
export function bail(e: unknown): never {
  if (e instanceof Error) {
    throw e
  } else {
    throw new Error(`${e}`)
  }
}

/**
 * Transform from one [`FetchM`](#fetchm-type-alias) to another [`FetchM`](#fetchm-type-alias).
 *
 * A combinator is an alias for a function mapping from one [`FetchM`](#fetchm-type-alias) to
 * another [`FetchM`](#fetchm-type-alias).
 *
 * Before 2.2.0, previous errors union will always get preserved. But starting
 * from 2.2.0, the type signature is relaxed to allow you to create combinators that
 * recover the errors, or conditionally applied.
 *
 * @category types
 * @since 1.0.0
 */
export type Combinator<E1, A, E2 = E1, B = A> = (
  m: FetchM<E1, A>,
) => FetchM<E2, B>

/**
 * Create an instance of [`FetchM`](#fetchm-type-alias) by providing how to map possible errors and optional `fetch` implementation.
 *
 * @param mapError An instance of {@link MapError}
 * @param fetchImpl An implementation of {@link fetch}
 * @returns An instance of {@link FetchM}
 *
 * @category constructors
 * @since 1.0.0
 */
export function mkRequest<E>(
  mapError: MapError<E>,
  fetchImpl?: typeof fetch,
): FetchM<E, Response> {
  return ([input, init]: [string, ExtendedRequestInit<E>]) => {
    async function f(): Promise<Either<E, Response>> {
      const b = init[BASE_URL],
        u = init[U],
        s = init[SIGNAL]

      let url: URL
      if (b) {
        try {
          url = new URL(input, b[0])
        } catch (e) {
          return left(b[1](e))
        }
      } else {
        try {
          url = new URL(input)
        } catch (e) {
          return left(mapError(e))
        }
      }

      // TODO: Take a look at the specification to see if it is possible to throw
      if (u) {
        if (u.params) {
          url.search = new URLSearchParams(u.params).toString()
        }

        if (u.password) {
          url.password = u.password
        }

        if (u.username) {
          url.username = u.username
        }

        if (u.port) {
          url.port = u.port.toString()
        }
      }

      try {
        return right(await (fetchImpl ?? fetch)(url.href, init))
      } catch (e) {
        if (s && e instanceof DOMException && e.name === 'AbortError') {
          return left(s(e))
        }

        return left(mapError(e))
      }
    }

    return async () => {
      let r = await f(),
        times = 0

      while (r._tag === 'Left') {
        const e = r.left,
          ds = init[RETRY]?.map(s => s(e, times, init)).filter(
            (n): n is number => typeof n === 'number',
          ),
          delay = ds && ds.length > 0 ? Math.max(...ds) : undefined

        if (delay === undefined) break

        await new Promise(resolve => setTimeout(resolve, delay)).then(
          async () => {
            r = await f()
            times += 1
          },
        )
      }

      delete init[BASE_URL]
      delete init[U]
      delete init[SIGNAL]
      delete init[RETRY]

      return r
    }
  }
}

/**
 * A special instance of [`FetchM`](#fetchm-type-alias) which always [`bail`](#bail)s errors and utilizes global `fetch`.
 *
 * @category constructors
 * @since 1.0.0
 */
export const request = /* #__PURE__ */ mkRequest(bail)

/**
 * Run the main Monad [`FetchM`](#fetchm-type-alias).
 *
 * This is the same as calling `fetch` function, or the Monad [`FetchM`](#fetchm-type-alias) itself.
 *
 * @param input URL
 * @param init Request init {@link RequestInit}
 *
 * @category destructors
 * @since 1.0.0
 */
// prettier-ignore
export const runFetchM = /* #__PURE__ */
    <E, A>(input: string, init?: RequestInit) =>
    (m: FetchM<E, A>): TaskEither<E, A> =>
      m([input, init ?? {}])

/**
 * Call [`runFetchM`](#runfetchm) returned `TaskEither` to produce a `Promise`.
 *
 * @param input URL
 * @param init Request init {@link RequestInit}
 *
 * @category destructors
 * @since 2.11.0
 */
// prettier-ignore
export const runFetchMP = /* #__PURE__ */
  <E, A>(input: string, init?: RequestInit) =>
  (m: FetchM<E, A>) =>
    m([input, init ?? {}])()

/**
 * Throw the left value from [`runFetchMP`](#runfetchmp).
 *
 * @param input URL
 * @param init Request init {@link RequestInit}
 *
 * @category destructors
 * @since 2.11.0
 */
// prettier-ignore
export const runFetchMPT = /* #__PURE__ */
  <E, A>(input: string, init?: RequestInit) =>
  async (m: FetchM<E, A>) =>
    pipe(
      await m([input, init ?? {}])(),
      match(bail, identity),
    )

/**
 * Lazy version of [`runFetchMPT`](#runfetchmpt).
 *
 * @param input URL
 * @param init Request init {@link RequestInit}
 *
 * @category destructors
 * @since 2.15.0
 */
// prettier-ignore
export const runFetchMPTL = /* #__PURE__ */
  <E, A>(input: string, init?: RequestInit) =>
  (m: FetchM<E, A>) =>
  async () =>
    pipe(
      await m([input, init ?? {}])(),
      match(bail, identity),
    )

/**
 * The flipped version of [`runFetchM`](runfetchm).
 *
 * @param m The Monad {@link FetchM}
 *
 * @category destructors
 * @since 2.7.0
 */
// prettier-ignore
export const runFetchMFlipped = /* #__PURE__ */
  <E, A>(m: FetchM<E, A>) =>
  (input: string, init?: RequestInit) =>
    m([input, init ?? {}])

/**
 * Call [`runFetchMFlipped`](#runfetchmflipped) returned `TaskEither` to produce a `Promise`.
 *
 * @param m The Monad {@link FetchM}
 *
 * @category destructors
 * @since 2.9.0
 */
// prettier-ignore
export const runFetchMFlippedP = /* #__PURE__ */
  <E, A>(m: FetchM<E, A>) =>
  (input: string, init?: RequestInit) =>
    m([input, init ?? {}])()

/**
 * Throw the left value from [`runFetchMFlippedP`](#runfetchmflippedpt).
 *
 * @param m The Monad {@link FetchM}
 *
 * @category destructors
 * @since 2.9.0
 */
// prettier-ignore
export const runFetchMFlippedPT = /* #__PURE__ */
  <E, A>(m: FetchM<E, A>) =>
  async (input: string, init?: RequestInit) =>
    pipe(
      await m([input, init ?? {}])(),
      match(bail, identity),
    )

/**
 * Lazy version of [`runFetchMFlippedP`](#runfetchmflippedp).
 *
 * @param m The Monad {@link FetchM}
 *
 * @category destructors
 * @since 2.15.0
 */
// prettier-ignore
export const runFetchMFlippedPTL = /* #__PURE__ */
  <E, A>(m: FetchM<E, A>) =>
  (input: string, init?: RequestInit) =>
  async () =>
    pipe(
      await m([input, init ?? {}])(),
      match(bail, identity),
    )

export * from './combinators'
