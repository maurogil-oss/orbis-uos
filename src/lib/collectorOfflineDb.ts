/**
 * Fila de Armazenamento Local e Resiliência Offline (IndexedDB)
 *
 * Garante a integridade da coleta PWA e SDK Edge em áreas de sombra de conectividade 4G/5G:
 * 1. Sessões ativas ou pausadas por suspensão de aba/background
 * 2. Janelas agregadas de telemetria pendentes de envio
 * 3. Anomalias pontuais capturadas pendentes de envio
 * 4. Drenagem automática e retransmissão confiável
 */

import {
  CreateSegmentReadingPayload,
  createSegmentReading,
  registerSegmentPassage,
} from '@/services/roadSegments'
import { CreateRoadEventPayload, createRoadEvent } from '@/services/roadEvents'

const DB_NAME = 'orbis_collector_offline_db'
const DB_VERSION = 1
const STORE_SESSIONS = 'sessions'
const STORE_WINDOWS = 'pending_windows'
const STORE_ANOMALIES = 'pending_anomalies'

export interface OfflineSessionRecord {
  id: string
  sessionCode: string
  codigoIbge: string
  via: string
  bairro: string
  linhaFrota: string
  veiculoTipo: string
  veiculoTipoCanonico: string
  agentCode?: string
  phonePosition: 'painel' | 'bolso_outro'
  status: 'active' | 'paused_background' | 'stopped'
  startTime: number
  lastActiveTime: number
  pausedAt?: number
  elapsedMs: number
  activeSensorsMs: number
  totalGapsMs: number
  windowsCount: number
  impactsCount: number
  routeCoveragePct: number
  created: number
  updated: number
}

export interface OfflinePendingWindow {
  id: string
  sessionId: string
  timestamp: number
  segmentoId: string
  payload: CreateSegmentReadingPayload | any
  persisted: boolean
  attempts?: number
  lastAttemptAt?: number
  error?: string
}

export interface OfflinePendingAnomaly {
  id: string
  sessionId: string
  timestamp: number
  payload: CreateRoadEventPayload
  persisted: boolean
  attempts?: number
  lastAttemptAt?: number
  error?: string
}

export interface QueueDrainResult {
  windowsDrained: number
  windowsFailed: number
  anomaliesDrained: number
  anomaliesFailed: number
  remainingPending: number
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB não suportado neste ambiente'))
      return
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
        const store = db.createObjectStore(STORE_SESSIONS, { keyPath: 'id' })
        store.createIndex('status', 'status', { unique: false })
        store.createIndex('updated', 'updated', { unique: false })
      }

      if (!db.objectStoreNames.contains(STORE_WINDOWS)) {
        const store = db.createObjectStore(STORE_WINDOWS, { keyPath: 'id' })
        store.createIndex('sessionId', 'sessionId', { unique: false })
        store.createIndex('persisted', 'persisted', { unique: false })
      }

      if (!db.objectStoreNames.contains(STORE_ANOMALIES)) {
        const store = db.createObjectStore(STORE_ANOMALIES, { keyPath: 'id' })
        store.createIndex('sessionId', 'sessionId', { unique: false })
        store.createIndex('persisted', 'persisted', { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveOfflineSession(session: OfflineSessionRecord): Promise<void> {
  try {
    const db = await openDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SESSIONS, 'readwrite')
      const store = tx.objectStore(STORE_SESSIONS)
      const putReq = store.put(session)
      putReq.onsuccess = () => resolve()
      putReq.onerror = () => reject(putReq.error)
    })
  } catch (err) {
    console.warn('Erro ao salvar sessão no IndexedDB (fallback local):', err)
  }
}

export async function getOfflineSession(id: string): Promise<OfflineSessionRecord | null> {
  try {
    const db = await openDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SESSIONS, 'readonly')
      const store = tx.objectStore(STORE_SESSIONS)
      const req = store.get(id)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => reject(req.error)
    })
  } catch {
    return null
  }
}

