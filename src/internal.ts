import { MapError } from '.'

export const BASE_URL = Symbol('BU')

export const U = Symbol('U')

export const SIGNAL = Symbol('SG')

export type ExtendedRequestInit<E> = RequestInit & {
  [BASE_URL]?: [URL | string | undefined, MapError<E>]
  [U]?: {
    params?: Record<string, string>
    password?: string
    username?: string
    port?: string | number
  }
  [SIGNAL]?: MapError<E>
}
