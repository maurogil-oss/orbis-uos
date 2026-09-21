// Hook do Ambiente Sandbox Público com Dados Sintéticos GeoJSON (RFC 7946)
// Endpoints:
// 1. GET /backend/v1/sandbox/h3-cells - Células H3 sintéticas com k-anonimato (k=3)
// 2. GET /backend/v1/sandbox/imm-segments - Segmentos viários sintéticos com notas IMV/IMM
// 3. GET /backend/v1/sandbox/prioridade-zero - Matriz sintética de risco prioritário
// 4. GET /backend/v1/sandbox/leituras-agregadas - Leituras inerciais sintéticas (aceleração Z e FFT)
//
// REQUISITO ESTRITO:
// - Dados 100% SINTÉTICOS de demonstração (não reais) claramente identificados
// - NÃO toca nas collections de telemetria real (segment_readings, road_events, etc.)
// - O k-anonimato (≥3 sessões por célula H3) PERMANECE APLICADO mesmo no sandbox:
//   células com < 3 sessões sintéticas retornam score: null e status: "nao_auditado".

routerAdd('GET', '/backend/v1/sandbox/h3-cells', (e) => {
  let filterModo = ''
  let maxCells = 20
  try {
    const q = e.requestInfo().query
    if (q && q.modo) {
      filterModo = String(q.modo).trim()
    }
    if (q && q.limit) {
      maxCells = Math.min(Math.max(parseInt(q.limit, 10) || 12, 1), 50)
    }
  } catch (_) {}

  // 100% sintético: Vias fictícias claramente identificadas como demonstração
  const syntheticPoints = [
    {
      via: 'Av. Demo Experimental 1 (Corredor BRT Sintético)',
      bairro: 'Distrito Modelo Alfa',
      lat: -25.4385,
      lng: -49.2735,
      sessions: 6, // k >= 3 -> OK
      imv: 82.5,
      ima: null,
      modo: 'veiculo_frota',
    },
    {
      via: 'Av. Demo Experimental 2 (Ciclovia Piloto Sintética)',
      bairro: 'Distrito Modelo Alfa',
      lat: -25.4425,
      lng: -49.2818,
      sessions: 5, // k >= 3 -> OK
      imv: 89.2,
      ima: 93.4,
      modo: 'ciclista',
    },
    {
      via: 'Rua Simulada de Teste 3 (Calçadão Pedonal)',
      bairro: 'Distrito Modelo Central',
      lat: -25.4315,
      lng: -49.2708,
      sessions: 4, // k >= 3 -> OK
      imv: null,
      ima: 87.1,
      modo: 'pedestre',
    },
    {
      via: 'Av. Integrador Exemplo 4 (Eixo Logístico)',
      bairro: 'Distrito Modelo Norte',
      lat: -25.4198,
      lng: -49.2685,
      sessions: 7, // k >= 3 -> OK
      imv: 64.0,
      ima: null,
      modo: 'veiculo_frota',
    },
    {
      via: 'Via Conectora Fictícia 5 (Trecho Ondulado)',
      bairro: 'Distrito Modelo Sul',
      lat: -25.4655,
      lng: -49.2928,
      sessions: 3, // k = 3 (limiar exato) -> OK
      imv: 49.8,
      ima: null,
      modo: 'veiculo_frota',
    },
    {
      via: 'Rua Motociclista Virtual 6',
      bairro: 'Distrito Modelo Leste',
      lat: -25.4478,
      lng: -49.2835,
      sessions: 4, // k >= 3 -> OK
      imv: 58.6,
      ima: null,
      modo: 'motociclista',
    },
    // Amostras abaixo do limiar (k < 3) -> k-anonimato OBRIGA score: null
    {
      via: 'Travessa Demonstração 7 (Poucas Leituras Sintéticas)',
      bairro: 'Distrito Modelo Periferia',
      lat: -25.4055,
      lng: -49.2665,
      sessions: 2, // k < 3 -> NÃO AUDITADO / SCORE NULL
      imv: 78.0,
      ima: null,
      modo: 'veiculo_frota',
    },
    {
      via: 'Rua Residencial Sintética 8 (Apenas 1 Passagem)',
      bairro: 'Distrito Modelo Periferia',
      lat: -25.4495,
      lng: -49.2455,
      sessions: 1, // k < 3 -> NÃO AUDITADO / SCORE NULL
      imv: 72.0,
      ima: null,
      modo: 'veiculo_frota',
    },
    {
      via: 'Alameda Fictícia 9 (Amostragem Insuficiente)',
      bairro: 'Distrito Modelo Oeste',
      lat: -25.4315,
      lng: -49.2968,
      sessions: 2, // k < 3 -> NÃO AUDITADO / SCORE NULL
      imv: 84.5,
      ima: null,
      modo: 'veiculo_frota',
    },
  ]

  const features = []
  let totalAuditadas = 0
  let totalNaoAuditadas = 0

  for (let i = 0; i < syntheticPoints.length; i++) {
    if (features.length >= maxCells) break
    const pt = syntheticPoints[i]
    if (filterModo && pt.modo !== filterModo) continue

    const isAtivo = pt.modo === 'pedestre' || pt.modo === 'ciclista' || pt.modo === 'motociclista'
    const resolution = isAtivo ? 10 : 9
    const edgeMeters = isAtivo ? 65 : 174

    // Gerar token determinístico H3
    const latRad = (pt.lat * Math.PI) / 180
    const mToLat = 1 / 111320
    const mToLng = 1 / (111320 * Math.cos(latRad))

    const ring = []
    for (let v = 0; v < 6; v++) {
      const angleRad = ((60 * v + 30) * Math.PI) / 180
      const dx = edgeMeters * Math.cos(angleRad)
      const dy = edgeMeters * Math.sin(angleRad)
      ring.push([
        Number((pt.lng + dx * mToLng).toFixed(6)),
        Number((pt.lat + dy * mToLat).toFixed(6)),
      ])
    }
    ring.push([ring[0][0], ring[0][1]])

    const kSatisfied = pt.sessions >= 3
    if (kSatisfied) {
      totalAuditadas++
    } else {
      totalNaoAuditadas++
    }

    const criticidade = !kSatisfied
      ? 'nao_auditado'
      : (pt.imv || pt.ima || 0) >= 85
        ? 'sadio'
        : (pt.imv || pt.ima || 0) >= 70
          ? 'desgaste'
          : (pt.imv || pt.ima || 0) >= 50
            ? 'degradado'
            : 'critico'

    const h3Index = (resolution === 10 ? '8a' : '89') + 'demo' + (i + 100).toString(16) + 'ffff'

    features.push({
      type: 'Feature',
      id: h3Index,
      geometry: {
        type: 'Polygon',
        coordinates: [ring],
      },
      properties: {
        h3_index: h3Index,
        resolution: resolution,
        edge_meters: edgeMeters,
        center_lat: pt.lat,
        center_lng: pt.lng,
        total_sessions: pt.sessions,
        k_anonymity_satisfied: kSatisfied,
        status: kSatisfied ? 'auditado' : 'nao_auditado',
        // K-ANONIMATO LGPD: se k < 3, nota é OBRIGATORIAMENTE NULL mesmo em sandbox
        imv_score: kSatisfied ? pt.imv : null,
        ima_score: kSatisfied ? pt.ima : null,
        criticidade: criticidade,
        modo_coleta: pt.modo,
        via_referencia: pt.via,
        bairro: pt.bairro,
        ambiente: 'SANDBOX_PUBLICO_SINTETICO',
        is_synthetic: true,
      },
    })
  }

  return e.json(200, {
    type: 'FeatureCollection',
    metadata: {
      ambiente: 'ORBIS_UOS_SANDBOX_DEMO',
      data_classification: 'DADOS_SINTETICOS_NAO_REAIS',
      rfc_standard: 'RFC 7946 GeoJSON Standard',
      spatial_indexing: 'Uber H3 Hexagonal Grid (Res 9 Veicular / Res 10 Modos Ativos)',
      k_anonymity_rule:
        'Art. 12 LGPD: Células com < 3 sessões retornam score: null e status: nao_auditado',
      k_anonymity_threshold: 3,
      total_cells: features.length,
      cells_auditadas: totalAuditadas,
      cells_nao_auditadas: totalNaoAuditadas,
      timestamp: new Date().toISOString(),
      documentacao_url: '/interoperabilidade',
      sandbox_playground_url: '/sandbox',
    },
    features: features,
  })
})

