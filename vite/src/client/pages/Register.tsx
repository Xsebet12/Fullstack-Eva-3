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
    const terminos=(document.getElementById('terminos') as HTMLInputElement)?.checked
    const errores=document.getElementById('errores') as HTMLDivElement
    errores.textContent=''
    if(!terminos){ errores.textContent='Debes aceptar los términos y condiciones'; return }
    if(contrasena!==confirmar){ errores.textContent='Las contraseñas no coinciden'; return }
    // Validación previa de dominio de correo para evitar 400 del backend
    if(!/^[A-Za-z0-9._%+-]+@(gmail\.com|duocuc\.cl)$/.test(correo)){ errores.textContent='El correo debe ser @gmail.com o @duocuc.cl'; return }
    if(telefono && !/^[\d\s()+-]{7,15}$/.test(telefono)){ errores.textContent='Teléfono con formato inválido'; return }
    try{
      const body:any={nombres,apellidos,rut,dv,correo,contrasena,direccion,comunaId:Number(comunaSel)}
      if(telefono) body.telefono = telefono
      const resp=await register(body)
      if(!resp||!resp.id){ errores.textContent='Error al registrar'; return }
      window.location.href='/login'
    }catch(err:any){
      errores.textContent=String(err?.message||'No se pudo registrar')
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
          <div className="col-md-4"><label className="form-label">Teléfono (opcional)</label><input id="telefono" className="form-control" /></div>
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
        <div className="form-check mt-3">
          <input className="form-check-input" type="checkbox" id="terminos" />
          <label className="form-check-label" htmlFor="terminos">Acepto los <a href="/politicas">términos y condiciones</a> y la política de privacidad</label>
        </div>
        <div className="form-check mt-2">
          <input className="form-check-input" type="checkbox" id="newsletter" />
          <label className="form-check-label" htmlFor="newsletter">Deseo recibir ofertas especiales y novedades por email</label>
        </div>
        <div id="errores" className="text-danger mt-3"></div>
        <button className="btn btn-youka mt-3 w-100">Crear Cuenta</button>
      </form>
    </main>
  )
}
