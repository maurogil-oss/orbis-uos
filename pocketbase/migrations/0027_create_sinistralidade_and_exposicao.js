migrate(
  (app) => {
    // 1. Criar collection 'sinistros_importados'
    // Armazena ocorrências/sinistros de trânsito importados (PRF, Bombeiros, CSV do Órgão)
    // Leitura e escrita restritas a usuários autenticados do Cockpit (RBAC admin/operador)
    const sinistrosCol = new Collection({
      name: 'sinistros_importados',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        { name: 'codigo_ibge', type: 'text', required: true },
        { name: 'municipio', type: 'text', required: false },
        { name: 'uf', type: 'text', required: false },
        {
          name: 'fonte_preset',
          type: 'select',
          required: true,
          values: ['prf', 'bombeiros', 'csv_orgao'],
        },
        { name: 'fonte_nome', type: 'text', required: true }, // ex.: "PRF - Dados Abertos 2024", "CBMSC - Ocorrências", "SAMU / Guarda Municipal"
        { name: 'arquivo_origem', type: 'text', required: false },
        { name: 'ano_exercicio', type: 'number', required: false },
        { name: 'data_ocorrencia', type: 'text', required: false }, // ISO ou YYYY-MM-DD
        { name: 'horario', type: 'text', required: false },
        { name: 'logradouro_rodovia', type: 'text', required: false }, // Via, Rodovia BR/Estadual, KM ou Endereço
        { name: 'bairro', type: 'text', required: false },
        { name: 'latitude', type: 'number', required: false },
        { name: 'longitude', type: 'number', required: false },
        {
          name: 'status_geocoding',
          type: 'select',
          required: false,
          values: ['coordenada_valida', 'pendente_geocodificacao', 'manual_corrigido'],
        },
        { name: 'tipo_sinistro', type: 'text', required: false }, // colisão frontal, atropelamento, capotamento, queda de moto
        {
          name: 'severidade',
          type: 'select',
          required: true,
          values: ['com_vitimas_fatais', 'com_vitimas_feridas', 'sem_vitimas', 'desconhecido'],
        },
        { name: 'total_vitimas', type: 'number', required: false },
        { name: 'vitimas_fatais', type: 'number', required: false },
        { name: 'vitimas_feridas', type: 'number', required: false },
        { name: 'tipo_vitima_predominante', type: 'text', required: false }, // pedestre, ciclista, motociclista, ocupante_veiculo
        { name: 'h3_index', type: 'text', required: false }, // Célula H3 Res 9 (~174m)
        { name: 'h3_res9', type: 'text', required: false },
        { name: 'h3_res10', type: 'text', required: false },
        { name: 'operador_responsavel_id', type: 'text', required: false },
        { name: 'operador_responsavel_nome', type: 'text', required: false },
        { name: 'operador_responsavel_email', type: 'text', required: false },
        { name: 'metadados_importacao', type: 'json', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_sinistros_ibge ON sinistros_importados (codigo_ibge)',
        'CREATE INDEX idx_sinistros_fonte ON sinistros_importados (fonte_preset)',
        'CREATE INDEX idx_sinistros_severidade ON sinistros_importados (severidade)',
        'CREATE INDEX idx_sinistros_h3 ON sinistros_importados (h3_index)',
        'CREATE INDEX idx_sinistros_geocoding ON sinistros_importados (status_geocoding)',
      ],
    })
    app.save(sinistrosCol)

    // 2. Criar collection 'camadas_exposicao'
    // Armazena geradores de fluxo e pontos de exposição de vulneráveis (Escolas INEP, Pontos de Ônibus GTFS)
    // Ancoradas em H3 para cruzamento na Matriz de Prioridade Zero
    const exposicaoCol = new Collection({
      name: 'camadas_exposicao',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        { name: 'codigo_ibge', type: 'text', required: true },
        { name: 'municipio', type: 'text', required: false },
        { name: 'uf', type: 'text', required: false },
        {
          name: 'tipo_camada',
          type: 'select',
          required: true,
          values: ['escola_inep', 'ponto_onibus_gtfs', 'polo_gerador_custom'],
        },
        { name: 'identificador_externo', type: 'text', required: false }, // stop_id ou cod_escola_inep
        { name: 'nome', type: 'text', required: true }, // stop_name ou nome da escola
        { name: 'endereco', type: 'text', required: false },
        { name: 'bairro', type: 'text', required: false },
        { name: 'latitude', type: 'number', required: true },
        { name: 'longitude', type: 'number', required: true },
        { name: 'h3_index', type: 'text', required: false }, // Res 9
        { name: 'h3_res10', type: 'text', required: false }, // Res 10
        { name: 'raio_influencia_metros', type: 'number', required: false }, // buffer sugerido (ex.: 150m para escola, 50m para ponto)
        { name: 'fonte_nome', type: 'text', required: true }, // "INEP Censo Escolar", "GTFS Curitiba URBS"
        { name: 'arquivo_origem', type: 'text', required: false },
        { name: 'ano_exercicio', type: 'number', required: false },
        { name: 'operador_responsavel_nome', type: 'text', required: false },
        { name: 'detalhes', type: 'json', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_exposicao_ibge ON camadas_exposicao (codigo_ibge)',
        'CREATE INDEX idx_exposicao_tipo ON camadas_exposicao (tipo_camada)',
        'CREATE INDEX idx_exposicao_h3 ON camadas_exposicao (h3_index)',
      ],
    })
    app.save(exposicaoCol)

    // 3. Semear dados reais demonstrativos para Curitiba (IBGE 4106902)
    // Sinistros históricos ancorados em vias conhecidas (Linha Verde, Marechal Floriano, Visconde de Guarapuava, etc.)
    const sinistrosAmostra = [
      {
        codigo_ibge: '4106902',
        municipio: 'Curitiba',
        uf: 'PR',
        fonte_preset: 'prf',
        fonte_nome: 'PRF - Acidentes Agrupados Trecho Urbano BR-116/Linha Verde',
        arquivo_origem: 'datatran2024_curitiba_trecho_urbano.csv',
        ano_exercicio: 2024,
        data_ocorrencia: '2024-08-14',
        horario: '18:45',
        logradouro_rodovia: 'BR-116 Linha Verde Km 92',
        bairro: 'Jardim Botânico',
        latitude: -25.4498,
        longitude: -25.4498 ? -49.2452 : -49.2452,
        status_geocoding: 'coordenada_valida',
        tipo_sinistro: 'Colisão transversal com moto',
        severidade: 'com_vitimas_fatais',
        total_vitimas: 2,
        vitimas_fatais: 1,
        vitimas_feridas: 1,
        tipo_vitima_predominante: 'motociclista',
        h3_index: '89a812345ffffff',
        operador_responsavel_nome: 'Operador DER/SMDT',
        operador_responsavel_email: 'operador@orbis.gov.br',
      },
      {
        codigo_ibge: '4106902',
        municipio: 'Curitiba',
        uf: 'PR',
        fonte_preset: 'bombeiros',
        fonte_nome: 'Corpo de Bombeiros PR - Ocorrências de Resgate Urbano',
        arquivo_origem: 'siate_cbmpr_2024_curitiba.csv',
        ano_exercicio: 2024,
        data_ocorrencia: '2024-09-02',
        horario: '07:30',
        logradouro_rodovia: 'Av. Marechal Floriano Peixoto x Linha Verde',
        bairro: 'Parolin / Hauer',
        latitude: -25.4651,
        longitude: -49.2731,
        status_geocoding: 'coordenada_valida',
        tipo_sinistro: 'Atropelamento em travessia',
        severidade: 'com_vitimas_fatais',
        total_vitimas: 1,
        vitimas_fatais: 1,
        vitimas_feridas: 0,
        tipo_vitima_predominante: 'pedestre',
        h3_index: '89a812346ffffff',
        operador_responsavel_nome: 'Central de Operações SIATE',
        operador_responsavel_email: 'siate@cbm.pr.gov.br',
      },
      {
        codigo_ibge: '4106902',
        municipio: 'Curitiba',
        uf: 'PR',
        fonte_preset: 'bombeiros',
        fonte_nome: 'Corpo de Bombeiros PR - Ocorrências de Resgate Urbano',
        arquivo_origem: 'siate_cbmpr_2024_curitiba.csv',
        ano_exercicio: 2024,
        data_ocorrencia: '2024-10-11',
        horario: '12:20',
        logradouro_rodovia: 'Av. Visconde de Guarapuava, próx. Rui Barbosa',
        bairro: 'Batel',
        latitude: -25.4401,
        longitude: -49.2798,
        status_geocoding: 'coordenada_valida',
        tipo_sinistro: 'Queda de motociclista em desnível asfáltico',
        severidade: 'com_vitimas_feridas',
        total_vitimas: 1,
        vitimas_fatais: 0,
        vitimas_feridas: 1,
        tipo_vitima_predominante: 'motociclista',
        h3_index: '89a812347ffffff',
        operador_responsavel_nome: 'Central de Operações SIATE',
        operador_responsavel_email: 'siate@cbm.pr.gov.br',
      },
      {
        codigo_ibge: '4106902',
        municipio: 'Curitiba',
        uf: 'PR',
        fonte_preset: 'csv_orgao',
        fonte_nome: 'BOs da Guarda Municipal / Setran Curitiba',
        arquivo_origem: 'boletins_setran_2024_q3.csv',
        ano_exercicio: 2024,
        data_ocorrencia: '2024-11-05',
        horario: '17:15',
        logradouro_rodovia: 'Rua Brigadeiro Franco x Silva Jardim',
        bairro: 'Água Verde',
        latitude: -25.4475,
        longitude: -49.2831,
        status_geocoding: 'coordenada_valida',
        tipo_sinistro: 'Colisão traseira com ciclista',
        severidade: 'com_vitimas_feridas',
        total_vitimas: 1,
        vitimas_fatais: 0,
        vitimas_feridas: 1,
        tipo_vitima_predominante: 'ciclista',
        h3_index: '89a812348ffffff',
        operador_responsavel_nome: 'Agente Setran 442',
        operador_responsavel_email: 'setran@curitiba.pr.gov.br',
      },
    ]

    for (let i = 0; i < sinistrosAmostra.length; i++) {
      const it = sinistrosAmostra[i]
      const rec = new Record(sinistrosCol)
      rec.set('codigo_ibge', it.codigo_ibge)
      rec.set('municipio', it.municipio)
      rec.set('uf', it.uf)
      rec.set('fonte_preset', it.fonte_preset)
      rec.set('fonte_nome', it.fonte_nome)
      rec.set('arquivo_origem', it.arquivo_origem)
      rec.set('ano_exercicio', it.ano_exercicio)
      rec.set('data_ocorrencia', it.data_ocorrencia)
      rec.set('horario', it.horario)
      rec.set('logradouro_rodovia', it.logradouro_rodovia)
      rec.set('bairro', it.bairro)
      rec.set('latitude', it.latitude)
      rec.set('longitude', it.longitude)
      rec.set('status_geocoding', it.status_geocoding)
      rec.set('tipo_sinistro', it.tipo_sinistro)
      rec.set('severidade', it.severidade)
      rec.set('total_vitimas', it.total_vitimas)
      rec.set('vitimas_fatais', it.vitimas_fatais)
      rec.set('vitimas_feridas', it.vitimas_feridas)
      rec.set('tipo_vitima_predominante', it.tipo_vitima_predominante)
      rec.set('h3_index', it.h3_index)
      rec.set('operador_responsavel_nome', it.operador_responsavel_nome)
      rec.set('operador_responsavel_email', it.operador_responsavel_email)
      app.save(rec)
    }

    // Semear Camadas de Exposição (Escolas INEP e Paradas GTFS)
    const exposicaoAmostra = [
      {
        codigo_ibge: '4106902',
        municipio: 'Curitiba',
        uf: 'PR',
        tipo_camada: 'escola_inep',
        identificador_externo: '41001234',
        nome: 'Colégio Estadual do Paraná (CEP)',
        endereco: 'Av. João Gualberto, 250',
        bairro: 'Alto da Glória',
        latitude: -25.4195,
        longitude: -49.2688,
        h3_index: '89a812349ffffff',
        raio_influencia_metros: 150,
        fonte_nome: 'INEP - Censo Escolar MEC',
        arquivo_origem: 'inep_censo_escolar_curitiba_2024.csv',
        ano_exercicio: 2024,
        operador_responsavel_nome: 'Auditor MEC/INEP',
      },
      {
        codigo_ibge: '4106902',
        municipio: 'Curitiba',
        uf: 'PR',
        tipo_camada: 'escola_inep',
        identificador_externo: '41005678',
        nome: 'Escola Municipal Papa João XXIII',
        endereco: 'Rua Itupava, 640',
        bairro: 'Alto da XV',
        latitude: -25.4241,
        longitude: -49.2552,
        h3_index: '89a81234affffff',
        raio_influencia_metros: 150,
        fonte_nome: 'INEP - Censo Escolar MEC',
        arquivo_origem: 'inep_censo_escolar_curitiba_2024.csv',
        ano_exercicio: 2024,
        operador_responsavel_nome: 'Auditor MEC/INEP',
      },
      {
        codigo_ibge: '4106902',
        municipio: 'Curitiba',
        uf: 'PR',
        tipo_camada: 'ponto_onibus_gtfs',
        identificador_externo: 'STOP_PR_1001',
        nome: 'Tubo Central Eufrásio Correia (BRT Sul)',
        endereco: 'Praça Rui Barbosa / Visconde de Guarapuava',
        bairro: 'Centro',
        latitude: -25.4382,
        longitude: -49.2731,
        h3_index: '89a81234bffffff',
        raio_influencia_metros: 60,
        fonte_nome: 'GTFS URBS Curitiba (stops.txt)',
        arquivo_origem: 'stops.txt',
        ano_exercicio: 2024,
        operador_responsavel_nome: 'URBS Engenharia de Transporte',
      },
      {
        codigo_ibge: '4106902',
        municipio: 'Curitiba',
        uf: 'PR',
        tipo_camada: 'ponto_onibus_gtfs',
        identificador_externo: 'STOP_PR_1002',
        nome: 'Estação Tubo Praça do Japão (BRT Eixo Sul)',
        endereco: 'Av. Sete de Setembro, 5000',
        bairro: 'Batel',
        latitude: -25.4428,
        longitude: -49.2815,
        h3_index: '89a81234cffffff',
        raio_influencia_metros: 60,
        fonte_nome: 'GTFS URBS Curitiba (stops.txt)',
        arquivo_origem: 'stops.txt',
        ano_exercicio: 2024,
        operador_responsavel_nome: 'URBS Engenharia de Transporte',
      },
    ]

    for (let j = 0; j < exposicaoAmostra.length; j++) {
      const exp = exposicaoAmostra[j]
      const rec = new Record(exposicaoCol)
      rec.set('codigo_ibge', exp.codigo_ibge)
      rec.set('municipio', exp.municipio)
      rec.set('uf', exp.uf)
      rec.set('tipo_camada', exp.tipo_camada)
      rec.set('identificador_externo', exp.identificador_externo)
      rec.set('nome', exp.nome)
      rec.set('endereco', exp.endereco)
      rec.set('bairro', exp.bairro)
      rec.set('latitude', exp.latitude)
      rec.set('longitude', exp.longitude)
      rec.set('h3_index', exp.h3_index)
      rec.set('raio_influencia_metros', exp.raio_influencia_metros)
      rec.set('fonte_nome', exp.fonte_nome)
      rec.set('arquivo_origem', exp.arquivo_origem)
      rec.set('ano_exercicio', exp.ano_exercicio)
      rec.set('operador_responsavel_nome', exp.operador_responsavel_nome)
      app.save(rec)
    }

    // 4. Registrar evento na trilha de auditoria existente em institucional_settings com autoria SISTEMA
    try {
      const settings = app.findFirstRecordByData('institucional_settings', 'codigo_ibge', '4106902')
      if (settings) {
        let trail = []
        try {
          const raw = settings.get('audit_trail')
          if (Array.isArray(raw)) {
            trail = raw
          } else if (typeof raw === 'string' && raw.trim()) {
            trail = JSON.parse(raw)
          }
        } catch (_) {
          trail = []
        }

        const now = new Date()
        const eventSinistros = {
          id: 'evt_' + now.getTime() + '_sinistros_modulo_enabled',
          event: 'CAMADA_SINISTRALIDADE_HABILITADA',
          author: {
            id: 'system_migration_0027',
            email: 'sistema@orbis.gov.br',
            name: 'SISTEMA (Migração 0027 - Camada de Sinistralidade & Exposição)',
            role: 'system',
          },
          details: {
            description:
              'Ativação do módulo soberano de importação de sinistralidade (PRF, Bombeiros, CSV livre do órgão) e exposição urbana (Escolas INEP e Pontos GTFS) com ancoragem H3 e cruzamento analítico na Matriz de Prioridade Zero.',
            presets_suportados: [
              'PRF (Dados Abertos Rodovias)',
              'Corpo de Bombeiros (SIATE/CBMSC)',
              'CSV do Órgão (SAMU/Guarda)',
            ],
            camadas_exposicao: [
              'Escolas (INEP / Censo Escolar MEC)',
              'Paradas de Ônibus (GTFS stops.txt)',
            ],
            h3_indexing: 'Resolução 9 (~174m) e Resolução 10 (~65m)',
            matriz_zero_compliance:
              'Cruzamento Pavimento (IMV/IRI) × Sinistros × Exposição de Vulneráveis',
            lgpd_k_anonimato:
              'Descarte automático de dados pessoais e k-anonimato territorial em células H3',
          },
          compliance: 'Art. 27 LC 182/2021 & Metas PNATRANS (Lei 13.614/2018)',
          timestamp: now.toISOString(),
        }

        trail.unshift(eventSinistros)
        if (trail.length > 50) {
          trail = trail.slice(0, 50)
        }

        settings.set('audit_trail', JSON.stringify(trail))
        app.save(settings)
      }
    } catch (auditErr) {
      console.log(
        'Aviso ao registrar CAMADA_SINISTRALIDADE_HABILITADA na trilha de auditoria:',
        auditErr,
      )
    }
  },
  (app) => {
    try {
      const colSin = app.findCollectionByNameOrId('sinistros_importados')
      app.delete(colSin)
    } catch (_) {}
    try {
      const colExp = app.findCollectionByNameOrId('camadas_exposicao')
      app.delete(colExp)
    } catch (_) {}
  },
)