routerAdd('GET', '/backend/v1/sandbox/imm-segments', (e) => {
  const segments = [
    {
      segment_id: 'seg_demo_av1_01',
      trecho_nome: 'Av. Demo Experimental 1, Km 0 ao 1',
      tipo_pavimento: 'CBUQ (Asfalto Concreto Betuminoso)',
      imv_score: 82.5,
      imm_sintese_score: 81.0,
      faixa_criticidade: 'sadio',
      pilar_a_aceleracao_z: 1.85,
      pilar_b_passagens_confianca: 6,
      pilar_c_dispersao: 0.94,
      coordinates: [
        [-49.2735, -25.4385],
        [-49.2745, -25.4395],
      ],
    },
    {
      segment_id: 'seg_demo_av2_02',
      trecho_nome: 'Av. Demo Experimental 2 (Eixo Coletor)',
      tipo_pavimento: 'Pavimento Rígido / Concreto',
      imv_score: 54.2,
      imm_sintese_score: 53.0,
      faixa_criticidade: 'degradado',
      pilar_a_aceleracao_z: 3.42,
      pilar_b_passagens_confianca: 5,
      pilar_c_dispersao: 0.82,
      coordinates: [
        [-49.2685, -25.4198],
        [-49.2695, -25.4208],
      ],
    },
    {
      segment_id: 'seg_demo_av3_03',
      trecho_nome: 'Via Conectora Fictícia 5 (Trecho com Ondulação)',
      tipo_pavimento: 'TSD (Tratamento Superficial Duplo)',
      imv_score: 42.0,
      imm_sintese_score: 41.5,
      faixa_criticidade: 'critica',
      pilar_a_aceleracao_z: 4.88,
      pilar_b_passagens_confianca: 3,
      pilar_c_dispersao: 0.65,
      coordinates: [
        [-49.2928, -25.4655],
        [-49.2938, -25.4665],
      ],
    },
  ]

  const features = segments.map((s) => ({
    type: 'Feature',
    id: s.segment_id,
    geometry: {
      type: 'LineString',
      coordinates: s.coordinates,
    },
    properties: {
      segment_id: s.segment_id,
      trecho_nome: s.trecho_nome,
      tipo_pavimento: s.tipo_pavimento,
      imv_score: s.imv_score,
      imm_sintese_score: s.imm_sintese_score,
      faixa_criticidade: s.faixa_criticidade,
      pilar_a_aceleracao_z: s.pilar_a_aceleracao_z,
      pilar_b_passagens_confianca: s.pilar_b_passagens_confianca,
      pilar_c_dispersao: s.pilar_c_dispersao,
      ambiente: 'SANDBOX_PUBLICO_SINTETICO',
      is_synthetic: true,
    },
  }))

  return e.json(200, {
    type: 'FeatureCollection',
    metadata: {
      ambiente: 'ORBIS_UOS_SANDBOX_DEMO',
      data_classification: 'DADOS_SINTETICOS_NAO_REAIS',
      rfc_standard: 'RFC 7946 GeoJSON Standard',
      total_segments: features.length,
      timestamp: new Date().toISOString(),
    },
    features: features,
  })
})

