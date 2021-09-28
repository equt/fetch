import type { Combinator, Config } from '../monad'
import { pipe } from 'fp-ts/function'
import { local } from 'fp-ts/ReaderTaskEither'

type FormBlob = {
  blob: Blob
  filename?: string
}

const isFormBlob = (x: unknown): x is FormBlob => !!(x as FormBlob).blob

const mkFormData = (form: Formable): FormData =>
  Object.entries(form).reduce((m, [k, v]) => {
    if (typeof v === 'string') {
      m.set(k, v)
    } else if (v instanceof Blob) {
      m.set(k, v)
    } else if (isFormBlob(v)) {
      m.set(k, v.blob, v.filename)
    } else {
      m.set(k, v.toString())
    }
    return m
  }, new FormData())

export type Formable = FormableK | FormableKV

type FormableK = Record<string, string | Blob | FormBlob>

type FormableKV = Record<
  string,
  string | Blob | FormBlob | { toString: () => string }
>

export const withForm = <E extends Error, A>(f: Formable): Combinator<E, A> =>
  pipe(
    local(
      ({ input, init }): Config => ({
        input,
        init: {
          body: mkFormData(f),
          ...init,
        },
      })
    )
  )