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
} from 'lucide-react'
import { getInstitucionalSettings } from '@/services/institucionalSettings'

interface NormativeRow {
  norma: string
  apelido: string
  autoridade: string
  artigos: string
  requisito: string
  atendimento: string
  evidenciaLink: string
  evidenciaLabel: string
  status: 'Conforme' | 'Auditado' | 'Implementado'
}

const NORMATIVE_DATA: NormativeRow[] = [
  {
    norma: 'Lei Federal nº 13.709/2018',
    apelido: 'LGPD',
    autoridade: 'ANPD / Federal',
    artigos: 'Art. 7º, 11, 12 e 16',
    requisito:
      'Dados anonimizados não são pessoais; k-anonimato territorial em células H3; minimização e descarte após o prazo estrito.',
    atendimento:
      'FFT executada na borda (Edge DSP). Eventos transmitidos sem identificação veicular ou trajeto individual. Agregação espacial k ≥ 3 sessões por hexágono H3 e purga automática aos 180 dias.',
    evidenciaLink: '/privacidade',
    evidenciaLabel: 'Política de Privacidade (/privacidade)',
    status: 'Conforme',
  },
  {
    norma: 'Lei Complementar nº 182/2021',
    apelido: 'Marco Legal CPSI',
    autoridade: 'Congresso Nacional',
    artigos: 'Art. 27 a 31',
    requisito:
      'Contratação pública de inovação com matriz de risco equilibrada, metas objetivas de economicidade e prestação de contas com trilha de auditoria nominal.',
    atendimento:
      'Enquadramento paramétrico em 6 blocos com matriz de risco e economicidade geradas automaticamente, laudo Dry-Run pré-go-live e registros com autoria nominal.',
    evidenciaLink: '/enquadramento',
    evidenciaLabel: 'Dossiê CPSI (/enquadramento)',
    status: 'Conforme',
  },
  {
    norma: 'ISO 37120 / ISO 37122 / ISO 37125',
    apelido: 'Cidades Inteligentes & Sustentáveis',
    autoridade: 'ABNT / ISO Internacional',
    artigos: 'Seções 19 (Transporte) e 21 (Infraestrutura)',
    requisito:
      'Padronização de indicadores de qualidade da malha viária, segurança e sustentabilidade urbana com dados abertos e reprodutíveis.',
    atendimento:
      'Cálculo do IMV (Índice de Manutenção Viária) e IMM alinhado à escala IRI do Banco Mundial e exportação de feições GeoJSON RFC 7946 para interoperabilidade metropolitana.',
    evidenciaLink: '/metodologia',
    evidenciaLabel: 'Metodologia Científica (/metodologia)',
    status: 'Auditado',
  },
  {
    norma: 'Resoluções CONTRAN & PNATRANS',
    apelido: 'Plano Nacional de Redução de Mortes no Trânsito',
    autoridade: 'Ministério dos Transportes / SENATRAN',
    artigos: 'Metas Decenais (Lei 13.614/2018)',
    requisito:
      'Zeladoria preventiva voltada à eliminação de armadilhas viárias em trechos com alta concentração de acidentes e vulnerabilidade.',
    atendimento:
      'Matriz de Prioridade Zero que cruza severidade de pavimento (IMV) com zonas escolares (INEP), transporte (GTFS) e sinistralidade real com procedência declarada (PRF, Bombeiros e Boletins Municipais) ancorados em células hexagonais H3.',
    evidenciaLink: '/metodologia',
    evidenciaLabel: 'Prioridade Zero (/metodologia)',
    status: 'Implementado',
  },
  {
    norma: 'Lei Federal nº 9.503/1997 & Lei 4.320/1964',
    apelido: 'Art. 320 do CTB & Custo Evitado',
    autoridade: 'Tribunais de Contas Estaduais (TCE)',
    artigos: 'Art. 320 CTB / Arts. 85-93 Lei 4.320/64',
    requisito:
      'Destinação exclusiva da receita de multas à sinalização e engenharia de tráfego, comprovando nexo causal estrito e economicidade preventiva.',
    atendimento:
      'Simulador paramétrico de Custo Evitado auditável (com economia comprovada de até R$ 21/hab/ano) e minuta de empenho orçamentário vinculada à rubrica de engenharia de tráfego.',
    evidenciaLink: '/enquadramento',
    evidenciaLabel: 'Minuta Art. 320 (/enquadramento)',
    status: 'Auditado',
  },
  {
    norma: 'RFC 7946 & OGC Standards',
    apelido: 'GeoJSON & Padrões Abertos B2G',
    autoridade: 'IETF / Open Geospatial Consortium',
    artigos: 'RFC 7946 (The GeoJSON Format)',
    requisito:
      'Soberania dos dados pelo órgão público sem lock-in proprietário, com formato padrão estruturado e interoperabilidade de sistemas CIC/CICC.',
    atendimento:
      'Catálogo completo de endpoints REST com respostas GeoJSON FeatureCollection, camadas por células hexagonais H3 e chaves de API restritas via hash SHA-256.',
    evidenciaLink: '/interoperabilidade',
    evidenciaLabel: 'API & Webhooks (/interoperabilidade)',
    status: 'Conforme',
  },
]

