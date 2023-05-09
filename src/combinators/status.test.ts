import { left } from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

import { bail, mkRequest, runFetchM } from '..'
import { ensureStatus } from './status'

const mk = runFetchM('https://example.com')

describe('Status Combinator', () => {
  it('should reject', async () => {
    const mock = jest.fn(() =>
      Promise.resolve(
        new Response(null, {
          status: 400,
        }),
      ),
    )

    expect(
      await pipe(
        mkRequest(bail, mock),
        ensureStatus(
          n => n < 400,
          () => 'Bad Response',
        ),
        mk,
      )(),
    ).toEqual(left('Bad Response'))
  })

  it('should bypass', async () => {
    const mock = jest.fn(() =>
      Promise.resolve(
        new Response(null, {
          status: 200,
        }),
      ),
    )
    expect(
      await pipe(
        mkRequest(bail, mock),
        ensureStatus(
          n => n < 400,
          () => 'Bad Response',
        ),
        mk,
      )(),
    ).toEqual(expect.objectContaining({ _tag: 'Right' }))
  })

  it('should bail', async () => {
    const mock = jest.fn(() =>
      Promise.resolve(
        new Response(null, {
          status: 400,
        }),
      ),
    )

    await expect(() =>
      pipe(
        mkRequest(bail, mock),
        ensureStatus(n => n < 400),
        mk,
      )(),
    ).rejects.toThrow()
  })
})
