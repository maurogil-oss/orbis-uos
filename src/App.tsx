/* Main App Component - Handles routing (using react-router-dom), query client and other providers - use this file to add all routes */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Index from './pages/Index'
import Cockpit from './pages/Cockpit'
import Enquadramento from './pages/Enquadramento'
import Metodologia from './pages/Metodologia'
import Privacidade from './pages/Privacidade'
import Operacao from './pages/Operacao'
import Termos from './pages/Termos'
import FatorKCalibrationPage from './pages/FatorKCalibrationPage'
import Login from './pages/Login'
import PortalCidadao from './pages/PortalCidadao'
import Interoperabilidade from './pages/Interoperabilidade'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'

// ONLY IMPORT AND RENDER WORKING PAGES, NEVER ADD PLACEHOLDER COMPONENTS OR PAGES IN THIS FILE
// AVOID REMOVING ANY CONTEXT PROVIDERS FROM THIS FILE (e.g. TooltipProvider, Toaster, Sonner)

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            {/* Rotas Públicas */}
            <Route path="/" element={<Index />} />
            <Route path="/metodologia" element={<Metodologia />} />
            <Route path="/operacao" element={<Operacao />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="/termos" element={<Termos />} />
            <Route path="/login" element={<Login />} />
            <Route path="/acesso" element={<Login />} />
            <Route path="/cidadao" element={<PortalCidadao />} />
            <Route path="/portal-cidadao" element={<PortalCidadao />} />
            <Route path="/interoperabilidade" element={<Interoperabilidade />} />
            <Route path="/api" element={<Interoperabilidade />} />

            {/* Rotas Protegidas Institucionais (Exigem autenticação institucional) */}
            <Route
              path="/cockpit"
              element={
                <ProtectedRoute>
                  <Cockpit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/enquadramento"
              element={
                <ProtectedRoute>
                  <Enquadramento />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cockpit/calibracao-fator-k"
              element={
                <ProtectedRoute>
                  <FatorKCalibrationPage />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
