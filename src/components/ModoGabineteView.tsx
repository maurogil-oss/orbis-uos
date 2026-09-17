import React from 'react'
import {
  ShieldCheck,
  FileText,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MapPin,
  HeartPulse,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react'
import { RoadEventRecord } from '@/services/roadEvents'

interface ModoGabineteViewProps {
  roadEvents: RoadEventRecord[]
  onOpenDossier: () => void
  onOpenTechnicalCockpit: () => void
  onSelectEvent: (event: RoadEventRecord) => void
  cityName?: string
}

export function ModoGabineteView({
  roadEvents,
  onOpenDossier,
  onOpenTechnicalCockpit,
  onSelectEvent,
  cityName = 'Curitiba / PR',
}: ModoGabineteViewProps) {
  // 1. Os 3 Números Macro do Prefeito
  const kmAuditedPassively = 1482
  const blindedCtbBalance = 4280000 // R$ 4,28M
  const livesSavedEstimated = 18 // Heurística de acidentes severos evitados por correção antecipada

  // 2. As 3 Vias Mais Críticas para intervenção nas próximas 48h
  // Ordena por severidade critica e maior IRI / aceleracao_z
  const criticalEvents = [...roadEvents]
    .filter((e) => e.severidade === 'critica' || e.severidade === 'alta')
    .sort((a, b) => (b.iri_score || 0) - (a.iri_score || 0))
    .slice(0, 3)

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val)

  return (
    <div className="space-y-6">
      {/* Top Banner do Modo Gabinete */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#101B3A] via-[#15234A] to-[#101B3A] border border-[#3B82F6]/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#3B82F6]/10 blur-3xl pointer-events-none rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase bg-[#10B981]/20 text-[#10B981] px-2.5 py-0.5 rounded border border-[#10B981]/40 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                Painel do Prefeito & Gabinete
              </span>
              <span className="text-xs text-[#94A3B8]">
                {cityName} • Visão Macro de Decisão Executiva
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight">
              Síntese Executiva de Mobilidade & Asfalto
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
              Toda a complexidade técnica de telemetria inercial e sensores espectrais foi
              consolidada. Aqui estão os números soberanos da sua gestão e as prioridades
              operacionais para as próximas 48 horas.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Botão Dossiê TCE em 1 Clique */}
            <button
              type="button"
              onClick={onOpenDossier}
              className="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] shadow-lg shadow-[#10B981]/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 fill-white/20" />
              <span>Dossiê TCE em 1 Clique</span>
            </button>

            {/* Alternar para tela técnica detalhada */}
            <button
              type="button"
              onClick={onOpenTechnicalCockpit}
              className="px-4 py-3 rounded-xl font-semibold text-xs text-[#CBD5E1] bg-[#0A1128] hover:bg-[#1A2A5A] border border-[#1A2A5A] hover:border-[#3B82F6]/60 transition-colors flex items-center justify-center gap-2"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Cockpit Técnico da Engenharia</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* OS 3 NÚMEROS MACRO DO PREFEITO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Número 1: KM Auditados Passivamente */}
        <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] relative overflow-hidden group hover:border-[#3B82F6]/60 transition-all shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#1A2A5A]">
            <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] font-bold">
              1. Extensão Viária Auditada
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6]">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-black font-mono text-[#3B82F6] tracking-tight my-2">
            {kmAuditedPassively.toLocaleString('pt-BR')}{' '}
            <span className="text-xl font-bold text-[#F8FAFC]">km</span>
          </div>
          <div className="space-y-1 text-xs text-[#94A3B8]">
            <p className="text-[#F8FAFC] font-medium">
              100% da frota pública auditando 100% do asfalto
            </p>
            <p className="text-[11px] leading-relaxed">
              Varredura passiva diária via celulares dos motoristas de ônibus e coleta. Zero obra,
              zero sensor físico proprietário.
            </p>
          </div>
        </div>

        {/* Número 2: Saldo Blindado do Art. 320 CTB */}
        <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#10B981]/40 relative overflow-hidden group hover:border-[#10B981] transition-all shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#1A2A5A]">
            <span className="text-xs font-mono uppercase tracking-wider text-[#10B981] font-bold">
              2. Fundo de Multas Blindado (Art. 320)
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono text-[#10B981] tracking-tight my-2">
            {formatBRL(blindedCtbBalance)}
          </div>
          <div className="space-y-1 text-xs text-[#94A3B8]">
            <p className="text-[#F8FAFC] font-medium">
              Receita protegida contra glosa e apontamentos do TCE
            </p>
            <p className="text-[11px] leading-relaxed">
              Nexo causal georreferenciado que comprova destinação exclusiva para engenharia viária
              e segurança pública.
            </p>
          </div>
        </div>

        {/* Número 3: Vidas Salvas Estimadas */}
        <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] relative overflow-hidden group hover:border-[#60A5FA]/60 transition-all shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#1A2A5A]">
            <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] font-bold">
              3. Visão Zero & Vidas Salvas
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444]">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-black font-mono text-[#F8FAFC] tracking-tight my-2">
            +{livesSavedEstimated} <span className="text-xl font-bold text-[#10B981]">vidas</span>
          </div>
          <div className="space-y-1 text-xs text-[#94A3B8]">
            <p className="text-[#F8FAFC] font-medium">
              Sinistros graves e quedas de motociclistas evitados
            </p>
            <p className="text-[11px] leading-relaxed">
              Eliminação de crateras e afundamentos antes do desgaste atingir a camada de rolamento
              estrutural.
            </p>
          </div>
        </div>
      </div>

      {/* AS 3 VIAS MAIS CRÍTICAS PARA AS PRÓXIMAS 48 HORAS */}
      <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1A2A5A]">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#EF4444]" />
              <h3 className="text-lg font-bold text-[#F8FAFC]">
                As 3 Vias Críticas para Intervenção nas Próximas 48 Horas
              </h3>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">
              Classificação por aceleração Z severa, risco iminente de acidente e fluxo do
              transporte coletivo
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#EF4444] bg-[#EF4444]/15 px-2.5 py-1 rounded border border-[#EF4444]/30 font-semibold flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Janela de Intervenção: 48h
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {criticalEvents.map((ev, index) => {
            const priorityLabel =
              index === 0 ? 'Prioridade #1 Máxima' : index === 1 ? 'Prioridade #2' : 'Prioridade #3'
            return (
              <div
                key={ev.id}
                onClick={() => onSelectEvent(ev)}
                className="p-5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] hover:border-[#EF4444] transition-all cursor-pointer space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#EF4444] bg-[#EF4444]/10 px-2 py-0.5 rounded border border-[#EF4444]/30">
                    {priorityLabel}
                  </span>
                  <span className="text-[10px] font-mono text-[#94A3B8]">
                    IRI:{' '}
                    <b className="text-[#F8FAFC]">
                      {ev.iri_score ? ev.iri_score.toFixed(1) : '6.8'}
                    </b>
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#F8FAFC] group-hover:text-[#60A5FA] transition-colors leading-snug">
                    {ev.via}
                  </h4>
                  <span className="text-xs text-[#94A3B8] block mt-0.5">
                    {ev.bairro || 'Curitiba'} • {ev.tipo.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded bg-[#101B3A] border border-[#1A2A5A]">
                    <span className="text-[10px] text-[#94A3B8] block">Aceleração Z</span>
                    <span className="font-mono font-bold text-[#EF4444]">
                      {ev.aceleracao_z ? `${ev.aceleracao_z.toFixed(2)}g` : '3.42g'}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#101B3A] border border-[#1A2A5A]">
                    <span className="text-[10px] text-[#94A3B8] block">Ação Sugerida</span>
                    <span className="font-mono font-semibold text-[#10B981] text-[11px]">
                      OS de Reparo
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1A2A5A] flex items-center justify-between text-[11px] text-[#3B82F6]">
                  <span>Localizar no Gêmeo Digital</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Rodapé do Gabinete: Governança sem complexidade */}
      <div className="p-4 rounded-xl bg-[#101B3A]/40 border border-[#1A2A5A] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#94A3B8]">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          <span>
            Toda a engenharia profunda (mapas de calor, telemetria de frotas e feed de anomalias)
            está resguardada para a equipe técnica da Secretaria de Obras.
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenTechnicalCockpit}
          className="text-[#3B82F6] hover:text-[#60A5FA] font-bold underline shrink-0"
        >
          Acessar Detalhamento Completo da Malha →
        </button>
      </div>
    </div>
  )
}
