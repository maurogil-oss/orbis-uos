import pb from '@/lib/pocketbase/client'

export type FleetVehicleType =
  | 'onibus_articulado'
  | 'onibus_padron'
  | 'caminhao_coleta'
  | 'viatura_guarda'

export type FleetStatus = 'em_rota' | 'parado' | 'manutencao'

export interface FleetTelemetryRecord {
  id: string
  veiculo_id: string
  tipo: FleetVehicleType
  linha: string
  latitude: number
  longitude: number
  velocidade: number
  status: FleetStatus
  km_percorridos_hoje?: number
  anomalias_detectadas?: number
  bateria_dispositivo?: number
  ultima_leitura?: string
  created: string
  updated: string
}

export interface UpsertFleetTelemetryPayload {
  veiculo_id: string
  tipo?: FleetVehicleType
  linha?: string
  latitude: number
  longitude: number
  velocidade: number
  status?: FleetStatus
  km_percorridos_hoje?: number
  anomalias_detectadas?: number
  bateria_dispositivo?: number
  ultima_leitura?: string
}

export async function listFleetTelemetry(): Promise<FleetTelemetryRecord[]> {
  try {
    const records = await pb.collection('fleet_telemetry').getFullList<FleetTelemetryRecord>({
      sort: '-velocidade',
    })
    return records
  } catch (err) {
    console.warn('Erro ao carregar fleet_telemetry do backend:', err)
    return []
  }
}

/**
 * Upsert da telemetria de frota ativa a cada janela transmitida:
 * Mantém o registro do veículo atualizado com posição, velocidade, bateria e horário
 */
export async function upsertFleetTelemetry(
  payload: UpsertFleetTelemetryPayload,
): Promise<FleetTelemetryRecord | null> {
  try {
    const list = await pb.collection('fleet_telemetry').getList<FleetTelemetryRecord>(1, 1, {
      filter: `veiculo_id = '${payload.veiculo_id}'`,
    })

    const nowStr = 'Agora mesmo'
    const status: FleetStatus = payload.status || (payload.velocidade > 0 ? 'em_rota' : 'parado')
    const tipo: FleetVehicleType = payload.tipo || 'onibus_padron'

    if (list.items.length > 0) {
      const existing = list.items[0]
      const updated = await pb
        .collection('fleet_telemetry')
        .update<FleetTelemetryRecord>(existing.id, {
          latitude: payload.latitude,
          longitude: payload.longitude,
          velocidade: payload.velocidade,
          status,
          linha: payload.linha || existing.linha || 'Operação Regular',
          bateria_dispositivo: payload.bateria_dispositivo ?? existing.bateria_dispositivo ?? 95,
          anomalias_detectadas:
            (existing.anomalias_detectadas || 0) + (payload.anomalias_detectadas || 0),
          km_percorridos_hoje:
            (existing.km_percorridos_hoje || 0) + (payload.km_percorridos_hoje || 0),
          ultima_leitura: nowStr,
        })
      return updated
    } else {
      const created = await pb.collection('fleet_telemetry').create<FleetTelemetryRecord>({
        veiculo_id: payload.veiculo_id,
        tipo,
        linha: payload.linha || 'Frota de Coleta e Monitoramento',
        latitude: payload.latitude,
        longitude: payload.longitude,
        velocidade: payload.velocidade,
        status,
        bateria_dispositivo: payload.bateria_dispositivo ?? 95,
        anomalias_detectadas: payload.anomalias_detectadas ?? 0,
        km_percorridos_hoje: payload.km_percorridos_hoje ?? 1,
        ultima_leitura: nowStr,
      })
      return created
    }
  } catch (err: any) {
    console.warn('Erro no upsert de fleet_telemetry:', err?.message || err)
    return null
  }
}
