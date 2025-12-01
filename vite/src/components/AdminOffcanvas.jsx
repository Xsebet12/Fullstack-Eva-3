import { Link } from 'react-router-dom'

export default function AdminOffcanvas() {
  return (
    <div className="offcanvas offcanvas-start" tabIndex="-1" id="menuLateralOffcanvas">
      <div className="offcanvas-header">
        <h5 className="offcanvas-title">Menú</h5>
        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div className="offcanvas-body">
        <ul className="navbar-nav">
          <li><span className="nav-link fw-bold">Usuarios</span></li>
          <li><Link className="nav-link" to="/admin/users/create/empleado" data-bs-dismiss="offcanvas">Crear</Link></li>
          <li><Link className="nav-link" to="/admin/users" data-bs-dismiss="offcanvas">Modificar</Link></li>

          <li className="mt-3"><span className="nav-link fw-bold">Productos</span></li>
          <li><Link className="nav-link" to="/admin/products/new" data-bs-dismiss="offcanvas">Crear</Link></li>
          <li><Link className="nav-link" to="/admin/products" data-bs-dismiss="offcanvas">Modificar</Link></li>

          <li className="mt-3"><span className="nav-link fw-bold">Proveedores</span></li>
          <li><Link className="nav-link" to="/admin/providers/new" data-bs-dismiss="offcanvas">Crear</Link></li>
          <li><Link className="nav-link" to="/admin/providers" data-bs-dismiss="offcanvas">Modificar</Link></li>

          <li className="mt-3"><span className="nav-link fw-bold">Ordenes</span></li>
          <li><Link className="nav-link" to="/admin/orders" data-bs-dismiss="offcanvas">Visualizar</Link></li>
        </ul>
      </div>
    </div>
  )
}
