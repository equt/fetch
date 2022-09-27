/**
 * @since 1.0.0
 */
import { local } from 'fp-ts/ReaderTaskEither'
import { mapSnd } from 'fp-ts/Tuple'

import type { Combinator, MapError } from '..'
import { bail } from '..'

type MaybeURLLike = URL | string | undefined

/**
 * Set the base URL for the request.
 *
 * @param url The base URL
 * @param mapError An instance of {@link MapError}, if omitted, {@link bail} will be used instead.
 *
 * @since 1.0.0
 */
export function withBaseURL<E, F, A>(
  url: MaybeURLLike,
  mapError: MapError<F>,
): Combinator<E, A, E | F>
export function withBaseURL<E, A>(url: MaybeURLLike): Combinator<E, A>
export function withBaseURL<E, F, A>(
  url: MaybeURLLike,
  mapError: MapError<F> = bail,
): Combinator<E, A, E | F> {
  return local(
    mapSnd(x => ({
      _BASE_URL: url,
      _BASE_URL_MAP_ERROR: mapError,
      ...x,
    })),
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
 * @since 2.0.0
 */
export const withURLSearchParams = /* #__PURE__ */ <E, A>(
  params: Record<string, string>,
): Combinator<E, A> => {
  type ExtendedRequestInit = RequestInit & {
    _URL_SEARCH_PARAMS?: Record<string, string>
  }

  return local(
    mapSnd(x => {
      const { _URL_SEARCH_PARAMS, ...rest } = x as ExtendedRequestInit
      return {
        _URL_SEARCH_PARAMS: {
          ...params,
          ..._URL_SEARCH_PARAMS,
        },
        ...rest,
      }
    }),
  )
}

/**
 * Set password.
 *
 * If this combinator occurs more than one time in the pipeline, the latter set parameters will
 * override the previous one.
 *
 * @param password The password
 *
 * @since 3.3.0
 */
export const withPassword = /* #__PURE__ */ <E, A>(
  password: string,
): Combinator<E, A> => {
  type ExtendedRequestInit = RequestInit & {
    _URL_PASSWORD?: string
  }

  return local(
    mapSnd(x => {
      return {
        _URL_PASSWORD: password,
        ...(x as ExtendedRequestInit),
      }
    }),
  )
}

/**
 * Set username.
 *
 * If this combinator occurs more than one time in the pipeline, the latter set parameters will
 * override the previous one.
 *
 * @param username The username
 *
 * @since 3.3.0
 */
export const withUsername = /* #__PURE__ */ <E, A>(
  username: string,
): Combinator<E, A> => {
  type ExtendedRequestInit = RequestInit & {
    _URL_USERNAME?: string
  }

  return local(
    mapSnd(x => {
      return {
        _URL_USERNAME: username,
        ...(x as ExtendedRequestInit),
      }
    }),
  )
}

/**
 * Set port.
 *
 * If this combinator occurs more than one time in the pipeline, the latter set parameters will
 * override the previous one.
 *
 * @param port The port
 *
 * @since 3.3.0
 */
export const withPort = /* #__PURE__ */ <E, A>(
  port: number | string,
): Combinator<E, A> => {
  type ExtendedRequestInit = RequestInit & {
    _URL_PORT?: number | string
  }

  return local(
    mapSnd(x => {
      return {
        _URL_PORT: port,
        ...(x as ExtendedRequestInit),
      }
    }),
  )
}
