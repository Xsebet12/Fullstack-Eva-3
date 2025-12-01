import React, { useState } from 'react'
import api from '../../lib/api'

export default function ForgotPassword(){
  const [correo,setCorreo] = useState('')
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState('')
  const [temporal,setTemporal] = useState('')

  async function onSubmit(e:React.FormEvent){
    e.preventDefault()
    setError('')
    setTemporal('')
    setLoading(true)
    try{
      const res = await api.post('/api/autenticacion/forgot', { correo })
      setTemporal(String(res?.temporal||''))
    }catch(err:any){
      setError(String(err?.body?.message || err?.message || 'Error inesperado'))
    }finally{
      setLoading(false)
    }
  }

  return (
    <main className="container" style={{marginTop:70}}>
      <div className="d-flex justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="text-center mb-4">
            <h2 className="mb-2 text-youka">Recuperar contraseña</h2>
            <p className="text-muted">Ingresa tu correo para generar una contraseña temporal.</p>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          {temporal && (
            <div className="alert alert-info">
              <div>Se generó una contraseña temporal:</div>
              <div className="mt-2"><code>{temporal}</code></div>
              <div className="mt-2">Úsala para iniciar sesión y luego cámbiala.</div>
            </div>
          )}
          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="email">Email</label>
              <input type="email" id="email" className="form-control" placeholder="tunombre@example.com" value={correo} onChange={e=>setCorreo(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-youka w-100" disabled={loading}>{loading?'Procesando…':'Generar temporal'}</button>
            <p className="mt-3 text-center"><a href="/login">Volver a iniciar sesión</a></p>
          </form>
        </div>
      </div>
    </main>
  )
}

