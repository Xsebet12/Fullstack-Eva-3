import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAuthToken } from '../api/client'
// @ts-ignore
import useAuth from '../../auth/useAuth.js'

const link: React.CSSProperties = { color:'#734F33', fontWeight:'bold', fontSize:'1.1rem' }
const logoStyle: React.CSSProperties = { height:56, width:'auto' }

export default function Navbar(){
  const { user } = useAuth()
  const [q,setQ]=useState('')
  const navigate=useNavigate()
  return (
    <nav className="navbar navbar-expand-md navbar-light sticky-top navbar-youka">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center" to="/home">
          <img src="/img/Logo.png" alt="YOUKA" style={logoStyle} onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/vite.svg'}} loading="eager" />
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menuNav" aria-controls="menuNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="menuNav">
          <ul className="navbar-nav ms-3">
            <li className="nav-item"><Link className="nav-link" to="/home" style={link}>Home</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/catalogo" style={link}>Productos</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/sobre-nosotros" style={link}>Sobre nosotros</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/contacto" style={link}>Contacto</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/carrito" style={link}>Carrito</Link></li>
          </ul>
          <form className="d-flex ms-auto me-3" onSubmit={(e)=>{e.preventDefault(); const t=q.trim(); navigate(t?`/catalogo?q=${encodeURIComponent(t)}`:'/catalogo')}}>
            <input className="form-control me-2" type="search" placeholder="Buscar" aria-label="Buscar" value={q} onChange={(e)=>setQ(e.target.value)} style={{maxWidth:240}} />
            <button className="btn btn-youka-outline" type="submit">Buscar</button>
          </form>
          <div className="ms-auto">
            <div className="dropdown">
              <button className="btn btn-youka-outline dropdown-toggle d-flex align-items-center" type="button" id="perfilMenu" data-bs-toggle="dropdown" aria-expanded="false">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="7" r="4" fill="#734F33"/>
                  <path d="M4 21c0-4 4-7 8-7s8 3 8 7" fill="#734F33"/>
                </svg>
                <span className="ms-2" style={{color:'#734F33'}}>Perfil</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="perfilMenu">
                { user || getAuthToken() ? (
                  <>
                    <li><Link className="dropdown-item" to="/perfil">Mi cuenta</Link></li>
                    <li><Link className="dropdown-item" to="/perfil/editar">Editar perfil</Link></li>
                    <li><Link className="dropdown-item" to="/preferencias">Preferencias</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item" onClick={()=>{ try{ localStorage.removeItem('authToken'); localStorage.removeItem('authUser'); localStorage.removeItem('authPrefs'); }catch{} try{ sessionStorage.removeItem('authToken'); sessionStorage.removeItem('authUser'); sessionStorage.removeItem('authPrefs'); }catch{} try{ document.cookie='authToken=; Max-Age=0; Path=/; SameSite=Lax' }catch{} window.location.href='/home' }}>Cerrar sesión</button></li>
                  </>
                ) : (
                  <>
                    <li><Link className="dropdown-item" to="/login">Iniciar sesión</Link></li>
                    <li><Link className="dropdown-item" to="/registrarCuenta">Registrarse</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><Link className="dropdown-item" to="/">Ingresar como empleado</Link></li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
