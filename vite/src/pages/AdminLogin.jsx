import Header from '../components/Header'
import LoginForm from '../components/LoginForm'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import useAuth from '../auth/useAuth'

export default function AdminLogin() {
  const auth = useAuth()
  const navigate = useNavigate()
  return (
    <main id="main" className="container-fluid p-0">
      <Header />
      <main id="main-adm">
        {/* Reemplazar LoginForm sin props por versión con onAuthenticated */}
        <LoginForm onAuthenticated={async (user) => {
          const checkAdmin = (u) => {
            if (!u) return false
            const values = []
            if (typeof u.rol === 'string') values.push(u.rol)
            if (Array.isArray(u.authorities)) values.push(...u.authorities.map(a => typeof a === 'string' ? a : String(a?.authority ?? a)))
            const normalized = values.map(v => v.trim().toUpperCase())
            return normalized.some(v => v.includes('ADMIN'))
          }
          let u = user || auth.user
          if (!checkAdmin(u) && !(u && u.isAdmin === true)) {
            try { u = await api.get('/api/usuarios/me') } catch {}
          }
          if (checkAdmin(u) || (u && u.isAdmin === true)) {
            navigate('/admin')
          } else {
            alert('Esta cuenta no tiene rol ADMIN')
          }
        }} />
      </main>
      <Footer />
    </main>
  )
}
