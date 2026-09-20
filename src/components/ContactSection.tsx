import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Mail,
  Copy,
  Check,
  Clock,
  MapPin,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  Newspaper,
  Handshake,
  ArrowRight,
  Info,
} from 'lucide-react'

export function ContactSection() {
  const [copiedEmail, setCopiedEmail] = useState(false)

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('contato@orbis-uos.gov.br')
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2500)
  }

  return (
    <section
      id="contato"
      className="py-20 sm:py-24 relative bg-[#0A1128] border-t border-[#1A2A5A]/60 scroll-mt-20"
      aria-labelledby="contact-heading"
    >
      {/* Background glow sutil */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#3B82F6]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Cabeçalho da Seção */}
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101B3A] border border-[#1A2A5A] text-xs font-semibold text-[#60A5FA]">
            <Mail className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Canal Oficial de Atendimento Geral</span>
          </div>

          <h2
            id="contact-heading"
            className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight"
          >
            Fale Conosco
          </h2>

          <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
            Canal institucional para esclarecimento de dúvidas, contato com a assessoria de
            imprensa, relações institucionais e parcerias federativas.
          </p>

          {/* Aviso claro de separação dos fluxos */}
          <div className="p-3.5 rounded-xl bg-[#101B3A]/80 border border-[#3B82F6]/30 text-xs text-[#CBD5E1] flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Interesse no piloto B2G?</strong> Este canal é
                exclusivo para contato geral e dúvidas. Para submeter o{' '}
                <strong className="text-white">Manifesto de Interesse Institucional (CPSI)</strong>,
                utilize o fluxo dedicado.
              </span>
            </div>
            <a
              href="/#manifesto"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] shrink-0 transition-colors shadow-sm whitespace-nowrap"
            >
              <span>Solicitar Piloto</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Grade de 3 Colunas: E-mail & Atendimento, Escopo de Contato, SLA & Sede */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Card 1: E-mail Institucional */}
          <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[#60A5FA]">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">E-mail Institucional</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Canal oficial e unificado para correspondência institucional com a equipe ORBIS UOS.
              </p>

              <div className="p-3 rounded-xl bg-[#0A1128] border border-[#1A2A5A] flex items-center justify-between gap-2">
                <a
                  href="mailto:contato@orbis-uos.gov.br"
                  className="font-mono text-xs sm:text-sm font-bold text-[#38BDF8] hover:underline break-all"
                >
                  contato@orbis-uos.gov.br
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-1.5 rounded-lg bg-[#101B3A] hover:bg-[#1A2A5A] text-[#94A3B8] hover:text-white transition-colors shrink-0"
                  title="Copiar e-mail institucional"
                  aria-label="Copiar e-mail institucional"
                >
                  {copiedEmail ? (
                    <Check className="w-4 h-4 text-[#10B981]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1A2A5A]/80 text-[11px] text-[#94A3B8] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
              <span>Canal homologado e integrado à Política de Privacidade (LGPD).</span>
            </div>
          </div>

          {/* Card 2: Finalidades Atendidas */}
          <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
                <Handshake className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Finalidades Deste Canal</h3>

              <ul className="space-y-2.5 text-xs text-[#CBD5E1]">
                <li className="flex items-start gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-[#38BDF8] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Dúvidas Gerais:</strong> Informações sobre a
                    arquitetura aberta, telemetria inercial e enquadramento.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Newspaper className="w-3.5 h-3.5 text-[#60A5FA] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Imprensa & Publicações:</strong> Entrevistas,
                    dados agregados públicos e relatórios técnicos.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Handshake className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Parcerias Institucionais:</strong> Consórcios
                    intermunicipais, entidades de classe e academia.
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-2 border-t border-[#1A2A5A]/80 text-[11px] text-[#F59E0B] flex items-center gap-1.5">
              <span>• Não processa propostas comerciais fora do rito CPSI.</span>
            </div>
          </div>

          {/* Card 3: Nível de Serviço (SLA) & Horário */}
          <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B]">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">SLA & Atendimento</h3>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[#0A1128] border border-[#1A2A5A] space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] block">
                    Tempo de Resposta Padrão
                  </span>
                  <span className="text-sm font-mono font-bold text-[#10B981]">
                    Até 2 dias úteis
                  </span>
                  <span className="text-[11px] text-[#94A3B8] block">
                    Conforme SLA P3 publicado no Pacote Operacional.
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0A1128] border border-[#1A2A5A] space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] block">
                    Horário Oficial (BRT)
                  </span>
                  <span className="text-xs font-semibold text-white block">
                    Segunda a Sexta-feira, 08h00 às 18h00
                  </span>
                  <span className="text-[11px] text-[#64748B] block">
                    Exceto feriados nacionais.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1A2A5A]/80 flex items-center justify-between text-[11px]">
              <Link
                to="/operacao"
                className="text-[#60A5FA] hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <span>Ver Pacote Operacional</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <span className="text-[#64748B]">SLA 99,9%</span>
            </div>
          </div>
        </div>

        {/* Linha Inferior com Endereço Institucional Oficial */}
        <div className="mt-8 p-4 rounded-xl bg-[#101B3A]/40 border border-[#1A2A5A] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#3B82F6] shrink-0" />
            <span>
              <strong className="text-white">Sede Institucional:</strong> Setor Comercial Sul,
              Quadra 4, Bloco A, Edifício Capital, 7º Andar — Brasília, DF — CEP 70304-900
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#64748B] shrink-0">
            Governança B2G • LC 182/2021
          </span>
        </div>
      </div>
    </section>
  )
}