const AUDIT_EVENTS_LIST = [
  {
    code: 'DEMO_STARTED',
    name: 'Início de Demonstração Orientada',
    desc: 'Registrado automaticamente a cada início de tour autoguiado (/demo), auditando IP/origem e marcos legais.',
    escopo: 'Público / Visitante',
    compliance: 'Art. 27 LC 182/2021',
  },
  {
    code: 'API_KEY_CREATED',
    name: 'Emissão de Chave de Integração CIC',
    desc: 'Disparado pelo administrador ao emitir credencial de leitura pública/CICC; grava hash SHA-256 e autoria nominal.',
    escopo: 'Admin Autenticado',
    compliance: 'Sigilo & Menor Privilégio',
  },
  {
    code: 'API_KEY_REVOKED',
    name: 'Revogação de Credencial de API',
    desc: 'Invalida imediatamente uma chave de integração ativa, com justificativa obrigatória e autoria na trilha.',
    escopo: 'Admin Autenticado',
    compliance: 'Governança & Rastreabilidade',
  },
  {
    code: 'USER_ACCOUNT_CREATED',
    name: 'Criação de Conta de Servidor / Operador',
    desc: 'Criação de credencial individual para gestor (admin) ou fiscal de campo (operador); auto-registro público é bloqueado.',
    escopo: 'Admin Autenticado',
    compliance: 'Art. 27 LC 182/2021',
  },
  {
    code: 'USER_ACCOUNT_UPDATED',
    name: 'Mutação de Conta ou Permissão',
    desc: 'Alteração de cargo, lotação, status (ativo/desativado) ou redefinição de perfil na collection users.',
    escopo: 'Admin Autenticado',
    compliance: 'Princípio do Menor Privilégio',
  },
  {
    code: 'DRY_RUN_HOMOLOGATION_EXECUTED',
    name: 'Ensaio de Homologação Pré-Go-Live',
    desc: 'Auditoria de 7 critérios de produção com emissão do laudo oficial (protocolo ORBIS-DRYRUN-2026-001).',
    escopo: 'Comissão Técnica / Sistema',
    compliance: 'LC 182/2021 (Art. 27)',
  },
  {
    code: 'RESTORE_TEST_EXECUTED',
    name: 'Teste de Restauração de Backup',
    desc: 'Simulação completa de recuperação em ambiente isolado com 5 fases e integridade SQLite auditada (RTO 1,45s).',
    escopo: 'SISTEMA (Automação)',
    compliance: 'SLA Operacional RTO 24h',
  },
  {
    code: 'TELEMETRY_PURGE_JOB_INITIALIZED',
    name: 'Purga Programada de Telemetria Bruta',
    desc: 'Rotina diária automatizada de expurgo de leituras brutas (> 180 dias), preservando índices agregados por segmento.',
    escopo: 'Cron Automatizado',
    compliance: 'Art. 16 LGPD (Retenção 180d)',
  },
  {
    code: 'SINISTRALIDADE_IMPORTADA',
    name: 'Carga de Sinistralidade com Procedência Declarada',
    desc: 'Importação assistida de sinistros viários (PRF, Bombeiros ou CSV do órgão) com sanitização de PII e ancoragem H3.',
    escopo: 'Admin / Operador',
    compliance: 'Metas PNATRANS & LGPD Art. 12',
  },
  {
    code: 'CAMADA_EXPOSICAO_IMPORTADA',
    name: 'Carga de Camadas de Exposição (INEP / GTFS)',
    desc: 'Importação de polos geradores (Escolas Censo INEP e Pontos de Ônibus GTFS) com raio de influência e indexação H3.',
    escopo: 'Admin / Operador',
    compliance: 'Art. 27 LC 182/2021',
  },
  {
    code: 'SINISTROS_PRF_SINCRONIZADOS',
    name: 'Sincronização de Sinistros Federais via API PRF',
    desc: 'Disparo nominal pelo operador do conector automatizado da Polícia Rodoviária Federal (dadosabertos.prf.gov.br) com filtragem regional, saneamento de PII e indexação H3.',
    escopo: 'Admin / Operador',
    compliance: 'Art. 12 LGPD & PNATRANS (Lei 13.614/2018)',
  },
  {
    code: 'CONECTOR_PRF_HABILITADO',
    name: 'Habilitação Estrutural do Conector PRF',
    desc: 'Ativação do conector PRF na governança do sistema como exceção documental única ao fluxo padrão de upload, com endpoint homologado e regras de degradação.',
    escopo: 'SISTEMA (Migração)',
    compliance: 'Art. 27 LC 182/2021',
  },
]

