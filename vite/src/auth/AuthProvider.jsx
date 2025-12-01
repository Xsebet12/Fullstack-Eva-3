import React, { createContext, useEffect, useState, useCallback } from 'react'
import api from '../lib/api'
import { getAuthToken } from '../client/api/client'

export const AuthContext = createContext({
  user: null,
  login: async () => {},
  logout: () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const loadUser = useCallback(async () => {
    const token = getAuthToken()
    if (!token) return
    try {
  console.debug('AuthProvider: loading profile with existing token')
  const profile = await api.get('/api/usuarios/me')
      console.debug('AuthProvider: profile loaded', profile)
      setUser(profile)
    } catch (err) {
      // token invalid or network error: clear it
      console.error('fetch profile failed', err)
      try{ localStorage.removeItem('authToken') }catch{}
      try{ sessionStorage.removeItem('authToken') }catch{}
      setUser(null)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = useCallback(async (token, profile) => {
    if (token) {
      try { localStorage.setItem('authToken', token) }
      catch {
        try { sessionStorage.setItem('authToken', token) } catch {}
        try { document.cookie = `authToken=${encodeURIComponent(token)}; Path=/; SameSite=Lax` } catch {}
      }
    }
    console.debug('AuthProvider.login: token stored')
    if (profile) setUser(profile)
    else {
      try {
  console.debug('AuthProvider.login: fetching profile after login')
  const p = await api.get('/api/usuarios/me')
        console.debug('AuthProvider.login: fetched profile', p)
        setUser(p)
        return p
      } catch (err) {
        console.error('login: failed to fetch profile', err)
      }
    }
  }, [])

  const logout = useCallback(() => {
    try{ localStorage.removeItem('authToken') }catch{}
    try{ sessionStorage.removeItem('authToken') }catch{}
    try{ document.cookie = 'authToken=; Max-Age=0; Path=/; SameSite=Lax' }catch{}
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
