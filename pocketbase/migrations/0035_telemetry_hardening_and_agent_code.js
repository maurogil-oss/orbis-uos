migrate(
  (app) => {
    // =========================================================================
    // PARTE 1.4.d: REGRAS DE AUTENTICAÇÃO NAS COLEÇÕES DE TELEMETRIA
    // Escrita e deleção exigem usuário autenticado. Leitura controlada.
    // =========================================================================

    // 1. road_events: Leitura pública (para mapas/transparência), escrita/edição/deleção autenticadas
    const roadEventsCol = app.findCollectionByNameOrId('road_events')
    roadEventsCol.listRule = ''
    roadEventsCol.viewRule = ''
    roadEventsCol.createRule = "@request.auth.id != ''"
    roadEventsCol.updateRule = "@request.auth.id != ''"
    roadEventsCol.deleteRule = "@request.auth.id != ''"

    // 2. segment_readings: Escrita e leitura restritas a autenticados
    const segReadingsCol = app.findCollectionByNameOrId('segment_readings')
    segReadingsCol.listRule = "@request.auth.id != ''"
    segReadingsCol.viewRule = "@request.auth.id != ''"
    segReadingsCol.createRule = "@request.auth.id != ''"
    segReadingsCol.updateRule = "@request.auth.id != ''"
    segReadingsCol.deleteRule = "@request.auth.id != ''"

    // 3. road_segments: Leitura pública (camada de mapa de segmentos), escrita autenticada
    const roadSegsCol = app.findCollectionByNameOrId('road_segments')
    roadSegsCol.listRule = ''
    roadSegsCol.viewRule = ''
    roadSegsCol.createRule = "@request.auth.id != ''"
    roadSegsCol.updateRule = "@request.auth.id != ''"
    roadSegsCol.deleteRule = "@request.auth.id != ''"

    // 4. field_sessions: Leitura e escrita autenticadas
    const fieldSessionsCol = app.findCollectionByNameOrId('field_sessions')
    fieldSessionsCol.listRule = "@request.auth.id != ''"
    fieldSessionsCol.viewRule = "@request.auth.id != ''"
    fieldSessionsCol.createRule = "@request.auth.id != ''"
    fieldSessionsCol.updateRule = "@request.auth.id != ''"
    fieldSessionsCol.deleteRule = "@request.auth.id != ''"

    // 5. fleet_telemetry: Leitura pública (para frota ativa), escrita/atualização autenticada
    const fleetCol = app.findCollectionByNameOrId('fleet_telemetry')
    fleetCol.listRule = ''
    fleetCol.viewRule = ''
    fleetCol.createRule = "@request.auth.id != ''"
    fleetCol.updateRule = "@request.auth.id != ''"
    fleetCol.deleteRule = "@request.auth.id != ''"

    // =========================================================================
    // PARTE 2: EXTENSÃO DE MODELO — CÓDIGO DE TIPO DE AGENTE (agent_code / user_type)
    // Taxonomia por código de categoria do agente emissor (não identificação individual):
    // VEICULO_FROTA, ONIBUS_FROTA, MOTOCICLISTA, CICLISTA, PEDESTRE, PASSAGEIRO_ONIBUS, OUTRO
    // =========================================================================
    const AGENT_CODE_VALUES = [
      'VEICULO_FROTA',
      'ONIBUS_FROTA',
      'MOTOCICLISTA',
      'CICLISTA',
      'PEDESTRE',
      'PASSAGEIRO_ONIBUS',
      'OUTRO',
    ]

    // Adicionar agent_code em segment_readings
    if (!segReadingsCol.fields.getByName('agent_code')) {
      segReadingsCol.fields.add(
        new SelectField({
          name: 'agent_code',
          values: AGENT_CODE_VALUES,
          maxSelect: 1,
          required: false,
        }),
      )
    }

    // Adicionar agent_code em road_events
    if (!roadEventsCol.fields.getByName('agent_code')) {
      roadEventsCol.fields.add(
        new SelectField({
          name: 'agent_code',
          values: AGENT_CODE_VALUES,
          maxSelect: 1,
          required: false,
        }),
      )
    }

    // Adicionar agent_code em field_sessions
    if (!fieldSessionsCol.fields.getByName('agent_code')) {
      fieldSessionsCol.fields.add(
        new SelectField({
          name: 'agent_code',
          values: AGENT_CODE_VALUES,
          maxSelect: 1,
          required: false,
        }),
      )
    }

    // Salvar coleções alteradas
    app.save(segReadingsCol)
    app.save(roadEventsCol)
    app.save(fieldSessionsCol)
    app.save(roadSegsCol)
    app.save(fleetCol)

    // Preencher default VEICULO_FROTA em registros existentes via raw SQL
    try {
      app
        .db()
        .newQuery(
          "UPDATE segment_readings SET agent_code = 'VEICULO_FROTA' WHERE agent_code IS NULL OR agent_code = ''",
        )
        .execute()
    } catch (_) {}

    try {
      app
        .db()
        .newQuery(
          "UPDATE road_events SET agent_code = 'VEICULO_FROTA' WHERE agent_code IS NULL OR agent_code = ''",
        )
        .execute()
    } catch (_) {}

    try {
      app
        .db()
        .newQuery(
          "UPDATE field_sessions SET agent_code = 'VEICULO_FROTA' WHERE agent_code IS NULL OR agent_code = ''",
        )
        .execute()
    } catch (_) {}

    // Adicionar índices para agent_code
    try {
      segReadingsCol.addIndex('idx_seg_readings_agent', false, 'agent_code', '')
      app.save(segReadingsCol)
    } catch (_) {}

    try {
      roadEventsCol.addIndex('idx_road_events_agent', false, 'agent_code', '')
      app.save(roadEventsCol)
    } catch (_) {}

    try {
      fieldSessionsCol.addIndex('idx_field_sessions_agent', false, 'agent_code', '')
      app.save(fieldSessionsCol)
    } catch (_) {}
  },
  (app) => {
    // Revert: remover campos
    try {
      const segReadingsCol = app.findCollectionByNameOrId('segment_readings')
      segReadingsCol.fields.removeByName('agent_code')
      segReadingsCol.removeIndex('idx_seg_readings_agent')
      app.save(segReadingsCol)
    } catch (_) {}

    try {
      const roadEventsCol = app.findCollectionByNameOrId('road_events')
      roadEventsCol.fields.removeByName('agent_code')
      roadEventsCol.removeIndex('idx_road_events_agent')
      app.save(roadEventsCol)
    } catch (_) {}

    try {
      const fieldSessionsCol = app.findCollectionByNameOrId('field_sessions')
      fieldSessionsCol.fields.removeByName('agent_code')
      fieldSessionsCol.removeIndex('idx_field_sessions_agent')
      app.save(fieldSessionsCol)
    } catch (_) {}
  },
)
