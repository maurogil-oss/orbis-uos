import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Smartphone,
  Play,
  Square,
  Pause,
  RotateCcw,
  ShieldCheck,
  Activity,
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
  Car,
  Bus,
  Bike,
  Footprints,
  UserCheck,
  HelpCircle,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sliders,
  Check,
  AlertCircle,
} from 'lucide-react'
import { useDeviceMotionCollector, PhoneMountPosition } from '@/hooks/useDeviceMotionCollector'
import { AgentTaxonomyCode } from '@/services/roadSegments'
import { VeiculoTipoCalibracao, VEICULO_TIPOS_CONFIG } from '@/services/fatorKCalibration'
import { drainOfflineQueue, getQueueStats } from '@/lib/collectorOfflineDb'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'
import {
  validateRealMotionSensors,
  SensorValidationResult,
  SensorValidationProgress,
  isDevicePreAuthorized,
  saveDeviceAuthorized,
  getStoredCollectorPreferences,
  saveCollectorPreferences,
  isAndroidDevice,
  isInAppBrowser,
} from '@/lib/sensorValidation'

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

// Fluxo de 2 Telas:
// Tela 1: Liberação & Validação Real de Sensores (Contexto LGPD enxuto + Verificação ~2s + Desbloqueio Android/iOS)
// Tela 2: Coleta (Seleção do Tipo de Agente + Iniciar/Monitoramento ativo)
type Screen = 1 | 2

type ValidationStatus = 'idle' | 'validating' | 'passed' | 'blocked' | 'unsupported'

