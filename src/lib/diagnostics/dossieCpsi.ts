/**
 * Dossiê Jurídico CPSI — ORBIS.UOS
 * Marco Legal das Startups (LC 182/2021) e Lei de Governo Digital (Lei 14.129/2021).
 * Entrega autônoma para Procuradoria-Geral do Município (PGM), Controladoria e Secretarias.
 * Contém:
 * 1. Ensaio Displacente (Cálculo Comparativo de Economicidade Pública)
 * 2. Matriz e Relatório de Risco da Inovação
 * 3. Minuta Padronizada de Termo Aditivo Contratual para Concessionárias (Telemetria sem ônus)
 */

export interface EnsaioEconomicidade {
  metodoTradicionalNome: string
  metodoTradicionalCustoAnual: number
  metodoTradicionalDescricao: string
  metodoOrbisNome: string
  metodoOrbisCustoAnual: number
  metodoOrbisDescricao: string
  economiaDiretaAnual: number
  economiaPercentual: number
  reducaoRetrabalhoAsfaltoEstimada: number
  roiEstimadoMeses: number
  // Dados oficiais apurados via SICONFI/Tesouro Nacional
  gastoViarioSiconfiMedia?: number
  gastoViarioSiconfiAnos?: number[]
  gastoViarioSiconfiTotal?: number
  gastoViarioSiconfiFonte?: string
}

export interface ItemMatrizRisco {
  categoria: string
  riscoIdentificado: string
  probabilidade: 'Baixa' | 'Média' | 'Alta'
  impacto: 'Baixo' | 'Médio' | 'Alto'
  mitigacaoLegalOperacional: string
  amparoMarcoLegal: string
}

export interface MinutaTermoAditivoConcessionaria {
  titulo: string
  objeto: string
  clausulaPrimeira: string
  clausulaSegunda: string
  clausulaTerceira: string
  fundamentacaoLegal: string
}

export interface DossieJuridicoCpsi {
  protocoloIntegridade: string
  municipio: string
  uf: string
  porte: string
  populacao: number
  dataEmissao: string
  ensaioEconomicidade: EnsaioEconomicidade
  matrizRisco: ItemMatrizRisco[]
  minutaTermoAditivo: MinutaTermoAditivoConcessionaria
  parecerConclusivo: string
}

