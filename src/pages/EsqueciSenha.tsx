import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lock,
  ArrowLeft,
  Building2,
  ShieldCheck,
  Info,
} from 'lucide-react'
import { OrbisLogo } from '@/components/OrbisLogo'

export default function EsqueciSenha() {
  const { requestPasswordReset } = useAuth()

  const [email, setEmail] = useState('institucional@orbis-uos.com.br')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)

    try {
      const res = await requestPasswordReset(email)
      if (res.error) {
        throw res.error
      }
      setSuccess(true)
    } catch (err: any) {
      console.error('Erro na solicitação de redefinição de senha:', err)
      const raw = err?.data?.message || err?.message || ''
      if (raw.toLowerCase().includes('failed to send') || raw.toLowerCase().includes('smtp')) {
        setErrorMsg(
          'O servidor identificou a solicitação, porém o serviço de envio de e-mails (SMTP) está em processo de homologação institucional. Para acesso emergencial, contate o administrador do sistema.',
        )
      } else {
        setErrorMsg(
          err?.message ||
            'Não foi possível processar a solicitação no momento. Verifique o e-mail informado.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

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
              Recuperação de Credencial
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F8FAFC]">
              Esqueci Minha Senha
            </h1>
            <p className="text-xs text-[#94A3B8]">
              Solicitação oficial de redefinição de acesso institucional — ORBIS.UOS
            </p>
          </div>
        </div>

        {/* Selo de Sigilo */}
        <div className="p-4 rounded-xl bg-[#101B3A] border border-[#3B82F6]/30 shadow-lg space-y-2">
          <div className="flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-[#60A5FA] shrink-0 mt-0.5" />
            <div className="text-xs text-[#CBD5E1] leading-relaxed">
              <span className="font-bold text-[#F8FAFC]">Segurança Governamental:</span> Se o e-mail
              institucional estiver cadastrado no sistema, um link criptografado de redefinição com
              validade temporária será emitido com protocolo de auditoria.
            </div>
          </div>
        </div>

        {/* Formulário / Confirmação */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] shadow-2xl space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/40 flex items-start gap-2 text-xs text-[#FCA5A5]">
              <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {success ? (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 space-y-2.5">
                <div className="flex items-center gap-2 text-[#34D399] font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>Solicitação Enviada com Sucesso</span>
                </div>
                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  Enviamos as instruções e o link criptografado de recuperação para o e-mail{' '}
                  <span className="font-mono text-[#F8FAFC] font-bold">{email}</span>.
                </p>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Por favor, verifique sua caixa de entrada e a pasta de spam. O link para criar uma
                  nova senha expira em breve.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2 text-xs text-[#94A3B8]">
                <div className="flex items-center gap-1.5 text-[#60A5FA] font-bold text-[11px]">
                  <Info className="w-3.5 h-3.5" />
                  <span>Acesso Imediato ao Gabinete</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Caso seu órgão necessite de liberação imediata enquanto a infraestrutura SMTP é
                  homologada, utilize a credencial institucional atualizada comunicada ao Gestor de
                  Gabinete ou redefina diretamente pelo console administrativo.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  to="/login"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] flex items-center justify-center gap-2 transition-all shadow-md shadow-[#3B82F6]/20"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar para a Tela de Login</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="w-full py-2 text-xs text-[#94A3B8] hover:text-[#CBD5E1] transition-colors"
                >
                  Solicitar novamente com outro e-mail
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider"
                >
                  E-mail Institucional Cadastrado
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="institucional@orbis-uos.com.br"
                    className="w-full bg-[#101B3A] border border-[#1A2A5A] focus:border-[#3B82F6] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8]/50 focus:outline-none focus:ring-1 focus:ring-[#3B82F6] transition-all"
                  />
                </div>
                <p className="text-[11px] text-[#94A3B8]">
                  Informe o endereço oficial cadastrado no sistema (ex.: gabinete ou secretaria).
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] shadow-lg shadow-[#3B82F6]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando link de recuperação...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar E-mail de Recuperação</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 border-t border-[#1A2A5A]">
                <Link
                  to="/login"
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-[#94A3B8] hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Lembrei minha senha — Voltar ao Login</span>
                </Link>
              </div>
            </form>
          )}

          {/* Orientações Institucionais */}
          <div className="p-3 rounded-xl bg-[#101B3A]/60 border border-[#1A2A5A] space-y-1 text-xs text-[#94A3B8]">
            <div className="flex items-center gap-1.5 text-[#60A5FA] font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span>Contas Homologadas para Demonstração</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              O fluxo atende aos usuários institucionais cadastrados:{' '}
              <span className="font-mono text-[#CBD5E1]">institucional@orbis-uos.com.br</span>{' '}
              (Administrador/Gabinete) e{' '}
              <span className="font-mono text-[#CBD5E1]">operador@orbis-uos.com.br</span>{' '}
              (Fiscalização).
            </p>
          </div>
        </div>

        {/* Links públicos */}
        <div className="text-center space-y-2 text-xs text-[#94A3B8]">
          <Link to="/" className="text-[#3B82F6] hover:text-[#60A5FA] underline font-medium">
            ← Retornar à página pública principal
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
