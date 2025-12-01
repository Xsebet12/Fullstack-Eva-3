import { useState } from 'react'
import api from '../lib/api'
import useAuth from '../auth/useAuth'

export default function LoginForm({ onAuthenticated = () => {} }) {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const auth = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!correo || !contrasena) {
      setError('Por favor ingresa correo y contraseña.')
      return
    }
    try {
      setLoading(true)
        const data = await api.post('/api/autenticacion/login', { correo, contrasena })
      const token = data?.token || data?.accessToken || data?.jwt
      if (!token) {
        setError('Respuesta sin token. Verifique el backend.')
        return
      }
      // let auth provider fetch profile; pass token so it can store & then fetch
      const profile = await auth.login(token)
      // call optional callback (AdminLogin provided one previously)
      try {
        onAuthenticated(profile)
      } catch (e) {
        // ignore callback errors
      }
    } catch (err) {
      console.error('Login error:', err)
      // err may contain status and parsed body
      let msg = 'Error de red o servidor. Intente nuevamente.'
      if (err?.status) {
        const body = err.body
        const bodyMsg = body && (body.message || body.error || (typeof body === 'string' ? body : JSON.stringify(body)))
        msg = `[HTTP ${err.status}] ${bodyMsg || err.message}`
      } else if (err?.message) {
        msg = err.message
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleImgError = (e) => { e.currentTarget.src = '/vite.svg' }

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column justify-content-center align-items-center">
      <img id="img__logo" src="/img/ocilak.jpeg" alt="Logo OCILAK" className="img-fluid mb-4" onError={handleImgError} />
      <section className="w-100 d-flex justify-content-center" id="cot_cont">
        <div id="container__login" className="p-4 shadow rounded bg-light mx-3 mx-md-0 w-100">
          <form id="form__login" onSubmit={handleSubmit}>
            <h2 className="text-center mb-4 h_titulos">Administrador</h2>
            <div className="mb-3">
              <label htmlFor="correo" className="form-label">Correo:</label>
              <input
                type="email"
                className="form-control"
                id="correo"
                placeholder="Ingresa tu correo"
                name="correo"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="pwd" className="form-label">Contraseña:</label>
              <input
                type="password"
                className="form-control"
                id="pwd"
                placeholder="Ingresa tu contraseña"
                name="contrasena"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <a href="/admin/change-password">Cambiar/recuperar contraseña</a>
            </div>
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            <button type="submit" className="btn btn-ocilak w-100 boton_custom" disabled={loading}>
              {loading ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
