import React, { useEffect, useMemo, useState } from 'react'
import { addToCart, getProductos, addPendingItem, authHeaders } from '../api/client'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { getAuthToken } from '../api/client'

type Imagen={url:string}
type Producto={
  id:number;
  nombre:string;
  descripcion?:string;
  precio?:number;
  stock?:number;
  habilitado?:boolean;
  disponible?:boolean;
  imagen?:string;
  imagenes?:Imagen[]
  categoria?: { id:number; nombre?:string }
}
type MiniItem={productoId:number; nombre:string; cantidad:number}

export default function Catalog(){
  const [items,setItems]=useState<Producto[]>([])
  const [categorias,setCategorias]=useState<{id:number; nombre:string}[]>([])
  const [categoriaId,setCategoriaId]=useState<string>('')
  const [mini,setMini]=useState<MiniItem[]>([])
  const [miniTotal,setMiniTotal]=useState<number>(0)
  const [notice,setNotice]=useState<string>('')
  const [isCartOpen,setIsCartOpen]=useState<boolean>(false)
  const location = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(location.search)
  const q = params.get('q') || ''
  useEffect(()=>{
    let ignore=false
    async function load(){
      try{ const list = await getProductos(q); if(!ignore) setItems(list) }
      catch(e:any){ alert(String(e?.message||'No se pudo cargar catálogo')) }
    }
    load(); return ()=>{ignore=true}
  },[q])
  useEffect(()=>{
    let ignore=false
    const loadCats=async()=>{
      try{ const r=await fetch('/api/categorias'); const j=await r.json(); if(!ignore) setCategorias(Array.isArray(j)?j:[]) }
      catch{}
    }
    loadCats(); return ()=>{ignore=true}
  },[])
  useEffect(()=>{ loadMini() },[])
  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    let ticking = false
    const visible = new Set<HTMLElement>()
    const els = Array.from(document.querySelectorAll<HTMLElement>('.parallax-layer'))
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const el = e.target as HTMLElement
        if (e.isIntersecting) visible.add(el); else visible.delete(el)
      }
      requestTick()
    }, { rootMargin: '100px' })
    const requestTick = () => { if (!ticking) { ticking = true; requestAnimationFrame(update) } }
    const update = () => {
      const vh = window.innerHeight
      for (const el of visible) {
        const parent = el.parentElement as HTMLElement
        if (!parent) continue
        const r = parent.getBoundingClientRect()
        const factor = parseFloat(el.dataset.speed || '0.15')
        const base = (r.top - vh * 0.5) * -factor
        el.style.transform = `translate3d(0, ${base}px, 0)`
      }
      ticking = false
    }
    const onScroll = () => requestTick()
    const onResize = () => requestTick()
    els.forEach(el => io.observe(el))
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    requestTick()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      els.forEach(el => io.unobserve(el))
      io.disconnect()
    }
  }, [])
  async function loadMini(){
    try{
      const r=await fetch('/api/carrito',{headers:{Accept:'application/json',...authHeaders()} as HeadersInit, credentials:'same-origin'})
      if(!r.ok) return
      const j=await r.json()
      const arr:MiniItem[]=(j?.items||[]).map((it:any)=>({productoId:Number(it.productoId),nombre:String(it.nombre||''),cantidad:Number(it.cantidad||0)}))
      setMini(arr)
      setMiniTotal(Number(j?.total||0))
    }catch{}
  }
  useEffect(()=>{
    if(!notice) return
    const h=setTimeout(()=>setNotice(''),2000)
    return()=>clearTimeout(h)
  },[notice])
  const miniCount=useMemo(()=> mini.reduce((a,it)=>a+Number(it.cantidad||0),0),[mini])
  function toggleCart(){ setIsCartOpen(v=>!v) }
  function onKeyToggle(e: React.KeyboardEvent){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggleCart() } }
  return (
    <main className="container py-4" style={{marginTop:70}}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">Productos</h2>
        <div className="d-flex align-items-center gap-2">
          <button
            aria-label="Mostrar carrito"
            aria-controls="cartSlidePanel"
            aria-expanded={isCartOpen}
            className="hamburger-youka"
            onClick={toggleCart}
            onKeyDown={onKeyToggle}
            style={{lineHeight:0}}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
          <span className="badge bg-youka text-dark">{miniCount} items</span>
        </div>
      </div>
      <div className="mb-3 d-flex gap-2 align-items-center">
        <label className="form-label m-0">Categoría</label>
        <select className="form-select" style={{maxWidth:260}} value={categoriaId} onChange={e=>setCategoriaId(e.target.value)}>
          <option value="">Todas</option>
          {categorias.map(c=> (<option key={c.id} value={c.id}>{c.nombre}</option>))}
        </select>
      </div>
      {/* Notificación discreta */}
      {notice && (
        <div className="position-fixed" style={{right:16,bottom:16,zIndex:1050}}>
          <div className="card shadow" style={{minWidth:240}}>
            <div className="youka-ribbon p-2">Notificación</div>
            <div className="p-2">{notice}</div>
          </div>
        </div>
      )}
      {/* Botón hamburguesa ahora está integrado en el encabezado del catálogo */}
      {/* Overlay y panel deslizable del carrito */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cartPanelLabel"
        id="cartSlidePanel"
        className="position-fixed"
        style={{top:0,right:0,bottom:0,left:0,zIndex:1055,pointerEvents:isCartOpen?'auto':'none'}}
        onClick={(e)=>{ if(e.target===e.currentTarget) setIsCartOpen(false) }}
      >
        <div
          className="position-absolute h-100 shadow"
          style={{top:0,right:0,width:'min(380px, 90vw)',background:'#fff',borderLeft:'2px solid var(--youka-brown)',transform:`translateX(${isCartOpen?0:100}%)`,transition:'transform 250ms ease'}}
        >
          <div className="youka-ribbon p-2 d-flex justify-content-between align-items-center">
            <span id="cartPanelLabel">Mi carrito</span>
            <button className="btn btn-sm btn-light" onClick={()=>setIsCartOpen(false)} aria-label="Cerrar">×</button>
          </div>
          <div className="p-3" style={{overflowY:'auto',height:'calc(100% - 100px)'}}>
            {mini.length===0 ? (
              <div className="text-muted">Tu carrito está vacío</div>
            ) : (
              <ul className="list-group list-group-flush">
                {mini.map(it=> (
                  <li key={it.productoId} className="list-group-item d-flex justify-content-between align-items-center">
                    <span className="fw-semibold">{it.nombre}</span>
                    <span className="badge bg-youka text-dark">x {it.cantidad}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="border-top p-3 d-flex justify-content-between align-items-center">
            <span className="fw-semibold">Total</span>
            <span className="fw-bold">${miniTotal}</span>
          </div>
        </div>
        <div
          className="position-absolute"
          style={{top:0,left:0,right:'min(380px, 90vw)',bottom:0,background:'rgba(0,0,0,0.15)',opacity:isCartOpen?1:0,transition:'opacity 250ms ease'}}
        />
      </div>
      <div className="row">
        <div className="col-12">
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-4">
        {items
          .filter(p => {
            const stock = Number(p?.stock||0)
            const enabled = p?.habilitado !== false
            const available = p?.disponible !== false
            const catOk = !categoriaId || String(p?.categoria?.id||'')===String(categoriaId)
            return stock > 0 && enabled && available && catOk
          })
          .map(p=>{
          const img=p.imagen||(p.imagenes&&p.imagenes[0]?.url)||'/vite.svg'
          const desc = String(p.descripcion||'')
          return (
            <div className="col" key={p.id}>
              <div className="card product-card shadow-sm h-100">
                <Link to={`/producto/${p.id}`}>
                  <div className="parallax-wrap">
                    <img
                      src={img}
                      className="card-img-top product-img parallax-layer"
                      alt={p.nombre}
                      loading="lazy"
                      decoding="async"
                      data-speed="0.15"
                    />
                  </div>
                </Link>
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title product-title mb-1"><Link to={`/producto/${p.id}`} className="text-dark text-decoration-none fw-semibold">{p.nombre}</Link></h5>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="product-price">${p.precio??0}</span>
                    <span className="badge bg-secondary">Stock: {Number(p.stock||0)}</span>
                  </div>
                  <p className="card-text product-desc line-clamp-2" style={{maxWidth:'100%'}}>{desc.length>120?`${desc.slice(0,120)}…`:desc}</p>
                </div>
                <div className="card-footer bg-white" style={{overflow:'visible'}}>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <input type="number" className="form-control" defaultValue={1} min={1} style={{width:110}} id={`qty-${p.id}`}/>
                    <button className="btn btn-youka" onClick={async()=>{
                      const tok = getAuthToken()
                      if(!tok){ alert('Debes iniciar sesión para agregar al carrito'); navigate('/login'); return }
                      const el = document.getElementById(`qty-${p.id}`) as HTMLInputElement
                      let q = Number(el?.value||1)
                      if(!Number.isFinite(q) || q<1){ alert('Cantidad inválida'); return }
                      q = Math.min(99, Math.floor(q))
                      try{ await addToCart(p.id, q); setNotice('Producto agregado'); await loadMini() }
                      catch(e:any){
                        if(e?.status===401){ alert('Sesión expirada o no autenticado. Inicia sesión.'); navigate('/login'); return }
                        if(e?.status===500){
                          addPendingItem(p.id, q)
                          setNotice('Producto guardado para Comprar ahora'); await loadMini()
                          return
                        }
                        alert(String(e?.message||'No se pudo agregar'))
                      }
                    }}>Agregar</button>
                    
                  </div>
                </div>
              </div>
            </div>
          )
        })}
          </div>
        </div>
      </div>
    </main>
  )
}
