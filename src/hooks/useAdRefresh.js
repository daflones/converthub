import { useState, useCallback } from 'react'

export default function useAdRefresh() {
  const [refreshKey, setRefreshKey] = useState(0)

  const refreshAds = useCallback(() => {
    // Força refresh de todos os AdSlots
    setRefreshKey(prev => prev + 1)
    
    // Tenta fazer refresh do AdSense se disponível
    try {
      if (window.adsbygoogle) {
        // Limpa e recarrega todos os anúncios
        const ads = document.querySelectorAll('.adsbygoogle')
        ads.forEach(ad => {
          // Remove e recria o elemento para forçar refresh
          const parent = ad.parentNode
          const newAd = ad.cloneNode(true)
          parent.replaceChild(newAd, ad)
        })
        
        // Push novo anúncio
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (e) {
      console.warn('Failed to refresh ads:', e)
    }
  }, [])

  return { refreshKey, refreshAds }
}
