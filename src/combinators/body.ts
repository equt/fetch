import type { Json } from 'fp-ts/Json'
import { local } from 'fp-ts/ReaderTaskEither'
import { mapSnd } from 'fp-ts/Tuple'
import { flow } from 'fp-ts/function'

import type { Combinator } from '..'
import { withHeaders } from './header'

type FormBlob = {
  blob: Blob
  filename?: string
}

/**
 * Form like object.
 *
 * @category types
 * @since 1.1.0
 */
export type Formable = Record<string, string | Blob | FormBlob>

/**
 * Translate the intermediate [`Formable`](#formable-type-alias) into a `FormData`.
 *
 * @param form Form like object {@link Formable}
 * @returns Form Data {@link FormData}
 *
 * @category utils
 * @since 1.1.0
 */
export const mkFormData = /* #__PURE__ */ (form: Formable): FormData =>
  Object.entries(form).reduce((m, [k, v]) => {
    if (typeof v === 'string') {
      m.set(k, v)
    } else if (v instanceof Blob) {
      m.set(k, v)
    } else {
      m.set(k, v.blob, v.filename)
    }
    return m
  }, new FormData())

/**
 * Transform `FormData` into an intermediate [`Formable`](#formable-type-alias) object.
 *
 * @param form A {@link FormData}
 * @returns An object satisfies {@link Formable}
 *
 * @category utils
 * @since 2.1.0
 */
export const collectFormable = /* #__PURE__ */ (form: FormData): Formable => {
  const obj: Formable = {}
  form.forEach((v, k) => (obj[k] = v))
  return obj
}

/**
 * Set the request body as `FormData`.
 *
 * Calling this combinator multiple times will merge all of them instead of overriding.
 * If the body is not a `FormData`, the existing body will be discarded.
 *
 * @param form Form like object {@link Formable}
 *
 * @category combinators
 * @since 2.1.0
 */
export const withForm = /* #__PURE__ */ <E, A>(
  form: Formable,
): Combinator<E, A> =>
  // TODO Allowing setting the value to `null` to explicitly remove the existing value
  local(
    mapSnd(({ body, ...rest }) =>
      body instanceof FormData
        ? {
            body: mkFormData({
              ...form,
              ...collectFormable(body),
            }),
            ...rest,
          }
        : {
            body: mkFormData(form),
            ...rest,
          },
    ),
  )

/**
 * Set the request body as JSON.
 *
 * This combinator will override the current existing body.
 * You may want to use [`withJSON`](#withjson) if the auto `Content-Type` setting is desired.
 *
 * @param json JSON like object {@link Json}
 * @param replacer The replacer parameter in {@link JSON.stringify}
 * @param space The space parameter in {@link JSON.stringify}
 *
 * @category combinators
 * @since 1.0.0
 */
export function withJSONBody<E, A>(
  json: Json,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  replacer?: (this: any, key: string, value: any) => any,
  space?: string | number,
): Combinator<E, A>
export function withJSONBody<E, A>(
  json: Json,
  replacer?: Array<number | string>,
  space?: string | number,
): Combinator<E, A>
export function withJSONBody<E, A>(
  json: Json,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  replacer?: any,
  space?: string | number,
): Combinator<E, A> {
  // TODO Handle JSON serialization error, i.e., circular reference
  return local(
    mapSnd(x => ({ body: JSON.stringify(json, replacer, space), ...x })),
  )
}

/**
 * Set the request body as JSON.
 *
 * This combinator will override the current existing body and `Content-Type` header.
 * If setting the `Content-Type` is not desired, use the [`withJSONBody`](#withjsonbody) combinator instead.
 *
 * @param json JSON like object {@link Json}
 * @param replacer The replacer parameter in {@link JSON.stringify}
 * @param space The space parameter in {@link JSON.stringify}
 *
 * @category combinators
 * @since 1.0.0
 */
export function withJSON<E, A>(
  json: Json,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  replacer?: (this: any, key: string, value: any) => any,
  space?: string | number,
): Combinator<E, A>
export function withJSON<E, A>(
  json: Json,
  replacer?: Array<number | string>,
  space?: string | number,
): Combinator<E, A>
export function withJSON<E, A>(
  json: Json,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  replacer?: any,
  space?: string | number,
): Combinator<E, A> {
  return flow(
    withHeaders({ 'Content-Type': 'application/json' }),
    withJSONBody(json, replacer, space),
  )
}

/**
 * Set the request body as Blob.
 *
 * @param blob Data in {@link Blob}
 * @param contentType MIME
 *
 * @category combinators
 * @since 1.0.0
 */
export const withBlob = /* #__PURE__ */ <E, A>(
  blob: Blob,
  contentType: string,
): Combinator<E, A> =>
  flow(
    withHeaders({ 'Content-Type': contentType }),
    local(mapSnd(x => ({ body: blob, ...x }))),
  )
