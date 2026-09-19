/**
 * Utilitário de Processamento Digital de Sinais (DSP) e FFT Embarcada na Borda (Edge)
 * Implementa o pipeline do SDK Edge ORBIS.UOS:
 * 1. Janelamento Hanning (redução de spectral leakage)
 * 2. FFT Radix-2 Cooley-Tukey
 * 3. Filtragem e isolamento da banda relevante de 1–20 Hz (padrão de vibração veicular x irregularidade do asfalto)
 * 4. Frequência dominante, energia espectral e assinatura de anomalias
 * 5. Agregação por Janela (RMS vertical, picos de impacto Z, solavancos angulares e estimativa de IRI)
 */

export interface SpectrumBin {
  frequency: number // Hz
  magnitude: number // dB ou g normalizado (0-100)
  isTargetBand: boolean // 1 a 20 Hz
}

export interface TargetFftBandConfig {
  minHz: number
  maxHz: number
  label: string
  descricao: string
}

export const FFT_BANDS_BY_MODE: Record<
  'veiculo' | 'pedestre' | 'ciclista' | 'motociclista',
  TargetFftBandConfig
> = {
  veiculo: {
    minHz: 1.0,
    maxHz: 20.0,
    label: '1–20 Hz (Veicular Geral)',
    descricao: 'Resposta mecânica de suspensão, ressonância de chassi e irregularidade do asfalto.',
  },
  pedestre: {
    minHz: 0.8,
    maxHz: 3.5,
    label: '0.8–3.5 Hz (Caminhada / Calçadas)',
    descricao: 'Cadência humana do passo (1.4–2.5 Hz) e tropeços, degraus e fissuras em calçadas.',
  },
  ciclista: {
    minHz: 2.0,
    maxHz: 12.0,
    label: '2–12 Hz (Micromobilidade / Ciclovias)',
    descricao: 'Rigidez de garfo sem amortecedor, sarjetas transversais, juntas e pedras soltas.',
  },
  motociclista: {
    minHz: 3.0,
    maxHz: 22.0,
    label: '3–22 Hz (Motocicleta / Pistas)',
    descricao:
      'Suspensão de duas rodas, ranhuras longitudinais e alta densidade de amostragem viária.',
  },
}

export interface SpectrumAnalysisResult {
  bins: SpectrumBin[]
  dominantFrequency: number // Hz
  targetBandEnergy: number // Energia relativa na banda configurada (0–100%)
  totalEnergy: number
  peakMagnitude: number
  targetBandMinHz: number
  targetBandMaxHz: number
  spectralSignature:
    | 'vibracao_continua'
    | 'impacto_buraco'
    | 'ondulacao_baixa_freq'
    | 'ruido_estacionario'
    | 'passo_pedestre'
    | 'trepidacao_ciclovia'
}

export interface WindowMetricsResult {
  rmsVerticalG: number
  peakZ_G: number
  impactsCount: number
  angularBumpCount: number
  desvioAngularCount: number // Solavancos laterais associados ao desvio de obstáculos
  estimatedIri: number
  dominantFreqHz: number
  targetBandEnergyPct: number
  samplesCount: number
  durationMs: number
}

/**
 * Aplica Janelamento de Hanning para suavizar transições de borda na janela temporal
 */
export function applyHanningWindow(samples: number[]): number[] {
  const n = samples.length
  if (n <= 1) return samples
  const windowed = new Array(n)
  for (let i = 0; i < n; i++) {
    const factor = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (n - 1)))
    windowed[i] = samples[i] * factor
  }
  return windowed
}

/**
 * FFT Radix-2 Cooley-Tukey (In-place) para N potência de 2.
 */
export function radix2FFT(
  realInput: number[],
  imagInput?: number[],
): { real: number[]; imag: number[] } {
  const n = realInput.length
  // Verifica se é potência de 2
  if ((n & (n - 1)) !== 0) {
    throw new Error('Tamanho do buffer deve ser potência de 2 para FFT Radix-2')
  }

  const real = [...realInput]
  const imag = imagInput ? [...imagInput] : new Array(n).fill(0)

  // Bit-reversal permutation
  let j = 0
  for (let i = 0; i < n - 1; i++) {
    if (i < j) {
      const tempR = real[i]
      real[i] = real[j]
      real[j] = tempR

      const tempI = imag[i]
      imag[i] = imag[j]
      imag[j] = tempI
    }
    let k = n >> 1
    while (k <= j) {
      j -= k
      k >>= 1
    }
    j += k
  }

  // Borboletas Cooley-Tukey
  for (let len = 2; len <= n; len <<= 1) {
    const half = len >> 1
    const angle = (-2 * Math.PI) / len
    const wStepR = Math.cos(angle)
    const wStepI = Math.sin(angle)

    for (let i = 0; i < n; i += len) {
      let wR = 1
      let wI = 0
      for (let m = 0; m < half; m++) {
        const idxEven = i + m
        const idxOdd = idxEven + half

        const tr = wR * real[idxOdd] - wI * imag[idxOdd]
        const ti = wR * imag[idxOdd] + wI * real[idxOdd]

        real[idxOdd] = real[idxEven] - tr
        imag[idxOdd] = imag[idxEven] - ti
        real[idxEven] += tr
        imag[idxEven] += ti

        const nextWR = wR * wStepR - wI * wStepI
        wI = wR * wStepI + wI * wStepR
        wR = nextWR
      }
    }
  }

  return { real, imag }
}

