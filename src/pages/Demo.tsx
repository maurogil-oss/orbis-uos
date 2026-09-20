import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Sliders,
  Radio,
  BarChart3,
  Network,
  FileCheck2,
  Building2,
  Lock,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Info,
  Scale,
  Eye,
  Layers,
  Database,
  Check,
} from 'lucide-react'
import { registerDemoStart } from '@/services/institucionalSettings'
import { ExpressDiagnostic } from '@/components/ExpressDiagnostic'
import { Simulator } from '@/components/Simulator'
import { CityTier } from '@/components/Hero'
import { CuritibaMap } from '@/components/CuritibaMap'
import { listRoadEvents, RoadEventRecord } from '@/services/roadEvents'
import { listFleetTelemetry, FleetTelemetryRecord } from '@/services/fleet'
import { listRoadSegments, RoadSegmentRecord } from '@/services/roadSegments'
import { PortalH3HexMap } from '@/components/PortalH3HexMap'
import { H3AggregatedCell, generateCuritibaH3DemoGrid } from '@/lib/diagnostics/h3Engine'

interface DemoStepConfig {
  id: number
  title: string
  shortTitle: string
  icon: React.ComponentType<{ className?: string }>
  institutionalTitle: string
  legalBadge: string
  institutionalSentences: string[]
  keyMetrics: { label: string; value: string; desc: string }[]
}

