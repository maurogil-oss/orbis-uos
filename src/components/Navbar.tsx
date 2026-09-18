import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ArrowRight, Activity, Users, Lock, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { OrbisLogo } from '@/components/OrbisLogo'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Accountability', href: '/#prestacao-contas' },
    { label: 'Dimensionamento', href: '/#simulador' },
    { label: 'Pilares', href: '/#beneficios' },
    { label: 'Marco Legal', href: '/#como-funciona' },
    { label: 'Diagnóstico', href: '/#diagnostico-express' },
    { label: 'Manifesto', href: '/#manifesto' },
  ]

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMobileMenuOpen(false)
    if (href.startsWith('/#')) {
      const anchor = href.substring(2)
      if (location.pathname === '/') {
        e.preventDefault()
        const element = document.getElementById(anchor)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-[#0A1128]/95 backdrop-blur-md border-b border-[#1A2A5A]/80 shadow-md shadow-black/25'
          : 'bg-[#0A1128]/70 backdrop-blur-sm border-b border-[#1A2A5A]/40'
      }`}
    >
      <div className="max-w-[1360px] mx-auto px-3 sm:px-5 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 lg:gap-4">
        {/* Logomarca Oficial do ORBIS UOS (com fundo transparente) */}
        <Link
          to="/"
          onClick={() => {
            if (location.pathname === '/') {
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          }}
          className="flex items-center shrink-0 group focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded-md p-1 transition-transform hover:opacity-95"
          aria-label="Orbis UOS - Início"
        >
          <OrbisLogo height={32} colorMode="dark" variant="full" />
        </Link>

        {/* Compact Desktop Navigation */}
        <nav
          className="hidden xl:flex items-center gap-3 2xl:gap-4 shrink-0"
          aria-label="Navegação principal"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors relative py-1 focus-visible:text-[#F8FAFC]"
            >
              {link.label}
            </a>
          ))}

          <span className="h-3 w-[1px] bg-[#1A2A5A]" aria-hidden="true" />

          {/* Link Portal do Cidadão */}
          <Link
            to="/cidadao"
            className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/20 transition-all flex items-center gap-1.5"
          >
            <Users className="w-3 h-3" />
            <span>Portal Cidadão</span>
          </Link>

          {/* Link Enquadramento */}
          <Link
            to="/enquadramento"
            className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#60A5FA] hover:bg-[#3B82F6]/20 transition-all"
          >
            Enquadramento
          </Link>

          {/* Link Cockpit */}
          <Link
            to="/cockpit"
            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] text-[#CBD5E1] hover:text-white transition-all shadow-sm"
          >
            <Activity className="w-3 h-3 text-[#10B981]" />
            <span>Cockpit</span>
          </Link>
        </nav>

        {/* Nav intermediário para telas menores de desktop (md..xl) */}
        <nav
          className="hidden md:flex xl:hidden items-center gap-2.5 shrink-0"
          aria-label="Navegação compacta"
        >
          <a
            href="/#prestacao-contas"
            onClick={(e) => handleLinkClick(e, '/#prestacao-contas')}
            className="text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors py-1"
          >
            Accountability
          </a>
          <a
            href="/#simulador"
            onClick={(e) => handleLinkClick(e, '/#simulador')}
            className="text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors py-1"
          >
            Dimensionamento
          </a>
          <a
            href="/#diagnostico-express"
            onClick={(e) => handleLinkClick(e, '/#diagnostico-express')}
            className="text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors py-1"
          >
            Diagnóstico
          </a>
          <Link
            to="/cidadao"
            className="text-[11px] font-semibold px-2 py-1 rounded-md bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981]"
          >
            Cidadão
          </Link>
          <Link
            to="/cockpit"
            className="text-[11px] font-semibold px-2 py-1 rounded-md bg-[#101B3A] border border-[#1A2A5A] text-[#CBD5E1]"
          >
            Cockpit
          </Link>
        </nav>

        {/* Desktop CTA & Login / User Status */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[#1A2A5A]">
              <span className="text-xs text-[#CBD5E1] font-medium max-w-[120px] truncate">
                {user?.name}
              </span>
              <button
                type="button"
                onClick={logout}
                title="Sair do painel institucional"
                className="p-1 rounded-md text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#CBD5E1] hover:text-white bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] transition-all"
            >
              <Lock className="w-3 h-3 text-[#3B82F6]" />
              <span>Acesso Institucional</span>
            </Link>
          )}

          <a
            href="/#manifesto"
            onClick={(e) => handleLinkClick(e, '/#manifesto')}
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] active:scale-[0.98] transition-all shadow-sm shadow-[#3B82F6]/25"
          >
            <span>Avaliar cidade</span>
            <ArrowRight className="w-3 h-3 ml-1" />
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#101B3A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Slide-down Overlay Menu Compacto */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-14 bottom-0 bg-[#0A1128]/98 backdrop-blur-xl border-b border-[#1A2A5A] px-5 py-5 flex flex-col justify-between overflow-y-auto animate-fade-in z-40">
          <div className="space-y-4">
            <div className="pb-3 border-b border-[#1A2A5A] flex items-center justify-between">
              <OrbisLogo height={28} colorMode="dark" variant="full" />
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#101B3A] text-[#94A3B8] border border-[#1A2A5A]">
                Navegação
              </span>
            </div>

            <nav className="flex flex-col gap-1" aria-label="Navegação mobile">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="text-sm font-medium text-[#F8FAFC] hover:text-[#3B82F6] py-2 px-2 rounded hover:bg-[#101B3A]/50 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="pt-4 space-y-2 border-t border-[#1A2A5A]/80">
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/cidadao"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center px-3 py-2 rounded-lg text-xs font-semibold text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30 transition-all gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Portal Cidadão</span>
              </Link>
              <Link
                to="/cockpit"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center px-3 py-2 rounded-lg text-xs font-semibold text-[#60A5FA] bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] transition-all gap-1.5"
              >
                <Activity className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Cockpit</span>
              </Link>
            </div>

            <Link
              to="/enquadramento"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-xs font-semibold text-[#94A3B8] hover:text-white bg-[#0A1128] border border-[#1A2A5A] transition-all"
            >
              Enquadramento CPSI (6 Blocos)
            </Link>

            {!isAuthenticated ? (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center px-3 py-2.5 rounded-lg text-xs font-semibold text-[#CBD5E1] bg-[#101B3A] border border-[#1A2A5A] transition-all gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>Acesso Institucional</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  logout()
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-xs font-semibold text-[#EF4444] bg-[#0A1128] border border-[#EF4444]/30 transition-all gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair ({user?.name})</span>
              </button>
            )}

            <a
              href="/#manifesto"
              onClick={(e) => handleLinkClick(e, '/#manifesto')}
              className="w-full flex items-center justify-center px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-md shadow-[#3B82F6]/30 active:scale-95 transition-all"
            >
              <span>Avaliar a sua cidade</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
