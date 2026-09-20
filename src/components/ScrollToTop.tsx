import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop - Garante que ao mudar de rota ou ao navegar por âncora (#id),
 * o conteúdo sempre inicie visualmente logo abaixo do cabeçalho fixo do topo,
 * nunca ficando escondido sob o header fixo.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    // Se houver hash na URL, aguarda a montagem do DOM para fazer o scroll até o elemento alvo
    if (hash) {
      const id = hash.replace(/^#/, '')
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
        return
      }
      // Se não encontrou imediatamente (ex. renderização assíncrona), tenta em timeout curto
      const timer = window.setTimeout(() => {
        const delayedEl = document.getElementById(id)
        if (delayedEl) {
          delayedEl.scrollIntoView({ behavior: 'smooth' })
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        }
      }, 60)
      return () => window.clearTimeout(timer)
    }

    // Se for navegação normal de rota (sem hash), rola imediatamente ao topo
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}
