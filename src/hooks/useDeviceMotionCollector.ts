import { useState, useEffect, useRef, useCallback } from 'react'
import { RoadAnomalyType, RoadSeverity, CreateRoadEventPayload } from '@/services/roadEvents'
import {
  computeZAccelerationSpectrum,
  extractWindowMetrics,
  SpectrumAnalysisResult,
  WindowMetricsResult,
} from '@/lib/fft'
import {
  computeSegmentId,
  createSegmentReading,
  registerSegmentPassage,
  CreateSegmentReadingPayload,
} from '@/services/roadSegments'

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
  isPersisted: boolean
}

export interface SessionSummary {
  durationMs: number
  distanceMeters: number
  windowsProcessed: number
  impactsDetected: number
  segmentsCovered: string[]
  averageIri: number
  peakG: number
}

export interface CollectorConfig {
  thresholdG: number // Padrão 2.5g
  baselineDurationMs: number // Padrão 3000ms
  via: string
  bairro: string
  linhaFrota: string
  veiculoTipo: string
  codigoIbge?: string
  manualLat?: number
  manualLng?: number
  autoPersistWindows?: boolean // Salva agregados automaticamente no PocketBase
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
  const windowZBufferRef = useRef<number[]>([])
  const windowAngularBufferRef = useRef<{ roll: number; pitch: number }[]>([])
  const lastWindowFlushRef = useRef<number>(Date.now())

  // Checagem de suporte de sensores e WakeLock no mount
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
  }, [])

  // Wake Lock acquirer & releaser
  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        const sentinel = await (navigator as any).wakeLock.request('screen')
        wakeLockSentinelRef.current = sentinel
        setIsWakeLocked(true)
        sentinel.addEventListener('release', () => {
          setIsWakeLocked(false)
        })
      } catch (err) {
        console.warn('Wake Lock não disponível ou negado:', err)
        setIsWakeLocked(false)
      }
    }
  }, [])

  const releaseWakeLock = useCallback(() => {
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
      const zBuffer = [...windowZBufferRef.current]
      const angBuffer = [...windowAngularBufferRef.current]
      windowZBufferRef.current = []
      windowAngularBufferRef.current = []
      lastWindowFlushRef.current = Date.now()

      if (zBuffer.length < 8) return

      const metrics = extractWindowMetrics(zBuffer, angBuffer, thresholdG, samplingRateHz)
      setLatestWindowMetrics(metrics)

      const coords = coordsRef.current
      const currentSpeed = speedRef.current ?? 36

      const windowData: AggregatedWindowData = {
        id: `win-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: Date.now(),
        segmentoId: currentSegment,
        via: viaName,
        metrics,
        latitude: coords.latitude,
        longitude: coords.longitude,
        speedKmh: currentSpeed,
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
            janelas_amostradas: 1,
            duracao_janela_ms: metrics.durationMs,
          }

          // Gravar leitura agregada
          await createSegmentReading(payload)
          // Atualizar o Fator de Confiança do segmento de 100m
          await registerSegmentPassage(payload)

          setProcessedWindows((prev) =>
            prev.map((w) => (w.id === windowData.id ? { ...w, isPersisted: true } : w)),
          )
        } catch (err) {
          console.warn('Persistência de janela no PocketBase adiada:', err)
        }
      }
    },
    [thresholdG, samplingRateHz, config.autoPersistWindows, config.veiculoTipo, codigoIbge],
  )

  // Handler do evento DeviceMotion com aceleração e taxa de rotação
  const handleMotion = useCallback(
    (event: DeviceMotionEvent) => {
      const now = Date.now()

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

      // Acumular no buffer da janela
      windowZBufferRef.current.push(roundedG)
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

        // FFT em tempo real a cada 3 amostras (~16Hz visual)
        if (trimmed.length >= 16 && trimmed.length % 3 === 0) {
          const zValues = trimmed.map((s) => s.calibratedZ)
          const spec = computeZAccelerationSpectrum(zValues, samplingRateHz, 24)
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
        flushEdgeWindow(segId, viaStr, bairroStr, veicStr)
      }

      // Detecção de impacto pontual acima do limiar
      if (!isCalibratingRef.current && absG >= thresholdG) {
        if (now - lastEventTimeRef.current > 1200) {
          lastEventTimeRef.current = now
          const severity = deriveSeverity(absG)
          const tipo = deriveAnomalyType(absG)
          const coords = coordsRef.current
          const segId = computeSegmentId(coords.latitude, coords.longitude, codigoIbge)

          const recentZ = [absG, absG * 0.8, absG * 0.5, 0.2, 0.1]
          const quickSpec = computeZAccelerationSpectrum(recentZ, samplingRateHz, 16)

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
          }

          setAnomalies((prev) => [newAnomaly, ...prev])
        }
      }
    },
    [
      baselineDurationMs,
      thresholdG,
      samplingRateHz,
      deriveSeverity,
      deriveAnomalyType,
      flushEdgeWindow,
      config.via,
      config.bairro,
      config.veiculoTipo,
      codigoIbge,
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

  // Iniciar sessão de coleta
  const startSession = useCallback(async () => {
    const granted = await requestMotionPermission()
    if (!granted) return false

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
  }, [handleMotion, requestMotionPermission, requestWakeLock, startGpsWatch])

  // Encerrar sessão e calcular resumo final imediato
  const stopSession = useCallback(() => {
    window.removeEventListener('devicemotion', handleMotion, true)
    stopGpsWatch()
    releaseWakeLock()
    isCalibratingRef.current = false
    setStatus('stopped')

    // Descarregar última janela residual
    const segId = computeSegmentId(
      coordsRef.current.latitude,
      coordsRef.current.longitude,
      codigoIbge,
    )
    flushEdgeWindow(
      segId,
      config.via || 'Via Municipal',
      config.bairro || 'Centro',
      config.veiculoTipo || 'Smartphone',
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

    const summary: SessionSummary = {
      durationMs: elapsedMs,
      distanceMeters: Math.round(totalDistMeters),
      windowsProcessed: processedWindows.length || 1,
      impactsDetected: anomalies.length,
      segmentsCovered: Array.from(segSet),
      averageIri: calculatedIRI,
      peakG: peakSessionG,
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
    gpsTrack,
    elapsedMs,
    speedKmh,
    processedWindows,
    currentSegmentId,
    anomalies.length,
    calculatedIRI,
    peakSessionG,
  ])

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

  // Helper para construir payload de evento pontual pronto para road_events
  const buildEventPayload = useCallback(
    (
      anomaly: DetectedAnomaly,
      sessionMeta: { via: string; bairro: string; linhaFrota: string; veiculoTipo: string },
    ): CreateRoadEventPayload => {
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
        velocidade_kmh: speedKmh ?? 35,
        status: 'detectado',
        veiculo_tipo: sessionMeta.veiculoTipo || 'Dispositivo Mobile (Acelerômetro Real)',
        linha_frota: sessionMeta.linhaFrota || 'Coleta Inercial Mobile Real',
      }
    },
    [calculatedIRI, speedKmh],
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
    setManualLocation,
    buildEventPayload,
  }
}