export async function getLatestPausedSession(): Promise<OfflineSessionRecord | null> {
  try {
    const db = await openDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SESSIONS, 'readonly')
      const store = tx.objectStore(STORE_SESSIONS)
      const req = store.openCursor(null, 'prev')

      req.onsuccess = () => {
        const cursor = req.result
        if (cursor) {
          const item = cursor.value as OfflineSessionRecord
          if (item.status === 'paused_background' || item.status === 'active') {
            resolve(item)
            return
          }
          cursor.continue()
        } else {
          resolve(null)
        }
      }
      req.onerror = () => reject(req.error)
    })
  } catch {
    return null
  }
}

// ----------------- FILA DE JANELAS -----------------

export async function enqueueOfflineWindow(item: OfflinePendingWindow): Promise<void> {
  try {
    const db = await openDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_WINDOWS, 'readwrite')
      const store = tx.objectStore(STORE_WINDOWS)
      const putReq = store.put({
        ...item,
        attempts: item.attempts || 0,
        lastAttemptAt: Date.now(),
      })
      putReq.onsuccess = () => resolve()
      putReq.onerror = () => reject(putReq.error)
    })
  } catch (err) {
    console.warn('Erro ao enfileirar janela offline:', err)
  }
}

export async function getPendingOfflineWindows(
  sessionId?: string,
): Promise<OfflinePendingWindow[]> {
  try {
    const db = await openDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_WINDOWS, 'readonly')
      const store = tx.objectStore(STORE_WINDOWS)
      const req = store.getAll()
      req.onsuccess = () => {
        let results = (req.result || []) as OfflinePendingWindow[]
        if (sessionId) {
          results = results.filter((w) => w.sessionId === sessionId)
        }
        resolve(results.filter((w) => !w.persisted))
      }
      req.onerror = () => reject(req.error)
    })
  } catch {
    return []
  }
}

export async function markOfflineWindowPersisted(id: string): Promise<void> {
  try {
    const db = await openDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_WINDOWS, 'readwrite')
      const store = tx.objectStore(STORE_WINDOWS)
      // Remover da fila para não crescer indefinidamente
      const delReq = store.delete(id)
      delReq.onsuccess = () => resolve()
      delReq.onerror = () => reject(delReq.error)
    })
  } catch {
    /* intentionally ignored */
  }
}

// ----------------- FILA DE ANOMALIAS -----------------

export async function enqueueOfflineAnomaly(item: OfflinePendingAnomaly): Promise<void> {
  try {
    const db = await openDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ANOMALIES, 'readwrite')
      const store = tx.objectStore(STORE_ANOMALIES)
      const putReq = store.put({
        ...item,
        attempts: item.attempts || 0,
        lastAttemptAt: Date.now(),
      })
      putReq.onsuccess = () => resolve()
      putReq.onerror = () => reject(putReq.error)
    })
  } catch (err) {
    console.warn('Erro ao enfileirar anomalia offline:', err)
  }
}

export async function getPendingOfflineAnomalies(
  sessionId?: string,
): Promise<OfflinePendingAnomaly[]> {
  try {
    const db = await openDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ANOMALIES, 'readonly')
      const store = tx.objectStore(STORE_ANOMALIES)
      const req = store.getAll()
      req.onsuccess = () => {
        let results = (req.result || []) as OfflinePendingAnomaly[]
        if (sessionId) {
          results = results.filter((a) => a.sessionId === sessionId)
        }
        resolve(results.filter((a) => !a.persisted))
      }
      req.onerror = () => reject(req.error)
    })
  } catch {
    return []
  }
}

export async function markOfflineAnomalyPersisted(id: string): Promise<void> {
  try {
    const db = await openDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ANOMALIES, 'readwrite')
      const store = tx.objectStore(STORE_ANOMALIES)
      const delReq = store.delete(id)
      delReq.onsuccess = () => resolve()
      delReq.onerror = () => reject(delReq.error)
    })
  } catch {
    /* intentionally ignored */
  }
}

// ----------------- DRENAGEM AUTOMÁTICA DA FILA -----------------

let isDraining = false

/**
 * Drena todas as janelas e anomalias pendentes de transmissão.
 * Chamado automaticamente:
 * 1. Ao iniciar ou retomar sessão de campo
 * 2. Periodicamente (a cada 60s ou N min) durante sessão ativa
 * 3. Ao disparar o evento 'online' do navegador
 */
