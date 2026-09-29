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
  Terminal,
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
  const [mobileSolucoesOpen, setMobileSolucoesOpen] = useState(false)
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
    setMobileSolucoesOpen(false)
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

  // Links reunidos no menu institucional "Soluções" (incluindo Calibração Fator K)
  const baseInstitutionalLinks = [
    {
      label: 'Calibração Fator K',
      desc: 'Ajuste fino de sensores e telemetria veicular',
      href: '/cockpit/calibracao-fator-k',
      icon: SlidersHorizontal,
      badge: 'Algoritmo',
      highlight: true,
    },
    {
      label: 'Governança & Evidências',
      desc: 'Infraestrutura, contingência, segurança e auditoria',
      href: '/governanca',
      icon: Shield,
      badge: '6 Peças',
    },
    {
      label: 'Painel de Status & Uptime',
      desc: 'Monitoramento ativo 24/7, latência e evidência de SLA',
      href: '/status',
      icon: Activity,
      badge: '99,9% SLA',
    },
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
      label: 'Sandbox Playground',
      desc: 'Ambiente público de teste e k-anonimato H3',
      href: '/sandbox',
      icon: Terminal,
      badge: 'Playground',
    },
    {
      label: 'Enquadramento CPSI',
      desc: 'Memorial, nota técnica e minuta Art. 320',
      href: '/enquadramento',
      icon: FileText,
      badge: 'LC 182/2021',
    },
  ]

  // Homologação Dry-Run é rota operacional — apenas para usuários autenticados
  const institutionalMoreLinks = isAuthenticated
    ? [
        ...baseInstitutionalLinks.slice(0, 5),
        {
          label: 'Homologação Dry-Run',
          desc: 'Laudo oficial B2G e critérios de auditoria',
          href: '/homologacao',
          icon: CheckCircle2,
          badge: 'Laudo Oficial',
        },
        ...baseInstitutionalLinks.slice(5),
      ]
    : baseInstitutionalLinks

  const governanceAnchors = [
    { label: 'Accountability & Gestão', href: '/#prestacao-contas' },
    { label: 'Pilares de Governança', href: '/#beneficios' },
    { label: 'Marco Legal CPSI', href: '/#como-funciona' },
    { label: 'Diagnóstico Express', href: '/#diagnostico-express' },
    { label: 'Perguntas Frequentes (FAQ)', href: '/#faq' },
    { label: 'Fale Conosco (Geral)', href: '/#contato' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-[#0A1128]/95 backdrop-blur-md border-b border-[#1A2A5A]/80 shadow-md shadow-black/25'
          : 'bg-[#0A1128]/85 backdrop-blur-sm border-b border-[#1A2A5A]/50'
      }`}
    >
      <div className="relative w-full px-3 sm:px-5 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Coluna 1: Logomarca Oficial do ORBIS UOS (alinhada à esquerda no fluxo normal) */}
        <div className="flex items-center justify-start shrink-0 z-10">
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
        </div>

        {/* Coluna 2: Menu de Navegação Central (Soluções, Simulador, Cockpit, Ver Demonstração)
            CENTRALIZADO no eixo horizontal da tela (largura total do viewport),
            usando posicionamento absoluto independente das larguras das colunas laterais.
        */}
        <nav
          className="hidden md:flex items-center justify-center gap-1 lg:gap-1.5 xl:gap-2 shrink-0 absolute left-1/2 -translate-x-1/2 pointer-events-auto z-20"
          aria-label="Navegação principal"
        >
          {/* 1. Soluções (Dropdown com Calibração Fator K + Instrumentos B2G) */}
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`text-xs font-semibold px-2 lg:px-2.5 py-1.5 rounded-md transition-all flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] shrink-0 ${
                  dropdownOpen
                    ? 'bg-[#101B3A] text-white border border-[#3B82F6]/50'
                    : 'text-[#CBD5E1] hover:text-white hover:bg-[#101B3A]/60 border border-transparent'
                }`}
                aria-label="Menu de Soluções e recursos institucionais"
              >
                <span>Soluções</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180 text-[#3B82F6]' : 'text-[#94A3B8]'
                  }`}
                />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="center"
              sideOffset={10}
              className="w-80 p-2 bg-[#0A1128]/98 backdrop-blur-xl border border-[#1A2A5A] rounded-xl shadow-2xl text-[#F8FAFC] z-50 animate-in fade-in-0 zoom-in-95 max-h-[calc(100vh-5rem)] overflow-y-auto"
            >
              <DropdownMenuLabel className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#94A3B8] flex items-center justify-between">
                <span>Soluções & Instrumentos B2G</span>
                <span className="text-xs text-[#3B82F6] font-semibold">ORBIS.UOS</span>
              </DropdownMenuLabel>

              <div className="space-y-0.5">
                {institutionalMoreLinks.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href
                  const isFatorK = item.href === '/cockpit/calibracao-fator-k'
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
                          isActive
                            ? 'bg-[#101B3A] text-white'
                            : isFatorK
                              ? 'bg-[#38BDF8]/10 border border-[#38BDF8]/20'
                              : ''
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-md border shrink-0 mt-0.5 ${
                            isFatorK
                              ? 'bg-[#38BDF8]/20 border-[#38BDF8]/40 text-[#38BDF8]'
                              : 'bg-[#101B3A] border-[#1A2A5A] text-[#60A5FA]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`text-xs font-semibold truncate ${
                                isFatorK ? 'text-[#38BDF8]' : 'text-[#F8FAFC]'
                              }`}
                            >
                              {item.label}
                            </span>
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded border shrink-0 font-medium ${
                                isFatorK
                                  ? 'text-[#38BDF8] bg-[#38BDF8]/15 border-[#38BDF8]/30 font-semibold'
                                  : 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/25'
                              }`}
                            >
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-xs text-[#94A3B8] leading-snug line-clamp-1">
                            {item.desc}
                          </p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
              </div>

              <DropdownMenuSeparator className="my-1.5 bg-[#1A2A5A]" />

              <DropdownMenuLabel className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
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
              <div className="px-2 py-1 flex items-center justify-between text-xs">
                <Link
                  to="/cidadao"
                  onClick={() => setDropdownOpen(false)}
                  className="text-[#10B981] hover:underline flex items-center gap-1 font-semibold"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Portal Cidadão</span>
                </Link>
                <Link
                  to="/termos"
                  onClick={() => setDropdownOpen(false)}
                  className="text-[#94A3B8] hover:text-[#38BDF8] transition-colors font-medium"
                >
                  Termos B2G
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 2. Simulador */}
          <a
            href="/#simulador"
            onClick={(e) => handleLinkClick(e, '/#simulador')}
            className="text-xs font-semibold text-[#CBD5E1] hover:text-white px-2 lg:px-2.5 py-1.5 rounded-md hover:bg-[#101B3A]/60 transition-colors shrink-0"
          >
            Simulador
          </a>

          {/* 3. Cockpit */}
          <Link
            to="/cockpit"
            className={`text-xs font-semibold px-2 lg:px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 shrink-0 ${
              location.pathname === '/cockpit'
                ? 'text-white bg-[#101B3A] border border-[#1A2A5A]'
                : 'text-[#CBD5E1] hover:text-white hover:bg-[#101B3A]/60'
            }`}
            title="Cockpit Municipal de Gestão Viária"
          >
            <Activity className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Cockpit</span>
          </Link>

          {/* 4. Ver Demonstração */}
          <Link
            to="/demo"
            className={`text-xs font-bold px-2 lg:px-2.5 xl:px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm shrink-0 ${
              location.pathname === '/demo'
                ? 'bg-[#3B82F6] text-white shadow-[#3B82F6]/30 ring-1 ring-[#60A5FA]'
                : 'bg-[#3B82F6]/15 hover:bg-[#3B82F6]/25 border border-[#3B82F6]/40 text-[#60A5FA] hover:text-white shadow-[#3B82F6]/20'
            }`}
            title="Tour Autoguiado B2G — Modo Demonstração Orientada"
          >
            <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="whitespace-nowrap">Ver Demonstração</span>
          </Link>
        </nav>

        {/* Coluna 3: Grupo de Ações Alinhado à Direita no fluxo normal
            Itens: 5. Acesso -> 6. Solicitar Piloto (CTA) -> 7. Fale Conosco
            Mobile: botão Hamburger
        */}
        <div className="flex items-center justify-end gap-1.5 lg:gap-2.5 shrink-0 z-10">
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-2 xl:gap-2.5 shrink-0">
            {/* 5. Acesso (rótulo curto "Acesso", mesmo quando autenticado, conforme solicitado) */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  to="/cockpit"
                  title={`Painel Institucional — ${user?.name || 'Acesso'}`}
                  className="inline-flex items-center gap-1 px-2 lg:px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#CBD5E1] hover:text-white bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] transition-all shrink-0"
                >
                  <Lock className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Acesso</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  title="Sair do painel institucional"
                  className="p-1.5 rounded-lg text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors border border-transparent hover:border-[#EF4444]/30"
                  aria-label="Sair"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1 px-2 lg:px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#CBD5E1] hover:text-white bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] transition-all shrink-0"
                title="Acesso Institucional com credenciais"
              >
                <Lock className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>Acesso</span>
              </Link>
            )}

            {/* 6. Solicitar Piloto (Estilizado como BOTÃO DESTACADO / CTA Primário) */}
            <a
              href="/#manifesto"
              onClick={(e) => handleLinkClick(e, '/#manifesto')}
              className="inline-flex items-center justify-center px-2.5 lg:px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] active:scale-[0.98] transition-all shadow-md shadow-[#3B82F6]/30 hover:shadow-[#3B82F6]/50 whitespace-nowrap border border-[#60A5FA]/40 shrink-0"
              title="Solicitar Piloto Institucional — Manifesto CPSI (LC 182/2021)"
            >
              <Rocket className="w-3.5 h-3.5 mr-1 lg:mr-1.5 text-white/90 shrink-0" />
              <span>Solicitar Piloto</span>
              <ArrowRight className="w-3 h-3 ml-1 text-white/70 shrink-0" />
            </a>

            {/* 7. Fale Conosco (Item de menu ao lado do botão) */}
            <a
              href="/#contato"
              onClick={(e) => handleLinkClick(e, '/#contato')}
              className="text-xs font-semibold text-[#CBD5E1] hover:text-white px-2 lg:px-2.5 py-1.5 rounded-md hover:bg-[#101B3A]/60 transition-colors whitespace-nowrap shrink-0"
              title="Fale Conosco — Contato Geral, Dúvidas e Imprensa"
            >
              Fale Conosco
            </a>
          </div>

          {/* Mobile Hamburger Toggle (exibido apenas em telas menores que md) */}
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
      </div>

      {/* Mobile Slide-down Overlay Menu Completo e Organizado */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-14 bottom-0 bg-[#0A1128]/98 backdrop-blur-xl border-b border-[#1A2A5A] px-4 py-4 flex flex-col justify-between overflow-y-auto animate-fade-in z-40">
          <div className="space-y-4">
            {/* Header Mobile */}
            <div className="pb-3 border-b border-[#1A2A5A] flex items-center justify-between">
              <OrbisLogo height={28} colorMode="dark" variant="full" />
              <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded bg-[#101B3A] text-[#94A3B8] border border-[#1A2A5A]">
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
                  <div className="text-xs text-[#93C5FD] font-normal">
                    Tour B2G em 6 etapas interativas
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white" />
            </Link>

            {/* Seção 1: Menu Mobile na mesma hierarquia do cabeçalho */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] px-2 block">
                Menu de Navegação
              </span>

              {/* 1. Soluções com Dropdown / Acordeão expansível no mobile */}
              <div className="rounded-xl border border-[#1A2A5A] bg-[#101B3A]/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setMobileSolucoesOpen(!mobileSolucoesOpen)}
                  className="w-full flex items-center justify-between p-3 text-xs font-bold text-white hover:bg-[#101B3A] transition-colors"
                  aria-expanded={mobileSolucoesOpen}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#3B82F6]" />
                    <span>Soluções (inclui Fator K)</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#94A3B8] transition-transform duration-200 ${
                      mobileSolucoesOpen ? 'rotate-180 text-[#3B82F6]' : ''
                    }`}
                  />
                </button>

                {mobileSolucoesOpen && (
                  <div className="p-2 border-t border-[#1A2A5A] bg-[#0A1128]/70 space-y-1 animate-in fade-in-0 duration-150">
                    {institutionalMoreLinks.map((item) => {
                      const Icon = item.icon
                      const isFatorK = item.href === '/cockpit/calibracao-fator-k'
                      const isActive = location.pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center justify-between text-xs font-medium p-2 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-[#101B3A] text-white'
                              : isFatorK
                                ? 'bg-[#38BDF8]/10 text-[#38BDF8] hover:bg-[#38BDF8]/20 border border-[#38BDF8]/30'
                                : 'text-[#CBD5E1] hover:text-white hover:bg-[#101B3A]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isFatorK ? 'text-[#38BDF8]' : 'text-[#60A5FA]'
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded border shrink-0 font-medium ${
                              isFatorK
                                ? 'text-[#38BDF8] bg-[#38BDF8]/15 border-[#38BDF8]/30 font-semibold'
                                : 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/25'
                            }`}
                          >
                            {item.badge}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* 2. Simulador e 3. Cockpit em grid */}
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
              </div>

              {/* Links adicionais Cidadão & Enquadramento */}
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/cidadao"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[#101B3A]/60 border border-[#1A2A5A] text-xs font-medium text-[#10B981] hover:border-[#10B981] transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Portal Cidadão</span>
                </Link>
                <Link
                  to="/enquadramento"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[#101B3A]/60 border border-[#1A2A5A] text-xs font-medium text-[#60A5FA] hover:border-[#3B82F6] transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Enquadramento</span>
                </Link>
              </div>
            </div>

            {/* Seção 3: Seções da Landing Page */}
            <div className="space-y-1 pt-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] px-2 block">
                Página Inicial & Transparência
              </span>
              <div className="flex flex-wrap gap-1.5 px-2">
                {governanceAnchors.map((anc) => (
                  <a
                    key={anc.href}
                    href={anc.href}
                    onClick={(e) => handleLinkClick(e, anc.href)}
                    className="text-xs text-[#94A3B8] hover:text-white py-1 px-2.5 rounded bg-[#101B3A]/60 border border-[#1A2A5A] transition-colors"
                  >
                    {anc.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Rodapé do Menu Mobile: Login, Solicitar Piloto, Fale Conosco e Logout */}
          <div className="pt-4 mt-4 space-y-2.5 border-t border-[#1A2A5A]/80 shrink-0">
            {/* CTA Principal de Conversão B2G: Solicitar Piloto */}
            <a
              href="/#manifesto"
              onClick={(e) => handleLinkClick(e, '/#manifesto')}
              className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-md shadow-[#3B82F6]/30 active:scale-95 transition-all gap-1.5"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Solicitar Piloto — Manifesto CPSI</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </a>

            {/* Acesso Canal Geral: Fale Conosco */}
            <a
              href="/#contato"
              onClick={(e) => handleLinkClick(e, '/#contato')}
              className="w-full flex items-center justify-center px-4 py-2 rounded-lg text-xs font-semibold text-[#CBD5E1] hover:text-white bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] transition-all gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#60A5FA]" />
              <span>Fale Conosco (Dúvidas & Contato Geral)</span>
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
