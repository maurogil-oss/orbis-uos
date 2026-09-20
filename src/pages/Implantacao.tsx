import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Rocket,
  Shield,
  FileCheck2,
  CheckCircle2,
  ArrowLeft,
  Download,
  Loader2,
  Calendar,
  Layers,
  Activity,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  Database,
  RefreshCw,
  Users,
  Check,
  AlertCircle,
  FolderGit2,
} from 'lucide-react'
import { generatePlaybookImplantacaoPdf } from '@/lib/diagnostics/playbookImplantacaoPdf'
import { useAuth } from '@/contexts/AuthContext'

export default function Implantacao() {
  const { user } = useAuth()
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [lastGeneratedHash, setLastGeneratedHash] = useState<string | null>(null)
  const [lastGeneratedProtocolo, setLastGeneratedProtocolo] = useState<string | null>(null)

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return
    setIsGeneratingPdf(true)
    try {
      const res = await generatePlaybookImplantacaoPdf({
        responsavelNome: user?.name || 'Acesso Institucional Governamental',
        responsavelCargo: user?.email
          ? `Servidor Institucional (${user.email})`
          : 'Gestão de Contratos e Implantação B2G',
        orgaoInteressado: 'Prefeitura Municipal / Secretaria de Obras',
        municipio: 'Curitiba',
        uf: 'PR',
      })
      setLastGeneratedHash(res.hash)
      setLastGeneratedProtocolo(res.protocolo)
    } catch (err) {
      console.error('Erro ao gerar Playbook de Implantação em PDF:', err)
      alert(
        err instanceof Error
          ? err.message
          : 'Houve uma falha ao gerar o Playbook de Implantação em PDF. Verifique se o bloqueador de pop-ups está ativo.',
      )
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070D1F] text-[#F8FAFC] pt-24 pb-20">
      <div className="max-w-[1040px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Top Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Início
          </Link>
          <span>/</span>
          <Link to="/metodologia" className="hover:text-white transition-colors">
            Metodologia
          </Link>
          <span>/</span>
          <span className="text-[#3B82F6]">Playbook de Implantação</span>
        </div>

        {/* Header Institucional com Botão de Baixar PDF */}
        <div className="space-y-4 pb-8 border-b border-[#1A2A5A]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-xs font-semibold text-[#60A5FA]">
                <Rocket className="w-4 h-4 text-[#38BDF8]" />
                Playbook Homologado B2G (LC 182/2021)
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-xs font-mono font-medium text-[#10B981]">
                <Calendar className="w-3.5 h-3.5" />
                Vigência 2026
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#101B3A] border border-[#1A2A5A] text-[11px] font-mono text-[#94A3B8]">
                Release v0.0.27 (Hardened B2G)
              </span>
            </div>

            {/* Botão Baixar PDF em Destaque */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] border border-[#3B82F6]/60 shadow-lg shadow-[#2563EB]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
              title="Baixar Playbook de Implantação completo em PDF com capa institucional, matriz RACI, critérios de aceite e hash SHA-256"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Gerando Playbook (PDF)...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[#38BDF8]" />
                  <span>Baixar Playbook de Implantação (PDF)</span>
                </>
              )}
            </button>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F8FAFC]">
            Playbook Oficial de Implantação, Homologação & Go-Live GovTech
          </h1>

          <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed max-w-4xl">
            Rito técnico e jurídico de entrada em produção da plataforma <b>ORBIS UOS</b> no ente
            público. Contém a matriz de responsabilidades <b>RACI Startup × Órgão</b>, checklist
            objetivo de homologação prévia, rito formal de aceite de <i>go-live</i> e cláusulas de
            saída soberana sem dependência tecnológica (<i>lock-in</i>), amparadas na Lei
            Complementar nº 182/2021.
          </p>

          {/* Feedback de Hash SHA-256 se gerado */}
          {lastGeneratedHash && (
            <div className="p-3.5 rounded-xl bg-[#0A1128] border border-[#10B981]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                <span className="text-[#CBD5E1]">
                  Playbook de Implantação gerado com sucesso! Protocolo:{' '}
                  <strong className="text-white font-mono">{lastGeneratedProtocolo}</strong>
                </span>
              </div>
              <div className="font-mono text-[11px] text-[#38BDF8] break-all">
                SHA-256: {lastGeneratedHash.slice(0, 20)}...{lastGeneratedHash.slice(-12)}
              </div>
            </div>
          )}

          {/* Banner de Identificação do Playbook */}
          <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[#64748B] block font-mono uppercase text-[10px]">
                Regime Jurídico:
              </span>
              <span className="text-[#F8FAFC] font-semibold text-sm">CPSI — LC nº 182/2021</span>
              <span className="text-[#94A3B8] block text-[11px]">
                Marco Legal das Startups & Inovação Aberta
              </span>
            </div>
            <div>
              <span className="text-[#64748B] block font-mono uppercase text-[10px]">
                Soberania Pública dos Dados:
              </span>
              <span className="text-[#10B981] font-mono font-bold text-sm">
                100% Pertencente ao Ente
              </span>
              <span className="text-[#94A3B8] block text-[11px]">
                Exportação em formatos abertos (GeoJSON/PDF)
              </span>
            </div>
            <div>
              <span className="text-[#64748B] block font-mono uppercase text-[10px]">
                Homologação e Auditoria:
              </span>
              <span className="text-[#38BDF8] font-mono font-bold text-sm">
                Trilha Permanente Registrada
              </span>
              <span className="text-[#94A3B8] block text-[11px]">
                Evento PLAYBOOK_PUBLISHED na audit_trail
              </span>
            </div>
          </div>
        </div>

        {/* 4 Cartões de Navegação Rápida */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <a
            href="#pre-requisitos"
            className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6]/50 transition-all space-y-1.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/20 text-[#60A5FA] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white group-hover:text-[#60A5FA] transition-colors">
              1. Pré-Requisitos
            </h3>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              Contas RBAC, calendário de coleta, equipes e termo LGPD.
            </p>
          </a>

          <a
            href="#matriz-raci"
            className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] hover:border-[#10B981]/50 transition-all space-y-1.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#10B981]/20 text-[#10B981] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white group-hover:text-[#10B981] transition-colors">
              2. Matriz RACI
            </h3>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              6 fases formais com papéis claros startup × município.
            </p>
          </a>

          <a
            href="#criterios-homologacao"
            className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] hover:border-[#F59E0B]/50 transition-all space-y-1.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white group-hover:text-[#F59E0B] transition-colors">
              3. Homologação & Aceite
            </h3>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              Critérios objetivos verificáveis para autorizar go-live.
            </p>
          </a>

          <a
            href="#rollback-encerramento"
            className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] hover:border-[#EF4444]/50 transition-all space-y-1.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#EF4444]/20 text-[#EF4444] flex items-center justify-center group-hover:scale-105 transition-transform">
              <RefreshCw className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white group-hover:text-[#EF4444] transition-colors">
              4. Rollback & Saída
            </h3>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              Garantias contratuais de encerramento sem lock-in.
            </p>
          </a>
        </div>

        {/* SEÇÃO 1: PRÉ-REQUISITOS DE IMPLANTAÇÃO */}
        <section
          id="pre-requisitos"
          className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-6 scroll-mt-24"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1A2A5A]">
            <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] flex items-center gap-2.5">
              <Users className="w-6 h-6 text-[#3B82F6]" />
              1. Pré-Requisitos Mandatórios de Implantação
            </h2>
            <span className="text-xs font-mono font-bold text-[#38BDF8] bg-[#3B82F6]/10 px-2.5 py-1 rounded border border-[#3B82F6]/30">
              Conformidade Prévia
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            Para garantir que a implantação ocorra dentro dos princípios de segurança da informação,
            segregação de funções e rastreabilidade probatória, o órgão contratante deve cumprir 4
            requisitos antes do início das operações:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-xs">
                <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white font-mono flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Contas Individuais RBAC Criadas pelo Administrador</span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                As contas de acesso devem ser criadas exclusivamente pelo gestor institucional
                autenticado (papel <code>admin</code>), via painel de administração. O
                compartilhamento de senhas é expressamente vedado, e o auto-registro público
                permanece bloqueado por design (Art. 27 LC 182/2021).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-xs">
                <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white font-mono flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Calendário e Itinerários de Coleta Mapeados</span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Definição formal das linhas de ônibus, rotas de coleta de resíduos e itinerários de
                viaturas municipais que operarão como veículos-sensores passivos, garantindo a
                cobertura territorial planejada sem desvio da rotina pública normal.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-xs">
                <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white font-mono flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>Indicação Formal dos Fiscais de Contrato</span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Portaria ou termo de designação do Fiscal Técnico (engenharia de pavimentação) e do
                Fiscal Administrativo (gestor de contrato), assegurando canal oficial direto para
                homologação, emissão de OS e relatórios de medição.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-xs">
                <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white font-mono flex items-center justify-center text-[10px]">
                  4
                </span>
                <span>Conformidade LGPD & Termos de Uso Confirmados</span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Ciência expressa da Política de Privacidade (com purga diária obrigatória de
                telemetria bruta &gt;180 dias) e dos Termos de Uso B2G, assegurando a soberania
                plena dos dados pelo município.
              </p>
            </div>
          </div>
        </section>

        {/* SEÇÃO 2: MATRIZ RACI STARTUP × ÓRGÃO */}
        <section
          id="matriz-raci"
          className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-6 scroll-mt-24"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1A2A5A]">
            <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-[#10B981]" />
              2. Matriz RACI (Startup × Órgão Público em 6 Fases)
            </h2>
            <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/15 px-2.5 py-1 rounded border border-[#10B981]/30">
              Governança Operacional
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            A matriz RACI estabelece a governança clara em cada etapa do ciclo de vida da
            implantação:
            <b> R</b> (Responsible / Responsável pela execução), <b>A</b> (Accountable / Aprovador
            com autoridade final), <b>C</b> (Consulted / Consultado tecnicamente) e <b>I</b>{' '}
            (Informed / Informado).
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] font-mono uppercase text-[#94A3B8] border-b border-[#1A2A5A] bg-[#101B3A]">
                <tr>
                  <th className="py-2.5 px-3">Fase do Projeto</th>
                  <th className="py-2.5 px-3">Atividades-Chave</th>
                  <th className="py-2.5 px-3">Startup Orbis UOS</th>
                  <th className="py-2.5 px-3">Órgão Público Contratante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2A5A]">
                <tr>
                  <td className="py-3 px-3 font-semibold text-white">
                    1. Contratação
                    <span className="block text-[10px] text-[#94A3B8] font-normal">
                      CPSI (LC 182/2021)
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#CBD5E1]">
                    Elaboração de enquadramento técnico, matriz de riscos, plano de trabalho e
                    minuta de contrato.
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-[#3B82F6]/20 text-[#60A5FA] border border-[#3B82F6]/30">
                      R (Suporte Técnico)
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
                      A (Procuradoria & Gestor)
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-3 font-semibold text-white">
                    2. Provisionamento
                    <span className="block text-[10px] text-[#94A3B8] font-normal">
                      Ambiente & Parâmetros
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#CBD5E1]">
                    Instalação de tenant isolado na nuvem Skip Cloud, integração com SICONFI/CGU e
                    criação de contas admin.
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-[#3B82F6]/20 text-[#60A5FA] border border-[#3B82F6]/30">
                      R (Engenharia de Nuvem)
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
                      A (DTI / Gestor Municipal)
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-3 font-semibold text-white">
                    3. Homologação
                    <span className="block text-[10px] text-[#94A3B8] font-normal">
                      Testes de Conformidade
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#CBD5E1]">
                    Validação do checklist objetivo: 3 passagens inerciais, integridade SQLite WAL,
                    k-anonimato H3 e restore.
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-[#3B82F6]/20 text-[#60A5FA] border border-[#3B82F6]/30">
                      R (Apoio Metodológico)
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
                      A (Comissão de Aceite Técnico)
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-3 font-semibold text-white">
                    4. Go-Live
                    <span className="block text-[10px] text-[#94A3B8] font-normal">
                      Entrada em Produção
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#CBD5E1]">
                    Emissão do termo de aceite de homologação, publicação do Modo Gabinete e
                    autorização de operação real.
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-[#3B82F6]/20 text-[#60A5FA] border border-[#3B82F6]/30">
                      R (Monitoramento Nível 1)
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
                      A (Prefeito / Secretário)
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-3 font-semibold text-white">
                    5. Operação Assistida
                    <span className="block text-[10px] text-[#94A3B8] font-normal">
                      Primeiros 30 Dias
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#CBD5E1]">
                    Acompanhamento diário de calibração do Fator K, suporte operacional, ajuste de
                    rotas e mitigação de dúvidas.
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-[#3B82F6]/20 text-[#60A5FA] border border-[#3B82F6]/30">
                      R (Engenharia de Dados)
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
                      A (Fiscal do Contrato)
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-3 font-semibold text-white">
                    6. Operação Autônoma
                    <span className="block text-[10px] text-[#94A3B8] font-normal">
                      Rotina Perene do Órgão
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#CBD5E1]">
                    Gestão diária da malha pela Secretaria de Obras, emissão de OS, prestação de
                    contas aos TCEs e CGU.
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30">
                      C (Sustentação N3 & SLAs)
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
                      R / A (Secretaria de Obras)
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SEÇÃO 3: CRITÉRIOS OBJETIVOS DE HOMOLOGAÇÃO & GO-LIVE */}
        <section
          id="criterios-homologacao"
          className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-6 scroll-mt-24"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1A2A5A]">
            <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] flex items-center gap-2.5">
              <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
              3. Critérios Objetivos de Homologação & Aceite de Go-Live (Dry-Run Homologado)
            </h2>
            <div className="flex items-center gap-2">
              <Link
                to="/homologacao"
                className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/20 hover:bg-[#10B981]/30 px-3 py-1.5 rounded-lg border border-[#10B981]/40 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Laudo do Dry-Run (/homologacao)</span>
              </Link>
              <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded border border-[#10B981]/30">
                Checklist Auditado
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-xs text-[#A7F3D0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-white block">
                Dry-Run Oficial Pré-Go-Live Executado com Sucesso:
              </span>
              <span>
                Todos os 5 critérios objetivos foram auditados contra o ambiente real de produção
                (protocolo <b>ORBIS-DRYRUN-2026-001</b>).
              </span>
            </div>
            <Link
              to="/homologacao"
              className="px-3.5 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs transition-colors shrink-0 flex items-center gap-1"
            >
              <span>Ver Laudo Completo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            Nenhum projeto entra em go-live sem a comprovação formal dos 5 pilares de homologação,
            garantindo que todas as capacidades técnicas do produto funcionem com integridade:
          </p>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-white text-sm">
                  1. Validação de Coleta Offline-First & Resiliência a Sombras de Sinal
                </h4>
                <p className="text-[#94A3B8] leading-relaxed">
                  Realização de rota de teste em túnel ou área sem cobertura 4G/5G, comprovando que
                  o coletor inercial armazena leituras localmente e sincroniza o lote integral sem
                  perda de amostras quando restabelecida a conectividade.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-white text-sm">
                  2. Homologação do Motor IMV e Calibração Empírica do Fator K
                </h4>
                <p className="text-[#94A3B8] leading-relaxed">
                  Confirmação de que segmentos de 100 metros recebem notas IMV baseadas na regra do
                  Fator de Confiança F ≥ 3 passagens de veículos distintos, evitando falsos
                  positivos, com calibração de chassi registrada com autoria.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-white text-sm">
                  3. Indexação Espacial H3 com k-Anonimato Territorial (k ≥ 3)
                </h4>
                <p className="text-[#94A3B8] leading-relaxed">
                  Comprovação de que nenhuma célula hexagonal H3 é exibida publicamente com
                  pontuação se contar com menos de 3 sessões independentes, blindando os munícipes
                  contra reidentificação de rotas (Art. 12 LGPD).
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-white text-sm">
                  4. Trilha de Auditoria com Autoria Obrigatória Ativa
                </h4>
                <p className="text-[#94A3B8] leading-relaxed">
                  Verificação de que mutações cadastrais, alterações de papéis de usuários e
                  disparos de purga são registrados na <code>audit_trail</code> com ID, nome,
                  e-mail, papel e carimbo de tempo.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-white text-sm">
                  5. Teste de Restauração de Backup Executado com Sucesso
                </h4>
                <p className="text-[#94A3B8] leading-relaxed">
                  Homologação prática do procedimento em 5 fases documentado na{' '}
                  <code>/operacao</code>, com
                  <code>PRAGMA integrity_check = ok</code> e tempo total de recuperação cumprindo
                  folgadamente o RTO declarado de 24 horas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 4: PROCEDIMENTO DE ROLLBACK E ENCERRAMENTO SOBERANO */}
        <section
          id="rollback-encerramento"
          className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-6 scroll-mt-24"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1A2A5A]">
            <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] flex items-center gap-2.5">
              <RefreshCw className="w-6 h-6 text-[#EF4444]" />
              4. Procedimento de Rollback & Encerramento Soberano do Piloto
            </h2>
            <span className="text-xs font-mono font-bold text-[#EF4444] bg-[#EF4444]/10 px-2.5 py-1 rounded border border-[#EF4444]/30">
              Garantia Anti-Lock-In
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            Em conformidade estrita com o Art. 27 da Lei Complementar nº 182/2021, o ente público
            goza de plena soberania sobre a continuidade ou encerramento da contratação GovTech:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#EF4444]/40 space-y-2">
              <span className="font-bold text-sm text-white flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-[#EF4444]" />
                Rollback Técnico Emergencial
              </span>
              <p className="text-[#94A3B8] leading-relaxed">
                Em caso de anomalia grave detectada durante os testes de homologação ou no período
                de operação assistida, o tráfego é comutado instantaneamente ao snapshot estável
                anterior (D-1), isolando as sondas de telemetria sem afetar outros sistemas da
                prefeitura.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#10B981]/40 space-y-2">
              <span className="font-bold text-sm text-white flex items-center gap-1.5">
                <FolderGit2 className="w-4 h-4 text-[#10B981]" />
                Encerramento Soberano & Portabilidade
              </span>
              <p className="text-[#94A3B8] leading-relaxed">
                Ao término do contrato CPSI, a startup entrega em até 48 horas úteis o pacote
                integral de dados da malha viária, histórico de anomalias e índices em formatos
                abertos (GeoJSON, JSON e CSV), com emissão do Certificado de Descarte de Ambientes
                Temporários nos termos da LGPD.
              </p>
            </div>
          </div>
        </section>

        {/* Banner Final de Download do Playbook */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0A1128] via-[#101B3A] to-[#1A2A5A] border border-[#3B82F6]/40 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#3B82F6]/20 border border-[#3B82F6]/40 text-[11px] font-mono text-[#60A5FA] font-bold">
              <FileText className="w-3.5 h-3.5" />
              Documento Oficial com Hash SHA-256
            </div>
            <h3 className="text-lg font-bold text-white">
              Anexe o Playbook de Implantação ao processo administrativo
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              O PDF gerado contém capa institucional, sumário RACI completo, checklist objetivo de
              aceite e digest criptográfico para anexação formal em contratações públicas CPSI (LC
              182/2021).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#2563EB] hover:bg-[#1D4ED8] border border-[#3B82F6]/50 shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Gerando PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[#38BDF8]" />
                  <span>Baixar Playbook (PDF)</span>
                </>
              )}
            </button>

            <Link
              to="/homologacao"
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[#059669] hover:bg-[#047857] border border-[#10B981]/50 shadow-md text-center transition-all flex items-center justify-center gap-1.5"
            >
              <span>Laudo Dry-Run (/homologacao)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/operacao"
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-[#CBD5E1] hover:text-white bg-[#101B3A] hover:bg-[#1A2A5A] border border-[#1A2A5A] text-center transition-all flex items-center justify-center gap-1.5"
            >
              <span>Ver Pacote Operacional</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Retorno */}
        <div className="pt-2 flex items-center justify-between text-xs">
          <Link
            to="/"
            className="text-xs font-semibold text-[#CBD5E1] hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para a página inicial
          </Link>
          <span className="text-[#64748B] font-mono text-[11px]">
            ORBIS.UOS • Playbook Oficial de Implantação GovTech • Release v0.0.27
          </span>
        </div>
      </div>
    </div>
  )
}