export function gerarDossieJuridicoCpsi(params: {
  municipio: string
  uf: string
  porte: 'pequena' | 'media' | 'grande'
  populacao: number
  extensaoKm?: number
  orcamentoPavimentacao?: number
  protocolo?: string
  gastoViarioSiconfiMedia?: number
  gastoViarioSiconfiAnos?: number[]
  gastoViarioSiconfiTotal?: number
  gastoViarioSiconfiFonte?: string
}): DossieJuridicoCpsi {
  const muni = params.municipio || 'Município'
  const uf = params.uf || 'PR'
  const malha =
    params.extensaoKm || (params.porte === 'pequena' ? 120 : params.porte === 'media' ? 600 : 2000)
  const orcamentoAsfalto =
    params.orcamentoPavimentacao ||
    (params.porte === 'pequena' ? 1500000 : params.porte === 'media' ? 8500000 : 45000000)
  const protocolo = params.protocolo || `CPSI-${uf}-${Date.now().toString().slice(-6)}`

  // 1. Ensaio Displacente (Cálculo Comparativo de Economicidade):
  // Método tradicional: vistorias manuais reativas com equipes de tapa-buraco ou perfilômetro laser contratado por km (~R$ 450 a R$ 800 por km auditado uma única vez ao ano)
  const custoTradicionalPorKm =
    params.porte === 'pequena' ? 550 : params.porte === 'media' ? 480 : 420
  const custoTradicionalTotal = Math.round(malha * custoTradicionalPorKm + orcamentoAsfalto * 0.08) // auditoria pontual + perdas por retrabalho reativo

  // Método ORBIS.UOS (CPSI Software como Serviço via frota existente):
  const custoCpsiPiloto =
    params.porte === 'pequena' ? 98000 : params.porte === 'media' ? 245000 : 580000
  const economiaDireta = Math.max(0, custoTradicionalTotal - custoCpsiPiloto)
  const economiaPct = Math.round((economiaDireta / custoTradicionalTotal) * 100)
  const reducaoRetrabalho = Math.round(orcamentoAsfalto * 0.18) // ~18% de redução de retrabalho com manutenção preditiva no tempo certo
  const roiMeses = params.porte === 'pequena' ? 3.5 : params.porte === 'media' ? 2.8 : 2.1

  const ensaioEconomicidade: EnsaioEconomicidade = {
    metodoTradicionalNome: 'Modelo Convencional Reativo (Perfilometria Pontual & Reclamações 156)',
    metodoTradicionalCustoAnual: custoTradicionalTotal,
    metodoTradicionalDescricao: `Contratação periódica de caminhão com perfilômetro laser com alta mobilização ou fiscalização puramente visual reativa. Auditoria única ao ano, sem capacidade preditiva contínua da malha (${malha} km).`,
    metodoOrbisNome: 'Auditoria Inercial Contínua por Smartphone (ORBIS.UOS / CPSI)',
    metodoOrbisCustoAnual: custoCpsiPiloto,
    metodoOrbisDescricao: `Aproveitamento da frota pública municipal e veículos de concessionárias parceiras (ônibus e coleta) mediante termo aditivo de cooperação. Leituras contínuas com inteligência preditiva de degradação asfáltica e Matriz de Prioridade Zero. Zero investimento em hardware proprietário.`,
    economiaDiretaAnual: economiaDireta,
    economiaPercentual: economiaPct,
    reducaoRetrabalhoAsfaltoEstimada: reducaoRetrabalho,
    roiEstimadoMeses: roiMeses,
    gastoViarioSiconfiMedia: params.gastoViarioSiconfiMedia,
    gastoViarioSiconfiAnos: params.gastoViarioSiconfiAnos,
    gastoViarioSiconfiTotal: params.gastoViarioSiconfiTotal,
    gastoViarioSiconfiFonte: params.gastoViarioSiconfiFonte,
  }

  // 2. Matriz e Relatório de Risco da Inovação
  const matrizRisco: ItemMatrizRisco[] = [
    {
      categoria: 'Risco Tecnológico',
      riscoIdentificado:
        'Imprecisão ou ruído nas leituras de acelerômetros em diferentes marcas de smartphones.',
      probabilidade: 'Média',
      impacto: 'Baixo',
      mitigacaoLegalOperacional:
        'Filtragem espectral por Janela de Hanning e algoritmo FFT (Fast Fourier Transform), com Fator de Confiança F ≥ 3 passagens redundantes antes de consolidar a severidade da anomalia.',
      amparoMarcoLegal:
        'Art. 27, § 1º da LC nº 182/2021 (Tolerância ao risco tecnológico em ambiente experimental).',
    },
    {
      categoria: 'Risco Operacional / Concessionárias',
      riscoIdentificado:
        'Resistência de operadores terceirizados de coleta ou transporte coletivo em instalar o aplicativo.',
      probabilidade: 'Média',
      impacto: 'Médio',
      mitigacaoLegalOperacional:
        'Aplicação de Termo Aditivo Contratual fundamentado no interesse público e na prerrogativa de fiscalização do poder concedente, sem alteração do equilíbrio econômico-financeiro.',
      amparoMarcoLegal:
        'Art. 58, III e Art. 65 da Lei 8.666/1993 c/c Art. 124, I da Lei 14.133/2021.',
    },
    {
      categoria: 'Risco Financeiro / Rejeição de Contas',
      riscoIdentificado:
        'Apontamento do Tribunal de Contas por suposto desvio de finalidade de verbas de trânsito.',
      probabilidade: 'Baixa',
      impacto: 'Alto',
      mitigacaoLegalOperacional:
        'Nota técnica vinculando formalmente os outputs da plataforma ao Art. 320 do CTB (Engenharia de tráfego preventiva e segurança viária), gerando minuta de empenho padronizada.',
      amparoMarcoLegal:
        'Art. 320 da Lei 9.503/1997 e Jurisprudência pacificada dos Tribunais de Contas Estaduais.',
    },
    {
      categoria: 'Risco de Privacidade / LGPD',
      riscoIdentificado:
        'Vazamento ou captação indevida de dados pessoais ou rotas individuais de motoristas.',
      probabilidade: 'Baixa',
      impacto: 'Alto',
      mitigacaoLegalOperacional:
        'Anonimização ponta a ponta: o sensor coleta apenas grandezas inerciais físicas (aceleração m/s² nos eixos X, Y, Z e velocidade) agregadas por segmento viário de 100m. Não há identificação do condutor nem gravação de áudio/imagem.',
      amparoMarcoLegal: 'Art. 12 e Art. 13 da Lei Federal nº 13.709/2018 (LGPD).',
    },
  ]

  // 3. Minuta de Termo Aditivo para Concessionárias
  const minutaTermoAditivo: MinutaTermoAditivoConcessionaria = {
    titulo: `MINUTA PADRÃO DE TERMO ADITIVO DE COOPERAÇÃO TÉCNICA E TELEMETRIA VIÁRIA — PREFEITURA DE ${muni.toUpperCase()}/${uf}`,
    objeto:
      'Inserção de cláusula de tolerância e suporte operacional para coleta inercial de dados de engenharia viária nos veículos afetos ao serviço público concedido/terceirizado.',
    clausulaPrimeira:
      'CLÁUSULA PRIMEIRA — DA FINALIDADE: O presente Termo Aditivo tem por objeto a viabilização de auditoria contínua da infraestrutura viária municipal por meio de dispositivos embarcados nos veículos da CONCESSIONÁRIA/CONTRATADA, visando ao aprimoramento da mobilidade urbana, segurança viária e conservação do patrimônio público.',
    clausulaSegunda:
      'CLÁUSULA SEGUNDA — DA NÃO ONEROSIDADE E EQUILÍBRIO CONTRATUAL: A disponibilização do espaço físico no painel dos veículos para afixação de suporte de smartphone ou conexão de aplicativo coletor não implica acréscimo de custo operacional à CONTRATADA, não ensejando reajuste tarifário, compensação financeira ou quebra da equação econômico-financeira do contrato original.',
    clausulaTerceira:
      'CLÁUSULA TERCEIRA — DA SEGURANÇA E PRIVACIDADE: O sistema de telemetria operará sob regime de estrita anonimização (LGPD - Lei 13.709/2018), sendo vedado o rastreamento individual do motorista para fins disciplinares ou punitivos trabalhistas pela operadora, limitando-se o uso dos dados à detecção de irregularidades no pavimento e segurança viária.',
    fundamentacaoLegal:
      'Art. 124 da Lei Federal nº 14.133/2021, Art. 65 da Lei Federal nº 8.666/1993, Art. 24 do CTB e Lei Complementar nº 182/2021.',
  }

  const parecerConclusivo = `Diante do cálculo comparativo de economicidade (geração de economia estimada de R$ ${economiaDireta.toLocaleString('pt-BR')} ao ano), da mitigação integral dos riscos de conformidade e da base legal da LC nº 182/2021 e Art. 320 do CTB, a Procuradoria-Geral do Município opina pela PLENA VIABILIDADE JURÍDICA E CONVENIÊNCIA ADMINISTRATIVA da instauração do procedimento CPSI para o município de ${muni}/${uf}.`

  return {
    protocoloIntegridade: protocolo,
    municipio: muni,
    uf,
    porte: params.porte,
    populacao: params.populacao,
    dataEmissao: new Date().toLocaleDateString('pt-BR'),
    ensaioEconomicidade,
    matrizRisco,
    minutaTermoAditivo,
    parecerConclusivo,
  }
}
