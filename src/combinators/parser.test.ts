import { left, right } from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

import * as t from 'io-ts'
import { z } from 'zod'

import { mkRequest, bail, runFetchM } from '..'
import {
  asBlob,
  asArrayBuffer,
  asJSON,
  asText,
  decodeAs,
  decodeIO,
  decodeZod,
} from './parser'

const mk = runFetchM('https://example.com')

describe('JSON Parser combinator', () => {
  it('should be able to parse JSON', async () => {
    const mock = jest.fn(() =>
      Promise.resolve(new Response(`{ "Earth": "Always Has Been" }`)),
    )

    expect(await pipe(mkRequest(bail, mock), asJSON(), mk)()).toEqual(
      right({
        Earth: 'Always Has Been',
      }),
    )
  })

  it('should throws SyntaxError if JSON syntax invalid', async () => {
    const mock = jest.fn(() =>
      Promise.resolve(new Response(`{ "Earth": "Always Has Been"`)),
    )

    expect(
      await pipe(
        mkRequest(bail, mock),
        asJSON(() => 'InvalidSyntax'),
        mk,
      )(),
    ).toStrictEqual(left('InvalidSyntax'))
  })

  it('should set Accept header correctly', async () => {
    const mock = jest.fn(() =>
      Promise.resolve(new Response(`{ "Earth": "Always Has Been" }`)),
    )

    await pipe(mkRequest(bail, mock), asJSON(), mk)()

    expect(mock.mock.lastCall).toStrictEqual([
      'https://example.com/',
      {
        headers: {
          Accept: 'application/json',
        },
      },
    ])
  })
})

describe('Blob Parser Combinator', () => {
  it('should be able to parse Blob', async () => {
    const mock = jest.fn(() =>
      Promise.resolve(new Response(new Blob([], { type: 'application/pdf' }))),
    )

    expect(
      await pipe(mkRequest(bail, mock), asBlob('application/pdf'), mk)(),
    ).toStrictEqual(expect.objectContaining({ _tag: 'Right' }))
  })

  it('should set Accept header correctly', async () => {
    const mock = jest.fn(() => Promise.resolve(new Response()))

    await pipe(mkRequest(bail, mock), asBlob('application/pdf'), mk)()

    expect(mock.mock.lastCall).toStrictEqual([
      'https://example.com/',
      {
        headers: {
          Accept: 'application/pdf',
        },
      },
    ])
  })
})

describe('ArrayBuffer Parser Combinator', () => {
  it('should be able to parse ArrayBuffer', async () => {
    const mock = jest.fn(() =>
      Promise.resolve(new Response(new ArrayBuffer(10))),
    )

    expect(
      await pipe(mkRequest(bail, mock), asArrayBuffer(), mk)(),
    ).toStrictEqual(expect.objectContaining({ _tag: 'Right' }))
  })
})

describe('Text Parser Combinator', () => {
  it('should be able to parse text', async () => {
    const mock = jest.fn(() => Promise.resolve(new Response(`Always Has Been`)))

    expect(await pipe(mkRequest(bail, mock), asText(), mk)()).toStrictEqual(
      right('Always Has Been'),
    )
  })
})

describe('CodeC requiring io-ts [deprecated]', () => {
  it('should be able to decode', async () => {
    const mock = jest.fn(() =>
      Promise.resolve(new Response(`{ "Earth": "Always Has Been" }`)),
    )

    expect(
      await pipe(
        mkRequest(bail, mock),
        asJSON(),
        decodeAs(
          t.type({
            Earth: t.string,
          }),
        ),
        mk,
      )(),
    ).toEqual(right({ Earth: 'Always Has Been' }))
  })

  it('should be able to report', async () => {
    const mock = jest.fn(() => Promise.resolve(new Response(`{ "Earth": 42 }`)))

    expect(
      await pipe(
        mkRequest(bail, mock),
        asJSON(),
        decodeAs(
          t.type({
            Earth: t.string,
          }),
          es => es.map(e => e.context.map(e => e.key).join('.')),
        ),
        mk,
      )(),
    ).toStrictEqual(left(['.Earth']))
  })
})

describe('CodeC requiring io-ts', () => {
  it('should be able to decode', async () => {
    const mock = jest.fn(() =>
      Promise.resolve(
        new Response(`{ "Earth": "Always Has Been" }`, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      ),
    )

    expect(
      await pipe(
        mkRequest(bail, mock),
        asJSON(),
        decodeIO(
          t.type({
            Earth: t.string,
          }),
        ),
        mk,
      )(),
    ).toEqual(right({ Earth: 'Always Has Been' }))
  })

  it('should be able to report', async () => {
    const mock = jest.fn(() => Promise.resolve(new Response(`{ "Earth": 42 }`)))

    expect(
      await pipe(
        mkRequest(bail, mock),
        asJSON(),
        decodeIO(
          t.type({
            Earth: t.string,
          }),
          es => es.map(e => e.context.map(e => e.key).join('.')),
        ),
        mk,
      )(),
    ).toStrictEqual(left(['.Earth']))
  })
})

describe('CodeC requiring zod', () => {
  it('should be able to decode', async () => {
    const mock = jest.fn(() =>
      Promise.resolve(
        new Response(`{ "Earth": "Always Has Been" }`, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      ),
    )

    expect(
      await pipe(
        mkRequest(bail, mock),
        asJSON(),
        decodeZod(
          z.object({
            Earth: z.string(),
          }),
        ),
        mk,
      )(),
    ).toEqual(right({ Earth: 'Always Has Been' }))
  })

  it('should be able to report', async () => {
    const mock = jest.fn(() => Promise.resolve(new Response(`{ "Earth": 42 }`)))

    expect(
      await pipe(
        mkRequest(bail, mock),
        asJSON(),
        decodeZod(
          z.object({
            Earth: z.string(),
          }),
          es => es.issues.map(e => e.path.join('.')),
        ),
        mk,
      )(),
    ).toStrictEqual(left(['Earth']))
  })
})
