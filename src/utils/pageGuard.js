// src/utils/pageGuard.js
// NÃO renomear — nome neutro é intencional para evitar filtros de adblock

const BAIT_CLASS = 'pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ad-links'
const BAIT_ID    = 'ad-banner'
const CHECK_DELAY = 150

const randomSuffix = () => Math.random().toString(36).slice(2, 8)

let detectionResult = null

/**
 * Técnica 1: Bait Element
 * Cria um div invisível com classes/IDs que os ad blockers removem.
 */
function checkBaitElement() {
  return new Promise((resolve) => {
    const bait = document.createElement('div')
    bait.id = `${BAIT_ID}-${randomSuffix()}`
    bait.className = BAIT_CLASS
    bait.style.cssText = `
      position: absolute !important;
      left: -9999px !important;
      top: -9999px !important;
      width: 1px !important;
      height: 1px !important;
      overflow: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    `
    document.body.appendChild(bait)

    setTimeout(() => {
      const rect = bait.getBoundingClientRect()
      const blocked =
        bait.offsetHeight === 0 ||
        bait.offsetWidth  === 0 ||
        bait.style.display === 'none' ||
        bait.style.visibility === 'hidden' ||
        rect.height === 0 ||
        !document.body.contains(bait)

      try { document.body.removeChild(bait) } catch (_) {}
      resolve(blocked)
    }, CHECK_DELAY)
  })
}

/**
 * Técnica 2: Script Request Check
 * Tenta fazer fetch de um recurso que ad blockers normalmente bloqueiam.
 */
function checkScriptRequest() {
  return new Promise((resolve) => {
    const url = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4861547568821741&v=${randomSuffix()}`
    fetch(url, { method: 'HEAD', mode: 'no-cors' })
      .then(() => resolve(false))
      .catch(() => resolve(true))
    setTimeout(() => resolve(false), 3000)
  })
}

/**
 * Técnica 3: AdSense iframe/slot check
 * Verifica se o slot do AdSense foi removido ou ocultado por um adblocker.
 * Slots com height 0 são normais antes dos anúncios carregarem, por isso
 * verificamos apenas display:none ou remoção do DOM.
 */
function checkAdSenseSlot() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const slots = document.querySelectorAll('.adsbygoogle')
      if (slots.length === 0) {
        resolve(false)
        return
      }
      const blocked = Array.from(slots).some(slot => {
        const style = getComputedStyle(slot)
        return (
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          !document.body.contains(slot)
        )
      })
      resolve(blocked)
    }, 1500)
  })
}

/**
 * Orquestrador principal — executa as 3 técnicas em paralelo.
 * Retorna true se PELO MENOS 2 técnicas indicarem bloqueio (mais conservador).
 */
export async function detectAdBlock() {
  if (detectionResult !== null) return detectionResult

  const [bait, script, adsense] = await Promise.all([
    checkBaitElement(),
    checkScriptRequest(),
    checkAdSenseSlot(),
  ])

  // Requer pelo menos 2 técnicas para reduzir falsos positivos
  const blockedCount = [bait, script, adsense].filter(Boolean).length
  detectionResult = blockedCount >= 2
  return detectionResult
}

/**
 * Limpa o cache — usar quando o usuário afirmar ter desativado o bloqueador.
 */
export function resetDetection() {
  detectionResult = null
}
