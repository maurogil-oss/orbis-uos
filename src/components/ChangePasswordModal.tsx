import React, { useState } from 'react'
import {
  KeyRound,
  X,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { user, changePassword } = useAuth()

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')

  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const resetForm = () => {
    setOldPassword('')
    setNewPassword('')
    setNewPasswordConfirm('')
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!oldPassword) {
      setErrorMessage('Informe a senha atual de acesso.')
      return
    }

    if (newPassword.length < 8) {
      setErrorMessage('A nova senha deve possuir no mínimo 8 caracteres.')
      return
    }

    if (newPassword === oldPassword) {
      setErrorMessage('A nova senha deve ser diferente da senha atual.')
      return
    }

    if (newPassword !== newPasswordConfirm) {
      setErrorMessage('A confirmação da nova senha não confere.')
      return
    }

    setLoading(true)

    try {
      await changePassword(oldPassword, newPassword, newPasswordConfirm)
      setSuccessMessage(
        'Senha institucional alterada com sucesso! Suas credenciais foram atualizadas.',
      )
      setOldPassword('')
      setNewPassword('')
      setNewPasswordConfirm('')
    } catch (err: any) {
      console.error('Erro ao alterar senha institucional:', err)
      const rawMsg = err?.data?.message || err?.message || ''
      if (
        rawMsg.toLowerCase().includes('oldpassword') ||
        rawMsg.toLowerCase().includes('old password') ||
        rawMsg.toLowerCase().includes('incorreta') ||
        rawMsg.toLowerCase().includes('invalid')
      ) {
        setErrorMessage(
          'A senha atual informada está incorreta. Verifique suas credenciais e tente novamente.',
        )
      } else if (rawMsg.includes('min') || rawMsg.includes('caracteres')) {
        setErrorMessage('A nova senha deve conter pelo menos 8 caracteres.')
      } else {
        setErrorMessage(
          err?.message ||
            'Falha ao atualizar a senha no servidor. Verifique se a senha atual está correta.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-[#101B3A] border border-[#1A2A5A] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 relative">
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1A2A5A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC]">Alterar Minha Senha</h2>
              <span className="text-xs text-[#94A3B8]">
                Conta institucional: <b>{user?.email || 'servidor@orbis-uos.com.br'}</b>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-lg bg-[#0A1128] border border-[#1A2A5A] hover:border-[#3B82F6] text-[#94A3B8] hover:text-white flex items-center justify-center text-sm transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notificações / Alertas */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/40 flex items-start gap-2.5 text-xs text-[#FCA5A5] animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#EF4444]" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 flex items-start gap-2.5 text-xs text-[#A7F3D0] animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#10B981]" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Senha Atual */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#CBD5E1]">Senha Atual</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showOldPassword ? 'text' : 'password'}
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Informe sua senha atual"
                className="w-full bg-[#0A1128] border border-[#1A2A5A] focus:border-[#3B82F6] rounded-xl pl-9 pr-10 py-2.5 text-xs text-[#F8FAFC] placeholder:text-[#94A3B8]/50 focus:outline-none focus:ring-1 focus:ring-[#3B82F6] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#F8FAFC]"
                tabIndex={-1}
              >
                {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Nova Senha */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#CBD5E1]">
              Nova Senha (Mínimo 8 caracteres)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha segura"
                className="w-full bg-[#0A1128] border border-[#1A2A5A] focus:border-[#3B82F6] rounded-xl pl-9 pr-10 py-2.5 text-xs text-[#F8FAFC] placeholder:text-[#94A3B8]/50 focus:outline-none focus:ring-1 focus:ring-[#3B82F6] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#F8FAFC]"
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirmar Nova Senha */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#CBD5E1]">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                placeholder="Repita a nova senha para confirmação"
                className="w-full bg-[#0A1128] border border-[#1A2A5A] focus:border-[#3B82F6] rounded-xl pl-9 pr-10 py-2.5 text-xs text-[#F8FAFC] placeholder:text-[#94A3B8]/50 focus:outline-none focus:ring-1 focus:ring-[#3B82F6] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#F8FAFC]"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Requisitos e Orientações */}
          <div className="p-3 rounded-xl bg-[#0A1128] border border-[#1A2A5A] text-[11px] text-[#94A3B8] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-[#60A5FA]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Diretrizes de Segurança Institucional:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[#94A3B8] pl-1">
              <li>Mínimo de 8 caracteres alfanuméricos</li>
              <li>Recomendado uso de letras maiúsculas, dígitos e símbolos</li>
              <li>A nova credencial passa a valer imediatamente no próximo login</li>
            </ul>
          </div>

          {/* Ações do Formulário */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#1A2A5A]">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#0A1128] hover:bg-[#1A2A5A] border border-[#1A2A5A] text-[#94A3B8] hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] shadow-md shadow-[#3B82F6]/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <span>Atualizar Senha</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
