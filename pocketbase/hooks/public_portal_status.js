// Hook público para consulta de status do Portal do Cidadão
// Endpoint: GET /backend/v1/public/portal-status
// Retorna apenas dados públicos necessários para verificar se o portal municipal está ativo
// sem expor configurações sensíveis (cgu_api_key, etc.) e sem exigir autenticação.

routerAdd('GET', '/backend/v1/public/portal-status', (e) => {
  let codigoIbge = '4106902'
  try {
    const q = e.requestInfo().query
    if (q && q.codigo_ibge) {
      codigoIbge = String(q.codigo_ibge).replace(/\D/g, '') || '4106902'
    }
  } catch (_) {
    codigoIbge = '4106902'
  }

  try {
    const settings = $app.findFirstRecordByData('institucional_settings', 'codigo_ibge', codigoIbge)
    if (settings) {
      return e.json(200, {
        municipio: settings.getString('municipio') || 'Curitiba',
        uf: settings.getString('uf') || 'PR',
        codigo_ibge: settings.getString('codigo_ibge') || codigoIbge,
        portal_publico_ativo: settings.getBool('portal_publico_ativo') === true,
        portal_mensagem_institucional: settings.getString('portal_mensagem_institucional') || '',
      })
    }
  } catch (_) {}

  return e.json(200, {
    municipio: 'Curitiba',
    uf: 'PR',
    codigo_ibge: codigoIbge,
    portal_publico_ativo: false,
    portal_mensagem_institucional: '',
  })
})
