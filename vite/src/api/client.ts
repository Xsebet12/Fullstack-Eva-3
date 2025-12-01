export function getAuthToken(): string|null{
  function getCookie(name:string){
    try{
      const m = document.cookie.match(new RegExp('(^|; )'+name+'=([^;]+)'))
      return m ? decodeURIComponent(m[2]) : null
    }catch{ return null }
  }
  try{ const t=localStorage.getItem('authToken'); if(t) return t }catch{}
  try{ const s=sessionStorage.getItem('authToken'); if(s) return s }catch{}
  return getCookie('authToken')
}

export function authHeaders(): Record<string,string>{
  const t=getAuthToken();
  return t?{Authorization:`Bearer ${t}`}:{}}
export async function getProductos(){
  const r=await fetch('/api/productos', { headers: { 'Accept':'application/json' } })
  if(!r.ok){
    let msg = `No se pudo obtener productos (HTTP ${r.status})`
    try{ const j = await r.json(); msg = j?.message || j?.error || msg }
    catch{ try{ const t = await r.text(); if(t) msg = t }catch{} }
    const err:any = new Error(msg)
    err.status = r.status
    throw err
  }
  return r.json()
}
export async function login(correo:string,contrasena:string){
  const r=await fetch('/api/autenticacion/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({correo,contrasena})});
  return r.json()
}
export async function register(body:any){
  const r=await fetch('/api/autenticacion/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  return r.json()
}
export async function getRegiones(){
  const r=await fetch('/api/regiones');
  return r.json()
}
export async function getComunas(){
  const r=await fetch('/api/comunas');
  return r.json()
}
export async function addToCart(productoId:number,cantidad:number){
  const r = await fetch('/api/carrito/add',{
    method:'POST',
    headers:{'Accept':'application/json','Content-Type':'application/json',...authHeaders()},
    credentials:'same-origin',
    body:JSON.stringify({productoId,cantidad})
  })
  if(!r.ok){
    let msg = `No se pudo agregar al carrito (HTTP ${r.status})`
    try{ const j = await r.json(); msg = j?.message || j?.error || msg }
    catch{ try{ const t = await r.text(); if(t) msg = t }catch{} }
    const err:any = new Error(msg)
    err.status = r.status
    throw err
  }
  return r.json()
}

function setPending(items:any[]){
  const data = JSON.stringify(items||[])
  try{ sessionStorage.setItem('pendingOrder', data); return }
  catch{}
  try{ localStorage.setItem('pendingOrder', data); return }
  catch{}
  try{ document.cookie = `pendingOrder=${encodeURIComponent(data)}; Path=/; SameSite=Lax` }catch{}
}

function getPending(): any[]{
  let raw: string|null = null
  try{ raw = sessionStorage.getItem('pendingOrder') }catch{}
  if(!raw){ try{ raw = localStorage.getItem('pendingOrder') }catch{} }
  if(!raw){ try{ const m = document.cookie.match(new RegExp('(^|; )pendingOrder=([^;]+)')); raw = m?decodeURIComponent(m[2]):null }catch{} }
  try{ return raw ? JSON.parse(raw) : [] }catch{ return [] }
}

export function addPendingItem(productoId:number, cantidad:number){
  const items = getPending()
  const idx = items.findIndex((x:any)=> Number(x?.productoId)===Number(productoId))
  if(idx>=0){ items[idx].cantidad = Number(items[idx].cantidad||0) + Number(cantidad||0) }
  else { items.push({ productoId, cantidad }) }
  setPending(items)
}

export function clearPending(){ setPending([]) }

export function getPendingItems(){ return getPending() }

export async function processPendingCheckout(){
  const items = getPending()
  if(items.length===0) return fetch('/api/ventas/ingresar',{method:'POST',headers:{'Accept':'application/json','Content-Type':'application/json',...authHeaders()},credentials:'same-origin'}).then(r=>r.json())
  try{
    for(const it of items){
      await addToCart(Number(it.productoId), Number(it.cantidad))
    }
    clearPending()
    const r = await fetch('/api/ventas/ingresar',{method:'POST',headers:{'Accept':'application/json','Content-Type':'application/json',...authHeaders()},credentials:'same-origin'})
    return r.json()
  }catch(e:any){
    const r = await fetch('/api/ventas/ingresar-directa',{
      method:'POST',
      headers:{'Accept':'application/json','Content-Type':'application/json',...authHeaders()},
      credentials:'same-origin',
      body:JSON.stringify({ items: items.map(it=>({productoId:Number(it.productoId), cantidad:Number(it.cantidad)})) })
    })
    clearPending()
    return r.json()
  }
}
