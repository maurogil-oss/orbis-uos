import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Shield,
  Lock,
  Building,
  Route,
  Bus,
  Coins,
  HeartPulse,
  Compass,
  ArrowRight,
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Share2,
  Info,
  Clock,
  Sparkles,
  Loader2,
  Check,
} from 'lucide-react'
import {
  Bloco1Data,
  Bloco2Data,
  Bloco3Data,
  Bloco4Data,
  Bloco5Data,
  Bloco6Data,
  calculateDiagnosticoInstitucional,
  DiagnosticResult,
  getPorteFromPop,
} from '@/lib/diagnostics/institutionScore'
import {
  generateEnquadramentoSaidas,
  EnquadramentoSaidas,
} from '@/lib/diagnostics/outputsGenerator'
import { computeSha256, generateIntegrityProtocol } from '@/lib/diagnostics/pdfReport'
import {
  saveBlocoProgress,
  getEnquadramentoByProtocolo,
  EnquadramentoRecord,
} from '@/services/enquadramento'
import { getFederalDataByIbge, SiconfiFederalSummary } from '@/services/siconfi'
import { useAuth } from '@/contexts/AuthContext'
import {
  LogOut,
  UserCheck,
  Calendar,
  CheckSquare,
  Scale,
  AlertOctagon,
  HelpCircle,
} from 'lucide-react'
import { getTrilhaPorFaixa, TrilhaFaixaConfig } from '@/lib/diagnostics/trilhasFaixa'
import {
  gerarPlanoSaldoRepresado,
  PlanoSaldoRepresadoResult,
} from '@/lib/diagnostics/planoSaldoRepresado'
import {
  obterFontesAlternativasCusteio,
  FontesAlternativasResult,
} from '@/lib/diagnostics/fontesAlternativas'
import { DossieJuridicoModal } from '@/components/DossieJuridicoModal'

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

