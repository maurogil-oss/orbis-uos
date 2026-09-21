/**
 * Fila de Armazenamento Local e Resiliência Offline (IndexedDB)
 *
 * Garante a integridade da coleta PWA e SDK Edge em áreas de sombra de conectividade 4G/5G:
 * 1. Sessões ativas ou pausadas por suspensão de aba/background
 * 2. Janelas agregadas de telemetria pendentes de envio
 * 3. Anomalias pontuais capturadas
 * 4. Metadados de cobertura de rota e posição do celular
 */

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
  payload: any
  persisted: boolean
}

export interface OfflinePendingAnomaly {
  id: string
  sessionId: string
  timestamp: number
  payload: any
  persisted: boolean
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

export async function enqueueOfflineWindow(item: OfflinePendingWindow): Promise<void> {
  try {
    const db = await openDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_WINDOWS, 'readwrite')
      const store = tx.objectStore(STORE_WINDOWS)
      const putReq = store.put(item)
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
      const getReq = store.get(id)
      getReq.onsuccess = () => {
        if (getReq.result) {
          getReq.result.persisted = true
          store.put(getReq.result)
        }
        resolve()
      }
      getReq.onerror = () => reject(getReq.error)
    })
  } catch {
    /* intentionally ignored */
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
