import { useState, useEffect, useRef, useCallback } from 'react'
import { RoadAnomalyType, RoadSeverity, CreateRoadEventPayload } from '@/services/roadEvents'

export interface MotionSample {
  timestamp: number
  rawZ: number
  calibratedZ: number
  inG: number
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
  persisted?: boolean
}

export interface CollectorConfig {
  thresholdG: number // Default 2.5g
  baselineDurationMs: number // Default 3000ms
  via: string
  bairro: string
  linhaFrota: string
  veiculoTipo: string
  manualLat?: number
  manualLng?: number
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

  // State
  const [status, setStatus] = useState<CollectorStatus>('idle')
  const [sensorSupport, setSensorSupport] = useState<SensorSupport>('checking')
  const [permissionError, setPermissionError] = useState<string | null>(null)

  // Real-time telemetry readings
  const [currentZ, setCurrentZ] = useState<number>(0) // in g
  const [peakSessionG, setPeakSessionG] = useState<number>(0)
  const [recentSamples, setRecentSamples] = useState<MotionSample[]>([])
  const [anomalies, setAnomalies] = useState<DetectedAnomaly[]>([])
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)
  const [elapsedMs, setElapsedMs] = useState<number>(0)

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

  // Internal calibration refs
  const baselineSamplesRef = useRef<number[]>([])
  const baselineOffsetRef = useRef<number>(9.80665) // baseline in m/s^2 (typically gravity ~9.8)
  const isCalibratingRef = useRef<boolean>(false)
  const calibrationStartRef = useRef<number>(0)
  const lastEventTimeRef = useRef<number>(0)
  const watchIdRef = useRef<number | null>(null)
  const coordsRef = useRef(currentCoords)
  coordsRef.current = currentCoords

  // Check support on mount
  useEffect(() => {
    if (typeof window === 'undefined') {
      setSensorSupport('unsupported')
      return
    }

    const hasMotion = 'DeviceMotionEvent' in window
    if (!hasMotion) {
      setSensorSupport('unsupported')
      return
    }

    // Check if iOS 13+ permission is required
    const motionEvent = window.DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>
    }

    if (typeof motionEvent?.requestPermission === 'function') {
      setSensorSupport('permission_needed')
    } else {
      setSensorSupport('supported')
    }
  }, [])

  // Timer for elapsed session duration
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

  // Derive RoadSeverity from peak g
  const deriveSeverity = useCallback((g: number): RoadSeverity => {
    const absG = Math.abs(g)
    if (absG >= 4.0) return 'critica'
    if (absG >= 3.0) return 'alta'
    if (absG >= 2.0) return 'media'
    return 'baixa'
  }, [])

  // Derive Anomaly Type from impact characteristics
  const deriveAnomalyType = useCallback((g: number): RoadAnomalyType => {
    const absG = Math.abs(g)
    if (absG >= 4.0) return 'buraco'
    if (absG >= 3.2) return 'afundamento'
    if (absG >= 2.6) return 'ondulacao'
    return 'fissura'
  }, [])

  // Approximate IRI score derived from session frequency & peaks
  const calculatedIRI = (() => {
    if (anomalies.length === 0) return 2.8
    const count = anomalies.length
    const avgPeak = anomalies.reduce((sum, a) => sum + Math.abs(a.peakG), 0) / count
    // Heuristic: baseline 2.8 + (avgPeak * 0.9) + (frequency factor)
    const base = 2.4 + avgPeak * 0.75 + Math.min(count * 0.35, 3.5)
    return Math.min(Math.max(Number(base.toFixed(1)), 2.5), 8.5)
  })()

  // Handle DeviceMotion event
  const handleMotion = useCallback(
    (event: DeviceMotionEvent) => {
      // Pick Z acceleration. If acceleration (without gravity) is available, use it directly.
      // Otherwise, use accelerationIncludingGravity minus calibrated baseline.
      let rawZ: number | null = null
      let calibratedZ = 0
      let inG = 0

      if (
        event.acceleration &&
        event.acceleration.z !== null &&
        event.acceleration.z !== undefined
      ) {
        rawZ = event.acceleration.z
        // Linear acceleration usually excludes gravity (0 m/s^2 at rest)
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
          const now = Date.now()
          if (now - calibrationStartRef.current >= baselineDurationMs) {
            // Finish calibration
            const sum = baselineSamplesRef.current.reduce((a, b) => a + b, 0)
            const count = baselineSamplesRef.current.length || 1
            baselineOffsetRef.current = sum / count
            isCalibratingRef.current = false
            setStatus('collecting')
          }
          // While calibrating, baseline is still adjusting
          calibratedZ = 0
          inG = 0
        } else {
          // Remove calibrated gravity baseline
          calibratedZ = rawZ - baselineOffsetRef.current
          inG = calibratedZ / 9.80665
        }
      }

      if (rawZ === null) return

      // Round to 2 decimal places for clean UI
      const roundedG = Number(inG.toFixed(2))
      const absG = Math.abs(roundedG)

      setCurrentZ(roundedG)
      setPeakSessionG((prev) => Math.max(prev, absG))

      const now = Date.now()
      const sample: MotionSample = {
        timestamp: now,
        rawZ,
        calibratedZ,
        inG: roundedG,
      }

      setRecentSamples((prev) => {
        const next = [...prev, sample]
        // Keep last 30 samples for sparkline
        return next.length > 30 ? next.slice(-30) : next
      })

      // If in collecting status and peak exceeds threshold, trigger anomaly detection
      // Throttle detections by at least 1200ms to avoid duplicate counting of single bump
      if (!isCalibratingRef.current && absG >= thresholdG) {
        if (now - lastEventTimeRef.current > 1200) {
          lastEventTimeRef.current = now
          const severity = deriveSeverity(absG)
          const tipo = deriveAnomalyType(absG)
          const coords = coordsRef.current

          const newAnomaly: DetectedAnomaly = {
            id: `real-${now}-${Math.random().toString(36).substr(2, 5)}`,
            timestamp: now,
            peakG: roundedG,
            severity,
            tipo,
            latitude: coords.latitude,
            longitude: coords.longitude,
            isApproxLocation: coords.isApprox,
          }

          setAnomalies((prev) => [newAnomaly, ...prev])
        }
      }
    },
    [baselineDurationMs, thresholdG, deriveSeverity, deriveAnomalyType],
  )

  // Start GPS Geolocation watching
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
          maximumAge: 2000,
          timeout: 10000,
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

  // Request iOS permission if needed, then attach listener
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

  // Start collection session
  const startSession = useCallback(async () => {
    const granted = await requestMotionPermission()
    if (!granted) return false

    // Reset session metrics
    setRecentSamples([])
    setAnomalies([])
    setPeakSessionG(0)
    setCurrentZ(0)
    const now = Date.now()
    setSessionStartTime(now)
    setElapsedMs(0)

    // Calibration phase
    baselineSamplesRef.current = []
    calibrationStartRef.current = now
    isCalibratingRef.current = true
    setStatus('calibrating')

    // Attach listener
    window.addEventListener('devicemotion', handleMotion, true)

    // Start GPS watch
    startGpsWatch()

    return true
  }, [handleMotion, requestMotionPermission, startGpsWatch])

  // Stop collection session
  const stopSession = useCallback(() => {
    window.removeEventListener('devicemotion', handleMotion, true)
    stopGpsWatch()
    isCalibratingRef.current = false
    setStatus('stopped')
  }, [handleMotion, stopGpsWatch])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('devicemotion', handleMotion, true)
      if (watchIdRef.current !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [handleMotion])

  // Update manual coordinates fallback
  const setManualLocation = useCallback((lat: number, lng: number) => {
    const coords = {
      latitude: lat,
      longitude: lng,
      isApprox: false,
    }
    setCurrentCoords(coords)
    coordsRef.current = coords
  }, [])

  // Helper to build payload ready for PocketBase road_events
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
  }
}
