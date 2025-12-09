import React, { useEffect, useState } from 'react'
import { getRegiones, getComunas, register } from '../api/client'

type Region={idRegion:number; nomRegion:string}
type Comuna={idComuna:number; nomComuna:string; region?:{idRegion:number}}

export default function Register(){
  const [regiones,setRegiones]=useState<Region[]>([])
  const [comunas,setComunas]=useState<Comuna[]>([])
  const [regionId,setRegionId]=useState<string>('')
  useEffect(()=>{getRegiones().then(setRegiones); getComunas().then(setComunas)},[])
  async function onSubmit(e:React.FormEvent){
    e.preventDefault()
    const nombres=(document.getElementById('nombres') as HTMLInputElement).value.trim()
    const apellidos=(document.getElementById('apellidos') as HTMLInputElement).value.trim()
    const rut=(document.getElementById('rut') as HTMLInputElement).value.trim()
    const dv=(document.getElementById('dv') as HTMLInputElement).value.trim()
    const correo=(document.getElementById('correo') as HTMLInputElement).value.trim()
    const telefono=(document.getElementById('telefono') as HTMLInputElement).value.trim()
    const contrasena=(document.getElementById('contrasena') as HTMLInputElement).value
    const confirmar=(document.getElementById('confirmar') as HTMLInputElement).value
    const direccion=(document.getElementById('direccion') as HTMLInputElement).value.trim()
    const comunaSel=(document.getElementById('comuna') as HTMLSelectElement).value
    const errores=document.getElementById('errores') as HTMLDivElement
    errores.textContent=''
    if(contrasena!==confirmar){ errores.textContent='Las contraseñas no coinciden'; return }
    const normalized=telefono.replace(/\s+/g,'')
    if(!/^\+\d{8,15}$/.test(normalized)){ errores.textContent='Teléfono requerido en formato internacional (+51 987654321)'; return }
    const body:any={nombres,apellidos,rut,dv,correo,contrasena,direccion,comunaId:Number(comunaSel),telefono}
    try{
      const resp=await register(body)
      if(!resp||!resp.id){ errores.textContent='Error al registrar'; return }
      window.location.href='/login'
    }catch(err:any){
      const b = err?.message || ''
      errores.textContent = b || 'No se pudo registrar'
      return
    }
  }
  const comunasFiltradas=comunas.filter(c=>String(c.region?.idRegion)===String(regionId))
  return (
    <main className="container py-5" style={{marginTop:70,maxWidth:720}}>
      <h2 className="mb-4 text-center">Crear Cuenta</h2>
      <form onSubmit={onSubmit}>
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Nombres</label><input id="nombres" className="form-control" required /></div>
          <div className="col-md-6"><label className="form-label">Apellidos</label><input id="apellidos" className="form-control" required /></div>
          <div className="col-md-8"><label className="form-label">RUT (sin DV)</label><input id="rut" className="form-control" required /></div>
          <div className="col-md-4"><label className="form-label">DV</label><input id="dv" className="form-control" required /></div>
          <div className="col-md-8"><label className="form-label">Correo</label><input type="email" id="correo" className="form-control" required /></div>
          <div className="col-md-4"><label className="form-label">Teléfono</label><input id="telefono" className="form-control" required placeholder="+51 987654321" /></div>
          <div className="col-md-6"><label className="form-label">Contraseña</label><input type="password" id="contrasena" className="form-control" required /></div>
          <div className="col-md-6"><label className="form-label">Confirmar Contraseña</label><input type="password" id="confirmar" className="form-control" required /></div>
          <div className="col-md-12"><label className="form-label">Dirección</label><input id="direccion" className="form-control" required /></div>
          <div className="col-md-6"><label className="form-label">Región</label>
            <select id="region" className="form-select" value={regionId} onChange={e=>setRegionId(e.target.value)} required>
              <option value="">Seleccione una región</option>
              {regiones.map(r=>(<option key={r.idRegion} value={r.idRegion}>{r.nomRegion}</option>))}
            </select>
          </div>
          <div className="col-md-6"><label className="form-label">Comuna</label>
            <select id="comuna" className="form-select" required>
              <option value="">Seleccione una comuna</option>
              {comunasFiltradas.map(c=>(<option key={c.idComuna} value={c.idComuna}>{c.nomComuna}</option>))}
            </select>
          </div>
        </div>
        <div id="errores" className="text-danger mt-3"></div>
        <button className="btn btn-success mt-3 w-100">Crear Cuenta</button>
      </form>
    </main>
  )
}