export default function ModoCampo() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Preferências memorizadas neste aparelho
  const initialPrefs = useMemo(() => getStoredCollectorPreferences(), [])
  const isPreAuthorized = useMemo(() => isDevicePreAuthorized(), [])

  // Tela atual: se já pré-autorizado, pula cerimônia de liberação e vai direto para Tela 2
  const [currentScreen, setCurrentScreen] = useState<Screen>(isPreAuthorized ? 2 : 1)

  // Status da validação ativa de sensores
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>(
    isPreAuthorized ? 'passed' : 'idle',
  )
  const [validationProgress, setValidationProgress] = useState<SensorValidationProgress>({
    motionSamplesCount: 0,
    orientationSamplesCount: 0,
    hasAccelerationData: false,
    lastZValue: null,
  })
  const [validationError, setValidationError] = useState<string | null>(null)

  // Mensagem explícita de erro na tela quando "Iniciar Coleta" falha
  const [startCollectionError, setStartCollectionError] = useState<string | null>(null)
  const [isStartingCollection, setIsStartingCollection] = useState<boolean>(false)

  // Seleção de agente (pré-seleciona a última escolha se existir em memória, mas mantém editável)
  const [selectedAgentCode, setSelectedAgentCode] = useState<AgentTaxonomyCode | null>(
    (initialPrefs.lastAgentCode as AgentTaxonomyCode) || null,
  )

  // Campos opcionais discretos
  const [showAdvancedFields, setShowAdvancedFields] = useState<boolean>(false)
  const [via, setVia] = useState(initialPrefs.via || '')
  const [bairro, setBairro] = useState(initialPrefs.bairro || 'Batel')
  const [linhaFrota, setLinhaFrota] = useState(initialPrefs.linhaFrota || '')
  const [phonePosition, setPhonePosition] = useState<PhoneMountPosition>(
    initialPrefs.phonePosition || 'painel',
  )

  // Detecções de ambiente
  const isAndroid = useMemo(() => isAndroidDevice(), [])
  const isAppBrowser = useMemo(() => isInAppBrowser(), [])
  const [showIosAlternative, setShowIosAlternative] = useState<boolean>(!isAndroid)

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

  // Agente selecionado
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
    samplingRateHz,
    currentZ,
    anomalies,
    processedWindows,
    elapsedMs,
    calculatedIRI,
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

  // Função central para executar a validação real de sensores por ~2 segundos
  const handleValidateSensors = useCallback(async () => {
    setValidationStatus('validating')
    setValidationError(null)
    setValidationProgress({
      motionSamplesCount: 0,
      orientationSamplesCount: 0,
      hasAccelerationData: false,
      lastZValue: null,
    })

    // Caso iOS: disparar requestPermission sob clique do usuário antes de iniciar escuta
    if (typeof (window as any).DeviceMotionEvent?.requestPermission === 'function') {
      try {
        const resp = await (window as any).DeviceMotionEvent.requestPermission()
        if (resp !== 'granted') {
          setValidationStatus('blocked')
          setValidationError(
            'Permissão negada no Safari iOS. Abra Ajustes > Safari > Movimento e Orientação > Permitir.',
          )
          return
        }
      } catch (iosErr: any) {
        setValidationStatus('blocked')
        setValidationError(iosErr?.message || 'Falha ao solicitar autorização aos sensores do iOS.')
        return
      }
    }

    // Escuta ativa de eventos por ~2.2 segundos para garantir amostras reais
    const result: SensorValidationResult = await validateRealMotionSensors(2200, 3, (prog) =>
      setValidationProgress(prog),
    )

    if (result.active) {
      setValidationStatus('passed')
      saveDeviceAuthorized(true)
      toast({
        title: 'Sensores Ativos ✓',
        description: `${result.samplesReceived} amostras inerciais validadas. Aparelho liberado!`,
      })
    } else {
      if (result.reason === 'unsupported') {
        setValidationStatus('unsupported')
      } else {
        setValidationStatus('blocked')
      }
      setValidationError(
        result.errorMessage ||
          'Nenhum evento de sensor chegou em 2 segundos. Siga as instruções de desbloqueio abaixo.',
      )
    }
  }, [])

  // Auto-iniciar validação na Tela 1 se não estiver validado e for a primeira visita
  useEffect(() => {
    if (currentScreen === 1 && validationStatus === 'idle') {
      handleValidateSensors()
    }
  }, [currentScreen, validationStatus, handleValidateSensors])

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

  // Iniciar coleta na Tela 2 com tratamento rigoroso de falhas e mensagem explícita
  const handleStartCollection = async () => {
    setStartCollectionError(null)

    if (!selectedAgentCode) {
      setStartCollectionError('Selecione uma categoria de agente antes de iniciar a coleta.')
      toast({
        title: 'Categoria obrigatória',
        description:
          'Selecione o tipo de agente (ex: Veículo Institucional, Ônibus ou Motociclista).',
        variant: 'destructive',
      })
      return
    }

    // Persistir a escolha consciente do agente e preferências
    saveCollectorPreferences({
      lastAgentCode: selectedAgentCode,
      via,
      bairro,
      linhaFrota,
      phonePosition,
    })

    setIsStartingCollection(true)
    try {
      const started = await startSession()
      if (!started) {
        const errorDetail =
          permissionError ||
          'O navegador não conseguiu acessar o acelerômetro. Sensores podem estar silenciados pelo sistema ou sem permissão.'
        setStartCollectionError(errorDetail)
        toast({
          title: 'Falha ao iniciar sensores',
          description: errorDetail,
          variant: 'destructive',
        })
      } else {
        setStartCollectionError(null)
      }
    } catch (err: any) {
      const msg = err?.message || 'Erro inesperado ao iniciar captura inercial.'
      setStartCollectionError(msg)
      toast({
        title: 'Erro na ativação',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setIsStartingCollection(false)
    }
  }

  // Voltar e reliberar sensores
  const handleResetAuthorization = () => {
    saveDeviceAuthorized(false)
    setStartCollectionError(null)
    setValidationStatus('idle')
    setCurrentScreen(1)
  }

  const isCollecting = status === 'collecting'
  const isCalibrating = status === 'calibrating'
  const isPaused = status === 'paused'
  const isSessionActive = isCollecting || isCalibrating || isPaused || status === 'stopped'

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
                PWA
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8] line-clamp-1">
              {isSessionActive
                ? 'Coleta inercial em andamento'
                : currentScreen === 1
                  ? 'Etapa 1/2: Validação de Sensores'
                  : 'Etapa 2/2: Seleção de Agente & Coleta'}
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

      {/* Stepper Enxuto de 2 Telas (visível antes de iniciar a sessão ativa) */}
      {!isSessionActive && (
        <div className="bg-[#0A1128] border-b border-[#1A2A5A] px-4 py-2.5">
          <div className="max-w-md mx-auto flex items-center justify-between text-xs">
            {/* Tela 1: Sensores & Liberação */}
            <button
              type="button"
              onClick={() => setCurrentScreen(1)}
              className={`flex items-center gap-2 transition-colors ${
                currentScreen === 1
                  ? 'text-[#3B82F6] font-bold'
                  : validationStatus === 'passed'
                    ? 'text-[#10B981]'
                    : 'text-[#94A3B8]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                  currentScreen === 1
                    ? 'bg-[#3B82F6] text-white ring-2 ring-[#3B82F6]/30'
                    : validationStatus === 'passed'
                      ? 'bg-[#10B981] text-white'
                      : 'bg-[#1E293B] text-[#94A3B8]'
                }`}
              >
                {validationStatus === 'passed' ? '✓' : '1'}
              </span>
              <span>1. Sensores & LGPD</span>
            </button>

            <div className="h-0.5 flex-1 mx-3 bg-[#1A2A5A] relative">
              <div
                className={`h-full transition-all duration-300 ${
                  currentScreen === 2 || validationStatus === 'passed'
                    ? 'bg-[#10B981] w-full'
                    : 'bg-transparent w-0'
                }`}
              />
            </div>

            {/* Tela 2: Agente & Coleta */}
            <button
              type="button"
              onClick={() => {
                if (validationStatus === 'passed') {
                  setCurrentScreen(2)
                } else {
                  toast({
                    title: 'Valide os sensores primeiro',
                    description: 'Aguarde a verificação de movimento para prosseguir.',
                  })
                }
              }}
              className={`flex items-center gap-2 transition-colors ${
                currentScreen === 2
                  ? 'text-[#3B82F6] font-bold'
                  : validationStatus === 'passed'
                    ? 'text-[#94A3B8] hover:text-white'
                    : 'text-[#475569] cursor-not-allowed'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                  currentScreen === 2
                    ? 'bg-[#3B82F6] text-white ring-2 ring-[#3B82F6]/30'
                    : 'bg-[#1E293B] text-[#94A3B8]'
                }`}
              >
                2
              </span>
              <span>2. Agente & Coleta</span>
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo Principal — Mobile First */}
      <main className="flex-1 max-w-lg w-full mx-auto p-4 sm:p-5 flex flex-col justify-center">
        {/* =========================================================================
            TELA 1: LIBERAÇÃO & VALIDAÇÃO REAL DE SENSORES (Android primário, iOS secundário)
           ========================================================================= */}
        {currentScreen === 1 && !isSessionActive && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Header com ícone e contexto LGPD enxuto */}
            <div className="text-center space-y-1.5">
              <div
                className={`w-14 h-14 mx-auto rounded-2xl border flex items-center justify-center transition-all ${
                  validationStatus === 'passed'
                    ? 'bg-[#10B981]/15 border-[#10B981]/50 text-[#10B981] shadow-lg shadow-[#10B981]/20'
                    : validationStatus === 'validating'
                      ? 'bg-[#3B82F6]/15 border-[#3B82F6]/50 text-[#3B82F6] animate-pulse'
                      : validationStatus === 'blocked'
                        ? 'bg-[#EF4444]/15 border-[#EF4444]/50 text-[#EF4444]'
                        : 'bg-[#3B82F6]/15 border-[#3B82F6]/40 text-[#3B82F6]'
                }`}
              >
                {validationStatus === 'passed' ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : validationStatus === 'validating' ? (
                  <Radio className="w-7 h-7 animate-spin" />
                ) : validationStatus === 'blocked' ? (
                  <AlertTriangle className="w-7 h-7" />
                ) : (
                  <Smartphone className="w-7 h-7" />
                )}
              </div>

              <h1 className="text-xl font-black text-white">
                {validationStatus === 'passed'
                  ? 'Sensores Validados com Sucesso'
                  : validationStatus === 'validating'
                    ? 'Verificando sensores inerciais...'
                    : validationStatus === 'blocked'
                      ? 'Acesso aos Sensores Bloqueado'
                      : 'Liberação de Sensores de Campo'}
              </h1>

              <p className="text-xs text-[#94A3B8] max-w-sm mx-auto leading-relaxed">
                {validationStatus === 'validating'
                  ? 'Movimente levemente o aparelho por ~2 segundos para confirmar a chegada de amostras reais.'
                  : 'Sonda inercial veicular acoplada ao Motor ORBIS DSP para auditoria do pavimento.'}
              </p>
            </div>

            {/* Aviso especial de WebView / In-App browser (WhatsApp / Instagram) */}
            {isAppBrowser && (
              <div className="p-3 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/50 text-xs text-[#FDE68A] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#F59E0B] mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-white">Navegador interno detectado</p>
                  <p className="text-[11px] text-[#CBD5E1]">
                    Navegadores de redes sociais (WhatsApp/Instagram) bloqueiam os sensores de
                    movimento. Toque nos <strong>três pontos (⋮)</strong> e selecione{' '}
                    <strong>"Abrir no Chrome"</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Card de Status da Verificação em Tempo Real */}
            <div className="p-4 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#1A2A5A]">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#3B82F6]" />
                  <span className="text-xs font-bold text-white">
                    Verificação Ativa de Movimento
                  </span>
                </div>
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                    validationStatus === 'passed'
                      ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                      : validationStatus === 'validating'
                        ? 'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/40 animate-pulse'
                        : validationStatus === 'blocked'
                          ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40'
                          : 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                  }`}
                >
                  {validationStatus === 'passed' && <Check className="w-3 h-3" />}
                  {validationStatus === 'passed'
                    ? 'Sensores ativos ✓'
                    : validationStatus === 'validating'
                      ? 'Verificando...'
                      : validationStatus === 'blocked'
                        ? 'Sensores bloqueados'
                        : 'Aguardando teste'}
                </span>
              </div>

              {/* Métricas da validação em tempo real */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#101B3A]">
                  <span className="text-[10px] text-[#94A3B8] block">Amostras de Movimento</span>
                  <span className="font-mono font-bold text-sm text-white">
                    {validationProgress.motionSamplesCount} recebidas
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#101B3A]">
                  <span className="text-[10px] text-[#94A3B8] block">Leitura Dinâmica Z</span>
                  <span className="font-mono font-bold text-sm text-[#10B981]">
                    {validationProgress.lastZValue !== null
                      ? `${validationProgress.lastZValue.toFixed(2)} m/s²`
                      : '—'}
                  </span>
                </div>
              </div>

              {/* Botão de Repetir Verificação */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#94A3B8]">
                  Validação contínua com amostras reais
                </span>
                <button
                  type="button"
                  onClick={handleValidateSensors}
                  disabled={validationStatus === 'validating'}
                  className="text-xs text-[#38BDF8] hover:text-white flex items-center gap-1 font-semibold px-2 py-1 rounded bg-[#101B3A] border border-[#1A2A5A] disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-3 h-3 ${validationStatus === 'validating' ? 'animate-spin' : ''}`}
                  />
                  <span>Testar novamente</span>
                </button>
              </div>
            </div>

            {/* Contexto LGPD Enxuto */}
            <div className="p-3 rounded-xl bg-[#0A1128]/70 border border-[#1A2A5A] text-[11px] text-[#94A3B8] space-y-1">
              <div className="flex items-center gap-1.5 text-white font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Privacidade & LGPD</span>
              </div>
              <p className="leading-relaxed">
                Coleta exclusivamente aceleração vertical Z e giroscópio acoplado. Câmeras
                desligadas, sem registro de placas ou condutores.
              </p>
            </div>

            {/* =========================================================================
                INSTRUÇÕES DE DESBLOQUEIO ANDROID EM DESTAQUE (usuário principal Android)
               ========================================================================= */}
            {validationStatus === 'blocked' && (
              <div className="p-4 rounded-2xl bg-[#EF4444]/10 border-2 border-[#EF4444]/60 text-xs space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-white">
                  <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0" />
                  <span>Como desbloquear no Android / Chrome:</span>
                </div>

                <div className="space-y-2 text-[#CBD5E1] text-[11px] leading-relaxed">
                  <div className="flex items-start gap-2 bg-[#0A1128] p-2 rounded-lg border border-[#1A2A5A]">
                    <span className="font-bold text-[#38BDF8] shrink-0">1.</span>
                    <span>
                      Abra diretamente no <strong>Google Chrome</strong> (evite navegadores internos
                      de WhatsApp ou e-mail).
                    </span>
                  </div>

                  <div className="flex items-start gap-2 bg-[#0A1128] p-2 rounded-lg border border-[#1A2A5A]">
                    <span className="font-bold text-[#38BDF8] shrink-0">2.</span>
                    <span>
                      Toque no <strong>ícone de cadeado / configurações</strong> na barra de
                      endereço (ao lado de <em>orbis-uos.com.br</em>).
                    </span>
                  </div>

                  <div className="flex items-start gap-2 bg-[#0A1128] p-2 rounded-lg border border-[#1A2A5A]">
                    <span className="font-bold text-[#38BDF8] shrink-0">3.</span>
                    <span>
                      Acesse <strong>Permissões &gt; Movimento / Sensores</strong> e selecione{' '}
                      <strong className="text-[#10B981]">Permitir</strong>.
                    </span>
                  </div>

                  <div className="flex items-start gap-2 bg-[#0A1128] p-2 rounded-lg border border-[#1A2A5A]">
                    <span className="font-bold text-[#38BDF8] shrink-0">4.</span>
                    <span>
                      Desative o modo <strong>Economia de Bateria</strong> do Android, que pode
                      suspender o acelerômetro em segundo plano.
                    </span>
                  </div>
                </div>

                {/* Instruções iOS como alternativa secundária colapsável */}
                <div className="pt-2 border-t border-[#1A2A5A]">
                  <button
                    type="button"
                    onClick={() => setShowIosAlternative(!showIosAlternative)}
                    className="text-[11px] text-[#94A3B8] hover:text-white flex items-center justify-between w-full font-medium"
                  >
                    <span>Está usando iPhone (iOS / Safari)?</span>
                    {showIosAlternative ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {showIosAlternative && (
                    <div className="mt-2 p-2.5 rounded-lg bg-[#0A1128] text-[11px] text-[#CBD5E1] space-y-1">
                      <p className="font-bold text-white">No Safari iOS:</p>
                      <p>
                        Abra <strong>Ajustes &gt; Safari &gt; Movimento e Orientação</strong> e
                        ative a opção. Em seguida, recarregue esta página e toque em "Testar
                        novamente".
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Aviso quando sensores não são detectados (desktop/ambiente incompatível) */}
            {validationStatus === 'unsupported' && (
              <div className="p-3.5 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-xs text-[#FDE68A] space-y-1">
                <span className="font-bold block">Dispositivo sem sensores inerciais físicos:</span>
                <p className="text-[11px] text-[#CBD5E1]">
                  Para coleta real, acesse esta rota diretamente pelo smartphone institucional
                  (Android/Chrome).
                </p>
              </div>
            )}

            {/* Botão de Avanço: Habilitado apenas quando a validação ativa passar */}
            <div className="pt-2">
              <button
                type="button"
                disabled={validationStatus !== 'passed'}
                onClick={() => {
                  saveDeviceAuthorized(true)
                  setCurrentScreen(2)
                }}
                className="w-full py-4 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] shadow-lg shadow-[#10B981]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Avançar para Seleção de Agente & Coleta</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {validationStatus !== 'passed' && (
                <p className="text-[11px] text-[#94A3B8] text-center mt-2">
                  O avanço só é liberado após a validação real de eventos inerciais por ~2s.
                </p>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TELA 2: COLETA & MONITORAMENTO ATIVO
            (Seleção consciente do agente + Iniciar Coleta + Monitoramento)
           ========================================================================= */}
        {currentScreen === 2 && !isSessionActive && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Header da Tela 2 */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-black text-white flex items-center gap-2">
                  <span>Categoria do Agente de Campo</span>
                </h1>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Identificação técnica institucional para calibração do Motor ORBIS DSP.
                </p>
              </div>

              {/* Botão para rever autorização de sensores se necessário */}
              <button
                type="button"
                onClick={handleResetAuthorization}
                className="text-[10px] text-[#94A3B8] hover:text-white px-2 py-1 rounded bg-[#101B3A] border border-[#1A2A5A] flex items-center gap-1 font-mono shrink-0"
                title="Rever liberação dos sensores"
              >
                <Check className="w-3 h-3 text-[#10B981]" />
                <span>Sensores ✓</span>
              </button>
            </div>

            {/* MENSAGEM CLARA DE ERRO SE "INICIAR COLETA" FALHAR */}
            {startCollectionError && (
              <div className="p-3.5 rounded-2xl bg-[#EF4444]/15 border-2 border-[#EF4444] text-xs text-[#EF4444] space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-white">
                  <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0" />
                  <span>Falha ao Iniciar Coleta</span>
                </div>
                <p className="text-[#CBD5E1] text-[11px] leading-relaxed">{startCollectionError}</p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleResetAuthorization}
                    className="py-1.5 px-3 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-bold transition-colors"
                  >
                    Voltar e liberar sensores
                  </button>
                  <button
                    type="button"
                    onClick={handleStartCollection}
                    className="py-1.5 px-3 rounded-lg bg-[#0A1128] border border-[#EF4444]/60 text-white text-xs font-semibold hover:bg-[#101B3A]"
                  >
                    Tentar novamente
                  </button>
                </div>
              </div>
            )}

            {/* Card com a categoria memorizada (atalho de 1 toque para quem já tem preferência) */}
            {selectedAgentOption && (
              <div className="p-3 rounded-xl bg-[#101B3A] border border-[#3B82F6]/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${selectedAgentOption.color}20`,
                      color: selectedAgentOption.color,
                    }}
                  >
                    <selectedAgentOption.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-[#94A3B8] block uppercase font-mono">
                      Selecionado (memorizado no aparelho)
                    </span>
                    <span className="text-xs font-bold text-white truncate block">
                      {selectedAgentOption.label}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#10B981] font-bold bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/30">
                  Pronto
                </span>
              </div>
            )}

            {/* Grid de Cards de Seleção Consciente (Requisito de Proveniência do Produto) */}
            <div className="space-y-2 max-h-[38vh] overflow-y-auto pr-1">
              {AGENT_OPTIONS.map((opt) => {
                const Icon = opt.icon
                const isSelected = selectedAgentCode === opt.code
                return (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => {
                      setSelectedAgentCode(opt.code)
                      setStartCollectionError(null)
                      if (!linhaFrota) {
                        setLinhaFrota(opt.label)
                      }
                      saveCollectorPreferences({ lastAgentCode: opt.code })
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3 active:scale-[0.99] ${
                      isSelected
                        ? 'bg-[#101B3A] border-2 shadow-lg'
                        : 'bg-[#0A1128] border-[#1A2A5A] hover:border-[#3B82F6]/50'
                    }`}
                    style={{
                      borderColor: isSelected ? opt.color : undefined,
                      boxShadow: isSelected ? `0 8px 20px -4px ${opt.color}33` : undefined,
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${opt.color}20`,
                        borderColor: `${opt.color}60`,
                        color: opt.color,
                      }}
                    >
                      <Icon className="w-4 h-4" />
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
                      <p className="text-[10px] text-[#94A3B8] leading-relaxed mt-1 line-clamp-1">
                        {opt.description}
                      </p>
                    </div>

                    <div className="shrink-0 self-center">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-white' : 'border-[#475569]'
                        }`}
                        style={{
                          backgroundColor: isSelected ? opt.color : 'transparent',
                        }}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Campos Opcionais Discretos (Via, Bairro, Acoplamento Mecânico) */}
            <div className="rounded-xl border border-[#1A2A5A] bg-[#0A1128]/80 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAdvancedFields(!showAdvancedFields)}
                className="w-full p-2.5 text-xs text-[#94A3B8] hover:text-white flex items-center justify-between transition-colors font-medium"
              >
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>Campos Opcionais do Trecho (Via, Bairro e Posição)</span>
                </div>
                {showAdvancedFields ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {showAdvancedFields && (
                <div className="p-3 border-t border-[#1A2A5A] space-y-2.5 animate-in fade-in-0 duration-150">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-[#94A3B8] block mb-1">
                        Via / Logradouro (Opcional)
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
                      <label className="text-[10px] text-[#94A3B8] block mb-1">
                        Bairro / Região
                      </label>
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
                        className={`py-1.5 px-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          phonePosition === 'painel'
                            ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-white'
                            : 'bg-[#101B3A] border-[#1A2A5A] text-[#94A3B8]'
                        }`}
                      >
                        <span>Suporte do Painel</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhonePosition('bolso_outro')}
                        className={`py-1.5 px-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
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
              )}
            </div>

            {/* BOTÃO PRINCIPAL DE INÍCIO — 1 TOQUE PARA QUEM JÁ TEM O AGENTE SELECIONADO */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                disabled={!selectedAgentCode || isStartingCollection}
                onClick={handleStartCollection}
                className="w-full py-4 px-4 rounded-2xl text-base font-black text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] shadow-xl shadow-[#10B981]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>
                  {isStartingCollection
                    ? 'Iniciando sensores...'
                    : selectedAgentCode
                      ? 'Iniciar Coleta em Campo'
                      : 'Selecione uma Categoria'}
                </span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-[#94A3B8] px-1">
                <span>Wake Lock automático (tela acesa)</span>
                <button
                  type="button"
                  onClick={handleResetAuthorization}
                  className="hover:text-white underline underline-offset-2"
                >
                  Voltar para tela 1
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TELA ATIVA DE COLETA MINIMALISTA (Operação em movimento)
           ========================================================================= */}
        {isSessionActive && (
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
                  {samplingRateHz} Hz • Motor ORBIS DSP
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
                      setCurrentScreen(2)
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

              {status === 'stopped' && (
                <button
                  type="button"
                  onClick={handleStartCollection}
                  className="w-full py-4 px-4 rounded-2xl text-base font-black text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] shadow-xl shadow-[#10B981]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>Iniciar Nova Coleta</span>
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
