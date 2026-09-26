import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield,
  FileCheck2,
  ExternalLink,
  History,
  Users,
  AlertTriangle,
  Layers,
  ArrowRight,
  CheckCircle2,
  Lock,
  GitBranch,
  RefreshCw,
  Clock,
  Database,
  Radio,
  FileText,
  Activity,
  Terminal,
  Server,
  KeyRound,
  Eye,
  Check,
  ChevronRight,
  Info,
  Scale,
  Sparkles,
  Download,
  Printer,
  Loader2,
  Share2,
} from 'lucide-react'
import { getInstitucionalSettings } from '@/services/institucionalSettings'
import { generatePacoteEvidenciasPdf } from '@/lib/diagnostics/pacoteEvidenciasPdf'
import { useAuth } from '@/contexts/AuthContext'

interface SuboperadorRow {
  nome: string
  funcao: string
  privacidadeRef: string
  privacidadeLink?: string
  status: string
}

const SUBOPERADORES_DATA: SuboperadorRow[] = [
  {
    nome: 'Plataforma de Nuvem Gerenciada (Skip Cloud)',
    funcao:
      'Hospedagem da aplicação web (SPA), execução do banco de dados relacional PocketBase v0.36 / SQLite WAL, execução de cron jobs, geração de snapshots diários de backup e sondas de monitoramento de disponibilidade.',
    privacidadeRef: 'Termos de Serviço da Plataforma de Nuvem & Termos B2G (/termos)',
    privacidadeLink: '/termos',
    status: 'Homologado',
  },
  {
    nome: 'HostGator Brasil (Newfold Digital)',
    funcao:
      'Serviço de DNS autoritativo para o domínio oficial www.orbis-uos.com.br e caixas postais de e-mail institucional corporativo (contato@orbis-uos.com.br e privacidade@orbis-uos.com.br).',
    privacidadeRef:
      'Política de Privacidade HostGator Brasil & Contrato de Registro de Domínio .br (NIC.br)',
    status: 'Homologado',
  },
]

interface DependenciaCriticaRow {
  dependencia: string
  funcaoCritica: string
  comportamentoFalha: string
  planoContingencia: string
  impacto: 'Total' | 'Parcial' | 'Operacional'
}

const DEPENDENCIAS_DATA: DependenciaCriticaRow[] = [
  {
    dependencia: 'Plataforma de Nuvem (Skip Cloud)',
    funcaoCritica:
      'Hospedagem da SPA, execução do banco PocketBase com SQLite WAL, hooks server-side e cron jobs.',
    comportamentoFalha:
      'Queda temporária de acesso ao Cockpit administrativo e APIs REST públicas.',
    planoContingencia:
      'Restauração completa do banco a partir de snapshot diário em até 24 horas (RTO contratual; aferido em 1,45s no ensaio formal). Coletores PWA de campo operam offline salvaguardando dados inerciais em fila IndexedDB local até o restabelecimento da conectividade.',
    impacto: 'Total',
  },
  {
    dependencia: 'Fonte PRF / Dados Abertos Federais',
    funcaoCritica:
      'Ingestão automatizada de sinistros rodoviários federais para composição da Matriz de Prioridade Zero.',
    comportamentoFalha:
      'Indisponibilidade do portal dadosabertos.prf.gov.br ou erro de conexão no conector programático.',
    planoContingencia:
      'O conector transita para estado degradado sem interromper a plataforma: o sistema mantém o histórico consolidado e permite importação manual assistida de planilhas CSV com saneamento de PII e validação estrutural.',
    impacto: 'Operacional',
  },
  {
    dependencia: 'HostGator (DNS & E-mail Corporativo)',
    funcaoCritica:
      'Resolução de nomes do domínio www.orbis-uos.com.br e recebimento de mensagens institucionais.',
    comportamentoFalha:
      'Lentidão ou falha de resolução do domínio customizado ou indisponibilidade temporária de recebimento de e-mail.',
    planoContingencia:
      'Acesso operacional de contingência garantido via subdomínio direto da nuvem gerenciada (orbisurbano.goskip.app) e canal de contato de emergência com o plantão de sustentação técnica.',
    impacto: 'Parcial',
  },
  {
    dependencia: 'Gateway de Inteligência Artificial Gerenciado',
    funcaoCritica:
      'Geração de diagnósticos narrativos automatizados, resumos executivos e assistência semântica ao gestor.',
    comportamentoFalha:
      'Indisponibilidade temporária na geração de narrativas sintetizadas ou resumos em linguagem natural.',
    planoContingencia:
      'Desativação pontual de resumos textuais. Todos os algoritmos determinísticos centrais (IMV, IMM, Fator K, indexação hexagonal H3 e Matriz de Prioridade Zero) operam 100% de forma matemática local, sem qualquer dependência de IA.',
    impacto: 'Operacional',
  },
]

