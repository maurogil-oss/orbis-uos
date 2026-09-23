migrate(
  (app) => {
    // 1. Criar collection 'connectors_prf'
    // Registra configurações, histórico de sincronizações automáticas, filtros e status operacional do conector PRF
    const connectorsPrfCol = new Collection({
      name: 'connectors_prf',
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
        { name: 'endpoint_url', type: 'text', required: true },
        { name: 'exercicios', type: 'json', required: false }, // array de anos consultados, ex: [2023, 2024]
        { name: 'brs_alvo', type: 'json', required: false }, // array de rodovias federais da região, ex: ["116", "277", "376", "476"]
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pronto', 'sincronizando', 'sucesso', 'erro_conexao', 'degradado'],
        },
        { name: 'ultima_sincronizacao', type: 'text', required: false },
        { name: 'total_importados', type: 'number', required: false },
        { name: 'total_descartados', type: 'number', required: false },
        { name: 'detalhes_execucao', type: 'json', required: false },
        { name: 'operador_id', type: 'text', required: false },
        { name: 'operador_nome', type: 'text', required: false },
        { name: 'operador_email', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_conn_prf_ibge ON connectors_prf (codigo_ibge)',
        'CREATE INDEX idx_conn_prf_status ON connectors_prf (status)',
      ],
    })
    app.save(connectorsPrfCol)

    // 2. Semear registro base de configuração do conector para o município-piloto (Curitiba / IBGE 4106902)
    const baseConn = new Record(connectorsPrfCol)
    baseConn.set('codigo_ibge', '4106902')
    baseConn.set('municipio', 'Curitiba')
    baseConn.set('uf', 'PR')
    baseConn.set('endpoint_url', 'https://dadosabertos.prf.gov.br/servicos/dados-abertos/acidentes')
    baseConn.set('exercicios', [2024, 2023])
    baseConn.set('brs_alvo', ['116', '277', '376', '476'])
    baseConn.set('status', 'pronto')
    baseConn.set('total_importados', 0)
    baseConn.set('total_descartados', 0)
    baseConn.set('detalhes_execucao', {
      descricao:
        'Conector PRF homologado via API de Dados Abertos (Acidentes de Trânsito em Rodovias Federais)',
      regiao_padrao:
        'Região Metropolitana de Curitiba / Trecho Urbano Linha Verde BR-116 e Contornos BR-277/376',
      saneamento_lgpd: 'Ativo (Remoção total de PII, agregação H3)',
    })
    app.save(baseConn)

    // 3. Registrar evento na trilha de auditoria em institucional_settings (autoria SISTEMA)
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
        const eventConnectorPrf = {
          id: 'evt_' + now.getTime() + '_conector_prf_habilitado',
          event: 'CONECTOR_PRF_HABILITADO',
          author: {
            id: 'system_migration_0028',
            email: 'sistema@orbis.gov.br',
            name: 'SISTEMA (Migração 0028 - Conector PRF API)',
            role: 'system',
          },
          details: {
            description:
              'Ativação do conector PRF via API REST oficial de dados abertos para sincronização automatizada em um clique de sinistros federais na malha da região do piloto.',
            endpoint_homologado: 'https://dadosabertos.prf.gov.br/servicos/dados-abertos/acidentes',
            municipio_padrao: 'Curitiba (IBGE 4106902)',
            rodovias_monitoradas: ['BR-116', 'BR-277', 'BR-376', 'BR-476'],
            excecao_arquitetural_documentada:
              'Conector PRF autorizado como exceção única à política de não consumo em tempo de execução, dado dataset federal estável com API REST documentada.',
            lgpd_k_anonimato:
              'Sanitização imediata de PII na chegada do payload e indexação em células H3 Res. 9 (~174m) e 10 (~65m)',
          },
          compliance: 'Art. 27 LC 182/2021 & Metas PNATRANS (Lei 13.614/2018)',
          timestamp: now.toISOString(),
        }

        trail.unshift(eventConnectorPrf)
        if (trail.length > 50) {
          trail = trail.slice(0, 50)
        }

        settings.set('audit_trail', JSON.stringify(trail))
        app.save(settings)
      }
    } catch (auditErr) {
      console.log('Aviso ao auditar CONECTOR_PRF_HABILITADO:', auditErr)
    }
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('connectors_prf')
      app.delete(col)
    } catch (_) {}
  },
)
