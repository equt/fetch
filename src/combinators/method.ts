/**
 * @since 1.0.0
 */
import { local } from 'fp-ts/ReaderTaskEither'
import { mapSnd } from 'fp-ts/Tuple'

import type { Combinator } from '..'

/**
 * All possible HTTP methods
 *
 * @since 1.0.0
 */
export type HTTPMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'HEAD'
  | 'DELETE'
  | 'OPTION'
  | 'PATCH'
  | (string & Record<never, never>)

/**
 * Set the request HTTP method.
 *
 * @param method HTTP method {@link HTTPMethod}
 *
 * @since 1.0.0
 */
export const withMethod = /* #__PURE__ */ <E, A>(
  method: HTTPMethod,
): Combinator<E, A> => local(mapSnd(x => ({ method, ...x })))
