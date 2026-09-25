import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Zap,
  Building2,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  RotateCcw,
} from 'lucide-react'
import {
  submitExpressDiagnostic,
  ExpressDiagnosticResult,
  CreateExpressDiagnosticPayload,
} from '@/services/expressDiagnostic'
import { calcularProjecaoCobertura, CoberturaMalhaResult } from '@/lib/diagnostics/coberturaFrota'

const ESTADOS_BRASIL = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
]

interface ExpressFormErrors {
  municipio?: string
  uf?: string
  populacao_ibge?: string
  codigo_ibge?: string
  responsavel_nome?: string
  responsavel_cargo?: string
  email_oficial?: string
  status_municipalizacao?: string
}

export function ExpressDiagnostic() {
  const [formData, setFormData] = useState<CreateExpressDiagnosticPayload>({
    municipio: '',
    uf: 'PR',
    populacao_ibge: 45000,
    codigo_ibge: '',
    responsavel_nome: '',
    responsavel_cargo: '',
    email_oficial: '',
    telefone: '',
    status_municipalizacao: 'proprio_estruturado',
    frota_onibus: 18,
    frota_caminhoes_coleta: 8,
    frota_viaturas: 6,
    orcamento_anual_pavimentacao: 1200000,
  })

  // Flag de frota terceirizada sem cláusula de telemetria (cenário de cidade média/grande)
  const [frotaTerceirizadaSemPrevisao, setFrotaTerceirizadaSemPrevisao] = useState<boolean>(false)

  const [errors, setErrors] = useState<ExpressFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<ExpressDiagnosticResult | null>(null)
  const [backendError, setBackendError] = useState<string | null>(null)

  // Cálculo da projeção de cobertura em tempo real
  const projecaoCobertura: CoberturaMalhaResult = calcularProjecaoCobertura({
    populacao: formData.populacao_ibge,
    frotaOnibus: formData.frota_onibus,
    frotaColeta: formData.frota_caminhoes_coleta,
    frotaViaturas: formData.frota_viaturas,
    onibusTerceirizadoSemPrevisao: frotaTerceirizadaSemPrevisao,
    coletaTerceirizadaSemPrevisao: frotaTerceirizadaSemPrevisao,
  })

  const validate = (): boolean => {
    const errs: ExpressFormErrors = {}
    if (!formData.municipio.trim()) errs.municipio = 'Informe o município'
    if (!formData.uf) errs.uf = 'Selecione a UF'
    if (!formData.populacao_ibge || formData.populacao_ibge <= 0) {
      errs.populacao_ibge = 'Informe a população estimada'
    }
    if (!formData.codigo_ibge.trim() || formData.codigo_ibge.length < 6) {
      errs.codigo_ibge = 'Código IBGE (6 ou 7 dígitos)'
    }
    if (!formData.responsavel_nome.trim()) errs.responsavel_nome = 'Informe o nome do responsável'
    if (!formData.responsavel_cargo.trim()) errs.responsavel_cargo = 'Informe o cargo público'
    if (!formData.email_oficial.trim() || !formData.email_oficial.includes('@')) {
      errs.email_oficial = 'E-mail oficial válido'
    }
    if (!formData.status_municipalizacao) {
      errs.status_municipalizacao = 'Selecione a situação do trânsito'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : 0) : value,
    }))

    if (errors[name as keyof ExpressFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBackendError(null)

    if (!validate()) return

    setIsSubmitting(true)
    try {
      const res = await submitExpressDiagnostic(formData)
      setResult(res)
    } catch (err) {
      console.error('Erro no diagnóstico express:', err)
      setBackendError('Não foi possível gerar o pré-diagnóstico no momento. Verifique sua conexão.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setErrors({})
    setBackendError(null)
  }

  return (
    <section
      id="diagnostico-express"
      className="py-16 sm:py-24 relative bg-gradient-to-b from-[#070D1F] via-[#0A1330] to-[#070D1F] border-t border-[#1A2A5A]/60 scroll-mt-20"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header da Seção Express */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-xs font-semibold text-[#60A5FA]">
            <Zap className="w-3.5 h-3.5 text-[#3B82F6]" />
            Esteira de Enquadramento • Fase 1 (5 Minutos)
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
            Diagnóstico Express & Dimensionamento CPSI
          </h2>

          <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
            Avaliação preliminar imediata da capacidade de gestão e elegibilidade do município para
            condução do piloto de auditoria inercial com amparo no Marco Legal da Inovação (LC
            182/2021).
          </p>
        </div>

        {/* Card do Formulário ou Resultado */}
        <div className="bg-[#101B3A] border border-[#1A2A5A] rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {backendError && (
            <div className="mb-6 p-4 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{backendError}</span>
            </div>
          )}

          {result ? (
            /* TELA DE RESULTADO DO PRÉ-DIAGNÓSTICO PROVISÓRIO */
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#1A2A5A]">
                <div>
                  <span className="text-xs uppercase bg-[#10B981]/20 text-[#10B981] px-2.5 py-0.5 rounded border border-[#10B981]/40 font-semibold">
                    Laudo Gerado com Sucesso
                  </span>{' '}
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] mt-2">
                    {formData.municipio} / {formData.uf}
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Código IBGE: {formData.codigo_ibge} • População:{' '}
                    {formData.populacao_ibge.toLocaleString('pt-BR')} hab.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 text-xs font-semibold text-[#CBD5E1] bg-[#0A1128] hover:bg-[#1A2A5A] border border-[#1A2A5A] rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Novo Cálculo
                  </button>
                  <Link
                    to={`/enquadramento?ibge=${formData.codigo_ibge}&muni=${encodeURIComponent(formData.municipio)}&uf=${formData.uf}`}
                    className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-xl shadow-lg shadow-[#3B82F6]/30 flex items-center gap-2 transition-all"
                  >
                    <span>Ir para o Enquadramento Completo (6 Blocos)</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Grid dos Cards de Síntese Express */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. O Rótulo Correto: Pré-diagnóstico Provisório */}
                <div className="p-6 rounded-2xl bg-[#0A1128] border border-[#3B82F6]/50 space-y-3">
                  <span className="text-xs font-mono uppercase font-bold text-[#94A3B8] block">
                    {result.rotuloScore}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black font-mono text-[#3B82F6]">
                      {result.scoreProvisorio}
                    </span>
                    <span className="text-sm font-bold text-[#94A3B8]">/ 100 pts</span>
                  </div>
                  <span className="inline-block text-xs font-bold text-[#10B981] bg-[#10B981]/15 px-2.5 py-1 rounded border border-[#10B981]/30">
                    Faixa: {result.faixaProvisoria}
                  </span>
                  <p className="text-xs text-[#94A3B8] leading-relaxed pt-1">
                    Pré-diagnóstico preliminar da gestão. O IMM (Índice de Mobilidade do Município)
                    e o IMV (Índice de Manutenção Viária) são apurados exclusivamente após o
                    Enquadramento Completo e a auditoria inercial de campo (Dia 30).
                  </p>
                </div>

                {/* 2. Projeção de Cobertura Real & Dimensionamento CPSI */}
                <div className="p-6 rounded-2xl bg-[#0A1128] border border-[#10B981]/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-[#94A3B8]">
                      Projeção Real em 30 Dias
                    </span>
                    <span className="text-xs font-semibold text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded">
                      Fator F ≥ 3
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black font-mono text-[#10B981]">
                      {frotaTerceirizadaSemPrevisao
                        ? `${projecaoCobertura.percentualCoberturaDia30FrotaPropria}%`
                        : `${projecaoCobertura.percentualCoberturaDia30FrotaTotal}%`}
                    </span>
                    <span className="text-sm font-bold text-[#F8FAFC]">da malha auditada</span>
                  </div>

                  <div className="text-xs text-[#CBD5E1] font-medium">
                    {frotaTerceirizadaSemPrevisao
                      ? `${projecaoCobertura.kmAuditados30DiasComFrotaPropria} km de ${projecaoCobertura.extensaoMalhaEstimadaKm} km estimados`
                      : `${projecaoCobertura.kmAuditados30DiasComFrotaTotal} km de ${projecaoCobertura.extensaoMalhaEstimadaKm} km estimados`}
                  </div>

                  {projecaoCobertura.alertaVies ? (
                    <div className="p-2 rounded-lg bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B] text-xs leading-relaxed">
                      <b>Expectativa Gerenciada:</b> {projecaoCobertura.alertaVies}
                    </div>
                  ) : (
                    <p className="text-xs text-[#94A3B8] leading-relaxed pt-1">
                      Com a frota alocada ({result.veiculosSensorSugeridos} veículos-sensor
                      sugeridos), a cidade atinge cobertura ampla com Zero CAPEX.
                    </p>
                  )}
                </div>

                {/* 3. Próximo Passo na Esteira */}
                <div className="p-6 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-mono uppercase font-bold text-[#60A5FA] block">
                      Esteira de Formalização
                    </span>
                    <h4 className="text-base font-bold text-[#F8FAFC] mt-1">
                      Enquadramento Completo
                    </h4>
                    <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
                      Etapa com salvamento por secretaria (Obras, Finanças, Saúde) que gera o Dossiê
                      oficial em PDF com hash SHA-256 e a minuta do Art. 320 CTB.
                    </p>
                  </div>
                  <Link
                    to={`/enquadramento?ibge=${formData.codigo_ibge}&muni=${encodeURIComponent(formData.municipio)}&uf=${formData.uf}`}
                    className="w-full py-2.5 rounded-xl bg-[#1A2A5A] hover:bg-[#3B82F6] text-[#F8FAFC] font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Iniciar 6 Blocos</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Rodapé com nexo institucional */}
              <div className="p-4 rounded-xl bg-[#0A1128]/70 border border-[#1A2A5A] text-xs text-[#94A3B8] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                  <span>
                    Protocolo registrado no banco de dados com validade institucional garantida.
                  </span>
                </div>
                <span className="text-xs text-[#94A3B8] font-mono">ID: {result.record.id}</span>
              </div>
            </div>
          ) : (
            /* FORMULÁRIO DE 10 CAMPOS ("5 MINUTOS") */
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div className="border-b border-[#1A2A5A] pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#F8FAFC]">
                      Formulário de Pré-Diagnóstico Provisório
                    </h3>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      Preencha os 10 indicadores para gerar o dimensionamento técnico imediato da
                      sua cidade
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded border border-[#10B981]/30 font-semibold">
                    ~5 minutos
                  </span>
                </div>
              </div>

              {/* Linha 1: Município, UF, Código IBGE e População */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#F8FAFC] mb-1.5">
                    1. Município <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    name="municipio"
                    value={formData.municipio}
                    onChange={handleChange}
                    placeholder="Ex: Londrina"
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] text-sm text-[#F8FAFC] border border-[#1A2A5A] focus:border-[#3B82F6]"
                  />
                  {errors.municipio && (
                    <p className="text-xs text-[#EF4444] mt-1">{errors.municipio}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#F8FAFC] mb-1.5">
                    2. UF <span className="text-[#EF4444]">*</span>
                  </label>
                  <select
                    name="uf"
                    value={formData.uf}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] text-sm text-[#F8FAFC] border border-[#1A2A5A] focus:border-[#3B82F6]"
                  >
                    {ESTADOS_BRASIL.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#F8FAFC] mb-1.5">
                    3. Código IBGE <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    name="codigo_ibge"
                    value={formData.codigo_ibge}
                    onChange={handleChange}
                    placeholder="Ex: 4113700"
                    maxLength={7}
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] text-sm text-[#F8FAFC] border border-[#1A2A5A] focus:border-[#3B82F6] font-mono"
                  />
                  {errors.codigo_ibge && (
                    <p className="text-xs text-[#EF4444] mt-1">{errors.codigo_ibge}</p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#F8FAFC] mb-1.5">
                    4. População IBGE <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="number"
                    name="populacao_ibge"
                    value={formData.populacao_ibge || ''}
                    onChange={handleChange}
                    placeholder="Ex: 45000"
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] text-sm text-[#F8FAFC] border border-[#1A2A5A] focus:border-[#3B82F6] font-mono"
                  />
                  {errors.populacao_ibge && (
                    <p className="text-xs text-[#EF4444] mt-1">{errors.populacao_ibge}</p>
                  )}
                </div>
              </div>

              {/* Linha 2: Responsável, Cargo e E-mail Oficial */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#F8FAFC] mb-1.5">
                    5. Responsável <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    name="responsavel_nome"
                    value={formData.responsavel_nome}
                    onChange={handleChange}
                    placeholder="Nome do(a) gestor(a)"
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] text-sm text-[#F8FAFC] border border-[#1A2A5A] focus:border-[#3B82F6]"
                  />
                  {errors.responsavel_nome && (
                    <p className="text-xs text-[#EF4444] mt-1">{errors.responsavel_nome}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#F8FAFC] mb-1.5">
                    6. Cargo / Função <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    name="responsavel_cargo"
                    value={formData.responsavel_cargo}
                    onChange={handleChange}
                    placeholder="Ex: Secretário de Obras"
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] text-sm text-[#F8FAFC] border border-[#1A2A5A] focus:border-[#3B82F6]"
                  />
                  {errors.responsavel_cargo && (
                    <p className="text-xs text-[#EF4444] mt-1">{errors.responsavel_cargo}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#F8FAFC] mb-1.5">
                    7. E-mail Oficial <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="email"
                    name="email_oficial"
                    value={formData.email_oficial}
                    onChange={handleChange}
                    placeholder="gestor@municipio.gov.br"
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] text-sm text-[#F8FAFC] border border-[#1A2A5A] focus:border-[#3B82F6]"
                  />
                  {errors.email_oficial && (
                    <p className="text-xs text-[#EF4444] mt-1">{errors.email_oficial}</p>
                  )}
                </div>
              </div>

              {/* Linha 3: Municipalização Art. 24 CTB */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#F8FAFC] mb-1.5">
                  8. Status de Municipalização do Trânsito (Art. 24 do CTB){' '}
                  <span className="text-[#EF4444]">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      formData.status_municipalizacao === 'proprio_estruturado'
                        ? 'bg-[#3B82F6]/15 border-[#3B82F6] text-white'
                        : 'bg-[#0A1128] border-[#1A2A5A] text-[#94A3B8]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status_municipalizacao"
                      value="proprio_estruturado"
                      checked={formData.status_municipalizacao === 'proprio_estruturado'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <Building2 className="w-4 h-4 text-[#3B82F6]" />
                    <span className="text-xs font-semibold">Próprio estruturado</span>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      formData.status_municipalizacao === 'em_processo'
                        ? 'bg-[#3B82F6]/15 border-[#3B82F6] text-white'
                        : 'bg-[#0A1128] border-[#1A2A5A] text-[#94A3B8]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status_municipalizacao"
                      value="em_processo"
                      checked={formData.status_municipalizacao === 'em_processo'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <FileCheck2 className="w-4 h-4 text-[#F59E0B]" />
                    <span className="text-xs font-semibold">Em processo de municipalização</span>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      formData.status_municipalizacao === 'nao_municipalizado'
                        ? 'bg-[#3B82F6]/15 border-[#3B82F6] text-white'
                        : 'bg-[#0A1128] border-[#1A2A5A] text-[#94A3B8]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status_municipalizacao"
                      value="nao_municipalizado"
                      checked={formData.status_municipalizacao === 'nao_municipalizado'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <ShieldCheck className="w-4 h-4 text-[#94A3B8]" />
                    <span className="text-xs font-semibold">Não municipalizado</span>
                  </label>
                </div>
              </div>

              {/* Linha 4: 3 Números de Frota + Orçamento de Pavimentação */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#F8FAFC] mb-1.5">
                    9a. Frota Ônibus
                  </label>
                  <input
                    type="number"
                    name="frota_onibus"
                    value={formData.frota_onibus || ''}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] text-sm text-[#F8FAFC] border border-[#1A2A5A] font-mono"
                  />
                  <span className="text-xs text-[#94A3B8]">Linhas urbanas</span>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#CBD5E1] block mb-1">
                    Caminhões de Lixo
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="frota_caminhoes_coleta"
                    value={formData.frota_caminhoes_coleta || ''}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] text-sm text-[#F8FAFC] border border-[#1A2A5A] focus:border-[#3B82F6] font-mono"
                  />
                  <span className="text-xs text-[#94A3B8]">Rotas diárias</span>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#CBD5E1] block mb-1">
                    Viaturas Municipais
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="frota_viaturas"
                    value={formData.frota_viaturas || ''}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] text-sm text-[#F8FAFC] border border-[#1A2A5A] focus:border-[#3B82F6] font-mono"
                  />
                  <span className="text-xs text-[#94A3B8]">Guarda / Trânsito</span>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#CBD5E1] block mb-1">
                    Orçamento Pavimentação (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="orcamento_anual_pavimentacao"
                    value={formData.orcamento_anual_pavimentacao || ''}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] text-sm text-[#F8FAFC] border border-[#1A2A5A] focus:border-[#3B82F6] font-mono"
                  />
                  <span className="text-xs text-[#94A3B8]">Recapeamento anual</span>
                </div>{' '}
              </div>

              {/* Opção de Gestão de Expectativa: Terceirização sem previsão de telemetria */}
              <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#F8FAFC]">
                    Condição Contratual da Frota de Ônibus / Coleta
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#CBD5E1]">
                    <input
                      type="checkbox"
                      checked={frotaTerceirizadaSemPrevisao}
                      onChange={(e) => setFrotaTerceirizadaSemPrevisao(e.target.checked)}
                      className="rounded bg-[#101B3A] border-[#1A2A5A] text-[#3B82F6] focus:ring-0"
                    />
                    <span>Frota terceirizada sem cláusula de telemetria no contrato</span>
                  </label>
                </div>

                {/* Card de Projeção em Tempo Real: expectativa gerenciada ANTES do piloto */}
                <div className="p-3.5 rounded-xl bg-[#101B3A]/80 border border-[#3B82F6]/30 text-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <span className="text-[#94A3B8]">
                      Malha Estimada para {projecaoCobertura.porteNome}:{' '}
                      <b className="text-[#F8FAFC] font-mono">
                        {projecaoCobertura.extensaoMalhaEstimadaKm} km
                      </b>
                    </span>
                    <span className="text-[#94A3B8]">
                      Necessário para 100% da malha em 30 dias:{' '}
                      <b className="text-[#10B981] font-mono">
                        {projecaoCobertura.veiculosNecessariosPara100Pct} veículos-sensor
                      </b>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-xl sm:text-2xl font-black font-mono text-[#3B82F6]">
                      {frotaTerceirizadaSemPrevisao
                        ? `${projecaoCobertura.percentualCoberturaDia30FrotaPropria}%`
                        : `${projecaoCobertura.percentualCoberturaDia30FrotaTotal}%`}
                    </div>
                    <div className="text-xs text-[#CBD5E1]">
                      da malha auditada com Fator de Confiança F ≥ 3 em <b>30 dias</b>
                      <span className="text-xs text-[#94A3B8] block">
                        (
                        {frotaTerceirizadaSemPrevisao
                          ? projecaoCobertura.kmAuditados30DiasComFrotaPropria
                          : projecaoCobertura.kmAuditados30DiasComFrotaTotal}{' '}
                        km de {projecaoCobertura.extensaoMalhaEstimadaKm} km)
                      </span>
                    </div>
                  </div>

                  {projecaoCobertura.alertaVies && (
                    <div className="p-2.5 rounded-lg bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B] text-xs leading-relaxed flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{projecaoCobertura.alertaVies}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botão de Envio */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[#94A3B8] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                  <span>
                    O cálculo gera o <b>Pré-diagnóstico Provisório</b> e conecta à esteira do
                    Enquadramento Completo.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-lg shadow-[#3B82F6]/30 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processando Diagnóstico...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Gerar Pré-Diagnóstico Provisório</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
