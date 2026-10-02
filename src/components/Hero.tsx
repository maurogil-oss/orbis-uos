import React from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Smartphone,
  Cpu,
  BatteryCharging,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Layers,
  MapPin,
  Building,
  TrendingUp,
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

  // Narrativas por porte de cidade - Foco em Gestão Pública, Responsabilidade e Sociedade Atendida
  const tierConfig = {
    pequena: {
      badge: 'MUNICÍPIOS ATÉ 50 MIL HAB. • COOPERAÇÃO & EFICIÊNCIA FISCAL',
      headlinePrefix: 'Cada quilômetro do seu asfalto, ',
      headlineHighlight: 'auditado com precisão científica e prestado em contas à sociedade',
      description:
        'Decisão pública mais rápida, transparente e responsável: o gestor decide com base em evidências e o sistema documenta. A frota que já circula pela cidade afere o pavimento em tempo real, garantindo vias seguras ao pedestre, socorro ágil a serviços essenciais e resposta direta aos anseios da população.',
      honestCoverage: '100% da frota pública aferindo o pavimento em rotinas regulares',
      entryArg: 'Adesão institucional simplificada • Marco Legal CPSI (LC 182/2021)',
      batteryTrust: 'Consumo medido em campo (PoC)',
      pilotDays: 'Diagnóstico preliminar em 30 dias',
    },
    media: {
      badge: 'MUNICÍPIOS DE 50 A 300 MIL HAB. • ONDA 2 (ROADMAP): GREEN LIGHT BRIDGE & MEIO-FIO',
      headlinePrefix: 'Cada quilômetro da malha viária, ',
      headlineHighlight: 'otimizado com Green Light Bridge e auditoria passiva de meio-fio',
      description:
        'Onda 2 (fase de expansão / roadmap): insumos de sincronismo semafórico adaptativo (Green Light Bridge) para engenharia de tráfego e auditoria de estacionamento/faixa amarela pela frota existente (Zero CAPEX). Gestão integrada entre zeladoria, mobilidade e conformidade estrita ao Art. 320 do CTB.',
      honestCoverage: `${liveMetrics ? liveMetrics.totalKmMonitored.toLocaleString('pt-BR') : '1.482'} km monitorados com integridade`,
      entryArg: 'Green Light Bridge + Meio-fio & Vagas • Onda 2 (Expansão)',
      batteryTrust: 'Consumo medido em campo (PoC)',
      pilotDays: 'Piloto institucional em 60 dias',
    },
    grande: {
      badge: 'METRÓPOLES E CONSÓRCIOS INTERMUNICIPAIS • GOVERNANÇA FEDERATIVA ISO',
      headlinePrefix: 'Gestão urbana transparente e baseada em evidências: ',
      headlineHighlight: 'infraestrutura auditada para atender a população com dignidade',
      description:
        'Interoperabilidade para corredores estruturais, integração metropolitana e governança alinhada às normas ISO 37120/37122/37125. Redução de acidentes, menos tempo perdido no trânsito e máxima integridade nas relações com Tribunais de Contas, órgãos de controle e cooperação federativa.',
      honestCoverage: 'Gêmeo digital e auditoria contínua da malha metropolitana',
      entryArg: 'Padrão ISO 37120/37122/37125 • Instrumento de cooperação federativa',
      batteryTrust: 'Consumo medido em campo (PoC)',
      pilotDays: 'Acordo de cooperação em 90 dias',
    },
  }

  const current = tierConfig[selectedTier]

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-20 sm:pt-24 pb-16 overflow-hidden bg-gradient-to-b from-[#0A1128] via-[#0E1838] to-[#0A1128]">
      {/* Background Subtle Animated Grid */}
      <div className="absolute inset-0 bg-grid-gov opacity-40 pointer-events-none" />

      {/* Radial soft glow behind content */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-[#3B82F6]/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-2/3 right-10 w-[350px] h-[350px] bg-[#10B981]/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* BLOCO 1 ANTES DA DOBRA: SELETOR DE PORTE DA CIDADE */}
          <div className="mb-6 p-1.5 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] shadow-xl flex flex-wrap items-center justify-center gap-1.5 max-w-xl">
            <span className="text-xs uppercase text-[#94A3B8] px-2.5 py-1 font-semibold">
              Porte da sua cidade:
            </span>
            <button
              type="button"
              onClick={() => onSelectTier('pequena')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedTier === 'pequena'
                  ? 'bg-[#10B981] text-white shadow-md shadow-[#10B981]/30 scale-105'
                  : 'text-[#CBD5E1] hover:text-white hover:bg-[#1A2A5A]'
              }`}
            >
              <span>Até 50k hab.</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-black/30 font-medium">Pequena</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTier('media')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedTier === 'media'
                  ? 'bg-[#3B82F6] text-white shadow-md shadow-[#3B82F6]/30 scale-105'
                  : 'text-[#CBD5E1] hover:text-white hover:bg-[#1A2A5A]'
              }`}
            >
              <span>50k–300k hab.</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-black/30 font-medium">Média</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTier('grande')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedTier === 'grande'
                  ? 'bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/30 scale-105'
                  : 'text-[#CBD5E1] hover:text-white hover:bg-[#1A2A5A]'
              }`}
            >
              <span>300k+ hab.</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-black/30 font-medium">Grande</span>
            </button>
          </div>

          {/* BLOCO 2 ANTES DA DOBRA: TÍTULO COM GRADIENTE & SUBTÍTULO */}
          <div className="mb-8 space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#F8FAFC] tracking-tight leading-[1.12] text-balance">
              {current.headlinePrefix}
              <span className="bg-gradient-to-r from-[#3B82F6] via-[#60A5FA] to-[#10B981] bg-clip-text text-transparent">
                {current.headlineHighlight}
              </span>
              .
            </h1>
            <p className="text-base sm:text-xl text-[#94A3B8] leading-relaxed max-w-3xl mx-auto font-normal text-balance">
              {current.description}
            </p>
          </div>

          {/* BLOCO 3 ANTES DA DOBRA: UM CTA DOMINANTE (+ LINK SECUNDÁRIO DISCRETO + ACESSO RÁPIDO MODO CAMPO) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto justify-center mb-8">
            <button
              type="button"
              onClick={() => scrollTo('simulador')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] active:scale-[0.98] hover:scale-[1.02] transition-all duration-150 shadow-lg shadow-[#3B82F6]/30 min-h-[48px]"
            >
              Avaliar a sua cidade
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <button
              type="button"
              onClick={() => scrollTo('prestacao-contas')}
              className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-white transition-colors py-2 px-3 underline-offset-4 hover:underline"
            >
              Conhecer a plataforma
              <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            </button>
            <Link
              to="/campo"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#10B981] hover:text-white bg-[#10B981]/10 hover:bg-[#10B981]/25 border border-[#10B981]/30 hover:border-[#10B981]/60 px-3 py-2 rounded-xl transition-all shadow-sm"
              title="Acesso direto para operadores de campo com smartphone"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Modo Campo (Operador)</span>
            </Link>
          </div>

          {/* BLOCO 4 ANTES DA DOBRA: MÉTRICAS VIVAS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl text-left">
            <div className="p-3.5 rounded-xl bg-[#101B3A]/80 border border-[#1A2A5A]">
              <div className="text-xl sm:text-2xl font-black text-[#10B981] font-mono">
                {selectedTier === 'pequena'
                  ? '100%'
                  : `${liveMetrics ? liveMetrics.totalKmMonitored.toLocaleString('pt-BR') : '1.482'} km`}
              </div>
              <div className="text-xs text-[#94A3B8] leading-tight mt-1">
                {selectedTier === 'pequena'
                  ? 'Frota municipal ativa'
                  : 'Malha auditada continuamente'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#101B3A]/80 border border-[#1A2A5A]">
              <div className="text-xl sm:text-2xl font-black text-[#3B82F6] font-mono">
                {liveMetrics ? `${liveMetrics.totalEventsDetected}` : '14'}
              </div>
              <div className="text-xs text-[#94A3B8] leading-tight mt-1">
                Ocorrências catalogadas
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#101B3A]/80 border border-[#1A2A5A]">
              <div className="text-xl sm:text-2xl font-black text-[#F8FAFC] font-mono">
                {liveMetrics ? `${liveMetrics.activeSensors}` : '6'}
              </div>
              <div className="text-xs text-[#94A3B8] leading-tight mt-1">
                Veículos transmitindo telemetria
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#101B3A]/80 border border-[#1A2A5A]">
              <div className="text-xl sm:text-2xl font-black text-[#60A5FA] font-mono">
                Art. 320
              </div>
              <div className="text-xs text-[#94A3B8] leading-tight mt-1">
                Custeio legal via engenharia viária
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
