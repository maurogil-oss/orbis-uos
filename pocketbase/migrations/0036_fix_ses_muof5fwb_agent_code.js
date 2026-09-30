migrate(
  (app) => {
    // =========================================================================
    // Correção da sessão real de campo SES-MUOF5FWB:
    // O teste foi realizado com o veículo SUV pessoal do usuário (veículo leve institucional),
    // mas foi gravado como ONIBUS_FROTA.
    // Atualiza agent_code para VEICULO_FROTA e veiculo_tipo para 'suv'/'veiculo_frota'
    // mantendo distância, IRI, rota, operador e demais métricas intactos.
    // Também atualiza qualquer segment_readings ou road_events associados, se existirem.
    // =========================================================================

    try {
      app
        .db()
        .newQuery(
          "UPDATE field_sessions SET agent_code = 'VEICULO_FROTA', veiculo_tipo = 'suv', linha_frota = 'Veículo Leve Institucional (SUV)' WHERE session_code = 'SES-MUOF5FWB'",
        )
        .execute()
    } catch (e) {
      console.log('Erro ao atualizar field_sessions SES-MUOF5FWB:', e)
    }

    // Atualizar leituras de segmento vinculadas ao id do dispositivo da sessão (DEV-0UAIZ) ou session code se houver
    try {
      app
        .db()
        .newQuery(
          "UPDATE segment_readings SET agent_code = 'VEICULO_FROTA', veiculo_tipo = 'suv' WHERE veiculo_id = 'DEV-0UAIZ'",
        )
        .execute()
    } catch (e) {
      console.log('Erro ao atualizar segment_readings:', e)
    }

    // Atualizar road_events vinculados se existirem
    try {
      app
        .db()
        .newQuery(
          "UPDATE road_events SET agent_code = 'VEICULO_FROTA' WHERE linha_frota LIKE '%SES-MUOF5FWB%' OR linha_frota LIKE '%Ligeirinho 203%' AND created >= '2026-09-30 18:00:00' AND created <= '2026-09-30 18:30:00'",
        )
        .execute()
    } catch (e) {
      console.log('Erro ao atualizar road_events:', e)
    }
  },
  (app) => {
    // Revert opcional
    try {
      app
        .db()
        .newQuery(
          "UPDATE field_sessions SET agent_code = 'ONIBUS_FROTA', veiculo_tipo = 'onibus' WHERE session_code = 'SES-MUOF5FWB'",
        )
        .execute()
    } catch (_) {}
  },
)
