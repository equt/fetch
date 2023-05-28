import { pipe } from 'fp-ts/function'

import { bail, mkRequest, runFetchM } from '..'
import { mkFormData, withBlob, withForm, withJSON } from './body'
import { withMethod } from './method'

const mock = jest.fn(() => Promise.resolve(new Response())),
  request = mkRequest(bail, mock),
  mk = runFetchM('https://example.com'),
  arg = () => (mock.mock.lastCall as [string, unknown] | undefined)?.[1]

describe('Create FormData', () => {
  it('build from Formable', () => {
    const generated = mkFormData({
      name: 'John',
      license: new Blob(['DATA']),
      backup: {
        blob: new Blob(['DATA']),
        filename: 'Backup',
      },
    })

    const expected = new FormData()
    expected.set('name', 'John')
    expected.set('license', new Blob(['DATA']))
    expected.set('backup', new Blob(['DATA']), 'Backup')

    expect(generated).toStrictEqual(expected)
  })
})

describe('JSON body combinator', () => {
  it('should encode JSON & set header', async () => {
    await pipe(
      request,
      withMethod('POST'),
      withJSON({ Earth: 'Always Has Been' }),
      mk,
    )()

    expect(arg()).toStrictEqual({
      body: '{"Earth":"Always Has Been"}',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
  })

  it('should respect JSON.stringify replacer (function overload)', async () => {
    await pipe(
      request,
      withMethod('POST'),
      withJSON({ Earth: 'Always' }, (_, value) =>
        value === 'Always' ? 'Always Has Been' : value,
      ),
      mk,
    )()

    expect(arg()).toStrictEqual({
      body: '{"Earth":"Always Has Been"}',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
  })

  it('should respect JSON.stringify replacer (array overload)', async () => {
    await pipe(
      request,
      withMethod('POST'),
      withJSON({ Earth: 'Always', Solar: 'Never' }, ['Solar']),
      mk,
    )()

    expect(arg()).toStrictEqual({
      body: '{"Solar":"Never"}',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
  })
})

describe('Form body combinator', () => {
  it('should encode FormData', async () => {
    await pipe(
      request,
      withMethod('POST'),
      withForm({ Earth: 'Always Has Been' }),
      mk,
    )()

    const form = new FormData()
    form.set('Earth', 'Always Has Been')

    expect(arg()).toStrictEqual({
      method: 'POST',
      body: form,
    })
  })

  it('should encode FormData progressively', async () => {
    await pipe(
      request,
      withMethod('POST'),
      withForm({ Earth: 'Always Has Been', Me: 'Orio' }),
      withForm({ Me: 'Wait' }),
      mk,
    )()

    const form = new FormData()
    form.set('Earth', 'Always Has Been')
    form.set('Me', 'Wait')

    expect(arg()).toStrictEqual({
      method: 'POST',
      body: form,
    })
  })
})

describe('Blob body combinator', () => {
  it('should encode Blob', async () => {
    await pipe(request, withMethod('POST'), withBlob(new Blob([])), mk)()

    expect(arg()).toStrictEqual({
      method: 'POST',
      body: new Blob([]),
    })
  })
})
