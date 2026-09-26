import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  KeyRound,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Check,
  X,
} from 'lucide-react'
import { OrbisLogo } from '@/components/OrbisLogo'

export default function RedefinirSenha() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { confirmPasswordReset } = useAuth()

  // O PocketBase envia o token via query param na URL configurada
  // Suporta ?token=... ou #token=...
  const tokenParam = searchParams.get('token') || ''

  const [token, setToken] = useState(tokenParam)
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      // Checar se veio no hash da URL (#token=...)
      const hash = window.location.hash
      if (hash.includes('token=')) {
        const match = hash.match(/token=([^&]+)/)
        if (match && match[1]) {
          setToken(match[1])
        }
      }
    }
  }, [tokenParam])

  // Critérios de validação de senha forte
  const criteria = {
    length: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
    match: password.length > 0 && password === passwordConfirm,
  }

  // Pontuação de força: 0 a 5
  const strengthScore = [
    criteria.length,
    criteria.hasUpper,
    criteria.hasLower,
    criteria.hasNumber,
    criteria.hasSpecial,
  ].filter(Boolean).length

  const getStrengthLabel = () => {
    if (password.length === 0)
      return { label: 'Não informada', color: 'text-[#94A3B8]', bar: 'w-0' }
    if (strengthScore <= 2)
      return { label: 'Fraca', color: 'text-[#EF4444]', bar: 'w-1/4 bg-[#EF4444]' }
    if (strengthScore === 3)
      return { label: 'Razoável', color: 'text-[#F59E0B]', bar: 'w-2/4 bg-[#F59E0B]' }
    if (strengthScore === 4)
      return { label: 'Boa', color: 'text-[#3B82F6]', bar: 'w-3/4 bg-[#3B82F6]' }
    return { label: 'Forte (Excelente)', color: 'text-[#10B981]', bar: 'w-full bg-[#10B981]' }
  }

  const isFormValid = criteria.length && password === passwordConfirm && token.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!token.trim()) {
      setErrorMsg(
        'Token de redefinição não encontrado. Utilize o link enviado por e-mail ou informe o token oficial.',
      )
      return
    }

    if (password.length < 8) {
      setErrorMsg('A nova senha deve possuir pelo menos 8 caracteres.')
      return
    }

    if (password !== passwordConfirm) {
      setErrorMsg('A confirmação da senha não confere com a nova senha digitada.')
      return
    }

    setLoading(true)

    try {
      const res = await confirmPasswordReset(token.trim(), password)
      if (res.error) {
        throw res.error
      }
      setSuccess(true)
    } catch (err: any) {
      console.error('Falha ao confirmar redefinição de senha:', err)
      const raw = err?.data?.message || err?.message || ''
      if (
        raw.toLowerCase().includes('token') ||
        raw.toLowerCase().includes('expired') ||
        raw.toLowerCase().includes('invalid')
      ) {
        setErrorMsg(
          'O token de recuperação é inválido ou já expirou. Solicite um novo link na página de recuperação.',
        )
      } else {
        setErrorMsg(
          err?.message ||
            'Não foi possível redefinir a senha. Verifique as informações ou solicite um novo link.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const strength = getStrengthLabel()

  return (
    <div className="min-h-screen bg-[#070D1F] text-[#F8FAFC] flex flex-col justify-between pt-24 pb-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#3B82F6]/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full mx-auto relative z-10 space-y-6">
        {/* Header institucional */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <OrbisLogo height={52} colorMode="dark" variant="full" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase bg-[#101B3A] text-[#60A5FA] px-3 py-1 rounded-full border border-[#1A2A5A] font-bold">
              Segurança Institucional
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F8FAFC]">
              Redefinir Nova Senha
            </h1>
            <p className="text-xs text-[#94A3B8]">
              Definição de nova credencial segura para a conta institucional — ORBIS.UOS
            </p>
          </div>
        </div>

        {/* Notificação se não há token */}
        {!token && !success && (
          <div className="p-4 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/40 text-xs text-[#FDE68A] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#F59E0B]">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Atenção: Nenhum Token Detectado na URL</span>
            </div>
            <p className="leading-relaxed">
              O link de redefinição normalmente contém um parâmetro de validação (ex:{' '}
              <span className="font-mono text-[#F8FAFC]">?token=...</span>). Você pode colar o token
              manualmente no campo abaixo ou solicitar um novo link oficial.
            </p>
          </div>
        )}

        {/* Card do Formulário */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] shadow-2xl space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/40 flex items-start gap-2 text-xs text-[#FCA5A5]">
              <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {success ? (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 space-y-2.5 text-center">
                <div className="w-12 h-12 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center mx-auto text-[#34D399]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#F8FAFC]">
                  Senha Redefinida com Sucesso!
                </h3>
                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  Sua nova credencial institucional foi criptografada e armazenada com sucesso no
                  servidor PocketBase.
                </p>
                <div className="p-2.5 rounded-lg bg-[#101B3A] border border-[#1A2A5A] text-[11px] text-[#94A3B8]">
                  Você já pode acessar o Cockpit e o Ambiente Restrito utilizando a nova senha.
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/login', { replace: true })}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] shadow-lg shadow-[#3B82F6]/30 flex items-center justify-center gap-2 transition-all"
              >
                <span>Ir para a Tela de Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo de Token se não veio na URL */}
              <div className="space-y-1.5">
                <label
                  htmlFor="token"
                  className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider"
                >
                  Token de Segurança da Recuperação
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    id="token"
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Cole aqui o token recebido no e-mail"
                    className="w-full bg-[#101B3A] border border-[#1A2A5A] focus:border-[#3B82F6] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#F8FAFC] font-mono placeholder:font-sans placeholder:text-[#94A3B8]/50 focus:outline-none focus:ring-1 focus:ring-[#3B82F6] transition-all"
                  />
                </div>
              </div>

              {/* Nova Senha */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider"
                >
                  Nova Senha de Acesso
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nova senha segura"
                    className="w-full bg-[#101B3A] border border-[#1A2A5A] focus:border-[#3B82F6] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8]/50 focus:outline-none focus:ring-1 focus:ring-[#3B82F6] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#F8FAFC]"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Barra de Força da Senha */}
                {password.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#94A3B8]">Força da senha:</span>
                      <span className={`font-semibold ${strength.color}`}>{strength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#101B3A] rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${strength.bar}`} />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmar Nova Senha */}
              <div className="space-y-1.5">
                <label
                  htmlFor="passwordConfirm"
                  className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider"
                >
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="passwordConfirm"
                    type={showPasswordConfirm ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full bg-[#101B3A] border border-[#1A2A5A] focus:border-[#3B82F6] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8]/50 focus:outline-none focus:ring-1 focus:ring-[#3B82F6] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#F8FAFC]"
                    tabIndex={-1}
                  >
                    {showPasswordConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Checklist de requisitos de segurança */}
              <div className="p-3 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-1.5 text-[11px]">
                <span className="font-semibold text-[#CBD5E1] block">
                  Requisitos de Segurança Institucional:
                </span>
                <div className="grid grid-cols-2 gap-1 text-[#94A3B8]">
                  <div className="flex items-center gap-1.5">
                    {criteria.length ? (
                      <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-[#64748B]" />
                    )}
                    <span className={criteria.length ? 'text-[#CBD5E1]' : ''}>8+ caracteres</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {criteria.hasUpper ? (
                      <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-[#64748B]" />
                    )}
                    <span className={criteria.hasUpper ? 'text-[#CBD5E1]' : ''}>
                      Letra maiúscula
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {criteria.hasLower ? (
                      <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-[#64748B]" />
                    )}
                    <span className={criteria.hasLower ? 'text-[#CBD5E1]' : ''}>
                      Letra minúscula
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {criteria.hasNumber ? (
                      <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-[#64748B]" />
                    )}
                    <span className={criteria.hasNumber ? 'text-[#CBD5E1]' : ''}>
                      Dígito numérico
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {criteria.hasSpecial ? (
                      <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-[#64748B]" />
                    )}
                    <span className={criteria.hasSpecial ? 'text-[#CBD5E1]' : ''}>
                      Caractere especial
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {criteria.match ? (
                      <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-[#64748B]" />
                    )}
                    <span className={criteria.match ? 'text-[#CBD5E1]' : ''}>Senhas coincidem</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] shadow-lg shadow-[#3B82F6]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Redefinindo senha...</span>
                  </>
                ) : (
                  <>
                    <span>Confirmar Nova Senha</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 border-t border-[#1A2A5A]">
                <Link
                  to="/esqueci-senha"
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-[#94A3B8] hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Não tem token ou expirou? Solicitar novo e-mail</span>
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Links públicos */}
        <div className="text-center space-y-2 text-xs text-[#94A3B8]">
          <Link to="/login" className="text-[#3B82F6] hover:text-[#60A5FA] underline font-medium">
            ← Retornar à tela de autenticação
          </Link>
          <div className="text-[11px]">
            O gestor decide; o sistema documenta. • ORBIS.UOS v0.0.25
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto text-center text-[10px] text-[#64748B] pt-6">
        Sistema em conformidade com o Marco Legal das Startups (LC 182/2021) e LGPD (Lei
        13.709/2018).
      </div>
    </div>
  )
}
