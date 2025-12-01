import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { isValidRut } from '../lib/rut'
import AdminHeader from '../components/AdminHeader'
import AdminSidebar from '../components/AdminSidebar'
import AdminOffcanvas from '../components/AdminOffcanvas'
import Footer from '../components/Footer'

export default function AdminUserCreate() {
  const tipoParam = (() => {
    try { return new URLSearchParams(window.location.search).get('tipo') } catch { return null }
  })()
  const [nombres, setNombres] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [rut, setRut] = useState('')
  const [dv, setDv] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [direccion, setDireccion] = useState('')
  const [comunas, setComunas] = useState([])
  const [comunaId, setComunaId] = useState('')
  const [regiones, setRegiones] = useState([])
  const [regionId, setRegionId] = useState('')
  const [telefono, setTelefono] = useState('')

  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [createdUser, setCreatedUser] = useState(null)
  const [existingUsers, setExistingUsers] = useState([])
  const [usersLoadError, setUsersLoadError] = useState('')
  const [checkingRut, setCheckingRut] = useState(false)
  const [remoteRutTaken, setRemoteRutTaken] = useState(false)

  // Validaciones en tiempo real
  const emailValido = useMemo(() => {
    if (!correo.trim()) return false
    const re = /^[A-Za-z0-9._%+-]+@(gmail\.com|duocuc\.cl)$/
    return re.test(correo.trim())
  }, [correo])

  const emailTomado = useMemo(() => {
    if (!correo || !existingUsers?.length) return false
    const target = correo.trim().toLowerCase()
    return existingUsers.some(u => (u.correo || '').toLowerCase() === target)
  }, [correo, existingUsers])
  const rutTomado = useMemo(() => {
    if (!rut || !existingUsers?.length) return false
    const target = rut.trim()
    return existingUsers.some(u => (u.rut || '').trim() === target)
  }, [rut, existingUsers])

  const rutValido = useMemo(() => {
    if (!rut.trim()) return false
    const re = /^\d{8,}$/
    return re.test(rut.trim())
  }, [rut])

  const dvValido = useMemo(() => {
    if (!dv.trim()) return false
    const re = /^[0-9Kk]$/
    return re.test(dv.trim()) && dv.trim().length === 1
  }, [dv])
  const rutDvMatch = useMemo(() => {
    return isValidRut(rut, dv)
  }, [rut, dv])

  const direccionValida = useMemo(() => direccion.trim().length > 0, [direccion])
  const telefonoValido = useMemo(() => {
    const t = (telefono || '').trim()
    if (!t) return true
    const re = /^[\d\s()+-]{7,15}$/
    return re.test(t)
  }, [telefono])
  const nombresValidos = useMemo(() => nombres.trim().length > 0, [nombres])
  const apellidosValidos = useMemo(() => apellidos.trim().length > 0, [apellidos])
  const contrasenaValida = useMemo(() => contrasena.trim().length > 0, [contrasena])
  const comunaValida = useMemo(() => Boolean(comunaId), [comunaId])
  const formValido = nombresValidos && apellidosValidos && rutValido && dvValido && rutDvMatch && !rutTomado && !remoteRutTaken && emailValido && !emailTomado && contrasenaValida && direccionValida && comunaValida

  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        const [comunasData, regionesData] = await Promise.all([
          api.get('/api/comunas'),
          api.get('/api/regiones')
        ])
        if (!ignore) {
          setComunas(Array.isArray(comunasData) ? comunasData : [])
          setRegiones(Array.isArray(regionesData) ? regionesData : [])
        }
      } catch (err) {
        console.warn('No se pudo cargar comunas', err)
      }
    }
    load()
    return () => { ignore = true }
  }, [])


  // Cargar usuarios existentes para validar correo único (sólo ADMIN)
  useEffect(() => {
    let ignore = false
    const loadUsers = async () => {
      try {
        setUsersLoadError('')
        let data = []
        try {
          data = await api.get('/api/usuarios')
        } catch (err) {
          if (err.status === 401 || err.status === 403) {
            data = []
          } else {
            throw err
          }
        }
        if (!ignore) setExistingUsers(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!ignore) setUsersLoadError('No se pudo precargar usuarios para validar correo único (se omitirá la verificación).')
        console.warn('No se pudo cargar usuarios para validación de correo único', err)
      }
    }
    loadUsers()
    return () => { ignore = true }
  }, [])

  useEffect(() => {
    let mounted = true
    let timer
    setRemoteRutTaken(false)
    if (!rutValido) { setCheckingRut(false); return () => { if (timer) clearTimeout(timer) } }
    timer = setTimeout(async () => {
      try {
        if (!mounted) return
        setCheckingRut(true)
        const q = `/api/usuarios/check?rut=${encodeURIComponent(rut.trim())}`
        const res = await api.get(q)
        if (!mounted) return
        setRemoteRutTaken(Boolean(res && res.taken))
      } catch (err) {
        setRemoteRutTaken(false)
      } finally {
        if (mounted) setCheckingRut(false)
      }
    }, 450)
    return () => { mounted = false; if (timer) clearTimeout(timer) }
  }, [rut, rutValido])

  const validate = () => {
    if (!nombresValidos) return 'Nombres es requerido'
    if (!apellidosValidos) return 'Apellidos es requerido'
    if (!rutValido) return 'RUT debe ser numérico y tener al menos 8 dígitos'
    if (rutTomado || remoteRutTaken) return 'RUT ya registrado'
    if (!dvValido) return 'DV debe tener longitud 1 y ser 0-9 o K'
    if (!rutDvMatch) return 'DV no coincide con el RUT'
    if (!emailValido) return 'Correo solo admite dominios gmail.com o duocuc.cl'
    if (!contrasenaValida) return 'Contraseña es requerida'
    if (!direccionValida) return 'Dirección es requerida'
    if (!comunaValida) return 'Debe seleccionar una comuna'
    if (telefono && !telefonoValido) return 'Teléfono con formato inválido'
    return ''
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    const validation = validate()
    if (validation) { setError(validation); return }
    const token = localStorage.getItem('authToken')
    if (!token) { setError('Acción requiere autenticación. Inicie sesión.'); return }
    try {
      const check = await api.get(`/api/usuarios/check?rut=${encodeURIComponent(rut.trim())}`)
      if (check && check.taken) { setError('RUT ya registrado'); return }
      setCreating(true)
      const payload = {
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        rut: rut.trim(),
        dv: dv.trim(),
        correo: correo.trim(),
        contrasena: contrasena.trim(),
        direccion: direccion.trim(),
        comunaId: Number(comunaId),
        telefono: telefono ? telefono.trim() : undefined,
      }
      const endpoint = tipoParam ? `/api/autenticacion/register?tipo=${encodeURIComponent(tipoParam)}` : '/api/autenticacion/register'
      const created = await api.post(endpoint, payload)
      setCreatedUser(created)
      setMessage(`Usuario creado con ID ${created.id}`)
      // limpiar formulario
    setNombres('')
    setApellidos('')
    setRut('')
    setDv('')
    setCorreo('')
    setContrasena('')
  setDireccion('')
  setComunaId('')
  setRegionId('')
  setTelefono('')
    } catch (err) {
      const detail = (err && err.message) ? String(err.message) : ''
      setError(detail || 'Error creando usuario. Verifique el backend.')
      console.error('Create user error:', err)
    } finally {
      setCreating(false)
    }
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
                <h1 className="h_titulos m-0">Crear usuario</h1>
                <div className="d-flex align-items-center gap-2">
                  <Link to="/admin/users/create/empleado" className="btn btn-outline-secondary">Empleado</Link>
                  <Link to="/admin/users/create/cliente" className="btn btn-outline-secondary">Cliente</Link>
                </div>
              </div>
              <p className="text-muted">Ingrese los datos del usuario y seleccione el tipo.</p>

              {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {message && <div className="alert alert-success" role="alert">{message}</div>}
      {usersLoadError && <div className="alert alert-warning" role="alert">{usersLoadError}</div>}

              {createdUser && (
                <div className="alert alert-info" role="alert">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      Usuario creado: <strong>{createdUser?.correo}</strong> (ID {createdUser?.id})
                    </div>
                    <div>
                      <Link to={`/admin/users/${createdUser?.id}/edit`} className="btn btn-sm btn-outline-primary me-2">Editar</Link>
                      <Link to="/admin/users" className="btn btn-sm btn-outline-secondary">Ver listado</Link>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleCreate}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Nombres</label>
                    <input type="text" className={`form-control ${nombres ? (nombresValidos ? 'is-valid' : 'is-invalid') : ''}`} value={nombres} onChange={(e) => setNombres(e.target.value)} />
                    {!nombresValidos && nombres && <div className="invalid-feedback">Requerido.</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Apellidos</label>
                    <input type="text" className={`form-control ${apellidos ? (apellidosValidos ? 'is-valid' : 'is-invalid') : ''}`} value={apellidos} onChange={(e) => setApellidos(e.target.value)} />
                    {!apellidosValidos && apellidos && <div className="invalid-feedback">Requerido.</div>}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">RUT</label>
                    <input type="text" className={`form-control ${rut ? ((rutValido && !rutTomado && !remoteRutTaken) ? 'is-valid' : 'is-invalid') : ''}`} value={rut} onChange={(e) => setRut(e.target.value)} />
                    {!rutValido && rut && <div className="invalid-feedback">Debe ser numérico y tener al menos 8 dígitos.</div>}
                    {rutValido && (rutTomado || remoteRutTaken) && <div className="invalid-feedback d-block">RUT ya registrado.</div>}
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">DV</label>
                    <input type="text" className={`form-control ${dv ? ((dvValido && rutDvMatch) ? 'is-valid' : 'is-invalid') : ''}`} value={dv} onChange={(e) => setDv(e.target.value)} />
                    {!dvValido && dv && <div className="invalid-feedback">Debe ser 0-9 o K y de longitud 1.</div>}
                    {dvValido && rutValido && dv && !rutDvMatch && <div className="invalid-feedback d-block">DV no coincide con el RUT.</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Correo</label>
                    <input type="email" className={`form-control ${correo ? ((emailValido && !emailTomado) ? 'is-valid' : 'is-invalid') : ''}`} value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="usuario@gmail.com o usuario@duocuc.cl" />
                    {!emailValido && correo && <div className="invalid-feedback">Solo se permiten dominios gmail.com o duocuc.cl.</div>}
                    {emailValido && emailTomado && <div className="invalid-feedback d-block">Correo ya registrado.</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Dirección</label>
                    <input type="text" className={`form-control ${direccion ? (direccionValida ? 'is-valid' : 'is-invalid') : ''}`} value={direccion} onChange={(e) => setDireccion(e.target.value)} />
                    {!direccionValida && direccion && <div className="invalid-feedback">Requerido.</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Teléfono (opcional)</label>
                    <input type="text" className={`form-control ${telefono ? (telefonoValido ? 'is-valid' : 'is-invalid') : ''}`} value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                    {!telefonoValido && telefono && <div className="invalid-feedback">Formato permitido: dígitos, espacios, +, -, ().</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Región</label>
                    <select className="form-select" value={regionId} onChange={(e) => { setRegionId(e.target.value); setComunaId('') }}>
                      <option value="">Seleccione región…</option>
                      {regiones.map(r => (
                        <option key={r.idRegion} value={r.idRegion}>{r.nomRegion}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Comuna</label>
                    <select className="form-select" value={comunaId} onChange={(e) => setComunaId(e.target.value)} disabled={!regionId}>
                      <option value="">Seleccione comuna…</option>
                      {comunas
                        .filter(c => !regionId || (c.region && String(c.region.idRegion) === String(regionId)))
                        .map(c => (
                          <option key={c.idComuna} value={c.idComuna}>{c.nomComuna}</option>
                        ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Contraseña</label>
                    <input type="password" className={`form-control ${contrasena ? (contrasenaValida ? 'is-valid' : 'is-invalid') : ''}`} value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
                    {!contrasenaValida && contrasena && <div className="invalid-feedback">Requerido.</div>}
                  </div>
                  
                </div>

                <div className="mt-3">
                  <button type="submit" className="btn btn-primary" disabled={creating || !formValido}>
                    {creating ? 'Creando…' : 'Crear usuario'}
                  </button>
                  <Link to="/admin/users" className="btn btn-outline-secondary ms-2">Volver al listado</Link>
                </div>
              </form>
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  )
}
