import React, { useState } from 'react'
import {
  X,
  Settings,
  Globe,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Loader2,
  Lock,
  Users,
} from 'lucide-react'
import {
  InstitucionalSettingsRecord,
  updateInstitucionalSettings,
  syncCguPortalData,
} from '@/services/institucionalSettings'
import { UsersManagementTab } from './UsersManagementTab'
import { useAuth } from '@/contexts/AuthContext'

interface InstitutionalConfigModalProps {
  isOpen: boolean
  onClose: () => void
  settings: InstitucionalSettingsRecord | null
  onSettingsUpdated: (updated: InstitucionalSettingsRecord) => void
  onOpenChangePassword?: () => void
}

export function InstitutionalConfigModal({
  isOpen,
  onClose,
  settings,
  onSettingsUpdated,
  onOpenChangePassword,
}: InstitutionalConfigModalProps) {
  const { isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState<'geral' | 'users'>('geral')

  // Estado da Feature 2: Portal Público do Cidadão (Hooks incondicionais)
  const [portalAtivo, setPortalAtivo] = useState<boolean>(settings?.portal_publico_ativo === true)
  const [portalMensagem, setPortalMensagem] = useState<string>(
    settings?.portal_mensagem_institucional ||
      'Canal Oficial de Acompanhamento do Reparo Viário — Prefeitura Municipal de Curitiba',
  )

  // Estado da Feature 3: Cadastro da Chave CGU
  const [cguApiKey, setCguApiKey] = useState<string>('')
  const [savingSettings, setSavingSettings] = useState<boolean>(false)
  const [testingCgu, setTestingCgu] = useState<boolean>(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)

  React.useEffect(() => {
    if (settings) {
      setPortalAtivo(settings.portal_publico_ativo === true)
      setPortalMensagem(
        settings.portal_mensagem_institucional ||
          'Canal Oficial de Acompanhamento do Reparo Viário — Prefeitura Municipal de Curitiba',
      )
    }
  }, [settings])

  if (!isOpen || !settings) return null

  // Salvar configurações gerais (incluindo o toggle do Portal do Cidadão)
  const handleSavePortalSettings = async () => {
    if (!settings.id) return
    setSavingSettings(true)
    setFeedback(null)
    try {
      const updated = await updateInstitucionalSettings(settings.id, {
        portal_publico_ativo: portalAtivo,
        portal_mensagem_institucional: portalMensagem,
      })
      onSettingsUpdated(updated)
      setFeedback({
        type: 'success',
        message: portalAtivo
          ? 'Portal do Cidadão ativado com sucesso! A rota /cidadao está acessível à população.'
          : 'Portal do Cidadão desativado. A rota /cidadao exibe aviso padrão sem expor dados.',
      })
    } catch (err: any) {
      console.error('Erro ao atualizar configurações:', err)
      setFeedback({
        type: 'error',
        message: 'Falha ao salvar preferências institucionais no servidor.',
      })
    } finally {
      setSavingSettings(false)
    }
  }

  // Cadastrar e testar a Chave da API CGU no backend
  const handleSyncCguKey = async (e: React.FormEvent) => {
    e.preventDefault()
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
          message:
            'Chave CGU homologada com sucesso! O card do Portal da Transparência no Gabinete foi atualizado.',
        })
        // Atualizar estado pai recarregando os dados salvos
        const updated = await updateInstitucionalSettings(settings.id!, {
          cgu_status: 'ativo',
        })
        onSettingsUpdated({
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
        message:
          'Não foi possível concluir a validação da chave no momento. Verifique a conexão do servidor.',
      })
    } finally {
      setTestingCgu(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-[#101B3A] border border-[#1A2A5A] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative">
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1A2A5A]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#F8FAFC]">
                Configurações Institucionais do Município
              </h2>
              <span className="text-xs text-[#94A3B8]">
                {settings.municipio} / {settings.uf} • Código IBGE {settings.codigo_ibge}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#0A1128] border border-[#1A2A5A] hover:border-[#3B82F6] text-[#94A3B8] hover:text-white flex items-center justify-center text-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Abas Superiores do Modal */}
        <div className="flex items-center gap-2 border-b border-[#1A2A5A] pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('geral')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'geral'
                ? 'bg-[#3B82F6] text-white shadow-md shadow-[#3B82F6]/25'
                : 'text-[#94A3B8] hover:text-white bg-[#0A1128] border border-[#1A2A5A]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Portal & Transparência CGU</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-[#3B82F6] text-white shadow-md shadow-[#3B82F6]/25'
                : 'text-[#94A3B8] hover:text-white bg-[#0A1128] border border-[#1A2A5A]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Contas Individuais, Papéis & Auditoria</span>
          </button>
        </div>

        {/* Notificações / Feedback */}
        {feedback && (
          <div
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
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {activeTab === 'users' ? (
          <UsersManagementTab
            settings={settings}
            onAuditTrailUpdated={(updated) => onSettingsUpdated(updated)}
          />
        ) : (
          <>
            {/* SEÇÃO 1: PORTAL PÚBLICO DO CIDADÃO (FEATURE 2) */}
            <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#10B981]" />
                    <h3 className="text-sm font-bold text-[#F8FAFC]">
                      Portal Público de Acompanhamento do Cidadão
                    </h3>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    Rota aberta e sem login (<b>/cidadao</b>) que permite aos munícipes consultar as
                    vias em reparo e o cumprimento das ordens de serviço.
                  </p>
                </div>

                {/* Toggle de Ativação Soberana */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={portalAtivo}
                    onClick={() => setPortalAtivo(!portalAtivo)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      portalAtivo ? 'bg-[#10B981]' : 'bg-[#334155]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        portalAtivo ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Redação do Compromisso de Accountability */}
              <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] text-xs text-[#CBD5E1] space-y-2">
                <div className="font-semibold text-[#10B981] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Decisão de Accountability da Gestão Municipal:</span>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Ativar o portal público é uma decisão voluntária da administração para cumprir
                  publicamente o compromisso de transparência ativa. Quando desativado, o cidadão vê
                  uma página sóbria informando que o acompanhamento não está aberto nesta cidade,
                  sem expor dados internos.
                </p>
              </div>

              {portalAtivo && (
                <div className="space-y-2 pt-1 animate-in fade-in">
                  <label className="block text-xs font-semibold text-[#CBD5E1]">
                    Mensagem Institucional do Cabeçalho do Portal:
                  </label>
                  <textarea
                    value={portalMensagem}
                    onChange={(e) => setPortalMensagem(e.target.value)}
                    rows={2}
                    className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:ring-1 focus:ring-[#10B981] focus:outline-none"
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
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#10B981] hover:bg-[#059669] text-white transition-all shadow-md shadow-[#10B981]/25 flex items-center gap-1.5"
                >
                  {savingSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Salvar Preferência do Portal</span>
                </button>
              </div>
            </div>

            {/* SEÇÃO 2: CHAVE DA API CGU — PORTAL DA TRANSPARÊNCIA (FEATURE 3) */}
            <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#3B82F6]" />
                    <h3 className="text-sm font-bold text-[#F8FAFC]">
                      Chave da API do Portal da Transparência (CGU)
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                      settings.cgu_status === 'ativo'
                        ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40'
                        : 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40'
                    }`}
                  >
                    {settings.cgu_status === 'ativo' ? 'Chave Ativa' : 'Cadastro Pendente'}
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Integração oficial com a Controladoria-Geral da União (CGU) para consulta de
                  recursos e convênios federais destinados ao município de {settings.municipio}.
                </p>
              </div>

              {/* Orientações sobre obtenção da chave */}
              <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#60A5FA]">
                    Como obter a chave gratuita da CGU:
                  </span>
                  <a
                    href="https://portaldatransparencia.gov.br/api-de-dados/cadastrar-email"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#3B82F6] hover:underline flex items-center gap-1"
                  >
                    <span>Solicitar Chave na CGU</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  1. Acesse o portal oficial acima e cadastre o e-mail institucional. <br />
                  2. Confirme o e-mail e copie a chave gerada (header <i>chave-api-dados</i>).{' '}
                  <br />
                  3. Cole no campo abaixo para armazenar com segurança no backend do ORBIS.UOS.
                </p>
              </div>

              <form onSubmit={handleSyncCguKey} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                    Chave da API CGU (Será armazenada de forma segura no servidor):
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={cguApiKey}
                      onChange={(e) => setCguApiKey(e.target.value)}
                      placeholder={
                        settings.cgu_status === 'ativo'
                          ? '•••••••••••••••••••••••••••••••• (Chave cadastrada)'
                          : 'Cole sua chave da API da CGU aqui...'
                      }
                      className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-xl px-3.5 py-2 text-xs text-[#F8FAFC] placeholder:text-[#94A3B8]/60 focus:ring-1 focus:ring-[#3B82F6] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-[#94A3B8] flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#10B981]" />
                    Armazenamento protegido no PocketBase (nunca exposto em APIs públicas)
                  </span>

                  <button
                    type="submit"
                    disabled={testingCgu || (!cguApiKey && settings.cgu_status !== 'ativo')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-all shadow-md shadow-[#3B82F6]/25 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {testingCgu ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Validando na CGU...</span>
                      </>
                    ) : (
                      <>
                        <span>Cadastrar & Sincronizar Chave</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* SEÇÃO 3: SEGURANÇA E ACESSO INSTITUCIONAL */}
            <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#3B82F6]" />
                  <h3 className="text-sm font-bold text-[#F8FAFC]">
                    Credenciais e Segurança de Acesso
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/30 font-semibold">
                  Sessão Ativa
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Gerencie sua senha de acesso ao painel do Gabinete e Cockpit de Engenharia.
                Recomendamos a troca periódica para conformidade com normas municipais de segurança
                da informação.
              </p>
              {onOpenChangePassword && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onOpenChangePassword()
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#101B3A] hover:bg-[#1A2A5A] border border-[#1A2A5A] hover:border-[#3B82F6] flex items-center gap-2 transition-all"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#3B82F6]" />
                    <span>Alterar Minha Senha de Acesso</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Rodapé */}
        <div className="flex justify-end pt-2 border-t border-[#1A2A5A]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#101B3A] hover:bg-[#1A2A5A] border border-[#1A2A5A] text-[#F8FAFC] transition-colors"
          >
            Fechar Configurações
          </button>
        </div>
      </div>
    </div>
  )
}
