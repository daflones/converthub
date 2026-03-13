import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Instagram as InstagramIcon, Download, AlertCircle, Image, Video, User, Heart, MessageCircle } from 'lucide-react'
import ProgressBar from '../components/shared/ProgressBar'
import SEOHead from '../components/shared/SEOHead'
import FAQSection from '../components/shared/FAQSection'
import AdGateOverlay from '../components/shared/AdGateOverlay'
import AdSlot from '../components/shared/AdSlot'
import useAdGate from '../hooks/useAdGate'
import { getVisitorId } from '../hooks/useVisitorId'

function formatNumber(num) {
  if (!num) return ''
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return String(num)
}

const instagramSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ConvertHub — Baixar Vídeo e Foto do Instagram",
  "url": "https://converthub.nanosync.com.br/baixar-video-instagram",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Todos (via navegador)",
  "browserRequirements": "Requer JavaScript e HTML5",
  "description": "Baixe vídeos, reels, fotos e posts do Instagram gratuitamente. Sem instalar aplicativos.",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "BRL" },
  "featureList": [
    "Download de Reels do Instagram",
    "Download de fotos e posts",
    "Download de carrossel (múltiplas mídias)",
    "Sem marca d'água"
  ],
  "inLanguage": "pt-BR"
}

const instagramFaqs = [
  { q: 'Como baixar vídeo do Instagram?', a: 'Cole a URL do post, reel ou vídeo do Instagram no campo acima e clique em Processar. Após o processamento, clique em Baixar para salvar o arquivo.' },
  { q: 'Posso baixar Reels do Instagram?', a: 'Sim! O ConvertHub suporta download de Reels, posts, vídeos e fotos do Instagram.' },
  { q: 'Consigo baixar fotos de carrossel?', a: 'Sim! Se o post tiver múltiplas fotos ou vídeos (carrossel), todas as mídias serão extraídas para download individual.' },
  { q: 'Precisa de login no Instagram?', a: 'Não! Você não precisa fazer login. Basta colar a URL do conteúdo público.' },
  { q: 'O download é gratuito?', a: 'Sim, o ConvertHub é 100% gratuito. Não é necessário criar conta ou instalar nenhum software.' },
  { q: 'Funciona no celular?', a: 'Sim! Funciona em qualquer navegador moderno, no celular, tablet ou computador.' },
]

