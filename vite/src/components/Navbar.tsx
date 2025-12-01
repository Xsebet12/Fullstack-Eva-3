import React from 'react'
import { Link } from 'react-router-dom'

const s: React.CSSProperties = { backgroundColor:'#C1D59E', borderBottom:'2px solid #734F33' }
const brand: React.CSSProperties = { color:'#779B48', fontWeight:700 }
const link: React.CSSProperties = { color:'#734F33' }

export default function Navbar(){
  return (
    <nav className="navbar navbar-expand-md fixed-top" style={s}>
      <div className="container-fluid">
        <Link className="navbar-brand" to="/home" style={brand}>YOUKA</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menuNav" aria-controls="menuNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="menuNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item"><Link className="nav-link" to="/home" style={link}>Home</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/catalogo" style={link}>Productos</Link></li>
            <li className="nav-item"><a className="nav-link" href="/about_us.html" style={link}>Sobre nosotros</a></li>
          </ul>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item"><a className="nav-link" href="/contacto.html" style={link}>Contacto</a></li>
            <li className="nav-item"><Link className="nav-link" to="/carrito" style={link}>Carrito</Link></li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
