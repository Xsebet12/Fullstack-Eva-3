import React from 'react'

const productos = [
  { nombre: 'Pan de Yuca', peso: '300 g', tipo: 'Pan/Snack Congelado', ingredientes: 'Yuca', caracteristicas: 'Gluten-Free (Libre de gluten)' },
  { nombre: 'Gorditas Rellenas de Carne', peso: '500 g', tipo: 'Tortillas Congeladas', ingredientes: 'Maíz, Carne', caracteristicas: 'Rellenas, I.Q.F' },
  { nombre: 'Mini Corn Dogs rellenos de salchicha', peso: '420 g', tipo: 'Corn Dogs Congelados', ingredientes: 'Salchicha', caracteristicas: 'Rellenos, I.Q.F' },
  { nombre: 'Tortillas de Maíz rellenas de Queso', peso: '540 g', tipo: 'Tortillas Congeladas', ingredientes: 'Maíz, Queso', caracteristicas: 'Rellenas, 100% Natural, Sin Aditivos ni Preservantes, Gluten-Free' },
  { nombre: 'Tortilla de Verde con Carne', peso: '540 g', tipo: 'Tortillas Congeladas', ingredientes: 'Verde (Plátano verde), Carne', caracteristicas: 'Rellenas, 100% Natural, Sin Aditivos ni Preservantes, Gluten-Free' },
  { nombre: 'Tortilla de Maduro con Queso', peso: '540 g', tipo: 'Tortillas Congeladas', ingredientes: 'Maduro (Plátano maduro), Queso', caracteristicas: 'Rellenas, 100% Natural, Sin Aditivos ni Preservantes, Queso Fresco, Gluten-Free' },
  { nombre: 'Muchines de Yuca con Queso', peso: '420 g', tipo: 'Muchines Congelados', ingredientes: 'Yuca, Queso', caracteristicas: 'Rellenos, I.Q.F' },
  { nombre: 'Tortilla de Verde con Queso', peso: '540 g', tipo: 'Tortillas Congeladas', ingredientes: 'Verde (Plátano verde), Queso', caracteristicas: 'Rellenas, 100% Natural, Sin Aditivos ni Preservantes, Queso Fresco, Gluten-Free' },
]

export default function About(){
  return (
    <main className="container-fluid p-0" style={{marginTop:70}}>
      <section className="bg-youka py-5">
        <div className="container text-center">
          <img src="/img/Logo.png" alt="Logo YOUKA" className="mb-3" style={{ maxWidth: 160 }} loading="eager" />
          <h1 className="display-6 text-youka fw-bold">YOUKA</h1>
          <div className="youka-ribbon d-inline-block mt-2 px-3 py-1 rounded">Alimentos Congelados con Identidad Local y Sostenible</div>
        </div>
      </section>

      <section className="container my-4">
        <div className="row g-4">
          <div className="col-12 col-md-6">
            <div className="card shadow-sm">
              <div className="card-header bg-youka youka-accent fw-bold">Misión</div>
              <div className="card-body">
                <p>
                  La misión de YOUKA es enriquecer la mesa de las familias chilenas con alimentos congelados deliciosos y de alta calidad,
                  elaborados con ingredientes naturales como la yuca y el plátano verde. Nos comprometemos a ofrecer una línea de productos
                  sin gluten que rescata el sabor auténtico de la tradición, adaptándose al ritmo de vida moderno. Buscamos facilitar la vida
                  de nuestros clientes con soluciones prácticas, seguras y, al mismo tiempo, proteger el medio ambiente utilizando empaques
                  biodegradables y otros.
                </p>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="card shadow-sm">
              <div className="card-header bg-youka youka-accent fw-bold">Visión</div>
              <div className="card-body">
                <p>
                  YOUKA aspira a ser la marca líder en el mercado chileno de alimentos congelados, reconocida por su innovación, calidad y compromiso
                  con la salud y el medio ambiente. Queremos ser la primera opción para quienes buscan opciones alimenticias prácticas y sabrosas, especialmente
                  aquellos con necesidades dietéticas específicas. Nos proyectamos como una empresa que lleva el sabor de lo natural a cada hogar en Chile,
                  expandiendo nuestra línea de productos y consolidando nuestra reputación como una marca confiable y responsable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container my-4">
        <h2 className="h4 mb-3 text-youka">Productos</h2>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Peso</th>
                <th>Tipo</th>
                <th>Ingredientes</th>
                <th>Características</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p, idx) => (
                <tr key={idx}>
                  <td className="fw-semibold">{p.nombre}</td>
                  <td>{p.peso}</td>
                  <td>{p.tipo}</td>
                  <td>{p.ingredientes}</td>
                  <td>{p.caracteristicas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
