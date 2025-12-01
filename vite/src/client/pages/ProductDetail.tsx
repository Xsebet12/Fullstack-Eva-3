import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { addToCart, getProducto, getAuthToken, addPendingItem, processPendingCheckout } from '../api/client'

type Imagen={url:string}
type Producto={id:number; nombre:string; descripcion?:string; precio?:number; stock?:number; imagen?:string; imagenes?:Imagen[]}

export default function ProductDetail(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [p,setP]=useState<Producto|null>(null)
  const [qty,setQty]=useState<number>(1)
  const [loading,setLoading]=useState<boolean>(true)
  const [error,setError]=useState<string>("")
  useEffect(()=>{
    let ignore=false
    async function load(){
      try{
        setLoading(true); setError("")
        const prod = await getProducto(Number(id))
        setP(prod)
        const s = Number(prod?.stock||0)
        setQty(s>0?1:0)
      }catch(e:any){
        setError('No se pudo cargar el producto')
      }finally{ if(!ignore) setLoading(false) }
    }
    load(); return ()=>{ignore=true}
  },[id])

  const max = Number(p?.stock||0) || 0
  const img = p?.imagen || (p?.imagenes && p.imagenes[0]?.url) || '/vite.svg'

  async function onAdd(){
    try{
      if(max<=0){ alert('Sin stock disponible'); return }
      const q = qty>max?max:qty
      const tok = getAuthToken(); if(!tok){ alert('Debes iniciar sesión para agregar al carrito'); navigate('/login'); return }
      await addToCart(Number(id), q)
      alert('Producto agregado')
    }catch(e:any){
      if(e?.status===500){ addPendingItem(Number(id), qty); alert('El carrito dio error, pero el producto quedó guardado para Comprar ahora'); return }
      alert(String(e?.message||'No se pudo agregar al carrito'))
    }
  }

  async function onBuyNow(){
    try{
      if(max<=0){ alert('Sin stock disponible'); return }
      const q = qty>max?max:qty
      const tok = getAuthToken(); if(!tok){ alert('Debes iniciar sesión para comprar'); navigate('/login'); return }
      addPendingItem(Number(id), q)
      const res = await processPendingCheckout()
      alert(`Compra registrada: ${res?.id??''}`)
      navigate('/carrito')
    }catch(e:any){ alert(String(e?.message||'No se pudo completar la compra')) }
  }

  return (
    <main className="container py-4" style={{marginTop:70}}>
      <div className="header_detalle_producto">
        <h2 className="m-0">Detalle de Producto</h2>
      </div>
      {loading ? (
        <div className="d-flex align-items-center mt-4"><div className="spinner-border me-2"/><span>Cargando…</span></div>
      ) : error ? (
        <div className="alert alert-danger mt-3">{error}</div>
      ) : !p ? (
        <div className="alert alert-warning mt-3">Producto no encontrado</div>
      ) : (
        <div className="contenedor__general_prod">
          <img src={img} alt={p.nombre} />
          <h1>{p.nombre}</h1>
          <p><strong>Precio:</strong> ${Number(p.precio||0)}</p>
          <p><strong>Stock disponible:</strong> {max}</p>
          <p>{p.descripcion||''}</p>
          <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
            <input type="number" className="form-control" style={{width:120}} min={1} max={Math.max(1,max)} value={qty}
                   onChange={(e)=>{ const v = Number(e.target.value||1); setQty(Math.max(1, Math.min(v, Math.max(1,max)))) }} />
        <button className="btn btn-success me-2" onClick={onAdd}>Agregar al carrito</button>
        <button className="btn btn-primary" onClick={onBuyNow}>Comprar ahora</button>
          </div>
          <div className="mt-3">
            <Link to="/catalogo" className="btn btn-volver btn-outline-secondary">Volver al catálogo</Link>
            <button className="btn btn-outline-primary ms-2" onClick={()=>navigate('/carrito')}>Ver carrito</button>
          </div>
        </div>
      )}
    </main>
  )
}
