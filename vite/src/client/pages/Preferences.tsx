import React, { useEffect, useState } from 'react'

type Prefs = { preferredCategory?: string; newsletter?: boolean; deliveryNotes?: string }

export default function Preferences(){
  const [prefs,setPrefs]=useState<Prefs>({})
  useEffect(()=>{
    try{
      const p = localStorage.getItem('authPrefs') || sessionStorage.getItem('authPrefs')
      if(p) setPrefs(JSON.parse(p))
    }catch{}
  },[])
  function save(){
    try{ localStorage.setItem('authPrefs', JSON.stringify(prefs)) }catch{}
    alert('Preferencias guardadas')
  }
  return (
    <main className="container py-5" style={{marginTop:70,maxWidth:720}}>
      <h2 className="mb-4 text-youka">Preferencias</h2>
      <div className="card p-3">
        <div className="mb-3">
          <label className="form-label">Categoría preferida</label>
          <select className="form-select" value={prefs.preferredCategory||''} onChange={e=>setPrefs({...prefs,preferredCategory:e.target.value})}>
            <option value="">Sin preferencia</option>
            <option value="frutas">Frutas y verduras</option>
            <option value="carnes">Carnes y pescados</option>
            <option value="platos">Platos preparados</option>
          </select>
        </div>
        <div className="form-check mb-3">
          <input className="form-check-input" type="checkbox" id="newsletter" checked={!!prefs.newsletter} onChange={e=>setPrefs({...prefs,newsletter:e.target.checked})} />
          <label className="form-check-label" htmlFor="newsletter">Recibir ofertas por email</label>
        </div>
        <div className="mb-3">
          <label className="form-label">Notas de despacho</label>
          <textarea className="form-control" rows={3} value={prefs.deliveryNotes||''} onChange={e=>setPrefs({...prefs,deliveryNotes:e.target.value})}></textarea>
        </div>
        <button className="btn btn-youka" onClick={save}>Guardar</button>
      </div>
    </main>
  )
}

