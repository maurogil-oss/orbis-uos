import {
  Activity,
  TrafficCone,
  ShieldCheck,
  EyeOff,
  ArrowRight,
  TrendingDown,
  Clock,
  Sparkles,
} from 'lucide-react'

export function Benefits() {
  const pillars = [
    {
      title: 'SDK Edge com FFT Embarcada (1,2–1,8%/h)',
      tag: 'Zero CAPEX • Bateria Protegida',
      badge: 'Processamento Local',
      description:
        'Não é mais um aplicativo para o motorista instalar; é um SDK leve que embute a telemetria nos apps que sua frota já usa. O processamento espectral FFT isola frequências de 1 a 20 Hz no próprio smartphone e envia apenas assinaturas de anomalias viárias com baixíssimo consumo de bateria.',
      metric: '1,2–1,8%/h',
      metricLabel: 'Consumo medido de bateria (Turno de 8h = 10–15%)',
      submetric: 'Filtro Hanning + Janela FFT de 0 a 25 Hz',
      icon: Activity,
      accent: '#3B82F6',
    },
    {
      title: 'Google Green Light & Central 156+ Preditiva',
      tag: 'Engenharia Semafórica',
      badge: 'Insumo & Integração',
      description:
        'Mapas de retenção e sincronismo que alimentam a engenharia semafórica do órgão, com integração a controladores (Siemens, Dataprom, Digicon) mediante parceria técnica com os fornecedores. Menos retenções, menos combustível queimado e OSs de reparo despachadas antes das reclamações da população no 156.',
      metric: '-20%*',
      metricLabel: 'potencial de redução em filas (estimativa de referência)',
      submetric: 'Potencial de até 30 t de CO₂ poupadas anualmente por corredor integrado',
      icon: TrafficCone,
      accent: '#10B981',
    },
    {
      title: 'Artigo 320 do CTB & Blindagem no TCE',
      tag: 'Respaldo Jurídico B2G',
      badge: '100% Auditável',
      description:
        'Utilize as receitas do Fundo Municipal de Multas com segurança total. Dossiês com nexo causal georreferenciado e pareceres prontos em 1 clique para Procuradorias e aprovação sem ressalvas no Tribunal de Contas do Estado.',
      metric: '100%',
      metricLabel: 'elegível para custeio via multas CTB',
      submetric: 'Adesão simplificada via CPSI (LC 182/2021)',
      icon: ShieldCheck,
      accent: '#60A5FA',
    },
    {
      title: '100% LGPD • Sem Vigilância de Cidadãos',
      tag: 'Privacidade por Design',
      badge: 'Zero Câmeras',
      description:
        'Auditoria da via, nunca das pessoas. Ao contrário de sistemas com reconhecimento de placas ou biometria facial que trazem riscos na ANPD e no Ministério Público, o ORBIS.UOS mede exclusivamente ondas de choque e atrito mecânico do pavimento.',
      metric: '0 Placas',
      metricLabel: 'Zero biometria ou dados automotivos coletados',
      submetric: 'Telemetria Z inercial pura da física do asfalto',
      icon: EyeOff,
      accent: '#F59E0B',
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
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101B3A] border border-[#1A2A5A] text-xs font-semibold text-[#3B82F6]">
            <Sparkles className="w-3.5 h-3.5" />
            Arquitetura de Valor Público
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
            Quatro Pilares. Uma Única Plataforma Soberana.
          </h2>
          <p className="text-base text-[#94A3B8]">
            Desenvolvido para eliminar gargalos de gestão urbana com tecnologia inercial de ponta,
            dados viários auditáveis e zero necessidade de compra de hardware caro.
          </p>
        </div>

        {/* 4 Pillars Grid (2x2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pillars.map((p) => {
            const Icon = p.icon
            return (
              <div
                key={p.title}
                className="group p-8 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between shadow-lg shadow-black/20"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#1A2A5A] group-hover:bg-[#3B82F6]/20 border border-[#1A2A5A] group-hover:border-[#3B82F6]/50 flex items-center justify-center transition-colors">
                      <Icon className="w-6 h-6 text-[#3B82F6] group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#10B981] px-2.5 py-1 rounded bg-[#0A1128] border border-[#1A2A5A]">
                        {p.badge}
                      </span>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] px-2.5 py-1 rounded bg-[#0A1128] border border-[#1A2A5A]">
                        {p.tag}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-[#F8FAFC] tracking-tight mb-3">
                    {p.title}
                  </h3>

                  <p className="text-sm text-[#94A3B8] leading-relaxed mb-6">{p.description}</p>
                </div>

                <div className="pt-6 border-t border-[#1A2A5A]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-2xl font-black text-[#F8FAFC] font-mono">{p.metric}</div>
                    <div className="text-xs text-[#94A3B8]">{p.metricLabel}</div>
                    <div className="text-[11px] text-[#3B82F6] mt-0.5">{p.submetric}</div>
                  </div>
                  <button
                    type="button"
                    onClick={scrollToPilot}
                    className="inline-flex items-center text-xs font-semibold text-[#3B82F6] group-hover:text-[#60A5FA]"
                  >
                    <span>Solicitar Minuta Técnica</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA banner below cards */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-[#101B3A] via-[#1A2A5A] to-[#101B3A] border border-[#1A2A5A] flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-[#F8FAFC] flex items-center justify-center sm:justify-start gap-2">
              <TrendingDown className="w-5 h-5 text-[#10B981]" />
              Validação Institucional: Piloto CPSI (LC 182/2021)
            </h4>
            <p className="text-xs sm:text-sm text-[#94A3B8]">
              Implante em corredores prioritários do seu município sem obra, sem custo de entrada e
              comprove a eficiência fiscal antes de qualquer expansão contratual.
            </p>
          </div>
          <button
            type="button"
            onClick={scrollToPilot}
            className="shrink-0 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-md shadow-[#3B82F6]/30 active:scale-95 transition-all flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Avaliar a sua cidade
          </button>
        </div>
      </div>
    </section>
  )
}
