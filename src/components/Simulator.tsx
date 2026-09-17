import React, { useState, useEffect, useRef } from 'react'
import {
  Sparkles,
  Clock,
  Leaf,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  Building,
  ArrowRight,
  Info,
  Layers,
} from 'lucide-react'
import { CityTier } from './Hero'

interface SimulatorProps {
  selectedTier: CityTier
  onSelectTier: (tier: CityTier) => void
}

function useCountUp(targetValue: number, duration: number = 700) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let startTimestamp: number | null = null
    const startVal = 0

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      const current = Math.floor(startVal + (targetValue - startVal) * easeProgress)
      setValue(current)

      if (progress < 1) {
        window.requestAnimationFrame(step)
      } else {
        setValue(targetValue)
      }
    }

    const animId = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(animId)
  }, [targetValue, duration])

  return value
}

export function Simulator({ selectedTier, onSelectTier }: SimulatorProps) {
  // População ajustada inicialmente com base no porte
  const [population, setPopulation] = useState<number>(() => {
    if (selectedTier === 'pequena') return 32000
    if (selectedTier === 'media') return 140000
    return 650000
  })

  // Sincronizar quando mudar o seletor do Hero
  useEffect(() => {
    if (selectedTier === 'pequena' && population > 50000) {
      setPopulation(32000)
    } else if (selectedTier === 'media' && (population < 50000 || population > 300000)) {
      setPopulation(140000)
    } else if (selectedTier === 'grande' && population < 300000) {
      setPopulation(650000)
    }
  }, [selectedTier])

  const [computedSavings, setComputedSavings] = useState<number>(576000)
  const [computedHours, setComputedHours] = useState<number>(192000)
  const [computedCO2, setComputedCO2] = useState<number>(58)
  const [fleetSuggested, setFleetSuggested] = useState<number>(12)
  const [cpsiPilotCost, setCpsiPilotCost] = useState<number>(25000)

  // Recalcular
  useEffect(() => {
    // Estimativa de frota
    const fleet = Math.max(6, Math.round((population / 1000) * 0.28))
    setFleetSuggested(fleet)

    // Custo piloto CPSI:
    const pilot =
      selectedTier === 'pequena'
        ? 24000
        : Math.min(250000, Math.max(25000, Math.round(population * 0.42)))
    setCpsiPilotCost(pilot)

    // Economia anual no asfalto:
    let multiplier = 18.0
    if (selectedTier === 'pequena') multiplier = 17.5 // Foco em tapa-buraco e microrrevestimento
    if (selectedTier === 'media') multiplier = 19.2 // Gestão de OS + Green Light
    if (selectedTier === 'grande') multiplier = 21.0 // Gestão plena de corredores

    const annualSavings = Math.round(population * multiplier)
    const hoursSaved = Math.round(population * 5.8)
    const co2Ton = Math.max(12, Math.round((population / 1000) * 1.7))

    setComputedSavings(annualSavings)
    setComputedHours(hoursSaved)
    setComputedCO2(co2Ton)
  }, [population, selectedTier])

  const formatBRL = (val: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const formatNumberBR = (val: number): string => {
    return new Intl.NumberFormat('pt-BR').format(val)
  }

  const animatedSavings = useCountUp(computedSavings)
  const animatedHours = useCountUp(computedHours)
  const animatedCO2 = useCountUp(computedCO2)

  const scrollToPilot = () => {
    const el = document.getElementById('piloto')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  // Argumentos específicos por porte de cidade
  const tierArguments = {
    pequena: {
      title: 'Argumento para Cidade Pequena (até 50k hab.)',
      badge: 'Zero Custo de Entrada • CPSI em 90 dias • Sem Licitação',
      highlight:
        'A prefeitura pequena não tem equipe de TI nem verba para hardware. O pacote único pré-calibrado entrega mapa de asfalto, one-page do prefeito e dossiê pronto para aprovação no TCE.',
      pills: [
        'Sem licitação tradicional (CPSI LC 182/2021)',
        'Zero obras e zero novos equipamentos',
        'Piloto operacional em 30 dias na frota atual',
      ],
    },
    media: {
      title: 'Argumento para Cidade Média (50k–300k hab.)',
      badge: 'Recupere o Fundo de Multas com Dossiê Blindado',
      highlight:
        'A cidade média arrecada multas de trânsito, mas teme apontamentos do TCE. O ORBIS.UOS gera o nexo causal georreferenciado exigido pelo Art. 320 do CTB para custear a zeladoria.',
      pills: [
        'Central 156+ Preditiva conectada à zeladoria',
        'Sincronização semafórica Green Light Bridge',
        'Proteção contra glosa nas Cortes de Contas',
      ],
    },
    grande: {
      title: 'Argumento para Metrópoles (300k+ hab.)',
      badge: 'Padrão Global ISO • Dados para Financiamentos BID/BNDES',
      highlight:
        'Cidades grandes e regiões metropolitanas necessitam de padrões internacionais e dados estruturados para alavancar linhas de crédito externo e consórcios intermunicipais.',
      pills: [
        'Conformidade ISO 37120, ISO 37122 e ISO 37125',
        'Interoperabilidade GTFS, GTFS-RT, MDS e GBFS',
        'Governança climática ESG e dados para BID/BNDES',
      ],
    },
  }

  const currentArg = tierArguments[selectedTier]

  return (
    <section id="simulador" className="py-24 sm:py-32 relative bg-[#0A1128] scroll-mt-20">
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-[#3B82F6]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Contextual copy with City Tier argumentation */}
          <div className="lg:col-span-6 xl:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101B3A] border border-[#1A2A5A] text-xs font-semibold text-[#3B82F6]">
              <Sparkles className="w-3.5 h-3.5" />
              Simulador por Porte de Cidade
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight leading-[1.15]">
              Simule a Economia e o Retorno para o Seu Município
            </h2>

            <p className="text-base text-[#94A3B8] leading-relaxed">
              Selecione o porte da cidade e veja a economia projetada na manutenção do asfalto, o
              resgate de horas em engarrafamentos e a blindagem jurídica pelo Art. 320 do CTB.
            </p>

            {/* Caixa de Argumento Estratégico por Porte */}
            <div className="p-5 rounded-2xl bg-[#101B3A] border border-[#3B82F6]/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded border border-[#10B981]/40 font-bold">
                  {currentArg.badge}
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#F8FAFC]">{currentArg.title}</h4>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">{currentArg.highlight}</p>
              <div className="space-y-1.5 pt-1 text-xs">
                {currentArg.pills.map((pill, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[#94A3B8]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                    <span>{pill}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs text-[#94A3B8]">
              <Info className="w-4 h-4 text-[#3B82F6] shrink-0" />
              <span>
                Simulação confidencial baseada em parâmetros reais de cidades brasileiras.
              </span>
            </div>
          </div>

          {/* Right Column: Calculator Component */}
          <div className="lg:col-span-6 xl:col-span-7">
            <div className="bg-[#101B3A] border-t-4 border-t-[#3B82F6] border-x border-b border-[#1A2A5A] rounded-2xl p-6 sm:p-8 shadow-2xl relative">
              {/* Seletor de Porte no Topo da Calculadora */}
              <div className="pb-6 mb-6 border-b border-[#1A2A5A] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#F8FAFC] tracking-tight">
                      1º Passo: Porte da Cidade
                    </h3>
                    <p className="text-xs text-[#94A3B8]">
                      Adapta a inteligência espectral e os limites contratuais
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded border border-[#10B981]/30">
                    Art. 320 CTB / LRF
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTier('pequena')
                      setPopulation(32000)
                    }}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedTier === 'pequena'
                        ? 'bg-[#10B981]/20 border-[#10B981] text-white shadow-md'
                        : 'bg-[#0A1128] border-[#1A2A5A] text-[#94A3B8] hover:border-[#3B82F6]/50'
                    }`}
                  >
                    <span className="text-xs font-bold block">Pequena</span>
                    <span className="text-[10px] text-[#94A3B8] block mt-0.5">Até 50k hab.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectTier('media')
                      setPopulation(140000)
                    }}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedTier === 'media'
                        ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-white shadow-md'
                        : 'bg-[#0A1128] border-[#1A2A5A] text-[#94A3B8] hover:border-[#3B82F6]/50'
                    }`}
                  >
                    <span className="text-xs font-bold block">Média</span>
                    <span className="text-[10px] text-[#94A3B8] block mt-0.5">50k–300k hab.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectTier('grande')
                      setPopulation(650000)
                    }}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedTier === 'grande'
                        ? 'bg-[#6366F1]/20 border-[#6366F1] text-white shadow-md'
                        : 'bg-[#0A1128] border-[#1A2A5A] text-[#94A3B8] hover:border-[#3B82F6]/50'
                    }`}
                  >
                    <span className="text-xs font-bold block">Grande</span>
                    <span className="text-[10px] text-[#94A3B8] block mt-0.5">300k+ hab.</span>
                  </button>
                </div>
              </div>

              {/* Slider de População */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="pop-slider" className="text-sm font-semibold text-[#F8FAFC]">
                      População Estimada do Município
                    </label>
                    <span className="text-xs font-mono font-bold text-[#3B82F6] bg-[#1A2A5A] px-2.5 py-0.5 rounded">
                      {population.toLocaleString('pt-BR')} habitantes
                    </span>
                  </div>

                  <input
                    id="pop-slider"
                    type="range"
                    min={
                      selectedTier === 'pequena' ? 5000 : selectedTier === 'media' ? 50000 : 300000
                    }
                    max={
                      selectedTier === 'pequena'
                        ? 50000
                        : selectedTier === 'media'
                          ? 300000
                          : 2500000
                    }
                    step={selectedTier === 'pequena' ? 2000 : 10000}
                    value={population}
                    onChange={(e) => setPopulation(Number(e.target.value))}
                    className="w-full h-2 bg-[#1A2A5A] rounded-lg appearance-none cursor-pointer accent-[#3B82F6]"
                  />
                </div>

                {/* Frota Pública Passiva Sugerida */}
                <div className="p-3 rounded-xl bg-[#0A1128] border border-[#1A2A5A] flex items-center justify-between text-xs">
                  <span className="text-[#94A3B8]">Frota pública sugerida para o SDK Edge:</span>
                  <span className="font-mono font-bold text-[#10B981]">
                    ~{fleetSuggested} veículos (ônibus/coleta)
                  </span>
                </div>
              </div>

              {/* Painel de Resultados */}
              <div className="mt-8 pt-8 border-t border-[#1A2A5A] space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[#3B82F6] flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Economia Anual Projetada em Obras Viárias
                  </h4>
                  <span className="text-[11px] text-[#94A3B8] font-mono">Retorno Imediato</span>
                </div>

                {/* Big Metric */}
                <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#10B981]/40 text-center">
                  <span className="text-xs uppercase tracking-wider text-[#94A3B8] block mb-1">
                    Economia Estimada no Orçamento de Asfalto
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-[#10B981] font-mono">
                    {formatBRL(animatedSavings)}/ ano
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-2 max-w-md mx-auto">
                    {selectedTier === 'pequena'
                      ? 'Eliminação de compra emergencial de asfalto frio e substituição por microrrevestimento programado.'
                      : 'Auditoria contínua da malha viária combinada a ordens de serviço preventivas e otimização semafórica.'}
                  </p>
                </div>

                {/* Sub Métricas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
                    <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                      <span>Tempo Poupado no Trânsito</span>
                      <Clock className="w-3.5 h-3.5 text-[#3B82F6]" />
                    </div>
                    <div className="text-2xl font-bold text-[#F8FAFC] font-mono">
                      {formatNumberBR(animatedHours)} h
                    </div>
                    <p className="text-[11px] text-[#94A3B8] mt-1">
                      horas/ano devolvidas à população
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
                    <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                      <span>Descarbonização</span>
                      <Leaf className="w-3.5 h-3.5 text-[#10B981]" />
                    </div>
                    <div className="text-2xl font-bold text-[#10B981] font-mono">
                      -{formatNumberBR(animatedCO2)} ton
                    </div>
                    <p className="text-[11px] text-[#94A3B8] mt-1">emissões de CO₂ evitadas/ano</p>
                  </div>
                </div>

                {/* CPSI Callout */}
                <div className="p-4 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-xs text-[#F8FAFC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-[#3B82F6] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#F8FAFC] block">
                        Viabilidade Orçamentária 100% Assegurada (Art. 320 CTB)
                      </span>
                      <span className="text-[#94A3B8]">
                        Piloto estimado em {formatBRL(cpsiPilotCost)}, integralmente elegível para
                        custeio pelo Fundo Municipal de Multas (Lei nº 9.503/1997).
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={scrollToPilot}
                    className="shrink-0 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] transition-colors"
                  >
                    Solicitar Proposta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
