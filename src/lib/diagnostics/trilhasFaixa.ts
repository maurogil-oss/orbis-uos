/**
 * Trilha de Saída Institucional por Faixa (0–100) — ORBIS.UOS
 * Roteiro cronológico com prazos, passos ordenados no tempo e bases legais.
 * Princípio institucional: A trilha nunca soa como recusa — é preparação,
 * o município avança mesmo começando de faixas iniciais ("Enquadramento Necessário").
 */

export interface PassoTrilha {
  ordem: number
  ano: string // ex: "Ano 1 - 1º Semestre", "Ano 1 - 2º Semestre", "Ano 2"
  fase: string
  titulo: string
  descricao: string
  prazoSugerido: string
  baseLegal: string
  entregavel: string
  orgaosResponsaveis: string[]
}

export interface TrilhaFaixaConfig {
  faixaId: 'pioneiro' | 'estruturada' | 'consolidacao' | 'enquadramento'
  tituloFaixa: string
  subtitulo: string
  tempoEstimadoMeses: number
  visaoGeral: string
  passos: PassoTrilha[]
}

export const TRILHAS_POR_FAIXA: Record<
  'pioneiro' | 'estruturada' | 'consolidacao' | 'enquadramento',
  TrilhaFaixaConfig
> = {
  enquadramento: {
    faixaId: 'enquadramento',
    tituloFaixa: 'Enquadramento Necessário (0–49 pts)',
    subtitulo: 'Roteiro de Municipalização, Estruturação Institucional e Fontes Alternativas',
    tempoEstimadoMeses: 24,
    visaoGeral:
      'Trilha de preparação e nivelamento federativo. O município avança com base técnica sólida, integrando etapas legais do CTB, criação do Fundo de Trânsito ou acionamento de fontes federais/emendas parlamentares, habilitando a cidade para o piloto CPSI inovador.',
    passos: [
      {
        ordem: 1,
        ano: 'Ano 1 — Mês 01 a 03',
        fase: 'Diagnóstico & Segurança Jurídica',
        titulo: 'Instituição da Comissão de Municipalização do Trânsito',
        descricao:
          'Elaboração de minuta de Lei Municipal criando a autoridade ou órgão executivo de trânsito local e nomeação da comissão de transição federativa perante o CETRAN/SENATRAN.',
        prazoSugerido: '90 dias',
        baseLegal: 'Art. 24 da Lei Federal nº 9.503/1997 (CTB) e Resoluções CONTRAN',
        entregavel: 'Decreto Executivo de Comissão e Projeto de Lei do Órgão de Trânsito',
        orgaosResponsaveis: ['Gabinete do Prefeito', 'Procuradoria-Geral do Município (PGM)'],
      },
      {
        ordem: 2,
        ano: 'Ano 1 — Mês 04 a 06',
        fase: 'Governança & Fundos',
        titulo: 'Criação do Fundo Municipal de Segurança Viária e Conta Vinculada',
        descricao:
          'Abertura de conta corrente bancária segregada e vinculada especificamente à segurança viária e engenharia de tráfego, evitando confusão patrimonial e apontamentos de TCE.',
        prazoSugerido: '90 dias',
        baseLegal: 'Art. 320 da Lei nº 9.503/1997 e Lei Federal nº 4.320/1964',
        entregavel: 'Ato de Abertura de Conta e Código Orçamentário Segregado (Fonte 1.753)',
        orgaosResponsaveis: ['Secretaria de Finanças/Fazenda', 'Contabilidade Pública'],
      },
      {
        ordem: 3,
        ano: 'Ano 1 — Mês 07 a 12',
        fase: 'Mapeamento Preliminar & Custeio Alternativo',
        titulo: 'Captação de Custeio Alternativo e Piloto Provisório com Frota Própria',
        descricao:
          'Enquanto a municipalização plena tramita, ativação de fontes alternativas (Transferências do Ministério das Cidades, Emendas Parlamentares de Mobilidade) e piloto demonstrativo simplificado.',
        prazoSugerido: '180 dias',
        baseLegal: 'Lei Federal nº 14.129/2021 (Governo Digital) e Programas SICONFI',
        entregavel: 'Plano de Aplicação de Transferências Federais e Termo de Adesão CPSI',
        orgaosResponsaveis: ['Secretaria de Planejamento', 'Secretaria de Obras'],
      },
      {
        ordem: 4,
        ano: 'Ano 2 — Mês 13 a 18',
        fase: 'Homologação & Ativação CPSI',
        titulo: 'Publicação do Edital CPSI e Ativação de Frota-Sensor Zero CAPEX',
        descricao:
          'Lançamento formal do Contrato Público para Solução Inovadora com base no Marco Legal das Startups, utilizando smartphones da frota de coleta/ônibus para auditar a malha viária.',
        prazoSugerido: '180 dias',
        baseLegal: 'Art. 27 a 31 da Lei Complementar nº 182/2021 (CPSI)',
        entregavel: 'Edital CPSI publicado em Diário Oficial e Contrato de Teste firmado',
        orgaosResponsaveis: ['Comissão de Contratação', 'Órgão de Trânsito Municipal'],
      },
    ],
  },
  consolidacao: {
    faixaId: 'consolidacao',
    tituloFaixa: 'Em Consolidação (50–69 pts)',
    subtitulo: 'Roteiro de Regularização Orçamentária e Ativação Piloto em Paralelo',
    tempoEstimadoMeses: 12,
    visaoGeral:
      'O município dispõe de base institucional estruturada e frota operacional ativa, necessitando de ajustes na segregação orçamentária do Art. 320 CTB e formalização de cláusulas de telemetria.',
    passos: [
      {
        ordem: 1,
        ano: 'Mês 01 a 02',
        fase: 'Alinhamento Orçamentário',
        titulo: 'Sanear Saldo Represado e Ajustar Classificação Funcional',
        descricao:
          'Elaboração da Nota Técnica e Minuta de Empenho vinculando o superávit do Art. 320 à modernização e auditoria preventiva da malha viária, eliminando ressalvas junto ao Tribunal de Contas.',
        prazoSugerido: '45 dias',
        baseLegal: 'Art. 320 do CTB e Instruções Normativas do TCE',
        entregavel: 'Nota Técnica de Nexo Causal e Minuta de Empenho na Fonte 1.753',
        orgaosResponsaveis: ['Secretaria de Finanças', 'Controladoria Interna'],
      },
      {
        ordem: 2,
        ano: 'Mês 03 a 04',
        fase: 'Aditamento Contratual',
        titulo: 'Termo Aditivo de Telemetria com Concessionárias de Transporte e Coleta',
        descricao:
          'Inserção de cláusula de tolerância de instalação e operação de sensores/aplicativos nos veículos das concessionárias e terceirizadas sem acréscimo de custo operacional.',
        prazoSugerido: '60 dias',
        baseLegal: 'Art. 65 da Lei nº 8.666/1993 e Art. 124 da Lei Federal nº 14.133/2021',
        entregavel: 'Minuta Padrão de Termo Aditivo Homologada pela Procuradoria',
        orgaosResponsaveis: ['PGM', 'Secretaria de Transporte/Obras'],
      },
      {
        ordem: 3,
        ano: 'Mês 05 a 08',
        fase: 'Condução do Piloto',
        titulo: 'Execução do Piloto CPSI de 30 a 90 Dias',
        descricao:
          'Instalação do app coletor nos smartphones de bordo, varredura contínua de 100% da malha pavimentada e geração do primeiro Mapa de Criticidade Inercial (IMM).',
        prazoSugerido: '90 dias',
        baseLegal: 'Art. 27 da LC 182/2021 (Contrato de Teste)',
        entregavel: 'Laudo Técnico de Varredura e Matriz de Prioridade Zero Inicial',
        orgaosResponsaveis: ['Gabinete do Prefeito', 'Secretaria de Mobilidade'],
      },
      {
        ordem: 4,
        ano: 'Mês 09 a 12',
        fase: 'Contratação Definitiva',
        titulo: 'Aferição de Metas e Transição para Contrato de Fornecimento',
        descricao:
          'Comprovação de economicidade pública e contratação da solução para monitoramento contínuo plurianual sem nova licitação, nos termos da LC 182/2021.',
        prazoSugerido: '90 dias',
        baseLegal: 'Art. 30 da LC 182/2021',
        entregavel: 'Relatório Final de Validação CPSI e Contrato de Fornecimento',
        orgaosResponsaveis: ['Secretaria de Obras', 'Comitê de Governança Digital'],
      },
    ],
  },
  estruturada: {
    faixaId: 'estruturada',
    tituloFaixa: 'Gestão Estruturada (70–84 pts)',
    subtitulo: 'Roteiro de Ativação Rápida e Integração Intersecretarial',
    tempoEstimadoMeses: 6,
    visaoGeral:
      'A gestão possui maturidade operacional e orçamentária para acionamento imediato. O foco reside na sincronização dos dados entre Obras, Saúde (SUS) e Mobilidade.',
    passos: [
      {
        ordem: 1,
        ano: 'Mês 01',
        fase: 'Formalização Imediata',
        titulo: 'Edição de Decreto de Comitê Intersetorial Visão Zero',
        descricao:
          'Instituição formal do comitê unindo Obras, Saúde e Trânsito para tomada de decisão baseada no nexo trauma-infraestrutura.',
        prazoSugerido: '20 dias',
        baseLegal: 'Plano Nacional de Redução de Mortes no Trânsito (PNATRANS - Lei 13.614/2018)',
        entregavel: 'Decreto Municipal Publicado com Composição Intersetorial',
        orgaosResponsaveis: ['Gabinete', 'Secretarias de Mobilidade e Saúde'],
      },
      {
        ordem: 2,
        ano: 'Mês 02 a 03',
        fase: 'Varredura e Dimensionamento',
        titulo: 'Auditoria de 30 Dias e Emissão da Matriz de Prioridade Zero',
        descricao:
          'Cobertura territorial completa com a frota-sensor dimensionada (ônibus + coleta + viaturas) e cruzamento com histórico de atropelamentos e áreas escolares.',
        prazoSugerido: '45 dias',
        baseLegal: 'Lei Federal 14.129/2021 (Art. 29 — Decisão baseada em evidências)',
        entregavel: 'Dossiê Georreferenciado com Top 10 Trechos Críticos',
        orgaosResponsaveis: ['Secretaria de Obras', 'Engenharia de Tráfego'],
      },
      {
        ordem: 3,
        ano: 'Mês 04 a 06',
        fase: 'Otimização Fiscal',
        titulo: 'Redirecionamento de Contratos Reativos para Manutenção Preditiva',
        descricao:
          'Aplicação do saldo de multas em microfresagem e intervenções preventivas indicadas pela telemetria, com economia comprovada de até 40% do custo de recapeamento.',
        prazoSugerido: '60 dias',
        baseLegal: 'Art. 320 CTB e Acórdãos de Eficiência de Tribunais de Contas',
        entregavel: 'Relatório Bimestral de Redução de Gastos Reativos',
        orgaosResponsaveis: ['Secretaria de Finanças', 'Secretaria de Obras'],
      },
    ],
  },
  pioneiro: {
    faixaId: 'pioneiro',
    tituloFaixa: 'Município Pioneiro (85–100 pts)',
    subtitulo: 'Roteiro de Cidade Vitrine e Interoperabilidade de Dados Abertos',
    tempoEstimadoMeses: 3,
    visaoGeral:
      'Excelência de governança e capacidade técnica comprovada. Habilitação expressa para operar como piloto de referência nacional do Marco Legal de Startups e integração via APIs governamentais.',
    passos: [
      {
        ordem: 1,
        ano: 'Mês 01',
        fase: 'Acordo Institucional',
        titulo: 'Homologação CPSI em Rito Acelerado',
        descricao:
          'Aprovação da comissão especial com dispensa de instrução preparatória adicional, ante o cumprimento de 100% dos requisitos de governança e integridade.',
        prazoSugerido: '15 dias',
        baseLegal: 'Art. 27 da LC 182/2021 e Decreto Municipal de Inovação',
        entregavel: 'Termo de Cooperação e Abertura de Ambiente Regulatório Experimental',
        orgaosResponsaveis: ['Gabinete do Prefeito', 'PGM'],
      },
      {
        ordem: 2,
        ano: 'Mês 02',
        fase: 'Integração de Sistemas',
        titulo: 'Conexão com CIC / Centro Integrado de Operações e Datalake',
        descricao:
          'Alimentação de webhooks em tempo real e APIs REST para visualização das leituras inerciais no painel de comando operacional do município e integração Waze for Cities.',
        prazoSugerido: '30 dias',
        baseLegal: 'Padrões de Interoperabilidade de Governo Eletrônico (e-PING)',
        entregavel: 'Webhooks configurados e Chaves de API ativas no CIC',
        orgaosResponsaveis: ['Secretaria de Tecnologia da Informação / Datalake', 'CIC'],
      },
      {
        ordem: 3,
        ano: 'Mês 03',
        fase: 'Referência Nacional',
        titulo: 'Publicação do Observatório de Dados Abertos e Selo Visão Zero',
        descricao:
          'Disponibilização pública do inventário de segurança viária no Portal da Transparência e envio do case aos órgãos de trânsito e redes de inovação pública.',
        prazoSugerido: '30 dias',
        baseLegal: 'Lei de Acesso à Informação (Lei 12.527/2011) e PNATRANS',
        entregavel: 'Painel do Cidadão Ativo e Relatório de Impacto Federativo',
        orgaosResponsaveis: ['Gabinete', 'Comunicação Social', 'Secretaria de Trânsito'],
      },
    ],
  },
}

export function getTrilhaPorFaixa(
  faixa: 'pioneiro' | 'estruturada' | 'consolidacao' | 'enquadramento',
): TrilhaFaixaConfig {
  return TRILHAS_POR_FAIXA[faixa] || TRILHAS_POR_FAIXA.enquadramento
}
