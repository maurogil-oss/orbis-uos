migrate(
  (app) => {
    // Criação da coleção segment_readings para telemetria agregada por janela de 100m (Edge FFT)
    const segmentReadings = new Collection({
      name: 'segment_readings',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'segmento_id', type: 'text', required: true },
        { name: 'codigo_ibge', type: 'text', required: true },
        { name: 'via', type: 'text', required: true },
        { name: 'bairro', type: 'text' },
        { name: 'veiculo_id', type: 'text', required: true },
        { name: 'veiculo_tipo', type: 'text' },
        { name: 'rms_vertical', type: 'number' },
        { name: 'pico_acel_z', type: 'number' },
        { name: 'impactos_count', type: 'number' },
        { name: 'solavancos_angulares', type: 'number' },
        { name: 'iri_janela', type: 'number' },
        { name: 'velocidade_media_kmh', type: 'number' },
        { name: 'freq_dominante_hz', type: 'number' },
        { name: 'energia_banda_alvo_pct', type: 'number' },
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
        { name: 'janelas_amostradas', type: 'number' },
        { name: 'duracao_janela_ms', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_seg_readings_segmento ON segment_readings (segmento_id)',
        'CREATE INDEX idx_seg_readings_ibge ON segment_readings (codigo_ibge)',
        'CREATE INDEX idx_seg_readings_veiculo ON segment_readings (veiculo_id)',
      ],
    })
    app.save(segmentReadings)

    // Criação da coleção road_segments para agregar o estado consolidado dos segmentos de 100m e Fator de Confiança
    const roadSegments = new Collection({
      name: 'road_segments',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'segmento_id', type: 'text', required: true },
        { name: 'codigo_ibge', type: 'text', required: true },
        { name: 'via', type: 'text', required: true },
        { name: 'bairro', type: 'text' },
        {
          name: 'tipo_via',
          type: 'select',
          values: ['corredor_brt', 'arterial', 'coletora', 'local'],
          maxSelect: 1,
        },
        { name: 'extensao_metros', type: 'number' },
        { name: 'passagens_veiculos_distintos', type: 'number' },
        { name: 'veiculos_registrados', type: 'json' },
        { name: 'fator_confianca_valido', type: 'bool' },
        { name: 'iri_estimado', type: 'number' },
        { name: 'total_impactos', type: 'number' },
        { name: 'pico_max_z', type: 'number' },
        { name: 'solavancos_angulares_total', type: 'number' },
        { name: 'score_imm', type: 'number' },
        { name: 'faixa_imm', type: 'text' },
        { name: 'latitude_centro', type: 'number' },
        { name: 'longitude_centro', type: 'number' },
        { name: 'ultima_passagem', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_road_segments_seg_ibge ON road_segments (segmento_id, codigo_ibge)',
        'CREATE INDEX idx_road_segments_ibge ON road_segments (codigo_ibge)',
        'CREATE INDEX idx_road_segments_confianca ON road_segments (fator_confianca_valido)',
      ],
    })
    app.save(roadSegments)
  },
  (app) => {
    try {
      const colReadings = app.findCollectionByNameOrId('segment_readings')
      app.delete(colReadings)
    } catch (_) {}
    try {
      const colSegments = app.findCollectionByNameOrId('road_segments')
      app.delete(colSegments)
    } catch (_) {}
  },
)
