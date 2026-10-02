/**
 * Utilitário para validação ativa e em tempo real dos sensores inerciais físicos
 * no navegador (Android / Chrome e iOS / Safari).
 *
 * Causa raiz no Android: 'DeviceMotionEvent' in window é true, mas os eventos
 * podem estar silenciosamente bloqueados (permissão do site bloqueada, modo
 * economia de bateria, navegador interno de WhatsApp/Instagram, política de
 * permissão desativada). O navegador nunca dispara os eventos devicemotion /
 * deviceorientation ou dispara eventos com aceleração nula (null).
 */

export interface SensorValidationProgress {
  motionSamplesCount: number
  orientationSamplesCount: number
  hasAccelerationData: boolean
  lastZValue: number | null
}

export interface SensorValidationResult {
  active: boolean
  samplesReceived: number
  reason?: 'timeout_no_events' | 'unsupported' | 'permission_denied' | 'zero_data'
  errorMessage?: string
}

/**
 * Escuta eventos de movimento por uma janela (~2000ms por padrão) e só resolve
 * como ativo se amostras reais chegarem com dados inerciais mensuráveis.
 */
export function validateRealMotionSensors(
  timeoutMs: number = 2200,
  minSamples: number = 3,
  onProgress?: (progress: SensorValidationProgress) => void,
): Promise<SensorValidationResult> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve({
        active: false,
        samplesReceived: 0,
        reason: 'unsupported',
        errorMessage: 'Ambiente sem suporte a sensores inerciais (SSR / desktop sem window).',
      })
      return
    }

    const hasMotionApi = 'DeviceMotionEvent' in window || 'DeviceOrientationEvent' in window
    if (!hasMotionApi) {
      resolve({
        active: false,
        samplesReceived: 0,
        reason: 'unsupported',
        errorMessage: 'Nenhum sensor de movimento físico detectado neste navegador/aparelho.',
      })
      return
    }

    let motionCount = 0
    let orientationCount = 0
    let hasAccelerationData = false
    let lastZ: number | null = null
    let resolved = false

    const cleanup = () => {
      window.removeEventListener('devicemotion', onMotion, true)
      window.removeEventListener('deviceorientation', onOrientation, true)
      if (timeoutTimer) clearTimeout(timeoutTimer)
    }

    const finish = (result: SensorValidationResult) => {
      if (resolved) return
      resolved = true
      cleanup()
      resolve(result)
    }

    const notifyProgress = () => {
      if (onProgress) {
        onProgress({
          motionSamplesCount: motionCount,
          orientationSamplesCount: orientationCount,
          hasAccelerationData,
          lastZValue: lastZ,
        })
      }
    }

    const onMotion = (event: DeviceMotionEvent) => {
      // Verificar se o evento traz dados reais de aceleração
      const acc = event.acceleration || event.accelerationIncludingGravity
      if (acc && (acc.x !== null || acc.y !== null || acc.z !== null)) {
        hasAccelerationData = true
        if (acc.z !== null && acc.z !== undefined) {
          lastZ = acc.z
        }
      }
      motionCount++
      notifyProgress()

      // Se já coletamos amostras com dados reais, podemos antecipar a liberação
      // após pelo menos minSamples e pelo menos 1.2s de verificação para garantir cadência contínua
      if (hasAccelerationData && motionCount >= minSamples && orientationCount >= 1) {
        // Deixa fluir até o timeout ou pelo menos 1.2s para garantir estabilidade
      }
    }

    const onOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null || event.beta !== null || event.gamma !== null) {
        orientationCount++
        notifyProgress()
      }
    }

    try {
      window.addEventListener('devicemotion', onMotion, true)
      window.addEventListener('deviceorientation', onOrientation, true)
    } catch (err: any) {
      finish({
        active: false,
        samplesReceived: 0,
        reason: 'unsupported',
        errorMessage: err?.message || 'Falha ao registrar ouvintes de movimento.',
      })
      return
    }

    const timeoutTimer = setTimeout(() => {
      const totalSamples = motionCount + orientationCount
      const passed =
        (motionCount >= minSamples && hasAccelerationData) ||
        (motionCount >= 1 && orientationCount >= 2)

      if (passed) {
        finish({
          active: true,
          samplesReceived: totalSamples,
        })
      } else {
        finish({
          active: false,
          samplesReceived: totalSamples,
          reason: totalSamples === 0 ? 'timeout_no_events' : 'zero_data',
          errorMessage:
            totalSamples === 0
              ? 'Nenhum evento de sensor chegou do sistema Android/Chrome. Os sensores podem estar bloqueados nas configurações do site ou em Economia de Bateria.'
              : 'Sensores detectados mas sem leituras dinâmicas. Certifique-se de conceder acesso total aos sensores de movimento.',
        })
      }
    }, timeoutMs)
  })
}