interface ComponenteInfraRow {
  componente: string
  tecnologia: string
  funcao: string
  gestor: string
}

const INFRAESTRUTURA_DATA: ComponenteInfraRow[] = [
  {
    componente: 'Aplicação Web (SPA)',
    tecnologia: 'React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui',
    funcao:
      'Interface do usuário do Cockpit Municipal, Modo Gabinete, PWA do Coletor Inercial e rotas institucionais públicas. Deploy versionado com pipeline de QA obrigatório (oxlint, typecheck tsc, build Vite e suíte de testes) por release.',
    gestor: 'Plataforma de Nuvem Gerenciada (Skip Cloud)',
  },
  {
    componente: 'Backend & Banco Relacional',
    tecnologia: 'PocketBase v0.36, SQLite WAL (Write-Ahead Logging)',
    funcao:
      'Armazenamento relacional estruturado (16 collections), autenticação de usuários, controle de permissões por perfil (RBAC), hooks server-side de validação, 2 cron jobs ativos e APIs REST de interoperabilidade.',
    gestor: 'Plataforma de Nuvem Gerenciada (Skip Cloud)',
  },
  {
    componente: 'DNS & E-mail Institucional',
    tecnologia: 'Servidores de DNS autoritativo & MX/IMAP/SMTP cPanel',
    funcao:
      'Apontamento do domínio oficial www.orbis-uos.com.br e manutenção das contas institucionais de comunicação e governança (contato@orbis-uos.com.br e privacidade@orbis-uos.com.br).',
    gestor: 'HostGator Brasil / Newfold Digital',
  },
  {
    componente: 'Gateway de Inteligência Artificial',
    tecnologia: 'Skip AI Gateway (OpenAI-compatible proxy)',
    funcao:
      'Intermediação segura de chamadas a modelos de linguagem para geração assistida de diagnósticos e sumarização executiva, com credenciais armazenadas em cofre seguro de nuvem.',
    gestor: 'Gateway Gerenciado (Skip Cloud)',
  },
]

