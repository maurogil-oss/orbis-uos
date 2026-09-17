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

  // Narrativas por porte de cidade
  const tierConfig = {
    pequena: {
      badge: 'CIDADE PEQUENA (ATÉ ~50 MIL HAB) • ONDA DA CIDADE PEQUENA',
      headlinePrefix: 'A revolução do asfalto para cidades pequenas: ',
      headlineHighlight: 'sem obra, sem hardware e com o celular que você já tem',
      description:
        'Não compre equipamentos caros nem contrate consultorias lentas. O SDK Edge ORBIS.UOS roda no aplicativo que sua frota já usa, analisa o asfalto com FFT embarcada no celular do motorista e entrega o mapa de buracos e o dossiê pronto para o prefeito em 30 dias.',
      honestCoverage: '100% da sua frota auditando 100% do seu asfalto',
      entryArg: 'Zero custo de entrada • CPSI em 90 dias • Sem licitação',
      batteryTrust: '1,2–1,8%/h de bateria',
      pilotDays: 'Piloto em 30 dias',
    },
    media: {
      badge: 'CIDADE MÉDIA (~50–300 MIL HAB) • CENTRAL 156+ PREDITIVA',
      headlinePrefix: 'O Sistema Operacional Urbano para cidades médias: ',
      headlineHighlight: 'recupere o Fundo de Multas com dossiê blindado',
      description:
        'Conecte o atendimento 156 à zeladoria preditiva, sincronize corredores semafóricos com Green Light Bridge e blinde o Art. 320 do CTB para custear obras viárias com as receitas de trânsito.',
      honestCoverage: `${liveMetrics ? liveMetrics.totalKmMonitored.toLocaleString('pt-BR') : '1.482'} km monitorados continuamente`,
      entryArg: 'Recupere o Fundo de Multas (Art. 320 CTB) com nexo causal georreferenciado',
      batteryTrust: '1,2–1,8%/h de bateria',
      pilotDays: 'Piloto em 60 dias',
    },
    grande: {
      badge: 'CIDADE GRANDE (300 MIL+ HAB) • PADRÃO GLOBAL ISO & METRÓPOLES',
      headlinePrefix: 'Plataforma Soberana de Mobilidade para metrópoles: ',
      headlineHighlight: 'padrão ISO 37120/37122/37125 e dados para BID/BNDES',
      description:
        'Interoperabilidade completa com GTFS, GTFS-RT, MDS, GBFS e semáforos legados. KPIs por corredor estrutural, governança climática ESG e arquitetura interfederativa para consórcios intermunicipais.',
      honestCoverage: 'Malha metropolitana completa com gêmeo digital em tempo real',
      entryArg: 'Padrão ISO 37120/37122/37125 • Elegibilidade para financiamentos BID/BNDES',
      batteryTrust: '1,2–1,8%/h de bateria',
      pilotDays: 'Piloto em 90 dias',
    },
  }

  const current = tierConfig[selectedTier]

  return (
    <section className="relative min-h-[94vh] flex items-center justify-center pt-28 pb-16 overflow-hidden bg-gradient-to-b from-[#0A1128] via-[#0E1838] to-[#0A1128]">
      {/* Background Subtle Animated Grid */}
      <div className="absolute inset-0 bg-grid-gov opacity-40 pointer-events-none" />

      {/* Radial soft glow behind content */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-[#3B82F6]/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-2/3 right-10 w-[350px] h-[350px] bg-[#10B981]/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* SELETOR INTERATIVO DE PORTE DE CIDADE */}
          <div className="mb-6 p-1.5 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] shadow-xl flex flex-wrap items-center justify-center gap-1.5 max-w-xl">
            <span className="text-[11px] font-mono uppercase text-[#94A3B8] px-2.5 py-1 font-bold">
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
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-black/25">Pequena</span>
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
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-black/25">Média</span>
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
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-black/25">Grande</span>
            </button>
          </div>

          {/* Eyebrow Badge contextualizado */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#101B3A] border border-[#1A2A5A] text-xs font-semibold text-[#F8FAFC] shadow-sm mb-6 hover:border-[#3B82F6]/50 transition-colors">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]" />
            </span>
            <span className="tracking-wide font-mono text-[11px] text-[#10B981]">
              {current.badge}
            </span>
            <span className="text-[#3B82F6] font-bold">|</span>
            <span className="text-[#94A3B8] font-normal flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-[#3B82F6]" />
              SDK Edge • FFT Embarcada
            </span>
          </div>

          {/* Headline Adaptada por Porte */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#F8FAFC] tracking-tight leading-[1.12] mb-6 text-balance">
            {current.headlinePrefix}
            <span className="bg-gradient-to-r from-[#3B82F6] via-[#60A5FA] to-[#10B981] bg-clip-text text-transparent underline decoration-[#3B82F6]/40 decoration-wavy">
              {current.headlineHighlight}
            </span>
            .
          </h1>

          {/* Subheadline com a narrativa do SDK Edge */}
          <p className="text-base sm:text-xl text-[#94A3B8] leading-relaxed max-w-3xl mb-6 font-normal text-balance">
            {current.description}
          </p>

          {/* BANNER TÉCNICO DE CONFIANÇA DO SDK EDGE */}
          <div className="p-3.5 rounded-2xl bg-[#101B3A]/80 border border-[#1A2A5A] max-w-2xl w-full mb-8 flex flex-wrap items-center justify-around gap-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <BatteryCharging className="w-4 h-4 text-[#10B981]" />
              <span className="text-[#94A3B8]">Consumo Medido:</span>
              <b className="text-[#10B981] font-bold">1,2–1,8% / hora</b>
              <span className="text-[10px] text-[#94A3B8]">(Turno 8h = 10–15%)</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#3B82F6]" />
              <span className="text-[#94A3B8]">Processamento:</span>
              <b className="text-[#F8FAFC]">FFT Banda 1–20 Hz</b>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#60A5FA]" />
              <span className="text-[#94A3B8]">Arquitetura:</span>
              <b className="text-[#60A5FA]">SDK Edge (Não requer novo app)</b>
            </div>
          </div>

          {/* DADOS VIVOS PUXADOS DO BANCO EM TEMPO REAL */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl mb-8 text-left">
            <div className="p-3.5 rounded-xl bg-[#101B3A]/80 border border-[#1A2A5A]">
              <div className="text-xl sm:text-2xl font-black text-[#10B981] font-mono">
                {selectedTier === 'pequena'
                  ? '100%'
                  : `${liveMetrics ? liveMetrics.totalKmMonitored : 1482} km`}
              </div>
              <div className="text-[11px] text-[#94A3B8] leading-tight mt-0.5">
                {selectedTier === 'pequena' ? 'Frota auditando asfalto' : 'Auditados passivamente'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#101B3A]/80 border border-[#1A2A5A]">
              <div className="text-xl sm:text-2xl font-black text-[#3B82F6] font-mono">
                {liveMetrics ? `${liveMetrics.totalEventsDetected}` : '14'}
              </div>
              <div className="text-[11px] text-[#94A3B8] leading-tight mt-0.5">
                Eventos vivos catalogados
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#101B3A]/80 border border-[#1A2A5A]">
              <div className="text-xl sm:text-2xl font-black text-[#F8FAFC] font-mono">
                {liveMetrics ? `${liveMetrics.activeSensors}` : '6'}
              </div>
              <div className="text-[11px] text-[#94A3B8] leading-tight mt-0.5">
                Veículos transmitindo ao vivo
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#101B3A]/80 border border-[#1A2A5A]">
              <div className="text-xl sm:text-2xl font-black text-[#60A5FA] font-mono">
                Art. 320
              </div>
              <div className="text-[11px] text-[#94A3B8] leading-tight mt-0.5">
                Custeio via fundo de multas
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center mb-8">
            <button
              type="button"
              onClick={() => scrollTo('piloto')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] active:scale-[0.98] hover:scale-[1.02] transition-all duration-150 shadow-lg shadow-[#3B82F6]/30 min-h-[48px]"
            >
              Solicitar Proposta ({selectedTier === 'pequena' ? 'Piloto 30 Dias' : 'CPSI 90 Dias'})
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <button
              type="button"
              onClick={() => scrollTo('simulador')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-semibold text-[#F8FAFC] bg-[#101B3A] hover:bg-[#1A2A5A] border border-[#1A2A5A] hover:border-[#3B82F6]/50 active:scale-[0.98] transition-all min-h-[48px]"
            >
              Simulador por Porte
            </button>
            <Link
              to="/cockpit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-semibold text-[#10B981] bg-[#10B981]/10 hover:bg-[#10B981]/20 border border-[#10B981]/30 hover:border-[#10B981]/60 active:scale-[0.98] transition-all min-h-[48px]"
            >
              <Smartphone className="w-4 h-4" />
              Modo Gabinete & Coleta Real
            </Link>
          </div>

          {/* BANNER DE TRANSIÇÃO POC / PRODUÇÃO */}
          <div className="w-full max-w-3xl p-4 rounded-2xl bg-[#101B3A]/60 border border-[#1A2A5A] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6]">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="font-bold text-[#F8FAFC] block">
                  Demonstração no navegador • Produção via SDK Embarcado
                </span>
                <span>
                  Teste os sensores do seu celular agora no cockpit via DeviceMotion; em produção na
                  prefeitura, opera silencioso em segundo plano.
                </span>
              </div>
            </div>
            <Link
              to="/cockpit"
              className="underline text-[#3B82F6] hover:text-[#60A5FA] font-medium flex items-center gap-1 shrink-0"
            >
              Abrir Cockpit
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
