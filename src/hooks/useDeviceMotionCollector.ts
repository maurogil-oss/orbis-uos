import { useState, useEffect, useRef, useCallback } from 'react'
import { RoadAnomalyType, RoadSeverity, CreateRoadEventPayload } from '@/services/roadEvents'
import {
  computeZAccelerationSpectrum,
  extractWindowMetrics,
  resampleToFixedRate,
  SpectrumAnalysisResult,
  WindowMetricsResult,
  FFT_BANDS_BY_MODE,
} from '@/lib/fft'
import {
  saveOfflineSession,
  getLatestPausedSession,
  enqueueOfflineWindow,
  enqueueOfflineAnomaly,
  drainOfflineQueue,
  OfflineSessionRecord,
} from '@/lib/collectorOfflineDb'
import {
  computeSegmentId,
  createSegmentReading,
  registerSegmentPassage,
  CreateSegmentReadingPayload,
  AgentTaxonomyCode,
} from '@/services/roadSegments'
import { createRoadEvent } from '@/services/roadEvents'
import { upsertFleetTelemetry } from '@/services/fleet'
import { latLngToCell, getH3ResolutionForModo } from '@/lib/diagnostics/h3Engine'
import {
  createFieldSession,
  VeiculoTipoCalibracao,
  ModoMobilidadeColeta,
  VEICULO_TIPOS_CONFIG,
} from '@/services/fatorKCalibration'

export type PhoneMountPosition = 'painel' | 'bolso_outro'

export interface MotionSample {
  timestamp: number
  rawZ: number
  calibratedZ: number
  inG: number
  rotationRoll?: number
  rotationPitch?: number
}

export interface DetectedAnomaly {
  id: string
  timestamp: number
  peakG: number
  severity: RoadSeverity
  tipo: RoadAnomalyType
  latitude: number
  longitude: number
  isApproxLocation: boolean
  dominantFreq?: number
  spectralSignature?: string
  persisted?: boolean
  segmentoId?: string
}

export interface AggregatedWindowData {
  id: string
  timestamp: number
  segmentoId: string
  via: string
  metrics: WindowMetricsResult
  latitude: number
  longitude: number
  speedKmh: number
  h3Index?: string
  h3Resolution?: number
  isPersisted: boolean
}

export interface RouteCoverageMetrics {
  totalSessionMs: number
  activeSensorsMs: number
  gapsMs: number
  coveragePct: number // % do tempo com sensores ativos vs lacunas
  discardedLowSpeedCount: number // eventos descartados por velocidade < 15 km/h
}

export interface SessionSummary {
  durationMs: number
  distanceMeters: number
  windowsProcessed: number
  impactsDetected: number
  desviosDetectados: number
  segmentsCovered: string[]
  averageIri: number
  peakG: number
  modoColeta: ModoMobilidadeColeta
  indiceAlvo: 'IMV' | 'IMA'
  phonePosition: PhoneMountPosition
  routeCoverage: RouteCoverageMetrics
  discardedLowSpeedCount: number
}

export interface CollectorConfig {
  thresholdG: number // Padrão 2.5g
  baselineDurationMs: number // Padrão 3000ms
  via: string
  bairro: string
  linhaFrota: string
  veiculoTipo: string
  veiculoTipoCanonico?: VeiculoTipoCalibracao
  modoColeta?: ModoMobilidadeColeta
  indiceAlvo?: 'IMV' | 'IMA'
  agentCode?: AgentTaxonomyCode
  phonePosition?: PhoneMountPosition
  veiculoId?: string
  codigoIbge?: string
  manualLat?: number
  manualLng?: number
  operadorNome?: string
  autoPersistWindows?: boolean // Salva agregados automaticamente no PocketBase
  autoPersistAnomalies?: boolean // Salva anomalias automaticamente no PocketBase
  onSessionComplete?: (summary: SessionSummary) => void
  onAnomalyPersisted?: (anomaly: DetectedAnomaly) => void
}

export type CollectorStatus = 'idle' | 'calibrating' | 'collecting' | 'paused' | 'stopped'

export type SensorSupport =
  | 'checking'
  | 'supported'
  | 'unsupported'
  | 'permission_needed'
  | 'permission_denied'

