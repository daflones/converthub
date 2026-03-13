import { useEffect, useState } from 'react'
import { detectAdBlock, resetDetection } from '../../utils/pageGuard'
import { useAdBlockGuard } from '../../hooks/useAdBlockGuard'

export default function AdBlockOverlay() {
  const [blocked, setBlocked]   = useState(false)
  const [checking, setChecking] = useState(false)

  // Detecta na montagem inicial
  useEffect(() => {
    const timer = setTimeout(async () => {
      const result = await detectAdBlock()
      setBlocked(result)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  // Re-detecta em cada navegação de rota
  useAdBlockGuard(() => setBlocked(true))

  // Escuta evento disparado pelo useAdGate quando adblock é detectado no download
  useEffect(() => {
    const handler = () => setBlocked(true)
    window.addEventListener('adblock-detected', handler)
    return () => window.removeEventListener('adblock-detected', handler)
  }, [])

  async function handleRetry() {
    setChecking(true)
    resetDetection()
    await new Promise(r => setTimeout(r, 500))
    const result = await detectAdBlock()
    setBlocked(result)
    setChecking(false)
  }

  if (!blocked) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(10, 10, 15, 0.97)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '24px',
        padding: '32px',
        textAlign: 'center',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ fontSize: '64px' }}>🛡️</div>

      <h2 style={{
        color: '#ffffff',
        fontSize: '28px',
        fontWeight: '800',
        fontFamily: "'Syne', sans-serif",
        margin: 0,
      }}>
        Bloqueador de anúncios detectado
      </h2>

      <p style={{
        color: '#a0a0b0',
        fontSize: '16px',
        maxWidth: '480px',
        lineHeight: '1.6',
        margin: 0,
      }}>
        O ConvertHub é 100% gratuito e se mantém através de anúncios.
        Para continuar usando todas as ferramentas, por favor desative seu
        bloqueador de anúncios para este site e clique em continuar.
      </p>

      <div style={{
        background: '#1a1a24',
        borderRadius: '12px',
        padding: '20px 28px',
        maxWidth: '440px',
        textAlign: 'left',
        border: '1px solid #2a2a38',
      }}>
        <p style={{ color: '#e0e0f0', fontSize: '14px', marginBottom: '12px', fontWeight: '600' }}>
          Como desativar:
        </p>
        <ol style={{ color: '#a0a0b0', fontSize: '14px', lineHeight: '2', paddingLeft: '20px', margin: 0 }}>
          <li>Clique no ícone do bloqueador na barra do navegador</li>
          <li>Selecione <strong style={{ color: '#e0e0f0' }}>"Pausar neste site"</strong> ou <strong style={{ color: '#e0e0f0' }}>"Desativar"</strong></li>
          <li>Recarregue a página ou clique em "Já desativei"</li>
        </ol>
      </div>

      <button
        onClick={handleRetry}
        disabled={checking}
        style={{
          background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
          color: '#fff',
          border: 'none',
          borderRadius: '10px',
          padding: '14px 36px',
          fontSize: '16px',
          fontWeight: '700',
          cursor: checking ? 'wait' : 'pointer',
          opacity: checking ? 0.7 : 1,
          transition: 'all 0.2s ease',
          letterSpacing: '0.02em',
        }}
      >
        {checking ? 'Verificando...' : '✓ Já desativei, continuar'}
      </button>

      <p style={{ color: '#555566', fontSize: '13px', margin: 0 }}>
        Os anúncios são exibidos de forma não intrusiva e nunca interrompem conversões.
      </p>
    </div>
  )
}