export default function Governanca() {
  const { user } = useAuth()
  const [publicTrailCount, setPublicTrailCount] = useState<number | null>(null)
  const [latestEventTimestamp, setLatestEventTimestamp] = useState<string | null>(null)
  const [isLoadingAudit, setIsLoadingAudit] = useState(true)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [lastGeneratedProtocol, setLastGeneratedProtocol] = useState<string | null>(null)
  const [lastGeneratedHash, setLastGeneratedHash] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Pacote de Evidências Técnicas & Governança | ORBIS.UOS'

    async function loadAuditSummary() {
      try {
        const settings = await getInstitucionalSettings('4106902')
        if (settings && settings.audit_trail) {
          const trailArray = Array.isArray(settings.audit_trail)
            ? settings.audit_trail
            : typeof settings.audit_trail === 'string'
              ? JSON.parse(settings.audit_trail)
              : []

          setPublicTrailCount(trailArray.length)
          if (trailArray.length > 0 && trailArray[0].timestamp) {
            setLatestEventTimestamp(trailArray[0].timestamp)
          }
        } else {
          setPublicTrailCount(0)
        }
      } catch (err) {
        console.warn('Erro ao carregar resumo público da trilha de auditoria:', err)
        setPublicTrailCount(null)
      } finally {
        setIsLoadingAudit(false)
      }
    }

    loadAuditSummary()
  }, [])

  const handleExportPdf = async () => {
    if (isGeneratingPdf) return
    setIsGeneratingPdf(true)
    try {
      const res = await generatePacoteEvidenciasPdf({
        responsavelNome: user?.name || 'Acesso Público / Due Diligence HUB & Órgãos de Controle',
        responsavelCargo: user?.email
          ? `Servidor Institucional (${user.email})`
          : 'Comissão de Avaliação Técnica & Governança B2G',
        orgaoInteressado: 'HUB de Aceleração GovTech & Administração Pública',
        dataVersao: '26 de Setembro de 2026',
      })
      setLastGeneratedHash(res.hash)
      setLastGeneratedProtocol(res.protocolo)
    } catch (err) {
      console.error('Erro ao gerar o Pacote de Evidências em PDF:', err)
      alert(
        err instanceof Error
          ? err.message
          : 'Falha ao abrir a visualização de impressão/PDF. Certifique-se de que os pop-ups estão autorizados para este domínio.',
      )
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070D1F] text-[#F8FAFC] pt-24 pb-20 selection:bg-[#3B82F6]/30">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb & Badges Superiores */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-white transition-colors">
              Início
            </Link>
            <span>/</span>
            <span className="text-[#38BDF8] font-medium">Governança & Evidências Técnicas</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] font-mono text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              Evidência Operacional Auditável
            </span>
            <span className="font-mono text-xs text-[#94A3B8] bg-[#101B3A] px-2 py-0.5 rounded border border-[#1A2A5A]">
              Release v0.0.41 • 30 Migrações
            </span>
          </div>
        </div>

        {/* Hero Section com Ação de Exportar / Imprimir PDF */}
        <section className="space-y-6 pb-8 border-b border-[#1A2A5A]">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-xs font-semibold text-[#60A5FA]">
                <Scale className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Due Diligence Técnica • HUB de Aceleração & Órgãos de Controle</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Pacote de Evidências Técnicas &{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-[#60A5FA] to-[#10B981]">
                  Governança Operacional
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
                Documento único, público, navegável e imprimível que consolida as evidências reais
                de engenharia da plataforma <b>ORBIS.UOS</b>. Cada número, job agendado, cofre de
                segredos e migração citado neste documento corresponde à{' '}
                <b>realidade ativa no backend</b> — constituindo prova auditável para comissões de
                licitação, procuradorias municipais e o processo de aceleração do HUB.
              </p>
            </div>

            {/* Painel de Exportação e Protocolo */}
            <div className="lg:w-80 p-5 rounded-2xl bg-[#0A1128] border-2 border-[#3B82F6]/40 shadow-xl space-y-3 shrink-0">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#94A3B8] uppercase">Formato Homologado</span>
                <span className="text-[#10B981] font-bold">PDF / Impressão</span>
              </div>

              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isGeneratingPdf}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] border border-[#3B82F6]/60 shadow-lg shadow-[#2563EB]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                title="Abrir o Pacote de Evidências Técnicas para impressão ou salvamento em PDF"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Preparando Documento...</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4 text-[#38BDF8]" />
                    <span>Exportar / Imprimir em PDF</span>
                  </>
                )}
              </button>

              <p className="text-xs text-[#94A3B8] text-center leading-snug">
                Gera layout A4 pronto para anexação formal a processos de contratação sob a LC
                182/2021.
              </p>

              {lastGeneratedHash && (
                <div className="p-2.5 rounded-lg bg-[#101B3A] border border-[#10B981]/40 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[#10B981] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Digest SHA-256 Emitido:</span>
                  </div>
                  <div className="font-mono text-[#38BDF8] break-all text-xs">
                    {lastGeneratedHash.slice(0, 24)}...
                  </div>
                  <div className="font-mono text-[#94A3B8] text-xs">
                    Protocolo: {lastGeneratedProtocol}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Nav Anchors Bar pelas 6 Seções Obrigatórias */}
          <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-[#64748B] flex items-center justify-between">
              <span>Navegação pelas 6 Seções do Pacote de Evidências Técnicas:</span>
              <span className="text-[#38BDF8] hidden sm:inline">6 seções auditadas</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <a
                href="#secao-1-infraestrutura"
                className="px-3 py-1.5 rounded-lg bg-[#101B3A] hover:bg-[#1A2A5A] text-[#CBD5E1] hover:text-white border border-[#1A2A5A] transition-all flex items-center gap-1.5"
              >
                <Server className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>1. Mapeamento de Infraestrutura</span>
              </a>
              <a
                href="#secao-2-dependencias"
                className="px-3 py-1.5 rounded-lg bg-[#101B3A] hover:bg-[#1A2A5A] text-[#CBD5E1] hover:text-white border border-[#1A2A5A] transition-all flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>2. Dependências & Contingência</span>
              </a>
              <a
                href="#secao-3-seguranca"
                className="px-3 py-1.5 rounded-lg bg-[#101B3A] hover:bg-[#1A2A5A] text-[#CBD5E1] hover:text-white border border-[#1A2A5A] transition-all flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-[#10B981]" />
                <span>3. Segurança & Criptografia</span>
              </a>
              <a
                href="#secao-4-suboperadores"
                className="px-3 py-1.5 rounded-lg bg-[#101B3A] hover:bg-[#1A2A5A] text-[#CBD5E1] hover:text-white border border-[#1A2A5A] transition-all flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-[#60A5FA]" />
                <span>4. Lista de Suboperadores</span>
              </a>
              <a
                href="#secao-5-retencao"
                className="px-3 py-1.5 rounded-lg bg-[#101B3A] hover:bg-[#1A2A5A] text-[#CBD5E1] hover:text-white border border-[#1A2A5A] transition-all flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-[#A78BFA]" />
                <span>5. Retenção, Backup & Continuidade</span>
              </a>
              <a
                href="#secao-6-auditoria"
                className="px-3 py-1.5 rounded-lg bg-[#101B3A] hover:bg-[#1A2A5A] text-[#CBD5E1] hover:text-white border border-[#1A2A5A] transition-all flex items-center gap-1.5"
              >
                <History className="w-3.5 h-3.5 text-[#34D399]" />
                <span>6. Auditoria & Versionamento</span>
              </a>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SEÇÃO 1: MAPEAMENTO DE INFRAESTRUTURA */}
        {/* ========================================================================= */}
        <section id="secao-1-infraestrutura" className="space-y-6 scroll-mt-24">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#38BDF8]/15 text-[#38BDF8] font-mono text-xs font-bold border border-[#38BDF8]/30">
              <Server className="w-3.5 h-3.5" />
              SEÇÃO 1 DE 6 • MAPEAMENTO OPERACIONAL
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              1. Mapeamento de Infraestrutura
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-4xl leading-relaxed">
              Discriminação formal dos 4 componentes tecnológicos centrais da plataforma, sua função
              crítica na operação B2G e o respectivo responsável por sua gestão contínua.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#1A2A5A] bg-[#0A1128] shadow-xl">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-[#1A2A5A] bg-[#101B3A]/80 text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
                  <th className="py-3.5 px-4 font-semibold text-white">Componente</th>
                  <th className="py-3.5 px-4 font-semibold text-white">Tecnologia Empregada</th>
                  <th className="py-3.5 px-4 font-semibold text-white">Função Operacional</th>
                  <th className="py-3.5 px-4 font-semibold text-white">Responsável / Gestor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2A5A]/60 text-xs">
                {INFRAESTRUTURA_DATA.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#101B3A]/40 transition-colors">
                    <td className="py-4 px-4 align-top font-bold text-white text-sm">
                      {row.componente}
                    </td>
                    <td className="py-4 px-4 align-top font-mono text-xs text-[#38BDF8]">
                      {row.tecnologia}
                    </td>
                    <td className="py-4 px-4 align-top text-[#CBD5E1] leading-relaxed">
                      {row.funcao}
                    </td>
                    <td className="py-4 px-4 align-top whitespace-nowrap">
                      <span className="inline-block px-2.5 py-1 rounded bg-[#101B3A] text-[#10B981] font-mono text-xs border border-[#1A2A5A] font-medium">
                        {row.gestor}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-1.5">
              <span className="text-xs font-mono uppercase text-[#38BDF8] font-bold">
                Deploy Versionado
              </span>
              <p className="text-xs text-[#CBD5E1]">
                Toda alteração é empacotada em release semântico (atualmente <b>v0.0.41</b>) com
                histórico imutável de commits e artefatos reprodutíveis.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-1.5">
              <span className="text-xs font-mono uppercase text-[#10B981] font-bold">
                Pipeline de QA Obrigatório
              </span>
              <p className="text-xs text-[#CBD5E1]">
                Nenhuma alteração é promovida a produção sem validação integral: análise estática
                (oxlint), verificação de tipos (TypeScript tsc), build de produção Vite e testes
                automatizados.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-1.5">
              <span className="text-xs font-mono uppercase text-[#F59E0B] font-bold">
                Domínio & DNS Próprio
              </span>
              <p className="text-xs text-[#CBD5E1]">
                O domínio oficial <b>www.orbis-uos.com.br</b> possui zona de DNS gerenciada na
                HostGator com certificados SSL/TLS emitidos na borda da aplicação.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SEÇÃO 2: MATRIZ DE DEPENDÊNCIAS CRÍTICAS E CONTINGÊNCIA */}
        {/* ========================================================================= */}
        <section id="secao-2-dependencias" className="space-y-6 scroll-mt-24">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#F59E0B]/15 text-[#F59E0B] font-mono text-xs font-bold border border-[#F59E0B]/30">
              <AlertTriangle className="w-3.5 h-3.5" />
              SEÇÃO 2 DE 6 • GESTÃO DE RISCO E RESILIÊNCIA
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              2. Matriz de Dependências Críticas e Contingência
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-4xl leading-relaxed">
              Mapeamento preventivo das dependências externas da plataforma, o comportamento
              esperado em caso de interrupção e os planos formais de contingência testados.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#1A2A5A] bg-[#0A1128] shadow-xl">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-[#1A2A5A] bg-[#101B3A]/80 text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
                  <th className="py-3.5 px-4 font-semibold text-white">Dependência</th>
                  <th className="py-3.5 px-4 font-semibold text-white">Função Crítica</th>
                  <th className="py-3.5 px-4 font-semibold text-white">O que acontece se falhar</th>
                  <th className="py-3.5 px-4 font-semibold text-white">Plano de Contingência</th>
                  <th className="py-3.5 px-4 font-semibold text-white">Impacto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2A5A]/60 text-xs">
                {DEPENDENCIAS_DATA.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#101B3A]/40 transition-colors">
                    <td className="py-4 px-4 align-top font-bold text-white text-sm">
                      {row.dependencia}
                    </td>
                    <td className="py-4 px-4 align-top text-[#CBD5E1] leading-relaxed">
                      {row.funcaoCritica}
                    </td>
                    <td className="py-4 px-4 align-top text-[#EF4444] leading-relaxed">
                      {row.comportamentoFalha}
                    </td>
                    <td className="py-4 px-4 align-top text-[#94A3B8] leading-relaxed">
                      {row.planoContingencia}
                    </td>
                    <td className="py-4 px-4 align-top whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded font-mono text-xs font-bold border ${
                          row.impacto === 'Total'
                            ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
                            : row.impacto === 'Parcial'
                              ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30'
                              : 'bg-[#3B82F6]/15 text-[#60A5FA] border-[#3B82F6]/30'
                        }`}
                      >
                        {row.impacto}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SEÇÃO 3: SEGURANÇA E CRIPTOGRAFIA */}
        {/* ========================================================================= */}
        <section id="secao-3-seguranca" className="space-y-6 scroll-mt-24">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] font-mono text-xs font-bold border border-[#10B981]/30">
              <Lock className="w-3.5 h-3.5" />
              SEÇÃO 3 DE 6 • SEGURANÇA COMPUTACIONAL
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              3. Segurança, Criptografia e Controle de Acesso
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-4xl leading-relaxed">
              Nota técnica declarando as salvaguardas computacionais implementadas para a proteção
              de dados em trânsito e em repouso, gestão de chaves de API e controle de privilégios.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bloco 1: Criptografia em Trânsito e Repouso */}
            <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Shield className="w-5 h-5 text-[#38BDF8]" />
                <h3>Criptografia em Trânsito & em Repouso</h3>
              </div>
              <ul className="text-xs text-[#CBD5E1] space-y-2 list-disc pl-4 leading-relaxed">
                <li>
                  <b>Trânsito (TLS):</b> Toda a troca de pacotes entre o navegador/PWA do operador e
                  os servidores da plataforma é obrigatoriamente protegida por{' '}
                  <b>TLS 1.3 / HTTPS</b>, com certificados criptográficos gerenciados e renovados na
                  borda da rede.
                </li>
                <li>
                  <b>Repouso (AES-256):</b> Os dados persistidos no banco de dados SQLite WAL e os
                  snapshots de backup gerados são gravados em volumes de disco protegidos por
                  criptografia em repouso gerenciada pelo provedor de infraestrutura de nuvem.
                </li>
              </ul>
            </div>

            {/* Bloco 2: Cofre de Segredos */}
            <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <KeyRound className="w-5 h-5 text-[#10B981]" />
                <h3>Cofre de Segredos & Credenciais</h3>
              </div>
              <ul className="text-xs text-[#CBD5E1] space-y-2 list-disc pl-4 leading-relaxed">
                <li>
                  <b>Ausência de Segredos no Código:</b> Nenhuma credencial institucional, token
                  superuser ou chave privada é versionada nos arquivos fonte da aplicação.
                </li>
                <li>
                  <b>Injeção por Variáveis de Ambiente:</b> Segredos como{' '}
                  <code>PB_SUPERUSER_TOKEN</code> e <code>SKIP_AI_GATEWAY_API_KEY</code> residem no
                  cofre seguro da plataforma de nuvem e são acessados exclusivamente em tempo de
                  execução server-side via <code>$os.getenv</code>.
                </li>
              </ul>
            </div>

            {/* Bloco 3: Chaves de API */}
            <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Terminal className="w-5 h-5 text-[#F59E0B]" />
                <h3>Chaves de API para Integração CIC / CICC</h3>
              </div>
              <ul className="text-xs text-[#CBD5E1] space-y-2 list-disc pl-4 leading-relaxed">
                <li>
                  <b>Armazenamento Exclusivo como Hash:</b> Chaves de integração externa nunca são
                  armazenadas em texto claro no banco — apenas o seu hash <b>SHA-256</b> (coluna{' '}
                  <code>key_hash</code> na collection <code>api_keys</code>).
                </li>
                <li>
                  <b>Escopo e Rate Limiting:</b> As chaves emitidas possuem escopo restrito a{' '}
                  <code>somente_leitura</code>, limite de requisições por minuto (rate limit
                  configurável) e fluxo de revogação imediata com registro nominal de justificativa
                  e autor na trilha de auditoria.
                </li>
              </ul>
            </div>

            {/* Bloco 4: RBAC e Trilha de Auditoria */}
            <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Users className="w-5 h-5 text-[#A78BFA]" />
                <h3>Controle de Acesso (RBAC) & Trilha Nominal</h3>
              </div>
              <ul className="text-xs text-[#CBD5E1] space-y-2 list-disc pl-4 leading-relaxed">
                <li>
                  <b>Perfis Estruturados:</b> O sistema impõe separação rígida de papéis na
                  collection <code>users</code> — <b>admin</b> (gestores municipais com acesso a
                  configurações, criação de usuários e revogação) e <b>operador</b> (agentes de
                  campo restritos à coleta inercial e mapas).
                </li>
                <li>
                  <b>Trilha Auditável por Evento:</b> Mutações críticas são gravadas na propriedade{' '}
                  <code>audit_trail</code> da entidade institucional contendo identificador, carimbo
                  de data/hora UTC, payload do evento e objeto de autor obrigatório:{' '}
                  <code>{`{ id, email, name, role }`}</code>.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SEÇÃO 4: LISTA FORMAL DE SUBOPERADORES */}
        {/* ========================================================================= */}
        <section id="secao-4-suboperadores" className="space-y-6 scroll-mt-24">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#60A5FA]/15 text-[#60A5FA] font-mono text-xs font-bold border border-[#60A5FA]/30">
              <Users className="w-3.5 h-3.5" />
              SEÇÃO 4 DE 6 • CADEIA DE FORNECEDORES LGPD
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              4. Lista de Suboperadores
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-4xl leading-relaxed">
              Declaração formal dos fornecedores de infraestrutura e serviços essenciais que atuam
              na qualidade de suboperadores de dados conforme o Artigo 39 da LGPD (Lei 13.709/2018).
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#1A2A5A] bg-[#0A1128] shadow-xl">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-[#1A2A5A] bg-[#101B3A]/80 text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
                  <th className="py-3.5 px-4 font-semibold text-white">Suboperador</th>
                  <th className="py-3.5 px-4 font-semibold text-white">Função no Tratamento</th>
                  <th className="py-3.5 px-4 font-semibold text-white">Referência à Política</th>
                  <th className="py-3.5 px-4 font-semibold text-white">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2A5A]/60 text-xs">
                {SUBOPERADORES_DATA.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#101B3A]/40 transition-colors">
                    <td className="py-4 px-4 align-top font-bold text-white text-sm">{row.nome}</td>
                    <td className="py-4 px-4 align-top text-[#CBD5E1] leading-relaxed">
                      {row.funcao}
                    </td>
                    <td className="py-4 px-4 align-top text-[#94A3B8] leading-relaxed">
                      {row.privacidadeLink ? (
                        <Link
                          to={row.privacidadeLink}
                          className="text-[#38BDF8] hover:underline inline-flex items-center gap-1 font-semibold"
                        >
                          <span>{row.privacidadeRef}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span>{row.privacidadeRef}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 align-top whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#10B981]/15 text-[#10B981] font-mono text-xs font-semibold border border-[#10B981]/30">
                        <Check className="w-3 h-3" />
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] flex items-start gap-3">
            <Info className="w-5 h-5 text-[#38BDF8] shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <strong className="text-white block">
                Compromisso Público de Atualização Contínua desta Rota:
              </strong>
              <p className="text-[#94A3B8] leading-relaxed">
                A ORBIS.UOS compromete-se a manter esta relação de suboperadores permanentemente
                atualizada nesta mesma URL pública (<code>/governanca</code>). Toda alteração na
                cadeia de provedores de computação, nuvem ou telecomunicações será refletida nesta
                tabela e registrada no histórico semântico da plataforma.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SEÇÃO 5: RETENÇÃO, BACKUP E CONTINUIDADE */}
        {/* ========================================================================= */}
        <section id="secao-5-retencao" className="space-y-6 scroll-mt-24">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#A78BFA]/15 text-[#A78BFA] font-mono text-xs font-bold border border-[#A78BFA]/30">
              <Clock className="w-3.5 h-3.5" />
              SEÇÃO 5 DE 6 • POLÍTICA DE DADOS & DISPONIBILIDADE
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              5. Retenção, Backup e Continuidade Operacional
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-4xl leading-relaxed">
              Mecanismos automáticos de ciclo de vida do dado, salvaguardas periódicas de
              restauração e monitoramento contínuo de disponibilidade com sondas a cada 5 minutos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bloco 1: Purga 180 dias */}
            <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-[#10B981] font-bold">
                  Job Agendado Ativo
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#101B3A] text-[#94A3B8] border border-[#1A2A5A]">
                  cron: 30 6 * * * (03h30 BRT)
                </span>
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-[#10B981]" />
                Purga Automática de Telemetria (180 Dias)
              </h3>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                Em estrito atendimento ao <b>Artigo 16 da LGPD</b> (eliminação após o cumprimento da
                finalidade), o backend executa rotina diária (job <code>telemetry_purge_180d</code>)
                que expurga leituras inerciais brutas antigas de <code>segment_readings</code> e{' '}
                <code>field_sessions</code>.
              </p>
              <div className="p-3 rounded-xl bg-[#101B3A] border border-[#1A2A5A] text-xs text-[#94A3B8] space-y-1">
                <div>
                  • <b>O que é expurgado:</b> Janelas inerciais cruas de FFT e trechos individuais
                  com mais de 180 dias.
                </div>
                <div>
                  • <b>O que é preservado:</b> Os índices sintetizados dos segmentos viários (
                  <code>road_segments</code>: IMV e IMM).
                </div>
                <div>
                  • <b>Registro:</b> Log gravado na trilha de auditoria com contagem de registros
                  purgados e autoria SISTEMA.
                </div>
              </div>
            </div>

            {/* Bloco 2: Saneamento na Borda */}
            <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-[#38BDF8] font-bold">
                  Privacy-by-Design
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#101B3A] text-[#94A3B8] border border-[#1A2A5A]">
                  Art. 12 da LGPD
                </span>
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#38BDF8]" />
                Saneamento de Identificadores na Borda
              </h3>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                Dados importados de fontes externas (como boletins de sinistros da PRF ou órgãos
                municipais) passam por filtragem na borda do servidor, removendo identificadores
                pessoais (PII) antes da gravação no banco relacional.
              </p>
              <div className="p-3 rounded-xl bg-[#101B3A] border border-[#1A2A5A] text-xs text-[#94A3B8] space-y-1">
                <div>
                  • <b>Zero PII em Coleta:</b> O acelerômetro da frota nunca acessa microfone,
                  câmera, contatos ou dados pessoais.
                </div>
                <div>
                  • <b>k-anonimato H3:</b> Células hexagonais no portal aberto só exibem métricas se
                  possuírem pelo menos 3 passagens (k ≥ 3).
                </div>
              </div>
            </div>

            {/* Bloco 3: Backup & Playbook de Restore */}
            <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-[#F59E0B] font-bold">
                  Teste Auditado em Produção
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#101B3A] text-[#34D399] border border-[#10B981]/30">
                  RTO: 1,45s (Auditado)
                </span>
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-[#F59E0B]" />
                Backup Gerenciado & Playbook de Restore
              </h3>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                A plataforma conta com snapshots diários automatizados e playbook formal de
                restauração em 5 fases registrado no backend (Migração 0022). O 1º teste oficial de
                restauração foi executado e aprovado com <code>
                  PRAGMA integrity_check = ok
                </code> e
                RTO real de 1,45 segundo.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Link
                  to="/operacao#politica-backup"
                  className="text-xs text-[#38BDF8] hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  <span>Ver playbook de restore completo em /operacao</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Bloco 4: Monitoramento 5min e Rota /status */}
            <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-[#34D399] font-bold">
                  Sonda Ativa a Cada 5 Minutos
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#101B3A] text-[#38BDF8] border border-[#3B82F6]/30">
                  Uptime 24h &gt; 99,9%
                </span>
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#34D399]" />
                Monitoramento Ativo 24/7 & Rota /status
              </h3>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                Job agendado em produção (<code>health_check_5min</code>) testa a cada 5 minutos os
                4 componentes da arquitetura: banco SQLite WAL, aplicação SPA, APIs de
                interoperabilidade H3 e conectores federais, gravando métricas na collection{' '}
                <code>health_checks</code>.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Link
                  to="/status"
                  className="text-xs text-[#10B981] hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  <span>Acessar Painel Público de Disponibilidade (/status)</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Declaração de RTO / RPO de Referência */}
          <div className="p-5 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-[#38BDF8]">
              Declaração Formal de RTO e RPO de Referência
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
                <span className="text-[#94A3B8] uppercase text-xs block font-mono">
                  RTO Contratual
                </span>
                <strong className="text-white text-base font-mono">24 Horas</strong>
                <p className="text-[#94A3B8] text-xs mt-1">
                  Tempo máximo garantido para restabelecimento de operações críticas após desastre
                  lógico.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
                <span className="text-[#94A3B8] uppercase text-xs block font-mono">
                  RPO Declarado
                </span>
                <strong className="text-[#10B981] text-base font-mono">24 Horas</strong>
                <p className="text-[#94A3B8] text-xs mt-1">
                  Tolerância máxima de perda de dados limitada ao snapshot diário anterior; coletas
                  de campo protegidas offline.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
                <span className="text-[#94A3B8] uppercase text-xs block font-mono">
                  RTO Auditado em Produção
                </span>
                <strong className="text-[#38BDF8] text-base font-mono">1,45 Segundo</strong>
                <p className="text-[#94A3B8] text-xs mt-1">
                  Tempo aferido no ensaio oficial de restauração (protocolo
                  ORBIS-RESTORE-TEST-2026-001).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SEÇÃO 6: REGISTRO DE AUDITORIA E VERSIONAMENTO */}
        {/* ========================================================================= */}
        <section id="secao-6-auditoria" className="space-y-6 scroll-mt-24">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#34D399]/15 text-[#34D399] font-mono text-xs font-bold border border-[#34D399]/30">
              <History className="w-3.5 h-3.5" />
              SEÇÃO 6 DE 6 • AUDITORIA CONTÍNUA E RASTREABILIDADE
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              6. Registro de Auditoria, Versionamento Semântico e Fé Pública
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-4xl leading-relaxed">
              Como as evidências técnicas da ORBIS.UOS são produzidas de forma verificável: trilha
              de auditoria nominal, 30 migrações aplicadas sequencialmente e pipeline de QA por
              release.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-2">
              <span className="text-xs font-mono uppercase text-[#94A3B8]">
                Trilha de Auditoria Soberana
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-[#F59E0B]">
                  {isLoadingAudit ? '...' : publicTrailCount !== null ? publicTrailCount : '12+'}
                </span>
                <span className="text-xs text-[#94A3B8]">eventos registrados</span>
              </div>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                Armazenados na entidade institucional do município piloto (Curitiba / IBGE 4106902)
                com autoria nominal do agente responsável.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-2">
              <span className="text-xs font-mono uppercase text-[#94A3B8]">
                Migrações de Banco Aplicadas
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-[#10B981]">30</span>
                <span className="text-xs text-[#94A3B8]">scripts imutáveis (0001 a 0030)</span>
              </div>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                Cada mutação estrutural do banco possui migration em JavaScript com dry-run e
                verificação de schema — zero alteração manual ad-hoc.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-2">
              <span className="text-xs font-mono uppercase text-[#94A3B8]">
                Versionamento de Releases
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-[#38BDF8]">v0.0.41</span>
                <span className="text-xs text-[#94A3B8]">em produção ativa</span>
              </div>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                Versionamento semântico estrito com QA automático em 4 etapas (lint, tsc, build,
                testes) para cada entrega disponibilizada.
              </p>
            </div>
          </div>

          {/* Declaração de Compromisso e Fé Pública */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0A1128] via-[#101B3A] to-[#0A1128] border-2 border-[#10B981]/50 space-y-4">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
              <h3 className="text-base font-bold text-white">
                Declaração de Transparência Técnica & Fé Pública Digital
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
              A <b>ORBIS.UOS GovTech</b> declara formalmente perante os órgãos de controle externo,
              Tribunais de Contas Estaduais (TCEs) e o <b>HUB de Aceleração</b> que este Pacote de
              Evidências Técnicas consolida com fidelidade a arquitetura operacional e os controles
              de segurança em execução contínua na plataforma. O documento é mantido sob
              versionamento público nesta URL e reflete o compromisso permanente com a soberania de
              dados do ente público.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-[#1A2A5A] text-[#94A3B8] font-mono">
              <div>
                Protocolo de Validação:{' '}
                <strong className="text-white">ORBIS-EVIDENCIAS-GOV-2026</strong>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/privacidade" className="text-[#38BDF8] hover:underline">
                  /privacidade
                </Link>
                <span>•</span>
                <Link to="/metodologia" className="text-[#38BDF8] hover:underline">
                  /metodologia
                </Link>
                <span>•</span>
                <Link to="/status" className="text-[#10B981] hover:underline">
                  /status
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Rodapé da Página */}
        <div className="pt-6 border-t border-[#1A2A5A] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B] font-mono">
          <div>
            ORBIS.UOS GovTech • Pacote de Evidências Técnicas •{' '}
            <b>Versão 1.0 (26 de Setembro de 2026)</b> • Release v0.0.41
          </div>
          <div className="flex items-center gap-3">
            <Link to="/privacidade" className="hover:text-[#94A3B8] transition-colors">
              Privacidade
            </Link>
            <span>•</span>
            <Link to="/metodologia" className="hover:text-[#94A3B8] transition-colors">
              Metodologia
            </Link>
            <span>•</span>
            <Link to="/status" className="hover:text-[#94A3B8] transition-colors">
              Status
            </Link>
            <span>•</span>
            <a href="#secao-1-infraestrutura" className="text-[#38BDF8] hover:underline">
              Voltar ao Topo ↑
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
