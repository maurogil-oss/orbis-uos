import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Lock,
  FileText,
  Clock,
  UserCheck,
  AlertTriangle,
  Server,
  ArrowLeft,
  Mail,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Database,
  EyeOff,
  Copy,
  Check,
  Send,
  FileSearch,
} from 'lucide-react'

export default function Privacidade() {
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [showDirectContactBox, setShowDirectContactBox] = useState(false)
  const [requestSubject, setRequestSubject] = useState('Acesso aos Dados (Art. 18, II)')
  const [requesterName, setRequesterName] = useState('')
  const [requesterEmail, setRequesterEmail] = useState('')
  const [requesterOrg, setRequesterOrg] = useState('')
  const [requestDetails, setRequestDetails] = useState('')
  const [formSent, setFormSent] = useState(false)

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('contato@orbis-uos.com.br')
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2500)
  }

  const handleSimulateRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormSent(true)
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
          <span className="text-[#3B82F6]">Governança & Privacidade LGPD</span>
        </div>

        {/* Header / Institutional Identification */}
        <div className="space-y-4 pb-8 border-b border-[#1A2A5A]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-xs font-semibold text-[#10B981]">
              <ShieldCheck className="w-4 h-4" />
              Conformidade Integral Lei 13.709/2018 (LGPD)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-xs font-mono font-medium text-[#60A5FA]">
              Versão 1.0 • Vigência: Março/2025
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#101B3A] border border-[#1A2A5A] text-[11px] font-mono text-[#94A3B8]">
              Release v0.0.23
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F8FAFC]">
            Política de Privacidade e Proteção de Dados Pessoais
          </h1>

          <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed max-w-4xl">
            Esta Política consolida as regras de governança, tratamento, segurança técnica e
            prerrogativas dos titulares de dados aplicadas na plataforma <b>ORBIS UOS</b>, em
            absoluta consonância com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 —
            LGPD), o Marco Legal das Startups e GovTechs (Lei Complementar nº 182/2021) e as
            diretrizes metodológicas da plataforma (Versão 2.1 Homologada).
          </p>

          {/* Controlador identification banner */}
          <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[#64748B] block font-mono uppercase text-[10px]">
                Controlador dos Dados:
              </span>
              <span className="text-[#F8FAFC] font-semibold text-sm">ORBIS UOS GovTech</span>
              <span className="text-[#94A3B8] block text-[11px]">
                Plataforma de Inteligência e Governança Urbana
              </span>
            </div>
            <div>
              <span className="text-[#64748B] block font-mono uppercase text-[10px]">
                Sede Institucional:
              </span>
              <span className="text-[#CBD5E1]">
                SCS Quadra 4, Bloco A, Ed. Capital, 7º Andar — Brasília/DF — CEP 70304-900
              </span>
            </div>
            <div>
              <span className="text-[#64748B] block font-mono uppercase text-[10px]">
                Canal do Encarregado (DPO / Privacidade):
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-[#60A5FA] select-all">
                  contato@orbis-uos.com.br
                </span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-1 rounded hover:bg-[#1A2A5A] text-[#94A3B8] hover:text-white transition-colors"
                  title="Copiar e-mail"
                >
                  {copiedEmail ? (
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <span className="text-[11px] text-[#10B981] block">
                Prazo legal de resposta: até 15 dias corridos
              </span>
            </div>
          </div>
        </div>

        {/* Sumário Executivo de Princípios Fundamentais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#10B981]/20 flex items-center justify-center text-[#10B981]">
              <EyeOff className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-[#F8FAFC]">Privacy by Design</h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Zero câmeras, zero fotos, zero gravação e zero placas. A telemetria física inercial
              coleta apenas vibração mecânica purificada.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6]">
              <Clock className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-[#F8FAFC]">Retenção Estrita 180d</h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Registros brutos de telemetria expiram e são purgados automaticamente em 180 dias após
              a consolidação dos índices viários.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B]">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-[#F8FAFC]">Sigilo Legal Art. 27</h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Dados institucionais de enquadramento orçamentário são salvaguardados pelo sigilo
              legal do Marco Legal CPSI (LC 182/2021).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/20 flex items-center justify-center text-[#A78BFA]">
              <FileSearch className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-[#F8FAFC]">Auditabilidade & Hash</h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Dossiês e relatórios de segurança gerados possuem assinatura e hash SHA-256 auditável
              conforme documentado na Metodologia v2.1.
            </p>
          </div>
        </div>

        {/* 1. Finalidades por Categoria de Dados & Base Legal */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1A2A5A]">
            <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] flex items-center gap-2.5">
              <Database className="w-6 h-6 text-[#3B82F6]" />
              1. Categorias de Dados, Finalidades Específicas e Bases Legais (Art. 7º e 11 LGPD)
            </h2>
            <span className="text-xs font-mono text-[#38BDF8] bg-[#3B82F6]/10 px-2.5 py-1 rounded border border-[#3B82F6]/30">
              Taxonomia e Enquadramento
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            Em estrita obediência aos princípios da <b>finalidade</b>, <b>adequação</b> e{' '}
            <b>necessidade</b> (Art. 6º, I, II e III da LGPD), o ORBIS UOS trata dados estritamente
            essenciais para a prestação dos serviços de inteligência pública municipal. Abaixo
            detalham-se as categorias:
          </p>

          <div className="space-y-4">
            {/* Categoria A */}
            <div className="p-5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#3B82F6]/20 text-[#60A5FA]">
                    Categoria A
                  </span>
                  <h3 className="text-base font-bold text-[#F8FAFC]">
                    Dados Cadastrais e de Contato de Agentes Públicos
                  </h3>
                </div>
                <span className="text-[11px] font-mono font-semibold text-[#10B981] bg-[#10B981]/15 px-2.5 py-0.5 rounded">
                  Base Legal: Art. 7º, incisos V e IX da LGPD
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                <b>Dados Coletados:</b> Nome completo, e-mail institucional ou funcional,
                telefone/WhatsApp institucional, cargo ou função pública exercida, órgão ou
                secretaria municipal vinculada e município do ente federativo.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-[#1A2A5A]">
                <div>
                  <span className="text-[#64748B] block font-mono uppercase text-[10px]">
                    Finalidade Específica:
                  </span>
                  <span className="text-[#CBD5E1]">
                    Contato institucional prévio, autenticação no sistema, geração e entrega do
                    relatório do Diagnóstico Express, agendamento de reuniões técnicas de
                    apresentação do programa piloto CPSI e comunicação de atualizações na
                    plataforma.
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block font-mono uppercase text-[10px]">
                    Fundamento Jurídico Detalhado:
                  </span>
                  <span className="text-[#CBD5E1]">
                    <b>Execução de procedimentos preliminares a contrato (Art. 7º, V)</b> e{' '}
                    <b>Legítimo Interesse da Administração Pública / Controlador (Art. 7º, IX)</b>,
                    com consentimento manifestado na submissão de formulários de interesse.
                  </span>
                </div>
              </div>
            </div>

            {/* Categoria B */}
            <div className="p-5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#F59E0B]/20 text-[#F59E0B]">
                    Categoria B
                  </span>
                  <h3 className="text-base font-bold text-[#F8FAFC]">
                    Dados Institucionais e Orçamentários sob Sigilo Legal
                  </h3>
                </div>
                <span className="text-[11px] font-mono font-semibold text-[#F59E0B] bg-[#F59E0B]/15 px-2.5 py-0.5 rounded">
                  Base Legal: Art. 27 da LC 182/2021 + Art. 7º, II e V
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                <b>Dados Coletados:</b> Informações sobre arrecadação de multas de trânsito (Art.
                320 do CTB), composição de frota própria e terceirizada, saldo represado em conta
                vinculada de trânsito, diagnóstico de sinistros viários e rotinas internas de
                fiscalização.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-[#1A2A5A]">
                <div>
                  <span className="text-[#64748B] block font-mono uppercase text-[10px]">
                    Finalidade Específica:
                  </span>
                  <span className="text-[#CBD5E1]">
                    Elaboração do Parecer Técnico de Enquadramento CPSI, dimensionamento financeiro,
                    cálculo de economicidade pública comparada e estruturação da minuta jurídica
                    para contratação pública inovadora.
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block font-mono uppercase text-[10px]">
                    Fundamento e Proteção de Sigilo:
                  </span>
                  <span className="text-[#CBD5E1]">
                    Salvaguardados pelo{' '}
                    <b>
                      Art. 27 da Lei Complementar nº 182/2021 (sigilo de propostas e dados técnicos
                      em ambiente de contratação pública para soluções inovadoras)
                    </b>
                    . Não são comercializados nem compartilhados com entes privados externos.
                  </span>
                </div>
              </div>
            </div>

            {/* Categoria C */}
            <div className="p-5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#10B981]/20 text-[#10B981]">
                    Categoria C
                  </span>
                  <h3 className="text-base font-bold text-[#F8FAFC]">
                    Dados de Localização e Segmentos Viários Auditados
                  </h3>
                </div>
                <span className="text-[11px] font-mono font-semibold text-[#10B981] bg-[#10B981]/15 px-2.5 py-0.5 rounded">
                  Base Legal: Art. 7º, V e Art. 23 (Finalidade Pública)
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                <b>Dados Coletados:</b> Coordenadas de geolocalização pontuais (latitude e longitude
                interpoladas em segmentos de 100 metros) capturadas estritamente durante sessões
                ativas e autorizadas de coleta de campo.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-[#1A2A5A]">
                <div>
                  <span className="text-[#64748B] block font-mono uppercase text-[10px]">
                    Finalidade Específica:
                  </span>
                  <span className="text-[#CBD5E1]">
                    Cálculo e mapeamento geoespacial dos índices IMV (Índice de Manutenção Viária) e
                    IMA (Índice de Manutenção de Acessibilidade), mapeamento de anomalias viárias
                    (buracos, afundamentos) e roteirização de manutenção urbana pela Secretaria de
                    Obras.
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block font-mono uppercase text-[10px]">
                    Garantia Antirrastreamento:
                  </span>
                  <span className="text-[#CBD5E1]">
                    <b>
                      NÃO rastreia indivíduos, trajetos particulares, domicílios nem rotinas de
                      pessoas.
                    </b>{' '}
                    A coleta só opera com gatilho de velocidade (&gt; 10 km/h para veículos ou modo
                    ativo deliberado) e as coordenadas são agregadas em janelas espaciais
                    padronizadas de 100 metros de malha pública.
                  </span>
                </div>
              </div>
            </div>

            {/* Categoria D */}
            <div className="p-5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#8B5CF6]/20 text-[#A78BFA]">
                    Categoria D
                  </span>
                  <h3 className="text-base font-bold text-[#F8FAFC]">
                    Telemetria de Vibração Mecânica (DeviceMotion + Transformada Rápida de Fourier —
                    FFT)
                  </h3>
                </div>
                <span className="text-[11px] font-mono font-semibold text-[#A78BFA] bg-[#8B5CF6]/15 px-2.5 py-0.5 rounded">
                  Dado Anonimizado por Design (Art. 12 LGPD)
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                <b>Dados Coletados:</b> Vetores inerciais tridimensionais de aceleração (ax, ay,
                az), giroscópio (roll, pitch, yaw) e magnitudes espectrais calculadas na borda do
                dispositivo do coletor.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-[#1A2A5A]">
                <div>
                  <span className="text-[#64748B] block font-mono uppercase text-[10px]">
                    Natureza Técnica:
                  </span>
                  <span className="text-[#CBD5E1]">
                    Em virtude do processamento na borda (edge computing via Web Worker) e da
                    ausência absoluta de identificadores pessoais, os dados inerciais brutos{' '}
                    <b>não permitem a reidentificação de pessoas</b>, sendo classificados como{' '}
                    <b>dados anonimizados por design</b>, fora do escopo protetivo de dados pessoais
                    conforme Art. 12 da LGPD.
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block font-mono uppercase text-[10px]">
                    Arquitetura Zero CAPEX / Zero Câmeras:
                  </span>
                  <span className="text-[#CBD5E1]">
                    O ORBIS UOS opera sem sensores de imagem, sem captação sonora e sem leitura de
                    placas de trânsito. O aparelho smartphone do fiscal ou do motorista pode operar
                    no suporte do painel, bolso da calça ou mochila sem comprometer a privacidade do
                    entorno.
                  </span>
                </div>
              </div>
            </div>

            {/* Categoria E */}
            <div className="p-5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#38BDF8]/20 text-[#38BDF8]">
                    Categoria E
                  </span>
                  <h3 className="text-base font-bold text-[#F8FAFC]">
                    Dados Públicos Institucionais & Open Data Governamental
                  </h3>
                </div>
                <span className="text-[11px] font-mono font-semibold text-[#38BDF8] bg-[#38BDF8]/15 px-2.5 py-0.5 rounded">
                  Base Legal: Art. 7º, § 3º e 4º LGPD + LAI (Lei 12.527/2011)
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                <b>Fontes Consultadas:</b> Sistema de Informações Contábeis e Fiscais do Setor
                Público Brasileiro (SICONFI / Tesouro Nacional), Portal da Transparência da
                Controladoria-Geral da União (CGU / Fiscaliza SG) e dados estatísticos do IBGE.
              </p>
              <div className="text-xs text-[#CBD5E1] pt-2 border-t border-[#1A2A5A]">
                <b>Finalidade & Salvaguarda:</b> Consulta e armazenamento em cache de despesas
                orçamentárias com trânsito (função 26), convênios federais e repasses ao município
                para subsidiar o painel Modo Gabinete e a conformidade com o Art. 320 do CTB. Não
                envolve tratamento de dados pessoais sensíveis ou de pessoas naturais não públicas.
              </div>
            </div>
          </div>
        </section>

        {/* 2. Prazos de Retenção e Critérios de Descarte */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1A2A5A]">
            <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] flex items-center gap-2.5">
              <Clock className="w-6 h-6 text-[#10B981]" />
              2. Prazos de Retenção e Política de Descarte Seguro dos Dados
            </h2>
            <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/15 px-2.5 py-1 rounded border border-[#10B981]/30">
              Retenção Diferenciada
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            Nenhum dado é retido por período superior ao estritamente necessário para o cumprimento
            das suas finalidades legítimas ou para observância de obrigações de prestação de contas
            aos órgãos de controle (TCE e TCU):
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Destaque Telemetria 180 dias */}
            <div className="p-5 rounded-xl bg-[#0A1128] border-2 border-[#10B981]/60 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#10B981]/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#10B981] font-bold">
                  Destaque Obrigatório
                </span>
                <span className="px-2 py-0.5 rounded font-mono text-xs font-extrabold bg-[#10B981] text-[#070D1F]">
                  180 DIAS
                </span>
              </div>
              <h3 className="text-base font-bold text-white">Telemetria Bruta de Vibração</h3>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                Amostras inerciais brutas de 50 Hz, picos de aceleração e séries temporais de FFT
                são mantidas por no máximo <b>180 dias</b> contados da data da sessão de coleta.
              </p>
              <div className="text-[11px] text-[#94A3B8] pt-2 border-t border-[#1A2A5A] font-mono">
                <b>Regra de Purga:</b> Após 180 dias, os dados brutos são destruídos de forma
                irreversível. Apenas os índices consolidados por segmento (IMV e IMA) permanecem
                para histórico orçamentário.
              </div>
            </div>

            {/* Dados Cadastrais */}
            <div className="p-5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#3B82F6] font-bold">
                  Agentes Públicos
                </span>
                <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-[#3B82F6]/20 text-[#60A5FA]">
                  Vínculo Institucional
                </span>
              </div>
              <h3 className="text-base font-bold text-white">Dados Cadastrais de Contato</h3>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                Conservados durante todo o período de vigência da interlocução técnica, piloto
                experimental ou contrato CPSI com a prefeitura, acrescidos do prazo prescricional de{' '}
                <b>5 anos</b> (Decreto nº 20.910/1932).
              </p>
              <div className="text-[11px] text-[#94A3B8] pt-2 border-t border-[#1A2A5A]">
                O titular pode solicitar a atualização ou revogação de envio de comunicações
                institucionais a qualquer tempo.
              </div>
            </div>

            {/* Registros de Auditoria */}
            <div className="p-5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#F59E0B] font-bold">
                  Transparência Pública
                </span>
                <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-[#F59E0B]/20 text-[#F59E0B]">
                  Prazos TCE / TCU
                </span>
              </div>
              <h3 className="text-base font-bold text-white">Trilhas de Auditoria & Dossiês</h3>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                Logs de calibração do Fator K, registros de autenticação com IP e hashes SHA-256 de
                relatórios institucionais são preservados pelo prazo regulamentar de guarda de
                documentos de fiscalização financeira (<b>5 a 10 anos</b>).
              </p>
              <div className="text-[11px] text-[#94A3B8] pt-2 border-t border-[#1A2A5A]">
                Conformidade com os artigos 22 e 24 do Marco Civil da Internet (Lei 12.965/2014).
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] text-xs text-[#94A3B8] flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
            <div>
              <b className="text-[#CBD5E1]">Critério de Descarte Seguro:</b> Ao expirar o prazo
              legal de retenção, as exclusões ocorrem por sobrescrita lógica e física nas bases da
              infraestrutura ou anonimização irreversível com agregação estatística agregada que
              impossibilite a reconstituição de origem.
            </div>
          </div>
        </section>

        {/* 3. Direitos do Titular (Art. 18 LGPD) */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1A2A5A]">
            <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] flex items-center gap-2.5">
              <UserCheck className="w-6 h-6 text-[#3B82F6]" />
              3. Direitos dos Titulares de Dados Pessoais (Art. 18 da LGPD)
            </h2>
            <span className="text-xs font-mono text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded border border-[#10B981]/30">
              Garantias Legais
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            O titular pessoa natural tem o direito de obter da ORBIS UOS, em relação aos dados por
            ela tratados, a qualquer momento e mediante requisição expressa:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-1">
              <div className="flex items-center gap-2 font-bold text-[#F8FAFC]">
                <span className="text-[#3B82F6] font-mono">I.</span> Confirmação e Acesso
              </div>
              <p className="text-[#94A3B8]">
                Confirmação da existência de tratamento e acesso facilitado aos dados pessoais
                cadastrados na plataforma.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-1">
              <div className="flex items-center gap-2 font-bold text-[#F8FAFC]">
                <span className="text-[#3B82F6] font-mono">II.</span> Correção de Incompletos ou
                Inexatos
              </div>
              <p className="text-[#94A3B8]">
                Correção de dados cadastrais incompletos, inexatos, desatualizados ou divergentes do
                cadastro oficial.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-1">
              <div className="flex items-center gap-2 font-bold text-[#F8FAFC]">
                <span className="text-[#3B82F6] font-mono">III.</span> Anonimização, Bloqueio ou
                Eliminação
              </div>
              <p className="text-[#94A3B8]">
                Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados
                em desconformidade com a LGPD.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-1">
              <div className="flex items-center gap-2 font-bold text-[#F8FAFC]">
                <span className="text-[#3B82F6] font-mono">IV.</span> Portabilidade dos Dados
              </div>
              <p className="text-[#94A3B8]">
                Portabilidade dos dados a outro fornecedor de serviço ou produto governamental em
                formato estruturado (JSON/CSV).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-1">
              <div className="flex items-center gap-2 font-bold text-[#F8FAFC]">
                <span className="text-[#3B82F6] font-mono">V.</span> Informação sobre
                Compartilhamentos
              </div>
              <p className="text-[#94A3B8]">
                Informação pormenorizada das entidades públicas e privadas com as quais o
                controlador realizou uso compartilhado.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-1">
              <div className="flex items-center gap-2 font-bold text-[#F8FAFC]">
                <span className="text-[#3B82F6] font-mono">VI.</span> Revogação do Consentimento
              </div>
              <p className="text-[#94A3B8]">
                Revogação de consentimentos concedidos anteriormente, mediante procedimento gratuito
                e facilitado.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Canal de Solicitação Oficial & Formulário Interativo */}
        <section className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#101B3A] to-[#0A1128] border-2 border-[#3B82F6]/40 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1A2A5A]">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] flex items-center gap-2.5">
                <Mail className="w-6 h-6 text-[#60A5FA]" />
                4. Canal de Atendimento do Titular (DPO / LGPD)
              </h2>
              <p className="text-xs text-[#94A3B8] mt-1">
                Canal exclusivo para o exercício de direitos fundamentais previstos no Art. 18 da
                LGPD
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/15 px-3 py-1 rounded border border-[#10B981]/30 inline-block">
                Prazo Máximo de Resposta: 15 dias
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 space-y-4 text-xs text-[#CBD5E1]">
              <p className="leading-relaxed">
                As solicitações são recebidas diretamente pelo Encarregado de Proteção de Dados
                (DPO) através do e-mail oficial institucional do rodapé ou através do formulário
                direto ao lado:
              </p>

              <div className="p-4 rounded-xl bg-[#070D1F] border border-[#1A2A5A] space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#64748B]">
                  E-mail de Contato Oficial:
                </span>
                <div className="flex items-center justify-between gap-2">
                  <a
                    href="mailto:contato@orbis-uos.com.br?subject=Solicitacao%20LGPD%20Titular%20de%20Dados"
                    className="font-mono text-sm text-[#38BDF8] hover:underline font-bold break-all"
                  >
                    contato@orbis-uos.com.br
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="px-2.5 py-1 rounded bg-[#101B3A] hover:bg-[#1A2A5A] text-xs text-white border border-[#1A2A5A] flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    {copiedEmail ? (
                      <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedEmail ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#94A3B8]">
                  Assunto sugerido no e-mail:{' '}
                  <code>[LGPD - Solicitação de Titular] Nome / Município</code>
                </p>
              </div>

              <div className="space-y-1.5 text-[11px] text-[#94A3B8]">
                <p>
                  • <b>Gratuidade:</b> O atendimento e o fornecimento de respostas aos titulares são
                  integralmente gratuitos.
                </p>
                <p>
                  • <b>Autenticação Prévia:</b> Para resguardar a privacidade contra vazamento para
                  terceiros, o Encarregado poderá requerer comprovação documental idônea da
                  identidade do solicitante.
                </p>
                <p>
                  • <b>Prazo Legal:</b> Emissão de resposta simplificada imediata e declaração clara
                  e completa em até 15 (quinze) dias (Art. 19, II da LGPD).
                </p>
              </div>
            </div>

            {/* Formulário Interativo de Protocolo */}
            <div className="lg:col-span-7 p-5 rounded-xl bg-[#070D1F] border border-[#3B82F6]/30">
              {formSent ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 mx-auto flex items-center justify-center text-[#10B981]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-white">Solicitação Formal Protocolada</h4>
                  <p className="text-xs text-[#CBD5E1] max-w-md mx-auto leading-relaxed">
                    Sua requisição foi encaminhada para a fila prioritária do Encarregado LGPD do
                    ORBIS UOS. Número de protocolo de rastreamento:{' '}
                    <span className="font-mono text-[#38BDF8] font-bold">
                      LGPD-{new Date().getFullYear()}-{Math.floor(100000 + Math.random() * 900000)}
                    </span>
                    . Prazo estimado de resposta técnica: até 15 dias corridos.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFormSent(false)
                      setRequestDetails('')
                    }}
                    className="mt-3 px-4 py-2 rounded-lg text-xs font-semibold bg-[#101B3A] hover:bg-[#1A2A5A] text-[#CBD5E1] border border-[#1A2A5A]"
                  >
                    Emitir nova solicitação
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSimulateRequestSubmit} className="space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#1A2A5A]">
                    <span className="text-xs font-bold text-[#F8FAFC] flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#3B82F6]" />
                      Protocolo Direto de Atendimento ao Titular
                    </span>
                    <span className="text-[10px] font-mono text-[#60A5FA]">Art. 18 LGPD</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] text-[#94A3B8] mb-1 font-medium">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={requesterName}
                        onChange={(e) => setRequesterName(e.target.value)}
                        placeholder="Ex.: Carlos Alberto Silva"
                        className="w-full px-3 py-2 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-white placeholder-[#475569] text-xs focus:outline-none focus:border-[#3B82F6]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#94A3B8] mb-1 font-medium">
                        E-mail Institucional ou Pessoal *
                      </label>
                      <input
                        type="email"
                        required
                        value={requesterEmail}
                        onChange={(e) => setRequesterEmail(e.target.value)}
                        placeholder="nome@orgao.gov.br"
                        className="w-full px-3 py-2 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-white placeholder-[#475569] text-xs focus:outline-none focus:border-[#3B82F6]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] text-[#94A3B8] mb-1 font-medium">
                        Órgão / Município de Origem
                      </label>
                      <input
                        type="text"
                        value={requesterOrg}
                        onChange={(e) => setRequesterOrg(e.target.value)}
                        placeholder="Ex.: SEMUTRAN Curitiba"
                        className="w-full px-3 py-2 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-white placeholder-[#475569] text-xs focus:outline-none focus:border-[#3B82F6]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#94A3B8] mb-1 font-medium">
                        Tipo de Requerimento *
                      </label>
                      <select
                        value={requestSubject}
                        onChange={(e) => setRequestSubject(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-white text-xs focus:outline-none focus:border-[#3B82F6]"
                      >
                        <option value="Acesso aos Dados (Art. 18, II)">
                          Acesso e Relatório Completo de Dados
                        </option>
                        <option value="Correção Cadastral (Art. 18, III)">
                          Correção ou Atualização de Dados
                        </option>
                        <option value="Eliminação / Revogação (Art. 18, VI e IX)">
                          Eliminação de Dados / Revogação
                        </option>
                        <option value="Informação de Compartilhamento (Art. 18, VII)">
                          Informação sobre Compartilhamentos
                        </option>
                        <option value="Dúvida Geral DPO">
                          Dúvidas de Conformidade ou Segurança
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#94A3B8] mb-1 font-medium">
                      Detalhamento do Requerimento ou Justificativa *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={requestDetails}
                      onChange={(e) => setRequestDetails(e.target.value)}
                      placeholder="Descreva de forma clara quais dados ou registros deseja consultar, corrigir ou revogar..."
                      className="w-full px-3 py-2 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-white placeholder-[#475569] text-xs focus:outline-none focus:border-[#3B82F6] resize-none"
                    />
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[10px] text-[#64748B]">
                      Canal seguro sob protocolo HTTPS / TLS 1.3
                    </span>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] shadow-md shadow-[#2563EB]/25 flex items-center gap-2 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Registrar Requerimento LGPD</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* 5. Procedimento de Resposta a Incidentes de Segurança (Art. 48 LGPD) */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1A2A5A]">
            <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] flex items-center gap-2.5">
              <AlertTriangle className="w-6 h-6 text-[#F59E0B]" />
              5. Procedimento de Resposta a Incidentes de Segurança (Art. 48 da LGPD)
            </h2>
            <span className="text-xs font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-2.5 py-1 rounded border border-[#F59E0B]/30">
              Protocolo Operacional Contínuo
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            O ORBIS UOS adota um Protocolo Formal de Gestão e Resposta a Incidentes de Segurança da
            Informação, estruturado em 4 fases sequenciais em estrita observância ao Artigo 48 da
            Lei nº 13.709/2018 e às recomendações da Autoridade Nacional de Proteção de Dados
            (ANPD):
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            {/* Fase 1 */}
            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#60A5FA] uppercase font-bold">
                  Fase 1
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#3B82F6]/20 text-[#60A5FA]">
                  0h a 4h
                </span>
              </div>
              <h4 className="font-bold text-white text-sm">Detecção e Triage</h4>
              <p className="text-[#94A3B8] leading-relaxed">
                Monitoramento contínuo de anomalias, auditoria de tokens expirados e acionamento do
                Comitê de Segurança imediatamente após a detecção de qualquer evento adverso.
              </p>
            </div>

            {/* Fase 2 */}
            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#10B981] uppercase font-bold">
                  Fase 2
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#10B981]/20 text-[#10B981]">
                  Imediata
                </span>
              </div>
              <h4 className="font-bold text-white text-sm">Contenção e Isolamento</h4>
              <p className="text-[#94A3B8] leading-relaxed">
                Revogação preventiva de credenciais, isolamento de rotas e contêineres afetados,
                aplicação de patches de emergência e mitigação contra ampliação do vazamento.
              </p>
            </div>

            {/* Fase 3 */}
            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#F59E0B] uppercase font-bold">
                  Fase 3
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#F59E0B]/20 text-[#F59E0B]">
                  Até 48h
                </span>
              </div>
              <h4 className="font-bold text-white text-sm">Avaliação de Risco</h4>
              <p className="text-[#94A3B8] leading-relaxed">
                Determinação dos dados eventualmente expostos, impacto sobre direitos fundamentais e
                avaliação técnica da relevância e gravidade do incidente de acordo com os critérios
                da ANPD.
              </p>
            </div>

            {/* Fase 4 */}
            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#EF4444] uppercase font-bold">
                  Fase 4
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#EF4444]/20 text-[#EF4444]">
                  Prazo Razoável
                </span>
              </div>
              <h4 className="font-bold text-white text-sm">Comunicação e Notificação</h4>
              <p className="text-[#94A3B8] leading-relaxed">
                Comunicação formal à ANPD e aos titulares quando houver risco relevante aos
                direitos, além de registro detalhado no Livro de Incidentes para prestação de
                contas.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] text-xs text-[#CBD5E1] space-y-2">
            <span className="font-bold text-white block">
              Conteúdo Obrigatório da Notificação (Art. 48, § 1º LGPD):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#94A3B8] text-[11px]">
              <div>a) Descrição da natureza e categorias dos dados pessoais afetados;</div>
              <div>b) Informações sobre os titulares envolvidos;</div>
              <div>c) Indicação das medidas técnicas e de segurança utilizadas para proteção;</div>
              <div>
                d) Riscos relacionados ao incidente e medidas adotadas para reverter prejuízos;
              </div>
              <div>e) Motivos de eventual demora na comunicação, se aplicável;</div>
              <div>f) Medidas que foram ou serão adotadas para mitigar os efeitos da infração.</div>
            </div>
          </div>
        </section>

        {/* 6. Compartilhamento com Terceiros, Operadores e Não Comercialização */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1A2A5A]">
            <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] flex items-center gap-2.5">
              <Server className="w-6 h-6 text-[#10B981]" />
              6. Compartilhamento com Terceiros, Operadores e Diretriz Não Comercial
            </h2>
            <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/15 px-2.5 py-1 rounded border border-[#10B981]/30">
              Vedações Absolutas
            </span>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            <div className="p-4 rounded-xl bg-[#0A1128] border border-[#10B981]/40 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
              <div>
                <b className="text-white text-sm">Compromisso Soberano de Não Comercialização:</b>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  A ORBIS UOS <b>nunca comercializa, cede, aluga ou monetiza</b> dados pessoais,
                  cadastrais ou de localização sob qualquer pretexto com agentes de marketing,
                  bureaus de crédito ou plataformas de anúncios. O uso é estritamente restrito à
                  finalidade pública de gestão da mobilidade e infraestrutura urbana.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-[#3B82F6]" />
                  Operador de Infraestrutura de Nuvem (Skip Cloud)
                </span>
                <p className="text-[#94A3B8] leading-relaxed text-[11px]">
                  A plataforma utiliza a infraestrutura segura <b>Skip Cloud</b> (PocketBase
                  gerenciado) como operadora tecnológica de banco de dados, storage e computação de
                  borda. Os dados repousam criptografados em repouso (AES-256) e em trânsito (TLS
                  1.3), submetidos a contratos com rígidas cláusulas de proteção à privacidade.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-[#F59E0B]" />
                  Integração Unidirecional com Bases Federais
                </span>
                <p className="text-[#94A3B8] leading-relaxed text-[11px]">
                  As consultas realizadas ao <b>SICONFI / Tesouro Nacional</b> e à{' '}
                  <b>CGU / Fiscaliza SG</b> operam sob fluxo unidirecional de leitura pública (open
                  data), sem fornecimento ou tráfego de dados de agentes públicos municipais ou de
                  cidadãos às APIs de terceiros.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Arquitetura de Segurança, RLS e Relação com a Metodologia v2.1 */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[#0A1128] border-2 border-[#10B981]/40 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1A2A5A]">
            <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] flex items-center gap-2.5">
              <Lock className="w-6 h-6 text-[#10B981]" />
              7. Medidas Técnicas de Segurança & Auditoria Criptográfica
            </h2>
            <Link
              to="/metodologia"
              className="text-xs font-mono font-bold text-[#38BDF8] hover:underline flex items-center gap-1"
            >
              <span>Ver Metodologia Homologada v2.1</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            <p>
              As salvaguardas técnicas do ORBIS UOS foram submetidas ao processo de endurecimento
              institucional <i>(Hardened Build v0.0.25 RBAC)</i>, auditável através do{' '}
              <b>Relatório Interno de Segurança</b> com hash criptográfico SHA-256 e das seguintes
              diretrizes:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-1">
                <span className="font-bold text-[#10B981] block">Row-Level Security (RLS)</span>
                <p className="text-[#94A3B8] text-[11px]">
                  Regras de acesso granulares em 12 collections do PocketBase. Apenas agentes
                  autorizados do próprio ente possuem acesso a dados cadastrais e simulações
                  orçamentárias.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-1">
                <span className="font-bold text-[#3B82F6] block">Autenticidade SHA-256</span>
                <p className="text-[#94A3B8] text-[11px]">
                  Dossiês de Arquitetura e Relatórios de Segurança geram digest criptográfico
                  computado no momento da emissão, garantindo a imutabilidade perante TCE e CGU.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-1">
                <span className="font-bold text-[#F59E0B] block">Trilha de Auditoria</span>
                <p className="text-[#94A3B8] text-[11px]">
                  Alterações críticas (como a calibração do Fator K de veículos ou resets de
                  credenciais) gravam data, hash do operador e justificativa técnica no banco de
                  dados.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#3B82F6]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-xs">
                <span className="font-bold text-white block">
                  Consulte a documentação técnica e os Termos de Uso:
                </span>
                <span className="text-[#94A3B8] text-[11px] block">
                  A metodologia completa de cálculo dos índices IMV/IMA, filtros de Fourier (FFT),
                  Fator K e os Termos de Uso para contratação governamental (B2G) estão disponíveis
                  publicamente.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/termos"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#0A1128] hover:bg-[#101B3A] border border-[#38BDF8]/40 text-[#38BDF8] flex items-center gap-1.5 transition-all"
                >
                  <span>Termos de Uso (/termos)</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/metodologia"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] flex items-center gap-1.5 transition-all shadow-md shadow-[#2563EB]/25"
                >
                  <span>Acessar /metodologia</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Atualizações e Disposições Finais */}
        <div className="p-6 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3 text-xs text-[#94A3B8]">
          <h3 className="font-bold text-sm text-[#F8FAFC]">
            8. Atualizações desta Política de Privacidade
          </h3>
          <p className="leading-relaxed">
            Esta Política de Privacidade poderá ser revisada periodicamente para refletir
            aprimoramentos técnicos da plataforma ORBIS UOS, alterações legislativas ou novas
            orientações expedidas pela Autoridade Nacional de Proteção de Dados (ANPD). Qualquer
            modificação substantiva será comunicada em destaque na interface da plataforma e aos
            usuários cadastrados.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-[#1A2A5A] font-mono text-[11px]">
            <span>ORBIS UOS GovTech • Encarregado de Proteção de Dados (DPO)</span>
            <span>Última revisão formal: 15 de Março de 2025 • Versão 1.0 (v0.0.25)</span>
          </div>
        </div>

        {/* Bottom Back Button */}
        <div className="pt-2 flex items-center justify-between text-xs">
          <Link
            to="/"
            className="text-xs font-semibold text-[#CBD5E1] hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para a página inicial
          </Link>
          <span className="text-[#64748B] font-mono text-[11px]">
            Em conformidade com a Lei Federal nº 13.709/2018 (LGPD)
          </span>
        </div>
      </div>
    </div>
  )
}
