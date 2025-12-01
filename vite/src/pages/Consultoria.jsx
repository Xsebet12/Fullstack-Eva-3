import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Consultoria() {
  return (
    <main className="container-fluid p-0">
      <Header />

      {/* Hero Consultoría (JCA2) */}
      <section className="bg-jca2-dark py-5">
        <div className="container text-center">
          <h1 className="display-6 fw-bold">Consultoría Industrial</h1>
          <div className="mt-2">
            <span className="badge jca2-gradient text-dark">JCA2</span>
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
                  Nuestra consultoría industrial se posiciona como el socio estratégico para empresas que buscan una transformación profunda y sostenible.
                  Más allá de la asesoría tradicional, nos enfocamos en una gestión integral que abarca desde la conceptualización de ideas hasta la
                  optimización de las operaciones existentes. Nuestro objetivo es impulsar el crecimiento y la competitividad a través de la eficiencia,
                  la innovación y una sólida toma de decisiones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pilares */}
      <section className="container my-4">
        <h2 className="h4 mb-3">Pilares de nuestro servicio</h2>
        <div className="row g-4">
          <div className="col-12 col-md-6">
            <div className="card h-100">
              <div className="card-header jca2-gradient text-white fw-bold">Diseño y Rediseño de Procesos</div>
              <div className="card-body">
                <p>
                  Analizamos la cadena de valor de una empresa para identificar cuellos de botella y redundancias. Diseñamos o rediseñamos procesos más
                  fluidos, ágiles y alineados con los objetivos de la organización, asegurando que cada etapa agregue valor.
                </p>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="card h-100">
              <div className="card-header jca2-gradient text-white fw-bold">Digitalización de Procesos</div>
              <div className="card-body">
                <p>
                  Guiamos la transición hacia entornos tecnológicos: selección e implementación de software, automatización de tareas repetitivas e
                  integración de tecnologías que mejoren la eficiencia, reduzcan errores y brinden datos en tiempo real para la toma de decisiones.
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="card h-100">
              <div className="card-header jca2-gradient text-white fw-bold">Mejora Continua y Eficiencia Operacional</div>
              <div className="card-body">
                <p>
                  Implementamos metodologías como Lean Manufacturing y Kaizen para fomentar una cultura de optimización constante. Eliminación de desperdicios,
                  estandarización de procedimientos y aumento de la productividad para mejorar la eficiencia y reducir costos.
                </p>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="card h-100">
              <div className="card-header jca2-gradient text-white fw-bold">Desarrollo de Nuevos Negocios</div>
              <div className="card-body">
                <p>
                  Identificamos oportunidades de mercado y creamos nuevas líneas de negocio. Generación de ideas, estudio de negocios (análisis de mercado,
                  viabilidad y modelo), y diseño de estrategia de entrada para un lanzamiento exitoso.
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="card h-100">
              <div className="card-header jca2-gradient text-white fw-bold">Gestión Integral de Proyectos</div>
              <div className="card-body">
                <p>
                  Bajo marcos como PMBOK y metodologías ágiles, aseguramos ejecución profesional de iniciativas (rediseño de procesos o nuevos negocios),
                  cumpliendo presupuesto, plazos y estándares de calidad.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container my-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="alert alert-primary">
              En esencia, nuestra consultoría no solo ofrece soluciones, sino que construye la base para que nuestros clientes sean más competitivos y rentables a largo plazo, transformando el potencial en resultados tangibles.
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}