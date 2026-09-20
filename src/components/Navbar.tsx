import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Menu,
  X,
  ArrowRight,
  Activity,
  Users,
  Lock,
  LogOut,
  SlidersHorizontal,
  Compass,
  ChevronDown,
  BookOpen,
  Server,
  CheckCircle2,
  Rocket,
  Code2,
  FileText,
  Shield,
  HelpCircle,
  MessageSquare,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { OrbisLogo } from '@/components/OrbisLogo'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fechar menus ao mudar de rota
  useEffect(() => {
    setMobileMenuOpen(false)
    setDropdownOpen(false)
  }, [location.pathname, location.hash])

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMobileMenuOpen(false)
    setDropdownOpen(false)
    if (href.startsWith('/#')) {
      const anchor = href.substring(2)
      if (location.pathname === '/') {
        e.preventDefault()
        const element = document.getElementById(anchor)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
          window.history.pushState(null, '', `/#${anchor}`)
        }
      }
    }
  }

  // Links secundários reunidos no menu institucional "Mais"
  const institutionalMoreLinks = [
    {
      label: 'Metodologia',
      desc: 'Ciência de dados, IRI, FFT e k-anonimato',
      href: '/metodologia',
      icon: BookOpen,
      badge: 'Científico',
    },
    {
      label: 'Pacote Operacional',
      desc: 'Backups, continuidade RTO 1,45s e SLA',
      href: '/operacao',
      icon: Server,
      badge: 'SLA 99,9%',
    },
    {
      label: 'Homologação Dry-Run',
      desc: 'Laudo oficial B2G e critérios de auditoria',
      href: '/homologacao',
      icon: CheckCircle2,
      badge: 'Laudo Oficial',
    },
    {
      label: 'Playbook de Implantação',
      desc: 'Matriz RACI e cronograma de 30 dias',
      href: '/implantacao',
      icon: Rocket,
      badge: '30 Dias',
    },
    {
      label: 'API & Interoperabilidade',
      desc: 'Webhooks, GeoJSON RFC 7946 e CIC',
      href: '/interoperabilidade',
      icon: Code2,
      badge: 'B2G Aberto',
    },
    {
      label: 'Enquadramento CPSI',
      desc: 'Memorial, nota técnica e minuta Art. 320',
      href: '/enquadramento',
      icon: FileText,
      badge: 'LC 182/2021',
    },
  ]

  const governanceAnchors = [
    { label: 'Accountability & Gestão', href: '/#prestacao-contas' },
    { label: 'Pilares de Governança', href: '/#beneficios' },
    { label: 'Marco Legal CPSI', href: '/#como-funciona' },
    { label: 'Diagnóstico Express', href: '/#diagnostico-express' },
    { label: 'Perguntas Frequentes (FAQ)', href: '/#faq' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-[#0A1128]/95 backdrop-blur-md border-b border-[#1A2A5A]/80 shadow-md shadow-black/25'
          : 'bg-[#0A1128]/85 backdrop-blur-sm border-b border-[#1A2A5A]/50'
      }`}
    >
      <div className="max-w-[1360px] mx-auto px-3 sm:px-5 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 lg:gap-4">
        {/* Logomarca Oficial do ORBIS UOS */}
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

        {/* Desktop Navigation Principal (Objetiva, sem transbordar) */}
        <nav
          className="hidden md:flex items-center gap-1.5 lg:gap-2.5 shrink-0"
          aria-label="Navegação principal"
        >
          {/* 1. Item Principal: Simulador de Economicidade */}
          <a
            href="/#simulador"
            onClick={(e) => handleLinkClick(e, '/#simulador')}
            className="text-xs font-semibold text-[#CBD5E1] hover:text-white px-2.5 py-1.5 rounded-md hover:bg-[#101B3A]/60 transition-colors"
          >
            Simulador
          </a>

          {/* 2. Item Principal: Botão Destaque Ver Demonstração */}
          <Link
            to="/demo"
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm ${
              location.pathname === '/demo'
                ? 'bg-[#3B82F6] text-white shadow-[#3B82F6]/30 ring-1 ring-[#60A5FA]'
                : 'bg-[#3B82F6]/15 hover:bg-[#3B82F6]/25 border border-[#3B82F6]/40 text-[#60A5FA] hover:text-white shadow-[#3B82F6]/20'
            }`}
            title="Tour Autoguiado B2G — Modo Demonstração Orientada"
          >
            <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Ver Demonstração</span>
          </Link>

          {/* 3. Dropdown Menu "Mais" (Agrupa links secundários: Metodologia, Pacote Operacional, Homologação, Implantação, Interoperabilidade, Enquadramento) */}
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-md transition-all flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] ${
                  dropdownOpen
                    ? 'bg-[#101B3A] text-white border border-[#3B82F6]/50'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#101B3A]/60 border border-transparent'
                }`}
                aria-label="Menu de recursos institucionais"
              >
                <span>Mais</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180 text-[#3B82F6]' : 'text-[#94A3B8]'
                  }`}
                />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              sideOffset={10}
              className="w-80 p-2 bg-[#0A1128]/98 backdrop-blur-xl border border-[#1A2A5A] rounded-xl shadow-2xl text-[#F8FAFC] z-50 animate-in fade-in-0 zoom-in-95"
            >
              <DropdownMenuLabel className="px-2.5 py-1.5 text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] flex items-center justify-between">
                <span>Dossiês & Instrumentos B2G</span>
                <span className="text-[10px] text-[#3B82F6] font-semibold">LC 182/2021</span>
              </DropdownMenuLabel>

              <div className="space-y-0.5">
                {institutionalMoreLinks.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href
                  return (
                    <DropdownMenuItem
                      key={item.href}
                      asChild
                      className="cursor-pointer focus:bg-[#101B3A] focus:text-white rounded-lg p-2 transition-colors data-[highlighted]:bg-[#101B3A]"
                    >
                      <Link
                        to={item.href}
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-start gap-2.5 w-full ${
                          isActive ? 'bg-[#101B3A] text-white' : ''
                        }`}
                      >
                        <div className="p-1.5 rounded-md bg-[#101B3A] border border-[#1A2A5A] shrink-0 text-[#60A5FA] mt-0.5">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-semibold text-[#F8FAFC] truncate">
                              {item.label}
                            </span>
                            <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.2 rounded border border-[#10B981]/25 shrink-0">
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#94A3B8] leading-snug line-clamp-1">
                            {item.desc}
                          </p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
              </div>

              <DropdownMenuSeparator className="my-1.5 bg-[#1A2A5A]" />

              <DropdownMenuLabel className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-[#94A3B8]">
                Navegação na Página Principal
              </DropdownMenuLabel>

              <div className="grid grid-cols-1 gap-0.5">
                {governanceAnchors.map((anc) => (
                  <DropdownMenuItem
                    key={anc.href}
                    asChild
                    className="cursor-pointer focus:bg-[#101B3A] focus:text-white rounded-md px-2.5 py-1 text-xs text-[#CBD5E1]"
                  >
                    <a
                      href={anc.href}
                      onClick={(e) => handleLinkClick(e, anc.href)}
                      className="block hover:text-white"
                    >
                      {anc.label}
                    </a>
                  </DropdownMenuItem>
                ))}
              </div>

              <DropdownMenuSeparator className="my-1.5 bg-[#1A2A5A]" />

              {/* Acesso rápido Cidadão & Termos */}
              <div className="px-2 py-1 flex items-center justify-between text-[11px]">
                <Link
                  to="/cidadao"
                  onClick={() => setDropdownOpen(false)}
                  className="text-[#10B981] hover:underline flex items-center gap-1 font-semibold"
                >
                  <Users className="w-3 h-3" />
                  <span>Portal Cidadão</span>
                </Link>
                <Link
                  to="/termos"
                  onClick={() => setDropdownOpen(false)}
                  className="text-[#94A3B8] hover:text-[#38BDF8] transition-colors"
                >
                  Termos B2G
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Divisor sutil */}
          <span className="h-4 w-[1px] bg-[#1A2A5A] mx-0.5" aria-hidden="true" />

          {/* Portal Cidadão (visível em telas maiores lg+) */}
          <Link
            to="/cidadao"
            className="hidden xl:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md text-[#10B981] hover:text-[#34D399] hover:bg-[#10B981]/10 transition-colors"
            title="Portal de Transparência do Cidadão"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Portal Cidadão</span>
          </Link>

          {/* Cockpit link */}
          <Link
            to="/cockpit"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md text-[#CBD5E1] hover:text-white hover:bg-[#101B3A] transition-colors"
            title="Cockpit Municipal"
          >
            <Activity className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="hidden lg:inline">Cockpit</span>
          </Link>

          {/* Link Fator K (quando autenticado) */}
          {isAuthenticated && (
            <Link
              to="/cockpit/calibracao-fator-k"
              className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md text-[#38BDF8] hover:text-white transition-colors"
              title="Calibração do Fator K"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span className="hidden xl:inline">Fator K</span>
            </Link>
          )}
        </nav>

        {/* Bloco Desktop CTA & Acesso Institucional / Logout */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[#1A2A5A]">
              <Link
                to="/cockpit"
                title="Ir para o Cockpit Institucional"
                className="text-xs text-[#CBD5E1] hover:text-white font-medium max-w-[120px] truncate"
              >
                {user?.name}
              </Link>
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
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#CBD5E1] hover:text-white bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] transition-all"
              title="Acesso Institucional com credenciais"
            >
              <Lock className="w-3 h-3 text-[#3B82F6]" />
              <span>Acesso</span>
            </Link>
          )}

          {/* CTA Principal: Fale Conosco / Avaliar Cidade */}
          <a
            href="/#manifesto"
            onClick={(e) => handleLinkClick(e, '/#manifesto')}
            className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] active:scale-[0.98] transition-all shadow-sm shadow-[#3B82F6]/25 whitespace-nowrap"
            title="Fale Conosco — Avaliar sua Cidade e Solicitar Piloto"
          >
            <MessageSquare className="w-3 h-3 mr-1.5 text-white/90" />
            <span>Fale Conosco</span>
            <ArrowRight className="w-3 h-3 ml-1 text-white/70" />
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

      {/* Mobile Slide-down Overlay Menu Completo e Organizado */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-14 bottom-0 bg-[#0A1128]/98 backdrop-blur-xl border-b border-[#1A2A5A] px-4 py-4 flex flex-col justify-between overflow-y-auto animate-fade-in z-40">
          <div className="space-y-4">
            {/* Header Mobile */}
            <div className="pb-3 border-b border-[#1A2A5A] flex items-center justify-between">
              <OrbisLogo height={28} colorMode="dark" variant="full" />
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#101B3A] text-[#94A3B8] border border-[#1A2A5A]">
                Navegação B2G
              </span>
            </div>

            {/* Destaque Principal Mobile: Ver Demonstração */}
            <Link
              to="/demo"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#1A2A5A] via-[#1E3A8A] to-[#3B82F6] border border-[#3B82F6]/50 shadow-md shadow-[#3B82F6]/30 transition-all"
            >
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#38BDF8]" />
                <div className="text-left">
                  <div className="font-bold text-white">Ver Demonstração Orientada</div>
                  <div className="text-[10px] text-[#93C5FD] font-normal">
                    Tour B2G em 6 etapas interativas
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white" />
            </Link>

            {/* Seção 1: Itens Principais */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] px-2 block">
                Itens Principais
              </span>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="/#simulador"
                  onClick={(e) => handleLinkClick(e, '/#simulador')}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-[#101B3A] border border-[#1A2A5A] text-xs font-semibold text-white hover:border-[#3B82F6] transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>Simulador</span>
                </a>
                <Link
                  to="/cockpit"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-[#101B3A] border border-[#1A2A5A] text-xs font-semibold text-white hover:border-[#3B82F6] transition-colors"
                >
                  <Activity className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Cockpit</span>
                </Link>
                <Link
                  to="/cidadao"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-[#101B3A] border border-[#1A2A5A] text-xs font-semibold text-[#10B981] hover:border-[#10B981] transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Portal Cidadão</span>
                </Link>
                <Link
                  to="/enquadramento"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-[#101B3A] border border-[#1A2A5A] text-xs font-semibold text-[#60A5FA] hover:border-[#3B82F6] transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Enquadramento</span>
                </Link>
              </div>
            </div>

            {/* Seção 2: Links Institucionais e Técnicos (agrupados do Mais) */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] px-2 block">
                Documentação & Instrumentos B2G
              </span>
              <nav className="flex flex-col gap-1" aria-label="Navegação secundária mobile">
                {institutionalMoreLinks.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between text-xs font-medium text-[#CBD5E1] hover:text-white p-2 rounded-lg hover:bg-[#101B3A] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-3.5 h-3.5 text-[#60A5FA]" />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.2 rounded border border-[#10B981]/25">
                        {item.badge}
                      </span>
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Seção 3: Seções da Landing Page */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] px-2 block">
                Página Inicial & Transparência
              </span>
              <div className="flex flex-wrap gap-1.5 px-2">
                {governanceAnchors.map((anc) => (
                  <a
                    key={anc.href}
                    href={anc.href}
                    onClick={(e) => handleLinkClick(e, anc.href)}
                    className="text-[11px] text-[#94A3B8] hover:text-white py-1 px-2 rounded bg-[#101B3A]/60 border border-[#1A2A5A] transition-colors"
                  >
                    {anc.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Rodapé do Menu Mobile: Login, Fale Conosco e Logout */}
          <div className="pt-4 mt-4 space-y-2.5 border-t border-[#1A2A5A]/80 shrink-0">
            {/* CTA Fale Conosco proeminente */}
            <a
              href="/#manifesto"
              onClick={(e) => handleLinkClick(e, '/#manifesto')}
              className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-md shadow-[#3B82F6]/30 active:scale-95 transition-all gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Fale Conosco — Avaliar a sua cidade</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </a>

            {/* Acesso institucional / Logout */}
            {!isAuthenticated ? (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-xs font-semibold text-[#CBD5E1] bg-[#101B3A] border border-[#1A2A5A] transition-all gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>Acesso Institucional</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/cockpit"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-xs font-semibold text-[#CBD5E1] bg-[#101B3A] border border-[#1A2A5A]"
                >
                  <span>Painel ({user?.name})</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center justify-center px-3 py-2 rounded-lg text-xs font-semibold text-[#EF4444] bg-[#0A1128] border border-[#EF4444]/30"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