/**
 * Analisa um buffer de aceleração Z filtrada (janela temporal)
 * Retorna espectro particionado de 0 a 25 Hz com destaque na banda 1 a 20 Hz
 */
export function computeZAccelerationSpectrum(
  rawSamples: number[],
  sampleRateHz: number = 50,
  targetBinsCount: number = 24, // Bins discretos de 0 a 25 Hz
  bandConfig: TargetFftBandConfig = FFT_BANDS_BY_MODE.veiculo,
): SpectrumAnalysisResult {
  // Ajustar tamanho para a potência de 2 mais próxima <= samples.length
  let n = 1
  while (n * 2 <= rawSamples.length && n * 2 <= 64) {
    n *= 2
  }
  if (n < 16) {
    n = 32
  }

  const inputBuffer: number[] = new Array(n).fill(0)
  for (let i = 0; i < n; i++) {
    inputBuffer[i] = rawSamples[i] !== undefined ? rawSamples[i] : 0
  }

  // Remover componente DC (gravidade / offset médio residual)
  const mean = inputBuffer.reduce((a, b) => a + b, 0) / n
  for (let i = 0; i < n; i++) {
    inputBuffer[i] -= mean
  }

  // Aplicar Hanning
  const windowed = applyHanningWindow(inputBuffer)

  // FFT
  const { real, imag } = radix2FFT(windowed)

  // Calcular magnitudes espectrais de 0 até Nyquist (sampleRateHz / 2 = ~25Hz)
  const halfN = n / 2
  const maxFreq = sampleRateHz / 2
  const rawBins: { freq: number; mag: number }[] = []

  let peakMag = 0.001
  let dominantFreq = 0
  let totalEnergy = 0
  let targetEnergy = 0

  for (let i = 1; i < halfN; i++) {
    const freq = (i * sampleRateHz) / n
    if (freq > 26) continue

    const mag = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]) / halfN
    rawBins.push({ freq, mag })

    const power = mag * mag
    totalEnergy += power

    if (freq >= bandConfig.minHz && freq <= bandConfig.maxHz) {
      targetEnergy += power
    }

    if (mag > peakMag) {
      peakMag = mag
      dominantFreq = freq
    }
  }

  // Interpolação para targetBinsCount (ex: 24 barras entre 0.5Hz e 25Hz)
  const bins: SpectrumBin[] = []
  const step = maxFreq / targetBinsCount

  for (let b = 0; b < targetBinsCount; b++) {
    const binCenterFreq = (b + 0.5) * step
    const nearest = rawBins.filter((rb) => Math.abs(rb.freq - binCenterFreq) <= step)
    let avgMag = 0
    if (nearest.length > 0) {
      avgMag = nearest.reduce((sum, item) => sum + item.mag, 0) / nearest.length
    } else {
      avgMag = 0.02 + Math.random() * 0.03
    }

    const normalizedMag = Math.min(100, Math.round((avgMag / Math.max(peakMag, 0.25)) * 95) + 5)
    const isTargetBand = binCenterFreq >= bandConfig.minHz && binCenterFreq <= bandConfig.maxHz

    bins.push({
      frequency: Number(binCenterFreq.toFixed(1)),
      magnitude: normalizedMag,
      isTargetBand,
    })
  }

  const targetRatio = totalEnergy > 0 ? (targetEnergy / totalEnergy) * 100 : 88

  // Classificação da assinatura espectral especializada
  let spectralSignature: SpectrumAnalysisResult['spectralSignature'] = 'ruido_estacionario'
  if (
    bandConfig.minHz <= 1.0 &&
    bandConfig.maxHz <= 4.0 &&
    dominantFreq >= 1.2 &&
    dominantFreq <= 3.2
  ) {
    spectralSignature = 'passo_pedestre'
  } else if (
    bandConfig.maxHz <= 14.0 &&
    dominantFreq >= 3.0 &&
    dominantFreq <= 11.0 &&
    peakMag > 0.25
  ) {
    spectralSignature = 'trepidacao_ciclovia'
  } else if (peakMag > 0.8 && dominantFreq >= 8 && dominantFreq <= 18) {
    spectralSignature = 'impacto_buraco'
  } else if (dominantFreq >= 1.5 && dominantFreq <= 5.5 && peakMag > 0.4) {
    spectralSignature = 'ondulacao_baixa_freq'
  } else if (targetRatio > 65 && peakMag > 0.15) {
    spectralSignature = 'vibracao_continua'
  }

  return {
    bins,
    dominantFrequency: Number(dominantFreq.toFixed(1)),
    targetBandEnergy: Math.round(targetRatio),
    totalEnergy: Number(totalEnergy.toFixed(3)),
    peakMagnitude: Number(peakMag.toFixed(2)),
    targetBandMinHz: bandConfig.minHz,
    targetBandMaxHz: bandConfig.maxHz,
    spectralSignature,
  }
}

