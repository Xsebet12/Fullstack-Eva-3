import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../lib/api'
import AdminHeader from '../components/AdminHeader'
import AdminSidebar from '../components/AdminSidebar'
import AdminOffcanvas from '../components/AdminOffcanvas'
import Footer from '../components/Footer'

export default function AdminUserEdit() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // Campos
  const [nombres, setNombres] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [rut, setRut] = useState('')
  const [dv, setDv] = useState('')
  const [correo, setCorreo] = useState('')
  const [direccion, setDireccion] = useState('')
  const [telefono, setTelefono] = useState('')
  const [rol, setRol] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [comunas, setComunas] = useState([])
  const [comunaId, setComunaId] = useState('')
  const [regiones, setRegiones] = useState([])
  const [regionId, setRegionId] = useState('')
  const [existingUsers, setExistingUsers] = useState([])
  const [tipoCliente, setTipoCliente] = useState('')
  const [puntosFidelizacion, setPuntosFidelizacion] = useState('')
  const [recibirPromos, setRecibirPromos] = useState(false)
  const [direccionEntrega, setDireccionEntrega] = useState('')
  const [preferenciasComunicacion, setPreferenciasComunicacion] = useState('')
  const [limiteCredito, setLimiteCredito] = useState('')
  const [frecuenciaCompra, setFrecuenciaCompra] = useState('')
  const [departamento, setDepartamento] = useState('')
  const [sueldo, setSueldo] = useState('')
  const [fechaContratacion, setFechaContratacion] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [fechaSalida, setFechaSalida] = useState('')
  const [genero, setGenero] = useState('')
  const [nacionalidad, setNacionalidad] = useState('')
  const [numeroCuentaBancaria, setNumeroCuentaBancaria] = useState('')
  const [tipoContrato, setTipoContrato] = useState('')
  const [banco, setBanco] = useState('')
  const [celular, setCelular] = useState('')
  const [cuentaActiva, setCuentaActiva] = useState(true)

  // Validaciones en tiempo real (mismas reglas que crear)
  const emailValido = useMemo(() => {
    if (!correo.trim()) return false
    const re = /^[A-Za-z0-9._%+-]+@(gmail\.com|duocuc\.cl)$/
    return re.test(correo.trim())
  }, [correo])

  const emailTomado = useMemo(() => {
    if (!correo || !existingUsers?.length) return false
    const target = correo.trim().toLowerCase()
    return existingUsers.some(u => String(u.id) !== String(id) && (u.correo || '').toLowerCase() === target)
  }, [correo, existingUsers, id])

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

  const direccionValida = useMemo(() => direccion.trim().length > 0, [direccion])
  const telefonoValido = useMemo(() => {
    const t = (telefono || '').trim()
    if (!t) return true
    const re = /^[\d\s()+-]{7,15}$/
    return re.test(t)
  }, [telefono])
  const nombresValidos = useMemo(() => nombres.trim().length > 0, [nombres])
  const apellidosValidos = useMemo(() => apellidos.trim().length > 0, [apellidos])
  const comunaValida = useMemo(() => Boolean(comunaId), [comunaId])
  const regionValida = useMemo(() => Boolean(regionId), [regionId])
  const celularTomado = useMemo(() => {
    const target = (celular || '').trim()
    if (!target) return false
    return existingUsers.some(u => String(u.id) !== String(id) && (u.celular || '').trim() === target)
  }, [celular, existingUsers, id])
  const formValido = nombresValidos && apellidosValidos && rutValido && dvValido && emailValido && !emailTomado && direccionValida && regionValida && comunaValida

  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const token = localStorage.getItem('authToken')
        if (!token) {
          setError('Acción requiere autenticación ADMIN. Inicie sesión.')
          return
        }
        const [data, comunasData, regionesData] = await Promise.all([
          api.get(`/api/usuarios/${id}`),
          api.get('/api/comunas').catch(() => []),
          api.get('/api/regiones').catch(() => []),
        ])
        if (!ignore) {
          setUser(data)
          setNombres(data?.nombres ?? '')
          setApellidos(data?.apellidos ?? '')
          setRut(data?.rut ?? '')
          setDv(data?.dv ?? '')
          setCorreo(data?.correo ?? '')
          setDireccion(data?.direccion ?? '')
          setTelefono(data?.telefono ?? '')
          setRol(data?.rol ?? '')
          setEnabled(Boolean(data?.enabled))
          setComunas(Array.isArray(comunasData) ? comunasData : [])
          setRegiones(Array.isArray(regionesData) ? regionesData : [])
          setRegionId(data?.regionId ? String(data.regionId) : '')
          setComunaId(data?.comunaId ? String(data.comunaId) : '')
          setTipoCliente(data?.tipoCliente ?? '')
          setPuntosFidelizacion(data?.puntosFidelizacion ?? '')
          setRecibirPromos(Boolean(data?.recibirPromos))
          setDireccionEntrega(data?.direccionEntrega ?? '')
          setPreferenciasComunicacion(data?.preferenciasComunicacion ?? '')
          setLimiteCredito(data?.limiteCredito ?? '')
          setFrecuenciaCompra(data?.frecuenciaCompra ?? '')
          setDepartamento(data?.departamento ?? '')
          setSueldo(data?.sueldo ?? '')
          setFechaContratacion(data?.fechaContratacion ?? '')
          setFechaNacimiento(data?.fechaNacimiento ?? '')
          setFechaSalida(data?.fechaSalida ?? '')
          setGenero(data?.genero ?? '')
          setNacionalidad(data?.nacionalidad ?? '')
          setNumeroCuentaBancaria(data?.numeroCuentaBancaria ?? '')
          setTipoContrato(data?.tipoContrato ?? '')
          setBanco(data?.banco ?? '')
          setCelular(data?.celular ?? '')
          setCuentaActiva(Boolean(data?.cuentaActiva ?? true))
        }
      } catch (err) {
        if (!ignore) setError('No se pudo cargar el usuario.')
        console.error('Error cargando usuario:', err)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [id])

  // Cargar usuarios existentes para validar correo único (excluyendo el actual)
  useEffect(() => {
    let ignore = false
    const loadUsers = async () => {
      try {
        let data = []
        try {
          data = await api.get('/api/usuarios?all=true')
        } catch (err) {
          if (err.status === 401 || err.status === 403) {
            data = await api.get('/api/usuarios').catch(() => [])
          } else {
            throw err
          }
        }
        if (!ignore) setExistingUsers(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!ignore) setExistingUsers([])
        console.warn('No se pudo cargar usuarios para validación de correo único', err)
      }
    }
    loadUsers()
    return () => { ignore = true }
  }, [])

  const handleSave = async () => {
    setError('')
    setSaveMessage('')
    const token = localStorage.getItem('authToken')
    if (!token) { setError('Acción requiere autenticación. Inicie sesión.'); return }
  if (!regionValida) { setError('Debe seleccionar una región'); return }
  if (!comunaValida) { setError('Debe seleccionar una comuna'); return }
  if (!nombresValidos) { setError('Nombres es requerido'); return }
  if (!apellidosValidos) { setError('Apellidos es requerido'); return }
  if (!rutValido) { setError('RUT debe ser numérico y tener al menos 8 dígitos'); return }
  if (!dvValido) { setError('DV debe tener longitud 1 y ser 0-9 o K'); return }
  if (!emailValido) { setError('Correo solo admite dominios gmail.com o duocuc.cl'); return }
  if (!telefonoValido) { setError('Teléfono con formato inválido'); return }
  if (celular && celularTomado) { setError('Número ya registrado'); return }
  if (!direccionValida) { setError('Dirección es requerida'); return }
    try {
      setSaving(true)
      const payload = {
        nombres,
        apellidos,
        rut,
        dv,
        correo,
        direccion,
        telefono: telefono || null,
        ...(isEmpleado ? { rol } : {}),
        enabled,
        comunaId: Number(comunaId),
        tipoCliente: tipoCliente || null,
        puntosFidelizacion: puntosFidelizacion === '' ? null : Number(puntosFidelizacion),
        recibirPromos,
        direccionEntrega: direccionEntrega || null,
        preferenciasComunicacion: preferenciasComunicacion || null,
        limiteCredito: limiteCredito === '' ? null : Number(limiteCredito),
        frecuenciaCompra: frecuenciaCompra === '' ? null : Number(frecuenciaCompra),
        departamento: departamento || null,
        sueldo: sueldo === '' ? null : Number(sueldo),
        fechaContratacion: fechaContratacion || null,
        fechaNacimiento: fechaNacimiento || null,
        fechaSalida: fechaSalida || null,
        genero: genero || null,
        nacionalidad: nacionalidad || null,
        numeroCuentaBancaria: numeroCuentaBancaria || null,
        tipoContrato: tipoContrato || null,
        banco: banco || null,
        celular: celular || null,
        cuentaActiva: cuentaActiva,
      }
      const updated = await api.put(`/api/usuarios/${id}`, payload)
      setUser(updated)
      setNombres(updated?.nombres ?? '')
      setApellidos(updated?.apellidos ?? '')
      setRut(updated?.rut ?? '')
      setDv(updated?.dv ?? '')
      setCorreo(updated?.correo ?? '')
      setDireccion(updated?.direccion ?? '')
      setTelefono(updated?.telefono ?? '')
      setRol(updated?.rol ?? '')
      setEnabled(Boolean(updated?.enabled))
      setRegionId(updated?.regionId ? String(updated.regionId) : '')
      setComunaId(updated?.comunaId ? String(updated.comunaId) : '')
      setTipoCliente(updated?.tipoCliente ?? '')
      setPuntosFidelizacion(updated?.puntosFidelizacion ?? '')
      setRecibirPromos(Boolean(updated?.recibirPromos))
      setDireccionEntrega(updated?.direccionEntrega ?? '')
      setPreferenciasComunicacion(updated?.preferenciasComunicacion ?? '')
      setLimiteCredito(updated?.limiteCredito ?? '')
      setFrecuenciaCompra(updated?.frecuenciaCompra ?? '')
      setDepartamento(updated?.departamento ?? '')
      setSueldo(updated?.sueldo ?? '')
      setFechaContratacion(updated?.fechaContratacion ?? '')
      setFechaNacimiento(updated?.fechaNacimiento ?? '')
      setFechaSalida(updated?.fechaSalida ?? '')
      setGenero(updated?.genero ?? '')
      setNacionalidad(updated?.nacionalidad ?? '')
      setNumeroCuentaBancaria(updated?.numeroCuentaBancaria ?? '')
      setTipoContrato(updated?.tipoContrato ?? '')
      setBanco(updated?.banco ?? '')
      setCelular(updated?.celular ?? '')
      setCuentaActiva(Boolean(updated?.cuentaActiva ?? true))
      setSaveMessage('Cambios guardados.')
    } catch (err) {
      setError('Error guardando usuario. Verifique el backend.')
      console.error('Save user error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDisable = async () => {
    const ok = window.confirm(`¿Eliminar (deshabilitar) usuario ${id}?`)
    if (!ok) return
    setError('')
    const token = localStorage.getItem('authToken')
    if (!token) { setError('Acción requiere autenticación. Inicie sesión.'); return }
    try {
      const res = await api.fetch(`/api/usuarios/${id}`, { method: 'DELETE' })
      if (res.status === 204) {
        setEnabled(false)
        setSaveMessage('Usuario deshabilitado.')
      } else if (!res.ok) {
        const msg = await res.text().catch(() => '')
        setError(`No se pudo deshabilitar (HTTP ${res.status}) ${msg || ''}`)
      }
    } catch (err) {
      setError('Error deshabilitando usuario.')
      console.error('Disable user error:', err)
    }
  }

  const isEmpleado = Boolean(user?.rol)
  const isCliente = !isEmpleado
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
                <h1 className="h_titulos m-0">Editar usuario #{id}</h1>
                <Link to="/admin/users" className="btn btn-outline-secondary">Volver</Link>
              </div>

              {error && <div className="alert alert-danger" role="alert">{error}</div>}

              {loading ? (
                <div className="d-flex align-items-center">
                  <div className="spinner-border text-secondary me-2" role="status" aria-hidden="true"></div>
                  <span>Cargando usuario…</span>
                </div>
              ) : !user ? (
                <div className="alert alert-warning">Usuario no encontrado</div>
              ) : (
                <div className="card">
                  <div className="card-body">
                    {!enabled && (
                      <div className="alert alert-warning" role="alert">
                        Este usuario está deshabilitado. No se puede editar.
                      </div>
                    )}
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Nombres</label>
                        <input type="text" className={`form-control ${nombres ? (nombresValidos ? 'is-valid' : 'is-invalid') : ''}`} value={nombres} onChange={(e) => setNombres(e.target.value)} disabled={!enabled || saving} />
                        {!nombresValidos && nombres && <div className="invalid-feedback">Requerido.</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Apellidos</label>
                        <input type="text" className={`form-control ${apellidos ? (apellidosValidos ? 'is-valid' : 'is-invalid') : ''}`} value={apellidos} onChange={(e) => setApellidos(e.target.value)} disabled={!enabled || saving} />
                        {!apellidosValidos && apellidos && <div className="invalid-feedback">Requerido.</div>}
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">RUT</label>
                        <input type="text" className={`form-control ${rut ? (rutValido ? 'is-valid' : 'is-invalid') : ''}`} value={rut} onChange={(e) => setRut(e.target.value)} disabled={!enabled || saving} />
                        {!rutValido && rut && <div className="invalid-feedback">Debe ser numérico y tener al menos 8 dígitos.</div>}
                      </div>
                      <div className="col-md-2">
                        <label className="form-label">DV</label>
                        <input type="text" className={`form-control ${dv ? (dvValido ? 'is-valid' : 'is-invalid') : ''}`} value={dv} onChange={(e) => setDv(e.target.value)} disabled={!enabled || saving} />
                        {!dvValido && dv && <div className="invalid-feedback">Debe ser 0-9 o K y de longitud 1.</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Correo</label>
                        <input type="email" className={`form-control ${correo ? ((emailValido && !emailTomado) ? 'is-valid' : 'is-invalid') : ''}`} value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="usuario@gmail.com o usuario@duocuc.cl" disabled={!enabled || saving} />
                        {!emailValido && correo && <div className="invalid-feedback">Solo se permiten dominios gmail.com o duocuc.cl.</div>}
                        {emailValido && emailTomado && <div className="invalid-feedback d-block">Correo ya registrado.</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Dirección</label>
                        <input type="text" className={`form-control ${direccion ? (direccionValida ? 'is-valid' : 'is-invalid') : ''}`} value={direccion} onChange={(e) => setDireccion(e.target.value)} disabled={!enabled || saving} />
                        {!direccionValida && direccion && <div className="invalid-feedback">Requerido.</div>}
                      </div>
                      {isCliente && (
                        <div className="col-md-6">
                          <label className="form-label">Teléfono</label>
                          <input type="text" className={`form-control ${telefono ? (telefonoValido ? 'is-valid' : 'is-invalid') : ''}`} value={telefono} onChange={(e) => setTelefono(e.target.value)} disabled={!enabled || saving} />
                          {!telefonoValido && telefono && <div className="invalid-feedback">Formato permitido: dígitos, espacios, +, -, ().</div>}
                        </div>
                      )}
                      <div className="col-md-6">
                        <label className="form-label">Región</label>
                        <select className="form-select" value={regionId} onChange={(e) => { setRegionId(e.target.value); setComunaId('') }} disabled={!enabled || saving}>
                          <option value="">Seleccione región…</option>
                          {regiones.map(r => (
                            <option key={r.idRegion} value={r.idRegion}>{r.nomRegion}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Comuna</label>
                        <select className="form-select" value={comunaId} onChange={(e) => setComunaId(e.target.value)} disabled={!enabled || saving || !regionId}>
                          <option value="">Seleccione comuna…</option>
                          {comunas
                            .filter(c => !regionId || (c.region && String(c.region.idRegion) === String(regionId)))
                            .map(c => (
                              <option key={c.idComuna} value={c.idComuna}>{c.nomComuna}</option>
                            ))}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Tipo Usuario</label>
                        <input type="text" className="form-control" value={isEmpleado ? 'EMPLEADO' : 'CLIENTE'} disabled />
                      </div>
                      {isEmpleado && (
                        <div className="col-md-4">
                          <label className="form-label">Rol</label>
                          <select className="form-select" value={rol} onChange={(e) => setRol(e.target.value)} disabled={!enabled || saving}>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </div>
                      )}
                      <div className="col-md-4 d-flex align-items-center">
                        <div className="form-check mt-4">
                          <input className="form-check-input" type="checkbox" id="enabledCheck" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} disabled={!enabled || saving} />
                          <label className="form-check-label" htmlFor="enabledCheck">Habilitado</label>
                        </div>
                      </div>
                    </div>
                    {isCliente && (<div className="row g-3 mt-2">
                      <div className="col-md-4">
                        <label className="form-label">Tipo de Cliente</label>
                        <select className="form-select" value={tipoCliente} onChange={(e) => setTipoCliente(e.target.value)} disabled={!enabled || saving}>
                          <option value="">-</option>
                          <option value="DETALLE">DETALLE</option>
                          <option value="VIP">VIP</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Puntos de Fidelización</label>
                        <input type="number" className="form-control" value={puntosFidelizacion} onChange={(e) => setPuntosFidelizacion(e.target.value)} disabled={!enabled || saving} />
                      </div>
                      <div className="col-md-4 d-flex align-items-center">
                        <div className="form-check mt-4">
                          <input className="form-check-input" type="checkbox" id="recibirPromosCheck" checked={recibirPromos} onChange={(e) => setRecibirPromos(e.target.checked)} disabled={!enabled || saving} />
                          <label className="form-check-label" htmlFor="recibirPromosCheck">Recibir promociones</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Dirección de Entrega</label>
                        <input type="text" className="form-control" value={direccionEntrega} onChange={(e) => setDireccionEntrega(e.target.value)} disabled={!enabled || saving} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Preferencias de Comunicación</label>
                        <input type="text" className="form-control" value={preferenciasComunicacion} onChange={(e) => setPreferenciasComunicacion(e.target.value)} disabled={!enabled || saving} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Límite de Crédito</label>
                        <input type="number" step="0.01" className="form-control" value={limiteCredito} onChange={(e) => setLimiteCredito(e.target.value)} disabled={!enabled || saving} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Frecuencia de Compra</label>
                        <input type="number" className="form-control" value={frecuenciaCompra} onChange={(e) => setFrecuenciaCompra(e.target.value)} disabled={!enabled || saving} />
                      </div>
                    </div>)}
                    {isEmpleado && (<div className="row g-3 mt-2">
                      <div className="col-md-6">
                        <label className="form-label">Departamento</label>
                        <input type="text" className="form-control" value={departamento} onChange={(e) => setDepartamento(e.target.value)} disabled={!enabled || saving} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Sueldo</label>
                        <input type="number" step="0.01" className="form-control" value={sueldo} onChange={(e) => setSueldo(e.target.value)} disabled={!enabled || saving} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Fecha de contratación</label>
                        <input type="date" className="form-control" value={fechaContratacion} onChange={(e) => setFechaContratacion(e.target.value)} disabled={!enabled || saving} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Fecha de nacimiento</label>
                        <input type="date" className="form-control" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} disabled={!enabled || saving} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Fecha de salida</label>
                        <input type="date" className="form-control" value={fechaSalida} onChange={(e) => setFechaSalida(e.target.value)} disabled={!enabled || saving} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Género</label>
                        <input type="text" className="form-control" value={genero} onChange={(e) => setGenero(e.target.value)} disabled={!enabled || saving} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Nacionalidad</label>
                        <input type="text" className="form-control" value={nacionalidad} onChange={(e) => setNacionalidad(e.target.value)} disabled={!enabled || saving} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Número de cuenta bancaria</label>
                        <input type="text" className="form-control" value={numeroCuentaBancaria} onChange={(e) => setNumeroCuentaBancaria(e.target.value)} disabled={!enabled || saving} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Tipo de contrato</label>
                        <input type="text" className="form-control" value={tipoContrato} onChange={(e) => setTipoContrato(e.target.value)} disabled={!enabled || saving} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Banco</label>
                        <input type="text" className="form-control" value={banco} onChange={(e) => setBanco(e.target.value)} disabled={!enabled || saving} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Celular</label>
                        <input type="text" className={`form-control ${celular ? (celularTomado ? 'is-invalid' : 'is-valid') : ''}`} value={celular} onChange={(e) => setCelular(e.target.value)} disabled={!enabled || saving} />
                        {celular && celularTomado && <div className="invalid-feedback d-block">Número ya registrado.</div>}
                      </div>
                      <div className="col-md-4 d-flex align-items-center">
                        <div className="form-check mt-4">
                          <input className="form-check-input" type="checkbox" id="cuentaActivaCheck" checked={cuentaActiva} onChange={(e) => setCuentaActiva(e.target.checked)} disabled={!enabled || saving} />
                          <label className="form-check-label" htmlFor="cuentaActivaCheck">Cuenta activa</label>
                        </div>
                      </div>
                    </div>)}

                    <div className="d-flex gap-2 mt-3">
                      <button className="btn btn-primary" onClick={handleSave} disabled={!enabled || saving || !formValido}>{saving ? 'Guardando…' : 'Guardar cambios'}</button>
                      <button className="btn btn-outline-danger" onClick={handleDisable} disabled={!enabled}>Eliminar (deshabilitar)</button>
                    </div>

                    {saveMessage && <div className="alert alert-success mt-3" role="alert">{saveMessage}</div>}
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
