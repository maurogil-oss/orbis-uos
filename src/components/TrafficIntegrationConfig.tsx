import React, { useState, useEffect } from 'react'
import {
  Radio,
  ExternalLink,
  Info,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
  Layers,
  ArrowRight,
  Gauge,
  Check,
} from 'lucide-react'
import {
  trafficAdapterRegistry,
  testWazeFeedUrl,
  WazeFeedTestResult,
  TRAFFIC_SOURCES,
} from '@/services/trafficAdapters'
import {
  InstitucionalSettingsRecord,
  updateInstitucionalSettings,
  registerAuditEvent,
} from '@/services/institucionalSettings'
import { useAuth } from '@/contexts/AuthContext'

interface TrafficIntegrationConfigProps {
  settings: InstitucionalSettingsRecord | null
  onSettingsUpdated?: (updated: InstitucionalSettingsRecord) => void
  showTitle?: boolean
  compact?: boolean
}

export function TrafficIntegrationConfig({
  settings,
  onSettingsUpdated,
  showTitle = true,
  compact = false,
}: TrafficIntegrationConfigProps) {
  const { user } = useAuth()

  // Estados locais sincronizados com settings
  const [wazeUrl, setWazeUrl] = useState<string>(settings?.waze_feed_url || '')
  const [wazeActive, setWazeActive] = useState<boolean>(Boolean(settings?.waze_feed_active))
  const [testingFeed, setTestingFeed] = useState<boolean>(false)
  const [savingConfig, setSavingConfig] = useState<boolean>(false)

  const [testResult, setTestResult] = useState<WazeFeedTestResult | null>(
    (settings?.waze_last_test_details as WazeFeedTestResult) || null,
  )
  const [lastTestedAt, setLastTestedAt] = useState<string | null>(
    settings?.waze_last_tested_at || null,
  )
  const [statusAnnouncement, setStatusAnnouncement] = useState<string>('')
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)

  useEffect(() => {
    if (settings) {
      if (settings.waze_feed_url !== undefined) {
        setWazeUrl(settings.waze_feed_url || '')
      }
      if (settings.waze_feed_active !== undefined) {
        setWazeActive(Boolean(settings.waze_feed_active))
      }
      if (settings.waze_last_test_details) {
        setTestResult(settings.waze_last_test_details)
      }
      if (settings.waze_last_tested_at) {
        setLastTestedAt(settings.waze_last_tested_at)
      }
    }
  }, [settings])

  const isWazeTestedSuccessfully = testResult?.ok === true
  const isUrlProvided = Boolean(wazeUrl.trim())

  // Testar Feed
  const handleTestFeed = async () => {
    const cleanUrl = wazeUrl.trim()
    if (!cleanUrl) {
      const msg = 'Por favor, informe a URL oficial do feed do convênio para testar.'
      setStatusAnnouncement(msg)
      setFeedback({ type: 'error', message: msg })
      return
    }

    setTestingFeed(true)
    setFeedback(null)
    setStatusAnnouncement('Iniciando teste real de conexão com o feed do Waze for Cities...')

    try {
      const res = await testWazeFeedUrl(cleanUrl)
      setTestResult(res)
      const now = new Date().toISOString()
      setLastTestedAt(now)

      if (res.ok) {
        const msg = `Teste do feed bem-sucedido: O endereço respondeu com HTTP ${res.httpStatus} em ${res.elapsedMs} ms. Estrutura de dados válida. Interruptor liberado.`
        setStatusAnnouncement(msg)
        setFeedback({
          type: 'success',
          message:
            'Feed validado com sucesso! O interruptor de ativação foi liberado para conexão em tempo real.',
        })
      } else {
        const msg = `Falha no teste do feed: ${res.message}. O interruptor de ativação permanece desabilitado.`
        setStatusAnnouncement(msg)
        setFeedback({
          type: 'error',
          message: `Falha no teste do feed: ${res.message}`,
        })
        if (wazeActive) {
          setWazeActive(false)
        }
      }

      // Persistir resultado do teste de forma durável em institucional_settings
      const updated = await trafficAdapterRegistry.saveWazeConfiguration({
        codigoIbge: settings?.codigo_ibge || '4106902',
        feedUrl: cleanUrl,
        active: res.ok ? wazeActive : false,
        testResult: res,
      })

      if (updated && onSettingsUpdated) {
        onSettingsUpdated(updated)
      }

      // Registrar auditoria se usuário logado
      if (user) {
        await registerAuditEvent({
          codigoIbge: settings?.codigo_ibge || '4106902',
          event: res.ok ? 'WAZE_FEED_TEST_SUCCESS' : 'WAZE_FEED_TEST_FAILED',
          author: {
            id: user.id || 'sistema',
            email: user.email || 'servidor@orbis-uos.com.br',
            name: user.name || 'Servidor Municipal',
            role: user.role || 'operador',
          },
          details: {
            feedUrl: cleanUrl,
            httpStatus: res.httpStatus,
            status: res.status,
            elapsedMs: res.elapsedMs,
          },
          compliance: 'Art. 27 LC 182/2021',
        })
      }
    } catch (err: any) {
      console.error('Erro ao testar feed:', err)
      const msg = 'Erro inesperado ao conectar ao backend de verificação do feed.'
      setStatusAnnouncement(msg)
      setFeedback({ type: 'error', message: msg })
    } finally {
      setTestingFeed(false)
    }
  }

  // Alternar ativação do Waze for Cities
  const handleToggleWazeActivation = async (newActiveState: boolean) => {
    if (newActiveState && (!testResult || !testResult.ok)) {
      const msg =
        'Ação bloqueada: É obrigatório realizar um teste bem-sucedido antes de ativar a integração.'
      setStatusAnnouncement(msg)
      setFeedback({ type: 'error', message: msg })
      return
    }

    setSavingConfig(true)
    setFeedback(null)

    try {
      const updated = await trafficAdapterRegistry.saveWazeConfiguration({
        codigoIbge: settings?.codigo_ibge || '4106902',
        feedUrl: wazeUrl.trim(),
        active: newActiveState,
        testResult: testResult || undefined,
      })

      setWazeActive(newActiveState)
      if (newActiveState) {
        trafficAdapterRegistry.setActiveSourceId('waze_for_cities')
        const msg =
          'Integração Waze for Cities ativada com sucesso! A malha agora é alimentada pelo feed governamental oficial.'
        setStatusAnnouncement(msg)
        setFeedback({ type: 'success', message: msg })
      } else {
        trafficAdapterRegistry.setActiveSourceId('orbis_dsp')
        const msg =
          'Integração Waze for Cities desativada. A malha opera via Coleta Passiva ORBIS DSP (fonte padrão).'
        setStatusAnnouncement(msg)
        setFeedback({
          type: 'info',
          message:
            'Integração desativada. O sistema opera normalmente com a Coleta Passiva ORBIS DSP padrão.',
        })
      }

      if (updated && onSettingsUpdated) {
        onSettingsUpdated(updated)
      }

      // Trilha de auditoria
      if (user) {
        await registerAuditEvent({
          codigoIbge: settings?.codigo_ibge || '4106902',
          event: newActiveState ? 'TRAFFIC_FEED_ACTIVATED' : 'TRAFFIC_FEED_DEACTIVATED',
          author: {
            id: user.id || 'sistema',
            email: user.email || 'servidor@orbis-uos.com.br',
            name: user.name || 'Servidor Municipal',
            role: user.role || 'operador',
          },
          details: {
            provider: 'waze_for_cities',
            feedUrl: wazeUrl.trim(),
            active: newActiveState,
          },
          compliance: 'Art. 27 LC 182/2021',
        })
      }
    } catch (err: any) {
      console.error('Erro ao alternar ativação do feed:', err)
      const msg = 'Erro ao salvar alteração de ativação no servidor.'
      setStatusAnnouncement(msg)
      setFeedback({ type: 'error', message: msg })
    } finally {
      setSavingConfig(false)
    }
  }

  // Desconectar feed completamente e retornar à fonte padrão
  const handleResetFeed = async () => {
    if (!settings?.id) return
    setSavingConfig(true)
    setFeedback(null)

    try {
      const updated = await updateInstitucionalSettings(settings.id, {
        waze_feed_url: '',
        waze_feed_active: false,
        traffic_source_active: 'orbis_dsp',
        waze_last_test_status: 'nao_testado',
        waze_last_tested_at: '',
        waze_last_test_details: null,
      })

      setWazeUrl('')
      setWazeActive(false)
      setTestResult(null)
      setLastTestedAt(null)
      trafficAdapterRegistry.applySettings(updated)
      if (onSettingsUpdated) {
        onSettingsUpdated(updated)
      }
      setFeedback({
        type: 'info',
        message:
          'Feed removido. A plataforma permanece operando com a fonte padrão Coleta Passiva ORBIS DSP.',
      })
      setStatusAnnouncement('Feed do Waze for Cities removido. Fonte retornou ao ORBIS DSP.')
    } catch (err) {
      console.error('Erro ao resetar feed:', err)
      setFeedback({ type: 'error', message: 'Falha ao remover configuração do feed.' })
    } finally {
      setSavingConfig(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* WCAG 2.2: Região de anúncios de acessibilidade para leitores de tela */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {statusAnnouncement}
      </div>

      {showTitle && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A2A5A]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#3B82F6]/20 border border-[#3B82F6]/40 flex items-center justify-center shrink-0">
              <Radio className="w-4 h-4 text-[#60A5FA]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC]">
                Integração de Dados de Trânsito em Tempo Real
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Alimentação de velocidades médias e alertas via programa governamental gratuito{' '}
                <b className="text-[#CBD5E1]">Waze for Cities</b>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-mono font-bold uppercase px-2.5 py-1 rounded border flex items-center gap-1.5 ${
                wazeActive && isWazeTestedSuccessfully
                  ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40'
                  : 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  wazeActive && isWazeTestedSuccessfully
                    ? 'bg-[#10B981] animate-pulse'
                    : 'bg-[#F59E0B]'
                }`}
              />
              {wazeActive && isWazeTestedSuccessfully ? 'Convênio Ativo' : 'Aguardando Convênio'}
            </span>
          </div>
        </div>
      )}

      {/* Feedback de salvamento / teste */}
      {feedback && (
        <div
          role="region"
          aria-label="Notificação da integração de tráfego"
          className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
            feedback.type === 'success'
              ? 'bg-[#10B981]/15 border-[#10B981]/40 text-[#A7F3D0]'
              : feedback.type === 'error'
                ? 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#FCA5A5]'
                : 'bg-[#3B82F6]/15 border-[#3B82F6]/40 text-[#93C5FD]'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#10B981]" />
          ) : feedback.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#EF4444]" />
          ) : (
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#3B82F6]" />
          )}
          <span className="leading-relaxed">{feedback.message}</span>
        </div>
      )}

      {/* Explicação pedagógica e honesta sobre o que a integração faz */}
      <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-3 text-xs">
        <div className="flex items-center gap-2 text-[#60A5FA] font-bold">
          <Gauge className="w-4 h-4 shrink-0" />
          <span>O que esta integração faz e como funciona no ORBIS.UOS:</span>
        </div>
        <p className="text-[#CBD5E1] leading-relaxed">
          O <b>ORBIS.UOS</b> monitora a fluidez e velocidade média da malha viária municipal sem
          nenhum custo de API externa privada. Por padrão, a plataforma utiliza a{' '}
          <b>Coleta Passiva ORBIS DSP</b> derivada da telemetria inercial e tacógrafo da frota
          pública (ônibus e coleta).
        </p>
        <p className="text-[#CBD5E1] leading-relaxed">
          Prefeituras e órgãos gestores de trânsito (como a SMDT/URBS) podem aderir sem custo ao{' '}
          <b>Waze for Cities</b> (programa oficial do Google para o setor público). Ao firmar o
          convênio, o órgão recebe uma <b>URL oficial de feed</b> (formato JSON ou GeoJSON) contendo
          alertas de lentidão e tempos de percurso bidirecionais.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1A2A5A]/60 text-[11px] text-[#94A3B8]">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#10B981]" />
            <span>100% Gratuito para entes públicos • Zero dados inventados</span>
          </span>
          <a
            href="https://www.waze.com/pt-BR/ccp"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir portal oficial de adesão do Waze for Cities em nova aba"
            className="text-[#38BDF8] hover:text-[#60A5FA] inline-flex items-center gap-1 font-semibold hover:underline"
          >
            <span>Conhecer o programa Waze for Cities</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* ESTADO HONESTO: 'Aguardando convênio Waze for Cities / Disponível quando o órgão aderir' */}
      {!isUrlProvided && (
        <div
          role="region"
          aria-label="Estado da integração de tráfego"
          className="p-4 rounded-xl bg-[#15234A]/80 border border-[#3B82F6]/30 text-xs space-y-2.5"
        >
          <div className="flex items-center gap-2 text-[#60A5FA] font-bold">
            <Info className="w-4 h-4 shrink-0" />
            <span>Aguardando convênio Waze for Cities — Disponível quando o órgão aderir</span>
          </div>
          <p className="text-[#CBD5E1] leading-relaxed">
            A integração de tráfego em tempo real está <b>aguardando adesão formal</b> do município
            ao programa governamental Waze for Cities. Enquanto a URL do feed oficial não for
            configurada e validada, a plataforma não finge sincronização: o Cockpit opera de forma
            honesta com o <b>Motor ORBIS DSP padrão</b>.
          </p>
          <div className="p-3 rounded-lg bg-[#0A1128]/80 border border-[#1A2A5A] text-[11px] text-[#94A3B8] space-y-1">
            <div className="font-semibold text-white">Como viabilizar esta integração:</div>
            <div>
              1. O gestor municipal solicita adesão gratuita em <i>waze.com/pt-BR/ccp</i>.
            </div>
            <div>
              2. Após a aprovação do convênio, o órgão recebe o endpoint do feed de dados viários da
              cidade.
            </div>
            <div>
              3. Cole a URL no campo abaixo, execute o teste de validação e acione o interruptor.
            </div>
          </div>
        </div>
      )}

      {/* Formulário: URL do Feed + Botão Testar + Interruptor de Ativação */}
      <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          {/* Campo de URL */}
          <div className="lg:col-span-6 space-y-1.5">
            <label
              htmlFor="settings-waze-feed-url-input"
              className="text-xs font-bold text-[#CBD5E1] block"
            >
              URL do Feed do Convênio Waze for Cities (JSON / GeoJSON Oficial):
            </label>
            <div className="relative">
              <input
                id="settings-waze-feed-url-input"
                type="url"
                placeholder="https://waze.com/row-partner-hub-api/..."
                value={wazeUrl}
                onChange={(e) => {
                  setWazeUrl(e.target.value)
                  if (testResult) {
                    setTestResult(null)
                  }
                }}
                className="w-full min-h-[44px] bg-[#101B3A] border border-[#1A2A5A] rounded-xl px-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
              />
            </div>
            <span className="text-[10px] text-[#94A3B8] block">
              Endereço exclusivo fornecido pelo programa após assinatura do termo governamental.
            </span>
          </div>

          {/* Botão Testar Feed */}
          <div className="lg:col-span-3">
            <button
              type="button"
              onClick={handleTestFeed}
              disabled={testingFeed || !isUrlProvided}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-[#1E293B] disabled:text-[#64748B] disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
              aria-label="Testar chamada real ao endereço de feed do Waze for Cities"
            >
              {testingFeed ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validando feed...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Testar Feed</span>
                </>
              )}
            </button>
          </div>

          {/* Interruptor de Ativação (só libera se teste OK) */}
          <div className="lg:col-span-3 space-y-1.5">
            <label
              htmlFor="settings-waze-activation-switch"
              className="text-xs font-bold text-[#CBD5E1] block"
            >
              Ativação da Integração:
            </label>
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#101B3A] border border-[#1A2A5A] min-h-[44px]">
              <span className="text-xs text-[#94A3B8] pl-1 font-medium">
                {wazeActive ? (
                  <span className="text-[#10B981] font-semibold">Feed Ativo</span>
                ) : (
                  <span>Desativado</span>
                )}
              </span>

              <button
                id="settings-waze-activation-switch"
                type="button"
                role="switch"
                aria-checked={wazeActive}
                disabled={!isWazeTestedSuccessfully || savingConfig}
                onClick={() => handleToggleWazeActivation(!wazeActive)}
                aria-label={
                  wazeActive
                    ? 'Desativar integração Waze for Cities'
                    : 'Ativar integração Waze for Cities (disponível apenas após teste bem-sucedido)'
                }
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] disabled:cursor-not-allowed disabled:opacity-40 ${
                  wazeActive ? 'bg-[#10B981]' : 'bg-[#1E293B]'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    wazeActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Feedback visual honesto do teste */}
        {testResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs space-y-1.5 animate-in fade-in ${
              testResult.ok
                ? 'bg-[#064E3B]/30 border-[#10B981]/50 text-[#A7F3D0]'
                : 'bg-[#450A0A]/30 border-[#EF4444]/50 text-[#FECACA]'
            }`}
            role="region"
            aria-label="Resultado do teste do feed externo"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold">
                {testResult.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
                )}
                <span>
                  {testResult.ok ? 'Feed Validado com Sucesso' : 'Falha na Validação do Feed'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono text-[#94A3B8]">
                <span>HTTP {testResult.httpStatus || 0}</span>
                <span>•</span>
                <span>{testResult.elapsedMs} ms</span>
              </div>
            </div>

            <p className="leading-relaxed">{testResult.message}</p>

            {testResult.details && (
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#94A3B8] font-mono">
                {testResult.details.totalAlerts !== undefined && (
                  <span>
                    Alertas detectados: <b>{testResult.details.totalAlerts}</b>
                  </span>
                )}
                {testResult.details.totalJams !== undefined && (
                  <span>
                    Retenções/Jams: <b>{testResult.details.totalJams}</b>
                  </span>
                )}
                {testResult.details.isGeoJson && <span>Formato: GeoJSON FeatureCollection</span>}
              </div>
            )}

            {lastTestedAt && (
              <div className="text-[10px] text-[#94A3B8] pt-1">
                Última checagem registrada: {new Date(lastTestedAt).toLocaleString('pt-BR')} •
                Armazenado no banco institucional
              </div>
            )}
          </div>
        )}

        {/* Alerta de bloqueio pedagógico */}
        {!isWazeTestedSuccessfully && isUrlProvided && (
          <div className="text-[11px] text-[#F59E0B] flex items-center gap-1.5 p-2 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>
              O interruptor de ativação permanece bloqueado até que o teste confirme a existência do
              feed e a emissão de dados válidos.
            </span>
          </div>
        )}

        {/* Fallback transparente declarado */}
        <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] text-xs text-[#CBD5E1] space-y-1.5">
          <div className="flex items-center gap-2 text-[#10B981] font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>Garantia de Continuidade & Fallback Automático:</span>
          </div>
          <p className="text-[11px] text-[#94A3B8] leading-relaxed">
            Se a integração estiver ativada e o feed do Waze sofrer instabilidade ou falha de
            conexão em runtime, a plataforma{' '}
            <b>recorre de forma graciosa e instantânea à Coleta Passiva ORBIS DSP</b>. Nenhum painel
            fica em branco e nenhum dado sintético é inventado. A fonte declarada no Cockpit indica
            a contingência ativa com transparência.
          </p>
        </div>

        {/* Ação de reset */}
        {isUrlProvided && (
          <div className="flex justify-end pt-1">
            <button
              type="button"
              disabled={savingConfig}
              onClick={handleResetFeed}
              className="text-xs text-[#EF4444] hover:text-[#F87171] hover:underline p-1 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <span>Desvincular e limpar feed Waze</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
