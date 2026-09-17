import React, { useState } from 'react'
import {
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Shield,
  Loader2,
  Calendar,
  Lock,
  Headphones,
  RotateCcw,
} from 'lucide-react'
import { createLead, CreateLeadPayload } from '@/services/leads'

interface FormErrors {
  nome?: string
  email?: string
  cargo?: string
  orgao?: string
  porte?: string
  telefone?: string
}

export function PilotForm() {
  const [formData, setFormData] = useState<CreateLeadPayload>({
    nome: '',
    email: '',
    cargo: '',
    orgao: '',
    porte: 'Municipal',
    telefone: '',
  })
  const [tierIntention, setTierIntention] = useState<'pequena' | 'media' | 'grande'>('pequena')

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [backendError, setBackendError] = useState<string | null>(null)

  // Brazilian phone mask helper
  const formatBRPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 10) {
      // (XX) XXXX-XXXX
      return numbers
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .slice(0, 14)
    }
    // (XX) XXXXX-XXXX
    return numbers
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15)
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome completo é obrigatório'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail institucional é obrigatório'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Insira um e-mail válido contendo "@" e ponto'
      }
    }

    if (!formData.cargo.trim()) {
      newErrors.cargo = 'Cargo é obrigatório'
    }

    if (!formData.orgao.trim()) {
      newErrors.orgao = 'Órgão ou instituição é obrigatório'
    }

    if (!formData.porte) {
      newErrors.porte = 'Selecione o porte do órgão'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'telefone') {
      const masked = formatBRPhone(value)
      setFormData((prev) => ({ ...prev, [name]: masked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // Clear inline error when typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBackendError(null)

    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      await createLead({
        nome: formData.nome.trim(),
        email: formData.email.trim().toLowerCase(),
        cargo: formData.cargo.trim(),
        orgao: formData.orgao.trim(),
        porte: formData.porte,
        telefone: formData.telefone?.trim() || undefined,
      })

      setIsSuccess(true)
    } catch (err: unknown) {
      // Check if duplicate email error or connection error
      const errorMessage = err instanceof Error ? err.message : 'Falha ao processar solicitação.'
      if (
        errorMessage.toLowerCase().includes('unique') ||
        errorMessage.toLowerCase().includes('email')
      ) {
        setBackendError(
          'Este e-mail institucional já possui uma solicitação de piloto registrada. Nossa equipe entrará em contato.',
        )
      } else {
        setBackendError('Não foi possível enviar sua solicitação. Tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      nome: '',
      email: '',
      cargo: '',
      orgao: '',
      porte: 'Municipal',
      telefone: '',
    })
    setErrors({})
    setBackendError(null)
    setIsSuccess(false)
  }

  return (
    <section
      id="manifesto"
      className="py-24 sm:py-32 relative bg-[#070D1F] border-t border-[#1A2A5A]/50 scroll-mt-20"
    >
      {/* Background glow */}
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-[#3B82F6]/5 blur-[140px] rounded-full pointer-events-none" />

      {/* Anchor compatível */}
      <span id="piloto" className="block -mt-20 pt-20" aria-hidden="true" />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Heading, Supporting copy and Bullets */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101B3A] border border-[#1A2A5A] text-xs font-semibold text-[#10B981]">
              <Calendar className="w-3.5 h-3.5" />
              Marco Legal da Inovação • LC 182/2021 (CPSI)
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight leading-[1.15]">
              Manifesto de Interesse Institucional
            </h2>

            <p className="text-base text-[#94A3B8] leading-relaxed">
              Manifeste o interesse formal do seu órgão público em conduzir o piloto de validação
              técnica da plataforma ORBIS.UOS. Sem obra civil, sem compra de novos equipamentos e
              sem custo de entrada, com amparo no Contrato Público para Solução Inovadora (CPSI).
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/30 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-[#3B82F6]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#F8FAFC]">
                    Protocolo Institucional Assistido
                  </h4>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Assessoria técnica para o enquadramento ao Marco Legal e fornecimento de minuta
                    padronizada para a Procuradoria Geral do Município (PGM).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-4 h-4 text-[#3B82F6]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#F8FAFC]">
                    Soberania e Sigilo de Dados Públicos
                  </h4>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Ambiente institucional exclusivo, aderente às diretrizes da LGPD pública,
                    Governo Digital e com integridade criptográfica.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Headphones className="w-4 h-4 text-[#3B82F6]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#F8FAFC]">
                    Cooperação Federativa & Consórcios
                  </h4>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Elegível para contratação individual ou consórcios públicos intermunicipais,
                    potencializando a escala e a padronização regional.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#101B3A]/40 border border-[#1A2A5A] text-xs text-[#94A3B8] flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#3B82F6] shrink-0" />
              <span>
                <b>Sem risco fiscal:</b> Fase piloto sem antecipação de desembolso ou necessidade de
                licitação ordinária de longo prazo.
              </span>
            </div>
          </div>

          {/* Right Column: Pilot Form Card */}
          <div className="lg:col-span-7">
            <div className="bg-[#101B3A] border border-[#1A2A5A] rounded-2xl p-6 sm:p-10 shadow-2xl shadow-black/40 relative">
              {/* Dismissible Error Banner */}
              {backendError && (
                <div
                  role="alert"
                  className="mb-6 p-4 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] text-sm flex items-start justify-between gap-3 animate-fade-in"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{backendError}</p>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="underline text-xs mt-1.5 font-bold hover:text-white transition-colors"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBackendError(null)}
                    className="text-[#EF4444] hover:text-white transition-colors p-1"
                    aria-label="Dispensar aviso de erro"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Form or Success State */}
              {isSuccess ? (
                <div className="py-12 px-4 text-center space-y-6 animate-fade-in">
                  <div className="w-20 h-20 rounded-full bg-[#10B981]/15 border-2 border-[#10B981] mx-auto flex items-center justify-center text-[#10B981] shadow-lg shadow-[#10B981]/20">
                    <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-extrabold text-[#F8FAFC]">
                      Manifesto Registrado com Sucesso!
                    </h3>
                    <p className="text-base text-[#94A3B8] max-w-md mx-auto">
                      Protocolo formal recebido. O departamento de relações governamentais entrará
                      em contato em até 2 dias úteis.
                    </p>
                  </div>

                  <p className="text-xs text-[#94A3B8]/80 max-w-sm mx-auto">
                    Encaminharemos o modelo de despacho preliminar e a minuta do Termo de Referência
                    CPSI ajustados ao porte do seu município.
                  </p>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-[#F8FAFC] bg-[#1A2A5A] hover:bg-[#2563EB]/20 border border-[#1A2A5A] hover:border-[#3B82F6] transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Registrar outro manifesto
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="border-b border-[#1A2A5A] pb-4 mb-2">
                    <h3 className="text-xl font-bold text-[#F8FAFC] tracking-tight">
                      Manifesto de Interesse Institucional
                    </h3>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      Formalização do interesse técnico do ente federativo para fins de avaliação e
                      planejamento de piloto CPSI
                    </p>
                  </div>

                  {/* Field: Responsável Institucional */}
                  <div>
                    <label
                      htmlFor="form-nome"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#F8FAFC] mb-1.5"
                    >
                      Responsável Institucional <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      id="form-nome"
                      name="nome"
                      type="text"
                      required
                      aria-required="true"
                      aria-invalid={!!errors.nome}
                      aria-describedby={errors.nome ? 'error-nome' : undefined}
                      value={formData.nome}
                      onChange={handleChange}
                      placeholder="Nome do(a) gestor(a) ou secretário(a)"
                      className={`w-full h-11 px-3.5 rounded-lg bg-[#0A1128] text-sm text-[#F8FAFC] placeholder:text-[#94A3B8]/50 border transition-all ${
                        errors.nome
                          ? 'border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/40'
                          : 'border-[#1A2A5A] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/30'
                      }`}
                    />
                    {errors.nome && (
                      <p id="error-nome" className="text-xs text-[#EF4444] mt-1 font-medium">
                        {errors.nome}
                      </p>
                    )}
                  </div>

                  {/* Row: E-mail Institucional + Cargo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="form-email"
                        className="block text-xs font-semibold uppercase tracking-wider text-[#F8FAFC] mb-1.5"
                      >
                        E-mail Institucional Oficial <span className="text-[#EF4444]">*</span>
                      </label>
                      <input
                        id="form-email"
                        name="email"
                        type="email"
                        required
                        aria-required="true"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'error-email' : undefined}
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="gestor@municipio.gov.br"
                        className={`w-full h-11 px-3.5 rounded-lg bg-[#0A1128] text-sm text-[#F8FAFC] placeholder:text-[#94A3B8]/50 border transition-all ${
                          errors.email
                            ? 'border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/40'
                            : 'border-[#1A2A5A] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/30'
                        }`}
                      />
                      {errors.email && (
                        <p id="error-email" className="text-xs text-[#EF4444] mt-1 font-medium">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="form-cargo"
                        className="block text-xs font-semibold uppercase tracking-wider text-[#F8FAFC] mb-1.5"
                      >
                        Cargo / Função Pública <span className="text-[#EF4444]">*</span>
                      </label>
                      <input
                        id="form-cargo"
                        name="cargo"
                        type="text"
                        required
                        aria-required="true"
                        aria-invalid={!!errors.cargo}
                        aria-describedby={errors.cargo ? 'error-cargo' : undefined}
                        value={formData.cargo}
                        onChange={handleChange}
                        placeholder="Ex: Secretário(a) de Obras e Mobilidade"
                        className={`w-full h-11 px-3.5 rounded-lg bg-[#0A1128] text-sm text-[#F8FAFC] placeholder:text-[#94A3B8]/50 border transition-all ${
                          errors.cargo
                            ? 'border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/40'
                            : 'border-[#1A2A5A] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/30'
                        }`}
                      />
                      {errors.cargo && (
                        <p id="error-cargo" className="text-xs text-[#EF4444] mt-1 font-medium">
                          {errors.cargo}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row: Órgão / Município + Esfera de Governo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="form-orgao"
                        className="block text-xs font-semibold uppercase tracking-wider text-[#F8FAFC] mb-1.5"
                      >
                        Órgão Público / Município <span className="text-[#EF4444]">*</span>
                      </label>
                      <input
                        id="form-orgao"
                        name="orgao"
                        type="text"
                        required
                        aria-required="true"
                        aria-invalid={!!errors.orgao}
                        aria-describedby={errors.orgao ? 'error-orgao' : undefined}
                        value={formData.orgao}
                        onChange={handleChange}
                        placeholder="Ex: Prefeitura Municipal de Maringá"
                        className={`w-full h-11 px-3.5 rounded-lg bg-[#0A1128] text-sm text-[#F8FAFC] placeholder:text-[#94A3B8]/50 border transition-all ${
                          errors.orgao
                            ? 'border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/40'
                            : 'border-[#1A2A5A] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/30'
                        }`}
                      />
                      {errors.orgao && (
                        <p id="error-orgao" className="text-xs text-[#EF4444] mt-1 font-medium">
                          {errors.orgao}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="form-porte"
                        className="block text-xs font-semibold uppercase tracking-wider text-[#F8FAFC] mb-1.5"
                      >
                        Esfera Institucional <span className="text-[#EF4444]">*</span>
                      </label>
                      <select
                        id="form-porte"
                        name="porte"
                        required
                        aria-required="true"
                        aria-invalid={!!errors.porte}
                        aria-describedby={errors.porte ? 'error-porte' : undefined}
                        value={formData.porte}
                        onChange={handleChange}
                        className={`w-full h-11 px-3.5 rounded-lg bg-[#0A1128] text-sm text-[#F8FAFC] border transition-all ${
                          errors.porte
                            ? 'border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/40'
                            : 'border-[#1A2A5A] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/30'
                        }`}
                      >
                        <option value="Municipal">
                          Municipal (Prefeitura / Secretaria / Autarquia)
                        </option>
                        <option value="Estadual">
                          Estadual (DER / DETRAN / Consórcio Intermunicipal)
                        </option>
                        <option value="Federal">
                          Federal (DNIT / Ministério / Agência Reguladora)
                        </option>
                      </select>
                      {errors.porte && (
                        <p id="error-porte" className="text-xs text-[#EF4444] mt-1 font-medium">
                          {errors.porte}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Seletor do Enquadramento por Porte */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#F8FAFC] mb-1.5">
                      Enquadramento Inicial do Município
                    </label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setTierIntention('pequena')}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          tierIntention === 'pequena'
                            ? 'bg-[#10B981]/20 border-[#10B981] text-white font-bold'
                            : 'bg-[#0A1128] border-[#1A2A5A] text-[#94A3B8]'
                        }`}
                      >
                        Até 50k habitantes
                        <span className="block text-[10px] text-[#10B981] font-normal">
                          Diagnóstico 30 dias
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTierIntention('media')}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          tierIntention === 'media'
                            ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-white font-bold'
                            : 'bg-[#0A1128] border-[#1A2A5A] text-[#94A3B8]'
                        }`}
                      >
                        50k a 300k hab.
                        <span className="block text-[10px] text-[#3B82F6] font-normal">
                          Zeladoria + Art. 320
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTierIntention('grande')}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          tierIntention === 'grande'
                            ? 'bg-[#6366F1]/20 border-[#6366F1] text-white font-bold'
                            : 'bg-[#0A1128] border-[#1A2A5A] text-[#94A3B8]'
                        }`}
                      >
                        Metrópole / Consórcio
                        <span className="block text-[10px] text-[#818CF8] font-normal">
                          Padrão Global ISO
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Field: Telefone Institucional */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="form-telefone"
                        className="block text-xs font-semibold uppercase tracking-wider text-[#F8FAFC]"
                      >
                        Telefone Institucional de Gabinete
                      </label>
                      <span className="text-[11px] text-[#94A3B8]">Opcional</span>
                    </div>
                    <input
                      id="form-telefone"
                      name="telefone"
                      type="tel"
                      value={formData.telefone}
                      onChange={handleChange}
                      placeholder="(XX) XXXX-XXXX"
                      className="w-full h-11 px-3.5 rounded-lg bg-[#0A1128] text-sm text-[#F8FAFC] placeholder:text-[#94A3B8]/50 border border-[#1A2A5A] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/30 transition-all font-mono"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full min-h-[50px] inline-flex items-center justify-center gap-2 rounded-xl text-base font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] hover:scale-[1.01] transition-all duration-150 shadow-lg shadow-[#3B82F6]/30"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Processando manifesto institucional...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Registrar Manifesto de Interesse</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-center text-[#94A3B8]/80 pt-1">
                    Este manifesto não gera obrigações orçamentárias imediatas e preserva
                    integralmente o sigilo institucional previsto na legislação.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
