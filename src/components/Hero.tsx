import React from 'react'
import { Calculator, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react'

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
          <div className="animate-hero-1 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#101B3A] border border-[#1A2A5A] text-xs font-semibold text-[#F8FAFC] shadow-sm mb-8 hover:border-[#3B82F6]/50 transition-colors">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981] animate-status-pulse" />
            </span>
            <span className="tracking-wide">Plataforma GovTech certificada</span>
            <span className="text-[#3B82F6] font-bold">|</span>
            <span className="text-[#94A3B8] font-normal flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#3B82F6]" />
              Padrão Federal
            </span>
          </div>

          {/* Headline with 35% gradient accent */}
          <h1 className="animate-hero-2 text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#F8FAFC] tracking-tight leading-[1.1] mb-6 text-balance">
            Reduza até{' '}
            <span className="bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] bg-clip-text text-transparent underline decoration-[#3B82F6]/40 decoration-wavy decoration-from-font">
              35%
            </span>{' '}
            dos custos operacionais da sua gestão pública
          </h1>

          {/* Subheadline */}
          <p className="animate-hero-3 text-base sm:text-xl text-[#94A3B8] leading-relaxed max-w-2xl mb-10 font-normal text-balance">
            Inteligência de dados para prefeituras e órgãos estaduais tomarem decisões mais rápidas,
            transparentes e econômicas.
          </p>

          {/* CTAs */}
          <div className="animate-hero-4 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center mb-12">
            <button
              type="button"
              onClick={() => scrollTo('simulador')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] active:scale-[0.98] hover:scale-[1.02] transition-all duration-150 shadow-lg shadow-[#3B82F6]/30 hover:shadow-[#3B82F6]/50 min-h-[48px]"
            >
              <Calculator className="w-5 h-5" />
              Simular Economia
            </button>
            <button
              type="button"
              onClick={() => scrollTo('beneficios')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-[#F8FAFC] bg-[#101B3A] hover:bg-[#1A2A5A] border border-[#1A2A5A] hover:border-[#3B82F6]/50 active:scale-[0.98] hover:scale-[1.02] transition-all duration-150 min-h-[48px]"
            >
              Conhecer a Plataforma
              <ArrowRight className="w-4 h-4 text-[#94A3B8]" />
            </button>
          </div>

          {/* Trust Line */}
          <div className="animate-hero-5 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-[#94A3B8] pt-4 border-t border-[#1A2A5A]/60 w-full max-w-xl">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span className="font-semibold text-[#F8FAFC]">+120</span> órgãos atendidos
            </div>
            <span className="text-[#1A2A5A] hidden sm:inline">•</span>
            <div className="flex items-center gap-2">
              <span className="text-[#3B82F6] font-bold">★</span>
              <span className="font-semibold text-[#F8FAFC]">4,9/5</span> satisfação
            </div>
            <span className="text-[#1A2A5A] hidden sm:inline">•</span>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#3B82F6]" />
              <span className="font-semibold text-[#F8FAFC]">LGPD 100%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