const DEMO_STEPS: DemoStepConfig[] = [
  {
    id: 1,
    title: 'Diagnóstico Express',
    shortTitle: '1. Diagnóstico',
    icon: Zap,
    institutionalTitle: 'Pré-diagnóstico Provisório e Dimensionamento de Elegibilidade CPSI',
    legalBadge: 'Marco Legal CPSI (LC 182/2021) & Triagem Inicial',
    institutionalSentences: [
      'O Diagnóstico Express permite que a equipe técnica municipal avalie a prontidão institucional em menos de 5 minutos, mapeando frotas existentes e faixas provisórias de elegibilidade sem compromisso prévio.',
      'A análise projeta a extensão de malha viária auditável em 30 dias de piloto e estima o dimensionamento da frota de veículos-sensor necessária, operando em conformidade com o Art. 27 da LC 182/2021.',
      'O município identifica de imediato se sua estrutura requer cláusulas de telemetria em contratos de concessão ou se a frota própria já atende com Zero CAPEX de partida.',
    ],
    keyMetrics: [
      { label: 'Tempo de Diagnóstico', value: '~5 min', desc: '10 parâmetros do município' },
      { label: 'Cobertura Projetada', value: '70% a 92%', desc: 'Em 30 dias com frota existente' },
      {
        label: 'Investimento em Hardware',
        value: 'R$ 0,00',
        desc: 'Zero CAPEX — sensores embarcados',
      },
    ],
  },
  {
    id: 2,
    title: 'Simulador de Economicidade',
    shortTitle: '2. Simulador',
    icon: Sliders,
    institutionalTitle: 'Custo Evitado e Equilíbrio Fiscal Orçamentário',
    legalBadge: 'Art. 320 da Lei 4.320/64 & Art. 320 do CTB',
    institutionalSentences: [
      'A substituição do modelo reativo (tapa-buracos de emergência e recapeamento asfáltico total) pela zeladoria preditiva viabiliza o Custo Evitado formal, garantindo o equilíbrio fiscal previsto no Art. 320 da Lei Federal 4.320/1964.',
      'A metodologia comprova o nexo causal estrito exigido pelos Tribunais de Contas Estaduais (TCE), permitindo que o investimento no sistema seja 100% elegível ao saldo do Fundo Municipal de Multas (Art. 320 do CTB) na rubrica de engenharia de tráfego.',
      'Municípios de pequeno, médio e grande porte obtêm taxas de retorno superiores a 4x em economia direta de massa asfáltica, combustível da frota pública e redução de sinistros viários.',
    ],
    keyMetrics: [
      { label: 'Custo Evitado Anual', value: 'Até R$ 21/hab.', desc: 'Art. 320 da Lei 4.320/1964' },
      {
        label: 'Amparo de Custeio',
        value: 'Art. 320 CTB',
        desc: 'Fundo Municipal de Multas blindado',
      },
      {
        label: 'Economia Asfáltica',
        value: '42% a 68%',
        desc: 'Troca de recape por microrrevestimento',
      },
    ],
  },
  {
    id: 3,
    title: 'Telemetria Contínua da Frota',
    shortTitle: '3. Telemetria',
    icon: Radio,
    institutionalTitle: 'Auditoria Passiva Contínua com a Frota Municipal em Circulação',
    legalBadge: 'Zero CAPEX & Coleta Offline-First',
    institutionalSentences: [
      'Em vez de viaturas dedicadas ou contratações de levantamento a laser de alto custo, o ORBIS UOS utiliza os veículos que já rodam diariamente (ônibus, caminhões de coleta e viaturas municipais).',
      'O motor de processamento inercial amostra a aceleração vertical Z e o índice de irregularidade internacional (IRI) em tempo real, gravando ocorrências com resiliência total a áreas de sombra 4G.',
      'A gestão pública tem visibilidade imediata das vias degradadas no mapa soberano da cidade, sem criar rotas artificiais e sem interferir na operação habitual dos motoristas da prefeitura.',
    ],
    keyMetrics: [
      { label: 'Frequência de Varredura', value: 'Diária', desc: 'Frota pública em rota regular' },
      {
        label: 'Resiliência de Rede',
        value: 'Offline-First',
        desc: 'Fila local sincronizada via 4G/Wi-Fi',
      },
      {
        label: 'Gêmeo Digital',
        value: 'Georreferenciado',
        desc: 'Camadas Carto/OSM com Zero API paga',
      },
    ],
  },
  {
    id: 4,
    title: 'Índices IMV / IMA & k-Anonimato',
    shortTitle: '4. Índices & LGPD',
    icon: BarChart3,
    institutionalTitle: 'Escudo Anti-Falso-Positivo (F ≥ 3) e k-Anonimato Territorial',
    legalBadge: 'Art. 12 da LGPD & k-anonimato (≥3 sessões)',
    institutionalSentences: [
      'Para blindar o erário contra despesas espúrias, o Índice de Manutenção Viária (IMV) só emite Ordens de Serviço após o Fator de Confiança F ≥ 3 passagens veiculares distintas, eliminando falsos positivos provocados por manobras pontuais.',
      'Em estrita conformidade com a LGPD (Art. 12 da Lei 13.709/2018), toda a malha é agregada territorialmente em células hexagonais H3 da Uber com k-anonimato garantido (limiar k ≥ 3 sessões independentes por hexágono).',
      'Células com menos de 3 passagens têm suas notas e estatísticas suprimidas (null) no portal e nas exportações, impossibilitando a reidentificação de rotas individuais de qualquer munícipe ou condutor.',
    ],
    keyMetrics: [
      {
        label: 'Fator F Anti-Falso-Positivo',
        value: 'F ≥ 3 veículos',
        desc: 'Validação cruzada de anomalias',
      },
      {
        label: 'k-Anonimato Territorial',
        value: 'k ≥ 3 sessões',
        desc: 'LGPD Art. 12 sem rastreio individual',
      },
      {
        label: 'Hexágonos Espaciais',
        value: 'H3 Res 9 e 10',
        desc: 'Resolução ~174m viária / ~65m ativa',
      },
    ],
  },
  {
    id: 5,
    title: 'Interoperabilidade & Integração CIC',
    shortTitle: '5. Interoperabilidade',
    icon: Network,
    institutionalTitle: 'Arquitetura Aberta B2G, Webhooks e Dados Abertos Soberanos',
    legalBadge: 'Lei do Governo Digital (Lei 14.129/2021) & GeoJSON RFC 7946',
    institutionalSentences: [
      'A soberania dos dados pertence integralmente ao ente público contratante. O ORBIS UOS disponibiliza APIs RESTful e saídas GeoJSON padronizadas (RFC 7946 / OGC) que se integram diretamente aos Centros Integrados de Operação (CIC/CICC) e sistemas de zeladoria (156 / SIGOR).',
      'Webhooks assíncronos disparam despachos automáticos para equipes de conservação assim que uma anomalia atinge severidade crítica confirmada por F ≥ 3, respeitando o princípio de eficiência da administração pública.',
      'Nenhum dado municipal fica retido em formato proprietário (anti-lock-in), permitindo cruzamentos com GTFS de transporte coletivo, geoprocessamento do IPPUC/Secretarias e prestação de contas aos órgãos de controle.',
    ],
    keyMetrics: [
      {
        label: 'Padrão Geoespacial',
        value: 'GeoJSON / OGC',
        desc: 'Interoperável com QGIS e SIG municipal',
      },
      {
        label: 'Integração de Centro de Comando',
        value: 'Webhooks & REST',
        desc: 'Disparo direto para zeladoria e CIC',
      },
      {
        label: 'Bloqueio de Vendor Lock-in',
        value: '100% Aberto',
        desc: 'Exportação soberana e irrestrita',
      },
    ],
  },
  {
    id: 6,
    title: 'Relatórios Oficiais com Hash SHA-256',
    shortTitle: '6. Relatórios & Hash',
    icon: FileCheck2,
    institutionalTitle:
      'Dossiê Técnico Auditável com Imutabilidade Criptográfica para Tribunais de Contas',
    legalBadge: 'Art. 27 LC 182/2021 & Integridade SHA-256',
    institutionalSentences: [
      'Toda consolidação gerada pelo sistema — desde o Enquadramento CPSI até o Laudo de Homologação Dry-Run e Pacote Operacional — recebe carimbo de tempo indelével e protocolo criptográfico com hash SHA-256 de 64 caracteres hexadecimais.',
      'A rastreabilidade nominal e a vinculação estrita à LC 182/2021 protegem os ordenadores de despesa, prefeitos e secretários municipais perante auditorias do TCE e Ministério Público.',
      'A demonstração comercial é concluída com a entrega da minuta padronizada de edital CPSI, termo de referência e memorial de economicidade pronta para tramitação interna no órgão.',
    ],
    keyMetrics: [
      {
        label: 'Integridade Criptográfica',
        value: 'SHA-256',
        desc: 'Protocolo imutável de validação pericial',
      },
      {
        label: 'Blindagem de Contas',
        value: 'TCE / MPC',
        desc: 'Memória de cálculo e nexo comprovado',
      },
      {
        label: 'Próxima Ação do Órgão',
        value: 'Enquadramento',
        desc: '6 blocos com minuta do Art. 320',
      },
    ],
  },
]

