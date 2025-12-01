import React from 'react'

export default function Home(){
  return (
    <main className="container py-5" style={{marginTop:70}}>
      <h1 className="text-center mb-5">Bienvenido a Youka 🧊📦</h1>
      <div className="text-center">
        <a className="btn btn-success" href="/catalogo">Ver catálogo</a>
      </div>
    </main>
  )
}
