import { useEffect, useState } from 'react'
import api from '../lib/api'
import AdminHeader from '../components/AdminHeader'
import AdminSidebar from '../components/AdminSidebar'
import AdminOffcanvas from '../components/AdminOffcanvas'
import Footer from '../components/Footer'

function PagoBadge({estado}){
  const s = String(estado||'').toLowerCase()
  const map = { pendiente:'warning', aceptado:'success', rechazado:'danger' }
  const cls = `badge bg-${map[s]||'secondary'}`
  return <span className={cls}>{estado||'-'}</span>
}
function EnvioBadge({estado}){
  const s = String(estado||'').toLowerCase()
  const map = { pendiente:'secondary', preparando:'info', despachado:'primary', entregado:'success', rechazado:'danger' }
  const cls = `badge bg-${map[s]||'secondary'}`
  return <span className={cls}>{estado||'-'}</span>
}

export default function AdminOrders(){
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [estadoPago, setEstadoPago] = useState('')
  const [estadoEnvio, setEstadoEnvio] = useState('')
  const [actingId, setActingId] = useState(null)
  const [page, setPage] = useState(() => {
    try{ const v = Number(sessionStorage.getItem('adminOrders.page')||'1'); return Math.max(1,isNaN(v)?1:v) }catch{ return 1 }
  })
  const [pageSize, setPageSize] = useState(() => {
    try{ const v = Number(sessionStorage.getItem('adminOrders.pageSize')||'10'); return Math.max(5,isNaN(v)?10:v) }catch{ return 10 }
  })

  const fetchOrders = async () => {
    try{
      setError('')
      const params = new URLSearchParams()
      if(estadoPago) params.set('estadoPago', estadoPago)
      if(estadoEnvio) params.set('estadoEnvio', estadoEnvio)
      const data = await api.get(`/api/ventas${params.toString()?`?${params.toString()}`:''}`)
      setOrders(Array.isArray(data)?data:[])
    }catch(err){ setError(`No se pudo cargar (HTTP ${err.status??'?'})`) }
  }
  useEffect(()=>{
    let ignore=false
    const load=async()=>{
      try{ setLoading(true); await fetchOrders() }
      finally{ if(!ignore) setLoading(false) }
    }
    load(); return ()=>{ignore=true}
  },[estadoPago,estadoEnvio])
  useEffect(()=>{
    const id = setInterval(()=>{ fetchOrders() }, 10000)
    return ()=>clearInterval(id)
  },[estadoPago,estadoEnvio])
  useEffect(()=>{
    try{ sessionStorage.setItem('adminOrders.page', String(page)) }catch{}
  },[page])
  useEffect(()=>{
    try{ sessionStorage.setItem('adminOrders.pageSize', String(pageSize)) }catch{}
  },[pageSize])

  const updateOrder = (id, patch) => {
    setOrders(prev => prev.map(o => o.id===id ? { ...o, ...patch } : o))
  }
  const handleAceptar = async (id) => {
    try{ setError(''); setActingId(id); await api.post(`/api/ventas/${id}/aceptar`,{}); updateOrder(id,{estadoPago:'aceptado',estadoEnvio:'preparando'}) }
    catch(err){ setError(`No se pudo aceptar (HTTP ${err.status??'?'})`) }
    finally{ setActingId(null) }
  }
  const handleRechazar = async (id) => {
    try{ setError(''); setActingId(id); await api.post(`/api/ventas/${id}/rechazar`,{}); updateOrder(id,{estadoPago:'rechazado',estadoEnvio:'rechazado'}) }
    catch(err){ setError(`No se pudo rechazar (HTTP ${err.status??'?'})`) }
    finally{ setActingId(null) }
  }
  const handleDespachado = async (id) => {
    try{ setError(''); setActingId(id); await api.post(`/api/ventas/${id}/despachado`,{}); updateOrder(id,{estadoEnvio:'despachado'}) }
    catch(err){ setError(`No se pudo marcar despachado (HTTP ${err.status??'?'})`) }
    finally{ setActingId(null) }
  }
  const handleEntregado = async (id) => {
    try{ setError(''); setActingId(id); await api.post(`/api/ventas/${id}/entregado`,{}); updateOrder(id,{estadoEnvio:'entregado'}) }
    catch(err){ setError(`No se pudo marcar entregado (HTTP ${err.status??'?'})`) }
    finally{ setActingId(null) }
  }
  const handleEliminar = async (id) => {
    const ok = window.confirm(`¿Eliminar la orden #${id}? Esta acción no se puede deshacer.`)
    if(!ok) return
    try{ setError(''); setActingId(id); await api.del(`/api/ventas/${id}`); setOrders(prev=>prev.filter(o=>o.id!==id)) }
    catch(err){ setError(`No se pudo eliminar (HTTP ${err.status??'?'})`) }
    finally{ setActingId(null) }
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

          <div className="col-12 col-md-9 content">
            <div id="contenedor__general__home" className="p-3">
              <h1 className="h_titulos m-0 mb-3">Órdenes</h1>
              <div className="row g-3 mb-3">
                <div className="col-md-3">
                  <label className="form-label">Estado de pago</label>
                  <select className="form-select" value={estadoPago} onChange={e=>setEstadoPago(e.target.value)}>
                    <option value="">Todos</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="aceptado">Aceptado</option>
                    <option value="rechazado">Rechazado</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Estado de envío</label>
                  <select className="form-select" value={estadoEnvio} onChange={e=>setEstadoEnvio(e.target.value)}>
                    <option value="">Todos</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="preparando">Preparando</option>
                    <option value="despachado">Despachado</option>
                    <option value="entregado">Entregado</option>
                    <option value="rechazado">Rechazado</option>
                  </select>
                </div>
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
              {loading ? (
                <div className="d-flex align-items-center"><div className="spinner-border me-2"/><span>Cargando…</span></div>
              ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                      <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Pago</th>
                        <th>Envío</th>
                        <th>Seguimiento</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length===0 ? (
                        <tr><td colSpan={7} className="text-center text-muted">No hay órdenes</td></tr>
                      ) : orders.slice(Math.max(0,(page-1)*pageSize), Math.max(0,(page-1)*pageSize)+pageSize).map((o)=> (
                        <tr key={o.id}>
                      <td className="fw-semibold">{o.id}</td>
                      <td>{o.fecha ? new Date(o.fecha).toLocaleString() : '-'}</td>
                      <td>${o.total ?? '-'}</td>
                      <td><PagoBadge estado={o.estadoPago} /></td>
                      <td><EnvioBadge estado={o.estadoEnvio} /></td>
                      <td className="text-muted">{o.numeroSeguimiento ?? '-'}</td>
                      <td>
                        <div className="d-flex flex-wrap gap-2">
                          <button className="btn btn-sm btn-outline-success" disabled={actingId===o.id} onClick={()=>handleAceptar(o.id)}>Aceptar</button>
                          <button className="btn btn-sm btn-outline-danger" disabled={actingId===o.id} onClick={()=>handleRechazar(o.id)}>Rechazar</button>
                          <button className="btn btn-sm btn-outline-primary" disabled={actingId===o.id} onClick={()=>handleDespachado(o.id)}>Despachar</button>
                          <button className="btn btn-sm btn-outline-secondary" disabled={actingId===o.id} onClick={()=>handleEntregado(o.id)}>Entregado</button>
                          <button className="btn btn-sm btn-outline-dark" disabled={actingId===o.id} onClick={()=>handleEliminar(o.id)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                      ))}
                  </tbody>
                </table>
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="d-flex align-items-center gap-2">
                    <button className="btn btn-sm btn-outline-secondary" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}>Anterior</button>
                    <span>Página {page} de {Math.max(1, Math.ceil(orders.length / pageSize))}</span>
                    <button className="btn btn-sm btn-outline-secondary" onClick={()=>setPage(p=>p+1)} disabled={page>=Math.ceil(orders.length / pageSize)}>Siguiente</button>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span>Items por página:</span>
                    <select className="form-select form-select-sm w-auto" value={pageSize} onChange={e=>{ const v=Number(e.target.value); setPageSize(v); setPage(1) }}>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
              </div>
            </div>
          )}
          </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
