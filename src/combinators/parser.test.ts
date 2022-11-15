import { left, right } from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

import { Response } from 'cross-fetch'
import mock from 'fetch-mock-jest'
import * as t from 'io-ts'

import { request, runFetchM } from '..'
import { asBlob, asArrayBuffer, asJSON, asText, decodeAs } from './parser'

afterEach(() => mock.reset())

const mk = runFetchM('https://example.com')

describe('JSON Parser combinator', () => {
  it('should be able to parse JSON', async () => {
    mock.mock(
      'https://example.com',
      new Response(`{ "Earth": "Always Has Been" }`),
    )

    expect(await pipe(request, asJSON(), mk)()).toStrictEqual(
      right({
        Earth: 'Always Has Been',
      }),
    )
  })

  it('should throws SyntaxError if JSON syntax invalid', async () => {
    mock.mock(
      'https://example.com',
      new Response(`{ "Earth": "Always Has Been"`),
    )

    expect(
      await pipe(
        request,
        asJSON(() => 'InvalidSyntax'),
        mk,
      )(),
    ).toStrictEqual(left('InvalidSyntax'))
  })

  it('should set Accept header correctly', async () => {
    mock.mock('https://example.com', new Response(`{}`))

    await pipe(request, asJSON(), mk)()

    expect(mock.lastCall()?.[1]).toStrictEqual({
      headers: {
        Accept: 'application/json',
      },
    })
  })
})

describe('Blob Parser Combinator', () => {
  it('should be able to parse Blob', async () => {
    mock.mock(
      'https://example.com',
      new Response(new Blob([], { type: 'application/pdf' })),
    )

    expect(await pipe(request, asBlob('application/pdf'), mk)()).toStrictEqual(
      expect.objectContaining({ _tag: 'Right' }),
    )
  })

  it('should set Accept header correctly', async () => {
    mock.mock('https://example.com', 200)

    await pipe(request, asBlob('application/pdf'), mk)()

    expect(mock.lastCall()?.[1]).toStrictEqual({
      headers: {
        Accept: 'application/pdf',
      },
    })
  })
})

describe('ArrayBuffer Parser Combinator', () => {
  it('should be able to parse ArrayBuffer', async () => {
    mock.mock('https://example.com', new Response(new ArrayBuffer(10)))

    expect(await pipe(request, asArrayBuffer(), mk)()).toStrictEqual(
      expect.objectContaining({ _tag: 'Right' }),
    )
  })
})

describe('Text Parser Combinator', () => {
  it('should be able to parse text', async () => {
    mock.mock('https://example.com', new Response(`Always Has Been`))

    expect(await pipe(request, asText(), mk)()).toStrictEqual(
      right('Always Has Been'),
    )
  })
})

describe('CodeC requiring io-ts', () => {
  it('should be able to decode', async () => {
    mock.mock(
      'https://example.com',
      new Response(`{ "Earth": "Always Has Been" }`),
    )

    expect(
      await pipe(
        request,
        asJSON(),
        decodeAs(
          t.type({
            Earth: t.string,
          }),
        ),
        mk,
      )(),
    ).toStrictEqual(right({ Earth: 'Always Has Been' }))
  })

  it('should be able to report', async () => {
    mock.mock('https://example.com', new Response(`{ "Earth": 42 }`))

    expect(
      await pipe(
        request,
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
