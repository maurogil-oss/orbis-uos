migrate(
  (app) => {
    const roadCol = app.findCollectionByNameOrId('road_events')
    const fleetCol = app.findCollectionByNameOrId('fleet_telemetry')

    // 1. Realistic Curitiba road events (Buracos, ondulações, fissuras)
    const sampleRoadEvents = [
      {
        via: 'Av. Marechal Floriano Peixoto, 4200',
        bairro: 'Hauer',
        tipo: 'buraco',
        severidade: 'critica',
        iri_score: 6.8,
        aceleracao_z: 3.42,
        latitude: -25.4682,
        longitude: -49.2551,
        velocidade_kmh: 42,
        status: 'os_emitida',
        veiculo_tipo: 'Ônibus Padron',
        linha_frota: '502 Circular Sul',
      },
      {
        via: 'Av. Cândido de Abreu, 750',
        bairro: 'Centro Cívico',
        tipo: 'ondulacao',
        severidade: 'media',
        iri_score: 3.9,
        aceleracao_z: 1.85,
        latitude: -25.4184,
        longitude: -49.2685,
        velocidade_kmh: 38,
        status: 'detectado',
        veiculo_tipo: 'Ônibus Biarticulado',
        linha_frota: '203 Sta. Cândida / Capão Raso',
      },
      {
        via: 'Rua Brigadeiro Franco, 1890',
        bairro: 'Água Verde',
        tipo: 'buraco',
        severidade: 'alta',
        iri_score: 5.7,
        aceleracao_z: 2.94,
        latitude: -25.4429,
        longitude: -49.2818,
        velocidade_kmh: 31,
        status: 'triagem',
        veiculo_tipo: 'Caminhão Coleta',
        linha_frota: 'Coleta Noturna Sul 04',
      },
      {
        via: 'Av. Sete de Setembro, 3400',
        bairro: 'Rebouças',
        tipo: 'fissura',
        severidade: 'baixa',
        iri_score: 2.8,
        aceleracao_z: 1.25,
        latitude: -25.4398,
        longitude: -49.2638,
        velocidade_kmh: 45,
        status: 'detectado',
        veiculo_tipo: 'Ônibus Articulado',
        linha_frota: '250 Ligeirão Norte-Sul',
      },
      {
        via: 'Av. Manoel Ribas, 2100',
        bairro: 'Santa Felicidade',
        tipo: 'afundamento',
        severidade: 'alta',
        iri_score: 5.2,
        aceleracao_z: 2.76,
        latitude: -25.4121,
        longitude: -49.3092,
        velocidade_kmh: 36,
        status: 'triagem',
        veiculo_tipo: 'Ônibus Padron',
        linha_frota: '901 Santa Felicidade',
      },
      {
        via: 'Rua Visconde de Nácar, 850',
        bairro: 'Centro',
        tipo: 'remendo_critico',
        severidade: 'media',
        iri_score: 4.1,
        aceleracao_z: 1.95,
        latitude: -25.4312,
        longitude: -49.2789,
        velocidade_kmh: 28,
        status: 'os_emitida',
        veiculo_tipo: 'Viatura Municipal',
        linha_frota: 'Guarda Municipal 12',
      },
      {
        via: 'Linha Verde (BR-476), km 142',
        bairro: 'Pinheirinho',
        tipo: 'buraco',
        severidade: 'critica',
        iri_score: 7.2,
        aceleracao_z: 3.88,
        latitude: -25.5098,
        longitude: -49.2874,
        velocidade_kmh: 58,
        status: 'os_emitida',
        veiculo_tipo: 'Ônibus Biarticulado',
        linha_frota: '350 Linha Verde',
      },
      {
        via: 'Av. Anita Garibaldi, 1400',
        bairro: 'Ahú',
        tipo: 'ondulacao',
        severidade: 'baixa',
        iri_score: 2.6,
        aceleracao_z: 1.12,
        latitude: -25.4053,
        longitude: -49.2599,
        velocidade_kmh: 40,
        status: 'reparado',
        veiculo_tipo: 'Ônibus Padron',
        linha_frota: '205 Anita Garibaldi',
      },
      {
        via: 'Rua Comendador Araújo, 520',
        bairro: 'Batel',
        tipo: 'buraco',
        severidade: 'alta',
        iri_score: 5.5,
        aceleracao_z: 2.82,
        latitude: -25.4361,
        longitude: -49.2792,
        velocidade_kmh: 32,
        status: 'triagem',
        veiculo_tipo: 'Ônibus Padron',
        linha_frota: '365 Jardim Social / Batel',
      },
      {
        via: 'Av. República Argentina, 2800',
        bairro: 'Portão',
        tipo: 'fissura',
        severidade: 'media',
        iri_score: 3.8,
        aceleracao_z: 1.74,
        latitude: -25.4688,
        longitude: -49.2932,
        velocidade_kmh: 44,
        status: 'detectado',
        veiculo_tipo: 'Ônibus Biarticulado',
        linha_frota: '203 Sta. Cândida / Capão Raso',
      },
    ]

    for (let i = 0; i < sampleRoadEvents.length; i++) {
      const item = sampleRoadEvents[i]
      try {
        app.findFirstRecordByData('road_events', 'via', item.via)
      } catch (_) {
        const rec = new Record(roadCol)
        rec.set('via', item.via)
        rec.set('bairro', item.bairro)
        rec.set('tipo', item.tipo)
        rec.set('severidade', item.severidade)
        rec.set('iri_score', item.iri_score)
        rec.set('aceleracao_z', item.aceleracao_z)
        rec.set('latitude', item.latitude)
        rec.set('longitude', item.longitude)
        rec.set('velocidade_kmh', item.velocidade_kmh)
        rec.set('status', item.status)
        rec.set('veiculo_tipo', item.veiculo_tipo)
        rec.set('linha_frota', item.linha_frota)
        app.save(rec)
      }
    }

    // 2. Realistic Curitiba Fleet Telemetry (Ônibus e Caminhões)
    const sampleFleet = [
      {
        veiculo_id: 'URBS-BL082',
        tipo: 'onibus_biarticulado',
        linha: '203 Sta. Cândida / Capão Raso',
        latitude: -25.4325,
        longitude: -49.2711,
        velocidade: 36,
        status: 'em_rota',
        km_percorridos_hoje: 148,
        anomalias_detectadas: 7,
        bateria_dispositivo: 94,
        ultima_leitura: 'Há 12s',
      },
      {
        veiculo_id: 'URBS-AL114',
        tipo: 'onibus_articulado',
        linha: '502 Circular Sul (Horário)',
        latitude: -25.4556,
        longitude: -49.2612,
        velocidade: 41,
        status: 'em_rota',
        km_percorridos_hoje: 192,
        anomalias_detectadas: 11,
        bateria_dispositivo: 88,
        ultima_leitura: 'Há 5s',
      },
      {
        veiculo_id: 'SMMA-CQ204',
        tipo: 'caminhao_coleta',
        linha: 'Setor Noturno 08 - Portão/Água Verde',
        latitude: -25.4491,
        longitude: -49.2882,
        velocidade: 22,
        status: 'em_rota',
        km_percorridos_hoje: 84,
        anomalias_detectadas: 15,
        bateria_dispositivo: 76,
        ultima_leitura: 'Há 18s',
      },
      {
        veiculo_id: 'URBS-PD330',
        tipo: 'onibus_padron',
        linha: '901 Santa Felicidade',
        latitude: -25.4198,
        longitude: -49.3015,
        velocidade: 32,
        status: 'em_rota',
        km_percorridos_hoje: 125,
        anomalias_detectadas: 5,
        bateria_dispositivo: 91,
        ultima_leitura: 'Há 8s',
      },
      {
        veiculo_id: 'GM-VIAT09',
        tipo: 'viatura_guarda',
        linha: 'Ronda Escolar Matriz',
        latitude: -25.4284,
        longitude: -49.2662,
        velocidade: 29,
        status: 'em_rota',
        km_percorridos_hoje: 97,
        anomalias_detectadas: 4,
        bateria_dispositivo: 85,
        ultima_leitura: 'Há 25s',
      },
      {
        veiculo_id: 'URBS-BL091',
        tipo: 'onibus_biarticulado',
        linha: '350 Linha Verde Expresso',
        latitude: -25.4952,
        longitude: -49.2781,
        velocidade: 52,
        status: 'em_rota',
        km_percorridos_hoje: 215,
        anomalias_detectadas: 19,
        bateria_dispositivo: 82,
        ultima_leitura: 'Há 2s',
      },
    ]

    for (let j = 0; j < sampleFleet.length; j++) {
      const v = sampleFleet[j]
      try {
        app.findFirstRecordByData('fleet_telemetry', 'veiculo_id', v.veiculo_id)
      } catch (_) {
        const rec = new Record(fleetCol)
        rec.set('veiculo_id', v.veiculo_id)
        // Check if value exists in enum
        const tipoVal = v.tipo === 'onibus_biarticulado' ? 'onibus_articulado' : v.tipo
        rec.set('tipo', tipoVal)
        rec.set('linha', v.linha)
        rec.set('latitude', v.latitude)
        rec.set('longitude', v.longitude)
        rec.set('velocidade', v.velocidade)
        rec.set('status', v.status)
        rec.set('km_percorridos_hoje', v.km_percorridos_hoje)
        rec.set('anomalias_detectadas', v.anomalias_detectadas)
        rec.set('bateria_dispositivo', v.bateria_dispositivo)
        rec.set('ultima_leitura', v.ultima_leitura)
        app.save(rec)
      }
    }
  },
  (app) => {
    // Revert seeded records
    try {
      const roadCol = app.findCollectionByNameOrId('road_events')
      app.truncateCollection(roadCol)
    } catch (_) {}
    try {
      const fleetCol = app.findCollectionByNameOrId('fleet_telemetry')
      app.truncateCollection(fleetCol)
    } catch (_) {}
  },
)
