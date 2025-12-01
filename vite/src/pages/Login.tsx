import React from 'react'
import { login } from '../api/client'

export default function Login(){
  async function onSubmit(e:React.FormEvent){
    e.preventDefault()
    const correo=(document.getElementById('email') as HTMLInputElement).value.trim()
    const contrasena=(document.getElementById('password') as HTMLInputElement).value
    const data=await login(correo,contrasena)
    if(!data||!data.token){ alert('Credenciales inválidas'); return }
    localStorage.setItem('authToken',data.token)
    window.location.href='/home'
  }
  return (
    <main className="container py-5" style={{marginTop:70,maxWidth:520}}>
      <h2 className="mb-4 text-center">Iniciar sesión</h2>
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">Correo</label>
          <input type="email" id="email" className="form-control" required />
        </div>
        <div className="mb-3">
          <label className="form-label">Contraseña</label>
          <input type="password" id="password" className="form-control" required />
        </div>
        <button className="btn btn-success w-100">Ingresar</button>
      </form>
      <div className="mt-3 text-center">
        <a href="/registrarCuenta">Crear cuenta</a>
      </div>
    </main>
  )
}
