import { useState, useEffect, useMemo } from 'react'
import {
  Activity,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  Radio,
  RefreshCw,
  Search,
  Smartphone,
  TrendingUp,
  Truck,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { pb } from '@/lib/pocketbase/client'
import { SegmentReadingRecord, AgentTaxonomyCode } from '@/services/roadSegments'
import { RoadEventRecord } from '@/services/roadEvents'
import { FieldSessionRecord } from '@/services/fatorKCalibration'
import { FleetTelemetryRecord } from '@/services/fleet'
import { getQueueStats, drainOfflineQueue } from '@/lib/collectorOfflineDb'
import { toast } from '@/hooks/use-toast'

export const AGENT_CODE_LABELS: Record<
  AgentTaxonomyCode,
  { label: string; icon: string; color: string }
> = {
  VEICULO_FROTA: {
    label: 'Veículo da Frota',
    icon: '🚗',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  },
  ONIBUS_FROTA: {
    label: 'Ônibus Institucional',
    icon: '🚌',
    color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
  },
  MOTOCICLISTA: {
    label: 'Motociclista',
    icon: '🏍️',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  },
  CICLISTA: {
    label: 'Ciclista (Micromobilidade)',
    icon: '🚲',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  },
  PEDESTRE: {
    label: 'Pedestre (Passeio Público)',
    icon: '🚶',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
  },
  PASSAGEIRO_ONIBUS: {
    label: 'Passageiro de Ônibus',
    icon: '💺',
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
  },
  OUTRO: {
    label: 'Outro Agente',
    icon: '🌐',
    color: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
  },
}

export function IngestionTransmissionTab() {
  const [readings, setReadings] = useState<SegmentReadingRecord[]>([])
  const [events, setEvents] = useState<RoadEventRecord[]>([])
  const [sessions, setSessions] = useState<FieldSessionRecord[]>([])
  const [fleet, setFleet] = useState<FleetTelemetryRecord[]>([])
  const [queueStats, setQueueStats] = useState({
    pendingWindowsCount: 0,
    pendingAnomaliesCount: 0,
    totalPending: 0,
  })
  const [loading, setLoading] = useState(true)
  const [draining, setDraining] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date())

  const loadIngestionData = async () => {
    try {
      setLoading(true)
      const now24hAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

      const [readingsRes, eventsRes, sessionsRes, fleetRes, qStats] = await Promise.all([
        pb
          .collection('segment_readings')
          .getList<SegmentReadingRecord>(1, 150, {
            sort: '-created',
          })
          .catch(() => ({ items: [] as SegmentReadingRecord[], totalItems: 0 })),
        pb
          .collection('road_events')
          .getList<RoadEventRecord>(1, 150, {
            sort: '-created',
          })
          .catch(() => ({ items: [] as RoadEventRecord[], totalItems: 0 })),
        pb
          .collection('field_sessions')
          .getList<FieldSessionRecord>(1, 50, {
            sort: '-created',
          })
          .catch(() => ({ items: [] as FieldSessionRecord[], totalItems: 0 })),
        pb
          .collection('fleet_telemetry')
          .getFullList<FleetTelemetryRecord>({
            sort: '-updated',
          })
          .catch(() => [] as FleetTelemetryRecord[]),
        getQueueStats().catch(() => ({
          pendingWindowsCount: 0,
          pendingAnomaliesCount: 0,
          totalPending: 0,
        })),
      ])

      setReadings(readingsRes.items || [])
      setEvents(eventsRes.items || [])
      setSessions(sessionsRes.items || [])
      setFleet(fleetRes || [])
      setQueueStats(qStats)
      setLastRefreshedAt(new Date())
    } catch (err) {
      console.warn('Erro ao carregar telemetria de ingestão:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIngestionData()
  }, [])

  // Auto-refresh a cada 15 segundos se habilitado
  useEffect(() => {
    if (!autoRefresh) return
    const timer = setInterval(() => {
      loadIngestionData()
    }, 15000)
    return () => clearInterval(timer)
  }, [autoRefresh])

  const handleDrainQueue = async () => {
    setDraining(true)
    try {
      const res = await drainOfflineQueue()
      toast({
        title: 'Fila offline processada',
        description: `${res.windowsDrained} janelas e ${res.anomaliesDrained} anomalias reenviadas com sucesso.`,
      })
      await loadIngestionData()
    } catch (err: any) {
      toast({
        title: 'Erro na drenagem',
        description: err?.message || 'Falha ao reenviar pendências',
        variant: 'destructive',
      })
    } finally {
      setDraining(false)
    }
  }

  // Estatísticas agregadas
  const now24h = useMemo(() => Date.now() - 24 * 60 * 60 * 1000, [])

  const readings24h = useMemo(
    () => readings.filter((r) => new Date(r.created).getTime() >= now24h),
    [readings, now24h],
  )

  const events24h = useMemo(
    () => events.filter((e) => new Date(e.created).getTime() >= now24h),
    [events, now24h],
  )

  // Taxa de sucesso estimada (janelas no banco vs pendências)
  const transmissionSuccessRate = useMemo(() => {
    const totalAttempted = readings.length + queueStats.pendingWindowsCount
    if (totalAttempted === 0) return 100
    const rate = (readings.length / totalAttempted) * 100
    return Math.min(100, Math.max(0, Math.round(rate * 10) / 10))
  }, [readings.length, queueStats.pendingWindowsCount])

  // Filtragem combinada por tipo de agente e busca de via
  const filteredReadings = useMemo(() => {
    return readings.filter((r) => {
      const agentMatch =
        selectedAgent === 'all' || (r.agent_code || 'VEICULO_FROTA') === selectedAgent
      const searchMatch =
        !searchTerm ||
        r.via.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.bairro && r.bairro.toLowerCase().includes(searchTerm.toLowerCase())) ||
        r.veiculo_id.toLowerCase().includes(searchTerm.toLowerCase())
      return agentMatch && searchMatch
    })
  }, [readings, selectedAgent, searchTerm])

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Controls & Auto-Refresh Strip */}
      <div className="p-4 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#3B82F6] animate-pulse" />
            <h2 className="text-base font-bold text-[#F8FAFC]">
              Painel de Ingestão & Transmissão de Telemetria
            </h2>
            <span className="text-[10px] font-mono uppercase bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded border border-[#10B981]/40 font-bold">
              Pipeline Blindado
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Monitoramento em tempo real do fluxo de borda: janelas recebidas, taxa de entrega,
            sessões ativas e fila de resiliência offline.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Botão de Drenagem Manual */}
          <button
            type="button"
            onClick={handleDrainQueue}
            disabled={draining}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              queueStats.totalPending > 0
                ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/60 shadow-sm animate-pulse'
                : 'bg-[#0A1128] text-[#94A3B8] border-[#1A2A5A] hover:border-[#3B82F6]'
            }`}
            title="Drenar fila offline IndexedDB de janelas e anomalias pendentes"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${draining ? 'animate-spin' : ''}`} />
            <span>
              {draining
                ? 'Drenando Fila...'
                : queueStats.totalPending > 0
                  ? `Drenar Fila (${queueStats.totalPending} pendentes)`
                  : 'Fila Offline Limpa'}
            </span>
          </button>

          {/* Toggle Auto-Refresh */}
          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              autoRefresh
                ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40'
                : 'bg-[#0A1128] text-[#94A3B8] border-[#1A2A5A]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-[#10B981] animate-ping' : 'bg-gray-500'}`}
            />
            <span>Auto-Refresh (15s): {autoRefresh ? 'Ligado' : 'Pausado'}</span>
          </button>

          <button
            type="button"
            onClick={loadIngestionData}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#0A1128] border border-[#1A2A5A] hover:border-[#3B82F6] text-[#CBD5E1] hover:text-white flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar Agora</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Janelas 24h / Total */}
        <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
          <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
            <span>Janelas Recebidas</span>
            <Layers className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <div className="text-xl font-black font-mono text-[#F8FAFC]">
            {readings24h.length}{' '}
            <span className="text-xs text-[#94A3B8] font-normal font-sans">
              / {readings.length} total
            </span>
          </div>
          <span className="text-[10px] text-[#10B981] font-medium">Últimas 24 horas</span>
        </div>

        {/* Taxa de Sucesso */}
        <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
          <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
            <span>Taxa de Sucesso</span>
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="text-xl font-black font-mono text-[#10B981]">
            {transmissionSuccessRate}%
          </div>
          <span className="text-[10px] text-[#94A3B8]">Buffer vs Transmissão</span>
        </div>

        {/* Fila Offline Pendente */}
        <div
          className={`p-3.5 rounded-xl bg-[#101B3A] border ${queueStats.totalPending > 0 ? 'border-[#F59E0B]' : 'border-[#1A2A5A]'}`}
        >
          <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
            <span>Fila Offline (Local)</span>
            {queueStats.totalPending > 0 ? (
              <WifiOff className="w-4 h-4 text-[#F59E0B]" />
            ) : (
              <Wifi className="w-4 h-4 text-[#10B981]" />
            )}
          </div>
          <div
            className={`text-xl font-black font-mono ${queueStats.totalPending > 0 ? 'text-[#F59E0B]' : 'text-[#F8FAFC]'}`}
          >
            {queueStats.totalPending}
          </div>
          <span className="text-[10px] text-[#94A3B8]">
            {queueStats.pendingWindowsCount} janelas • {queueStats.pendingAnomaliesCount} anomalias
          </span>
        </div>

        {/* Anomalias Auto-Persistidas */}
        <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
          <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
            <span>Anomalias Auto-Salvas</span>
            <Activity className="w-4 h-4 text-[#EF4444]" />
          </div>
          <div className="text-xl font-black font-mono text-[#F8FAFC]">
            {events24h.length}{' '}
            <span className="text-xs text-[#94A3B8] font-normal font-sans">/ {events.length}</span>
          </div>
          <span className="text-[10px] text-[#94A3B8]">Auto-persistência em tempo real</span>
        </div>

        {/* Sessões de Campo */}
        <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
          <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
            <span>Sessões de Campo</span>
            <Smartphone className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div className="text-xl font-black font-mono text-[#38BDF8]">{sessions.length}</div>
          <span className="text-[10px] text-[#94A3B8]">Calibração & monitoramento</span>
        </div>

        {/* Dispositivos da Frota */}
        <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
          <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
            <span>Dispositivos Ativos</span>
            <Truck className="w-4 h-4 text-[#60A5FA]" />
          </div>
          <div className="text-xl font-black font-mono text-[#60A5FA]">{fleet.length}</div>
          <span className="text-[10px] text-[#94A3B8]">Frota transmitindo</span>
        </div>
      </div>

      {/* Grid: Sessões de Campo (Cobertura) + Dispositivos Transmitindo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sessões de Campo com % de Cobertura de Rota */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A2A5A]">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#38BDF8]" />
              <h3 className="text-sm font-bold text-[#F8FAFC]">
                Sessões de Campo & Cobertura Operacional
              </h3>
            </div>
            <span className="text-xs text-[#94A3B8] font-mono">{sessions.length} registradas</span>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {sessions.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#94A3B8]">
                Nenhuma sessão de campo formal registrada ainda. Inicie uma coleta no modal.
              </div>
            ) : (
              sessions.map((ses) => {
                const agent = (ses.agent_code || 'VEICULO_FROTA') as AgentTaxonomyCode
                const agentMeta = AGENT_CODE_LABELS[agent] || AGENT_CODE_LABELS.VEICULO_FROTA
                const durMin = Math.round((ses.duracao_ms || 0) / 60000)
                const distKm = ((ses.distancia_metros || 0) / 1000).toFixed(1)

                return (
                  <div
                    key={ses.id}
                    className="p-3 rounded-xl bg-[#0A1128] border border-[#1A2A5A] hover:border-[#38BDF8]/40 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#F8FAFC]">
                          {ses.session_code}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${agentMeta.color}`}
                        >
                          {agentMeta.icon} {agentMeta.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#94A3B8]">
                        {ses.created ? new Date(ses.created).toLocaleDateString() : 'Hoje'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-[#101B3A] p-2 rounded-lg">
                        <span className="text-[10px] text-[#94A3B8] block">Operador</span>
                        <span className="font-semibold text-[#CBD5E1] truncate block">
                          {ses.operador_nome || 'Operador PWA'}
                        </span>
                      </div>
                      <div className="bg-[#101B3A] p-2 rounded-lg">
                        <span className="text-[10px] text-[#94A3B8] block">
                          Distância / Duração
                        </span>
                        <span className="font-mono text-[#60A5FA]">
                          {distKm} km • {durMin} min
                        </span>
                      </div>
                      <div className="bg-[#101B3A] p-2 rounded-lg">
                        <span className="text-[10px] text-[#94A3B8] block">Janelas / Impactos</span>
                        <span className="font-mono text-[#F8FAFC]">
                          {ses.janelas_processadas} jan / {ses.impactos_detectados} imp
                        </span>
                      </div>
                      <div className="bg-[#101B3A] p-2 rounded-lg">
                        <span className="text-[10px] text-[#94A3B8] block">IRI Médio</span>
                        <span className="font-mono text-[#10B981] font-bold">
                          {ses.iri_medio ? `${ses.iri_medio.toFixed(2)} m/km` : '2.6 m/km'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Dispositivos da Frota & Última Transmissão */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A2A5A]">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#60A5FA]" />
              <h3 className="text-sm font-bold text-[#F8FAFC]">
                Dispositivos & Veículos Transmitindo
              </h3>
            </div>
            <span className="text-xs text-[#94A3B8] font-mono">{fleet.length} ativos</span>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {fleet.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#94A3B8]">
                Nenhum dispositivo com telemetria ativa no momento.
              </div>
            ) : (
              fleet.map((v) => (
                <div
                  key={v.id}
                  className="p-3 rounded-xl bg-[#0A1128] border border-[#1A2A5A] flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                      <span className="font-bold text-[#F8FAFC]">{v.veiculo_id}</span>
                      <span className="text-[10px] bg-[#3B82F6]/20 text-[#60A5FA] px-1.5 py-0.2 rounded font-mono">
                        {v.tipo}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#94A3B8] block">
                      Linha: {v.linha || 'Operação Regular'} • {v.ultima_leitura || 'Agora'}
                    </span>
                  </div>

                  <div className="text-right space-y-0.5">
                    <span className="font-mono font-bold text-sm text-[#38BDF8] block">
                      {v.velocidade} km/h
                    </span>
                    <span className="text-[10px] text-[#94A3B8] block">
                      Bateria: {v.bateria_dispositivo ?? 95}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Tabela de Ingestão de Janelas com Filtro por Tipo de Agente */}
      <div className="p-5 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1A2A5A]">
          <div>
            <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#10B981]" />
              Leituras de Telemetria por Segmento Viário (Últimas Janelas)
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Exibindo {filteredReadings.length} de {readings.length} janelas recebidas e agregadas
              na borda.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filtro por Tipo de Agente */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#94A3B8]" />
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="bg-[#0A1128] border border-[#1A2A5A] text-xs text-[#F8FAFC] rounded-xl px-3 py-2 focus:ring-1 focus:ring-[#3B82F6]"
              >
                <option value="all">Todos os Agentes</option>
                {Object.entries(AGENT_CODE_LABELS).map(([code, meta]) => (
                  <option key={code} value={code}>
                    {meta.icon} {meta.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Busca textual */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar por via, bairro ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#0A1128] border border-[#1A2A5A] text-xs text-[#F8FAFC] rounded-xl pl-9 pr-3 py-2 placeholder:text-[#94A3B8]/60 focus:ring-1 focus:ring-[#3B82F6] min-w-[200px]"
              />
            </div>
          </div>
        </div>

        {/* Tabela de Janelas */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0A1128] text-[#94A3B8] uppercase font-mono text-[10px] border-b border-[#1A2A5A]">
              <tr>
                <th className="py-2.5 px-3">Horário</th>
                <th className="py-2.5 px-3">Agente / Emissor</th>
                <th className="py-2.5 px-3">Via & Bairro</th>
                <th className="py-2.5 px-3">Segmento / H3</th>
                <th className="py-2.5 px-3 text-right">Velocidade</th>
                <th className="py-2.5 px-3 text-right">Pico G</th>
                <th className="py-2.5 px-3 text-right">IRI Est.</th>
                <th className="py-2.5 px-3 text-right">Impactos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2A5A]">
              {filteredReadings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#94A3B8]">
                    Nenhuma janela encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredReadings.slice(0, 40).map((r) => {
                  const agent = (r.agent_code || 'VEICULO_FROTA') as AgentTaxonomyCode
                  const meta = AGENT_CODE_LABELS[agent] || AGENT_CODE_LABELS.VEICULO_FROTA

                  return (
                    <tr key={r.id} className="hover:bg-[#1A2A5A]/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[#94A3B8] whitespace-nowrap">
                        {r.created ? new Date(r.created).toLocaleTimeString() : 'Agora'}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border inline-flex items-center gap-1 ${meta.color}`}
                        >
                          <span>{meta.icon}</span>
                          <span>{meta.label}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-[#F8FAFC] block">{r.via}</span>
                        <span className="text-[10px] text-[#94A3B8]">{r.bairro || 'Curitiba'}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#60A5FA]">
                        {r.segmento_id}
                        {r.h3_index && (
                          <span className="block text-[9px] text-[#94A3B8]">
                            H3: {r.h3_index.slice(0, 10)}...
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#CBD5E1]">
                        {r.velocidade_media_kmh
                          ? `${Math.round(r.velocidade_media_kmh)} km/h`
                          : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#F59E0B]">
                        {r.pico_acel_z ? `${r.pico_acel_z.toFixed(2)}g` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#10B981]">
                        {r.iri_janela ? `${r.iri_janela.toFixed(2)}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#EF4444]">
                        {r.impactos_count || 0}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
