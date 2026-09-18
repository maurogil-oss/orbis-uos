import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  Shield,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  AlertCircle,
  FileCheck2,
  Building2,
  Loader2,
  CheckCircle2,
} from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Rota de retorno após autenticação ou default /cockpit
  const fromLocation = (location.state as any)?.from?.pathname || '/cockpit'

  const [email, setEmail] = useState('institucional@orbis.gov.br')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)

    try {
      await login(email, password)
      navigate(fromLocation, { replace: true })
    } catch (err: any) {
      console.error('Falha na autenticação institucional:', err)
      setErrorMsg(
        'Credenciais institucionais inválidas ou não cadastradas. Por favor, confira o e-mail oficial e a senha.',
      )
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
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#1A2A5A] border border-[#3B82F6]/50 shadow-xl shadow-[#3B82F6]/20 mb-2">
            <Shield className="w-7 h-7 text-white stroke-[2.2]" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase bg-[#101B3A] text-[#60A5FA] px-3 py-1 rounded-full border border-[#1A2A5A] font-bold">
              Ambiente Restrito Governamental
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F8FAFC]">
              Acesso Institucional — ORBIS.UOS
            </h1>
            <p className="text-xs text-[#94A3B8]">
              Autenticação soberana para Gabinetes de Prefeitos, Secretarias e Equipes Técnicas
            </p>
          </div>
        </div>

        {/* Selo / Nota de Sigilo e Conformidade Institucional */}
        <div className="p-4 rounded-xl bg-[#101B3A] border border-[#3B82F6]/30 shadow-lg space-y-2">
          <div className="flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-[#60A5FA] shrink-0 mt-0.5" />
            <div className="text-xs text-[#CBD5E1] leading-relaxed">
              <span className="font-bold text-[#F8FAFC]">Aviso de Conformidade & Sigilo:</span>{' '}
              Acesso restrito a servidores públicos autorizados e prefeituras em fase de
              demonstração e validação do CPSI (LC 182/2021). Todas as tentativas de autenticação e
              sessões são registradas em trilha de auditoria para controle de integridade.
            </div>
          </div>
        </div>

        {/* Formulário de Login */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] shadow-2xl space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/40 flex items-start gap-2 text-xs text-[#FCA5A5]">
              <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider"
              >
                E-mail Oficial / Institucional
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
                  placeholder="exemplo@curitiba.pr.gov.br"
                  className="w-full bg-[#101B3A] border border-[#1A2A5A] focus:border-[#3B82F6] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8]/50 focus:outline-none focus:ring-1 focus:ring-[#3B82F6] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider"
                >
                  Senha de Acesso
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#101B3A] border border-[#1A2A5A] focus:border-[#3B82F6] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8]/50 focus:outline-none focus:ring-1 focus:ring-[#3B82F6] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] shadow-lg shadow-[#3B82F6]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Painel Institucional</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Dica de Demonstração para Testes de Prefeitura */}
          <div className="p-3 rounded-xl bg-[#101B3A]/60 border border-[#1A2A5A] space-y-1 text-xs text-[#94A3B8]">
            <div className="flex items-center gap-1.5 text-[#60A5FA] font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span>Acesso para Demonstrações Oficiais</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Servidores e avaliadores municipais podem utilizar a credencial institucional
              homologada para testar o Modo Gabinete e o Enquadramento CPSI.
            </p>
          </div>
        </div>

        {/* Links públicos */}
        <div className="text-center space-y-2 text-xs text-[#94A3B8]">
          <Link to="/" className="text-[#3B82F6] hover:text-[#60A5FA] underline font-medium">
            ← Retornar à página pública principal
          </Link>
          <div className="text-[11px]">
            O gestor decide; o sistema documenta. • ORBIS.UOS v0.0.8
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
