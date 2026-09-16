import React, { useState, useEffect, useRef } from 'react'
import {
  TrendingUp,
  Clock,
  DollarSign,
  ArrowUpRight,
  Minus,
  Plus,
  Sparkles,
  Info,
  CheckCircle2,
  FileSpreadsheet,
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
      // Ease out cubic
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
  // Inputs state
  const [employees, setEmployees] = useState<number>(500)
  const [salaryRaw, setSalaryRaw] = useState<number>(6000)
  const [salaryInput, setSalaryInput] = useState<string>('6.000,00')
  const [discretionarySpend, setDiscretionarySpend] = useState<number>(30) // 30%

  // Calculation results state
  const [hasCalculated, setHasCalculated] = useState<boolean>(false)
  const [computedAnnualSavings, setComputedAnnualSavings] = useState<number>(0)
  const [computedHoursSaved, setComputedHoursSaved] = useState<number>(0)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Format currency helpers
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

  // Handle salary input with formatting
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Keep only digits
    const digitsOnly = e.target.value.replace(/\D/g, '')
    if (!digitsOnly) {
      setSalaryRaw(0)
      setSalaryInput('0,00')
      return
    }

    const numericValue = parseInt(digitsOnly, 10) / 100
    setSalaryRaw(numericValue)

    // Formatar como moeda BR sem símbolo
    const formatted = numericValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    setSalaryInput(formatted)
  }

  // Stepper handlers
  const handleDecrementEmployees = () => {
    setEmployees((prev) => Math.max(100, prev - 100))
  }

  const handleIncrementEmployees = () => {
    setEmployees((prev) => Math.min(10000, prev + 100))
  }

  const handleEmployeesSlider = (val: number) => {
    const clamped = Math.max(100, Math.min(10000, Math.round(val / 100) * 100))
    setEmployees(clamped)
  }

  // Calculate Impact formula:
  // (employees * monthlySalary * 12) * (0.15 + discretionarySpend * 0.05)
  // where discretionarySpend is expressed as fraction (e.g. 0.30)
  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault()

    const discRatio = discretionarySpend / 100
    const annualPayroll = employees * salaryRaw * 12
    const savingsRatio = 0.15 + discRatio * 0.05
    const annualSavings = Math.round(annualPayroll * savingsRatio)
    const hoursSaved = employees * 40

    setComputedAnnualSavings(annualSavings)
    setComputedHoursSaved(hoursSaved)
    setHasCalculated(true)

    // Auto-scroll slightly to results on mobile
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }, 100)
  }

  // Count up animated values
  const animatedSavings = useCountUp(computedAnnualSavings, 800, hasCalculated)
  const animatedHours = useCountUp(computedHoursSaved, 800, hasCalculated)

  return (
    <section id="simulador" className="py-24 sm:py-32 relative bg-[#0A1128] scroll-mt-20">
      {/* Background radial accent */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-[#3B82F6]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column (55% / 7 cols): Contextual copy and driver levers */}
          <div className="lg:col-span-6 xl:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101B3A] border border-[#1A2A5A] text-xs font-semibold text-[#3B82F6]">
              <Sparkles className="w-3.5 h-3.5" />
              Simulador Interativo B2G
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight leading-[1.15]">
              Calcule em 30 segundos o impacto da Orbis UOS no orçamento do seu órgão.
            </h2>

            <p className="text-base text-[#94A3B8] leading-relaxed">
              Desenvolvido com base em auditorias e benchmarks consolidados da gestão pública
              brasileira. Nossa tecnologia atua diretamente nos 3 principais fatores de dispersão
              orçamentária:
            </p>

            {/* Drivers list */}
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-[#101B3A]/60 border border-[#1A2A5A] flex items-start gap-4 hover:border-[#3B82F6]/40 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5 text-[#3B82F6]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#F8FAFC]">
                    1. Automação de Rotinas Burocráticas
                  </h4>
                  <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                    Eliminação de retrabalho manual em processos de compras, aprovações e
                    liquidações contábeis.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#101B3A]/60 border border-[#1A2A5A] flex items-start gap-4 hover:border-[#3B82F6]/40 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5 text-[#3B82F6]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#F8FAFC]">
                    2. Racionalização de Gastos Discricionários
                  </h4>
                  <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                    Contratos continuados, materiais de consumo e serviços terceirizados
                    renegociados via inteligência de preços públicos.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#101B3A]/60 border border-[#1A2A5A] flex items-start gap-4 hover:border-[#3B82F6]/40 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5 text-[#3B82F6]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#F8FAFC]">
                    3. Alocação Estratégica da Folha
                  </h4>
                  <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                    Liberação média de 40 horas anuais por servidor para atendimento direto ao
                    cidadão e projetos prioritários.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs text-[#94A3B8]">
              <Info className="w-4 h-4 text-[#3B82F6] shrink-0" />
              <span>Simulação confidencial. Nenhum dado institucional é gravado nesta etapa.</span>
            </div>
          </div>

          {/* Right Column (45% / 6 cols): Interactive Calculator Card */}
          <div className="lg:col-span-6 xl:col-span-7">
            <div className="bg-[#101B3A] border-t-4 border-t-[#3B82F6] border-x border-b border-[#1A2A5A] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40 relative">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#1A2A5A]">
                <div>
                  <h3 className="text-xl font-bold text-[#F8FAFC] tracking-tight">
                    Simulador de Eficiência Operacional
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Insira os dados estimados do seu órgão público
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded bg-[#1A2A5A] text-[11px] font-medium text-[#94A3B8]">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#3B82F6]" />
                  Base LRF / TCU
                </div>
              </div>

              <form onSubmit={handleCalculate} className="space-y-6">
                {/* 1. Employee Count Input with Stepper */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="employees-input"
                      className="text-sm font-semibold text-[#F8FAFC]"
                    >
                      Número de Funcionários (Servidores)
                    </label>
                    <span className="text-xs font-mono font-bold text-[#3B82F6] bg-[#1A2A5A] px-2.5 py-0.5 rounded">
                      {employees.toLocaleString('pt-BR')} servidores
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleDecrementEmployees}
                      disabled={employees <= 100}
                      className="w-12 h-12 rounded-xl bg-[#1A2A5A] hover:bg-[#2563EB]/20 border border-[#1A2A5A] hover:border-[#3B82F6] text-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
                      aria-label="Diminuir 100 servidores"
                    >
                      <Minus className="w-5 h-5" />
                    </button>

                    <div className="flex-1 relative">
                      <input
                        id="employees-input"
                        type="range"
                        min={100}
                        max={10000}
                        step={100}
                        value={employees}
                        onChange={(e) => handleEmployeesSlider(Number(e.target.value))}
                        className="w-full h-2 bg-[#1A2A5A] rounded-lg appearance-none cursor-pointer accent-[#3B82F6]"
                        aria-label="Controle de quantidade de servidores"
                      />
                      <div className="flex justify-between text-[10px] text-[#94A3B8] mt-1 px-1 font-mono">
                        <span>100</span>
                        <span>2.500</span>
                        <span>5.000</span>
                        <span>10.000</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleIncrementEmployees}
                      disabled={employees >= 10000}
                      className="w-12 h-12 rounded-xl bg-[#1A2A5A] hover:bg-[#2563EB]/20 border border-[#1A2A5A] hover:border-[#3B82F6] text-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
                      aria-label="Aumentar 100 servidores"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* 2. Average Monthly Salary with BRL mask */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="salary-input" className="text-sm font-semibold text-[#F8FAFC]">
                      Salário Médio Mensal
                    </label>
                    <span className="text-[11px] text-[#94A3B8]">Média folha bruta + encargos</span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#94A3B8]">
                      R$
                    </span>
                    <input
                      id="salary-input"
                      type="text"
                      inputMode="numeric"
                      value={salaryInput}
                      onChange={handleSalaryChange}
                      className="w-full h-12 pl-12 pr-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] text-[#F8FAFC] font-semibold text-base focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 transition-all font-mono"
                      placeholder="6.000,00"
                      aria-label="Salário médio mensal em reais"
                    />
                  </div>
                </div>

                {/* 3. Discretionary Spend Slider 0-100% */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="discretionary-slider"
                      className="text-sm font-semibold text-[#F8FAFC]"
                    >
                      Gastos Discricionários Mensais
                    </label>
                    <span className="text-xs font-mono font-bold text-[#3B82F6] bg-[#1A2A5A] px-2.5 py-0.5 rounded">
                      {discretionarySpend}% do orçamento
                    </span>
                  </div>

                  <input
                    id="discretionary-slider"
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={discretionarySpend}
                    onChange={(e) => setDiscretionarySpend(Number(e.target.value))}
                    className="w-full h-2 bg-[#1A2A5A] rounded-lg appearance-none cursor-pointer accent-[#3B82F6]"
                    aria-label="Porcentagem de gastos discricionários mensais"
                  />

                  <div className="flex justify-between text-[10px] text-[#94A3B8] font-mono">
                    <span>0% (essencial)</span>
                    <span>30% (típico)</span>
                    <span>70%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  className="w-full min-h-[50px] inline-flex items-center justify-center gap-2 rounded-xl text-base font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] active:scale-[0.98] hover:scale-[1.01] transition-all duration-150 shadow-lg shadow-[#3B82F6]/30"
                >
                  <TrendingUp className="w-5 h-5" />
                  Calcular Impacto
                </button>
              </form>

              {/* Results Panel */}
              {hasCalculated && (
                <div
                  ref={resultsRef}
                  className="mt-8 pt-8 border-t border-[#1A2A5A] animate-simulator-results space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-[#3B82F6] flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Resultado da Projeção de Impacto
                    </h4>
                    <span className="text-[11px] text-[#94A3B8] font-mono">Simulação Anual</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Stat Card 1: Economia Anual Estimada */}
                    <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] hover:border-[#3B82F6]/50 transition-all">
                      <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                        <span>Economia Anual</span>
                        <div className="p-1 rounded bg-[#10B981]/10 text-[#10B981]">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-[#F8FAFC] tabular-nums tracking-tight font-mono">
                        {formatBRL(animatedSavings)}
                      </div>
                      <p className="text-[11px] text-[#94A3B8] mt-1.5 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-[#10B981]" />
                        Redução direta no custeio
                      </p>
                    </div>

                    {/* Stat Card 2: ROI em Meses */}
                    <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] hover:border-[#3B82F6]/50 transition-all">
                      <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                        <span>ROI em Meses</span>
                        <div className="p-1 rounded bg-[#3B82F6]/10 text-[#3B82F6]">
                          <DollarSign className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-[#F8FAFC] tabular-nums tracking-tight font-mono">
                        6,2 meses
                      </div>
                      <p className="text-[11px] text-[#94A3B8] mt-1.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#3B82F6]" />
                        Payback acelerado
                      </p>
                    </div>

                    {/* Stat Card 3: Horas Poupadas / Ano */}
                    <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] hover:border-[#3B82F6]/50 transition-all">
                      <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                        <span>Horas Poupadas/Ano</span>
                        <div className="p-1 rounded bg-[#10B981]/10 text-[#10B981]">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-[#F8FAFC] tabular-nums tracking-tight font-mono">
                        {formatNumberBR(animatedHours)}h
                      </div>
                      <p className="text-[11px] text-[#94A3B8] mt-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#10B981]" />
                        40h/servidor liberadas
                      </p>
                    </div>
                  </div>

                  {/* Supporting Note */}
                  <p className="text-xs text-center text-[#94A3B8] italic">
                    Estimativa baseada em benchmarks públicos de eficiência administrativa.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
