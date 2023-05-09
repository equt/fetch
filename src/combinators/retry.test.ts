import { left, right } from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

import { mkRequest, runFetchM, withMethod } from '..'
import { retry } from './retry'

const mk = runFetchM('https://example.com')

describe('Retry Combinator', () => {
  it('should retry according to the strategy', async () => {
    const mock = jest.fn(),
      strategy = jest.fn(() => 0)

    mock.mockRejectedValueOnce('A')
    mock.mockResolvedValueOnce('B')
    mock.mockRejectedValue('C')

    await expect(
      pipe(
        mkRequest(x => x, mock),
        retry(strategy),
        withMethod('POST'),
        mk,
      )(),
    ).resolves.toEqual(right('B'))
    expect(strategy.mock.calls.length).toBe(1)
    expect(strategy.mock.calls).toEqual([['A', 0, { method: 'POST' }]])
  })

  it('should failed if it is desired', async () => {
    const mock = jest.fn(),
      strategy = jest.fn(() => null)

    mock.mockRejectedValueOnce('A')
    mock.mockResolvedValueOnce('B')
    mock.mockRejectedValue('C')

    await expect(
      pipe(
        mkRequest(x => x, mock),
        retry(strategy),
        mk,
      )(),
    ).resolves.toEqual(left('A'))
    expect(strategy.mock.calls.length).toBe(1)
  })
})
