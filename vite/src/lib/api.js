// Minimal API helper to centralize base URL and Authorization header
const base = import.meta.env.VITE_API_BASE ?? ''

function getCookie(name) {
  try{
    const m = document.cookie.match(new RegExp('(^|; )'+name+'=([^;]+)'))
    return m ? decodeURIComponent(m[2]) : null
  }catch{ return null }
}

function getToken() {
  try{
    const t = localStorage.getItem('authToken')
    if (t) return t
  }catch{}
  try{
    const t2 = sessionStorage.getItem('authToken')
    if (t2) return t2
  }catch{}
  return getCookie('authToken')
}

async function apiFetch(path, options = {}) {
  const headers = options.headers ? { ...options.headers } : {}
  // Ensure client indicates it accepts JSON
  if (!headers['Accept'] && !headers['accept']) {
    headers['Accept'] = 'application/json'
  }
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  // Debug outgoing request (helps troubleshoot 400/401)
  try {
    console.debug('apiFetch:', { url: `${base}${path}`, method: options.method || 'GET', headers, body: options.body })
  } catch (e) {
    // ignore console issues
  }

  const res = await fetch(`${base}${path}`, { ...options, headers, credentials: options.credentials ?? 'same-origin' })
  return res
}

async function handleResponse(res) {
  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  if (res.ok) {
    if (isJson) return await res.json()
    return await res.text()
  }
  // try to parse error body for better message
  let body = null
  try {
    body = isJson ? await res.json() : await res.text()
  } catch (e) {
    body = null
  }
  let msg = `HTTP ${res.status}`
  if (body && typeof body === 'object') {
    if (body.errors && typeof body.errors === 'object') {
      const parts = Object.entries(body.errors).map(([f,m]) => `${String(f)}: ${String(m)}`)
      if (parts.length) msg = parts.join('; ')
    } else if (body.error || body.message) {
      msg = body.error || body.message || msg
    }
  } else if (typeof body === 'string' && body.trim()) {
    msg = body.trim()
  }
  const err = new Error(msg)
  err.status = res.status
  err.body = body
  throw err
}

const api = {
  fetch: apiFetch, // low-level, returns Response
  get: async (p) => handleResponse(await apiFetch(p, { method: 'GET' })),
  post: async (p, body) => handleResponse(await apiFetch(p, { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body) })),
  put: async (p, body) => handleResponse(await apiFetch(p, { method: 'PUT', body: typeof body === 'string' ? body : JSON.stringify(body) })),
  del: async (p) => handleResponse(await apiFetch(p, { method: 'DELETE' })),
}

export default api
