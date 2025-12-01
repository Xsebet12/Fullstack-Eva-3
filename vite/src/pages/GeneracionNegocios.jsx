import Header from '../components/Header'
import Footer from '../components/Footer'

export default function GeneracionNegocios() {
  return (
    <main className="container-fluid p-0">
      <Header />

      {/* Hero Generación de Negocios (Castell) */}
      <section className="bg-castell py-5">
        <div className="container text-center">
          <h1 className="display-6 fw-bold text-castell-black">Generación de Negocios</h1>
          <div className="mt-2">
            <span className="text-castell-black">A&B El Castell SpA</span>
            <span className="ms-2 brand-pill">by OCILAK</span>
          </div>
        </div>
      </section>

      {/* Introducción */}
      <section className="container my-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="card shadow-sm">
              <div className="card-body">
                <p>
                  Actuamos como un socio operativo que no solo evalúa el potencial de un proyecto, sino que lo gerencia de forma activa desde su concepción,
                  búsqueda de socios inversionistas, hasta su consolidación en el mercado. Nuestro objetivo es tangible: asegurar la rentabilidad y el profit
                  del negocio desde su etapa inicial.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios clave */}
      <section className="container my-4">
        <div className="row g-4">
          <div className="col-12 col-md-6">
            <div className="card h-100">
              <div className="card-header castell-accent fw-bold">Puesta en Marcha Integral</div>
              <div className="card-body">
                <p>
                  Tras el estudio de viabilidad, tomamos las riendas del proyecto para su completa ejecución: diseño de la operación, implementación de procesos,
                  selección de proveedores clave, contratación y capacitación del equipo, y supervisión directa hasta la apertura al público.
                </p>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="card h-100">
              <div className="card-header castell-accent fw-bold">Gerenciamiento Operacional para la Rentabilidad</div>
              <div className="card-body">
                <p>
                  Mantenemos un gerenciamiento activo y estratégico: monitoreo de KPIs, control de costos, optimización de inventarios y ajustes de la estrategia comercial
                  para maximizar ingresos. El foco constante es la eficiencia que se traduce en incremento del profit.
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="card h-100">
              <div className="card-header castell-accent fw-bold">Estudios Continuos para la Expansión</div>
              <div className="card-body">
                <p>
                  Realizamos estudios financieros y técnicos recurrentes para identificar oportunidades de crecimiento y mejora. Analizamos mercado y desempeño para tomar
                  decisiones informadas que aseguren competitividad a largo plazo y viabilidad de futuras expansiones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}