import React from 'react'
import { Link } from 'react-router-dom'
import {
  Shield,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Layers,
  Activity,
  FileCheck2,
  Scale,
  Zap,
} from 'lucide-react'

export default function Metodologia() {
  return (
    <div className="min-h-screen bg-[#070D1F] text-[#F8FAFC] pt-24 pb-20">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar à Landing
          </Link>
          <span>/</span>
          <span className="text-[#3B82F6]">Metodologia Pública</span>
        </div>

        {/* Header */}
        <div className="space-y-3 pb-6 border-b border-[#1A2A5A]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-xs font-semibold text-[#60A5FA]">
            <Calendar className="w-3.5 h-3.5" />
            Versão 2.0 Homologada • Hierarquia de Índices (IMM/IMV/IMA) • Março de 2025
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Metodologia do Diagnóstico Institucional, do IMM e dos Sub-índices Setoriais
          </h1>
          <p className="text-sm text-[#94A3B8] leading-relaxed">
            Documentação técnica pública dos princípios, algoritmos de cálculo, matrizes de
            ponderação e bases legais que regem a plataforma ORBIS.UOS (Versão 2.0).
          </p>
        </div>

        {/* 1. Princípios Norteadores */}
        <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-4">
          <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#3B82F6]" />
            1. Princípios Norteadores da Metodologia
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-1" />
              <div>
                <b>Capacidade de Gestão, Não Gravidade do Problema:</b> O Diagnóstico Institucional
                avalia exclusivamente os instrumentos, rotinas e capacidade fiscal do município para
                solucionar a mobilidade, nunca punindo cidades por herdarem malhas viárias antigas.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-1" />
              <div>
                <b>Regra da Inclusão ("Não Sei" Não Zera):</b> Respostas desconhecidas pontuam no
                piso mínimo e acionam flags de assistência técnica institucional.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-1" />
              <div>
                <b>Regra de Justiça Relativa por Porte:</b> Cidades pequenas (até 50 mil hab.)
                possuem cortes adaptados. Perdem na quantidade absoluta de veículos mas compensam na
                alta cobertura percentual de rotas.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-1" />
              <div>
                <b>Piso Neutro para Não Municipalizados:</b> Municípios que ainda não
                municipalizaram o trânsito pelo Art. 24 do CTB recebem piso neutro de 2 pontos no
                Bloco 4 e flag de enquadramento estadual.
              </div>
            </div>
          </div>
        </div>

        {/* 2. Ponderação dos 6 Blocos Institucionais */}
        <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-4">
          <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#60A5FA]" />
            2. Ponderação do Diagnóstico Institucional (0 a 100)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
              <span className="text-[#3B82F6] font-bold block">Bloco 1 (10%)</span>
              <span className="text-[#F8FAFC] font-semibold block mt-0.5">
                Identificação & Órgão
              </span>
              <span className="text-[11px] text-[#94A3B8]">Art. 24 CTB, governança e tríade</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
              <span className="text-[#3B82F6] font-bold block">Bloco 2 (20%)</span>
              <span className="text-[#F8FAFC] font-semibold block mt-0.5">Malha Viária</span>
              <span className="text-[11px] text-[#94A3B8]">
                % pavimentada, ciclofaixas e modelo de vistoria
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
              <span className="text-[#10B981] font-bold block">Bloco 3 (25%)</span>
              <span className="text-[#F8FAFC] font-semibold block mt-0.5">
                Frota-Sensor Zero CAPEX
              </span>
              <span className="text-[11px] text-[#94A3B8]">
                Ônibus, coleta, viaturas e cobertura territorial
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
              <span className="text-[#F59E0B] font-bold block">Bloco 4 (20%)</span>
              <span className="text-[#F8FAFC] font-semibold block mt-0.5">
                Capacidade Art. 320 CTB
              </span>
              <span className="text-[11px] text-[#94A3B8]">
                Fundo de multas, saldo e situação no TCE
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
              <span className="text-[#3B82F6] font-bold block">Bloco 5 (10%)</span>
              <span className="text-[#F8FAFC] font-semibold block mt-0.5">PNATRANS</span>
              <span className="text-[11px] text-[#94A3B8]">Sinistros, óbitos/100k hab e metas</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0A1128] border border-[#1A2A5A]">
              <span className="text-[#3B82F6] font-bold block">Bloco 6 (15%)</span>
              <span className="text-[#F8FAFC] font-semibold block mt-0.5">Visão Zero</span>
              <span className="text-[11px] text-[#94A3B8]">
                Zonas 30, radares e custo do trauma SUS
              </span>
            </div>
          </div>
        </div>

        {/* 3. Hierarquia dos Índices e Arquitetura de Consolidação (Versão 2.0) */}
        <div className="p-6 rounded-2xl bg-[#0A1128] border-2 border-[#3B82F6]/50 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1A2A5A]">
            <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#3B82F6]" />
              3. Hierarquia dos Índices & Arquitetura de Consolidação (Versão 2.0)
            </h2>
            <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/15 px-2.5 py-1 rounded border border-[#10B981]/30">
              Revisão 2.0 • Março/2025
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            A Versão 2.0 da metodologia ORBIS.UOS estabelece a distinção precisa entre o{' '}
            <b>índice-síntese institucional</b> exibido ao Chefe do Executivo e os{' '}
            <b>sub-índices técnicos setoriais</b> que refletem as diferentes camadas da mobilidade
            física:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* IMM */}
            <div className="p-4 rounded-xl bg-[#101B3A] border-2 border-[#3B82F6]/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#60A5FA] text-sm">IMM</span>
                <span className="text-[10px] font-mono uppercase bg-[#3B82F6]/20 text-[#60A5FA] px-2 py-0.5 rounded font-bold">
                  Índice-Síntese
                </span>
              </div>
              <h3 className="font-bold text-[#F8FAFC] text-sm">
                Índice de Mobilidade do Município
              </h3>
              <p className="text-[#94A3B8] leading-relaxed text-[11px]">
                Número soberano no Modo Gabinete do Prefeito. Consolida os sub-índices setoriais
                ativos através de média ponderada declarada.
              </p>
              <div className="pt-1.5 border-t border-[#1A2A5A] text-[11px] font-mono text-[#CBD5E1]">
                <b>Consolidação atual:</b> 100% IMV
              </div>
            </div>

            {/* IMV */}
            <div className="p-4 rounded-xl bg-[#101B3A] border border-[#10B981]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#10B981] text-sm">IMV</span>
                <span className="text-[10px] font-mono uppercase bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded font-bold">
                  Sub-índice Físico
                </span>
              </div>
              <h3 className="font-bold text-[#F8FAFC] text-sm">Índice de Manutenção Viária</h3>
              <p className="text-[#94A3B8] leading-relaxed text-[11px]">
                Herda <b>intacto</b> o cálculo dos 4 pilares inerciais (IRI estimado, anomalias,
                aderência e criticidade) com validação tripla F ≥ 3.
              </p>
              <div className="pt-1.5 border-t border-[#1A2A5A] text-[11px] font-mono text-[#10B981]">
                <b>Status:</b> Operacional (Onda 1)
              </div>
            </div>

            {/* IMA */}
            <div className="p-4 rounded-xl bg-[#101B3A]/60 border border-[#1A2A5A] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#F59E0B] text-sm">IMA</span>
                <span className="text-[10px] font-mono uppercase bg-[#F59E0B]/20 text-[#F59E0B] px-2 py-0.5 rounded font-bold">
                  Sub-índice Futuro
                </span>
              </div>
              <h3 className="font-bold text-[#CBD5E1] text-sm">
                Índice de Manutenção de Acessibilidade
              </h3>
              <p className="text-[#64748B] leading-relaxed text-[11px]">
                Avaliação de calçadas/pedestres, ciclovias e micromobilidade urbana. Estrutura
                arquitetural preparada; coleta não realizada.
              </p>
              <div className="pt-1.5 border-t border-[#1A2A5A] text-[11px] font-mono text-[#F59E0B]">
                <b>Status:</b> Onda 3 (Planejado)
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-xs text-[#A7F3D0]">
            <b>Princípio da Honestidade Metodológica:</b> Sub-índices não calculados (como o IMA na
            Onda 3) jamais são preenchidos com dados fictícios ou estimativas arbitrárias. No
            Gabinete, o IMM apresenta com total transparência quais sub-índices compõem a nota no
            momento.
          </div>
        </div>

        {/* 4. Motor do IMV Físico (Auditoria Inercial Contínua da Malha Viária) */}
        <div className="p-6 rounded-2xl bg-[#0A1128] border border-[#3B82F6]/40 space-y-4">
          <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#10B981]" />
            4. Motor do IMV Físico (Auditoria Inercial Contínua da Malha Viária)
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            <p>
              O IMV (Índice de Manutenção Viária) é o sub-índice físico resultante da telemetria
              embarcada nos smartphones dos motoristas da frota municipal durante 30 dias
              ininterruptos de coleta passiva.
            </p>
            <div className="p-3.5 rounded-xl bg-[#101B3A] border border-[#1A2A5A] text-xs space-y-1.5 font-mono">
              <div className="text-[#60A5FA] font-bold">
                Redação Técnica Obrigatória do Banco Mundial:
              </div>
              <div className="text-[#F8FAFC]">
                "IRI estimado por telemetria inercial, correlacionado ao método do Banco Mundial"
              </div>
              <div className="text-[#94A3B8] text-[11px]">
                (Resposta vertical no eixo Z filtrada por velocidade, com calibração por Fator K de
                Chassi).
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-xs text-[#A7F3D0]">
              <b>Escudo Anti-Falso-Positivo (Fator de Confiança F):</b> Um defeito viário só se
              converte em Ordem de Serviço (OS) após o registro de{' '}
              <b>pelo menos 3 passagens de veículos distintos</b> no mesmo segmento de 100 metros.
              Registros solitários são descartados.
            </div>

            {/* Calibração Empírica do Fator K mantida integralmente */}
            <div className="p-4 rounded-xl bg-[#101B3A] border-2 border-[#3B82F6]/40 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#F8FAFC] text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                  Calibração Empírica do Fator K por Tipo de Veículo
                </span>
                <span className="text-[10px] font-mono text-[#60A5FA] bg-[#3B82F6]/15 px-2 py-0.5 rounded border border-[#3B82F6]/30">
                  Transparência de Cálculo
                </span>
              </div>
              <p className="text-[#CBD5E1] leading-relaxed">
                Cada categoria de veículo-sensor (ônibus urbano, viatura policial, caminhão de
                coleta, ambulância do SAMU ou frota leve) possui massa suspensa e curva de
                amortecimento distintas. Para assegurar que o IMV mensure exclusivamente o estado do
                pavimento — e não a dinâmica do chassi — o sistema opera calibração empírica do
                Fator K:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#94A3B8] pl-1 font-mono text-[11px]">
                <li>
                  <b className="text-[#F8FAFC]">Critério de Elegibilidade:</b> Apenas sessões e
                  janelas sobre segmentos de 100 metros com Fator de Confiança F ≥ 3 passagens
                  validadas são processadas para calibração.
                </li>
                <li>
                  <b className="text-[#F8FAFC]">
                    Método Primário (Razão em Segmentos Compartilhados):
                  </b>{' '}
                  Compara a aceleração vertical RMS e picos FFT da categoria avaliada em relação aos
                  demais veículos que trafegaram exatamente sobre o mesmo trecho físico.
                </li>
                <li>
                  <b className="text-[#F8FAFC]">Método Secundário (Fallback de RMS Absoluto):</b> Na
                  ausência temporária de sobreposição direta, aplica a razão da aceleração vertical
                  média do lote frente à linha de base calibrada da malha.
                </li>
                <li>
                  <b className="text-[#F8FAFC]">Trilha de Auditoria Institucional:</b> Nenhum fator
                  K é alterado em sigilo; toda aplicação grava o responsável, data/hora, valores
                  anteriores e motivo para fiscalização dos Tribunais de Contas (TCE/CGU).
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 5. Ações Orçamentárias e Curva de Degradação */}
        <div className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-4">
          <h2 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#F59E0B]" />
            5. Faixas de Intervenção do IMV, Custos e Economia de até 10x
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] font-mono uppercase text-[#94A3B8] border-b border-[#1A2A5A] bg-[#0A1128]">
                <tr>
                  <th className="py-2.5 px-3">Faixa IMV</th>
                  <th className="py-2.5 px-3">Classificação do Pavimento</th>
                  <th className="py-2.5 px-3">Ação Orçamentária Recomendada</th>
                  <th className="py-2.5 px-3">Custo Médio / m²</th>
                  <th className="py-2.5 px-3">Economia vs. Emergência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2A5A]">
                <tr>
                  <td className="py-3 px-3 font-mono font-bold text-[#10B981]">85 a 100</td>
                  <td className="py-3 px-3 font-semibold text-[#F8FAFC]">Pavimento Sadio</td>
                  <td className="py-3 px-3 text-[#CBD5E1]">Monitoramento Passivo</td>
                  <td className="py-3 px-3 font-mono text-[#10B981]">R$ 0/m²</td>
                  <td className="py-3 px-3 text-[#10B981] font-bold">100% de prevenção</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-mono font-bold text-[#3B82F6]">70 a 84</td>
                  <td className="py-3 px-3 font-semibold text-[#F8FAFC]">
                    Desgaste Superficial Precoce
                  </td>
                  <td className="py-3 px-3 text-[#CBD5E1]">
                    Microrrevestimento / Selagem de Trincas
                  </td>
                  <td className="py-3 px-3 font-mono text-[#60A5FA]">~R$ 18/m²</td>
                  <td className="py-3 px-3 text-[#10B981] font-bold">Até 10x menor</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-mono font-bold text-[#F59E0B]">50 a 69</td>
                  <td className="py-3 px-3 font-semibold text-[#F8FAFC]">
                    Degradação Moderada a Grave
                  </td>
                  <td className="py-3 px-3 text-[#CBD5E1]">Fresagem e Recapeamento CBUQ 3-5 cm</td>
                  <td className="py-3 px-3 font-mono text-[#F59E0B]">~R$ 65/m²</td>
                  <td className="py-3 px-3 text-[#F59E0B]">Economia moderada (3x)</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-mono font-bold text-[#EF4444]">0 a 49</td>
                  <td className="py-3 px-3 font-semibold text-[#F8FAFC]">
                    Colapso de Base Estrutural
                  </td>
                  <td className="py-3 px-3 text-[#CBD5E1]">
                    Reconstrução Profunda de Base e Asfalto
                  </td>
                  <td className="py-3 px-3 font-mono text-[#EF4444]">~R$ 190/m²</td>
                  <td className="py-3 px-3 text-[#EF4444]">Custo máximo (obra civil pesada)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Botão de retorno e ação */}
        <div className="pt-4 flex items-center justify-between">
          <Link
            to="/"
            className="text-xs font-semibold text-[#CBD5E1] hover:text-white flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para a página inicial
          </Link>

          <Link
            to="/enquadramento"
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-md shadow-[#3B82F6]/30 transition-all"
          >
            Iniciar Enquadramento do Município
          </Link>
        </div>
      </div>
    </div>
  )
}
