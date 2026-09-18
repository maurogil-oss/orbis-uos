migrate(
  (app) => {
    // 1. Criar coleção fator_k_calibrations para persistir configurações ativas e histórico/auditoria de calibração
    const fatorKCollection = new Collection({
      name: 'fator_k_calibrations',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'codigo_ibge', type: 'text', required: true },
        { name: 'veiculo_tipo', type: 'text', required: true },
        { name: 'valor_baseline', type: 'number', required: true },
        { name: 'valor_calibrado_sugerido', type: 'number', required: true },
        { name: 'valor_aplicado', type: 'number', required: true },
        {
          name: 'status_aplicacao',
          type: 'select',
          values: ['baseline', 'calibrado_ativo', 'customizado'],
          maxSelect: 1,
        },
        { name: 'amostras_sessoes', type: 'number' },
        { name: 'amostras_segmentos', type: 'number' },
        { name: 'km_acumulado', type: 'number' },
        {
          name: 'confiabilidade_status',
          type: 'select',
          values: ['insuficiente', 'moderada', 'alta'],
          maxSelect: 1,
        },
        { name: 'metodologia_detalhes', type: 'json' },
        { name: 'auditoria_usuario', type: 'text' },
        { name: 'auditoria_data', type: 'text' },
        { name: 'auditoria_historico', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_fk_ibge_veiculo ON fator_k_calibrations (codigo_ibge, veiculo_tipo)',
        'CREATE INDEX idx_fk_ibge ON fator_k_calibrations (codigo_ibge)',
      ],
    })
    app.save(fatorKCollection)

    // 2. Criar coleção field_sessions para registrar cada sessão de campo e seus metadados de calibração
    const fieldSessionsCollection = new Collection({
      name: 'field_sessions',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'session_code', type: 'text', required: true },
        { name: 'codigo_ibge', type: 'text', required: true },
        { name: 'veiculo_tipo', type: 'text', required: true },
        { name: 'veiculo_id', type: 'text' },
        { name: 'linha_frota', type: 'text' },
        { name: 'via_inicial', type: 'text' },
        { name: 'bairro', type: 'text' },
        { name: 'duracao_ms', type: 'number' },
        { name: 'distancia_metros', type: 'number' },
        { name: 'janelas_processadas', type: 'number' },
        { name: 'impactos_detectados', type: 'number' },
        { name: 'segmentos_cobertos', type: 'json' },
        { name: 'iri_medio', type: 'number' },
        { name: 'pico_g', type: 'number' },
        { name: 'operador_nome', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_field_sessions_code ON field_sessions (session_code)',
        'CREATE INDEX idx_field_sessions_ibge ON field_sessions (codigo_ibge)',
        'CREATE INDEX idx_field_sessions_veiculo_tipo ON field_sessions (veiculo_tipo)',
      ],
    })
    app.save(fieldSessionsCollection)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('fator_k_calibrations')
      app.delete(col)
    } catch (_) {}
    try {
      const col2 = app.findCollectionByNameOrId('field_sessions')
      app.delete(col2)
    } catch (_) {}
  },
)
