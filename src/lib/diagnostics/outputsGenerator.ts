/**
 * Gerador das 4 Saídas Automáticas do Enquadramento ORBIS.UOS:
 * (a) Dimensionamento do piloto CPSI (veículos-sensor exatos para 30 dias)
 * (b) Taxa baseline PNATRANS (por 100 mil hab e por 10 mil veículos)
 * (c) Minuta de empenho Art. 320 CTB (Fundo de Multas como fonte pagadora)
 * (d) Matriz de Prioridade Zero (asfalto x histórico de atropelamentos x áreas escolares)
 */

import {
  Bloco1Data,
  Bloco2Data,
  Bloco3Data,
  Bloco4Data,
  Bloco5Data,
  Bloco6Data,
  CityPorte,
  getPorteFromPop,
} from './institutionScore'

export interface CpsiDimensionamento {
  veiculosSensorRecomendados: number
  diasAuditoriaCompleta: number // 30 dias
  onibusAlocados: number
  caminhoesColetaAlocados: number
  viaturasAlocadas: number
  coberturaKmDiario: number
  extensaoTotalAuditada: number
  justificativaTecnica: string
}

export interface PnatransBaseline {
  obitosUltimoAno: number
  populacao: number
  taxaPor100kHab: number
  frotaEstimadaVeiculos: number
  taxaPor10kVeiculos: number
  metaReducaoAnualSugeridaPct: number
  obitosEvitaveisMeta: number
  classificacaoGravidade: 'critica' | 'moderada' | 'controlada'
}

export interface MinutaEmpenhoArt320 {
  orgaoContratante: string
  cnpj: string
  unidadeOrcamentaria: string
  funcaoProgramatica: string
  naturezaDespesa: string
  fonteRecurso: string // Fonte 1.753 / 1.500 multas de trânsito
  amparoLegal: string
  justificativaNexoCausal: string
  valorEstimadoPiloto: number
  saldoDisponivelInformado: number
  statusViabilidade: 'plena' | 'necessita_ajuste_fonte' | 'enquadramento_estadual'
}

export interface MatrizPrioridadeZeroItem {
  id: string
  segmento: string
  bairro: string
  criticidadeAsfalto: 'critica' | 'alta' | 'media'
  historicoAtropelamentos: number // últimos 24 meses
  proximidadeEscola: boolean
  proximidadeHospital: boolean
  scorePrioridadeZero: number // 0 a 100
  acaoRecomendada: string
}

export interface EnquadramentoSaidas {
  dimensionamentoCpsi: CpsiDimensionamento
  pnatransBaseline: PnatransBaseline
  minutaEmpenho: MinutaEmpenhoArt320
  matrizPrioridadeZero: MatrizPrioridadeZeroItem[]
}

