/**
 * Fontes Alternativas de Custeio — ORBIS.UOS
 * Destinado a municípios não municipalizados (onde multas municipais são inexistentes ou recolhidas pelo Estado)
 * ou que buscam alavancagem fiscal via transferências federais, convênios e emendas.
 * Princípio institucional: Nunca citar órgãos específicos sem acordo vigente — apenas programas e leis públicas.
 */

export interface FonteAlternativaItem {
  id: string
  titulo: string
  esfera: 'Federal' | 'Estadual' | 'Legislativo' | 'Inovação'
  baseLegal: string
  modalidade: string
  descricao: string
  nexoGovtech: string
  janelaAcesso: string
  prioridadeIndicada: 'Alta' | 'Média' | 'Complementar'
}

export interface FontesAlternativasResult {
  municipio: string
  uf: string
  isNaoMunicipalizado: boolean
  valorSiconfiHistorico?: number // valor em urbanismo/transporte nos últimos 3 anos
  fontes: FonteAlternativaItem[]
  orientacaoInstitucional: string
}

export function obterFontesAlternativasCusteio(params: {
  municipio: string
  uf: string
  isNaoMunicipalizado: boolean
  valorSiconfiTransporte?: number
  valorSiconfiUrbanismo?: number
}): FontesAlternativasResult {
  const { municipio, uf, isNaoMunicipalizado } = params
  const somaFederal = (params.valorSiconfiTransporte || 0) + (params.valorSiconfiUrbanismo || 0)
  const valorHistorico = somaFederal > 0 ? somaFederal : 37000000 // default ilustrativo caso nulo

  const fontes: FonteAlternativaItem[] = [
    {
      id: 'emendas-parlamentares',
      titulo: 'Emendas Parlamentares Individuais e de Bancada (RP 6 / RP 7)',
      esfera: 'Legislativo',
      baseLegal:
        'Art. 166 e 166-A da Constituição Federal (Emendas Especiais e com Finalidade Definida)',
      modalidade: 'Transferência Especial Direta ou Convênio Plataforma Transferegov',
      descricao:
        'Recursos de emendas parlamentares destinadas à modernização de infraestrutura urbana, pavimentação sustentável e segurança pública municipal.',
      nexoGovtech:
        'A plataforma ORBIS.UOS fornece o laudo técnico georreferenciado e o inventário com hash SHA-256 exigidos pelos órgãos repassadores para justificar a destinação e eficácia da emenda.',
      janelaAcesso: 'Abertura anual do Orçamento Geral da União (OGU) e remanejamentos',
      prioridadeIndicada: 'Alta',
    },
    {
      id: 'programa-mobilidade-urbana',
      titulo: 'Programas Federais de Apoio à Mobilidade Urbana e Qualificação Viária',
      esfera: 'Federal',
      baseLegal:
        'Lei Federal nº 12.587/2012 (Política Nacional de Mobilidade Urbana) e Normativas do Ministério das Cidades',
      modalidade: 'Termo de Compromisso / Convênio Fundo a Fundo ou Caixa Econômica Federal',
      descricao:
        'Linhas de transferência voluntária voltadas à redução de acidentalidade, acessibilidade e pavimentação com auditoria de qualidade.',
      nexoGovtech:
        'O CPSI qualifica o município na priorização técnica dos recursos federais, atendendo ao critério de governança digital preconizado pela Lei 14.129/2021.',
      janelaAcesso: 'Editais públicos periódicos e chamadas públicas federais',
      prioridadeIndicada: 'Alta',
    },
    {
      id: 'convenio-estadual-detran',
      esfera: 'Estadual',
      titulo: 'Convênios de Cooperação Técnica com Órgão Executivo de Trânsito Estadual',
      baseLegal:
        'Art. 22 e 25 da Lei Federal nº 9.503/1997 (Delegação e Compartilhamento de Competências)',
      modalidade: 'Termo de Cooperação Técnica e Financeira',
      descricao:
        'Para municípios não municipalizados, o Estado arrecada as multas do perímetro urbano. É plenamente legítimo solicitar repasse ou contrapartida técnica para sinalização e engenharia de tráfego local.',
      nexoGovtech:
        'Apresentação do dossiê de criticidade gerado pelo ORBIS.UOS comprova a necessidade de investimento estadual nos cruzamentos municipais com maiores sinistros.',
      janelaAcesso: 'Fluxo contínuo mediante provocação formal do Gabinete do Prefeito',
      prioridadeIndicada: 'Alta',
    },
    {
      id: 'marco-legal-startups',
      titulo: 'Recursos Ordinários Municipais com Despesa Limitada via CPSI (Art. 27 LC 182/2021)',
      esfera: 'Inovação',
      baseLegal: 'Lei Complementar Federal nº 182/2021 (Contrato Público para Solução Inovadora)',
      modalidade: 'Contratação Direta sob Rito Inovador (Teto de até R$ 1,6 milhão)',
      descricao:
        'Permite a contratação da fase de teste com recursos próprios livres (Fonte 1.500) com valor fracionado de baixo impacto fiscal e comprovação prévia de retorno financeiro.',
      nexoGovtech:
        'Dispensa licitação tradicional e foca em metas de resultado mensuráveis (km auditados, redução de acidentes e corte de retrabalho asfáltico).',
      janelaAcesso: 'Imediata mediante edição de Edital CPSI pelo município',
      prioridadeIndicada: 'Média',
    },
    {
      id: 'recuperacao-ativa-trauma',
      titulo: 'Otimização dos Gastos em Saúde (Custo do Trauma SUS)',
      esfera: 'Federal',
      baseLegal: 'Portarias do Sistema Único de Saúde (SUS) e Fundo Municipal de Saúde',
      modalidade: 'Realocação de Eficiência Fiscal Intersetorial',
      descricao:
        'A cada sinistro evitado em vias com moderação de tráfego, o município poupa em média R$ 25.000 em leitos de UTI, ortopedia e transporte de emergência, amortizando o custo de governança preditiva.',
      nexoGovtech:
        'Criação do nexo causal Saúde x Obras para sustentação do investimento pelo Fundo Municipal de Saúde.',
      janelaAcesso: 'Planejamento Orçamentário Plurianual (PPA e LOA)',
      prioridadeIndicada: 'Complementar',
    },
  ]

  const orientacaoInstitucional = isNaoMunicipalizado
    ? `Município não municipalizado: Como a arrecadação sancionatória direta de trânsito é recolhida pela esfera estadual, o município de ${municipio}/${uf} não depende exclusivamente do Art. 320 CTB. Os programas federais de mobilidade e emendas parlamentares oferecem amparo jurídico e dotação compatível para o custeio do piloto CPSI.`
    : `O município de ${municipio}/${uf} possui fontes híbridas: além da utilização do superávit do Art. 320 CTB, pode alavancar transferências voluntárias federais e emendas para ampliação da malha e obras corretivas pesadas.`

  return {
    municipio,
    uf,
    isNaoMunicipalizado,
    valorSiconfiHistorico: valorHistorico,
    fontes,
    orientacaoInstitucional,
  }
}
