import { pipe } from 'fp-ts/function'

import mock from 'fetch-mock-jest'

import { request, runFetchM } from '..'
import { withBaseURL, withURLSearchParams } from './url'

// FIXME URL doesn't throw if invalid

afterEach(() => mock.reset())

describe('Base URL combinator', () => {
  it('should add the base URL', async () => {
    mock.mock('https://example.com/wait', 200)
    await pipe(
      request,
      withBaseURL('https://example.com'),
      runFetchM('/wait'),
    )()
    expect(mock.lastUrl()).toStrictEqual('https://example.com/wait')
  })

  it('latter should overwrite the former', async () => {
    mock.mock('https://example.com/wait', 200)
    await pipe(
      request,
      withBaseURL('https://example.org'),
      withBaseURL('https://example.com'),
      runFetchM('/wait'),
    )()
    expect(mock.lastUrl()).toStrictEqual('https://example.com/wait')
  })

  // it('should throws if URL is invalid', async () => {
  //   expect(
  //     await pipe(
  //       mkRequest(() => 'InternalError', realFetch),
  //       withBaseURL('https://*', () => 'InternalError'),
  //       runFetchM('/wait')
  //     )()
  //   ).toStrictEqual(left('InternalError'))
  // })
})

describe('URL Parameters Combinator', () => {
  it('should set URL Parameters', async () => {
    mock.mock('https://example.com?wait=always', 200)

    await pipe(
      request,
      withURLSearchParams({ wait: 'always' }),
      runFetchM('https://example.com'),
    )()

    expect(mock.lastCall()?.[0]).toStrictEqual(
      'https://example.com/?wait=always',
    )
  })

  it('latter combinator should take precedence', async () => {
    mock.mock('https://example.com?wait=always&has=been', 200)

    await pipe(
      request,
      withURLSearchParams({ wait: 'been', has: 'been' }),
      withURLSearchParams({ wait: 'always' }),
      runFetchM('https://example.com'),
    )()

    expect(mock.lastCall()?.[0]).toStrictEqual(
      'https://example.com/?wait=always&has=been',
    )
  })

  it('should work well with `withBaseURL`, regardless the order (normal)', async () => {
    mock.mock('https://example.com/orio?wait=always&has=been', 200)

    await pipe(
      request,
      withBaseURL('https://example.com/'),
      withURLSearchParams({ wait: 'always', has: 'been' }),
      runFetchM('orio'),
    )()

    expect(mock.lastCall()?.[0]).toStrictEqual(
      'https://example.com/orio?wait=always&has=been',
    )
  })

  it('should work well with `withBaseURL`, regardless the order (reversed)', async () => {
    mock.mock('https://example.com/orio?wait=always&has=been', 200)

    await pipe(
      request,
      withURLSearchParams({ wait: 'always', has: 'been' }),
      withBaseURL('https://example.com/'),
      runFetchM('orio'),
    )()

    expect(mock.lastCall()?.[0]).toStrictEqual(
      'https://example.com/orio?wait=always&has=been',
    )
  })
})
