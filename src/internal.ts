import { MapError } from '.'
import { Strategy } from './combinators/retry'

export const BASE_URL = Symbol('BU')

export const U = Symbol('U')

export const SIGNAL = Symbol('SG')

export const RETRY = Symbol('R')

export type ExtendedRequestInit<E> = RequestInit & {
  [BASE_URL]?: [URL | string | undefined, MapError<E>]
  [U]?: {
    params?: Record<string, string>
    password?: string
    username?: string
    port?: string | number
  }
  [SIGNAL]?: MapError<E>
  [RETRY]?: Array<Strategy<E>>
}
