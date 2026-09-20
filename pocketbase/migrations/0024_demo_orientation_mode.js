/// <reference path="../pb_data/types.d.ts" />

/**
 * Migração 0024: Registro do Evento DEMO_STARTED e Configuração do Modo Demonstração Orientada
 *
 * Registra formalmente a implementação do Modo Demonstração Orientada (/demo)
 * na collection institucional_settings (campo audit_trail), com autoria SISTEMA
 * e compliance ao Art. 27 da LC 182/2021, Art. 320 da Lei 4.320/64 e LGPD.
 */
migrate(
  (app) => {
    const now = new Date()

    try {
      const settings = app.findFirstRecordByData('institucional_settings', 'codigo_ibge', '4106902')
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

        const demoFeatureEvent = {
          id: 'evt_' + now.getTime() + '_demo_initialized',
          event: 'DEMO_STARTED',
          author: {
            id: 'system_migration_0024',
            email: 'sistema@orbis.gov.br',
            name: 'SISTEMA (Modo Demonstração Orientada)',
            role: 'system',
          },
          details: {
            titulo: 'Inicialização do Modo Demonstração Orientada (/demo)',
            versao_produto: '0.0.29',
            municipio_ibge: '4106902',
            municipio_nome: 'Curitiba',
            data_execucao: now.toISOString(),
            roteiro_guiado: [
              {
                ordem: 1,
                etapa: 'Diagnóstico Express',
                foco: 'Calculadora preliminar e dimensionamento CPSI',
              },
              {
                ordem: 2,
                etapa: 'Simulador',
                foco: 'Custo Evitado (Art. 320 da Lei 4.320/64 e Fundo CTB)',
              },
              {
                ordem: 3,
                etapa: 'Telemetria',
                foco: 'Coleta inercial passiva via frota pública existente',
              },
              {
                ordem: 4,
                etapa: 'Índices IMV/IMA',
                foco: 'Fator F ≥ 3 e k-anonimato H3 (≥3 sessões)',
              },
              {
                ordem: 5,
                etapa: 'Interoperabilidade',
                foco: 'GeoJSON hexagonal H3, webhooks e integração CIC',
              },
              {
                ordem: 6,
                etapa: 'Relatórios com hash',
                foco: 'Integridade criptográfica SHA-256 e conformidade TCE',
              },
            ],
            compliance: 'Art. 27 LC 182/2021, Art. 320 da Lei 4.320/64 & LGPD Art. 12',
          },
          compliance: 'Modo Demonstração Orientada / Governança Transparente B2G',
          timestamp: now.toISOString(),
        }

        trail.unshift(demoFeatureEvent)

        if (trail.length > 50) {
          trail = trail.slice(0, 50)
        }

        settings.set('audit_trail', JSON.stringify(trail))
        app.save(settings)
      }
    } catch (e) {
      console.log('Aviso ao registrar evento do Modo Demonstração na migração 0024:', e)
    }
  },
  (app) => {
    // Reversão defensiva
    try {
      const settings = app.findFirstRecordByData('institucional_settings', 'codigo_ibge', '4106902')
      if (settings) {
        // Nada destrutivo
      }
    } catch (_) {}
  },
)
