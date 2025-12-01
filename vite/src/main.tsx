import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
// @ts-ignore
import AuthProvider from './auth/AuthProvider'
import './styles/base.css'
import './styles/brand.css'
import './styles/utilities.css'
import './styles/components.css'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
)
