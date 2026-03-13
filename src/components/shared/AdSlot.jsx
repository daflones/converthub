import React, { useEffect, useRef } from 'react'

export default function AdSlot({ className = '', forceRefresh = false }) {
  const adRef = useRef(null)
  const uniqueKey = `ad-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

  useEffect(() => {
    if (!adRef.current) return
    
    // Função para carregar o anúncio
    const loadAd = () => {
      try {
        if (window.adsbygoogle && adRef.current) {
          // Remover anúncio anterior se existir
          if (adRef.current.firstChild) {
            adRef.current.innerHTML = ''
          }
          
          // Adicionar atributos necessários
          adRef.current.setAttribute('data-ad-client', 'ca-pub-4861547568821741')
          adRef.current.setAttribute('data-ad-slot', '6240002763')
          adRef.current.setAttribute('data-ad-format', 'auto')
          adRef.current.setAttribute('data-full-width-responsive', 'true')
          
          console.log('Loading AdSense ad...')
          ;(window.adsbygoogle = window.adsbygoogle || []).push({})
        }
      } catch (e) {
        console.error('Error loading AdSense:', e)
      }
    }

    // Tentar carregar imediatamente se o AdSense já estiver disponível
    if (window.adsbygoogle) {
      loadAd()
    } else {
      // Se não, esperar um pouco e tentar novamente
      const timer = setTimeout(() => {
        loadAd()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [forceRefresh])

  return (
    <div className={`ad-container my-6 flex justify-center ${className}`}>
      <ins
        key={forceRefresh ? uniqueKey : undefined}
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '90px' }}
        ref={adRef}
      />
    </div>
  )
}