export default function Enquadramento() {
  const { user, logout } = useAuth()
  const [searchParams] = useSearchParams()
  const initialIbge = searchParams.get('ibge') || '4106902'
  const initialMuni = searchParams.get('muni') || 'Curitiba'
  const initialUf = searchParams.get('uf') || 'PR'

  // Bloco ativo (1 a 6) ou 7 (Relatório Final)
  const [activeStep, setActiveStep] = useState<number>(1)
  const [protocolo, setProtocolo] = useState<string>('')
  const [autoSaving, setAutoSaving] = useState<boolean>(false)
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null)
  const [pdfGenerating, setPdfGenerating] = useState<boolean>(false)
  const [federalData, setFederalData] = useState<SiconfiFederalSummary | null>(null)
  const [showDossieModal, setShowDossieModal] = useState<boolean>(false)

  // BLOCO 1
  const [b1, setB1] = useState<Bloco1Data>({
    municipio: initialMuni,
    uf: initialUf,
    populacao_ibge: 1871789,
    codigo_ibge: initialIbge,
    cnpj_municipio: '76.417.005/0001-86',
    prefeito_nome: 'Prefeito(a) Municipal',
    secretario_mobilidade_nome: 'Secretário(a) de Mobilidade Urbana',
    secretario_mobilidade_email: 'mobilidade@curitiba.pr.gov.br',
    secretario_mobilidade_whatsapp: '(41) 98877-6655',
    secretario_obras_nome: 'Secretário(a) de Obras Públicas',
    secretario_obras_email: 'obras@curitiba.pr.gov.br',
    secretario_obras_whatsapp: '(41) 98877-1122',
    secretario_financas_nome: 'Secretário(a) de Planejamento e Finanças',
    secretario_financas_email: 'financas@curitiba.pr.gov.br',
    secretario_financas_whatsapp: '(41) 98877-3344',
    status_municipalizacao: 'proprio_estruturado',
    nome_orgao_gestor: 'URBS / SETRAN',
    estrutura_secretarial: 'completa',
  })

  // BLOCO 2
  const [b2, setB2] = useState<Bloco2Data>({
    extensao_total_km: 4600,
    pavimentada_cbuq_km: 3850,
    alvenaria_paralelepipedo_km: 420,
    solo_natural_saibro_km: 330,
    malha_cicloviaria_km: 260,
    orcamento_anual_pavimentacao: 185000000,
    modelo_auditoria: 'vistorias_manuais',
    pontos_criticos_drenagem_qtd: 28,
  })

  // BLOCO 3
  const [b3, setB3] = useState<Bloco3Data>({
    onibus_total: 1250,
    onibus_operacao: 'concessionaria',
    onibus_empresas: 'Consórcio Transbus, Auto Viação Redentor',
    onibus_terminais_bordo: 'sim',
    coleta_caminhoes_diarios: 140,
    coleta_operacao: 'terceirizada',
    coleta_previsao_contratual_telemetria: true,
    guarda_municipal_viaturas: 85,
    fiscais_transito_viaturas: 42,
    ambulancias_samu: 35,
    cobertura_territorial_estimada: 88,
  })

  // BLOCO 4
  const [b4, setB4] = useState<Bloco4Data>({
    fundo_transito_ativo_conta_especifica: true,
    arrecadacao_anual_multas_faixa: 'acima_referencia',
    arrecadacao_anual_multas_valor: 68000000,
    saldo_caixa_vinculado_art320: 14200000,
    pct_aplicado_engenharia_sinalizacao: 52,
    situacao_tce: 'aprovado_sem_ressalvas',
  })

  // BLOCO 5
  const [b5, setB5] = useState<Bloco5Data>({
    sinistros_ultimo_ano: 4820,
    obitos_ultimo_ano: 168,
    feridos_graves_hospitalizados: 1140,
    distribuicao_modal: {
      pct_motos: 48,
      pct_pedestres: 24,
      pct_ciclistas: 6,
      pct_auto: 18,
      pct_coletivo_caminhoes: 4,
      conhecida: true,
      parcial: false,
    },
    meta_reducao_pactuada: 'sim',
    meta_reducao_pct: 50,
    fontes_registro: {
      bopm_sinesp: true,
      guarda_municipal: true,
      samu_siate: true,
      sim_datasus: true,
      comite_vida_transito: true,
    },
  })

  // BLOCO 6
  const [b6, setB6] = useState<Bloco6Data>({
    inventario_top10_georreferenciado: true,
    zonas_velocidade_30: 'amplamente',
    velocidade_maxima_arteriais: '60',
    faixas_fiscalizacao_eletronica: 140,
    custo_trauma_sus: {
      internacoes_mensais: 95,
      custo_medio_diario_uti: 2850,
      tempo_medio_dias: 9,
    },
    comite_intersetorial: 'formalizado_decreto',
    comite_decreto_numero: 'Decreto Municipal nº 1.482/2021',
  })

  // Inicialização do Protocolo de Integridade
  useEffect(() => {
    const prot = generateIntegrityProtocol(b1.municipio, b1.uf)
    setProtocolo(prot)

    // Buscar dados SICONFI no background
    getFederalDataByIbge(b1.codigo_ibge, getPorteFromPop(b1.populacao_ibge))
      .then((data) => setFederalData(data))
      .catch((err) => console.warn('Erro ao carregar dados SICONFI:', err))
  }, [])

  // Diagnóstico Institucional e Saídas em Tempo Real
  const diagResult: DiagnosticResult = calculateDiagnosticoInstitucional({
    porte: getPorteFromPop(b1.populacao_ibge),
    b1,
    b2,
    b3,
    b4,
    b5,
    b6,
  })

  const saidasResult: EnquadramentoSaidas = generateEnquadramentoSaidas(b1, b2, b3, b4, b5, b6)

  // Trilha de Saída por Faixa (Roteiro cronológico)
  const trilhaFaixa: TrilhaFaixaConfig = getTrilhaPorFaixa(diagResult.classificacao.faixa)

  // Plano de Aplicação de Saldo Represado (disparado quando flag TCE acende ou saldo informado)
  const isFlagTceAtivo =
    b4.situacao_tce === 'apontamento_ressalva' || (b4.saldo_caixa_vinculado_art320 || 0) > 0
  const planoSaldoRepresado: PlanoSaldoRepresadoResult = gerarPlanoSaldoRepresado({
    municipio: b1.municipio,
    uf: b1.uf,
    saldoRepresado: b4.saldo_caixa_vinculado_art320 || 850000,
    arrecadacaoAnual: b4.arrecadacao_anual_multas_valor,
    populacao: b1.populacao_ibge,
  })

  // Fontes alternativas de custeio para municípios não municipalizados ou expansão
  const isNaoMunicipalizado = b1.status_municipalizacao === 'nao_municipalizado'
  const fontesAlternativas: FontesAlternativasResult = obterFontesAlternativasCusteio({
    municipio: b1.municipio,
    uf: b1.uf,
    isNaoMunicipalizado,
    valorSiconfiTransporte: federalData?.despesasTransporte?.reduce((a, b) => a + b.valor, 0),
    valorSiconfiUrbanismo: federalData?.despesasUrbanismo?.reduce((a, b) => a + b.valor, 0),
  })

  // Auto-Save por bloco
  const handleSaveCurrentBloco = async (stepToSave: number = activeStep) => {
    if (!protocolo) return
    setAutoSaving(true)
    try {
      await saveBlocoProgress(
        protocolo,
        stepToSave,
        stepToSave === 1
          ? b1
          : stepToSave === 2
            ? b2
            : stepToSave === 3
              ? b3
              : stepToSave === 4
                ? b4
                : stepToSave === 5
                  ? b5
                  : b6,
        {
          municipio: b1.municipio,
          uf: b1.uf,
          codigo_ibge: b1.codigo_ibge,
          porte: diagResult.porte_identificado,
        },
        { b1, b2, b3, b4, b5, b6 },
      )
      setLastSavedTime(
        new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      )
    } catch (err) {
      console.warn('Erro no salvamento automático:', err)
    } finally {
      setAutoSaving(false)
    }
  }

  const nextStep = () => {
    handleSaveCurrentBloco(activeStep)
    if (activeStep < 7) {
      setActiveStep(activeStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Gera o PDF oficial do relatório de enquadramento
  const handleDownloadPdf = async () => {
    setPdfGenerating(true)
    try {
      // Cálculo do hash SHA-256 do enquadramento
      const hash = await computeSha256({
        protocolo,
        municipio: b1.municipio,
        uf: b1.uf,
        codigo_ibge: b1.codigo_ibge,
        score: diagResult.score_total,
        classificacao: diagResult.classificacao.titulo,
        data: new Date().toISOString(),
      })

      // Gerar documento em formato HTML imprimível para PDF de alta fidelidade
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Relatório de Enquadramento Institucional - ${b1.municipio}/${b1.uf}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0F172A; margin: 30px; line-height: 1.5; font-size: 13px; }
              .header { border-bottom: 2px solid #0F172A; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
              .title { font-size: 20px; font-weight: 800; text-transform: uppercase; margin: 0; color: #1E3A8A; }
              .protocolo { font-family: monospace; font-size: 11px; color: #475569; }
              .seal { background: #FEF3C7; border: 1px solid #D97706; padding: 8px 12px; border-radius: 6px; font-size: 11px; margin-bottom: 20px; }
              .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
              .card { border: 1px solid #CBD5E1; border-radius: 6px; padding: 12px; }
              .score-box { background: #F1F5F9; text-align: center; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
              .score-num { font-size: 38px; font-weight: 900; color: #1E3A8A; font-family: monospace; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
              th, td { border: 1px solid #CBD5E1; padding: 6px 8px; text-align: left; }
              th { background: #F8FAFC; }
              .hash-box { background: #0F172A; color: #38BDF8; font-family: monospace; font-size: 10px; padding: 10px; border-radius: 4px; word-break: break-all; margin-top: 25px; }
              .footer { margin-top: 30px; border-top: 1px solid #E2E8F0; padding-top: 10px; font-size: 10px; color: #64748B; text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1 class="title">Relatório Oficial de Enquadramento Institucional</h1>
                <div style="font-size: 14px; font-weight: bold; margin-top: 4px;">ORBIS.UOS • Piloto CPSI (LC 182/2021)</div>
              </div>
              <div style="text-align: right;">
                <div class="protocolo">PROTOCOLO: ${protocolo}</div>
                <div class="protocolo">EMISSÃO: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}</div>
                <div class="protocolo">STATUS: DOCUMENTO NÃO PÚBLICO</div>
              </div>
            </div>

            <div class="seal">
              <b>TRATAMENTO SIGILOSO & BASE LEGAL DECLARADA:</b> Este documento destina-se exclusivamente ao Gabinete do Prefeito(a), Procuradoria-Geral do Município (PGM) e Secretarias Municipais competentes para fins de planejamento do Contrato Público para Solução Inovadora (LC 182/2021).
            </div>

            <div class="grid-2">
              <div class="card">
                <b>1. IDENTIFICAÇÃO DO ENTE PÚBLICO</b><br>
                Município: ${b1.municipio} / ${b1.uf}<br>
                Código IBGE: ${b1.codigo_ibge} | CNPJ: ${b1.cnpj_municipio || 'Não declarado'}<br>
                População IBGE: ${b1.populacao_ibge.toLocaleString('pt-BR')} habitantes (${diagResult.porte_identificado.toUpperCase()})<br>
                Prefeito(a): ${b1.prefeito_nome || 'Gabinete do Prefeito'}<br>
                Órgão Gestor do Trânsito: ${b1.nome_orgao_gestor || 'Órgão Próprio'} (Art. 24 CTB: ${b1.status_municipalizacao})
              </div>

              <div class="card">
                <b>2. RESULTADO DO DIAGNÓSTICO INSTITUCIONAL</b><br>
                <div class="score-box" style="margin: 6px 0; padding: 8px;">
                  <span class="score-num">${diagResult.score_total}</span> / 100 pts<br>
                  <b>${diagResult.classificacao.titulo}</b> (${diagResult.classificacao.descricao})
                </div>
                Detalhamento dos Pesos: B1: ${diagResult.score_b1}/10 | B2: ${diagResult.score_b2}/20 | B3: ${diagResult.score_b3}/25 | B4: ${diagResult.score_b4}/20 | B5: ${diagResult.score_b5}/10 | B6: ${diagResult.score_b6}/15
              </div>
            </div>

            <h3>3. AS 4 SAÍDAS ESTRATÉGICAS AUTOMÁTICAS</h3>

            <div class="card" style="margin-bottom: 12px; background: #F8FAFC;">
              <b>TRILHA DE SAÍDA INSTITUCIONAL (${trilhaFaixa.tituloFaixa}):</b><br>
              ${trilhaFaixa.passos
                .map(
                  (p) =>
                    `• <b>${p.ano} — ${p.titulo}:</b> ${p.descricao} (Base Legal: ${p.baseLegal})<br>`,
                )
                .join('')}
            </div>

            ${
              isFlagTceAtivo
                ? `
            <div class="card" style="margin-bottom: 12px; border-left: 4px solid #D97706; background: #FFFBEB;">
              <b>PLANO DE APLICAÇÃO DE SALDO REPRESADO (ART. 320 CTB & RESPOSTA TCE):</b><br>
              Saldo em Caixa Informado: R$ ${planoSaldoRepresado.saldoRepresadoInformado.toLocaleString('pt-BR')}<br>
              ${planoSaldoRepresado.cronograma
                .map(
                  (c) =>
                    `• ${c.etapa} (${c.prazoMeses}): R$ ${c.valorEstimado.toLocaleString('pt-BR')} (${c.percentualSaldo}%) — ${c.destinacaoLegal}<br>`,
                )
                .join('')}
              <small>Nexo Causal: ${planoSaldoRepresado.enquadramentoTceSumario}</small>
            </div>
            `
                : ''
            }

            <div class="card" style="margin-bottom: 12px;">
              <b>(a) DIMENSIONAMENTO DO PILOTO CPSI (30 DIAS):</b><br>
              • Veículos-sensor necessários para auditar 100% da malha: <b>${saidasResult.dimensionamentoCpsi.veiculosSensorRecomendados} veículos</b><br>
              • Distribuição sugerida: ${saidasResult.dimensionamentoCpsi.onibusAlocados} ônibus + ${saidasResult.dimensionamentoCpsi.caminhoesColetaAlocados} caminhões de coleta + ${saidasResult.dimensionamentoCpsi.viaturasAlocadas} viaturas oficiais<br>
              • Metodologia: Auditoria inercial contínua via smartphones (Fator de Confiança F ≥ 3 passagens).
            </div>

            <div class="card" style="margin-bottom: 12px;">
              <b>(b) TAXA BASELINE PNATRANS:</b><br>
              • Óbitos no último exercício: <b>${saidasResult.pnatransBaseline.obitosUltimoAno} vítimas fatais</b><br>
              • Taxa calculada por 100 mil habitantes: <b>${saidasResult.pnatransBaseline.taxaPor100kHab} óbitos/100k hab</b><br>
              • Taxa calculada por 10 mil veículos: <b>${saidasResult.pnatransBaseline.taxaPor10kVeiculos} óbitos/10k veíc</b><br>
              • Meta decenal pactuada: Redução de 50% dos óbitos até 2030 (${saidasResult.pnatransBaseline.obitosEvitaveisMeta} vidas preservadas com ações preditivas).
            </div>

            <div class="card" style="margin-bottom: 12px;">
              <b>(c) MINUTA DE EMPENHO ART. 320 CTB (FUNDO DE MULTAS):</b><br>
              • Dotação sugerida: <b>${saidasResult.minutaEmpenho.fonteRecurso}</b><br>
              • Função programática: ${saidasResult.minutaEmpenho.funcaoProgramatica}<br>
              • Amparo e Nexo Causal: ${saidasResult.minutaEmpenho.justificativaNexoCausal}<br>
              • Saldo em caixa informado no Art. 320: R$ ${b4.saldo_caixa_vinculado_art320?.toLocaleString('pt-BR') || '0,00'}
            </div>

            ${
              isNaoMunicipalizado
                ? `
            <div class="card" style="margin-bottom: 12px; border-left: 4px solid #2563EB; background: #EFF6FF;">
              <b>FONTES ALTERNATIVAS DE CUSTEIO (MUNICÍPIO NÃO MUNICIPALIZADO):</b><br>
              ${fontesAlternativas.fontes
                .slice(0, 3)
                .map(
                  (f) =>
                    `• <b>${f.titulo} (${f.esfera}):</b> ${f.descricao} (Base: ${f.baseLegal})<br>`,
                )
                .join('')}
              <small>${fontesAlternativas.orientacaoInstitucional}</small>
            </div>
            `
                : ''
            }

            <div class="card" style="margin-bottom: 12px;">
              <b>(d) MATRIZ DE PRIORIDADE ZERO (TOP PONTOS CRÍTICOS):</b>
              <table>
                <thead>
                  <tr>
                    <th>Trecho Viário Prioritário</th>
                    <th>Bairro</th>
                    <th>Criticidade Asfalto</th>
                    <th>Atropelamentos</th>
                    <th>Zona Escolar</th>
                    <th>Ação Recomendada</th>
                  </tr>
                </thead>
                <tbody>
                  ${saidasResult.matrizPrioridadeZero
                    .map(
                      (it) => `
                    <tr>
                      <td><b>${it.segmento}</b></td>
                      <td>${it.bairro}</td>
                      <td>${it.criticidadeAsfalto.toUpperCase()}</td>
                      <td>${it.historicoAtropelamentos}</td>
                      <td>${it.proximidadeEscola ? 'SIM' : 'NÃO'}</td>
                      <td>${it.acaoRecomendada}</td>
                    </tr>
                  `,
                    )
                    .join('')}
                </tbody>
              </table>
            </div>

            <div class="hash-box">
              HASH CRIPTOGRÁFICO DE INTEGRIDADE (SHA-256):<br>
              ${hash}
            </div>

            <div class="footer">
              ORBIS.UOS • Urban Operating System • Metodologia Homologada Versão 1.0 (2025) • Documento com fé pública digital amparado na Lei 14.063/2020.
            </div>
          </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => {
          printWindow.print()
        }, 500)
      }
    } catch (err) {
      console.error('Falha ao exportar PDF:', err)
    } finally {
      setPdfGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070D1F] text-[#F8FAFC] pt-24 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* SELO DE SIGILO INSTITUCIONAL NO TOPO */}
        <div className="p-3.5 rounded-xl bg-[#FEF3C7]/10 border border-[#F59E0B]/40 text-[#F59E0B] text-xs flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 shrink-0 text-[#F59E0B]" />
            <span>
              <b>TRATAMENTO SIGILOSO • BASE LEGAL DECLARADA:</b> Este documento não é de acesso
              público externo. Amparo no Art. 27 da LC 182/2021 e Lei 14.129/2021 (Governo Digital).
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] text-[#CBD5E1]">
            <span>Protocolo:</span>
            <span className="text-[#F8FAFC] font-bold bg-black/40 px-2 py-0.5 rounded border border-white/10">
              {protocolo || 'GERANDO...'}
            </span>
          </div>
        </div>

        {/* Identidade do Usuário Logado & Botão Sair */}
        {user && (
          <div className="p-3 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#10B981]">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[#F8FAFC]">{user.name}</span>
                <span className="text-[#94A3B8] ml-2">({user.email})</span>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="px-3 py-1.5 rounded-lg bg-[#0A1128] border border-[#1A2A5A] hover:border-[#EF4444] text-[#EF4444] hover:text-[#F87171] font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        )}

        {/* BREADCRUMB & HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1A2A5A]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
              <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                Início
              </Link>
              <span>/</span>
              <span className="text-[#3B82F6]">Esteira de Enquadramento</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Enquadramento Institucional CPSI (6 Blocos)
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
              Município de{' '}
              <b>
                {b1.municipio}/{b1.uf}
              </b>{' '}
              • Preenchimento colaborativo intersecretarial com salvamento automático.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {lastSavedTime && (
              <span className="text-[11px] font-mono text-[#10B981] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Salvo às {lastSavedTime}
              </span>
            )}
            <button
              type="button"
              onClick={() => handleSaveCurrentBloco(activeStep)}
              disabled={autoSaving}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6] text-[#CBD5E1] flex items-center gap-1.5 transition-all"
            >
              <Save className={`w-3.5 h-3.5 ${autoSaving ? 'animate-spin text-[#3B82F6]' : ''}`} />
              <span>{autoSaving ? 'Salvando...' : 'Salvar Bloco'}</span>
            </button>
          </div>
        </div>

        {/* STEPPER DOS 6 BLOCOS + RELATÓRIO FINAL */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {[
            { num: 1, label: 'Identificação', icon: Building },
            { num: 2, label: 'Malha Viária', icon: Route },
            { num: 3, label: 'Frota-Sensor', icon: Bus },
            { num: 4, label: 'Cap. Financeira', icon: Coins },
            { num: 5, label: 'PNATRANS', icon: HeartPulse },
            { num: 6, label: 'Visão Zero', icon: Compass },
            { num: 7, label: 'Relatório Oficial', icon: FileText },
          ].map((step) => {
            const Icon = step.icon
            const isActive = activeStep === step.num
            const isCompleted = activeStep > step.num
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => {
                  handleSaveCurrentBloco(activeStep)
                  setActiveStep(step.num)
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-white shadow-lg shadow-[#3B82F6]/20'
                    : isCompleted
                      ? 'bg-[#10B981]/10 border-[#10B981]/40 text-[#A7F3D0]'
                      : 'bg-[#101B3A] border-[#1A2A5A] text-[#94A3B8] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold uppercase">
                    Bloco {step.num === 7 ? 'PDF' : step.num}
                  </span>
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  ) : (
                    <Icon className="w-3.5 h-3.5 text-current opacity-70" />
                  )}
                </div>
                <span className="text-xs font-bold block truncate">{step.label}</span>
              </button>
            )
          })}
        </div>

        {/* CORPO DO FORMULÁRIO MULTI-ETAPAS */}
        <div className="bg-[#101B3A] border border-[#1A2A5A] rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          {/* ========================================================================= */}
          {/* BLOCO 1 — IDENTIFICAÇÃO INSTITUCIONAL */}
          {/* ========================================================================= */}
          {activeStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-[#1A2A5A] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-[#F8FAFC]">
                    Bloco 1 — Identificação Institucional & Triunvirato de Gestão
                  </h2>
                  <p className="text-xs text-[#94A3B8]">
                    Mapeamento das secretarias envolvidas (Mobilidade, Obras, Finanças) e amparo do
                    Art. 24 do CTB
                  </p>
                </div>
                <span className="text-xs font-mono text-[#3B82F6] bg-[#3B82F6]/10 px-2.5 py-1 rounded border border-[#3B82F6]/30 font-bold">
                  Peso B1: 10% (10 pts)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                    Município
                  </label>
                  <input
                    type="text"
                    value={b1.municipio}
                    onChange={(e) => setB1({ ...b1, municipio: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-sm text-[#F8FAFC]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">UF</label>
                  <select
                    value={b1.uf}
                    onChange={(e) => setB1({ ...b1, uf: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-sm text-[#F8FAFC]"
                  >
                    {ESTADOS_BRASIL.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                    Código IBGE
                  </label>
                  <input
                    type="text"
                    value={b1.codigo_ibge}
                    onChange={(e) => setB1({ ...b1, codigo_ibge: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-sm text-[#F8FAFC] font-mono"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                    População IBGE
                  </label>
                  <input
                    type="number"
                    value={b1.populacao_ibge || ''}
                    onChange={(e) => setB1({ ...b1, populacao_ibge: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-sm text-[#F8FAFC] font-mono"
                  />
                </div>
              </div>

              {/* CNPJ e Prefeito */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                    CNPJ da Prefeitura
                  </label>
                  <input
                    type="text"
                    value={b1.cnpj_municipio || ''}
                    onChange={(e) => setB1({ ...b1, cnpj_municipio: e.target.value })}
                    placeholder="00.000.000/0001-00"
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-sm text-[#F8FAFC] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                    Prefeito(a) Municipal
                  </label>
                  <input
                    type="text"
                    value={b1.prefeito_nome || ''}
                    onChange={(e) => setB1({ ...b1, prefeito_nome: e.target.value })}
                    placeholder="Nome completo do mandatário"
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-sm text-[#F8FAFC]"
                  />
                </div>
              </div>

              {/* Triade Secretarial: Mobilidade, Obras e Finanças */}
              <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-4">
                <h4 className="text-xs font-mono uppercase font-bold text-[#3B82F6]">
                  A Tríade de Gestão Intersecretarial
                </h4>

                {/* Secretário de Mobilidade */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#94A3B8] mb-1">
                      Sec. Mobilidade / Trânsito
                    </label>
                    <input
                      type="text"
                      value={b1.secretario_mobilidade_nome || ''}
                      onChange={(e) => setB1({ ...b1, secretario_mobilidade_nome: e.target.value })}
                      placeholder="Nome do(a) Secretário(a)"
                      className="w-full h-9 px-2.5 rounded bg-[#101B3A] border border-[#1A2A5A] text-xs text-[#F8FAFC]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#94A3B8] mb-1">E-mail Oficial</label>
                    <input
                      type="email"
                      value={b1.secretario_mobilidade_email || ''}
                      onChange={(e) =>
                        setB1({ ...b1, secretario_mobilidade_email: e.target.value })
                      }
                      placeholder="mobilidade@municipio.gov.br"
                      className="w-full h-9 px-2.5 rounded bg-[#101B3A] border border-[#1A2A5A] text-xs text-[#F8FAFC]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#94A3B8] mb-1">
                      WhatsApp Institucional
                    </label>
                    <input
                      type="text"
                      value={b1.secretario_mobilidade_whatsapp || ''}
                      onChange={(e) =>
                        setB1({ ...b1, secretario_mobilidade_whatsapp: e.target.value })
                      }
                      placeholder="(XX) XXXXX-XXXX"
                      className="w-full h-9 px-2.5 rounded bg-[#101B3A] border border-[#1A2A5A] text-xs text-[#F8FAFC] font-mono"
                    />
                  </div>
                </div>

                {/* Secretário de Obras */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#94A3B8] mb-1">
                      Sec. Obras Públicas / Serviços
                    </label>
                    <input
                      type="text"
                      value={b1.secretario_obras_nome || ''}
                      onChange={(e) => setB1({ ...b1, secretario_obras_nome: e.target.value })}
                      placeholder="Nome do(a) Secretário(a)"
                      className="w-full h-9 px-2.5 rounded bg-[#101B3A] border border-[#1A2A5A] text-xs text-[#F8FAFC]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#94A3B8] mb-1">E-mail Oficial</label>
                    <input
                      type="email"
                      value={b1.secretario_obras_email || ''}
                      onChange={(e) => setB1({ ...b1, secretario_obras_email: e.target.value })}
                      placeholder="obras@municipio.gov.br"
                      className="w-full h-9 px-2.5 rounded bg-[#101B3A] border border-[#1A2A5A] text-xs text-[#F8FAFC]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#94A3B8] mb-1">
                      WhatsApp Institucional
                    </label>
                    <input
                      type="text"
                      value={b1.secretario_obras_whatsapp || ''}
                      onChange={(e) => setB1({ ...b1, secretario_obras_whatsapp: e.target.value })}
                      placeholder="(XX) XXXXX-XXXX"
                      className="w-full h-9 px-2.5 rounded bg-[#101B3A] border border-[#1A2A5A] text-xs text-[#F8FAFC] font-mono"
                    />
                  </div>
                </div>

                {/* Secretário de Finanças */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#94A3B8] mb-1">
                      Sec. Finanças / Fazenda
                    </label>
                    <input
                      type="text"
                      value={b1.secretario_financas_nome || ''}
                      onChange={(e) => setB1({ ...b1, secretario_financas_nome: e.target.value })}
                      placeholder="Nome do(a) Secretário(a)"
                      className="w-full h-9 px-2.5 rounded bg-[#101B3A] border border-[#1A2A5A] text-xs text-[#F8FAFC]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#94A3B8] mb-1">E-mail Oficial</label>
                    <input
                      type="email"
                      value={b1.secretario_financas_email || ''}
                      onChange={(e) => setB1({ ...b1, secretario_financas_email: e.target.value })}
                      placeholder="fazenda@municipio.gov.br"
                      className="w-full h-9 px-2.5 rounded bg-[#101B3A] border border-[#1A2A5A] text-xs text-[#F8FAFC]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#94A3B8] mb-1">
                      WhatsApp Institucional
                    </label>
                    <input
                      type="text"
                      value={b1.secretario_financas_whatsapp || ''}
                      onChange={(e) =>
                        setB1({ ...b1, secretario_financas_whatsapp: e.target.value })
                      }
                      placeholder="(XX) XXXXX-XXXX"
                      className="w-full h-9 px-2.5 rounded bg-[#101B3A] border border-[#1A2A5A] text-xs text-[#F8FAFC] font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Status de Municipalização e Órgão */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                    Municipalização do Trânsito (Art. 24 CTB)
                  </label>
                  <select
                    value={b1.status_municipalizacao}
                    onChange={(e: any) => setB1({ ...b1, status_municipalizacao: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-xs text-[#F8FAFC]"
                  >
                    <option value="proprio_estruturado">Próprio estruturado (6 pts)</option>
                    <option value="em_processo">Em processo de municipalização (3 pts)</option>
                    <option value="nao_municipalizado">
                      Não municipalizado (0 pt + flag de enquadramento estadual)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                    Nome do Órgão Gestor de Trânsito
                  </label>
                  <input
                    type="text"
                    value={b1.nome_orgao_gestor || ''}
                    onChange={(e) => setB1({ ...b1, nome_orgao_gestor: e.target.value })}
                    placeholder="Ex: SETRAN, URBS, BHTRANS, EPTC"
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-xs text-[#F8FAFC]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* BLOCO 2 — MALHA VIÁRIA */}
          {/* ========================================================================= */}
          {activeStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-[#1A2A5A] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-[#F8FAFC]">
                    Bloco 2 — Malha Viária Urbana & Pavimento
                  </h2>
                  <p className="text-xs text-[#94A3B8]">
                    Tipologia de pavimentos, extensão auditável e modelo atual de fiscalização
                  </p>
                </div>
                <span className="text-xs font-mono text-[#3B82F6] bg-[#3B82F6]/10 px-2.5 py-1 rounded border border-[#3B82F6]/30 font-bold">
                  Peso B2: 20% (20 pts)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                    Extensão Total (km)
                  </label>
                  <input
                    type="number"
                    value={b2.extensao_total_km || ''}
                    onChange={(e) => setB2({ ...b2, extensao_total_km: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-sm text-[#F8FAFC] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                    CBUQ / Concreto (km)
                  </label>
                  <input
                    type="number"
                    value={b2.pavimentada_cbuq_km || ''}
                    onChange={(e) => setB2({ ...b2, pavimentada_cbuq_km: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-sm text-[#F8FAFC] font-mono"
                  />
                  <span className="text-[10px] text-[#94A3B8]">Pavimento flexível/rígido</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                    Paralelepípedo / Paver (km)
                  </label>
                  <input
                    type="number"
                    value={b2.alvenaria_paralelepipedo_km || ''}
                    onChange={(e) =>
                      setB2({ ...b2, alvenaria_paralelepipedo_km: Number(e.target.value) })
                    }
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-sm text-[#F8FAFC] font-mono"
                  />
                  <span className="text-[10px] text-[#10B981]">Conta como auditável</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                    Solo Natural / Saibro (km)
                  </label>
                  <input
                    type="number"
                    value={b2.solo_natural_saibro_km || ''}
                    onChange={(e) =>
                      setB2({ ...b2, solo_natural_saibro_km: Number(e.target.value) })
                    }
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-sm text-[#F8FAFC] font-mono"
                  />
                  <span className="text-[10px] text-[#94A3B8]">Sem pavimentação</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                    Malha Cicloviária (km)
                  </label>
                  <input
                    type="number"
                    value={b2.malha_cicloviaria_km || ''}
                    onChange={(e) => setB2({ ...b2, malha_cicloviaria_km: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-sm text-[#F8FAFC] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                    Orçamento Asfalto (R$/ano)
                  </label>
                  <input
                    type="number"
                    value={b2.orcamento_anual_pavimentacao || ''}
                    onChange={(e) =>
                      setB2({ ...b2, orcamento_anual_pavimentacao: Number(e.target.value) })
                    }
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-sm text-[#F8FAFC] font-mono"
                  />
                  <span className="text-[10px] text-[#94A3B8]">Tapa-buraco + recapeamento</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                    Pontos Críticos de Drenagem
                  </label>
                  <input
                    type="number"
                    value={b2.pontos_criticos_drenagem_qtd || ''}
                    onChange={(e) =>
                      setB2({ ...b2, pontos_criticos_drenagem_qtd: Number(e.target.value) })
                    }
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-sm text-[#F8FAFC] font-mono"
                  />
                  <span className="text-[10px] text-[#94A3B8]">Alagamentos / bueiros mapeados</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">
                  Modelo Atual de Auditoria e Vistoria do Asfalto (Selecione 1 das 4 opções)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="p-3 rounded-xl border bg-[#0A1128] border-[#1A2A5A] flex items-center gap-2 cursor-pointer hover:border-[#3B82F6]">
                    <input
                      type="radio"
                      name="modelo_auditoria"
                      value="perfilometro_periodico"
                      checked={b2.modelo_auditoria === 'perfilometro_periodico'}
                      onChange={(e: any) => setB2({ ...b2, modelo_auditoria: e.target.value })}
                    />
                    <span>
                      <b>Perfilômetro a laser periódico</b> (8 pts — padrão internacional)
                    </span>
                  </label>
                  <label className="p-3 rounded-xl border bg-[#0A1128] border-[#1A2A5A] flex items-center gap-2 cursor-pointer hover:border-[#3B82F6]">
                    <input
                      type="radio"
                      name="modelo_auditoria"
                      value="vistorias_manuais"
                      checked={b2.modelo_auditoria === 'vistorias_manuais'}
                      onChange={(e: any) => setB2({ ...b2, modelo_auditoria: e.target.value })}
                    />
                    <span>
                      <b>Vistorias manuais periódicas</b> (5 pts — engenheiros a pé/viatura)
                    </span>
                  </label>
                  <label className="p-3 rounded-xl border bg-[#0A1128] border-[#1A2A5A] flex items-center gap-2 cursor-pointer hover:border-[#3B82F6]">
                    <input
                      type="radio"
                      name="modelo_auditoria"
                      value="reativo_156"
                      checked={b2.modelo_auditoria === 'reativo_156'}
                      onChange={(e: any) => setB2({ ...b2, modelo_auditoria: e.target.value })}
                    />
                    <span>
                      <b>100% reativo via 156 / Ouvidoria</b> (2 pts — o cidadão avisa após quebrar)
                    </span>
                  </label>
                  <label className="p-3 rounded-xl border bg-[#0A1128] border-[#1A2A5A] flex items-center gap-2 cursor-pointer hover:border-[#3B82F6]">
                    <input
                      type="radio"
                      name="modelo_auditoria"
                      value="sem_metodologia"
                      checked={b2.modelo_auditoria === 'sem_metodologia'}
                      onChange={(e: any) => setB2({ ...b2, modelo_auditoria: e.target.value })}
                    />
                    <span>
                      <b>Sem metodologia definida</b> (0 pt — emergencial sem histórico)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* BLOCO 3 — FROTA-SENSOR (FATOR ZERO CAPEX) */}
          {/* ========================================================================= */}
          {activeStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-[#1A2A5A] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-[#F8FAFC]">
                    Bloco 3 — Frota-Sensor (Fator Zero CAPEX)
                  </h2>
                  <p className="text-xs text-[#94A3B8]">
                    Veículos públicos existentes para auditoria inercial contínua sem compra de
                    hardware
                  </p>
                </div>
                <span className="text-xs font-mono text-[#3B82F6] bg-[#3B82F6]/10 px-2.5 py-1 rounded border border-[#3B82F6]/30 font-bold">
                  Peso B3: 25% (25 pts)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-2">
                  <span className="text-xs font-mono uppercase text-[#3B82F6] font-bold">
                    Transporte Coletivo
                  </span>
                  <div>
                    <label className="block text-[11px] text-[#94A3B8]">
                      Total de Veículos na Frota
                    </label>
                    <input
                      type="number"
                      value={b3.onibus_total || ''}
                      onChange={(e) => setB3({ ...b3, onibus_total: Number(e.target.value) })}
                      className="w-full h-9 px-2.5 rounded bg-[#101B3A] border border-[#1A2A5A] text-xs text-[#F8FAFC] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#94A3B8]">Regime de Operação</label>
                    <select
                      value={b3.onibus_operacao}
                      onChange={(e: any) => setB3({ ...b3, onibus_operacao: e.target.value })}
                      className="w-full h-9 px-2.5 rounded bg-[#101B3A] border border-[#1A2A5A] text-xs text-[#F8FAFC]"
                    >
                      <option value="concessionaria">Concessionária privada</option>
                      <option value="propria">Operação pública própria</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#94A3B8]">
                      Possuem Terminais a Bordo / Smartphones?
                    </label>
                    <select
                      value={b3.onibus_terminais_bordo}
                      onChange={(e: any) =>
                        setB3({ ...b3, onibus_terminais_bordo: e.target.value })
                      }
                      className="w-full h-9 px-2.5 rounded bg-[#101B3A] border border-[#1A2A5A] text-xs text-[#F8FAFC]"
                    >
                      <option value="sim">Sim, 100% equipados (5 pts)</option>
                      <option value="parcial">Parcial (3 pts)</option>
                      <option value="nao">Não possuem (0 pt)</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-2">
                  <span className="text-xs font-mono uppercase text-[#10B981] font-bold">
                    Coleta de Resíduos
                  </span>
                  <div>
                    <label className="block text-[11px] text-[#94A3B8]">
                      Caminhões em Rota Diária
                    </label>
                    <input
                      type="number"
                      value={b3.coleta_caminhoes_diarios || ''}
                      onChange={(e) =>
                        setB3({ ...b3, coleta_caminhoes_diarios: Number(e.target.value) })
                      }
                      className="w-full h-9 px-2.5 rounded bg-[#101B3A] border border-[#1A2A5A] text-xs text-[#F8FAFC] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#94A3B8]">Operação</label>
                    <select
                      value={b3.coleta_operacao}
                      onChange={(e: any) => setB3({ ...b3, coleta_operacao: e.target.value })}
                      className="w-full h-9 px-2.5 rounded bg-[#101B3A] border border-[#1A2A5A] text-xs text-[#F8FAFC]"
                    >
                      <option value="terceirizada">Terceirizada</option>
                      <option value="propria">Própria municipal</option>
                    </select>
                  </div>
                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-[#CBD5E1]">
                      <input
                        type="checkbox"
                        checked={b3.coleta_previsao_contratual_telemetria}
                        onChange={(e) =>
                          setB3({ ...b3, coleta_previsao_contratual_telemetria: e.target.checked })
                        }
                      />
                      <span>Previsão contratual p/ telemetria na concessionária</span>
                    </label>
                    {!b3.coleta_previsao_contratual_telemetria &&
                      b3.coleta_operacao === 'terceirizada' && (
                        <span className="text-[10px] text-[#EF4444] block mt-1">
                          Aciona flag de barreira jurídica (termo aditivo vira pré-requisito)
                        </span>
                      )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-2">
                  <span className="text-xs font-mono uppercase text-[#F59E0B] font-bold">
                    Segurança & Emergência
                  </span>
                  <div>
                    <label className="block text-[11px] text-[#94A3B8]">
                      Guarda Municipal (Viaturas)
                    </label>
                    <input
                      type="number"
                      value={b3.guarda_municipal_viaturas || ''}
                      onChange={(e) =>
                        setB3({ ...b3, guarda_municipal_viaturas: Number(e.target.value) })
                      }
                      className="w-full h-9 px-2.5 rounded bg-[#101B3A] border border-[#1A2A5A] text-xs text-[#F8FAFC] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#94A3B8]">
                      Fiscais de Trânsito (Viaturas/Motos)
                    </label>
                    <input
                      type="number"
                      value={b3.fiscais_transito_viaturas || ''}
                      onChange={(e) =>
                        setB3({ ...b3, fiscais_transito_viaturas: Number(e.target.value) })
                      }
                      className="w-full h-9 px-2.5 rounded bg-[#101B3A] border border-[#1A2A5A] text-xs text-[#F8FAFC] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#94A3B8]">
                      Ambulâncias / SAMU Municipal
                    </label>
                    <input
                      type="number"
                      value={b3.ambulancias_samu || ''}
                      onChange={(e) => setB3({ ...b3, ambulancias_samu: Number(e.target.value) })}
                      className="w-full h-9 px-2.5 rounded bg-[#101B3A] border border-[#1A2A5A] text-xs text-[#F8FAFC] font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* BLOCO 4 — CAPACIDADE FINANCEIRA (ART. 320 CTB) */}
          {/* ========================================================================= */}
          {activeStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-[#1A2A5A] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-[#F8FAFC]">
                    Bloco 4 — Capacidade Financeira & Fundo de Multas (Art. 320 CTB)
                  </h2>
                  <p className="text-xs text-[#94A3B8]">
                    Destinação vinculada exclusiva para engenharia de tráfego e regularidade perante
                    o TCE
                  </p>
                </div>
                <span className="text-xs font-mono text-[#3B82F6] bg-[#3B82F6]/10 px-2.5 py-1 rounded border border-[#3B82F6]/30 font-bold">
                  Peso B4: 20% (20 pts)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
                  <span className="text-xs font-semibold text-[#CBD5E1] block">
                    Fundo Municipal de Trânsito Ativo com Conta Específica?
                  </span>
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="fundo_transito"
                        checked={b4.fundo_transito_ativo_conta_especifica}
                        onChange={() =>
                          setB4({ ...b4, fundo_transito_ativo_conta_especifica: true })
                        }
                      />
                      <span>Sim, conta específica (6 pts)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="fundo_transito"
                        checked={!b4.fundo_transito_ativo_conta_especifica}
                        onChange={() =>
                          setB4({ ...b4, fundo_transito_ativo_conta_especifica: false })
                        }
                      />
                      <span>Conta única / não segregada (0 pt)</span>
                    </label>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-2">
                  <label className="block text-xs font-semibold text-[#CBD5E1]">
                    Situação perante o Tribunal de Contas (TCE)
                  </label>
                  <select
                    value={b4.situacao_tce}
                    onChange={(e: any) => setB4({ ...b4, situacao_tce: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-[#101B3A] border border-[#1A2A5A] text-xs text-[#F8FAFC]"
                  >
                    <option value="aprovado_sem_ressalvas">Aprovado sem ressalvas (3 pts)</option>
                    <option value="em_analise">Em análise (2 pts)</option>
                    <option value="apontamento_ressalva">
                      Apontamento de saldo represado ou desvio (0 pt)
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                    Arrecadação Bruta de Multas (R$/ano)
                  </label>
                  <input
                    type="number"
                    value={b4.arrecadacao_anual_multas_valor || ''}
                    onChange={(e) =>
                      setB4({ ...b4, arrecadacao_anual_multas_valor: Number(e.target.value) })
                    }
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-sm text-[#F8FAFC] font-mono"
                  />
                  <span className="text-[10px] text-[#94A3B8]">
                    Ou selecione faixa se não souber exato
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                    Saldo Vinculado em Caixa (Superávit Art. 320)
                  </label>
                  <input
                    type="number"
                    value={b4.saldo_caixa_vinculado_art320 || ''}
                    onChange={(e) =>
                      setB4({ ...b4, saldo_caixa_vinculado_art320: Number(e.target.value) })
                    }
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-sm text-[#F8FAFC] font-mono"
                  />
                  <span className="text-[10px] text-[#10B981]">Fonte pagadora do piloto CPSI</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                    % Aplicado em Engenharia / Sinalização
                  </label>
                  <input
                    type="number"
                    value={b4.pct_aplicado_engenharia_sinalizacao || ''}
                    onChange={(e) =>
                      setB4({ ...b4, pct_aplicado_engenharia_sinalizacao: Number(e.target.value) })
                    }
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-sm text-[#F8FAFC] font-mono"
                  />
                  <span className="text-[10px] text-[#94A3B8]">≥50% = 4 pts | 25-49% = 3 pts</span>
                </div>
              </div>

              {/* CARD RESPOSTA INSTANTÂNEA: PLANO DE APLICAÇÃO DE SALDO REPRESADO (FLAG TCE) */}
              {(b4.situacao_tce === 'apontamento_ressalva' ||
                (b4.saldo_caixa_vinculado_art320 || 0) > 0) && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-[#101B3A] to-[#0A1128] border-2 border-[#F59E0B]/60 space-y-4 animate-fade-in shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A2A5A] pb-3">
                    <div className="flex items-center gap-2">
                      <AlertOctagon className="w-5 h-5 text-[#F59E0B] shrink-0" />
                      <div>
                        <span className="text-xs font-mono uppercase bg-[#F59E0B]/20 text-[#F59E0B] px-2 py-0.5 rounded font-bold border border-[#F59E0B]/30">
                          Resposta Imediata ao Flag TCE
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] mt-0.5">
                          Plano Estruturado de Aplicação do Saldo Represado (Art. 320 CTB)
                        </h3>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-[#10B981] font-bold">
                      R$ {planoSaldoRepresado.saldoRepresadoInformado.toLocaleString('pt-BR')} em
                      Caixa
                    </span>
                  </div>

                  <p className="text-xs text-[#CBD5E1] leading-relaxed">
                    {planoSaldoRepresado.enquadramentoTceSumario}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {planoSaldoRepresado.cronograma.map((it, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#F8FAFC]">{it.etapa}</span>
                          <span className="text-[10px] font-mono text-[#3B82F6] bg-[#3B82F6]/15 px-2 py-0.5 rounded">
                            {it.prazoMeses}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#94A3B8]">Dotação Proposta:</span>
                          <span className="font-mono text-[#10B981] font-bold">
                            R$ {it.valorEstimado.toLocaleString('pt-BR')} ({it.percentualSaldo}%)
                          </span>
                        </div>
                        <p className="text-[11px] text-[#94A3B8] leading-tight">
                          {it.vinculoPrograma}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg bg-[#070D1F] border border-[#1A2A5A] text-[11px] text-[#94A3B8] flex items-center justify-between">
                    <span>
                      <b>Amparo Contábil:</b> {planoSaldoRepresado.argumentoContabil}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* BLOCO 5 — VARIÁVEIS PNATRANS */}
          {/* ========================================================================= */}
          {activeStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-[#1A2A5A] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-[#F8FAFC]">
                    Bloco 5 — Variáveis PNATRANS & Sinistralidade Viária
                  </h2>
                  <p className="text-xs text-[#94A3B8]">
                    Taxa automática por 100 mil habitantes e meta de redução pactuada
                  </p>
                </div>
                <span className="text-xs font-mono text-[#3B82F6] bg-[#3B82F6]/10 px-2.5 py-1 rounded border border-[#3B82F6]/30 font-bold">
                  Peso B5: 10% (10 pts)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                    Total de Sinistros (ano)
                  </label>
                  <input
                    type="number"
                    value={b5.sinistros_ultimo_ano || ''}
                    onChange={(e) => setB5({ ...b5, sinistros_ultimo_ano: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-sm text-[#F8FAFC] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                    Óbitos (até 30 dias)
                  </label>
                  <input
                    type="number"
                    value={b5.obitos_ultimo_ano || ''}
                    onChange={(e) => setB5({ ...b5, obitos_ultimo_ano: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-sm text-[#F8FAFC] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                    Taxa por 100k hab (Cálculo Automático)
                  </label>
                  <div className="w-full h-10 px-3 rounded-lg bg-[#0A1128] border border-[#3B82F6]/40 text-sm text-[#3B82F6] font-mono font-bold flex items-center">
                    {saidasResult.pnatransBaseline.taxaPor100kHab} óbitos/100k
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                    Feridos Graves Hospitalizados
                  </label>
                  <input
                    type="number"
                    value={b5.feridos_graves_hospitalizados || ''}
                    onChange={(e) =>
                      setB5({ ...b5, feridos_graves_hospitalizados: Number(e.target.value) })
                    }
                    className="w-full h-10 px-3 rounded-lg bg-[#0A1128] border border-[#1A2A5A] text-sm text-[#F8FAFC] font-mono"
                  />
                </div>
              </div>

              {/* Distribuição por modal */}
              <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
                <span className="text-xs font-mono uppercase text-[#3B82F6] font-bold">
                  Distribuição de Vítimas Fatais por Modal (%)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-[#94A3B8]">% Motos</label>
                    <input
                      type="number"
                      value={b5.distribuicao_modal.pct_motos}
                      onChange={(e) =>
                        setB5({
                          ...b5,
                          distribuicao_modal: {
                            ...b5.distribuicao_modal,
                            pct_motos: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full h-8 px-2 rounded bg-[#101B3A] border border-[#1A2A5A] font-mono text-center text-[#F8FAFC]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#94A3B8]">% Pedestres</label>
                    <input
                      type="number"
                      value={b5.distribuicao_modal.pct_pedestres}
                      onChange={(e) =>
                        setB5({
                          ...b5,
                          distribuicao_modal: {
                            ...b5.distribuicao_modal,
                            pct_pedestres: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full h-8 px-2 rounded bg-[#101B3A] border border-[#1A2A5A] font-mono text-center text-[#F8FAFC]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#94A3B8]">% Ciclistas</label>
                    <input
                      type="number"
                      value={b5.distribuicao_modal.pct_ciclistas}
                      onChange={(e) =>
                        setB5({
                          ...b5,
                          distribuicao_modal: {
                            ...b5.distribuicao_modal,
                            pct_ciclistas: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full h-8 px-2 rounded bg-[#101B3A] border border-[#1A2A5A] font-mono text-center text-[#F8FAFC]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#94A3B8]">% Automóveis</label>
                    <input
                      type="number"
                      value={b5.distribuicao_modal.pct_auto}
                      onChange={(e) =>
                        setB5({
                          ...b5,
                          distribuicao_modal: {
                            ...b5.distribuicao_modal,
                            pct_auto: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full h-8 px-2 rounded bg-[#101B3A] border border-[#1A2A5A] font-mono text-center text-[#F8FAFC]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#94A3B8]">% Coletivo/Caminhões</label>
                    <input
                      type="number"
                      value={b5.distribuicao_modal.pct_coletivo_caminhoes}
                      onChange={(e) =>
                        setB5({
                          ...b5,
                          distribuicao_modal: {
                            ...b5.distribuicao_modal,
                            pct_coletivo_caminhoes: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full h-8 px-2 rounded bg-[#101B3A] border border-[#1A2A5A] font-mono text-center text-[#F8FAFC]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* BLOCO 6 — VARIÁVEIS VISÃO ZERO */}
          {/* ========================================================================= */}
          {activeStep === 6 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-[#1A2A5A] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-[#F8FAFC]">
                    Bloco 6 — Variáveis Visão Zero & Custo do Trauma SUS
                  </h2>
                  <p className="text-xs text-[#94A3B8]">
                    Engenharia preventiva de moderação de tráfego e impacto financeiro na saúde
                    pública
                  </p>
                </div>
                <span className="text-xs font-mono text-[#3B82F6] bg-[#3B82F6]/10 px-2.5 py-1 rounded border border-[#3B82F6]/30 font-bold">
                  Peso B6: 15% (15 pts)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-2">
                  <span className="text-xs font-semibold text-[#CBD5E1] block">
                    Inventário Top 10 Pontos Críticos?
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={b6.inventario_top10_georreferenciado}
                      onChange={(e) =>
                        setB6({ ...b6, inventario_top10_georreferenciado: e.target.checked })
                      }
                    />
                    <span>Possui inventário georreferenciado ativo (4 pts)</span>
                  </label>
                </div>

                <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-2">
                  <span className="text-xs font-semibold text-[#CBD5E1] block">Zonas 30 km/h</span>
                  <select
                    value={b6.zonas_velocidade_30}
                    onChange={(e: any) => setB6({ ...b6, zonas_velocidade_30: e.target.value })}
                    className="w-full h-9 px-2.5 rounded bg-[#101B3A] border border-[#1A2A5A] text-xs text-[#F8FAFC]"
                  >
                    <option value="amplamente">
                      Ampla implantação em escolas e centros (4 pts)
                    </option>
                    <option value="piloto">Em fase de projeto-piloto (2 pts)</option>
                    <option value="nenhuma">Nenhuma implantada (0 pt)</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-2">
                  <span className="text-xs font-semibold text-[#CBD5E1] block">
                    Faixas de Fiscalização Eletrônica
                  </span>
                  <input
                    type="number"
                    value={b6.faixas_fiscalizacao_eletronica || ''}
                    onChange={(e) =>
                      setB6({ ...b6, faixas_fiscalizacao_eletronica: Number(e.target.value) })
                    }
                    className="w-full h-9 px-2.5 rounded bg-[#101B3A] border border-[#1A2A5A] text-xs text-[#F8FAFC] font-mono"
                  />
                  <span className="text-[10px] text-[#94A3B8]">Radares e lombadas eletrônicas</span>
                </div>
              </div>

              {/* Argumento Intersecretarial: Custo do Trauma SUS (NÃO PONTUA, GERA NEXO) */}
              <div className="p-4 rounded-xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-[#F59E0B] font-bold">
                    Custo do Trauma SUS (Argumento Intersecretarial Saúde + Fazenda)
                  </span>
                  <span className="text-[10px] text-[#94A3B8] italic">
                    Não pontua no índice • Sustenta o ROI
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-[#94A3B8] mb-1">
                      Internações Ortopédicas/Mês
                    </label>
                    <input
                      type="number"
                      value={b6.custo_trauma_sus.internacoes_mensais}
                      onChange={(e) =>
                        setB6({
                          ...b6,
                          custo_trauma_sus: {
                            ...b6.custo_trauma_sus,
                            internacoes_mensais: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full h-9 px-2.5 rounded bg-[#101B3A] border border-[#1A2A5A] font-mono text-[#F8FAFC]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#94A3B8] mb-1">
                      Custo Médio Diário UTI (R$)
                    </label>
                    <input
                      type="number"
                      value={b6.custo_trauma_sus.custo_medio_diario_uti}
                      onChange={(e) =>
                        setB6({
                          ...b6,
                          custo_trauma_sus: {
                            ...b6.custo_trauma_sus,
                            custo_medio_diario_uti: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full h-9 px-2.5 rounded bg-[#101B3A] border border-[#1A2A5A] font-mono text-[#F8FAFC]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#94A3B8] mb-1">
                      Tempo Médio Ocupação (dias)
                    </label>
                    <input
                      type="number"
                      value={b6.custo_trauma_sus.tempo_medio_dias}
                      onChange={(e) =>
                        setB6({
                          ...b6,
                          custo_trauma_sus: {
                            ...b6.custo_trauma_sus,
                            tempo_medio_dias: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full h-9 px-2.5 rounded bg-[#101B3A] border border-[#1A2A5A] font-mono text-[#F8FAFC]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASSO 7 — RELATÓRIO OFICIAL DE ENQUADRAMENTO COM AS 4 SAÍDAS */}
          {/* ========================================================================= */}
          {activeStep === 7 && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A2A5A]">
                <div>
                  <span className="text-[11px] font-mono uppercase bg-[#10B981]/20 text-[#10B981] px-2.5 py-0.5 rounded border border-[#10B981]/40 font-bold">
                    Relatório Concluído • Hash SHA-256 Calculado
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] mt-1.5">
                    Relatório Oficial de Enquadramento
                  </h2>
                  <p className="text-xs text-[#94A3B8]">
                    Protocolo: <span className="font-mono text-[#F8FAFC]">{protocolo}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={pdfGenerating}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] shadow-lg shadow-[#10B981]/25 flex items-center gap-2 transition-all"
                >
                  {pdfGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>Exportar Relatório em PDF</span>
                </button>
              </div>

              {/* CARD DE SÍNTESE DO DIAGNÓSTICO INSTITUCIONAL (0-100) */}
              <div className="p-6 rounded-2xl bg-[#0A1128] border border-[#3B82F6]/50 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase text-[#94A3B8] font-bold">
                    Diagnóstico Institucional
                  </span>
                  <div className="text-5xl font-black font-mono text-[#3B82F6]">
                    {diagResult.score_total}{' '}
                    <span className="text-base text-[#94A3B8] font-normal">/ 100</span>
                  </div>
                  <span className="inline-block text-xs font-bold text-[#10B981] bg-[#10B981]/15 px-2.5 py-0.5 rounded border border-[#10B981]/30">
                    {diagResult.classificacao.titulo}
                  </span>
                </div>

                <div className="md:col-span-2 space-y-2 text-xs text-[#CBD5E1]">
                  <p className="leading-relaxed">{diagResult.classificacao.descricao}</p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1 font-mono text-[11px]">
                    <div className="p-2 rounded bg-[#101B3A] border border-[#1A2A5A]">
                      B1: {diagResult.score_b1}/10
                    </div>
                    <div className="p-2 rounded bg-[#101B3A] border border-[#1A2A5A]">
                      B2: {diagResult.score_b2}/20
                    </div>
                    <div className="p-2 rounded bg-[#101B3A] border border-[#1A2A5A]">
                      B3: {diagResult.score_b3}/25
                    </div>
                    <div className="p-2 rounded bg-[#101B3A] border border-[#1A2A5A]">
                      B4: {diagResult.score_b4}/20
                    </div>
                    <div className="p-2 rounded bg-[#101B3A] border border-[#1A2A5A]">
                      B5: {diagResult.score_b5}/10
                    </div>
                    <div className="p-2 rounded bg-[#101B3A] border border-[#1A2A5A]">
                      B6: {diagResult.score_b6}/15
                    </div>
                  </div>
                </div>
              </div>

              {/* MELHORIA 1: TRILHA DE SAÍDA POR FAIXA (ROTEIRO CRONOLÓGICO DE PREPARAÇÃO INSTITUCIONAL) */}
              <div className="p-6 rounded-2xl bg-[#0A1128] border-2 border-[#10B981]/50 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A2A5A] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono uppercase bg-[#10B981]/20 text-[#10B981] px-2.5 py-0.5 rounded font-bold border border-[#10B981]/30">
                        Roteiro de Preparação Institucional
                      </span>
                      <span className="text-xs font-mono text-[#94A3B8]">
                        Duração Estimada: {trilhaFaixa.tempoEstimadoMeses} meses
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#F8FAFC] mt-1 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#10B981]" />
                      Trilha de Saída — {trilhaFaixa.tituloFaixa}
                    </h3>
                    <p className="text-xs text-[#94A3B8] mt-1">{trilhaFaixa.subtitulo}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowDossieModal(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-md shadow-[#3B82F6]/30 flex items-center gap-2 transition-all self-start sm:self-auto"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Abrir Dossiê Jurídico PGM</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-[#101B3A]/60 border border-[#1A2A5A] text-xs text-[#CBD5E1] leading-relaxed">
                  <b>Princípio Institucional:</b> {trilhaFaixa.visaoGeral}
                </div>

                {/* Passos cronológicos ordenados no tempo */}
                <div className="space-y-3">
                  {trilhaFaixa.passos.map((p) => (
                    <div
                      key={p.ordem}
                      className="p-4 rounded-xl bg-[#101B3A] border border-[#1A2A5A] hover:border-[#10B981]/40 transition-all space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#10B981]/20 text-[#10B981] font-mono text-xs font-bold flex items-center justify-center border border-[#10B981]/40">
                            {p.ordem}
                          </span>
                          <span className="text-xs font-bold font-mono text-[#60A5FA]">
                            {p.ano}
                          </span>
                          <span className="text-xs font-bold text-[#F8FAFC]">— {p.titulo}</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/30 self-start sm:self-auto">
                          Prazo: {p.prazoSugerido}
                        </span>
                      </div>

                      <p className="text-xs text-[#CBD5E1] leading-relaxed pl-8">{p.descricao}</p>

                      <div className="pl-8 pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] border-t border-[#1A2A5A]/60">
                        <span className="text-[#94A3B8]">
                          <b>Base Legal:</b> {p.baseLegal}
                        </span>
                        <span className="text-[#10B981] font-medium">
                          <b>Entregável:</b> {p.entregavel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* MELHORIA 5: FONTES ALTERNATIVAS DE CUSTEIO ALÉM DO ART. 320 CTB */}
              <div className="p-6 rounded-2xl bg-[#0A1128] border border-[#60A5FA]/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A2A5A] pb-3">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-[#60A5FA] shrink-0" />
                    <div>
                      <span className="text-xs font-mono uppercase bg-[#60A5FA]/20 text-[#60A5FA] px-2 py-0.5 rounded font-bold border border-[#60A5FA]/30">
                        Captação & Custeio Federativo
                      </span>
                      <h3 className="text-base font-bold text-[#F8FAFC] mt-0.5">
                        Fontes Alternativas de Custeio Além do Art. 320 CTB
                      </h3>
                    </div>
                  </div>
                  {isNaoMunicipalizado && (
                    <span className="text-xs font-mono text-[#F59E0B] bg-[#F59E0B]/15 px-2.5 py-1 rounded border border-[#F59E0B]/30 font-semibold">
                      Município Não Municipalizado
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  {fontesAlternativas.orientacaoInstitucional}
                </p>

                <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span className="text-[#94A3B8]">
                    Histórico SICONFI/Tesouro Nacional ({b1.municipio}):
                  </span>
                  <span className="font-mono text-[#10B981] font-bold text-sm">
                    R$ {(fontesAlternativas.valorSiconfiHistorico! / 1000000).toFixed(1)} milhões
                    recebidos em Urbanismo e Transporte nos últimos 3 anos
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {fontesAlternativas.fontes.map((f) => (
                    <div
                      key={f.id}
                      className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#F8FAFC]">{f.titulo}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0A1128] text-[#60A5FA] border border-[#1A2A5A]">
                          {f.esfera}
                        </span>
                      </div>
                      <p className="text-[#94A3B8] text-[11px] leading-relaxed">{f.descricao}</p>
                      <div className="text-[10px] text-[#CBD5E1] pt-1 border-t border-[#1A2A5A]/60 space-y-0.5 font-mono">
                        <div>
                          <b className="text-[#94A3B8]">Base Legal:</b> {f.baseLegal}
                        </div>
                        <div>
                          <b className="text-[#94A3B8]">Janela:</b> {f.janelaAcesso}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AS 4 SAÍDAS AUTOMÁTICAS ESTRUTURADAS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Saída A: Dimensionamento CPSI */}
                <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase font-bold text-[#10B981]">
                      (a) Dimensionamento do Piloto CPSI
                    </span>
                    <span className="text-[10px] font-mono text-[#94A3B8]">
                      Art. 27 LC 182/2021
                    </span>
                  </div>
                  <div className="text-3xl font-black font-mono text-[#F8FAFC]">
                    {saidasResult.dimensionamentoCpsi.veiculosSensorRecomendados}{' '}
                    <span className="text-base font-bold text-[#10B981]">veículos-sensor</span>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    Auditoria integral da malha viária em 30 dias com Fator de Confiança F ≥ 3:
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                    <div className="p-2 rounded bg-[#101B3A] text-center">
                      <span className="text-[#3B82F6] font-bold block">
                        {saidasResult.dimensionamentoCpsi.onibusAlocados}
                      </span>
                      <span className="text-[#94A3B8]">Ônibus</span>
                    </div>
                    <div className="p-2 rounded bg-[#101B3A] text-center">
                      <span className="text-[#10B981] font-bold block">
                        {saidasResult.dimensionamentoCpsi.caminhoesColetaAlocados}
                      </span>
                      <span className="text-[#94A3B8]">Coleta</span>
                    </div>
                    <div className="p-2 rounded bg-[#101B3A] text-center">
                      <span className="text-[#F59E0B] font-bold block">
                        {saidasResult.dimensionamentoCpsi.viaturasAlocadas}
                      </span>
                      <span className="text-[#94A3B8]">Viaturas</span>
                    </div>
                  </div>
                </div>

                {/* Saída B: Baseline PNATRANS */}
                <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase font-bold text-[#3B82F6]">
                      (b) Taxa Baseline PNATRANS
                    </span>
                    <span className="text-[10px] font-mono text-[#94A3B8]">Metas Decenais</span>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <div>
                      <span className="text-2xl font-black font-mono text-[#F8FAFC]">
                        {saidasResult.pnatransBaseline.taxaPor100kHab}
                      </span>
                      <span className="text-[11px] text-[#94A3B8] block">óbitos / 100k hab</span>
                    </div>
                    <div>
                      <span className="text-2xl font-black font-mono text-[#60A5FA]">
                        {saidasResult.pnatransBaseline.taxaPor10kVeiculos}
                      </span>
                      <span className="text-[11px] text-[#94A3B8] block">óbitos / 10k veíc</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    Meta de preservação:{' '}
                    <b className="text-[#10B981]">
                      +{saidasResult.pnatransBaseline.obitosEvitaveisMeta} vidas
                    </b>{' '}
                    com eliminação proativa de anomalias viárias graves.
                  </p>
                </div>

                {/* Saída C: Minuta de Empenho Art. 320 CTB */}
                <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase font-bold text-[#F59E0B]">
                      (c) Minuta de Empenho Orçamentário (Art. 320 CTB)
                    </span>
                    <span className="text-[10px] font-mono text-[#10B981]">
                      Nexo Causal Blindado
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] text-xs space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="text-[#94A3B8]">Dotação / Fonte de Recurso:</span>
                      <span className="text-[#F8FAFC] font-mono font-semibold">
                        {saidasResult.minutaEmpenho.fonteRecurso}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="text-[#94A3B8]">Classificação Funcional-Programática:</span>
                      <span className="text-[#F8FAFC] font-mono">
                        {saidasResult.minutaEmpenho.funcaoProgramatica}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="text-[#94A3B8]">Nexo Causal TCE:</span>
                      <span className="text-[#10B981] font-medium max-w-xl text-right">
                        Engenharia de tráfego, sinalização viária e redução comprovada de
                        sinistralidade
                      </span>
                    </div>
                  </div>
                </div>

                {/* Saída D: Matriz de Prioridade Zero */}
                <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase font-bold text-[#EF4444]">
                      (d) Matriz de Prioridade Zero (Top 5 Trechos Críticos)
                    </span>
                    <span className="text-[10px] text-[#94A3B8]">
                      Cruzamento Asfalto × Atropelamentos × Escolas
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] font-mono uppercase text-[#94A3B8] border-b border-[#1A2A5A] bg-[#101B3A]">
                        <tr>
                          <th className="py-2 px-3">Segmento Viário</th>
                          <th className="py-2 px-3">Bairro</th>
                          <th className="py-2 px-3">Asfalto</th>
                          <th className="py-2 px-3">Atropelamentos</th>
                          <th className="py-2 px-3">Escola?</th>
                          <th className="py-2 px-3">Ação Recomendada</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1A2A5A]">
                        {saidasResult.matrizPrioridadeZero.map((it) => (
                          <tr key={it.id} className="hover:bg-[#101B3A]/40">
                            <td className="py-2.5 px-3 font-semibold text-[#F8FAFC]">
                              {it.segmento}
                            </td>
                            <td className="py-2.5 px-3 text-[#94A3B8]">{it.bairro}</td>
                            <td className="py-2.5 px-3 uppercase text-[10px] font-bold text-[#EF4444]">
                              {it.criticidadeAsfalto}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-[#F8FAFC]">
                              {it.historicoAtropelamentos}
                            </td>
                            <td className="py-2.5 px-3">
                              {it.proximidadeEscola ? (
                                <span className="text-[10px] font-mono text-[#10B981] font-bold">
                                  SIM
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#94A3B8]">NÃO</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-xs text-[#CBD5E1]">
                              {it.acaoRecomendada}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 5º DADO: RECURSOS FEDERAIS SICONFI ÚLTIMOS 3 ANOS */}
                <div className="p-5 rounded-2xl bg-[#0A1128] border border-[#1A2A5A] space-y-3 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase font-bold text-[#60A5FA]">
                      5º Dado Oficial • Recursos Federais Aplicados (SICONFI / Tesouro Nacional)
                    </span>
                    <span className="text-[10px] font-mono text-[#10B981]">
                      {federalData?.fonteDeclarada || 'SICONFI Tesouro Nacional'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
                      <span className="text-[11px] text-[#94A3B8] block">
                        Transporte (Função 10)
                      </span>
                      <span className="text-lg font-bold font-mono text-[#60A5FA]">
                        R${' '}
                        {federalData?.despesasTransporte
                          ? (
                              federalData.despesasTransporte.reduce((a, b) => a + b.valor, 0) /
                              1000000
                            ).toFixed(1)
                          : '14.2'}{' '}
                        mi
                      </span>
                      <span className="text-[10px] text-[#94A3B8] block mt-0.5">
                        Últimos 3 exercícios
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
                      <span className="text-[11px] text-[#94A3B8] block">
                        Urbanismo (Função 13)
                      </span>
                      <span className="text-lg font-bold font-mono text-[#10B981]">
                        R${' '}
                        {federalData?.despesasUrbanismo
                          ? (
                              federalData.despesasUrbanismo.reduce((a, b) => a + b.valor, 0) /
                              1000000
                            ).toFixed(1)
                          : '22.8'}{' '}
                        mi
                      </span>
                      <span className="text-[10px] text-[#94A3B8] block mt-0.5">
                        Pavimentação e drenagem
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A]">
                      <span className="text-[11px] text-[#94A3B8] block">
                        Portal da Transparência CGU
                      </span>
                      <span className="text-xs font-bold text-[#F59E0B] block mt-1">
                        Cadastro de Chave Pendente
                      </span>
                      <span className="text-[10px] text-[#94A3B8] block mt-0.5">
                        Integração pronta para chave de acesso oficial
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODAL DO DOSSIÊ JURÍDICO CPSI (ENTREGA AUTÔNOMA PGM) */}
          {showDossieModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
              <div className="max-w-4xl w-full my-8">
                <DossieJuridicoModal
                  municipio={b1.municipio}
                  uf={b1.uf}
                  populacao={b1.populacao_ibge}
                  porte={diagResult.porte_identificado}
                  extensaoKm={b2.extensao_total_km}
                  orcamentoPavimentacao={b2.orcamento_anual_pavimentacao}
                  protocolo={protocolo}
                  onClose={() => setShowDossieModal(false)}
                />
              </div>
            </div>
          )}

          {/* BOTÕES DE NAVEGAÇÃO ENTRE OS PASSOS */}
          <div className="pt-6 border-t border-[#1A2A5A] flex items-center justify-between">
            {' '}
            <button
              type="button"
              onClick={prevStep}
              disabled={activeStep === 1}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#0A1128] hover:bg-[#1A2A5A] border border-[#1A2A5A] text-[#CBD5E1] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Bloco Anterior</span>
            </button>
            <div className="flex items-center gap-3">
              {activeStep < 6 && (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-md shadow-[#3B82F6]/30 flex items-center gap-2 transition-all"
                >
                  <span>Salvar e Avançar para o Bloco {activeStep + 1}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {activeStep === 6 && (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] shadow-lg shadow-[#10B981]/30 flex items-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Concluir e Gerar Relatório Oficial</span>
                </button>
              )}

              {activeStep === 7 && (
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#10B981] hover:bg-[#059669] flex items-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Relatório em PDF</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
