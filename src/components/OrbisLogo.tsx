import React, { useEffect, useState } from 'react'
import rawLogoUrl from '@/assets/uos-novo-d94c4.png'

export interface OrbisLogoProps {
  className?: string
  /**
   * 'full': Emblema + divisor vertical + texto "ORBIS UOS"
   * 'emblem': Somente o emblema circular verde com o globo + folha
   * 'compact': Emblema com o texto "ORBIS UOS" estilizado ao lado
   */
  variant?: 'full' | 'emblem' | 'compact'
  /**
   * 'dark': Para fundos escuros (header navy escuro, footer, cockpit, etc.) -> texto branco/claro #F8FAFC
   * 'original': Mantém o verde escuro do logotipo original
   */
  colorMode?: 'dark' | 'original'
  /** Altura máxima em px */
  height?: number
  /** Texto alternativo para acessibilidade */
  alt?: string
}

// Caches em memória para que a imagem seja processada apenas UMA vez durante a sessão
let cachedFullDarkUrl: string | null = null
let cachedFullOriginalUrl: string | null = null
let cachedEmblemUrl: string | null = null

export function OrbisLogo({
  className = '',
  variant = 'full',
  colorMode = 'dark',
  height = 36,
  alt = 'ORBIS UOS — Urban Operating System',
}: OrbisLogoProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(() => {
    if (variant === 'emblem') return cachedEmblemUrl
    if (colorMode === 'dark') return cachedFullDarkUrl
    return cachedFullOriginalUrl
  })

  useEffect(() => {
    if (variant === 'emblem' && cachedEmblemUrl) {
      setDataUrl(cachedEmblemUrl)
      return
    }
    if (variant === 'full' && colorMode === 'dark' && cachedFullDarkUrl) {
      setDataUrl(cachedFullDarkUrl)
      return
    }
    if (variant === 'full' && colorMode === 'original' && cachedFullOriginalUrl) {
      setDataUrl(cachedFullOriginalUrl)
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = rawLogoUrl

    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width
        const h = img.naturalHeight || img.height

        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) return

        ctx.drawImage(img, 0, 0)
        const imgData = ctx.getImageData(0, 0, w, h)
        const d = imgData.data

        // 1. Remoção do fundo branco (tornar transparente com anti-aliasing de borda suave)
        // Detecta tons brancos/quase brancos e calcula alpha proporcional
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i]
          const g = d[i + 1]
          const b = d[i + 2]

          const minC = Math.min(r, g, b)
          const maxC = Math.max(r, g, b)
          const isWhiteish = minC > 215 && maxC - minC < 30

          if (isWhiteish) {
            if (minC >= 245) {
              d[i + 3] = 0 // Transparência completa para fundo branco
            } else {
              // Suavização para evitar serrilhado em bordas claras
              const alphaFactor = (255 - minC) / 35
              d[i + 3] = Math.max(0, Math.min(255, Math.round(d[i + 3] * alphaFactor)))
            }
          }
        }

        // 2. Se variante for apenas o emblema (lado esquerdo até a barra divisora)
        if (variant === 'emblem') {
          // O emblema circular ocupa aproximadamente 43% da largura horizontal
          const emblemWidth = Math.round(w * 0.44)
          const emblemCanvas = document.createElement('canvas')
          emblemCanvas.width = emblemWidth
          emblemCanvas.height = h
          const eCtx = emblemCanvas.getContext('2d')
          if (eCtx) {
            ctx.putImageData(imgData, 0, 0)
            eCtx.drawImage(canvas, 0, 0, emblemWidth, h, 0, 0, emblemWidth, h)
            const emblemData = emblemCanvas.toDataURL('image/png')
            cachedEmblemUrl = emblemData
            setDataUrl(emblemData)
            return
          }
        }

        // 3. Se colorMode === 'dark':
        // Sobre o fundo escuro da landing (#0A1128 / #070C1D), o wordmark verde escuro "ORBIS UOS"
        // fica com contraste muito baixo. Convertemos as letras do lado direito para #F8FAFC
        // mantendo o emblema circular verde intacto e com fidelidade absoluta.
        if (colorMode === 'dark') {
          const textStartX = Math.round(w * 0.48) // inicia após a barra divisora
          for (let y = 0; y < h; y++) {
            for (let x = textStartX; x < w; x++) {
              const idx = (y * w + x) * 4
              const a = d[idx + 3]
              if (a > 20) {
                const r = d[idx]
                const g = d[idx + 1]
                const b = d[idx + 2]
                // Detecta pixels escuros ou verdes escuros das letras "ORBIS UOS"
                const lum = 0.299 * r + 0.587 * g + 0.114 * b
                if (lum < 165) {
                  // Mapeia para #F8FAFC preservando o canal alfa
                  d[idx] = 248
                  d[idx + 1] = 250
                  d[idx + 2] = 252
                }
              }
            }
          }

          ctx.putImageData(imgData, 0, 0)
          const darkData = canvas.toDataURL('image/png')
          cachedFullDarkUrl = darkData
          setDataUrl(darkData)
          return
        }

        // 4. Variante original com fundo transparente
        ctx.putImageData(imgData, 0, 0)
        const origData = canvas.toDataURL('image/png')
        cachedFullOriginalUrl = origData
        setDataUrl(origData)
      } catch (err) {
        console.error('Falha ao processar logo com fundo transparente:', err)
      }
    }
  }, [variant, colorMode])

  // Placeholder discreto com as proporções reais da logomarca (~2.3:1)
  const estimatedWidth = variant === 'emblem' ? height : Math.round(height * 2.3)

  return (
    <div
      className={`inline-flex items-center shrink-0 select-none ${className}`}
      style={{ height: `${height}px` }}
    >
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={alt}
          style={{ height: `${height}px`, width: 'auto', display: 'block' }}
          className="object-contain max-h-full"
        />
      ) : (
        <div
          style={{ height: `${height}px`, width: `${estimatedWidth}px` }}
          className="rounded bg-[#1A2A5A]/30 animate-pulse"
        />
      )}
    </div>
  )
}

export default OrbisLogo
