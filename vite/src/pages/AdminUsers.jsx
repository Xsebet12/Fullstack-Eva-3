import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import AdminHeader from '../components/AdminHeader'
import AdminSidebar from '../components/AdminSidebar'
import AdminOffcanvas from '../components/AdminOffcanvas'
import Footer from '../components/Footer'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [togglingId, setTogglingId] = useState(null)
  const [filtro, setFiltro] = useState('todos') // todos | habilitados | deshabilitados
  const [vista, setVista] = useState('empleados') // empleados | clientes

  // Paginación cliente
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const token = localStorage.getItem('authToken')
        if (!token) {
          setError('Requiere sesión ADMIN para listar usuarios.')
          setUsers([])
          return
        }
        let data = []
        try {
          const tipo = vista === 'empleados' ? 'empleados' : 'clientes'
          let url = `/api/usuarios?tipo=${tipo}`
          if (filtro === 'habilitados') url += '&habilitado=true'
          else if (filtro === 'deshabilitados') url += '&habilitado=false'
          data = await api.get(url)
        } catch (err) {
          if (err.status === 401 || err.status === 403) {
            setError('Acceso denegado. Se requiere rol ADMIN.')
            setUsers([])
            return
          }
          throw err
        }
        
        if (!ignore) setUsers(Array.isArray(data) ? data : [])
      } catch (err) {
        const detalle = err?.body?.error || ''
        if (!ignore) setError(`No se pudo cargar usuarios. ${detalle ? detalle : 'Verifique permisos ADMIN y el backend.'}`)
        console.error('Error cargando usuarios:', err)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [filtro, vista])

  const empleados = useMemo(() => users.filter(u => u.rol), [users])
  const clientes = useMemo(() => users.filter(u => !u.rol), [users])

  const filtrados = useMemo(() => {
    const base = vista === 'empleados' ? empleados : clientes
    if (filtro === 'habilitados') return base.filter(u => u.enabled)
    if (filtro === 'deshabilitados') return base.filter(u => !u.enabled)
    return base
  }, [vista, filtro, empleados, clientes])

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filtrados.length / pageSize))
  }, [filtrados.length, pageSize])

  const pagedUsers = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtrados.slice(start, start + pageSize)
  }, [filtrados, page, pageSize])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
    if (page < 1) setPage(1)
  }, [totalPages, page])

  const handleDisable = async (id) => {
    const ok = window.confirm(`¿Eliminar (deshabilitar) usuario ${id}?`)
    if (!ok) return
    try {
      setError('')
      setDeletingId(id)
      const res = await api.fetch(`/api/usuarios/${id}`, { method: 'DELETE' })
      if (res.status === 204) {
        setUsers((prev) => prev.filter((u) => u.id !== id))
      } else if (!res.ok) {
        const msg = await res.text().catch(() => '')
        setError(`No se pudo eliminar (HTTP ${res.status}) ${msg || ''}`)
        console.error('Disable user error:', res.status, msg)
      }
    } catch (err) {
      setError('Error eliminando usuario. Verifique el backend.')
      console.error('Error eliminando usuario:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const isEnabled = (u) => Boolean(u.enabled)

  const handleToggleEstado = async (u) => {
    const nuevo = !isEnabled(u)
    try {
      setTogglingId(u.id)
      const res = await api.fetch(`/api/usuarios/${u.id}/estado?habilitado=${nuevo}`, { method: 'PATCH', body: JSON.stringify(nuevo) })
      if (!res.ok) {
        const msg = await res.text().catch(() => '')
        setError(`No se pudo cambiar estado (HTTP ${res.status}) ${msg || ''}`)
        return
      }
      const updated = await res.json()
      setUsers((prev) => prev.map((it) => it.id === u.id ? updated : it))
    } catch (err) {
      setError(`No se pudo cambiar estado (${err?.status ?? '?'})`)
    } finally {
      setTogglingId(null)
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
                <h1 className="h_titulos m-0">Usuarios</h1>
                <div className="d-flex align-items-center gap-2">
                  <div className="btn-group me-3" role="group" aria-label="Vista">
                    <button className={`btn btn-outline-secondary ${vista==='empleados'?'active':''}`} onClick={() => { setVista('empleados'); setPage(1) }}>Empleados</button>
                    <button className={`btn btn-outline-secondary ${vista==='clientes'?'active':''}`} onClick={() => { setVista('clientes'); setPage(1) }}>Clientes</button>
                  </div>
                  <label className="text-muted me-1">Filtro</label>
                  <select className="form-select form-select-sm w-auto" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
                    <option value="todos">Todos</option>
                    <option value="habilitados">Sólo habilitados</option>
                    <option value="deshabilitados">Sólo deshabilitados</option>
                  </select>
                  <span className="text-muted">{filtrados.length} encontrados</span>
                </div>
              </div>

              {error && <div className="alert alert-danger" role="alert">{error}</div>}

              {loading ? (
                <div className="d-flex align-items-center">
                  <div className="spinner-border text-secondary me-2" role="status" aria-hidden="true"></div>
                  <span>Cargando usuarios…</span>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead>
                        {vista === 'empleados' ? (
                          <tr>
                            <th>Nombres</th>
                            <th>Apellidos</th>
                            <th>Correo</th>
                            <th>Celular</th>
                            <th>Rol</th>
                            <th>RUT</th>
                            <th>Habilitado</th>
                            <th>ID</th>
                            <th>Acciones</th>
                          </tr>
                        ) : (
                          <tr>
                            <th>Nombres</th>
                            <th>Apellidos</th>
                            <th>Correo</th>
                            <th>Teléfono</th>
                            <th>Tipo Cliente</th>
                            <th>Puntos</th>
                            <th>Promos</th>
                            <th>Dirección Entrega</th>
                            <th>Preferencias</th>
                            <th>Límite Crédito</th>
                            <th>Frecuencia</th>
                            <th>RUT</th>
                            <th>Habilitado</th>
                            <th>ID</th>
                            <th>Acciones</th>
                          </tr>
                        )}
                      </thead>
                      <tbody>
                        {pagedUsers.length === 0 ? (
                          <tr>
                            <td colSpan={vista==='empleados'?9:15} className="text-center text-muted">No hay usuarios</td>
                          </tr>
                        ) : (
                          pagedUsers.map((u) => (
                            <tr key={u.id}>
                              <td className="fw-semibold">{u.nombres ?? '-'}</td>
                              <td>{u.apellidos ?? '-'}</td>
                              <td>{u.correo ?? '-'}</td>
                              {vista === 'empleados' ? (
                                <>
                                  <td>{u.celular ?? '-'}</td>
                                  <td>{u.rol ?? '-'}</td>
                                  <td>{u.rut ? `${u.rut}-${u.dv ?? ''}` : '-'}</td>
                                  <td>{u.enabled ? 'Sí' : 'No'}</td>
                                  <td className="text-muted">{u.id}</td>
                                </>
                              ) : (
                                <>
                                  <td>{u.telefono ?? '-'}</td>
                                  <td>{u.tipoCliente ?? '-'}</td>
                                  <td>{u.puntosFidelizacion ?? '-'}</td>
                                  <td>{u.recibirPromos === true ? 'Sí' : (u.recibirPromos === false ? 'No' : '-')}</td>
                                  <td>{u.direccionEntrega ?? '-'}</td>
                                  <td>{u.preferenciasComunicacion ?? '-'}</td>
                                  <td>{u.limiteCredito ?? '-'}</td>
                                  <td>{u.frecuenciaCompra ?? '-'}</td>
                                  <td>{u.rut ? `${u.rut}-${u.dv ?? ''}` : '-'}</td>
                                  <td>{u.enabled ? 'Sí' : 'No'}</td>
                                  <td className="text-muted">{u.id}</td>
                                </>
                              )}
                              <td>
                                {u.enabled ? (
                                  <Link to={`/admin/users/${u.id}/edit`} className="btn btn-sm btn-outline-primary me-2">Editar</Link>
                                ) : (
                                  <button className="btn btn-sm btn-outline-secondary me-2" disabled title="Usuario deshabilitado">Editar</button>
                                )}
                                <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleToggleEstado(u)} disabled={togglingId === u.id}>
                                  {togglingId === u.id ? 'Cambiando…' : (isEnabled(u) ? 'Deshabilitar' : 'Habilitar')}
                                </button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDisable(u.id)} disabled={deletingId === u.id}>
                                  {deletingId === u.id ? 'Eliminando…' : 'Eliminar'}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginación */}
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <div>
                      <label className="me-2">Por página</label>
                      <select className="form-select d-inline-block w-auto" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                  <div className="btn-group" role="group" aria-label="Paginación">
                    <button className="btn btn-outline-secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>« Prev</button>
                    <span className="btn btn-outline-secondary disabled">Página {page} de {totalPages}</span>
                    <button className="btn btn-outline-secondary" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next »</button>
                  </div>
                </div>
                </>
              )}
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  )
}
