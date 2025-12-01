import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './client/components/Navbar'
// @ts-ignore
import Header from './components/Header.jsx'
import Footer from './client/components/Footer'
import ProtectedRoute from './client/components/ProtectedRoute'
import Account from './client/pages/Account'
import EditProfile from './client/pages/EditProfile'
import Preferences from './client/pages/Preferences'
import Home from './client/pages/Home'
import Catalog from './client/pages/Catalog'
// @ts-ignore
import ProductDetail from './client/pages/ProductDetail.tsx'
import Login from './client/pages/Login'
import Register from './client/pages/Register'
import Cart from './client/pages/Cart'
import About from './client/pages/About'
import Contact from './client/pages/Contact'
import Stores from './client/pages/Stores'
import Blog from './client/pages/Blog'
import Policies from './client/pages/Policies'
import ForgotPassword from './client/pages/ForgotPassword'
import ClientChangePassword from './client/pages/ChangePassword'
import AdminHome from './admin/pages/AdminHome'
import AdminLogin from './admin/pages/AdminLogin'
import AdminProducts from './admin/pages/AdminProducts'
// @ts-ignore
import AdminChangePassword from './pages/AdminChangePassword.jsx'
// @ts-ignore
import AdminUsers from './pages/AdminUsers.jsx'
// @ts-ignore
import AdminUserCreate from './pages/AdminUserCreate.jsx'
// @ts-ignore
import AdminUserEdit from './pages/AdminUserEdit.jsx'
// @ts-ignore
import AdminEmpleadoCreate from './pages/AdminEmpleadoCreate.jsx'
// @ts-ignore
import AdminClienteCreate from './pages/AdminClienteCreate.jsx'

export default function App(){
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
        <Route path="/sobre-nosotros" element={<About />} />
        <Route path="/contacto" element={<Contact />} />
        <Route path="/locales" element={<Stores />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/politicas" element={<Policies />} />
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/change-password" element={<AdminChangePassword />} />
        <Route path="/youkaADMIN" element={<AdminHome />} />
        <Route path="/youkaADMIN/login" element={<AdminLogin />} />
        <Route path="/youkaADMIN/change-password" element={<AdminChangePassword />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/users/create" element={<AdminEmpleadoCreate />} />
        <Route path="/admin/users/create/empleado" element={<AdminEmpleadoCreate />} />
        <Route path="/admin/users/create/cliente" element={<AdminClienteCreate />} />
        <Route path="/admin/users/:id/edit" element={<AdminUserEdit />} />
      </Routes>
      </div>
      {isAdmin ? null : <Footer />}
    </div>
  )
}
