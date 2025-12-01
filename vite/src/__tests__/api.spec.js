import { describe, it, expect, beforeEach, vi } from 'vitest'
import api from '../lib/api'

describe('api Authorization header with storage blocking', () => {
  let lastOpts = null
  beforeEach(() => {
    lastOpts = null
    vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    if (window.sessionStorage && window.sessionStorage.getItem) {
      vi.spyOn(window.sessionStorage, 'getItem').mockReturnValue(null)
    }
    document.cookie = 'authToken=test123; Path=/'
    global.fetch = vi.fn(async (url, opts) => {
      lastOpts = opts
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } })
    })
  })

  it('adds Bearer token from cookie when storages are blocked', async () => {
    const res = await api.fetch('/api/dummy', { method: 'GET' })
    expect(res).toBeInstanceOf(Response)
    expect(lastOpts.headers.Authorization).toBe('Bearer test123')
  })
})
