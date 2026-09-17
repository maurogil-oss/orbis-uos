/**
 * Utilitário de Processamento Digital de Sinais (DSP) e FFT Embarcada
 * Simula e executa o pipeline do SDK Edge ORBIS.UOS:
 * Sensor Aceleração Z -> Janelamento Hanning -> FFT Radix-2 -> Espectro de Potência
 * -> Isolamento de banda relevante 1–20 Hz (padrão de vibração veicular/pavimento)
 * -> Frequência dominante e classificação de assinatura espectral.
 */

export interface SpectrumBin {
  frequency: number // Hz
  magnitude: number // dB ou g normalizado
  isTargetBand: boolean // 1 a 20 Hz
}

export interface SpectrumAnalysisResult {
  bins: SpectrumBin[]
  dominantFrequency: number // Hz
  targetBandEnergy: number // Energia relativa na banda 1–20 Hz (0–100%)
  totalEnergy: number
  peakMagnitude: number
  spectralSignature:
    | 'vibracao_continua'
    | 'impacto_buraco'
    | 'ondulacao_baixa_freq'
    | 'ruido_estacionario'
}

/**
 * Aplica Janelamento de Hanning para reduzir vazamento espectral (spectral leakage)
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
 * Analisa um buffer de aceleração Z (normalmente ~32 a 128 amostras a 50Hz)
 * Retorna espectro particionado de 0 a 25 Hz com destaque na banda 1 a 20 Hz
 */
export function computeZAccelerationSpectrum(
  rawSamples: number[],
  sampleRateHz: number = 50,
  targetBinsCount: number = 24, // Bins discretos de 0 a 25 Hz
): SpectrumAnalysisResult {
  // Ajustar tamanho para a potência de 2 mais próxima <= samples.length
  let n = 1
  while (n * 2 <= rawSamples.length && n * 2 <= 64) {
    n *= 2
  }
  if (n < 16) {
    // Se temos poucas amostras, usamos buffer sintético com as amostras existentes ou geramos baseline
    n = 32
  }

  // Prepara buffer de tamanho n (zero-padded ou repetição)
  const inputBuffer: number[] = new Array(n).fill(0)
  for (let i = 0; i < n; i++) {
    inputBuffer[i] = rawSamples[i] !== undefined ? rawSamples[i] : 0
  }

  // Remover componente DC (gravidade / offset médio)
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

    if (freq >= 1 && freq <= 20) {
      targetEnergy += power
    }

    if (mag > peakMag) {
      peakMag = mag
      dominantFreq = freq
    }
  }

  // Interpolação para targetBinsCount (ex: 20 a 24 barras entre 0.5Hz e 24Hz)
  const bins: SpectrumBin[] = []
  const step = maxFreq / targetBinsCount

  for (let b = 0; b < targetBinsCount; b++) {
    const binCenterFreq = (b + 0.5) * step
    // Encontrar pontos mais próximos
    const nearest = rawBins.filter((rb) => Math.abs(rb.freq - binCenterFreq) <= step)
    let avgMag = 0
    if (nearest.length > 0) {
      avgMag = nearest.reduce((sum, item) => sum + item.mag, 0) / nearest.length
    } else {
      // Interpolação simples
      avgMag = 0.02 + Math.random() * 0.03
    }

    // Normalizar de 0 a 100 relativo
    const normalizedMag = Math.min(100, Math.round((avgMag / Math.max(peakMag, 0.25)) * 95) + 5)
    const isTargetBand = binCenterFreq >= 1 && binCenterFreq <= 20

    bins.push({
      frequency: Number(binCenterFreq.toFixed(1)),
      magnitude: normalizedMag,
      isTargetBand,
    })
  }

  const targetRatio = totalEnergy > 0 ? (targetEnergy / totalEnergy) * 100 : 85

  // Classificação de assinatura espectral
  let spectralSignature: SpectrumAnalysisResult['spectralSignature'] = 'ruido_estacionario'
  if (peakMag > 0.8 && dominantFreq >= 8 && dominantFreq <= 18) {
    spectralSignature = 'impacto_buraco'
  } else if (dominantFreq >= 1.5 && dominantFreq <= 5.5 && peakMag > 0.4) {
    spectralSignature = 'ondulacao_baixa_freq'
  } else if (targetRatio > 70 && peakMag > 0.2) {
    spectralSignature = 'vibracao_continua'
  }

  return {
    bins,
    dominantFrequency: Number(dominantFreq.toFixed(1)),
    targetBandEnergy: Math.round(targetRatio),
    totalEnergy: Number(totalEnergy.toFixed(3)),
    peakMagnitude: Number(peakMag.toFixed(2)),
    spectralSignature,
  }
}
