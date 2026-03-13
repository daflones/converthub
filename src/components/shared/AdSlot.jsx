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
          console.log('AdSense element:', adRef.current)
          console.log('Window location:', window.location.hostname)
          
          ;(window.adsbygoogle = window.adsbygoogle || []).push({})
          
          // Verificar após 3 segundos se o anúncio foi preenchido
          setTimeout(() => {
            if (adRef.current) {
              const rect = adRef.current.getBoundingClientRect()
              console.log('Ad element height:', rect.height)
              console.log('Ad element innerHTML:', adRef.current.innerHTML.substring(0, 100))
              
              if (rect.height === 0) {
                console.warn('Ad not loaded - height is 0')
              } else {
                console.log('Ad loaded successfully!')
              }
            }
          }, 3000)
        } else {
          console.warn('AdSense not available')
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
        style={{ 
          display: 'inline-block', 
          width: '336px', 
          height: '280px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px dashed rgba(255, 255, 255, 0.2)',
          borderRadius: '8px'
        }}
        data-ad-client="ca-pub-4861547568821741"
        data-ad-slot="6240002763"
        data-ad-format="auto"
        data-full-width-responsive="true"
        data-ad-test="on"
        ref={adRef}
      />
      {/* Fallback para desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute text-xs text-gray-500 text-center mt-1">
          AdSense Space (336x280)
        </div>
      )}
    </div>
  )
}
