import { Link } from 'react-router-dom'

export default function Header() {
  const handleLogoError = (e) => { e.currentTarget.src = '/vite.svg' }
  return (
    <header>
      <nav className="navbar navbar-expand-sm navbar-dark bg-ocilak border-bottom">
        <div className="container-fluid">
          <Link className="navbar-brand d-flex align-items-center fw-bold" to="/">
            <img src="/img/ocilak.jpeg" alt="Logo OCILAK" className="logo-ocilak me-2" onError={handleLogoError} loading="eager" />
            OCILAK
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><Link className="nav-link" to="/home">Home Cliente</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/youka">Youka</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/consultoria">Consultoría</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/negocios">Negocios</Link></li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
