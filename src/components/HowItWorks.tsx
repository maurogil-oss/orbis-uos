import React from 'react'
import { SearchCheck, Cpu, Activity, ArrowRight } from 'lucide-react'

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: '01 | Diagnóstico',
      subtitle: 'Mapeamento Completo',
      description: 'Mapeamos os fluxos e gargalos da sua gestão em até 15 dias.',
      icon: SearchCheck,
      badge: 'Até 15 dias',
      deliverables: [
        'Auditoria de processos',
        'Identificação de redundâncias',
        'Matriz de economia',
      ],
    },
    {
      number: '02',
      title: '02 | Implantação',
      subtitle: 'Conexão Segura',
      description: 'Configuramos a plataforma com seus dados e integrações em 30 dias.',
      icon: Cpu,
      badge: '30 dias',
      deliverables: [
        'Integração com ERP público',
        'Treinamento das equipes',
        'Criptografia e LGPD',
      ],
    },
    {
      number: '03',
      title: '03 | Operação',
      subtitle: 'Monitoramento Contínuo',
      description: 'Sua equipe opera com painéis e alertas, monitorando resultados em tempo real.',
      icon: Activity,
      badge: 'Tempo real',
      deliverables: ['Alertas preventivos', 'Relatórios automatizados', 'Acompanhamento do ROI'],
    },
  ]

  const scrollToPilot = () => {
    const el = document.getElementById('piloto')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="como-funciona" className="py-24 relative bg-[#0A1128] scroll-mt-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101B3A] border border-[#1A2A5A] text-xs font-semibold text-[#3B82F6]">
            Metodologia Ágil B2G
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
            Como Funciona a Jornada de Implementação
          </h2>
          <p className="text-base text-[#94A3B8]">
            Do diagnóstico inicial ao acompanhamento em tempo real, sem impacto ou interrupção na
            rotina das secretarias.
          </p>
        </div>

        {/* 3-Step Horizontal Timeline */}
        <div className="relative">
          {/* Desktop Connecting Line behind cards */}
          <div className="hidden lg:block absolute top-1/2 left-16 right-16 h-0.5 bg-gradient-to-r from-[#3B82F6]/30 via-[#3B82F6] to-[#3B82F6]/30 -translate-y-12 pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <div
                  key={step.number}
                  className="group relative p-8 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] hover:-translate-y-1 transition-all duration-200 shadow-xl shadow-black/20 flex flex-col justify-between"
                >
                  <div>
                    {/* Top row: Number marker and icon */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1A2A5A] border border-[#1A2A5A] group-hover:border-[#3B82F6]/60 flex items-center justify-center transition-colors">
                          <Icon className="w-5 h-5 text-[#3B82F6]" />
                        </div>
                        <span className="font-mono text-2xl font-black text-[#94A3B8]/40 group-hover:text-[#3B82F6] transition-colors">
                          {step.number}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-[#0A1128] border border-[#1A2A5A] text-[#10B981]">
                        {step.badge}
                      </span>
                    </div>

                    {/* Step Title & Copy */}
                    <h3 className="text-xl font-bold text-[#F8FAFC] tracking-tight mb-2">
                      {step.title}
                    </h3>

                    <p className="text-sm text-[#94A3B8] leading-relaxed mb-6">
                      {step.description}
                    </p>

                    {/* Deliverables checklist */}
                    <ul className="space-y-2 border-t border-[#1A2A5A]/60 pt-4">
                      {step.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-[#94A3B8]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 pt-4 border-t border-[#1A2A5A]/40 flex items-center justify-between text-xs font-semibold text-[#94A3B8] group-hover:text-[#F8FAFC]">
                    <span>Etapa validada</span>
                    <ArrowRight className="w-4 h-4 text-[#3B82F6] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom prompt */}
        <div className="mt-16 text-center">
          <button
            type="button"
            onClick={scrollToPilot}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#3B82F6] hover:text-[#60A5FA] transition-colors"
          >
            <span>Deseja um cronograma customizado para o seu município ou estado?</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
