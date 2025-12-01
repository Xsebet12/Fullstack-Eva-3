import { Routes, Route, useLocation } from 'react-router-dom'
// Cliente
import Home from './client/pages/Home'
import Navbar from './client/components/Navbar'
import Header from './components/Header'
import Footer from './client/components/Footer'
import Catalog from './client/pages/Catalog'
import ProductDetail from './client/pages/ProductDetail'
import Login from './client/pages/Login'
import Register from './client/pages/Register'
import Cart from './client/pages/Cart'
import About from './client/pages/About'
import Contact from './client/pages/Contact'
import Stores from './client/pages/Stores'
import Blog from './client/pages/Blog'
import Policies from './client/pages/Policies'
import ProtectedRoute from './client/components/ProtectedRoute'
import Account from './client/pages/Account'
import EditProfile from './client/pages/EditProfile'
import Preferences from './client/pages/Preferences'
import ForgotPassword from './client/pages/ForgotPassword'
import ClientChangePassword from './client/pages/ChangePassword'
import MisOrdenes from './client/pages/MisOrdenes'
import AdminLogin from './pages/AdminLogin'
import AdminHome from './pages/AdminHome'
import Youka from './pages/Youka'
import Consultoria from './pages/Consultoria'
import GeneracionNegocios from './pages/GeneracionNegocios'
import AdminProducts from './pages/AdminProducts'
import AdminProductEdit from './pages/AdminProductEdit'
import AdminProductCreate from './pages/AdminProductCreate'
import AdminProviderCreate from './pages/AdminProviderCreate'
import AdminProviders from './pages/AdminProviders'
import AdminProviderEdit from './pages/AdminProviderEdit'
import AdminUsers from './pages/AdminUsers'
import AdminUserEdit from './pages/AdminUserEdit'
import AdminUserCreate from './pages/AdminUserCreate'
import AdminEmpleadoCreate from './pages/AdminEmpleadoCreate'
import AdminClienteCreate from './pages/AdminClienteCreate'

export default function App() {
  const location = useLocation()
  const isAdmin = location.pathname === '/' || location.pathname.startsWith('/admin') || location.pathname.startsWith('/youkaADMIN') || location.pathname === '/homeadmin' || location.pathname === '/page'
  return (
    <div className="app-root">
      {isAdmin ? null : <Navbar />}
      <div className="app-content">
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/home" element={<Home />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar" element={<ForgotPassword />} />
        <Route path="/cambiar-contrasena" element={<ProtectedRoute><ClientChangePassword /></ProtectedRoute>} />
        <Route path="/registrarCuenta" element={<Register />} />
        <Route path="/carrito" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/perfil/editar" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/preferencias" element={<ProtectedRoute><Preferences /></ProtectedRoute>} />
        <Route path="/mis-ordenes" element={<ProtectedRoute><MisOrdenes /></ProtectedRoute>} />
        <Route path="/sobre-nosotros" element={<About />} />
        <Route path="/contacto" element={<Contact />} />
        <Route path="/locales" element={<Stores />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/politicas" element={<Policies />} />
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/change-password" element={<AdminChangePassword />} />
        <Route path="/homeadmin" element={<AdminHome />} />
        <Route path="/page" element={<AdminHome />} />
        <Route path="/youkaADMIN/change-password" element={<AdminChangePassword />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/products/new" element={<AdminProductCreate />} />
        <Route path="/admin/providers" element={<AdminProviders />} />
        <Route path="/admin/providers/new" element={<AdminProviderCreate />} />
        <Route path="/admin/providers/:id/edit" element={<AdminProviderEdit />} />
        <Route path="/admin/products/:id/edit" element={<AdminProductEdit />} />
        <Route path="/youka" element={<Youka />} />
        <Route path="/consultoria" element={<Consultoria />} />
        <Route path="/negocios" element={<GeneracionNegocios />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/users/new" element={<AdminEmpleadoCreate />} />
        <Route path="/admin/users/new/empleado" element={<AdminEmpleadoCreate />} />
        <Route path="/admin/users/new/cliente" element={<AdminClienteCreate />} />
        <Route path="/admin/users/create" element={<AdminEmpleadoCreate />} />
        <Route path="/admin/users/create/empleado" element={<AdminEmpleadoCreate />} />
        <Route path="/admin/users/create/cliente" element={<AdminClienteCreate />} />
        <Route path="/admin/users/:id/edit" element={<AdminUserEdit />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
      </Routes>
      </div>
      {isAdmin ? null : <Footer />}
    </div>
  )
}
import AdminChangePassword from './pages/AdminChangePassword'
import AdminOrders from './pages/AdminOrders'
