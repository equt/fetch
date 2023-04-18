import { right } from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

import {
  bail,
  mkRequest,
  runFetchM,
  runFetchMFlipped,
  runFetchMFlippedP,
  runFetchMFlippedPT,
  runFetchMFlippedPTL,
  runFetchMP,
  runFetchMPT,
  runFetchMPTL,
} from '.'

describe('Plain request', () => {
  it('could be executed by all methods', async () => {
    const resp = new Response('DATA', {
        status: 200,
        headers: {},
      }),
      mock = jest.fn(() => Promise.resolve(resp)),
      request = mkRequest(bail, mock)

    await Promise.all([
      expect(
        pipe(request, runFetchM('https://example.com'))(),
      ).resolves.toEqual(right(resp)),
      expect(pipe(request, runFetchMP('https://example.com'))).resolves.toEqual(
        right(resp),
      ),
      expect(
        pipe(request, runFetchMPT('https://example.com')),
      ).resolves.toEqual(resp),
      expect(
        pipe(request, runFetchMPTL('https://example.com'))(),
      ).resolves.toEqual(resp),
      expect(
        pipe(request, runFetchMFlipped)('https://example.com')(),
      ).resolves.toEqual(right(resp)),
      expect(
        pipe(request, runFetchMFlippedP)('https://example.com'),
      ).resolves.toEqual(right(resp)),
      expect(
        pipe(request, runFetchMFlippedPT)('https://example.com'),
      ).resolves.toEqual(resp),
      expect(
        pipe(request, runFetchMFlippedPTL)('https://example.com')(),
      ).resolves.toEqual(resp),
    ])
  })

  it('allows overwritting', async () => {
    const resp = new Response('DATA', {
        status: 200,
        headers: {},
      }),
      mock = jest.fn(() => Promise.resolve(resp)),
      request = mkRequest(bail, mock)

    await Promise.all([
      expect(
        pipe(request, runFetchM('https://example.com', {}))(),
      ).resolves.toEqual(right(resp)),
      expect(
        pipe(request, runFetchMP('https://example.com', {})),
      ).resolves.toEqual(right(resp)),
      expect(
        pipe(request, runFetchMPT('https://example.com', {})),
      ).resolves.toEqual(resp),
      expect(
        pipe(request, runFetchMPTL('https://example.com', {}))(),
      ).resolves.toEqual(resp),
      expect(
        pipe(request, runFetchMFlipped)('https://example.com', {})(),
      ).resolves.toEqual(right(resp)),
      expect(
        pipe(request, runFetchMFlippedP)('https://example.com', {}),
      ).resolves.toEqual(right(resp)),
      expect(
        pipe(request, runFetchMFlippedPT)('https://example.com', {}),
      ).resolves.toEqual(resp),
      expect(
        pipe(request, runFetchMFlippedPTL)('https://example.com', {})(),
      ).resolves.toEqual(resp),
    ])
  })

  it('should handle handle errors', async () => {
    const mock = jest.fn(() => Promise.reject('Rejected')),
      request = mkRequest(bail, mock)

    await Promise.all([
      expect(() =>
        pipe(request, runFetchM('https://example.com'))(),
      ).rejects.toThrow('Rejected'),
      expect(() =>
        pipe(request, runFetchMP('https://example.com')),
      ).rejects.toThrow('Rejected'),
      expect(() =>
        pipe(request, runFetchMPT('https://example.com')),
      ).rejects.toThrow('Rejected'),
      expect(() =>
        pipe(request, runFetchMPTL('https://example.com'))(),
      ).rejects.toThrow('Rejected'),
      expect(() =>
        pipe(request, runFetchMFlipped)('https://example.com')(),
      ).rejects.toThrow('Rejected'),
      expect(() =>
        pipe(request, runFetchMFlippedP)('https://example.com'),
      ).rejects.toThrow('Rejected'),
      expect(() =>
        pipe(request, runFetchMFlippedPT)('https://example.com'),
      ).rejects.toThrow('Rejected'),
      expect(() =>
        pipe(request, runFetchMFlippedPTL)('https://example.com')(),
      ).rejects.toThrow('Rejected'),
    ])
  })
})

it('bail should throws parameter as error', () => {
  expect(() => bail(new Error('Wait'))).toThrowError(new Error('Wait'))
  expect(() => bail('Wait')).toThrowError(new Error('Wait'))
})
