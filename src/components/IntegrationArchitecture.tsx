import React from 'react'
import {
  Server,
  Cpu,
  Layers,
  Radio,
  Share2,
  Workflow,
  ShieldCheck,
  Zap,
  Globe,
  Database,
  CheckCircle2,
  Lock,
} from 'lucide-react'
import { CityTier } from './Hero'

interface IntegrationArchitectureProps {
  selectedTier: CityTier
}

export function IntegrationArchitecture({ selectedTier }: IntegrationArchitectureProps) {
  const architectures = [
    {
      category: 'Engenharia Semafórica & Mobilidade',
      title: 'Green Light Bridge & Insumos Semafóricos',
      tag: 'Insumo de Tráfego & Fluidez',
      description:
        'Camada de abstração e insumos de sincronismo semafórico para engenharia de tráfego, estruturada para integração com controladores (Siemens, Dataprom, Digicon, Meng Engenharia) mediante parceria técnica com os fornecedores. Subsídios a planos de tempo e laços virtuais lógicos alimentados pela telemetria inercial passiva.',
      protocols: [
        'NTCIP 1202 (Roadmap)',
        'Green Light API',
        'Modbus / RS-485',
        'MQTT / WebSocket Seguros',
      ],
      icon: Zap,
    },
    {
      category: 'Padrões Globais de Transporte Aberto',
      title: 'Interoperabilidade GTFS, GTFS-RT, MDS & GBFS',
      tag: 'Padrão Internacional Aberto',
      description:
        'Ingestão e publicação de dados abertos para o ecossistema de transporte metropolitano. Geração de camadas em tempo real para cálculo de irregularidade por linha de ônibus (GTFS-RT VehiclePositions & TripUpdates) e governança de micromobilidade compartilhada (MDS / GBFS).',
      protocols: [
        'GTFS Realtime (Protobuf)',
        'Mobility Data Spec (MDS 2.0)',
        'GBFS v2.3',
        'GeoJSON / OGC WFS',
      ],
      icon: Globe,
    },
    {
      category: 'ERPs Públicos & Gestão de Zeladoria',
      title: 'Integração com Centrais 156, Obras & Tributos',
      tag: 'Governança & Despacho de OS',
      description:
        'Conectores e APIs documentadas para integração com sistemas de protocolo, orçamento e obras dos principais ERPs municipais (Betha, IPM Sistemas, Betha Cloud, Atende.Net, Fly e-Cidades, CIGA). Permite subsidiar a abertura e despacho de Ordens de Serviço quando integrado ao ERP do órgão.',
      protocols: [
        'RESTful / OpenAPI 3.1',
        'Webhooks HMAC-SHA256',
        'XML / JSON e-Gov',
        'ISO 37120 KPIs',
      ],
      icon: Database,
    },
    {
      category: 'Camada de Borda (SDK Edge & FFT)',
      title: 'Pipeline Inercial Embarcado nos Aplicativos da Frota',
      tag: 'Zero CAPEX • 1,2–1,8%/h Bateria',
      description:
        'SDK leve que se integra aos aplicativos já usados pelos motoristas (rastreamento, fiscalização, coleta). Processa a aceleração Z localmente com janelamento Hanning e FFT 1–20 Hz, descartando 99,8% do ruído e transmitindo apenas a assinatura do evento viário.',
      protocols: [
        'DeviceMotion W3C API',
        'Fast Fourier Transform (FFT Radix-2)',
        'Filtro Passa-Banda 1–20Hz',
        'Criptografia TLS 1.3 / mTLS',
      ],
      icon: Cpu,
    },
  ]

  return (
    <section className="py-20 relative bg-[#070D1F] border-t border-[#1A2A5A]/50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101B3A] border border-[#1A2A5A] text-xs font-semibold text-[#3B82F6]">
            <Server className="w-3.5 h-3.5" />
            <span>Arquitetura de Integração Aberta & Interoperabilidade</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
            Projetado para Conectar com os Sistemas que a Sua Cidade Já Usa
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            Sem lock-in proprietário. O ORBIS.UOS atua como camada de orquestração sobre a
            infraestrutura semafórica existente, ERPs municipais e frotas de transporte coletivo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {architectures.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="p-6 rounded-2xl bg-[#101B3A] border border-[#1A2A5A] hover:border-[#3B82F6]/60 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-[#0A1128] text-[#10B981] px-2.5 py-1 rounded border border-[#1A2A5A] font-bold">
                      {item.tag}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] block">
                      {item.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-[#F8FAFC] tracking-tight mt-0.5">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-xs text-[#CBD5E1] leading-relaxed">{item.description}</p>
                </div>

                <div className="pt-4 border-t border-[#1A2A5A]/60">
                  <span className="text-[10px] uppercase font-mono text-[#94A3B8] block mb-2">
                    Protocolos e Padrões Suportados:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.protocols.map((p, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono text-[#60A5FA] bg-[#0A1128] px-2 py-0.5 rounded border border-[#1A2A5A]"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Nota Institucional de Posicionamento Arquitetural */}
        <div className="p-4 rounded-xl bg-[#101B3A]/40 border border-[#1A2A5A] flex items-center gap-3 text-xs text-[#94A3B8]">
          <ShieldCheck className="w-5 h-5 text-[#10B981] shrink-0" />
          <span>
            <b>Posicionamento de Engenharia:</b> O ORBIS.UOS produz insumos de decisão e não requer
            a substituição de controladores de tráfego, softwares de zeladoria ou bilhetagem
            eletrônica. A integração com controladores semafóricos opera mediante parceria técnica
            com os fornecedores e barramentos seguros de dados.
          </span>
        </div>
      </div>
    </section>
  )
}
