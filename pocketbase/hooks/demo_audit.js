// Hook público para registro de início de demonstração orientada autoguiada (/demo)
// Endpoint: POST /backend/v1/public/demo-start
// Permite que munícipes, gestores públicos e avaliadores iniciem a demonstração sem autenticação prévia
// registrando o evento soberano DEMO_STARTED na trilha de auditoria (audit_trail) em institucional_settings.

routerAdd('POST', '/backend/v1/public/demo-start', (e) => {
  let codigoIbge = '4106902'
  let userAgent = ''
  let referrer = ''
  let origem = 'web_demo_tour'

  try {
    const body = e.requestInfo().body || {}
    if (body.codigo_ibge) {
      codigoIbge = String(body.codigo_ibge).replace(/\D/g, '') || '4106902'
    }
    if (body.origem) {
      origem = String(body.origem).slice(0, 50)
    }
  } catch (_) {}

  try {
    const headers = e.requestInfo().headers || {}
    userAgent = headers['user-agent'] ? String(headers['user-agent']).slice(0, 150) : ''
    referrer = headers['referer'] ? String(headers['referer']).slice(0, 150) : ''
  } catch (_) {}

  const now = new Date()
  const eventId = 'evt_' + now.getTime() + '_demo_start'

  try {
    const settings = $app.findFirstRecordByData('institucional_settings', 'codigo_ibge', codigoIbge)
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

      const demoEvent = {
        id: eventId,
        event: 'DEMO_STARTED',
        author: {
          id: 'public_demo_visitor',
          email: 'visitante.demo@orbis.gov.br',
          name: 'SISTEMA (Modo Demonstração Orientada)',
          role: 'system',
        },
        details: {
          origem: origem,
          tour_versao: '0.0.29',
          etapas_previstas: [
            'Diagnóstico Express',
            'Simulador',
            'Telemetria',
            'Índices IMV/IMA',
            'Interoperabilidade',
            'Relatórios com hash',
          ],
          user_agent: userAgent,
          referrer: referrer,
          marcos_legais_auditados: [
            'Art. 320 da Lei 4.320/1964 (Custo Evitado e Equilíbrio Fiscal)',
            'Art. 320 da Lei 9.503/1997 (CTB - Saldo Blindado de Multas)',
            'Lei 13.709/2018 (LGPD Art. 12 & k-anonimato com k ≥ 3 sessões)',
          ],
        },
        compliance: 'Demonstração Pública Comercial Autoguiada / Art. 27 LC 182/2021',
        timestamp: now.toISOString(),
      }

      trail.unshift(demoEvent)
      if (trail.length > 50) {
        trail = trail.slice(0, 50)
      }

      settings.set('audit_trail', JSON.stringify(trail))
      $app.save(settings)

      return e.json(200, {
        success: true,
        event_id: eventId,
        registered_at: now.toISOString(),
        message: 'Início da demonstração registrado com sucesso na trilha de auditoria soberana.',
      })
    }
  } catch (err) {
    console.log('[DEMO_HOOK_ERROR] Erro ao gravar evento DEMO_STARTED:', err)
  }

  return e.json(200, {
    success: true,
    event_id: eventId,
    registered_at: now.toISOString(),
    message: 'Demonstração iniciada em modo contingencial (fallback sem persistência direta).',
  })
})
