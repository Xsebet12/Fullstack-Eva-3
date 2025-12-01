import { useEffect, useState } from 'react'
import AdminHeader from '../components/AdminHeader'
import AdminSidebar from '../components/AdminSidebar'
import AdminOffcanvas from '../components/AdminOffcanvas'
import Footer from '../components/Footer'
import api from '../lib/api'

export default function AdminHome() {
  const [criticos, setCriticos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        // Umbral por defecto 5, sólo productos habilitados por defecto
        const data = await api.get('/api/productos/stock-critico?umbral=5')
        if (!ignore) setCriticos(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!ignore) setError('No se pudieron cargar alertas de stock')
        console.error('Stock crítico:', err)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [])
  return (
    <main className="container-fluid p-0">
      <AdminHeader />

      {/* MAIN */}
      <section className="mt-3">
        <div className="row">
          {/* BOTÓN MENÚ (solo en móviles) */}
          <div className="d-md-none mb-2">
            <button className="btn" type="button" data-bs-toggle="offcanvas" data-bs-target="#menuLateralOffcanvas">
              ☰ Menú
            </button>
          </div>

          {/* SIDEBAR */}
          <AdminSidebar />

          {/* OFFCANVAS */}
          <AdminOffcanvas />

          {/* CONTENIDO PRINCIPAL */}
          <section className="col-12 col-md-9 content">
            <div id="contenedor__general__home" className="p-3">
              <h1 className="h_titulos">Bienvenido!</h1>
              <div className="caja-scroll mt-3"></div>

              <div className="mt-4">
                <h2 className="h5 d-flex align-items-center">Alertas de stock
                  <span className="badge bg-danger ms-2">{criticos.length}</span>
                </h2>
                {error && (<div className="alert alert-danger mt-2">{error}</div>)}
                {loading ? (
                  <div className="d-flex align-items-center">
                    <div className="spinner-border text-secondary me-2" role="status" aria-hidden="true"></div>
                    <span>Cargando…</span>
                  </div>
                ) : criticos.length === 0 ? (
                  <div className="text-muted">No hay productos con stock crítico</div>
                ) : (
                  <div className="table-responsive mt-2">
                    <table className="table table-sm align-middle">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Categoría</th>
                          <th>Stock</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {criticos.map(p => (
                          <tr key={p.id}>
                            <td>{p.nombre}</td>
                            <td>{p.categoria?.nombre ?? '-'}</td>
                            <td><span className="badge bg-danger">{p.stock}</span></td>
                            <td><a className="btn btn-sm btn-outline-primary" href={`/admin/products/${p.id}/edit`}>Reponer</a></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  )
}