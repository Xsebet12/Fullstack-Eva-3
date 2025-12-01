import React from 'react'

export default function Stores(){
  const stores=[
    {nombre:'Youka Providencia', direccion:'Av. Providencia 1234, Santiago', horario:'Lun-Sab 10:00–19:00'},
    {nombre:'Youka Ñuñoa', direccion:'Av. Irarrázaval 5678, Ñuñoa', horario:'Lun-Sab 10:00–19:00'},
    {nombre:'Youka Maipú', direccion:'Av. Pajaritos 1000, Maipú', horario:'Lun-Dom 10:00–18:00'},
  ]
  return (
    <main className="container py-5" style={{marginTop:70}}>
      <h2 className="mb-4">Locales</h2>
      <div className="row g-3">
        {stores.map((s)=> (
          <div className="col-12 col-md-6 col-lg-4" key={s.nombre}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{s.nombre}</h5>
                <div className="text-muted">{s.direccion}</div>
                <div className="mt-2">{s.horario}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

