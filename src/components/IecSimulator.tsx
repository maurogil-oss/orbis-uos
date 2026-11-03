import React, { useState, useMemo } from 'react'
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  Info,
  Sliders,
  CheckCircle2,
  Gauge,
  HelpCircle,
  Building2,
  Zap,
} from 'lucide-react'
import {
  calculateKineticStressIndex,
  getIecNivel,
  IEC_SIMULATOR_SCENARIOS,
  IecCenarioPreset,
  IEC_NIVEIS,
  KineticStressInput,
} from '@/lib/diagnostics/iecEngine'

interface IecSimulatorProps {
  initialScenario?: IecCenarioPreset
  onScenarioChange?: (scenario: IecCenarioPreset) => void
  showTitle?: boolean
}

export function IecSimulator({
  initialScenario = 'Normal',
  onScenarioChange,
  showTitle = true,
}: IecSimulatorProps) {
  const [selectedScenario, setSelectedScenario] = useState<IecCenarioPreset>(initialScenario)
  const [isCustom, setIsCustom] = useState<boolean>(false)

  // Sliders ajustáveis inicializados com o cenário selecionado
  const activePreset = IEC_SIMULATOR_SCENARIOS[selectedScenario]
  const [customParams, setCustomParams] = useState<KineticStressInput>(() => activePreset.input)

  const handleSelectScenario = (preset: IecCenarioPreset) => {
    setSelectedScenario(preset)
    setIsCustom(false)
    setCustomParams(IEC_SIMULATOR_SCENARIOS[preset].input)
    if (onScenarioChange) onScenarioChange(preset)
  }

  const handleParamChange = (key: keyof KineticStressInput, value: number) => {
    setIsCustom(true)
    setCustomParams((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Única fonte de verdade: calculateKineticStressIndex
  const result = useMemo(() => {
    return calculateKineticStressIndex(customParams)
  }, [customParams])

  const nivel = result.nivel

  return (
    <div className="bg-[#101B3A] border border-[#1A2A5A] rounded-2xl p-5 sm:p-7 space-y-6 text-[#F8FAFC]">
      {/* Top Header */}
      {showTitle && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#1A2A5A]">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#38BDF8] bg-[#38BDF8]/15 px-2.5 py-0.5 rounded border border-[#38BDF8]/30">
                Simulador Interativo
              </span>
              <span className="text-xs font-mono text-[#10B981] bg-[#10B981]/15 px-2.5 py-0.5 rounded border border-[#10B981]/30 flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>LGPD: dado físico, não pessoal</span>
              </span>
              <span className="text-[10px] font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/30">
                hipótese a validar em campo
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#38BDF8]" />
              <span>IEC • Índice de Estresse Cinemático</span>
            </h3>
            <p className="text-xs text-[#94A3B8] mt-1 max-w-2xl leading-relaxed">
              Tagline institucional: <b>"IMV mede a via; IEC mede o comportamento sobre a via."</b>{' '}
              Mede a tensão mecânica e inercial da condução via telemetria acelerométrica passiva —
              sem biometria, sem neurodados, zero PII.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-[#94A3B8] font-mono hidden sm:inline">
              Ambiente: Simulação modelada
            </span>
          </div>
        </div>
      )}

      {/* Cenários Prescritos pelo Usuário (Normal, Moderada, Frenagem Brusca) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-[#CBD5E1] flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Alternar Cenários Oficiais da Simulação:</span>
          </label>
          {isCustom && (
            <span className="text-[10px] font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/30">
              Modo Personalizado Ativo
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['Normal', 'Moderada', 'Frenagem Brusca'] as IecCenarioPreset[]).map((cenarioId) => {
            const isSelected = selectedScenario === cenarioId && !isCustom
            const preset = IEC_SIMULATOR_SCENARIOS[cenarioId]
            const presetResult = calculateKineticStressIndex(preset.input)

            return (
              <button
                key={cenarioId}
                type="button"
                onClick={() => handleSelectScenario(cenarioId)}
                className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] ${
                  isSelected
                    ? 'bg-[#0A1128] border-[#38BDF8] shadow-lg shadow-[#38BDF8]/10'
                    : 'bg-[#0A1128]/70 border-[#1A2A5A] hover:border-[#38BDF8]/40 text-[#CBD5E1]'
                }`}
                aria-pressed={isSelected}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    {cenarioId === 'Normal' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                    )}
                    {cenarioId === 'Moderada' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                    )}
                    {cenarioId === 'Frenagem Brusca' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                    )}
                    <span>{cenarioId}</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${presetResult.nivel.corTailwindBadge}`}
                  >
                    IEC {presetResult.score} • {presetResult.nivel.nome}
                  </span>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed line-clamp-2">
                  {preset.descricao}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Box de Resultado do IEC em Tempo Real */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Gauge / Score Principal */}
        <div className="lg:col-span-5 bg-[#0A1128] border border-[#1A2A5A] rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-[#38BDF8]" />
              <span>Score IEC Oficial</span>
            </span>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${nivel.corTailwindBadge}`}
            >
              {nivel.nome}
            </span>
          </div>

          <div className="text-center py-2">
            <div
              className="text-5xl sm:text-6xl font-black font-mono tracking-tight transition-all duration-300"
              style={{ color: nivel.corHex }}
            >
              {result.score}
            </div>
            <div className="text-xs font-mono text-[#94A3B8] mt-1">
              Escala de 0 a 100 • Faixa: {nivel.min} a {nivel.max}
            </div>
          </div>

          {/* Barra de Progresso Segmentada na Escala de 4 Níveis */}
          <div className="space-y-1.5">
            <div className="h-2.5 w-full bg-[#1A2A5A] rounded-full overflow-hidden flex relative">
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${result.score}%`,
                  backgroundColor: nivel.corHex,
                }}
              />
            </div>
            <div className="grid grid-cols-4 text-[9px] font-mono text-[#64748B] text-center pt-0.5">
              <span className="text-[#10B981]">0-24 Fluida</span>
              <span className="text-[#06B6D4]">25-49 Estável</span>
              <span className="text-[#F59E0B]">50-74 Elevada</span>
              <span className="text-[#EF4444]">75-100 Crítico</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#101B3A]/80 border border-[#1A2A5A] text-[11px] text-[#CBD5E1] space-y-1">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <span>Padrão Físico Observado:</span>
            </div>
            <p className="text-[#94A3B8] leading-relaxed">{nivel.padraoFisico}</p>
            <div className="text-[10px] text-[#38BDF8] pt-1 border-t border-[#1A2A5A]">
              <b>Risco de Colisão Traseira:</b> {nivel.riscoColisao}
            </div>
          </div>
        </div>

        {/* Ação Recomendada ao Órgão Municipal & Tripé Físico */}
        <div className="lg:col-span-7 bg-[#0A1128] border border-[#1A2A5A] rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1A2A5A]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC] flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#10B981]" />
                <span>Ação Recomendada ao Órgão Municipal:</span>
              </span>
              <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/30">
                Engenharia & Tráfego
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] text-xs text-[#CBD5E1] leading-relaxed space-y-2">
              <p className="font-medium text-white">{nivel.acaoRecomendadaMunicipal}</p>
              <p className="text-[11px] text-[#94A3B8]">
                <b>Leitura de Causa Provável:</b> Quando múltiplos veículos acumulam tensão elevada
                ou estresse crítico no <em>mesmo segmento de 100m</em>, a causa é quase sempre
                defeito de engenharia (falta de visibilidade, buraco, redutor não sinalizado ou
                retenção abrupta), e não culpa isolada de um motorista. O IEC fecha o círculo
                diagnóstico com o IMV.
              </p>
            </div>

            {/* Decomposição do Tripé Físico da Condução */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                Decomposição dos Fatores Inerciais:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-[#101B3A] border border-[#1A2A5A]">
                  <span className="text-[10px] text-[#94A3B8] block">Frenagem (40%)</span>
                  <span className="font-mono font-bold text-[#F8FAFC]">
                    {result.fatores.frenagem} pts
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-[#101B3A] border border-[#1A2A5A]">
                  <span className="text-[10px] text-[#94A3B8] block">Aceleração (25%)</span>
                  <span className="font-mono font-bold text-[#F8FAFC]">
                    {result.fatores.aceleracao} pts
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-[#101B3A] border border-[#1A2A5A]">
                  <span className="text-[10px] text-[#94A3B8] block">Oscilação (20%)</span>
                  <span className="font-mono font-bold text-[#F8FAFC]">
                    {result.fatores.oscilacao} pts
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-[#101B3A] border border-[#1A2A5A]">
                  <span className="text-[10px] text-[#94A3B8] block">Aproximação (15%)</span>
                  <span className="font-mono font-bold text-[#F8FAFC]">
                    {result.fatores.aproximacao} pts
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Selo LGPD e Aviso Metodológico */}
          <div className="pt-3 border-t border-[#1A2A5A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-[#94A3B8]">
            <div className="flex items-center gap-1.5 text-[#10B981]">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>
                <b>Selo LGPD:</b> Apenas dado físico de inércia. Sem identificador pessoal, sem
                placa.
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#F59E0B]">
              Validação em campo pendente
            </span>
          </div>
        </div>
      </div>

      {/* Controles Físicos Avançados (Micro-ajustes de física inercial) */}
      <div className="p-4 rounded-xl bg-[#0A1128]/70 border border-[#1A2A5A] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#CBD5E1] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Calibração Fina dos Parâmetros Físicos Inerciais:</span>
          </span>
          <span className="text-[10px] font-mono text-[#94A3B8]">
            Ajuste fino altera o cálculo oficial imediatamente
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Freadas Bruscas */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#94A3B8]">Freadas Bruscas (&gt;0.35g):</span>
              <span className="font-mono font-bold text-white">
                {customParams.frenagensBruscasTaxa?.toFixed(1)}/min
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={6}
              step={0.1}
              value={customParams.frenagensBruscasTaxa ?? 0}
              onChange={(e) => handleParamChange('frenagensBruscasTaxa', Number(e.target.value))}
              className="w-full h-1.5 bg-[#1A2A5A] rounded-lg appearance-none cursor-pointer accent-[#EF4444]"
              aria-label="Frequência de freadas bruscas"
            />
          </div>

          {/* Intensidade de Desaceleração */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#94A3B8]">Pico Desaceleração:</span>
              <span className="font-mono font-bold text-white">
                {customParams.intensidadeDesaceleracaoG?.toFixed(2)}g
              </span>
            </div>
            <input
              type="range"
              min={0.1}
              max={0.9}
              step={0.02}
              value={customParams.intensidadeDesaceleracaoG ?? 0.2}
              onChange={(e) =>
                handleParamChange('intensidadeDesaceleracaoG', Number(e.target.value))
              }
              className="w-full h-1.5 bg-[#1A2A5A] rounded-lg appearance-none cursor-pointer accent-[#F59E0B]"
              aria-label="Intensidade de desaceleração em g"
            />
          </div>

          {/* Acelerações Súbitas */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#94A3B8]">Acelerações Súbitas:</span>
              <span className="font-mono font-bold text-white">
                {customParams.aceleracoesSubitasTaxa?.toFixed(1)}/min
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={5}
              step={0.1}
              value={customParams.aceleracoesSubitasTaxa ?? 0}
              onChange={(e) => handleParamChange('aceleracoesSubitasTaxa', Number(e.target.value))}
              className="w-full h-1.5 bg-[#1A2A5A] rounded-lg appearance-none cursor-pointer accent-[#06B6D4]"
              aria-label="Taxa de acelerações súbitas"
            />
          </div>

          {/* Oscilação de Velocidade */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#94A3B8]">Oscilação Vel. (desvio):</span>
              <span className="font-mono font-bold text-white">
                ±{customParams.oscilacaoVelocidadeKmh?.toFixed(1)} km/h
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={22}
              step={0.5}
              value={customParams.oscilacaoVelocidadeKmh ?? 2}
              onChange={(e) => handleParamChange('oscilacaoVelocidadeKmh', Number(e.target.value))}
              className="w-full h-1.5 bg-[#1A2A5A] rounded-lg appearance-none cursor-pointer accent-[#10B981]"
              aria-label="Oscilação de velocidade em km/h"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
