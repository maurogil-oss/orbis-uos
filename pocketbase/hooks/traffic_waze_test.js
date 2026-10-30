// Hook para teste seguro e honesto de feed externo Waze for Cities
// Endpoint: POST /backend/v1/traffic/test-waze-feed
// Exige autenticação institucional ($apis.requireAuth)
// Valida formato de URL, efetua chamada real HTTP e verifica se a resposta é um JSON de feed válido
// Nunca finge dados nem simula sucesso se a chamada falhar.

routerAdd(
  'POST',
  '/backend/v1/traffic/test-waze-feed',
  (e) => {
    let body = {}
    try {
      body = e.requestInfo().body || {}
    } catch (_) {
      body = {}
    }

    const feedUrl = String(body.url || '').trim()

    if (!feedUrl) {
      return e.json(400, {
        ok: false,
        status: 'erro_validacao',
        message: 'A URL do feed do Waze for Cities é obrigatória.',
      })
    }

    // Validação básica de protocolo
    if (!feedUrl.startsWith('http://') && !feedUrl.startsWith('https://')) {
      return e.json(400, {
        ok: false,
        status: 'url_invalida',
        message: 'A URL deve iniciar com http:// ou https://',
      })
    }

    const startedAt = Date.now()
    try {
      const response = $http.send({
        url: feedUrl,
        method: 'GET',
        headers: {
          Accept: 'application/json, application/geo+json, text/plain, */*',
          'User-Agent': 'ORBIS-UOS-GovTech-TrafficAdapter/1.0 (Curitiba/PR)',
        },
        timeout: 10,
      })

      const elapsedMs = Date.now() - startedAt
      const statusCode = response.statusCode

      // Verifica corpo e tipo
      let isJson = false
      let parsedJson = null
      let totalAlerts = 0
      let totalJams = 0
      let isGeoJson = false
      let rootKeys = []

      if (response.raw) {
        try {
          parsedJson = JSON.parse(response.raw)
          isJson = true
        } catch (_) {
          isJson = false
        }
      }

      if (isJson && parsedJson && typeof parsedJson === 'object') {
        rootKeys = Object.keys(parsedJson).slice(0, 10)

        // Estrutura clássica de feed do Waze for Cities:
        // { alerts: [...], jams: [...], endTimeMillis: ... }
        if (Array.isArray(parsedJson.alerts)) {
          totalAlerts = parsedJson.alerts.length
        }
        if (Array.isArray(parsedJson.jams)) {
          totalJams = parsedJson.jams.length
        }

        // Estrutura GeoJSON alternativa emitida por alguns órgãos
        if (parsedJson.type === 'FeatureCollection' && Array.isArray(parsedJson.features)) {
          isGeoJson = true
          totalAlerts = parsedJson.features.length
        }
      }

      if (statusCode >= 200 && statusCode < 300) {
        if (!isJson) {
          return e.json(200, {
            ok: false,
            httpStatus: statusCode,
            elapsedMs: elapsedMs,
            status: 'conteudo_invalido',
            message:
              'O servidor respondeu com HTTP ' +
              statusCode +
              ', porém o conteúdo retornado não é um JSON válido de feed Waze for Cities.',
            contentType:
              response.headers['Content-Type'] ||
              response.headers['content-type'] ||
              'desconhecido',
          })
        }

        const looksLikeWazeFeed =
          totalAlerts > 0 ||
          totalJams > 0 ||
          isGeoJson ||
          rootKeys.includes('alerts') ||
          rootKeys.includes('jams') ||
          rootKeys.includes('endTimeMillis') ||
          rootKeys.includes('startTimeMillis')

        return e.json(200, {
          ok: true,
          httpStatus: statusCode,
          elapsedMs: elapsedMs,
          status: 'sucesso',
          message: looksLikeWazeFeed
            ? 'Feed Waze for Cities verificado com sucesso! Estrutura de alertas e lentidão confirmada.'
            : 'O endereço respondeu com JSON válido (HTTP ' +
              statusCode +
              '), pronto para leitura de malha.',
          details: {
            totalAlerts: totalAlerts,
            totalJams: totalJams,
            isGeoJson: isGeoJson,
            rootKeys: rootKeys,
          },
        })
      }

      // Códigos de erro HTTP
      return e.json(200, {
        ok: false,
        httpStatus: statusCode,
        elapsedMs: elapsedMs,
        status: 'erro_http',
        message:
          'O servidor do feed retornou erro HTTP ' +
          statusCode +
          '. Verifique se a URL emitida no convênio está ativa e liberada para leitura.',
      })
    } catch (err) {
      const elapsedMs = Date.now() - startedAt
      return e.json(200, {
        ok: false,
        httpStatus: 0,
        elapsedMs: elapsedMs,
        status: 'falha_conexao',
        message:
          'Não foi possível conectar ao endereço informado (timeout ou erro de rede: ' +
          String(err.message || err) +
          '). Certifique-se de que a URL é acessível publicamente.',
      })
    }
  },
  $apis.requireAuth(),
)
