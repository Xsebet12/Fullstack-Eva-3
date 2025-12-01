import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import AdminHeader from '../components/AdminHeader'
import AdminSidebar from '../components/AdminSidebar'
import AdminOffcanvas from '../components/AdminOffcanvas'
import Footer from '../components/Footer'

export default function AdminProviderEdit() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [companyName, setCompanyName] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [url, setUrl] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [okMsg, setOkMsg] = useState('')
  const [contacts, setContacts] = useState([])
  const [savingContactId, setSavingContactId] = useState(null)
  const [contactsError, setContactsError] = useState('')
  const [contactsOk, setContactsOk] = useState('')
  const [logoPreview, setLogoPreview] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [estado, setEstado] = useState('ACTIVO')
  const [existingProviders, setExistingProviders] = useState([])
  const handleImgError = (e) => { e.currentTarget.src = '/vite.svg' }
  const deriveLogoUrl = (u) => { try { const urlObj = new URL(u); return `https://logo.clearbit.com/${urlObj.hostname}` } catch { return '' } }
  const handleLogoChange = (e) => { const file = e.target.files?.[0]; if (file) { setLogoFile(file); const urlObj = URL.createObjectURL(file); setLogoPreview(urlObj) } else { setLogoFile(null); setLogoPreview('') } }

  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        setError('')
        setLoading(true)
        const data = await api.get(`/api/proveedores/${id}`)
        if (!ignore) {
          setCompanyName(data.companyName || '')
          setServiceType(data.serviceType || '')
          setUrl(data.url || '')
          setPhone(data.phone || '')
          setContacts(Array.isArray(data.contacts) ? data.contacts : [])
          setLogoPreview(data.logoUrl || '')
          setEstado(data.estado || 'ACTIVO')
        }
      } catch (err) {
        if (!ignore) setError('No se pudo cargar el proveedor.')
        console.error('Error cargando proveedor:', err)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [id])

  // Cargar proveedores existentes para validar teléfono único (excluyendo el actual)
  useEffect(() => {
    let ignore = false
    const loadProviders = async () => {
      try {
        let data = []
        try {
          data = await api.get('/api/proveedores?all=true')
        } catch (err) {
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

  // Helper para normalizar teléfonos (debe declararse antes de usar en useMemo)
  const normalizarPhone = (s) => (s || '').replace(/[^0-9+]/g, '')

  // Conjuntos de contactos de otros proveedores (para validar duplicados globales)
  const otherContactEmails = useMemo(() => {
    const set = new Set()
    // Para tooltip: mapear email -> nombre proveedor(es)
    // Usaremos un WeakMap auxiliar en memoria local de la función si quisiéramos múltiples,
    // pero para simplificar, calculamos dueño en estructuras separadas abajo.
    for (const p of existingProviders || []) {
      if (!p || String(p.id) === String(id)) continue
      if (!Array.isArray(p.contacts)) continue
      for (const c of p.contacts) {
        const em = (c?.email || '').trim().toLowerCase()
        if (em) set.add(em)
      }
    }
    return set
  }, [existingProviders, id])
  const otherContactPhones = useMemo(() => {
    const set = new Set()
    for (const p of existingProviders || []) {
      if (!p || String(p.id) === String(id)) continue
      if (!Array.isArray(p.contacts)) continue
      for (const c of p.contacts) {
        const ph = normalizarPhone(c?.phone || '')
        if (ph) set.add(ph)
      }
    }
    return set
  }, [existingProviders, id])

  // Mapas para tooltip: valor -> nombres de proveedores
  const otherEmailOwners = useMemo(() => {
    const map = new Map()
    for (const p of existingProviders || []) {
      if (!p || String(p.id) === String(id)) continue
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
  }, [existingProviders, id])
  const otherPhoneOwners = useMemo(() => {
    const map = new Map()
    for (const p of existingProviders || []) {
      if (!p || String(p.id) === String(id)) continue
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
  }, [existingProviders, id])

  // Validaciones en tiempo real del formulario principal
  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, [])
  const phoneRegex = useMemo(() => /^[0-9()+\-\s]{7,20}$/, [])
  const tituloValido = useMemo(() => companyName.trim().length > 0, [companyName])
  const servicioValido = useMemo(() => serviceType.trim().length > 0, [serviceType])
  const telefonoValido = useMemo(() => (phone === '' ? true : phoneRegex.test(phone)), [phone, phoneRegex])
  const telefonoTomado = useMemo(() => {
    if (!phone || !existingProviders?.length) return false
    const t = normalizarPhone(phone)
    return existingProviders.some(p => String(p.id) !== String(id) && p.phone && normalizarPhone(p.phone) === t)
  }, [phone, existingProviders, id])
  const urlValida = useMemo(() => {
    if (url === '') return true
    try {
      const u = new URL(url)
      return u.protocol === 'http:' || u.protocol === 'https:'
    } catch {
      return false
    }
  }, [url])
  const formValido = tituloValido && servicioValido && telefonoValido && !telefonoTomado && urlValida

  const uploadLogoOnly = async () => {
    if (!logoFile) return
    setError(''); setOkMsg('')
    try {
      setUploadingLogo(true)
      const fd = new FormData()
      fd.append('file', logoFile)
      const upRes = await api.fetch(`/api/proveedores/${id}/logo`, { method: 'POST', body: fd })
      if (!upRes.ok) {
        const text = await upRes.text().catch(() => '')
        setError(`No se pudo subir el logo (HTTP ${upRes.status}) ${text || ''}`)
        return
      }
      const updated = await upRes.json()
      setLogoPreview(updated.logoUrl || '')
      setOkMsg('Logo actualizado correctamente.')
      // refrescar contactos/otros datos opcionalmente
      try {
        const fresh = await api.get(`/api/proveedores/${id}`)
        setContacts(Array.isArray(fresh.contacts) ? fresh.contacts : [])
        setEstado(fresh.estado || 'ACTIVO')
      } catch {}
    } catch (err) {
      console.error('Upload logo error:', err)
      setError('Error subiendo logo.')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setOkMsg('')
    if (!formValido) {
      if (!tituloValido) { setError('El título es obligatorio.'); return }
      if (!servicioValido) { setError('El tipo de servicio es obligatorio.'); return }
      if (!telefonoValido) { setError('Teléfono inválido.'); return }
      if (!urlValida) { setError('URL inválida; debe comenzar con http(s).'); return }
    }
    try {
      setSaving(true)
      const payload = {
        companyName: companyName.trim(),
        serviceType: serviceType.trim(),
        url: url?.trim() || null,
        phone: phone?.trim() || null,
      }
      await api.put(`/api/proveedores/${id}`, payload)

      // Si hay archivo de logo, subirlo al backend
      if (logoFile) {
        const fd = new FormData()
        fd.append('file', logoFile)
        const upRes = await api.fetch(`/api/proveedores/${id}/logo`, { method: 'POST', body: fd })
        if (!upRes.ok) {
          const text = await upRes.text().catch(() => '')
          setError(`Proveedor actualizado pero falló la subida del logo (HTTP ${upRes.status}) ${text || ''}`)
          setSaving(false)
          return
        }
        const updatedWithLogo = await upRes.json()
        setLogoPreview(updatedWithLogo.logoUrl || '')
        setOkMsg(`Proveedor actualizado: ${updatedWithLogo.companyName || 'OK'}`)
      } else {
        setOkMsg(`Proveedor actualizado`)
      }

      // Releer del backend para reflejar cambios persistidos
      try {
        const fresh = await api.get(`/api/proveedores/${id}`)
        setCompanyName(fresh.companyName || '')
        setServiceType(fresh.serviceType || '')
        setUrl(fresh.url || '')
        setPhone(fresh.phone || '')
        setEstado(fresh.estado || 'ACTIVO')
        setContacts(Array.isArray(fresh.contacts) ? fresh.contacts : [])
        setLogoPreview(fresh.logoUrl || '')
      } catch (refErr) {
        console.warn('No se pudo refrescar proveedor tras guardar:', refErr)
      }
    } catch (err) {
      const msg = err?.body?.error || 'Error actualizando proveedor.'
      setError(msg)
      console.error('Update provider error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleContactFieldChange = (idx, field, value) => {
    setContacts((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)))
  }

  const saveContact = async (idx) => {
    setContactsError(''); setContactsOk('')
    const c = contacts[idx]
    // Reglas de completitud: exigir Nombre si se intenta guardar un contacto
    if (!c.name || !c.name.trim()) {
      setContactsError('El campo Nombre es obligatorio para el contacto.')
      return
    }
    // Validación local antes de enviar
    if (c.email && !emailRegex.test(c.email)) {
      setContactsError('Correo de contacto inválido.')
      return
    }
    if (c.phone && !phoneRegex.test(c.phone)) {
      setContactsError('Teléfono de contacto inválido.')
      return
    }
    // Unicidad dentro del mismo proveedor (en UI)
    const normPhone = (s) => (s || '').replace(/[^0-9+]/g, '')
    if (c.email) {
      const target = c.email.trim().toLowerCase()
      const dup = contacts.some((x, i) => i !== idx && x.email && x.email.trim().toLowerCase() === target)
      if (dup) { setContactsError('Correo de contacto duplicado en la lista.'); return }
    }
    if (c.phone) {
      const target = normPhone(c.phone)
      const dup = contacts.some((x, i) => i !== idx && x.phone && normPhone(x.phone) === target)
      if (dup) { setContactsError('Teléfono de contacto duplicado en la lista.'); return }
    }
    try {
      setSavingContactId(c.id || `new-${idx}`)
      const path = `/api/proveedores/${id}/contactos${c.id ? `/${c.id}` : ''}`
      const method = c.id ? 'PUT' : 'POST'
      const updatedProvider = await api[method === 'PUT' ? 'put' : 'post'](path, { name: c.name || '', email: c.email || '', phone: c.phone || '', role: c.role || '' })
      setContacts(Array.isArray(updatedProvider.contacts) ? updatedProvider.contacts : [])
      setContactsOk('Contacto guardado correctamente.')
    } catch (err) {
      console.error('Error guardando contacto:', err)
      setContactsError(err?.body?.error || 'Error guardando contacto.')
    } finally {
      setSavingContactId(null)
    }
  }

  const deleteContact = async (contactId) => {
    if (!window.confirm('¿Eliminar este contacto?')) return
    setContactsError(''); setContactsOk('')
    try {
      setSavingContactId(contactId)
      const res = await api.fetch(`/api/proveedores/${id}/contactos/${contactId}`, { method: 'DELETE' })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        setContactsError(`No se pudo eliminar contacto (HTTP ${res.status}) ${text || ''}`)
        return
      }
      const updatedProvider = await res.json()
      setContacts(Array.isArray(updatedProvider.contacts) ? updatedProvider.contacts : [])
      setContactsOk('Contacto eliminado correctamente.')
    } catch (err) {
      console.error('Error eliminando contacto:', err)
      setContactsError(err?.body?.error || 'Error eliminando contacto.')
    } finally {
      setSavingContactId(null)
    }
  }

  const setContactAsPrincipal = async (contactId) => {
    setContactsError(''); setContactsOk('')
    try {
      setSavingContactId(contactId)
      const res = await api.fetch(`/api/proveedores/${id}/contactos/${contactId}/principal`, { method: 'PATCH' })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        setContactsError(`No se pudo marcar como principal (HTTP ${res.status}) ${text || ''}`)
        return
      }
      const updatedProvider = await res.json()
      setContacts(Array.isArray(updatedProvider.contacts) ? updatedProvider.contacts : [])
      setContactsOk('Contacto marcado como principal.')
    } catch (err) {
      console.error('Error marcando contacto principal:', err)
      setContactsError(err?.body?.error || 'Error marcando contacto principal.')
    } finally {
      setSavingContactId(null)
    }
  }

  const addContactRow = () => {
    setContacts((prev) => [...prev, { name: '', email: '', phone: '', role: '' }])
  }

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
                <h1 className="h_titulos m-0">Editar proveedor</h1>
                <div>
                  <Link to="/admin/providers" className="btn btn-outline-secondary me-2">Volver</Link>
                  <button className="btn btn-outline-primary" onClick={() => navigate(`/admin/providers/${id}/edit`)}>Recargar</button>
                </div>
              </div>

              {error && <div className="alert alert-danger" role="alert">{error}</div>}
              {okMsg && <div className="alert alert-success" role="alert">{okMsg}</div>}

              {loading ? (
                <div className="d-flex align-items-center">
                  <div className="spinner-border text-secondary me-2" role="status" aria-hidden="true"></div>
                  <span>Cargando proveedor…</span>
                </div>
              ) : (
                <>
                  <form onSubmit={handleSubmit} id="providerForm">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Título</label>
                        <input type="text" className={`form-control ${companyName ? (tituloValido ? 'is-valid' : 'is-invalid') : ''}`} value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={estado !== 'ACTIVO'} />
                        {!tituloValido && companyName && <div className="invalid-feedback">Requerido.</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Teléfono</label>
                        <input type="text" className={`form-control ${phone ? ((telefonoValido && !telefonoTomado) ? 'is-valid' : 'is-invalid') : ''}`} value={phone} onChange={(e) => setPhone(e.target.value)} disabled={estado !== 'ACTIVO'} />
                        {phone && !telefonoValido && <div className="invalid-feedback">Formato permitido: dígitos, espacios, +, -, ().</div>}
                        {telefonoValido && telefonoTomado && <div className="invalid-feedback d-block">Teléfono ya registrado.</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">URL</label>
                        <input type="url" className={`form-control ${url ? (urlValida ? 'is-valid' : 'is-invalid') : ''}`} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://sitio.com" disabled={estado !== 'ACTIVO'} />
                        {url && !urlValida && <div className="invalid-feedback">Debe ser una URL http(s) válida.</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Tipo de servicio</label>
                        <input type="text" className={`form-control ${serviceType ? (servicioValido ? 'is-valid' : 'is-invalid') : ''}`} value={serviceType} onChange={(e) => setServiceType(e.target.value)} disabled={estado !== 'ACTIVO'} />
                        {!servicioValido && serviceType && <div className="invalid-feedback">Requerido.</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Logo de la empresa</label>
                        <input type="file" className="form-control" accept="image/*" onChange={handleLogoChange} disabled={estado !== 'ACTIVO'} />
                        <div className="mt-2 d-flex align-items-center">
                          <img src={logoPreview || deriveLogoUrl(url) || '/vite.svg'} alt={companyName} width="96" height="96" className="object-fit-cover rounded" onError={handleImgError} />
                          <button type="button" className="btn btn-outline-primary btn-sm ms-3" onClick={uploadLogoOnly} disabled={!logoFile || uploadingLogo || estado !== 'ACTIVO'}>
                            {uploadingLogo ? 'Subiendo…' : 'Subir logo'}
                          </button>
                          <small className="text-muted ms-2">Puedes subir el logo sin guardar otros cambios.</small>
                        </div>
                      </div>
                    </div>
                  </form>

                  <hr className="my-4" />

                  <div className="card mb-3">
                    <div className="card-body">
                      <h5 className="card-title">Contacto principal</h5>
                      {contacts.length === 0 ? (
                        <div className="text-muted">Sin contactos</div>
                      ) : (
                        (() => {
                          const principal = contacts.find(c => c.principal === true) || contacts[0]
                          return (
                            <div>
                              <div><strong>Nombre:</strong> {principal.name || '-'}</div>
                              <div><strong>Correo:</strong> {principal.email || '-'}</div>
                              <div><strong>Teléfono:</strong> {principal.phone || '-'}</div>
                              <div><strong>Cargo:</strong> {principal.role || '-'}</div>
                            </div>
                          )
                        })()
                      )}
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="m-0">Contactos</h5>
                    <button className="btn btn-outline-primary" onClick={addContactRow} disabled={estado !== 'ACTIVO'}>Añadir contacto</button>
                  </div>
                  {contactsError && <div className="alert alert-danger" role="alert">{contactsError}</div>}
                  {contactsOk && <div className="alert alert-success" role="alert">{contactsOk}</div>}

                  {contacts.length === 0 ? (
                    <div className="text-muted">No hay contactos.</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table align-middle">
                        <thead>
                          <tr>
                            <th>Nombre</th>
                            <th>Correo</th>
                            <th>Teléfono</th>
                            <th>Cargo</th>
                            <th>Principal</th>
                            <th style={{width: '320px'}}>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contacts.map((c, idx) => (
                            <tr key={c.id || `new-${idx}`}>
                              <td>
                                <input
                                  type="text"
                                  className={`form-control ${((c.name && c.name.trim()) || !(c.email||c.phone||c.role)) ? '': 'is-invalid'}`}
                                  value={c.name || ''}
                                  onChange={(e) => handleContactFieldChange(idx, 'name', e.target.value)}
                                  disabled={estado !== 'ACTIVO'}
                                  title="Nombre del contacto (obligatorio si se guarda el contacto)"
                                />
                                {(!c.name || !c.name.trim()) && (c.email||c.phone||c.role) && <div className="invalid-feedback">Nombre es obligatorio.</div>}
                              </td>
                              <td>
                                {(() => {
                                  const val = (c.email || '').trim()
                                  const has = !!val
                                  const okFmt = !has || emailRegex.test(val)
                                  const dupInside = has && contacts.some((o, j) => j !== idx && o.email && o.email.trim().toLowerCase() === val.toLowerCase())
                                  const dupGlobal = has && otherContactEmails.has(val.toLowerCase())
                                  const invalid = has && (!okFmt || dupInside || dupGlobal)
                                  return (
                                    <>
                                      <input
                                        type="email"
                                        className={`form-control ${has ? (invalid ? 'is-invalid' : 'is-valid') : ''}`}
                                        value={c.email || ''}
                                        onChange={(e) => handleContactFieldChange(idx, 'email', e.target.value)}
                                        disabled={estado !== 'ACTIVO'}
                                        title={has && dupGlobal ? `Ya existe en: ${otherEmailOwners.get(val.toLowerCase()) || 'otro proveedor'}` : 'Formato: usuario@dominio (opcional)'}
                                      />
                                      {has && !okFmt && <div className="invalid-feedback">Correo inválido.</div>}
                                      {has && okFmt && dupInside && <div className="invalid-feedback">Correo duplicado en la lista.</div>}
                                      {has && okFmt && !dupInside && dupGlobal && <div className="invalid-feedback">Correo ya existe en otro proveedor.</div>}
                                    </>
                                  )
                                })()}
                              </td>
                              <td>
                                {(() => {
                                  const val = (c.phone || '').trim()
                                  const has = !!val
                                  const okFmt = !has || phoneRegex.test(val)
                                  const norm = normalizarPhone(val)
                                  const dupInside = has && contacts.some((o, j) => j !== idx && o.phone && normalizarPhone(o.phone) === norm)
                                  const dupGlobal = has && otherContactPhones.has(norm)
                                  const invalid = has && (!okFmt || dupInside || dupGlobal)
                                  return (
                                    <>
                                      <input
                                        type="text"
                                        className={`form-control ${has ? (invalid ? 'is-invalid' : 'is-valid') : ''}`}
                                        value={c.phone || ''}
                                        onChange={(e) => handleContactFieldChange(idx, 'phone', e.target.value)}
                                        disabled={estado !== 'ACTIVO'}
                                        title={has && dupGlobal ? `Ya existe en: ${otherPhoneOwners.get(norm) || 'otro proveedor'}` : '7-20 caracteres: dígitos, espacios, +, -, () (opcional)'}
                                      />
                                      {has && !okFmt && <div className="invalid-feedback">Formato permitido: dígitos, espacios, +, -, ().</div>}
                                      {has && okFmt && dupInside && <div className="invalid-feedback">Teléfono duplicado en la lista.</div>}
                                      {has && okFmt && !dupInside && dupGlobal && <div className="invalid-feedback">Teléfono ya existe en otro proveedor.</div>}
                                    </>
                                  )
                                })()}
                              </td>
                              <td><input type="text" className="form-control" value={c.role || ''} onChange={(e) => handleContactFieldChange(idx, 'role', e.target.value)} disabled={estado !== 'ACTIVO'} /></td>
                              <td>{c.principal ? <span className="badge bg-success">Sí</span> : <span className="text-muted">No</span>}</td>
                              <td>
                                {(() => {
                                  const nameOk = ((c.name && c.name.trim()) || !(c.email||c.phone||c.role))
                                  const emailVal = (c.email || '').trim()
                                  const emailHas = !!emailVal
                                  const emailOkFmt = !emailHas || emailRegex.test(emailVal)
                                  const emailDupInside = emailHas && contacts.some((o, j) => j !== idx && o.email && o.email.trim().toLowerCase() === emailVal.toLowerCase())
                                  const emailDupGlobal = emailHas && otherContactEmails.has(emailVal.toLowerCase())
                                  const emailOk = !emailHas || (emailOkFmt && !emailDupInside && !emailDupGlobal)
                                  const phoneVal = (c.phone || '').trim()
                                  const phoneHas = !!phoneVal
                                  const phoneOkFmt = !phoneHas || phoneRegex.test(phoneVal)
                                  const phoneNorm = normalizarPhone(phoneVal)
                                  const phoneDupInside = phoneHas && contacts.some((o, j) => j !== idx && o.phone && normalizarPhone(o.phone) === phoneNorm)
                                  const phoneDupGlobal = phoneHas && otherContactPhones.has(phoneNorm)
                                  const phoneOk = !phoneHas || (phoneOkFmt && !phoneDupInside && !phoneDupGlobal)
                                  const rowValid = !!nameOk && !!emailOk && !!phoneOk
                                  return (
                                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => saveContact(idx)} disabled={savingContactId === (c.id || `new-${idx}`) || estado !== 'ACTIVO' || !rowValid}>
                                      {savingContactId === (c.id || `new-${idx}`) ? 'Guardando…' : (c.id ? 'Guardar' : 'Crear')}
                                    </button>
                                  )
                                })()}
                                {c.id && !c.principal && (
                                  <button className="btn btn-sm btn-outline-success me-2" onClick={() => setContactAsPrincipal(c.id)} disabled={savingContactId === c.id || estado !== 'ACTIVO'}>
                                    {savingContactId === c.id ? 'Marcando…' : 'Hacer principal'}
                                  </button>
                                )}
                                {c.id && (
                                  <button className="btn btn-sm btn-outline-danger" onClick={() => deleteContact(c.id)} disabled={savingContactId === c.id || estado !== 'ACTIVO'}>
                                    {savingContactId === c.id ? 'Eliminando…' : 'Eliminar'}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="mt-4">
                    <button type="submit" form="providerForm" className="btn btn-primary" disabled={saving || estado !== 'ACTIVO' || !formValido}>
                      {saving ? 'Guardando…' : 'Guardar cambios'}
                    </button>
                  </div>
                  {estado !== 'ACTIVO' && (
                    <div className="alert alert-warning mt-3">Este proveedor está inactivo; no se puede editar ni gestionar contactos o logo.</div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  )
}