import React, { useEffect, useState } from 'react'
// @ts-ignore
import useAuth from '../../auth/useAuth.js'
import { getProfile } from '../api/client'

export default function Account(){
  const { user } = useAuth()
  const [profile,setProfile]=useState<any|null>(null)
  const [prefs,setPrefs]=useState<any>({})
  useEffect(()=>{
    const p = localStorage.getItem('authPrefs') || sessionStorage.getItem('authPrefs')
    if(p){ try{ setPrefs(JSON.parse(p) || {}) }catch{ setPrefs({}) } } else { setPrefs({}) }
    getProfile().then(setProfile).catch(()=>{})
  },[])
  const u = profile || user || ((()=>{ try{ return JSON.parse(localStorage.getItem('authUser')||sessionStorage.getItem('authUser')||'null') }catch{ return null } })())
  return (
    <main className="container py-5" style={{marginTop:70,maxWidth:720}}>
      <h2 className="mb-4 text-youka">Mi cuenta</h2>
      {u ? (
        <div className="card p-3">
        <div className="row g-3">
          <div className="col-md-6"><strong>Nombre</strong><div>{u.nombres ?? u.nombre ?? '-'}</div></div>
          <div className="col-md-6"><strong>Apellido</strong><div>{u.apellidos ?? '-'}</div></div>
          <div className="col-md-6"><strong>Correo</strong><div>{u.correo ?? u.email ?? '-'}</div></div>
          <div className="col-md-6"><strong>Teléfono</strong><div>{u.telefono ?? u.celular ?? u.phone ?? u.fono ?? (u.contacto?.telefono ?? '-')}</div></div>
          <div className="col-md-6"><strong>RUT</strong><div>{u.rut ? `${u.rut}-${u.dv ?? ''}` : '-'}</div></div>
            <div className="col-12"><strong>Preferencias</strong>
              <div className="mt-1">
                <div>Categoría preferida: {prefs?.preferredCategory || '-'}</div>
                <div>Newsletter: {prefs?.newsletter? 'Sí':'No'}</div>
                <div>Notas de despacho: {prefs?.deliveryNotes || '-'}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-warning">No has iniciado sesión.</div>
      )}
    </main>
  )
}
