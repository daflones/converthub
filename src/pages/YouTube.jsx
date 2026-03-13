import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Youtube, Download, AlertCircle, Clock, User, Play } from 'lucide-react'
import ProgressBar from '../components/shared/ProgressBar'
import SEOHead from '../components/shared/SEOHead'
import FAQSection from '../components/shared/FAQSection'
import useAdGate from '../hooks/useAdGate'
import { getVisitorId } from '../hooks/useVisitorId'

const qualities = ['360', '480', '720', '1080']

const youtubeSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ConvertHub — Baixar Vídeo do YouTube",
  "url": "https://converthub.nanosync.com.br/baixar-video-youtube",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Todos (via navegador)",
  "browserRequirements": "Requer JavaScript e HTML5",
  "description": "Baixe qualquer vídeo do YouTube em MP4, MP3, WAV e outros formatos gratuitamente.",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "BRL" },
  "featureList": [
    "Download de vídeos do YouTube em MP4",
    "Conversão YouTube para MP3",
    "Suporte a YouTube Shorts",
    "Seleção de qualidade (480p, 720p, 1080p)"
  ],
  "inLanguage": "pt-BR"
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Como baixar vídeo do YouTube grátis?", "acceptedAnswer": { "@type": "Answer", "text": "Cole a URL do vídeo no campo acima, selecione o formato desejado (MP4 ou MP3) e clique em Processar. Após o processamento, clique em Baixar para salvar o arquivo." } },
    { "@type": "Question", "name": "Posso baixar YouTube Shorts?", "acceptedAnswer": { "@type": "Answer", "text": "Sim! Selecione a aba YouTube Shorts, cole a URL do Short e escolha o formato. O download funciona da mesma forma que vídeos normais." } },
    { "@type": "Question", "name": "Quais formatos de download estão disponíveis?", "acceptedAnswer": { "@type": "Answer", "text": "Você pode baixar em MP4 (360p, 480p, 720p, 1080p). O processamento é feito em servidores dedicados para máxima velocidade." } },
    { "@type": "Question", "name": "O download do YouTube é grátis?", "acceptedAnswer": { "@type": "Answer", "text": "Sim, o ConvertHub é totalmente gratuito. Não é necessário criar conta ou instalar nenhum software." } },
    { "@type": "Question", "name": "Funciona no celular?", "acceptedAnswer": { "@type": "Answer", "text": "Sim! O ConvertHub funciona em qualquer navegador, seja no celular, tablet ou computador." } },
    { "@type": "Question", "name": "Por que o processamento demora alguns minutos?", "acceptedAnswer": { "@type": "Answer", "text": "O vídeo é processado em servidores dedicados para garantir a melhor qualidade. Vídeos mais longos ou em alta resolução podem levar de 30 segundos a 5 minutos." } }
  ]
}

const youtubeFaqs = [
  { q: 'Como baixar vídeo do YouTube grátis?', a: 'Cole a URL do vídeo no campo acima, selecione o formato desejado e clique em Processar. Após o processamento, clique em Baixar para salvar o arquivo.' },
  { q: 'Posso baixar YouTube Shorts?', a: 'Sim! Selecione a aba YouTube Shorts, cole a URL do Short e escolha o formato. O download funciona da mesma forma que vídeos normais.' },
  { q: 'Quais qualidades de vídeo estão disponíveis?', a: 'Você pode baixar em MP4 nas qualidades 360p, 480p, 720p e 1080p. Escolha a qualidade antes de processar.' },
  { q: 'O download é seguro e gratuito?', a: 'Sim, o ConvertHub é totalmente gratuito e seguro. Não é necessário criar conta ou instalar nenhum software.' },
  { q: 'Funciona no celular?', a: 'Sim! O ConvertHub funciona em qualquer navegador moderno, seja no celular, tablet ou computador.' },
  { q: 'Por que o processamento demora alguns minutos?', a: 'O vídeo é processado em servidores dedicados para garantir a melhor qualidade. Vídeos mais longos ou em alta resolução podem levar de 30 segundos a 5 minutos.' },
]

