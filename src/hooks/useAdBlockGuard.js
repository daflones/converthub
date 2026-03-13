import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { detectAdBlock, resetDetection } from '../utils/pageGuard'

/**
 * Reseta e re-executa a detecção a cada troca de rota.
 * Isso evita que o usuário navegue para outra página sem ser verificado.
 */
export function useAdBlockGuard(onDetected) {
  const location = useLocation()

  useEffect(() => {
    resetDetection()
    detectAdBlock().then(blocked => {
      if (blocked && onDetected) onDetected()
    })
  }, [location.pathname])
}
