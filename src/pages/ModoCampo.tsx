import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Smartphone,
  Play,
  Square,
  Pause,
  RotateCcw,
  ShieldCheck,
  Activity,
  Compass,
  Lock,
  Unlock,
  Radio,
  Wifi,
  WifiOff,
  CloudUpload,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Info,
  Car,
  Bus,
  Bike,
  Footprints,
  UserCheck,
  HelpCircle,
  Clock,
  Sparkles,
  MapPin,
  RefreshCw,
} from 'lucide-react'
import {
  useDeviceMotionCollector,
  PhoneMountPosition,
  SessionSummary,
} from '@/hooks/useDeviceMotionCollector'
import { AgentTaxonomyCode } from '@/services/roadSegments'
import { VeiculoTipoCalibracao, VEICULO_TIPOS_CONFIG } from '@/services/fatorKCalibration'
import { drainOfflineQueue, getQueueStats } from '@/lib/collectorOfflineDb'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'

interface AgentOption {
  code: AgentTaxonomyCode
  canonicalType: VeiculoTipoCalibracao
  label: string
  sublabel: string
  description: string
  icon: typeof Car
  color: string
  badgeText: string
}

const AGENT_OPTIONS: AgentOption[] = [
  {
    code: 'VEICULO_FROTA',
    canonicalType: 'viatura',
    label: 'Veículo Leve Institucional',
    sublabel: 'Carro, SUV, Picape ou Viatura',
    description:
      'Veículos leves da administração, viaturas municipais, fiscalização ou veículos de uso institucional.',
    icon: Car,
    color: '#3B82F6',
    badgeText: 'Sub-índice IMV',
  },
  {
    code: 'ONIBUS_FROTA',
    canonicalType: 'onibus',
    label: 'Ônibus de Frota Regular',
    sublabel: 'Linhas urbanas, ligeirinho e articulado',
    description:
      'Ônibus do transporte coletivo regular ou linhas troncais com alta repetição de trecho.',
    icon: Bus,
    color: '#F59E0B',
    badgeText: 'Sub-índice IMV',
  },
  {
    code: 'MOTOCICLISTA',
    canonicalType: 'motociclista',
    label: 'Motociclista',
    sublabel: 'Patrulha em duas rodas ou entregas',
    description:
      'Motocicletas em vias urbanas. Detecta viés de desvio lateral e ondulações agudas.',
    icon: Bike,
    color: '#EC4899',
    badgeText: 'Sub-índice IMA',
  },
  {
    code: 'CICLISTA',
    canonicalType: 'ciclista',
    label: 'Ciclista',
    sublabel: 'Ciclovias, ciclofaixas e vias compartilhadas',
    description: 'Bicicletas mecânicas ou elétricas. Mede a microrugosidade da malha cicloviária.',
    icon: Bike,
    color: '#10B981',
    badgeText: 'Sub-índice IMA',
  },
  {
    code: 'PEDESTRE',
    canonicalType: 'pedestre',
    label: 'Pedestre',
    sublabel: 'Calçadas, passeios públicos e travessias',
    description: 'Caminhada técnica para auditoria de acessibilidade, desníveis e pisos táteis.',
    icon: Footprints,
    color: '#06B6D4',
    badgeText: 'Sub-índice IMA',
  },
  {
    code: 'PASSAGEIRO_ONIBUS',
    canonicalType: 'onibus',
    label: 'Passageiro de Ônibus',
    sublabel: 'Coleta embarcada por cidadão ou servidor',
    description:
      'Aparelho no bolso ou mão dentro do transporte coletivo. Aplica atenuação biomecânica.',
    icon: UserCheck,
    color: '#8B5CF6',
    badgeText: 'Sub-índice IMV',
  },
  {
    code: 'OUTRO',
    canonicalType: 'outros',
    label: 'Outro Agente de Campo',
    sublabel: 'Caminhão de resíduos, SAMU ou utilitários',
    description:
      'Outras frotas operacionais ou categorias especiais de veículos de serviços urbanos.',
    icon: HelpCircle,
    color: '#94A3B8',
    badgeText: 'Multimodal',
  },
]

