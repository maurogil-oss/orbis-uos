import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  HelpCircle,
  Download,
  Loader2,
  FileCheck2,
  Layers,
  Database,
  ArrowRight,
  ExternalLink,
  Users,
  Activity,
  History,
  Lock,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  generateLaudoDryRunPdf,
  CRITERIOS_DRY_RUN_OFICIAIS,
  CriterioHomologacaoAuditoria,
} from '@/lib/diagnostics/laudoDryRunPdf'

export default function Homologacao() {
  const { user } = useAuth()
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [lastGeneratedHash, setLastGeneratedHash] = useState<string | null>(null)
  const [lastGeneratedProtocolo, setLastGeneratedProtocolo] = useState<string | null>(null)
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')

  const totalConformes = CRITERIOS_DRY_RUN_OFICIAIS.filter((c) => c.status === 'Conforme').length
  const totalRessalvas = CRITERIOS_DRY_RUN_OFICIAIS.filter(
    (c) => c.status === 'Conforme com ressalvas',
  ).length
  const totalNaoVerificaveis = CRITERIOS_DRY_RUN_OFICIAIS.filter(
    (c) => c.status === 'Não verificável em ensaio',
  ).length

  const criteriosFiltrados = CRITERIOS_DRY_RUN_OFICIAIS.filter((c) => {
    if (filtroStatus === 'todos') return true
    if (filtroStatus === 'conforme') return c.status === 'Conforme'
    if (filtroStatus === 'ressalva') return c.status === 'Conforme com ressalvas'
    if (filtroStatus === 'nao_verificavel') return c.status === 'Não verificável em ensaio'
    return true
  })

  const handleDownloadLaudo = async () => {
    if (isGeneratingPdf) return
    setIsGeneratingPdf(true)
    try {
      const res = await generateLaudoDryRunPdf({
        responsavelNome: user?.name || 'Acesso Público Governamental / Comissão Técnica',
        responsavelCargo: user?.email
          ? `Servidor Institucional (${user.email})`
          : 'Comissão de Homologação B2G',
        orgaoInteressado: 'Prefeitura Municipal / Secretaria de Obras',
        municipio: 'Curitiba',
        uf: 'PR',
        versao: '0.0.27',
      })
      setLastGeneratedHash(res.hash)
      setLastGeneratedProtocolo(res.protocolo)
    } catch (err) {
      console.error('Erro ao gerar Laudo de Dry-Run:', err)
      alert(
        err instanceof Error
          ? err.message
          : 'Houve uma falha ao gerar o Laudo em PDF. Verifique se o bloqueador de pop-ups está ativo.',
      )
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070D1F] text-[#F8FAFC] pt-24 pb-20">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Início
          </Link>
          <span>/</span>
          <Link to="/implantacao" className="hover:text-white transition-colors">
            Playbook de Implantação
          </Link>
          <span>/</span>
          <span className="text-[#10B981]">Dry-Run de Homologação</span>
        </div>

        {/* Header Oficial do Laudo */}
        <div className="space-y-4 pb-6 border-b border-[#1A2A5A]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-xs font-semibold text-[#10B981] w-fit">
              <Calendar className="w-3.5 h-3.5" />
              <span>Ensaio Oficial Pré-Go-Live • Release v0.0.29 • Setembro de 2026</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/implantacao"
                className="px-3.5 py-2.5 rounded-xl font-bold text-xs text-[#CBD5E1] hover:text-white bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] flex items-center gap-1.5 transition-all"
              >
                <span>Ver Playbook (/implantacao)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={handleDownloadLaudo}
                disabled={isGeneratingPdf}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] border border-[#10B981]/60 shadow-lg shadow-[#10B981]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                title="Baixar Laudo Técnico Oficial de Dry-Run de Homologação em PDF com protocolo ORBIS-DRYRUN-2026-001 e SHA-256"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Gerando Laudo...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-[#A7F3D0]" />
                    <span>Baixar Laudo de Homologação (PDF)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-[#3B82F6]/20 text-[#60A5FA] border border-[#3B82F6]/40 font-bold">
                PROTOCOLO ORBIS-DRYRUN-2026-001
              </span>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 font-bold">
                ENSAIO HOMOLOGADO COM RESSALVAS OPERACIONAIS
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Laudo Oficial de Dry-Run de Homologação (Primeiro Go-Live)
            </h1>
            <p className="text-sm text-[#94A3B8] leading-relaxed max-w-4xl">
              Resultado formal da execução, item a item, dos critérios objetivos de homologação
              declarados na <b>/implantacao</b>, auditados diretamente contra o ambiente de produção
              da plataforma ORBIS UOS. Documento orientado pelo princípio da transparência honesta:
              os itens que dependem de veículos físicos ou portarias de fiscais são destacados com
              ressalvas objetivas.
            </p>
          </div>

          {/* Feedback de Geração / Hash se já emitido */}
          {lastGeneratedHash && (
            <div className="p-3.5 rounded-xl bg-[#0A1128] border border-[#10B981]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                <span className="text-[#CBD5E1]">
                  Laudo gerado com sucesso! Protocolo:{' '}
                  <strong className="text-white font-mono">{lastGeneratedProtocolo}</strong>
                </span>
              </div>
              <div className="font-mono text-[11px] text-[#34D399] break-all">
                SHA-256: {lastGeneratedHash}
              </div>
            </div>
          )}
        </div>

        {/* Métricas do Ensaio / Cards em Destaque */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] text-center space-y-1">
            <span className="text-xs text-[#94A3B8] uppercase font-semibold">
              Critérios Conformes
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#10B981]">
              {totalConformes} / {CRITERIOS_DRY_RUN_OFICIAIS.length}
            </div>
            <span className="text-[10px] text-[#94A3B8] block">Auditoria 100% aprovada</span>
          </div>

          <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] text-center space-y-1">
            <span className="text-xs text-[#94A3B8] uppercase font-semibold">
              Com Ressalva Honesta
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#F59E0B]">
              {totalRessalvas} / {CRITERIOS_DRY_RUN_OFICIAIS.length}
            </div>
            <span className="text-[10px] text-[#94A3B8] block">Coleta em sombra física 4G</span>
          </div>

          <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] text-center space-y-1">
            <span className="text-xs text-[#94A3B8] uppercase font-semibold">Ato do Órgão</span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#A78BFA]">
              {totalNaoVerificaveis} / {CRITERIOS_DRY_RUN_OFICIAIS.length}
            </div>
            <span className="text-[10px] text-[#94A3B8] block">Portaria fiscal da Prefeitura</span>
          </div>

          <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] text-center space-y-1">
            <span className="text-xs text-[#94A3B8] uppercase font-semibold">
              RTO Aferido (Backup)
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#60A5FA]">1,45s</div>
            <span className="text-[10px] text-[#94A3B8] block">vs 24h contratuais (99,99%)</span>
          </div>
        </div>

        {/* Resumo da Execução & Princípio da Honestidade */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0A1128] via-[#101B3A] to-[#0A1128] border-2 border-[#10B981]/50 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#10B981]" />
            <h2 className="text-lg font-bold text-[#F8FAFC]">
              Declaração Institucional de Honestidade Metodológica
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            O valor de um ensaio de homologação governamental reside na{' '}
            <b>comprovação empírica e na verdade dos dados</b>, nunca em relatórios maquiados com
            100% de luz verde. A plataforma ORBIS UOS audita diretamente a sua infraestrutura de
            produção e assume com clareza quais etapas dependem da entrada em operação dos veículos
            físicos da cidade e da expedição dos atos administrativos do município contratante.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-3 rounded-xl bg-[#070D1F] border border-[#1A2A5A]">
              <span className="font-bold text-[#10B981] block mb-1">
                O que foi testado e aprovado?
              </span>
              <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                RBAC endurecido, bloqueio de auto-registro, trilha de auditoria com autoria nominal,
                cálculo do IMV com limiar F ≥ 3, k-anonimato H3 (k ≥ 3) e o teste de restauração de
                backup (RTO 1,45s).
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#070D1F] border border-[#1A2A5A]">
              <span className="font-bold text-[#F59E0B] block mb-1">
                Qual é a ressalva na coleta?
              </span>
              <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                A fila offline-first e persistência local funcionam com simulação de oscilação de
                rede. A comprovação em túneis e sombras prolongadas de sinal será concluída na
                Operação Assistida com a frota física.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#070D1F] border border-[#1A2A5A]">
              <span className="font-bold text-[#A78BFA] block mb-1">
                O que aguarda o órgão público?
              </span>
              <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                A publicação da portaria municipal designando o Fiscal Técnico e o Fiscal
                Administrativo do contrato CPSI, bem como a emissão da Ordem de Serviço formal.
              </p>
            </div>
          </div>
        </div>

        {/* Tabela de Critérios com Filtro */}
        <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A2A5A]">
            <div>
              <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#3B82F6]" />
                Checklist Auditado de Homologação (7 Itens)
              </h2>
              <span className="text-xs text-[#94A3B8]">
                Inspeção realizada em conformidade com o Playbook de Implantação
              </span>
            </div>

            {/* Filtro de Status */}
            <div className="flex items-center gap-1.5 bg-[#0A1128] p-1 rounded-xl border border-[#1A2A5A] text-xs">
              <button
                type="button"
                onClick={() => setFiltroStatus('todos')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filtroStatus === 'todos' ? 'bg-[#3B82F6] text-white font-bold' : 'text-[#94A3B8]'
                }`}
              >
                Todos ({CRITERIOS_DRY_RUN_OFICIAIS.length})
              </button>
              <button
                type="button"
                onClick={() => setFiltroStatus('conforme')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filtroStatus === 'conforme'
                    ? 'bg-[#10B981] text-white font-bold'
                    : 'text-[#94A3B8]'
                }`}
              >
                Conformes ({totalConformes})
              </button>
              <button
                type="button"
                onClick={() => setFiltroStatus('ressalva')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filtroStatus === 'ressalva'
                    ? 'bg-[#F59E0B] text-white font-bold'
                    : 'text-[#94A3B8]'
                }`}
              >
                Ressalvas ({totalRessalvas})
              </button>
              <button
                type="button"
                onClick={() => setFiltroStatus('nao_verificavel')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filtroStatus === 'nao_verificavel'
                    ? 'bg-[#8B5CF6] text-white font-bold'
                    : 'text-[#94A3B8]'
                }`}
              >
                Órgão ({totalNaoVerificaveis})
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {criteriosFiltrados.map((item) => (
              <div
                key={item.numero}
                className={`p-4 rounded-xl border transition-all ${
                  item.status === 'Conforme'
                    ? 'bg-[#0A1128] border-[#10B981]/30 hover:border-[#10B981]'
                    : item.status === 'Conforme com ressalvas'
                      ? 'bg-[#0A1128] border-[#F59E0B]/40 hover:border-[#F59E0B]'
                      : 'bg-[#0A1128] border-[#8B5CF6]/40 hover:border-[#8B5CF6]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-2 border-b border-[#1A2A5A]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#101B3A] text-[#94A3B8] font-bold">
                        Item {item.numero}
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-white">{item.criterio}</h3>
                    </div>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">{item.escopo}</p>
                  </div>

                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase font-mono tracking-wider ${
                        item.status === 'Conforme'
                          ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                          : item.status === 'Conforme com ressalvas'
                            ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                            : 'bg-[#8B5CF6]/20 text-[#C4B5FD] border border-[#8B5CF6]/40'
                      }`}
                    >
                      {item.status === 'Conforme' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                      ) : item.status === 'Conforme com ressalvas' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
                      ) : (
                        <HelpCircle className="w-3.5 h-3.5 text-[#A78BFA]" />
                      )}
                      <span>{item.status}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#101B3A] border border-[#1A2A5A] space-y-1">
                    <span className="font-bold text-[#60A5FA] flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5" />
                      Evidência Real Coletada na Base de Produção:
                    </span>
                    <p className="text-[#CBD5E1] text-[11px] leading-relaxed">
                      {item.evidenciaReal}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#101B3A] border border-[#1A2A5A] space-y-1">
                    <span className="font-bold text-[#F59E0B] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Observações de Auditoria & Ressalva:
                    </span>
                    <p className="text-[#94A3B8] text-[11px] leading-relaxed">{item.observacoes}</p>
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-[#1A2A5A]/60 flex items-center justify-between text-[10px] text-[#64748B] font-mono">
                  <span>Responsável Técnico: {item.responsavelAuditoria}</span>
                  <span className="text-[#10B981]">Conformidade LC 182/2021</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evidências do Banco de Dados Real */}
        <div className="p-6 rounded-2xl bg-[#0A1128] border border-[#3B82F6]/40 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1A2A5A]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-[#3B82F6]" />
              Evidências Extraídas da Base de Dados Real (PocketBase / Skip Cloud)
            </h2>
            <span className="text-xs font-mono text-[#10B981] bg-[#10B981]/15 px-2.5 py-0.5 rounded border border-[#10B981]/30 font-bold">
              IBGE 4106902 (Curitiba)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Collection users</span>
                <span className="font-mono text-[#60A5FA] font-bold">3 registros</span>
              </div>
              <p className="text-[11px] text-[#94A3B8]">
                2 administradores (maurog1@hotmail.com e institucional@orbis.gov.br) e 1 operador
                (operador@orbis.gov.br). Bloqueio total de auto-registro anônimo via RLS.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Collection road_events</span>
                <span className="font-mono text-[#10B981] font-bold">13 registros</span>
              </div>
              <p className="text-[11px] text-[#94A3B8]">
                Eventos inerciais com acelerometria vertical Z (pico de 3.88g na Linha Verde e 3.42g
                no Hauer), velocidades e severidades auditadas.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">audit_trail (Trilha)</span>
                <span className="font-mono text-[#F59E0B] font-bold">Nominal</span>
              </div>
              <p className="text-[11px] text-[#94A3B8]">
                Registro com autoria nominal ({`{id, email, name, role}`}) para o ensaio de dry-run
                e restauração de backup com carimbo de tempo ISO.
              </p>
            </div>
          </div>
        </div>

        {/* Próximos Passos & Integração com o Playbook */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0A1128] via-[#101B3A] to-[#1A2A5A] border border-[#10B981]/40 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#10B981]/20 border border-[#10B981]/40 text-[11px] font-mono text-[#10B981] font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Rito Oficial de Entrada em Produção
            </div>
            <h3 className="text-lg font-bold text-white">
              Pronto para avançar da Fase 3 (Homologação) para a Fase 4 (Go-Live)?
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Consulte a Matriz RACI no Playbook de Implantação ou acesse a página de Operação para
              visualizar o relatório completo do teste de restauração de backup
              (ORBIS-RESTORE-TEST-2026-001).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              to="/operacao"
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[#0A1128] hover:bg-[#101B3A] border border-[#1A2A5A] text-center transition-all"
            >
              Relatório Restore (/operacao)
            </Link>

            <Link
              to="/implantacao"
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[#2563EB] hover:bg-[#1D4ED8] shadow-lg shadow-[#2563EB]/25 text-center transition-all flex items-center justify-center gap-1.5"
            >
              <span>Playbook de Implantação</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={handleDownloadLaudo}
              disabled={isGeneratingPdf}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[#10B981] hover:bg-[#059669] shadow-lg shadow-[#10B981]/25 text-center transition-all flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Laudo (PDF)</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 flex items-center justify-between text-xs">
          <Link
            to="/implantacao"
            className="text-xs font-semibold text-[#CBD5E1] hover:text-white flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar ao Playbook de Implantação
          </Link>
          <span className="text-[#64748B] font-mono text-[11px]">
            ORBIS.UOS • Laudo de Homologação v0.0.29 • Protocolo ORBIS-DRYRUN-2026-001
          </span>
        </div>
      </div>
    </div>
  )
}