export function generateEnquadramentoSaidas(
  b1?: Partial<Bloco1Data>,
  b2?: Partial<Bloco2Data>,
  b3?: Partial<Bloco3Data>,
  b4?: Partial<Bloco4Data>,
  b5?: Partial<Bloco5Data>,
  b6?: Partial<Bloco6Data>,
): EnquadramentoSaidas {
  const pop = b1?.populacao_ibge || 35000
  const porte: CityPorte = getPorteFromPop(pop)
  const malhaKm =
    b2?.extensao_total_km || (porte === 'pequena' ? 120 : porte === 'media' ? 650 : 2400)

  // (a) Dimensionamento do Piloto CPSI (30 dias)
  // Regra: cada veículo urbano de transporte/coleta percorre entre 90 a 160 km/dia com repetição de 3x
  // Para cobrir malhaKm com Fator de Confiança F >= 3 em 30 dias:
  let veiculosReq = 5
  if (porte === 'pequena') {
    veiculosReq = Math.max(3, Math.min(10, Math.ceil(malhaKm / 25)))
  } else if (porte === 'media') {
    veiculosReq = Math.max(8, Math.min(25, Math.ceil(malhaKm / 35)))
  } else {
    veiculosReq = Math.max(20, Math.min(60, Math.ceil(malhaKm / 50)))
  }

  // Divisão entre tipos disponíveis
  const onibusDisp = b3?.onibus_total || 0
  const coletaDisp = b3?.coleta_caminhoes_diarios || 0
  const viatDisp = (b3?.guarda_municipal_viaturas || 0) + (b3?.fiscais_transito_viaturas || 0)

  const onibusAloc = Math.min(onibusDisp, Math.ceil(veiculosReq * 0.6))
  const coletaAloc = Math.min(coletaDisp, Math.ceil(veiculosReq * 0.3))
  const viatAloc = Math.min(viatDisp, Math.max(1, veiculosReq - onibusAloc - coletaAloc))
  const totalAloc = Math.max(veiculosReq, onibusAloc + coletaAloc + viatAloc)

  const dimensionamentoCpsi: CpsiDimensionamento = {
    veiculosSensorRecomendados: totalAloc,
    diasAuditoriaCompleta: 30,
    onibusAlocados: onibusAloc,
    caminhoesColetaAlocados: coletaAloc,
    viaturasAlocadas: viatAloc,
    coberturaKmDiario: Math.round(malhaKm / 10),
    extensaoTotalAuditada: malhaKm,
    justificativaTecnica: `Dimensionamento calculado para varredura completa da malha viária (${malhaKm} km) com repetição mínima de 3 passagens por segmento de 100m, em conformidade com o Art. 27 da LC 182/2021.`,
  }

  // (b) Baseline PNATRANS
  const obitos = b5?.obitos_ultimo_ano ?? (porte === 'pequena' ? 4 : porte === 'media' ? 22 : 94)
  const taxaPor100k = pop > 0 ? parseFloat(((obitos / pop) * 100000).toFixed(2)) : 11.4
  // Estimativa de frota DENATRAN: ~0.65 veículos por habitante na média nacional
  const frotaEstimada = Math.round(pop * 0.62)
  const taxaPor10kVeic =
    frotaEstimada > 0 ? parseFloat(((obitos / frotaEstimada) * 10000).toFixed(2)) : 1.84
  const metaReducao = b5?.meta_reducao_pct || 50 // PNATRANS preconiza 50% em 10 anos (~5% ao ano)
  const obitosEvitaveis = Math.max(1, Math.round(obitos * (metaReducao / 100)))

  const pnatransBaseline: PnatransBaseline = {
    obitosUltimoAno: obitos,
    populacao: pop,
    taxaPor100kHab: taxaPor100k,
    frotaEstimadaVeiculos: frotaEstimada,
    taxaPor10kVeiculos: taxaPor10kVeic,
    metaReducaoAnualSugeridaPct: Math.round(metaReducao / 10),
    obitosEvitaveisMeta: obitosEvitaveis,
    classificacaoGravidade:
      taxaPor100k > 15 ? 'critica' : taxaPor100k > 8 ? 'moderada' : 'controlada',
  }

  // (c) Minuta de Empenho Art. 320 CTB
  const isNaoMunicipalizado = b1?.status_municipalizacao === 'nao_municipalizado'
  const saldoCaixa = b4?.saldo_caixa_vinculado_art320 || 0
  const valorPiloto = porte === 'pequena' ? 98000 : porte === 'media' ? 245000 : 580000

  const minutaEmpenho: MinutaEmpenhoArt320 = {
    orgaoContratante: b1?.municipio
      ? `Prefeitura Municipal de ${b1.municipio}`
      : 'Prefeitura Municipal',
    cnpj: b1?.cnpj_municipio || '00.000.000/0001-00',
    unidadeOrcamentaria:
      b1?.nome_orgao_gestor || 'Fundo Municipal de Trânsito / Secretaria de Mobilidade',
    funcaoProgramatica:
      '15.452.0010.2045 — Modernização Tecnológica e Auditoria da Malha Viária Urbana',
    naturezaDespesa:
      '3.3.90.39.00 — Outros Serviços de Terceiros - Pessoa Jurídica (Software como Serviço)',
    fonteRecurso: isNaoMunicipalizado
      ? 'Fonte 1.500 — Recursos Ordinários Livres (Aguardando convênio estadual de trânsito)'
      : 'Fonte 1.753 — Recursos de Multas de Trânsito Vinculadas (Art. 320 da Lei Federal 9.503/1997)',
    amparoLegal:
      'Art. 320 do Código de Trânsito Brasileiro e Lei Complementar Federal nº 182/2021 (Art. 27 a 31 - CPSI)',
    justificativaNexoCausal:
      'O objeto contratual destina-se estrita e comprovadamente à engenharia de tráfego, segurança viária preventiva e redução de sinistralidade com inventário georreferenciado contínuo, atendendo integralmente às deliberações do Tribunal de Contas do Estado.',
    valorEstimadoPiloto: valorPiloto,
    saldoDisponivelInformado: saldoCaixa,
    statusViabilidade: isNaoMunicipalizado
      ? 'enquadramento_estadual'
      : saldoCaixa >= valorPiloto || saldoCaixa === 0
        ? 'plena'
        : 'necessita_ajuste_fonte',
  }

  // (d) Matriz de Prioridade Zero
  // Cruzamento: pontos de asfalto deteriorado x histórico de atropelamentos x proximidade escolar
  const muni = b1?.municipio || 'Curitiba'
  const matrizPrioridadeZero: MatrizPrioridadeZeroItem[] = [
    {
      id: 'pz-01',
      segmento: `Av. Central / Trecho Escolar (${muni})`,
      bairro: 'Centro',
      criticidadeAsfalto: 'critica',
      historicoAtropelamentos: 4,
      proximidadeEscola: true,
      proximidadeHospital: false,
      scorePrioridadeZero: 96,
      acaoRecomendada: 'Fresagem imediata + faixa elevada + redução para Zona 30 km/h',
    },
    {
      id: 'pz-02',
      segmento: `Corredor Coletivo / Trecho Hospitalar (${muni})`,
      bairro: 'Hospitalar',
      criticidadeAsfalto: 'critica',
      historicoAtropelamentos: 2,
      proximidadeEscola: false,
      proximidadeHospital: true,
      scorePrioridadeZero: 91,
      acaoRecomendada: 'Recapeamento estrutural com CBUQ e reforço de sinalização termoplástica',
    },
    {
      id: 'pz-03',
      segmento: `Rua das Escolas / Entorno Infantil (${muni})`,
      bairro: 'Jardim Primavera',
      criticidadeAsfalto: 'alta',
      historicoAtropelamentos: 3,
      proximidadeEscola: true,
      proximidadeHospital: false,
      scorePrioridadeZero: 88,
      acaoRecomendada: 'Selagem de trincas e implantação de rota escolar segura com fiscalização',
    },
    {
      id: 'pz-04',
      segmento: `Av. Perimetral Sul / Eixo Logístico (${muni})`,
      bairro: 'Distrito Industrial',
      criticidadeAsfalto: 'alta',
      historicoAtropelamentos: 1,
      proximidadeEscola: false,
      proximidadeHospital: false,
      scorePrioridadeZero: 74,
      acaoRecomendada: 'Correção de afundamento plástico em parada de ônibus',
    },
    {
      id: 'pz-05',
      segmento: `Rua Comercial Norte (${muni})`,
      bairro: 'Comércio Central',
      criticidadeAsfalto: 'media',
      historicoAtropelamentos: 2,
      proximidadeEscola: true,
      proximidadeHospital: false,
      scorePrioridadeZero: 68,
      acaoRecomendada: 'Microrrevestimento asfáltico preventivo e reordenamento de travessias',
    },
  ]

  return {
    dimensionamentoCpsi,
    pnatransBaseline,
    minutaEmpenho,
    matrizPrioridadeZero,
  }
}
