import React, { useEffect, useRef, useState } from 'react'

export default function AdSlot({ className = '', forceRefresh = false }) {
  const adRef = useRef(null)
  const pushed = useRef(false)
  const [adLoaded, setAdLoaded] = useState(false)
  const uniqueKey = `ad-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

  useEffect(() => {
    if (pushed.current && !forceRefresh) return
    
    const timer = setTimeout(() => {
      try {
        if (adRef.current && window.adsbygoogle) {
          console.log('Loading AdSense ad...')
          ;(window.adsbygoogle = window.adsbygoogle || []).push({})
          pushed.current = true
          setAdLoaded(true)
          
          // Verificar se o anúncio foi preenchido após 2 segundos
          setTimeout(() => {
            if (adRef.current) {
              const rect = adRef.current.getBoundingClientRect()
              if (rect.height > 0) {
                console.log('Ad loaded successfully, height:', rect.height)
              } else {
                console.warn('Ad may not have loaded (height = 0)')
              }
            }
          }, 2000)
        } else {
          console.warn('AdSense not available')
        }
      } catch (e) {
        console.error('Error loading AdSense:', e)
      }
    }, 500) // Pequeno delay para garantir que o DOM está pronto

    return () => clearTimeout(timer)
  }, [forceRefresh])

  return (
    <div className={`ad-container my-6 flex justify-center ${className}`}>
      {/* Debug border para visualização */}
      <div className="w-full max-w-[728px] border border-dashed border-gray-700 rounded-lg p-2">
        <ins
          key={forceRefresh ? uniqueKey : undefined}
          className="adsbygoogle"
          style={{ display: 'block', minHeight: '50px' }}
          data-ad-client="ca-pub-4861547568821741"
          data-ad-slot="6240002763"
          data-ad-format="auto"
          data-full-width-responsive="true"
          ref={adRef}
        />
        {/* Debug info - remover em produção */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-600 mt-1 text-center">
            AdSlot {adLoaded ? '(loaded)' : '(loading...)'}
          </div>
        )}
      </div>
    </div>
  )
}
