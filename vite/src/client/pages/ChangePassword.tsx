import React, { useState } from 'react'
import api from '../../lib/api'

export default function ChangePassword(){
  const [antigua,setAntigua] = useState('')
  const [nueva,setNueva] = useState('')
  const [loading,setLoading] = useState(false)
  const [msg,setMsg] = useState('')
  const [error,setError] = useState('')

  async function onSubmit(e:React.FormEvent){
    e.preventDefault()
    setMsg('')
    setError('')
    setLoading(true)
    try{
      await api.post('/api/usuarios/change-password', { antigua, nueva })
      setMsg('Contraseña actualizada')
      setAntigua('')
      setNueva('')
    }catch(err:any){
      setError(String(err?.body?.message || err?.message || 'Error al cambiar contraseña'))
    }finally{
      setLoading(false)
    }
  }

  return (
    <main className="container" style={{marginTop:70}}>
      <div className="d-flex justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="text-center mb-4">
            <h2 className="mb-2 text-youka">Cambiar contraseña</h2>
            <p className="text-muted">Actualiza tu contraseña de forma segura.</p>
          </div>
          {msg && <div className="alert alert-success">{msg}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="old">Contraseña actual</label>
              <input type="password" id="old" className="form-control" value={antigua} onChange={e=>setAntigua(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="new">Nueva contraseña</label>
              <input type="password" id="new" className="form-control" value={nueva} onChange={e=>setNueva(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-youka w-100" disabled={loading}>{loading?'Actualizando…':'Actualizar'}</button>
          </form>
        </div>
      </div>
    </main>
  )
}

