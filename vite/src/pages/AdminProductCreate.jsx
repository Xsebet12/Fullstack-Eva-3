import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import AdminHeader from '../components/AdminHeader'
import AdminSidebar from '../components/AdminSidebar'
import AdminOffcanvas from '../components/AdminOffcanvas'
import Footer from '../components/Footer'

export default function AdminProductCreate() {
  const navigate = useNavigate()
  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [providerId, setProviderId] = useState('')
  const [initialFiles, setInitialFiles] = useState([])

  // Data
  const [categories, setCategories] = useState([])
  const [loadingCats, setLoadingCats] = useState(true)
  const [error, setError] = useState('')
  const [providers, setProviders] = useState([])
  const [loadingProviders, setLoadingProviders] = useState(true)
  const [provError, setProvError] = useState('')

  // Create
  const [creating, setCreating] = useState(false)
  const [createdProduct, setCreatedProduct] = useState(null)
  const [message, setMessage] = useState('')

  // Image upload
  const [singleFile, setSingleFile] = useState(null)
  const [multiFiles, setMultiFiles] = useState([])
  const [uploadingSingle, setUploadingSingle] = useState(false)
  const [uploadingMulti, setUploadingMulti] = useState(false)

  useEffect(() => {
    let ignore = false
    const loadCats = async () => {
      try {
        setLoadingCats(true)
        setError('')
        const data = await api.get('/api/categorias')
        if (!ignore) setCategories(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!ignore) setError('No se pudieron cargar categorías.')
        console.error('Error categorías:', err)
      } finally {
        if (!ignore) setLoadingCats(false)
      }
    }
    loadCats()
    return () => { ignore = true }
  }, [])

  useEffect(() => {
    let ignore = false
    const loadProviders = async () => {
      try {
        setLoadingProviders(true)
        setProvError('')
        try {
          const data = await api.get('/api/proveedores')
          if (!ignore) setProviders(Array.isArray(data) ? data : [])
        } catch (err) {
          if (!ignore) {
            setProviders([])
            setProvError('Inicia sesión para cargar proveedores.')
          }
        }
      } catch (err) {
        if (!ignore) setProvError('No se pudieron cargar proveedores.')
        console.error('Error proveedores:', err)
      } finally {
        if (!ignore) setLoadingProviders(false)
      }
    }
    loadProviders()
    return () => { ignore = true }
  }, [])

  // Validaciones en tiempo real
  const nombreValido = useMemo(() => name.trim().length > 0, [name])
  const precioValido = useMemo(() => {
    if (price === '') return false
    const p = Number(price)
    return Number.isFinite(p) && p >= 0
  }, [price])
  const stockValido = useMemo(() => {
    if (stock === '') return false
    const s = Number(stock)
    return Number.isInteger(s) && s >= 0
  }, [stock])
  const categoriaValida = useMemo(() => Boolean(categoryId), [categoryId])
  const proveedorValido = useMemo(() => Boolean(providerId), [providerId])
  const formValido = nombreValido && precioValido && stockValido && categoriaValida && proveedorValido

  const validate = () => {
    if (!nombreValido) return 'El nombre es obligatorio.'
    if (!precioValido) return 'Precio inválido.'
    if (!stockValido) return 'Stock inválido.'
    if (!categoriaValida) return 'Selecciona una categoría.'
    if (!proveedorValido) return 'Selecciona un proveedor.'
    return ''
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    const validation = validate()
    if (validation) { setError(validation); return }
    try {
      setCreating(true)
      const payload = {
        nombre: name.trim(),
        descripcion: (description ?? '').trim() || null,
        precio: price === '' ? null : Number(price),
        stock: stock === '' ? null : Number(stock),
        categoria: { id: Number(categoryId) },
        proveedor: { id: Number(providerId) },
      }
      const form = new FormData()
      form.append('product', new Blob([JSON.stringify(payload)], { type: 'application/json' }))
      for (const f of initialFiles) form.append('files', f)
      const res = await api.fetch('/api/productos', {
        method: 'POST',
        body: form,
      })
      if (!res.ok) {
        setError(`No se pudo crear (HTTP ${res.status})`)
        return
      }
      const created = await res.json()
      setCreatedProduct(created)
      setMessage(`Producto creado con ID ${created.id}`)
    } catch (err) {
      setError('Error creando producto. Verifique el backend.')
      console.error('Create product error:', err)
    } finally {
      setCreating(false)
    }
  }

  const handleUploadSingle = async () => {
    if (!createdProduct?.id || !singleFile) return
    try {
      setUploadingSingle(true)
      const form = new FormData()
      form.append('file', singleFile)
      const res = await api.fetch(`/api/productos/${createdProduct.id}/image`, {
        method: 'POST',
        body: form,
      })
      if (!res.ok) { setError(`No se pudo subir imagen (HTTP ${res.status})`); return }
      const updated = await res.json()
      setCreatedProduct(updated)
      setMessage('Imagen principal subida correctamente.')
    } catch (err) {
      setError('Error subiendo imagen.');
      console.error('Upload single error:', err)
    } finally {
      setUploadingSingle(false)
    }
  }

  const handleUploadMulti = async () => {
    if (!createdProduct?.id || !multiFiles?.length) return
    try {
      setUploadingMulti(true)
      const form = new FormData()
      for (const f of multiFiles) form.append('files', f)
      const res = await api.fetch(`/api/productos/${createdProduct.id}/images`, {
        method: 'POST',
        body: form,
      })
      if (!res.ok) { setError(`No se pudieron subir imágenes (HTTP ${res.status})`); return }
      const updated = await res.json()
      setCreatedProduct(updated)
      setMessage('Imágenes adicionales subidas correctamente.')
    } catch (err) {
      setError('Error subiendo imágenes.');
      console.error('Upload multi error:', err)
    } finally {
      setUploadingMulti(false)
    }
  }

  const handleLogoError = (e) => { e.currentTarget.src = '/vite.svg' }

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
                <h1 className="h_titulos m-0">Crear producto</h1>
                <Link to="/admin/products" className="btn btn-outline-secondary">Volver</Link>
              </div>

              {error && <div className="alert alert-danger" role="alert">{error}</div>}
              {message && <div className="alert alert-success" role="alert">{message}</div>}

              <div className="card">
                <div className="card-body">
                  <form onSubmit={handleCreate}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Nombre</label>
                        <input type="text" className={`form-control ${name ? (nombreValido ? 'is-valid' : 'is-invalid') : ''}`} value={name} onChange={(e) => setName(e.target.value)} />
                        {!nombreValido && name && <div className="invalid-feedback">Requerido.</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Categoría</label>
                        {loadingCats ? (
                          <div className="form-control-plaintext">Cargando…</div>
                        ) : (
                          <>
                            <select className={`form-select ${categoryId ? 'is-valid' : (categoryId === '' ? '' : 'is-invalid')}`} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                              <option value="">Selecciona…</option>
                              {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                              ))}
                            </select>
                            {!categoriaValida && categoryId !== '' && (
                              <div className="invalid-feedback d-block">Selecciona una categoría.</div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Proveedor</label>
                        {loadingProviders ? (
                          <div className="form-control-plaintext">Cargando…</div>
                        ) : provError ? (
                          <div className="form-control-plaintext text-danger">{provError}</div>
                        ) : (
                          <>
                            <select className={`form-select ${providerId ? 'is-valid' : (providerId === '' ? '' : 'is-invalid')}`} value={providerId} onChange={(e) => setProviderId(e.target.value)}>
                              <option value="">Selecciona…</option>
                              {providers.map((p) => (
                                <option key={p.id} value={p.id}>{p.companyName}</option>
                              ))}
                            </select>
                            {!proveedorValido && providerId !== '' && (
                              <div className="invalid-feedback d-block">Selecciona un proveedor.</div>
                            )}
                          </>
                        )}
                      </div>
                      <div className="col-md-12">
                        <label className="form-label">Descripción</label>
                        <textarea className="form-control" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Precio</label>
                        <input type="number" step="0.01" className={`form-control ${price !== '' ? (precioValido ? 'is-valid' : 'is-invalid') : ''}`} value={price} onChange={(e) => setPrice(e.target.value)} />
                        {!precioValido && price !== '' && <div className="invalid-feedback">Debe ser un número ≥ 0.</div>}
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Stock</label>
                        <input type="number" className={`form-control ${stock !== '' ? (stockValido ? 'is-valid' : 'is-invalid') : ''}`} value={stock} onChange={(e) => setStock(e.target.value)} />
                        {!stockValido && stock !== '' && <div className="invalid-feedback">Debe ser un entero ≥ 0.</div>}
                      </div>
                      <div className="col-md-12">
                        <label className="form-label">Imágenes (seleccionar desde el PC)</label>
                        <input type="file" className="form-control" accept="image/*" multiple onChange={(e) => setInitialFiles(Array.from(e.target.files || []))} />
                        <small className="text-muted">La primera imagen será la principal.</small>
                      </div>
                    </div>

                    <div className="mt-4 d-flex align-items-center">
                      <button className="btn btn-primary" type="submit" disabled={creating || !formValido}> {creating ? 'Creando…' : 'Crear'} </button>
                      <span className="ms-2 text-muted">Requiere haber iniciado sesión</span>
                    </div>
                  </form>
                </div>
              </div>

              {createdProduct && (
                <div className="card mt-4">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <img src={createdProduct.imagen || '/vite.svg'} alt={createdProduct.nombre} width="64" height="64" className="object-fit-cover rounded me-3" onError={handleLogoError} />
                      <div>
                        <h5 className="card-title m-0">{createdProduct.nombre}</h5>
                        <small className="text-muted">ID: {createdProduct.id}</small>
                      </div>
                    </div>
                    <h6 className="fw-bold">Subir imágenes</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Imagen principal (una)</label>
                        <input type="file" className="form-control" accept="image/*" onChange={(e) => setSingleFile(e.target.files?.[0] || null)} />
                        <button className="btn btn-outline-primary mt-2" onClick={handleUploadSingle} disabled={!singleFile || uploadingSingle}>
                          {uploadingSingle ? 'Subiendo…' : 'Subir imagen'}
                        </button>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Imágenes adicionales (múltiples)</label>
                        <input type="file" className="form-control" accept="image/*" multiple onChange={(e) => setMultiFiles(Array.from(e.target.files || []))} />
                        <button className="btn btn-outline-primary mt-2" onClick={handleUploadMulti} disabled={!multiFiles.length || uploadingMulti}>
                          {uploadingMulti ? 'Subiendo…' : 'Subir imágenes'}
                        </button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <button className="btn btn-success" onClick={() => navigate(`/admin/products/${createdProduct.id}/edit`)}>Ir a editar</button>
                    </div>
                  </div>
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