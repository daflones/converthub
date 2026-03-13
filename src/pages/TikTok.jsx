import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Download, AlertCircle, Video, Music, User, Eye, Heart, MessageCircle } from 'lucide-react'
import ProgressBar from '../components/shared/ProgressBar'
import SEOHead from '../components/shared/SEOHead'
import FAQSection from '../components/shared/FAQSection'
import AdGateOverlay from '../components/shared/AdGateOverlay'
import AdSlot from '../components/shared/AdSlot'
import useAdGate from '../hooks/useAdGate'
import useAdRefresh from '../hooks/useAdRefresh'
import { getVisitorId } from '../hooks/useVisitorId'

function formatNumber(num) {
  if (!num) return ''
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return String(num)
}

const tiktokSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ConvertHub — Baixar Vídeo do TikTok",
  "url": "https://converthub.nanosync.com.br/baixar-video-tiktok",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Todos (via navegador)",
  "browserRequirements": "Requer JavaScript e HTML5",
  "description": "Baixe vídeos do TikTok sem marca d'água gratuitamente. Sem instalar aplicativos.",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "BRL" },
  "featureList": [
    "Download de vídeos do TikTok sem marca d'água",
    "Download em MP4 HD",
    "Suporte a links curtos (vm.tiktok.com)",
    "Sem necessidade de login"
  ],
  "inLanguage": "pt-BR"
}

const tiktokFaqs = [
  { q: 'Como baixar vídeo do TikTok sem marca d\'água?', a: 'Cole a URL do vídeo do TikTok no campo acima e clique em Processar. O vídeo será baixado sem a marca d\'água do TikTok.' },
  { q: 'Posso usar links curtos do TikTok?', a: 'Sim! Links do tipo vm.tiktok.com e tiktok.com/t/ são suportados. Basta colar e processar.' },
  { q: 'Precisa de login no TikTok?', a: 'Não! Basta colar a URL do vídeo público. Não é necessário fazer login.' },
  { q: 'O download é gratuito?', a: 'Sim, o ConvertHub é 100% gratuito. Sem registro, sem instalação.' },
  { q: 'Funciona no celular?', a: 'Sim! Funciona em qualquer navegador moderno.' },
  { q: 'Posso converter TikTok para MP3?', a: 'Em breve! Por enquanto, o download é em formato MP4. Você pode usar nosso conversor de áudio para extrair o MP3 depois.' },
]

