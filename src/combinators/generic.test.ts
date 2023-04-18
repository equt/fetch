import { left, right } from 'fp-ts/Either'
import { map, chainIOK } from 'fp-ts/ReaderTaskEither'
import { of } from 'fp-ts/IO'
import {
  constFalse,
  constNull,
  constTrue,
  constVoid,
  pipe,
} from 'fp-ts/function'

import { bail, mkRequest, runFetchM } from '..'
import { fail, guard, localE, inspect, when } from './generic'

const mock = jest.fn(() => Promise.resolve(new Response())),
  request = mkRequest(bail, mock),
  mk = runFetchM('https://example.com'),
  arg = () => (mock.mock.lastCall as [string, unknown] | undefined)?.[0]

describe('guard', () => {
  it('transparent if true', async () => {
    expect(
      await pipe(
        request,
        map(constTrue),
        guard((b): b is true => b, constVoid),
        mk,
      )(),
    ).toStrictEqual(right(true))
  })

  it('should return null if false', async () => {
    expect(
      await pipe(
        request,
        map(constFalse),
        guard((b): b is false => b, constNull),
        mk,
      )(),
    ).toStrictEqual(left(null))
  })
})

describe('when', () => {
  it('transparent if false', async () => {
    expect(
      await pipe(
        request,
        map(constFalse),
        when((b): b is false => b, constVoid),
        mk,
      )(),
    ).toStrictEqual(right(false))
  })

  it('should return null if true', async () => {
    expect(
      await pipe(
        request,
        map(constTrue),
        when((b): b is true => b, constNull),
        mk,
      )(),
    ).toStrictEqual(left(null))
  })
})

describe('fail', () => {
  it('fail the monad', async () => {
    expect(
      await pipe(
        request,
        fail(() => 'Always has been'),
        mk,
      )(),
    ).toStrictEqual(expect.objectContaining({ _tag: 'Left' }))
  })
})

describe('inspect', () => {
  it('inspect inside', async () => {
    let result: true | false = false

    await pipe(
      request,
      chainIOK(() => of(true)),
      inspect(b => (result = b)),
      mk,
    )()

    expect(result).toBeTruthy()
  })
})

describe('localE', () => {
  it('raise an error', async () => {
    expect(
      await pipe(
        request,
        localE(() => left('Always has been')),
        mk,
      )(),
    ).toStrictEqual(expect.objectContaining({ _tag: 'Left' }))
  })

  it('update the config', async () => {
    await pipe(
      request,
      localE(() => right(['https://example.org', {}])),
      mk,
    )()

    expect(arg()).toBe('https://example.org/')
  })
})
