import { pipe } from 'fp-ts/function'

import { bail, mkRequest, runFetchM } from '..'
import { withMethod } from './method'

const mock = jest.fn(() => Promise.resolve(new Response())),
  request = mkRequest(bail, mock),
  mk = runFetchM('https://example.com'),
  arg = () => (mock.mock.lastCall as [string, unknown] | undefined)?.[1]

describe('Method combinator', () => {
  it('should set method correctly', async () => {
    await pipe(request, withMethod('POST'), mk)()
    expect(arg()).toStrictEqual({ method: 'POST' })
  })

  it('latter combinator should take the precedence', async () => {
    await pipe(request, withMethod('POST'), withMethod('DELETE'), mk)()
    expect(arg()).toStrictEqual({ method: 'DELETE' })
  })

  it('config should take the precedence', async () => {
    await pipe(
      request,
      withMethod('DELETE'),
      runFetchM('https://example.com', { method: 'GET' }),
    )()
    expect(arg()).toStrictEqual({ method: 'GET' })
  })

  it('should allow custom method', async () => {
    await pipe(request, withMethod('CUSTOM'), mk)()
    expect(arg()).toStrictEqual({ method: 'CUSTOM' })
  })
})
