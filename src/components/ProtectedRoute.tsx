import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Shield, Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070D1F] flex flex-col items-center justify-center p-4">
        <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] flex flex-col items-center gap-3 text-center max-w-sm">
          <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6]">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex items-center gap-2 text-sm text-[#F8FAFC] font-semibold">
            <Loader2 className="w-4 h-4 animate-spin text-[#3B82F6]" />
            Verificando credenciais institucionais...
          </div>
          <span className="text-xs text-[#94A3B8]">
            Ambiente restrito da administração pública municipal.
          </span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redireciona para /login preservando o caminho de destino
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
