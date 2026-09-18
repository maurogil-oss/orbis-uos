import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Shield, ArrowRight, Activity } from 'lucide-react'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Accountability', href: '/#prestacao-contas' },
    { label: 'Dimensionamento', href: '/#simulador' },
    { label: 'Pilares Públicos', href: '/#beneficios' },
    { label: 'Marco Legal', href: '/#como-funciona' },
    { label: 'Diagnóstico Express', href: '/#diagnostico-express' },
    { label: 'Manifesto de Interesse', href: '/#manifesto' },
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
          ? 'bg-[#0A1128]/90 backdrop-blur-md border-b border-[#1A2A5A]/80 shadow-lg shadow-black/20'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={() => {
            if (location.pathname === '/') {
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          }}
          className="flex items-center gap-3 group focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded-md p-1"
          aria-label="Orbis UOS - Início"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#1A2A5A] flex items-center justify-center border border-[#3B82F6]/40 shadow-sm shadow-[#3B82F6]/30 group-hover:border-[#3B82F6] transition-colors">
            <Shield className="w-5 h-5 text-white stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-[#F8FAFC]">
              Orbis <span className="text-[#3B82F6]">UOS</span>
            </span>
            <span className="text-[10px] tracking-wider uppercase text-[#94A3B8] font-medium -mt-1">
              Urban Operating System
            </span>
          </div>
        </Link>

        {/* Centered Desktop Menu */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Navegação principal">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors relative py-1 focus-visible:text-[#F8FAFC]"
            >
              {link.label}
            </a>
          ))}
          {/* Link Enquadramento Completo 6 Blocos */}
          <Link
            to="/enquadramento"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#60A5FA] hover:bg-[#3B82F6]/20 transition-all"
          >
            Enquadramento Completo
          </Link>
          {/* Discreto link Cockpit demo */}
          <Link
            to="/cockpit"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] text-[#CBD5E1] hover:text-white transition-all shadow-sm"
          >
            <Activity className="w-3.5 h-3.5 text-[#10B981]" />
            Ver Cockpit
          </Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="/#manifesto"
            onClick={(e) => handleLinkClick(e, '/#manifesto')}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] active:scale-[0.98] transition-all duration-150 shadow-md shadow-[#3B82F6]/25 hover:shadow-[#3B82F6]/40 hover:scale-[1.02]"
          >
            Avaliar a sua cidade
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden inline-flex items-center justify-center p-2.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#101B3A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Slide-down Overlay Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-20 bottom-0 bg-[#0A1128]/98 backdrop-blur-xl border-b border-[#1A2A5A] px-6 py-8 flex flex-col justify-between animate-fade-in z-40">
          <nav className="flex flex-col gap-5" aria-label="Navegação mobile">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-xl font-semibold text-[#F8FAFC] hover:text-[#3B82F6] py-3 border-b border-[#1A2A5A]/50 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-6 space-y-3">
            <Link
              to="/cockpit"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full min-h-[46px] flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold text-[#60A5FA] bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] transition-all gap-2"
            >
              <Activity className="w-4 h-4 text-[#10B981]" />
              Acessar Cockpit de Telemetria
            </Link>
            <a
              href="/#manifesto"
              onClick={(e) => handleLinkClick(e, '/#manifesto')}
              className="w-full min-h-[48px] flex items-center justify-center px-6 py-3.5 rounded-lg text-base font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-lg shadow-[#3B82F6]/30 active:scale-95 transition-all"
            >
              Avaliar a sua cidade
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
