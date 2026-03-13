import { useCallback } from 'react'

export default function useAdGate() {
  const openAdGate = useCallback((downloadUrl) => {
    if (!downloadUrl) return
    const encoded = encodeURIComponent(downloadUrl)
    window.open(`/ad-gate?redirect=${encoded}`, '_blank')
  }, [])

  return openAdGate
}
