import { useState, useCallback } from 'react'

export default function useAdGate() {
  const [gate, setGate] = useState({ visible: false, url: null, filename: null })

  const openAdGate = useCallback((downloadUrl, filename = 'download') => {
    if (!downloadUrl) return
    setGate({ visible: true, url: downloadUrl, filename })
  }, [])

  const triggerDownload = useCallback((onAdRefresh) => {
    if (!gate.url) return
    const a = document.createElement('a')
    a.href = gate.url
    a.download = gate.filename || 'download'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setGate({ visible: false, url: null, filename: null })
    
    // Refresh ads after download
    if (onAdRefresh) {
      setTimeout(onAdRefresh, 1000)
    }
  }, [gate])

  const closeGate = useCallback(() => {
    setGate({ visible: false, url: null, filename: null })
  }, [])

  return { openAdGate, triggerDownload, closeGate, gate }
}
