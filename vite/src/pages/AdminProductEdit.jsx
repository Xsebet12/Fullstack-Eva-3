import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import AdminHeader from '../components/AdminHeader'
import AdminSidebar from '../components/AdminSidebar'
import AdminOffcanvas from '../components/AdminOffcanvas'
import Footer from '../components/Footer'

export default function AdminProductEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Estado para edición
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [stock, setStock] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // Validaciones en tiempo real
  const nombreValido = useMemo(() => nombre.trim().length > 0, [nombre])
  const precioValido = useMemo(() => {
    if (precio === '') return false
    const p = Number(precio)
    return Number.isFinite(p) && p >= 0
  }, [precio])
  const stockValido = useMemo(() => {
    if (stock === '') return false
    const s = Number(stock)
    return Number.isInteger(s) && s >= 0
  }, [stock])
  const formValido = nombreValido && precioValido && stockValido

  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await api.get(`/api/productos/${id}`)
        if (!ignore) {
          setProduct(data)
          setNombre(data?.nombre ?? '')
          setPrecio(data?.precio ?? '')
          setStock(data?.stock ?? '')
        }
      } catch (err) {
        if (!ignore) setError('No se pudo cargar el producto.')
        console.error('Error cargando producto:', err)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [id])

  const handleImgError = (e) => { e.currentTarget.src = '/vite.svg' }

  // Guardar cambios
  const handleSave = async () => {
    setError('')
    setSaveMessage('')
    try {
      setSaving(true)
      const payload = {
        nombre,
        precio: precio === '' ? null : Number(precio),
        stock: stock === '' ? null : Number(stock),
        // Mantener categoría actual si existe
        ...(product?.categoria?.id ? { categoria: { id: product.categoria.id } } : {}),
      }
      const updated = await api.put(`/api/productos/${id}`, payload)
      setProduct(updated)
      setNombre(updated?.nombre ?? '')
      setPrecio(updated?.precio ?? '')
      setStock(updated?.stock ?? '')
      setSaveMessage('Cambios guardados.')
    } catch (err) {
      setError('Error guardando producto. Verifique el backend.')
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleChangeMainImage = async () => {
    setError('')
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      const fd = new FormData()
      fd.append('file', file)
      try {
        const res = await api.fetch(`/api/productos/${id}/image`, { method: 'POST', body: fd })
        if (!res.ok) {
          setError(`No se pudo cambiar la imagen (HTTP ${res.status})`)
          return
        }
        const updated = await res.json()
        setProduct(updated)
      } catch (err) {
        setError('Error cambiando imagen.');
        console.error('Change main image error:', err)
      }
    }
    input.click()
  }

  const handleAddImages = async () => {
    setError('')
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = async (e) => {
      const files = Array.from(e.target.files || [])
      if (!files.length) return
      const fd = new FormData()
      files.forEach((f) => fd.append('files', f))
      try {
        const res = await api.fetch(`/api/productos/${id}/images`, { method: 'POST', body: fd })
        if (!res.ok) { setError(`No se pudo agregar imágenes (HTTP ${res.status})`); return }
        const updated = await res.json()
        setProduct(updated)
      } catch (err) {
        setError('Error agregando imágenes.')
        console.error('Add images error:', err)
      }
    }
    input.click()
  }

  // Hacer principal una imagen existente
  const handleMakePrimary = async (imageId) => {
    setError('')
    try {
      const res = await api.fetch(`/api/productos/${id}/imagen-principal?imageId=${imageId}`, { method: 'PATCH' })
      if (!res.ok) { setError(`No se pudo establecer como principal (HTTP ${res.status})`); return }
      const updated = await res.json()
      setProduct(updated)
      setSaveMessage('Imagen principal actualizada.')
    } catch (err) {
      setError(`No se pudo establecer como principal (HTTP ${err.status ?? '?'})`)
      console.error('Make primary error:', err)
    }
  }

  // Eliminar una imagen específica
  const handleDeleteImage = async (imageId) => {
    setError('')
    const ok = window.confirm('¿Eliminar esta imagen?')
    if (!ok) return
    try {
      const res = await api.fetch(`/api/productos/${id}/images/${imageId}`, { method: 'DELETE' })
      if (!res.ok) { setError(`No se pudo eliminar imagen (HTTP ${res.status})`); return }
      const updated = await res.json()
      setProduct(updated)
      setSaveMessage('Imagen eliminada.')
    } catch (err) {
      setError(`Error eliminando imagen (HTTP ${err.status ?? '?'})`)
      console.error('Delete image error:', err)
    }
  }

  // Eliminar producto completo
  const handleDeleteProduct = async () => {
    const ok = window.confirm(`¿Eliminar el producto ${id}? Esta acción no se puede deshacer.`)
    if (!ok) return
    try {
      await api.del(`/api/productos/${id}`)
      navigate('/admin/products')
    } catch (err) {
      setError(`No se pudo eliminar el producto (HTTP ${err.status ?? '?'})`)
      console.error('Eliminar producto error:', err)
    }
  }

  return (
    <main className="container-fluid p-0">
      <AdminHeader />

      <section className="mt-3">
        <div className="row">
          <div className="d-md-none mb-2">
            <button className="btn" type="button" data-bs-toggle="offcanvas" data-bs-target="#menuLateralOffcanvas">
              ☰ Menú
            </button>
          </div>

          <AdminSidebar />
          <AdminOffcanvas />

          <section className="col-12 col-md-9 content">
            <div className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="h_titulos m-0">Editar producto #{id}</h1>
                <Link to="/admin/products" className="btn btn-outline-secondary">Volver</Link>
              </div>

              {error && <div className="alert alert-danger" role="alert">{error}</div>}

              {loading ? (
                <div className="d-flex align-items-center">
                  <div className="spinner-border text-secondary me-2" role="status" aria-hidden="true"></div>
                  <span>Cargando producto…</span>
                </div>
              ) : !product ? (
                <div className="alert alert-warning">Producto no encontrado</div>
              ) : (
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <img src={product.imagen || '/vite.svg'} alt={product.nombre} width="64" height="64" className="object-fit-cover rounded me-3" onError={handleImgError} />
                      <div>
                        <h5 className="card-title m-0">{product.nombre}</h5>
                        <small className="text-muted">ID: {product.id}</small>
                      </div>
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Nombre</label>
                        <input
                          type="text"
                          className={`form-control ${nombre ? (nombreValido ? 'is-valid' : 'is-invalid') : ''}`}
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          disabled={product?.habilitado === false}
                        />
                        {!nombreValido && nombre && <div className="invalid-feedback">Requerido.</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Categoría</label>
                        <input type="text" className="form-control" value={product.categoria?.nombre ?? '-'} disabled />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Precio</label>
                        <input
                          type="number"
                          step="0.01"
                          className={`form-control ${precio !== '' ? (precioValido ? 'is-valid' : 'is-invalid') : ''}`}
                          value={precio}
                          onChange={(e) => setPrecio(e.target.value)}
                          disabled={product?.habilitado === false}
                        />
                        {!precioValido && precio !== '' && <div className="invalid-feedback">Debe ser un número ≥ 0.</div>}
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Stock</label>
                        <input
                          type="number"
                          className={`form-control ${stock !== '' ? (stockValido ? 'is-valid' : 'is-invalid') : ''}`}
                          value={stock}
                          onChange={(e) => setStock(e.target.value)}
                          disabled={product?.habilitado === false}
                        />
                        {!stockValido && stock !== '' && <div className="invalid-feedback">Debe ser un entero ≥ 0.</div>}
                      </div>
                      <div className="col-md-12">
                        <label className="form-label">Imágenes</label>
                        {product.imagenes && product.imagenes.length > 0 ? (
                          product.imagenes.map((img) => (
                            <div key={img.id} className="d-flex align-items-center mb-2">
                              <img src={img.url || '/vite.svg'} alt={`Imagen ${img.id}`} width="64" height="64" className="object-fit-cover rounded me-2" onError={handleImgError} />
                              {product.imagen === img.url && (
                                <span className="badge bg-secondary me-2">Principal</span>
                              )}
                              <span className="me-3 small text-muted">ID: {img.id}</span>
                              <div className="btn-group btn-group-sm" role="group">
                                <button className="btn btn-outline-primary" onClick={() => handleMakePrimary(img.id)} disabled={product.habilitado === false || product.imagen === img.url}>Hacer principal</button>
                                <button className="btn btn-outline-danger" onClick={() => handleDeleteImage(img.id)} disabled={product.habilitado === false}>Eliminar</button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-muted">Sin imágenes.</div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <button className="btn btn-primary" onClick={handleSave} disabled={saving || product?.habilitado === false || !formValido}>
                        {saving ? 'Guardando…' : 'Guardar'}
                      </button>
                      <button className="btn btn-outline-secondary ms-2" onClick={handleChangeMainImage} disabled={product?.habilitado === false}>
                        Cambiar imagen principal
                      </button>
                      <button className="btn btn-outline-secondary ms-2" onClick={handleAddImages} disabled={product?.habilitado === false}>
                        Agregar imágenes
                      </button>
                      <button className="btn btn-outline-danger ms-2" onClick={handleDeleteProduct}>
                        Eliminar producto
                      </button>
                      {saveMessage && <span className="ms-2 text-success">{saveMessage}</span>}
                    </div>
                  </div>
                </div>
              )}
              {product && product.habilitado === false && (
                <div className="alert alert-warning mt-3">Este producto está deshabilitado; no se puede editar ni gestionar imágenes.</div>
              )}
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  )
}