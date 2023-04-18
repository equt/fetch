import { left, right } from 'fp-ts/Either'
import { pipe } from 'fp-ts/lib/function'

import { request, runFetchM } from '..'
import { withSignal, withTimeout } from './controller'

const mk = runFetchM('https://example.com')

describe('Signal Combinator', () => {
  it('should make the request abortable', async () => {
    const controller = new AbortController()

    const req = pipe(
      request,
      withSignal(controller.signal, () => 'Aborted'),
      mk,
    )

    controller.abort()

    await expect(req()).resolves.toEqual(left('Aborted'))
  })

  it('should throw if no MapError provided', async () => {
    const controller = new AbortController()

    const req = pipe(request, withSignal(controller.signal), mk)

    controller.abort()

    await expect(async () => await req()).rejects.toThrowError(
      'AbortError: This operation was aborted',
    )
  })
})

describe('Timeout combinator', () => {
  it('should throw if timeout', async () => {
    await expect(pipe(request, withTimeout(0), mk)()).rejects.toThrowError(
      'AbortError: This operation was aborted',
    )
  })

  it('should do nothing if returned before timeout', async () => {
    await expect(
      pipe(
        request,
        withTimeout(10_000, () => 'Aborted'),
        mk,
      )(),
    ).resolves.toMatchObject(right({}))
  })
})