export default function TikTok() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)
  const [progress, setProgress] = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  const { openAdGate, triggerDownload, closeGate, gate } = useAdGate()
  const { refreshKey, refreshAds } = useAdRefresh()
  const abortRef = useRef(null)

  const fakeTimerRef = useRef(null)

  const startFakeProgress = () => {
    const milestones = [5, 10, 15, 22, 28, 35, 40, 48, 55, 60]
    let idx = 0
    const tick = () => {
      if (idx < milestones.length) {
        setProgress(prev => {
          const target = milestones[idx]
          return prev < target ? target : prev
        })
        idx++
        fakeTimerRef.current = setTimeout(tick, 1500 + Math.random() * 2000)
      }
    }
    fakeTimerRef.current = setTimeout(tick, 800)
  }

  const stopFakeProgress = () => {
    if (fakeTimerRef.current) {
      clearTimeout(fakeTimerRef.current)
      fakeTimerRef.current = null
    }
  }

  const handleProcess = async () => {
    if (!url.trim()) { setError('Cole a URL do TikTok'); return }
    const tkRegex = /tiktok\.com/
    if (!tkRegex.test(url)) { setError('URL do TikTok inválida.'); return }

    setLoading(true)
    setError(null)
    setResults(null)
    setProgress(0)
    setStatusMsg('Conectando ao servidor...')
    startFakeProgress()

    try {
      const controller = new AbortController()
      abortRef.current = controller

      const res = await fetch('/api/tiktok/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-visitor-id': getVisitorId() },
        body: JSON.stringify({ url: url.trim() }),
        signal: controller.signal,
      })

      if (!res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao processar')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6))
              switch (event.type) {
                case 'progress':
                  stopFakeProgress()
                  setProgress(prev => Math.max(prev, event.percent))
                  break
                case 'status':
                  setStatusMsg(event.message)
                  break
                case 'error':
                  stopFakeProgress()
                  setError(event.message)
                  setLoading(false)
                  return
                case 'done':
                  stopFakeProgress()
                  setResults(event.results)
                  setProgress(100)
                  setStatusMsg('Concluído!')
                  setLoading(false)
                  return
              }
            } catch {}
          }
        }
      }

      stopFakeProgress()
      setLoading(false)
    } catch (err) {
      stopFakeProgress()
      if (err.name !== 'AbortError') {
        setError(err.message || 'Erro ao processar')
      }
      setLoading(false)
    }
  }

  const handleDownload = (downloadUrl, label = 'tiktok-video', ext = 'mp4') => {
    const proxyUrl = `/api/tiktok/proxy-download?url=${encodeURIComponent(downloadUrl)}&filename=${encodeURIComponent(label)}`
    openAdGate(proxyUrl, `${label} (Baixado em ConvertHub).${ext}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mx-auto max-w-3xl"
    >
      <SEOHead
        title="Baixar Vídeo do TikTok Sem Marca D'água — Download Grátis"
        description="Baixe vídeos do TikTok sem marca d'água gratuitamente. Sem instalar nada. Download rápido em MP4 HD, online e sem registro."
        canonical="/baixar-video-tiktok"
        keywords="baixar vídeo tiktok, download tiktok sem marca d'água, tiktok downloader, salvar vídeo tiktok, tiktok mp4"
        schema={[tiktokSchema]}
      />

      <div className="mb-8">
        <h1 className="mb-2 font-display text-3xl font-bold text-white">
          <svg className="mr-3 inline h-8 w-8" viewBox="0 0 24 24" fill="none">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.2a8.16 8.16 0 005.58 2.17V12a4.83 4.83 0 01-3.77-1.54V6.69h3.77z" fill="currentColor" className="text-cyan-400"/>
          </svg>
          Baixar Vídeo do TikTok Sem Marca D'água
        </h1>
        <p className="text-gray-400">
          Baixe vídeos do TikTok sem marca d'água gratuitamente. Cole a URL do vídeo e faça o download em MP4 HD.
        </p>
      </div>

      {/* URL Input */}
      <div className="mb-6 rounded-2xl border border-border bg-surface p-6">
        <label className="mb-2 block text-sm font-medium text-gray-400">URL do TikTok</label>
        <input
          type="text"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(null) }}
          placeholder="https://www.tiktok.com/@user/video/... ou vm.tiktok.com/..."
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-accent-purple/50"
        />
      </div>

      {/* Supported Formats */}
      <div className="mb-6 flex flex-wrap gap-2">
        {['Vídeos', 'Links Curtos', 'Sem Marca D\'água', 'MP4 HD'].map((t) => (
          <span key={t} className="rounded-lg bg-card border border-border px-3 py-1.5 text-xs font-medium text-gray-400">
            {t}
          </span>
        ))}
      </div>

      {/* Info Message */}
      <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
        <p className="text-sm text-green-300">
          ⚡ Processamento <strong>rápido</strong>. Apenas conteúdos públicos são suportados.
        </p>
      </div>

      {/* Process Button */}
      <button
        onClick={handleProcess}
        disabled={loading || !url.trim()}
        className="btn-primary mb-8 w-full text-center"
      >
        {loading ? 'Processando...' : 'Processar Vídeo'}
      </button>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </motion.div>
      )}

      {/* Loading Progress */}
      {loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl border border-border bg-surface p-6 space-y-4"
        >
          <ProgressBar progress={progress} />
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">{statusMsg}</p>
            <span className="text-sm font-bold gradient-text">{progress.toFixed(0)}%</span>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {results && results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {results.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="overflow-hidden rounded-2xl border border-border bg-surface"
            >
              {/* Thumbnail */}
              {item.thumbnail && (
                <div className="relative">
                  <img
                    src={item.thumbnail}
                    alt="Preview"
                    className="w-full max-h-80 object-cover"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                  <div className="absolute top-2 left-2 rounded-md bg-black/70 px-2 py-1 flex items-center gap-1">
                    <Video className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="text-xs font-bold text-white">TikTok</span>
                  </div>
                </div>
              )}

              {/* Header with Title and Stats */}
              <div className="p-4 border-b border-border">
                {item.username && (
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-white mb-2">
                    <User className="h-3.5 w-3.5 text-cyan-400" />
                    @{item.username}
                    {item.nickname && item.nickname !== item.username && (
                      <span className="text-gray-400">({item.nickname})</span>
                    )}
                  </p>
                )}
                {item.title && (
                  <p className="text-sm text-gray-300 line-clamp-3 mb-2">{item.title}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {item.playCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {formatNumber(item.playCount)}
                    </span>
                  )}
                  {item.likeCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {formatNumber(item.likeCount)}
                    </span>
                  )}
                  {item.commentCount > 0 && (
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {formatNumber(item.commentCount)}
                    </span>
                  )}
                </div>
              </div>

              {/* Download Button */}
              <div className="p-4">
                <button
                  onClick={() => handleDownload(item.downloadUrlSD || item.downloadUrl, 'tiktok-video-HD', 'mp4')}
                  className="btn-primary flex w-full items-center justify-center gap-2 py-2.5 text-sm"
                >
                  <Download className="h-4 w-4" />
                  Baixar Vídeo HD (Sem Marca D'água)
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <AdSlot key={`ad1-${refreshKey}`} />
      <FAQSection faqs={tiktokFaqs} />
      <AdSlot key={`ad2-${refreshKey}`} />
      <AdGateOverlay visible={gate.visible} onDownload={() => triggerDownload(refreshAds)} onClose={closeGate} />
    </motion.div>
  )
}
