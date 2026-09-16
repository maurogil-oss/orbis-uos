migrate(
  (app) => {
    // 1. road_events collection
    const roadEvents = new Collection({
      name: 'road_events',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: null,
      fields: [
        { name: 'via', type: 'text', required: true },
        { name: 'bairro', type: 'text', required: false },
        {
          name: 'tipo',
          type: 'select',
          required: true,
          values: ['buraco', 'ondulacao', 'fissura', 'afundamento', 'remendo_critico'],
          maxSelect: 1,
        },
        {
          name: 'severidade',
          type: 'select',
          required: true,
          values: ['baixa', 'media', 'alta', 'critica'],
          maxSelect: 1,
        },
        { name: 'iri_score', type: 'number', required: false, min: 0, max: 20 },
        { name: 'aceleracao_z', type: 'number', required: false },
        { name: 'latitude', type: 'number', required: true },
        { name: 'longitude', type: 'number', required: true },
        { name: 'velocidade_kmh', type: 'number', required: false, min: 0, max: 150 },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['detectado', 'triagem', 'os_emitida', 'reparado'],
          maxSelect: 1,
        },
        { name: 'veiculo_tipo', type: 'text', required: false },
        { name: 'linha_frota', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_road_events_severidade ON road_events (severidade)',
        'CREATE INDEX idx_road_events_status ON road_events (status)',
      ],
    })
    app.save(roadEvents)

    // 2. fleet_telemetry collection
    const fleetTelemetry = new Collection({
      name: 'fleet_telemetry',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: null,
      fields: [
        { name: 'veiculo_id', type: 'text', required: true },
        {
          name: 'tipo',
          type: 'select',
          required: true,
          values: ['onibus_articulado', 'onibus_padron', 'caminhao_coleta', 'viatura_guarda'],
          maxSelect: 1,
        },
        { name: 'linha', type: 'text', required: true },
        { name: 'latitude', type: 'number', required: true },
        { name: 'longitude', type: 'number', required: true },
        { name: 'velocidade', type: 'number', required: true, min: 0, max: 150 },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['em_rota', 'parado', 'manutencao'],
          maxSelect: 1,
        },
        { name: 'km_percorridos_hoje', type: 'number', required: false, min: 0 },
        { name: 'anomalias_detectadas', type: 'number', required: false, min: 0 },
        { name: 'bateria_dispositivo', type: 'number', required: false, min: 0, max: 100 },
        { name: 'ultima_leitura', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_fleet_status ON fleet_telemetry (status)',
        'CREATE UNIQUE INDEX idx_fleet_veiculo_id ON fleet_telemetry (veiculo_id)',
      ],
    })
    app.save(fleetTelemetry)
  },
  (app) => {
    try {
      const roadEvents = app.findCollectionByNameOrId('road_events')
      app.delete(roadEvents)
    } catch (_) {}
    try {
      const fleetTelemetry = app.findCollectionByNameOrId('fleet_telemetry')
      app.delete(fleetTelemetry)
    } catch (_) {}
  },
)
