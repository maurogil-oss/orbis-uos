migrate(
  (app) => {
    // =========================================================================
    // 1. ADICIONAR CAMPO h3_index E h3_resolution EM segment_readings
    // =========================================================================
    const segReadings = app.findCollectionByNameOrId('segment_readings')
    if (!segReadings.fields.getByName('h3_index')) {
      segReadings.fields.add(
        new TextField({
          name: 'h3_index',
        }),
      )
    }
    if (!segReadings.fields.getByName('h3_resolution')) {
      segReadings.fields.add(
        new NumberField({
          name: 'h3_resolution',
        }),
      )
    }
    app.save(segReadings)

    // =========================================================================
    // 2. ADICIONAR CAMPO h3_index E h3_resolution EM road_segments
    // =========================================================================
    const roadSegments = app.findCollectionByNameOrId('road_segments')
    if (!roadSegments.fields.getByName('h3_index')) {
      roadSegments.fields.add(
        new TextField({
          name: 'h3_index',
        }),
      )
    }
    if (!roadSegments.fields.getByName('h3_resolution')) {
      roadSegments.fields.add(
        new NumberField({
          name: 'h3_resolution',
        }),
      )
    }
    app.save(roadSegments)

    // =========================================================================
    // 3. ADICIONAR CAMPO h3_index EM road_events (opcional para indexação de anomalias pontuais)
    // =========================================================================
    try {
      const roadEvents = app.findCollectionByNameOrId('road_events')
      if (!roadEvents.fields.getByName('h3_index')) {
        roadEvents.fields.add(
          new TextField({
            name: 'h3_index',
          }),
        )
        app.save(roadEvents)
      }
    } catch (_) {}

    // =========================================================================
    // 4. ADICIONAR ÍNDICE PARA PESQUISA RÁPIDA POR CÉLULA H3
    // =========================================================================
    try {
      segReadings.addIndex('idx_seg_readings_h3', false, 'h3_index', '')
      app.save(segReadings)
    } catch (_) {}

    try {
      roadSegments.addIndex('idx_road_segments_h3', false, 'h3_index', '')
      app.save(roadSegments)
    } catch (_) {}

    // =========================================================================
    // 5. REGISTRAR EVENTO NA TRILHA DE AUDITORIA DE institucional_settings
    // =========================================================================
    try {
      const settings = app.findFirstRecordByData('institucional_settings', 'codigo_ibge', '4106902')
      if (settings) {
        const auditLog = {
          event: 'H3_SPATIAL_INDEXING_INITIALIZED',
          version: '2.2',
          h3_resolutions: {
            veicular_res: 9,
            modos_ativos_res: 10,
          },
          k_anonymity_threshold: 3,
          lgpd_compliance: 'Art. 12 LGPD & Protecao de Trajetorias Individuais',
          timestamp: new Date().toISOString(),
        }
        settings.set('cgu_cache_payload', auditLog)
        app.save(settings)
      }
    } catch (_) {}
  },
  (app) => {
    try {
      const segReadings = app.findCollectionByNameOrId('segment_readings')
      const h3F = segReadings.fields.getByName('h3_index')
      if (h3F) segReadings.fields.removeById(h3F.id)
      const h3R = segReadings.fields.getByName('h3_resolution')
      if (h3R) segReadings.fields.removeById(h3R.id)
      app.save(segReadings)
    } catch (_) {}

    try {
      const roadSegments = app.findCollectionByNameOrId('road_segments')
      const h3F = roadSegments.fields.getByName('h3_index')
      if (h3F) roadSegments.fields.removeById(h3F.id)
      const h3R = roadSegments.fields.getByName('h3_resolution')
      if (h3R) roadSegments.fields.removeById(h3R.id)
      app.save(roadSegments)
    } catch (_) {}
  },
)
