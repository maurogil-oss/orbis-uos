import React from 'react'
import { ShieldCheck, BarChart3, TrendingDown, ArrowRight } from 'lucide-react'

export function Benefits() {
  const benefits = [
    {
      title: 'Transparência Total',
      description: 'Auditoria completa de cada decisão e gasto, com trilhas de dados imutáveis.',
      icon: ShieldCheck,
      tag: 'Auditoria & Compliance',
      accent: '#3B82F6',
    },
    {
      title: 'Decisão Baseada em Dados',
      description: 'Painéis inteligentes que transformam dados brutos em ações concretas.',
      icon: BarChart3,
      tag: 'Inteligência Pública',
      accent: '#60A5FA',
    },
    {
      title: 'Redução de Custos',
      description: 'Automação de processos que reduz a burocracia e o desperdício de recursos.',
      icon: TrendingDown,
      tag: 'Economia Fiscal',
      accent: '#10B981',
    },
  ]

  const scrollToPilot = () => {
    const el = document.getElementById('piloto')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      id="beneficios"
      className="py-24 relative bg-[#070D1F] border-t border-[#1A2A5A]/50 scroll-mt-20"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101B3A] border border-[#1A2A5A] text-xs font-semibold text-[#3B82F6]">
            Pilares Estratégicos
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
            Projetado para os desafios da máquina pública
          </h2>
          <p className="text-base text-[#94A3B8]">
            Conectamos tecnologia de ponta com a conformidade estrita às leis orçamentárias e
            regulatórias do setor público brasileiro.
          </p>
        </div>

        {/* 3-card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((b) => {
            const Icon = b.icon
            return (
              <div
                key={b.title}
                className="group p-8 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between shadow-lg shadow-black/20"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#1A2A5A] group-hover:bg-[#3B82F6]/20 border border-[#1A2A5A] group-hover:border-[#3B82F6]/50 flex items-center justify-center transition-colors">
                      <Icon className="w-6 h-6 text-[#3B82F6] group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] px-2.5 py-1 rounded bg-[#0A1128] border border-[#1A2A5A]">
                      {b.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#F8FAFC] tracking-tight mb-3">
                    {b.title}
                  </h3>

                  <p className="text-sm text-[#94A3B8] leading-relaxed">{b.description}</p>
                </div>

                <div className="mt-8 pt-4 border-t border-[#1A2A5A]/50 flex items-center text-xs font-semibold text-[#3B82F6] group-hover:text-[#60A5FA]">
                  <span>Saiba como aplicamos</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA banner below cards */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-[#101B3A] via-[#1A2A5A] to-[#101B3A] border border-[#1A2A5A] flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h4 className="text-lg font-bold text-[#F8FAFC]">
              Pronto para transformar a gestão fiscal do seu órgão?
            </h4>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
              Participe do programa de pilotos e teste a plataforma em ambiente real.
            </p>
          </div>
          <button
            type="button"
            onClick={scrollToPilot}
            className="shrink-0 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-md shadow-[#3B82F6]/30 active:scale-95 transition-all"
          >
            Iniciar Piloto de 60 Dias
          </button>
        </div>
      </div>
    </section>
  )
}