export default function YouTube() {
  const [url, setUrl] = useState('')
  const [quality, setQuality] = useState('720')
  const [type, setType] = useState('video')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)
  const [progress, setProgress] = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  const [videoInfo, setVideoInfo] = useState(null)
  const [fetchingInfo, setFetchingInfo] = useState(false)
  const openAdGate = useAdGate()
  const abortRef = useRef(null)

  const extractVideoId = (inputUrl) => {
    const match = inputUrl.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return match ? match[1] : null
  }

  const fetchVideoInfo = useCallback(async (videoUrl) => {
    const vid = extractVideoId(videoUrl)
    if (!vid) {
      setVideoInfo(null)
      return
    }
    setFetchingInfo(true)
    try {
      const res = await fetch(`/api/youtube/info?url=${encodeURIComponent(videoUrl)}`, {
        headers: { 'x-visitor-id': getVisitorId() },
      })
      if (res.ok) {
        const data = await res.json()
        setVideoInfo(data)
      } else {
        setVideoInfo(null)
      }
    } catch {
      setVideoInfo(null)
    } finally {
      setFetchingInfo(false)
    }
  }, [])

  useEffect(() => {
    const vid = extractVideoId(url)
    if (vid && url.length > 20) {
      const timer = setTimeout(() => fetchVideoInfo(url), 500)
      return () => clearTimeout(timer)
    } else {
      setVideoInfo(null)
    }
  }, [url, fetchVideoInfo])

  const fakeTimerRef = useRef(null)

  const startFakeProgress = () => {
    const milestones = [3, 7, 10, 15, 20, 27, 29, 34, 36, 38, 42, 44, 48, 52, 55, 58, 60]
    let idx = 0
    const tick = () => {
      if (idx < milestones.length) {
        setProgress(prev => {
          const target = milestones[idx]
          return prev < target ? target : prev
        })
        idx++
        fakeTimerRef.current = setTimeout(tick, 1800 + Math.random() * 2200)
      } else {
        fakeTimerRef.current = null
      }
    }
    fakeTimerRef.current = setTimeout(tick, 1000 + Math.random() * 800)
  }

  const stopFakeProgress = () => {
    if (fakeTimerRef.current) {
      clearTimeout(fakeTimerRef.current)
      fakeTimerRef.current = null
    }
  }

  const handleProcess = async () => {
    if (!url.trim()) { setError('Cole a URL do YouTube'); return }
    const videoId = extractVideoId(url)
    if (!videoId) { setError('URL do YouTube inválida'); return }

    setLoading(true)
    setError(null)
    setResults(null)
    setProgress(0)
    setStatusMsg('Conectando ao servidor...')
    startFakeProgress()

    try {
      const controller = new AbortController()
      abortRef.current = controller

      const res = await fetch('/api/youtube/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-visitor-id': getVisitorId() },
        body: JSON.stringify({ url: url.trim(), quality, type }),
        signal: controller.signal,
      })

      if (!res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao processar vídeo')
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
      if (!results) {
        setLoading(false)
      }
    } catch (err) {
      stopFakeProgress()
      if (err.name !== 'AbortError') {
        setError(err.message || 'Erro ao processar vídeo')
      }
      setLoading(false)
    }
  }

  const handleDownload = (downloadUrl) => {
    const title = videoInfo?.title || results?.[0]?.title || 'video'
    const proxyUrl = `/api/youtube/proxy-download?url=${encodeURIComponent(downloadUrl)}&title=${encodeURIComponent(title)}`
    openAdGate(proxyUrl)
  }

  const videoId = extractVideoId(url)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mx-auto max-w-3xl"
    >
      <SEOHead
        title="Baixar Vídeo do YouTube — Converter YouTube para MP3 e MP4"
        description="Baixe qualquer vídeo do YouTube grátis. Converta para MP4 (720p, 1080p), MP3, WAV e outros formatos. Rápido, online e sem instalar nada."
        canonical="/baixar-video-youtube"
        keywords="baixar vídeo youtube, converter youtube para mp3, youtube to mp3, download youtube video, youtube mp4 downloader"
        schema={[youtubeSchema, faqSchema]}
      />

      <div className="mb-8">
        <h1 className="mb-2 font-display text-3xl font-bold text-white">
          <Youtube className="mr-3 inline h-8 w-8 text-red-500" />
          Baixar Vídeo do YouTube — Conversor YouTube para MP4 e MP3
        </h1>
        <p className="text-gray-400">
          O ConvertHub permite baixar vídeos do YouTube gratuitamente, sem instalar nenhum aplicativo.
          Cole a URL do vídeo ou do YouTube Shorts, escolha a qualidade e o formato e faça o download em segundos.
        </p>
      </div>

      {/* Type Toggle */}
      <div className="mb-6 flex gap-2">
        {[{ id: 'video', label: 'Vídeo Normal' }, { id: 'shorts', label: 'YouTube Shorts' }].map((t) => (
          <button
            key={t.id}
            onClick={() => setType(t.id)}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
              type === t.id
                ? 'gradient-bg text-white shadow-lg shadow-accent-purple/25'
                : 'bg-card text-gray-400 border border-border hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* URL Input */}
      <div className="mb-6 rounded-2xl border border-border bg-surface p-6">
        <label className="mb-2 block text-sm font-medium text-gray-400">URL do YouTube</label>
        <input
          type="text"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(null) }}
          placeholder={type === 'shorts' ? 'https://youtube.com/shorts/...' : 'https://youtube.com/watch?v=...'}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-white placeholder-gray-500 outline-none transition-all focus:border-accent-purple/50"
        />
      </div>

      {/* Video Info Preview */}
      {videoInfo && !loading && !results && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex gap-4 rounded-2xl border border-border bg-surface p-4"
        >
          <div className="relative flex-shrink-0 overflow-hidden rounded-xl">
            <img
              src={videoInfo.thumbnail}
              alt={videoInfo.title}
              className="h-24 w-40 object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Play className="h-8 w-8 text-white/80" fill="white" />
            </div>
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <h3 className="font-display font-bold text-white text-sm leading-tight line-clamp-2">
              {videoInfo.title}
            </h3>
            {videoInfo.author && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400">
                <User className="h-3 w-3" />
                {videoInfo.author}
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Quality Selector */}
      <div className="mb-6">
        <p className="mb-3 text-sm font-medium text-gray-400">Qualidade</p>
        <div className="flex gap-2">
          {qualities.map((q) => (
            <button
              key={q}
              onClick={() => setQuality(q)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                quality === q
                  ? 'gradient-bg text-white'
                  : 'bg-card text-gray-400 border border-border hover:text-white'
              }`}
            >
              {q}p
            </button>
          ))}
        </div>
      </div>

      {/* Info Message */}
      <div className="mb-4 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
        <p className="text-sm text-blue-300">
          ⏱️ O processamento pode levar de <strong>30 segundos a 5 minutos</strong> para ser concluído. Por favor, aguarde.
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
          {videoInfo && (
            <div className="flex gap-4 mb-2">
              <img src={videoInfo.thumbnail} alt="" className="h-16 w-28 rounded-lg object-cover flex-shrink-0 opacity-60" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{videoInfo.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{videoInfo.author}</p>
              </div>
            </div>
          )}

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
          className="space-y-6"
        >
          {/* Video Card */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            {videoId && (
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            )}
            <div className="p-5">
              {(videoInfo?.title || results[0]?.title) && (
                <h3 className="font-display text-lg font-bold text-white mb-1">
                  {videoInfo?.title || results[0]?.title}
                </h3>
              )}
              {videoInfo?.author && (
                <p className="text-sm text-gray-400 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {videoInfo.author}
                </p>
              )}
            </div>
          </div>

          {/* Download Buttons */}
          {results.map((item, idx) => (
            <motion.button
              key={idx}
              onClick={() => handleDownload(item.downloadUrl)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary flex w-full items-center justify-center gap-3 py-4 text-base"
            >
              <Download className="h-5 w-5" />
              Baixar MP4 — {quality}p
            </motion.button>
          ))}
        </motion.div>
      )}
      <FAQSection faqs={youtubeFaqs} />
    </motion.div>
  )
}
