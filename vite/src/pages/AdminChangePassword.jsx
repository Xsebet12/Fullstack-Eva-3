import { useState } from 'react'
import AdminHeader from '../components/AdminHeader'
import AdminSidebar from '../components/AdminSidebar'
import AdminOffcanvas from '../components/AdminOffcanvas'
import Footer from '../components/Footer'
import api from '../lib/api'

export default function AdminChangePassword(){
  const [antigua,setAntigua]=useState('')
  const [nueva,setNueva]=useState('')
  const [msg,setMsg]=useState('')
  async function submit(e){
    e.preventDefault()
    setMsg('')
    try{
      await api.post('/api/usuarios/change-password',{antigua,nueva})
      setMsg('Contraseña actualizada')
    }catch(err){
      setMsg(err?.body?.message || 'Error al cambiar contraseña')
    }
  }
  return (
    <main className="container-fluid p-0">
      <AdminHeader />
      <section className="mt-3">
        <div className="row">
          <AdminSidebar />
          <AdminOffcanvas />
          <section className="col-12 col-md-9 content">
            <div className="p-3">
              <h1 className="h_titulos">Cambiar contraseña</h1>
              {msg && <div className="alert alert-info mt-2">{msg}</div>}
              <form onSubmit={submit} className="mt-3" style={{maxWidth:480}}>
                <div className="mb-3">
                  <label className="form-label">Contraseña actual</label>
                  <input type="password" className="form-control" value={antigua} onChange={e=>setAntigua(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Nueva contraseña</label>
                  <input type="password" className="form-control" value={nueva} onChange={e=>setNueva(e.target.value)} required />
                </div>
                <button className="btn btn-ocilak" type="submit">Actualizar</button>
              </form>
            </div>
          </section>
        </div>
      </section>
      <Footer />
    </main>
  )
}

