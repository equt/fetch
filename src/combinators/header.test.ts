import { pipe } from 'fp-ts/function'

import { bail, mkRequest, runFetchM } from '..'
import { merge, toRecord, withHeaders } from './header'

describe('Convert HeaderInit to Record<string, string>', () => {
  it('should satisfy identity', () => {
    expect(
      toRecord({
        Authorization: 'BEARER WAIT_ITS_ALL_OHIO',
      }),
    ).toStrictEqual({
      Authorization: 'BEARER WAIT_ITS_ALL_OHIO',
    })
  })

  it('should create Record from entries', () => {
    expect(
      toRecord([['Authorization', 'BEARER ALWAYS_HAS_BEEN']]),
    ).toStrictEqual({
      Authorization: 'BEARER ALWAYS_HAS_BEEN',
    })
  })

  it('should iterate over Headers to create Record', () => {
    expect(
      toRecord(new Headers([['Authorization', 'BEARER ALWAYS_HAS_BEEN']])),
    ).toStrictEqual({
      authorization: 'BEARER ALWAYS_HAS_BEEN',
    })
  })
})

describe('Merge two HeaderInit and create a new one', () => {
  it('without intersection', () => {
    expect(
      merge(
        { Authorization: 'BEARER ALWAYS_HAS_BEEN' },
        { Accept: 'application/json' },
      ),
    ).toStrictEqual({
      Authorization: 'BEARER ALWAYS_HAS_BEEN',
      Accept: 'application/json',
    })
  })

  it('with intersection', () => {
    expect(
      merge(
        { Authorization: 'BEARER ALWAYS_HAS_BEEN' },
        { Authorization: 'BEARER WAIT_ITS_ALL_OHIO' },
      ),
    ).toStrictEqual({ Authorization: 'BEARER WAIT_ITS_ALL_OHIO' })
  })
})

const mock = jest.fn(() => Promise.resolve(new Response())),
  request = mkRequest(bail, mock),
  mk = runFetchM('https://example.com'),
  arg = () => (mock.mock.lastCall as [string, unknown] | undefined)?.[1]

describe('Header combinator', () => {
  it('should set headers correctly', async () => {
    await pipe(
      request,
      withHeaders({ Authorization: 'BEARER ALWAYS_HAS_BEEN' }),
      mk,
    )()

    expect(arg()).toStrictEqual({
      headers: {
        Authorization: 'BEARER ALWAYS_HAS_BEEN',
      },
    })
  })

  it('headers in Config should overwrite others', async () => {
    await pipe(
      request,
      withHeaders({ Authorization: 'BEARER ALWAYS_HAS_BEEN' }),
      runFetchM('https://example.com', {
        headers: { Authorization: 'BEARER ALWAYS_HAS_BEEN' },
      }),
    )()

    expect(arg()).toStrictEqual({
      headers: {
        Authorization: 'BEARER ALWAYS_HAS_BEEN',
      },
    })
  })

  it('latter combinator should take the precedence', async () => {
    await pipe(
      request,
      withHeaders({ Authorization: 'BEARER WAIT_ITS_ALL_OHIO' }),
      withHeaders({ Authorization: 'BEARER ALWAYS_HAS_BEEN' }),
      mk,
    )()

    expect(arg()).toStrictEqual({
      headers: {
        Authorization: 'BEARER ALWAYS_HAS_BEEN',
      },
    })
  })
})
