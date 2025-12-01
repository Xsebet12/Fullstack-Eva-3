import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import AdminHeader from '../components/AdminHeader'
import AdminSidebar from '../components/AdminSidebar'
import AdminOffcanvas from '../components/AdminOffcanvas'
import Footer from '../components/Footer'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [togglingId, setTogglingId] = useState(null)
  const [filtro, setFiltro] = useState('todos') // todos | habilitados | deshabilitados
  const [q, setQ] = useState('')
  const [qDebounced, setQDebounced] = useState('')
  const [categorias, setCategorias] = useState([])
  const [categoriaId, setCategoriaId] = useState('')
  const [soloStockBajo, setSoloStockBajo] = useState(false)
  const [umbral, setUmbral] = useState(5)

  // Debounce de búsqueda
  useEffect(() => {
    const h = setTimeout(() => setQDebounced(q), 300)
    return () => clearTimeout(h)
  }, [q])

  // Cargar categorías para el filtro (una vez)
  useEffect(() => {
    let ignore = false
    const loadCategorias = async () => {
      try {
        const data = await api.get('/api/categorias')
        if (!ignore) setCategorias(Array.isArray(data) ? data : [])
      } catch (err) {
        console.warn('No se pudieron cargar categorías', err)
      }
    }
    loadCategorias()
    return () => { ignore = true }
  }, [])

  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        // Cargar según filtro seleccionado
        let data = []
        let token = null
        try{ token = localStorage.getItem('authToken') }catch{}
        if(!token){ try{ token = sessionStorage.getItem('authToken') }catch{} }
        // Armar query params de búsqueda y categoría
        const qParams = []
        if (qDebounced) qParams.push(`q=${encodeURIComponent(qDebounced)}`)
        if (categoriaId) qParams.push(`categoriaId=${encodeURIComponent(categoriaId)}`)
        const extra = qParams.length ? `&${qParams.join('&')}` : ''

        if (soloStockBajo) {
          // Usar endpoint de stock crítico. Aplica habilitado/all similar a la lista normal
          const base = `/api/productos/stock-critico?umbral=${encodeURIComponent(umbral || 5)}`
          if (filtro === 'habilitados') {
            data = await api.get(base) // por defecto usa habilitados en backend
          } else if (filtro === 'deshabilitados') {
            try {
              data = await api.get(base + '&habilitado=false')
            } catch (err) {
              if (err.status === 401 || err.status === 403) {
                setError('Acceso denegado para ver deshabilitados')
                data = []
              } else {
                throw err
              }
            }
          } else {
            if (token) {
              try {
                data = await api.get(base + '&all=true')
              } catch (err) {
                if (err.status === 401 || err.status === 403) {
                  data = await api.get(base) // fallback a habilitados
                } else {
                  throw err
                }
              }
            } else {
              data = await api.get(base)
            }
          }
          // Aplicar búsqueda y categoría en el cliente
          if (qDebounced) {
            const term = qDebounced.toLowerCase()
            data = data.filter(p => p.nombre && p.nombre.toLowerCase().includes(term))
          }
          if (categoriaId) {
            data = data.filter(p => p.categoria && String(p.categoria.id) === String(categoriaId))
          }
        } else {
          if (filtro === 'habilitados') {
            data = await api.get(`/api/productos?habilitado=true${extra}`)
          } else if (filtro === 'deshabilitados') {
            // requiere ADMIN
            try {
              data = await api.get(`/api/productos?habilitado=false${extra}`)
            } catch (err) {
              if (err.status === 401 || err.status === 403) {
                setError('Acceso denegado para ver deshabilitados')
                data = []
              } else {
                throw err
              }
            }
          } else {
            // todos => si ADMIN, all=true; sino, solo habilitados
            if (token) {
              try {
                data = await api.get(`/api/productos?all=true${extra}`)
              } catch (err) {
                if (err.status === 401 || err.status === 403) {
                  data = await api.get(`/api/productos?${extra.startsWith('&') ? extra.slice(1) : extra}`)
                } else {
                  throw err
                }
              }
            } else {
              data = await api.get(`/api/productos?${extra.startsWith('&') ? extra.slice(1) : extra}`)
            }
          }
        }
        if (!ignore) setProducts(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!ignore) setError('No se pudo cargar productos. Verifique el backend.')
        console.error('Error cargando productos:', err)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [filtro, qDebounced, categoriaId, soloStockBajo, umbral])

  const formatPrice = (value) => {
    try {
      const num = typeof value === 'number' ? value : Number(value)
      if (Number.isFinite(num)) {
        return num.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })
      }
    } catch {}
    return value ?? '-'
  }

  const handleImgError = (e) => { e.currentTarget.src = '/vite.svg' }

  const handleDelete = async (id) => {
    const ok = window.confirm(`¿Eliminar el producto ${id}?`)
    if (!ok) return
    try {
      setError('')
      setDeletingId(id)
      try {
        await api.del(`/api/productos/${id}`)
        setProducts((prev) => prev.filter((p) => p.id !== id))
      } catch (err) {
        const msg = `No se pudo eliminar (HTTP ${err.status ?? '?'})`
        setError(msg)
        console.error('Eliminar producto error:', err)
      }
    } catch (err) {
      setError('Error eliminando producto. Verifique el backend.')
      console.error('Error eliminando producto:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleEnabled = async (p) => {
    const nuevo = !(p.habilitado === true)
    try {
      setTogglingId(p.id)
      const res = await api.fetch(`/api/productos/${p.id}/habilitado`, { method: 'PATCH', body: JSON.stringify(nuevo) })
      if (!res.ok) { setError(`No se pudo cambiar estado (HTTP ${res.status})`); return }
      const updated = await res.json()
      setProducts((prev) => prev.map((it) => it.id === p.id ? updated : it))
    } catch (err) {
      setError(`No se pudo cambiar estado (HTTP ${err.status ?? '?'})`)
      console.error('Toggle habilitado error:', err)
    } finally {
      setTogglingId(null)
    }
  }

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
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="h_titulos m-0">Productos</h1>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="input-group input-group-sm" style={{minWidth:'260px'}}>
                    <span className="input-group-text">Buscar</span>
                    <input className="form-control" placeholder="nombre de producto" value={q}
                      onChange={(e) => setQ(e.target.value)} />
                  </div>
                  <select className="form-select form-select-sm w-auto" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
                    <option value="">Todas las categorías</option>
                    {categorias.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" id="soloStockBajo"
                      checked={soloStockBajo} onChange={(e) => setSoloStockBajo(e.target.checked)} />
                    <label className="form-check-label" htmlFor="soloStockBajo">Sólo stock bajo</label>
                  </div>
                  <div className="input-group input-group-sm" style={{width:'130px'}}>
                    <span className="input-group-text" title="Umbral de stock">&lt;</span>
                    <input type="number" min="0" className="form-control" value={umbral}
                      onChange={(e) => setUmbral(Number(e.target.value) || 0)} disabled={!soloStockBajo} />
                  </div>
                  <select className="form-select form-select-sm w-auto" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
                    <option value="todos">Todos</option>
                    <option value="habilitados">Sólo habilitados</option>
                    <option value="deshabilitados">Sólo deshabilitados</option>
                  </select>
                  <span className="text-muted">{products.length} encontrados</span>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">{error}</div>
              )}

              {loading ? (
                <div className="d-flex align-items-center">
                  <div className="spinner-border text-secondary me-2" role="status" aria-hidden="true"></div>
                  <span>Cargando productos…</span>
                </div>
              ) : (
                <div className="table-responsive">
                  <table id="tabla_productos" className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th style={{width: '64px'}}>Imagen</th>
                        <th>Nombre</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>ID</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center text-muted">No hay productos</td>
                        </tr>
                      ) : (
                        products.map((p) => (
                          <tr key={p.id}>
                            <td>
                              <img src={p.imagen || '/vite.svg'} alt={p.nombre} width="48" height="48" className="object-fit-cover rounded" onError={handleImgError} loading="lazy" decoding="async" />
                            </td>
                            <td className="fw-semibold">{p.nombre}</td>
                            <td>{p.categoria?.nombre ?? '-'}</td>
                            <td>{formatPrice(p.precio)}</td>
                            <td>
                              {p.stock ?? '-'}
                              {typeof p.stock === 'number' && p.stock < 5 && (
                                <span className="badge bg-danger ms-2" title="Stock crítico">Bajo</span>
                              )}
                            </td>
                            <td className="text-muted">{p.id}</td>
                            <td>
                              <span className={`badge ${p.habilitado ? 'bg-success' : 'bg-secondary'}`}>{p.habilitado ? 'Habilitado' : 'Deshabilitado'}</span>
                              <button className="btn btn-sm btn-outline-secondary ms-2" onClick={() => handleToggleEnabled(p)} disabled={togglingId === p.id}>
                                {togglingId === p.id ? 'Cambiando…' : (p.habilitado ? 'Deshabilitar' : 'Habilitar')}
                              </button>
                            </td>
                            <td>
                              {p.habilitado ? (
                                <Link to={`/admin/products/${p.id}/edit`} className="btn btn-sm btn-outline-primary me-2">Modificar</Link>
                              ) : (
                                <button className="btn btn-sm btn-outline-primary me-2" disabled title="Producto deshabilitado">Modificar</button>
                              )}
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}>
                                {deletingId === p.id ? 'Eliminando…' : 'Eliminar'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  )
}
