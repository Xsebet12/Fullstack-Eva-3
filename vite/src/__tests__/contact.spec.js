import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendContacto } from '../client/api/client'

describe('sendContacto', () => {
  let lastOpts = null
  beforeEach(() => {
    vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    document.cookie = 'authToken=abcToken; Path=/'
    global.fetch = vi.fn(async (url, opts) => {
      lastOpts = opts
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } })
    })
  })

  it('sends POST with proper headers and Authorization', async () => {
    const body = { nombre: 'N', correo: 'c@d.com', mensaje: 'hola' }
    await sendContacto(body)
    expect(lastOpts.method).toBe('POST')
    expect(lastOpts.headers['Accept']).toBe('application/json')
    expect(lastOpts.headers['Content-Type']).toBe('application/json')
    expect(lastOpts.headers['Authorization']).toBe('Bearer abcToken')
    const sent = JSON.parse(lastOpts.body)
    expect(sent).toEqual(body)
  })
})
