import React, { useState } from 'react'
import {
  Code,
  Globe,
  Database,
  Key,
  Layers,
  ArrowRight,
  Shield,
  Copy,
  Check,
  ExternalLink,
  Cpu,
  RefreshCw,
  Terminal,
  FileCode2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { OrbisLogo } from '@/components/OrbisLogo'

interface EndpointDoc {
  method: 'GET' | 'POST'
  path: string
  title: string
  description: string
  status: 'disponivel' | 'roadmap'
  authRequired: boolean
  updateFrequency: string
  format: 'JSON' | 'GeoJSON' | 'GTFS / CSV' | 'NTCIP 1202'
  sampleResponse: string
}

export default function Interoperabilidade() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [selectedFormat, setSelectedFormat] = useState<string>('todos')

  const endpoints: EndpointDoc[] = [
    {
      method: 'GET',
      path: '/backend/v1/telemetry/imm-segments',
      title: 'Índice de Manutenção Viária (IMV) e IMM por Segmento',
      description:
        'Exportação georreferenciada das notas do IMV (Índice de Manutenção Viária) e IMM calculadas para cada trecho viário de 100 metros. Contém os pilares A (Aceleração Vertical Z / IRI), B (Fator de Confiança F ≥ 3) e C (Aderência e Drenagem).',
      status: 'disponivel',
      authRequired: true,
      updateFrequency: 'Diária (consolidada a cada 24h)',
      format: 'GeoJSON',
      sampleResponse: `{
  "type": "FeatureCollection",
  "municipio_ibge": "4106902",
  "timestamp": "2025-02-23T04:00:00Z",
  "metodologia_versao": "2.0",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "segment_id": "seg_pr_ctba_84920",
        "imv_score": 78.4,
        "imm_sintese_score": 78.4,
        "faixa_criticidade": "critica",
        "pilar_a_aceleracao_z": 4.12,
        "pilar_b_passagens_confianca": 8,
        "pilar_c_dispersao": 0.91,
        "trecho_nome": "Av. Marechal Floriano Peixoto, 1200-1300",
        "tipo_pavimento": "CBUQ"
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [-49.2731, -25.4382],
          [-49.2740, -25.4390]
        ]
      }
    }
  ]
}`,
    },
    {
      method: 'GET',
      path: '/backend/v1/safety/prioridade-zero',
      title: 'Matriz de Prioridade Zero (Cruzamento Asfalto × Sinistros × Escolas)',
      description:
        'Retorna a lista priorizada dos pontos viários com maior risco à vida humana, cruzando anomalias asfálticas inerciais com histórico de atropelamentos e áreas de proteção escolar.',
      status: 'disponivel',
      authRequired: true,
      updateFrequency: 'Semanal / Sob Demanda',
      format: 'JSON',
      sampleResponse: `{
  "protocolo_matriz": "PZ-4106902-2025-02",
  "total_trechos_prioritarios": 12,
  "itens": [
    {
      "id": "pz-01",
      "segmento": "Av. Central / Trecho Escolar",
      "bairro": "Centro",
      "score_prioridade_zero": 96.0,
      "criticidade_asfalto": "critica",
      "historico_atropelamentos_24m": 4,
      "raio_escolar_metros": 80,
      "recomendacao_engenharia": "Fresagem imediata + faixa elevada + Zona 30 km/h"
    }
  ]
}`,
    },
    {
      method: 'GET',
      path: '/backend/v1/telemetry/leituras-agregadas',
      title: 'Leituras Inerciais Agregadas e Anomalias Detectadas',
      description:
        'Série histórica agregada das leituras dos sensores embarcados (aceleração Z em m/s², velocidade e frequência FFT em Hz). Todos os dados são 100% anonimizados em conformidade com a LGPD.',
      status: 'disponivel',
      authRequired: true,
      updateFrequency: 'A cada 15 minutos (Near Realtime)',
      format: 'JSON',
      sampleResponse: `{
  "aggregation_window_minutes": 15,
  "total_amostras_processadas": 14280,
  "anomalias_detectadas": [
    {
      "id": "ano-9912",
      "tipo": "buraco_impacto_severo",
      "latitude": -25.4284,
      "longitude": -49.2733,
      "pico_aceleracao_z_g": 3.84,
      "frequencia_dominante_hz": 18.5,
      "veiculo_categoria": "coleta_urbana",
      "confirmacao_passagens": 4
    }
  ]
}`,
    },
    {
      method: 'POST',
      path: '/backend/v1/webhooks/subscribe',
      title: 'Webhooks de Alertas Críticos em Tempo Real',
      description:
        'Registro de URL de callback do município (CIC - Centro Integrado de Comando, Defesa Civil ou Datalake municipal) para disparo automático quando uma anomalia severa ou afundamento repentino for identificado.',
      status: 'disponivel',
      authRequired: true,
      updateFrequency: 'Disparo Imediato no Evento (Push HTTP POST)',
      format: 'JSON',
      sampleResponse: `{
  "webhook_id": "whk_curitiba_cic_01",
  "event_type": "anomalia_critica_detectada",
  "dispatched_at": "2025-02-23T14:22:10Z",
  "payload": {
    "alerta": "Afundamento asfáltico severo com risco de colapso de drenagem",
    "coordenadas": [-49.2689, -25.4312],
    "severidade": "critica",
    "acao_sugerida": "Interdição parcial e envio de equipe de engenharia"
  }
}`,
    },
    {
      method: 'GET',
      path: '/backend/v1/interop/gtfs-rt-delay',
      title: 'Interoperabilidade GTFS e Atrasos Operacionais por Tráfego',
      description:
        'Conexão com os feeds General Transit Feed Specification (GTFS-RT) do transporte coletivo municipal, correlacionando trechos de asfalto degradado com atrasos nas linhas de ônibus.',
      status: 'roadmap',
      authRequired: true,
      updateFrequency: 'Planejado para Q2/2025',
      format: 'GTFS / CSV',
      sampleResponse: `{
  "status": "em_desenvolvimento",
  "padrao": "GTFS-Realtime Service Alerts & Trip Updates",
  "previsao_lancamento": "Q2/2025",
  "compatibilidade": ["URBS", "SPTrans", "BHTRANS", "OpenTripPlanner"]
}`,
    },
    {
      method: 'GET',
      path: '/backend/v1/interop/ntcip-1202-actuation',
      title: 'Padrão NTCIP 1202 (Controle de Atuação Semafórica)',
      description:
        'Compatibilidade com controladores semafóricos NTCIP 1202 e SCOOT/SCATS para priorização semafórica preventiva e desaceleração automática em trechos com alta severidade de sinistralidade.',
      status: 'roadmap',
      authRequired: true,
      updateFrequency: 'Planejado para Q3/2025',
      format: 'NTCIP 1202',
      sampleResponse: `{
  "status": "em_desenvolvimento",
  "protocolo": "NTCIP 1202 v03 (National Transportation Communications for ITS Protocol)",
  "previsao_lancamento": "Q3/2025",
  "destinacao": "Centrais Semafóricas Inteligentes e CIC"
}`,
    },
  ]

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const filteredEndpoints =
    selectedFormat === 'todos'
      ? endpoints
      : endpoints.filter((ep) => ep.format.toLowerCase().includes(selectedFormat.toLowerCase()))

  return (
    <div className="min-h-screen bg-[#070D1F] text-[#F8FAFC]">
      {/* Hero Header */}
      <section className="relative pt-24 pb-16 border-b border-[#1A2A5A] bg-gradient-to-b from-[#0A1128] via-[#070D1F] to-[#070D1F] overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-xs font-semibold text-[#60A5FA] mb-4">
            <Code className="w-3.5 h-3.5 text-[#3B82F6]" />
            Arquitetura Aberta & Interoperabilidade B2G
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#F8FAFC] tracking-tight max-w-3xl">
            Documentação de API, Webhooks & Interoperabilidade
          </h1>

          <p className="text-base sm:text-lg text-[#94A3B8] max-w-3xl mt-4 leading-relaxed">
            Desenvolvido para atender aos requisitos de integração de grandes municípios: Centro
            Integrado de Comando (CIC), Datalakes municipais, plataformas Waze for Cities e sistemas
            de engenharia viária legados.
          </p>

          {/* Destaques Técnicos Rápidos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#1A2A5A]/80 text-xs">
            <div className="p-3.5 rounded-xl bg-[#101B3A]/60 border border-[#1A2A5A]">
              <span className="text-[#94A3B8] block text-[11px]">Autenticação</span>
              <span className="font-mono font-bold text-[#F8FAFC] text-sm mt-0.5 block">
                Bearer API Key / mTLS
              </span>
              <span className="text-[10px] text-[#10B981] mt-1 block">Criptografia RSA 4096</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#101B3A]/60 border border-[#1A2A5A]">
              <span className="text-[#94A3B8] block text-[11px]">Formatos Abertos</span>
              <span className="font-mono font-bold text-[#F8FAFC] text-sm mt-0.5 block">
                GeoJSON • JSON • GTFS
              </span>
              <span className="text-[10px] text-[#3B82F6] mt-1 block">e-PING / OGC Compliant</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#101B3A]/60 border border-[#1A2A5A]">
              <span className="text-[#94A3B8] block text-[11px]">Taxa de Atualização</span>
              <span className="font-mono font-bold text-[#F8FAFC] text-sm mt-0.5 block">
                Near Realtime (15 min)
              </span>
              <span className="text-[10px] text-[#F59E0B] mt-1 block">
                Webhooks de push imediato
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#101B3A]/60 border border-[#1A2A5A]">
              <span className="text-[#94A3B8] block text-[11px]">Privacidade dos Dados</span>
              <span className="font-mono font-bold text-[#F8FAFC] text-sm mt-0.5 block">
                LGPD Blindada
              </span>
              <span className="text-[10px] text-[#10B981] mt-1 block">Anonimização agregada</span>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Principal de Endpoints */}
      <section className="py-12 sm:py-16 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filtros e Diretrizes */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
              Catálogo de Endpoints e Eventos
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
              Consulte os endpoints operacionais homologados e os serviços previstos no roadmap
              institucional.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#94A3B8]">Filtrar por formato:</span>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="h-9 px-3 rounded-lg bg-[#101B3A] border border-[#1A2A5A] text-xs text-[#F8FAFC]"
            >
              <option value="todos">Todos os formatos</option>
              <option value="geojson">GeoJSON</option>
              <option value="json">JSON</option>
              <option value="gtfs">GTFS</option>
              <option value="ntcip">NTCIP 1202</option>
            </select>
          </div>
        </div>

        {/* Lista de Endpoints */}
        <div className="space-y-6">
          {filteredEndpoints.map((ep, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#0A1128] border border-[#1A2A5A] p-6 hover:border-[#3B82F6]/50 transition-all space-y-4"
            >
              {/* Endpoint Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase ${
                      ep.method === 'GET'
                        ? 'bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30'
                        : 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="font-mono text-sm sm:text-base font-bold text-[#F8FAFC]">
                    {ep.path}
                  </span>
                  {ep.status === 'disponivel' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40">
                      Disponível v1.0
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40">
                      Roadmap 2025
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8]">
                  <span className="px-2 py-0.5 rounded bg-[#101B3A] border border-[#1A2A5A]">
                    {ep.format}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#101B3A] border border-[#1A2A5A]">
                    {ep.updateFrequency}
                  </span>
                </div>
              </div>

              {/* Endpoint Body */}
              <div>
                <h3 className="text-base font-bold text-[#F8FAFC]">{ep.title}</h3>
                <p className="text-xs sm:text-sm text-[#94A3B8] mt-1.5 leading-relaxed">
                  {ep.description}
                </p>
              </div>

              {/* Code Snippet Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#94A3B8]">
                  <span>Exemplo de Payload / Resposta:</span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(ep.sampleResponse, idx)}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#10B981]" />
                        <span className="text-[#10B981]">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#3B82F6]" />
                        <span>Copiar JSON</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-[#070C1D] border border-[#1A2A5A] text-xs font-mono text-[#CBD5E1] overflow-x-auto max-h-64 leading-relaxed">
                  <code>{ep.sampleResponse}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Seção Autenticação e Boas Práticas B2G */}
      <section className="py-12 bg-[#0A1128] border-t border-[#1A2A5A]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-[#F8FAFC]">
              Autenticação, Governança e Segurança
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
              Padrões adotados para garantir fé pública, rastreabilidade e integridade perante os
              órgãos de controle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#CBD5E1]">
            <div className="p-5 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
              <Key className="w-5 h-5 text-[#3B82F6]" />
              <h4 className="text-sm font-bold text-[#F8FAFC]">Chaves de API Institucionais</h4>
              <p className="text-[#94A3B8] leading-relaxed">
                As requisições exigem o header <code>Authorization: Bearer orbis_live_...</code>. A
                emissão de chaves é atrelada ao CNPJ do município e ao CPF do Secretário gestor, com
                registro inalterável em trilha de auditoria.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
              <Shield className="w-5 h-5 text-[#10B981]" />
              <h4 className="text-sm font-bold text-[#F8FAFC]">Conformidade LGPD & Anonimização</h4>
              <p className="text-[#94A3B8] leading-relaxed">
                Nenhum identificador pessoal (nome do motorista, placa do veículo ou trajeto
                individual residencial) é exposto nas APIs. Todas as grandezas inerciais são
                agregadas em malhas viárias de 100 metros.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] space-y-2">
              <Cpu className="w-5 h-5 text-[#F59E0B]" />
              <h4 className="text-sm font-bold text-[#F8FAFC]">Conexão CIC & Waze for Cities</h4>
              <p className="text-[#94A3B8] leading-relaxed">
                A camada de interoperabilidade disponibiliza feeds estruturados compatíveis com os
                padrões mundiais de mobilidade urbana (GTFS e NTCIP 1202), integrando-se sem atrito
                aos Centros Integrados de Comando já existentes.
              </p>
            </div>
          </div>

          {/* Banner de Chamada para Gabinete */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#101B3A] to-[#1A2A5A] border border-[#3B82F6]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-[#F8FAFC]">
                Precisa de uma chave de homologação para o Datalake do seu Município?
              </h4>
              <p className="text-xs text-[#94A3B8] mt-1">
                Acesse o ambiente institucional do município para solicitar credenciais do ambiente
                Sandbox.
              </p>
            </div>

            <Link
              to="/enquadramento"
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-lg shadow-[#3B82F6]/30 flex items-center gap-2 shrink-0 transition-all"
            >
              <span>Acessar Enquadramento CPSI</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
