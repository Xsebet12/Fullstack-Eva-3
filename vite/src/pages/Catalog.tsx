import React, { useEffect, useState } from 'react'
import { addToCart, getProductos, getAuthToken, addPendingItem, processPendingCheckout } from '../api/client'

type Imagen={url:string}
type Producto={id:number; nombre:string; descripcion?:string; precio?:number; imagen?:string; imagenes?:Imagen[]}

export default function Catalog(){
  const [items,setItems]=useState<Producto[]>([])
  const [error,setError]=useState<string>("")
  useEffect(()=>{
    let ignore=false
    async function load(){
      try{
        setError("")
        const list = await getProductos()
        if(!ignore) setItems(list)
      }catch(e:any){ setError(String(e?.message||'No se pudo cargar catálogo')) }
    }
    load(); return ()=>{ignore=true}
  },[])
  return (
    <main className="container py-4" style={{marginTop:70}}>
      <h2 className="mb-4">Productos</h2>
      {error && (<div className="alert alert-danger">{error}</div>)}
      <div className="row">
        {items.map(p=>{
          const img=p.imagen||(p.imagenes&&p.imagenes[0]?.url)||'/vite.svg'
          return (
            <div className="col-md-4 mb-4" key={p.id}>
              <div className="card shadow-sm h-100">
                <img src={img} className="card-img-top" alt={p.nombre} loading="lazy" decoding="async" />
                <div className="card-body text-center d-flex flex-column">
                  <h5 className="card-title">{p.nombre}</h5>
                  <p className="card-text">${p.precio??0}</p>
                  <p className="card-text">{p.descripcion??''}</p>
                  <button className="btn btn-outline-success mt-auto" onClick={async()=>{
                    const tok = getAuthToken(); if(!tok){ alert('Debes iniciar sesión para agregar al carrito'); return }
                    try{ await addToCart(p.id,1); alert('Producto agregado') }
                    catch(e:any){
                      if(e?.status===500){ addPendingItem(p.id,1); alert('El carrito dio error, pero el producto quedó guardado para Comprar ahora'); return }
                      alert(String(e?.message||'No se pudo agregar'))
                    }
                  }}>Agregar al carrito</button>
                  
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
