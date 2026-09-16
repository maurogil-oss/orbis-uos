import { Link } from 'react-router-dom'
import {
  Calculator,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Activity,
  Layers,
  MapPin,
} from 'lucide-react'

export function Hero() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 overflow-hidden bg-gradient-to-b from-[#0A1128] via-[#0E1838] to-[#0A1128]">
      {/* Background Subtle Animated Grid */}
      <div className="absolute inset-0 bg-grid-gov opacity-40 pointer-events-none" />

      {/* Radial soft glow behind content */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-[#3B82F6]/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-2/3 right-10 w-[350px] h-[350px] bg-[#10B981]/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Eyebrow Badge with pulsing green dot */}
          <div className="animate-hero-1 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#101B3A] border border-[#1A2A5A] text-xs font-semibold text-[#F8FAFC] shadow-sm mb-6 hover:border-[#3B82F6]/50 transition-colors">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981] animate-status-pulse" />
            </span>
            <span className="tracking-wide">ORBIS UOS • GOVTECH • ZERO CAPEX • ART. 320 CTB</span>
            <span className="text-[#3B82F6] font-bold">|</span>
            <span className="text-[#94A3B8] font-normal flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#3B82F6]" />
              Coleta Real & Inercial Mobile
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-hero-2 text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#F8FAFC] tracking-tight leading-[1.1] mb-6 text-balance">
            O Sistema Operacional Urbano para{' '}
            <span className="bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] bg-clip-text text-transparent underline decoration-[#3B82F6]/40 decoration-wavy decoration-from-font">
              Cidades Inteligentes
            </span>
            .
          </h1>

          {/* Subheadline contextualizada à mobilidade */}
          <p className="animate-hero-3 text-base sm:text-xl text-[#94A3B8] leading-relaxed max-w-3xl mb-8 font-normal text-balance">
            Auditoria viária contínua através da frota que já roda na cidade. Detecte degradação
            asfáltica precocemente via sensores do smartphone do motorista, gere o índice IRI
            contínuo, sincronize semáforos e blinde a prestação de contas no TCE — com contratação
            ágil via CPSI (LC 182/2021).
          </p>

          {/* Key Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl mb-10 text-left">
            <div className="p-3.5 rounded-xl bg-[#101B3A]/80 border border-[#1A2A5A]">
              <div className="text-xl sm:text-2xl font-black text-[#10B981] font-mono">Até 78%</div>
              <div className="text-[11px] text-[#94A3B8] leading-tight mt-0.5">
                Economia em recapeamento
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#101B3A]/80 border border-[#1A2A5A]">
              <div className="text-xl sm:text-2xl font-black text-[#3B82F6] font-mono">
                Zero CAPEX
              </div>
              <div className="text-[11px] text-[#94A3B8] leading-tight mt-0.5">
                Hardware 100% passivo
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#101B3A]/80 border border-[#1A2A5A]">
              <div className="text-xl sm:text-2xl font-black text-[#F8FAFC] font-mono">
                Índice IRI
              </div>
              <div className="text-[11px] text-[#94A3B8] leading-tight mt-0.5">
                Medição contínua em tempo real
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#101B3A]/80 border border-[#1A2A5A]">
              <div className="text-xl sm:text-2xl font-black text-[#60A5FA] font-mono">
                Art. 320
              </div>
              <div className="text-[11px] text-[#94A3B8] leading-tight mt-0.5">
                Custeio via multas CTB
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="animate-hero-4 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center mb-8">
            <button
              type="button"
              onClick={() => scrollTo('piloto')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] active:scale-[0.98] hover:scale-[1.02] transition-all duration-150 shadow-lg shadow-[#3B82F6]/30 hover:shadow-[#3B82F6]/50 min-h-[48px]"
            >
              Solicitar Piloto CPSI (90 Dias)
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <button
              type="button"
              onClick={() => scrollTo('simulador')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-semibold text-[#F8FAFC] bg-[#101B3A] hover:bg-[#1A2A5A] border border-[#1A2A5A] hover:border-[#3B82F6]/50 active:scale-[0.98] transition-all min-h-[48px]"
            >
              <Calculator className="w-4 h-4 text-[#3B82F6]" />
              Simular Economia Municipal
            </button>
            <Link
              to="/cockpit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-semibold text-[#10B981] bg-[#10B981]/10 hover:bg-[#10B981]/20 border border-[#10B981]/30 hover:border-[#10B981]/60 active:scale-[0.98] transition-all min-h-[48px]"
            >
              <Smartphone className="w-4 h-4" />
              Ver Cockpit & Coleta Real
            </Link>
          </div>

          {/* Active Curitiba Snapshot Preview Banner */}
          <div className="w-full max-w-3xl p-4 rounded-2xl bg-[#101B3A]/60 border border-[#1A2A5A] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8] mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6]">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="font-bold text-[#F8FAFC] block">
                  Curitiba & RMC • Malha Viária Ativa
                </span>
                <span>
                  1.482 km monitorados • Gêmeo digital com suporte a sensores reais de smartphones
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="hidden md:inline font-mono text-[#10B981] font-semibold">
                Modo Coleta Real via Acelerômetro
              </span>
              <Link
                to="/cockpit"
                className="underline text-[#3B82F6] hover:text-[#60A5FA] font-medium flex items-center gap-1"
              >
                Testar Sensores
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Trust Line */}
          <div className="animate-hero-5 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-[#94A3B8] pt-4 border-t border-[#1A2A5A]/60 w-full max-w-2xl">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#3B82F6]" />
              <span className="font-semibold text-[#F8FAFC]">Zero Sensores Físicos</span>
            </div>
            <span className="text-[#1A2A5A] hidden sm:inline">•</span>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#10B981]" />
              <span className="font-semibold text-[#F8FAFC]">Marco Legal (LC 182/21)</span>
            </div>
            <span className="text-[#1A2A5A] hidden sm:inline">•</span>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#3B82F6]" />
              <span className="font-semibold text-[#F8FAFC]">100% LGPD (Sem Placas/Rostos)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
