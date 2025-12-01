import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkout } from '../client/api/client'

describe('checkout headers', () => {
  let lastOpts = null
  beforeEach(() => {
    vi.spyOn(window.localStorage, 'getItem').mockImplementation(()=>{ throw new Error('blocked') })
    document.cookie = 'authToken=tok; Path=/'
    global.fetch = vi.fn(async (url, opts) => {
      lastOpts = opts
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } })
    })
  })

  it('sends Accept and Authorization', async () => {
    await checkout()
    expect(lastOpts.headers['Accept']).toBe('application/json')
    expect(lastOpts.headers['Authorization']).toBe('Bearer tok')
    expect(lastOpts.credentials).toBe('same-origin')
  })
})
