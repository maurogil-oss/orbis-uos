import React, { useState, useEffect } from 'react'
import {
  Users,
  Shield,
  UserPlus,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserCheck,
  UserX,
  History,
  Lock,
  Trash2,
  Building2,
  FileText,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react'
import { useAuth, UserRole } from '@/contexts/AuthContext'
import {
  ManagedUserRecord,
  listInstitucionalUsers,
  createInstitucionalUser,
  updateInstitucionalUser,
  toggleUserStatus,
} from '@/services/usersManagement'
import {
  InstitucionalSettingsRecord,
  AuditTrailEvent,
  triggerTelemetryPurge,
} from '@/services/institucionalSettings'

interface UsersManagementTabProps {
  settings: InstitucionalSettingsRecord | null
  onAuditTrailUpdated?: (updated: InstitucionalSettingsRecord) => void
}

export function UsersManagementTab({ settings, onAuditTrailUpdated }: UsersManagementTabProps) {
  const { user, isAdmin } = useAuth()
  const [subTab, setSubTab] = useState<'users' | 'audit' | 'purge'>('users')
  const [usersList, setUsersList] = useState<ManagedUserRecord[]>([])
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true)
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false)

  // Form states
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState<UserRole>('operador')
  const [newCargo, setNewCargo] = useState('')
  const [newOrgao, setNewOrgao] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [submittingUser, setSubmittingUser] = useState(false)

  // Feedback states
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)

  // Purge manual test state
  const [purging, setPurging] = useState(false)
  const [purgeResult, setPurgeResult] = useState<any>(null)

  // Parse audit trail from settings
  const getAuditEvents = (): AuditTrailEvent[] => {
    if (!settings?.audit_trail) return []
    if (Array.isArray(settings.audit_trail)) return settings.audit_trail
    try {
      return JSON.parse(settings.audit_trail)
    } catch (_) {
      return []
    }
  }

  const auditEvents = getAuditEvents()

  const loadUsers = async () => {
    if (!isAdmin) return
    setLoadingUsers(true)
    try {
      const list = await listInstitucionalUsers()
      setUsersList(list)
    } catch (err: any) {
      console.error('Erro ao carregar usuários:', err)
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadUsers()
    }
  }, [isAdmin])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setFeedback(null)
    setSubmittingUser(true)

    try {
      await createInstitucionalUser(
        {
          name: newName,
          email: newEmail,
          role: newRole,
          cargo: newCargo,
          orgao: newOrgao,
          password: newPassword,
          passwordConfirm: newPasswordConfirm,
        },
        { id: user.id, email: user.email, name: user.name },
      )

      setFeedback({
        type: 'success',
        message: `Conta individual para ${newEmail} criada com sucesso com papel de ${newRole.toUpperCase()}!`,
      })
      setShowCreateForm(false)
      setNewName('')
      setNewEmail('')
      setNewPassword('')
      setNewPasswordConfirm('')
      setNewCargo('')
      setNewOrgao('')
      await loadUsers()
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Falha ao criar usuário institucional.',
      })
    } finally {
      setSubmittingUser(false)
    }
  }

  const handleToggleStatus = async (targetUser: ManagedUserRecord) => {
    if (!user) return
    if (targetUser.id === user.id) {
      alert('Você não pode desativar a sua própria conta ativa.')
      return
    }
    const action = targetUser.status === 'ativo' ? 'desativar' : 'ativar'
    if (
      !confirm(`Deseja realmente ${action} a conta de ${targetUser.name} (${targetUser.email})?`)
    ) {
      return
    }

    try {
      await toggleUserStatus(targetUser, {
        id: user.id,
        email: user.email,
        name: user.name,
      })
      setFeedback({
        type: 'success',
        message: `Status do usuário ${targetUser.name} atualizado para ${action === 'desativar' ? 'DESATIVADO' : 'ATIVO'}.`,
      })
      await loadUsers()
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Erro ao alterar status do usuário.',
      })
    }
  }

  const handleRoleChange = async (targetUser: ManagedUserRecord, newR: UserRole) => {
    if (!user) return
    if (targetUser.id === user.id && newR !== 'admin') {
      alert('Você não pode revogar o papel de administrador da sua própria sessão.')
      return
    }

    try {
      await updateInstitucionalUser(
        targetUser.id,
        { role: newR },
        { id: user.id, email: user.email, name: user.name },
      )
      setFeedback({
        type: 'success',
        message: `Papel do usuário ${targetUser.name} alterado para ${newR.toUpperCase()}.`,
      })
      await loadUsers()
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Erro ao alterar papel do usuário.',
      })
    }
  }

  const handleRunPurgeManual = async () => {
    setPurging(true)
    setPurgeResult(null)
    setFeedback(null)
    try {
      const res = await triggerTelemetryPurge()
      setPurgeResult(res)
      setFeedback({
        type: 'success',
        message: `Purga executada! ${res.total_purged} registros de telemetria bruta com mais de 180 dias foram removidos.`,
      })
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Erro ao acionar rotina de purga no servidor.',
      })
    } finally {
      setPurging(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1A2A5A] pb-3">
        <div className="flex items-center gap-1.5 bg-[#0A1128] p-1 rounded-xl border border-[#1A2A5A]">
          <button
            type="button"
            onClick={() => setSubTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'users'
                ? 'bg-[#3B82F6] text-white shadow-sm shadow-[#3B82F6]/30'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Contas Individuais & Papéis</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'audit'
                ? 'bg-[#3B82F6] text-white shadow-sm shadow-[#3B82F6]/30'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Trilha de Auditoria</span>
            {auditEvents.length > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-black/30 font-mono">
                {auditEvents.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setSubTab('purge')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'purge'
                ? 'bg-[#3B82F6] text-white shadow-sm shadow-[#3B82F6]/30'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Purga 180 Dias</span>
          </button>
        </div>

        {subTab === 'users' && isAdmin && (
          <button
            type="button"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] flex items-center gap-1.5 shadow-md shadow-[#10B981]/20 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{showCreateForm ? 'Cancelar' : 'Nova Conta Individual'}</span>
          </button>
        )}
      </div>

      {/* Feedback banner */}
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

      {/* SUBTAB 1: USERS MANAGEMENT */}
      {subTab === 'users' && (
        <div className="space-y-4">
          {/* Matriz explicativa de Papéis & Bloqueio */}
          <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#101B3A] border border-[#3B82F6]/30 space-y-1">
              <span className="font-bold text-[#60A5FA] flex items-center gap-1.5 text-xs">
                <Shield className="w-3.5 h-3.5" />
                Papel Administrador (admin)
              </span>
              <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                Gestão total do órgão: criação e desativação de contas, atribuição de papéis, acesso
                à trilha de auditoria soberana, acionamento de purga e configurações do município.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#101B3A] border border-[#10B981]/30 space-y-1">
              <span className="font-bold text-[#10B981] flex items-center gap-1.5 text-xs">
                <Users className="w-3.5 h-3.5" />
                Papel Operador (operador)
              </span>
              <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                Acesso à operação de campo (coleta via acelerômetro DeviceMotion), consulta a
                eventos de pavimento e cockpit técnico. Sem permissão para gerenciar usuários.
              </p>
            </div>
          </div>

          {/* Bloqueio de auto-registro pill */}
          <div className="p-3 rounded-xl bg-[#101B3A] border border-[#1A2A5A] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#10B981]" />
              <span className="text-[#CBD5E1]">
                <b>Bloqueio de Auto-registro Público:</b> ATIVO. Novas contas só podem ser criadas
                por um Administrador autenticado do órgão.
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40">
              Hardened RLS
            </span>
          </div>

          {/* Formulário de Criação de Novo Usuário (Admin only) */}
          {showCreateForm && isAdmin && (
            <form
              onSubmit={handleCreateUser}
              className="p-5 rounded-2xl bg-[#0A1128] border-2 border-[#10B981]/40 space-y-4 animate-in fade-in"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#1A2A5A]">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#10B981]" />
                  Cadastrar Novo Usuário Institucional Individual
                </h4>
                <span className="text-[10px] font-mono text-[#94A3B8]">
                  Criação autorizada por: {user?.name}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#CBD5E1] mb-1">
                    Nome Completo do Servidor/Técnico *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ex.: Engenheiro João da Silva"
                    className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-xl px-3 py-2 text-xs text-white placeholder-[#64748B] focus:ring-1 focus:ring-[#10B981] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#CBD5E1] mb-1">
                    E-mail Institucional Oficial *
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="joao.silva@curitiba.pr.gov.br"
                    className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-xl px-3 py-2 text-xs text-white placeholder-[#64748B] focus:ring-1 focus:ring-[#10B981] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#CBD5E1] mb-1">
                    Papel Atribuído *
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-[#10B981] focus:outline-none font-medium"
                  >
                    <option value="operador">Operador (Coleta & Consultas)</option>
                    <option value="admin">Administrador (Gestão & Gabinete)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#CBD5E1] mb-1">
                    Cargo / Função Pública
                  </label>
                  <input
                    type="text"
                    value={newCargo}
                    onChange={(e) => setNewCargo(e.target.value)}
                    placeholder="Ex.: Fiscal de Obras / Pavimentação"
                    className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-xl px-3 py-2 text-xs text-white placeholder-[#64748B] focus:ring-1 focus:ring-[#10B981] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#CBD5E1] mb-1">
                    Secretaria / Órgão
                  </label>
                  <input
                    type="text"
                    value={newOrgao}
                    onChange={(e) => setNewOrgao(e.target.value)}
                    placeholder="Ex.: Secretaria de Obras Públicas"
                    className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-xl px-3 py-2 text-xs text-white placeholder-[#64748B] focus:ring-1 focus:ring-[#10B981] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#CBD5E1] mb-1">
                    Senha Provisória (Mínimo 8 caracteres) *
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-xl px-3 py-2 text-xs text-white placeholder-[#64748B] focus:ring-1 focus:ring-[#10B981] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#CBD5E1] mb-1">
                    Confirmar Senha Provisória *
                  </label>
                  <input
                    type="password"
                    required
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#101B3A] border border-[#1A2A5A] rounded-xl px-3 py-2 text-xs text-white placeholder-[#64748B] focus:ring-1 focus:ring-[#10B981] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1A2A5A]">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs bg-[#101B3A] text-[#94A3B8] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingUser}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] flex items-center gap-1.5 shadow-md shadow-[#10B981]/25 disabled:opacity-50"
                >
                  {submittingUser ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Cadastrar Conta & Gravar Auditoria</span>
                </button>
              </div>
            </form>
          )}

          {/* Lista de Contas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#94A3B8] px-1">
              <span>Usuários cadastrados no órgão ({usersList.length})</span>
              <button
                type="button"
                onClick={loadUsers}
                className="hover:text-white flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Atualizar</span>
              </button>
            </div>

            {loadingUsers ? (
              <div className="p-8 text-center text-xs text-[#94A3B8] flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#3B82F6]" />
                <span>Carregando usuários institucionais...</span>
              </div>
            ) : usersList.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] text-center text-xs text-[#94A3B8]">
                Nenhum usuário localizado.
              </div>
            ) : (
              <div className="space-y-2.5">
                {usersList.map((u) => {
                  const isCurrentUser = u.id === user?.id
                  return (
                    <div
                      key={u.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        u.status === 'desativado'
                          ? 'bg-[#0A1128]/60 border-[#EF4444]/20 opacity-70'
                          : 'bg-[#0A1128] border-[#1A2A5A] hover:border-[#3B82F6]/40'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#F8FAFC]">{u.name}</span>
                            {isCurrentUser && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#3B82F6]/20 text-[#60A5FA] border border-[#3B82F6]/30">
                                Você
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                                u.role === 'admin'
                                  ? 'bg-[#3B82F6]/20 text-[#60A5FA] border-[#3B82F6]/40'
                                  : 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40'
                              }`}
                            >
                              {u.role === 'admin' ? 'Administrador' : 'Operador'}
                            </span>
                            <span
                              className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded ${
                                u.status === 'ativo'
                                  ? 'text-[#10B981] bg-[#10B981]/10'
                                  : 'text-[#EF4444] bg-[#EF4444]/10'
                              }`}
                            >
                              {u.status}
                            </span>
                          </div>
                          <div className="text-xs text-[#94A3B8] flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="font-mono text-[#CBD5E1]">{u.email}</span>
                            {u.cargo && <span>• {u.cargo}</span>}
                            {u.orgao && <span>• {u.orgao}</span>}
                          </div>
                        </div>

                        {/* Ações de Gestão (Admin Only) */}
                        {isAdmin && (
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Alterar Papel */}
                            <select
                              value={u.role}
                              disabled={isCurrentUser}
                              onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                              className="bg-[#101B3A] border border-[#1A2A5A] rounded-lg px-2.5 py-1 text-xs text-[#CBD5E1] focus:ring-1 focus:ring-[#3B82F6] disabled:opacity-40"
                              title={
                                isCurrentUser
                                  ? 'Não é possível alterar seu próprio papel'
                                  : 'Alterar papel'
                              }
                            >
                              <option value="operador">Papel: Operador</option>
                              <option value="admin">Papel: Admin</option>
                            </select>

                            {/* Desativar / Ativar */}
                            <button
                              type="button"
                              disabled={isCurrentUser}
                              onClick={() => handleToggleStatus(u)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                                u.status === 'ativo'
                                  ? 'bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#FCA5A5] border border-[#EF4444]/30'
                                  : 'bg-[#10B981]/15 hover:bg-[#10B981]/25 text-[#A7F3D0] border border-[#10B981]/30'
                              } disabled:opacity-40`}
                              title={isCurrentUser ? 'Não é possível desativar a si mesmo' : ''}
                            >
                              {u.status === 'ativo' ? (
                                <>
                                  <UserX className="w-3 h-3" />
                                  <span>Desativar</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3 h-3" />
                                  <span>Ativar</span>
                                </>
                              )}
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
      )}

      {/* SUBTAB 2: AUDIT TRAIL */}
      {subTab === 'audit' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] text-xs text-[#94A3B8] flex items-center justify-between">
            <div>
              <span className="font-bold text-[#F8FAFC] block">
                Trilha de Auditoria com Autoria Gravada
              </span>
              <span>
                Cada evento registra formalmente o autor (ID, e-mail, papel de admin/operador ou
                SISTEMA).
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#60A5FA] bg-[#3B82F6]/10 px-2.5 py-1 rounded border border-[#3B82F6]/30 font-bold">
              Art. 27 LC 182/2021
            </span>
          </div>

          {auditEvents.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#94A3B8] rounded-2xl bg-[#0A1128] border border-[#1A2A5A]">
              Nenhum evento registrado na trilha de auditoria até o momento.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {auditEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-2 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-[#1A2A5A]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#60A5FA]">{evt.event}</span>
                      <span
                        className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${
                          evt.author?.role === 'system'
                            ? 'bg-[#8B5CF6]/20 text-[#A78BFA]'
                            : evt.author?.role === 'admin'
                              ? 'bg-[#3B82F6]/20 text-[#60A5FA]'
                              : 'bg-[#10B981]/20 text-[#10B981]'
                        }`}
                      >
                        {evt.author?.role || 'user'}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#94A3B8]">
                      {new Date(evt.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[#64748B] block font-mono uppercase text-[9px]">
                        Autor Responsável:
                      </span>
                      <span className="font-semibold text-white">
                        {evt.author?.name || 'SISTEMA'}
                      </span>{' '}
                      <span className="text-[#94A3B8]">({evt.author?.email || 'N/A'})</span>
                    </div>
                    {evt.compliance && (
                      <div>
                        <span className="text-[#64748B] block font-mono uppercase text-[9px]">
                          Enquadramento Legal:
                        </span>
                        <span className="text-[#10B981] font-mono">{evt.compliance}</span>
                      </div>
                    )}
                  </div>

                  {evt.details && (
                    <div className="p-2 rounded bg-[#101B3A] border border-[#1A2A5A] text-[11px] font-mono text-[#CBD5E1] break-all">
                      {typeof evt.details === 'string'
                        ? evt.details
                        : JSON.stringify(evt.details, null, 2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: PURGA DE TELEMETRIA (>180 DIAS) */}
      {subTab === 'purge' && (
        <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#10B981]" />
                <h4 className="text-sm font-bold text-white">
                  Job Agendado de Purga Diária de Telemetria Bruta (&gt;180 Dias)
                </h4>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Em cumprimento ao compromisso público assumido na <b>/privacidade</b> (seção 2), a
                telemetria mecânica bruta (amostras inerciais de 50 Hz em{' '}
                <code>segment_readings</code> e sessões de campo em <code>field_sessions</code>) é
                purgada de forma irreversível após 180 dias.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 shrink-0">
              Cron Ativo: 03h30 BRT
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-1">
              <span className="font-bold text-[#F8FAFC] block">O que é purgado?</span>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                Registros com timestamp anterior a 180 dias nas tabelas de leituras inerciais brutas
                (<code>segment_readings</code> e <code>field_sessions</code>).
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-1">
              <span className="font-bold text-[#10B981] block">O que é preservado?</span>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                Todos os índices agregados de regularidade por segmento (<code>road_segments</code>{' '}
                / IMV e IMA) e histórico contábil para TCE/CGU.
              </p>
            </div>
          </div>

          {/* Botão de Disparo Manual de Teste / Simulação (Admin Only) */}
          {isAdmin && (
            <div className="pt-2 border-t border-[#1A2A5A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-[11px] text-[#94A3B8]">
                <span>
                  O job executa diariamente de forma autônoma às <b>03h30 BRT</b>. Você pode
                  disparar uma verificação/purga manual imediata para teste de homologação:
                </span>
              </div>
              <button
                type="button"
                onClick={handleRunPurgeManual}
                disabled={purging}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] flex items-center gap-1.5 shrink-0 transition-all shadow-md shadow-[#3B82F6]/25 disabled:opacity-50"
              >
                {purging ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>Executar Purga Sob Demanda</span>
              </button>
            </div>
          )}

          {purgeResult && (
            <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#10B981]/40 text-xs text-[#CBD5E1] space-y-1 animate-in fade-in">
              <div className="font-bold text-[#10B981] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Resultado da Execução:</span>
              </div>
              <p className="text-[11px]">
                • Data de corte (180 dias):{' '}
                <span className="font-mono text-white">{purgeResult.cutoff_date}</span>
                <br />• Leituras brutas de segmentos purgadas:{' '}
                <span className="font-mono text-white">{purgeResult.purged_segment_readings}</span>
                <br />• Sessões de campo purgadas:{' '}
                <span className="font-mono text-white">{purgeResult.purged_field_sessions}</span>
                <br />• Total de registros eliminados:{' '}
                <span className="font-mono text-white font-bold">{purgeResult.total_purged}</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
