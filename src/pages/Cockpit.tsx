import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  Layers,
  Smartphone,
  Bus,
  RefreshCw,
  Plus,
  Flame,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react'
import { listRoadEvents, RoadEventRecord, createRoadEvent } from '@/services/roadEvents'
import { listFleetTelemetry, FleetTelemetryRecord } from '@/services/fleet'
import { CuritibaMap } from '@/components/CuritibaMap'
import { RealCollectorModal } from '@/components/RealCollectorModal'
import { ModoGabineteView } from '@/components/ModoGabineteView'
import { Onda2CockpitCard } from '@/components/Onda2CockpitCard'
import { TceDossierModal } from '@/components/TceDossierModal'
import { InstitutionalConfigModal } from '@/components/InstitutionalConfigModal'
import { ManifestosInstitucionaisModal } from '@/components/ManifestosInstitucionaisModal'
import { ChangePasswordModal } from '@/components/ChangePasswordModal'
import { useAuth } from '@/contexts/AuthContext'
import {
  getInstitucionalSettings,
  InstitucionalSettingsRecord,
} from '@/services/institucionalSettings'
import { Settings, LogOut, UserCheck, FileCheck, KeyRound, SlidersHorizontal } from 'lucide-react'

export default function Cockpit() {
  const { user, logout } = useAuth()
  const [institucionalSettings, setInstitucionalSettings] =
    useState<InstitucionalSettingsRecord | null>(null)
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false)
  const [showManifestosModal, setShowManifestosModal] = useState<boolean>(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState<boolean>(false)
  const [events, setEvents] = useState<RoadEventRecord[]>([])
  const [fleet, setFleet] = useState<FleetTelemetryRecord[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedEvent, setSelectedEvent] = useState<RoadEventRecord | null>(null)

  // View Mode: 'gabinete' (default prefeitos) vs 'tecnico' (engenharia)
  const [activeTab, setActiveTab] = useState<'gabinete' | 'tecnico'>('gabinete')
  const [showTceDossierModal, setShowTceDossierModal] = useState<boolean>(false)

  // Filters
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true)
  const [showFleet, setShowFleet] = useState<boolean>(true)

  // Modal for simulated smartphone reading
  const [showSimulateModal, setShowSimulateModal] = useState<boolean>(false)
  const [simulateVia, setSimulateVia] = useState<string>('Av. Visconde de Guarapuava, 2100')
  const [simulateBairro, setSimulateBairro] = useState<string>('Batel')
  const [simulateTipo, setSimulateTipo] = useState<any>('buraco')
  const [simulateSeverity, setSimulateSeverity] = useState<any>('alta')
  const [isSimulating, setIsSimulating] = useState<boolean>(false)

  // Modal for real sensor collection
  const [showRealCollectorModal, setShowRealCollectorModal] = useState<boolean>(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [eventsData, fleetData, settingsData] = await Promise.all([
        listRoadEvents(),
        listFleetTelemetry(),
        getInstitucionalSettings('4106902'),
      ])
      setEvents(eventsData)
      setFleet(fleetData)
      setInstitucionalSettings(settingsData)
      if (eventsData.length > 0 && !selectedEvent) {
        setSelectedEvent(eventsData[0])
      }
    } catch (err) {
      console.error('Erro ao carregar dados do Cockpit:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Quick stats computed
  const totalEvents = events.length
  const criticalCount = events.filter((e) => e.severidade === 'critica').length
  const osEmitidaCount = events.filter((e) => e.status === 'os_emitida').length
  const averageIRI =
    events.length > 0
      ? (events.reduce((acc, curr) => acc + (curr.iri_score || 3.5), 0) / events.length).toFixed(1)
      : '3.8'

  // Filtered list
  const filteredEvents = events.filter((e) => {
    if (severityFilter !== 'all' && e.severidade !== severityFilter) return false
    if (statusFilter !== 'all' && e.status !== statusFilter) return false
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const matchVia = e.via.toLowerCase().includes(query)
      const matchBairro = (e.bairro || '').toLowerCase().includes(query)
      const matchTipo = e.tipo.toLowerCase().includes(query)
      if (!matchVia && !matchBairro && !matchTipo) return false
    }
    return true
  })

  // Simulate new smartphone reading from driver
  const handleSimulateNewReading = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSimulating(true)
    try {
      // Small jitter around Curitiba center
      const lat = -25.4372 + (Math.random() - 0.5) * 0.08
      const lng = -49.2731 + (Math.random() - 0.5) * 0.08
      const iri = simulateSeverity === 'critica' ? 6.9 : simulateSeverity === 'alta' ? 5.4 : 3.8
      const accelZ = simulateSeverity === 'critica' ? 3.65 : 2.45

      const newRecord = await createRoadEvent({
        via: simulateVia,
        bairro: simulateBairro,
        tipo: simulateTipo,
        severidade: simulateSeverity,
        iri_score: iri,
        aceleracao_z: accelZ,
        latitude: lat,
        longitude: lng,
        velocidade_kmh: 38,
        status: 'detectado',
        veiculo_tipo: 'Ônibus Padron (Sensor Mobile)',
        linha_frota: 'Simulador Telemetria Mobile',
      })

      setEvents((prev) => [newRecord, ...prev])
      setSelectedEvent(newRecord)
      setShowSimulateModal(false)
    } catch (err) {
      console.error('Falha ao simular telemetria:', err)
    } finally {
      setIsSimulating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070D1F] text-[#F8FAFC] pt-24 pb-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Breadcrumb & Action bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A2A5A]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
              <Link
                to="/"
                className="hover:text-white transition-colors flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar à Landing
              </Link>
              <span>/</span>
              <span className="text-[#3B82F6]">Cockpit de Mobilidade & Asfalto</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Curitiba • Gêmeo Digital & Telemetria
              </h1>
              <span className="text-[11px] font-mono uppercase bg-[#10B981]/20 text-[#10B981] px-2.5 py-0.5 rounded border border-[#10B981]/40 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                Live Feed
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">
              Monitoramento inercial contínuo via acelerômetro de smartphones na frota de ônibus e
              coleta de Curitiba.
            </p>
          </div>

          {/* View Mode Toggle: Modo Gabinete vs Cockpit Técnico */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Usuário logado institucional */}
            {user && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] text-xs">
                <UserCheck className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="font-semibold text-[#F8FAFC]">{user.name}</span>
                <span className="text-[#94A3B8]">({user.cargo || 'Servidor'})</span>
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(true)}
                  title="Alterar minha senha de acesso institucional"
                  className="ml-1 px-2 py-0.5 rounded bg-[#0A1128] hover:bg-[#1A2A5A] text-[#60A5FA] hover:text-white border border-[#1A2A5A] flex items-center gap-1 transition-colors text-[11px] font-medium"
                >
                  <KeyRound className="w-3 h-3 text-[#3B82F6]" />
                  <span>Alterar Senha</span>
                </button>
                <button
                  type="button"
                  onClick={logout}
                  title="Encerrar sessão institucional"
                  className="ml-0.5 text-[#EF4444] hover:text-[#F87171] p-1 rounded hover:bg-[#EF4444]/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Botão Alterar Senha (visível em telas menores ou como acesso direto rápido) */}
            <button
              type="button"
              onClick={() => setShowChangePasswordModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#60A5FA] bg-[#101B3A] hover:bg-[#1A2A5A] border border-[#1A2A5A] hover:border-[#3B82F6] flex items-center gap-1.5 transition-all shadow-sm"
              title="Alterar senha da conta institucional"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span className="hidden sm:inline">Alterar Senha</span>
              <span className="sm:hidden">Senha</span>
            </button>

            {/* Botão de Configurações Institucionais */}
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#CBD5E1] bg-[#101B3A] hover:bg-[#1A2A5A] border border-[#1A2A5A] hover:border-[#3B82F6] flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Settings className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Configurações</span>
            </button>

            {/* Botão de Manifestos de Interesse & Diagnósticos Capturados */}
            <button
              type="button"
              onClick={() => setShowManifestosModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#60A5FA] bg-[#101B3A] hover:bg-[#1A2A5A] border border-[#1A2A5A] hover:border-[#3B82F6] flex items-center gap-1.5 transition-all shadow-sm"
              title="Ver manifestos e diagnósticos express capturados"
            >
              <FileCheck className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span className="hidden sm:inline">Manifestos</span>
            </button>

            <div className="bg-[#101B3A] p-1 rounded-xl border border-[#1A2A5A] flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('gabinete')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'gabinete'
                    ? 'bg-[#3B82F6] text-white shadow-md shadow-[#3B82F6]/30'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Modo Gabinete (Prefeito)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tecnico')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'tecnico'
                    ? 'bg-[#3B82F6] text-white shadow-md shadow-[#3B82F6]/30'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Cockpit Técnico (Engenharia)
              </button>
            </div>

            {/* Calibração Real do Fator K */}
            <Link
              to="/cockpit/calibracao-fator-k"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#38BDF8] bg-[#101B3A] hover:bg-[#1A2A5A] border border-[#38BDF8]/40 hover:border-[#38BDF8] shadow-sm flex items-center gap-1.5 transition-all"
              title="Calibração empírica do Fator K por tipo de veículo (ônibus, viatura, caminhão, ambulância)"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span className="hidden sm:inline">Calibração Fator K</span>
              <span className="sm:hidden">Fator K</span>
            </Link>

            {/* Dossiê TCE em 1 clique */}
            <button
              type="button"
              onClick={() => setShowTceDossierModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] shadow-md shadow-[#10B981]/20 flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dossiê TCE</span>
            </button>

            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] text-[#F8FAFC] flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>

            {/* Coleta de Campo Real (DeviceMotion + FFT na Borda) */}
            <button
              type="button"
              onClick={() => setShowRealCollectorModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] shadow-md shadow-[#10B981]/25 flex items-center gap-2 transition-all active:scale-95"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Coleta de Campo Real</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-black/25 text-[#A7F3D0]">
                FFT na Borda
              </span>
            </button>

            {/* Retained: Simulator fallback */}
            <button
              type="button"
              onClick={() => setShowSimulateModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#CBD5E1] bg-[#101B3A] hover:bg-[#1A2A5A] border border-[#1A2A5A] hover:border-[#3B82F6]/60 flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]" />
              Simulador Inercial
            </button>
          </div>
        </div>

        {/* CONDITIONAL RENDERING: MODO GABINETE VS TÉCNICO */}
        {activeTab === 'gabinete' ? (
          <ModoGabineteView
            roadEvents={events}
            onOpenDossier={() => setShowTceDossierModal(true)}
            onOpenTechnicalCockpit={() => setActiveTab('tecnico')}
            onOpenConfig={() => setShowConfigModal(true)}
            institucionalSettings={institucionalSettings}
            onSelectEvent={(ev) => {
              setSelectedEvent(ev)
              setActiveTab('tecnico')
            }}
          />
        ) : (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 4 Metric Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
                <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                  <span>Anomalias Catalogadas</span>
                  <Activity className="w-4 h-4 text-[#3B82F6]" />
                </div>
                <div className="text-2xl font-black font-mono text-[#F8FAFC]">{totalEvents}</div>
                <span className="text-[10px] text-[#94A3B8]">Na malha prioritária de Curitiba</span>
              </div>

              <div className="p-4 rounded-xl bg-[#101B3A] border border-[#EF4444]/40">
                <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                  <span>Severidade Crítica</span>
                  <Flame className="w-4 h-4 text-[#EF4444]" />
                </div>
                <div className="text-2xl font-black font-mono text-[#EF4444]">{criticalCount}</div>
                <span className="text-[10px] text-[#EF4444]/80">Risco imediato de acidente</span>
              </div>

              <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
                <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                  <span>Índice IRI Médio</span>
                  <Sparkles className="w-4 h-4 text-[#10B981]" />
                </div>
                <div className="text-2xl font-black font-mono text-[#10B981]">
                  {averageIRI} m/km
                </div>
                <span className="text-[10px] text-[#94A3B8]">Regularidade do pavimento</span>
              </div>

              <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
                <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                  <span>Veículos Ativos na Frota</span>
                  <Bus className="w-4 h-4 text-[#60A5FA]" />
                </div>
                <div className="text-2xl font-black font-mono text-[#60A5FA]">{fleet.length}</div>
                <span className="text-[10px] text-[#94A3B8]">Ônibus e caminhões transmitindo</span>
              </div>
            </div>

            {/* Main Content: Map (Left/Center) + Sidebar Details (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Map Column (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                {/* Map Controls */}
                <div className="p-3 rounded-xl bg-[#101B3A] border border-[#1A2A5A] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#94A3B8] font-semibold">Camadas:</span>
                    <button
                      type="button"
                      onClick={() => setShowHeatmap(!showHeatmap)}
                      className={`px-3 py-1.5 rounded-lg border transition-all ${
                        showHeatmap
                          ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-[#3B82F6] font-bold'
                          : 'bg-[#0A1128] border-[#1A2A5A] text-[#94A3B8]'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5 inline mr-1" />
                      Mapa de Calor de Severidade
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowFleet(!showFleet)}
                      className={`px-3 py-1.5 rounded-lg border transition-all ${
                        showFleet
                          ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981] font-bold'
                          : 'bg-[#0A1128] border-[#1A2A5A] text-[#94A3B8]'
                      }`}
                    >
                      <Bus className="w-3.5 h-3.5 inline mr-1" />
                      Frota de Ônibus & Coleta
                    </button>
                  </div>

                  {/* Filter by severity */}
                  <div className="flex items-center gap-2">
                    <span className="text-[#94A3B8]">Severidade:</span>
                    <select
                      value={severityFilter}
                      onChange={(e) => setSeverityFilter(e.target.value)}
                      className="bg-[#0A1128] border border-[#1A2A5A] text-[#F8FAFC] rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#3B82F6]"
                    >
                      <option value="all">Todas as severidades</option>
                      <option value="critica">Crítica (Buraco grave)</option>
                      <option value="alta">Alta</option>
                      <option value="media">Média</option>
                      <option value="baixa">Baixa</option>
                    </select>
                  </div>
                </div>

                {/* Map Canvas Component */}
                <div className="h-[520px] w-full">
                  <CuritibaMap
                    roadEvents={events}
                    fleet={fleet}
                    selectedEventId={selectedEvent?.id}
                    onSelectEvent={(ev) => setSelectedEvent(ev)}
                    showHeatmap={showHeatmap}
                    showFleet={showFleet}
                    severityFilter={severityFilter}
                  />
                </div>
              </div>

              {/* Details & Live Telemetry Feed Column (4 cols) */}
              <div className="lg:col-span-4 space-y-4">
                {/* Selected Anomaly Card */}
                {selectedEvent ? (
                  <div className="p-5 rounded-2xl bg-[#101B3A] border border-[#3B82F6]/50 shadow-xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#1A2A5A]">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-[#3B82F6]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#3B82F6]">
                          Detecção Selecionada
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          selectedEvent.severidade === 'critica'
                            ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40'
                            : selectedEvent.severidade === 'alta'
                              ? 'bg-[#F97316]/20 text-[#F97316] border border-[#F97316]/40'
                              : 'bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/40'
                        }`}
                      >
                        {selectedEvent.severidade}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#F8FAFC] leading-snug">
                        {selectedEvent.via}
                      </h3>
                      <span className="text-xs text-[#94A3B8]">
                        {selectedEvent.bairro || 'Curitiba'} • {selectedEvent.tipo.toUpperCase()}
                      </span>
                    </div>

                    {/* Telemetry Metric Pills */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-[#0A1128] border border-[#1A2A5A]">
                        <span className="text-[#94A3B8] block text-[10px]">Índice IRI</span>
                        <span className="text-base font-bold font-mono text-[#F8FAFC]">
                          {selectedEvent.iri_score
                            ? `${selectedEvent.iri_score.toFixed(1)} m/km`
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#0A1128] border border-[#1A2A5A]">
                        <span className="text-[#94A3B8] block text-[10px]">Aceleração Eixo Z</span>
                        <span className="text-base font-bold font-mono text-[#10B981]">
                          {selectedEvent.aceleracao_z
                            ? `${selectedEvent.aceleracao_z.toFixed(2)} g`
                            : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-[#94A3B8] space-y-1.5 pt-1">
                      <div className="flex justify-between">
                        <span>Veículo sensor:</span>
                        <span className="text-[#F8FAFC] font-medium">
                          {selectedEvent.veiculo_tipo || 'Frota Municipal'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Linha / Rota:</span>
                        <span className="text-[#F8FAFC] font-medium">
                          {selectedEvent.linha_frota || 'Regular'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status de Zeladoria:</span>
                        <span className="font-semibold text-[#10B981] uppercase">
                          {selectedEvent.status}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#1A2A5A] flex items-center justify-between">
                      <span className="text-[11px] text-[#94A3B8]">
                        {osEmitidaCount} Ordens de Serviço emitidas no total
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          alert(
                            `Ordem de Serviço gerada para: ${selectedEvent.via} (Prioridade: ${selectedEvent.severidade})`,
                          )
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#10B981] hover:bg-[#059669] text-white transition-colors"
                      >
                        Gerar OS Automática
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] text-center text-xs text-[#94A3B8]">
                    Selecione uma anomalia no mapa para visualizar a telemetria do smartphone
                  </div>
                )}

                {/* Live Fleet Telemetry List */}
                <div className="p-4 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#1A2A5A]">
                    <div className="flex items-center gap-2">
                      <Bus className="w-4 h-4 text-[#3B82F6]" />
                      <span className="text-xs font-bold text-[#F8FAFC]">Frota em Circulação</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#94A3B8]">
                      {fleet.length} sensores ativos
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {fleet.map((v) => (
                      <div
                        key={v.id}
                        className="p-2.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] text-xs flex items-center justify-between hover:border-[#3B82F6]/50 transition-colors"
                      >
                        <div>
                          <div className="font-bold text-[#F8FAFC] flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                            <span>{v.veiculo_id}</span>
                          </div>
                          <span className="text-[11px] text-[#94A3B8]">{v.linha}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-semibold text-[#60A5FA]">
                            {v.velocidade} km/h
                          </span>
                          <span className="block text-[10px] text-[#94A3B8]">
                            {v.anomalias_detectadas || 0} anomalias
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ONDA 2 CIDADE MÉDIA: GREEN LIGHT BRIDGE & MEIO-FIO */}
            <Onda2CockpitCard populacao={140000} frotaAtiva={fleet.length || 18} />

            {/* Bottom Table: Feed of Road Events */}
            <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-4">
              {' '}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A2A5A]">
                <div>
                  <h3 className="text-lg font-bold text-[#F8FAFC]">
                    Feed de Eventos Inerciais (Smartphones)
                  </h3>
                  <p className="text-xs text-[#94A3B8]">
                    Registro cronológico das anomalias captadas pelos sensores embarcados na frota
                  </p>
                </div>

                {/* Quick search input */}
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Buscar via ou bairro..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#0A1128] border border-[#1A2A5A] text-xs text-[#F8FAFC] rounded-lg px-3 py-2 placeholder:text-[#94A3B8]/60 focus:ring-1 focus:ring-[#3B82F6] min-w-[200px]"
                  />

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[#0A1128] border border-[#1A2A5A] text-xs text-[#F8FAFC] rounded-lg px-2.5 py-2 focus:ring-1 focus:ring-[#3B82F6]"
                  >
                    <option value="all">Todos os status</option>
                    <option value="detectado">Detectado</option>
                    <option value="triagem">Triagem</option>
                    <option value="os_emitida">OS Emitida</option>
                    <option value="reparado">Reparado</option>
                  </select>
                </div>
              </div>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] uppercase font-mono text-[#94A3B8] border-b border-[#1A2A5A] bg-[#0A1128]/50">
                    <tr>
                      <th className="py-3 px-3">Via / Trecho</th>
                      <th className="py-3 px-3">Bairro</th>
                      <th className="py-3 px-3">Tipo</th>
                      <th className="py-3 px-3">Severidade</th>
                      <th className="py-3 px-3">Índice IRI</th>
                      <th className="py-3 px-3">Acel. Z</th>
                      <th className="py-3 px-3">Veículo Coletor</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A2A5A]/50">
                    {filteredEvents.map((ev) => (
                      <tr
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className={`cursor-pointer transition-colors ${
                          selectedEvent?.id === ev.id
                            ? 'bg-[#3B82F6]/10 text-white'
                            : 'hover:bg-[#1A2A5A]/30 text-[#CBD5E1]'
                        }`}
                      >
                        <td className="py-3 px-3 font-semibold text-[#F8FAFC]">{ev.via}</td>
                        <td className="py-3 px-3 text-[#94A3B8]">{ev.bairro || 'Curitiba'}</td>
                        <td className="py-3 px-3 uppercase text-[11px] font-mono">{ev.tipo}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                              ev.severidade === 'critica'
                                ? 'bg-[#EF4444]/20 text-[#EF4444]'
                                : ev.severidade === 'alta'
                                  ? 'bg-[#F97316]/20 text-[#F97316]'
                                  : 'bg-[#FBBF24]/20 text-[#FBBF24]'
                            }`}
                          >
                            {ev.severidade}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold">
                          {ev.iri_score ? ev.iri_score.toFixed(1) : '-'}
                        </td>
                        <td className="py-3 px-3 font-mono">
                          {ev.aceleracao_z ? `${ev.aceleracao_z.toFixed(2)}g` : '-'}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            {ev.veiculo_tipo?.includes('Acelerômetro Real') ||
                            ev.linha_frota?.includes('Real') ? (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 font-bold shrink-0">
                                REAL
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#3B82F6]/15 text-[#93C5FD] border border-[#3B82F6]/30 shrink-0">
                                SIM
                              </span>
                            )}
                            <span className="text-[#94A3B8] truncate max-w-[160px]">
                              {ev.linha_frota || ev.veiculo_tipo || '-'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] uppercase font-bold text-[#10B981]">
                            {ev.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedEvent(ev)
                            }}
                            className="text-xs text-[#3B82F6] hover:text-[#60A5FA] underline font-medium"
                          >
                            Focar no Mapa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Dossiê TCE em 1 Clique */}
      <TceDossierModal
        isOpen={showTceDossierModal}
        onClose={() => setShowTceDossierModal(false)}
        roadEvents={events}
        fleet={fleet}
      />

      {/* Modal: Simular Leitura Inercial do Smartphone */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101B3A] border border-[#1A2A5A] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1A2A5A]">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#3B82F6]" />
                <h3 className="text-base font-bold text-[#F8FAFC]">
                  Simular Leitura Inercial no Celular
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSimulateModal(false)}
                className="text-[#94A3B8] hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#94A3B8]">
              Simula o smartphone do motorista de ônibus detectando um impacto no eixo vertical (Z)
              e calculando o índice IRI na malha de Curitiba.
            </p>

            <form onSubmit={handleSimulateNewReading} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#94A3B8] font-semibold mb-1">Via / Logradouro</label>
                <input
                  type="text"
                  value={simulateVia}
                  onChange={(e) => setSimulateVia(e.target.value)}
                  required
                  className="w-full bg-[#0A1128] border border-[#1A2A5A] rounded-lg px-3 py-2 text-[#F8FAFC] focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] font-semibold mb-1">Bairro</label>
                  <input
                    type="text"
                    value={simulateBairro}
                    onChange={(e) => setSimulateBairro(e.target.value)}
                    required
                    className="w-full bg-[#0A1128] border border-[#1A2A5A] rounded-lg px-3 py-2 text-[#F8FAFC] focus:ring-1 focus:ring-[#3B82F6]"
                  />
                </div>

                <div>
                  <label className="block text-[#94A3B8] font-semibold mb-1">
                    Tipo de Anomalia
                  </label>
                  <select
                    value={simulateTipo}
                    onChange={(e) => setSimulateTipo(e.target.value)}
                    className="w-full bg-[#0A1128] border border-[#1A2A5A] rounded-lg px-3 py-2 text-[#F8FAFC]"
                  >
                    <option value="buraco">Buraco</option>
                    <option value="ondulacao">Ondulação</option>
                    <option value="fissura">Fissura</option>
                    <option value="afundamento">Afundamento</option>
                    <option value="remendo_critico">Remendo Crítico</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#94A3B8] font-semibold mb-1">
                  Severidade Calculada
                </label>
                <select
                  value={simulateSeverity}
                  onChange={(e) => setSimulateSeverity(e.target.value)}
                  className="w-full bg-[#0A1128] border border-[#1A2A5A] rounded-lg px-3 py-2 text-[#F8FAFC]"
                >
                  <option value="critica">Crítica (IRI &gt; 6.0 | Acel Z &gt; 3.0g)</option>
                  <option value="alta">Alta (IRI ~5.4 | Acel Z ~2.5g)</option>
                  <option value="media">Média (IRI ~3.8 | Acel Z ~1.8g)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#0A1128] border border-[#1A2A5A] text-[#94A3B8] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSimulating}
                  className="px-5 py-2 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold transition-colors flex items-center gap-1.5"
                >
                  {isSimulating ? 'Transmitindo...' : 'Transmitir ao Cockpit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Coleta Real via Sensor DeviceMotion do Aparelho */}
      <RealCollectorModal
        isOpen={showRealCollectorModal}
        onClose={() => setShowRealCollectorModal(false)}
        onEventCreated={(newEvent) => {
          setEvents((prev) => [newEvent, ...prev])
          setSelectedEvent(newEvent)
        }}
        onOpenSimulatorFallback={() => setShowSimulateModal(true)}
      />

      {/* Modal de Configurações Institucionais (Portal Cidadão & Chave CGU & Senha) */}
      <InstitutionalConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        settings={institucionalSettings}
        onSettingsUpdated={(updated) => setInstitucionalSettings(updated)}
        onOpenChangePassword={() => setShowChangePasswordModal(true)}
      />

      {/* Modal de Manifestos & Leads Institucionais Capturados */}
      <ManifestosInstitucionaisModal
        isOpen={showManifestosModal}
        onClose={() => setShowManifestosModal(false)}
      />

      {/* Modal: Alterar Minha Senha */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </div>
  )
}
