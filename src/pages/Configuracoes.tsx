import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Settings,
  ArrowLeft,
  Radio,
  Globe,
  KeyRound,
  Users,
  Shield,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  RefreshCw,
  Key,
} from 'lucide-react'
import {
  getInstitucionalSettings,
  updateInstitucionalSettings,
  InstitucionalSettingsRecord,
  syncCguPortalData,
} from '@/services/institucionalSettings'
import { TrafficIntegrationConfig } from '@/components/TrafficIntegrationConfig'
import { UsersManagementTab } from '@/components/UsersManagementTab'
import { ApiKeysManagementTab } from '@/components/ApiKeysManagementTab'
import { ChangePasswordModal } from '@/components/ChangePasswordModal'
import { useAuth } from '@/contexts/AuthContext'

export default function ConfiguracoesPage() {
  const { user, isAdmin } = useAuth()
  const [settings, setSettings] = useState<InstitucionalSettingsRecord | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<'traffic' | 'geral' | 'users' | 'keys'>('traffic')
  const [showChangePasswordModal, setShowChangePasswordModal] = useState<boolean>(false)

  // Estados locais para aba Geral (Portal do Cidadão e CGU)
  const [portalAtivo, setPortalAtivo] = useState<boolean>(false)
  const [portalMensagem, setPortalMensagem] = useState<string>('')
  const [cguApiKey, setCguApiKey] = useState<string>('')
  const [savingSettings, setSavingSettings] = useState<boolean>(false)
  const [testingCgu, setTestingCgu] = useState<boolean>(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)

  const loadSettings = async () => {
    setLoading(true)
    try {
      const data = await getInstitucionalSettings('4106902')
      if (data) {
        setSettings(data)
        setPortalAtivo(data.portal_publico_ativo === true)
        setPortalMensagem(
          data.portal_mensagem_institucional ||
            'Canal Oficial de Acompanhamento do Reparo Viário — Prefeitura Municipal de Curitiba',
        )
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  // Salvar configurações do Portal do Cidadão
  const handleSavePortalSettings = async () => {
    if (!settings?.id) return
    setSavingSettings(true)
    setFeedback(null)
    try {
      const updated = await updateInstitucionalSettings(settings.id, {
        portal_publico_ativo: portalAtivo,
        portal_mensagem_institucional: portalMensagem,
      })
      setSettings(updated)
      setFeedback({
        type: 'success',
        message: portalAtivo
          ? 'Portal do Cidadão ativado com sucesso! A rota /cidadao está acessível à população.'
          : 'Portal do Cidadão desativado. A rota /cidadao exibe aviso padrão sem expor dados.',
      })
    } catch (err: any) {
      console.error('Erro ao atualizar configurações do portal:', err)
      setFeedback({
        type: 'error',
        message: 'Falha ao salvar preferências institucionais no servidor.',
      })
    } finally {
      setSavingSettings(false)
    }
  }

  // Cadastrar e testar chave CGU
  const handleSyncCguKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings?.id) return
    setTestingCgu(true)
    setFeedback(null)
    try {
      const result = await syncCguPortalData({
        codigo_ibge: settings.codigo_ibge || '4106902',
        cgu_api_key: cguApiKey.trim(),
        municipio: settings.municipio,
        uf: settings.uf,
      })

      if (result.status === 'ativo') {
        setFeedback({
          type: 'success',
          message: 'Chave CGU homologada com sucesso! O painel da transparência foi sincronizado.',
        })
        const updated = await updateInstitucionalSettings(settings.id, {
          cgu_status: 'ativo',
        })
        setSettings({
          ...updated,
          cgu_cache_payload: result.data,
          cgu_status: 'ativo',
        })
        setCguApiKey('')
      } else if (result.status === 'erro_chave') {
        setFeedback({
          type: 'error',
          message: result.message || 'Chave CGU inválida ou não ativada no portal do governo.',
        })
      } else {
        setFeedback({
          type: 'info',
          message: result.message || 'Status CGU atualizado.',
        })
      }
    } catch (err: any) {
      console.error('Erro na integração CGU:', err)
      setFeedback({
        type: 'error',
        message: 'Falha ao validar a chave CGU no servidor.',
      })
    } finally {
      setTestingCgu(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070D1F] text-[#F8FAFC] pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb & Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A2A5A]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
              <Link
                to="/cockpit"
                className="hover:text-white transition-colors flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar ao Cockpit
              </Link>
              <span>/</span>
              <span className="text-[#3B82F6]">Configurações da Plataforma</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 border border-[#3B82F6]/40 flex items-center justify-center text-[#3B82F6] shrink-0">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Configurações Institucionais & Integrações
                </h1>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  {settings ? (
                    <>
                      {settings.municipio} / {settings.uf} • Código IBGE {settings.codigo_ibge} •
                      Fonte de verdade única sincronizada com o Cockpit
                    </>
                  ) : (
                    'Gerenciamento de integrações de dados, portal público e parâmetros institucionais'
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadSettings}
              disabled={loading}
              className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] text-[#F8FAFC] flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
            <Link
              to="/cockpit"
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-md shadow-[#3B82F6]/25 flex items-center gap-1.5 transition-all"
            >
              <span>Abrir Cockpit</span>
            </Link>
          </div>
        </div>

        {/* Abas de Configuração */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#1A2A5A] pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('traffic')}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'traffic'
                ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-md shadow-[#10B981]/25 ring-1 ring-[#10B981]/50'
                : 'text-[#34D399] hover:text-white bg-[#101B3A] border border-[#1A2A5A]'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Dados de Trânsito em Tempo Real</span>
            {settings?.waze_feed_active ? (
              <span className="text-[10px] bg-black/25 text-[#A7F3D0] px-2 py-0.5 rounded font-mono">
                Ativo
              </span>
            ) : (
              <span className="text-[10px] bg-black/25 text-[#94A3B8] px-2 py-0.5 rounded font-mono">
                Aguardando
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('geral')}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'geral'
                ? 'bg-[#3B82F6] text-white shadow-md shadow-[#3B82F6]/25'
                : 'text-[#94A3B8] hover:text-white bg-[#101B3A] border border-[#1A2A5A]'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Portal do Cidadão & CGU</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-[#3B82F6] text-white shadow-md shadow-[#3B82F6]/25'
                : 'text-[#94A3B8] hover:text-white bg-[#101B3A] border border-[#1A2A5A]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Contas & Auditoria</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('keys')}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'keys'
                  ? 'bg-[#3B82F6] text-white shadow-md shadow-[#3B82F6]/25'
                  : 'text-[#94A3B8] hover:text-white bg-[#101B3A] border border-[#1A2A5A]'
              }`}
            >
              <Key className="w-4 h-4 text-[#38BDF8]" />
              <span>Chaves de API (Consumidores)</span>
            </button>
          )}
        </div>

        {/* Feedback geral */}
        {feedback && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-2.5 text-xs animate-in fade-in ${
              feedback.type === 'success'
                ? 'bg-[#10B981]/15 border-[#10B981]/40 text-[#A7F3D0]'
                : feedback.type === 'error'
                  ? 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#FCA5A5]'
                  : 'bg-[#3B82F6]/15 border-[#3B82F6]/40 text-[#93C5FD]'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#10B981]" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{feedback.message}</span>
          </div>
        )}

        {/* CONTEÚDO DA ABA SELECIONADA */}
        {loading ? (
          <div className="p-12 text-center text-xs text-[#94A3B8] flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#3B82F6]" />
            <span>Carregando preferências institucionais...</span>
          </div>
        ) : activeTab === 'traffic' ? (
          <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] shadow-xl animate-in fade-in">
            <TrafficIntegrationConfig
              settings={settings}
              onSettingsUpdated={(updated) => {
                setSettings(updated)
              }}
              showTitle={true}
            />
          </div>
        ) : activeTab === 'keys' && isAdmin ? (
          <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] shadow-xl animate-in fade-in">
            {settings && (
              <ApiKeysManagementTab
                settings={settings}
                onAuditTrailUpdated={(updated) => setSettings(updated)}
              />
            )}
          </div>
        ) : activeTab === 'users' ? (
          <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] shadow-xl animate-in fade-in">
            {settings && (
              <UsersManagementTab
                settings={settings}
                onAuditTrailUpdated={(updated) => setSettings(updated)}
              />
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in">
            {/* PORTAL PÚBLICO DO CIDADÃO */}
            <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] shadow-xl space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#10B981]" />
                    <h2 className="text-base font-bold text-[#F8FAFC]">
                      Portal Público de Acompanhamento do Cidadão
                    </h2>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    Rota aberta e sem login (<b>/cidadao</b>) que permite aos munícipes consultar as
                    vias em reparo e o cumprimento das ordens de serviço viário.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={portalAtivo}
                    onClick={() => setPortalAtivo(!portalAtivo)}
                    aria-label={portalAtivo ? 'Desativar Portal' : 'Ativar Portal'}
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] ${
                      portalAtivo ? 'bg-[#10B981]' : 'bg-[#334155]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        portalAtivo ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {portalAtivo && (
                <div className="space-y-2 pt-2 animate-in fade-in">
                  <label className="block text-xs font-semibold text-[#CBD5E1]">
                    Mensagem Institucional do Cabeçalho do Portal:
                  </label>
                  <textarea
                    value={portalMensagem}
                    onChange={(e) => setPortalMensagem(e.target.value)}
                    rows={2}
                    className="w-full bg-[#0A1128] border border-[#1A2A5A] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC] focus:ring-1 focus:ring-[#10B981] focus:outline-none"
                  />
                  <div className="flex justify-between items-center text-[11px] text-[#94A3B8]">
                    <span>
                      Acessível publicamente em: <b>/cidadao</b>
                    </span>
                    <a
                      href="/cidadao"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#10B981] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Abrir Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={savingSettings}
                  onClick={handleSavePortalSettings}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold bg-[#10B981] hover:bg-[#059669] text-white transition-all shadow-md shadow-[#10B981]/25 flex items-center gap-1.5"
                >
                  {savingSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Salvar Preferência do Portal</span>
                </button>
              </div>
            </div>

            {/* CHAVE DA API CGU */}
            <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] shadow-xl space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-[#3B82F6]" />
                    <h2 className="text-base font-bold text-[#F8FAFC]">
                      Chave da API do Portal da Transparência (CGU)
                    </h2>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                      settings?.cgu_status === 'ativo'
                        ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40'
                        : 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40'
                    }`}
                  >
                    {settings?.cgu_status === 'ativo' ? 'Chave Ativa' : 'Cadastro Pendente'}
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Integração oficial com a Controladoria-Geral da União (CGU) para consulta de
                  recursos e convênios federais destinados ao município de{' '}
                  {settings?.municipio || 'Curitiba'}.
                </p>
              </div>

              <form onSubmit={handleSyncCguKey} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                    Chave da API CGU:
                  </label>
                  <input
                    type="password"
                    value={cguApiKey}
                    onChange={(e) => setCguApiKey(e.target.value)}
                    placeholder={
                      settings?.cgu_status === 'ativo'
                        ? '•••••••••••••••••••••••••••••••• (Chave cadastrada)'
                        : 'Cole sua chave da API da CGU aqui...'
                    }
                    className="w-full bg-[#0A1128] border border-[#1A2A5A] rounded-xl px-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder:text-[#94A3B8]/60 focus:ring-1 focus:ring-[#3B82F6] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#94A3B8] flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#10B981]" />
                    Armazenamento seguro no PocketBase institucional
                  </span>

                  <button
                    type="submit"
                    disabled={testingCgu || (!cguApiKey && settings?.cgu_status !== 'ativo')}
                    className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-all shadow-md shadow-[#3B82F6]/25 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {testingCgu ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Validando na CGU...</span>
                      </>
                    ) : (
                      <span>Cadastrar & Sincronizar Chave</span>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* SEGURANÇA E ACESSO */}
            <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#3B82F6]" />
                  <h2 className="text-base font-bold text-[#F8FAFC]">
                    Credenciais e Segurança de Acesso
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/30 font-semibold">
                  Sessão Ativa
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Recomendamos a troca periódica de senha do operador/gestor para conformidade com a
                política de segurança institucional do município.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(true)}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0A1128] hover:bg-[#1A2A5A] border border-[#1A2A5A] hover:border-[#3B82F6] flex items-center gap-2 transition-all"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>Alterar Minha Senha de Acesso</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Alteração de Senha */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </div>
  )
}
