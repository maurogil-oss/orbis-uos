import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
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
  Sliders,
  Check,
  AlertCircle,
  Sparkles,
  Settings,
  ChevronDown,
  ChevronUp,
  X,
  Gauge,
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

type ValidationStatus = 'idle' | 'validating' | 'passed' | 'blocked' | 'unsupported'

export default function ModoCampo() {
  const { user } = useAuth()

  // Preferências memorizadas no aparelho
  const initialPrefs = useMemo(() => getStoredCollectorPreferences(), [])
  const [deviceAuthorized, setDeviceAuthorized] = useState<boolean>(() => isDevicePreAuthorized())

  // Modo Expresso: se o aparelho já foi liberado alguma vez, abre direto na tela única expressa
  const isExpressoMode = deviceAuthorized

  // Estado de desbloqueio forçado (quando validação em background falhar com aparelho já liberado)
  const [showUnlockScreen, setShowUnlockScreen] = useState<boolean>(false)

  // Status da validação de sensores
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle')
  const [validationProgress, setValidationProgress] = useState<SensorValidationProgress>({
    motionSamplesCount: 0,
    orientationSamplesCount: 0,
    hasAccelerationData: false,
    lastZValue: null,
  })
  const [validationError, setValidationError] = useState<string | null>(null)

  // Erro explícito ao iniciar coleta
  const [startCollectionError, setStartCollectionError] = useState<string | null>(null)
  const [isStartingCollection, setIsStartingCollection] = useState<boolean>(false)

  // Seleção de agente memorizada (padrão: última categoria utilizada ou VEICULO_FROTA)
  const [selectedAgentCode, setSelectedAgentCode] = useState<AgentTaxonomyCode>(() => {
    return (initialPrefs.lastAgentCode as AgentTaxonomyCode) || 'VEICULO_FROTA'
  })

  // Seletor rápido de agente (modal / drawer de 1 toque)
  const [isAgentSelectorOpen, setIsAgentSelectorOpen] = useState<boolean>(false)

  // Configuração rápida da posição do aparelho (memorizada, sem pedir no fluxo diário)
  const [phonePosition, setPhonePosition] = useState<PhoneMountPosition>(
    initialPrefs.phonePosition || 'painel',
  )
  const [showConfigDrawer, setShowConfigDrawer] = useState<boolean>(false)

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
    () => AGENT_OPTIONS.find((a) => a.code === selectedAgentCode) || AGENT_OPTIONS[0],
    [selectedAgentCode],
  )

  const canonicoTipo: VeiculoTipoCalibracao = selectedAgentOption.canonicalType
  const veiculoAtualConfig = VEICULO_TIPOS_CONFIG[canonicoTipo] || VEICULO_TIPOS_CONFIG.viatura

  // Sensor hook — via e bairro saíram do fluxo de início: preenchimento automático pelo GPS ou padrão
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
    via: 'Via Coletada (Modo Expresso)',
    bairro: 'Curitiba',
    linhaFrota: selectedAgentOption.label,
    veiculoTipo: selectedAgentOption.label,
    veiculoTipoCanonico: canonicoTipo,
    modoColeta: veiculoAtualConfig.modoCategoria,
    indiceAlvo: veiculoAtualConfig.indiceAlvo,
    agentCode: selectedAgentCode,
    phonePosition,
    codigoIbge: '4106902',
    operadorNome: user?.name || user?.email || 'Operador de Campo (Modo Expresso)',
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

  // Validação central de sensores
  // Quando em Modo Expresso (aparelho já liberado), roda em SEGUNDO PLANO silenciosamente.
  // Só exibe a tela de desbloqueio se falhar.
  const executeSensorValidation = useCallback(async (isSilentBackground: boolean = false) => {
    setValidationStatus('validating')
    setValidationError(null)

    // Caso iOS: DeviceMotionEvent.requestPermission só pode ser acionado por clique
    // Se for validação silenciosa no boot do iOS sem clique, prossegue sem forçar requestPermission
    if (
      !isSilentBackground &&
      typeof (window as any).DeviceMotionEvent?.requestPermission === 'function'
    ) {
      try {
        const resp = await (window as any).DeviceMotionEvent.requestPermission()
        if (resp !== 'granted') {
          setValidationStatus('blocked')
          setValidationError(
            'Permissão negada no Safari iOS. Ajustes > Safari > Movimento e Orientação > Permitir.',
          )
          setShowUnlockScreen(true)
          return false
        }
      } catch (iosErr: any) {
        setValidationStatus('blocked')
        setValidationError(iosErr?.message || 'Falha ao solicitar autorização aos sensores do iOS.')
        setShowUnlockScreen(true)
        return false
      }
    }

    const result: SensorValidationResult = await validateRealMotionSensors(2000, 3, (prog) => {
      setValidationProgress(prog)
    })

    if (result.active) {
      setValidationStatus('passed')
      saveDeviceAuthorized(true)
      setDeviceAuthorized(true)
      setShowUnlockScreen(false)
      if (!isSilentBackground) {
        toast({
          title: 'Sensores Ativos ✓',
          description: `${result.samplesReceived} amostras inerciais validadas. Aparelho pronto!`,
        })
      }
      return true
    } else {
      if (result.reason === 'unsupported') {
        setValidationStatus('unsupported')
      } else {
        setValidationStatus('blocked')
      }
      const errorMsg =
        result.errorMessage ||
        'Nenhum evento inercial detectado em 2s. Sensores podem estar silenciados pelo sistema ou sem permissão.'
      setValidationError(errorMsg)
      // Se falhou, aí sim mostramos a tela/instrução de desbloqueio
      setShowUnlockScreen(true)
      return false
    }
  }, [])

  // Efeito de inicialização:
  // Se aparelho liberado -> validação silenciosa em segundo plano (~2s)
  // Se primeira vez (não liberado) -> validação interativa imediata
  useEffect(() => {
    if (deviceAuthorized) {
      executeSensorValidation(true)
    } else {
      executeSensorValidation(false)
    }
  }, [deviceAuthorized, executeSensorValidation])

  // Troca rápida de categoria de agente em 1 toque
  const handleSelectAgent = (code: AgentTaxonomyCode) => {
    setSelectedAgentCode(code)
    saveCollectorPreferences({ lastAgentCode: code })
    setIsAgentSelectorOpen(false)
    setStartCollectionError(null)
    toast({
      title: 'Agente Atualizado',
      description: `Categoria definida como ${AGENT_OPTIONS.find((a) => a.code === code)?.label}.`,
    })
  }

  // Alteração e memorização definitiva da posição do aparelho
  const handleUpdatePosition = (pos: PhoneMountPosition) => {
    setPhonePosition(pos)
    saveCollectorPreferences({ phonePosition: pos })
    toast({
      title: 'Posição memorizada',
      description:
        pos === 'painel'
          ? 'Posição definida: Suporte do Painel (Acoplamento Direto).'
          : 'Posição definida: Bolso / Mochila (Filtro Biomecânico Ativo).',
    })
  }

  // Sincronizar fila offline manualmente
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

  // Iniciar Coleta em 1 Toque (Botão Gigante)
  const handleStartCollection = async () => {
    setStartCollectionError(null)
    setIsStartingCollection(true)

    // Se estiver em estado blocked ou unsupported, tentar revalidar
    if (validationStatus === 'blocked' || validationStatus === 'unsupported') {
      const ok = await executeSensorValidation(false)
      if (!ok) {
        setIsStartingCollection(false)
        return
      }
    }

    try {
      // Se no iOS precisa de permissão e ainda não passou
      if (typeof (window as any).DeviceMotionEvent?.requestPermission === 'function') {
        try {
          const resp = await (window as any).DeviceMotionEvent.requestPermission()
          if (resp !== 'granted') {
            setStartCollectionError('Acesso aos sensores negado no iOS. Abra Ajustes > Safari.')
            setShowUnlockScreen(true)
            setIsStartingCollection(false)
            return
          }
        } catch {
          // ignore
        }
      }

      // Salvar preferências mais recentes antes de rodar
      saveCollectorPreferences({
        lastAgentCode: selectedAgentCode,
        phonePosition,
      })
      saveDeviceAuthorized(true)
      setDeviceAuthorized(true)

      const started = await startSession()
      if (!started) {
        const errorDetail =
          permissionError ||
          'O navegador não conseguiu acessar os sensores de movimento. Siga o passo a passo de desbloqueio.'
        setStartCollectionError(errorDetail)
        setShowUnlockScreen(true)
      } else {
        setStartCollectionError(null)
        setShowUnlockScreen(false)
      }
    } catch (err: any) {
      const msg = err?.message || 'Erro inesperado ao iniciar captura inercial.'
      setStartCollectionError(msg)
      setShowUnlockScreen(true)
    } finally {
      setIsStartingCollection(false)
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

  const isCollecting = status === 'collecting'
  const isCalibrating = status === 'calibrating'
  const isPaused = status === 'paused'
  const isSessionActive = isCollecting || isCalibrating || isPaused || status === 'stopped'

  // Componente de Instruções de Desbloqueio (Chrome Android caminho real descoberto pelo usuário)
  const renderUnlockInstructions = () => (
    <div className="p-4 rounded-2xl bg-[#EF4444]/10 border-2 border-[#EF4444]/60 text-xs space-y-3 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-white">
          <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0" />
          <span>Desbloquear Sensores no Google Chrome Android</span>
        </div>
        {deviceAuthorized && (
          <button
            type="button"
            onClick={() => setShowUnlockScreen(false)}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-black/20"
            title="Fechar instruções"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-2 text-[#CBD5E1] text-[11px] leading-relaxed">
        <div className="flex items-start gap-2 bg-[#0A1128] p-2.5 rounded-lg border border-[#1A2A5A]">
          <span className="font-bold text-[#38BDF8] shrink-0">1.</span>
          <span>
            Abra diretamente no <strong>Google Chrome</strong> (fora do WhatsApp/Instagram).
          </span>
        </div>

        <div className="flex items-start gap-2 bg-[#0A1128] p-2.5 rounded-lg border border-[#1A2A5A]">
          <span className="font-bold text-[#38BDF8] shrink-0">2.</span>
          <div>
            <span>No canto superior direito do Chrome, toque nos </span>
            <strong className="text-white bg-[#101B3A] px-1.5 py-0.5 rounded border border-[#3B82F6]/40 font-mono">
              três pontos (⋮)
            </strong>
            <span> → </span>
            <strong className="text-white">Configurações</strong>.
          </div>
        </div>

        <div className="flex items-start gap-2 bg-[#0A1128] p-2.5 rounded-lg border border-[#1A2A5A]">
          <span className="font-bold text-[#38BDF8] shrink-0">3.</span>
          <div>
            <span>Toque em </span>
            <strong className="text-white">Configurações do site</strong>
            <span> → </span>
            <strong className="text-[#10B981]">Sensores de movimento</strong>
            <span> e marque </span>
            <strong className="text-[#10B981]">Permitir</strong>.
          </div>
        </div>

        <div className="flex items-start gap-2 bg-[#0A1128] p-2.5 rounded-lg border border-[#1A2A5A]">
          <span className="font-bold text-[#38BDF8] shrink-0">4.</span>
          <span>
            Desative a <strong>Economia de Bateria</strong> do Android para evitar suspensão do
            acelerômetro.
          </span>
        </div>
      </div>

      {/* Safari / iPhone alternativa secundária colapsável */}
      <div className="pt-2 border-t border-[#1A2A5A]">
        <button
          type="button"
          onClick={() => setShowIosAlternative(!showIosAlternative)}
          className="text-[11px] text-[#94A3B8] hover:text-white flex items-center justify-between w-full font-medium"
        >
          <span>Instruções para iPhone (iOS / Safari)</span>
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
              Abra <strong>Ajustes &gt; Safari &gt; Movimento e Orientação</strong> e ative a opção.
              Recarregue a página e toque no botão abaixo para testar.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => executeSensorValidation(false)}
          disabled={validationStatus === 'validating'}
          className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#10B981]/20"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${validationStatus === 'validating' ? 'animate-spin' : ''}`}
          />
          <span>
            {validationStatus === 'validating' ? 'Testando sensores...' : 'Testar Sensores Agora'}
          </span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#070D1F] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#3B82F6]/30">
      {/* Top Bar Minimalista Mobile */}
      <header className="sticky top-0 z-40 bg-[#0A1128]/95 backdrop-blur-md border-b border-[#1A2A5A] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Link
            to="/cockpit"
            className="p-1.5 -ml-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#101B3A] transition-colors"
            aria-label="Voltar ao Cockpit"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm tracking-tight text-white">ORBIS Campo</span>
              <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                Expresso
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8] line-clamp-1">
              {isSessionActive
                ? 'Coleta inercial em andamento'
                : 'Tela única • Zero-touch do condutor'}
            </p>
          </div>
        </div>

        {/* Status de Rede, Fila e Configurações */}
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
              <span>{queueStats.totalPending}</span>
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

          {!isSessionActive && (
            <button
              type="button"
              onClick={() => setShowConfigDrawer(!showConfigDrawer)}
              className="p-1.5 rounded-lg bg-[#101B3A] border border-[#1A2A5A] text-[#94A3B8] hover:text-white transition-colors"
              title="Preferências do Aparelho"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Conteúdo Principal — Mobile First Tela Única */}
      <main className="flex-1 max-w-lg w-full mx-auto p-4 sm:p-5 flex flex-col justify-center">
        {/* Aviso de WebView / In-App browser (WhatsApp / Instagram) */}
        {isAppBrowser && !isSessionActive && (
          <div className="mb-3 p-3 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/50 text-xs text-[#FDE68A] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#F59E0B] mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-white">Navegador interno detectado</p>
              <p className="text-[11px] text-[#CBD5E1]">
                Navegadores de redes sociais bloqueiam sensores. Toque em <strong>⋮</strong> e
                selecione <strong>"Abrir no Chrome"</strong>.
              </p>
            </div>
          </div>
        )}

        {/* =========================================================================
            CENÁRIO A: APARELHO NÃO LIBERADO (PRIMEIRA VEZ)
            Mantém o fluxo explicativo inicial até salvar como liberado
           ========================================================================= */}
        {!isExpressoMode && !isSessionActive && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header de Primeiro Acesso */}
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
                  <Gauge className="w-7 h-7" />
                )}
              </div>

              <h1 className="text-xl font-black text-white">
                {validationStatus === 'passed'
                  ? 'Aparelho Pronto para Campo'
                  : validationStatus === 'validating'
                    ? 'Verificando sensores inerciais...'
                    : validationStatus === 'blocked'
                      ? 'Sensores de Movimento Bloqueados'
                      : 'Primeira Configuração do Aparelho'}
              </h1>

              <p className="text-xs text-[#94A3B8] max-w-sm mx-auto leading-relaxed">
                Após esta liberação inicial, as próximas coletas abrirão diretamente no{' '}
                <strong className="text-white">Modo Expresso de 1 toque</strong>.
              </p>
            </div>

            {/* Verificação ativa de sensores */}
            <div className="p-4 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#1A2A5A]">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#3B82F6]" />
                  <span className="text-xs font-bold text-white">Validação de Sensores</span>
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
                      ? 'Validando...'
                      : validationStatus === 'blocked'
                        ? 'Bloqueado'
                        : 'Aguardando'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#101B3A]">
                  <span className="text-[10px] text-[#94A3B8] block">Amostras</span>
                  <span className="font-mono font-bold text-sm text-white">
                    {validationProgress.motionSamplesCount} recebidas
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#101B3A]">
                  <span className="text-[10px] text-[#94A3B8] block">Aceleração Z</span>
                  <span className="font-mono font-bold text-sm text-[#10B981]">
                    {validationProgress.lastZValue !== null
                      ? `${validationProgress.lastZValue.toFixed(2)} m/s²`
                      : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Instruções de desbloqueio quando bloqueado */}
            {validationStatus === 'blocked' && renderUnlockInstructions()}

            {/* Seleção do Agente Inicial */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white flex items-center justify-between">
                <span>Categoria de Agente Padrão deste Aparelho:</span>
                <span className="text-[10px] text-[#94A3B8] font-normal">Fator K auditável</span>
              </label>

              <div className="grid grid-cols-1 gap-2 max-h-[32vh] overflow-y-auto pr-1">
                {AGENT_OPTIONS.map((opt) => {
                  const Icon = opt.icon
                  const isSelected = selectedAgentCode === opt.code
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => setSelectedAgentCode(opt.code)}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-[#101B3A] border-2 shadow-lg'
                          : 'bg-[#0A1128] border-[#1A2A5A] hover:border-[#3B82F6]/50'
                      }`}
                      style={{
                        borderColor: isSelected ? opt.color : undefined,
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${opt.color}20`,
                          borderColor: `${opt.color}60`,
                          color: opt.color,
                        }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-xs text-white truncate block">
                          {opt.label}
                        </span>
                        <p className="text-[10px] text-[#94A3B8] leading-tight line-clamp-1 mt-0.5">
                          {opt.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0 self-center"
                          style={{ backgroundColor: opt.color }}
                        >
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Posição do Aparelho Inicial */}
            <div className="p-3 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-1.5">
              <label className="text-xs font-bold text-white block">
                Posição habitual do aparelho no veículo:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleUpdatePosition('painel')}
                  className={`py-2 px-2.5 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    phonePosition === 'painel'
                      ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-white'
                      : 'bg-[#101B3A] border-[#1A2A5A] text-[#94A3B8]'
                  }`}
                >
                  <span>Suporte do Painel</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdatePosition('bolso_outro')}
                  className={`py-2 px-2.5 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    phonePosition === 'bolso_outro'
                      ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-white'
                      : 'bg-[#101B3A] border-[#1A2A5A] text-[#94A3B8]'
                  }`}
                >
                  <span>Bolso / Mochila</span>
                </button>
              </div>
            </div>

            {/* Botão de Finalização da Primeira Configuração */}
            <button
              type="button"
              disabled={validationStatus !== 'passed'}
              onClick={() => {
                saveCollectorPreferences({
                  lastAgentCode: selectedAgentCode,
                  phonePosition,
                })
                saveDeviceAuthorized(true)
                setDeviceAuthorized(true)
                toast({
                  title: 'Modo Expresso Ativado!',
                  description:
                    'Este aparelho foi memorizado. A partir de agora você abre direto na tela única.',
                })
              }}
              className="w-full py-4 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] shadow-lg shadow-[#10B981]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Ativar Modo Expresso & Salvar Aparelho</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* =========================================================================
            CENÁRIO B: MODO EXPRESSO — TELA ÚNICA (APARELHO JÁ LIBERADO)
            Aparelho liberado abre DIRETO aqui sem stepper e sem tela LGPD.
            Botão Gigante "Iniciar", Chip do Agente Memorizado (1 toque),
            Validação de sensores em segundo plano.
           ========================================================================= */}
        {isExpressoMode && !isSessionActive && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Banner de Erro Explícito se "Iniciar Coleta" Falhar */}
            {startCollectionError && (
              <div className="p-3.5 rounded-2xl bg-[#EF4444]/15 border-2 border-[#EF4444] text-xs text-[#EF4444] space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-white">
                  <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0" />
                  <span>Falha ao Acessar Sensores</span>
                </div>
                <p className="text-[#CBD5E1] text-[11px] leading-relaxed">{startCollectionError}</p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowUnlockScreen(true)}
                    className="py-1.5 px-3 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-bold transition-colors"
                  >
                    Ver instruções de desbloqueio
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

            {/* Tela de Desbloqueio como Exceção (só exibida se a validação de sensores falhar) */}
            {showUnlockScreen && renderUnlockInstructions()}

            {/* CHIP DO AGENTE MEMORIZADO (Trocável em 1 toque) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-[#94A3B8] px-1">
                <span className="uppercase font-mono tracking-wider font-semibold">
                  Agente Memorizado (Fator K)
                </span>
                <span className="text-[#38BDF8]">Troque em 1 toque</span>
              </div>

              <button
                type="button"
                onClick={() => setIsAgentSelectorOpen(true)}
                className="w-full p-3.5 rounded-2xl bg-[#0A1128] border-2 hover:border-[#3B82F6] transition-all flex items-center justify-between gap-3 text-left shadow-lg active:scale-[0.99]"
                style={{
                  borderColor: `${selectedAgentOption.color}80`,
                  boxShadow: `0 8px 24px -6px ${selectedAgentOption.color}33`,
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${selectedAgentOption.color}20`,
                      borderColor: `${selectedAgentOption.color}60`,
                      color: selectedAgentOption.color,
                    }}
                  >
                    <selectedAgentOption.icon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-sm sm:text-base text-white truncate">
                        {selectedAgentOption.label}
                      </span>
                      <span
                        className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-bold border shrink-0"
                        style={{
                          backgroundColor: `${selectedAgentOption.color}15`,
                          color: selectedAgentOption.color,
                          borderColor: `${selectedAgentOption.color}40`,
                        }}
                      >
                        {selectedAgentOption.badgeText}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                      {selectedAgentOption.sublabel}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1.5 text-xs text-[#38BDF8] font-bold bg-[#101B3A] px-2.5 py-1.5 rounded-xl border border-[#1A2A5A]">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Trocar</span>
                </div>
              </button>
            </div>

            {/* BOTÃO GIGANTE INICIAR — ÁREA DE TOQUE DOMINANTE (Modo Campo Dark) */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isStartingCollection}
                onClick={handleStartCollection}
                className="w-full py-7 sm:py-8 px-6 rounded-3xl text-xl sm:text-2xl font-black text-white bg-gradient-to-r from-[#10B981] via-[#059669] to-[#047857] hover:from-[#059669] hover:to-[#047857] shadow-2xl shadow-[#10B981]/40 active:scale-[0.97] transition-all flex flex-col items-center justify-center gap-2 group border border-[#10B981]/60"
              >
                <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 fill-white translate-x-0.5" />
                </div>
                <div className="text-center">
                  <span className="tracking-tight block">
                    {isStartingCollection ? 'Iniciando Sensores...' : 'Iniciar Coleta'}
                  </span>
                  <span className="text-[11px] font-normal text-white/80 block mt-0.5 font-sans">
                    Zero-touch • Aceleração vertical Z e Motor DSP
                  </span>
                </div>
              </button>
            </div>

            {/* Informações de Apoio Discretas (Posição Memorizada + Wake Lock) */}
            <div className="p-3 rounded-2xl bg-[#0A1128]/70 border border-[#1A2A5A] flex items-center justify-between text-xs text-[#94A3B8]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>
                  Posição:{' '}
                  <strong className="text-white">
                    {phonePosition === 'painel' ? 'Suporte do Painel' : 'Bolso / Mochila'}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#10B981] font-mono">
                  {validationStatus === 'validating' ? 'Sensores: verificando...' : 'Sensores ✓'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowConfigDrawer(true)}
                  className="text-[#38BDF8] hover:text-white underline underline-offset-2 text-[11px]"
                >
                  Ajustar
                </button>
              </div>
            </div>

            {/* Contexto LGPD em Uma Linha */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#64748B] text-center pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              <span>
                LGPD: Sonda estritamente inercial. Sem fotos, placas ou dados de condutores.
              </span>
            </div>
          </div>
        )}

        {/* =========================================================================
            CENÁRIO C: MONITORAMENTO EM MOVIMENTO / COLETA ATIVA
            Cronômetro Gigante, Wake Lock Ativo, Resumo Curto ao Encerrar
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
                  Navegadores suspendem sensores fora de foco. A fila offline mantém 100% dos dados
                  preservados.
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
                    backgroundColor: `${selectedAgentOption.color}20`,
                    color: selectedAgentOption.color,
                  }}
                >
                  <selectedAgentOption.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] text-[#94A3B8] uppercase block font-semibold">
                    Agente Ativo
                  </span>
                  <span className="font-bold text-[11px] text-white truncate block">
                    {selectedAgentOption.label}
                  </span>
                </div>
              </div>

              {/* Travar Tela Acesa (Wake Lock) */}
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

            {/* Mostrador Principal: Cronômetro Central Gigante */}
            <div className="p-6 rounded-3xl bg-[#0A1128] border-2 border-[#1A2A5A] text-center space-y-4 shadow-2xl">
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
                          : 'Sessão Concluída'}
                  </span>
                </div>

                <span className="font-mono text-[11px] text-[#94A3B8]">
                  {samplingRateHz} Hz • Motor DSP
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#94A3B8] block mb-1">
                  Tempo Decorrido
                </span>
                <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white tabular-nums">
                  {formatTime(elapsedMs)}
                </div>
              </div>

              {/* 3 Métricas Críticas de Campo */}
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

              {/* Barra de Status Compacta: Janelas Agregadas + Fila */}
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
                    <h3 className="font-bold text-sm text-white">Turno de Campo Concluído</h3>
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
                    <span className="text-[10px] text-[#94A3B8] block">Pico Vertical Z</span>
                    <span className="font-mono font-bold text-sm text-[#EF4444]">
                      {sessionSummary.peakG.toFixed(2)}g
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      // Reiniciar estado pronto para nova coleta imediata
                      handleStartCollection()
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Iniciar Novo Trecho</span>
                  </button>

                  <Link
                    to="/cockpit"
                    className="flex-1 py-2.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] hover:bg-[#1E293B] text-xs font-bold text-white flex items-center justify-center gap-1.5"
                  >
                    <span>Ver no Cockpit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* BOTÕES DE CONTROLE GIGANTES (Pausar / Encerrar) */}
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
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          DRAWER / MODAL: SELETOR RÁPIDO DE AGENTE EM 1 TOQUE
         ========================================================================= */}
      {isAgentSelectorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0A1128] border-t sm:border border-[#1A2A5A] rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1A2A5A]">
              <div>
                <h3 className="font-black text-base text-white">Trocar Categoria do Agente</h3>
                <p className="text-xs text-[#94A3B8]">Toque em 1 categoria para definir e salvar</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAgentSelectorOpen(false)}
                className="p-1.5 rounded-xl bg-[#101B3A] text-[#94A3B8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto pr-1 flex-1">
              {AGENT_OPTIONS.map((opt) => {
                const Icon = opt.icon
                const isSelected = selectedAgentCode === opt.code
                return (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => handleSelectAgent(opt.code)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-start gap-3 active:scale-[0.98] ${
                      isSelected
                        ? 'bg-[#101B3A] border-2 shadow-lg'
                        : 'bg-[#070D1F] border-[#1A2A5A] hover:border-[#3B82F6]/50'
                    }`}
                    style={{
                      borderColor: isSelected ? opt.color : undefined,
                      boxShadow: isSelected ? `0 8px 20px -4px ${opt.color}33` : undefined,
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
                        <span className="font-bold text-sm text-white truncate">{opt.label}</span>
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
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DRAWER / MODAL: CONFIGURAÇÃO RÁPIDA (POSIÇÃO DO APARELHO E SENSORES)
         ========================================================================= */}
      {showConfigDrawer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0A1128] border-t sm:border border-[#1A2A5A] rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1A2A5A]">
              <div>
                <h3 className="font-black text-base text-white">Preferências do Aparelho</h3>
                <p className="text-xs text-[#94A3B8]">
                  Configurado uma vez, memorizado para sempre
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigDrawer(false)}
                className="p-1.5 rounded-xl bg-[#101B3A] text-[#94A3B8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Posição do Aparelho */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white block">
                Acoplamento Mecânico do Smartphone:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleUpdatePosition('painel')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    phonePosition === 'painel'
                      ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-white shadow-md'
                      : 'bg-[#101B3A] border-[#1A2A5A] text-[#94A3B8]'
                  }`}
                >
                  <span className="font-bold text-white block">Suporte do Painel</span>
                  <span className="text-[10px] text-[#CBD5E1] block mt-0.5">
                    Acoplamento direto ao chassi (ideal)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdatePosition('bolso_outro')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    phonePosition === 'bolso_outro'
                      ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-white shadow-md'
                      : 'bg-[#101B3A] border-[#1A2A5A] text-[#94A3B8]'
                  }`}
                >
                  <span className="font-bold text-white block">Bolso / Mochila</span>
                  <span className="text-[10px] text-[#CBD5E1] block mt-0.5">
                    Filtro biomecânico de atenuação
                  </span>
                </button>
              </div>
            </div>

            {/* Sensores e Verificação */}
            <div className="p-3 rounded-xl bg-[#101B3A] border border-[#1A2A5A] flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block">Liberação de Sensores</span>
                <span className="text-[11px] text-[#94A3B8]">
                  {deviceAuthorized ? 'Aparelho liberado ✓' : 'Aguardando validação'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowConfigDrawer(false)
                  setShowUnlockScreen(true)
                }}
                className="py-1.5 px-3 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-[#38BDF8] hover:text-white font-semibold text-xs"
              >
                Instruções ⋮
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowConfigDrawer(false)}
              className="w-full py-3 rounded-xl bg-[#3B82F6] text-white text-xs font-bold"
            >
              Concluir
            </button>
          </div>
        </div>
      )}

      {/* Footer Fixo com Informações Institucionais e LGPD */}
      <footer className="bg-[#0A1128]/95 border-t border-[#1A2A5A] px-4 py-2.5 text-center text-[10px] text-[#94A3B8] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Fator K auditável • Sem rastreio nominal ou de placas</span>
        </div>
        <Link to="/cockpit" className="text-[#3B82F6] hover:underline font-semibold">
          Cockpit
        </Link>
      </footer>
    </div>
  )
}
