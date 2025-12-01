import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import AdminHeader from '../components/AdminHeader'
import AdminSidebar from '../components/AdminSidebar'
import AdminOffcanvas from '../components/AdminOffcanvas'
import Footer from '../components/Footer'

export default function AdminProviders() {
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [togglingId, setTogglingId] = useState(null)
  const [filtro, setFiltro] = useState('todos') // todos | habilitados | deshabilitados

  const handleImgError = (e) => { e.currentTarget.src = '/vite.svg' }
  const deriveLogoUrl = (u) => { try { const urlObj = new URL(u); return `https://logo.clearbit.com/${urlObj.hostname}` } catch { return '' } }

  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        // Cargar según filtro
        let data = []
        const token = localStorage.getItem('authToken')
        if (filtro === 'habilitados') {
          data = await api.get('/api/proveedores?habilitado=true')
        } else if (filtro === 'deshabilitados') {
          try {
            data = await api.get('/api/proveedores?habilitado=false')
          } catch (err) {
            if (err.status === 401 || err.status === 403) {
              setError('Acceso denegado para ver inactivos')
              data = []
            } else {
              throw err
            }
          }
        } else {
          if (token) {
            try {
              data = await api.get('/api/proveedores?all=true')
            } catch (err) {
              if (err.status === 401 || err.status === 403) {
                data = await api.get('/api/proveedores')
              } else {
                throw err
              }
            }
          } else {
            data = await api.get('/api/proveedores')
          }
        }
        if (!ignore) setProviders(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!ignore) setError('No se pudo cargar proveedores. Verifique el backend.')
        console.error('Error cargando proveedores:', err)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [filtro])

  const handleDisable = async (id) => {
    const ok = window.confirm(`¿Eliminar definitivamente el proveedor ${id}? Esta acción no se puede deshacer.`)
    if (!ok) return
    try {
      setError('')
      setDeletingId(id)
      try {
        await api.del(`/api/proveedores/${id}`)
        setProviders((prev) => prev.filter((p) => p.id !== id))
      } catch (err) {
        setError(`No se pudo eliminar (HTTP ${err.status ?? '?'})`)
        console.error('Disable error:', err)
      }
    } catch (err) {
      setError('Error eliminando proveedor. Verifique el backend.')
      console.error('Error eliminando proveedor:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const isActivo = (p) => (p.estado === 'ACTIVO' || p.estado === true) // tolerar boolean si llega

  const handleToggleEstado = async (p) => {
    const nuevoActivo = !isActivo(p)
    try {
      setTogglingId(p.id)
      // Enviamos tanto body JSON como query param para máxima compatibilidad con el backend
      const res = await api.fetch(`/api/proveedores/${p.id}/estado?activo=${nuevoActivo}`, { method: 'PATCH', body: JSON.stringify(nuevoActivo) })
      if (!res.ok) {
        let detail = ''
        try {
          const ct = res.headers.get('content-type') || ''
          if (ct.includes('application/json')) {
            const b = await res.json()
            detail = b?.error ? `: ${b.error}` : ''
          } else {
            const t = await res.text()
            detail = t ? `: ${t}` : ''
          }
        } catch {}
        setError(`No se pudo cambiar estado (HTTP ${res.status})${detail}`)
        return
      }
      const updated = await res.json()
      setProviders((prev) => prev.map((it) => it.id === p.id ? updated : it))
    } catch (err) {
      setError(`No se pudo cambiar estado (HTTP ${err.status ?? '?'})`)
      console.error('Toggle estado error:', err)
    } finally {
      setTogglingId(null)
    }
  }

  const handleUrl = (url) => {
    if (!url) return '-'
    try {
      const u = new URL(url)
      return <a href={u.href} target="_blank" rel="noreferrer">{u.hostname}</a>
    } catch {
      return url
    }
  }

  return (
    <main className="container-fluid p-0">
      <AdminHeader />

      <section className="mt-3">
        <div className="row">
          <div className="d-md-none mb-2">
            <button className="btn" type="button" data-bs-toggle="offcanvas" data-bs-target="#menuLateralOffcanvas">☰ Menú</button>
          </div>

          <AdminSidebar />
          <AdminOffcanvas />

          <section className="col-12 col-md-9 content">
            <div className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="h_titulos m-0">Proveedores</h1>
                <div className="d-flex align-items-center gap-2">
                  <label className="text-muted me-1">Filtro</label>
                  <select className="form-select form-select-sm w-auto" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
                    <option value="todos">Todos</option>
                    <option value="habilitados">Sólo activos</option>
                    <option value="deshabilitados">Sólo inactivos</option>
                  </select>
                  <span className="text-muted">{providers.length} encontrados</span>
                </div>
              </div>

              {error && <div className="alert alert-danger" role="alert">{error}</div>}

              {loading ? (
                <div className="d-flex align-items-center">
                  <div className="spinner-border text-secondary me-2" role="status" aria-hidden="true"></div>
                  <span>Cargando proveedores…</span>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th style={{width: '64px'}}>Logo</th>
                        <th>Empresa</th>
                        <th>Tipo servicio</th>
                        <th>Teléfono</th>
                        <th>URL</th>
                        <th>ID</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {providers.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center text-muted">No hay proveedores</td>
                        </tr>
                      ) : (
                        providers.map((p) => (
                          <tr key={p.id}>
                            <td>
                              <img src={p.logoUrl || deriveLogoUrl(p.url) || '/vite.svg'} alt={p.companyName} width="48" height="48" className="object-fit-cover rounded" onError={handleImgError} />
                            </td>
                            <td className="fw-semibold">{p.companyName}</td>
                            <td>{p.serviceType ?? '-'}</td>
                            <td>{p.phone ?? '-'}</td>
                            <td>{handleUrl(p.url)}</td>
                            <td className="text-muted">{p.id}</td>
                            <td>
                              <span className={`badge ${isActivo(p) ? 'bg-success' : 'bg-secondary'}`}>{isActivo(p) ? 'Activo' : 'Inactivo'}</span>
                              <button className="btn btn-sm btn-outline-secondary ms-2" onClick={() => handleToggleEstado(p)} disabled={togglingId === p.id}>
                                {togglingId === p.id ? 'Cambiando…' : (isActivo(p) ? 'Desactivar' : 'Activar')}
                              </button>
                            </td>
                            <td>
                              {isActivo(p) ? (
                                <Link to={`/admin/providers/${p.id}/edit`} className="btn btn-sm btn-outline-primary me-2">Modificar</Link>
                              ) : (
                                <button className="btn btn-sm btn-outline-primary me-2" disabled title="Proveedor inactivo">Modificar</button>
                              )}
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDisable(p.id)} disabled={deletingId === p.id}>
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