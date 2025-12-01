import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getAuthToken } from '../api/client'

export default function ProtectedRoute({ children }: { children: React.ReactElement }){
  const token = getAuthToken()
  const location = useLocation()
  if(!token){
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return children
}