routerAdd('GET', '/backend/v1/sandbox/prioridade-zero', (e) => {
  return e.json(200, {
    ambiente: 'ORBIS_UOS_SANDBOX_DEMO',
    data_classification: 'DADOS_SINTETICOS_NAO_REAIS',
    protocolo_matriz: 'PZ-DEMO-SINTETICO-2026',
    total_trechos_prioritarios: 3,
    itens: [
      {
        id: 'pz-demo-01',
        segmento: 'Av. Demo Experimental 1 / Cruzamento Escola Modelo',
        bairro: 'Distrito Modelo Alfa',
        score_prioridade_zero: 94.5,
        criticidade_asfalto: 'critica',
        historico_sinistros_24m: 3,
        raio_escolar_metros: 65,
        recomendacao_engenharia: 'Fresagem prioritária + Travessia Elevada para Pedestres',
        is_synthetic: true,
      },
      {
        id: 'pz-demo-02',
        segmento: 'Via Conectora Fictícia 5 / Trecho Curva Crítica',
        bairro: 'Distrito Modelo Sul',
        score_prioridade_zero: 88.0,
        criticidade_asfalto: 'alta',
        historico_sinistros_24m: 2,
        raio_escolar_metros: 120,
        recomendacao_engenharia: 'Recapeamento com micro-revestimento e sinalização refletiva',
        is_synthetic: true,
      },
      {
        id: 'pz-demo-03',
        segmento: 'Av. Demo Experimental 2 (Eixo Coletor)',
        bairro: 'Distrito Modelo Norte',
        score_prioridade_zero: 76.2,
        criticidade_asfalto: 'media',
        historico_sinistros_24m: 1,
        raio_escolar_metros: 180,
        recomendacao_engenharia: 'Selagem de trincas e monitoramento quinzenal',
        is_synthetic: true,
      },
    ],
    timestamp: new Date().toISOString(),
  })
})

routerAdd('GET', '/backend/v1/sandbox/leituras-agregadas', (e) => {
  return e.json(200, {
    ambiente: 'ORBIS_UOS_SANDBOX_DEMO',
    data_classification: 'DADOS_SINTETICOS_NAO_REAIS',
    aggregation_window_minutes: 15,
    total_amostras_sinteticas: 4800,
    anomalias_detectadas: [
      {
        id: 'ano-demo-001',
        tipo: 'buraco_impacto_severo',
        latitude: -25.4385,
        longitude: -49.2735,
        pico_aceleracao_z_g: 3.85,
        frequencia_dominante_hz: 18.2,
        energia_banda_alvo_pct: 78.4,
        veiculo_categoria: 'onibus_padron_demo',
        confirmacao_passagens: 4,
        is_synthetic: true,
      },
      {
        id: 'ano-demo-002',
        tipo: 'ondulacao_asfaltica',
        latitude: -25.4198,
        longitude: -49.2685,
        pico_aceleracao_z_g: 2.65,
        frequencia_dominante_hz: 9.4,
        energia_banda_alvo_pct: 64.2,
        veiculo_categoria: 'caminhao_coleta_demo',
        confirmacao_passagens: 3,
        is_synthetic: true,
      },
    ],
    timestamp: new Date().toISOString(),
  })
})
