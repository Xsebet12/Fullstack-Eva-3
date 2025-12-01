import { Link } from 'react-router-dom'

export default function AdminHeader() {
  const handleLogoError = (e) => { e.currentTarget.src = '/vite.svg' }
  return (
    <header>
      <nav className="navbar navbar-expand-sm navbar-dark bg-ocilak border-bottom">
        <div className="container-fluid">
          <Link className="navbar-brand d-flex align-items-center fw-bold" to="/admin">
            <img src="/img/ocilak.jpeg" alt="Logo OCILAK" className="logo-ocilak me-2" onError={handleLogoError} loading="eager" />
            OCILAK
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarAdmin"
            aria-controls="navbarAdmin"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarAdmin">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><Link className="nav-link" to="/admin">Panel</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/admin/products">Productos</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/admin/providers">Proveedores</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/admin/users">Usuarios</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/youka">Web</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/admin/change-password">Cambiar Contraseña</Link></li>
              <li className="nav-item">
                <a className="nav-link" href="/" onClick={(e)=>{ e.preventDefault(); try{ localStorage.removeItem('authToken'); }catch{} try{ sessionStorage.removeItem('authToken') }catch{} try{ document.cookie='authToken=; Max-Age=0; Path=/; SameSite=Lax' }catch{} window.location.href='/' }}>Cerrar sesión</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  )
}
