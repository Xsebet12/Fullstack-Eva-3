import React from 'react'

export default function Footer(){
  return (
    <footer className="bg-dark text-white py-4 mt-auto" style={{marginTop:80}}>
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
        <div>
          <h5>YOUKA</h5>
          <p className="mb-0" style={{color:'#ffffff'}}>Calidad y frescura directo a tu hogar.</p>
        </div>
        <div>
          <a href="/about_us.html" className="text-white me-3">Sobre Nosotros</a>
          <a href="/contacto.html" className="text-white me-3">Contacto</a>
          <a href="#" className="text-white me-3">Políticas</a>
          <a href="/locales.html" className="text-white me-3">Locales</a>
          <a href="/blog.html" className="text-white">Blogs</a>
        </div>
        <div>
          <small>© 2025 Youka. Todos los derechos reservados.</small>
        </div>
      </div>
    </footer>
  )
}
