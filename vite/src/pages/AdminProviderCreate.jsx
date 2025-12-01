import { useEffect, useMemo, useState } from 'react'
import AdminHeader from '../components/AdminHeader'
import api from '../lib/api'
import AdminSidebar from '../components/AdminSidebar'
import AdminOffcanvas from '../components/AdminOffcanvas'
import Footer from '../components/Footer'

export default function AdminProviderCreate() {
  const [titulo, setTitulo] = useState('') // companyName
  const [correo, setCorreo] = useState('') // correo proveedor (se usará como contacto si no agregas otros)
  const [telefono, setTelefono] = useState('') // phone
  const [descripcion, setDescripcion] = useState('') // serviceType
  const [url, setUrl] = useState('') // sitio web
  const [imagenFile, setImagenFile] = useState(null)
  const [imagenPreview, setImagenPreview] = useState('')
  const [contacts, setContacts] = useState([{ name: '', email: '', phone: '', role: '' }])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [okMsg, setOkMsg] = useState('')
  const [createdProvider, setCreatedProvider] = useState(null)
  const [postLogoFile, setPostLogoFile] = useState(null)
  const [postLogoPreview, setPostLogoPreview] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [existingProviders, setExistingProviders] = useState([])

  const handleImgError = (e) => { e.currentTarget.src = '/vite.svg' }

  const handleAddContact = () => {
    setContacts((prev) => [...prev, { name: '', email: '', phone: '', role: '' }])
  }

  const handleRemoveContact = (idx) => {
    setContacts((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleContactChange = (idx, field, value) => {
    setContacts((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)))
  }

  const handleImagenChange = (e) => {
    const file = e.target.files?.[0]
    setImagenFile(file || null)
    if (file) {
      const urlObj = URL.createObjectURL(file)
      setImagenPreview(urlObj)
    } else {
      setImagenPreview('')
    }
  }

  const handlePostLogoChange = (e) => {
    const file = e.target.files?.[0] || null
    setPostLogoFile(file)
    if (file) {
      const urlObj = URL.createObjectURL(file)
      setPostLogoPreview(urlObj)
    } else {
      setPostLogoPreview('')
    }
  }

  // Validaciones en tiempo real
  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, [])
  const phoneRegex = useMemo(() => /^[0-9()+\-\s]{7,20}$/, [])
  const tituloValido = useMemo(() => titulo.trim().length > 0, [titulo])
  const descripcionValida = useMemo(() => descripcion.trim().length > 0, [descripcion])
  const correoValido = useMemo(() => (correo === '' ? true : emailRegex.test(correo)), [correo, emailRegex])
  const telefonoValido = useMemo(() => (telefono === '' ? true : phoneRegex.test(telefono)), [telefono, phoneRegex])
  const normalizarPhone = (s) => (s || '').replace(/[^0-9+]/g, '')
  const telefonoTomado = useMemo(() => {
    if (!telefono || !existingProviders?.length) return false
    const t = normalizarPhone(telefono)
    return existingProviders.some(p => p.phone && normalizarPhone(p.phone) === t)
  }, [telefono, existingProviders])
  // Conjuntos globales de contactos (otros proveedores) para validar duplicados
  const existingContactEmails = useMemo(() => {
    const set = new Set()
    for (const p of existingProviders || []) {
      if (!p || !Array.isArray(p.contacts)) continue
      for (const c of p.contacts) {
        const em = (c?.email || '').trim().toLowerCase()
        if (em) set.add(em)
      }
    }
    return set
  }, [existingProviders])
  const existingContactPhones = useMemo(() => {
    const set = new Set()
    for (const p of existingProviders || []) {
      if (!p || !Array.isArray(p.contacts)) continue
      for (const c of p.contacts) {
        const ph = normalizarPhone(c?.phone || '')
        if (ph) set.add(ph)
      }
    }
    return set
  }, [existingProviders])

  const existingEmailOwners = useMemo(() => {
    const map = new Map()
    for (const p of existingProviders || []) {
      if (!Array.isArray(p.contacts)) continue
      for (const c of p.contacts) {
        const em = (c?.email || '').trim().toLowerCase()
        if (em) {
          const prev = map.get(em)
          map.set(em, prev ? prev : (p.companyName || `Proveedor ${p.id}`))
        }
      }
    }
    return map
  }, [existingProviders])
  const existingPhoneOwners = useMemo(() => {
    const map = new Map()
    for (const p of existingProviders || []) {
      if (!Array.isArray(p.contacts)) continue
      for (const c of p.contacts) {
        const ph = normalizarPhone(c?.phone || '')
        if (ph) {
          const prev = map.get(ph)
          map.set(ph, prev ? prev : (p.companyName || `Proveedor ${p.id}`))
        }
      }
    }
    return map
  }, [existingProviders])
  const urlValida = useMemo(() => {
    if (url === '') return true
    try {
      const u = new URL(url)
      return u.protocol === 'http:' || u.protocol === 'https:'
    } catch {
      return false
    }
  }, [url])
  const contactosCorreoValidos = useMemo(() => contacts.every((c, idx) => {
    if (!c.email) return true
    const okFormat = emailRegex.test(c.email)
    const dupInside = contacts.some((o, j) => j !== idx && o.email && o.email.trim().toLowerCase() === c.email.trim().toLowerCase())
    const dupGlobal = existingContactEmails.has(c.email.trim().toLowerCase())
    return okFormat && !dupInside && !dupGlobal
  }), [contacts, emailRegex, existingContactEmails])
  const contactosTelefonoValidos = useMemo(() => contacts.every((c, idx) => {
    if (!c.phone) return true
    const okFormat = phoneRegex.test(c.phone)
    const norm = normalizarPhone(c.phone)
    const dupInside = contacts.some((o, j) => j !== idx && o.phone && normalizarPhone(o.phone) === norm)
    const dupGlobal = existingContactPhones.has(norm)
    return okFormat && !dupInside && !dupGlobal
  }), [contacts, phoneRegex, existingContactPhones])
  const contactosNombreValidos = useMemo(() => contacts.every(c => (c.name && c.name.trim()) || !(c.email||c.phone||c.role)), [contacts])
  const formValido = tituloValido && descripcionValida && correoValido && telefonoValido && !telefonoTomado && urlValida && contactosCorreoValidos && contactosTelefonoValidos && contactosNombreValidos

  const validate = () => {
    if (!tituloValido) return 'El título es obligatorio.'
    if (!descripcionValida) return 'La descripción (tipo de servicio) es obligatoria.'
    if (!correoValido) return 'Correo inválido.'
    if (!telefonoValido) return 'Teléfono inválido.'
  if (telefono && telefonoTomado) return 'El teléfono ya está registrado para otro proveedor.'
    if (!urlValida) return 'URL inválida; debe comenzar con http(s).'
    if (!contactosCorreoValidos) return 'Hay correos inválidos en los contactos.'
    if (!contactosTelefonoValidos) return 'Hay teléfonos inválidos en los contactos.'
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setOkMsg('')

    const validation = validate()
    if (validation) { setError(validation); return }

    const token = localStorage.getItem('authToken')
    if (!token) {
      setError('No hay sesión activa. Inicia sesión para continuar.')
      return
    }

    const cleanContacts = contacts
      .map((c) => ({
        name: c.name?.trim() || '',
        email: c.email?.trim() || '',
        phone: c.phone?.trim() || '',
        role: c.role?.trim() || ''
      }))
      .filter((c) => c.name || c.email || c.phone || c.role)

    // Reglas: cada contacto con contenido debe tener Nombre
    if (cleanContacts.some(c => (c.email || c.phone || c.role) && !c.name)) {
      setError('Cada contacto debe tener Nombre (si tiene otros datos).')
      return
    }
    // Validación de duplicados (internos y globales) en submit
    const emails = new Set()
    const phones = new Set()
    for (const c of cleanContacts) {
      if (c.email) {
        const key = c.email.trim().toLowerCase()
        if (emails.has(key) || existingContactEmails.has(key)) { setError('Corrige los campos en rojo (correo duplicado).'); return }
        emails.add(key)
      }
      if (c.phone) {
        const key = normalizarPhone(c.phone)
        if (phones.has(key) || existingContactPhones.has(key)) { setError('Corrige los campos en rojo (teléfono duplicado).'); return }
        phones.add(key)
      }
    }

    // Si no hay contactos, pero el proveedor tiene correo/telefono, crear un contacto principal
    if (cleanContacts.length === 0 && (correo || telefono)) {
      cleanContacts.push({ name: 'Contacto principal', email: correo || '', phone: telefono || '', role: 'Contacto' })
    }

    const payload = {
      companyName: titulo.trim(),
      serviceType: descripcion.trim(),
      url: url?.trim() || null,
      phone: telefono?.trim() || null,
      contacts: cleanContacts
    }

    try {
      setSubmitting(true)
      const created = await api.post('/api/proveedores', payload)
      // Si hay imagen, subir como logo
      if (imagenFile && created?.id) {
        const fd = new FormData()
        fd.append('file', imagenFile)
        const upRes = await api.fetch(`/api/proveedores/${created.id}/logo`, { method: 'POST', body: fd })
        if (!upRes.ok) {
          const text = await upRes.text().catch(() => '')
          setError(`Proveedor creado pero falló la subida del logo (HTTP ${upRes.status}) ${text || ''}`)
        }
      }
      setOkMsg(`Proveedor creado: ${created?.companyName || 'OK'}`)
      setCreatedProvider(created || null)
      setTitulo(''); setCorreo(''); setTelefono(''); setDescripcion(''); setUrl('')
      setContacts([{ name: '', email: '', phone: '', role: '' }])
      setImagenFile(null); setImagenPreview('')
      setPostLogoFile(null); setPostLogoPreview('')
    } catch (err) {
  console.error('Error creando proveedor:', err)
      setError('Error de red o servidor. Intenta nuevamente.')
    } finally {
      setSubmitting(false)
    }
  }

  // Cargar proveedores existentes para validar teléfono único
  useEffect(() => {
    let ignore = false
    const loadProviders = async () => {
      try {
        const token = localStorage.getItem('authToken')
        if (!token) { if (!ignore) setExistingProviders([]); return }
        let data = []
        try {
          data = await api.get('/api/proveedores?all=true')
        } catch (err) {
          // si no admin, intentar activos
          data = await api.get('/api/proveedores').catch(() => [])
        }
        if (!ignore) setExistingProviders(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!ignore) setExistingProviders([])
        console.warn('No se pudo cargar proveedores para validación de teléfono único', err)
      }
    }
    loadProviders()
    return () => { ignore = true }
  }, [])

  const handleUploadLogoForCreated = async () => {
    if (!createdProvider?.id || !postLogoFile) return
    setError(''); setOkMsg('')
    try {
      setUploadingLogo(true)
      const fd = new FormData()
      fd.append('file', postLogoFile)
      const upRes = await api.fetch(`/api/proveedores/${createdProvider.id}/logo`, { method: 'POST', body: fd })
      if (!upRes.ok) {
        const text = await upRes.text().catch(() => '')
        setError(`No se pudo subir el logo (HTTP ${upRes.status}) ${text || ''}`)
        return
      }
      const updated = await upRes.json()
      setCreatedProvider(updated)
      setOkMsg('Logo subido correctamente.')
    } catch (err) {
      console.error('Upload logo error:', err)
      setError('Error subiendo logo.')
    } finally {
      setUploadingLogo(false)
    }
  }

  return (
    <main className="container-fluid p-0">
      <AdminHeader />

      {/* MAIN */}
      <section className="mt-3">
        <div className="row">
          {/* BOTÓN MENÚ (solo en móviles) */}
          <div className="d-md-none mb-2">
            <button className="btn" type="button" data-bs-toggle="offcanvas" data-bs-target="#menuLateralOffcanvas">☰ Menú</button>
          </div>

          {/* SIDEBAR */}
          <AdminSidebar />

          {/* OFFCANVAS */}
          <AdminOffcanvas />

          {/* CONTENIDO PRINCIPAL */}
          <section className="col-12 col-md-9 content">
            <div className="p-3">
              <h1 className="h_titulos">Crear proveedor</h1>

              {error && <div className="alert alert-danger mt-3" role="alert">{error}</div>}
              {okMsg && <div className="alert alert-success mt-3" role="alert">{okMsg}</div>}

              <form className="mt-3" onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Título</label>
                    <input type="text" className={`form-control ${titulo ? (tituloValido ? 'is-valid' : 'is-invalid') : ''}`} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
                    {!tituloValido && titulo && <div className="invalid-feedback">Requerido.</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Correo</label>
                    <input type="email" className={`form-control ${correo ? (correoValido ? 'is-valid' : 'is-invalid') : ''}`} value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="correo@proveedor.com" />
                    {!correoValido && correo && <div className="invalid-feedback">Correo inválido.</div>}
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Teléfono</label>
                    <input type="text" className={`form-control ${telefono ? ((telefonoValido && !telefonoTomado) ? 'is-valid' : 'is-invalid') : ''}`} value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                    {!telefonoValido && telefono && <div className="invalid-feedback">Formato permitido: dígitos, espacios, +, -, ().</div>}
                    {telefonoValido && telefonoTomado && <div className="invalid-feedback d-block">Teléfono ya registrado.</div>}
                  </div>
                  <div className="col-md-8">
                    <label className="form-label">URL</label>
                    <input type="url" className={`form-control ${url ? (urlValida ? 'is-valid' : 'is-invalid') : ''}`} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://sitio.com" />
                    {!urlValida && url && <div className="invalid-feedback">Debe ser una URL http(s) válida.</div>}
                  </div>

                  {/* Descripción / Tipo de servicio */}
                  <div className="col-12">
                    <label className="form-label">Descripción / Tipo de servicio</label>
                    <textarea
                      className={`form-control ${descripcion ? (descripcionValida ? 'is-valid' : 'is-invalid') : ''}`}
                      rows={2}
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                    />
                    {!descripcionValida && <div className="invalid-feedback">Requerido.</div>}
                  </div>

                  {/* Imagen (logo opcional, se sube automáticamente luego de crear) */}
                  <div className="col-12">
                    <label className="form-label">Imagen (logo opcional)</label>
                    <input type="file" className="form-control" accept="image/*" onChange={handleImagenChange} />
                    {imagenPreview && (
                      <img
                        src={imagenPreview}
                        alt="Preview"
                        className="mt-2 rounded"
                        width="120"
                        height="120"
                        onError={handleImgError}
                      />
                    )}
                  </div>
                </div>

                <hr className="my-4" />

                <h5 className="mb-3">Personas de contacto</h5>
                {contacts.map((c, idx) => (
                  <div className="row g-3 align-items-end mb-2" key={idx}>
                    <div className="col-md-3">
                      <label className="form-label">Nombre</label>
                      <input
                        type="text"
                        className={`form-control ${(c.name || !(c.email || c.phone || c.role)) ? '' : 'is-invalid'}`}
                        value={c.name}
                        onChange={(e) => handleContactChange(idx, 'name', e.target.value)}
                        title="Nombre del contacto (obligatorio si ingresas email/teléfono/cargo)"
                      />
                      {!c.name && (c.email || c.phone || c.role) && (
                        <div className="invalid-feedback">Nombre es obligatorio.</div>
                      )}
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Correo</label>
                      {(() => {
                        const val = (c.email || '').trim()
                        const has = !!val
                        const okFmt = !has || emailRegex.test(val)
                        const dupInside = has && contacts.some((o, j) => j !== idx && o.email && o.email.trim().toLowerCase() === val.toLowerCase())
                        const dupGlobal = has && existingContactEmails.has(val.toLowerCase())
                        const invalid = has && (!okFmt || dupInside || dupGlobal)
                        return (
                          <>
                            <input
                              type="email"
                              className={`form-control ${has ? (invalid ? 'is-invalid' : 'is-valid') : ''}`}
                              value={c.email}
                              onChange={(e) => handleContactChange(idx, 'email', e.target.value)}
                              title={has && dupGlobal ? `Ya existe en: ${existingEmailOwners.get(val.toLowerCase()) || 'otro proveedor'}` : 'Formato: usuario@dominio (opcional)'}
                            />
                            {has && !okFmt && <div className="invalid-feedback">Correo inválido.</div>}
                            {has && okFmt && dupInside && <div className="invalid-feedback">Correo duplicado en la lista.</div>}
                            {has && okFmt && !dupInside && dupGlobal && <div className="invalid-feedback">Correo ya existe en otro proveedor.</div>}
                          </>
                        )
                      })()}
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Teléfono</label>
                      {(() => {
                        const val = (c.phone || '').trim()
                        const has = !!val
                        const okFmt = !has || phoneRegex.test(val)
                        const norm = normalizarPhone(val)
                        const dupInside = has && contacts.some((o, j) => j !== idx && o.phone && normalizarPhone(o.phone) === norm)
                        const dupGlobal = has && existingContactPhones.has(norm)
                        const invalid = has && (!okFmt || dupInside || dupGlobal)
                        return (
                          <>
                            <input
                              type="text"
                              className={`form-control ${has ? (invalid ? 'is-invalid' : 'is-valid') : ''}`}
                              value={c.phone}
                              onChange={(e) => handleContactChange(idx, 'phone', e.target.value)}
                              title={has && dupGlobal ? `Ya existe en: ${existingPhoneOwners.get(norm) || 'otro proveedor'}` : '7-20 caracteres: dígitos, espacios, +, -, () (opcional)'}
                            />
                            {has && !okFmt && <div className="invalid-feedback">Formato permitido: dígitos, espacios, +, -, ().</div>}
                            {has && okFmt && dupInside && <div className="invalid-feedback">Teléfono duplicado en la lista.</div>}
                            {has && okFmt && !dupInside && dupGlobal && <div className="invalid-feedback">Teléfono ya existe en otro proveedor.</div>}
                          </>
                        )
                      })()}
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Cargo</label>
                      <input
                        type="text"
                        className="form-control"
                        value={c.role}
                        onChange={(e) => handleContactChange(idx, 'role', e.target.value)}
                        title="Rol/cargo del contacto (opcional)"
                      />
                    </div>
                    <div className="col-md-1">
                      <button type="button" className="btn btn-outline-danger w-100" onClick={() => handleRemoveContact(idx)}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" className="btn btn-outline-primary" onClick={handleAddContact}>Añadir contacto</button>

                <div className="mt-4">
                  <button type="submit" className="btn btn-primary" disabled={submitting || !formValido}>
                    {submitting ? 'Creando…' : 'Crear proveedor'}
                  </button>
                </div>
              </form>

              {createdProvider && (
                <div className="card mt-4">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <img src={createdProvider.logoUrl || '/vite.svg'} alt={createdProvider.companyName} width="64" height="64" className="object-fit-cover rounded me-3" onError={(e)=>{e.currentTarget.src='/vite.svg'}} />
                      <div>
                        <h5 className="card-title m-0">{createdProvider.companyName}</h5>
                        <small className="text-muted">ID: {createdProvider.id}</small>
                      </div>
                    </div>
                    <h6 className="fw-bold">Subir/Actualizar logo</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Logo</label>
                        <input type="file" className="form-control" accept="image/*" onChange={handlePostLogoChange} />
                        {postLogoPreview && <img src={postLogoPreview} alt="Preview" className="mt-2 rounded" width="120" height="120" onError={(e)=>{e.currentTarget.src='/vite.svg'}} />}
                        <button className="btn btn-outline-primary mt-2" onClick={handleUploadLogoForCreated} disabled={!postLogoFile || uploadingLogo}>
                          {uploadingLogo ? 'Subiendo…' : 'Subir logo'}
                        </button>
                      </div>
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