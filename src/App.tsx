/* Main App Component - Handles routing (using react-router-dom), query client and other providers - use this file to add all routes */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ScrollToTop } from './components/ScrollToTop'
import Index from './pages/Index'
import Cockpit from './pages/Cockpit'
import Enquadramento from './pages/Enquadramento'
import Metodologia from './pages/Metodologia'
import Privacidade from './pages/Privacidade'
import Operacao from './pages/Operacao'
import Implantacao from './pages/Implantacao'
import Homologacao from './pages/Homologacao'
import Termos from './pages/Termos'
import Governanca from './pages/Governanca'
import Status from './pages/Status'
import FatorKCalibrationPage from './pages/FatorKCalibrationPage'
import Login from './pages/Login'
import EsqueciSenha from './pages/EsqueciSenha'
import RedefinirSenha from './pages/RedefinirSenha'
import PortalCidadao from './pages/PortalCidadao'
import Interoperabilidade from './pages/Interoperabilidade'
import Sandbox from './pages/Sandbox'
import Demo from './pages/Demo'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'

// ONLY IMPORT AND RENDER WORKING PAGES, NEVER ADD PLACEHOLDER COMPONENTS OR PAGES IN THIS FILE
// AVOID REMOVING ANY CONTEXT PROVIDERS FROM THIS FILE (e.g. TooltipProvider, Toaster, Sonner)

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <TooltipProvider>
        <ScrollToTop />
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            {/* Rotas Públicas */}
            <Route path="/" element={<Index />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/demonstracao" element={<Demo />} />
            <Route path="/metodologia" element={<Metodologia />} />
            <Route path="/operacao" element={<Operacao />} />
            <Route path="/implantacao" element={<Implantacao />} />
            <Route path="/homologacao" element={<Homologacao />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="/termos" element={<Termos />} />
            <Route path="/login" element={<Login />} />
            <Route path="/acesso" element={<Login />} />
            <Route path="/esqueci-senha" element={<EsqueciSenha />} />
            <Route path="/recuperar-senha" element={<EsqueciSenha />} />
            <Route path="/redefinir-senha" element={<RedefinirSenha />} />
            <Route path="/reset-password" element={<RedefinirSenha />} />
            <Route path="/cidadao" element={<PortalCidadao />} />
            <Route path="/portal-cidadao" element={<PortalCidadao />} />
            <Route path="/sandbox" element={<Sandbox />} />
            <Route path="/interoperabilidade" element={<Interoperabilidade />} />
            <Route path="/api" element={<Interoperabilidade />} />
            <Route path="/governanca" element={<Governanca />} />
            <Route path="/status" element={<Status />} />
            <Route path="/disponibilidade" element={<Status />} />

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
