import React, { useEffect, useMemo, useState } from 'react'
import api from '../../lib/api'
import { getProfile } from '../api/client'
import { useNavigate } from 'react-router-dom'

type Perfil = {
  id?: number
  nombres?: string
  apellidos?: string
  correo?: string
  email?: string
  telefono?: string
  celular?: string
  direccion?: string
  rut?: string
  dv?: string
  comunaId?: number|string
}

export default function EditProfile(){
  const navigate = useNavigate()
  const [loading,setLoading] = useState<boolean>(true)
  const [saving,setSaving] = useState<boolean>(false)
  const [msg,setMsg] = useState<string>('')
  const [error,setError] = useState<string>('')
  const [perfil,setPerfil] = useState<Perfil>({})

  useEffect(()=>{
    let ignore=false
    async function load(){
      try{
        setLoading(true); setError(''); setMsg('')
        const p = await getProfile().catch(()=>null)
        let u: any = p
        if(!u){
          try{ u = JSON.parse(localStorage.getItem('authUser')||sessionStorage.getItem('authUser')||'null') }catch{}
        }
        setPerfil({
          id: u?.id,
          nombres: u?.nombres || u?.nombre || '',
          apellidos: u?.apellidos || '',
          correo: u?.correo || u?.email || '',
          telefono: u?.telefono || u?.celular || u?.phone || u?.fono || u?.contacto?.telefono || '',
          direccion: u?.direccion || '',
          rut: u?.rut || '',
          dv: u?.dv || '',
          comunaId: u?.comunaId || u?.comuna?.idComuna || ''
        })
      }catch(e:any){ setError('No se pudo cargar el perfil') }
      finally{ if(!ignore) setLoading(false) }
    }
    load(); return ()=>{ignore=true}
  },[])

  const emailValido = useMemo(()=>{
    const c = (perfil.correo||'').trim()
    if(!c) return false
    const re = /^[A-Za-z0-9._%+-]+@(gmail\.com|duocuc\.cl)$/
    return re.test(c)
  },[perfil.correo])
  const nombresValidos = useMemo(()=> (perfil.nombres||'').trim().length>0, [perfil.nombres])
  const apellidosValidos = useMemo(()=> (perfil.apellidos||'').trim().length>0, [perfil.apellidos])
  const telefonoValido = useMemo(()=>{
    const t = (perfil.telefono||'').trim()
    if(!t) return true
    const re = /^[\d\s()+-]{7,15}$/
    return re.test(t)
  },[perfil.telefono])
  const direccionValida = useMemo(()=> (perfil.direccion||'').trim().length>0, [perfil.direccion])

  const formValido = useMemo(()=> nombresValidos && apellidosValidos && emailValido && telefonoValido && direccionValida, [nombresValidos, apellidosValidos, emailValido, telefonoValido, direccionValida])

  async function onSubmit(e:React.FormEvent){
    e.preventDefault()
    setMsg(''); setError('')
    if(!formValido){
      if(!nombresValidos){ setError('Nombre es requerido'); return }
      if(!apellidosValidos){ setError('Apellido es requerido'); return }
      if(!emailValido){ setError('Correo debe ser @gmail.com o @duocuc.cl'); return }
      if(!telefonoValido){ setError('Teléfono con formato inválido'); return }
      if(!direccionValida){ setError('Dirección es requerida'); return }
    }
    try{
      setSaving(true)
      const payload:any = {
        nombres: (perfil.nombres||'').trim(),
        apellidos: (perfil.apellidos||'').trim(),
        correo: (perfil.correo||'').trim(),
        telefono: (perfil.telefono||'').trim() || null,
        direccion: (perfil.direccion||'').trim(),
        comunaId: perfil.comunaId ? Number(perfil.comunaId) : undefined,
      }
      if(perfil.rut) payload.rut = (perfil.rut||'').trim()
      if(perfil.dv) payload.dv = (perfil.dv||'').trim()

      const updated = await api.put('/api/usuarios/me', payload)
      try{
        const storage = localStorage.getItem('authToken') ? localStorage : (sessionStorage.getItem('authToken')?sessionStorage:localStorage)
        storage.setItem('authUser', JSON.stringify(updated))
      }catch{}
      setMsg('Perfil actualizado correctamente')
    }catch(err:any){
      const status = Number(err?.status||0)
      if(status===401){ setError('Sesión inválida o expirada. Inicia sesión nuevamente.') }
      else { setError(String(err?.body?.message || err?.message || 'No se pudo actualizar el perfil')) }
    }finally{ setSaving(false) }
  }

  return (
    <main className="container py-5" style={{marginTop:70, maxWidth:720}}>
      <h2 className="mb-4 text-youka">Editar Perfil</h2>
      {msg && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div className="d-flex align-items-center"><div className="spinner-border me-2"/><span>Cargando…</span></div>
      ) : (
        <form onSubmit={onSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nombre</label>
              <input type="text" className={`form-control ${perfil.nombres ? (nombresValidos ? 'is-valid' : 'is-invalid') : ''}`} value={perfil.nombres||''} onChange={e=>setPerfil(p=>({...p, nombres:e.target.value}))} />
              {!nombresValidos && perfil.nombres && <div className="invalid-feedback">Requerido.</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label">Apellido</label>
              <input type="text" className={`form-control ${perfil.apellidos ? (apellidosValidos ? 'is-valid' : 'is-invalid') : ''}`} value={perfil.apellidos||''} onChange={e=>setPerfil(p=>({...p, apellidos:e.target.value}))} />
              {!apellidosValidos && perfil.apellidos && <div className="invalid-feedback">Requerido.</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label">Correo</label>
              <input type="email" className={`form-control ${perfil.correo ? (emailValido ? 'is-valid' : 'is-invalid') : ''}`} value={perfil.correo||''} onChange={e=>setPerfil(p=>({...p, correo:e.target.value}))} placeholder="usuario@gmail.com o usuario@duocuc.cl" />
              {!emailValido && perfil.correo && <div className="invalid-feedback">Solo se permiten dominios gmail.com o duocuc.cl.</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label">Teléfono (opcional)</label>
              <input type="text" className={`form-control ${perfil.telefono ? (telefonoValido ? 'is-valid' : 'is-invalid') : ''}`} value={perfil.telefono||''} onChange={e=>setPerfil(p=>({...p, telefono:e.target.value}))} />
              {!telefonoValido && perfil.telefono && <div className="invalid-feedback">Formato permitido: dígitos, espacios, +, -, ().</div>}
            </div>
            <div className="col-12">
              <label className="form-label">Dirección</label>
              <input type="text" className={`form-control ${perfil.direccion ? (direccionValida ? 'is-valid' : 'is-invalid') : ''}`} value={perfil.direccion||''} onChange={e=>setPerfil(p=>({...p, direccion:e.target.value}))} />
              {!direccionValida && perfil.direccion && <div className="invalid-feedback">Requerido.</div>}
            </div>
          </div>
          <div className="mt-4 d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-outline-secondary" onClick={()=>navigate('/perfil')}>Cancelar</button>
            <button type="submit" className="btn btn-youka" disabled={saving || !formValido}>{saving?'Guardando…':'Guardar cambios'}</button>
          </div>
        </form>
      )}
    </main>
  )
}
