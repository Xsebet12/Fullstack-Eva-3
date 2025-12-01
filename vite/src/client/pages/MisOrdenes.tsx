import { useEffect, useState } from 'react'
import { getMyOrdersDetailed } from '../api/client'

function PagoBadge({estado}:{estado?:string}){
  const s = (estado||'').toLowerCase()
  const map: Record<string,string> = { pendiente:'warning', aceptado:'success', rechazado:'danger' }
  const cls = `badge bg-${map[s]||'secondary'}`
  return <span className={cls}>{estado||'-'}</span>
}
function EnvioBadge({estado}:{estado?:string}){
  const s = (estado||'').toLowerCase()
  const map: Record<string,string> = { pendiente:'secondary', preparando:'info', despachado:'primary', entregado:'success', rechazado:'danger' }
  const cls = `badge bg-${map[s]||'secondary'}`
  return <span className={cls}>{estado||'-'}</span>
}

function money(v:any){
  const n = typeof v === 'number' ? v : Number(v)
  try{ return new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP'}).format(isNaN(n)?0:n) }
  catch{ return `$${isNaN(n)?0:n.toFixed?.(0)??String(n)}` }
}

export default function MisOrdenes(){
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [estadoPago,setEstadoPago] = useState('')
  const [estadoEnvio,setEstadoEnvio] = useState('')
  const [orden,setOrden] = useState<'fecha_desc'|'fecha_asc'|'total_desc'|'total_asc'>('fecha_desc')

  useEffect(()=>{
    let ignore=false
    const load=async()=>{
      try{
        setLoading(true); setError('')
        const data = await getMyOrdersDetailed()
        if(!ignore) setOrders(Array.isArray(data)?data:[])
      }catch(err:any){ if(!ignore) setError(String(err?.message||'No se pudo cargar')) }
      finally{ if(!ignore) setLoading(false) }
    }
    load(); return ()=>{ignore=true}
  },[])

  return (
    <main className="container" style={{marginTop:70}}>
      <h2 className="mb-3">Mis órdenes</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div className="text-center text-muted">Cargando…</div>
      ) : (
        <>
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
          <div className="col-md-3">
            <label className="form-label">Ordenar por</label>
            <select className="form-select" value={orden} onChange={e=>setOrden(e.target.value as any)}>
              <option value="fecha_desc">Fecha (reciente primero)</option>
              <option value="fecha_asc">Fecha (antigua primero)</option>
              <option value="total_desc">Total (mayor primero)</option>
              <option value="total_asc">Total (menor primero)</option>
            </select>
          </div>
        </div>
        
        <div className="row g-3">
          {orders.length===0 ? (
            <div className="col-12"><div className="text-center text-muted">No tienes órdenes</div></div>
          ) : [...orders.filter((o:any)=>{
              if(estadoPago && String(o.estadoPago||'').toLowerCase()!==estadoPago) return false
              if(estadoEnvio && String(o.estadoEnvio||'').toLowerCase()!==estadoEnvio) return false
              return true
            })].sort((a:any,b:any)=>{
              const fa = a.fecha ? new Date(a.fecha).getTime() : 0
              const fb = b.fecha ? new Date(b.fecha).getTime() : 0
              const ta = Number(a.total||0), tb = Number(b.total||0)
              if(orden==='fecha_desc') return fb-fa
              if(orden==='fecha_asc') return fa-fb
              if(orden==='total_desc') return tb-ta
              if(orden==='total_asc') return ta-tb
              return 0
            }).map((o:any)=> (
          <div key={o.id} className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                  <div className="d-flex flex-wrap justify-content-between align-items-center mb-2">
                    <div className="d-flex flex-column">
                      <div className="fw-semibold">Orden #{o.id} · Boleta N° {o.numeroBoleta ?? '-'}</div>
                      <small className="text-muted">{o.fecha ? new Date(o.fecha).toLocaleString() : '-'}</small>
                    </div>
                    <div className="text-end">
                      <div>Total: <span className="fw-semibold">{money(o.total)}</span></div>
                      <div className="mt-1">Pago <PagoBadge estado={o.estadoPago} /> · Envío <EnvioBadge estado={o.estadoEnvio} /></div>
                      <div className="text-muted">Seguimiento: {o.numeroSeguimiento ?? '-'}</div>
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-sm align-middle">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th className="text-center" style={{width:100}}>Cantidad</th>
                          <th className="text-end" style={{width:160}}>Precio unitario</th>
                          <th className="text-end" style={{width:160}}>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(Array.isArray(o.items)?o.items:[]).map((it:any, idx:number)=>(
                          <tr key={idx}>
                            <td className="fw-semibold">{it?.nombreProducto ?? '-'}</td>
                            <td className="text-center">{it?.cantidad ?? '-'}</td>
                            <td className="text-end">{money(it?.precioUnitario)}</td>
                            <td className="text-end">{money(it?.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        </>
      )}
    </main>
  )
}
