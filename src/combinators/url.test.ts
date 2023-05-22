import { pipe } from 'fp-ts/function'
import { left, right } from 'fp-ts/Either'

import { bail, mkRequest, runFetchM } from '..'
import {
  withBaseURL,
  withPassword,
  withPort,
  withRedirection,
  withURLSearchParams,
  withUsername,
} from './url'

const mock = jest.fn(() => Promise.resolve(new Response())),
  request = mkRequest(bail, mock)

describe('Base URL combinator', () => {
  it('should add the base URL', async () => {
    await pipe(
      request,
      withBaseURL('https://example.com'),
      runFetchM('/wait'),
    )()
    expect(mock.mock.lastCall).toEqual(['https://example.com/wait', {}])
  })

  it('latter should overwrite the former', async () => {
    await pipe(
      request,
      withBaseURL('https://example.org'),
      withBaseURL('https://example.com'),
      runFetchM('/wait'),
    )()
    expect(mock.mock.lastCall).toEqual(['https://example.com/wait', {}])
  })

  it('should throws if URL is invalid', async () => {
    await expect(
      pipe(
        request,
        withBaseURL('https://foo%20bar', () => 'InternalError'),
        runFetchM('/wait'),
      )(),
    ).resolves.toEqual(left('InternalError'))
  })
})

describe('URL Parameters Combinator', () => {
  it('should set URL Parameters', async () => {
    await pipe(
      request,
      withURLSearchParams({ wait: 'always' }),
      runFetchM('https://example.com'),
    )()

    expect(mock.mock.lastCall).toEqual(['https://example.com/?wait=always', {}])
  })

  it('latter combinator should take precedence', async () => {
    await pipe(
      request,
      withURLSearchParams({ wait: 'been', has: 'been' }),
      withURLSearchParams({ wait: 'always' }),
      runFetchM('https://example.com'),
    )()

    expect(mock.mock.lastCall).toEqual([
      'https://example.com/?wait=always&has=been',
      {},
    ])
  })

  it('should work well with `withBaseURL`, regardless the order (normal)', async () => {
    await pipe(
      request,
      withBaseURL('https://example.com/'),
      withURLSearchParams({ wait: 'always', has: 'been' }),
      runFetchM('orio'),
    )()

    expect(mock.mock.lastCall).toEqual([
      'https://example.com/orio?wait=always&has=been',
      {},
    ])
  })

  it('should work well with `withBaseURL`, regardless the order (reversed)', async () => {
    await pipe(
      request,
      withURLSearchParams({ wait: 'always', has: 'been' }),
      withBaseURL('https://example.com/'),
      runFetchM('orio'),
    )()

    expect(mock.mock.lastCall).toEqual([
      'https://example.com/orio?wait=always&has=been',
      {},
    ])
  })
})

describe('URL Password Combinator', () => {
  it('should set password', async () => {
    await pipe(
      request,
      withPassword('password'),
      runFetchM('https://example.com'),
    )()

    expect(mock.mock.lastCall).toEqual(['https://:password@example.com/', {}])
  })

  it('should override', async () => {
    await pipe(
      request,
      withPassword('passwd'),
      withPassword('password'),
      runFetchM('https://example.com'),
    )()

    expect(mock.mock.lastCall).toEqual(['https://:password@example.com/', {}])
  })
})

describe('URL Username Combinator', () => {
  it('should set username', async () => {
    await pipe(
      request,
      withUsername('user'),
      runFetchM('https://example.com'),
    )()

    expect(mock.mock.lastCall).toEqual(['https://user@example.com/', {}])
  })

  it('should override', async () => {
    await pipe(
      request,
      withUsername('admin'),
      withUsername('user'),
      runFetchM('https://example.com'),
    )()

    expect(mock.mock.lastCall).toEqual(['https://user@example.com/', {}])
  })
})

describe('URL Port Combinator', () => {
  it('should set port', async () => {
    await pipe(request, withPort(442), runFetchM('https://example.com'))()

    expect(mock.mock.lastCall).toEqual(['https://example.com:442/', {}])
  })

  it('should override', async () => {
    await pipe(
      request,
      withPort(80),
      withPort(442),
      runFetchM('https://example.com'),
    )()

    expect(mock.mock.lastCall).toEqual(['https://example.com:442/', {}])
  })

  it('should accept both string and number', async () => {
    await pipe(request, withPort('442'), runFetchM('https://example.com'))()

    expect(mock.mock.lastCall).toEqual(['https://example.com:442/', {}])

    await pipe(request, withPort(442), runFetchM('https://example.com'))()

    expect(mock.mock.lastCall).toEqual(['https://example.com:442/', {}])
  })
})

describe('Redirection Combinator', () => {
  const response = new Response(null, {
    status: 301,
    headers: {
      Location: 'https://example.com',
    },
  })

  it('should not follow redirection', async () => {
    const mock = jest.fn().mockResolvedValue(response),
      request = mkRequest(bail, mock)

    await expect(
      pipe(
        request,
        withRedirection('follow'),
        runFetchM('https://example.com'),
      )(),
    ).resolves.toEqual(right(response))
  })
})