export async function drainOfflineQueue(
  options: {
    onSuccessWindow?: (windowId: string) => void
    onSuccessAnomaly?: (anomalyId: string) => void
  } = {},
): Promise<QueueDrainResult> {
  if (isDraining) {
    return {
      windowsDrained: 0,
      windowsFailed: 0,
      anomaliesDrained: 0,
      anomaliesFailed: 0,
      remainingPending: 0,
    }
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const pendingWins = await getPendingOfflineWindows()
    const pendingAnoms = await getPendingOfflineAnomalies()
    return {
      windowsDrained: 0,
      windowsFailed: 0,
      anomaliesDrained: 0,
      anomaliesFailed: 0,
      remainingPending: pendingWins.length + pendingAnoms.length,
    }
  }

  isDraining = true
  let windowsDrained = 0
  let windowsFailed = 0
  let anomaliesDrained = 0
  let anomaliesFailed = 0

  try {
    const pendingWindows = await getPendingOfflineWindows()
    for (const win of pendingWindows) {
      try {
        const payload = win.payload as CreateSegmentReadingPayload
        if (payload && payload.segmento_id) {
          await createSegmentReading(payload)
          await registerSegmentPassage(payload)
          await markOfflineWindowPersisted(win.id)
          windowsDrained++
          if (options.onSuccessWindow) options.onSuccessWindow(win.id)
        } else {
          // Payload inválido, descarte seguro
          await markOfflineWindowPersisted(win.id)
        }
      } catch (err: any) {
        windowsFailed++
        console.warn(`[Offline Queue] Falha ao reenviar janela ${win.id}:`, err?.message || err)
        // Atualizar tentativas
        await enqueueOfflineWindow({
          ...win,
          attempts: (win.attempts || 0) + 1,
          lastAttemptAt: Date.now(),
          error: err?.message || String(err),
        })
      }
    }

    const pendingAnomalies = await getPendingOfflineAnomalies()
    for (const anom of pendingAnomalies) {
      try {
        const payload = anom.payload
        if (payload && payload.via) {
          await createRoadEvent(payload)
          await markOfflineAnomalyPersisted(anom.id)
          anomaliesDrained++
          if (options.onSuccessAnomaly) options.onSuccessAnomaly(anom.id)
        } else {
          await markOfflineAnomalyPersisted(anom.id)
        }
      } catch (err: any) {
        anomaliesFailed++
        console.warn(`[Offline Queue] Falha ao reenviar anomalia ${anom.id}:`, err?.message || err)
        await enqueueOfflineAnomaly({
          ...anom,
          attempts: (anom.attempts || 0) + 1,
          lastAttemptAt: Date.now(),
          error: err?.message || String(err),
        })
      }
    }
  } catch (err) {
    console.warn('[Offline Queue] Erro geral na drenagem:', err)
  } finally {
    isDraining = false
  }

  const remainingWins = await getPendingOfflineWindows()
  const remainingAnoms = await getPendingOfflineAnomalies()

  return {
    windowsDrained,
    windowsFailed,
    anomaliesDrained,
    anomaliesFailed,
    remainingPending: remainingWins.length + remainingAnoms.length,
  }
}

export async function getQueueStats(): Promise<{
  pendingWindowsCount: number
  pendingAnomaliesCount: number
  totalPending: number
}> {
  const [wins, anoms] = await Promise.all([
    getPendingOfflineWindows(),
    getPendingOfflineAnomalies(),
  ])
  return {
    pendingWindowsCount: wins.length,
    pendingAnomaliesCount: anoms.length,
    totalPending: wins.length + anoms.length,
  }
}

export async function clearOfflineSessionData(sessionId: string): Promise<void> {
  try {
    const db = await openDatabase()
    const tx = db.transaction([STORE_SESSIONS, STORE_WINDOWS, STORE_ANOMALIES], 'readwrite')
    tx.objectStore(STORE_SESSIONS).delete(sessionId)
  } catch {
    /* intentionally ignored */
  }
}
