/**
 * Plano de Aplicação de Saldo Represado do Art. 320 do CTB — ORBIS.UOS
 * Gerado imediatamente quando o flag de apontamento TCE / superávit financeiro é acionado.
 * Dá resposta célere e fundamentada à Controladoria e Tribunal de Contas do Estado.
 */

export interface ItemCronogramaSaldo {
  etapa: string
  prazoMeses: string
  percentualSaldo: number
  valorEstimado: number
  destinacaoLegal: string
  vinculoPrograma: string
  statusControle: 'imediato' | 'curto_prazo' | 'medio_prazo'
}

export interface PlanoSaldoRepresadoResult {
  municipio: string
  uf: string
  saldoRepresadoInformado: number
  arrecadacaoAnualInformada: number
  baseLegalPrincipal: string
  enquadramentoTceSumario: string
  cronograma: ItemCronogramaSaldo[]
  argumentoContabil: string
  recomendacaoImediata: string
}

export function gerarPlanoSaldoRepresado(params: {
  municipio: string
  uf: string
  saldoRepresado: number
  arrecadacaoAnual?: number
  populacao?: number
}): PlanoSaldoRepresadoResult {
  const muni = params.municipio || 'Município'
  const uf = params.uf || 'UF'
  const saldo = params.saldoRepresado > 0 ? params.saldoRepresado : 850000
  const arrecadacao = params.arrecadacaoAnual || Math.max(saldo * 1.5, 1200000)

  // Distribuição obrigatória do Art. 320 CTB:
  // - 5% FUNSET (recolhimento federal obrigatório)
  // - Restante 95%: exclusivamente sinalização, engenharia de tráfego, de campo, policiamento, fiscalização e educação de trânsito.
  // Proposta do Plano de Aplicação estruturado no programa ORBIS.UOS:
  const valorEngenhariaSinalizacao = Math.round(saldo * 0.45)
  const valorAuditoriaInovadora = Math.round(saldo * 0.25)
  const valorEducacaoFiscalizacao = Math.round(saldo * 0.2)
  const valorReservaContingencia = Math.round(saldo * 0.1)

  const cronograma: ItemCronogramaSaldo[] = [
    {
      etapa: '1. Auditoria e Diagnóstico da Malha Viária (Piloto CPSI)',
      prazoMeses: 'Mês 01 a 03',
      percentualSaldo: 25,
      valorEstimado: valorAuditoriaInovadora,
      destinacaoLegal: 'Engenharia de Tráfego e Governança Preditiva (Art. 320 CTB)',
      vinculoPrograma:
        'Contrato Público para Solução Inovadora (LC 182/2021) — Mapeamento contínuo do IMM e pontos críticos de sinistralidade.',
      statusControle: 'imediato',
    },
    {
      etapa: '2. Intervenções Prioritárias em Zonas Escolares e Corredores Críticos',
      prazoMeses: 'Mês 03 a 08',
      percentualSaldo: 45,
      valorEstimado: valorEngenhariaSinalizacao,
      destinacaoLegal: 'Sinalização Horizontal, Vertical e Moderação de Tráfego',
      vinculoPrograma:
        'Execução das intervenções priorizadas pela Matriz de Prioridade Zero (revitalização asfáltica, faixas elevadas e semaforização).',
      statusControle: 'curto_prazo',
    },
    {
      etapa: '3. Fiscalização Eletrônica Preventiva e Educação para o Trânsito',
      prazoMeses: 'Mês 06 a 12',
      percentualSaldo: 20,
      valorEstimado: valorEducacaoFiscalizacao,
      destinacaoLegal: 'Fiscalização Operacional e Campanhas Educativas de Visão Zero',
      vinculoPrograma:
        'Aquisição de equipamentos de fiscalização e campanhas nas escolas mapeadas com alto índice de atropelamentos.',
      statusControle: 'medio_prazo',
    },
    {
      etapa: '4. Fundo de Reserva Técnica e Manutenção Preventiva Contínua',
      prazoMeses: 'Mês 09 a 18',
      percentualSaldo: 10,
      valorEstimado: valorReservaContingencia,
      destinacaoLegal: 'Engenharia de Campo e Manutenção Emergencial Segregada',
      vinculoPrograma:
        'Atendimento a apontamentos sazonais de drenagem e conservação viária georreferenciada.',
      statusControle: 'medio_prazo',
    },
  ]

  const enquadramentoTceSumario = `O Tribunal de Contas do Estado (TCE) veda a utilização do superávit do Art. 320 em despesas gerais da administração (como folha de pagamento ordinária ou despesas de custeio não correlatas). O presente Plano de Aplicação confere nexo causal estrito e auditável, demonstrando que 100% dos R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} serão canalizados para a preservação de vidas e modernização da engenharia de tráfego, afastando o risco de rejeição de contas.`

  const argumentoContabil = `Classificação Orçamentária Sugerida: Fonte de Recursos 1.753 (Recursos de Multas de Trânsito) • Função 15.452 (Serviços Urbanos) / 06.181 (Policiamento e Segurança Viária) • Natureza de Despesa 3.3.90.39 (Outros Serviços de Terceiros - PJ). Atendimento formal ao Princípio da Vinculação da Receita Tributária/Sancionatória.`

  const recomendacaoImediata = `Emitir Decreto Municipal homologando o Plano de Aplicação do Saldo do Fundo de Trânsito e submeter à PGM e à Controladoria Interna em até 15 dias para juntada nos autos do processo do TCE.`

  return {
    municipio: muni,
    uf,
    saldoRepresadoInformado: saldo,
    arrecadacaoAnualInformada: arrecadacao,
    baseLegalPrincipal: 'Art. 320 da Lei Federal nº 9.503/1997 (CTB) e LC nº 182/2021',
    enquadramentoTceSumario,
    cronograma,
    argumentoContabil,
    recomendacaoImediata,
  }
}
