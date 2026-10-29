import React, { useState } from 'react'
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Layers,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  MapPin,
  Clock,
  Compass,
  Filter,
} from 'lucide-react'
import {
  NearMissEvent,
  NearMissCorridorSummary,
  NearMissTemporalTrend,
  getNearMissCorridors,
  getNearMissTemporalTrends,
} from '@/services/nearMisses'

interface NearMissesPanelProps {
  events: NearMissEvent[]
  selectedEventId?: string | null
  onSelectEvent: (event: NearMissEvent) => void
  onOpenReplay: (event: NearMissEvent) => void
}

export function NearMissesPanel({
  events,
  selectedEventId,
  onSelectEvent,
  onOpenReplay,
}: NearMissesPanelProps) {
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [corridorFilter, setCorridorFilter] = useState<string>('all')

  const corridors = getNearMissCorridors()
  const trends = getNearMissTemporalTrends()

  // Filtros combinados
  const filteredEvents = events.filter((ev) => {
    if (severityFilter !== 'all' && ev.severidade !== severityFilter) return false
    if (corridorFilter !== 'all' && ev.corredor !== corridorFilter) return false
    return true
  })

  // Estatísticas do topo
  const totalEvents = events.length
  const criticalCount = events.filter((e) => e.severidade === 'critica').length
  const highCount = events.filter((e) => e.severidade === 'alta').length
  const avgDecel = (
    events.reduce((acc, curr) => acc + curr.decelMaxG, 0) / (events.length || 1)
  ).toFixed(2)

  return (
    <div className="space-y-6">
      {/* 1. Header do Painel com Banner de Decisão e Narração Textual Acessível */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#101B3A] via-[#15234A] to-[#101B3A] border border-[#3B82F6]/40 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase bg-[#EF4444]/20 text-[#F87171] px-2.5 py-0.5 rounded border border-[#EF4444]/40 font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-[#EF4444]" />
                Camada Analítica de Conflitos Viários
              </span>
              <span className="text-xs text-[#94A3B8]">
                Motor ORBIS DSP • Desaceleração Abrupta & Quase-Acidentes
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#F8FAFC] tracking-tight">
              Quase-Acidentes, Frenagens de Pânico & Conflitos por Eixo
            </h2>
            <p className="text-xs text-[#94A3B8] max-w-2xl mt-1 leading-relaxed">
              Eventos de desaceleração abrupta (&lt; -0.45g) captados passivamente pela frota
              municipal em circulação. Registrados com fidelidade de replay futuro, severidade,
              k-anonimato H3 e tendência temporal comparativa.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-mono text-[#10B981] bg-[#10B981]/15 border border-[#10B981]/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              <span>k-Anonimato (LGPD Art. 12)</span>
            </span>
            <span className="text-[11px] font-mono text-[#38BDF8] bg-[#38BDF8]/15 border border-[#38BDF8]/30 px-3 py-1.5 rounded-xl">
              Fidelidade Replay Ativa
            </span>
          </div>
        </div>

        {/* Frase interpretativa obrigatória de tendência em linguagem plana */}
        <div
          id="nearmiss-trend-accessible-summary"
          className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] text-xs text-[#CBD5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          aria-live="polite"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shrink-0" />
            <div>
              <span className="font-semibold text-white">Interpretação Geral de Conflitos: </span>
              <span>
                Conflitos no corredor Marechal Floriano aumentaram 18% em outubro e na Linha Verde
                subiram 22% na aproximação do Pinheirinho. Os eixos centrais mantêm estabilidade com
                desaceleração média de {avgDecel}g.
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#94A3B8] shrink-0 hidden md:inline">
            WCAG 2.2 • Dado Acessível ≠ Interpretação Acessível
          </span>
        </div>

        {/* 4 Cards de Resumo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
            <span className="text-[10px] text-[#94A3B8] block">Conflitos Catalogados</span>
            <span className="text-xl font-black font-mono text-[#F8FAFC]">{totalEvents}</span>
            <span className="text-[10px] text-[#94A3B8] block">Eventos com replay espacial</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0A1128] border border-[#EF4444]/40">
            <span className="text-[10px] text-[#94A3B8] block">Severidade Crítica</span>
            <span className="text-xl font-black font-mono text-[#EF4444]">{criticalCount}</span>
            <span className="text-[10px] text-[#EF4444]/80">Desaceleração &gt; -0.65g</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0A1128] border border-[#F97316]/40">
            <span className="text-[10px] text-[#94A3B8] block">Severidade Alta</span>
            <span className="text-xl font-black font-mono text-[#F97316]">{highCount}</span>
            <span className="text-[10px] text-[#F97316]/80">Conflito de cruzamento / desvio</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
            <span className="text-[10px] text-[#94A3B8] block">Pico Médio de Frenagem</span>
            <span className="text-xl font-black font-mono text-[#60A5FA]">{avgDecel} g</span>
            <span className="text-[10px] text-[#94A3B8] block">Média inercial longitudinal</span>
          </div>
        </div>
      </div>

      {/* 2. Tendência Temporal dos Conflitos + Resumo por Corredor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna 1: Tabela de Corredores e Frases de Tendência (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A2A5A]">
            <div>
              <h3 className="text-sm font-bold text-[#F8FAFC]">
                Tendência de Quase-Acidentes por Corredor
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Narração textual das variações mensais ao lado de cada corredor
              </p>
            </div>
            <span className="text-[10px] font-mono text-[#60A5FA] bg-[#3B82F6]/15 px-2 py-0.5 rounded border border-[#3B82F6]/30">
              Outubro/2026
            </span>
          </div>

          <div className="space-y-2.5">
            {corridors.map((corredor, idx) => {
              const isUp = corredor.tendenciaMensalPct > 0
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#0A1128] border border-[#1A2A5A] hover:border-[#3B82F6]/40 transition-colors space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          corredor.fatorRisco === 'alto'
                            ? 'bg-[#EF4444]'
                            : corredor.fatorRisco === 'atencao'
                              ? 'bg-[#F97316]'
                              : 'bg-[#10B981]'
                        }`}
                      />
                      <span className="text-xs font-bold text-[#F8FAFC]">{corredor.corredor}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-[#94A3B8]">
                        {corredor.totalEventos} conflitos ({corredor.criticos} críticos)
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded ${
                          isUp ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-[#10B981]/20 text-[#10B981]'
                        }`}
                      >
                        {isUp ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>
                          {isUp
                            ? `+${corredor.tendenciaMensalPct}%`
                            : `${corredor.tendenciaMensalPct}%`}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Frase textual de tendência em linguagem plana */}
                  <div className="text-xs text-[#CBD5E1] pl-4 border-l-2 border-[#1A2A5A]">
                    <span className="text-[#38BDF8] font-semibold">Leitura da Engenharia: </span>
                    <span>{corredor.fraseTendencia}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Coluna 2: Histórico Trimestral + Rotulagem Honesta da Fonte (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1A2A5A]">
              <h3 className="text-sm font-bold text-[#F8FAFC]">Evolução Temporal Quadrimestral</h3>
              <span className="text-[10px] font-mono text-[#94A3B8]">Série 2026</span>
            </div>

            <div className="space-y-3">
              {trends.map((t, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-white">{t.periodo}</span>
                    <span className="font-mono text-[#94A3B8]">
                      {t.totalConflitos} conflitos ({t.criticos} críticos) •{' '}
                      {t.taxaVariacaoPct > 0 ? `+${t.taxaVariacaoPct}%` : 'Base'}
                    </span>
                  </div>
                  <div className="w-full bg-[#0A1128] h-2 rounded-full overflow-hidden border border-[#1A2A5A]/60">
                    <div
                      className="h-full bg-gradient-to-r from-[#3B82F6] to-[#EF4444]"
                      style={{ width: `${Math.min(100, (t.totalConflitos / 200) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-[#0A1128] border border-[#1A2A5A] text-[11px] text-[#94A3B8] space-y-1">
              <div className="flex items-center gap-1.5 text-white font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Declaração Honesta da Fonte de Dados:</span>
              </div>
              <p>
                Os eventos exibidos nesta camada combinam telemetria inercial passiva da frota
                municipal e <b className="text-white">dados de demonstração calibrados</b> com
                parâmetros empíricos de Curitiba. Rotulagem transparente conforme o padrão
                institucional ORBIS.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tabela Operacional de Eventos com Botão de Replay (44px touch targets) */}
      <div className="p-5 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A2A5A]">
          <div>
            <h3 className="text-base font-bold text-[#F8FAFC]">
              Detecções de Quase-Acidentes Registradas para Replay
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Selecione qualquer evento para acionar o replay quadro a quadro ou focar no mapa
            </p>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              aria-label="Filtrar por severidade de desaceleração"
              className="bg-[#0A1128] border border-[#1A2A5A] text-xs text-[#F8FAFC] rounded-lg px-2.5 py-2 focus:ring-1 focus:ring-[#3B82F6]"
            >
              <option value="all">Todas as Severidades</option>
              <option value="critica">Crítica (&gt; -0.65g)</option>
              <option value="alta">Alta (-0.50g a -0.65g)</option>
              <option value="media">Média (-0.45g a -0.50g)</option>
            </select>

            <select
              value={corridorFilter}
              onChange={(e) => setCorridorFilter(e.target.value)}
              aria-label="Filtrar por corredor viário"
              className="bg-[#0A1128] border border-[#1A2A5A] text-xs text-[#F8FAFC] rounded-lg px-2.5 py-2 focus:ring-1 focus:ring-[#3B82F6] max-w-xs"
            >
              <option value="all">Todos os Corredores</option>
              {corridors.map((c, i) => (
                <option key={i} value={c.corredor}>
                  {c.corredor}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabela de Eventos */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase font-mono text-[#94A3B8] border-b border-[#1A2A5A] bg-[#0A1128]/50">
              <tr>
                <th className="py-3 px-3">Via / Trecho</th>
                <th className="py-3 px-3">Bairro / Eixo</th>
                <th className="py-3 px-3">Tipo Conflito</th>
                <th className="py-3 px-3">Severidade</th>
                <th className="py-3 px-3">Desacel. Pico</th>
                <th className="py-3 px-3">Vel. Queda</th>
                <th className="py-3 px-3">Grade H3</th>
                <th className="py-3 px-3">Frase de Tendência</th>
                <th className="py-3 px-3 text-right">Replay Físico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2A5A]/50">
              {filteredEvents.map((ev) => {
                const isSelected = selectedEventId === ev.id
                return (
                  <tr
                    key={ev.id}
                    onClick={() => onSelectEvent(ev)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#3B82F6]/10 text-white'
                        : 'hover:bg-[#1A2A5A]/30 text-[#CBD5E1]'
                    }`}
                  >
                    <td className="py-3 px-3 font-semibold text-[#F8FAFC]">{ev.via}</td>
                    <td className="py-3 px-3 text-[#94A3B8]">{ev.bairro}</td>
                    <td className="py-3 px-3 uppercase text-[10px] font-mono">
                      {ev.tipo.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          ev.severidade === 'critica'
                            ? 'bg-[#EF4444]/20 text-[#EF4444]'
                            : ev.severidade === 'alta'
                              ? 'bg-[#F97316]/20 text-[#F97316]'
                              : 'bg-[#FBBF24]/20 text-[#FBBF24]'
                        }`}
                      >
                        {ev.severidade}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#EF4444]">
                      {ev.decelMaxG.toFixed(2)}g
                    </td>
                    <td className="py-3 px-3 font-mono text-[#60A5FA]">
                      {ev.velocidadeInicialKmh} → {ev.velocidadeFinalKmh} km/h
                    </td>
                    <td className="py-3 px-3 font-mono text-[10px] text-[#94A3B8]">
                      {ev.h3Index.slice(0, 10)}...
                    </td>
                    <td
                      className="py-3 px-3 text-[11px] text-[#CBD5E1] max-w-xs truncate"
                      title={ev.tendenciaDescricao}
                    >
                      {ev.tendenciaDescricao}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onOpenReplay(ev)
                        }}
                        aria-label={`Abrir replay físico do quase-acidente em ${ev.via}`}
                        className="min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] inline-flex items-center gap-1.5 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA]"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Replay</span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
