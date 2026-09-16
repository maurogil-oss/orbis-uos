import { useState, useEffect, useRef } from 'react'
import {
  TrendingUp,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  Leaf,
  ShieldCheck,
} from 'lucide-react'

// Hook for count-up animation over 800ms
function useCountUp(targetValue: number, duration: number = 800, active: boolean = true) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) {
      setValue(0)
      return
    }

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
  }, [targetValue, duration, active])

  return value
}

export function Simulator() {
  // Inputs state alinhados com o original Orbis UOS
  const [population, setPopulation] = useState<number>(120000)
  const [objective, setObjective] = useState<string>('asfalto') // 'asfalto' | 'greenlight' | 'visaozero' | 'gestaoplena'

  // Calculation results state
  const [hasCalculated, setHasCalculated] = useState<boolean>(true)
  const [computedSavings, setComputedSavings] = useState<number>(2052000)
  const [computedHours, setComputedHours] = useState<number>(720000)
  const [computedCO2, setComputedCO2] = useState<number>(216)
  const [fleetSuggested, setFleetSuggested] = useState<number>(34)
  const [cpsiPilotCost, setCpsiPilotCost] = useState<number>(54000)

  const resultsRef = useRef<HTMLDivElement>(null)

  // Recalculate whenever inputs change
  useEffect(() => {
    // Frota pública estimada: ~0.28 veículos a cada 1.000 habitantes
    const fleet = Math.max(8, Math.round((population / 1000) * 0.28))
    setFleetSuggested(fleet)

    // Custo piloto CPSI 90 dias: ~R$ 0,45 por habitante (com mínimo R$ 25k e teto R$ 250k)
    const pilot = Math.min(250000, Math.max(25000, Math.round(population * 0.45)))
    setCpsiPilotCost(pilot)

    // Economia anual projetada no asfalto:
    // Base: R$ 17,10 / habitante / ano em recapeamento evitado
    let multiplier = 17.1
    if (objective === 'asfalto') multiplier = 18.5
    if (objective === 'greenlight') multiplier = 15.2
    if (objective === 'visaozero') multiplier = 16.0
    if (objective === 'gestaoplena') multiplier = 22.0

    const annualSavings = Math.round(population * multiplier)
    const hoursSaved = Math.round(population * 6.0)
    const co2Ton = Math.max(15, Math.round((population / 1000) * 1.8))

    setComputedSavings(annualSavings)
    setComputedHours(hoursSaved)
    setComputedCO2(co2Ton)
  }, [population, objective])

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

  const animatedSavings = useCountUp(computedSavings, 600, hasCalculated)
  const animatedHours = useCountUp(computedHours, 600, hasCalculated)
  const animatedCO2 = useCountUp(computedCO2, 600, hasCalculated)

  const presets = [
    { label: '20k (Pequeno porte)', value: 20000 },
    { label: '120k (Médio porte)', value: 120000 },
    { label: '500k+ (Grande polo)', value: 500000 },
    { label: '1.5M+ (Metrópole)', value: 1500000 },
  ]

  const scrollToPilot = () => {
    const el = document.getElementById('piloto')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="simulador" className="py-24 sm:py-32 relative bg-[#0A1128] scroll-mt-20">
      {/* Background radial accent */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-[#3B82F6]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column (55% / 5 cols): Contextual copy */}
          <div className="lg:col-span-6 xl:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101B3A] border border-[#1A2A5A] text-xs font-semibold text-[#3B82F6]">
              <Sparkles className="w-3.5 h-3.5" />
              Simulador Instantâneo de Retorno Público
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight leading-[1.15]">
              Estime o Impacto Financeiro para a Sua Cidade
            </h2>

            <p className="text-base text-[#94A3B8] leading-relaxed">
              Ajuste a população do município e veja a projeção imediata de economia na rubrica de
              asfalto, redução de emissões e elegibilidade orçamentária pelo Art. 320 do CTB.
            </p>

            {/* Drivers list */}
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-[#101B3A]/60 border border-[#1A2A5A] flex items-start gap-4 hover:border-[#3B82F6]/40 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5 text-[#3B82F6]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#F8FAFC]">
                    1. Asfalto Preventivo vs. Emergencial
                  </h4>
                  <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                    Substituição da compra emergencial de asfalto frio (tapa-buraco 8x mais caro)
                    por microrrevestimento programado baseado em telemetria inercial contínua.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#101B3A]/60 border border-[#1A2A5A] flex items-start gap-4 hover:border-[#3B82F6]/40 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5 text-[#3B82F6]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#F8FAFC]">
                    2. Google Green Light & Fluidez
                  </h4>
                  <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                    Ondas verdes semafóricas sem necessidade de quebrar o pavimento. Menos
                    retenções, menos combustível gasto pela frota e menos emissões de CO₂.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#101B3A]/60 border border-[#1A2A5A] flex items-start gap-4 hover:border-[#3B82F6]/40 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5 text-[#3B82F6]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#F8FAFC]">
                    3. Frota Pública Existente (Zero CAPEX)
                  </h4>
                  <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                    Aproveitamento de smartphones em ônibus e caminhões municipais já em operação.
                    Nenhum sensor proprietário adquirido.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs text-[#94A3B8]">
              <Info className="w-4 h-4 text-[#3B82F6] shrink-0" />
              <span>Simulação confidencial. Nenhum dado institucional é gravado nesta etapa.</span>
            </div>
          </div>

          {/* Right Column (45% / 7 cols): Interactive Calculator Card */}
          <div className="lg:col-span-6 xl:col-span-7">
            <div className="bg-[#101B3A] border-t-4 border-t-[#3B82F6] border-x border-b border-[#1A2A5A] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40 relative">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#1A2A5A]">
                <div>
                  <h3 className="text-xl font-bold text-[#F8FAFC] tracking-tight">
                    Simulador Municipal de Retorno Orbis
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Parâmetros calibrados para cidades brasileiras
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded bg-[#1A2A5A] text-[11px] font-medium text-[#94A3B8]">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#3B82F6]" />
                  Art. 320 CTB / LRF
                </div>
              </div>

              <div className="space-y-6">
                {/* 1. Population Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="pop-slider"
                      className="text-sm font-semibold text-[#F8FAFC] flex items-center gap-2"
                    >
                      <span>População Estimada do Município</span>
                    </label>
                    <span className="text-xs font-mono font-bold text-[#3B82F6] bg-[#1A2A5A] px-2.5 py-0.5 rounded">
                      {population.toLocaleString('pt-BR')} hab.
                    </span>
                  </div>

                  <input
                    id="pop-slider"
                    type="range"
                    min={10000}
                    max={2000000}
                    step={10000}
                    value={population}
                    onChange={(e) => {
                      setPopulation(Number(e.target.value))
                      setHasCalculated(true)
                    }}
                    className="w-full h-2 bg-[#1A2A5A] rounded-lg appearance-none cursor-pointer accent-[#3B82F6]"
                  />

                  {/* Preset Pills */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {presets.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => {
                          setPopulation(preset.value)
                          setHasCalculated(true)
                        }}
                        className={`text-[11px] px-3 py-1 rounded-full border transition-all ${
                          population === preset.value
                            ? 'bg-[#3B82F6] text-white border-[#3B82F6]'
                            : 'bg-[#0A1128] text-[#94A3B8] border-[#1A2A5A] hover:border-[#3B82F6]/50'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Strategic Objective Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#F8FAFC] block">
                    Objetivo Estratégico Prioritário
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      {
                        id: 'asfalto',
                        label: '1. Asfalto & Zero Cratera',
                        sub: 'Índice IRI e recapeamento',
                      },
                      {
                        id: 'greenlight',
                        label: '2. Google Green Light',
                        sub: 'Ondas verdes semafóricas',
                      },
                      {
                        id: 'visaozero',
                        label: '3. Visão Zero & Escolas',
                        sub: 'Prevenção de sinistros',
                      },
                      {
                        id: 'gestaoplena',
                        label: '4. Gestão Plena (4 Pilares)',
                        sub: 'Art. 320 CTB & TCE',
                      },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setObjective(opt.id)
                          setHasCalculated(true)
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          objective === opt.id
                            ? 'bg-[#3B82F6]/15 border-[#3B82F6] text-[#F8FAFC]'
                            : 'bg-[#0A1128] border-[#1A2A5A] text-[#94A3B8] hover:border-[#3B82F6]/40'
                        }`}
                      >
                        <span className="font-bold block text-[#F8FAFC]">{opt.label}</span>
                        <span className="text-[10px] text-[#94A3B8] block mt-0.5">{opt.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fleet suggestion indicator */}
                <div className="p-3 rounded-xl bg-[#0A1128] border border-[#1A2A5A] flex items-center justify-between text-xs">
                  <span className="text-[#94A3B8]">
                    Frota pública sugerida para embarque passivo:
                  </span>
                  <span className="font-mono font-bold text-[#10B981]">
                    ~{fleetSuggested} veículos (ônibus/coleta)
                  </span>
                </div>
              </div>

              {/* Results Panel */}
              <div
                ref={resultsRef}
                className="mt-8 pt-8 border-t border-[#1A2A5A] animate-simulator-results space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[#3B82F6] flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Economia Anual Projetada no Asfalto
                  </h4>
                  <span className="text-[11px] text-[#94A3B8] font-mono">Simulação Anual</span>
                </div>

                {/* Centerpiece Big Metric */}
                <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#10B981]/40 text-center">
                  <span className="text-xs uppercase tracking-wider text-[#94A3B8] block mb-1">
                    Economia Estimada em Obras Viárias
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-[#10B981] font-mono">
                    {formatBRL(animatedSavings)}/ ano
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-2 max-w-md mx-auto">
                    Substituição da compra emergencial de asfalto frio por microrrevestimento
                    programado e auditoria contínua da malha.
                  </p>
                </div>

                {/* 2 Sub Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
                    <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                      <span>Fluidez Urbana</span>
                      <Clock className="w-3.5 h-3.5 text-[#3B82F6]" />
                    </div>
                    <div className="text-2xl font-bold text-[#F8FAFC] font-mono">
                      {formatNumberBR(animatedHours)} h
                    </div>
                    <p className="text-[11px] text-[#94A3B8] mt-1">economizadas em filas</p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
                    <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                      <span>Descarbonização</span>
                      <Leaf className="w-3.5 h-3.5 text-[#10B981]" />
                    </div>
                    <div className="text-2xl font-bold text-[#10B981] font-mono">
                      -{formatNumberBR(animatedCO2)} ton
                    </div>
                    <p className="text-[11px] text-[#94A3B8] mt-1">emissões de CO₂/ano poupadas</p>
                  </div>
                </div>

                {/* CPSI Viability Callout */}
                <div className="p-4 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-xs text-[#F8FAFC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-[#3B82F6] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#F8FAFC] block">
                        Viabilidade Orçamentária 100% Assegurada (Art. 320 CTB)
                      </span>
                      <span className="text-[#94A3B8]">
                        O Piloto CPSI de 90 dias possui estimativa de {formatBRL(cpsiPilotCost)},
                        integralmente elegível para empenho pelo Fundo de Multas ou compensação na
                        própria economia gerada no asfalto.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={scrollToPilot}
                    className="shrink-0 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] transition-colors"
                  >
                    Solicitar Proposta CPSI
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
