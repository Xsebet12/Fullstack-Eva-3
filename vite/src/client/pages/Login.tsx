import React from 'react'
import { login } from '../api/client'

export default function Login(){
  async function onSubmit(e:React.FormEvent){
    e.preventDefault()
    const correo=(document.getElementById('email') as HTMLInputElement).value.trim()
    const contrasena=(document.getElementById('password') as HTMLInputElement).value
    const remember=(document.getElementById('remember-me') as HTMLInputElement)?.checked
    const data=await login(correo,contrasena)
    if(!data||!data.token){ alert('Credenciales inválidas'); return }
    const storage = remember ? localStorage : sessionStorage
    storage.setItem('authToken',data.token)
    if(data.user){ try{ storage.setItem('authUser',JSON.stringify(data.user)) }catch{}
    } else {
      try{ storage.setItem('authUser',JSON.stringify({correo})) }catch{}
    }
    if(data.prefs){ try{ storage.setItem('authPrefs',JSON.stringify(data.prefs)) }catch{}
    }
    window.location.href='/home'
  }
  return (
    <main className="container" style={{marginTop:70}}>
      <div className="d-flex justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="text-center mb-4">
            <h2 className="mb-2 text-youka">Bienvenido!</h2>
            <p className="text-muted">Inicia sesión para acceder a tus delicias congeladas.</p>
          </div>
          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="email">Email</label>
              <input type="email" id="email" className="form-control" placeholder="tunombre@example.com" required />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="password">Contraseña</label>
              <input type="password" id="password" className="form-control" placeholder="••••••••" required />
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="remember-me" />
                <label className="form-check-label" htmlFor="remember-me">Guardar inicio de sesión</label>
              </div>
              <a href="/recuperar">¿Olvidaste tu contraseña?</a>
            </div>
            <button type="submit" className="btn btn-youka w-100">Iniciar sesión</button>
          </form>
          <p className="mt-4 text-center text-muted">
            ¿No tienes una cuenta? <a href="/registrarCuenta" className="text-youka">Regístrate ahora</a>
          </p>
        </div>
      </div>
    </main>
  )
}