export function useDeviceMotionCollector(config: Partial<CollectorConfig> = {}) {
  const thresholdG = config.thresholdG ?? 2.5
  const baselineDurationMs = config.baselineDurationMs ?? 3000
  const codigoIbge = config.codigoIbge ?? '4106902' // Curitiba como padrão

  // Estados principais
  const [status, setStatus] = useState<CollectorStatus>('idle')
  const [sensorSupport, setSensorSupport] = useState<SensorSupport>('checking')
  const [permissionError, setPermissionError] = useState<string | null>(null)

  // Wake Lock state
  const [isWakeLocked, setIsWakeLocked] = useState<boolean>(false)
  const [wakeLockSupported, setWakeLockSupported] = useState<boolean>(false)
  const [wakeLockExplicitDisabled, setWakeLockExplicitDisabled] = useState<boolean>(false)

  // Posição do celular na sessão de coleta (suporte do painel vs bolso/outro)
  const [phonePosition, setPhonePosition] = useState<PhoneMountPosition>(
    config.phonePosition || 'painel',
  )

  // Auto-retomada e suspensão de sessão (background/visibility)
  const [canResumePrevious, setCanResumePrevious] = useState<boolean>(false)
  const [pausedSessionData, setPausedSessionData] = useState<OfflineSessionRecord | null>(null)
  const [isAutoPaused, setIsAutoPaused] = useState<boolean>(false)

  // Indicador de cobertura de rota (% de tempo com sensores ativos vs lacunas)
  const [routeCoverage, setRouteCoverage] = useState<RouteCoverageMetrics>({
    totalSessionMs: 0,
    activeSensorsMs: 0,
    gapsMs: 0,
    coveragePct: 100,
    discardedLowSpeedCount: 0,
  })
  const [discardedLowSpeedCount, setDiscardedLowSpeedCount] = useState<number>(0)

  // Leituras inerciais em tempo real
  const [currentZ, setCurrentZ] = useState<number>(0) // em g
  const [currentRoll, setCurrentRoll] = useState<number>(0) // deg/s
  const [currentPitch, setCurrentPitch] = useState<number>(0) // deg/s
  const [peakSessionG, setPeakSessionG] = useState<number>(0)
  const [samplingRateHz, setSamplingRateHz] = useState<number>(50) // cadência observada
  const [recentSamples, setRecentSamples] = useState<MotionSample[]>([])
  const [spectrumAnalysis, setSpectrumAnalysis] = useState<SpectrumAnalysisResult | null>(null)
  const [anomalies, setAnomalies] = useState<DetectedAnomaly[]>([])
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)
  const [elapsedMs, setElapsedMs] = useState<number>(0)

  // Janelas agregadas de borda
  const [processedWindows, setProcessedWindows] = useState<AggregatedWindowData[]>([])
  const [latestWindowMetrics, setLatestWindowMetrics] = useState<WindowMetricsResult | null>(null)
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null)
  const [desviosContagem, setDesviosContagem] = useState<number>(0)

  // GPS state
  const [currentCoords, setCurrentCoords] = useState<{
    latitude: number
    longitude: number
    accuracy?: number
    isApprox: boolean
  }>({
    latitude: config.manualLat ?? -25.4372,
    longitude: config.manualLng ?? -49.2731,
    isApprox: true,
  })
  const [gpsStatus, setGpsStatus] = useState<'pending' | 'active' | 'denied' | 'unsupported'>(
    'pending',
  )
  const [speedKmh, setSpeedKmh] = useState<number | undefined>(undefined)
  const [gpsTrack, setGpsTrack] = useState<{ lat: number; lng: number }[]>([])

  // Segmento atual associado
  const currentSegmentId = computeSegmentId(
    currentCoords.latitude,
    currentCoords.longitude,
    codigoIbge,
  )

  // Refs internas de hardware e buffer
  const baselineSamplesRef = useRef<number[]>([])
  const baselineOffsetRef = useRef<number>(9.80665) // linha de base m/s²
  const isCalibratingRef = useRef<boolean>(false)
  const calibrationStartRef = useRef<number>(0)
  const lastEventTimeRef = useRef<number>(0)
  const watchIdRef = useRef<number | null>(null)
  const wakeLockSentinelRef = useRef<any>(null)
  const coordsRef = useRef(currentCoords)
  coordsRef.current = currentCoords
  const speedRef = useRef(speedKmh)
  speedRef.current = speedKmh

  // Amostragem e janelamento (Edge Windowing)
  const sampleTimestampsRef = useRef<number[]>([])
  const windowTimedSamplesRef = useRef<Array<{ timestamp: number; value: number }>>([])
  const windowZBufferRef = useRef<number[]>([])
  const windowAngularBufferRef = useRef<{ roll: number; pitch: number }[]>([])
  const lastWindowFlushRef = useRef<number>(Date.now())
  const totalDesviosSessionRef = useRef<number>(0)

  // Métricas de cobertura de rota e monitoramento de lacunas (gaps)
  const activeSensorsMsRef = useRef<number>(0)
  const gapsMsRef = useRef<number>(0)
  const lastSensorEventTimeRef = useRef<number>(Date.now())
  const discardedLowSpeedRef = useRef<number>(0)
  const sessionIdRef = useRef<string>(`SES-${Date.now().toString(36).toUpperCase()}`)

  // Configuração canônica do tipo / modo
  const canonicoTipo = config.veiculoTipoCanonico || 'onibus'
  const configInfo = VEICULO_TIPOS_CONFIG[canonicoTipo] || VEICULO_TIPOS_CONFIG.onibus
  const modoAtivoEfetivo: ModoMobilidadeColeta =
    config.modoColeta || configInfo.modoCategoria || 'veiculo_frota'
  const indiceAlvoEfetivo: 'IMV' | 'IMA' = config.indiceAlvo || configInfo.indiceAlvo || 'IMV'

  // Mapeamento canônico do agente para o código de taxonomia
  const agentCodeEfetivo: AgentTaxonomyCode = (() => {
    if (config.agentCode) return config.agentCode
    if (modoAtivoEfetivo === 'pedestre') return 'PEDESTRE'
    if (modoAtivoEfetivo === 'ciclista') return 'CICLISTA'
    if (modoAtivoEfetivo === 'motociclista') return 'MOTOCICLISTA'
    if (canonicoTipo === 'onibus') return 'ONIBUS_FROTA'
    return 'VEICULO_FROTA'
  })()

  // Banda FFT selecionada para o processamento
  const bandConfigFft =
    modoAtivoEfetivo === 'pedestre'
      ? FFT_BANDS_BY_MODE.pedestre
      : modoAtivoEfetivo === 'ciclista'
        ? FFT_BANDS_BY_MODE.ciclista
        : modoAtivoEfetivo === 'motociclista'
          ? FFT_BANDS_BY_MODE.motociclista
          : FFT_BANDS_BY_MODE.veiculo

  // Checagem de suporte de sensores e WakeLock no mount + listener online para drenagem
  useEffect(() => {
    if (typeof window === 'undefined') {
      setSensorSupport('unsupported')
      return
    }

    // Wake Lock check
    if ('wakeLock' in navigator) {
      setWakeLockSupported(true)
    }

    const hasMotion = 'DeviceMotionEvent' in window
    if (!hasMotion) {
      setSensorSupport('unsupported')
      return
    }

    // iOS 13+ requer permissão explícita
    const motionEvent = window.DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>
    }

    if (typeof motionEvent?.requestPermission === 'function') {
      setSensorSupport('permission_needed')
    } else {
      setSensorSupport('supported')
    }

    // Listener de conectividade 'online': ao retornar a rede, drena a fila offline
    const handleOnline = () => {
      console.log('[Collector] Dispositivo voltou online, acionando drenagem de fila...')
      drainOfflineQueue().catch((err) =>
        console.warn('Erro na auto-drenagem ao voltar online:', err),
      )
    }
    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  // Drenagem periódica da fila offline durante sessão ativa (a cada 60 segundos)
  useEffect(() => {
    if (status !== 'collecting') return

    const intervalId = setInterval(() => {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        drainOfflineQueue().catch((err) => console.warn('Erro na drenagem periódica:', err))
      }
    }, 60000)

    return () => clearInterval(intervalId)
  }, [status])

  // Checar se há sessão pausada no IndexedDB para auto-retomada
  useEffect(() => {
    getLatestPausedSession().then((session) => {
      if (session && session.status === 'paused_background') {
        const diffHours = (Date.now() - session.updated) / (1000 * 60 * 60)
        if (diffHours < 12) {
          setCanResumePrevious(true)
          setPausedSessionData(session)
        }
      }
    })
  }, [])

  // Wake Lock acquirer & releaser explícito
  const requestWakeLock = useCallback(async () => {
    setWakeLockExplicitDisabled(false)
    if ('wakeLock' in navigator) {
      try {
        const sentinel = await (navigator as any).wakeLock.request('screen')
        wakeLockSentinelRef.current = sentinel
        setIsWakeLocked(true)
        sentinel.addEventListener('release', () => {
          setIsWakeLocked(false)
        })
        return true
      } catch (err) {
        console.warn('Wake Lock não disponível ou negado:', err)
        setIsWakeLocked(false)
        return false
      }
    }
    return false
  }, [])

  const releaseWakeLock = useCallback(() => {
    setWakeLockExplicitDisabled(true)
    if (wakeLockSentinelRef.current) {
      try {
        wakeLockSentinelRef.current.release()
      } catch {
        /* intentionally ignored */
      }
      wakeLockSentinelRef.current = null
      setIsWakeLocked(false)
    }
  }, [])

  // Toggle explícito de Wake Lock pelo usuário
  const toggleWakeLock = useCallback(async () => {
    if (isWakeLocked) {
      releaseWakeLock()
    } else {
      await requestWakeLock()
    }
  }, [isWakeLocked, releaseWakeLock, requestWakeLock])

  // Timer para duração de sessão
  useEffect(() => {
    let interval: any
    if (status === 'collecting' || status === 'calibrating') {
      interval = setInterval(() => {
        if (sessionStartTime) {
          setElapsedMs(Date.now() - sessionStartTime)
        }
      }, 200)
    }
    return () => clearInterval(interval)
  }, [status, sessionStartTime])

  // Severidade derivada da aceleração de pico em Z
  const deriveSeverity = useCallback((g: number): RoadSeverity => {
    const absG = Math.abs(g)
    if (absG >= 4.0) return 'critica'
    if (absG >= 3.0) return 'alta'
    if (absG >= 2.0) return 'media'
    return 'baixa'
  }, [])

  // Tipo de anomalia derivado
  const deriveAnomalyType = useCallback((g: number): RoadAnomalyType => {
    const absG = Math.abs(g)
    if (absG >= 4.0) return 'buraco'
    if (absG >= 3.2) return 'afundamento'
    if (absG >= 2.6) return 'ondulacao'
    return 'fissura'
  }, [])

  // IRI aproximado da sessão inteira
  const calculatedIRI = (() => {
    if (anomalies.length === 0) return 2.6
    const count = anomalies.length
    const avgPeak = anomalies.reduce((sum, a) => sum + Math.abs(a.peakG), 0) / count
    const base = 2.4 + avgPeak * 0.75 + Math.min(count * 0.35, 3.5)
    return Math.min(Math.max(Number(base.toFixed(1)), 2.2), 8.8)
  })()

  // Processamento e fechamento de Janela de Borda (Edge Window Flush a cada ~2.5 segundos ou ~100m)
  const flushEdgeWindow = useCallback(
    async (currentSegment: string, viaName: string, bairroName: string, veiculoId: string) => {
      const timedSamples = [...windowTimedSamplesRef.current]
      const angBuffer = [...windowAngularBufferRef.current]
      windowTimedSamplesRef.current = []
      windowZBufferRef.current = []
      windowAngularBufferRef.current = []
      lastWindowFlushRef.current = Date.now()

      if (timedSamples.length < 8) return

      // Resample para frequência fixa de 50 Hz antes da FFT (taxa pedida 50 Hz vs taxa real variável)
      const resampledZ = resampleToFixedRate(timedSamples, 50)

      const metrics = extractWindowMetrics(
        resampledZ,
        angBuffer,
        thresholdG,
        50, // Frequência rigorosamente equalizada em 50 Hz
        bandConfigFft,
      )
      setLatestWindowMetrics(metrics)

      if (metrics.desvioAngularCount > 0 || metrics.angularBumpCount > 0) {
        totalDesviosSessionRef.current += metrics.desvioAngularCount || metrics.angularBumpCount
        setDesviosContagem(totalDesviosSessionRef.current)
      }

      const coords = coordsRef.current
      const currentSpeed =
        speedRef.current ??
        (modoAtivoEfetivo === 'pedestre' ? 4.5 : modoAtivoEfetivo === 'ciclista' ? 16 : 36)

      // Atribuição de Célula H3 Nativa no Momento da Coleta:
      // Resolução 9 para veicular (~174m); Resolução 10 para modos ativos (~65m)
      const h3Resolution = getH3ResolutionForModo(modoAtivoEfetivo)
      const h3Index = latLngToCell(coords.latitude, coords.longitude, h3Resolution)

      const windowData: AggregatedWindowData = {
        id: `win-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: Date.now(),
        segmentoId: currentSegment,
        via: viaName,
        metrics,
        latitude: coords.latitude,
        longitude: coords.longitude,
        speedKmh: currentSpeed,
        h3Index,
        h3Resolution,
        isPersisted: false,
      }

      // Adicionar à lista de janelas processadas na sessão
      setProcessedWindows((prev) => [windowData, ...prev])

      // Se auto-persistência estiver ativa, gravar leitura agregada e registrar passagem no segmento
      if (config.autoPersistWindows !== false) {
        try {
          const payload: CreateSegmentReadingPayload = {
            segmento_id: currentSegment,
            codigo_ibge: codigoIbge,
            via: viaName,
            bairro: bairroName,
            veiculo_id: veiculoId,
            veiculo_tipo: config.veiculoTipo || 'Smartphone Embarcado',
            modo_coleta: modoAtivoEfetivo,
            indice_alvo: indiceAlvoEfetivo,
            agent_code: agentCodeEfetivo,
            desvio_angular_taxa: metrics.desvioAngularCount,
            rms_vertical: metrics.rmsVerticalG,
            pico_acel_z: metrics.peakZ_G,
            impactos_count: metrics.impactsCount,
            solavancos_angulares: metrics.angularBumpCount,
            iri_janela: metrics.estimatedIri,
            velocidade_media_kmh: currentSpeed,
            freq_dominante_hz: metrics.dominantFreqHz,
            energia_banda_alvo_pct: metrics.targetBandEnergyPct,
            latitude: coords.latitude,
            longitude: coords.longitude,
            h3_index: h3Index,
            h3_resolution: h3Resolution,
            janelas_amostradas: 1,
            duracao_janela_ms: metrics.durationMs,
          }

          // Gravar leitura agregada
          await createSegmentReading(payload)
          // Atualizar o Fator de Confiança do segmento de 100m
          await registerSegmentPassage(payload)

          // PARTE 1.4.c: Alimentar fleet_telemetry em tempo real com posição e velocidade
          upsertFleetTelemetry({
            veiculo_id: veiculoId,
            latitude: coords.latitude,
            longitude: coords.longitude,
            velocidade: currentSpeed,
            status: currentSpeed > 0 ? 'em_rota' : 'parado',
            linha: config.linhaFrota || viaName,
            anomalias_detectadas: metrics.impactsCount,
          }).catch((fleetErr) => {
            console.warn('Erro ao atualizar telemetria da frota ativa:', fleetErr)
          })

          setProcessedWindows((prev) =>
            prev.map((w) => (w.id === windowData.id ? { ...w, isPersisted: true } : w)),
          )
        } catch (err) {
          console.warn(
            'Persistência de janela no PocketBase adiada (enfileirando em IndexedDB):',
            err,
          )
          // Fallback para fila offline IndexedDB
          await enqueueOfflineWindow({
            id: windowData.id,
            sessionId: sessionIdRef.current,
            timestamp: windowData.timestamp,
            segmentoId: currentSegment,
            payload: windowData,
            persisted: false,
          })
        }
      }
    },
    [
      thresholdG,
      config.autoPersistWindows,
      config.veiculoTipo,
      config.linhaFrota,
      codigoIbge,
      bandConfigFft,
      modoAtivoEfetivo,
      indiceAlvoEfetivo,
      agentCodeEfetivo,
    ],
  )

  // Handler do evento DeviceMotion com aceleração e taxa de rotação
  const handleMotion = useCallback(
    (event: DeviceMotionEvent) => {
      const now = Date.now()

      // Contabilizar tempo ativo de sensores vs lacunas (gap detection)
      if (lastSensorEventTimeRef.current) {
        const delta = now - lastSensorEventTimeRef.current
        if (delta > 250) {
          // Lacuna detectada (sensor suspendeu ou sofreu lag > 250ms)
          gapsMsRef.current += delta
        } else {
          activeSensorsMsRef.current += delta
        }
      }
      lastSensorEventTimeRef.current = now

      // Atualizar métrica de cobertura de rota em tempo real
      const totalObserved = activeSensorsMsRef.current + gapsMsRef.current
      const covPct =
        totalObserved > 0 ? Math.round((activeSensorsMsRef.current / totalObserved) * 100) : 100
      setRouteCoverage({
        totalSessionMs: totalObserved,
        activeSensorsMs: activeSensorsMsRef.current,
        gapsMs: gapsMsRef.current,
        coveragePct: Math.min(100, Math.max(0, covPct)),
        discardedLowSpeedCount: discardedLowSpeedRef.current,
      })

      // Calcular cadência real de amostragem em Hz
      sampleTimestampsRef.current.push(now)
      if (sampleTimestampsRef.current.length > 30) {
        sampleTimestampsRef.current.shift()
        const first = sampleTimestampsRef.current[0]
        const dt = (now - first) / 1000
        if (dt > 0) {
          const hz = Math.round(sampleTimestampsRef.current.length / dt)
          if (hz > 5 && hz < 200) {
            setSamplingRateHz(hz)
          }
        }
      }

      // Extrair taxa de rotação angular se disponível (gyroscope)
      let rollDeg = 0
      let pitchDeg = 0
      if (event.rotationRate) {
        rollDeg = event.rotationRate.beta || 0 // pitch / tilt forward-back
        pitchDeg = event.rotationRate.gamma || 0 // roll / tilt side
        setCurrentRoll(Number(rollDeg.toFixed(1)))
        setCurrentPitch(Number(pitchDeg.toFixed(1)))
        windowAngularBufferRef.current.push({ roll: rollDeg, pitch: pitchDeg })
        if (windowAngularBufferRef.current.length > 256) {
          windowAngularBufferRef.current.shift()
        }
      }

      // Aceleração linear ou com gravidade
      let rawZ: number | null = null
      let calibratedZ = 0
      let inG = 0

      if (
        event.acceleration &&
        event.acceleration.z !== null &&
        event.acceleration.z !== undefined
      ) {
        rawZ = event.acceleration.z
        calibratedZ = rawZ
        inG = calibratedZ / 9.80665
      } else if (
        event.accelerationIncludingGravity &&
        event.accelerationIncludingGravity.z !== null &&
        event.accelerationIncludingGravity.z !== undefined
      ) {
        rawZ = event.accelerationIncludingGravity.z

        if (isCalibratingRef.current) {
          baselineSamplesRef.current.push(rawZ)
          if (now - calibrationStartRef.current >= baselineDurationMs) {
            const sum = baselineSamplesRef.current.reduce((a, b) => a + b, 0)
            const count = baselineSamplesRef.current.length || 1
            baselineOffsetRef.current = sum / count
            isCalibratingRef.current = false
            setStatus('collecting')
          }
          calibratedZ = 0
          inG = 0
        } else {
          calibratedZ = rawZ - baselineOffsetRef.current
          inG = calibratedZ / 9.80665
        }
      }

      if (rawZ === null) return

      const roundedG = Number(inG.toFixed(2))
      const absG = Math.abs(roundedG)

      setCurrentZ(roundedG)
      setPeakSessionG((prev) => Math.max(prev, absG))

      // Acumular no buffer da janela com timestamp explícito para o resampling a 50 Hz
      windowTimedSamplesRef.current.push({ timestamp: now, value: roundedG })
      windowZBufferRef.current.push(roundedG)
      if (windowTimedSamplesRef.current.length > 512) {
        windowTimedSamplesRef.current.shift()
      }
      if (windowZBufferRef.current.length > 512) {
        windowZBufferRef.current.shift()
      }

      const sample: MotionSample = {
        timestamp: now,
        rawZ,
        calibratedZ,
        inG: roundedG,
        rotationRoll: rollDeg,
        rotationPitch: pitchDeg,
      }

      setRecentSamples((prev) => {
        const next = [...prev, sample]
        const trimmed = next.length > 64 ? next.slice(-64) : next

        // FFT em tempo real a cada 3 amostras (~16Hz visual) com banda por modo
        if (trimmed.length >= 16 && trimmed.length % 3 === 0) {
          const zValues = trimmed.map((s) => s.calibratedZ)
          const spec = computeZAccelerationSpectrum(zValues, samplingRateHz, 24, bandConfigFft)
          setSpectrumAnalysis(spec)
        }

        return trimmed
      })

      // Flushing de janela a cada 2.5 segundos em modo de coleta ativa
      if (!isCalibratingRef.current && now - lastWindowFlushRef.current >= 2500) {
        const segId = computeSegmentId(
          coordsRef.current.latitude,
          coordsRef.current.longitude,
          codigoIbge,
        )
        const viaStr = config.via || 'Via Municipal Monitorada'
        const bairroStr = config.bairro || 'Centro'
        const veicStr = config.veiculoTipo || 'Smartphone Frota 1'
        flushEdgeWindow(segId, viaStr, bairroStr, config.veiculoId || 'MOBILE-01')
      }

      // Detecção de impacto pontual acima do limiar
      if (!isCalibratingRef.current && absG >= thresholdG) {
        if (now - lastEventTimeRef.current > 1200) {
          // Descarte de eventos abaixo de ~15 km/h para veículos (sem energia de suspensão)
          // Em modos ativos (pedestre / ciclista), a velocidade natural é baixa, então o descarte só se aplica a veículos de frota
          const currentSpeed = speedRef.current ?? (modoAtivoEfetivo === 'veiculo_frota' ? 30 : 5)
          const isVehicleMode = modoAtivoEfetivo === 'veiculo_frota'

          if (isVehicleMode && currentSpeed < 15) {
            discardedLowSpeedRef.current += 1
            setDiscardedLowSpeedCount(discardedLowSpeedRef.current)
            // Descartado: veículo parado em semáforo ou manobra lenta sem excitação mecânica da suspensão
          } else {
            lastEventTimeRef.current = now
            const severity = deriveSeverity(absG)
            const tipo = deriveAnomalyType(absG)
            const coords = coordsRef.current
            const segId = computeSegmentId(coords.latitude, coords.longitude, codigoIbge)

            const recentZ = [absG, absG * 0.8, absG * 0.5, 0.2, 0.1]
            const quickSpec = computeZAccelerationSpectrum(recentZ, 50, 16, bandConfigFft)

            const newAnomaly: DetectedAnomaly = {
              id: `real-${now}-${Math.random().toString(36).substr(2, 5)}`,
              timestamp: now,
              peakG: roundedG,
              severity,
              tipo,
              latitude: coords.latitude,
              longitude: coords.longitude,
              isApproxLocation: coords.isApprox,
              dominantFreq: quickSpec.dominantFrequency,
              spectralSignature: quickSpec.spectralSignature,
              segmentoId: segId,
              persisted: false,
            }

            setAnomalies((prev) => [newAnomaly, ...prev])

            // PARTE 1.2: AUTO-PERSISTÊNCIA DE ANOMALIAS
            // Grava automaticamente no PocketBase / road_events; se offline, enfileira
            if (config.autoPersistAnomalies !== false) {
              const anomalyPayload: CreateRoadEventPayload = {
                via:
                  config.via ||
                  `Via Municipal • Lat ${coords.latitude.toFixed(4)}, Long ${coords.longitude.toFixed(4)}`,
                bairro: config.bairro || 'Curitiba',
                tipo,
                severidade: severity,
                iri_score: calculatedIRI,
                aceleracao_z: Math.abs(roundedG),
                latitude: coords.latitude,
                longitude: coords.longitude,
                h3_index: latLngToCell(
                  coords.latitude,
                  coords.longitude,
                  getH3ResolutionForModo(modoAtivoEfetivo),
                ),
                velocidade_kmh: currentSpeed,
                status: 'detectado',
                veiculo_tipo: config.veiculoTipo || 'Smartphone Frota 1',
                linha_frota: config.linhaFrota || 'Frota de Coleta',
                agent_code: agentCodeEfetivo,
              }

              createRoadEvent(anomalyPayload)
                .then((created) => {
                  newAnomaly.persisted = true
                  setAnomalies((curr) =>
                    curr.map((a) => (a.id === newAnomaly.id ? { ...a, persisted: true } : a)),
                  )
                  if (config.onAnomalyPersisted) {
                    config.onAnomalyPersisted({ ...newAnomaly, persisted: true })
                  }
                })
                .catch((persistErr) => {
                  console.warn(
                    'Falha na persistência imediata de anomalia, enfileirando offline:',
                    persistErr,
                  )
                  enqueueOfflineAnomaly({
                    id: newAnomaly.id,
                    sessionId: sessionIdRef.current,
                    timestamp: now,
                    payload: anomalyPayload,
                    persisted: false,
                  })
                })
            }
          }
        }
      }
    },
    [
      baselineDurationMs,
      thresholdG,
      deriveSeverity,
      deriveAnomalyType,
      flushEdgeWindow,
      config.via,
      config.bairro,
      config.veiculoTipo,
      config.linhaFrota,
      config.autoPersistAnomalies,
      config.onAnomalyPersisted,
      codigoIbge,
      modoAtivoEfetivo,
      agentCodeEfetivo,
      calculatedIRI,
    ],
  )

  // Iniciar rastreamento de GPS de baixa cadência
  const startGpsWatch = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setGpsStatus('unsupported')
      return
    }

    setGpsStatus('pending')
    try {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          setGpsStatus('active')
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            isApprox: false,
          }
          setCurrentCoords(coords)
          coordsRef.current = coords

          setGpsTrack((prev) => [...prev, { lat: coords.latitude, lng: coords.longitude }])

          if (pos.coords.speed !== null && pos.coords.speed !== undefined) {
            setSpeedKmh(Math.round(pos.coords.speed * 3.6))
          }
        },
        (err) => {
          console.warn('Geolocalização não concedida ou erro:', err.message)
          setGpsStatus('denied')
        },
        {
          enableHighAccuracy: true,
          maximumAge: 3000,
          timeout: 12000,
        },
      )
      watchIdRef.current = id
    } catch (e) {
      console.warn('Falha ao iniciar GPS:', e)
      setGpsStatus('denied')
    }
  }, [])

  const stopGpsWatch = useCallback(() => {
    if (watchIdRef.current !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }, [])

  // Solicitar permissão de DeviceMotion no iOS 13+
  const requestMotionPermission = useCallback(async (): Promise<boolean> => {
    setPermissionError(null)
    const motionEvent = (
      window as unknown as {
        DeviceMotionEvent?: {
          requestPermission?: () => Promise<'granted' | 'denied'>
        }
      }
    ).DeviceMotionEvent

    if (typeof motionEvent?.requestPermission === 'function') {
      try {
        const response = await motionEvent.requestPermission()
        if (response === 'granted') {
          setSensorSupport('supported')
          return true
        } else {
          setSensorSupport('permission_denied')
          setPermissionError(
            'Permissão para sensores inerciais foi negada pelo usuário no navegador.',
          )
          return false
        }
      } catch (err: any) {
        setSensorSupport('permission_denied')
        setPermissionError(
          err?.message || 'Falha ao solicitar permissão de acelerômetro ao iOS/Safari.',
        )
        return false
      }
    }
    setSensorSupport('supported')
    return true
  }, [])

  // Iniciar sessão de coleta com retorno booleano e tratamento de exceção explícito
  const startSession = useCallback(async () => {
    try {
      const granted = await requestMotionPermission()
      if (!granted) {
        if (!permissionError) {
          setPermissionError('Permissão para sensores inerciais negada ou indisponível.')
        }
        return false
      }

      // PARTE 1.1: Drenar fila offline existente ao iniciar a sessão
      drainOfflineQueue().catch((err) => {
        console.warn('Erro ao drenar fila offline ao iniciar sessão:', err)
      })

      // Ativar Wake Lock para prevenir tela de apagar
      await requestWakeLock()

      // Reset de métricas da sessão
      setRecentSamples([])
      setSpectrumAnalysis(null)
      setAnomalies([])
      setProcessedWindows([])
      setLatestWindowMetrics(null)
      setSessionSummary(null)
      setPeakSessionG(0)
      setCurrentZ(0)
      setGpsTrack([])
      const now = Date.now()
      setSessionStartTime(now)
      setElapsedMs(0)

      // Reset de buffers
      windowZBufferRef.current = []
      windowAngularBufferRef.current = []
      lastWindowFlushRef.current = now

      // Calibração de baseline
      baselineSamplesRef.current = []
      calibrationStartRef.current = now
      isCalibratingRef.current = true
      setStatus('calibrating')

      // Conectar ouvinte
      window.addEventListener('devicemotion', handleMotion, true)

      // Conectar GPS
      startGpsWatch()

      return true
    } catch (err: any) {
      console.error('[useDeviceMotionCollector] Falha ao iniciar sessão de coleta:', err)
      setPermissionError(err?.message || 'Erro inesperado ao inicializar sensores do dispositivo.')
      return false
    }
  }, [handleMotion, requestMotionPermission, requestWakeLock, startGpsWatch, permissionError])

  // Encerrar sessão e calcular resumo final imediato
  const stopSession = useCallback(() => {
    window.removeEventListener('devicemotion', handleMotion, true)
    stopGpsWatch()
    releaseWakeLock()
    isCalibratingRef.current = false
    setStatus('stopped')

    // Descarregar última janela residual
    // PARTE 1.4.a CORREÇÃO: Usar config.veiculoId e NÃO config.veiculoTipo
    const segId = computeSegmentId(
      coordsRef.current.latitude,
      coordsRef.current.longitude,
      codigoIbge,
    )
    const effectiveVeiculoId =
      config.veiculoId || `DEV-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    flushEdgeWindow(
      segId,
      config.via || 'Via Municipal',
      config.bairro || 'Centro',
      effectiveVeiculoId,
    )

    // Calcular distância aproximada baseada nos pontos de GPS (haversine)
    let totalDistMeters = 0
    if (gpsTrack.length > 1) {
      for (let i = 1; i < gpsTrack.length; i++) {
        const p1 = gpsTrack[i - 1]
        const p2 = gpsTrack[i]
        const dLat = ((p2.lat - p1.lat) * Math.PI) / 180
        const dLng = ((p2.lng - p1.lng) * Math.PI) / 180
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((p1.lat * Math.PI) / 180) *
            Math.cos((p2.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        totalDistMeters += 6371000 * c
      }
    } else {
      // Estimativa baseada no tempo e velocidade
      const durationSecs = elapsedMs / 1000
      const avgSpeed = (speedKmh || 32) / 3.6
      totalDistMeters = Math.round(durationSecs * avgSpeed)
    }

    // Segmentos únicos cobertos
    const segSet = new Set(processedWindows.map((w) => w.segmentoId))
    if (currentSegmentId) segSet.add(currentSegmentId)

    const totalObserved = activeSensorsMsRef.current + gapsMsRef.current
    const covPct =
      totalObserved > 0 ? Math.round((activeSensorsMsRef.current / totalObserved) * 100) : 100
    const finalCoverage: RouteCoverageMetrics = {
      totalSessionMs: totalObserved || elapsedMs,
      activeSensorsMs: activeSensorsMsRef.current || elapsedMs,
      gapsMs: gapsMsRef.current,
      coveragePct: Math.min(100, Math.max(0, covPct)),
      discardedLowSpeedCount: discardedLowSpeedRef.current,
    }

    const summary: SessionSummary = {
      durationMs: elapsedMs,
      distanceMeters: Math.round(totalDistMeters),
      windowsProcessed: processedWindows.length || 1,
      impactsDetected: anomalies.length,
      desviosDetectados: totalDesviosSessionRef.current,
      segmentsCovered: Array.from(segSet),
      averageIri: calculatedIRI,
      peakG: peakSessionG,
      modoColeta: modoAtivoEfetivo,
      indiceAlvo: indiceAlvoEfetivo,
      phonePosition,
      routeCoverage: finalCoverage,
      discardedLowSpeedCount: discardedLowSpeedRef.current,
    }

    // Persistir registro formal da sessão de campo para alimentação da Calibração do Fator K e IMA
    // PARTE 1.4.e CORREÇÃO: usar o operador real autenticado fornecido na config
    const sessionCode = `SES-${Date.now().toString(36).toUpperCase()}`
    createFieldSession({
      session_code: sessionCode,
      codigo_ibge: codigoIbge,
      veiculo_tipo: canonicoTipo,
      modo_coleta: modoAtivoEfetivo,
      indice_alvo: indiceAlvoEfetivo,
      agent_code: agentCodeEfetivo,
      desvios_detectados: totalDesviosSessionRef.current,
      banda_fft_min_hz: configInfo.bandaFftHz.min,
      banda_fft_max_hz: configInfo.bandaFftHz.max,
      veiculo_id: effectiveVeiculoId,
      linha_frota:
        config.linhaFrota ||
        (modoAtivoEfetivo === 'pedestre' ? 'Rota Pedestre' : 'Linha Operacional'),
      via_inicial:
        config.via ||
        (modoAtivoEfetivo === 'pedestre' ? 'Calçada / Passeio Público' : 'Via Municipal'),
      bairro: config.bairro || 'Centro',
      duracao_ms: elapsedMs,
      distancia_metros: Math.round(totalDistMeters),
      janelas_processadas: processedWindows.length || 1,
      impactos_detectados: anomalies.length,
      segmentos_cobertos: Array.from(segSet),
      iri_medio: calculatedIRI,
      pico_g: peakSessionG,
      operador_nome: config.operadorNome || 'Operador de Campo / Cockpit',
    }).catch((err) => {
      console.warn('Registro de field_session salvo localmente:', err)
    })

    if (config.onSessionComplete) {
      config.onSessionComplete(summary)
    }

    setSessionSummary(summary)
  }, [
    handleMotion,
    stopGpsWatch,
    releaseWakeLock,
    flushEdgeWindow,
    codigoIbge,
    config.via,
    config.bairro,
    config.veiculoTipo,
    config.veiculoTipoCanonico,
    config.veiculoId,
    config.linhaFrota,
    config.operadorNome,
    agentCodeEfetivo,
    config.onSessionComplete,
    gpsTrack,
    elapsedMs,
    speedKmh,
    processedWindows,
    currentSegmentId,
    anomalies.length,
    calculatedIRI,
    peakSessionG,
  ])

  // Auto-retomada & detecção de suspensão de sensores / background (Page Visibility API)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Se a aba foi minimizada ou o navegador foi para segundo plano
        if (status === 'collecting' || status === 'calibrating') {
          // Pausa a coleta ativa e grava estado no IndexedDB
          setIsAutoPaused(true)
          setStatus('paused')
          window.removeEventListener('devicemotion', handleMotion, true)

          // Salvar sessão offline para retomada garantida
          const totalMs = sessionStartTime ? Date.now() - sessionStartTime : elapsedMs
          saveOfflineSession({
            id: sessionIdRef.current,
            sessionCode: sessionIdRef.current,
            codigoIbge,
            via: config.via || 'Via Municipal',
            bairro: config.bairro || 'Centro',
            linhaFrota: config.linhaFrota || 'Linha Operacional',
            veiculoTipo: config.veiculoTipo || 'Smartphone',
            veiculoTipoCanonico: canonicoTipo,
            phonePosition,
            status: 'paused_background',
            startTime: sessionStartTime || Date.now(),
            lastActiveTime: Date.now(),
            pausedAt: Date.now(),
            elapsedMs: totalMs,
            activeSensorsMs: activeSensorsMsRef.current,
            totalGapsMs: gapsMsRef.current,
            windowsCount: processedWindows.length,
            impactsCount: anomalies.length,
            routeCoveragePct: routeCoverage.coveragePct,
            created: sessionStartTime || Date.now(),
            updated: Date.now(),
          })
        }
      } else if (document.visibilityState === 'visible') {
        // Retornou à aba em primeiro plano
        if (status === 'paused' || isAutoPaused) {
          // Re-adquirir Wake Lock se suportado e não desligado explicitamente
          if (!wakeLockExplicitDisabled && !isWakeLocked) {
            requestWakeLock()
          }
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [
    status,
    isAutoPaused,
    handleMotion,
    sessionStartTime,
    elapsedMs,
    codigoIbge,
    config.via,
    config.bairro,
    config.linhaFrota,
    config.veiculoTipo,
    canonicoTipo,
    phonePosition,
    processedWindows.length,
    anomalies.length,
    routeCoverage.coveragePct,
    wakeLockExplicitDisabled,
    isWakeLocked,
    requestWakeLock,
  ])

  // Retomada de sessão com um toque (manual ou pós-background)
  const resumeSession = useCallback(async () => {
    const granted = await requestMotionPermission()
    if (!granted) return false

    if (!wakeLockExplicitDisabled) {
      await requestWakeLock()
    }

    lastSensorEventTimeRef.current = Date.now()
    setIsAutoPaused(false)
    setStatus('collecting')
    window.addEventListener('devicemotion', handleMotion, true)
    startGpsWatch()

    return true
  }, [
    handleMotion,
    requestMotionPermission,
    requestWakeLock,
    startGpsWatch,
    wakeLockExplicitDisabled,
  ])

  // Pausa manual
  const pauseSession = useCallback(() => {
    window.removeEventListener('devicemotion', handleMotion, true)
    setStatus('paused')
    setIsAutoPaused(false)
    releaseWakeLock()
  }, [handleMotion, releaseWakeLock])

  // Limpeza no unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('devicemotion', handleMotion, true)
      if (watchIdRef.current !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
      releaseWakeLock()
    }
  }, [handleMotion, releaseWakeLock])

  // Ajuste manual de coordenadas
  const setManualLocation = useCallback((lat: number, lng: number) => {
    const coords = {
      latitude: lat,
      longitude: lng,
      isApprox: false,
    }
    setCurrentCoords(coords)
    coordsRef.current = coords
  }, [])

  // Helper para construir payload de evento pontual pronto para road_events com h3_index
  const buildEventPayload = useCallback(
    (
      anomaly: DetectedAnomaly,
      sessionMeta: { via: string; bairro: string; linhaFrota: string; veiculoTipo: string },
    ): CreateRoadEventPayload => {
      const h3Res = getH3ResolutionForModo(modoAtivoEfetivo)
      const h3Index = latLngToCell(anomaly.latitude, anomaly.longitude, h3Res)

      return {
        via:
          sessionMeta.via.trim() ||
          `Coleta Real • Lat ${anomaly.latitude.toFixed(4)}, Long ${anomaly.longitude.toFixed(4)}`,
        bairro: sessionMeta.bairro.trim() || 'Curitiba (Acelerômetro Real)',
        tipo: anomaly.tipo,
        severidade: anomaly.severity,
        iri_score: calculatedIRI,
        aceleracao_z: Math.abs(anomaly.peakG),
        latitude: anomaly.latitude,
        longitude: anomaly.longitude,
        h3_index: h3Index,
        velocidade_kmh: speedKmh ?? 35,
        status: 'detectado',
        veiculo_tipo: sessionMeta.veiculoTipo || 'Dispositivo Mobile (Acelerômetro Real)',
        linha_frota: sessionMeta.linhaFrota || 'Coleta Inercial Mobile Real',
        agent_code: agentCodeEfetivo,
      }
    },
    [calculatedIRI, speedKmh, modoAtivoEfetivo, agentCodeEfetivo],
  )
  return {
    status,
    sensorSupport,
    permissionError,
    isWakeLocked,
    wakeLockSupported,
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
    requestWakeLock,
    releaseWakeLock,
    toggleWakeLock,
    phonePosition,
    setPhonePosition,
    routeCoverage,
    discardedLowSpeedCount,
    isAutoPaused,
    canResumePrevious,
    pausedSessionData,
    setManualLocation,
    desviosContagem,
    buildEventPayload,
  }
}
