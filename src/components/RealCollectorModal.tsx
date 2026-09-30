import { useState } from 'react'
import {
  Smartphone,
  Play,
  Square,
  Sparkles,
  AlertTriangle,
  MapPin,
  Clock,
  Compass,
  CheckCircle2,
  Database,
  Info,
  ShieldCheck,
  X,
  Gauge,
  Activity,
  Layers,
  Lock,
  Unlock,
  Radio,
  FileCheck2,
  Pause,
  RotateCcw,
  Zap,
} from 'lucide-react'
import {
  useDeviceMotionCollector,
  DetectedAnomaly,
  PhoneMountPosition,
} from '@/hooks/useDeviceMotionCollector'
import { createRoadEvent, RoadEventRecord } from '@/services/roadEvents'
import { AgentTaxonomyCode } from '@/services/roadSegments'
import { drainOfflineQueue, getQueueStats } from '@/lib/collectorOfflineDb'
import { useAuth } from '@/contexts/AuthContext'
import { VeiculoTipoCalibracao, VEICULO_TIPOS_CONFIG } from '@/services/fatorKCalibration'
import { toast } from '@/hooks/use-toast'
import { RefreshCw } from 'lucide-react'

interface RealCollectorModalProps {
  isOpen: boolean
  onClose: () => void
  onEventCreated?: (newEvent: RoadEventRecord) => void
  onOpenSimulatorFallback?: () => void
}