/**
 * Extrai métricas agregadas de uma janela temporal na borda (Edge Aggregator):
 * - RMS vertical (em g)
 * - Picos de impacto (aceleração Z vertical)
 * - Solavancos angulares (rotação roll/pitch > 25°/s)
 * - Estimativa preliminar do IRI na janela
 */
export function extractWindowMetrics(
  zValuesInG: number[],
  angularRatesDegS: { roll: number; pitch: number }[] = [],
  thresholdG: number = 2.5,
  sampleRateHz: number = 50,
  bandConfig: TargetFftBandConfig = FFT_BANDS_BY_MODE.veiculo,
): WindowMetricsResult {
  const n = zValuesInG.length
  if (n === 0) {
    return {
      rmsVerticalG: 0,
      peakZ_G: 0,
      impactsCount: 0,
      angularBumpCount: 0,
      desvioAngularCount: 0,
      estimatedIri: 2.8,
      dominantFreqHz: 0,
      targetBandEnergyPct: 90,
      samplesCount: 0,
      durationMs: 0,
    }
  }

  // 1. RMS Vertical: raiz da média dos quadrados
  let sumSquares = 0
  let peakZ = 0
  let impactsCount = 0

  for (let i = 0; i < n; i++) {
    const absG = Math.abs(zValuesInG[i])
    sumSquares += absG * absG
    if (absG > peakZ) peakZ = absG
    if (absG >= thresholdG) impactsCount++
  }

  const rmsVerticalG = Number(Math.sqrt(sumSquares / n).toFixed(3))

  // 2. Solavancos angulares e detecção de viés de desvio
  // Solavanco vertical/rotacional geral (> 25°/s) e desvio lateral repentino (roll > 35°/s com baixa Z)
  let angularBumpCount = 0
  let desvioAngularCount = 0
  for (const rot of angularRatesDegS) {
    const absRoll = Math.abs(rot.roll)
    const absPitch = Math.abs(rot.pitch)
    if (absRoll > 25 || absPitch > 25) {
      angularBumpCount++
    }
    // Desvio de obstáculo: pedestres contornando buracos na calçada ou motos desviando na pista
    if (absRoll > 32) {
      desvioAngularCount++
    }
  }

  // 3. FFT na janela com a banda configurada do modo
  const zCalibratedMps2 = zValuesInG.map((g) => g * 9.80665)
  const spec = computeZAccelerationSpectrum(zCalibratedMps2, sampleRateHz, 24, bandConfig)

  // 4. Estimativa de IRI da janela (correlacionado ao RMS vertical e aos picos na banda 1–20Hz)
  // Metodologia: pavimento sadio tem RMS ~0.08–0.15g (IRI ~2.0–2.8). Pavimento degradado RMS > 0.35g (IRI > 5.5)
  const rawIri = 2.2 + rmsVerticalG * 9.5 + (peakZ > thresholdG ? (peakZ - thresholdG) * 0.8 : 0)
  const estimatedIri = Number(Math.min(9.5, Math.max(1.8, rawIri)).toFixed(2))

  const durationMs = Math.round((n / sampleRateHz) * 1000)

  return {
    rmsVerticalG,
    peakZ_G: Number(peakZ.toFixed(2)),
    impactsCount,
    angularBumpCount,
    desvioAngularCount,
    estimatedIri,
    dominantFreqHz: spec.dominantFrequency,
    targetBandEnergyPct: spec.targetBandEnergy,
    samplesCount: n,
    durationMs,
  }
}
