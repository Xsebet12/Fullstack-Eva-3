import React from 'react'

export default function Blog(){
  const posts=[
    {title:'Nuevos productos congelados', date:'2025-10-12', excerpt:'Presentamos nuevas alternativas sin gluten y veganas.'},
    {title:'Tips para conservar alimentos', date:'2025-09-05', excerpt:'Mejores prácticas para mantener sabor y textura.'},
    {title:'Youka y el medio ambiente', date:'2025-07-22', excerpt:'Compromisos y acciones para reducir impacto.'},
  ]
  return (
    <main className="container py-5" style={{marginTop:70}}>
      <h2 className="mb-4">Blog</h2>
      <div className="list-group">
        {posts.map(p=> (
          <a key={p.title} className="list-group-item list-group-item-action">
            <div className="d-flex w-100 justify-content-between">
              <h5 className="mb-1">{p.title}</h5>
              <small className="text-muted">{p.date}</small>
            </div>
            <p className="mb-1">{p.excerpt}</p>
          </a>
        ))}
      </div>
    </main>
  )
}

