import React, { useEffect, useMemo, useState } from 'react'
import { checkout, checkoutWithItems, authHeaders, getPendingItems, processPendingCheckout, getAuthToken, addToCart, removeFromCart, getProducto } from '../api/client'

type Item={productoId:number; nombre:string; precioUnitario:number; cantidad:number; subtotal:number; stockDisponible?:number}
type Resp={items:Item[]; total:number; cantidadItems:number}

export default function Cart(){
  const [data,setData]=useState<Resp|null>(null)
  const [needsLogin,setNeedsLogin]=useState<boolean>(false)
  const [pending,setPending]=useState<any[]>([])
  const [desired,setDesired]=useState<Record<number, number>>({})
  const [imagenes,setImagenes]=useState<Record<number,string>>({})
  const [metodo,setMetodo]=useState<string>('')
  const [canal,setCanal]=useState<string>('Web')
  const [pagoPaso,setPagoPaso]=useState<number>(0)
  const [procesando,setProcesando]=useState<boolean>(false)
  const [msg,setMsg]=useState<string>('')
  const [confirm,setConfirm]=useState<{id?:number;numeroBoleta?:string|number;numeroSeguimiento?:string}|null>(null)
  useEffect(()=>{load()},[])
  async function load(){
    const r=await fetch('/api/carrito',{headers:{Accept:'application/json',...authHeaders()} as HeadersInit, credentials:'same-origin'})
    if(r.status===401){ setNeedsLogin(true); setData({items:[],total:0,cantidadItems:0}); return }
    const j=await r.json(); setData(j)
    try{
      const map: Record<number, number> = {};
      (j?.items||[]).forEach((it: any)=>{ map[Number(it.productoId)] = Number(it.cantidad||0) })
      setDesired(map)
    }catch{}
    try{ setPending(getPendingItems()) }catch{ setPending([]) }
    try{
      const imgs: Record<number,string> = {}
      for(const it of (j?.items||[])){
        try{ const p = await getProducto(Number(it.productoId)); if(p?.imagen) imgs[Number(it.productoId)] = String(p.imagen) }
        catch{}
      }
      setImagenes(imgs)
    }catch{}
  }
  const items=data?.items||[]
  const invalids = useMemo(()=> items.filter(i=>{
    const qty = Number(i?.cantidad||0)
    const stock = Number(typeof i.stockDisponible==='number' ? i.stockDisponible : 0)
    return qty<=0 || (stock>0 && qty>stock)
  }),[items])
  return (
    <main className="container py-4" style={{marginTop:70}}>
      <h2 className="mb-4">Tu Carrito</h2>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <a className="btn btn-outline-secondary" href="/mis-ordenes">Ver historial de compras</a>
        <div className="d-flex gap-2">
          <select className="form-select" value={metodo} onChange={e=>setMetodo(e.target.value)} style={{maxWidth:220}}>
            <option value="">Selecciona método de pago</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
            <option value="efectivo">Efectivo</option>
          </select>
          <select className="form-select" value={canal} onChange={e=>setCanal(e.target.value)} style={{maxWidth:180}}>
            <option value="Web">Web</option>
            <option value="App">App</option>
            <option value="Tienda">Tienda</option>
          </select>
        </div>
      </div>
      {confirm ? (
        <div className="mt-2">
          <div className="card border-success shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex flex-column gap-1">
                  <div className="fw-semibold text-success">Compra registrada y pago aceptado</div>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-dark">Orden #{confirm.id ?? '-'}</span>
                    <span className="badge bg-primary">Boleta N° {confirm.numeroBoleta ?? '-'}</span>
                    <span className="badge bg-info text-dark">Seguimiento {confirm.numeroSeguimiento ?? '-'}</span>
                  </div>
                </div>
                <div className="text-end">
                  <span role="img" aria-label="check">✅</span>
                </div>
              </div>
              <div className="text-muted">Gracias por tu compra. Puedes ver el detalle en Mis órdenes.</div>
            </div>
          </div>
        </div>
      ) : (msg && (
        <div className="mt-2">
          <div className="fw-semibold text-success">{msg}</div>
        </div>
      ))}
      {metodo && (
        <div className="alert alert-secondary">
          {metodo==='tarjeta' && <div>Ingresa datos de tu tarjeta en el paso de confirmación. Simulación segura, no se procesan pagos reales.</div>}
          {metodo==='transferencia' && <div>Se mostrarán datos bancarios para transferencia. La confirmación marcará el pago como aceptado.</div>}
          {metodo==='efectivo' && <div>Pago contra entrega. La confirmación registrará la orden y marcará el pago como aceptado.</div>}
        </div>
      )}
          {pending.length>0 && (
        <div className="alert alert-info">
          Tienes productos guardados para Comprar ahora:
          <ul className="m-0 ps-3">
            {pending.map((p:any,idx:number)=>(<li key={idx}>Producto #{p.productoId} x {p.cantidad}</li>))}
          </ul>
          <button className="btn btn-primary btn-sm mt-2" onClick={async()=>{
            const tok = getAuthToken(); if(!tok){ alert('Debes iniciar sesión para comprar'); return }
            try{ setMsg(''); const r = await processPendingCheckout() as any; setConfirm({ id: r?.id, numeroBoleta: r?.numeroBoleta, numeroSeguimiento: r?.numeroSeguimiento }); setPending([]); await load() }
            catch(e:any){ alert(String(e?.message||'No se pudo completar la compra')) }
          }}>Procesar compra</button>
        </div>
      )}
          <div className="row g-3" id="carritoContainer">
        {needsLogin ? (
          <div className="alert alert-warning">Debes iniciar sesión para ver tu carrito.</div>
        ) : items.length===0?(
          <div>Tu carrito está vacío</div>
        ):(items.map(i=> (
          <div className="col-12" key={i.productoId}>
            <div className="card p-3 d-flex flex-row justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                <img src={imagenes[i.productoId]||'/vite.svg'} alt={i.nombre} width={64} height={64} className="object-fit-cover rounded" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/vite.svg'}} />
                <div className="fw-bold">{i.nombre}</div>
              </div>
              <div className="d-flex align-items-center gap-2">
                  <button className="btn btn-sm btn-outline-secondary" onClick={async()=>{
                    try{ await removeFromCart(i.productoId, 1); await load() }catch(e:any){ alert(String(e?.message||'No se pudo disminuir')) }
                  }}>−</button>
                  <span>Cantidad: {i.cantidad} {typeof i.stockDisponible==='number' ? `(máx ${i.stockDisponible})` : ''}</span>
                  <button className="btn btn-sm btn-outline-secondary" disabled={typeof i.stockDisponible==='number' && i.cantidad>=Number(i.stockDisponible)} onClick={async()=>{
                    try{ await addToCart(i.productoId, 1); await load() }catch(e:any){ alert(String(e?.message||'No se pudo aumentar')) }
                  }}>+</button>
                  <input type="number" min={0} className={`form-control form-control-sm ${((desired[i.productoId]??i.cantidad)<=0 || (typeof i.stockDisponible==='number' && (desired[i.productoId]??i.cantidad)>Number(i.stockDisponible)))?'is-invalid':''}`} style={{width:90}}
                    value={desired[i.productoId] ?? i.cantidad}
                    onChange={(e)=>{
                      const v = Math.max(0, Math.floor(Number(e.target.value||0)))
                      setDesired(prev=>({ ...prev, [i.productoId]: v }))
                    }} />
                  <button className="btn btn-sm btn-primary" onClick={async()=>{
                    try{
                      const target = Number(desired[i.productoId] ?? i.cantidad)
                      const current = Number(i.cantidad)
                      if(target===current) return
                      if(target>current){ await addToCart(i.productoId, target-current) }
                      else { await removeFromCart(i.productoId, current-target) }
                      await load()
                    }catch(e:any){ alert(String(e?.message||'No se pudo actualizar')) }
                  }}>Actualizar</button>
              </div>
              <div className="text-end">
                <div className="text-muted">Precio unitario</div>
                <div className="fw-semibold">${i.precioUnitario}</div>
                <div className="mt-1">Subtotal: <span className="fw-semibold">${i.subtotal}</span></div>
              </div>
            </div>
          </div>
        )))}
      </div>
      <div className="mt-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center">
          <div className="d-flex gap-4">
            <div><strong>Total:</strong> <span id="totalCompra">${data?.total??0}</span></div>
            <div><strong>Items:</strong> <span id="cartCount">{data?.cantidadItems??0}</span></div>
          </div>
          <div className="flex-grow-1">
            {metodo && (
              <div className="progress" style={{height:8}}>
                <div className="progress-bar" role="progressbar" style={{width:`${pagoPaso*33}%`}}></div>
              </div>
            )}
          </div>
        </div>
        {invalids.length>0 && (
          <div className="alert alert-warning mt-2">Hay productos con cantidad inválida o superior al stock. Ajusta antes de pagar.</div>
        )}
        <div className="d-flex gap-2 mt-3">
          <button className="btn btn-success" disabled={invalids.length>0 || !metodo || procesando} onClick={async()=>{
            setProcesando(true)
            try{
              setPagoPaso(1)
              await new Promise(res=>setTimeout(res,500))
              setPagoPaso(2)
              await new Promise(res=>setTimeout(res,500))
              setPagoPaso(3)
              setMsg('')
              const r = await checkoutWithItems({ metodoPago: metodo, canal }) as any
              setConfirm({ id: r?.id, numeroBoleta: r?.numeroBoleta, numeroSeguimiento: r?.numeroSeguimiento })
              setPagoPaso(0)
              await load()
            }catch(e:any){ alert(String(e?.message||'No se pudo completar la compra')) }
            finally{ setProcesando(false) }
          }}>Confirmar pago</button>
          <button className="btn btn-outline-secondary" onClick={()=>{ setPagoPaso(0); setProcesando(false) }}>Cancelar</button>
        </div>
      </div>
    </main>
  )
}
