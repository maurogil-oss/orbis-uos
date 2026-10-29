import React, { useState } from 'react'
import {
  Gauge,
  Activity,
  Clock,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  MapPin,
  Compass,
  ArrowRight,
  Filter,
} from 'lucide-react'
import {
  TrafficCorridorSegment,
  CityTrafficOverview,
  TimeWindowId,
  TIME_WINDOWS,
  listTrafficCorridors,
  getCityTrafficOverview,
} from '@/services/trafficSpeed'

interface TrafficSpeedPanelProps {
  onFocusCorridor?: (corridor: TrafficCorridorSegment) => void
}

export function TrafficSpeedPanel({ onFocusCorridor }: TrafficSpeedPanelProps) {
  const [selectedWindow, setSelectedWindow] = useState<TimeWindowId>('geral_24h')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const corridors = listTrafficCorridors()
  const overview = getCityTrafficOverview()

  // Filtro
  const filteredCorridors = corridors.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    return true
  })

  // Janela selecionada config
  const currentWindowConfig = TIME_WINDOWS.find((w) => w.id === selectedWindow) || TIME_WINDOWS[0]

  // Velocidade média calculada da janela selecionada
  const avgSpeedWindow = (
    corridors.reduce((acc, curr) => acc + curr.janelasVelocidade[selectedWindow], 0) /
    (corridors.length || 1)
  ).toFixed(1)

  return (
    <div className="space-y-6">
      {/* 1. Header com Visão Executiva e Narração Textual do Estado do Tráfego */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#101B3A] via-[#15234A] to-[#101B3A] border border-[#10B981]/40 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase bg-[#10B981]/20 text-[#10B981] px-2.5 py-0.5 rounded border border-[#10B981]/40 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                Tráfego em Tempo Real & Velocidade Operacional
              </span>
              <span className="text-xs text-[#94A3B8]">
                Curitiba • Derivado da Coleta Passiva da Frota
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#F8FAFC] tracking-tight">
              Monitoramento Contínuo de Fluidez & Velocidade Média
            </h2>
            <p className="text-xs text-[#94A3B8] max-w-2xl mt-1 leading-relaxed">
              Estado de fluidez viária calculado a partir dos tacógrafos digitais e odometria
              inercial dos veículos municipais (ônibus URBS, caminhões de coleta e viaturas).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-[#38BDF8] bg-[#38BDF8]/15 border border-[#38BDF8]/30 px-3 py-1.5 rounded-xl">
              Zero API Paga • Sem Chave Exposta
            </span>
            <span className="text-[11px] font-mono text-[#10B981] bg-[#10B981]/15 border border-[#10B981]/30 px-3 py-1.5 rounded-xl">
              28,9 km Monitorados
            </span>
          </div>
        </div>

        {/* WCAG 2.2: Frase interpretativa obrigatória em linguagem plana do estado do tráfego */}
        <div
          id="traffic-status-accessible-summary"
          className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] text-xs text-[#CBD5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          aria-live="polite"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
            <div>
              <span className="font-semibold text-white">Narração do Estado da Malha: </span>
              <span>{overview.narrativaGeral}</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#94A3B8] shrink-0 hidden md:inline">
            WCAG 2.2 • Narração de Fluidez
          </span>
        </div>

        {/* 4 Cards de Distribuição da Malha */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
            <span className="text-[10px] text-[#94A3B8] block">Velocidade Média Global</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black font-mono text-[#F8FAFC]">
                {overview.velocidadeMediaGeralKmh}
              </span>
              <span className="text-xs font-mono text-[#94A3B8]">km/h</span>
            </div>
            <span className="text-[10px] text-[#94A3B8] block">
              Consolidado da malha monitorada
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0A1128] border border-[#10B981]/40">
            <span className="text-[10px] text-[#94A3B8] block">Malha Livre / Fluida</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black font-mono text-[#10B981]">
                {overview.pctMalhaLivre}%
              </span>
              <span className="text-xs text-[#94A3B8]">dos corredores</span>
            </div>
            <span className="text-[10px] text-[#10B981]/80 block">Fluidez &gt; 80% da nominal</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0A1128] border border-[#FBBF24]/40">
            <span className="text-[10px] text-[#94A3B8] block">Malha em Atenção</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black font-mono text-[#FBBF24]">
                {overview.pctMalhaAtencao}%
              </span>
              <span className="text-xs text-[#94A3B8]">dos corredores</span>
            </div>
            <span className="text-[10px] text-[#FBBF24]/80 block">Fluidez 60% a 80%</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0A1128] border border-[#EF4444]/40">
            <span className="text-[10px] text-[#94A3B8] block">Pontos de Retenção</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black font-mono text-[#EF4444]">
                {overview.pctMalhaCongestionada}%
              </span>
              <span className="text-xs text-[#94A3B8]">dos corredores</span>
            </div>
            <span className="text-[10px] text-[#EF4444]/80 block">Linha Verde & Marechal</span>
          </div>
        </div>
      </div>

      {/* 2. Seletor de Janela Temporal (Manhã, Entre-Picos, Tarde, Noturno) */}
      <div className="p-5 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A2A5A]">
          <div>
            <h3 className="text-sm font-bold text-[#F8FAFC]">
              Análise de Velocidade por Janela Temporal de Operação
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Compare a velocidade de circulação da frota por faixa horária do dia
            </p>
          </div>

          {/* Botões das Janelas Temporais */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#0A1128] p-1 rounded-xl border border-[#1A2A5A]">
            {TIME_WINDOWS.map((win) => {
              const isSelected = selectedWindow === win.id
              return (
                <button
                  key={win.id}
                  type="button"
                  onClick={() => setSelectedWindow(win.id)}
                  aria-pressed={isSelected}
                  className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-[#3B82F6] text-white shadow-md'
                      : 'text-[#94A3B8] hover:text-white hover:bg-[#1A2A5A]/50'
                  }`}
                >
                  <span>{win.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Card Informativo da Janela Selecionada */}
        <div className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#38BDF8] shrink-0" />
            <div>
              <span className="font-bold text-white">
                {currentWindowConfig.label} ({currentWindowConfig.horario}):
              </span>{' '}
              <span className="text-[#CBD5E1]">{currentWindowConfig.descricao}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[#94A3B8]">Velocidade média na janela:</span>
            <span className="font-mono font-bold text-base text-[#60A5FA]">
              {avgSpeedWindow} km/h
            </span>
          </div>
        </div>

        {/* Tabela Comparativa de Janelas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {overview.comparativoJanelas.map((cj) => {
            const isCurrent = selectedWindow === cj.janelaId
            return (
              <div
                key={cj.janelaId}
                onClick={() => setSelectedWindow(cj.janelaId)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-[#15234A] border-[#3B82F6] shadow-lg shadow-[#3B82F6]/10'
                    : 'bg-[#0A1128] border-[#1A2A5A] hover:border-[#3B82F6]/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-white">{cj.label}</span>
                  <span className="font-mono text-sm font-black text-[#60A5FA]">
                    {cj.velocidadeMediaKmh} km/h
                  </span>
                </div>
                <div className="text-[11px] text-[#94A3B8] space-y-1">
                  <div>
                    Lento: <b className="text-[#EF4444] font-medium">{cj.corredorMaisLento}</b>
                  </div>
                  <div>
                    Fluido: <b className="text-[#10B981] font-medium">{cj.corredorMaisFluido}</b>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. Tabela Detalhada dos Corredores com Narração do Estado */}
      <div className="p-5 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A2A5A]">
          <div>
            <h3 className="text-base font-bold text-[#F8FAFC]">
              Corredores Monitorados & Estado de Fluidez
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Velocidades observadas vs velocidades nominais regulamentadas
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#94A3B8]">Filtrar:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filtrar por estado de fluidez do tráfego"
              className="bg-[#0A1128] border border-[#1A2A5A] text-xs text-[#F8FAFC] rounded-lg px-2.5 py-2 focus:ring-1 focus:ring-[#3B82F6]"
            >
              <option value="all">Todos os Estados</option>
              <option value="livre">Tráfego Livre</option>
              <option value="atencao">Atenção Moderada</option>
              <option value="congestionado">Congestionado / Lento</option>
            </select>
          </div>
        </div>

        {/* Tabela de Corredores */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase font-mono text-[#94A3B8] border-b border-[#1A2A5A] bg-[#0A1128]/50">
              <tr>
                <th className="py-3 px-3">Corredor Viário</th>
                <th className="py-3 px-3">Trecho / Bairro</th>
                <th className="py-3 px-3">Estado</th>
                <th className="py-3 px-3">Velocidade Atual</th>
                <th className="py-3 px-3">Vel. Nominal</th>
                <th className="py-3 px-3">Janela ({currentWindowConfig.label})</th>
                <th className="py-3 px-3">Atraso vs Livre</th>
                <th className="py-3 px-3">Narração do Estado</th>
                <th className="py-3 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2A5A]/50">
              {filteredCorridors.map((c) => {
                const statusBadge =
                  c.status === 'congestionado'
                    ? {
                        bg: 'bg-[#EF4444]/20',
                        text: 'text-[#EF4444]',
                        border: 'border-[#EF4444]/40',
                        label: 'Congestionado',
                      }
                    : c.status === 'atencao'
                      ? {
                          bg: 'bg-[#FBBF24]/20',
                          text: 'text-[#FBBF24]',
                          border: 'border-[#FBBF24]/40',
                          label: 'Atenção',
                        }
                      : {
                          bg: 'bg-[#10B981]/20',
                          text: 'text-[#10B981]',
                          border: 'border-[#10B981]/40',
                          label: 'Livre',
                        }

                return (
                  <tr key={c.id} className="hover:bg-[#1A2A5A]/30 text-[#CBD5E1] transition-colors">
                    <td className="py-3 px-3 font-semibold text-[#F8FAFC]">{c.corredor}</td>
                    <td className="py-3 px-3 text-[#94A3B8]">{c.via}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                      >
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-white">
                      {c.velocidadeObservadaKmh} km/h
                    </td>
                    <td className="py-3 px-3 font-mono text-[#94A3B8]">
                      {c.velocidadeNominalKmh} km/h
                    </td>
                    <td className="py-3 px-3 font-mono text-[#60A5FA] font-bold">
                      {c.janelasVelocidade[selectedWindow]} km/h
                    </td>
                    <td className="py-3 px-3 font-mono text-xs">
                      {c.deltaTempoMin > 0 ? (
                        <span className="text-[#EF4444]">+{c.deltaTempoMin} min</span>
                      ) : (
                        <span className="text-[#10B981]">0 min</span>
                      )}
                    </td>
                    <td
                      className="py-3 px-3 text-[11px] text-[#CBD5E1] max-w-xs truncate"
                      title={c.narrativaEstado}
                    >
                      {c.narrativaEstado}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {onFocusCorridor && (
                        <button
                          type="button"
                          onClick={() => onFocusCorridor(c)}
                          aria-label={`Ver trecho ${c.corredor} no mapa`}
                          className="min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#3B82F6] hover:text-[#60A5FA] hover:bg-[#3B82F6]/10 inline-flex items-center gap-1 transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Ver no Mapa</span>
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Declaração Honesta da Fonte */}
        <div className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] text-[11px] text-[#94A3B8] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
            <span>
              Fonte dos Dados: <b className="text-white">{overview.fonteDeclarada}</b>
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#64748B]">LGPD k-anonimato garantido</span>
        </div>
      </div>
    </div>
  )
}
