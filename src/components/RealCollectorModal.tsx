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
  HelpCircle,
} from 'lucide-react'
import { useDeviceMotionCollector, DetectedAnomaly } from '@/hooks/useDeviceMotionCollector'
import { createRoadEvent, RoadEventRecord } from '@/services/roadEvents'
import { toast } from '@/hooks/use-toast'

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
  const [linhaFrota, setLinhaFrota] = useState('Linha Direta / Ligeirinho 203')
  const [veiculoTipo, setVeiculoTipo] = useState('Smartphone no Painel do Ônibus')
  const [thresholdG, setThresholdG] = useState(2.5)

  // Manual location toggle
  const [showManualLocation, setShowManualLocation] = useState(false)
  const [manualLat, setManualLat] = useState(-25.4372)
  const [manualLng, setManualLng] = useState(-49.2731)

  // Persisting state
  const [persistedAnomalyIds, setPersistedAnomalyIds] = useState<Set<string>>(new Set())
  const [isPersistingAll, setIsPersistingAll] = useState(false)

  // Sensor collector hook
  const {
    status,
    sensorSupport,
    permissionError,
    currentZ,
    peakSessionG,
    recentSamples,
    anomalies,
    elapsedMs,
    calculatedIRI,
    currentCoords,
    gpsStatus,
    speedKmh,
    startSession,
    stopSession,
    setManualLocation,
    buildEventPayload,
  } = useDeviceMotionCollector({
    thresholdG,
    manualLat,
    manualLng,
  })

  if (!isOpen) return null

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
        title: 'Nenhuma nova anomalia',
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="collector-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-[#101B3A] border border-[#1A2A5A] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
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
                  Sensor Físico
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Acelerômetro triaxial do smartphone via API DeviceMotion do navegador
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

        {/* Device Warning / Unsupported Notice */}
        {sensorSupport === 'unsupported' && (
          <div className="p-4 mx-5 mt-4 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/40 text-xs text-[#F59E0B] flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <span className="font-bold block text-[#F8FAFC]">
                Dispositivo sem sensor acessível
              </span>
              <p className="text-[#CBD5E1] text-[11px] leading-relaxed">
                Este dispositivo ou navegador não expõe o acelerômetro (comum em desktops sem
                sensores inerciais). Para testar a captura real, abra este cockpit em um smartphone
                (iOS Safari ou Android Chrome). Em computadores, você pode utilizar o simulador
                inercial padrão.
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

        {/* Body */}
        <div className="p-5 space-y-5 max-h-[72vh] overflow-y-auto">
          {/* Real-time Display Console */}
          <div className="p-4 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A2A5A]">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-[#3B82F6]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                  Telemetria Eixo Z (Vertical)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {/* Calibration or active indicator */}
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
                  <span className="text-[#3B82F6] text-[11px] font-mono">Sessão Concluída</span>
                )}
              </div>
            </div>

            {/* Big Numbers & Sparkline */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Big Z Readout */}
              <div className="sm:col-span-5 p-3 rounded-xl bg-[#101B3A] border border-[#1A2A5A] text-center">
                <span className="text-[10px] text-[#94A3B8] uppercase block tracking-wider font-semibold">
                  Aceleração Vertical Instantânea
                </span>
                <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight tabular-nums text-[#F8FAFC] my-1">
                  {currentZ > 0 ? `+${currentZ.toFixed(2)}` : currentZ.toFixed(2)}
                  <span className="text-base font-bold text-[#3B82F6] ml-1">g</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-[10px] font-mono text-[#94A3B8]">
                  <span>
                    Pico Sessão: <b className="text-[#10B981]">{peakSessionG.toFixed(2)}g</b>
                  </span>
                  <span>•</span>
                  <span>
                    Limiar: <b className="text-[#FBBF24]">{thresholdG.toFixed(1)}g</b>
                  </span>
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
                    {/* Threshold dotted line */}
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
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-[#101B3A] border border-[#1A2A5A]">
                    <span className="text-[9px] text-[#94A3B8] block">Duração</span>
                    <span className="font-mono font-bold text-[#F8FAFC] flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-[#3B82F6]" />
                      {formatTime(elapsedMs)}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#101B3A] border border-[#1A2A5A]">
                    <span className="text-[9px] text-[#94A3B8] block">Anomalias</span>
                    <span className="font-mono font-bold text-[#EF4444]">{anomalies.length}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#101B3A] border border-[#1A2A5A]">
                    <span className="text-[9px] text-[#94A3B8] block">IRI Estimado</span>
                    <span className="font-mono font-bold text-[#10B981]">{calculatedIRI} m/km</span>
                  </div>
                </div>
              </div>
            </div>

            {/* GPS & Location Status Banner */}
            <div className="p-2.5 rounded-xl bg-[#101B3A]/80 border border-[#1A2A5A] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span className="text-[#94A3B8]">Posição:</span>
                <span className="font-mono text-[#F8FAFC]">
                  {currentCoords.latitude.toFixed(4)}, {currentCoords.longitude.toFixed(4)}
                </span>
                {currentCoords.isApprox ? (
                  <span className="text-[9px] font-mono bg-[#F59E0B]/20 text-[#F59E0B] px-1.5 py-0.5 rounded border border-[#F59E0B]/40">
                    Aproximada (Curitiba)
                  </span>
                ) : (
                  <span className="text-[9px] font-mono bg-[#10B981]/20 text-[#10B981] px-1.5 py-0.5 rounded border border-[#10B981]/40 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    GPS Ativo{' '}
                    {currentCoords.accuracy ? `(±${Math.round(currentCoords.accuracy)}m)` : ''}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {speedKmh !== undefined && (
                  <span className="text-[#94A3B8] font-mono text-[11px]">
                    Vel.: <b className="text-[#60A5FA]">{speedKmh} km/h</b>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setShowManualLocation(!showManualLocation)}
                  className="text-[11px] text-[#3B82F6] hover:text-[#60A5FA] underline font-medium"
                >
                  {showManualLocation ? 'Ocultar ajuste' : 'Ajustar no mapa'}
                </button>
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
                Metadados da Coleta & Frota
              </span>
              <span className="text-[10px] text-[#94A3B8]">Gravados no evento auditável</span>
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
                    <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />
                    Anomalias Detectadas pelo Acelerômetro ({anomalies.length})
                  </h4>
                  <span className="text-[10px] text-[#94A3B8]">
                    Registros inerciais que ultrapassaram {thresholdG}g
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handlePersistAll}
                  disabled={isPersistingAll}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Database className="w-3.5 h-3.5" />
                  {isPersistingAll ? 'Gravando...' : 'Gravar Todas no Banco'}
                </button>
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
                        </div>
                        <span className="text-[10px] text-[#94A3B8] block">
                          {new Date(anom.timestamp).toLocaleTimeString()} • Lat:{' '}
                          {anom.latitude.toFixed(4)}, Long: {anom.longitude.toFixed(4)}
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

          {/* Quick instructions / Institutional notes */}
          <div className="p-3 rounded-xl bg-[#101B3A]/40 border border-[#1A2A5A]/60 flex items-start gap-2.5 text-[11px] text-[#94A3B8]">
            <Info className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="text-[#F8FAFC] font-semibold">Como funciona a calibração: </span>
              Ao clicar em <i>Iniciar Coleta Real</i>, mantenha o smartphone imóvel sobre uma
              superfície ou suporte do painel por 3 segundos. O sistema calcula a baseline de
              gravidade (1g = 9.8 m/s²) e zera o deslocamento. Quando o veículo passa por um buraco
              ou ondulação, o acelerômetro detecta a sobre-aceleração instantânea.
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

            {!isCollecting && !isCalibrating ? (
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
