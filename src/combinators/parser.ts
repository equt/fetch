/**
 * @since 1.0.0
 */
import { mapLeft, left, right } from 'fp-ts/Either'
import type { Json } from 'fp-ts/Json'
import { chainEitherKW, chainTaskEitherKW } from 'fp-ts/ReaderTaskEither'
import { tryCatch } from 'fp-ts/TaskEither'
import { flow } from 'fp-ts/function'

import type { Errors, Mixed, TypeOf as IOTypeOf } from 'io-ts'
import type { ZodTypeAny, ZodError, TypeOf as ZodTypeOf } from 'zod'

import { bail, Combinator, MapError } from '..'
import { withHeaders } from './header'

/**
 * Parse the `Response` body as JSON
 *
 * @param mapError An instance of {@link MapError}
 *
 * @category combinators
 * @since 1.0.0
 */
export function asJSON<E, F>(
  mapError: MapError<F>,
): Combinator<E, Response, E | F, Json>
export function asJSON<E>(): Combinator<E, Response, E, Json>
export function asJSON<E, F>(
  mapError: MapError<F> = bail,
): Combinator<E, Response, E | F, Json> {
  return flow(
    withHeaders({ Accept: 'application/json' }),
    chainTaskEitherKW(resp => tryCatch(() => resp.json(), mapError)),
  )
}

/**
 * Parse the `Response` body as `Blob`
 *
 * @param accept Set the `Accept` MIME header
 * @param mapError An instance of {@link MapError}
 *
 * @category combinators
 * @since 1.0.0
 */
export function asBlob<E, F>(
  accept: string,
  mapError: MapError<F>,
): Combinator<E, Response, E | F, Blob>
export function asBlob<E>(accept: string): Combinator<E, Response, E, Blob>
export function asBlob<E, F>(
  accept: string,
  mapError: MapError<F> = bail,
): Combinator<E, Response, E | F, Blob> {
  return flow(
    withHeaders({ Accept: accept }),
    chainTaskEitherKW(resp => tryCatch(() => resp.blob(), mapError)),
  )
}

/**
 * Parse the `Response` body as `ArrayBuffer`
 *
 * @param mapError An instance of {@link MapError}
 *
 * @category combinators
 * @since 3.4.0
 */
export function asArrayBuffer<E, F>(
  mapError: MapError<F>,
): Combinator<E, Response, E | F, ArrayBuffer>
export function asArrayBuffer<E>(): Combinator<E, Response, E, ArrayBuffer>
export function asArrayBuffer<E, F>(
  mapError: MapError<F> = bail,
): Combinator<E, Response, E | F, ArrayBuffer> {
  return chainTaskEitherKW(resp => tryCatch(() => resp.arrayBuffer(), mapError))
}

/**
 * Parse the `Response` body as `string`
 *
 * @param mapError An instance of {@link MapError}
 *
 * @category combinators
 * @since 1.0.0
 */
export function asText<E, F>(
  mapError: MapError<F>,
): Combinator<E, Response, E | F, string>
export function asText<E>(): Combinator<E, Response, E, string>
export function asText<E, F>(
  mapError: MapError<F> = bail,
): Combinator<E, Response, E | F, string> {
  return flow(
    withHeaders({ Accept: 'text/plain' }),
    chainTaskEitherKW(resp => tryCatch(() => resp.text(), mapError)),
  )
}

// TODO: remove this function in 5.0
/**
 * Decode a `Json` type using [`io-ts`](https://github.com/gcanti/io-ts)
 *
 * Using this combinator will require [`io-ts`](https://github.com/gcanti/io-ts) to be installed.
 *
 * @deprecated Please use `decodeIO` instead, will be removed in the 5.0
 *
 * @param codeC Extends {@link Mixed}
 * @param mapError An instance of {@link MapError}
 *
 * @category combinators
 * @since 2.5.0
 */
export function decodeAs<E, F, C extends Mixed>(
  codeC: C,
  mapError: MapError<F, Errors>,
): Combinator<E, Json, E | F, IOTypeOf<C>>
export function decodeAs<E, C extends Mixed>(
  codeC: C,
): Combinator<E, Json, E, IOTypeOf<C>>
export function decodeAs<E, F, C extends Mixed>(
  codeC: C,
  mapError: MapError<F, Errors> = bail,
): Combinator<E, Json, E | F, IOTypeOf<C>> {
  return chainEitherKW(flow(codeC.decode, mapLeft(mapError)))
}

/**
 * Decode a `Json` type using [`io-ts`](https://github.com/gcanti/io-ts)
 *
 * Using this combinator will require [`io-ts`](https://github.com/gcanti/io-ts) to be installed.
 *
 * @param codeC Extends {@link Mixed}
 * @param mapError An instance of {@link MapError}
 *
 * @category combinators
 * @since 4.0.0
 */
export function decodeIO<E, F, C extends Mixed, J extends Json>(
  codeC: C,
  mapError: MapError<F, Errors>,
): Combinator<E, J, E | F, IOTypeOf<C>>
export function decodeIO<E, C extends Mixed, J extends Json>(
  codeC: C,
): Combinator<E, J, E, IOTypeOf<C>>
export function decodeIO<E, F, C extends Mixed, J extends Json>(
  codeC: C,
  mapError: MapError<F, Errors> = bail,
): Combinator<E, J, E | F, IOTypeOf<C>> {
  return chainEitherKW(flow(codeC.decode, mapLeft(mapError)))
}

/**
 * Decode a `Json` type using [`zod`](https://github.com/colinhacks/zod)
 *
 * Using this combinator will require [`zod`](https://github.com/colinhacks/zod) to be installed.
 *
 * @param codeC Extends {@link ZodTypeAny}
 * @param mapError An instance of {@link MapError}
 *
 * @category combinators
 * @since 4.0.0
 */
export function decodeZod<E, F, C extends ZodTypeAny, J extends Json>(
  codeC: C,
  mapError: MapError<F, ZodError>,
): Combinator<E, J, E | F, ZodTypeOf<C>>
export function decodeZod<E, C extends ZodTypeAny, J extends Json>(
  codeC: C,
): Combinator<E, J, E, ZodTypeOf<C>>
export function decodeZod<E, F, C extends ZodTypeAny, J extends Json>(
  codeC: C,
  mapError: MapError<F, ZodError> = bail,
): Combinator<E, J, E | F, ZodTypeOf<ZodTypeAny>> {
  return chainEitherKW(x => {
    const result = codeC.safeParse(x)
    switch (result.success) {
      case true:
        return right(result.data)
      case false:
        return left(mapError(result.error))
    }
  })
}
