import { FileText, Coins, Award, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react'

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      badge: 'LC 182/2021 • MARCO LEGAL CPSI',
      title: 'Manifesto de Interesse & Piloto CPSI',
      subtitle: 'Cooperação Federativa sem Obras',
      description:
        'Formalização simplificada com amparo no Contrato Público para Solução Inovadora (LC 182/2021). Escopo delimitado para validação em vias críticas e corredores de transporte coletivo, sem obras ou compra de hardware.',
      icon: FileText,
      deliverables: [
        'Sem risco para o erário público municipal',
        'Minuta padronizada de Termo de Referência para a PGM',
        'Início operacional célere com a frota já existente',
      ],
      tag: 'Sem risco ao erário',
    },
    {
      number: '02',
      badge: 'ART. 320 DO CTB & ENGENHARIA',
      title: 'Enquadramento Orçamentário Legal',
      subtitle: 'Fundo Municipal de Multas',
      description:
        'Custeio plenamente elegível ao saldo do Fundo Municipal de Multas (Art. 320 do CTB) na rubrica estrita de engenharia de tráfego e sinalização, ou compensado na economia orçamentária de zeladoria preventiva.',
      icon: Coins,
      deliverables: [
        'Conformidade orçamentária perante a LRF',
        'Zero necessidade de nova dotação orçamentária',
        'Parecer pré-formatado de conformidade para a Procuradoria',
      ],
      tag: 'Enquadramento Legal',
    },
    {
      number: '03',
      badge: 'DOSSIÊ AUDITÁVEL TCE / MP',
      title: 'Auditoria, Prestação de Contas & Escala',
      subtitle: 'Evidências Técnicas & Transparência',
      description:
        'O gestor decide com base em evidências; o sistema documenta. Ao final, o município dispõe de dossiê auditável com hash SHA-256, mapa de irregularidade IRI e prestação de contas irretocável perante as Cortes de Contas.',
      icon: Award,
      deliverables: [
        'Dossiê com nexo causal georreferenciado e hash de integridade',
        'Inventário público contínuo da malha viária',
        'Transparência ativa perante o cidadão, o controle e a imprensa',
      ],
      tag: 'Prestação de Contas',
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
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101B3A] border border-[#1A2A5A] text-xs font-semibold text-[#3B82F6]">
            <ShieldCheck className="w-3.5 h-3.5" />
            Agilidade Jurídica Comprovada
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
            Como Contratar sem o Desgaste de Licitações Complexas
          </h2>
          <p className="text-base text-[#94A3B8]">
            O Marco Legal das Startups (Lei Complementar nº 182/2021) permite validar a tecnologia
            de telemetria com segurança total para prefeitos, secretários e procuradorias.
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
                    {/* Top row: Badge and Number marker */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-md bg-[#0A1128] border border-[#1A2A5A] text-[#3B82F6]">
                        {step.badge}
                      </span>
                      <span className="font-mono text-2xl font-black text-[#94A3B8]/30 group-hover:text-[#3B82F6] transition-colors">
                        {step.number}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#1A2A5A] border border-[#1A2A5A] group-hover:border-[#3B82F6]/60 flex items-center justify-center transition-colors">
                        <Icon className="w-5 h-5 text-[#3B82F6]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#F8FAFC] tracking-tight leading-snug">
                          {step.title}
                        </h3>
                        <span className="text-xs text-[#94A3B8]">{step.subtitle}</span>
                      </div>
                    </div>

                    <p className="text-sm text-[#94A3B8] leading-relaxed mb-6">
                      {step.description}
                    </p>

                    {/* Deliverables checklist */}
                    <ul className="space-y-2 border-t border-[#1A2A5A]/60 pt-4">
                      {step.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-[#F8FAFC]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 pt-4 border-t border-[#1A2A5A]/40 flex items-center justify-between text-xs font-semibold text-[#10B981]">
                    <span>{step.tag}</span>
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
            <span>Deseja receber a minuta do Termo de Referência do CPSI para análise da PGM?</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
