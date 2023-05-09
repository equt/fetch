import { local } from 'fp-ts/ReaderTaskEither'
import { mapSnd } from 'fp-ts/Tuple'

import type { Combinator } from '..'
import { ExtendedRequestInit, RETRY } from '../internal'

export type Policy = number | undefined | null

export type Strategy<E> = {
  (error: E, times: number): Policy
}

export function retry<E, A>(strategy: Strategy<E>): Combinator<E, A> {
  return local(
    mapSnd((x: ExtendedRequestInit<E>): ExtendedRequestInit<E> => {
      if (!x[RETRY]) x[RETRY] = []
      x[RETRY].push(strategy)
      return x
    }),
  )
}