export default function Demo() {
  const navigate = useNavigate()
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0)
  const [selectedTier, setSelectedTier] = useState<CityTier>('media')
  const [auditRegistered, setAuditRegistered] = useState<boolean>(false)
  const [auditMessage, setAuditMessage] = useState<string>('')

  // Estados de dados para alimentar os previews reais
  const [roadEvents, setRoadEvents] = useState<RoadEventRecord[]>([])
  const [fleet, setFleet] = useState<FleetTelemetryRecord[]>([])
  const [roadSegments, setRoadSegments] = useState<RoadSegmentRecord[]>([])
  const [h3Cells, setH3Cells] = useState<H3AggregatedCell[]>([])
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(true)

  // 1. Trilha de Auditoria: Registrar o início da demonstração pública (DEMO_STARTED)
  useEffect(() => {
    let isMounted = true

    async function initAuditTrail() {
      try {
        const res = await registerDemoStart({
          codigo_ibge: '4106902',
          origem: 'tour_demo_orientada',
        })
        if (isMounted) {
          setAuditRegistered(true)
          setAuditMessage(
            res.event_id
              ? `Evento DEMO_STARTED gravado na audit_trail (#${res.event_id.slice(-8)})`
              : 'Demonstração iniciada com trilha auditada ativa.',
          )
        }
      } catch (err) {
        if (isMounted) {
          setAuditRegistered(true)
          setAuditMessage('Demonstração iniciada em modo soberano auditado.')
        }
      }
    }

    initAuditTrail()

    return () => {
      isMounted = false
    }
  }, [])

  // 2. Carregar dados reais do backend para os previews das etapas 3, 4 e 5
  useEffect(() => {
    let isMounted = true

    async function loadBackendData() {
      try {
        setIsLoadingPreview(true)
        const [eventsData, fleetData, segmentsData] = await Promise.all([
          listRoadEvents(),
          listFleetTelemetry(),
          listRoadSegments('4106902'),
        ])

        if (!isMounted) return

        setRoadEvents(eventsData)
        setFleet(fleetData)
        setRoadSegments(segmentsData)

        // Utilizar a malha padrão auditada oficial de Curitiba com k-anonimato (k >= 3)
        const grid = generateCuritibaH3DemoGrid()
        setH3Cells(grid)
      } catch (err) {
        console.warn('Erro ao carregar dados de prévia da demo:', err)
      } finally {
        if (isMounted) setIsLoadingPreview(false)
      }
    }

    loadBackendData()

    return () => {
      isMounted = false
    }
  }, [])

  // Rolar suavemente para o topo do conteúdo da etapa ao trocar
  const goToStep = (index: number) => {
    if (index >= 0 && index < DEMO_STEPS.length) {
      setCurrentStepIndex(index)
      const container = document.getElementById('demo-content-anchor')
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  const currentStep = DEMO_STEPS[currentStepIndex]
  const progressPercent = Math.round(((currentStepIndex + 1) / DEMO_STEPS.length) * 100)

  return (
    <div className="min-h-screen bg-[#070D1F] text-[#F8FAFC] flex flex-col selection:bg-[#3B82F6]/30">
      {/* 1. BARRA DE PROGRESSO FIXA DO TOUR (Abaixo da Navbar principal do app) */}
      <div className="sticky top-14 sm:top-16 z-40 bg-[#0A1128]/95 backdrop-blur-md border-b border-[#1A2A5A] shadow-lg shadow-black/30">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-2.5 sm:py-3">
          {/* Top row: Etapa X de 6 + Titulo + Trilha Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#3B82F6]/15 border border-[#3B82F6]/40 text-xs font-mono font-bold text-[#60A5FA]">
                <Compass className="w-3.5 h-3.5 text-[#3B82F6] animate-spin-slow" />
                <span>Modo Demonstração Orientada</span>
              </span>
              <span className="text-xs font-semibold text-[#94A3B8]">
                Etapa <b className="text-white font-mono">{currentStepIndex + 1}</b> de{' '}
                <b className="text-white font-mono">6</b>:
              </span>
              <span className="text-xs font-bold text-white hidden md:inline truncate max-w-xs">
                {currentStep.title}
              </span>
            </div>

            {/* Trilha de Auditoria Tag */}
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              <span className="text-[#10B981] font-semibold hidden sm:inline">
                {auditMessage || 'DEMO_STARTED auditado (SISTEMA)'}
              </span>
              <span className="text-[#94A3B8] text-[10px] bg-[#101B3A] border border-[#1A2A5A] px-2 py-0.5 rounded">
                v0.0.29 Hardened
              </span>
            </div>
          </div>

          {/* Barra de Progresso Visual Contínua */}
          <div className="w-full bg-[#101B3A] h-1.5 rounded-full overflow-hidden border border-[#1A2A5A]">
            <div
              className="bg-gradient-to-r from-[#3B82F6] via-[#60A5FA] to-[#10B981] h-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          {/* Lista Clicável / Dots de Pulo Rápido para Qualquer Etapa */}
          <div className="flex items-center justify-between gap-1 sm:gap-2 mt-2.5 overflow-x-auto pb-1 scrollbar-thin">
            {DEMO_STEPS.map((step, idx) => {
              const isCurrent = idx === currentStepIndex
              const isPast = idx < currentStepIndex
              const StepIcon = step.icon

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => goToStep(idx)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap shrink-0 border ${
                    isCurrent
                      ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-white shadow-sm shadow-[#3B82F6]/30 font-bold'
                      : isPast
                        ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/20'
                        : 'bg-[#101B3A]/60 border-[#1A2A5A] text-[#94A3B8] hover:text-white hover:border-[#3B82F6]/40'
                  }`}
                  title={`Pular para etapa ${step.id}: ${step.title}`}
                >
                  {isPast ? (
                    <Check className="w-3 h-3 text-[#10B981]" />
                  ) : (
                    <StepIcon
                      className={`w-3 h-3 ${isCurrent ? 'text-[#3B82F6]' : 'text-[#94A3B8]'}`}
                    />
                  )}
                  <span>{step.shortTitle}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 2. CORPO PRINCIPAL DO TOUR */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Âncora de rolagem para saltos entre etapas */}
        <div id="demo-content-anchor" className="scroll-mt-40" />

        {/* HERO CARD DE CONTEXTO INSTITUCIONAL DA ETAPA */}
        <section className="bg-gradient-to-br from-[#101B3A] via-[#0A1330] to-[#0A1128] border-2 border-[#1A2A5A] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#3B82F6]/10 blur-[100px] pointer-events-none rounded-full" />

          {/* Header da Etapa */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#1A2A5A]">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#3B82F6] bg-[#3B82F6]/10 px-2.5 py-1 rounded border border-[#3B82F6]/30">
                  Etapa {currentStep.id} de 6 • Roteiro Autoguiado
                </span>
                <span className="text-xs font-mono font-semibold text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded border border-[#10B981]/30">
                  {currentStep.legalBadge}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
                {currentStep.institutionalTitle}
              </h1>
            </div>

            {/* Botões de Ação Rápida Superior */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => goToStep(currentStepIndex - 1)}
                disabled={currentStepIndex === 0}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#CBD5E1] bg-[#0A1128] hover:bg-[#1A2A5A] border border-[#1A2A5A] disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>

              {currentStepIndex < DEMO_STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => goToStep(currentStepIndex + 1)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-md shadow-[#3B82F6]/30 transition-all flex items-center gap-1.5"
                >
                  <span>Próxima Etapa</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Link
                  to="/enquadramento"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] shadow-md shadow-[#10B981]/30 transition-all flex items-center gap-1.5"
                >
                  <span>Iniciar Enquadramento</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* Bloco Obrigatório: 2-3 Frases de Contexto Institucional + Nexo Legal */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#60A5FA]">
                <Scale className="w-4 h-4 text-[#3B82F6]" />
                <span>Contexto Institucional & Benefício para o Órgão Público</span>
              </div>
              <div className="space-y-3 bg-[#070D1F]/70 border border-[#1A2A5A] rounded-xl p-4 sm:p-5">
                {currentStep.institutionalSentences.map((frase, idx) => (
                  <p
                    key={idx}
                    className="text-sm leading-relaxed text-[#CBD5E1] flex items-start gap-2.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] mt-2 shrink-0" />
                    <span>{frase}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* 3 Métricas-Chave da Etapa */}
            <div className="lg:col-span-4 space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                Parâmetros Auditados
              </div>
              <div className="space-y-2">
                {currentStep.keyMetrics.map((met, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#070D1F]/60 border border-[#1A2A5A] flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#94A3B8] font-medium">{met.label}</span>
                      <span className="text-sm font-bold font-mono text-[#10B981]">
                        {met.value}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#64748B] mt-0.5">{met.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3. CONTEÚDO VISUAL / INTERATIVO ESPECÍFICO DE CADA ETAPA */}
        <section className="space-y-6">
          {/* ========================================================================= */}
          {/* ETAPA 1: DIAGNÓSTICO EXPRESS */}
          {/* ========================================================================= */}
          {currentStepIndex === 0 && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#3B82F6]" />
                  <span>
                    <b>Demonstração Operacional:</b> Formulário de Pré-Diagnóstico com estimativa de
                    malha em tempo real. Preencha ou consulte os parâmetros padrões para simular.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold text-xs flex items-center gap-1 transition-all"
                >
                  <span>Avançar para Simulador</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Render do componente oficial de Diagnóstico Express do produto */}
              <div className="rounded-2xl overflow-hidden border border-[#1A2A5A]">
                <ExpressDiagnostic />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ETAPA 2: SIMULADOR DE ECONOMICIDADE */}
          {/* ========================================================================= */}
          {currentStepIndex === 1 && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#101B3A] border border-[#10B981]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#10B981]" />
                  <span>
                    <b>Demonstração de Impacto Orçamentário:</b> Selecione o porte da sua cidade e
                    ajuste a população para testar o Custo Evitado formal (Art. 320 Lei 4.320/64) e
                    o valor do piloto CPSI elegível ao Fundo de Multas (Art. 320 CTB).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs flex items-center gap-1 transition-all"
                >
                  <span>Avançar para Telemetria</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Render do simulador interativo */}
              <div className="rounded-2xl overflow-hidden border border-[#1A2A5A]">
                <Simulator selectedTier={selectedTier} onSelectTier={setSelectedTier} />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ETAPA 3: TELEMETRIA CONTÍNUA */}
          {/* ========================================================================= */}
          {currentStepIndex === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Mapa Interativo de Curitiba & RMC com Frota e Eventos Reais */}
                <div className="lg:col-span-8 bg-[#101B3A] border border-[#1A2A5A] rounded-2xl p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Radio className="w-4 h-4 text-[#10B981]" />
                        <span>Gêmeo Digital Georreferenciado • Coleta Ativa da Frota</span>
                      </h3>
                      <p className="text-xs text-[#94A3B8]">
                        Curitiba/PR: {fleet.length} veículos-sensor operando em linhas de ônibus e
                        caminhões
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-[#10B981] bg-[#10B981]/15 px-2.5 py-0.5 rounded border border-[#10B981]/30">
                      Zero CAPEX
                    </span>
                  </div>

                  <div className="h-[460px] w-full rounded-xl overflow-hidden border border-[#1A2A5A]">
                    <CuritibaMap
                      roadEvents={roadEvents}
                      fleet={fleet}
                      showHeatmap={true}
                      showFleet={true}
                    />
                  </div>
                </div>

                {/* Painel Lateral com Leituras Recentes de FFT e Aceleração */}
                <div className="lg:col-span-4 bg-[#101B3A] border border-[#1A2A5A] rounded-2xl p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#1A2A5A]">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#60A5FA]">
                      Telemetria Inercial (Borda)
                    </span>
                    <span className="text-[10px] font-mono text-[#94A3B8]">Aceleração Z (g)</span>
                  </div>

                  <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                    {roadEvents.slice(0, 6).map((ev) => (
                      <div
                        key={ev.id}
                        className="p-3 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white truncate max-w-[160px]">
                            {ev.via}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                              ev.severidade === 'critica'
                                ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40'
                                : ev.severidade === 'alta'
                                  ? 'bg-[#F97316]/20 text-[#F97316] border border-[#F97316]/40'
                                  : 'bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/40'
                            }`}
                          >
                            {ev.severidade}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                          <span>{ev.bairro || 'Curitiba'}</span>
                          <span className="font-mono">
                            IRI: {ev.iri_score?.toFixed(1) || '4.2'}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#64748B] flex items-center justify-between">
                          <span>
                            Acel. Z: {ev.aceleracao_z ? `${ev.aceleracao_z.toFixed(2)}g` : '1.8g'}
                          </span>
                          <span>{ev.linha_frota || 'Linha 500 Interbairros'}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-[#0A1128]/80 border border-[#1A2A5A] text-xs text-[#94A3B8] space-y-1">
                    <div className="text-[11px] font-bold text-white">Arquitetura de Borda:</div>
                    <p className="text-[11px] leading-relaxed">
                      Transformada Rápida de Fourier (FFT) calcula a densidade espectral no próprio
                      aparelho, descartando dados brutos e enviando apenas a assinatura matemática.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ETAPA 4: ÍNDICES IMV/IMA & k-ANONIMATO */}
          {/* ========================================================================= */}
          {currentStepIndex === 3 && (
            <div className="space-y-6">
              <div className="bg-[#101B3A] border border-[#1A2A5A] rounded-2xl p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1A2A5A]">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#3B82F6]" />
                      <span>Motor Algorítmico IMV / IMA & Blindagem LGPD</span>
                    </h3>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      Visualização territorial em hexágonos H3 com k-anonimato (k ≥ 3 sessões
                      independentes)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981]">
                      k ≥ 3 Cumprido
                    </span>
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-[#60A5FA]">
                      Fator F ≥ 3
                    </span>
                  </div>
                </div>

                {/* Grid comparativo dos 2 pilares: IMV e IMA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* IMV */}
                  <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#3B82F6]/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase text-[#60A5FA]">
                        Sub-índice Viário (Ativo)
                      </span>
                      <span className="text-xs font-mono font-bold text-white bg-[#101B3A] px-2 py-0.5 rounded border border-[#1A2A5A]">
                        Peso 70%
                      </span>
                    </div>
                    <h4 className="text-xl font-black text-white">
                      IMV • Índice de Manutenção Viária
                    </h4>
                    <p className="text-xs text-[#CBD5E1] leading-relaxed">
                      Classifica a qualidade do pavimento em faixas de 0 a 100 com base em 3
                      pilares: Aceleração Vertical Z (IRI), Severidade de Anomalias com Limiar F ≥ 3
                      e Aderência / Drenagem superficial.
                    </p>
                    <div className="pt-2 border-t border-[#1A2A5A] flex items-center justify-between text-xs">
                      <span className="text-[#94A3B8]">Aplicação Principal:</span>
                      <span className="font-bold text-[#10B981]">
                        Ordens de Serviço Preventivas
                      </span>
                    </div>
                  </div>

                  {/* IMA */}
                  <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#10B981]/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase text-[#10B981]">
                        Mobilidade Ativa (Onda 3)
                      </span>
                      <span className="text-xs font-mono font-bold text-white bg-[#101B3A] px-2 py-0.5 rounded border border-[#1A2A5A]">
                        Peso 30%
                      </span>
                    </div>
                    <h4 className="text-xl font-black text-white">
                      IMA • Índice de Mobilidade Ativa
                    </h4>
                    <p className="text-xs text-[#CBD5E1] leading-relaxed">
                      Mapeia ciclovias, calçadas e travessias através de sensores inerciais
                      acoplados a bicicletas e pedestres voluntários, medindo solavancos angulares e
                      desvios coletivos.
                    </p>
                    <div className="pt-2 border-t border-[#1A2A5A] flex items-center justify-between text-xs">
                      <span className="text-[#94A3B8]">Aplicação Principal:</span>
                      <span className="font-bold text-[#38BDF8]">Acessibilidade e Ciclovias</span>
                    </div>
                  </div>
                </div>

                {/* Mapa Hexagonal H3 com k-anonimato */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">
                      Malha Territorial Hexagonal H3 (Curitiba):
                    </span>
                    <span className="text-[#94A3B8] font-mono">
                      Células abaixo de 3 sessões aparecem como "Não Auditado" (LGPD Art. 12)
                    </span>
                  </div>
                  <div className="h-[420px] rounded-xl overflow-hidden border border-[#1A2A5A]">
                    <PortalH3HexMap cells={h3Cells} height="420px" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ETAPA 5: INTEROPERABILIDADE & CIC */}
          {/* ========================================================================= */}
          {currentStepIndex === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Schema e Endpoints da API Pública / B2G */}
                <div className="lg:col-span-7 bg-[#101B3A] border border-[#1A2A5A] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#1A2A5A]">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Network className="w-4 h-4 text-[#3B82F6]" />
                        <span>Contratos de API REST & Interoperabilidade CIC</span>
                      </h3>
                      <p className="text-xs text-[#94A3B8]">
                        Conformidade com a Lei do Governo Digital (Lei 14.129/2021)
                      </p>
                    </div>
                    <span className="text-[10px] font-mono bg-[#3B82F6]/15 text-[#60A5FA] px-2 py-0.5 rounded border border-[#3B82F6]/30">
                      JSON / GeoJSON
                    </span>
                  </div>

                  {/* Exemplos de endpoints abertos do produto */}
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[#10B981]">GET</span>
                        <span className="text-[10px] font-mono text-[#94A3B8]">
                          k-anonimato k ≥ 3
                        </span>
                      </div>
                      <code className="text-xs font-mono text-[#F8FAFC] block bg-[#070D1F] p-2 rounded">
                        /backend/v1/interop/h3-cells?codigo_ibge=4106902
                      </code>
                      <p className="text-[11px] text-[#94A3B8]">
                        Exporta hexágonos GeoJSON com notas médias do IMV/IMA consolidadas apenas
                        para células com 3 ou mais passagens registradas.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[#3B82F6]">POST</span>
                        <span className="text-[10px] font-mono text-[#94A3B8]">
                          Webhook Autônomo
                        </span>
                      </div>
                      <code className="text-xs font-mono text-[#F8FAFC] block bg-[#070D1F] p-2 rounded">
                        /backend/v1/interop/webhooks/os-dispatch
                      </code>
                      <p className="text-[11px] text-[#94A3B8]">
                        Aciona despacho para o sistema de zeladoria municipal assim que um segmento
                        atinge severidade crítica confirmada por F ≥ 3.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[#10B981]">GET</span>
                        <span className="text-[10px] font-mono text-[#94A3B8]">
                          Auditoria Soberana
                        </span>
                      </div>
                      <code className="text-xs font-mono text-[#F8FAFC] block bg-[#070D1F] p-2 rounded">
                        /backend/v1/public/portal-status?codigo_ibge=4106902
                      </code>
                      <p className="text-[11px] text-[#94A3B8]">
                        Endpoint público higienizado para consulta pelo munícipe no Portal da
                        Transparência sem exigir credenciais sensíveis.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      to="/interoperabilidade"
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#60A5FA] hover:text-white transition-colors"
                    >
                      <span>Abrir Documentação Completa da API (/interoperabilidade)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Painel do Centro Integrado de Operação (CIC) */}
                <div className="lg:col-span-5 bg-[#101B3A] border border-[#1A2A5A] rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-xs font-mono font-bold uppercase text-[#10B981]">
                      Integração CIC / CICC
                    </span>
                    <h4 className="text-xl font-bold text-white">
                      Conexão em Tempo Real com a Sala de Situação
                    </h4>
                    <p className="text-xs text-[#CBD5E1] leading-relaxed">
                      A plataforma se comunica nativamente com as telas do Centro de Controle
                      Operacional, integrando a telemetria do asfalto aos sinais semafóricos da Onda
                      2 (Green Light Bridge) e detecção de veículos estacionados em faixas
                      exclusivas.
                    </p>

                    <div className="space-y-2 pt-2">
                      <div className="p-3 rounded-xl bg-[#0A1128] border border-[#1A2A5A] flex items-center justify-between text-xs">
                        <span className="text-[#94A3B8]">Protocolo de Troca:</span>
                        <span className="font-mono text-white font-bold">GTFS-RT & GeoJSON</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#0A1128] border border-[#1A2A5A] flex items-center justify-between text-xs">
                        <span className="text-[#94A3B8]">Latência Média de Evento:</span>
                        <span className="font-mono text-[#10B981] font-bold">
                          &lt; 1,5 segundos
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#0A1128] border border-[#1A2A5A] flex items-center justify-between text-xs">
                        <span className="text-[#94A3B8]">Soberania dos Dados:</span>
                        <span className="font-mono text-[#60A5FA] font-bold">100% Municipal</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-xs text-[#10B981] space-y-1">
                    <span className="font-bold block">Conformidade Legal Assegurada:</span>
                    <span>
                      Cumprimento do Marco Legal das Startups (Art. 27 a 31 da LC 182/2021) e da Lei
                      de Governo Digital.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ETAPA 6: RELATÓRIOS OFICIAIS COM HASH SHA-256 */}
          {/* ========================================================================= */}
          {currentStepIndex === 5 && (
            <div className="space-y-6">
              <div className="bg-[#101B3A] border-2 border-[#10B981]/40 rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1A2A5A]">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#10B981] bg-[#10B981]/15 px-2.5 py-0.5 rounded border border-[#10B981]/30">
                      Blindagem de Contas Públicas & Perícia
                    </span>
                    <h3 className="text-2xl font-extrabold text-white mt-2">
                      Dossiê Técnico com Hash SHA-256 e Minuta do Art. 320 CTB
                    </h3>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      Conclusão do tour autoguiado: a documentação que viabiliza a tramitação
                      jurídica imediata no órgão.
                    </p>
                  </div>

                  <Link
                    to="/enquadramento"
                    className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#10B981]/30 transition-all shrink-0"
                  >
                    <span>Iniciar Enquadramento Oficial</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Exibição dos 4 Relatórios Homologados do Produto */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Relatório 1 */}
                  <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#60A5FA] uppercase font-bold">
                        Enquadramento CPSI
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1">
                        Dossiê Jurídico & Art. 320 CTB
                      </h4>
                      <p className="text-[11px] text-[#94A3B8] mt-1 leading-relaxed">
                        Emite nota técnica e minuta de empenho pronta vinculando a fonte de multas à
                        engenharia preventiva.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-[#1A2A5A] text-[10px] font-mono text-[#10B981]">
                      Hash SHA-256 Automático
                    </div>
                  </div>

                  {/* Relatório 2 */}
                  <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#10B981] uppercase font-bold">
                        Homologação Dry-Run
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1">
                        Laudo de Homologação B2G
                      </h4>
                      <p className="text-[11px] text-[#94A3B8] mt-1 leading-relaxed">
                        Protocolo oficial ORBIS-DRYRUN-2026-001 auditando os 7 critérios do playbook
                        de go-live.
                      </p>
                    </div>
                    <Link
                      to="/homologacao"
                      target="_blank"
                      className="text-[10px] font-bold text-[#60A5FA] hover:text-white flex items-center gap-1"
                    >
                      <span>Ver Laudo (/homologacao)</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* Relatório 3 */}
                  <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#38BDF8] uppercase font-bold">
                        Continuidade & SLA
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1">
                        Pacote Operacional & RTO/RPO
                      </h4>
                      <p className="text-[11px] text-[#94A3B8] mt-1 leading-relaxed">
                        Garante RTO de 1,45s no banco soberano, backups diários e rotina de purga
                        aos 180 dias (LGPD).
                      </p>
                    </div>
                    <Link
                      to="/operacao"
                      target="_blank"
                      className="text-[10px] font-bold text-[#60A5FA] hover:text-white flex items-center gap-1"
                    >
                      <span>Ver Pacote (/operacao)</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* Relatório 4 */}
                  <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#F59E0B] uppercase font-bold">
                        RACI & Matriz
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1">Playbook de Implantação</h4>
                      <p className="text-[11px] text-[#94A3B8] mt-1 leading-relaxed">
                        Roteiro de 5 fases para implantação ágil em 30 dias com portaria de fiscais
                        e termo de cooperação.
                      </p>
                    </div>
                    <Link
                      to="/implantacao"
                      target="_blank"
                      className="text-[10px] font-bold text-[#60A5FA] hover:text-white flex items-center gap-1"
                    >
                      <span>Ver Playbook (/implantacao)</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Box de Assinatura e Protocolo de Encerramento */}
                <div className="p-5 rounded-xl bg-[#070D1F] border border-[#1A2A5A] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-xs font-mono font-bold text-[#10B981]">
                      ✓ DEMONSTRAÇÃO CONCLUÍDA COM SUCESSO
                    </span>
                    <p className="text-xs text-[#CBD5E1]">
                      O órgão possui todos os elementos para protocolar o chamamento CPSI via Marco
                      Legal da Inovação (LC 182/2021).
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => goToStep(0)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#CBD5E1] bg-[#101B3A] hover:bg-[#1A2A5A] border border-[#1A2A5A] transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reiniciar Tour</span>
                    </button>
                    <Link
                      to="/enquadramento"
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-md shadow-[#3B82F6]/30 transition-all flex items-center gap-1.5"
                    >
                      <span>Ir ao Enquadramento</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 4. BARRA DE NAVEGAÇÃO INFERIOR ENTRE ETAPAS */}
        <div className="pt-6 border-t border-[#1A2A5A] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#94A3B8] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
            <span>
              Você está na etapa <b>{currentStep.id}</b> de <b>6</b> ({currentStep.title})
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => goToStep(currentStepIndex - 1)}
              disabled={currentStepIndex === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#CBD5E1] bg-[#101B3A] hover:bg-[#1A2A5A] border border-[#1A2A5A] disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Etapa Anterior</span>
            </button>

            {currentStepIndex < DEMO_STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => goToStep(currentStepIndex + 1)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-md shadow-[#3B82F6]/30 transition-all flex items-center gap-1.5"
              >
                <span>Próxima: {DEMO_STEPS[currentStepIndex + 1].shortTitle}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Link
                to="/enquadramento"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] shadow-md shadow-[#10B981]/30 transition-all flex items-center gap-1.5"
              >
                <span>Concluir e Iniciar Enquadramento</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
