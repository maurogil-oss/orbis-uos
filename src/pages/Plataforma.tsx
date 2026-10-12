import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Compass,
  ArrowRight,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  Zap,
  HelpCircle,
  Users,
} from 'lucide-react'
import { CityTier } from '@/components/Hero'
import { Onda2Modules } from '@/components/Onda2Modules'
import { Benefits } from '@/components/Benefits'
import { Comparison } from '@/components/Comparison'
import { IntegrationArchitecture } from '@/components/IntegrationArchitecture'
import { Accountability } from '@/components/Accountability'

export default function Plataforma() {
  const [selectedTier, setSelectedTier] = useState<CityTier>('media')

  return (
    <main id="main-content" className="w-full min-h-screen bg-[#070D1F] text-[#F8FAFC]">
      {/* Skip to section anchor accessibility helper */}
      <div className="sr-only">
        <a href="#plataforma-conteudo">Pular para o conteúdo detalhado da plataforma</a>
      </div>

      {/* Hero da Página Institucional /plataforma */}
      <section className="pt-28 pb-16 relative bg-gradient-to-b from-[#0A1128] via-[#0D183A] to-[#070D1F] border-b border-[#1A2A5A]/60">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-[#3B82F6]/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          {/* Breadcrumb / Navegação por intenção */}
          <nav
            aria-label="Trilha de navegação"
            className="flex items-center gap-2 text-xs text-[#94A3B8]"
          >
            <Link to="/" className="hover:text-white transition-colors">
              Início
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#1A2A5A]" />
            <span className="text-[#38BDF8] font-medium">Plataforma & Arquitetura</span>
          </nav>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101B3A] border border-[#3B82F6]/40 text-xs font-semibold text-[#60A5FA]">
              <Layers className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Arquitetura Completa de Governança Viária • Motor ORBIS DSP</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Como Funciona a Plataforma ORBIS.UOS
            </h1>

            <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
              Consulte a arquitetura de integração aberta, a modelagem preditiva em substituição ao
              modelo reativo convencional, a evolução por porte com a Onda 2 (semáforos e meio-fio)
              e os pilares de accountability perante Cortes de Contas e a sociedade.
            </p>
          </div>

          {/* Seletor rápido de âncoras na página + CTAs por intenção */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <a
              href="#beneficios"
              className="px-3 py-2 rounded-lg bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] text-xs font-semibold text-[#CBD5E1] hover:text-white transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>4 Pilares de Benefícios</span>
            </a>
            <a
              href="#comparativo"
              className="px-3 py-2 rounded-lg bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] text-xs font-semibold text-[#CBD5E1] hover:text-white transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Comparativo de Modelos</span>
            </a>
            <a
              href="#arquitetura"
              className="px-3 py-2 rounded-lg bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] text-xs font-semibold text-[#CBD5E1] hover:text-white transition-all flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-[#60A5FA]" />
              <span>Arquitetura de Integração</span>
            </a>
            <a
              href="#onda-2"
              className="px-3 py-2 rounded-lg bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] text-xs font-semibold text-[#CBD5E1] hover:text-white transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Módulos Onda 2 (Porte)</span>
            </a>
            <a
              href="#accountability"
              className="px-3 py-2 rounded-lg bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] text-xs font-semibold text-[#CBD5E1] hover:text-white transition-all flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Accountability</span>
            </a>

            <div className="ml-auto hidden sm:flex items-center gap-2">
              <Link
                to="/faq"
                className="px-3 py-2 rounded-lg bg-[#101B3A]/80 border border-[#1A2A5A] hover:border-[#3B82F6] text-xs font-semibold text-[#38BDF8] transition-all flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Ver FAQ Institucional</span>
              </Link>
              <Link
                to="/acessibilidade"
                className="px-3 py-2 rounded-lg bg-[#101B3A]/80 border border-[#1A2A5A] hover:border-[#10B981] text-xs font-semibold text-[#10B981] transition-all flex items-center gap-1.5"
                title="Declaração de Acessibilidade (e-MAG + WCAG 2.2 AA) integrada ao dossiê"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Acessibilidade (e-MAG/AA)</span>
              </Link>
              <Link
                to="/#manifesto"
                className="px-3.5 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-xs font-bold text-white transition-all shadow-md shadow-[#3B82F6]/30 flex items-center gap-1.5"
              >
                <span>Solicitar Piloto CPSI</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo Detalhado Integrado */}
      <div id="plataforma-conteudo" className="w-full space-y-0">
        {/* Bloco 1: 4 Pilares do Motor ORBIS DSP */}
        <div id="beneficios">
          <Benefits />
        </div>

        {/* Bloco 2: Comparativo: Modelo Convencional vs ORBIS.UOS */}
        <div id="comparativo">
          <Comparison />
        </div>

        {/* Bloco 3: Arquitetura de Integração Aberta */}
        <div id="arquitetura">
          <IntegrationArchitecture selectedTier={selectedTier} />
        </div>

        {/* Bloco 4: Onda 2 por Porte (Green Light Bridge e Meio-fio & Vagas) */}
        <div id="onda-2">
          <Onda2Modules selectedTier={selectedTier} onSelectTier={setSelectedTier} />
        </div>

        {/* Bloco 5: Accountability & Para Quem Prestamos Contas */}
        <div id="accountability">
          <Accountability />
        </div>
      </div>

      {/* Faixa Inferior de Conversão Direcionada */}
      <section className="py-16 bg-[#0A1128] border-t border-[#1A2A5A]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-r from-[#101B3A] via-[#16254F] to-[#101B3A] border border-[#3B82F6]/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-mono uppercase tracking-wider text-[#10B981] font-semibold">
                Validação Técnica e Jurídica em Campo
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Pronto para testar a telemetria na frota da sua cidade?
              </h3>
              <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl">
                Formalize a adesão ao piloto pelo Marco Legal CPSI (LC 182/2021) sem necessidade de
                compra de hardware ou nova dotação orçamentária.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link
                to="/#simulador"
                className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold text-[#CBD5E1] hover:text-white bg-[#0A1128] border border-[#1A2A5A] hover:border-[#3B82F6] transition-all flex items-center justify-center gap-2"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Simular Frota</span>
              </Link>

              <Link
                to="/#manifesto"
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-lg shadow-[#3B82F6]/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Submeter Manifesto CPSI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
