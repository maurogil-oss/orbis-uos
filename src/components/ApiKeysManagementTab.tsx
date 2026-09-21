import React, { useState, useEffect } from 'react'
import {
  Key,
  Shield,
  Plus,
  Copy,
  Check,
  AlertTriangle,
  Lock,
  RefreshCw,
  Loader2,
  Trash2,
  ExternalLink,
  Ban,
  Info,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ApiKeyRecord, listApiKeys, createApiKey, revokeApiKey } from '@/services/apiKeys'
import {
  InstitucionalSettingsRecord,
  getInstitucionalSettings,
} from '@/services/institucionalSettings'

interface ApiKeysManagementTabProps {
  settings: InstitucionalSettingsRecord | null
  onAuditTrailUpdated?: (updated: InstitucionalSettingsRecord) => void
}

export function ApiKeysManagementTab({ settings, onAuditTrailUpdated }: ApiKeysManagementTabProps) {
  const { user, isAdmin } = useAuth()
  const [keysList, setKeysList] = useState<ApiKeyRecord[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false)

  // Formulário de Criação
  const [consumidorNome, setConsumidorNome] = useState('')
  const [consumidorOrgao, setConsumidorOrgao] = useState('')
  const [consumidorContato, setConsumidorContato] = useState('')
  const [rateLimitRpm, setRateLimitRpm] = useState<number>(60)
  const [submitting, setSubmitting] = useState(false)

  // Exibição da chave recém-criada (SOMENTE UMA VEZ)
  const [revealedKey, setRevealedKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState(false)

  // Revogação
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [motivoRevogacao, setMotivoRevogacao] = useState('')
  const [revokingLoading, setRevokingLoading] = useState(false)

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)

  const loadKeys = async () => {
    if (!isAdmin) return
    setLoading(true)
    try {
      const records = await listApiKeys()
      setKeysList(records)
    } catch (err: any) {
      console.error('Erro ao listar chaves de API:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadKeys()
    }
  }, [isAdmin])

  // Submeter nova chave
  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !isAdmin) return
    setSubmitting(true)
    setFeedback(null)

    try {
      const result = await createApiKey(
        {
          consumidor_nome: consumidorNome,
          consumidor_orgao: consumidorOrgao,
          consumidor_contato: consumidorContato,
          rate_limit_rpm: rateLimitRpm,
        },
        {
          id: user.id,
          email: user.email,
          name: user.name,
          role: 'admin',
        },
        settings?.codigo_ibge || '4106902',
      )

      setRevealedKey(result.rawKey)
      setCopiedKey(false)
      setFeedback({
        type: 'success',
        message: `Chave de API criada com sucesso para ${result.record.consumidor_nome}! Copie a chave agora, pois ela não poderá ser recuperada.`,
      })
      // Resetar form
      setConsumidorNome('')
      setConsumidorOrgao('')
      setConsumidorContato('')
      setRateLimitRpm(60)

      await loadKeys()

      // Notificar atualização da trilha
      if (onAuditTrailUpdated && settings?.codigo_ibge) {
        const refreshed = await getInstitucionalSettings(settings.codigo_ibge)
        if (refreshed) onAuditTrailUpdated(refreshed)
      }
    } catch (err: any) {
      console.error('Falha ao criar chave de API:', err)
      setFeedback({
        type: 'error',
        message: err?.message || 'Erro ao gerar chave de API.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyRevealedKey = () => {
    if (!revealedKey) return
    navigator.clipboard.writeText(revealedKey)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2500)
  }

  // Executar revogação
  const handleConfirmRevoke = async (keyRecord: ApiKeyRecord) => {
    if (!user || !isAdmin) return
    setRevokingLoading(true)
    try {
      await revokeApiKey({
        keyId: keyRecord.id,
        motivo: motivoRevogacao || 'Revogação manual por solicitação do Administrador.',
        author: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: 'admin',
        },
        codigoIbge: settings?.codigo_ibge || '4106902',
      })

      setFeedback({
        type: 'success',
        message: `Chave de ${keyRecord.consumidor_nome} foi revogada com sucesso e registrada na trilha de auditoria.`,
      })
      setRevokingId(null)
      setMotivoRevogacao('')
      await loadKeys()

      if (onAuditTrailUpdated && settings?.codigo_ibge) {
        const refreshed = await getInstitucionalSettings(settings.codigo_ibge)
        if (refreshed) onAuditTrailUpdated(refreshed)
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Erro ao revogar chave.',
      })
    } finally {
      setRevokingLoading(false)
    }
  }

  // Se não for admin, bloqueio explícito de segurança
  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-xs text-[#EF4444] rounded-2xl bg-[#0A1128] border border-[#EF4444]/30 space-y-2">
        <Lock className="w-8 h-8 mx-auto text-[#EF4444]" />
        <h4 className="font-bold text-sm text-white">Acesso Restrito a Administradores</h4>
        <p className="text-[#94A3B8] max-w-md mx-auto">
          O gerenciamento de chaves de API e credenciamento de consumidores de interoperabilidade é
          exclusivo de administradores de gabinete, em conformidade com o RBAC municipal.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Cabeçalho da Seção */}
      <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-[#3B82F6]" />
            <h3 className="font-bold text-sm text-white">
              Gestão Soberana de Chaves de API por Consumidor
            </h3>
          </div>
          <p className="text-[#94A3B8] text-[11px] leading-relaxed">
            Emissão de credenciais únicas para órgãos públicos (CICC, Defesa Social, Datalake, CIC).
            Armazenamento exclusivo de hash SHA-256 no banco (a chave nunca é guardada em texto
            claro).
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowCreateModal(!showCreateModal)
            setRevealedKey(null)
          }}
          className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-md shadow-[#3B82F6]/25 flex items-center gap-1.5 shrink-0 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showCreateModal ? 'Fechar Formulário' : 'Nova Chave de API'}</span>
        </button>
      </div>

      {/* Regras e Blindagens Técnicas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-[#0A1128] border border-[#1A2A5A] space-y-1">
          <span className="font-bold text-[#60A5FA] flex items-center gap-1 text-[11px]">
            <Shield className="w-3 h-3 text-[#3B82F6]" />
            Hash SHA-256 Blindado
          </span>
          <p className="text-[#94A3B8] text-[10px] leading-relaxed">
            Apenas o hash é salvo. A chave completa é revelada uma única vez no momento da criação.
          </p>
        </div>

        <div className="p-3 rounded-lg bg-[#0A1128] border border-[#1A2A5A] space-y-1">
          <span className="font-bold text-[#10B981] flex items-center gap-1 text-[11px]">
            <Lock className="w-3 h-3 text-[#10B981]" />
            Escopo Somente-Leitura
          </span>
          <p className="text-[#94A3B8] text-[10px] leading-relaxed">
            Consumidores acessam exclusivamente dados agregados de telemetria; mutações são
            bloqueadas.
          </p>
        </div>

        <div className="p-3 rounded-lg bg-[#0A1128] border border-[#1A2A5A] space-y-1">
          <span className="font-bold text-[#F59E0B] flex items-center gap-1 text-[11px]">
            <AlertTriangle className="w-3 h-3 text-[#F59E0B]" />
            k-Anonimato H3 (k ≥ 3)
          </span>
          <p className="text-[#94A3B8] text-[10px] leading-relaxed">
            Células com menos de 3 sessões retornam score null em qualquer endpoint, inclusive em
            produção.
          </p>
        </div>
      </div>

      {/* Feedback Banner */}
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
            <Check className="w-4 h-4 shrink-0 mt-0.5 text-[#10B981]" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#EF4444]" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* ALERTA CRÍTICO: CHAVE RECÉM-CRIADA EXIBIDA UMA ÚNICA VEZ */}
      {revealedKey && (
        <div className="p-5 rounded-2xl bg-[#0F172A] border-2 border-[#10B981] shadow-2xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-[#1A2A5A]">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-[#10B981]" />
              <h4 className="text-sm font-bold text-white">
                Chave de API Gerada — Guarde esta credencial com segurança
              </h4>
            </div>
            <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/20 px-2 py-0.5 rounded border border-[#10B981]/40 font-bold">
              Exibição Única
            </span>
          </div>

          <p className="text-xs text-[#CBD5E1] leading-relaxed">
            Por motivos de segurança e conformidade governamental, esta chave completa{' '}
            <b>NUNCA mais será exibida</b> e não pode ser recuperada. Copie-a e envie de forma
            segura ao gestor técnico do órgão integrado.
          </p>

          <div className="flex items-center gap-2 bg-[#050914] p-3 rounded-xl border border-[#1A2A5A]">
            <code className="text-xs font-mono text-[#38BDF8] break-all select-all flex-1">
              {revealedKey}
            </code>
            <button
              type="button"
              onClick={handleCopyRevealedKey}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] flex items-center gap-1.5 shrink-0 transition-all shadow-md shadow-[#10B981]/25"
            >
              {copiedKey ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Chave</span>
                </>
              )}
            </button>
          </div>

          <div className="flex justify-between items-center text-[11px] text-[#94A3B8] pt-1">
            <span>Prefixo institucional gravado na trilha de auditoria</span>
            <button
              type="button"
              onClick={() => setRevealedKey(null)}
              className="text-[#94A3B8] hover:text-white underline text-xs"
            >
              Já copiei com segurança (ocultar)
            </button>
          </div>
        </div>
      )}

      {/* Formulário de Criação de Chave */}
      {showCreateModal && (
        <form
          onSubmit={handleCreateKey}
          className="p-5 rounded-2xl bg-[#0A1128] border-2 border-[#3B82F6]/40 space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#1A2A5A]">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#3B82F6]" />
              Credenciamento de Novo Consumidor Institucional
            </h4>
            <span className="text-[10px] font-mono text-[#94A3B8]">
              Autor nominal: {user?.name} ({user?.email})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-[#CBD5E1] mb-1">
                Nome do Consumidor / Sistema *
              </label>
              <input
                type="text"
                required
                value={consumidorNome}
                onChange={(e) => setConsumidorNome(e.target.value)}
                placeholder="Ex.: Centro Integrado de Comando e Controle (CICC)"
                className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-xl px-3 py-2 text-xs text-white placeholder-[#64748B] focus:ring-1 focus:ring-[#3B82F6] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#CBD5E1] mb-1">
                Órgão / Secretaria Solicitante *
              </label>
              <input
                type="text"
                required
                value={consumidorOrgao}
                onChange={(e) => setConsumidorOrgao(e.target.value)}
                placeholder="Ex.: Secretaria Municipal de Defesa Social e Trânsito"
                className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-xl px-3 py-2 text-xs text-white placeholder-[#64748B] focus:ring-1 focus:ring-[#3B82F6] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#CBD5E1] mb-1">
                E-mail ou Contato do Responsável Técnico
              </label>
              <input
                type="text"
                value={consumidorContato}
                onChange={(e) => setConsumidorContato(e.target.value)}
                placeholder="Ex.: engenharia.cicc@curitiba.pr.gov.br"
                className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-xl px-3 py-2 text-xs text-white placeholder-[#64748B] focus:ring-1 focus:ring-[#3B82F6] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#CBD5E1] mb-1">
                Rate Limit (Req / Minuto)
              </label>
              <input
                type="number"
                min={10}
                max={600}
                value={rateLimitRpm}
                onChange={(e) => setRateLimitRpm(Number(e.target.value))}
                className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-[#3B82F6] focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#101B3A] border border-[#1A2A5A] text-[11px] text-[#94A3B8] flex items-center gap-2">
            <Info className="w-4 h-4 text-[#3B82F6] shrink-0" />
            <span>
              O escopo atribuído será estritamente <b>somente-leitura</b>. A geração da chave
              disparará o evento formal <b>API_KEY_CREATED</b> na trilha de auditoria do órgão.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#1A2A5A]">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-3 py-1.5 rounded-lg text-xs bg-[#101B3A] text-[#94A3B8] hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] flex items-center gap-1.5 shadow-md shadow-[#3B82F6]/25 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Gerar Chave & Registrar Auditoria</span>
            </button>
          </div>
        </form>
      )}

      {/* Modal de Confirmação de Revogação */}
      {revokingId && (
        <div className="p-4 rounded-xl bg-[#0A1128] border-2 border-[#EF4444]/60 space-y-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-sm font-bold text-[#EF4444]">
            <Ban className="w-4 h-4" />
            <span>Confirmar Revogação da Chave de API</span>
          </div>
          <p className="text-xs text-[#CBD5E1]">
            Esta ação invalidará imediatamente a chave para todas as chamadas futuras de API do
            consumidor. Esta operação não pode ser desfeita e registrará o evento{' '}
            <b>API_KEY_REVOKED</b> com seu nome na trilha de auditoria.
          </p>

          <div>
            <label className="block text-[11px] font-semibold text-[#CBD5E1] mb-1">
              Motivo da Revogação (Obrigatório para Auditoria):
            </label>
            <input
              type="text"
              value={motivoRevogacao}
              onChange={(e) => setMotivoRevogacao(e.target.value)}
              placeholder="Ex.: Encerramento do convênio técnico, rotatividade de credenciais..."
              className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-xl px-3 py-2 text-xs text-white placeholder-[#64748B] focus:ring-1 focus:ring-[#EF4444] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRevokingId(null)}
              className="px-3 py-1.5 rounded-lg text-xs bg-[#101B3A] text-[#94A3B8] hover:text-white"
            >
              Cancelar
            </button>
            {(() => {
              const target = keysList.find((k) => k.id === revokingId)
              if (!target) return null
              return (
                <button
                  type="button"
                  disabled={revokingLoading}
                  onClick={() => handleConfirmRevoke(target)}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#EF4444] hover:bg-[#DC2626] flex items-center gap-1.5 shadow-md shadow-[#EF4444]/25"
                >
                  {revokingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Revogar Chave Imediatamente</span>
                </button>
              )
            })()}
          </div>
        </div>
      )}

      {/* Lista de Chaves de API Cadastradas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#94A3B8] px-1">
          <span>Chaves de consumidores registradas ({keysList.length})</span>
          <button
            type="button"
            onClick={loadKeys}
            className="hover:text-white flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Atualizar</span>
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-[#94A3B8] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#3B82F6]" />
            <span>Carregando chaves de API...</span>
          </div>
        ) : keysList.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] text-center text-xs text-[#94A3B8] space-y-2">
            <Key className="w-8 h-8 mx-auto text-[#64748B]" />
            <p>Nenhuma chave de API gerada até o momento.</p>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="text-xs text-[#3B82F6] hover:underline font-bold"
            >
              Clique aqui para credenciar o primeiro consumidor
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {keysList.map((k) => {
              const isAtiva = k.status === 'ativa'
              return (
                <div
                  key={k.id}
                  className={`p-4 rounded-xl border transition-all ${
                    !isAtiva
                      ? 'bg-[#0A1128]/60 border-[#EF4444]/20 opacity-75'
                      : 'bg-[#0A1128] border-[#1A2A5A] hover:border-[#3B82F6]/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white truncate">
                          {k.consumidor_nome}
                        </span>
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                            isAtiva
                              ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40'
                              : 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40'
                          }`}
                        >
                          {isAtiva ? 'Ativa' : 'Revogada'}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#3B82F6]/15 text-[#60A5FA] border border-[#3B82F6]/30">
                          {k.escopo}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#101B3A] text-[#94A3B8] border border-[#1A2A5A]">
                          {k.rate_limit_rpm || 60} req/min
                        </span>
                      </div>

                      <div className="text-xs text-[#94A3B8] flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="text-[#CBD5E1] font-semibold">{k.consumidor_orgao}</span>
                        {k.consumidor_contato && <span>• Contato: {k.consumidor_contato}</span>}
                      </div>

                      {/* Identificador da Chave */}
                      <div className="pt-1 flex flex-wrap items-center gap-3 text-[11px] font-mono">
                        <span className="text-[#94A3B8]">
                          Prefixo:{' '}
                          <code className="text-[#38BDF8] bg-[#050914] px-1.5 py-0.5 rounded border border-[#1A2A5A]">
                            {k.key_prefix}
                          </code>
                        </span>
                        <span className="text-[#94A3B8]">
                          Total Requisições:{' '}
                          <b className="text-white">{k.total_requisicoes || 0}</b>
                        </span>
                        {k.ultimo_uso_em && (
                          <span className="text-[#94A3B8]">
                            Último uso: {new Date(k.ultimo_uso_em).toLocaleString('pt-BR')}
                          </span>
                        )}
                      </div>

                      {/* Dados de Criação / Revogação */}
                      <div className="text-[10px] text-[#64748B] pt-0.5 flex flex-wrap gap-x-3">
                        <span>
                          Criada em {new Date(k.created).toLocaleString('pt-BR')} por{' '}
                          {k.criado_por_nome || 'SISTEMA'}
                        </span>
                        {!isAtiva && k.revogado_em && (
                          <span className="text-[#EF4444]">
                            Revogada em {new Date(k.revogado_em).toLocaleString('pt-BR')} por{' '}
                            {k.revogado_por_nome || 'Admin'}
                            {k.motivo_revogacao ? ` (Motivo: ${k.motivo_revogacao})` : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ações */}
                    {isAtiva && (
                      <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => {
                            setRevokingId(k.id)
                            setMotivoRevogacao('')
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#EF4444] bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/30 flex items-center gap-1 transition-colors"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Revogar Chave</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
