// Hook para purga diária automatizada de telemetria bruta com mais de 180 dias
// Conforme prometido publicamente na página /privacidade e na LGPD
// Cron agendado para 03h30 BRT (06h30 UTC) diariamente: cron expression "30 6 * * *"
// Preserva os índices agregados em road_segments (IMV/IMA) e remove amostras brutas de segment_readings e field_sessions
// Registra a contagem de registros purgados e a autoria como SISTEMA na trilha de auditoria em institucional_settings.
// Também disponibiliza endpoint administrativo para execução/simulação sob demanda: POST /backend/v1/telemetry/purge (requer auth admin).

cronAdd('telemetry_purge_180d', '30 6 * * *', () => {
  const cutoffDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
  const cutoffIso = cutoffDate.toISOString().replace('T', ' ').slice(0, 19)

  let purgedReadings = 0
  let purgedSessions = 0

  // 1. Purga de segment_readings com mais de 180 dias
  try {
    const resReadings = $app
      .db()
      .newQuery('DELETE FROM segment_readings WHERE created < {:cutoff}')
      .bind({ cutoff: cutoffIso })
      .execute()
    purgedReadings = (resReadings && resReadings.rowsAffected) || 0
  } catch (err) {
    console.log('Erro ao purgar segment_readings:', err)
  }

  // 2. Purga de field_sessions brutas com mais de 180 dias
  try {
    const resSessions = $app
      .db()
      .newQuery('DELETE FROM field_sessions WHERE created < {:cutoff}')
      .bind({ cutoff: cutoffIso })
      .execute()
    purgedSessions = (resSessions && resSessions.rowsAffected) || 0
  } catch (err) {
    console.log('Erro ao purgar field_sessions:', err)
  }

  // 3. Registrar execução e contagem na trilha de auditoria institucional
  try {
    const settings = $app.findFirstRecordByData('institucional_settings', 'codigo_ibge', '4106902')
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

      const purgeEvent = {
        id: 'evt_' + new Date().getTime() + '_purge',
        event: 'TELEMETRY_RAW_PURGE_EXECUTED',
        author: {
          id: 'system_cron_job',
          email: 'sistema@orbis-uos.com.br',
          name: 'SISTEMA (Job Agendado 03h30 BRT)',
          role: 'system',
        },
        details: {
          cutoff_date: cutoffIso,
          retention_days: 180,
          purged_segment_readings: purgedReadings,
          purged_field_sessions: purgedSessions,
          total_purged: purgedReadings + purgedSessions,
          preserved_aggregations: 'road_segments (IMV/IMA)',
          compliance: 'LGPD Art. 16 e Compromisso de Retenção de 180 dias (/privacidade)',
        },
        timestamp: new Date().toISOString(),
      }

      trail.unshift(purgeEvent)
      if (trail.length > 50) {
        trail = trail.slice(0, 50)
      }

      settings.set('audit_trail', JSON.stringify(trail))
      $app.save(settings)
    }
  } catch (auditErr) {
    console.log('Erro ao registrar auditoria de purga:', auditErr)
  }
})

// Endpoint administrativo para execução sob demanda ou verificação de status
routerAdd(
  'POST',
  '/backend/v1/telemetry/purge',
  (e) => {
    const authUser = e.auth
    if (!authUser || authUser.getString('role') !== 'admin') {
      return e.json(403, { error: 'Apenas administradores podem acionar a purga de dados.' })
    }

    const cutoffDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
    const cutoffIso = cutoffDate.toISOString().replace('T', ' ').slice(0, 19)

    let purgedReadings = 0
    let purgedSessions = 0

    try {
      const resReadings = $app
        .db()
        .newQuery('DELETE FROM segment_readings WHERE created < {:cutoff}')
        .bind({ cutoff: cutoffIso })
        .execute()
      purgedReadings = (resReadings && resReadings.rowsAffected) || 0
    } catch (err) {
      console.log('Erro manual segment_readings:', err)
    }

    try {
      const resSessions = $app
        .db()
        .newQuery('DELETE FROM field_sessions WHERE created < {:cutoff}')
        .bind({ cutoff: cutoffIso })
        .execute()
      purgedSessions = (resSessions && resSessions.rowsAffected) || 0
    } catch (err) {
      console.log('Erro manual field_sessions:', err)
    }

    // Registrar auditoria com os dados do usuário autenticado solicitante
    try {
      const settings = $app.findFirstRecordByData(
        'institucional_settings',
        'codigo_ibge',
        '4106902',
      )
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

        const purgeEvent = {
          id: 'evt_' + new Date().getTime() + '_manual_purge',
          event: 'TELEMETRY_RAW_PURGE_TRIGGERED_BY_ADMIN',
          author: {
            id: authUser.id,
            email: authUser.email(),
            name: authUser.getString('name') || 'Administrador Institucional',
            role: authUser.getString('role') || 'admin',
          },
          details: {
            cutoff_date: cutoffIso,
            retention_days: 180,
            purged_segment_readings: purgedReadings,
            purged_field_sessions: purgedSessions,
            total_purged: purgedReadings + purgedSessions,
            preserved_aggregations: 'road_segments (IMV/IMA)',
            triggered_manually: true,
          },
          timestamp: new Date().toISOString(),
        }

        trail.unshift(purgeEvent)
        if (trail.length > 50) {
          trail = trail.slice(0, 50)
        }

        settings.set('audit_trail', JSON.stringify(trail))
        $app.save(settings)
      }
    } catch (auditErr) {
      console.log('Erro ao registrar auditoria manual de purga:', auditErr)
    }

    return e.json(200, {
      success: true,
      message: 'Rotina de purga executada com sucesso.',
      cutoff_date: cutoffIso,
      retention_days: 180,
      purged_segment_readings: purgedReadings,
      purged_field_sessions: purgedSessions,
      total_purged: purgedReadings + purgedSessions,
    })
  },
  $apis.requireAuth(),
)
