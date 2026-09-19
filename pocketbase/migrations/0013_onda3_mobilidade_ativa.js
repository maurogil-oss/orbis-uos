migrate(
  (app) => {
    // 1. Extensão de field_sessions com modo_coleta e indice_alvo
    const fieldSessions = app.findCollectionByNameOrId('field_sessions')
    if (!fieldSessions.fields.getByName('modo_coleta')) {
      fieldSessions.fields.add(
        new SelectField({
          name: 'modo_coleta',
          values: ['veiculo_frota', 'pedestre', 'ciclista', 'motociclista'],
          maxSelect: 1,
        }),
      )
    }
    if (!fieldSessions.fields.getByName('indice_alvo')) {
      fieldSessions.fields.add(
        new SelectField({
          name: 'indice_alvo',
          values: ['IMV', 'IMA'],
          maxSelect: 1,
        }),
      )
    }
    if (!fieldSessions.fields.getByName('desvios_detectados')) {
      fieldSessions.fields.add(
        new NumberField({
          name: 'desvios_detectados',
        }),
      )
    }
    if (!fieldSessions.fields.getByName('banda_fft_min_hz')) {
      fieldSessions.fields.add(
        new NumberField({
          name: 'banda_fft_min_hz',
        }),
      )
    }
    if (!fieldSessions.fields.getByName('banda_fft_max_hz')) {
      fieldSessions.fields.add(
        new NumberField({
          name: 'banda_fft_max_hz',
        }),
      )
    }
    app.save(fieldSessions)

    // 2. Extensão de segment_readings com modo_coleta, indice_alvo e desvio_padrao_angular
    const segReadings = app.findCollectionByNameOrId('segment_readings')
    if (!segReadings.fields.getByName('modo_coleta')) {
      segReadings.fields.add(
        new SelectField({
          name: 'modo_coleta',
          values: ['veiculo_frota', 'pedestre', 'ciclista', 'motociclista'],
          maxSelect: 1,
        }),
      )
    }
    if (!segReadings.fields.getByName('indice_alvo')) {
      segReadings.fields.add(
        new SelectField({
          name: 'indice_alvo',
          values: ['IMV', 'IMA'],
          maxSelect: 1,
        }),
      )
    }
    if (!segReadings.fields.getByName('desvio_angular_taxa')) {
      segReadings.fields.add(
        new NumberField({
          name: 'desvio_angular_taxa',
        }),
      )
    }
    app.save(segReadings)

    // 3. Extensão de road_segments com dados de acessibilidade (IMA)
    const roadSegments = app.findCollectionByNameOrId('road_segments')
    if (!roadSegments.fields.getByName('score_ima')) {
      roadSegments.fields.add(
        new NumberField({
          name: 'score_ima',
        }),
      )
    }
    if (!roadSegments.fields.getByName('faixa_ima')) {
      roadSegments.fields.add(
        new TextField({
          name: 'faixa_ima',
        }),
      )
    }
    if (!roadSegments.fields.getByName('passagens_modos_ativos')) {
      roadSegments.fields.add(
        new NumberField({
          name: 'passagens_modos_ativos',
        }),
      )
    }
    if (!roadSegments.fields.getByName('desvios_coletivos_count')) {
      roadSegments.fields.add(
        new NumberField({
          name: 'desvios_coletivos_count',
        }),
      )
    }
    app.save(roadSegments)
  },
  (app) => {
    // Reverter adições defensivamente
    try {
      const fieldSessions = app.findCollectionByNameOrId('field_sessions')
      const m1 = fieldSessions.fields.getByName('modo_coleta')
      if (m1) fieldSessions.fields.removeById(m1.id)
      const m2 = fieldSessions.fields.getByName('indice_alvo')
      if (m2) fieldSessions.fields.removeById(m2.id)
      const m3 = fieldSessions.fields.getByName('desvios_detectados')
      if (m3) fieldSessions.fields.removeById(m3.id)
      const m4 = fieldSessions.fields.getByName('banda_fft_min_hz')
      if (m4) fieldSessions.fields.removeById(m4.id)
      const m5 = fieldSessions.fields.getByName('banda_fft_max_hz')
      if (m5) fieldSessions.fields.removeById(m5.id)
      app.save(fieldSessions)
    } catch (_) {}

    try {
      const segReadings = app.findCollectionByNameOrId('segment_readings')
      const s1 = segReadings.fields.getByName('modo_coleta')
      if (s1) segReadings.fields.removeById(s1.id)
      const s2 = segReadings.fields.getByName('indice_alvo')
      if (s2) segReadings.fields.removeById(s2.id)
      const s3 = segReadings.fields.getByName('desvio_angular_taxa')
      if (s3) segReadings.fields.removeById(s3.id)
      app.save(segReadings)
    } catch (_) {}

    try {
      const roadSegments = app.findCollectionByNameOrId('road_segments')
      const r1 = roadSegments.fields.getByName('score_ima')
      if (r1) roadSegments.fields.removeById(r1.id)
      const r2 = roadSegments.fields.getByName('faixa_ima')
      if (r2) roadSegments.fields.removeById(r2.id)
      const r3 = roadSegments.fields.getByName('passagens_modos_ativos')
      if (r3) roadSegments.fields.removeById(r3.id)
      const r4 = roadSegments.fields.getByName('desvios_coletivos_count')
      if (r4) roadSegments.fields.removeById(r4.id)
      app.save(roadSegments)
    } catch (_) {}
  },
)
