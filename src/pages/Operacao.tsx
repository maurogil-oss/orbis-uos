import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Server,
  Shield,
  Clock,
  Headphones,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Mail,
  Copy,
  Check,
  Download,
  Loader2,
  FileCheck2,
  ExternalLink,
  ChevronRight,
  Database,
  RefreshCw,
  Layers,
  Activity,
  FileText,
  Calendar,
  Lock,
} from 'lucide-react'
import { generatePacoteOperacionalPdf } from '@/lib/diagnostics/pacoteOperacionalPdf'
import { useAuth } from '@/contexts/AuthContext'

export default function Operacao() {
  const { user } = useAuth()
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [lastGeneratedHash, setLastGeneratedHash] = useState<string | null>(null)
  const [lastGeneratedProtocolo, setLastGeneratedProtocolo] = useState<string | null>(null)
  const [copiedEmail, setCopiedEmail] = useState(false)

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('contato@orbis-uos.gov.br')
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2500)
  }

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return
    setIsGeneratingPdf(true)
    try {
      const res = await generatePacoteOperacionalPdf({
        responsavelNome: user?.name || 'Acesso Público / Avaliação Governamental',
        responsavelCargo: user?.email
          ? `Servidor Institucional (${user.email})`
          : 'Acesso Institucional Governamental',
        orgaoInteressado: 'Administração Pública Municipal',
      })
      setLastGeneratedHash(res.hash)
      setLastGeneratedProtocolo(res.protocolo)
    } catch (err) {
      console.error('Erro ao gerar Pacote Operacional em PDF:', err)
      alert(
        err instanceof Error
          ? err.message
          : 'Houve uma falha ao gerar o Pacote Operacional em PDF. Verifique se o bloqueador de pop-ups está ativo.',
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
          <span className="text-[#3B82F6]">Pacote Operacional</span>
        </div>

        {/* Header Institucional com Botão de Baixar PDF */}
        <div className="space-y-4 pb-8 border-b border-[#1A2A5A]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-xs font-semibold text-[#10B981]">
                <Server className="w-4 h-4" />
                Pacote Operacional Homologado B2G
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-xs font-mono font-medium text-[#60A5FA]">
                <Calendar className="w-3.5 h-3.5" />
                Vigência 2025–2026
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#101B3A] border border-[#1A2A5A] text-[11px] font-mono text-[#94A3B8]">
                Release v0.0.23
              </span>
            </div>

            {/* Botão Baixar PDF em Destaque */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] border border-[#3B82F6]/60 shadow-lg shadow-[#2563EB]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
              title="Baixar Pacote Operacional completo em PDF com capa institucional, RTO/RPO, SLAs e hash SHA-256"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Gerando Pacote (PDF)...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[#38BDF8]" />
                  <span>Baixar Pacote Operacional (PDF)</span>
                </>
              )}
            </button>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F8FAFC]">
            Pacote Operacional de Continuidade, Resiliência, Backups e Suporte
          </h1>

          <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed max-w-4xl">
            Documentação técnica formal dos acordos operacionais, níveis de serviço (SLA), política
            de preservação de dados e procedimentos de contingência da plataforma <b>ORBIS UOS</b>.
            Estruturada para subsidiar Procuradorias Municipais, Tribunais de Contas e órgãos de
            controle externo em contratações sob o Marco Legal GovTech (LC 182/2021).
          </p>

          {/* Feedback de Hash SHA-256 se gerado */}
          {lastGeneratedHash && (
            <div className="p-3.5 rounded-xl bg-[#0A1128] border border-[#10B981]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                <span className="text-[#CBD5E1]">
                  Pacote Operacional gerado com sucesso! Protocolo:{' '}
                  <strong className="text-white font-mono">{lastGeneratedProtocolo}</strong>
                </span>
              </div>
              <div className="font-mono text-[11px] text-[#38BDF8] break-all">
                SHA-256: {lastGeneratedHash.slice(0, 20)}...{lastGeneratedHash.slice(-12)}
              </div>
            </div>
          )}

          {/* Banner de Identificação Operacional */}
          <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[#64748B] block font-mono uppercase text-[10px]">
                Infraestrutura de Nuvem:
              </span>
              <span className="text-[#F8FAFC] font-semibold text-sm">Skip Cloud Gerenciado</span>
              <span className="text-[#94A3B8] block text-[11px]">
                PocketBase v0.36 • SQLite WAL • Edge APIs
              </span>
            </div>
            <div>
              <span className="text-[#64748B] block font-mono uppercase text-[10px]">
                Plano de Continuidade Declarado:
              </span>
              <span className="text-[#38BDF8] font-mono font-bold text-sm">
                RTO: 24 horas • RPO: 24 horas
              </span>
              <span className="text-[#94A3B8] block text-[11px]">
                Snapshots diários + arquitetura offline-first
              </span>
            </div>
            <div>
              <span className="text-[#64748B] block font-mono uppercase text-[10px]">
                Canal Oficial de Suporte & Incidentes:
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-[#60A5FA] select-all">
                  contato@orbis-uos.gov.br
                </span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-1 rounded hover:bg-[#1A2A5A] text-[#94A3B8] hover:text-white transition-colors"
                  title="Copiar e-mail de suporte"
                >
                  {copiedEmail ? (
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <span className="text-[11px] text-[#10B981] block">
                SLA P1: resposta em até 4 horas úteis
              </span>
            </div>
          </div>
        </div>

        {/* 3 Cartões de Destaque dos Documentos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="#politica-backup"
            className="p-5 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6]/50 transition-all space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 text-[#60A5FA] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#60A5FA] font-bold">
                Documento 1
              </span>
              <h3 className="text-base font-bold text-white group-hover:text-[#60A5FA] transition-colors">
                Política de Backup & Restauração
              </h3>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Frequência de snapshots diários, escopo de tabelas e procedimento formal de teste de
              restore em 5 fases com registro em auditoria.
            </p>
          </a>

          <a
            href="#plano-continuidade"
            className="p-5 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] hover:border-[#10B981]/50 transition-all space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 text-[#10B981] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#10B981] font-bold">
                Documento 2
              </span>
              <h3 className="text-base font-bold text-white group-hover:text-[#10B981] transition-colors">
                Plano de Continuidade Mínimo
              </h3>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              RTO e RPO declarados de 24h, 3 cenários de contingência mapeados (nuvem, APIs
              federais, sinal em campo) e comunicação ao cliente.
            </p>
          </a>

          <a
            href="#politica-suporte"
            className="p-5 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] hover:border-[#F59E0B]/50 transition-all space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#F59E0B] font-bold">
                Documento 3
              </span>
              <h3 className="text-base font-bold text-white group-hover:text-[#F59E0B] transition-colors">
                Política de Suporte & Incidentes
              </h3>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Matriz de SLA por severidade (P1, P2 e P3), horário de atendimento, integração com o
              Art. 48 da LGPD e Livro de Incidentes.
            </p>
          </a>
        </div>

        {/* =================================================================== */}
        {/* DOCUMENTO 1: POLÍTICA DE BACKUP E RESTAURAÇÃO                       */}
        {/* =================================================================== */}
        <section
          id="politica-backup"
          className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-6 scroll-mt-24"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1A2A5A]">
            <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] flex items-center gap-2.5">
              <Database className="w-6 h-6 text-[#3B82F6]" />
              1. Política de Backup e Restauração de Dados
            </h2>
            <span className="text-xs font-mono font-bold text-[#38BDF8] bg-[#3B82F6]/10 px-2.5 py-1 rounded border border-[#3B82F6]/30">
              Nuvem Gerenciada Skip Cloud
            </span>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            <p>
              A plataforma <b>ORBIS UOS</b> é executada sobre a infraestrutura de computação e banco
              de dados da <b>Skip Cloud</b> (PocketBase v0.36 sobre SQLite no modo WAL —{' '}
              <i>Write-Ahead Logging</i>). O sistema conta com salvaguardas automatizadas de
              preservação de dados e isolamento relacional:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
                <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <Server className="w-4 h-4 text-[#10B981]" />
                  O que é Backup na Plataforma?
                </span>
                <p className="text-[#94A3B8] text-xs leading-relaxed">
                  Cópia lógica e física completa do banco de dados relacional (todas as 12
                  collections, incluindo <code>enquadramentos</code>, <code>road_segments</code>,{' '}
                  <code>fator_k_calibrations</code> e <code>institucional_settings</code>), além dos
                  arquivos de assets e código imutável das migrações (0001 a 0019).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
                <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <Clock className="w-4 h-4 text-[#3B82F6]" />
                  Frequência & Retenção de Snapshots
                </span>
                <p className="text-[#94A3B8] text-xs leading-relaxed">
                  Snapshots automatizados <b>diários</b> executados durante a janela de menor
                  tráfego (03h00 BRT). Os snapshots são criptografados em repouso com algoritmo
                  AES-256 e retidos com rotação estruturada para permitir recuperação de ponto no
                  tempo (PITR) recente.
                </p>
              </div>
            </div>

            {/* Procedimento de Teste de Restore */}
            <div className="space-y-3 pt-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#10B981]" />
                Procedimento Operacional de Teste de Restore (Passo a Passo Formal)
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Para garantir que o backup não seja apenas um arquivo inerte mas uma garantia
                efetiva de retomada de operação, o procedimento de simulação de restauração obedece
                a 5 fases sequenciais:
              </p>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      Fase 1: Isolamento do Incidente & Congelamento de Produção
                    </h4>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">
                      Ativação do modo manutenção na borda (Edge Gateway), retornando status HTTP
                      503 com tela explicativa oficial para impedir gravações concorrentes
                      incompletas durante a janela de análise.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      Fase 2: Provisionamento de Ambiente Staging de Recuperação
                    </h4>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">
                      Subida de contêiner isolado em ambiente espelho (sandbox de homologação), com
                      a mesma versão de runtime do PocketBase, garantindo que o teste não afete
                      dados da instância principal.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      Fase 3: Aplicação do Snapshot de Backup & Validação SQLite WAL
                    </h4>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">
                      Descompactação do snapshot e injeção do arquivo <code>data.db</code>. Execução
                      imediata dos comandos <code>PRAGMA integrity_check</code> e{' '}
                      <code>PRAGMA quick_check</code> para comprovar a higidez dos índices B-Tree e
                      ausência de corrupção física.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      Fase 4: Verificação de Integridade Referencial & Reconciliação SHA-256
                    </h4>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">
                      Conferência automatizada da contagem de linhas nas collections críticas (
                      <code>users</code>, <code>institucional_settings</code>,{' '}
                      <code>fator_k_calibrations</code>, <code>road_segments</code>) e comparação
                      com os digests SHA-256 dos últimos dossiês e auditorias emitidas.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    5
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      Fase 5: Reapontamento de Tráfego ou Rollback Seguro
                    </h4>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">
                      Aprovada a integridade, o tráfego do domínio oficial é redirecionado à
                      instância recuperada e a manutenção é desativada. Em caso de falha de
                      reconciliação, o procedimento é abortado e aciona-se o snapshot D-1 anterior.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer Honesto de Status do Teste de Restore */}
            <div className="p-4 rounded-xl bg-[#FEF3C7]/10 border border-[#D97706]/40 text-xs text-[#FDE68A] space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#F59E0B] text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Declaração de Transparência Institucional — Situação do Teste</span>
              </div>
              <div className="space-y-1 text-xs leading-relaxed text-[#FDE68A]/90">
                <p>
                  • <b>Situação Atual:</b>{' '}
                  <span className="font-mono font-bold text-white bg-[#D97706] px-2 py-0.5 rounded text-[11px]">
                    Previsto (Não Implantado)
                  </span>{' '}
                  — A infraestrutura possui backups diários ativos pela Skip Cloud; no entanto, o
                  exercício prático de restauração em ambiente isolado de produção ainda não foi
                  executado.
                </p>
                <p>
                  • <b>Periodicidade Obrigatória Programada:</b> <b>Semestral</b> (a cada 6 meses)
                  com emissão de Relatório Técnico de Simulação.
                </p>
                <p>
                  • <b>Data-Alvo da 1ª Execução Oficial:</b>{' '}
                  <b>
                    Fase Pré-Piloto CPSI (exatamente 30 dias antes do go-live oficial com o primeiro
                    órgão cliente contratante)
                  </b>
                  .
                </p>
                <p>
                  • <b>Registro Permanente na Trilha de Auditoria:</b> Todo resultado de teste de
                  restore será gravado com carimbo de data/hora, operador e tempos aferidos na
                  collection <code>institucional_settings</code>, aberta a inspeções do TCE e CGU.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* DOCUMENTO 2: PLANO DE CONTINUIDADE MÍNIMO                           */}
        {/* =================================================================== */}
        <section
          id="plano-continuidade"
          className="p-6 sm:p-8 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-6 scroll-mt-24"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1A2A5A]">
            <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] flex items-center gap-2.5">
              <Clock className="w-6 h-6 text-[#10B981]" />
              2. Plano de Continuidade de Negócio Mínimo (PCN)
            </h2>
            <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/15 px-2.5 py-1 rounded border border-[#10B981]/30">
              RTO 24h • RPO 24h
            </span>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            <p>
              O Plano de Continuidade visa garantir a manutenção e rápida restauração das funções
              essenciais da plataforma ORBIS UOS em situações adversas decorrentes de interrupção de
              serviços de rede, falhas de infraestrutura ou desastres lógicos:
            </p>

            {/* Tabela de RTO e RPO */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] font-mono uppercase text-[#94A3B8] border-b border-[#1A2A5A] bg-[#0A1128]">
                  <tr>
                    <th className="py-2.5 px-3">Métrica Operacional</th>
                    <th className="py-2.5 px-3">Meta Declarada</th>
                    <th className="py-2.5 px-3">Significado Técnico para o Município</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A2A5A]">
                  <tr>
                    <td className="py-3 px-3 font-semibold text-white">
                      RTO (Recovery Time Objective)
                      <span className="block text-[10px] text-[#94A3B8] font-normal">
                        Tempo Máximo de Restabelecimento
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#38BDF8]">Até 24 horas</td>
                    <td className="py-3 px-3 text-[#CBD5E1]">
                      Prazo limite para reconstrução completa do ambiente na nuvem secundária e
                      retomada das APIs de visualização do Cockpit e do Modo Gabinete.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold text-white">
                      RPO (Recovery Point Objective)
                      <span className="block text-[10px] text-[#94A3B8] font-normal">
                        Tolerância Máxima de Perda de Dados
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#10B981]">Até 24 horas</td>
                    <td className="py-3 px-3 text-[#CBD5E1]">
                      O ponto de retorno garantido é o snapshot diário imediatamente anterior. Dados
                      coletados em campo no próprio dia permanecem salvaguardados nos dispositivos
                      móveis pela arquitetura <i>offline-first</i>.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold text-white">
                      SLA de Notificação de Incidente Crítico
                      <span className="block text-[10px] text-[#94A3B8] font-normal">
                        Comunicação Oficial ao Ente
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#F59E0B]">
                      Até 4 horas úteis
                    </td>
                    <td className="py-3 px-3 text-[#CBD5E1]">
                      Emissão do primeiro Comunicado Formal ao Gestor de Contrato do Município
                      detalhando impacto e estimativa de resolução.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Cenários de Contingência */}
            <div className="space-y-3 pt-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#3B82F6]" />
                Cenários de Contingência Mapeados & Estratégias de Mitigação
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-2">
                  <span className="font-bold text-sm text-[#F8FAFC] block">
                    Cenário 1: Indisponibilidade da Nuvem (Skip Cloud)
                  </span>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    <b>Impacto:</b> Queda temporária do painel administrativo e APIs.
                  </p>
                  <p className="text-xs text-[#CBD5E1] leading-relaxed pt-1 border-t border-[#1A2A5A]">
                    <b>Mitigação:</b> Exportação diária de snapshots estruturados com possibilidade
                    de subir contêiner PocketBase em infraestrutura alternativa (AWS / GCP / VPS)
                    dentro da janela de 24h do RTO.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-2">
                  <span className="font-bold text-sm text-[#F8FAFC] block">
                    Cenário 2: Falha de APIs Federais (SICONFI / CGU)
                  </span>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    <b>Impacto:</b> Indisponibilidade dos portais do Tesouro Nacional ou Fiscaliza
                    SG.
                  </p>
                  <p className="text-xs text-[#CBD5E1] leading-relaxed pt-1 border-t border-[#1A2A5A]">
                    <b>Mitigação:</b> Já blindado pela arquitetura de cache local (
                    <code>siconfi_cache</code> e buffers em <code>institucional_settings</code>). Os
                    painéis municipais continuam operacionais exibindo o último snapshot contábil
                    com carimbo de data.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-2">
                  <span className="font-bold text-sm text-[#F8FAFC] block">
                    Cenário 3: Perda de Conectividade em Campo
                  </span>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    <b>Impacto:</b> Veículo-sensor transita em túneis ou zonas sem sinal 4G/5G.
                  </p>
                  <p className="text-xs text-[#CBD5E1] leading-relaxed pt-1 border-t border-[#1A2A5A]">
                    <b>Mitigação:</b> O coletor inercial armazena os dados brutos e os cálculos FFT
                    no armazenamento local do aparelho. Quando a conexão é recuperada, os lotes são
                    descarregados automaticamente sem perda de medição.
                  </p>
                </div>
              </div>
            </div>

            {/* Procedimento de Comunicação com o Órgão Cliente */}
            <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-2">
              <span className="font-bold text-white text-xs block">
                Procedimento Formal de Comunicação com a Prefeitura / Órgão Cliente:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#94A3B8]">
                <div className="p-2.5 rounded-lg bg-[#101B3A]">
                  <strong className="text-white block font-mono text-[11px]">
                    1. Boletim Inicial (≤ 4h):
                  </strong>
                  Notificação com identificação do evento, serviços afetados e ativação do Comitê de
                  Crise.
                </div>
                <div className="p-2.5 rounded-lg bg-[#101B3A]">
                  <strong className="text-white block font-mono text-[11px]">
                    2. Boletins de Status (8h em 8h):
                  </strong>
                  Atualização dos passos de restauração executados e previsão atualizada do RTO.
                </div>
                <div className="p-2.5 rounded-lg bg-[#101B3A]">
                  <strong className="text-white block font-mono text-[11px]">
                    3. Relatório Pós-Incidente (≤ 48h):
                  </strong>
                  Entrega formal da análise de causa-raiz (RCA) e plano de ações preventivas ao
                  fiscal do contrato.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* DOCUMENTO 3: POLÍTICA DE SUPORTE E INCIDENTES                       */}
        {/* =================================================================== */}
        <section
          id="politica-suporte"
          className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-6 scroll-mt-24"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1A2A5A]">
            <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] flex items-center gap-2.5">
              <Headphones className="w-6 h-6 text-[#F59E0B]" />
              3. Política de Suporte Técnico, SLAs e Canal de Incidentes
            </h2>
            <span className="text-xs font-mono font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-2.5 py-1 rounded border border-[#F59E0B]/30">
              Atendimento B2G Padronizado
            </span>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            <p>
              A sustentação operacional do ORBIS UOS contempla suporte técnico contínuo para suporte
              a servidores municipais, secretarias de obras, gabinetes do executivo e operadores em
              campo:
            </p>

            {/* Matriz de SLA */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] font-mono uppercase text-[#94A3B8] border-b border-[#1A2A5A] bg-[#101B3A]">
                  <tr>
                    <th className="py-2.5 px-3">Severidade</th>
                    <th className="py-2.5 px-3">Descrição Operacional do Incidente</th>
                    <th className="py-2.5 px-3">SLA de 1ª Resposta</th>
                    <th className="py-2.5 px-3">Meta de Resolução / Contorno</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A2A5A]">
                  <tr>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30">
                        P1 — Crítico
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-white">
                      <b>Plataforma Indisponível</b> ou <b>Incidente de Segurança / Dados</b>
                      <span className="block text-[11px] text-[#94A3B8] font-normal">
                        Parada total que impede o acesso de todos os usuários ou suspeita de
                        vazamento de dados cadastrais.
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#EF4444]">
                      Até 4 horas úteis
                    </td>
                    <td className="py-3 px-3 text-[#CBD5E1]">
                      Até 24 horas (alinhado ao RTO do Plano de Continuidade)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30">
                        P2 — Alto
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-white">
                      <b>Função Crítica Degradada</b>
                      <span className="block text-[11px] text-[#94A3B8] font-normal">
                        Falha na geração do Dossiê de Arquitetura, cálculo incorreto de corredor
                        viário ou falha na sincronização da telemetria de uma linha de ônibus.
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#F59E0B]">
                      Até 8 horas úteis
                    </td>
                    <td className="py-3 px-3 text-[#CBD5E1]">
                      Até 48 horas úteis (hotfix ou procedimento alternativo formal)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-[#3B82F6]/20 text-[#60A5FA] border border-[#3B82F6]/30">
                        P3 — Normal
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-white">
                      <b>Dúvida Operacional, Ajuste Cadastral ou Melhoria</b>
                      <span className="block text-[11px] text-[#94A3B8] font-normal">
                        Esclarecimento sobre a metodologia do Fator K, atualização de e-mail de
                        gestor ou sugestão de novo filtro territorial.
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#60A5FA]">
                      Até 2 dias úteis
                    </td>
                    <td className="py-3 px-3 text-[#CBD5E1]">
                      Planejada na sprint subsequente de evolução do produto
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Canal Oficial e Horários */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#3B82F6]" />
                  Canal Oficial Único de Incidentes
                </span>
                <p className="text-[#94A3B8] text-xs">
                  Para garantir rastreabilidade jurídica, todos os incidentes devem ser reportados
                  através do e-mail oficial:
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href="mailto:contato@orbis-uos.gov.br?subject=[INCIDENTE%20OPERACIONAL]%20Orbis%20UOS"
                    className="font-mono text-sm font-bold text-[#38BDF8] hover:underline"
                  >
                    contato@orbis-uos.gov.br
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="p-1 rounded bg-[#0A1128] hover:bg-[#1A2A5A] text-[#94A3B8] hover:text-white transition-colors"
                    title="Copiar e-mail"
                  >
                    {copiedEmail ? (
                      <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-[#64748B]">
                  Coerente e harmonizado com o canal do Encarregado LGPD publicado em{' '}
                  <Link to="/privacidade" className="text-[#60A5FA] underline">
                    /privacidade
                  </Link>
                  .
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#10B981]" />
                  Horário de Atendimento Institucional
                </span>
                <p className="text-[#94A3B8] text-xs leading-relaxed">
                  <b>Dias Úteis:</b> Segunda a Sexta-feira, das <b>08h00 às 18h00</b> (Horário
                  Oficial de Brasília - BRT), exceto feriados nacionais.
                </p>
                <p className="text-[#94A3B8] text-xs leading-relaxed">
                  <b>Monitoramento Automatizado:</b> Sondas automáticas de <i>health-check</i>{' '}
                  operam em regime <b>24 horas por dia, 7 dias por semana</b>, gerando alertas
                  imediatos ao plantão técnico para qualquer indisponibilidade de nível P1.
                </p>
              </div>
            </div>

            {/* Integração com o Art. 48 da LGPD */}
            <div className="p-4 rounded-xl bg-[#101B3A] border-2 border-[#10B981]/40 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#10B981]" />
                  <h4 className="font-bold text-white text-sm">
                    Harmonização Regulatória com o Art. 48 da LGPD (Incidentes de Dados)
                  </h4>
                </div>
                <Link
                  to="/privacidade"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#38BDF8] hover:underline"
                >
                  <span>Consultar Seção 5 em /privacidade</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                Incidentes de segurança que envolvam potencial comprometimento de dados pessoais de
                servidores ou titulares integram-se imediatamente ao{' '}
                <b>Protocolo Contínuo em 4 Fases da LGPD</b> já publicado na Política de Privacidade
                (Seção 5):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px] text-[#94A3B8]">
                <div className="p-2 rounded bg-[#0A1128]">
                  <strong className="text-[#60A5FA] block">Fase 1 (0h–4h):</strong>
                  Detecção e triage pelo Comitê de Segurança.
                </div>
                <div className="p-2 rounded bg-[#0A1128]">
                  <strong className="text-[#10B981] block">Fase 2 (Imediata):</strong>
                  Contenção, isolamento e revogação preventiva.
                </div>
                <div className="p-2 rounded bg-[#0A1128]">
                  <strong className="text-[#F59E0B] block">Fase 3 (≤ 48h):</strong>
                  Avaliação técnica do risco aos titulares.
                </div>
                <div className="p-2 rounded bg-[#0A1128]">
                  <strong className="text-[#EF4444] block">Fase 4:</strong>
                  Comunicação à ANPD e aos titulares nos termos da lei.
                </div>
              </div>
              <p className="text-[11px] text-[#A7F3D0]">
                • Os fluxos de solicitação do titular e prerrogativas do DPO permanecem
                centralizados na página <code>/privacidade</code>, prevenindo divergência de
                procedimentos.
              </p>
            </div>

            {/* Livro de Registro de Incidentes */}
            <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] flex items-start gap-3">
              <FileCheck2 className="w-5 h-5 text-[#3B82F6] shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <strong className="text-white block">
                  Livro de Registro de Incidentes & Prestação de Contas aos TCEs
                </strong>
                <p className="text-[#94A3B8]">
                  Todo chamado de nível P1 ou P2, bem como simulações periódicas de restore, é
                  catalogado no Livro de Incidentes com data/hora de abertura, operador responsável,
                  ações de contenção, tempo de resolução e hash SHA-256 gerado, compondo anexo
                  técnico obrigatório para auditorias dos Tribunais de Contas dos Estados (TCEs) e
                  da CGU.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Banner Final de Download e Navegação */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0A1128] via-[#101B3A] to-[#1A2A5A] border border-[#3B82F6]/40 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#3B82F6]/20 border border-[#3B82F6]/40 text-[11px] font-mono text-[#60A5FA] font-bold">
              <FileText className="w-3.5 h-3.5" />
              Documento Oficial com Hash SHA-256
            </div>
            <h3 className="text-lg font-bold text-white">
              Anexe o Pacote Operacional ao processo administrativo de contratação
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              O PDF gerado contém capa institucional, sumário de governança, declaração de RTO/RPO,
              matriz de SLA e digest criptográfico para anexação direta em processos CPSI e
              licitações GovTech.
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
                  <span>Baixar Pacote Operacional (PDF)</span>
                </>
              )}
            </button>

            <Link
              to="/metodologia"
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-[#CBD5E1] hover:text-white bg-[#101B3A] hover:bg-[#1A2A5A] border border-[#1A2A5A] text-center transition-all flex items-center justify-center gap-1.5"
            >
              <span>Ver Metodologia Homologada</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Botão de Retorno */}
        <div className="pt-2 flex items-center justify-between text-xs">
          <Link
            to="/"
            className="text-xs font-semibold text-[#CBD5E1] hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para a página inicial
          </Link>
          <span className="text-[#64748B] font-mono text-[11px]">
            ORBIS.UOS • Pacote Operacional Homologado • Release v0.0.23
          </span>
        </div>
      </div>
    </div>
  )
}
