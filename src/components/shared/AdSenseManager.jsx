import { useEffect } from 'react'

export default function AdSenseManager() {
  useEffect(() => {
    // Inicializar o AdSense se ainda não estiver carregado
    if (!window.adsbygoogle) {
      window.adsbygoogle = []
      console.log('AdSense initialized')
    }
  }, [])

  return null
}