export function RealCollectorModal({
  isOpen,
  onClose,
  onEventCreated,
  onOpenSimulatorFallback,
}: RealCollectorModalProps) {
  // Session metadata
  const [via, setVia] = useState('Av. Sete de Setembro, 3200')
  const [bairro, setBairro] = useState('Batel')
  const [veiculoTipoCanonico, setVeiculoTipoCanonico] = useState<VeiculoTipoCalibracao>('onibus')
  const [linhaFrota, setLinhaFrota] = useState('Linha Direta / Ligeirinho 203')
  const [veiculoTipo, setVeiculoTipo] = useState('Smartphone no Painel do Ônibus')
  const [thresholdG, setThresholdG] = useState(2.5)

  // Manual location toggle
  const [showManualLocation, setShowManualLocation] = useState(false)
  const [manualLat, setManualLat] = useState(-25.4372)
  const [manualLng, setManualLng] = useState(-49.2731)

  const { user } = useAuth()
  // Persisting state
  const [persistedAnomalyIds, setPersistedAnomalyIds] = useState<Set<string>>(new Set())
  const [isPersistingAll, setIsPersistingAll] = useState(false)
  const [isDrainingQueue, setIsDrainingQueue] = useState(false)
  const [initialPhonePosition, setInitialPhonePosition] = useState<PhoneMountPosition>('painel')

  // Sensor collector hook
  const veiculoAtualConfig =
    VEICULO_TIPOS_CONFIG[veiculoTipoCanonico] || VEICULO_TIPOS_CONFIG.onibus

  // Mapeamento dinâmico para agent_code
  const agentCode: AgentTaxonomyCode = (() => {
    if (veiculoAtualConfig.modoCategoria === 'pedestre') return 'PEDESTRE'
    if (veiculoAtualConfig.modoCategoria === 'ciclista') return 'CICLISTA'
    if (veiculoAtualConfig.modoCategoria === 'motociclista') return 'MOTOCICLISTA'
    if (veiculoTipoCanonico === 'onibus') return 'ONIBUS_FROTA'
    return 'VEICULO_FROTA'
  })()

  const {
    status,
    sensorSupport,
    permissionError,
    isWakeLocked,
    wakeLockSupported,
    toggleWakeLock,
    phonePosition,
    setPhonePosition,
    routeCoverage,
    discardedLowSpeedCount,
    isAutoPaused,
    canResumePrevious,
    samplingRateHz,
    currentZ,
    currentRoll,
    currentPitch,
    peakSessionG,
    recentSamples,
    spectrumAnalysis,
    anomalies,
    processedWindows,
    latestWindowMetrics,
    sessionSummary,
    desviosContagem,
    elapsedMs,
    calculatedIRI,
    currentCoords,
    currentSegmentId,
    gpsStatus,
    speedKmh,
    startSession,
    stopSession,
    pauseSession,
    resumeSession,
    setManualLocation,
    buildEventPayload,
  } = useDeviceMotionCollector({
    thresholdG,
    via,
    bairro,
    linhaFrota: linhaFrota || `${veiculoAtualConfig.label} #01`,
    veiculoTipo: veiculoTipo || veiculoAtualConfig.label,
    veiculoTipoCanonico,
    modoColeta: veiculoAtualConfig.modoCategoria,
    indiceAlvo: veiculoAtualConfig.indiceAlvo,
    agentCode,
    phonePosition: initialPhonePosition,
    codigoIbge: '4106902',
    manualLat,
    manualLng,
    operadorNome: user?.name || user?.email || 'Operador de Campo / Cockpit',
    autoPersistWindows: true,
    autoPersistAnomalies: true,
    onAnomalyPersisted: (anomaly) => {
      setPersistedAnomalyIds((prev) => new Set([...prev, anomaly.id]))
    },
  })

  if (!isOpen) return null

  // Manual drain trigger
  const handleManualDrain = async () => {
    setIsDrainingQueue(true)
    try {
      const stats = await getQueueStats()
      if (stats.totalPending === 0) {
        toast({
          title: 'Fila offline vazia',
          description: 'Nenhum dado pendente de transmissão.',
        })
        return
      }
      const res = await drainOfflineQueue()
      toast({
        title: 'Drenagem da fila concluída!',
        description: `${res.windowsDrained} janela(s) e ${res.anomaliesDrained} anomalia(s) reenviadas. Restantes: ${res.remainingPending}`,
      })
    } catch (err: any) {
      toast({
        title: 'Erro na drenagem',
        description: err?.message || 'Falha ao processar fila offline.',
        variant: 'destructive',
      })
    } finally {
      setIsDrainingQueue(false)
    }
  }

  // Format elapsed time (mm:ss)
  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000)
    const mins = Math.floor(totalSecs / 60)
    const secs = totalSecs % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Persist a single anomaly
  const handlePersistAnomaly = async (anomaly: DetectedAnomaly) => {
    if (persistedAnomalyIds.has(anomaly.id)) return

    try {
      const payload = buildEventPayload(anomaly, {
        via,
        bairro,
        linhaFrota,
        veiculoTipo,
      })
      const created = await createRoadEvent(payload)
      setPersistedAnomalyIds((prev) => new Set([...prev, anomaly.id]))
      if (onEventCreated) {
        onEventCreated(created)
      }
      toast({
        title: 'Anomalia gravada com sucesso!',
        description: `${payload.tipo.toUpperCase()} (${payload.severidade}) registrado em ${payload.via}`,
      })
    } catch (err: any) {
      console.error('Erro ao persistir anomalia:', err)
      toast({
        title: 'Falha ao gravar anomalia',
        description: err?.message || 'Verifique a conexão com o banco.',
        variant: 'destructive',
      })
    }
  }

  // Persist all captured anomalies to PocketBase
  const handlePersistAll = async () => {
    const toPersist = anomalies.filter((a) => !persistedAnomalyIds.has(a.id))
    if (toPersist.length === 0) {
      toast({
        title: 'Nenhuma nova anomalia pontual',
        description: 'Todas as anomalias da sessão já foram gravadas no banco.',
      })
      return
    }

    setIsPersistingAll(true)
    let savedCount = 0
    try {
      for (const anomaly of toPersist) {
        const payload = buildEventPayload(anomaly, {
          via,
          bairro,
          linhaFrota,
          veiculoTipo,
        })
        const created = await createRoadEvent(payload)
        savedCount++
        setPersistedAnomalyIds((prev) => new Set([...prev, anomaly.id]))
        if (onEventCreated) {
          onEventCreated(created)
        }
      }
      toast({
        title: 'Sessão persistida!',
        description: `${savedCount} anomalia(s) gravada(s) na base de dados de Curitiba.`,
      })
    } catch (err: any) {
      console.error('Erro ao gravar lote:', err)
      toast({
        title: 'Erro parcial na gravação',
        description: 'Algumas anomalias não puderam ser gravadas.',
        variant: 'destructive',
      })
    } finally {
      setIsPersistingAll(false)
    }
  }

  // Sparkline coordinates
  const sparkWidth = 260
  const sparkHeight = 48
  const maxZ = Math.max(4, ...recentSamples.map((s) => Math.abs(s.inG)), thresholdG)
  const sparkPoints =
    recentSamples.length > 1
      ? recentSamples
          .map((s, idx) => {
            const x = (idx / (recentSamples.length - 1)) * sparkWidth
            const normY = Math.min(Math.abs(s.inG) / maxZ, 1)
            const y = sparkHeight - normY * (sparkHeight - 6) - 3
            return `${x.toFixed(1)},${y.toFixed(1)}`
          })
          .join(' ')
      : ''

  const isCollecting = status === 'collecting'
  const isCalibrating = status === 'calibrating'
  const isPaused = status === 'paused'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="collector-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-[#101B3A] border border-[#1A2A5A] rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#1A2A5A] flex items-center justify-between bg-[#0A1128]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/15 border border-[#3B82F6]/40 flex items-center justify-center text-[#3B82F6]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="collector-title" className="text-base sm:text-lg font-bold text-[#F8FAFC]">
                  Coleta Real de Telemetria Inercial
                </h2>
                <span className="text-[10px] font-mono uppercase bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded border border-[#10B981]/40 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                  Sensor Físico • Borda Ativa
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Acelerômetro + Giroscópio (DeviceMotion API) com FFT embarcada e agregação por
                segmento de 100m
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (isCollecting || isCalibrating) stopSession()
              onClose()
            }}
            aria-label="Fechar modal"
            className="w-8 h-8 rounded-lg bg-[#0A1128] border border-[#1A2A5A] hover:border-[#3B82F6] text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning / Unsupported Notice */}
        {sensorSupport === 'unsupported' && (
          <div className="p-4 mx-5 mt-4 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/40 text-xs text-[#F59E0B] flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <span className="font-bold block text-[#F8FAFC]">
                Dispositivo sem sensor inercial acessível
              </span>
              <p className="text-[#CBD5E1] text-[11px] leading-relaxed">
                Este dispositivo ou navegador não expõe o sensor inercial físico (típico em PCs
                desktop). Para testar a captura real na frota, abra este Cockpit em um smartphone
                embarcado (iOS Safari 13+ ou Android Chrome via HTTPS). No computador, você pode
                alternar para o simulador inercial.
              </p>
              {onOpenSimulatorFallback && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenSimulatorFallback()
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#3B82F6] hover:text-[#60A5FA] underline"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Abrir Simulador Inercial Desktop
                </button>
              )}
            </div>
          </div>
        )}

        {permissionError && (
          <div className="p-4 mx-5 mt-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/40 text-xs text-[#EF4444] flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Acesso negado aos sensores:</span>
              <p className="text-xs text-[#CBD5E1] mt-0.5">{permissionError}</p>
            </div>
          </div>
        )}

        {/* Banner de Auto-Retomada se a sessão foi suspensa por segundo plano / perda de visibilidade */}
        {(isAutoPaused || isPaused) && (
          <div className="mx-5 mt-4 p-4 rounded-xl bg-[#F59E0B]/15 border-2 border-[#F59E0B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#FDE68A] animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <Pause className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-white block">
                  {isAutoPaused
                    ? 'Coleta Pausada Automaticamente (Aba em Segundo Plano / Sensores Suspensos)'
                    : 'Coleta em Pausa'}
                </span>
                <p className="text-[11px] text-[#CBD5E1] leading-relaxed">
                  Os dados capturados permanecem 100% seguros na fila offline local (IndexedDB).
                  Toque em retomar para religar os sensores inerciais imediatamente.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={resumeSession}
              className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] flex items-center gap-1.5 shadow-md shadow-[#10B981]/25 shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Retomar Sessão com 1 Toque</span>
            </button>
          </div>
        )}

        {/* Banner de Boas Práticas de Operação: Wake Lock Explícito & Posição do Aparelho */}
        <div className="mx-5 mt-4 p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#F8FAFC] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#3B82F6]" />
                Caminho 2 — PWA + Wake Lock Ativo
              </span>
              <span className="text-[10px] font-mono text-[#94A3B8]">
                Aba em primeiro plano • Celular no suporte
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8]">
              Restrição da Web: navegadores suspendem sensores em segundo plano. Mantenha a tela
              travada acesa durante o turno.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Botão / Indicador Explícito de Wake Lock */}
            {wakeLockSupported ? (
              <button
                type="button"
                onClick={toggleWakeLock}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  isWakeLocked
                    ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/60 shadow-sm shadow-[#10B981]/20'
                    : 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/40 hover:bg-[#EF4444]/25'
                }`}
                title={
                  isWakeLocked
                    ? 'Wake Lock ATIVO. Clique para liberar.'
                    : 'Wake Lock INATIVO. Toque para travar tela acesa.'
                }
              >
                {isWakeLocked ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Tela Travada Acesa (Ativa)</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-[#EF4444]" />
                    <span>Travar Tela Acesa (Inativa — Toque)</span>
                  </>
                )}
              </button>
            ) : (
              <span className="text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-2 py-1 rounded text-[11px]">
                Aviso: Screen Wake Lock API indisponível neste navegador
              </span>
            )}

            <span className="bg-[#3B82F6]/15 text-[#60A5FA] border border-[#3B82F6]/30 px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" />
              {samplingRateHz} Hz (Resample 50Hz)
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Resumo da Sessão (Exibido imediatamente ao Parar a Coleta) */}
          {sessionSummary && status === 'stopped' && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#101B3A] to-[#0A1128] border-2 border-[#10B981] space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-[#1A2A5A]">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-[#10B981]" />
                  <h3 className="text-sm font-bold text-[#F8FAFC]">
                    Resumo da Sessão Concluída — Índice Alvo:{' '}
                    <span className="text-[#3B82F6]">{sessionSummary.indiceAlvo}</span>
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-[#10B981]/20 text-[#10B981] px-2.5 py-0.5 rounded border border-[#10B981]/40 font-bold">
                  Onda 3 • Borda Ativa
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-[#070D1F] border border-[#1A2A5A]">
                  <span className="text-[10px] text-[#94A3B8] block">Duração</span>
                  <span className="font-mono font-bold text-sm text-[#F8FAFC]">
                    {formatTime(sessionSummary.durationMs)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#070D1F] border border-[#1A2A5A]">
                  <span className="text-[10px] text-[#94A3B8] block">Distância Estimada</span>
                  <span className="font-mono font-bold text-sm text-[#60A5FA]">
                    {sessionSummary.distanceMeters >= 1000
                      ? `${(sessionSummary.distanceMeters / 1000).toFixed(2)} km`
                      : `${sessionSummary.distanceMeters} m`}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#070D1F] border border-[#1A2A5A]">
                  <span className="text-[10px] text-[#94A3B8] block">Cobertura de Rota</span>
                  <span className="font-mono font-bold text-sm text-[#10B981]">
                    {sessionSummary.routeCoverage.coveragePct}%
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#070D1F] border border-[#1A2A5A]">
                  <span className="text-[10px] text-[#94A3B8] block">Janelas FFT</span>
                  <span className="font-mono font-bold text-sm text-[#F8FAFC]">
                    {sessionSummary.windowsProcessed}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#070D1F] border border-[#1A2A5A]">
                  <span className="text-[10px] text-[#94A3B8] block">Impactos Válidos</span>
                  <span className="font-mono font-bold text-sm text-[#EF4444]">
                    {sessionSummary.impactsDetected}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#070D1F] border border-[#1A2A5A]">
                  <span className="text-[10px] text-[#94A3B8] block">Descarte &lt;15 km/h</span>
                  <span className="font-mono font-bold text-sm text-[#F59E0B]">
                    {sessionSummary.discardedLowSpeedCount}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#070D1F] border border-[#1A2A5A]">
                  <span className="text-[10px] text-[#94A3B8] block">Posição Aparelho</span>
                  <span className="font-mono font-bold text-xs text-[#38BDF8]">
                    {sessionSummary.phonePosition === 'painel' ? 'Suporte Painel' : 'Bolso / Outro'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 text-xs text-[#94A3B8]">
                <span>
                  Alimentou o <b>{sessionSummary.indiceAlvo}</b> com <b>+1 passagem</b> para o Fator
                  de Confiança (meta ≥ 3). Cobertura temporal dos sensores:{' '}
                  <strong className="text-white font-mono">
                    {sessionSummary.routeCoverage.coveragePct}% ativo
                  </strong>{' '}
                  ({Math.round(sessionSummary.routeCoverage.gapsMs / 1000)}s em lacuna/background).
                  {sessionSummary.discardedLowSpeedCount > 0 && (
                    <span className="text-[#FBBF24] ml-1">
                      • {sessionSummary.discardedLowSpeedCount} pico(s) descartado(s) por velocidade
                      &lt;15 km/h (sem energia de suspensão).
                    </span>
                  )}
                </span>
                <span className="font-mono text-[11px] text-[#CBD5E1]">
                  IRI/Score equivalente: <b>{sessionSummary.averageIri} m/km</b> • Pico:{' '}
                  <b>{sessionSummary.peakG.toFixed(2)}g</b>
                </span>
              </div>
            </div>
          )}
          {/* Real-time Display Console */}
          <div className="p-4 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A2A5A]">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-[#3B82F6]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                  Telemetria Eixo Z & Atitude Angular
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {isCalibrating && (
                  <span className="bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 px-2.5 py-0.5 rounded-md font-mono text-[11px] animate-pulse">
                    Calibrando Linha de Base (3s)... Mantenha o aparelho em repouso
                  </span>
                )}
                {isCollecting && (
                  <span className="bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 px-2.5 py-0.5 rounded-md font-mono text-[11px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                    Captura Ativa
                  </span>
                )}
                {status === 'idle' && (
                  <span className="text-[#94A3B8] text-[11px] font-mono">Pronto para iniciar</span>
                )}
                {status === 'stopped' && (
                  <span className="text-[#3B82F6] text-[11px] font-mono">Sessão Finalizada</span>
                )}
              </div>
            </div>

            {/* Big Numbers & Sparkline */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Big Z Readout + Angular Rates */}
              <div className="sm:col-span-5 p-3 rounded-xl bg-[#101B3A] border border-[#1A2A5A] text-center space-y-2">
                <span className="text-[10px] text-[#94A3B8] uppercase block tracking-wider font-semibold">
                  Aceleração Vertical Instantânea
                </span>
                <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight tabular-nums text-[#F8FAFC]">
                  {currentZ > 0 ? `+${currentZ.toFixed(2)}` : currentZ.toFixed(2)}
                  <span className="text-base font-bold text-[#3B82F6] ml-1">g</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-[10px] font-mono text-[#94A3B8]">
                  <span>
                    Pico: <b className="text-[#10B981]">{peakSessionG.toFixed(2)}g</b>
                  </span>
                  <span>•</span>
                  <span>
                    Limiar: <b className="text-[#FBBF24]">{thresholdG.toFixed(1)}g</b>
                  </span>
                </div>

                {/* Roll & Pitch rates */}
                <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-[#1A2A5A]/60 text-[10px] font-mono">
                  <div className="bg-[#070D1F] p-1.5 rounded border border-[#1A2A5A]">
                    <span className="text-[#94A3B8] block text-[9px]">Giro Pitch</span>
                    <span className="text-[#CBD5E1] font-bold">{currentPitch}°/s</span>
                  </div>
                  <div className="bg-[#070D1F] p-1.5 rounded border border-[#1A2A5A]">
                    <span className="text-[#94A3B8] block text-[9px]">Giro Roll</span>
                    <span className="text-[#CBD5E1] font-bold">{currentRoll}°/s</span>
                  </div>
                </div>
              </div>

              {/* Sparkline Chart & Metrics */}
              <div className="sm:col-span-7 space-y-3">
                {/* SVG Sparkline */}
                <div className="p-2.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
                  <div className="flex items-center justify-between text-[10px] text-[#94A3B8] mb-1">
                    <span>Osciloscópio Z (Últimas 30 leituras)</span>
                    <span className="font-mono text-[9px]">Sensibilidade: ±{maxZ.toFixed(1)}g</span>
                  </div>
                  <div className="h-12 w-full flex items-center justify-center bg-[#070D1F] rounded-lg px-2 overflow-hidden relative">
                    <div
                      className="absolute inset-x-0 border-t border-[#EF4444]/40 border-dashed pointer-events-none"
                      style={{
                        top: `${Math.max(10, Math.min(85, 100 - (thresholdG / maxZ) * 100))}%`,
                      }}
                    />
                    {recentSamples.length > 2 ? (
                      <svg
                        className="w-full h-full"
                        viewBox={`0 0 ${sparkWidth} ${sparkHeight}`}
                        preserveAspectRatio="none"
                      >
                        <polyline
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={sparkPoints}
                        />
                      </svg>
                    ) : (
                      <span className="text-[10px] text-[#94A3B8]/60 italic font-mono">
                        {status === 'idle'
                          ? 'Inicie a coleta para visualizar o gráfico'
                          : 'Aguardando leituras...'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Session mini pills */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-[#101B3A] border border-[#1A2A5A]">
                    <span className="text-[9px] text-[#94A3B8] block">Duração</span>
                    <span className="font-mono font-bold text-[#F8FAFC] flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-[#3B82F6]" />
                      {formatTime(elapsedMs)}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#101B3A] border border-[#1A2A5A]">
                    <span className="text-[9px] text-[#94A3B8] block">Impactos Z</span>
                    <span className="font-mono font-bold text-[#EF4444]">{anomalies.length}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#101B3A] border border-[#1A2A5A]">
                    <span className="text-[9px] text-[#94A3B8] block">Cobertura Rota</span>
                    <span className="font-mono font-bold text-[#10B981]">
                      {routeCoverage.coveragePct}%
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#101B3A] border border-[#1A2A5A]">
                    <span className="text-[9px] text-[#94A3B8] block">IRI Estimado</span>
                    <span className="font-mono font-bold text-[#38BDF8]">{calculatedIRI}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Painel Espectro FFT em Tempo Real (SDK Edge 1-20 Hz com Janela de Hann e Bandas Documentadas) */}
            <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-0.5 rounded border border-[#3B82F6]/40 font-bold">
                    Janela de Hann + FFT 50Hz Fixo
                  </span>
                  <span className="text-xs font-bold text-[#F8FAFC]">
                    Bandas Espectrais: 1–4 Hz (Suspensão/IRI) & 5–20 Hz (Impacto/Buraco)
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono text-[#94A3B8]">
                  <span>
                    Freq. Dominante:{' '}
                    <b className="text-[#3B82F6]">
                      {spectrumAnalysis?.dominantFrequency
                        ? `${spectrumAnalysis.dominantFrequency} Hz`
                        : '—'}
                    </b>
                  </span>
                  <span>•</span>
                  <span>
                    Suspensão 1–4Hz:{' '}
                    <b className="text-[#38BDF8]">{spectrumAnalysis?.suspensionEnergyPct ?? 42}%</b>
                  </span>
                  <span>•</span>
                  <span>
                    Impactos 5–20Hz:{' '}
                    <b className="text-[#10B981]">{spectrumAnalysis?.anomalyEnergyPct ?? 52}%</b>
                  </span>
                </div>
              </div>

              {/* Graphic visualizer: Bar spectrum */}
              <div className="h-20 w-full bg-[#070D1F] rounded-lg p-2 flex items-end gap-1 overflow-hidden border border-[#1A2A5A]/60 relative">
                <div className="absolute top-1 left-2 text-[9px] font-mono text-[#10B981] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  Banda Relevante 1–20 Hz (Vibração Mecânica Veicular / Defeitos do Asfalto)
                </div>

                {spectrumAnalysis?.bins && spectrumAnalysis.bins.length > 0
                  ? spectrumAnalysis.bins.map((bin, i) => (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center justify-end h-full group relative"
                      >
                        <div
                          style={{ height: `${Math.max(8, bin.magnitude)}%` }}
                          className={`w-full rounded-t-sm transition-all duration-150 ${
                            bin.isTargetBand
                              ? bin.magnitude > 70
                                ? 'bg-[#10B981]'
                                : 'bg-[#3B82F6]'
                              : 'bg-[#1E293B]'
                          }`}
                        />
                      </div>
                    ))
                  : Array.from({ length: 24 }).map((_, i) => {
                      const freq = (i + 1) * 1.05
                      const isTarget = freq >= 1 && freq <= 20
                      const simulatedHeight = isCollecting
                        ? Math.sin(i * 0.4) * 35 + 45
                        : Math.sin(i * 0.5) * 20 + 25
                      return (
                        <div
                          key={i}
                          className="flex-1 flex flex-col items-center justify-end h-full"
                        >
                          <div
                            style={{ height: `${simulatedHeight}%` }}
                            className={`w-full rounded-t-sm ${
                              isTarget ? 'bg-[#3B82F6]/60' : 'bg-[#1E293B]'
                            }`}
                          />
                        </div>
                      )
                    })}
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#94A3B8] font-mono">
                <span>0 Hz (Componente DC removida)</span>
                <span className="text-[#10B981]">
                  Janela de Hann • 1–4 Hz (Suspensão/IRI) • 5–20 Hz (Buracos) • Resample 50Hz
                </span>
                <span>25 Hz (Nyquist @ 50Hz)</span>
              </div>
            </div>

            {/* Segmento de 100m Associado & Localização */}
            <div className="p-3 rounded-xl bg-[#101B3A]/80 border border-[#1A2A5A] space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[#10B981]" />
                  <span className="text-[#94A3B8]">Segmento de 100m:</span>
                  <span className="font-mono font-bold text-[#F8FAFC] bg-[#070D1F] px-2 py-0.5 rounded border border-[#1A2A5A]">
                    {currentSegmentId}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-[#3B82F6]/15 text-[#60A5FA] px-2 py-0.5 rounded border border-[#3B82F6]/30">
                    {processedWindows.length} janelas agregadas
                  </span>
                  <span className="text-[10px] font-mono bg-[#10B981]/15 text-[#10B981] px-2 py-0.5 rounded border border-[#10B981]/30">
                    Fator Confiança: +1 Passagem
                  </span>
                  {discardedLowSpeedCount > 0 && (
                    <span className="text-[10px] font-mono bg-[#F59E0B]/15 text-[#FBBF24] px-2 py-0.5 rounded border border-[#F59E0B]/30">
                      {discardedLowSpeedCount} descartados &lt;15km/h
                    </span>
                  )}
                </div>
              </div>

              {/* Coordenadas e Velocidade */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#1A2A5A]/60 text-[11px]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span className="font-mono text-[#CBD5E1]">
                    {currentCoords.latitude.toFixed(4)}, {currentCoords.longitude.toFixed(4)}
                  </span>
                  {currentCoords.isApprox ? (
                    <span className="text-[9px] font-mono bg-[#F59E0B]/20 text-[#F59E0B] px-1.5 py-0.5 rounded">
                      Localização Aproximada (Curitiba)
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono bg-[#10B981]/20 text-[#10B981] px-1.5 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      GPS Ativo{' '}
                      {currentCoords.accuracy ? `(±${Math.round(currentCoords.accuracy)}m)` : ''}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {speedKmh !== undefined ? (
                    <span className="text-[#94A3B8] font-mono">
                      Velocidade:{' '}
                      <b className={speedKmh >= 15 ? 'text-[#10B981]' : 'text-[#F59E0B]'}>
                        {speedKmh} km/h
                      </b>
                      {speedKmh < 15 && (
                        <span className="text-[10px] text-[#F59E0B] ml-1">
                          (&lt;15 km/h: sem energia de suspensão)
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-[#94A3B8] font-mono text-[10px]">
                      Velocidade GPS em aquisição
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowManualLocation(!showManualLocation)}
                    className="text-[#3B82F6] hover:text-[#60A5FA] underline font-medium"
                  >
                    {showManualLocation ? 'Ocultar ajuste' : 'Ajustar no mapa'}
                  </button>
                </div>
              </div>
            </div>

            {/* Manual coordinate picker fallback */}
            {showManualLocation && (
              <div className="p-3 rounded-xl bg-[#070D1F] border border-[#1A2A5A] space-y-2 text-xs animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#F8FAFC]">
                    Definir Coordenadas Manuais (Fallback de GPS)
                  </span>
                  <span className="text-[10px] text-[#94A3B8]">Centro de Curitiba como padrão</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[#94A3B8] block mb-0.5">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={manualLat}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        setManualLat(val)
                        setManualLocation(val, manualLng)
                      }}
                      className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded px-2 py-1 text-[#F8FAFC] font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#94A3B8] block mb-0.5">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={manualLng}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        setManualLng(val)
                        setManualLocation(manualLat, val)
                      }}
                      className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded px-2 py-1 text-[#F8FAFC] font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Session Context Metadata Form */}
          <div className="p-4 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#3B82F6]" />
                Metadados da Coleta, Posição & Frota Pública
              </span>
              <span className="text-[10px] text-[#94A3B8]">Gravados no evento auditável</span>
            </div>

            {/* PERGUNTA DE 1 CLIQUE: POSIÇÃO DO CELULAR COMO FEATURE */}
            <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#3B82F6]/40 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#F8FAFC] flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#38BDF8]" />
                  Posição do Smartphone na Sessão (Feature Inercial):
                </label>
                <span className="text-[10px] font-mono text-[#94A3B8]">
                  Pergunta de 1 clique • Gravada no evento
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPhonePosition('painel')
                    setInitialPhonePosition('painel')
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                    phonePosition === 'painel'
                      ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-white shadow-sm'
                      : 'bg-[#0A1128] border-[#1A2A5A] text-[#94A3B8] hover:text-[#CBD5E1]'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      phonePosition === 'painel'
                        ? 'border-[#3B82F6] bg-[#3B82F6]'
                        : 'border-[#64748B]'
                    }`}
                  >
                    {phonePosition === 'painel' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-xs block text-white">
                      Suporte Firme do Painel (Recomendado)
                    </span>
                    <span className="text-[10px] text-[#94A3B8] block">
                      Acoplamento mecânico direto ao chassi veicular
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPhonePosition('bolso_outro')
                    setInitialPhonePosition('bolso_outro')
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                    phonePosition === 'bolso_outro'
                      ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-white shadow-sm'
                      : 'bg-[#0A1128] border-[#1A2A5A] text-[#94A3B8] hover:text-[#CBD5E1]'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      phonePosition === 'bolso_outro'
                        ? 'border-[#3B82F6] bg-[#3B82F6]'
                        : 'border-[#64748B]'
                    }`}
                  >
                    {phonePosition === 'bolso_outro' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-xs block text-white">
                      Bolso / Mochila / Outro
                    </span>
                    <span className="text-[10px] text-[#94A3B8] block">
                      Atenuação biomecânica (calibrada pelo Fator K)
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* SELEÇÃO DO MODO DE MOBILIDADE & TIPO DE VEÍCULO-SENSOR (ONDA 3) */}
            <div className="p-3.5 rounded-xl bg-[#101B3A] border-2 border-[#3B82F6]/50 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold text-[#F8FAFC] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                  Modo de Mobilidade & Veículo-Sensor:
                </label>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                      veiculoAtualConfig.indiceAlvo === 'IMA'
                        ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40'
                        : 'bg-[#3B82F6]/20 text-[#60A5FA] border-[#3B82F6]/40'
                    }`}
                  >
                    Alimenta: {veiculoAtualConfig.indiceAlvo} (
                    {veiculoAtualConfig.indiceAlvo === 'IMA'
                      ? 'Mobilidade Ativa'
                      : 'Manutenção Viária'}
                    )
                  </span>
                  <span className="text-[10px] font-mono text-[#CBD5E1] bg-[#0A1128] px-2 py-0.5 rounded border border-[#1A2A5A]">
                    Banda FFT: {veiculoAtualConfig.bandaFftHz.label}
                  </span>
                  <span className="text-[10px] font-mono text-[#60A5FA] bg-[#3B82F6]/15 px-2 py-0.5 rounded border border-[#3B82F6]/30">
                    Baseline K: {veiculoAtualConfig.baselineK.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Seletor em abas / cards organizados: Frota Veicular vs Mobilidade Ativa */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                  Frota Pública (Alimenta Sub-índice IMV — Asfalto / Vias)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(
                    [
                      'onibus',
                      'viatura',
                      'caminhao',
                      'ambulancia',
                      'outros',
                    ] as VeiculoTipoCalibracao[]
                  ).map((key) => {
                    const cfg = VEICULO_TIPOS_CONFIG[key]
                    const isSelected = veiculoTipoCanonico === key
                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={isCollecting || isCalibrating}
                        onClick={() => {
                          setVeiculoTipoCanonico(key)
                          setVeiculoTipo(cfg.label)
                          if (key === 'onibus') setLinhaFrota('Linha Direta / Ligeirinho 203')
                          else if (key === 'viatura')
                            setLinhaFrota('Viatura Guarda Municipal GM-09')
                          else if (key === 'caminhao') setLinhaFrota('Caminhão Coleta Noturna 08')
                          else if (key === 'ambulancia') setLinhaFrota('Ambulância SAMU Unidade 04')
                          else setLinhaFrota('Fiscalização e Obras #12')
                        }}
                        className={`p-2 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-white shadow-md shadow-[#3B82F6]/20'
                            : 'bg-[#0A1128] border-[#1A2A5A] text-[#94A3B8] hover:border-[#3B82F6]/50 hover:text-[#CBD5E1]'
                        } disabled:opacity-50`}
                      >
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span>{cfg.label.split(' ')[0]}</span>
                          <span className="text-[10px] font-mono text-[#3B82F6]">
                            K={cfg.baselineK.toFixed(2)}
                          </span>
                        </div>
                        <span className="text-[10px] block opacity-80 leading-tight mt-0.5 line-clamp-1">
                          {cfg.sublabel.split('/')[0]}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-[#10B981] block pt-1">
                  Onda 3 • Mobilidade Ativa (Alimenta Sub-índice IMA — Calçadas, Ciclovias e Duas
                  Rodas)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(['pedestre', 'ciclista', 'motociclista'] as VeiculoTipoCalibracao[]).map(
                    (key) => {
                      const cfg = VEICULO_TIPOS_CONFIG[key]
                      const isSelected = veiculoTipoCanonico === key
                      return (
                        <button
                          key={key}
                          type="button"
                          disabled={isCollecting || isCalibrating}
                          onClick={() => {
                            setVeiculoTipoCanonico(key)
                            setVeiculoTipo(cfg.label)
                            if (key === 'pedestre') setLinhaFrota('Caminhada Acessibilidade Batel')
                            else if (key === 'ciclista') setLinhaFrota('Ciclovia Sete de Setembro')
                            else setLinhaFrota('Patrulha Motociclista 03')
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-[#10B981]/20 border-[#10B981] text-white shadow-md shadow-[#10B981]/20'
                              : 'bg-[#0A1128] border-[#1A2A5A] text-[#94A3B8] hover:border-[#10B981]/50 hover:text-[#CBD5E1]'
                          } disabled:opacity-50`}
                        >
                          <div className="font-bold text-xs flex items-center justify-between">
                            <span className="text-[#F8FAFC]">{cfg.label}</span>
                            <span className="text-[10px] font-mono text-[#10B981]">
                              K={cfg.baselineK.toFixed(2)}
                            </span>
                          </div>
                          <span className="text-[10px] block opacity-80 leading-tight mt-1 text-[#CBD5E1]">
                            {cfg.sublabel}
                          </span>
                          <div className="mt-1 flex items-center justify-between text-[9px] font-mono text-[#94A3B8]">
                            <span>Banda FFT: {cfg.bandaFftHz.label}</span>
                            {cfg.trataViesDesvio && (
                              <span className="text-[#F59E0B]">Trata viés desvio</span>
                            )}
                          </div>
                        </button>
                      )
                    },
                  )}
                </div>
              </div>

              {/* Dica do operador e Viés de Desvio Declarado */}
              <div className="p-2.5 rounded-lg bg-[#070D1F] border border-[#1A2A5A] text-[11px] text-[#94A3B8] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#F8FAFC] font-semibold">
                    Orientação do Modo: {veiculoAtualConfig.dicaOperador}
                  </span>
                  <span className="font-mono text-[10px] text-[#60A5FA]">
                    {veiculoAtualConfig.suspensaoTipo}
                  </span>
                </div>
                {veiculoAtualConfig.trataViesDesvio && (
                  <div className="text-[#FBBF24] text-[10px] bg-[#F59E0B]/10 p-1.5 rounded border border-[#F59E0B]/30">
                    <b>Viés de Desvio Declarado Metodológico:</b> Pedestres e motociclistas tendem a
                    desviar de buracos e desníveis em vez de transpô-los. A telemetria calcula
                    desvios angulares laterais contínuos como anomalias indiretas mapeadas.
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#94A3B8] font-semibold mb-1">
                  Via / Corredor de Tráfego
                </label>
                <input
                  type="text"
                  value={via}
                  onChange={(e) => setVia(e.target.value)}
                  placeholder="Ex: Av. Visconde de Guarapuava, 2100"
                  className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-lg px-3 py-2 text-[#F8FAFC] placeholder:text-[#94A3B8]/50 focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] font-semibold mb-1">
                  Bairro de Curitiba
                </label>
                <input
                  type="text"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  placeholder="Ex: Batel, Centro, Portão..."
                  className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-lg px-3 py-2 text-[#F8FAFC] placeholder:text-[#94A3B8]/50 focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] font-semibold mb-1">
                  Linha / Identificação da Frota
                </label>
                <input
                  type="text"
                  value={linhaFrota}
                  onChange={(e) => setLinhaFrota(e.target.value)}
                  placeholder="Ex: Linha Direta 203 ou Viatura 14"
                  className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-lg px-3 py-2 text-[#F8FAFC] placeholder:text-[#94A3B8]/50 focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] font-semibold mb-1">
                  Sensibilidade do Limiar (Trigger Anomalia)
                </label>
                <select
                  value={thresholdG}
                  onChange={(e) => setThresholdG(parseFloat(e.target.value))}
                  className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-lg px-3 py-2 text-[#F8FAFC]"
                >
                  <option value={2.0}>2.0g (Alta sensibilidade - micro-ondulações)</option>
                  <option value={2.5}>2.5g (Padrão sugerido - buracos médios/altos)</option>
                  <option value={3.0}>3.0g (Impactos severos e buracos profundos)</option>
                  <option value={3.5}>3.5g (Apenas severidade crítica)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Captured Anomalies Feed of the Session */}
          {anomalies.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#1A2A5A]">
                <div>
                  <h4 className="text-xs font-bold text-[#F8FAFC] flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#EF4444]" />
                    Anomalias Pontuais de Alto Impacto ({anomalies.length})
                  </h4>
                  <span className="text-[10px] text-[#94A3B8]">
                    Eventos inerciais que ultrapassaram {thresholdG}g (Auto-persistência ativa em
                    tempo real)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleManualDrain}
                    disabled={isDrainingQueue}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#94A3B8] hover:text-white bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    title="Drenar fila offline se houver eventos pendentes"
                  >
                    <RefreshCw
                      className={`w-3 h-3 ${isDrainingQueue ? 'animate-spin text-[#3B82F6]' : ''}`}
                    />
                    <span>Drenar Fila</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePersistAll}
                    disabled={isPersistingAll}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Database className="w-3.5 h-3.5" />
                    {isPersistingAll ? 'Gravando...' : 'Re-gravar Todas'}
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {anomalies.map((anom) => {
                  const isSaved = persistedAnomalyIds.has(anom.id)
                  return (
                    <div
                      key={anom.id}
                      className="p-2.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                              anom.severity === 'critica'
                                ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40'
                                : anom.severity === 'alta'
                                  ? 'bg-[#F97316]/20 text-[#F97316] border border-[#F97316]/40'
                                  : 'bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/40'
                            }`}
                          >
                            {anom.severity}
                          </span>
                          <span className="font-bold text-[#F8FAFC] uppercase text-[11px]">
                            {anom.tipo}
                          </span>
                          <span className="font-mono text-[#3B82F6] font-semibold">
                            {anom.peakG.toFixed(2)}g
                          </span>
                          {anom.dominantFreq && (
                            <span className="text-[9px] font-mono text-[#10B981] bg-[#10B981]/15 px-1.5 py-0.2 rounded border border-[#10B981]/30">
                              {anom.dominantFreq} Hz
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#94A3B8] block">
                          {new Date(anom.timestamp).toLocaleTimeString()} • Lat:{' '}
                          {anom.latitude.toFixed(4)}, Long: {anom.longitude.toFixed(4)}
                          {anom.segmentoId && ` • ${anom.segmentoId}`}
                        </span>
                      </div>

                      <div>
                        {isSaved ? (
                          <span className="text-[10px] font-bold text-[#10B981] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Gravado
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handlePersistAnomaly(anom)}
                            className="px-2.5 py-1 rounded bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[11px] font-semibold transition-colors"
                          >
                            Gravar
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* LGPD & Proteção de Dados Note */}
          <div className="p-3 rounded-xl bg-[#101B3A]/40 border border-[#1A2A5A]/60 flex items-start gap-2.5 text-[11px] text-[#94A3B8]">
            <Info className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="text-[#F8FAFC] font-semibold">Garantia LGPD & Zero CAPEX: </span>
              A telemetria inercial passiva opera{' '}
              <b>sem câmeras, sem imagens e sem captura de placas</b>. O celular pode ir seguro no{' '}
              <b>bolso, mochila ou suporte</b> durante caminhada, pedal ou condução. Os dados
              gravados são puramente físicos e agregados por janela e segmento de 100m, preservando
              integralmente a privacidade de terceiros e dos operadores da frota pública.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#1A2A5A] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0A1128]/70">
          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span>Dados criptografados e em conformidade LGPD</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                if (isCollecting || isCalibrating) stopSession()
                onClose()
              }}
              className="px-4 py-2.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] text-xs font-semibold text-[#CBD5E1] hover:text-white transition-colors"
            >
              Fechar
            </button>

            {isPaused && (
              <button
                type="button"
                onClick={resumeSession}
                className="px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#10B981]/20 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                Retomar Coleta
              </button>
            )}

            {isCollecting && (
              <button
                type="button"
                onClick={pauseSession}
                className="px-4 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#F59E0B]/20 active:scale-95 transition-all"
              >
                <Pause className="w-4 h-4 fill-white" />
                Pausar
              </button>
            )}

            {!isCollecting && !isCalibrating && !isPaused ? (
              <button
                type="button"
                onClick={startSession}
                className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#10B981]/20 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                Iniciar Coleta Real
              </button>
            ) : (
              <button
                type="button"
                onClick={stopSession}
                className="px-5 py-2.5 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#EF4444]/20 active:scale-95 transition-all"
              >
                <Square className="w-4 h-4 fill-white" />
                Encerrar Coleta
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
