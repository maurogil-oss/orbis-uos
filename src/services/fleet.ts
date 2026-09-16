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
