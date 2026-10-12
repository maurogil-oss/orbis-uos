import React from 'react'
import { Link } from 'react-router-dom'
import {
  Compass,
  Calculator,
  Mail,
  Smartphone,
  CheckCircle2,
  Car,
  Route,
  Activity,
  FileCheck2,
} from 'lucide-react'
import { PlatformLiveMetrics } from '@/services/liveMetrics'

export type CityTier = 'pequena' | 'media' | 'grande'

interface HeroProps {
  selectedTier: CityTier
  onSelectTier: (tier: CityTier) => void
  liveMetrics: PlatformLiveMetrics | null
}

export function Hero({ selectedTier, onSelectTier, liveMetrics }: HeroProps) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Configuração por porte: foco no que MUDA concretamente na frota recomendada, escopo e indicadores
  const tierConfig = {
    pequena: {
      headlinePrefix: 'Monitore o asfalto da sua cidade com ',
      headlineHighlight: 'telemetria veicular por smartphone',
      description:
        'A frota pública que já roda todo dia (ônibus, viaturas e coleta) afere a qualidade do pavimento em tempo real via celular. Sem comprar veículos dedicados, sem obras de instalação e com respaldo jurídico para o Tribunal de Contas.',
      summaryScope:
        'Foco em tapa-buraco preventivo, microrrevestimento e atendimento rápido às rotas de ônibus e serviços essenciais.',
      recommendedFleet: '6 a 12 veículos',
      recommendedCoverage: '100% da malha urbana em até 30 dias',
      keyIndicator: 'Índice de Rugosidade (IRI) e alertas de buraco',
      liveKmMention: '100% das vias prioritárias',
    },
    media: {
      headlinePrefix: 'Auditoria viária e gestão de tráfego com ',
      headlineHighlight: 'a frota pública que já circula',
      description:
        'Telemetria embarcada em ônibus e viaturas para mapear irregularidades viárias, priorizar ordens de serviço antes das reclamações do 156 e subsidiar a engenharia de tráfego sem aquisição de equipamentos caros.',
      summaryScope:
        'Gestão preventiva de OS, insumos para sincronismo semafórico e auditoria de meio-fio nas vias arteriais.',
      recommendedFleet: '15 a 35 veículos',
      recommendedCoverage: 'Cobertura contínua de até 600 km de malha',
      keyIndicator: 'Índice IMV (pavimento) + quase-acidentes',
      liveKmMention: `${liveMetrics ? liveMetrics.totalKmMonitored.toLocaleString('pt-BR') : '1.482'} km monitorados`,
    },
    grande: {
      headlinePrefix: 'Gêmeo digital e governança de corredores com ',
      headlineHighlight: 'telemetria em grande escala',
      description:
        'Monitoramento contínuo de corredores estruturais, avenidas arteriais e linhas metropolitanas via telemetria inercial, com integração de dados abertos para consórcios públicos e captação de recursos.',
      summaryScope:
        'Corredores de alta demanda, cooperação metropolitana, integração GTFS e indicadores de segurança viária.',
      recommendedFleet: '40 a 80+ veículos',
      recommendedCoverage: 'Auditoria contínua de eixos metropolitanos',
      keyIndicator: 'Gêmeo digital viário e matriz de risco',
      liveKmMention: 'Gêmeo digital contínuo',
    },
  }

  const current = tierConfig[selectedTier]

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center pt-20 sm:pt-24 pb-16 overflow-hidden bg-gradient-to-b from-[#0A1128] via-[#0E1838] to-[#0A1128]">
      {/* Background Subtle Animated Grid */}
      <div className="absolute inset-0 bg-grid-gov opacity-35 pointer-events-none" />

      {/* Radial soft glow behind content */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] bg-[#3B82F6]/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-2/3 right-10 w-[320px] h-[320px] bg-[#10B981]/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* SELETOR DE PORTE DA CIDADE COM LEGENDA EXPLICATIVA DO QUE MUDA */}
          <div className="mb-4 p-1.5 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] shadow-xl flex flex-wrap items-center justify-center gap-1.5 max-w-xl">
            <span className="text-xs text-[#CBD5E1] px-2.5 py-1 font-semibold">
              Porte do município:
            </span>
            <button
              type="button"
              onClick={() => onSelectTier('pequena')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#10B981] ${
                selectedTier === 'pequena'
                  ? 'bg-[#10B981] text-white shadow-md shadow-[#10B981]/30 scale-105'
                  : 'text-[#CBD5E1] hover:text-white hover:bg-[#1A2A5A]'
              }`}
              aria-pressed={selectedTier === 'pequena'}
            >
              <span>Até 50k hab.</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-black/30 font-medium">Pequena</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTier('media')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#3B82F6] ${
                selectedTier === 'media'
                  ? 'bg-[#3B82F6] text-white shadow-md shadow-[#3B82F6]/30 scale-105'
                  : 'text-[#CBD5E1] hover:text-white hover:bg-[#1A2A5A]'
              }`}
              aria-pressed={selectedTier === 'media'}
            >
              <span>50k–300k hab.</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-black/30 font-medium">Média</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTier('grande')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#6366F1] ${
                selectedTier === 'grande'
                  ? 'bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/30 scale-105'
                  : 'text-[#CBD5E1] hover:text-white hover:bg-[#1A2A5A]'
              }`}
              aria-pressed={selectedTier === 'grande'}
            >
              <span>300k+ hab.</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-black/30 font-medium">Grande</span>
            </button>
          </div>

          {/* LEGENDA DINÂMICA: deixa VISÍVEL o que muda com a seleção de porte */}
          <div
            aria-live="polite"
            className="mb-6 px-4 py-2 rounded-xl bg-[#101B3A]/80 border border-[#1A2A5A] text-xs text-[#CBD5E1] max-w-2xl flex flex-wrap items-center justify-center gap-x-4 gap-y-1 shadow-sm"
          >
            <span className="flex items-center gap-1.5 font-medium text-[#F8FAFC]">
              <Car className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>
                Frota recomendada:{' '}
                <strong className="text-[#38BDF8]">{current.recommendedFleet}</strong>
              </span>
            </span>
            <span className="text-[#64748B] hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5 font-medium text-[#F8FAFC]">
              <Route className="w-3.5 h-3.5 text-[#10B981]" />
              <span>
                Escopo: <strong className="text-[#10B981]">{current.recommendedCoverage}</strong>
              </span>
            </span>
            <span className="text-[#64748B] hidden sm:inline">•</span>
            <span className="text-xs text-[#94A3B8] w-full text-center mt-0.5">
              {current.summaryScope}
            </span>
          </div>

          {/* TÍTULO DIRETO & SUBTÍTULO CLARO (MENOS JARGÃO ACIMA DA DOBRA) */}
          <div className="mb-8 space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#F8FAFC] tracking-tight leading-[1.12] text-balance">
              {current.headlinePrefix}
              <span className="bg-gradient-to-r from-[#38BDF8] via-[#60A5FA] to-[#10B981] bg-clip-text text-transparent">
                {current.headlineHighlight}
              </span>
              .
            </h1>
            <p className="text-base sm:text-lg text-[#CBD5E1] leading-relaxed max-w-3xl mx-auto font-normal text-balance">
              {current.description}
            </p>
          </div>

          {/* CTAs POR INTENÇÃO (DIAGNÓSTICO • DIMENSIONAMENTO/SIMULADOR • PILOTO/CONTATO) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto justify-center mb-8">
            {/* Intenção 1: Diagnóstico / Conhecer */}
            <Link
              to="/demo"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] active:scale-[0.98] transition-all shadow-lg shadow-[#3B82F6]/30 min-h-[48px] focus-visible:ring-2 focus-visible:ring-[#60A5FA]"
            >
              <Compass className="w-4 h-4 text-white" />
              <span>Ver demonstração da plataforma</span>
            </Link>

            {/* Intenção 2: Impacto & Dimensionamento */}
            <button
              type="button"
              onClick={() => scrollTo('simulador')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold text-[#F8FAFC] bg-[#101B3A] hover:bg-[#1A2A5A] border border-[#1A2A5A] hover:border-[#38BDF8]/60 transition-all min-h-[48px] focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
            >
              <Calculator className="w-4 h-4 text-[#38BDF8]" />
              <span>Simular frota e economia</span>
            </button>

            {/* Intenção 3: Contato institucional / Solicitar piloto */}
            <button
              type="button"
              onClick={() => scrollTo('manifesto')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold text-[#10B981] hover:text-white bg-[#10B981]/10 hover:bg-[#10B981]/25 border border-[#10B981]/30 hover:border-[#10B981]/60 transition-all min-h-[48px] focus-visible:ring-2 focus-visible:ring-[#10B981]"
            >
              <Mail className="w-4 h-4 text-[#10B981]" />
              <span>Solicitar piloto</span>
            </button>
          </div>

          {/* ATALHO OPERACIONAL DISCRETO */}
          <div className="mb-8 flex items-center justify-center gap-3 text-xs text-[#94A3B8]">
            <Link
              to="/campo"
              className="inline-flex items-center gap-1.5 text-xs text-[#CBD5E1] hover:text-white underline-offset-4 hover:underline"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Acessar Modo Campo no smartphone</span>
            </Link>
            <span className="text-[#1A2A5A]">•</span>
            <button
              type="button"
              onClick={() => scrollTo('prestacao-contas')}
              className="text-xs text-[#CBD5E1] hover:text-white underline-offset-4 hover:underline"
            >
              Prestação de contas institucional
            </button>
          </div>

          {/* MÉTRICAS DE COBERTURA REAL & VIABILIDADE */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl text-left">
            <div className="p-3.5 rounded-xl bg-[#101B3A]/80 border border-[#1A2A5A]">
              <div className="text-xl sm:text-2xl font-black text-[#10B981] font-mono">
                {current.liveKmMention}
              </div>
              <div className="text-xs text-[#CBD5E1] leading-tight mt-1">
                Cobertura viária estimada
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#101B3A]/80 border border-[#1A2A5A]">
              <div className="text-xl sm:text-2xl font-black text-[#38BDF8] font-mono">
                {liveMetrics ? `${liveMetrics.totalEventsDetected}` : '14'}
              </div>
              <div className="text-xs text-[#CBD5E1] leading-tight mt-1">
                Anomalias viárias catalogadas
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#101B3A]/80 border border-[#1A2A5A]">
              <div className="text-xl sm:text-2xl font-black text-[#F8FAFC] font-mono">
                {liveMetrics ? `${liveMetrics.activeSensors}` : '6'}
              </div>
              <div className="text-xs text-[#CBD5E1] leading-tight mt-1">
                Veículos transmitindo telemetria
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#101B3A]/80 border border-[#1A2A5A]">
              <div className="text-xl sm:text-2xl font-black text-[#60A5FA] font-mono">
                Zero CAPEX
              </div>
              <div className="text-xs text-[#CBD5E1] leading-tight mt-1">
                Frota e smartphones existentes
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
