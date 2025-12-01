import React, { useState } from 'react'
import { sendContacto } from '../api/client'

export default function Contact(){
  const [nombre,setNombre]=useState('')
  const [correo,setCorreo]=useState('')
  const [mensaje,setMensaje]=useState('')
  const [sending,setSending]=useState(false)
  async function send(){
    if(!nombre.trim()||!correo.trim()||!mensaje.trim()){ alert('Completa todos los campos'); return }
    try{
      setSending(true)
      await sendContacto({nombre,correo,mensaje})
      alert('Mensaje enviado. Te responderemos pronto.')
      setNombre(''); setCorreo(''); setMensaje('')
    }catch(e:any){
      if(e?.status===401){ alert('Debes iniciar sesión para enviar el formulario.'); return }
      alert(String(e?.message||'Error al enviar'))
    }
    finally{ setSending(false) }
  }
  return (
    <main className="container py-5" style={{marginTop:70, maxWidth:720}}>
      <h2 className="mb-4">Contacto</h2>
      <form onSubmit={(e)=>{e.preventDefault(); send()}}>
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input type="text" className="form-control" placeholder="Tu nombre" value={nombre} onChange={(e)=>setNombre(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Correo</label>
          <input type="email" className="form-control" placeholder="tucorreo@dominio.com" value={correo} onChange={(e)=>setCorreo(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Mensaje</label>
          <textarea className="form-control" rows={4} placeholder="¿Cómo podemos ayudarte?" value={mensaje} onChange={(e)=>setMensaje(e.target.value)}></textarea>
        </div>
        <button className="btn btn-success" type="submit" disabled={sending}>{sending?'Enviando…':'Enviar'}</button>
      </form>
      <div className="mt-4">
        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <div className="fw-bold">Correo</div>
                <div>contacto@youka.cl</div>
              </div>
              <div className="col-md-6">
                <div className="fw-bold">Teléfono</div>
                <div>+56 2 1234 5678</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
