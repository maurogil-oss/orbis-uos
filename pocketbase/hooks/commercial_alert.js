// Hook server-side do PocketBase para disparo de aviso comercial automático
// a cada manifesto de interesse capturado (leads e express_diagnostics)
//
// REQUISITOS:
// 1. Gatilho: onRecordAfterCreateSuccess('leads') e onRecordAfterCreateSuccess('express_diagnostics')
// 2. Canal: Envio transacional de e-mail via $app.newMailClient() com fallback de log
// 3. Destinatários: secret COMMERCIAL_ALERT_EMAILS ou ORBIS_COMERCIAL_EMAIL ou institucional@orbis.gov.br
// 4. Se falhar, NÃO quebrar a captura do lead (try/catch seguro)

onRecordAfterCreateSuccess((e) => {
  try {
    const rec = e.record
    if (!rec) return

    const nome = rec.getString('nome') || 'Não informado'
    const email = rec.getString('email') || 'Não informado'
    const cargo = rec.getString('cargo') || 'Não informado'
    const orgao = rec.getString('orgao') || 'Não informado'
    const porte = rec.getString('porte') || 'Municipal'
    const telefone = rec.getString('telefone') || 'Não informado'
    const created = rec.getString('created') || new Date().toISOString()

    console.log(
      `[COMERCIAL][LEAD] Novo Manifesto de Interesse capturado: ${nome} (${cargo} - ${orgao}) - Contato: ${email} | Tel: ${telefone} | Porte: ${porte} | Data: ${created}`,
    )

    // Destinatário do aviso comercial
    const envDest =
      $os.getenv('COMMERCIAL_ALERT_EMAILS') ||
      $os.getenv('ORBIS_COMERCIAL_EMAIL') ||
      'comercial@orbis.gov.br'
    const recipients = envDest
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const senderEmail = $app.settings()?.meta?.senderAddress || 'noreply@orbis.gov.br'
    const senderName = $app.settings()?.meta?.senderName || 'ORBIS.UOS Comercial'

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; background-color: #070D1F; color: #F8FAFC; padding: 24px; border-radius: 12px; border: 1px solid #1A2A5A;">
        <h2 style="color: #3B82F6; margin-top: 0;">🚨 Novo Manifesto de Interesse Institucional (ORBIS.UOS)</h2>
        <p style="color: #94A3B8; font-size: 14px;">Um novo gestor público registrou manifesto de interesse para piloto CPSI (LC 182/2021).</p>
        <hr style="border: 0; border-top: 1px solid #1A2A5A; margin: 16px 0;" />
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #94A3B8; width: 180px;"><strong>Tipo de Captura:</strong></td><td style="color: #10B981; font-weight: bold;">Manifesto de Interesse (Landing)</td></tr>
          <tr><td style="padding: 6px 0; color: #94A3B8;"><strong>Responsável:</strong></td><td style="color: #F8FAFC;">${nome}</td></tr>
          <tr><td style="padding: 6px 0; color: #94A3B8;"><strong>Cargo / Função:</strong></td><td style="color: #F8FAFC;">${cargo}</td></tr>
          <tr><td style="padding: 6px 0; color: #94A3B8;"><strong>Órgão / Município:</strong></td><td style="color: #F8FAFC;">${orgao}</td></tr>
          <tr><td style="padding: 6px 0; color: #94A3B8;"><strong>Esfera / Porte:</strong></td><td style="color: #F8FAFC;">${porte}</td></tr>
          <tr><td style="padding: 6px 0; color: #94A3B8;"><strong>E-mail Oficial:</strong></td><td style="color: #60A5FA;">${email}</td></tr>
          <tr><td style="padding: 6px 0; color: #94A3B8;"><strong>Telefone Institucional:</strong></td><td style="color: #F8FAFC;">${telefone}</td></tr>
          <tr><td style="padding: 6px 0; color: #94A3B8;"><strong>Data / Hora (UTC):</strong></td><td style="color: #F8FAFC;">${created}</td></tr>
        </table>
        <div style="margin-top: 20px; padding: 12px; background: #0A1128; border-radius: 8px; border: 1px solid #1A2A5A; font-size: 12px; color: #94A3B8;">
          Ação comercial recomendada: entrar em contato em até 48 horas úteis com o kit de adesão CPSI e minuta do Art. 320 do CTB adaptada ao porte.
        </div>
      </div>
    `

    for (let i = 0; i < recipients.length; i++) {
      try {
        const mail = new MailerMessage({
          from: {
            address: senderEmail,
            name: senderName,
          },
          to: [{ address: recipients[i] }],
          subject: `[ORBIS.UOS] 🚨 Novo Manifesto de Interesse: ${orgao} (${nome})`,
          html: htmlBody,
        })
        $app.newMailClient().send(mail)
        console.log(`[COMERCIAL][EMAIL] Alerta enviado com sucesso para ${recipients[i]}`)
      } catch (mailErr) {
        console.warn(
          `[COMERCIAL][EMAIL] Falha no envio de e-mail para ${recipients[i]}: ${mailErr}`,
        )
      }
    }
  } catch (err) {
    console.error(`[COMERCIAL][HOOK_ERROR] Erro no processamento do lead: ${err}`)
  }
}, 'leads')

onRecordAfterCreateSuccess((e) => {
  try {
    const rec = e.record
    if (!rec) return

    const municipio = rec.getString('municipio') || 'Não informado'
    const uf = rec.getString('uf') || 'PR'
    const populacao = rec.getInt('populacao_ibge') || 0
    const codigoIbge = rec.getString('codigo_ibge') || 'Não informado'
    const responsavelNome = rec.getString('responsavel_nome') || 'Não informado'
    const responsavelCargo = rec.getString('responsavel_cargo') || 'Não informado'
    const emailOficial = rec.getString('email_oficial') || 'Não informado'
    const telefone = rec.getString('telefone') || 'Não informado'
    const statusMun = rec.getString('status_municipalizacao') || 'Não informado'
    const frotaOnibus = rec.getInt('frota_onibus') || 0
    const frotaColeta = rec.getInt('frota_caminhoes_coleta') || 0
    const frotaViaturas = rec.getInt('frota_viaturas') || 0
    const scoreProvisorio = rec.getInt('score_provisorio') || 0
    const faixaProvisoria = rec.getString('faixa_provisoria') || 'Em Consolidação'
    const veiculosSugeridos = rec.getInt('veiculos_sensor_sugeridos') || 5
    const created = rec.getString('created') || new Date().toISOString()

    let porteDesc = 'Pequena (até 50k)'
    if (populacao > 300000) porteDesc = 'Grande (300k+)'
    else if (populacao > 50000) porteDesc = 'Média (50k a 300k)'

    console.log(
      `[COMERCIAL][DIAGNOSTICO_EXPRESS] Nova Coleta de Diagnóstico Express: ${municipio}/${uf} (${populacao} hab - Porte ${porteDesc}) - Responsável: ${responsavelNome} (${responsavelCargo}) | E-mail: ${emailOficial} | Frota: Ônibus=${frotaOnibus}, Coleta=${frotaColeta}, Viaturas=${frotaViaturas} | Score: ${scoreProvisorio} (${faixaProvisoria}) | Sensores sugeridos: ${veiculosSugeridos}`,
    )

    // Destinatário do aviso comercial
    const envDest =
      $os.getenv('COMMERCIAL_ALERT_EMAILS') ||
      $os.getenv('ORBIS_COMERCIAL_EMAIL') ||
      'comercial@orbis.gov.br'
    const recipients = envDest
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const senderEmail = $app.settings()?.meta?.senderAddress || 'noreply@orbis.gov.br'
    const senderName = $app.settings()?.meta?.senderName || 'ORBIS.UOS Comercial'

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; background-color: #070D1F; color: #F8FAFC; padding: 24px; border-radius: 12px; border: 1px solid #1A2A5A;">
        <h2 style="color: #10B981; margin-top: 0;">⚡ Novo Diagnóstico Express & Dimensionamento CPSI</h2>
        <p style="color: #94A3B8; font-size: 14px;">Um novo município realizou o Pré-diagnóstico Provisório na plataforma ORBIS.UOS.</p>
        <hr style="border: 0; border-top: 1px solid #1A2A5A; margin: 16px 0;" />
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #94A3B8; width: 200px;"><strong>Tipo de Captura:</strong></td><td style="color: #3B82F6; font-weight: bold;">Diagnóstico Express (Calculadora CPSI)</td></tr>
          <tr><td style="padding: 6px 0; color: #94A3B8;"><strong>Município / UF:</strong></td><td style="color: #F8FAFC; font-weight: bold;">${municipio} / ${uf}</td></tr>
          <tr><td style="padding: 6px 0; color: #94A3B8;"><strong>Código IBGE / População:</strong></td><td style="color: #F8FAFC;">${codigoIbge} • ${populacao.toLocaleString('pt-BR')} hab. (Porte: ${porteDesc})</td></tr>
          <tr><td style="padding: 6px 0; color: #94A3B8;"><strong>Responsável:</strong></td><td style="color: #F8FAFC;">${responsavelNome} (${responsavelCargo})</td></tr>
          <tr><td style="padding: 6px 0; color: #94A3B8;"><strong>E-mail Oficial:</strong></td><td style="color: #60A5FA;">${emailOficial}</td></tr>
          <tr><td style="padding: 6px 0; color: #94A3B8;"><strong>Telefone:</strong></td><td style="color: #F8FAFC;">${telefone}</td></tr>
          <tr><td style="padding: 6px 0; color: #94A3B8;"><strong>Municipalização CTB:</strong></td><td style="color: #F8FAFC;">${statusMun}</td></tr>
          <tr><td style="padding: 6px 0; color: #94A3B8;"><strong>Frotas Informadas:</strong></td><td style="color: #10B981;">Ônibus: ${frotaOnibus} | Coleta: ${frotaColeta} | Viaturas: ${frotaViaturas}</td></tr>
          <tr><td style="padding: 6px 0; color: #94A3B8;"><strong>Score Provisório:</strong></td><td style="color: #F8FAFC; font-weight: bold;">${scoreProvisorio}/100 (${faixaProvisoria})</td></tr>
          <tr><td style="padding: 6px 0; color: #94A3B8;"><strong>Veículos-Sensor Recomendados:</strong></td><td style="color: #10B981; font-weight: bold;">${veiculosSugeridos} veículos</td></tr>
          <tr><td style="padding: 6px 0; color: #94A3B8;"><strong>Data / Hora (UTC):</strong></td><td style="color: #F8FAFC;">${created}</td></tr>
        </table>
        <div style="margin-top: 20px; padding: 12px; background: #0A1128; border-radius: 8px; border: 1px solid #1A2A5A; font-size: 12px; color: #94A3B8;">
          Ação comercial recomendada: convidar o município para a etapa do Enquadramento Completo de 6 blocos com emissão de Dossiê SHA-256 e Minuta do Art. 320.
        </div>
      </div>
    `

    for (let i = 0; i < recipients.length; i++) {
      try {
        const mail = new MailerMessage({
          from: {
            address: senderEmail,
            name: senderName,
          },
          to: [{ address: recipients[i] }],
          subject: `[ORBIS.UOS] ⚡ Novo Diagnóstico Express: ${municipio}/${uf} (${responsavelNome})`,
          html: htmlBody,
        })
        $app.newMailClient().send(mail)
        console.log(`[COMERCIAL][EMAIL] Alerta express enviado com sucesso para ${recipients[i]}`)
      } catch (mailErr) {
        console.warn(
          `[COMERCIAL][EMAIL] Falha no envio de e-mail express para ${recipients[i]}: ${mailErr}`,
        )
      }
    }
  } catch (err) {
    console.error(`[COMERCIAL][HOOK_ERROR] Erro no processamento do express_diagnostics: ${err}`)
  }
}, 'express_diagnostics')
