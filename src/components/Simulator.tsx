import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Clock,
  Leaf,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Info,
  FileText,
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

  // Argumentos específicos por porte de cidade - Enquadramento Institucional e Marco Legal
  const tierArguments = {
    pequena: {
      title: 'Enquadramento Institucional para Municípios até 50k hab.',
      badge: 'Sem obra • Sem novos equipamentos • LC 182/2021 (CPSI)',
      highlight:
        'A gestão municipal prioriza o uso eficiente de cada centavo público. Com a frota que já circula pela cidade (coleta, fiscalização, vans escolares), o município audita o pavimento sem comprar hardware e gera o diagnóstico preliminar com respaldo para as Cortes de Contas.',
      pills: [
        'Adesão por Contrato Público para Solução Inovadora (LC 182/2021)',
        'Zero intervenção física ou obras de infraestrutura',
        'Diagnóstico preliminar em 30 dias na frota existente',
      ],
    },
    media: {
      title: 'Enquadramento Institucional para Municípios de 50k–300k hab. (Onda 2)',
      badge: 'Onda 2 (Expansão): Green Light Bridge + Meio-fio & Vagas • Art. 320 CTB',
      highlight:
        'Recursos do Fundo Municipal de Multas empregados com comprovação estrita de nexo causal georreferenciado na engenharia viária. A cidade média planeja os módulos da Onda 2: insumos de sincronismo semafórico para engenharia de tráfego e auditoria de meio-fio/vagas pela frota pública passiva.',
      pills: [
        'Green Light Bridge: insumos para até 22% de redução potencial de atraso arterial',
        'Meio-fio & Vagas: auditoria passiva de calçadas, faixa amarela e idoso/PCD',
        'Custo Evitado em combustível da frota pública e segurança jurídica no TCE',
      ],
    },
    grande: {
      title: 'Enquadramento para Metrópoles e Consórcios Intermunicipais',
      badge: 'Padrão Global ISO • Governança Federativa e Cooperação',
      highlight:
        'Malha viária estrutural integrada com protocolos abertos, governança de corredores de alta demanda e dados para alavancar linhas de financiamento de desenvolvimento urbano (BNDES/BID) e consórcios intermunicipais.',
      pills: [
        'Conformidade técnica às normas ISO 37120, ISO 37122 e ISO 37125',
        'Integração federativa e cooperação intermunicipal',
        'Gêmeo digital e transparência ativa para o cidadão e a imprensa',
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
              Dimensionamento Institucional
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight leading-[1.15]">
              Dimensione o Impacto do Piloto no Seu Município
            </h2>

            <p className="text-base text-[#94A3B8] leading-relaxed">
              Consulte a projeção de recursos públicos recuperados na manutenção do pavimento, o
              impacto positivo no orçamento municipal e a viabilidade estrita dentro do marco legal
              da Lei Complementar nº 182/2021 e do Art. 320 do CTB.
            </p>

            {/* Caixa de Argumento Estratégico por Porte */}
            <div className="p-5 rounded-2xl bg-[#101B3A] border border-[#3B82F6]/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase bg-[#10B981]/20 text-[#10B981] px-2.5 py-0.5 rounded border border-[#10B981]/40 font-semibold">
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
                    <span className="text-xs text-[#94A3B8] block mt-0.5">Até 50k hab.</span>
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
                    <span className="text-xs text-[#94A3B8] block mt-0.5">50k–300k hab.</span>
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
                    <span className="text-xs text-[#94A3B8] block mt-0.5">300k+ hab.</span>
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
                    Impacto no Orçamento Público Municipal
                  </h4>
                  <span className="text-xs text-[#94A3B8] font-medium">Recursos Recuperados</span>
                </div>

                {/* Big Metric com Link Direto para Metodologia */}
                <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#10B981]/40 text-center">
                  <span className="text-xs uppercase tracking-wider text-[#94A3B8] block mb-1">
                    Recursos Públicos Recuperados com Manutenção Preventiva
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-[#10B981] font-mono">
                    {formatBRL(animatedSavings)}/ ano
                  </div>

                  {/* FRENTE 2: Link imediatamente sob o valor calculado para resolver "de onde vem isso" */}
                  <div className="mt-2.5 mb-2">
                    <Link
                      to="/metodologia"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#38BDF8] hover:text-[#60A5FA] underline-offset-4 hover:underline transition-colors px-3 py-1 rounded-full bg-[#38BDF8]/10 hover:bg-[#38BDF8]/20 border border-[#38BDF8]/30"
                      title="Ver fundamentação científica, equações de IRI e matriz de coeficientes por porte"
                    >
                      <span>Ver a metodologia de cálculo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <p className="text-xs text-[#94A3B8] mt-2 max-w-md mx-auto">
                    {selectedTier === 'pequena'
                      ? 'Substituição gradual de compras emergenciais de massa asfáltica por intervenções programadas com microrrevestimento e nexo causal.'
                      : 'Auditoria contínua da malha viária, ordens de serviço preventivas e otimização de rotas com evidências técnicas.'}
                  </p>
                </div>

                {/* Sub Métricas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
                    <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                      <span>Tempo Poupado pela População</span>
                      <Clock className="w-3.5 h-3.5 text-[#3B82F6]" />
                    </div>
                    <div className="text-2xl font-bold text-[#F8FAFC] font-mono">
                      {formatNumberBR(animatedHours)} h
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      horas anuais devolvidas aos cidadãos no trânsito
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
                    <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                      <span>Descarbonização Urbana</span>
                      <Leaf className="w-3.5 h-3.5 text-[#10B981]" />
                    </div>
                    <div className="text-2xl font-bold text-[#10B981] font-mono">
                      -{formatNumberBR(animatedCO2)} ton
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-1">emissões de CO₂ evitadas por ano</p>
                  </div>
                </div>

                {/* CPSI Callout */}
                <div className="p-4 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-xs text-[#F8FAFC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-[#3B82F6] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#F8FAFC] block">
                        Viabilidade Dentro do Marco Legal (LC 182/2021 & Art. 320 CTB)
                      </span>
                      <span className="text-[#94A3B8]">
                        Piloto estimado em {formatBRL(cpsiPilotCost)}, 100% elegível ao Fundo
                        Municipal de Multas ou compensado nos ganhos de zeladoria preventiva.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={scrollToPilot}
                    className="shrink-0 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] transition-colors"
                  >
                    Manifestar Interesse
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