type Step = 1 | 2 | 3 | 4

export default function ModoCampo() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Stepper: 1: Contexto/LGPD -> 2: Permissões de Sensores -> 3: Agente & Config -> 4: Coleta Ativa
  const [currentStep, setCurrentStep] = useState<Step>(1)

  // Seleção consciente e explícita do agente (SEM pré-seleção)
  const [selectedAgentCode, setSelectedAgentCode] = useState<AgentTaxonomyCode | null>(null)

  // Metadados mínimos de configuração
  const [via, setVia] = useState('')
  const [bairro, setBairro] = useState('Batel')
  const [linhaFrota, setLinhaFrota] = useState('')
  const [phonePosition, setPhonePosition] = useState<PhoneMountPosition>('painel')

  // Fila offline e status de rede
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  )
  const [queueStats, setQueueStats] = useState<{
    pendingWindowsCount: number
    pendingAnomaliesCount: number
    totalPending: number
  }>({
    pendingWindowsCount: 0,
    pendingAnomaliesCount: 0,
    totalPending: 0,
  })
  const [isDraining, setIsDraining] = useState<boolean>(false)

  // Selecionado config
  const selectedAgentOption = useMemo(
    () => AGENT_OPTIONS.find((a) => a.code === selectedAgentCode) || null,
    [selectedAgentCode],
  )

  const canonicoTipo: VeiculoTipoCalibracao = selectedAgentOption?.canonicalType || 'viatura'
  const veiculoAtualConfig = VEICULO_TIPOS_CONFIG[canonicoTipo] || VEICULO_TIPOS_CONFIG.viatura

  // Sensor hook
  const {
    status,
    sensorSupport,
    permissionError,
    isWakeLocked,
    wakeLockSupported,
    toggleWakeLock,
    requestWakeLock,
    samplingRateHz,
    currentZ,
    peakSessionG,
    anomalies,
    processedWindows,
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
    isAutoPaused,
    sessionSummary,
  } = useDeviceMotionCollector({
    thresholdG: 2.5,
    via: via.trim() || 'Via em Coleta Móvel',
    bairro: bairro.trim() || 'Curitiba',
    linhaFrota: linhaFrota.trim() || (selectedAgentOption?.label ?? 'Modo Campo Móvel'),
    veiculoTipo: selectedAgentOption?.label ?? 'Veículo Leve Institucional',
    veiculoTipoCanonico: canonicoTipo,
    modoColeta: veiculoAtualConfig.modoCategoria,
    indiceAlvo: veiculoAtualConfig.indiceAlvo,
    agentCode: selectedAgentCode || 'VEICULO_FROTA',
    phonePosition,
    codigoIbge: '4106902',
    operadorNome: user?.name || user?.email || 'Servidor em Campo (Modo Campo)',
    autoPersistWindows: true,
    autoPersistAnomalies: true,
  })

  // Monitorar status online/offline e fila IndexedDB
  useEffect(() => {
    const updateOnline = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', updateOnline)
    window.addEventListener('offline', updateOnline)

    const updateStats = async () => {
      try {
        const stats = await getQueueStats()
        setQueueStats(stats)
      } catch {
        /* ignore */
      }
    }

    updateStats()
    const timer = setInterval(updateStats, 4000)

    return () => {
      window.removeEventListener('online', updateOnline)
      window.removeEventListener('offline', updateOnline)
      clearInterval(timer)
    }
  }, [])

  // Atualizar fila manualmente
  const handleDrainQueue = async () => {
    if (!isOnline) {
      toast({
        title: 'Dispositivo Offline',
        description:
          'Os dados permanecem seguros no IndexedDB e serão enviados assim que a rede retornar.',
      })
      return
    }
    setIsDraining(true)
    try {
      const res = await drainOfflineQueue()
      toast({
        title: 'Fila sincronizada',
        description: `${res.windowsDrained} janela(s) e ${res.anomaliesDrained} anomalia(s) transmitidas com sucesso.`,
      })
      const stats = await getQueueStats()
      setQueueStats(stats)
    } catch (err: any) {
      toast({
        title: 'Erro na transmissão',
        description: err?.message || 'Falha ao drenar fila offline.',
        variant: 'destructive',
      })
    } finally {
      setIsDraining(false)
    }
  }

  // Formatação de tempo mm:ss
  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000)
    const mins = Math.floor(totalSecs / 60)
    const secs = totalSecs % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Estimativa de distância percorrida
  const estimatedMeters = useMemo(() => {
    if (sessionSummary) return sessionSummary.distanceMeters
    const durationSecs = elapsedMs / 1000
    const spd = (speedKmh || 30) / 3.6
    return Math.round(durationSecs * spd)
  }, [sessionSummary, elapsedMs, speedKmh])

  // Iniciar coleta na tela 4
  const handleStartCollection = async () => {
    if (!selectedAgentCode) {
      toast({
        title: 'Selecione uma categoria',
        description: 'Escolha o tipo de agente antes de iniciar a coleta.',
        variant: 'destructive',
      })
      return
    }
    const started = await startSession()
    if (started) {
      setCurrentStep(4)
    }
  }

  const isCollecting = status === 'collecting'
  const isCalibrating = status === 'calibrating'
  const isPaused = status === 'paused'

  return (
    <div className="min-h-screen bg-[#070D1F] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#3B82F6]/30">
      {/* Top Bar Minimalista Mobile */}
      <header className="sticky top-0 z-40 bg-[#0A1128]/95 backdrop-blur-md border-b border-[#1A2A5A] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            to="/cockpit"
            className="p-1.5 -ml-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#101B3A] transition-colors"
            aria-label="Voltar ao Cockpit"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white">ORBIS Modo Campo</span>
              <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40">
                PWA Mobile
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8] line-clamp-1">
              Coleta inercial veicular e mobilidade urbana
            </p>
          </div>
        </div>

        {/* Status de Rede & Fila */}
        <div className="flex items-center gap-2">
          {queueStats.totalPending > 0 && (
            <button
              type="button"
              onClick={handleDrainQueue}
              disabled={isDraining}
              className="px-2 py-1 rounded-lg bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#F59E0B] text-[11px] font-mono font-bold flex items-center gap-1 active:scale-95 transition-transform"
              title="Fila offline com dados pendentes"
            >
              <CloudUpload className={`w-3 h-3 ${isDraining ? 'animate-bounce' : ''}`} />
              <span>{queueStats.totalPending} pend.</span>
            </button>
          )}

          <div
            className={`px-2 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1 border ${
              isOnline
                ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40'
                : 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/40'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3" />
                <span className="hidden sm:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span>Offline</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Stepper Progress Bar (quando não estiver em coleta ativa ou para navegação clara) */}
      {status === 'idle' && (
        <div className="bg-[#0A1128] border-b border-[#1A2A5A] px-4 py-2.5">
          <div className="max-w-md mx-auto flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-1.5 transition-colors ${
                currentStep === 1
                  ? 'text-[#3B82F6] font-bold'
                  : currentStep > 1
                    ? 'text-[#10B981]'
                    : 'text-[#64748B]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                  currentStep === 1
                    ? 'bg-[#3B82F6] text-white'
                    : currentStep > 1
                      ? 'bg-[#10B981] text-white'
                      : 'bg-[#1E293B] text-[#94A3B8]'
                }`}
              >
                1
              </span>
              <span>Contexto</span>
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-[#334155]" />

            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className={`flex items-center gap-1.5 transition-colors ${
                currentStep === 2
                  ? 'text-[#3B82F6] font-bold'
                  : currentStep > 2
                    ? 'text-[#10B981]'
                    : 'text-[#64748B]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                  currentStep === 2
                    ? 'bg-[#3B82F6] text-white'
                    : currentStep > 2
                      ? 'bg-[#10B981] text-white'
                      : 'bg-[#1E293B] text-[#94A3B8]'
                }`}
              >
                2
              </span>
              <span>Sensores</span>
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-[#334155]" />

            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className={`flex items-center gap-1.5 transition-colors ${
                currentStep === 3 ? 'text-[#3B82F6] font-bold' : 'text-[#64748B]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                  currentStep === 3 ? 'bg-[#3B82F6] text-white' : 'bg-[#1E293B] text-[#94A3B8]'
                }`}
              >
                3
              </span>
              <span>Agente</span>
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo Principal — Mobile First */}
      <main className="flex-1 max-w-lg w-full mx-auto p-4 sm:p-5 flex flex-col justify-center">
        {/* =========================================================================
            ETAPA 1: CONTEXTO, TRANSPARÊNCIA E LGPD (Mobile-First)
           ========================================================================= */}
        {currentStep === 1 && status === 'idle' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#3B82F6]/15 border border-[#3B82F6]/40 flex items-center justify-center text-[#3B82F6] shadow-lg shadow-[#3B82F6]/20">
                <Smartphone className="w-8 h-8" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Coleta de Telemetria em Campo
              </h1>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed max-w-sm mx-auto">
                Transforme este smartphone em uma sonda inercial para diagnosticar a qualidade do
                pavimento viário e calçadas.
              </p>
            </div>

            {/* Card de Transparência e LGPD */}
            <div className="p-4 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#10B981]">
                <ShieldCheck className="w-4 h-4" />
                <span>Privacidade Rigorosa & Conformidade LGPD</span>
              </div>
              <div className="space-y-2 text-xs text-[#CBD5E1] leading-relaxed">
                <p>
                  <strong className="text-white">O que será coletado:</strong> Apenas aceleração
                  vertical (vibração mecânica do eixo Z), taxa angular (giroscópio) e posição GPS
                  agregada em trechos de 100m.
                </p>
                <p>
                  <strong className="text-white">O que NUNCA é coletado:</strong> Câmeras
                  desligadas, sem captação de placas, sem fotos de condutores e sem identificação de
                  pessoas. Apenas a classificação de categoria de agente institucional é registrada.
                </p>
                <p className="text-[11px] text-[#94A3B8]">
                  Zero CAPEX: utiliza exclusivamente os sensores inerciais de bordo já presentes no
                  aparelho.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] shadow-lg shadow-[#3B82F6]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Avançar para Permissão de Sensores</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* =========================================================================
            ETAPA 2: LIBERAÇÃO DE SENSORES (DeviceMotion / GPS / WakeLock)
           ========================================================================= */}
        {currentStep === 2 && status === 'idle' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center text-[#10B981] shadow-lg shadow-[#10B981]/20">
                <Radio className="w-8 h-8 animate-pulse" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Permissão de Sensores Físicos
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8] max-w-sm mx-auto">
                O navegador requer autorização para ler o acelerômetro e a geolocalização.
              </p>
            </div>

            {/* Status dos Sensores */}
            <div className="p-4 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-[#1A2A5A]/60">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-[#3B82F6]" />
                  <span className="text-xs font-semibold text-white">
                    Acelerômetro & Giroscópio
                  </span>
                </div>
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                    sensorSupport === 'supported'
                      ? 'bg-[#10B981]/20 text-[#10B981]'
                      : sensorSupport === 'permission_denied'
                        ? 'bg-[#EF4444]/20 text-[#EF4444]'
                        : 'bg-[#F59E0B]/20 text-[#F59E0B]'
                  }`}
                >
                  {sensorSupport === 'supported'
                    ? 'Permitido / Ativo'
                    : sensorSupport === 'permission_denied'
                      ? 'Bloqueado'
                      : 'Requer Autorização'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-[#1A2A5A]/60">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#3B82F6]" />
                  <span className="text-xs font-semibold text-white">GPS & Velocidade</span>
                </div>
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                    gpsStatus === 'active'
                      ? 'bg-[#10B981]/20 text-[#10B981]'
                      : 'bg-[#F59E0B]/20 text-[#F59E0B]'
                  }`}
                >
                  {gpsStatus === 'active' ? 'Ativo' : 'Aguardando Início'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-[#3B82F6]" />
                  <span className="text-xs font-semibold text-white">Travar Tela Acesa</span>
                </div>
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                    wakeLockSupported
                      ? 'bg-[#10B981]/20 text-[#10B981]'
                      : 'bg-[#F59E0B]/20 text-[#F59E0B]'
                  }`}
                >
                  {wakeLockSupported ? 'Suportado (Automático)' : 'Não Suportado'}
                </span>
              </div>
            </div>

            {/* Aviso de erro ou instrução de desbloqueio */}
            {(sensorSupport === 'permission_denied' || permissionError) && (
              <div className="p-4 rounded-2xl bg-[#EF4444]/15 border-2 border-[#EF4444] text-xs text-[#EF4444] space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                  <span>Acesso aos sensores bloqueado no navegador</span>
                </div>
                <p className="text-[#CBD5E1] text-[11px] leading-relaxed">
                  {permissionError || 'O navegador não tem permissão para ler o acelerômetro.'}
                </p>
                <div className="p-2.5 rounded-xl bg-[#0A1128] text-[#CBD5E1] text-[11px] space-y-1">
                  <p className="font-bold text-[#F8FAFC]">Como reverter:</p>
                  <p>
                    • <strong>iPhone / iOS:</strong> Abra Ajustes &gt; Safari &gt; Movimento e
                    Orientação &gt; Permitir.
                  </p>
                  <p>
                    • <strong>Android / Chrome:</strong> Toque no ícone de cadeado na barra de
                    endereço &gt; Permissões &gt; Movimento &gt; Permitir.
                  </p>
                </div>
              </div>
            )}

            {sensorSupport === 'unsupported' && (
              <div className="p-3.5 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-xs text-[#FDE68A] space-y-1">
                <span className="font-bold block">Aviso de Dispositivo:</span>
                <p className="text-[11px] text-[#CBD5E1]">
                  Nenhum sensor de movimento físico detectado. Se estiver em um computador, utilize
                  o smartphone institucional para o teste real.
                </p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="py-3 px-4 rounded-xl text-xs font-semibold text-[#94A3B8] hover:text-white bg-[#101B3A] border border-[#1A2A5A] transition-colors"
              >
                Voltar
              </button>

              <button
                type="button"
                onClick={async () => {
                  // Tenta solicitar permissão no clique do usuário (necessário no iOS)
                  if (typeof (window as any).DeviceMotionEvent?.requestPermission === 'function') {
                    try {
                      await (window as any).DeviceMotionEvent.requestPermission()
                    } catch {
                      /* handled */
                    }
                  }
                  setCurrentStep(3)
                }}
                className="flex-1 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] shadow-lg shadow-[#10B981]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>Confirmar e Selecionar Agente</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            ETAPA 3: SELEÇÃO EXPLÍCITA DO TIPO DE AGENTE + CONFIG MÍNIMA (SEM PRÉ-SELEÇÃO)
           ========================================================================= */}
        {currentStep === 3 && status === 'idle' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <span>Selecione a Categoria do Agente</span>
                </h2>
                <span className="text-[10px] font-mono uppercase bg-[#3B82F6]/20 text-[#60A5FA] px-2 py-0.5 rounded border border-[#3B82F6]/40 font-bold">
                  Seleção Obrigatória
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-1">
                Escolha conscientemente o veículo ou modal utilizado nesta sessão de coleta.
              </p>
            </div>

            {/* Grid de Cards Grandes — SEM PRÉ-SELEÇÃO */}
            <div className="space-y-2 max-h-[46vh] overflow-y-auto pr-1">
              {AGENT_OPTIONS.map((opt) => {
                const Icon = opt.icon
                const isSelected = selectedAgentCode === opt.code
                return (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => {
                      setSelectedAgentCode(opt.code)
                      if (!linhaFrota) {
                        setLinhaFrota(opt.label)
                      }
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 active:scale-[0.99] ${
                      isSelected
                        ? 'bg-[#101B3A] border-2 shadow-lg'
                        : 'bg-[#0A1128] border-[#1A2A5A] hover:border-[#3B82F6]/50'
                    }`}
                    style={{
                      borderColor: isSelected ? opt.color : undefined,
                      boxShadow: isSelected ? `0 10px 25px -5px ${opt.color}33` : undefined,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${opt.color}20`,
                        borderColor: `${opt.color}60`,
                        color: opt.color,
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs sm:text-sm text-white truncate">
                          {opt.label}
                        </span>
                        <span
                          className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border font-semibold shrink-0"
                          style={{
                            backgroundColor: `${opt.color}15`,
                            color: opt.color,
                            borderColor: `${opt.color}40`,
                          }}
                        >
                          {opt.badgeText}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#CBD5E1] font-medium leading-tight mt-0.5">
                        {opt.sublabel}
                      </p>
                      <p className="text-[10px] text-[#94A3B8] leading-relaxed mt-1 line-clamp-2">
                        {opt.description}
                      </p>
                    </div>

                    <div className="shrink-0 self-center">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-white' : 'border-[#475569]'
                        }`}
                        style={{
                          backgroundColor: isSelected ? opt.color : 'transparent',
                        }}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Configuração Mínima de Apoio */}
            <div className="p-3.5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                Configuração Mínima do Trecho
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-[#94A3B8] block mb-1">
                    Via / Logradouro Inicial
                  </label>
                  <input
                    type="text"
                    value={via}
                    onChange={(e) => setVia(e.target.value)}
                    placeholder="Ex: Av. Sete de Setembro"
                    className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-[#64748B] focus:ring-1 focus:ring-[#3B82F6]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#94A3B8] block mb-1">Bairro / Região</label>
                  <input
                    type="text"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    placeholder="Ex: Batel, Centro"
                    className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-[#64748B] focus:ring-1 focus:ring-[#3B82F6]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#94A3B8] block mb-1">
                  Posição do Aparelho (Acoplamento Mecânico)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPhonePosition('painel')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      phonePosition === 'painel'
                        ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-white'
                        : 'bg-[#101B3A] border-[#1A2A5A] text-[#94A3B8]'
                    }`}
                  >
                    <span>Suporte Firme do Painel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhonePosition('bolso_outro')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      phonePosition === 'bolso_outro'
                        ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-white'
                        : 'bg-[#101B3A] border-[#1A2A5A] text-[#94A3B8]'
                    }`}
                  >
                    <span>Bolso / Mochila</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="py-3 px-4 rounded-xl text-xs font-semibold text-[#94A3B8] hover:text-white bg-[#101B3A] border border-[#1A2A5A] transition-colors"
              >
                Voltar
              </button>

              <button
                type="button"
                disabled={!selectedAgentCode}
                onClick={handleStartCollection}
                className="flex-1 py-4 px-4 rounded-xl text-base font-black text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] shadow-xl shadow-[#10B981]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>
                  {selectedAgentCode ? 'Iniciar Coleta em Campo' : 'Escolha um Tipo de Agente'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            ETAPA 4: TELA ATIVA DE COLETA MINIMALISTA (Feita para operar em movimento)
           ========================================================================= */}
        {(status === 'collecting' ||
          status === 'calibrating' ||
          status === 'paused' ||
          status === 'stopped' ||
          currentStep === 4) && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Banner de Auto-Pausa em segundo plano */}
            {(isAutoPaused || isPaused) && (
              <div className="p-3.5 rounded-2xl bg-[#F59E0B]/15 border-2 border-[#F59E0B] text-xs text-[#FDE68A] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Pause className="w-4 h-4 text-[#F59E0B]" />
                    <span>Coleta Pausada (Segundo Plano ou Manual)</span>
                  </div>
                  <span className="text-[10px] font-mono bg-[#F59E0B]/20 text-[#F59E0B] px-1.5 py-0.5 rounded">
                    Dados Seguros
                  </span>
                </div>
                <p className="text-[11px] text-[#CBD5E1]">
                  Navegadores suspendem sensores inerciais fora do foco. A fila offline mantém 100%
                  dos registros seguros.
                </p>
                <button
                  type="button"
                  onClick={resumeSession}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] shadow-md flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Retomar Coleta Agora</span>
                </button>
              </div>
            )}

            {/* Badges de Relance no Topo da Tela Ativa */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Categoria Selecionada */}
              <div className="p-2.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${selectedAgentOption?.color ?? '#3B82F6'}20`,
                    color: selectedAgentOption?.color ?? '#3B82F6',
                  }}
                >
                  {selectedAgentOption ? (
                    <selectedAgentOption.icon className="w-4 h-4" />
                  ) : (
                    <Car className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] text-[#94A3B8] uppercase block font-semibold">
                    Agente
                  </span>
                  <span className="font-bold text-[11px] text-white truncate block">
                    {selectedAgentOption?.label ?? 'Veículo Leve'}
                  </span>
                </div>
              </div>

              {/* Wake Lock Controller */}
              <button
                type="button"
                onClick={toggleWakeLock}
                className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition-all ${
                  isWakeLocked
                    ? 'bg-[#10B981]/15 border-[#10B981]/60 text-[#10B981]'
                    : 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444]'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-black/20 flex items-center justify-center shrink-0">
                  {isWakeLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] uppercase block font-semibold">
                    {isWakeLocked ? 'Tela Acesa' : 'Tela Destravada'}
                  </span>
                  <span className="font-mono text-[11px] font-bold truncate block">
                    {isWakeLocked ? 'WakeLock Ativo' : 'Toque p/ Travar'}
                  </span>
                </div>
              </button>
            </div>

            {/* Mostrador Principal Minimalista (Grandes Números de Relance) */}
            <div className="p-6 rounded-3xl bg-[#0A1128] border-2 border-[#1A2A5A] text-center space-y-4 shadow-2xl">
              {/* Status Header */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isCollecting
                        ? 'bg-[#10B981] animate-ping'
                        : isCalibrating
                          ? 'bg-[#F59E0B] animate-pulse'
                          : isPaused
                            ? 'bg-[#F59E0B]'
                            : 'bg-[#3B82F6]'
                    }`}
                  />
                  <span className="font-mono font-bold uppercase tracking-wider text-[#CBD5E1] text-[11px]">
                    {isCalibrating
                      ? 'Calibrando (3s)...'
                      : isCollecting
                        ? 'Coletando em Movimento'
                        : isPaused
                          ? 'Sessão Pausada'
                          : 'Sessão Finalizada'}
                  </span>
                </div>

                <span className="font-mono text-[11px] text-[#94A3B8]">
                  {samplingRateHz} Hz • FFT Nyquist
                </span>
              </div>

              {/* Cronômetro Central Gigante */}
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#94A3B8] block mb-1">
                  Tempo Decorrido
                </span>
                <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white tabular-nums">
                  {formatTime(elapsedMs)}
                </div>
              </div>

              {/* 3 Métricas Críticas: Distância, Anomalias e Aceleração Z */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1A2A5A]">
                <div className="p-2.5 rounded-xl bg-[#101B3A]">
                  <span className="text-[10px] text-[#94A3B8] block">Distância Est.</span>
                  <span className="font-mono font-bold text-sm text-[#60A5FA]">
                    {estimatedMeters >= 1000
                      ? `${(estimatedMeters / 1000).toFixed(2)} km`
                      : `${estimatedMeters} m`}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#101B3A]">
                  <span className="text-[10px] text-[#94A3B8] block">Anomalias Z</span>
                  <span className="font-mono font-bold text-sm text-[#EF4444]">
                    {anomalies.length}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#101B3A]">
                  <span className="text-[10px] text-[#94A3B8] block">Aceleração Z</span>
                  <span className="font-mono font-bold text-sm text-[#10B981]">
                    {currentZ > 0 ? `+${currentZ.toFixed(1)}` : currentZ.toFixed(1)}g
                  </span>
                </div>
              </div>

              {/* Barra de Status Compacta: Janelas Agregadas + Fila Offline */}
              <div className="flex items-center justify-between text-[11px] font-mono text-[#94A3B8] pt-1">
                <span className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>{processedWindows.length} janelas 100m</span>
                </span>

                <span className="flex items-center gap-1">
                  <CloudUpload className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Fila: {queueStats.totalPending} pend.</span>
                </span>

                <span className="text-[#38BDF8]">IRI: {calculatedIRI} m/km</span>
              </div>
            </div>

            {/* Resumo ao Finalizar Sessão */}
            {status === 'stopped' && sessionSummary && (
              <div className="p-4 rounded-2xl bg-[#101B3A] border-2 border-[#10B981] space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-[#1A2A5A]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                    <h3 className="font-bold text-sm text-white">Sessão Concluída e Gravada</h3>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded border border-[#10B981]/40 font-bold">
                    {sessionSummary.indiceAlvo}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-[#0A1128]">
                    <span className="text-[10px] text-[#94A3B8] block">Distância Total</span>
                    <span className="font-mono font-bold text-sm text-white">
                      {(sessionSummary.distanceMeters / 1000).toFixed(2)} km
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0A1128]">
                    <span className="text-[10px] text-[#94A3B8] block">Pico Vertical</span>
                    <span className="font-mono font-bold text-sm text-[#EF4444]">
                      {sessionSummary.peakG.toFixed(2)}g
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(3)
                      setSelectedAgentCode(null)
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] text-xs font-semibold text-white flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Nova Coleta</span>
                  </button>

                  <Link
                    to="/cockpit"
                    className="flex-1 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-md shadow-[#3B82F6]/20"
                  >
                    <span>Ver no Cockpit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* BOTÕES DE CONTROLE GIGANTES (VERDE / VERMELHO / PAUSAR) */}
            <div className="pt-2 space-y-2">
              {isCollecting && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={pauseSession}
                    className="py-4 px-4 rounded-2xl text-sm font-bold text-white bg-[#F59E0B] hover:bg-[#D97706] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#F59E0B]/20"
                  >
                    <Pause className="w-5 h-5 fill-white" />
                    <span>Pausar</span>
                  </button>

                  <button
                    type="button"
                    onClick={stopSession}
                    className="py-4 px-4 rounded-2xl text-sm font-black text-white bg-[#EF4444] hover:bg-[#DC2626] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#EF4444]/30"
                  >
                    <Square className="w-5 h-5 fill-white" />
                    <span>Encerrar Coleta</span>
                  </button>
                </div>
              )}

              {isPaused && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={resumeSession}
                    className="py-4 px-4 rounded-2xl text-sm font-bold text-white bg-[#10B981] hover:bg-[#059669] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#10B981]/20"
                  >
                    <Play className="w-5 h-5 fill-white" />
                    <span>Retomar</span>
                  </button>

                  <button
                    type="button"
                    onClick={stopSession}
                    className="py-4 px-4 rounded-2xl text-sm font-black text-white bg-[#EF4444] hover:bg-[#DC2626] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#EF4444]/30"
                  >
                    <Square className="w-5 h-5 fill-white" />
                    <span>Encerrar</span>
                  </button>
                </div>
              )}

              {status === 'idle' && (
                <button
                  type="button"
                  onClick={handleStartCollection}
                  className="w-full py-4 px-4 rounded-2xl text-base font-black text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] shadow-xl shadow-[#10B981]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>Iniciar Coleta em Campo</span>
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer Fixo com Informações Institucionais e LGPD */}
      <footer className="bg-[#0A1128]/95 border-t border-[#1A2A5A] px-4 py-2.5 text-center text-[10px] text-[#94A3B8] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Classificação por categoria • Sem identificação de veículos ou condutores</span>
        </div>
        <Link to="/cockpit" className="text-[#3B82F6] hover:underline font-semibold">
          Abrir Cockpit
        </Link>
      </footer>
    </div>
  )
}
