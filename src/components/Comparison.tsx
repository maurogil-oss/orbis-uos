import { XCircle, CheckCircle2, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react'

export function Comparison() {
  const comparisonRows = [
    {
      criterion: 'Arquitetura de Coleta',
      bad: 'Aplicativos extras que motoristas recusam instalar, drenam a bateria em 3 horas ou exigem hardware/sensores caros no painel.',
      good: 'SDK Edge embarcado nos apps que a frota já usa. FFT na borda com consumo medido de apenas 1,2–1,8%/h de bateria e Zero CAPEX.',
      goodBadge: 'SDK Edge (1,2–1,8%/h)',
    },
    {
      criterion: 'Detecção de Falhas no Asfalto',
      bad: 'Reclamações manuais no canal 156 quando o buraco já causou acidentes, retenções e danificou veículos de cidadãos.',
      good: 'Auditoria contínua via frota existente, identificando anomalias inerciais e rugosidade IRI meses antes da cratera se formar.',
      goodBadge: 'Prevenção Ativa',
    },
    {
      criterion: 'Custo de Manutenção da Via',
      bad: 'Tapa-buraco de emergência que custa até 8x mais caro por m² e se desmancha no primeiro período de chuvas fortes.',
      good: 'Microrrevestimento programado e ordens de serviço preventivas, reduzindo expressivamente o gasto com asfalto.',
      goodBadge: 'Economia Real',
    },
    {
      criterion: 'Segurança Jurídica & TCE',
      bad: 'Risco de glosa e apontamentos no Tribunal de Contas por desvio de finalidade das receitas do Fundo de Multas.',
      good: 'Dossiê TCE em 1 clique com nexo causal georreferenciado e carimbo de integridade, 100% elegível ao Artigo 320 do CTB.',
      goodBadge: 'Art. 320 CTB Blindado',
    },
    {
      criterion: 'Contratação & Infraestrutura',
      bad: 'Licitações tradicionais lentas (6 a 12 meses) e contratos de TI engessados que não entregam valor rápido.',
      good: 'Piloto ágil CPSI (LC 182/2021) de 30 a 90 dias sem licitação e com parâmetros pré-calibrados por porte de município.',
      goodBadge: 'CPSI Sem Licitação',
    },
  ]

  const scrollToPilot = () => {
    const el = document.getElementById('piloto')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="py-24 relative bg-[#0A1128] border-t border-[#1A2A5A]/50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101B3A] border border-[#1A2A5A] text-xs font-semibold text-[#3B82F6]">
            <Sparkles className="w-3.5 h-3.5" />
            Prova de Valor Público
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
            Como a Cidade Opera Hoje vs. Com o Orbis UOS
          </h2>
          <p className="text-base text-[#94A3B8]">
            Compare o modelo reativo tradicional com a governança preditiva e entenda por que o
            sistema se paga desde os primeiros 90 dias.
          </p>
        </div>

        {/* 2-Column Comparison Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column A: Modelo Convencional Reativo */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#101B3A]/60 border border-[#EF4444]/30 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#1A2A5A]">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#EF4444] font-semibold">
                    Modelo Convencional Reativo
                  </span>
                  <h3 className="text-xl font-bold text-[#F8FAFC] mt-0.5">
                    Como a maioria das cidades opera hoje
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5 text-[#EF4444]" />
                </div>
              </div>

              <div className="space-y-6">
                {comparisonRows.map((row) => (
                  <div key={row.criterion} className="space-y-1.5">
                    <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                      {row.criterion}
                    </span>
                    <div className="flex items-start gap-2.5 text-sm text-[#CBD5E1] bg-[#0A1128]/60 p-3.5 rounded-xl border border-[#1A2A5A]">
                      <XCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                      <p className="leading-relaxed">{row.bad}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#1A2A5A] text-xs text-[#EF4444] flex items-center gap-2">
              <span className="font-semibold">Resultado:</span>
              <span>Alto desgaste político, custos imprevisíveis e auditorias complexas.</span>
            </div>
          </div>

          {/* Column B: Orbis Smart Cities GovTech */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#101B3A] border-2 border-[#3B82F6]/60 shadow-2xl shadow-[#3B82F6]/10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6]/10 blur-2xl rounded-full pointer-events-none" />

            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#1A2A5A]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#3B82F6] font-semibold">
                      Orbis Smart Cities • GovTech
                    </span>
                    <span className="text-[10px] font-mono uppercase bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded border border-[#10B981]/40 font-bold">
                      Zero CAPEX
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#F8FAFC] mt-0.5">
                    Auditoria Contínua & Preditiva
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 border border-[#3B82F6]/40 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-[#3B82F6]" />
                </div>
              </div>

              <div className="space-y-6">
                {comparisonRows.map((row) => (
                  <div key={row.criterion} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                        {row.criterion}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">
                        {row.goodBadge}
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5 text-sm text-[#F8FAFC] bg-[#0A1128] p-3.5 rounded-xl border border-[#3B82F6]/30">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                      <p className="leading-relaxed">{row.good}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#1A2A5A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-xs text-[#10B981] font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Economia mensurável em até 90 dias com respaldo da LC 182/21
              </div>
              <button
                type="button"
                onClick={scrollToPilot}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#3B82F6]/25"
              >
                Solicitar Piloto CPSI
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
