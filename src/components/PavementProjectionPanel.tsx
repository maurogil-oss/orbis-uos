import React, { useState } from 'react'
import {
  TrendingDown,
  TrendingUp,
  Activity,
  Calendar,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowRight,
  Layers,
  MapPin,
  HelpCircle,
  CheckCircle2,
  Sliders,
  DollarSign,
  Maximize2,
  PieChart,
} from 'lucide-react'
import {
  getPavementSimulationOverview,
  PavementCorridorProjected,
  ScenarioInvestmentId,
  ScenarioInvestmentConfig,
} from '@/services/pavementSimulation'

interface PavementProjectionPanelProps {
  onFocusCorridor?: (corridor: PavementCorridorProjected) => void
}

export function PavementProjectionPanel({ onFocusCorridor }: PavementProjectionPanelProps) {
  const simulation = getPavementSimulationOverview()
  const [selectedHorizon, setSelectedHorizon] = useState<'12m' | '24m' | '36m'>('24m')
  const [selectedScenario, setSelectedScenario] =
    useState<ScenarioInvestmentId>('preventiva_distribuida')
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>(simulation.trechos[0].id)
  const [classeFilter, setClasseFilter] = useState<string>('all')

  const currentScenario = simulation.cenarios[selectedScenario]
  const selectedCorridor =
    simulation.trechos.find((t) => t.id === selectedCorridorId) || simulation.trechos[0]

  // Filtro por classe funcional
  const filteredTrechos = simulation.trechos.filter((t) => {
    if (classeFilter !== 'all' && t.classeVia !== classeFilter) return false
    return true
  })

  // Quantidade de trechos que cruzam limiar
  const cruzamNoHorizonte = simulation.trechos.filter((t) => {
    if (!t.mesCruzamentoLimiar && t.mesCruzamentoLimiar !== 0) return false
    const maxMeses = selectedHorizon === '12m' ? 12 : selectedHorizon === '24m' ? 24 : 36
    return t.mesCruzamentoLimiar <= maxMeses
  }).length

  return (
    <div className="space-y-6">
      {/* 1. Header do Módulo com Rotulagem Honesta & Narração Textual WCAG 2.2 */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#101B3A] via-[#15234A] to-[#101B3A] border border-[#3B82F6]/40 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase bg-[#3B82F6]/20 text-[#60A5FA] px-2.5 py-0.5 rounded border border-[#3B82F6]/40 font-bold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#38BDF8]" />
                Projeção de Pavimento & Degradação
              </span>
              <span className="text-[11px] font-mono text-[#F59E0B] bg-[#F59E0B]/15 border border-[#F59E0B]/30 px-2.5 py-0.5 rounded">
                {simulation.rotuloHonesto}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#F8FAFC] tracking-tight">
              Curvas Paramétricas de Degradação & Cenários What-If
            </h2>
            <p className="text-xs text-[#94A3B8] max-w-2xl mt-1 leading-relaxed">
              Projeção analítica determinística sobre os índices IMV e IRI existentes nos horizontes
              de 12, 24 e 36 meses. Identifica o mês exato em que cada trecho cruza o limiar de
              intervenção e simula 3 estratégias orçamentárias.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-[#10B981] bg-[#10B981]/15 border border-[#10B981]/30 px-3 py-1.5 rounded-xl">
              {simulation.totalKmMonitorados} km Projetados
            </span>
            <span className="text-[11px] font-mono text-[#38BDF8] bg-[#38BDF8]/15 border border-[#38BDF8]/30 px-3 py-1.5 rounded-xl">
              8 Corredores & Grade H3
            </span>
          </div>
        </div>

        {/* WCAG 2.2: Frase interpretativa obrigatória em linguagem plana */}
        <div
          id="pavement-projection-accessible-summary"
          className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] text-xs text-[#CBD5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          aria-live="polite"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] shrink-0" />
            <div>
              <span className="font-semibold text-white">
                Interpretação Geral de Degradação (Horizonte {selectedHorizon}):{' '}
              </span>
              <span>
                {selectedHorizon === '12m'
                  ? `Em 12 meses sem intervenção, 3 corredores (16,2 km) estarão abaixo do limiar de intervenção, elevando o custo de restauração em R$ 4,8 milhões.`
                  : selectedHorizon === '24m'
                    ? `Em 24 meses sem intervenção, 5 corredores (25,2 km) cruzam o limiar crítico. A intervenção preventiva recomendada poupa até R$ 17,2 milhões no triênio.`
                    : `Em 36 meses inerciais, 7 dos 8 corredores monitorados caem em degradação moderada a grave, acumulando passivo emergencial de R$ 24,6 milhões.`}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#94A3B8] shrink-0 hidden md:inline">
            WCAG 2.2 • Narração de Projeção
          </span>
        </div>

        {/* 4 Cards de Panorama Geral */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
            <span className="text-[10px] text-[#94A3B8] block">Condição Atual (Hoje)</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black font-mono text-[#F8FAFC]">
                {simulation.imvMedioAtual}
              </span>
              <span className="text-xs font-mono text-[#94A3B8]">pontos IMV</span>
            </div>
            <span className="text-[10px] text-[#10B981] block">
              IRI médio: {simulation.iriMedioAtual} m/km
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0A1128] border border-[#F59E0B]/40">
            <span className="text-[10px] text-[#94A3B8] block">
              Trechos Abaixo da Meta ({selectedHorizon})
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black font-mono text-[#F59E0B]">
                {cruzamNoHorizonte} / {simulation.trechos.length}
              </span>
              <span className="text-xs font-mono text-[#94A3B8]">corredores</span>
            </div>
            <span className="text-[10px] text-[#F59E0B]/80 block">
              Cruzam limiar até o horizonte
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0A1128] border border-[#EF4444]/40">
            <span className="text-[10px] text-[#94A3B8] block">Passivo Inercial (36m)</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black font-mono text-[#EF4444]">
                R$ {simulation.resumoImpacto36mSemAcao.passivoFinanceiroPotencialMilhoes}
              </span>
              <span className="text-xs font-mono text-[#94A3B8]">milhões</span>
            </div>
            <span className="text-[10px] text-[#EF4444]/80 block">
              Custo de reconstrução emergencial
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0A1128] border border-[#10B981]/40">
            <span className="text-[10px] text-[#94A3B8] block">Delta Máx. Evitado</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black font-mono text-[#10B981]">
                {simulation.cenarios.preventiva_distribuida.kmAnoCriticoEvitado}
              </span>
              <span className="text-xs font-mono text-[#94A3B8]">km·ano</span>
            </div>
            <span className="text-[10px] text-[#10B981]/80 block">
              Cenário de Manutenção Preventiva
            </span>
          </div>
        </div>
      </div>

      {/* 2. Comparativo de Cenários de Investimento (What-If) */}
      <div className="p-5 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A2A5A]">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#38BDF8]" />
              <h3 className="text-base font-bold text-[#F8FAFC]">
                Simulação de Cenários de Investimento (What-If)
              </h3>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Compare o impacto técnico e financeiro de 3 estratégias viárias para os próximos 36
              meses
            </p>
          </div>

          {/* Seletor de Cenário */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#0A1128] p-1 rounded-xl border border-[#1A2A5A]">
            {(
              [
                { id: 'sem_intervencao', label: '1. Sem Intervenção' },
                { id: 'repavimentar_piores', label: '2. Piores Corredores' },
                { id: 'preventiva_distribuida', label: '3. Preventiva Distribuída' },
              ] as const
            ).map((sc) => {
              const isSelected = selectedScenario === sc.id
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setSelectedScenario(sc.id)}
                  aria-pressed={isSelected}
                  className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] ${
                    isSelected
                      ? 'bg-[#3B82F6] text-white shadow-md'
                      : 'text-[#94A3B8] hover:text-white hover:bg-[#1A2A5A]/50'
                  }`}
                >
                  <span>{sc.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Detalhe do Cenário Selecionado */}
        <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono uppercase bg-[#38BDF8]/20 text-[#38BDF8] px-2 py-0.5 rounded border border-[#38BDF8]/30 font-bold">
                {currentScenario.badge}
              </span>
              <h4 className="text-base font-bold text-white mt-1">{currentScenario.titulo}</h4>
              <p className="text-xs text-[#94A3B8]">{currentScenario.descricao}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-[#94A3B8] block">Investimento Estimado</span>
                <span className="text-lg font-black font-mono text-white">
                  {currentScenario.investimentoEstimadoMilhoes === 0
                    ? 'R$ 0,00'
                    : `R$ ${currentScenario.investimentoEstimadoMilhoes.toFixed(1)}M`}
                </span>
              </div>
              <div className="text-right pl-3 border-l border-[#1A2A5A]">
                <span className="text-[10px] text-[#94A3B8] block">km·ano Crítico Evitado</span>
                <span className="text-lg font-black font-mono text-[#10B981]">
                  +{currentScenario.kmAnoCriticoEvitado} km·ano
                </span>
              </div>
            </div>
          </div>

          {/* Frase interpretativa obrigatória do cenário */}
          <div className="p-3 rounded-lg bg-[#101B3A] border-l-4 border-[#3B82F6] text-xs text-[#CBD5E1] space-y-1">
            <div className="flex items-center gap-1.5 text-[#38BDF8] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Interpretação Executiva para o Gabinete:</span>
            </div>
            <p className="leading-relaxed">{currentScenario.fraseInterpretativa}</p>
            <div className="text-[11px] text-[#94A3B8] pt-1">
              <b className="text-white">Recomendação Institucional:</b>{' '}
              {currentScenario.recomendacaoGabinete}
            </div>
          </div>

          {/* Gráfico / Curva Visual de IMV Médio ao Longo dos 36 Meses */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-2 font-mono">
              <span>Curva Projetada do IMV Médio da Malha (Mês 0 ao Mês 36)</span>
              <span className="text-[11px] text-[#F59E0B]">Limiar de Intervenção: 70 pts</span>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {currentScenario.curvaMediaImv.map((pt) => {
                const isCritico = pt.imvMedio < 70
                const isExcelente = pt.imvMedio >= 80
                const alturaBarraPct = Math.max(20, Math.min(100, (pt.imvMedio / 100) * 100))
                return (
                  <div
                    key={pt.mes}
                    className="p-2 rounded-lg bg-[#101B3A] border border-[#1A2A5A] text-center flex flex-col items-center justify-between h-28"
                  >
                    <span className="text-[10px] font-mono text-[#94A3B8]">
                      {pt.mes === 0 ? 'Hoje' : `Mês +${pt.mes}`}
                    </span>
                    <div className="w-full bg-[#070D1F] rounded h-12 flex items-end p-1 my-1">
                      <div
                        style={{ height: `${alturaBarraPct}%` }}
                        className={`w-full rounded transition-all ${
                          isCritico ? 'bg-[#EF4444]' : isExcelente ? 'bg-[#10B981]' : 'bg-[#3B82F6]'
                        }`}
                        title={`Mês +${pt.mes}: IMV ${pt.imvMedio} | IRI ${pt.iriMedio}`}
                      />
                    </div>
                    <div className="font-mono text-xs font-black text-white">
                      <span>{pt.imvMedio}</span>
                      <span className="text-[9px] text-[#94A3B8] block font-normal">
                        IRI {pt.iriMedio}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tabela de Corredores Viários com Projeção e Mês de Cruzamento do Limiar */}
      <div className="p-5 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A2A5A]">
          <div>
            <h3 className="text-base font-bold text-[#F8FAFC]">
              Evolução Projetada por Corredor & Mês de Cruzamento do Limiar
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Condição hoje vs projeções em 12, 24 e 36 meses com alerta de intervenção preventiva
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Seletor de Horizonte */}
            <div className="flex items-center gap-1 bg-[#0A1128] p-1 rounded-xl border border-[#1A2A5A]">
              {(['12m', '24m', '36m'] as const).map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setSelectedHorizon(h)}
                  aria-pressed={selectedHorizon === h}
                  className={`min-h-[44px] px-3 py-1 rounded-lg text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] ${
                    selectedHorizon === h
                      ? 'bg-[#3B82F6] text-white'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <span>{h}</span>
                </button>
              ))}
            </div>

            {/* Filtro por Classe */}
            <select
              value={classeFilter}
              onChange={(e) => setClasseFilter(e.target.value)}
              aria-label="Filtrar trechos por classe funcional viária"
              className="bg-[#0A1128] border border-[#1A2A5A] text-xs text-[#F8FAFC] rounded-lg px-2.5 py-2 focus:ring-1 focus:ring-[#3B82F6] min-h-[44px]"
            >
              <option value="all">Todas as Classes</option>
              <option value="corredor_brt">Canaletas BRT</option>
              <option value="arterial">Vias Arteriais</option>
              <option value="coletora">Vias Coletoras</option>
            </select>
          </div>
        </div>

        {/* Tabela de Trechos */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase font-mono text-[#94A3B8] border-b border-[#1A2A5A] bg-[#0A1128]/50">
              <tr>
                <th className="py-3 px-3">Corredor / Via</th>
                <th className="py-3 px-3">Classe</th>
                <th className="py-3 px-3">Extensão</th>
                <th className="py-3 px-3">Hoje (Mês 0)</th>
                <th className="py-3 px-3">Em 12 Meses</th>
                <th className="py-3 px-3">Em 24 Meses</th>
                <th className="py-3 px-3">Em 36 Meses</th>
                <th className="py-3 px-3">Mês de Cruzamento da Meta</th>
                <th className="py-3 px-3">Narração do Trecho</th>
                <th className="py-3 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2A5A]/50">
              {filteredTrechos.map((t) => {
                const isSelected = selectedCorridorId === t.id
                const cruzaAbaixo = t.mesCruzamentoLimiar !== null

                return (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedCorridorId(t.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#3B82F6]/10 text-white'
                        : 'hover:bg-[#1A2A5A]/30 text-[#CBD5E1]'
                    }`}
                  >
                    <td className="py-3 px-3 font-semibold text-[#F8FAFC]">
                      <div>{t.corredor}</div>
                      <span className="text-[10px] text-[#94A3B8]">{t.bairro}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-mono uppercase bg-[#1A2A5A] text-[#93C5FD] px-2 py-0.5 rounded">
                        {t.classeVia.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[#CBD5E1]">{t.extensaoKm} km</td>

                    {/* Hoje */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: t.faixaAtual.cor }}
                        />
                        <span className="font-bold text-white">{t.imvAtual}</span>
                        <span className="text-[10px] text-[#94A3B8]">({t.iriAtual})</span>
                      </div>
                    </td>

                    {/* 12m */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: t.faixa12m.cor }}
                        />
                        <span className="font-bold text-[#CBD5E1]">{t.imv12m}</span>
                        <span className="text-[10px] text-[#94A3B8]">({t.iri12m})</span>
                      </div>
                    </td>

                    {/* 24m */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: t.faixa24m.cor }}
                        />
                        <span className="font-bold text-[#CBD5E1]">{t.imv24m}</span>
                        <span className="text-[10px] text-[#94A3B8]">({t.iri24m})</span>
                      </div>
                    </td>

                    {/* 36m */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: t.faixa36m.cor }}
                        />
                        <span className="font-bold text-[#CBD5E1]">{t.imv36m}</span>
                        <span className="text-[10px] text-[#94A3B8]">({t.iri36m})</span>
                      </div>
                    </td>

                    {/* Mês de Cruzamento */}
                    <td className="py-3 px-3">
                      {t.statusLimiar === 'ja_abaixo' ? (
                        <span className="text-[10px] font-mono font-bold bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Já abaixo (Mês 0)</span>
                        </span>
                      ) : t.statusLimiar === 'cruza_ano_1' ? (
                        <span className="text-[10px] font-mono font-bold bg-[#F97316]/20 text-[#F97316] border border-[#F97316]/40 px-2 py-0.5 rounded w-fit block">
                          Mês +{t.mesCruzamentoLimiar} (Ano 1)
                        </span>
                      ) : t.statusLimiar === 'cruza_ano_2' ? (
                        <span className="text-[10px] font-mono font-bold bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/40 px-2 py-0.5 rounded w-fit block">
                          Mês +{t.mesCruzamentoLimiar} (Ano 2)
                        </span>
                      ) : t.statusLimiar === 'cruza_ano_3' ? (
                        <span className="text-[10px] font-mono font-bold bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40 px-2 py-0.5 rounded w-fit block">
                          Mês +{t.mesCruzamentoLimiar} (Ano 3)
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/20 border border-[#10B981]/40 px-2 py-0.5 rounded w-fit block">
                          Estável (&gt; 36m)
                        </span>
                      )}
                    </td>

                    {/* Narração em linguagem plana */}
                    <td
                      className="py-3 px-3 text-[11px] text-[#CBD5E1] max-w-xs truncate"
                      title={t.narrativaTrecho}
                    >
                      {t.narrativaTrecho}
                    </td>

                    <td className="py-3 px-3 text-right">
                      {onFocusCorridor && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onFocusCorridor(t)
                          }}
                          aria-label={`Ver corredor ${t.corredor} no mapa`}
                          className="min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#3B82F6] hover:text-[#60A5FA] hover:bg-[#3B82F6]/10 inline-flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Mapa</span>
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Rodapé com Selo Honesto de Calibração */}
        <div className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] text-[11px] text-[#94A3B8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
            <span>
              Metodologia: <b className="text-white">{simulation.rotuloHonesto}</b> • Curvas
              paramétricas baseadas na classe da via, volume de tráfego e calibração inercial.
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#64748B] shrink-0">
            Limiar de intervenção padrão: IMV &lt; 70 pts
          </span>
        </div>
      </div>
    </div>
  )
}