export default function Instagram() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)
  const [progress, setProgress] = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  const { openAdGate, triggerDownload, closeGate, gate } = useAdGate()
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
    if (!url.trim()) { setError('Cole a URL do Instagram'); return }
    const igRegex = /instagram\.com\/(p|reel|reels|stories|tv)\//
    if (!igRegex.test(url)) { setError('URL do Instagram inválida. Use uma URL de post, reel ou vídeo.'); return }

    setLoading(true)
    setError(null)
    setResults(null)
    setProgress(0)
    setStatusMsg('Conectando ao servidor...')
    startFakeProgress()

    try {
      const controller = new AbortController()
      abortRef.current = controller

      const res = await fetch('/api/instagram/download', {
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

  const handleDownload = (item) => {
    const label = item.username ? `@${item.username}` : 'instagram'
    const proxyUrl = `/api/instagram/proxy-download?url=${encodeURIComponent(item.downloadUrl)}&filename=${encodeURIComponent(label)}`
    openAdGate(proxyUrl, `${label} (Baixado em ConvertHub).${item.type === 'video' ? 'mp4' : 'jpg'}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mx-auto max-w-3xl"
    >
      <SEOHead
        title="Baixar Vídeo e Foto do Instagram Grátis | Reels, Posts, Stories"
        description="Baixe vídeos, reels, fotos e posts do Instagram grátis em HD. Download rápido online sem instalar. Suporta todos os conteúdos do Instagram."
        canonical="/baixar-video-instagram"
        keywords="baixar vídeo instagram, download instagram video, instagram downloader, baixar reels instagram, instagram reels download, baixar posts instagram, instagram photo downloader, download instagram online, salvar instagram, instagram to mp4, baixar stories instagram, instagram media downloader, download grátis instagram, converter instagram"
        schema={instagramSchema}
      />

      <div className="mb-8">
        <h1 className="mb-2 font-display text-3xl font-bold text-white">
          <InstagramIcon className="mr-3 inline h-8 w-8 text-pink-500" />
          Baixar Vídeo e Foto do Instagram
        </h1>
        <p className="text-gray-400">
          Baixe vídeos, reels, fotos e posts do Instagram gratuitamente. Cole a URL do conteúdo e faça o download em segundos.
        </p>
      </div>

      {/* URL Input */}
      <div className="mb-6 rounded-2xl border border-border bg-surface p-6">
        <label className="mb-2 block text-sm font-medium text-gray-400">URL do Instagram</label>
        <input
          type="text"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(null) }}
          placeholder="https://www.instagram.com/p/... ou https://www.instagram.com/reel/..."
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-accent-purple/50"
        />
      </div>

      {/* Supported Types */}
      <div className="mb-6 flex flex-wrap gap-2">
        {['Posts', 'Reels', 'Vídeos', 'Fotos', 'Carrossel'].map((t) => (
          <span key={t} className="rounded-lg bg-card border border-border px-3 py-1.5 text-xs font-medium text-gray-400">
            {t}
          </span>
        ))}
      </div>

      {/* Info Message */}
      <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
        <p className="text-sm text-green-300">
          ⚡ Processamento <strong>rápido e instantâneo</strong>. Apenas conteúdos públicos são suportados.
        </p>
      </div>

      {/* Process Button */}
      <button
        onClick={handleProcess}
        disabled={loading || !url.trim()}
        className="btn-primary mb-8 w-full text-center"
      >
        {loading ? 'Processando...' : 'Processar Conteúdo'}
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
          <h2 className="font-display text-lg font-bold text-white mb-2">
            {results.length} {results.length === 1 ? 'mídia encontrada' : 'mídias encontradas'}
          </h2>

          {results.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="overflow-hidden rounded-2xl border border-border bg-surface"
            >
              {/* Video/Image Preview */}
              <div className="relative bg-black">
                {item.type === 'video' ? (
                  <video
                    controls
                    poster={item.thumbnail}
                    className="w-full max-h-80 object-contain"
                    preload="metadata"
                  >
                    <source src={item.downloadUrl} type="video/mp4" />
                    Seu navegador não suporta reprodução de vídeo.
                  </video>
                ) : (
                  <img
                    src={item.thumbnail}
                    alt="Preview"
                    className="w-full max-h-80 object-contain"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                )}
                <div className="absolute top-2 left-2 rounded-md bg-black/70 px-2 py-1 flex items-center gap-1">
                  <InstagramIcon className="h-3.5 w-3.5 text-pink-400" />
                  <span className="text-xs font-bold text-white">Instagram</span>
                </div>
              </div>

              {/* Header with Title and Stats */}
              <div className="p-4 border-b border-border">
                {item.username && (
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-white mb-2">
                    <User className="h-3.5 w-3.5 text-pink-400" />
                    @{item.username}
                  </p>
                )}
                {item.title && (
                  <p className="text-sm text-gray-300 line-clamp-3 mb-2">{item.title}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {item.likeCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {item.likeCount === -1 ? 'Não disponível' : formatNumber(item.likeCount)}
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
                  onClick={() => handleDownload(item)}
                  className="btn-primary flex w-full items-center justify-center gap-2 py-2.5 text-sm"
                >
                  <Download className="h-4 w-4" />
                  Baixar {item.type === 'video' ? 'Vídeo MP4' : 'Imagem JPG'}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <AdSlot />
      <FAQSection faqs={instagramFaqs} />
      <AdSlot />
      <AdGateOverlay visible={gate.visible} onDownload={triggerDownload} onClose={closeGate} />
    </motion.div>
  )
}
