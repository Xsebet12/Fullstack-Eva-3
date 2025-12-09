import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Home(){
  const [showZonas,setShowZonas]=useState(false)
  const [showCondiciones,setShowCondiciones]=useState(false)
  return (
    <main className="container py-5" style={{marginTop:70}}>
      <section className="p-5 mb-4 bg-youka rounded">
        <div className="container">
          <h1 className="text-center mb-3 text-youka">Bienvenido a Youka</h1>
          <h2 className="text-center mb-3 youka-accent">Donde encontrarás los mejores congelados calidad-precio</h2>
          <div className="text-center">
            <Link to="/catalogo" className="btn btn-youka">Ver catálogo</Link>
          </div>
        </div>
      </section>

      <div id="carruselComida" className="carousel slide mb-5" data-bs-ride="carousel">
        <h2 className="mb-3">Los más pedido</h2>
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#carruselComida" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
          <button type="button" data-bs-target="#carruselComida" data-bs-slide-to="1" aria-label="Slide 2"></button>
          <button type="button" data-bs-target="#carruselComida" data-bs-slide-to="2" aria-label="Slide 3"></button>
        </div>
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img src="https://www.foodnewslatam.com/images/stories/2017/03_Marzo/vegetales-mccain-argentina.jpg" className="d-block w-100 img-carousel-uniform" alt="Variedad de verduras congeladas" />
          </div>
          <div className="carousel-item">
            <img src="https://media.biobiochile.cl/wp-content/uploads/2017/09/fondo-smoothie-2-1.jpg" className="d-block w-100 img-carousel-uniform" alt="Frutas rojas congeladas" />
          </div>
          <div className="carousel-item">
            <img src="https://www.winflex.cl/images/envases-flexibles/pescados-y-mariscos/bolsas-pescados-y-mariscos.jpg" className="d-block w-100 img-carousel-uniform" alt="Pescado congelado listo para cocinar" />
          </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#carruselComida" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Anterior</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carruselComida" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Siguiente</span>
        </button>
      </div>

      <section className="mb-5">
        <h2 className="mb-3">Por qué Youka</h2>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card h-100 text-center shadow-sm p-3">
              <div className="display-6">🧊</div>
              <h5 className="mt-2">Cadena de frío asegurada</h5>
              <p>Mantenemos la calidad desde el almacén hasta tu casa.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 text-center shadow-sm p-3">
              <div className="display-6">✅</div>
              <h5 className="mt-2">Productos seleccionados</h5>
              <p>Elegimos proveedores confiables con estándares altos.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 text-center shadow-sm p-3">
              <div className="display-6">💸</div>
              <h5 className="mt-2">Mejor precio-calidad</h5>
              <p>Precios competitivos manteniendo el sabor y la frescura.</p>
            </div>
          </div>
        </div>
      </section>
      <h2 className="mb-4">Pasos para tu Pedido</h2>
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card h-100 text-center shadow-sm p-3">
            <img loading="lazy" src="https://www.lavozdelnorte.cl/wp-content/uploads/2020/07/comercio-online-.jpg" alt="Persona eligiendo productos online en un laptop" className="card-img-top rounded img-uniform" />
            <h5 className="card-title mt-3">1. Elige tus Productos</h5>
            <p className="card-text">Explora nuestro catálogo y añade al carrito todo lo que necesitas.</p>
            <Link to="/catalogo" className="btn btn-youka mt-auto">Ver Catálogo</Link>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 text-center shadow-sm p-3">
            <img loading="lazy" src="https://thumbs.dreamstime.com/b/salm%C3%B3n-y-pescado-en-bruto-con-marisco-congelado-un-fondo-blanco-se-han-dispuesto-de-forma-art%C3%ADstica-diversos-alimentos-frescos-393188346.jpg" alt="Caja de despacho" className="card-img-top rounded img-uniform" />
            <h5 className="card-title mt-3">2. Agenda tu Despacho</h5>
            <p className="card-text">Selecciona la fecha y hora que más te acomode para recibir tu pedido.</p>
            <button type="button" className="btn btn-youka mt-auto" onClick={()=>{ setShowZonas(true); setShowCondiciones(false) }}>Zonas de despacho</button>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 text-center shadow-sm p-3">
            <img loading="lazy" src="https://tse3.mm.bing.net/th/id/OIP.yNa0-wbeUDi57Ok0Df1yAgHaFj?rs=1&pid=ImgDetMain&o=7&rm=3" alt="Mesa con platos" className="card-img-top rounded img-uniform" />
            <h5 className="card-title mt-3">3. Recibe y Disfruta</h5>
            <p className="card-text">Recibe tus productos manteniendo la cadena de frío y disfruta de su calidad.</p>
            <button type="button" className="btn btn-youka mt-auto" onClick={()=>{ setShowCondiciones(true); setShowZonas(false) }}>Condiciones</button>
          </div>
        </div>
      </div>
      {(showZonas||showCondiciones) && (
        <div className="mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              {showZonas && (
                <div>
                  <h5 className="card-title">Zonas de despacho</h5>
                  <p className="card-text">Despachamos en comunas seleccionadas dentro de la Región Metropolitana. Elige tu comuna al registrarte para confirmar cobertura y tiempos de entrega.</p>
                  <ul>
                    <li>Despachos de lunes a sábado</li>
                    <li>Ventanas horarias: mañana y tarde</li>
                    <li>Tarifa según distancia y tamaño del pedido</li>
                  </ul>
                </div>
              )}
              {showCondiciones && (
                <div>
                  <h5 className="card-title">Condiciones</h5>
                  <p className="card-text">Mantenemos cadena de frío asegurada. Los productos se entregan sellados y con guía. Cambios y devoluciones aplican a productos con fallas dentro de 24h.</p>
                  <ul>
                    <li>Medios de pago: tarjeta, transferencia y efectivo contra entrega</li>
                    <li>Cancelaciones hasta 2h antes del despacho</li>
                    <li>Garantía de satisfacción en productos congelados</li>
                  </ul>
                </div>
              )}
              <div className="text-end">
                <button className="btn btn-outline-secondary btn-sm" onClick={()=>{ setShowZonas(false); setShowCondiciones(false) }}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="mb-5">
        <h2 className="mb-3">Destacados</h2>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card h-100 text-center shadow-sm p-3">
              <img loading="lazy" src="https://www.nexofin.com/archivos/2023/02/como-encontrar-el-pescado-congelado-mas-fresco-en-el-supermercado.jpeg_554688468.webp" className="card-img-top rounded img-uniform" alt="Oferta en pescados" />
              <h5 className="mt-3">20% DCTO en Pescados</h5>
              <p>Aprovecha la oferta en salmones y reineta.</p>
              <Link to="/catalogo" className="btn btn-youka mt-auto">Ver catálogo</Link>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 text-center shadow-sm p-3">
              <img loading="lazy" src="https://financialfood.es/wp-content/uploads/2022/05/Buitoni-Creazione-050522.jpg" className="card-img-top rounded img-uniform" alt="Oferta en pizzas" />
              <h5 className="mt-3">3x2 en Pizzas</h5>
              <p>Lleva 3 pizzas y paga solo 2.</p>
              <Link to="/catalogo" className="btn btn-youka mt-auto">Ver catálogo</Link>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 text-center shadow-sm p-3">
              <img loading="lazy" src="https://cdnx.jumpseller.com/cdvfoods/image/9200406/_se-puede-congelar-el-queso-1-1531405967.jpg.jpg?1591809607" className="card-img-top rounded img-uniform" alt="Oferta en mix de verduras" />
              <h5 className="mt-3">Mix de Verduras</h5>
              <p>15% de descuento en todos los mix.</p>
              <Link to="/catalogo" className="btn btn-youka mt-auto">Ver catálogo</Link>
            </div>
          </div>
        </div>
      </section>

      <h2 className="mb-4">Categorías Populares</h2>
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card h-100 text-center shadow-sm p-3">
            <h5 className="card-title">Frutas y Verduras</h5>
            <img loading="lazy" src="https://thumbs.dreamstime.com/b/frutas-y-hortalizas-congeladas-en-contenedores-congelados-una-estanter%C3%ADa-de-congelador-organizada-con-verduras-cuidadosamente-375493880.jpg" alt="Frutas congeladas" className="card-img-top rounded img-uniform" />
            <p className="card-text">La mejor selección de frutas y verduras para tus preparaciones.</p>
            <Link to="/catalogo" className="btn btn-youka mt-auto">Ver Categoría</Link>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 text-center shadow-sm p-3">
            <h5 className="card-title">Carnes y Pescados</h5>
            <img loading="lazy" src="https://thumbs.dreamstime.com/b/diversos-cortes-de-carne-congelados-incluyendo-ternera-pollo-y-pescado-envasados-en-bandejas-dentro-un-caj%C3%B3n-congelador-sobre-399698614.jpg" alt="Cortes de carne" className="card-img-top rounded img-uniform" />
            <p className="card-text">Cortes de carne y pescados seleccionados para garantizar la calidad.</p>
            <Link to="/catalogo" className="btn btn-youka mt-auto">Ver Categoría</Link>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 text-center shadow-sm p-3">
            <h5 className="card-title">Platos Preparados</h5>
            <img loading="lazy" src="https://lasaña.de/wp-content/uploads/2022/02/lasana-congelada-espinacas-y-queso-la-cocinera.jpg" alt="Lasaña congelada" className="card-img-top rounded img-uniform" />
            <p className="card-text">Soluciones deliciosas y rápidas para tus comidas diarias.</p>
            <Link to="/catalogo" className="btn btn-youka mt-auto">Ver Categoría</Link>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link className="btn btn-youka" to="/catalogo">Ver todos los productos</Link>
      </div>
    </main>
  )
}
