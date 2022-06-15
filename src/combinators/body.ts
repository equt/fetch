import type { Json } from 'fp-ts/Json'
import { local } from 'fp-ts/ReaderTaskEither'
import { mapSnd } from 'fp-ts/Tuple'
import { flow } from 'fp-ts/function'

import type { Combinator } from '..'
import type { Lazyable } from '../utils'
import { eager } from '../utils'
import { withHeaders } from './header'

type FormBlob = {
  blob: Blob
  filename?: string
}

/**
 * Form like object.
 *
 * @since 1.1.0
 */
export type Formable = Record<string, string | Blob | FormBlob>

/**
 * Create a {@link FormData} from a form like object {@link Formable}.
 *
 * @param form Form like object {@link Formable}
 * @returns Form Data {@link FormData}
 *
 * @since 1.1.0
 */
export const mkFormData = (form: Formable): FormData =>
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
 * Collect a {@link FormData} into a {@link Formable}.
 *
 * @param form A {@link FormData}
 * @returns An object satisfies {@link Formable}
 *
 * @since 2.1.0
 */
export const collectFormable = (form: FormData): Formable => {
  const obj: Formable = {}
  form.forEach((v, k) => {
    obj[k] = v
  })
  return obj
}

/**
 * Set the request body as {@link FormData}.
 *
 * @param form Form like object {@link Formable}
 *
 * @since 2.1.0
 */
export const withForm = <E, A>(form: Lazyable<Formable>): Combinator<E, A> =>
  local(
    mapSnd(({ body, ...rest }) => {
      const _form = eager(form)
      if (body instanceof FormData) {
        const formable = collectFormable(body)
        return {
          body: mkFormData({
            ..._form,
            ...formable,
          }),
          ...rest,
        }
      } else {
        return {
          body: mkFormData(_form),
          ...rest,
        }
      }
    }),
  )

/**
 * Set the request body as JSON.
 *
 * @param json JSON like object {@link Json}
 * @param replacer The replacer parameter in {@link JSON.stringify}
 * @param space The space parameter in {@link JSON.stringify}
 *
 * Note, this combinator will not set `Content-Type` header automatically.
 * You should use the {@link withJSON} combinator if that behavior is desired.
 *
 * @since 1.0.0
 */
export const withJSONBody = <E, A>(
  json: Lazyable<Json>,
  replacer?: (
    this: unknown,
    key: string,
    value: unknown,
  ) => unknown | (number | string)[] | null,
  space?: Parameters<typeof JSON.stringify>['2'],
): Combinator<E, A> =>
  local(
    mapSnd(x => ({ body: JSON.stringify(eager(json), replacer, space), ...x })),
  )

/**
 * Set the request body as JSON.
 *
 * @param json JSON like object {@link Json}
 * @param replacer The replacer parameter in {@link JSON.stringify}
 * @param space The space parameter in {@link JSON.stringify}
 *
 * Note, this combinator will set `Content-Type` header automatically.
 * You could use the {@link withJSONBody} combinator if this behavior is not desired.
 *
 * @since 1.0.0
 */
export const withJSON = <E, A>(
  json: Lazyable<Json>,
  replacer?: (
    this: unknown,
    key: string,
    value: unknown,
  ) => unknown | (number | string)[] | null,
  space?: Parameters<typeof JSON.stringify>['2'],
): Combinator<E, A> =>
  flow(
    withHeaders({ 'Content-Type': 'application/json' }),
    withJSONBody(json, replacer, space),
  )

/**
 * Set the request body as Blob.
 *
 * @param blob Data in {@link Blob}
 * @param contentType MIME
 *
 * @since 1.0.0
 */
export const withBlob = <E extends Error, A>(
  blob: Lazyable<Blob>,
  contentType: string,
): Combinator<E, A> =>
  flow(
    withHeaders({ 'Content-Type': contentType }),
    local(mapSnd(x => ({ body: eager(blob), ...x }))),
  )
