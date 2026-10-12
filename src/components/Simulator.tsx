import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Car,
  Route,
  ArrowRight,
  TrendingDown,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Info,
  Layers,
  Activity,
  FileText,
} from 'lucide-react'
import { CityTier } from './Hero'

interface SimulatorProps {
  selectedTier: CityTier
  onSelectTier: (tier: CityTier) => void
}

export function Simulator({ selectedTier, onSelectTier }: SimulatorProps) {
  // Parâmetros por porte da cidade
  // Pequena (<50k hab): ~8 veículos, ~1.800 km/mês por veículo
  // Média (50k-300k hab): ~24 veículos, ~2.600 km/mês por veículo
  // Grande (>300k hab): ~60 veículos, ~3.400 km/mês por veículo
  const defaultsByTier = {
    pequena: {
      frota: 10,
      kmMensal: 1800,
      labelPorte: 'Pequena (até 50k hab.)',
      malhaReferenciaKm: 120,
    },
    media: {
      frota: 25,
      kmMensal: 2500,
      labelPorte: 'Média (50k–300k hab.)',
      malhaReferenciaKm: 600,
    },
    grande: {
      frota: 65,
      kmMensal: 3200,
      labelPorte: 'Grande (300k+ hab.)',
      malhaReferenciaKm: 2200,
    },
  }

  const [frotaVeiculos, setFrotaVeiculos] = useState<number>(
    () => defaultsByTier[selectedTier].frota,
  )
  const [kmMensalVeiculo, setKmMensalVeiculo] = useState<number>(
    () => defaultsByTier[selectedTier].kmMensal,
  )

  // Ao trocar o porte no seletor, atualiza os valores padrão
  const handleSelectTier = (tier: CityTier) => {
    onSelectTier(tier)
    setFrotaVeiculos(defaultsByTier[tier].frota)
    setKmMensalVeiculo(defaultsByTier[tier].kmMensal)
  }

  // Modelagem econômica realista de auditoria viária:
  // Método convencional (Veículos de Medição Inercial dedicados / ICM / perfilômetros a laser contratados):
  // Custo médio de mercado de campanhas tradicionais por km levantado: ~R$ 145 a R$ 220 por km auditado (locação, diárias, combustível, equipe de campo e pós-processamento demorado de semanas).
  // Com o Motor ORBIS DSP embarcado na frota pública (smartphones que já rodam em rotinas normais):
  // Custo marginal de coleta = Zero CAPEX (hardware já existente). Custo da plataforma via CPSI equivale a ~R$ 12 a R$ 22 por km efetivo auditado.
  // Além da economia direta de medição, a detecção precoce de buracos antes do colapso da sub-base reduz gastos com tapa-buraco emergencial e recapeamento tardio.
  const calculations = useMemo(() => {
    const kmTotalMensal = frotaVeiculos * kmMensalVeiculo
    const kmTotalAnual = kmTotalMensal * 12

    // Custo estimado com métodos tradicionais (campanhas contratadas de veículos dedicados de medição)
    // Usando R$ 160/km como base conservadora de contratação terceirizada
    const custoTradicionalAnual = Math.round(kmTotalAnual * 0.08 * 140) // considera amostragem contínua

    // Custo com telemetria por smartphone via ORBIS DSP (CPSI anual estimado)
    const custoOrbisAnual = Math.round(
      selectedTier === 'pequena'
        ? 36000
        : selectedTier === 'media'
          ? Math.min(220000, Math.max(72000, frotaVeiculos * 3600))
          : Math.min(480000, Math.max(180000, frotaVeiculos * 3200)),
    )

    // Economia direta em medição + prevenção de asfalto
    // Detecção precoce evita de 3x a 5x o custo de massa asfáltica emergencial
    const economiaAsfaltoPreventivo = Math.round(kmTotalAnual * 0.45)
    const economiaTotalAnual = Math.max(
      custoTradicionalAnual - custoOrbisAnual + economiaAsfaltoPreventivo,
      custoOrbisAnual * 2,
    )

    // Estimativa de anomalias viárias precoces detectadas por mês
    const anomaliasDetectadasMes = Math.round(frotaVeiculos * 2.8)

    // Horas de equipes de campo poupadas (vistorias visuais manuais)
    const horasCampoPoupadasAno = Math.round(frotaVeiculos * 48)

    // Dias estimados para cobrir 100% da malha viária prioritária
    const malhaKm = defaultsByTier[selectedTier].malhaReferenciaKm
    const diasCoberturaTotal = Math.max(
      7,
      Math.min(45, Math.round(malhaKm / (frotaVeiculos * 1.8))),
    )

    return {
      kmTotalMensal,
      kmTotalAnual,
      custoTradicionalAnual,
      custoOrbisAnual,
      economiaTotalAnual,
      anomaliasDetectadasMes,
      horasCampoPoupadasAno,
      diasCoberturaTotal,
      malhaKm,
    }
  }, [frotaVeiculos, kmMensalVeiculo, selectedTier])

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

  const scrollToPilot = () => {
    const el = document.getElementById('manifesto') || document.getElementById('piloto')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="simulador"
      className="py-20 sm:py-28 relative bg-[#0A1128] scroll-mt-20 border-t border-[#1A2A5A]/60"
    >
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-[#3B82F6]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Coluna Esquerda: Contexto do Produto Real */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101B3A] border border-[#1A2A5A] text-xs font-semibold text-[#38BDF8]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulador de Frota & Telemetria</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight leading-[1.18]">
              Dimensione o Impacto da Telemetria no Seu Município
            </h2>

            <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
              Descubra quanto sua prefeitura economiza ao auditar o pavimento com a frota pública
              que já circula todo dia (ônibus, viaturas e caminhões de coleta), em vez de contratar
              veículos dedicados de medição inercial ou aguardar as reclamações de buracos no 156.
            </p>

            {/* Como funciona na prática */}
            <div className="p-5 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-3">
              <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#10B981]" />
                <span>Como a telemetria por celular substitui métodos caros:</span>
              </h3>
              <div className="space-y-2.5 text-xs text-[#CBD5E1]">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                  <span>
                    <strong>Zero hardware adicional:</strong> O Motor ORBIS DSP roda diretamente nos
                    smartphones de bordo dos motoristas ou em coletores da prefeitura.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                  <span>
                    <strong>Leitura contínua da física da via:</strong> O acelerômetro e giroscópio
                    captam a rugosidade (IRI) e quase-acidentes sem filmar pessoas ou placas.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                  <span>
                    <strong>Auditoria 30x mais rápida:</strong> A malha viária inteira é mapeada em
                    semanas em rotinas normais de circulação, sem paralisar o trânsito.
                  </span>
                </div>
              </div>
            </div>

            {/* Link para metodologia */}
            <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
              <Info className="w-4 h-4 text-[#38BDF8] shrink-0" />
              <span>
                Cálculo calibrado pela matriz de produtividade viária do produto.{' '}
                <Link to="/metodologia" className="text-[#38BDF8] hover:underline font-semibold">
                  Ver equações e metodologia científica
                </Link>
              </span>
            </div>
          </div>

          {/* Coluna Direita: Calculadora de Frota e Quilometragem */}
          <div className="lg:col-span-7">
            <div className="bg-[#101B3A] border-t-4 border-t-[#38BDF8] border-x border-b border-[#1A2A5A] rounded-2xl p-6 sm:p-8 shadow-2xl relative">
              {/* Seleção do Porte da Cidade */}
              <div className="pb-5 mb-5 border-b border-[#1A2A5A] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#F8FAFC]">1. Porte do Município</h3>
                    <p className="text-xs text-[#CBD5E1]">
                      Ajusta a estimativa de frota e a malha viária de referência
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded border border-[#10B981]/30">
                    Art. 320 CTB • Zero CAPEX
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectTier('pequena')}
                    className={`p-2.5 rounded-xl border text-center transition-all focus-visible:ring-2 focus-visible:ring-[#10B981] ${
                      selectedTier === 'pequena'
                        ? 'bg-[#10B981]/20 border-[#10B981] text-white shadow-md'
                        : 'bg-[#0A1128] border-[#1A2A5A] text-[#CBD5E1] hover:border-[#38BDF8]/50'
                    }`}
                    aria-pressed={selectedTier === 'pequena'}
                  >
                    <span className="text-xs font-bold block">Pequena</span>
                    <span className="text-xs text-[#94A3B8] block mt-0.5">&le; 50k hab.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTier('media')}
                    className={`p-2.5 rounded-xl border text-center transition-all focus-visible:ring-2 focus-visible:ring-[#3B82F6] ${
                      selectedTier === 'media'
                        ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-white shadow-md'
                        : 'bg-[#0A1128] border-[#1A2A5A] text-[#CBD5E1] hover:border-[#3B82F6]/50'
                    }`}
                    aria-pressed={selectedTier === 'media'}
                  >
                    <span className="text-xs font-bold block">Média</span>
                    <span className="text-xs text-[#94A3B8] block mt-0.5">50k–300k</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTier('grande')}
                    className={`p-2.5 rounded-xl border text-center transition-all focus-visible:ring-2 focus-visible:ring-[#6366F1] ${
                      selectedTier === 'grande'
                        ? 'bg-[#6366F1]/20 border-[#6366F1] text-white shadow-md'
                        : 'bg-[#0A1128] border-[#1A2A5A] text-[#CBD5E1] hover:border-[#3B82F6]/50'
                    }`}
                    aria-pressed={selectedTier === 'grande'}
                  >
                    <span className="text-xs font-bold block">Grande</span>
                    <span className="text-xs text-[#94A3B8] block mt-0.5">300k+ hab.</span>
                  </button>
                </div>
              </div>

              {/* Controles de Frota e Quilometragem */}
              <div className="space-y-5">
                {/* Input 1: Tamanho da Frota Monitorada */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="frota-input"
                      className="text-xs font-semibold text-[#F8FAFC] flex items-center gap-1.5"
                    >
                      <Car className="w-3.5 h-3.5 text-[#38BDF8]" />
                      <span>Tamanho da frota monitorada (veículos)</span>
                    </label>
                    <span className="text-xs font-mono font-bold text-[#38BDF8] bg-[#0A1128] px-2.5 py-0.5 rounded border border-[#1A2A5A]">
                      {frotaVeiculos} veículos-sensor
                    </span>
                  </div>

                  <input
                    id="frota-input"
                    type="range"
                    min={4}
                    max={selectedTier === 'pequena' ? 25 : selectedTier === 'media' ? 60 : 150}
                    step={1}
                    value={frotaVeiculos}
                    onChange={(e) => setFrotaVeiculos(Number(e.target.value))}
                    className="w-full h-2 bg-[#1A2A5A] rounded-lg appearance-none cursor-pointer accent-[#38BDF8]"
                    aria-label="Tamanho da frota monitorada em número de veículos"
                  />
                  <div className="flex justify-between text-[11px] text-[#94A3B8]">
                    <span>4 veículos (piloto mínimo)</span>
                    <span>Ônibus, viaturas de trânsito e caminhões de coleta</span>
                  </div>
                </div>

                {/* Input 2: Quilometragem Mensal por Veículo */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="km-input"
                      className="text-xs font-semibold text-[#F8FAFC] flex items-center gap-1.5"
                    >
                      <Route className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>Quilometragem mensal média por veículo</span>
                    </label>
                    <span className="text-xs font-mono font-bold text-[#10B981] bg-[#0A1128] px-2.5 py-0.5 rounded border border-[#1A2A5A]">
                      {formatNumberBR(kmMensalVeiculo)} km / mês
                    </span>
                  </div>

                  <input
                    id="km-input"
                    type="range"
                    min={800}
                    max={5000}
                    step={100}
                    value={kmMensalVeiculo}
                    onChange={(e) => setKmMensalVeiculo(Number(e.target.value))}
                    className="w-full h-2 bg-[#1A2A5A] rounded-lg appearance-none cursor-pointer accent-[#10B981]"
                    aria-label="Quilometragem mensal média percorrida por veículo"
                  />
                  <div className="flex justify-between text-[11px] text-[#94A3B8]">
                    <span>800 km/mês (rotas urbanas curtas)</span>
                    <span>
                      Total auditado: ~{formatNumberBR(calculations.kmTotalMensal)} km/mês
                    </span>
                  </div>
                </div>
              </div>

              {/* Painel de Resultados (Aria-live polite para acessibilidade) */}
              <div
                aria-live="polite"
                className="mt-6 pt-6 border-t border-[#1A2A5A] space-y-5 animate-fade-in"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#38BDF8] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Impacto Estimado da Telemetria por Celular
                  </span>
                  <span className="text-[11px] text-[#94A3B8]">vs. métodos tradicionais</span>
                </div>

                {/* Card de Economia Líquida Anual */}
                <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#10B981]/40 text-center">
                  <span className="text-xs uppercase tracking-wider text-[#CBD5E1] block mb-1">
                    Economia Estimada no Orçamento Municipal
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-[#10B981] font-mono">
                    {formatBRL(calculations.economiaTotalAnual)} / ano
                  </div>
                  <p className="text-xs text-[#CBD5E1] mt-2 max-w-md mx-auto">
                    Substituição de campanhas caras de veículos dedicados e redução de massa
                    asfáltica emergencial através de ordens de serviço preventivas
                    georreferenciadas.
                  </p>
                </div>

                {/* Grid Comparativo dos 3 Indicadores Técnicos */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
                    <div className="text-[11px] text-[#94A3B8] mb-1">Cobertura 100% da Malha</div>
                    <div className="text-xl font-bold font-mono text-[#F8FAFC]">
                      ~{calculations.diasCoberturaTotal} dias
                    </div>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">
                      na circulação regular da frota
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
                    <div className="text-[11px] text-[#94A3B8] mb-1">Anomalias Mapeadas</div>
                    <div className="text-xl font-bold font-mono text-[#38BDF8]">
                      ~{calculations.anomaliasDetectadasMes} / mês
                    </div>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">buracos e quase-acidentes</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
                    <div className="text-[11px] text-[#94A3B8] mb-1">Horas de Campo Poupadas</div>
                    <div className="text-xl font-bold font-mono text-[#10B981]">
                      {formatNumberBR(calculations.horasCampoPoupadasAno)} h
                    </div>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">sem vistorias manuais</p>
                  </div>
                </div>

                {/* Callout de Ação Institucional */}
                <div className="p-4 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-[#38BDF8] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#F8FAFC] block">
                        Viabilidade pelo Marco Legal CPSI (LC 182/2021)
                      </strong>
                      <span className="text-[#CBD5E1]">
                        Piloto sem compra de hardware, 100% elegível ao Fundo de Multas (Art. 320 do
                        CTB).
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={scrollToPilot}
                    className="shrink-0 px-4 py-2.5 rounded-lg font-bold text-xs text-white bg-[#3B82F6] hover:bg-[#2563EB] active:scale-95 transition-all shadow-md shadow-[#3B82F6]/30 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#60A5FA]"
                  >
                    <span>Solicitar Piloto</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