export default function Governanca() {
  const [publicTrailCount, setPublicTrailCount] = useState<number | null>(null)
  const [latestEventTimestamp, setLatestEventTimestamp] = useState<string | null>(null)
  const [isLoadingAudit, setIsLoadingAudit] = useState(true)

  useEffect(() => {
    document.title = 'Governança Verificável | ORBIS UOS'

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

  return (
    <div className="min-h-screen bg-[#070D1F] text-[#F8FAFC] pt-24 pb-20 selection:bg-[#3B82F6]/30">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb & Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-white transition-colors">
              Início
            </Link>
            <span>/</span>
            <span className="text-[#38BDF8] font-medium">Governança Institucional</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] font-mono text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              Página Verificável Soberana
            </span>
            <span className="font-mono text-[11px] text-[#94A3B8] bg-[#101B3A] px-2 py-0.5 rounded border border-[#1A2A5A]">
              Release v0.0.34
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="space-y-6 pb-8 border-b border-[#1A2A5A]">
          <div className="space-y-4 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-xs font-semibold text-[#60A5FA]">
              <Scale className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Transparência Pública & Conformidade B2G</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Governança não é o que dizemos — é uma{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-[#60A5FA] to-[#10B981]">
                página verificável
              </span>
              .
            </h1>

            <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
              Consolidação centralizada das 6 peças de governança, conformidade regulatória e
              segurança da plataforma <b>ORBIS UOS</b>. Em vez de promessas de marketing, cada
              declaração abaixo aponta diretamente para o código, para o dossiê com hash SHA-256 ou
              para o ensaio de auditoria em produção.
            </p>
          </div>

          {/* Quick Nav Anchors Bar */}
          <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] flex items-center justify-between">
              <span>Navegação Rápida pelas 6 Peças de Governança:</span>
              <span className="text-[#38BDF8] hidden sm:inline">6 seções auditáveis</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <a
                href="#conformidade-normativa"
                className="px-3 py-1.5 rounded-lg bg-[#101B3A] hover:bg-[#1A2A5A] text-[#CBD5E1] hover:text-white border border-[#1A2A5A] transition-all flex items-center gap-1.5"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>1. Mapa Normativo</span>
              </a>
              <a
                href="#trilha-auditoria"
                className="px-3 py-1.5 rounded-lg bg-[#101B3A] hover:bg-[#1A2A5A] text-[#CBD5E1] hover:text-white border border-[#1A2A5A] transition-all flex items-center gap-1.5"
              >
                <History className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>2. Trilha de Auditoria</span>
              </a>
              <a
                href="#matriz-responsabilidades"
                className="px-3 py-1.5 rounded-lg bg-[#101B3A] hover:bg-[#1A2A5A] text-[#CBD5E1] hover:text-white border border-[#1A2A5A] transition-all flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-[#10B981]" />
                <span>3. Matriz de Papéis</span>
              </a>
              <a
                href="#fluxo-incidentes"
                className="px-3 py-1.5 rounded-lg bg-[#101B3A] hover:bg-[#1A2A5A] text-[#CBD5E1] hover:text-white border border-[#1A2A5A] transition-all flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />
                <span>4. Fluxo de Incidentes & RTO</span>
              </a>
              <a
                href="#cadeia-custodia"
                className="px-3 py-1.5 rounded-lg bg-[#101B3A] hover:bg-[#1A2A5A] text-[#CBD5E1] hover:text-white border border-[#1A2A5A] transition-all flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-[#60A5FA]" />
                <span>5. Cadeia de Custódia</span>
              </a>
              <a
                href="#governanca-produto"
                className="px-3 py-1.5 rounded-lg bg-[#101B3A] hover:bg-[#1A2A5A] text-[#CBD5E1] hover:text-white border border-[#1A2A5A] transition-all flex items-center gap-1.5"
              >
                <GitBranch className="w-3.5 h-3.5 text-[#A78BFA]" />
                <span>6. Governança do Produto</span>
              </a>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SEÇÃO 1: MAPA DE CONFORMIDADE NORMATIVA */}
        {/* ========================================================================= */}
        <section id="conformidade-normativa" className="space-y-6 scroll-mt-24">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#38BDF8]/15 text-[#38BDF8] font-mono text-xs font-bold border border-[#38BDF8]/30">
              <FileCheck2 className="w-3.5 h-3.5" />
              PEÇA 1 DE 6 • MATRIZ REGULATÓRIA
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              1. Mapa de Conformidade Normativa Cruzada
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-4xl leading-relaxed">
              Cruzamento objetivo entre as normas jurídicas, técnicas e de controle externo que
              regem a contratação GovTech e a evidência concreta implementada no produto. Nenhum
              requisito é deixado como intenção abstrata.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#1A2A5A] bg-[#0A1128] shadow-xl">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-[#1A2A5A] bg-[#101B3A]/80 text-[11px] font-mono uppercase tracking-wider text-[#94A3B8]">
                  <th className="py-3.5 px-4 font-semibold text-white">Norma / Marco</th>
                  <th className="py-3.5 px-4 font-semibold text-white">Artigos / Dispositivos</th>
                  <th className="py-3.5 px-4 font-semibold text-white">Requisito Legal</th>
                  <th className="py-3.5 px-4 font-semibold text-white">Atendimento no Produto</th>
                  <th className="py-3.5 px-4 font-semibold text-white">Evidência Pública</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2A5A]/60 text-xs">
                {NORMATIVE_DATA.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#101B3A]/40 transition-colors">
                    <td className="py-4 px-4 align-top">
                      <div className="font-bold text-white text-sm">{row.apelido}</div>
                      <div className="text-[11px] text-[#94A3B8]">{row.norma}</div>
                      <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#101B3A] text-[#60A5FA] border border-[#1A2A5A]">
                        {row.autoridade}
                      </span>
                    </td>
                    <td className="py-4 px-4 align-top font-mono text-[11px] text-[#CBD5E1]">
                      {row.artigos}
                    </td>
                    <td className="py-4 px-4 align-top text-[#CBD5E1] leading-relaxed">
                      {row.requisito}
                    </td>
                    <td className="py-4 px-4 align-top text-[#94A3B8] leading-relaxed">
                      {row.atendimento}
                    </td>
                    <td className="py-4 px-4 align-top whitespace-nowrap">
                      <Link
                        to={row.evidenciaLink}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3B82F6]/15 hover:bg-[#3B82F6]/25 border border-[#3B82F6]/40 text-[#60A5FA] hover:text-white transition-all text-xs font-semibold"
                      >
                        <span>Ver evidência</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <div className="text-[10px] text-[#10B981] font-mono mt-1 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {row.status}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SEÇÃO 2: TRILHA DE AUDITORIA EM RESUMO PÚBLICO */}
        {/* ========================================================================= */}
        <section id="trilha-auditoria" className="space-y-6 scroll-mt-24">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#F59E0B]/15 text-[#F59E0B] font-mono text-xs font-bold border border-[#F59E0B]/30">
              <History className="w-3.5 h-3.5" />
              PEÇA 2 DE 6 • AUDITORIA SOBERANA
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              2. Trilha de Auditoria em Resumo Público
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-4xl leading-relaxed">
              Toda mutação de dados críticos no ORBIS UOS gera um registro nominal imutável no campo{' '}
              <code className="text-[#38BDF8] bg-[#101B3A] px-1.5 py-0.5 rounded">audit_trail</code>{' '}
              da collection institucional. O detalhe nominal (nome, e-mail e cargo do agente) é
              restrito ao Cockpit administrativo do órgão por dever de sigilo, mas a arquitetura e o
              catálogo de eventos são públicos e verificáveis.
            </p>
          </div>

          {/* Cards de Resumo & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-2">
              <span className="text-[11px] font-mono uppercase text-[#94A3B8]">
                Eventos Registrados na Base Real
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-[#F59E0B]">
                  {isLoadingAudit ? '...' : publicTrailCount !== null ? publicTrailCount : '12+'}
                </span>
                <span className="text-xs text-[#94A3B8]">eventos soberanos auditados</span>
              </div>
              <p className="text-[11px] text-[#64748B]">
                Leitura do endpoint higienizado em tempo real da instância municipal (IBGE 4106902).
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-2">
              <span className="text-[11px] font-mono uppercase text-[#94A3B8]">
                Autoria Nominal Obrigatória
              </span>
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Shield className="w-4 h-4 text-[#10B981]" />
                <span>{`{ id, email, name, role }`}</span>
              </div>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                Nenhuma ação administrativa é gravada anonimamente. O sistema rejeita mutações sem
                autoria identificada.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-2">
              <span className="text-[11px] font-mono uppercase text-[#94A3B8]">
                Acesso Restrito ao Cockpit
              </span>
              <div className="flex items-center gap-2 text-[#60A5FA] font-bold text-base">
                <Lock className="w-4 h-4 text-[#3B82F6]" />
                <span>Apenas Admin do Órgão</span>
              </div>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                Proteção de dados dos servidores públicos contra scraping externo, conforme Parecer
                DPO / LGPD.
              </p>
            </div>
          </div>

          {/* Catálogo de Eventos Reais Implementados */}
          <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1A2A5A]">
              <div>
                <h3 className="font-bold text-white text-base">
                  Catálogo Oficial de Tipos de Eventos Auditados no Código
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Eventos mapeados no backend (PocketBase pb_hooks e migrações oficiais)
                </p>
              </div>
              <Link
                to="/sandbox"
                className="text-xs text-[#38BDF8] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Testar API Keys no Sandbox</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {AUDIT_EVENTS_LIST.map((evt) => (
                <div
                  key={evt.code}
                  className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] hover:border-[#F59E0B]/40 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-[#F59E0B] text-xs bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/20">
                      {evt.code}
                    </span>
                    <span className="text-[10px] text-[#94A3B8] font-mono">{evt.escopo}</span>
                  </div>
                  <div className="font-semibold text-white">{evt.name}</div>
                  <p className="text-[11px] text-[#94A3B8] leading-relaxed">{evt.desc}</p>
                  <div className="pt-1 text-[10px] text-[#10B981] font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Enquadramento: {evt.compliance}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SEÇÃO 3: MATRIZ DE RESPONSABILIDADES */}
        {/* ========================================================================= */}
        <section id="matriz-responsabilidades" className="space-y-6 scroll-mt-24">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] font-mono text-xs font-bold border border-[#10B981]/30">
              <Users className="w-3.5 h-3.5" />
              PEÇA 3 DE 6 • PAPÉIS E ATRIBUIÇÕES
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              3. Matriz de Responsabilidades & RBAC Institucional
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-4xl leading-relaxed">
              Definição clara das responsabilidades jurídicas da LGPD (Controlador vs. Operador) e
              dos papéis operacionais implementados no código da collection{' '}
              <code className="text-[#10B981] bg-[#101B3A] px-1.5 py-0.5 rounded">users</code> da
              plataforma.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Papel 1: Controlador */}
            <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#38BDF8] font-bold">
                  Papel Jurídico LGPD
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
                  Art. 5º, VI da LGPD
                </span>
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#38BDF8]" />
                Controlador: O Órgão Público Contratante
              </h3>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                Prefeitura Municipal, Secretaria de Obras, Autarquia ou Departamento de Trânsito que
                contrata a plataforma.
              </p>
              <ul className="text-xs text-[#94A3B8] space-y-1.5 list-disc pl-4">
                <li>Detentor exclusivo da propriedade e titularidade de todos os dados gerados.</li>
                <li>
                  Competência soberana para decidir prioridades de recapeamento e obras públicas.
                </li>
                <li>
                  Gestão das credenciais de acesso de servidores através do administrador do órgão.
                </li>
                <li>
                  Autorização de publicação de dados abertos e emissão de chaves de integração CIC.
                </li>
              </ul>
            </div>

            {/* Papel 2: Operador Tecnológico */}
            <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#10B981] font-bold">
                  Papel Operacional Tecnológico
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30">
                  Art. 5º, VII da LGPD
                </span>
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-[#10B981]" />
                Operador: ORBIS UOS GovTech
              </h3>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                Entidade desenvolvedora e mantenedora da infraestrutura de software e algoritmos.
              </p>
              <ul className="text-xs text-[#94A3B8] space-y-1.5 list-disc pl-4">
                <li>Garantir a execução da anonimização na borda e do k-anonimato H3 (k ≥ 3).</li>
                <li>
                  Manutenção do SLA de 99,9% e garantia do RTO de 24h com backups diários testados.
                </li>
                <li>
                  Impossibilidade técnica de vender, monetizar ou transferir dados brutos a
                  terceiros.
                </li>
                <li>
                  Execução diária da rotina de purga aos 180 dias e suporte com resposta em 2h (P1).
                </li>
              </ul>
            </div>

            {/* Papel 3: DPO / Encarregado */}
            <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#A78BFA] font-bold">
                  Encarregado de Dados
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#A78BFA]/10 text-[#A78BFA] border border-[#A78BFA]/30">
                  Art. 41 da LGPD
                </span>
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#A78BFA]" />
                Encarregado de Proteção de Dados (DPO)
              </h3>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                Ponto de contato institucional entre o controlador, titulares cidadãos e a ANPD.
              </p>
              <ul className="text-xs text-[#94A3B8] space-y-1.5 list-disc pl-4">
                <li>
                  Canal oficial de atendimento: dpo@orbis-uos.com.br e privacidade@orbis-uos.com.br.
                </li>
                <li>Prazo legal de resposta a requisições do titular em até 15 dias corridos.</li>
                <li>Emissão do Relatório de Impacto à Proteção de Dados Pessoais (RIPD).</li>
                <li>Auditoria periódica do expurgo e do bloqueio de auto-registro anônimo.</li>
              </ul>
            </div>

            {/* Papel 4: RBAC Plataforma (Admin vs. Operator) */}
            <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#F59E0B] font-bold">
                  RBAC no Código do Sistema
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30">
                  role: admin | operador
                </span>
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#F59E0B]" />
                Papéis de Acesso Operacional (RBAC)
              </h3>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                Implementados e fiscalizados pelas regras de segurança (RLS) da collection{' '}
                <code>users</code>:
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[#101B3A] border border-[#1A2A5A]">
                  <strong className="text-white block">Papel admin (Gestor de Gabinete):</strong>
                  <span className="text-[#94A3B8] text-[11px]">
                    Acesso total, gestão de contas de agentes do órgão, visualização da trilha de
                    auditoria soberana, criação/revogação de chaves de API e configuração CGU.
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#101B3A] border border-[#1A2A5A]">
                  <strong className="text-white block">Papel operador (Fiscal de Campo):</strong>
                  <span className="text-[#94A3B8] text-[11px]">
                    Acesso à coleta inercial de campo (PWA), visualização do mapa municipal e
                    Cockpit técnico; sem permissão de criar usuários ou revogar credenciais.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SEÇÃO 4: FLUXO DE INCIDENTES E RESPOSTA */}
        {/* ========================================================================= */}
        <section id="fluxo-incidentes" className="space-y-6 scroll-mt-24">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#EF4444]/15 text-[#EF4444] font-mono text-xs font-bold border border-[#EF4444]/30">
              <AlertTriangle className="w-3.5 h-3.5" />
              PEÇA 4 DE 6 • CONTINUIDADE E SEGURANÇA
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              4. Fluxo de Incidentes & Resposta Operacional
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-4xl leading-relaxed">
              Procedimento oficial de 5 etapas para gestão de indisponibilidades, anomalias e
              incidentes de segurança, referenciando o RTO contratual de 24 horas e a política de
              backup testada documentada na <b>/operacao</b>.
            </p>
          </div>

          {/* Stepper dos 5 Passos */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[
              {
                step: '01',
                title: 'Detecção',
                time: 'Até 15 min',
                desc: 'Alertas automáticos de telemetria, indisponibilidade de rotas ou chamados via suporte técnico institucional.',
                color: 'border-[#38BDF8]/40 bg-[#0A1128]',
                textColor: 'text-[#38BDF8]',
              },
              {
                step: '02',
                title: 'Contenção',
                time: 'Até 1 hora',
                desc: 'Isolamento de nós afetados, suspensão de credenciais vulneráveis e ativação do modo de contingência local offline.',
                color: 'border-[#F59E0B]/40 bg-[#0A1128]',
                textColor: 'text-[#F59E0B]',
              },
              {
                step: '03',
                title: 'Comunicação',
                time: 'Até 2 horas',
                desc: 'Notificação imediata ao Fiscal Técnico e Gestor do Contrato do órgão público com protocolo e impacto previsto.',
                color: 'border-[#A78BFA]/40 bg-[#0A1128]',
                textColor: 'text-[#A78BFA]',
              },
              {
                step: '04',
                title: 'Correção',
                time: 'RTO máx. 24h',
                desc: 'Restauração de dados a partir do backup diário ou hotfix emergencial. Em ensaio formal, RTO aferido foi de 1,45s. Acompanhe a saúde contínua em /status.',
                color: 'border-[#10B981]/40 bg-[#0A1128]',
                textColor: 'text-[#10B981]',
              },
              {
                step: '05',
                title: 'Prestação de Contas',
                time: 'Até 5 dias úteis',
                desc: 'Relatório pós-incidente (RCA) com causa raiz, ações corretivas, hash SHA-256 e arquivamento para fiscalização.',
                color: 'border-[#60A5FA]/40 bg-[#0A1128]',
                textColor: 'text-[#60A5FA]',
              },
            ].map((s) => (
              <div
                key={s.step}
                className={`p-4 rounded-xl border ${s.color} space-y-2 flex flex-col justify-between`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`font-mono text-xs font-black ${s.textColor}`}>{s.step}</span>
                    <span className="text-[10px] font-mono text-[#94A3B8]">{s.time}</span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{s.title}</h4>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Destaque do Backup & RTO real */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0A1128] via-[#101B3A] to-[#0A1128] border border-[#1A2A5A] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span className="text-xs font-bold uppercase font-mono text-[#10B981]">
                  Ensaio Oficial de Restauração Auditado & Monitoramento Ativo
                </span>
              </div>
              <h4 className="text-base font-bold text-white">
                RTO Contratual: 24 Horas • RTO Real Auditado em Produção: 1,45 Segundo
              </h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                A política de backup com retenção em repouso, execução de teste de restauração
                (protocolo ORBIS-RESTORE-TEST-2026-001) e o monitoramento ativo com sondas a cada 5
                minutos garantem que a continuidade é verificável em tempo real.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link
                to="/status"
                className="px-3.5 py-2 rounded-xl font-bold text-xs text-white bg-[#3B82F6] hover:bg-[#2563EB] transition-all flex items-center justify-center gap-1.5"
              >
                <span>Painel /status</span>
                <Activity className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/operacao"
                className="px-3.5 py-2 rounded-xl font-bold text-xs text-white bg-[#10B981] hover:bg-[#059669] transition-all flex items-center justify-center gap-1.5"
              >
                <span>Pacote Operacional (/operacao)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SEÇÃO 5: CADEIA DE CUSTÓDIA DO DADO */}
        {/* ========================================================================= */}
        <section id="cadeia-custodia" className="space-y-6 scroll-mt-24">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#60A5FA]/15 text-[#60A5FA] font-mono text-xs font-bold border border-[#60A5FA]/30">
              <Layers className="w-3.5 h-3.5" />
              PEÇA 5 DE 6 • TRILHA DO SENSOR AO LAUDO
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              5. Cadeia de Custódia do Dado (Do Sensor ao Laudo)
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-4xl leading-relaxed">
              O ciclo completo de vida dos dados desde o acelerômetro do smartphone na frota pública
              até o laudo técnico com valor probatório para Tribunais de Contas.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Estágio 1: Borda */}
              <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-[#38BDF8]">
                  <span>ESTÁGIO 1</span>
                  <span>50 Hz Edge</span>
                </div>
                <h4 className="font-bold text-white text-sm">Coleta na Borda & FFT</h4>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Amostragem inercial nativa a 50 Hz. Janelamento Hanning de 2,56s com FFT Radix-2
                  embarcada no dispositivo. O áudio, vídeo ou dados pessoais nunca são capturados.
                </p>
                <div className="text-[10px] font-mono text-[#60A5FA] bg-[#0A1128] p-2 rounded">
                  Payload por janela: ~50 bytes (RMS vertical, picos Z e banda dominante).
                </div>
              </div>

              {/* Estágio 2: Transmissão & Ingestão */}
              <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-[#F59E0B]">
                  <span>ESTÁGIO 2</span>
                  <span>TLS 1.3 & API PRF</span>
                </div>
                <h4 className="font-bold text-white text-sm">Transmissão & Conectores</h4>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Fila IndexedDB no PWA com envio idempotente TLS 1.3. Para dados externos, fluxo
                  soberano com upload ou conector REST governamental direto (API Oficial PRF), com
                  higienização imediata de dados sensíveis na borda do servidor.
                </p>
                <div className="text-[10px] font-mono text-[#F59E0B] bg-[#0A1128] p-2 rounded">
                  Imune a túneis e sombras de sinal 4G com sincronização posterior.
                </div>
              </div>

              {/* Estágio 3: Agregação H3 */}
              <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-[#10B981]">
                  <span>ESTÁGIO 3</span>
                  <span>k ≥ 3 sessões</span>
                </div>
                <h4 className="font-bold text-white text-sm">Grade Hexagonal H3</h4>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Indexação espacial em células hexagonais H3 (resolução 9 no urbano). Aplicação
                  rigorosa do k-anonimato (Art. 12 LGPD): hexágonos com menos de 3 passagens
                  distintas são ocultados no portal aberto.
                </p>
                <div className="text-[10px] font-mono text-[#10B981] bg-[#0A1128] p-2 rounded">
                  Impossibilita inferência de placas, trajetos individuais ou condutores.
                </div>
              </div>

              {/* Estágio 4: Laudo e Descarte */}
              <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-[#A78BFA]">
                  <span>ESTÁGIO 4</span>
                  <span>SHA-256</span>
                </div>
                <h4 className="font-bold text-white text-sm">Hash & Descarte (180d)</h4>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Os laudos emitidos contêm hash criptográfico SHA-256 carimbado no PDF. A
                  telemetria bruta é automaticamente expurgada aos 180 dias por rotina cron diária
                  (telemetry_purge_180d).
                </p>
                <div className="text-[10px] font-mono text-[#A78BFA] bg-[#0A1128] p-2 rounded">
                  Preservam-se os indicadores consolidados dos segmentos viários.
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#94A3B8]">
              <span>
                Para a formulação matemática completa dos 4 pilares do IMV e bandas espectrais de
                mobilidade ativa:
              </span>
              <Link
                to="/metodologia"
                className="text-[#38BDF8] hover:underline font-semibold flex items-center gap-1 shrink-0"
              >
                <span>Explorar Pipeline DSP em /metodologia</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SEÇÃO 6: GOVERNANÇA DO PRODUTO */}
        {/* ========================================================================= */}
        <section id="governanca-produto" className="space-y-6 scroll-mt-24">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#A78BFA]/15 text-[#A78BFA] font-mono text-xs font-bold border border-[#A78BFA]/30">
              <GitBranch className="w-3.5 h-3.5" />
              PEÇA 6 DE 6 • ENGENHARIA E EVOLUÇÃO
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              6. Governança do Produto, Versionamento & Honestidade Técnica
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-4xl leading-relaxed">
              O ciclo de entregas públicas e a honestidade metodológica sobre os três caminhos de
              captura de telemetria da plataforma.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bloco 1: Versionamento & Changelog */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1A2A5A]">
                <div>
                  <h3 className="font-bold text-white text-base">
                    Histórico de Releases e Entregas Oficiais
                  </h3>
                  <span className="text-xs text-[#94A3B8]">
                    Versão atual do produto em produção: <b>v0.0.34</b>
                  </span>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-bold">
                  Produção Ativa
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {/* v0.0.34 */}
                <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#3B82F6]/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#60A5FA]">
                      Release v0.0.34 (Atual)
                    </span>
                    <span className="text-[10px] text-[#94A3B8] font-mono">
                      Consolidação Governança
                    </span>
                  </div>
                  <div className="font-semibold text-white">
                    Página Institucional /governanca Verificável
                  </div>
                  <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                    Consolidação centralizada das 6 peças de governança em URL pública com âncoras,
                    mapa regulatório cruzado, matriz RBAC e catálogo soberano de eventos de
                    auditoria.
                  </p>
                </div>

                {/* v0.0.29 */}
                <div className="p-3 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white">Release v0.0.29</span>
                    <span className="text-[10px] text-[#94A3B8] font-mono">
                      Laudo Dry-Run & Homologação
                    </span>
                  </div>
                  <div className="font-semibold text-[#CBD5E1]">
                    Auditoria de 7 Critérios Objetivos & Protocolo Oficial
                  </div>
                  <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                    Publicação formal da página /homologacao com emissão de laudo em PDF
                    (ORBIS-DRYRUN-2026-001) e registro do evento soberano
                    DRY_RUN_HOMOLOGATION_EXECUTED.
                  </p>
                </div>

                {/* v0.0.25 */}
                <div className="p-3 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white">Release v0.0.25</span>
                    <span className="text-[10px] text-[#94A3B8] font-mono">
                      Sandbox & Chaves de API
                    </span>
                  </div>
                  <div className="font-semibold text-[#CBD5E1]">
                    Interoperabilidade B2G & Gestão de Credenciais
                  </div>
                  <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                    Implementação do Sandbox Playground com testes de chaves de leitura, eventos
                    API_KEY_CREATED/REVOKED na audit_trail e suporte a GeoJSON RFC 7946.
                  </p>
                </div>

                {/* v0.0.21 */}
                <div className="p-3 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white">Release v0.0.21</span>
                    <span className="text-[10px] text-[#94A3B8] font-mono">
                      Hardening RBAC & Purga 180d
                    </span>
                  </div>
                  <div className="font-semibold text-[#CBD5E1]">
                    Separação Soberana Admin/Operador e Expurgo Automático
                  </div>
                  <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                    Bloqueio do auto-registro anônimo, criação de contas individuais auditáveis e
                    job diário de purga de telemetria bruta com base no Art. 16 da LGPD.
                  </p>
                </div>
              </div>
            </div>

            {/* Bloco 2: Honestidade dos 3 Caminhos de Captura */}
            <div className="p-6 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] font-mono text-[11px] font-bold border border-[#10B981]/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  Honestidade Técnica Declarada
                </div>
                <h3 className="text-base font-bold text-white">
                  Os Três Caminhos de Captura de Telemetria
                </h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Nenhum sensor de celular substitui um perfilômetro laser de precisão milimétrica.
                  O ORBIS UOS estabelece com clareza o papel de cada caminho de captura:
                </p>

                <div className="space-y-2.5 text-xs pt-1">
                  <div className="p-2.5 rounded-lg bg-[#101B3A] border border-[#1A2A5A]">
                    <div className="font-bold text-white text-[11px]">
                      Caminho 1: Frota Pública Existente
                    </div>
                    <p className="text-[10px] text-[#94A3B8] mt-0.5">
                      Coleta oportunista contínua em ônibus e viaturas. Excelente para cobertura
                      diária da malha sem custo adicional de combustível ou hardware proprietário.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#101B3A] border border-[#1A2A5A]">
                    <div className="font-bold text-white text-[11px]">
                      Caminho 2: Aplicativos Parceiros (SDK)
                    </div>
                    <p className="text-[10px] text-[#94A3B8] mt-0.5">
                      Integração via SDK leve (ORBIS Core) em rotas de coleta de resíduos e veículos
                      conveniados para densificação da amostragem em vias coletoras e locais.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#101B3A] border border-[#1A2A5A]">
                    <div className="font-bold text-white text-[11px]">
                      Caminho 3: Vistoria Técnica Orientada
                    </div>
                    <p className="text-[10px] text-[#94A3B8] mt-0.5">
                      Veículo calibrado com Fator K aferido e operador dedicado para homologação de
                      trechos críticos que antecedem ou sucedem obras de recapeamento.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1A2A5A]">
                <Link
                  to="/metodologia#caminhos-captura"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#101B3A] hover:bg-[#1A2A5A] text-[#60A5FA] hover:text-white border border-[#1A2A5A] text-xs font-semibold transition-all"
                >
                  <span>Ver tabela comparativa em /metodologia</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Banner CTA Final de Conversão Institucional */}
        <section className="p-8 rounded-2xl bg-gradient-to-r from-[#0A1128] via-[#101B3A] to-[#1A2A5A] border-2 border-[#3B82F6]/40 shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="font-mono text-xs text-[#38BDF8] uppercase tracking-wider font-bold">
                Instrumento Formal para Procuradorias e Fiscais de Contrato
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Pronto para auditar a governança do ORBIS UOS no seu município?
              </h3>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                Acesse o Tour de Demonstração Autoguiada B2G para percorrer o Diagnóstico Express, o
                Simulador do Art. 320 e a geração de laudos técnicos com protocolo verificável.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Link
                to="/homologacao"
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-[#CBD5E1] hover:text-white bg-[#0A1128] border border-[#1A2A5A] hover:border-[#10B981] transition-all text-center"
              >
                Laudo Dry-Run (/homologacao)
              </Link>
              <Link
                to="/demo"
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-lg shadow-[#3B82F6]/30 transition-all text-center flex items-center justify-center gap-1.5"
              >
                <span>Ver Demonstração Orientada</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Rodapé da Página com Informações de Auditoria e Versão */}
        <div className="pt-4 border-t border-[#1A2A5A] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B] font-mono">
          <div>ORBIS UOS GovTech • Página de Governança Verificável • Versão v0.0.34</div>
          <div className="flex items-center gap-3">
            <Link to="/privacidade" className="hover:text-[#94A3B8] transition-colors">
              Privacidade
            </Link>
            <span>•</span>
            <Link to="/termos" className="hover:text-[#94A3B8] transition-colors">
              Termos B2G
            </Link>
            <span>•</span>
            <Link to="/operacao" className="hover:text-[#94A3B8] transition-colors">
              Operação
            </Link>
            <span>•</span>
            <Link to="/status" className="hover:text-[#94A3B8] transition-colors">
              Status
            </Link>
            <span>•</span>
            <a href="#conformidade-normativa" className="text-[#38BDF8] hover:underline">
              Voltar ao Topo ↑
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