/**
 * Persistência do aparelho liberado no localStorage
 */
const STORAGE_KEY_AUTHORIZED = 'orbis_device_sensors_authorized_v1'
const STORAGE_KEY_LAST_AGENT = 'orbis_last_agent_code_v1'
const STORAGE_KEY_CONFIG = 'orbis_collector_quick_config_v1'

export interface StoredCollectorPreferences {
  lastAgentCode: string | null
  via: string
  bairro: string
  linhaFrota: string
  phonePosition: 'painel' | 'bolso_outro'
  authorizedAt: number | null
}

export function isDevicePreAuthorized(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const val = localStorage.getItem(STORAGE_KEY_AUTHORIZED)
    if (!val) return false
    const parsed = JSON.parse(val)
    return Boolean(parsed?.authorized)
  } catch {
    return false
  }
}

export function saveDeviceAuthorized(isAuth: boolean = true) {
  if (typeof window === 'undefined') return
  try {
    if (isAuth) {
      localStorage.setItem(
        STORAGE_KEY_AUTHORIZED,
        JSON.stringify({ authorized: true, timestamp: Date.now() }),
      )
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTHORIZED)
    }
  } catch {
    /* ignore */
  }
}

export function getStoredCollectorPreferences(): StoredCollectorPreferences {
  const fallback: StoredCollectorPreferences = {
    lastAgentCode: null,
    via: '',
    bairro: 'Batel',
    linhaFrota: '',
    phonePosition: 'painel',
    authorizedAt: null,
  }

  if (typeof window === 'undefined') return fallback

  try {
    const lastAgent = localStorage.getItem(STORAGE_KEY_LAST_AGENT) || null
    const rawConfig = localStorage.getItem(STORAGE_KEY_CONFIG)
    const rawAuth = localStorage.getItem(STORAGE_KEY_AUTHORIZED)
    let authTimestamp: number | null = null
    if (rawAuth) {
      try {
        const parsedAuth = JSON.parse(rawAuth)
        authTimestamp = parsedAuth?.timestamp || null
      } catch {
        /* ignore */
      }
    }

    if (rawConfig) {
      const parsed = JSON.parse(rawConfig)
      return {
        lastAgentCode: lastAgent || parsed.lastAgentCode || null,
        via: parsed.via || '',
        bairro: parsed.bairro || 'Batel',
        linhaFrota: parsed.linhaFrota || '',
        phonePosition: parsed.phonePosition === 'bolso_outro' ? 'bolso_outro' : 'painel',
        authorizedAt: authTimestamp,
      }
    }

    return {
      ...fallback,
      lastAgentCode: lastAgent,
      authorizedAt: authTimestamp,
    }
  } catch {
    return fallback
  }
}

export function saveCollectorPreferences(prefs: Partial<StoredCollectorPreferences>) {
  if (typeof window === 'undefined') return
  try {
    if (prefs.lastAgentCode) {
      localStorage.setItem(STORAGE_KEY_LAST_AGENT, prefs.lastAgentCode)
    }
    const current = getStoredCollectorPreferences()
    const updated = {
      ...current,
      ...prefs,
    }
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(updated))
  } catch {
    /* ignore */
  }
}

/**
 * Detecta se o ambiente provável é Android
 */
export function isAndroidDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  return /android/i.test(ua)
}

/**
 * Detecta se está em WebView / In-App browser (WhatsApp, Instagram, Facebook, etc.)
 */
export function isInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  return /FBAN|FBAV|Instagram|WhatsApp|Line|Twitter|Snapchat/i.test(ua)
}
