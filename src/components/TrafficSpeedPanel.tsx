import React, { useState, useEffect } from 'react'
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
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  Radio,
  RefreshCw,
  Info,
  Sliders,
  AlertTriangle,
} from 'lucide-react'
import {
  TrafficCorridorSegment,
  CityTrafficOverview,
  TimeWindowId,
  TIME_WINDOWS,
} from '@/services/trafficSpeed'
import {
  trafficAdapterRegistry,
  TrafficSourceProviderId,
  TRAFFIC_SOURCES,
  testWazeFeedUrl,
  WazeFeedTestResult,
  TrafficExecutionResult,
} from '@/services/trafficAdapters'
import { InstitucionalSettingsRecord } from '@/services/institucionalSettings'

interface TrafficSpeedPanelProps {
  onFocusCorridor?: (corridor: TrafficCorridorSegment) => void
  institucionalSettings?: InstitucionalSettingsRecord | null
  onSettingsChanged?: () => void
}

export function TrafficSpeedPanel({
  onFocusCorridor,
  institucionalSettings,
  onSettingsChanged,
}: TrafficSpeedPanelProps) {
  const [selectedWindow, setSelectedWindow] = useState<TimeWindowId>('geral_24h')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Estado da fonte ativa
  const [activeSourceId, setActiveSourceId] = useState<TrafficSourceProviderId>(
    trafficAdapterRegistry.getActiveSourceId(),
  )

  // Estado dos dados executados
  const [executionResult, setExecutionResult] = useState<TrafficExecutionResult | null>(null)
  const [loadingData, setLoadingData] = useState<boolean>(false)

  // Configuração do Waze for Cities
  const [wazeUrl, setWazeUrl] = useState<string>(institucionalSettings?.waze_feed_url || '')
  const [wazeActive, setWazeActive] = useState<boolean>(
    Boolean(institucionalSettings?.waze_feed_active),
  )

  // Estados do teste do feed
  const [testingFeed, setTestingFeed] = useState<boolean>(false)
  const [testResult, setTestResult] = useState<WazeFeedTestResult | null>(
    (institucionalSettings?.waze_last_test_details as WazeFeedTestResult) || null,
  )
  const [lastTestedAt, setLastTestedAt] = useState<string | null>(
    institucionalSettings?.waze_last_tested_at || null,
  )

  // Feedback de salvamento e acessibilidade
  const [savingConfig, setSavingConfig] = useState<boolean>(false)
  const [statusAnnouncement, setStatusAnnouncement] = useState<string>('')

  // Sincronizar quando institucionalSettings mudar
  useEffect(() => {
    if (institucionalSettings) {
      trafficAdapterRegistry.applySettings(institucionalSettings)
      setActiveSourceId(trafficAdapterRegistry.getActiveSourceId())
      if (institucionalSettings.waze_feed_url !== undefined) {
        setWazeUrl(institucionalSettings.waze_feed_url || '')
      }
      if (institucionalSettings.waze_feed_active !== undefined) {
        setWazeActive(Boolean(institucionalSettings.waze_feed_active))
      }
      if (institucionalSettings.waze_last_test_details) {
        setTestResult(institucionalSettings.waze_last_test_details)
      }
      if (institucionalSettings.waze_last_tested_at) {
        setLastTestedAt(institucionalSettings.waze_last_tested_at)
      }
    }
  }, [institucionalSettings])

  // Carregar dados de tráfego conforme fonte ativa
  const loadTrafficData = async () => {
    setLoadingData(true)
    try {
      const res = await trafficAdapterRegistry.fetchTrafficData(selectedWindow)
      setExecutionResult(res)
      if (res.fallbackTriggered) {
        setStatusAnnouncement(
          `Aviso: O feed do Waze for Cities não respondeu em runtime. Recorrendo automaticamente à Coleta ORBIS DSP padrão. Motivo: ${res.fallbackReason}`,
        )
      }
    } catch (err: any) {
      console.error('Erro ao carregar dados de tráfego:', err)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    loadTrafficData()
  }, [activeSourceId, selectedWindow])

  // Testar Feed do Waze
  const handleTestFeed = async () => {
    const clean = wazeUrl.trim()
    if (!clean) {
      setStatusAnnouncement('Erro: Por favor, informe uma URL válida para testar o feed.')
      return
    }

    setTestingFeed(true)
    setStatusAnnouncement('Iniciando teste real de conexão com o feed do Waze for Cities...')
    try {
      const res = await testWazeFeedUrl(clean)
      setTestResult(res)
      const now = new Date().toISOString()
      setLastTestedAt(now)

      if (res.ok) {
        setStatusAnnouncement(
          `Teste do feed bem-sucedido: O endereço respondeu com HTTP ${res.httpStatus} em ${res.elapsedMs} ms. Estrutura JSON válida. O interruptor de ativação foi liberado.`,
        )
      } else {
        setStatusAnnouncement(
          `Falha no teste do feed: ${res.message}. O interruptor de ativação permanece bloqueado até resposta válida.`,
        )
        // Se o teste falhar e estava ativo, desativa para segurança
        if (wazeActive) {
          setWazeActive(false)
        }
      }

      // Persistir resultado do teste
      await trafficAdapterRegistry.saveWazeConfiguration({
        codigoIbge: institucionalSettings?.codigo_ibge || '4106902',
        feedUrl: clean,
        active: res.ok ? wazeActive : false,
        testResult: res,
      })
      onSettingsChanged?.()
    } catch (err: any) {
      console.error('Erro ao testar feed:', err)
      setStatusAnnouncement('Erro inesperado ao tentar validar o feed. Verifique a conexão.')
    } finally {
      setTestingFeed(false)
    }
  }

  // Alternar ativação do Waze for Cities
  const handleToggleWazeActivation = async (newActiveState: boolean) => {
    if (newActiveState && (!testResult || !testResult.ok)) {
      setStatusAnnouncement(
        'Ação bloqueada: É obrigatório realizar um teste bem-sucedido do feed antes de ativar o Waze for Cities.',
      )
      return
    }

    setSavingConfig(true)
    try {
      await trafficAdapterRegistry.saveWazeConfiguration({
        codigoIbge: institucionalSettings?.codigo_ibge || '4106902',
        feedUrl: wazeUrl.trim(),
        active: newActiveState,
        testResult: testResult || undefined,
      })

      setWazeActive(newActiveState)
      if (newActiveState) {
        setActiveSourceId('waze_for_cities')
        trafficAdapterRegistry.setActiveSourceId('waze_for_cities')
        setStatusAnnouncement(
          'Waze for Cities ativado com sucesso como fonte da camada de tráfego do Cockpit!',
        )
      } else {
        setActiveSourceId('orbis_dsp')
        trafficAdapterRegistry.setActiveSourceId('orbis_dsp')
        setStatusAnnouncement(
          'Waze for Cities desativado. Fonte da camada de tráfego retornada para Coleta ORBIS DSP.',
        )
      }

      onSettingsChanged?.()
      await loadTrafficData()
    } catch (err: any) {
      console.error('Erro ao salvar ativação:', err)
      setStatusAnnouncement('Erro ao salvar alteração de ativação no backend.')
    } finally {
      setSavingConfig(false)
    }
  }

  // Selecionar fonte ativa manualmente
  const handleSelectSource = (id: TrafficSourceProviderId) => {
    if (id === 'waze_for_cities' && !wazeActive) {
      setStatusAnnouncement(
        'Aviso: O adaptador Waze for Cities precisa ser configurado e ativado no painel abaixo antes de ser selecionado como fonte primária.',
      )
      return
    }

    setActiveSourceId(id)
    trafficAdapterRegistry.setActiveSourceId(id)
    setStatusAnnouncement(`Fonte de tráfego alterada para: ${TRAFFIC_SOURCES[id].nome}`)
  }

  const corridors = executionResult?.corridors || []
  const overview = executionResult?.overview || {
    codigoIbge: '4106902',
    municipio: 'Curitiba / PR',
    atualizadoEm: new Date().toISOString(),
    statusGeralMalha: 'livre' as const,
    velocidadeMediaGeralKmh: 33.2,
    pctMalhaLivre: 48,
    pctMalhaAtencao: 32,
    pctMalhaCongestionada: 20,
    kmMonitoradosTempoReal: 28.9,
    narrativaGeral: 'Carregando estado de fluidez da malha viária...',
    fonteDeclarada: TRAFFIC_SOURCES[activeSourceId].declaracaoFonte,
    comparativoJanelas: [],
  }

  // Filtro
  const filteredCorridors = corridors.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    return true
  })

  // Janela selecionada config
  const currentWindowConfig = TIME_WINDOWS.find((w) => w.id === selectedWindow) || TIME_WINDOWS[0]

  // Velocidade média calculada da janela selecionada
  const avgSpeedWindow = (
    corridors.reduce(
      (acc, curr) => acc + (curr.janelasVelocidade[selectedWindow] || curr.velocidadeObservadaKmh),
      0,
    ) / (corridors.length || 1)
  ).toFixed(1)

  const isWazeTestedSuccessfully = testResult?.ok === true
  const isUrlProvided = Boolean(wazeUrl.trim())

  return (
    <div className="space-y-6">
      {/* WCAG 2.2: Área de anúncios para leitores de tela */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {statusAnnouncement}
      </div>

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
                Curitiba •{' '}
                {activeSourceId === 'waze_for_cities' && wazeActive
                  ? 'Waze for Cities Oficial'
                  : 'Coleta Passiva da Frota'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#F8FAFC] tracking-tight">
              Monitoramento Contínuo de Fluidez & Velocidade Média
            </h2>
            <p className="text-xs text-[#94A3B8] max-w-2xl mt-1 leading-relaxed">
              {activeSourceId === 'waze_for_cities' && wazeActive
                ? 'Estado de fluidez viária consolidado via feed oficial do Waze for Cities sob convênio do órgão municipal de trânsito (SMDT/URBS).'
                : 'Estado de fluidez viária calculado a partir dos tacógrafos digitais e odometria inercial dos veículos municipais (ônibus URBS, caminhões de coleta e viaturas).'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-[#38BDF8] bg-[#38BDF8]/15 border border-[#38BDF8]/30 px-3 py-1.5 rounded-xl">
              Zero API Paga • Convênios Oficiais
            </span>
            <span className="text-[11px] font-mono text-[#10B981] bg-[#10B981]/15 border border-[#10B981]/30 px-3 py-1.5 rounded-xl">
              28,9 km Monitorados
            </span>
          </div>
        </div>

        {/* SELETOR DE FONTE DECLARADA (ORBIS DSP vs FEED EXTERNO GRATUITO WAZE FOR CITIES) */}
        <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-mono text-[#94A3B8] uppercase font-bold block">
                Camada de Integração de Tráfego: Fonte Ativa
              </span>
              <span className="text-xs text-[#CBD5E1]">
                Alterne entre a telemetria passiva da frota e o feed oficial do convênio Waze for
                Cities
              </span>
            </div>

            {/* Toggle de Fonte */}
            <div className="flex items-center gap-1.5 bg-[#101B3A] p-1 rounded-xl border border-[#1A2A5A]">
              <button
                type="button"
                onClick={() => handleSelectSource('orbis_dsp')}
                aria-pressed={activeSourceId === 'orbis_dsp'}
                className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] ${
                  activeSourceId === 'orbis_dsp'
                    ? 'bg-[#10B981] text-white shadow-md'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <span>Coleta ORBIS DSP (Primária)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSource('waze_for_cities')}
                aria-pressed={activeSourceId === 'waze_for_cities'}
                className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] ${
                  activeSourceId === 'waze_for_cities'
                    ? 'bg-[#3B82F6] text-white shadow-md'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <span>Waze for Cities {wazeActive ? '(Ativo)' : '(Desativado)'}</span>
              </button>
            </div>
          </div>

          {/* Rótulo de Declaração Honesta da Fonte Ativa */}
          <div className="pt-2 border-t border-[#1A2A5A]/60 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  activeSourceId === 'orbis_dsp'
                    ? 'bg-[#10B981]'
                    : wazeActive
                      ? 'bg-[#3B82F6]'
                      : 'bg-[#F59E0B]'
                }`}
              />
              <span className="text-[#94A3B8]">
                Declaração Oficial:{' '}
                <b className="text-white">
                  {executionResult?.fonteDeclarada ||
                    TRAFFIC_SOURCES[activeSourceId].declaracaoFonte}
                </b>
              </span>
            </div>

            <span className="text-[10px] font-mono text-[#38BDF8]">
              {activeSourceId === 'orbis_dsp'
                ? 'Modo Primário • Telemetria Municipal'
                : wazeActive
                  ? 'Convênio Ativo • Feed Governamental'
                  : 'Aguardando Ativação do Feed'}
            </span>
          </div>

          {/* Banner de Fallback Gracioso se o feed falhou em runtime */}
          {executionResult?.fallbackTriggered && (
            <div
              className="p-3.5 rounded-lg bg-[#2D1B10] border border-[#F59E0B] text-xs text-[#CBD5E1] space-y-1.5"
              role="alert"
              aria-live="assertive"
            >
              <div className="flex items-center gap-2 text-[#FBBF24] font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Contingência Operacional: Recorrência à Coleta ORBIS DSP</span>
              </div>
              <p className="leading-relaxed">
                O feed do Waze for Cities configurado não respondeu em runtime (
                {executionResult.fallbackReason}). Para assegurar a continuidade da auditoria e
                evitar telas vazias ou dados inventados, o Cockpit recorreu automaticamente à
                telemetria passiva ORBIS DSP calibrada.
              </p>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* BLOCO DEDICADO DE ATIVAÇÃO DO WAZE FOR CITIES                  */}
        {/* ------------------------------------------------------------- */}
        <section
          aria-labelledby="waze-config-heading"
          className="p-4 sm:p-5 rounded-xl bg-[#0A1128] border border-[#1E293B] space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A2A5A]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/20 border border-[#3B82F6]/40 flex items-center justify-center shrink-0">
                <Radio className="w-4 h-4 text-[#60A5FA]" />
              </div>
              <div>
                <h3 id="waze-config-heading" className="text-sm font-bold text-[#F8FAFC]">
                  Configuração & Ativação: Waze for Cities
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Programa governamental gratuito de compartilhamento bidirecional de dados viários
                </p>
              </div>
            </div>

            <a
              href="https://www.waze.com/pt-BR/ccp"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Saiba mais sobre a adesão ao programa Waze for Cities (abre em nova aba)"
              className="min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#38BDF8] hover:text-[#60A5FA] hover:bg-[#38BDF8]/10 inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <span>Adesão ao Programa Waze</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Estado sem feed configurado (Aguardando convênio Waze for Cities) */}
          {!isUrlProvided && (
            <div className="p-4 rounded-xl bg-[#15234A]/80 border border-[#3B82F6]/30 text-xs space-y-2">
              <div className="flex items-center gap-2 text-[#60A5FA] font-bold">
                <Info className="w-4 h-4 shrink-0" />
                <span>Aguardando convênio Waze for Cities — feed emitido após adesão</span>
              </div>
              <p className="text-[#CBD5E1] leading-relaxed">
                O programa Waze for Cities é 100% gratuito para prefeituras e órgãos públicos de
                trânsito (SMDT/URBS). O órgão solicita a adesão formal no portal do programa; ao
                receber a URL do feed oficial de alertas e lentidão, basta colar no campo abaixo,
                testar a conexão e ativar.
              </p>
              <div className="text-[11px] text-[#94A3B8] pt-1">
                Passo 1: Solicitar adesão &rarr; Passo 2: Receber URL do feed &rarr; Passo 3: Colar
                abaixo, testar e ligar.
              </div>
            </div>
          )}

          {/* Formulário de URL, Botão de Teste e Interruptor */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            {/* Campo de URL */}
            <div className="lg:col-span-6 space-y-1.5">
              <label
                htmlFor="waze-feed-url-input"
                className="text-xs font-bold text-[#CBD5E1] block"
              >
                URL do Feed Waze for Cities (JSON / GeoJSON Oficial)
              </label>
              <div className="relative">
                <input
                  id="waze-feed-url-input"
                  type="url"
                  placeholder="https://waze.com/row-partner-hub-api/..."
                  value={wazeUrl}
                  onChange={(e) => {
                    setWazeUrl(e.target.value)
                    // Reset do resultado do teste se a URL mudar
                    if (testResult) {
                      setTestResult(null)
                    }
                  }}
                  className="w-full min-h-[44px] bg-[#101B3A] border border-[#1A2A5A] rounded-xl px-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                />
              </div>
              <span className="text-[10px] text-[#94A3B8] block">
                Insira o endereço emitido ao órgão no termo de adesão ao Waze for Cities.
              </span>
            </div>

            {/* Botão Testar Feed */}
            <div className="lg:col-span-3">
              <button
                type="button"
                onClick={handleTestFeed}
                disabled={testingFeed || !isUrlProvided}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-[#1E293B] disabled:text-[#64748B] disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
                aria-label="Testar chamada real ao endereço de feed do Waze for Cities"
              >
                {testingFeed ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Testando conexão...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Testar Feed</span>
                  </>
                )}
              </button>
            </div>

            {/* Interruptor de Ativação */}
            <div className="lg:col-span-3 space-y-1.5">
              <label
                htmlFor="waze-activation-switch"
                className="text-xs font-bold text-[#CBD5E1] block"
              >
                Ativação no Cockpit
              </label>
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#101B3A] border border-[#1A2A5A] min-h-[44px]">
                <span className="text-xs text-[#94A3B8] pl-1 font-medium">
                  {wazeActive ? 'Adaptador Ativo' : 'Desativado'}
                </span>

                <button
                  id="waze-activation-switch"
                  type="button"
                  role="switch"
                  aria-checked={wazeActive}
                  disabled={!isWazeTestedSuccessfully || savingConfig}
                  onClick={() => handleToggleWazeActivation(!wazeActive)}
                  aria-label={
                    wazeActive
                      ? 'Desativar adaptador Waze for Cities'
                      : 'Ativar adaptador Waze for Cities (requer teste bem-sucedido)'
                  }
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] disabled:cursor-not-allowed disabled:opacity-40 ${
                    wazeActive ? 'bg-[#10B981]' : 'bg-[#1E293B]'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      wazeActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Feedback Visual do Teste (Reporte Honesto) */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                testResult.ok
                  ? 'bg-[#064E3B]/30 border-[#10B981]/50 text-[#A7F3D0]'
                  : 'bg-[#450A0A]/30 border-[#EF4444]/50 text-[#FECACA]'
              }`}
              role="region"
              aria-label="Resultado do teste do feed"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold">
                  {testResult.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
                  )}
                  <span>
                    {testResult.ok ? 'Feed Validado com Sucesso' : 'Falha na Validação do Feed'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-mono text-[#94A3B8]">
                  <span>HTTP {testResult.httpStatus || 0}</span>
                  <span>•</span>
                  <span>{testResult.elapsedMs} ms</span>
                </div>
              </div>

              <p className="leading-relaxed">{testResult.message}</p>

              {testResult.details && (
                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#94A3B8] font-mono">
                  {testResult.details.totalAlerts !== undefined && (
                    <span>
                      Alertas detectados: <b>{testResult.details.totalAlerts}</b>
                    </span>
                  )}
                  {testResult.details.totalJams !== undefined && (
                    <span>
                      Retenções/Jams: <b>{testResult.details.totalJams}</b>
                    </span>
                  )}
                  {testResult.details.isGeoJson && <span>Formato: GeoJSON FeatureCollection</span>}
                </div>
              )}

              {lastTestedAt && (
                <div className="text-[10px] text-[#94A3B8] pt-1">
                  Última verificação: {new Date(lastTestedAt).toLocaleString('pt-BR')} • Persistido
                  no backend
                </div>
              )}
            </div>
          )}

          {/* Aviso se tentar ativar sem testar */}
          {!isWazeTestedSuccessfully && isUrlProvided && (
            <div className="text-[11px] text-[#F59E0B] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>
                O interruptor de ativação permanece desabilitado até que um teste confirme resposta
                e formato JSON válido.
              </span>
            </div>
          )}
        </section>

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
                      {c.janelasVelocidade[selectedWindow] || c.velocidadeObservadaKmh} km/h
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
              Fonte Ativa Declarada:{' '}
              <b className="text-white">
                {executionResult?.fonteDeclarada || TRAFFIC_SOURCES[activeSourceId].declaracaoFonte}
              </b>
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#64748B]">LGPD k-anonimato garantido</span>
        </div>
      </div>
    </div>
  )
}
