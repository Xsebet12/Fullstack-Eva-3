import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer(){
  return (
    <footer className="bg-dark text-white py-4 mt-auto">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
        <div>
          <h5>YOUKA</h5>
          <p className="mb-0" style={{color:'#ffffff'}}>Calidad y frescura directo a tu hogar.</p>
        </div>
        <div>
          <Link to="/sobre-nosotros" className="text-white me-3">Sobre Nosotros</Link>
          <Link to="/contacto" className="text-white me-3">Contacto</Link>
          <Link to="/politicas" className="text-white me-3">Políticas</Link>
          <Link to="/locales" className="text-white me-3">Locales</Link>
          <Link to="/blog" className="text-white">Blogs</Link>
        </div>
        <div>
          <small>© 2025 Youka. Todos los derechos reservados.</small>
        </div>
      </div>
    </footer>
  )
}
