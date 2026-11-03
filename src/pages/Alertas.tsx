import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  Clock,
  School,
  TrendingDown,
  TrendingUp,
  Copy,
  Check,
  Radio,
  Tv,
  Smartphone,
  Monitor,
  HeartPulse,
  Brain,
  FileText,
  Building2,
  Wrench,
  CheckCircle2,
  Share2,
  Info,
  Calendar,
  MapPin,
  ChevronRight,
  Flame,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import {
  IEC_NIVEIS,
  IecNivelConfig,
  IecNivelId,
  calculateKineticStressIndex,
} from '@/lib/diagnostics/iecEngine'
import {
  DADOS_DEMO_BOLETIM_IEC,
  DADOS_DEMO_ZONAS_ESCOLARES,
  DADOS_DEMO_ZONAS_PICO,
  CANAIS_COMUNICACAO_ORGAO,
  gerarTextoReleaseImprensa,
  BoletimIecCidade,
  AlertaZonaEscolar,
  ZonaPicoGanhoTempo,
} from '@/lib/diagnostics/boletimIecData'

export default function AlertasPage() {
  const [copiedRelease, setCopiedRelease] = useState(false)
  const [copiedPmv, setCopiedPmv] = useState(false)
  const [selectedEscolaId, setSelectedEscolaId] = useState<string>(DADOS_DEMO_ZONAS_ESCOLARES[0].id)
  const [selectedPicoId, setSelectedPicoId] = useState<string>(DADOS_DEMO_ZONAS_PICO[0].id)
  const [modoGanho, setModoGanho] = useState<'5min' | '10min'>('10min')

  const boletim = DADOS_DEMO_BOLETIM_IEC
  const zonasEscolares = DADOS_DEMO_ZONAS_ESCOLARES
  const zonasPico = DADOS_DEMO_ZONAS_PICO
  const releaseTemplate = gerarTextoReleaseImprensa(boletim, zonasEscolares)

  const escolaAtiva = zonasEscolares.find((e) => e.id === selectedEscolaId) || zonasEscolares[0]
  const picoAtivo = zonasPico.find((p) => p.id === selectedPicoId) || zonasPico[0]

  const textoCompletoRelease = `${releaseTemplate.titulo}
${releaseTemplate.subtitulo}

${releaseTemplate.lead}

${releaseTemplate.citacaoPortavozPadrao}

${releaseTemplate.dadosTabelaTexto}

${releaseTemplate.rodapeInstitucionalLgpd}`

  const handleCopyRelease = () => {
    navigator.clipboard.writeText(textoCompletoRelease)
    setCopiedRelease(true)
    setTimeout(() => setCopiedRelease(false), 2500)
  }

  const handleCopyPmv = (texto: string) => {
    navigator.clipboard.writeText(texto)
    setCopiedPmv(true)
    setTimeout(() => setCopiedPmv(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#070C1D] text-[#F8FAFC] pt-20 pb-24">
      {/* Top Banner de Identidade Institucional & Rótulo de Demonstração */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6">
        {/* Breadcrumb e Tagline */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1A2A5A]">
          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <Link to="/" className="hover:text-white transition-colors">
              Início
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#38BDF8] font-semibold">Comunicação Pública</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-bold">Boletim IEC & Alertas</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono font-bold text-[#10B981] bg-[#10B981]/15 px-2.5 py-1 rounded border border-[#10B981]/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>LGPD: dado físico, não pessoal</span>
            </span>
            <span className="text-[11px] font-mono font-bold text-[#38BDF8] bg-[#38BDF8]/15 px-2.5 py-1 rounded border border-[#38BDF8]/30">
              k-anônimo (k ≥ 3)
            </span>
            <span className="text-[11px] font-mono font-bold text-[#F59E0B] bg-[#F59E0B]/15 px-2.5 py-1 rounded border border-[#F59E0B]/40 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              <span>Demonstração com dados sintéticos</span>
            </span>
          </div>
        </div>

        {/* Hero da Camada Pública */}
        <div className="mt-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B82F6]/15 border border-[#3B82F6]/40 text-xs font-mono font-bold text-[#60A5FA]">
            <Activity className="w-4 h-4 text-[#38BDF8]" />
            <span>CAMADA PÚBLICA DE COMUNICAÇÃO INSTITUCIONAL • BOLETIM IEC</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Boletim do Índice de Estresse Cinemático (IEC)
          </h1>

          <p className="text-sm sm:text-base text-[#CBD5E1] max-w-4xl leading-relaxed">
            Transformando a física da dinâmica veicular (acelerômetro e velocidade da telemetria
            agregada) em alertas preventivos para a população, ordens de serviço de engenharia para
            o órgão de trânsito e comunicados de utilidade pública para rádios, TVs e painéis
            outdoors.
          </p>

          {/* Aviso Explícito de Honestidade Tipada e Rodovias */}
          <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] text-xs text-[#94A3B8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#38BDF8] shrink-0" />
              <span>
                <strong className="text-white">Enquadramento Municipal Exclusivo:</strong> O boletim
                cobre vias urbanas e corredores sob jurisdição do município.{' '}
                <span className="text-[#38BDF8]">
                  Rodovias federais e estaduais encontram-se em estudo de conformidade
                </span>{' '}
                e não integram esta operação pública.
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/30 shrink-0">
              Honestidade Tipada: Amostra Sintética
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 mt-6">
        {/* ===================================================================
            SEÇÃO 1: BOLETIM IEC DO DIA (Índice Agregado, Comparativo e Janelas)
           =================================================================== */}
        <section
          id="boletim-do-dia"
          className="bg-[#101B3A] border border-[#1A2A5A] rounded-2xl p-5 sm:p-7 space-y-6 shadow-xl"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#1A2A5A]">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-[#38BDF8]">
                <Calendar className="w-4 h-4" />
                <span>
                  {boletim.diaSemana}, {boletim.dataReferencia} • {boletim.municipio} (IBGE{' '}
                  {boletim.ibge})
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                <span>1. Boletim IEC da Cidade — Visão Consolidada</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40">
                  Ao Vivo (Sintético)
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-[#94A3B8]">Processamento:</span>
              <span className="text-xs font-mono font-bold text-[#60A5FA] bg-[#0A1128] px-2.5 py-1 rounded border border-[#1A2A5A]">
                Motor ORBIS DSP
              </span>
            </div>
          </div>

          {/* Cards de Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Score Agregado */}
            <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>Índice Agregado IEC</span>
                <span className="font-mono text-[10px]">Escala 0–100</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                  {boletim.indiceAgregadoIec}
                </span>
                <span className="text-xs font-bold text-[#94A3B8]">/ 100</span>
                <span
                  className={`text-xs font-bold font-mono px-2 py-0.5 rounded ml-auto border ${boletim.nivelPredominante.corTailwindBadge}`}
                >
                  {boletim.nivelPredominante.nome}
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8] leading-tight">
                {boletim.nivelPredominante.padraoFisico}
              </p>
            </div>

            {/* Card 2: Comparação com o Dia Anterior */}
            <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-2">
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>Comparação com Ontem</span>
                <span className="font-mono text-[10px]">Segunda-feira</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1 text-2xl font-black font-mono ${
                    boletim.comparacaoOntem.diferencaPontos < 0
                      ? 'text-[#10B981]'
                      : 'text-[#EF4444]'
                  }`}
                >
                  {boletim.comparacaoOntem.diferencaPontos < 0 ? (
                    <TrendingDown className="w-6 h-6" />
                  ) : (
                    <TrendingUp className="w-6 h-6" />
                  )}
                  <span>{Math.abs(boletim.comparacaoOntem.diferencaPontos)} pts</span>
                </div>
                <span className="text-xs font-semibold text-[#10B981]">
                  {boletim.comparacaoOntem.tendencia === 'melhora'
                    ? 'Melhora na fluidez'
                    : 'Aumento de tensão'}
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8] leading-tight">
                {boletim.comparacaoOntem.textoExplicativo}
              </p>
            </div>

            {/* Card 3: Quilômetros & Veículos K-Anônimos */}
            <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-2">
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>Amostragem k-Anônima</span>
                <span className="font-mono text-[10px] text-[#10B981]">Zero PII</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-mono">
                  {boletim.totalVeiculosAgregadosK.toLocaleString('pt-BR')}
                </span>
                <span className="text-xs text-[#94A3B8]">veículos</span>
              </div>
              <p className="text-[11px] text-[#94A3B8] leading-tight">
                Em {boletim.totalQuilometrosAferidos} km de vias cobertas por frotas municipais e
                coleta agregada.
              </p>
            </div>

            {/* Card 4: Fita da Escala de 4 Níveis */}
            <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-2">
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>Distribuição do Dia</span>
                <span className="font-mono text-[10px]">4 Níveis Oficiais</span>
              </div>

              {/* Barra segmentada */}
              <div className="w-full h-3 rounded-full overflow-hidden flex bg-[#1A2A5A]">
                <div
                  style={{ width: `${boletim.distribuicaoPercentual.fluidaVerde}%` }}
                  className="bg-[#10B981]"
                  title={`Fluida: ${boletim.distribuicaoPercentual.fluidaVerde}%`}
                />
                <div
                  style={{ width: `${boletim.distribuicaoPercentual.estavelCiano}%` }}
                  className="bg-[#06B6D4]"
                  title={`Estável: ${boletim.distribuicaoPercentual.estavelCiano}%`}
                />
                <div
                  style={{ width: `${boletim.distribuicaoPercentual.tensaoAmbar}%` }}
                  className="bg-[#F59E0B]"
                  title={`Tensão Elevada: ${boletim.distribuicaoPercentual.tensaoAmbar}%`}
                />
                <div
                  style={{ width: `${boletim.distribuicaoPercentual.criticaVermelho}%` }}
                  className="bg-[#EF4444]"
                  title={`Crítica: ${boletim.distribuicaoPercentual.criticaVermelho}%`}
                />
              </div>

              <div className="grid grid-cols-2 gap-1 text-[10px] text-[#CBD5E1]">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  <span>Fluida: {boletim.distribuicaoPercentual.fluidaVerde}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
                  <span>Estável: {boletim.distribuicaoPercentual.estavelCiano}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                  <span>Tensão: {boletim.distribuicaoPercentual.tensaoAmbar}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                  <span>Crítica: {boletim.distribuicaoPercentual.criticaVermelho}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Janelas Críticas do Dia */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#EF4444]" />
                <span>Janelas Críticas do Dia (Trecho + Horário + Ação do Órgão)</span>
              </h3>
              <span className="text-xs text-[#94A3B8]">
                Ordens de serviço geradas automaticamente a partir de estresse inercial
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {boletim.janelasCriticasDoDia.map((jc) => (
                <div
                  key={jc.id}
                  className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] hover:border-[#3B82F6]/50 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
                        <span className="font-mono text-xs font-bold text-[#38BDF8]">
                          {jc.horarioInicio} – {jc.horarioFim}
                        </span>
                        <span className="text-[10px] font-mono text-[#94A3B8]">
                          k = {jc.kAnonimo} veículos
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">{jc.corredor}</h4>
                      <p className="text-xs text-[#94A3B8]">{jc.bairro}</p>
                    </div>

                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${jc.nivel.corTailwindBadge}`}
                    >
                      IEC {jc.iecScore} • {jc.nivel.nome}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#101B3A] border border-[#1A2A5A] text-xs space-y-1">
                    <div className="text-[#CBD5E1]">
                      <strong className="text-white">Padrão Físico:</strong> {jc.motivoFisico}
                    </div>
                    <div className="text-[#38BDF8]">
                      <strong>Orientação ao Condutor:</strong> {jc.orientacaoCondutor}
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5 text-[11px] text-[#10B981] font-mono pt-1 border-t border-[#1A2A5A]">
                    <Wrench className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#10B981]" />
                    <span>{jc.ordemServicoOrgao}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================================
            SEÇÃO 2: ALERTAS DE ZONA ESCOLAR (Com K-Anônimo & Causa de Engenharia)
           =================================================================== */}
        <section
          id="zonas-escolares"
          className="bg-[#101B3A] border border-[#1A2A5A] rounded-2xl p-5 sm:p-7 space-y-6 shadow-xl"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#1A2A5A]">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#F59E0B] bg-[#F59E0B]/15 px-2.5 py-0.5 rounded border border-[#F59E0B]/30">
                <School className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>SEGURANÇA VIÁRIA INFANTIL • PRIORIDADE MUNICIPAL MÁXIMA</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>2. Alertas de Zona Escolar & Análise de Engenharia</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8] max-w-3xl leading-relaxed">
                Nos horários de abertura e fechamento das escolas, trechos com Tensão Elevada ou
                Crítica no entorno escolar são destacados.
                <strong className="text-white">
                  {' '}
                  A leitura institucional é transparente: concentração de estresse no mesmo trecho
                  quase sempre indica causa de engenharia
                </strong>{' '}
                (faixa sem visibilidade, placa encoberta por árvore ou falta de baia de parada). Por
                isso, o alerta vira ordem de serviço imediata para o órgão municipal de trânsito e
                obras.
              </p>
            </div>

            <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/15 px-3 py-1.5 rounded border border-[#10B981]/30 shrink-0">
              k ≥ 3 Garantido • Zero Placas/Condutores
            </span>
          </div>

          {/* Seletor de Escolas e Painel de Diagnóstico */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Lista Lateral de Escolas */}
            <div className="lg:col-span-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                Unidades Escolares em Monitoramento
              </span>

              {zonasEscolares.map((esc) => {
                const isSelected = esc.id === selectedEscolaId
                return (
                  <button
                    key={esc.id}
                    type="button"
                    onClick={() => setSelectedEscolaId(esc.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all space-y-2 ${
                      isSelected
                        ? 'bg-[#0A1128] border-[#3B82F6] shadow-lg shadow-[#3B82F6]/10'
                        : 'bg-[#0A1128]/60 border-[#1A2A5A] hover:border-[#1A2A5A]/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101B3A] text-[#38BDF8] border border-[#1A2A5A]">
                        {esc.tipoUnidade}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${esc.nivel.corTailwindBadge}`}
                      >
                        Pico IEC {esc.iecScorePico}
                      </span>
                    </div>

                    <div className="font-bold text-sm text-white">{esc.nomeEscola}</div>

                    <div className="text-xs text-[#94A3B8] flex items-center justify-between">
                      <span>{esc.bairro}</span>
                      <span className="font-mono text-[10px]">
                        k = {esc.kAnonimoAmostrado} veíc.
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Detalhe da Escola Selecionada: Causa de Engenharia + OS */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-[#0A1128] border-2 border-[#1E3A8A] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A2A5A]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#38BDF8]">{escolaAtiva.bairro}</span>
                    <span className="text-xs text-[#94A3B8]">•</span>
                    <span className="text-xs text-[#94A3B8]">{escolaAtiva.viaAcesso}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{escolaAtiva.nomeEscola}</h3>
                </div>

                <span
                  className={`text-xs font-mono font-bold px-3 py-1 rounded border shrink-0 ${escolaAtiva.nivel.corTailwindBadge}`}
                >
                  IEC {escolaAtiva.iecScorePico} • {escolaAtiva.nivel.nome}
                </span>
              </div>

              {/* Horários Críticos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
                  <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">
                    Janela Crítica Entrada
                  </span>
                  <span className="text-sm font-bold text-[#F59E0B] font-mono">
                    {escolaAtiva.horarioCriticoEntrada}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
                  <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">
                    Janela Crítica Saída
                  </span>
                  <span className="text-sm font-bold text-[#EF4444] font-mono">
                    {escolaAtiva.horarioCriticoSaida}
                  </span>
                </div>
              </div>

              {/* Causa de Engenharia */}
              <div className="p-4 rounded-xl bg-[#101B3A] border border-[#F59E0B]/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F59E0B]">
                  <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                  <span>Nexo Causal Físico — Diagnóstico de Engenharia Viária</span>
                </div>
                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  {escolaAtiva.diagnosticoEngenharia}
                </p>
              </div>

              {/* Ordem de Serviço Institucional */}
              <div className="p-4 rounded-xl bg-[#064E3B]/20 border border-[#10B981]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#10B981]">
                    <Wrench className="w-4 h-4 text-[#10B981]" />
                    <span>
                      Ordem de Serviço Aberta: {escolaAtiva.ordemServicoSugerida.numeroOs}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#EF4444] bg-[#EF4444]/20 px-2 py-0.5 rounded border border-[#EF4444]/40">
                    Prioridade {escolaAtiva.ordemServicoSugerida.prioridade}
                  </span>
                </div>
                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  {escolaAtiva.ordemServicoSugerida.descricao}
                </p>
                <div className="text-[11px] font-mono text-[#A7F3D0] pt-1">
                  Prazo de execução técnica municipal: até{' '}
                  {escolaAtiva.ordemServicoSugerida.prazoExecucaoDias} dias úteis
                </div>
              </div>

              {/* Recomendação de Comportamento */}
              <div className="text-xs text-[#94A3B8] p-3 rounded-lg bg-[#101B3A]/60 border border-[#1A2A5A]">
                <strong className="text-white">Para pais e condutores:</strong>{' '}
                {escolaAtiva.recomendacaoCondutor}
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SEÇÃO 3: ZONAS DE PICO COM GANHO DE TEMPO ESTIMADO (5 / 10 MIN ANTES)
           =================================================================== */}
        <section
          id="zonas-pico"
          className="bg-[#101B3A] border border-[#1A2A5A] rounded-2xl p-5 sm:p-7 space-y-6 shadow-xl"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#1A2A5A]">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#38BDF8] bg-[#38BDF8]/15 px-2.5 py-0.5 rounded border border-[#38BDF8]/30">
                <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>COMPORTAMENTO ANTECIPADO • GESTÃO DA DEMANDA VIÁRIA</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>3. Zonas de Pico & Ganho de Tempo Estimado</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8] max-w-3xl leading-relaxed">
                Apresentamos as janelas de pico recorrentes nos corredores urbanos com o ganho
                estimado ao sair 5 ou 10 minutos antes do horário programado.
                <strong className="text-white">
                  {' '}
                  Mensagem central: sair antes não é só chegar mais cedo, é dirigir melhor
                </strong>{' '}
                (redução drástica de freadas violentas e menor desgaste físico).
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0A1128] border border-[#F59E0B]/40 text-[11px] font-mono text-[#F59E0B] max-w-xs shrink-0">
              <strong className="block text-white">Rótulo Obrigatório:</strong>
              Estimativa derivada de histórico agregado (projeção probabilística, não promessa).
            </div>
          </div>

          {/* Seletor de Corredores de Pico e Painel Comparativo */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Lista Lateral de Corredores */}
            <div className="lg:col-span-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
                Corredores Monitorados
              </span>

              {zonasPico.map((pico) => {
                const isSelected = pico.id === selectedPicoId
                return (
                  <button
                    key={pico.id}
                    type="button"
                    onClick={() => setSelectedPicoId(pico.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all space-y-2 ${
                      isSelected
                        ? 'bg-[#0A1128] border-[#3B82F6] shadow-lg shadow-[#3B82F6]/10'
                        : 'bg-[#0A1128]/60 border-[#1A2A5A] hover:border-[#1A2A5A]/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold text-[#38BDF8]">
                        Pico: {pico.janelaPicoRecorrente}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${pico.nivelPico.corTailwindBadge}`}
                      >
                        IEC {pico.iecPicoScore}
                      </span>
                    </div>

                    <div className="font-bold text-sm text-white">{pico.corredor}</div>
                    <div className="text-xs text-[#94A3B8]">{pico.bairro}</div>
                  </button>
                )
              })}
            </div>

            {/* Painel do Corredor: Alternar 5 min vs 10 min */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-[#0A1128] border-2 border-[#1E3A8A] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A2A5A]">
                <div>
                  <span className="text-xs font-mono text-[#38BDF8]">{picoAtivo.bairro}</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{picoAtivo.corredor}</h3>
                  <div className="text-xs text-[#94A3B8] mt-1">
                    Horário de saturação:{' '}
                    <b className="text-white">{picoAtivo.janelaPicoRecorrente}</b>
                  </div>
                </div>

                {/* Alternador 5min vs 10min */}
                <div className="flex items-center p-1 rounded-xl bg-[#101B3A] border border-[#1A2A5A] shrink-0">
                  <button
                    type="button"
                    onClick={() => setModoGanho('5min')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      modoGanho === '5min'
                        ? 'bg-[#3B82F6] text-white shadow'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    Sair 5 min antes
                  </button>
                  <button
                    type="button"
                    onClick={() => setModoGanho('10min')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      modoGanho === '10min'
                        ? 'bg-[#10B981] text-white shadow'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    Sair 10 min antes
                  </button>
                </div>
              </div>

              {/* Indicadores de Ganho */}
              {modoGanho === '5min' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#3B82F6]/40 space-y-1">
                    <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">
                      Chegada Estimada
                    </span>
                    <div className="text-2xl font-black text-[#38BDF8] font-mono">
                      ~{picoAtivo.ganhoSaindo5MinAntes.minutosChegadaMaisCedo} min
                    </div>
                    <span className="text-[11px] text-[#CBD5E1]">mais cedo no destino</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#10B981]/40 space-y-1">
                    <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">
                      Menos Frenagens
                    </span>
                    <div className="text-2xl font-black text-[#10B981] font-mono">
                      -{picoAtivo.ganhoSaindo5MinAntes.reducaoFrenagensPercent}%
                    </div>
                    <span className="text-[11px] text-[#CBD5E1]">de freadas bruscas</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#F59E0B]/40 space-y-1">
                    <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">
                      Alívio do IEC
                    </span>
                    <div className="text-2xl font-black text-[#F59E0B] font-mono">
                      -{picoAtivo.ganhoSaindo5MinAntes.reducaoIecPontos} pts
                    </div>
                    <span className="text-[11px] text-[#CBD5E1]">no estresse cinemático</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#10B981]/60 space-y-1">
                    <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">
                      Chegada Estimada
                    </span>
                    <div className="text-2xl font-black text-[#10B981] font-mono">
                      ~{picoAtivo.ganhoSaindo10MinAntes.minutosChegadaMaisCedo} min
                    </div>
                    <span className="text-[11px] text-[#CBD5E1]">mais cedo no destino</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#10B981]/60 space-y-1">
                    <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">
                      Menos Frenagens
                    </span>
                    <div className="text-2xl font-black text-[#10B981] font-mono">
                      -{picoAtivo.ganhoSaindo10MinAntes.reducaoFrenagensPercent}%
                    </div>
                    <span className="text-[11px] text-[#CBD5E1]">de freadas bruscas</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#38BDF8]/60 space-y-1">
                    <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">
                      Alívio do IEC
                    </span>
                    <div className="text-2xl font-black text-[#38BDF8] font-mono">
                      -{picoAtivo.ganhoSaindo10MinAntes.reducaoIecPontos} pts
                    </div>
                    <span className="text-[11px] text-[#CBD5E1]">no estresse cinemático</span>
                  </div>
                </div>
              )}

              {/* Explicação da Dinâmica Física */}
              <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-1.5 text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Por que o ganho é maior que os minutos antecipados?</span>
                </span>
                <p className="text-[#94A3B8] leading-relaxed">{picoAtivo.explicacaoFisica}</p>
              </div>

              {/* Mensagem Unificadora de Comportamento */}
              <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/40 text-xs text-[#CBD5E1] space-y-1">
                <strong className="text-[#10B981] flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>Mensagem Comportamental da Semana:</span>
                </strong>
                <p className="italic leading-relaxed">"{picoAtivo.mensagemComportamental}"</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SEÇÃO 4: CANAIS DE COMUNICAÇÃO (PMVs, Rádios, TVs, App Frotista)
           =================================================================== */}
        <section
          id="canais"
          className="bg-[#101B3A] border border-[#1A2A5A] rounded-2xl p-5 sm:p-7 space-y-6 shadow-xl"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#1A2A5A]">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/15 px-2.5 py-0.5 rounded border border-[#10B981]/30">
                <Share2 className="w-3.5 h-3.5 text-[#10B981]" />
                <span>ECOSSISTEMA MULTICANAL DE UTILIDADE PÚBLICA</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>4. Canais de Divulgação & Parcerias Institucionais</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8] max-w-3xl leading-relaxed">
                Modelo estruturado para disseminação do Boletim IEC em diferentes mídias e pontos de
                contato da cidade.{' '}
                <strong className="text-white">
                  Enquadramento Institucional: quem comunica e despacha os avisos é o ÓRGÃO
                  MUNICIPAL
                </strong>
                ; a Orbis UOS fornece o dado inercial físico protocolado e a inteligência de
                processamento.
              </p>
            </div>

            <span className="text-xs font-mono font-bold text-[#38BDF8] bg-[#38BDF8]/15 px-3 py-1.5 rounded border border-[#38BDF8]/30 shrink-0">
              Protocolo B2G • Fé Pública Digital
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CANAIS_COMUNICACAO_ORGAO.map((canal) => {
              const iconMap: Record<string, any> = {
                monitor: Monitor,
                radio: Radio,
                tv: Tv,
                smartphone: Smartphone,
              }
              const IconComp = iconMap[canal.icone] || Monitor

              return (
                <div
                  key={canal.id}
                  className="p-5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] hover:border-[#38BDF8]/50 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-[#101B3A] border border-[#1A2A5A] text-[#38BDF8]">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{canal.nomeCanal}</h3>
                          <p className="text-[11px] text-[#94A3B8]">{canal.subtitulo}</p>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101B3A] text-[#60A5FA] border border-[#1A2A5A]">
                        {canal.formato.split(' ')[0]}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">
                        Texto Sugerido Pronto:
                      </span>
                      <div className="p-3 rounded-lg bg-[#101B3A] border border-[#1A2A5A] font-mono text-xs text-[#CBD5E1] whitespace-pre-line leading-relaxed relative group">
                        {canal.exemploTextoPronto}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#1A2A5A] flex items-center justify-between gap-2">
                    <p className="text-[11px] text-[#94A3B8] leading-tight">
                      {canal.enquadramentoInstitucional}
                    </p>
                    {canal.id === 'pmv' && (
                      <button
                        type="button"
                        onClick={() => handleCopyPmv(canal.exemploTextoPronto)}
                        className="px-2.5 py-1 rounded bg-[#3B82F6]/20 hover:bg-[#3B82F6]/30 text-xs font-bold text-[#38BDF8] border border-[#3B82F6]/40 flex items-center gap-1 shrink-0 transition-all"
                      >
                        {copiedPmv ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedPmv ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ===================================================================
            SEÇÃO 5: MODELO DE RELEASE PARA IMPRENSA (Template Pronto para Copiar)
           =================================================================== */}
        <section
          id="release-imprensa"
          className="bg-[#101B3A] border border-[#1A2A5A] rounded-2xl p-5 sm:p-7 space-y-6 shadow-xl"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#1A2A5A]">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#60A5FA] bg-[#60A5FA]/15 px-2.5 py-0.5 rounded border border-[#60A5FA]/30">
                <FileText className="w-3.5 h-3.5 text-[#60A5FA]" />
                <span>ASSESSORIA DE IMPRENSA & RELAÇÕES PÚBLICAS MUNICIPAIS</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>5. Modelo de Release Oficial para Imprensa</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8] max-w-3xl leading-relaxed">
                Template pronto para a assessoria de comunicação do município disparar para jornais,
                portais e emissoras de TV/rádio. Acompanha selo LGPD obrigatório e citação padrão de
                porta-voz de trânsito.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyRelease}
              className="px-4 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-[#3B82F6]/25 shrink-0"
            >
              {copiedRelease ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Release Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-white" />
                  <span>Copiar Release Completo</span>
                </>
              )}
            </button>
          </div>

          {/* Pré-visualização do Release Formatado */}
          <div className="p-6 rounded-2xl bg-[#0A1128] border-2 border-[#1E3A8A] space-y-5 text-xs sm:text-sm leading-relaxed">
            {/* Título e Subtítulo */}
            <div className="space-y-2 border-b border-[#1A2A5A] pb-4">
              <span className="text-[10px] font-mono text-[#10B981] font-bold uppercase tracking-wider block">
                SUGESTÃO DE PAUTA • UTILIDADE PÚBLICA MUNICIPAL
              </span>
              <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                {releaseTemplate.titulo}
              </h3>
              <p className="text-xs sm:text-sm text-[#38BDF8] font-medium leading-relaxed">
                {releaseTemplate.subtitulo}
              </p>
            </div>

            {/* Lead */}
            <div className="text-[#CBD5E1] space-y-2">
              <p>{releaseTemplate.lead}</p>
            </div>

            {/* Citação do Porta-Voz */}
            <div className="p-4 rounded-xl bg-[#101B3A] border-l-4 border-[#3B82F6] text-[#F8FAFC] italic">
              <span className="font-semibold text-xs text-[#60A5FA] block not-italic mb-1">
                Declaração de Engenharia de Trânsito:
              </span>
              {releaseTemplate.citacaoPortavozPadrao}
            </div>

            {/* Dados e Janelas Críticas */}
            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-2 font-mono text-xs text-[#CBD5E1] whitespace-pre-line">
              {releaseTemplate.dadosTabelaTexto}
            </div>

            {/* Selo LGPD e Tipagem */}
            <div className="pt-3 border-t border-[#1A2A5A] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#94A3B8]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>{releaseTemplate.rodapeInstitucionalLgpd}</span>
              </div>
              <span className="text-[10px] font-mono text-[#F59E0B] shrink-0">
                Tipagem: Fato (Acelerometria) + Projeção (Estimativas)
              </span>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SEÇÃO 6: ÂNGULO SAÚDE & COMPORTAMENTO (Fato vs Hipótese a Validar)
           =================================================================== */}
        <section
          id="saude-comportamento"
          className="bg-[#101B3A] border border-[#1A2A5A] rounded-2xl p-5 sm:p-7 space-y-6 shadow-xl"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#1A2A5A]">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#EC4899] bg-[#EC4899]/15 px-2.5 py-0.5 rounded border border-[#EC4899]/30">
                <HeartPulse className="w-3.5 h-3.5 text-[#EC4899]" />
                <span>SAÚDE PÚBLICA, ERGONOMIA & BEM-ESTAR COLETIVO</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>6. Ângulo Saúde & Comportamento</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8] max-w-3xl leading-relaxed">
                A conexão direta entre a física do movimento e a saúde do condutor e da sociedade.
                Mantendo a honestidade tipada rigorosa da plataforma: separamos fatos científicos
                comprovados das hipóteses que serão validadas em campo com os pilotos municipais.
              </p>
            </div>

            <span className="text-xs font-mono font-bold text-[#F59E0B] bg-[#F59E0B]/15 px-3 py-1.5 rounded border border-[#F59E0B]/30 shrink-0">
              Honestidade Tipada Rigorosa
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bloco FATO */}
            <div className="p-5 rounded-xl bg-[#0A1128] border-2 border-[#10B981]/50 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#10B981] bg-[#10B981]/15 px-2.5 py-1 rounded border border-[#10B981]/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>FATO COMPROVADO (BIOMECÂNICA & SINISTRALIDADE)</span>
                </span>
                <span className="text-[10px] font-mono text-[#CBD5E1]">Evidência Física</span>
              </div>

              <h3 className="text-base font-bold text-white">
                Frenagens bruscas e estresse inercial elevam exponencialmente o risco de colisão e o
                desgaste físico
              </h3>

              <ul className="space-y-2.5 text-xs text-[#CBD5E1] leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-[#10B981] font-bold">•</span>
                  <span>
                    <b>Risco de Colisão Traseira:</b> Desacelerações acima de 0,40g reduzem o tempo
                    de reação do veículo de trás a frações de segundo, sendo a causa primária de
                    engavetamentos urbanos.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#10B981] font-bold">•</span>
                  <span>
                    <b>Impacto Ergonômico no Condutor:</b> A força inercial repetida tenciona a
                    musculatura cervical e lombar, aumentando a fadiga e episódios de dor crônica em
                    motoristas de ônibus e frotas urbanas.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#10B981] font-bold">•</span>
                  <span>
                    <b>Emissão de Particulados de Freio:</b> Freadas violentas aumentam o desgaste
                    de pastilhas e a dispersão de partículas finas (PM2.5) no ar respirável da via.
                  </span>
                </li>
              </ul>
            </div>

            {/* Bloco HIPÓTESE A VALIDAR */}
            <div className="p-5 rounded-xl bg-[#0A1128] border-2 border-[#F59E0B]/50 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F59E0B] bg-[#F59E0B]/15 px-2.5 py-1 rounded border border-[#F59E0B]/30 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>HIPÓTESE A VALIDAR EM CAMPO</span>
                </span>
                <span className="text-[10px] font-mono text-[#F59E0B]">Modelo Calibrável</span>
              </div>

              <h3 className="text-base font-bold text-white">
                A redução do índice IEC da frota municipal correlaciona-se com menores afastamentos
                por estresse
              </h3>

              <ul className="space-y-2.5 text-xs text-[#CBD5E1] leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-[#F59E0B] font-bold">•</span>
                  <span>
                    <b>Indicador de Bem-Estar da Frota:</b> Hipótese de que frotas com IEC
                    predominantemente verde/ciano apresentam menor taxa de absenteísmo por síndrome
                    de burnout e hipertensão.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F59E0B] font-bold">•</span>
                  <span>
                    <b>Comportamento por Nudge Preventivo:</b> Validar se alertas de rádio e PMV
                    geram uma mudança voluntária sustentada de velocidade no entorno escolar sem
                    necessidade de blitz punitiva.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F59E0B] font-bold">•</span>
                  <span>
                    <b>Status Atual:</b> Rótulo permanente de hipótese em validação no piloto CPSI
                    da Lei Complementar 182/2021.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Rodapé da Página com Links Institucionais */}
        <div className="p-6 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">
              Deseja simular o cálculo do IEC com parâmetros manuais ou inspecionar a fórmula?
            </h4>
            <p className="text-xs text-[#94A3B8]">
              Acesse o simulador interativo na demonstração guiada ou leia o capítulo metodológico
              completo do Motor ORBIS DSP.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <Link
              to="/demo"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] transition-all flex items-center gap-1.5"
            >
              <span>Simulador no /demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/metodologia"
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#CBD5E1] hover:text-white bg-[#101B3A] border border-[#1A2A5A] hover:border-[#38BDF8] transition-all"
            >
              Metodologia Científica
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
