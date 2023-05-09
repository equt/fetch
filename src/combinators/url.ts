/**
 * @since 1.0.0
 */
import { local } from 'fp-ts/ReaderTaskEither'
import { mapSnd } from 'fp-ts/Tuple'

import { bail, Combinator, MapError } from '..'
import { BASE_URL, ExtendedRequestInit, U } from '../internal'

type URLLike = URL | string | undefined

/**
 * Set the base URL for the request.
 *
 * @param url The base URL
 * @param mapError An instance of {@link MapError}, if omitted, {@link bail} will be used instead.
 *
 * @category combinators
 * @since 1.0.0
 */
export function withBaseURL<E, F, A>(
  url: URLLike,
  mapError: MapError<F>,
): Combinator<E, A, E | F>
export function withBaseURL<E, A>(url: URLLike): Combinator<E, A>
export function withBaseURL<E, F, A>(
  url: URLLike,
  mapError: MapError<F> = bail,
): Combinator<E, A, E | F> {
  return local(
    mapSnd(
      (x): ExtendedRequestInit<E | F> => ({
        [BASE_URL]: [url, mapError],
        ...x,
      }),
    ),
  )
}

/**
 * Set URL search parameters.
 *
 * If this combinator occurs more than one time in the pipeline, the latter set parameters will
 * merge into the previous set ones.
 *
 * @param params URL parameters in `Record<string, string>`
 *
 * @category combinators
 * @since 2.0.0
 */
export const withURLSearchParams = /* #__PURE__ */ <E, A>(
  params: Record<string, string>,
): Combinator<E, A> =>
  local(
    mapSnd((x: ExtendedRequestInit<E>): ExtendedRequestInit<E> => {
      if (!x[U]) x[U] = {}
      x[U].params = { ...params, ...x[U].params }
      return x
    }),
  )

/**
 * Set password.
 *
 * If this combinator occurs more than one time in the pipeline, the latter set parameters will
 * override the previous one.
 *
 * @param password The password
 *
 * @category combinators
 * @since 3.3.0
 */
export const withPassword = /* #__PURE__ */ <E, A>(
  password: string,
): Combinator<E, A> =>
  local(
    mapSnd((x: ExtendedRequestInit<E>): ExtendedRequestInit<E> => {
      if (!x[U]) x[U] = {}
      x[U] = { password, ...x[U] }
      return x
    }),
  )

/**
 * Set username.
 *
 * If this combinator occurs more than one time in the pipeline, the latter set parameters will
 * override the previous one.
 *
 * @param username The username
 *
 * @category combinators
 * @since 3.3.0
 */
export const withUsername = /* #__PURE__ */ <E, A>(
  username: string,
): Combinator<E, A> =>
  local(
    mapSnd((x: ExtendedRequestInit<E>): ExtendedRequestInit<E> => {
      if (!x[U]) x[U] = {}
      x[U] = { username, ...x[U] }
      return x
    }),
  )

/**
 * Set port.
 *
 * If this combinator occurs more than one time in the pipeline, the latter set parameters will
 * override the previous one.
 *
 * @param port The port
 *
 * @category combinators
 * @since 3.3.0
 */
export const withPort = /* #__PURE__ */ <E, A>(
  port: number | string,
): Combinator<E, A> =>
  local(
    mapSnd((x: ExtendedRequestInit<E>): ExtendedRequestInit<E> => {
      if (!x[U]) x[U] = {}
      x[U] = { port, ...x[U] }
      return x
    }),
  )
