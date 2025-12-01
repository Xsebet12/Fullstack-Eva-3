import React, { useEffect, useState } from 'react'
import { authHeaders, getPendingItems, processPendingCheckout, getAuthToken, addToCart, removeFromCart } from '../api/client'

type Item={productoId:number; nombre:string; precioUnitario:number; cantidad:number; subtotal:number}
type Resp={items:Item[]; total:number; cantidadItems:number}

export default function Cart(){
  const [data,setData]=useState<Resp|null>(null)
  const [error,setError]=useState<string>("")
  const [pending,setPending]=useState<any[]>([])
  const [desired,setDesired]=useState<Record<number, number>>({})
  useEffect(()=>{load()},[])
  async function load(){
    try{
      setError("")
      const r=await fetch('/api/carrito',{headers:{Accept:'application/json',...authHeaders()} as HeadersInit, credentials:'same-origin'})
      if(!r.ok){
        let msg = `No se pudo cargar el carrito (HTTP ${r.status})`
        try{ const j = await r.json(); msg = j?.message || j?.error || msg }catch{ try{ const t = await r.text(); if(t) msg=t }catch{} }
        setError(msg); setData({items:[],total:0,cantidadItems:0}); return
      }
      const j=await r.json(); setData(j)
      try{ setPending(getPendingItems()) }catch{ setPending([]) }
      try{
        const map: Record<number, number> = {}
        (j?.items||[]).forEach((it: any)=>{ map[Number(it.productoId)] = Number(it.cantidad||0) })
        setDesired(map)
      }catch{}
    }catch(e:any){ setError(String(e?.message||'No se pudo cargar el carrito')); setData({items:[],total:0,cantidadItems:0}) }
  }
  const items=data?.items||[]
  return (
    <main className="container py-4" style={{marginTop:70}}>
      <h2 className="mb-4">Tu Carrito</h2>
      {error && (<div className="alert alert-danger">{error}</div>)}
      {pending.length>0 && (
        <div className="alert alert-info">
          Tienes productos guardados para Comprar ahora:
          <ul className="m-0 ps-3">
            {pending.map((p:any,idx:number)=>(<li key={idx}>Producto #{p.productoId} x {p.cantidad}</li>))}
          </ul>
          <button className="btn btn-primary btn-sm mt-2" onClick={async()=>{
            const tok = getAuthToken(); if(!tok){ alert('Debes iniciar sesión para comprar'); return }
            try{ const r = await processPendingCheckout(); alert(`Compra registrada: ${r?.id??''}`); setPending([]); await load() }
            catch(e:any){ alert(String(e?.message||'No se pudo completar la compra')) }
          }}>Procesar compra</button>
        </div>
      )}
      <div className="row g-3" id="carritoContainer">
        {items.length===0?(
          <div>Tu carrito está vacío</div>
        ):(items.map(i=> (
          <div className="col-12" key={i.productoId}>
            <div className="card p-3 d-flex flex-row justify-content-between align-items-center">
              <div>
                <div className="fw-bold">{i.nombre}</div>
                <div className="d-flex align-items-center gap-2">
                  <button className="btn btn-sm btn-outline-secondary" onClick={async()=>{
                    try{ await removeFromCart(i.productoId, 1); await load() }catch(e:any){ alert(String(e?.message||'No se pudo disminuir')) }
                  }}>−</button>
                  <span>Cantidad: {i.cantidad}</span>
                  <button className="btn btn-sm btn-outline-secondary" onClick={async()=>{
                    try{ await addToCart(i.productoId, 1); await load() }catch(e:any){ alert(String(e?.message||'No se pudo aumentar')) }
                  }}>+</button>
                  <input type="number" min={0} className="form-control form-control-sm" style={{width:90}}
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
              </div>
              <div>
                <div>Subtotal: ${i.subtotal}</div>
              </div>
            </div>
          </div>
        )))}
      </div>
      <div className="mt-4">
        <div><strong>Total:</strong> <span id="totalCompra">${data?.total??0}</span></div>
        <div><strong>Items:</strong> <span id="cartCount">{data?.cantidadItems??0}</span></div>
      </div>
    </main>
  )
}
