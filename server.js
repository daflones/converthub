import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import os from 'os'
import { fileURLToPath } from 'url'
import { ApifyClient } from 'apify-client'
import axios from 'axios'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import ffprobeInstaller from '@ffprobe-installer/ffprobe'
import sharp from 'sharp'
import { PDFDocument } from 'pdf-lib'
import mammoth from 'mammoth'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import compression from 'compression'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

ffmpeg.setFfmpegPath(ffmpegInstaller.path)
ffmpeg.setFfprobePath(ffprobeInstaller.path)

const app = express()
const PORT = process.env.PORT || 3000

// ─── Compression ────────────────────────────────────────────────────
app.use(compression())

// ─── CORS ───────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:4173', 'http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST'],
}))

// ─── Security & Logging ─────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      'script-src': ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com", "https://pagead2.googlesyndication.com", "https://googleads.g.doubleclick.net", "https://www.google-analytics.com", "https://static.cloudflareinsights.com"],
      'connect-src': ["'self'", "https://www.googletagmanager.com", "https://pagead2.googlesyndication.com", "https://googleads.g.doubleclick.net", "https://www.google-analytics.com"],
      'img-src': ["'self'", "data:", "https:"],
      'font-src': ["'self'", "https:"],
      'default-src': ["'self'"]
    }
  }
}))
app.use(morgan('short'))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// ─── Visitor-scoped temp directories ─────────────────────────────────
const baseTmpDir = path.join(os.tmpdir(), 'converthub')
if (!fs.existsSync(baseTmpDir)) fs.mkdirSync(baseTmpDir, { recursive: true })

function getVisitorDir(visitorId) {
  const safe = (visitorId || 'anonymous').replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 64)
  const dir = path.join(baseTmpDir, safe)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return dir
}

// ─── Middleware: extract visitor ID ──────────────────────────────────
app.use((req, res, next) => {
  req.visitorId = req.headers['x-visitor-id'] || `anon_${Date.now()}`
  req.visitorDir = getVisitorDir(req.visitorId)
  next()
})

// ─── Multer (visitor-scoped) ─────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, req.visitorDir || baseTmpDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${unique}-${file.originalname}`)
  },
})
const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } })

// ─── Cleanup helper ─────────────────────────────────────────────────
function cleanupFiles(...files) {
  for (const f of files) {
    if (f && fs.existsSync(f)) {
      fs.unlink(f, () => {})
    }
  }
}

// ─── Auto-cleanup stale visitor dirs (older than 30 min) ─────────────
setInterval(() => {
  try {
    const dirs = fs.readdirSync(baseTmpDir)
    const now = Date.now()
    for (const d of dirs) {
      const dirPath = path.join(baseTmpDir, d)
      try {
        const stat = fs.statSync(dirPath)
        if (stat.isDirectory() && (now - stat.mtimeMs) > 30 * 60 * 1000) {
          fs.rmSync(dirPath, { recursive: true, force: true })
          console.log(`[Cleanup] Removed stale visitor dir: ${d}`)
        }
      } catch {}
    }
  } catch {}
}, 10 * 60 * 1000)

// ─── Apify Client ───────────────────────────────────────────────────
const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN })

// =====================================================================
// YOUTUBE ROUTES
// =====================================================================

// ─── Fetch video metadata via oEmbed ────────────────────────────────
app.get('/api/youtube/info', async (req, res) => {
  try {
    const { url } = req.query
    if (!url) return res.status(400).json({ error: 'URL é obrigatória' })

    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    const response = await axios.get(oembedUrl, { timeout: 10000 })
    const data = response.data

    const videoIdMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    const videoId = videoIdMatch ? videoIdMatch[1] : null

    res.json({
      title: data.title || '',
      author: data.author_name || '',
      thumbnail: videoId
        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        : (data.thumbnail_url || ''),
      videoId,
    })
  } catch (err) {
    console.error('YouTube info error:', err.message)
    res.status(500).json({ error: 'Não foi possível obter informações do vídeo' })
  }
})

// ─── SSE-based download with progress ───────────────────────────────
app.post('/api/youtube/download', async (req, res) => {
  const { url, quality = '720', type = 'video' } = req.body
  if (!url) return res.status(400).json({ error: 'URL é obrigatória' })

  const ytRegex = /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}/
  if (!ytRegex.test(url)) return res.status(400).json({ error: 'URL do YouTube inválida' })

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  try {
    sendEvent({ type: 'status', message: 'Iniciando processamento...' })

    const runInput = {
      startUrls: [url],
      quality: String(quality),
      includeFailedVideos: false,
      proxy: { useApifyProxy: true },
    }

    // Start actor run (non-blocking wait)
    const run = await apifyClient.actor('y1IMcEPawMQPafm02').start(runInput)
    const runId = run.id

    sendEvent({ type: 'status', message: 'Preparando download do vídeo...' })

    // Poll for progress
    let finished = false
    let lastProgress = 0
    const startTime = Date.now()
    const TIMEOUT = 180000 // 3 min

    while (!finished && (Date.now() - startTime) < TIMEOUT) {
      await new Promise(r => setTimeout(r, 3000))

      const runInfo = await apifyClient.run(runId).get()

      // Check logs for progress percentage
      try {
        const logRes = await axios.get(
          `https://api.apify.com/v2/logs/${runId}?token=${process.env.APIFY_API_TOKEN}`,
          { timeout: 5000 }
        )
        const logText = logRes.data || ''
        const progressMatches = logText.match(/Converting\.\.\.\s*([\d.]+)%/g)
        if (progressMatches && progressMatches.length > 0) {
          const lastMatch = progressMatches[progressMatches.length - 1]
          const pct = parseFloat(lastMatch.match(/([\d.]+)%/)[1])
          if (pct > lastProgress) {
            lastProgress = pct
            sendEvent({ type: 'progress', percent: Math.min(pct, 99) })
            sendEvent({ type: 'status', message: `Convertendo vídeo... ${pct.toFixed(1)}%` })
          }
        }
      } catch {}

      if (runInfo.status === 'SUCCEEDED') {
        finished = true
      } else if (runInfo.status === 'FAILED' || runInfo.status === 'ABORTED' || runInfo.status === 'TIMED-OUT') {
        sendEvent({ type: 'error', message: 'Falha ao processar o vídeo. Tente novamente.' })
        res.end()
        return
      }
    }

    if (!finished) {
      sendEvent({ type: 'error', message: 'Tempo esgotado. Tente com um vídeo mais curto ou menor qualidade.' })
      res.end()
      return
    }

    sendEvent({ type: 'progress', percent: 95 })
    sendEvent({ type: 'status', message: 'Finalizando...' })

    const runData = await apifyClient.run(runId).get()
    const { items } = await apifyClient.dataset(runData.defaultDatasetId).listItems()

    if (!items || items.length === 0) {
      sendEvent({ type: 'error', message: 'Nenhum resultado encontrado para este vídeo.' })
      res.end()
      return
    }

    sendEvent({ type: 'progress', percent: 100 })

    const results = items.map(item => ({
      sourceUrl: item.url || item.sourceUrl || url,
      downloadUrl: item.downloadUrl || item.url,
      title: item.title || '',
    }))

    sendEvent({ type: 'done', results })
    res.end()
  } catch (err) {
    console.error('YouTube download error:', err.message)
    sendEvent({ type: 'error', message: 'Erro ao processar vídeo. Tente novamente.' })
    res.end()
  }
})

app.get('/api/youtube/proxy-download', async (req, res) => {
  try {
    const { url, title } = req.query
    if (!url) return res.status(400).json({ error: 'URL é obrigatória' })

    const decoded = decodeURIComponent(url)
    const response = await axios({
      method: 'GET',
      url: decoded,
      responseType: 'stream',
      timeout: 120000,
    })

    const contentType = response.headers['content-type'] || 'application/octet-stream'
    const safeName = (title || 'video').replace(/[^a-zA-Z0-9À-ÿ\s\-_]/g, '').substring(0, 80).trim()
    const filename = `${safeName || 'video'} (Baixado em ConvertHub).mp4`

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length'])
    }

    response.data.pipe(res)
  } catch (err) {
    console.error('Proxy download error:', err.message)
    res.status(500).json({ error: 'Erro ao fazer proxy do download' })
  }
})

// =====================================================================
// INSTAGRAM ROUTES
// =====================================================================

app.post('/api/instagram/download', async (req, res) => {
  const { url } = req.body
  if (!url) return res.status(400).json({ error: 'URL é obrigatória' })

  const igRegex = /(?:instagram\.com)\/(p|reel|reels|stories|tv)\/[a-zA-Z0-9_-]+/
  if (!igRegex.test(url)) return res.status(400).json({ error: 'URL do Instagram inválida' })

  // Converter /reels/ para /reel/ se necessário (ator Instagram só aceita /reel/)
  const normalizedUrl = url.replace('/reels/', '/reel/')

  // SSE
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  try {
    sendEvent({ type: 'status', message: 'Conectando ao Instagram...' })
    sendEvent({ type: 'progress', percent: 10 })

    const input = {
      instagram_urls: [normalizedUrl],
    }

    const run = await apifyClient.actor('EYxjTNaAMlqUePwza').start(input)
    const runId = run.id

    sendEvent({ type: 'status', message: 'Processando conteúdo do Instagram...' })
    sendEvent({ type: 'progress', percent: 25 })

    // Poll for completion
    let finished = false
    const startTime = Date.now()
    const TIMEOUT = 120000

    while (!finished && (Date.now() - startTime) < TIMEOUT) {
      await new Promise(r => setTimeout(r, 3000))
      const runInfo = await apifyClient.run(runId).get()

      if (runInfo.status === 'SUCCEEDED') {
        finished = true
      } else if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(runInfo.status)) {
        sendEvent({ type: 'error', message: 'Falha ao processar o conteúdo do Instagram.' })
        res.end()
        return
      } else {
        const elapsed = (Date.now() - startTime) / TIMEOUT
        sendEvent({ type: 'progress', percent: Math.min(25 + elapsed * 65, 90) })
      }
    }

    if (!finished) {
      sendEvent({ type: 'error', message: 'Tempo esgotado. Tente novamente.' })
      res.end()
      return
    }

    sendEvent({ type: 'progress', percent: 95 })
    sendEvent({ type: 'status', message: 'Finalizando...' })

    const runData = await apifyClient.run(runId).get()
    const { items } = await apifyClient.dataset(runData.defaultDatasetId).listItems()

    if (!items || items.length === 0) {
      sendEvent({ type: 'error', message: 'Nenhum resultado encontrado para esta URL.' })
      res.end()
      return
    }

    sendEvent({ type: 'progress', percent: 100 })

    // Parse Instagram results using real payload structure
    // Fields: media_type, shortcode, title, username, thumbnail_url, download_url, like_count, comment_count
    const results = items.map(item => ({
      type: item.media_type || 'video',
      downloadUrl: item.download_url || '',
      thumbnail: item.thumbnail_url || '',
      username: item.username || '',
      title: item.title || '',
      mediaType: item.media_type || '',
      shortcode: item.shortcode || '',
      likeCount: item.like_count || 0,
      commentCount: item.comment_count || 0,
      takenAt: item.taken_at || '',
      sourceUrl: item.source_url || '',
    }))

    if (results.length === 0) {
      sendEvent({ type: 'error', message: 'Não foi possível extrair mídia desta URL.' })
      res.end()
      return
    }

    sendEvent({ type: 'done', results })
    res.end()
  } catch (err) {
    console.error('Instagram download error:', err.message)
    sendEvent({ type: 'error', message: 'Erro ao processar conteúdo do Instagram.' })
    res.end()
  }
})

app.get('/api/instagram/proxy-download', async (req, res) => {
  try {
    const { url, filename } = req.query
    if (!url) return res.status(400).json({ error: 'URL é obrigatória' })

    const decoded = decodeURIComponent(url)
    const response = await axios({
      method: 'GET',
      url: decoded,
      responseType: 'stream',
      timeout: 120000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.instagram.com/',
        'Accept': '*/*',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
      },
    })

    const contentType = response.headers['content-type'] || 'application/octet-stream'
    const safeName = (filename || 'instagram-media').replace(/[^a-zA-Z0-9À-ÿ\s\-_]/g, '').substring(0, 80).trim()
    const ext = contentType.includes('video') ? 'mp4' : contentType.includes('image') ? 'jpg' : 'mp4'
    const finalName = `${safeName || 'instagram-media'} (Baixado em ConvertHub).${ext}`

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${finalName}"`)
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length'])
    }

    response.data.pipe(res)
  } catch (err) {
    console.error('Instagram proxy download error:', err.message)
    res.status(500).json({ error: 'Erro ao fazer proxy do download' })
  }
})

// =====================================================================
// TIKTOK ROUTES
// =====================================================================

app.post('/api/tiktok/download', async (req, res) => {
  const { url } = req.body
  if (!url) return res.status(400).json({ error: 'URL é obrigatória' })

  const tkRegex = /tiktok\.com\/@[^/]+\/video\/\d+|tiktok\.com\/t\/[a-zA-Z0-9]+|vm\.tiktok\.com\/[a-zA-Z0-9]+/
  if (!tkRegex.test(url)) return res.status(400).json({ error: 'URL do TikTok inválida' })

  // SSE
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  try {
    sendEvent({ type: 'status', message: 'Conectando ao TikTok...' })
    sendEvent({ type: 'progress', percent: 10 })

    const input = {
      videoUrls: [url],
      format: 'Video',
      ttl: 'none',
    }

    const run = await apifyClient.actor('xPJfblyAEnBXEWByE').start(input)
    const runId = run.id

    sendEvent({ type: 'status', message: 'Processando vídeo do TikTok...' })
    sendEvent({ type: 'progress', percent: 25 })

    // Poll for completion
    let finished = false
    const startTime = Date.now()
    const TIMEOUT = 120000

    while (!finished && (Date.now() - startTime) < TIMEOUT) {
      await new Promise(r => setTimeout(r, 3000))
      const runInfo = await apifyClient.run(runId).get()

      if (runInfo.status === 'SUCCEEDED') {
        finished = true
      } else if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(runInfo.status)) {
        sendEvent({ type: 'error', message: 'Falha ao processar o vídeo do TikTok.' })
        res.end()
        return
      } else {
        const elapsed = (Date.now() - startTime) / TIMEOUT
        sendEvent({ type: 'progress', percent: Math.min(25 + elapsed * 65, 90) })
      }
    }

    if (!finished) {
      sendEvent({ type: 'error', message: 'Tempo esgotado. Tente novamente.' })
      res.end()
      return
    }

    sendEvent({ type: 'progress', percent: 95 })
    sendEvent({ type: 'status', message: 'Finalizando...' })

    const runData = await apifyClient.run(runId).get()
    const { items } = await apifyClient.dataset(runData.defaultDatasetId).listItems()

    if (!items || items.length === 0) {
      sendEvent({ type: 'error', message: 'Nenhum resultado encontrado para esta URL.' })
      res.end()
      return
    }

    sendEvent({ type: 'progress', percent: 100 })

    // Parse TikTok results using real payload structure
    // Fields: data.hdplay (HD), data.play (SD), data.cover (thumbnail), data.music, data.title, author.nickname
    const results = items.map(item => {
      const data = item.data || {}
      const author = data.author || {}
      return {
        type: 'video',
        downloadUrl: data.hdplay || data.play || '',
        downloadUrlSD: data.play || '',
        thumbnail: data.cover || '',
        musicUrl: data.music || '',
        inputUrl: item.inputUrl || '',
        id: data.id || item.id || '',
        title: data.title || data.title_new || '',
        username: author.unique_id || author.nickname || '',
        nickname: author.nickname || '',
        duration: data.duration || 0,
        playCount: data.play_count || 0,
        likeCount: data.digg_count || 0,
        commentCount: data.comment_count || 0,
        shareCount: data.share_count || 0,
      }
    })

    const validResults = results.filter(r => r.downloadUrl)
    if (validResults.length === 0) {
      sendEvent({ type: 'error', message: 'Não foi possível extrair o vídeo desta URL.' })
      res.end()
      return
    }

    sendEvent({ type: 'done', results: validResults })
    res.end()
  } catch (err) {
    console.error('TikTok download error:', err.message)
    sendEvent({ type: 'error', message: 'Erro ao processar vídeo do TikTok.' })
    res.end()
  }
})

app.get('/api/tiktok/proxy-download', async (req, res) => {
  try {
    const { url, filename } = req.query
    if (!url) return res.status(400).json({ error: 'URL é obrigatória' })

    const decoded = decodeURIComponent(url)
    const response = await axios({
      method: 'GET',
      url: decoded,
      responseType: 'stream',
      timeout: 120000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.tiktok.com/',
        'Accept': '*/*',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
      },
    })

    const contentType = response.headers['content-type'] || 'video/mp4'
    const safeName = (filename || 'tiktok-video').replace(/[^a-zA-Z0-9À-ÿ\s\-_]/g, '').substring(0, 80).trim()
    const finalName = `${safeName || 'tiktok-video'} (Baixado em ConvertHub).mp4`

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${finalName}"`)
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length'])
    }

    response.data.pipe(res)
  } catch (err) {
    console.error('TikTok proxy download error:', err.message)
    res.status(500).json({ error: 'Erro ao fazer proxy do download' })
  }
})

// =====================================================================
// VIDEO CONVERSION
// =====================================================================

const videoFormats = ['mp4', 'avi', 'mov', 'mkv', 'ogg', 'webm', 'flv', '3gp', 'ts', 'm4v']

app.post('/api/convert/video', upload.single('file'), (req, res) => {
  const { format = 'mp4' } = req.body
  if (!req.file) return res.status(400).json({ error: 'Arquivo é obrigatório' })
  if (!videoFormats.includes(format)) return res.status(400).json({ error: 'Formato não suportado' })

  const inputPath = req.file.path
  const outputPath = path.join(req.visitorDir, `${Date.now()}-output.${format}`)
  const originalName = path.parse(req.file.originalname).name
  const finalFilename = `${originalName} (Baixado em ConvertHub).${format}`

  const videoMimeMap = {
    mp4: 'video/mp4', ogg: 'video/ogg', webm: 'video/webm', avi: 'video/x-msvideo',
    mkv: 'video/x-matroska', mov: 'video/quicktime', flv: 'video/x-flv',
    '3gp': 'video/3gpp', ts: 'video/mp2t', m4v: 'video/x-m4v',
  }

  ffmpeg(inputPath)
    .toFormat(format === '3gp' ? '3gp' : format)
    .on('end', () => {
      res.setHeader('Content-Type', videoMimeMap[format] || 'application/octet-stream')
      res.setHeader('Content-Disposition', `attachment; filename="${finalFilename}"`)
      res.sendFile(outputPath, (err) => {
        cleanupFiles(inputPath, outputPath)
      })
    })
    .on('error', (err) => {
      console.error('Video conversion error:', err.message)
      cleanupFiles(inputPath, outputPath)
      res.status(500).json({ error: 'Erro na conversão de vídeo' })
    })
    .save(outputPath)
})

// =====================================================================
// AUDIO CONVERSION
// =====================================================================

const audioFormats = ['mp3', 'wav', 'aac', 'flac', 'm4a', 'opus', 'wma', 'ogg']

app.post('/api/convert/audio', upload.single('file'), (req, res) => {
  const { format = 'mp3' } = req.body
  if (!req.file) return res.status(400).json({ error: 'Arquivo é obrigatório' })
  if (!audioFormats.includes(format)) return res.status(400).json({ error: 'Formato não suportado' })

  const inputPath = req.file.path
  const outputPath = path.join(req.visitorDir, `${Date.now()}-output.${format}`)

  const audioMimeMap = {
    mp3: 'audio/mpeg', wav: 'audio/wav', aac: 'audio/aac', flac: 'audio/flac',
    m4a: 'audio/mp4', opus: 'audio/opus', wma: 'audio/x-ms-wma', ogg: 'audio/ogg',
  }

  const originalName = path.parse(req.file.originalname).name
  const finalFilename = `${originalName} (Baixado em ConvertHub).${format}`

  ffmpeg(inputPath)
    .noVideo()
    .toFormat(format === 'm4a' ? 'ipod' : format)
    .on('end', () => {
      res.setHeader('Content-Type', audioMimeMap[format] || 'application/octet-stream')
      res.setHeader('Content-Disposition', `attachment; filename="${finalFilename}"`)
      res.sendFile(outputPath, (err) => {
        cleanupFiles(inputPath, outputPath)
      })
    })
    .on('error', (err) => {
      console.error('Audio conversion error:', err.message)
      cleanupFiles(inputPath, outputPath)
      res.status(500).json({ error: 'Erro na conversão de áudio' })
    })
    .save(outputPath)
})

app.post('/api/convert/extract-audio', upload.single('file'), (req, res) => {
  const { format = 'mp3' } = req.body
  if (!req.file) return res.status(400).json({ error: 'Arquivo é obrigatório' })

  const inputPath = req.file.path
  const outFmt = audioFormats.includes(format) ? format : 'mp3'
  const outputPath = path.join(req.visitorDir, `${Date.now()}-extracted.${outFmt}`)

  const extractMimeMap = {
    mp3: 'audio/mpeg', wav: 'audio/wav', aac: 'audio/aac', flac: 'audio/flac',
    m4a: 'audio/mp4', opus: 'audio/opus', wma: 'audio/x-ms-wma', ogg: 'audio/ogg',
  }

  const originalName = path.parse(req.file.originalname).name
  const finalFilename = `${originalName} (Baixado em ConvertHub).${outFmt}`

  ffmpeg(inputPath)
    .noVideo()
    .toFormat(outFmt === 'm4a' ? 'ipod' : outFmt)
    .on('end', () => {
      res.setHeader('Content-Type', extractMimeMap[outFmt] || 'application/octet-stream')
      res.setHeader('Content-Disposition', `attachment; filename="${finalFilename}"`)
      res.sendFile(outputPath, (err) => {
        cleanupFiles(inputPath, outputPath)
      })
    })
    .on('error', (err) => {
      console.error('Extract audio error:', err.message)
      cleanupFiles(inputPath, outputPath)
      res.status(500).json({ error: 'Erro ao extrair áudio' })
    })
    .save(outputPath)
})

// =====================================================================
// IMAGE CONVERSION
// =====================================================================

const imageFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'avif', 'ico']

app.post('/api/convert/image', upload.single('file'), async (req, res) => {
  const { format = 'png', quality = '85' } = req.body
  if (!req.file) return res.status(400).json({ error: 'Arquivo é obrigatório' })
  if (!imageFormats.includes(format)) return res.status(400).json({ error: 'Formato não suportado' })

  const inputPath = req.file.path
  const outputPath = path.join(req.visitorDir, `${Date.now()}-output.${format}`)
  const q = Math.min(100, Math.max(1, parseInt(quality) || 85))

  const originalName = path.parse(req.file.originalname).name
  const finalFilename = `${originalName} (Baixado em ConvertHub).${format}`

  try {
    let pipeline = sharp(inputPath)
    const fmt = format === 'jpg' ? 'jpeg' : format

    if (format === 'ico') {
      // ICO: resize to 256x256 and save as PNG (browsers handle it)
      await sharp(inputPath).resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(outputPath)
    } else if (fmt === 'jpeg') {
      await pipeline.jpeg({ quality: q }).toFile(outputPath)
    } else if (fmt === 'png') {
      await pipeline.png({ quality: q }).toFile(outputPath)
    } else if (fmt === 'webp') {
      await pipeline.webp({ quality: q }).toFile(outputPath)
    } else if (fmt === 'avif') {
      await pipeline.avif({ quality: q }).toFile(outputPath)
    } else if (fmt === 'tiff') {
      await pipeline.tiff({ quality: q }).toFile(outputPath)
    } else if (fmt === 'gif') {
      await pipeline.gif().toFile(outputPath)
    } else if (fmt === 'bmp') {
      await pipeline.toFormat('bmp').toFile(outputPath)
    } else {
      await pipeline.toFormat(fmt).toFile(outputPath)
    }

    const mimeMap = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
      gif: 'image/gif', bmp: 'image/bmp', tiff: 'image/tiff', avif: 'image/avif', ico: 'image/png',
    }

    res.setHeader('Content-Type', mimeMap[format] || 'application/octet-stream')
    res.setHeader('Content-Disposition', `attachment; filename="${finalFilename}"`)
    res.sendFile(outputPath, () => {
      cleanupFiles(inputPath, outputPath)
    })
  } catch (err) {
    console.error('Image conversion error:', err.message)
    cleanupFiles(inputPath, outputPath)
    res.status(500).json({ error: 'Erro na conversão de imagem' })
  }
})

// =====================================================================
// DOCUMENT CONVERSION
// =====================================================================

app.post('/api/convert/document', upload.single('file'), async (req, res) => {
  const { format } = req.body
  if (!req.file) return res.status(400).json({ error: 'Arquivo é obrigatório' })
  if (!format) return res.status(400).json({ error: 'Formato de saída é obrigatório' })

  const inputPath = req.file.path
  const inputExt = path.extname(req.file.originalname).toLowerCase().replace('.', '')
  const outputPath = path.join(req.visitorDir, `${Date.now()}-output.${format}`)
  const originalName = path.parse(req.file.originalname).name
  const finalFilename = `${originalName} (Baixado em ConvertHub).${format}`

  try {
    const pair = `${inputExt}-${format}`

    switch (pair) {
      // ── TXT conversions ──
      case 'txt-pdf': {
        const text = fs.readFileSync(inputPath, 'utf-8')
        const pdfDoc = await PDFDocument.create()
        const page = pdfDoc.addPage()
        const { height } = page.getSize()
        const lines = text.split('\n')
        let y = height - 40
        for (const line of lines) {
          if (y < 40) { const np = pdfDoc.addPage(); y = np.getSize().height - 40 }
          page.drawText(line.substring(0, 80), { x: 40, y, size: 11 })
          y -= 16
        }
        const pdfBytes = await pdfDoc.save()
        fs.writeFileSync(outputPath, pdfBytes)
        break
      }

      case 'txt-docx':
      case 'txt-html': {
        const text = fs.readFileSync(inputPath, 'utf-8')
        if (format === 'html') {
          const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Converted</title></head><body><pre>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></body></html>`
          fs.writeFileSync(outputPath, html, 'utf-8')
        } else {
          fs.writeFileSync(outputPath, text, 'utf-8')
        }
        break
      }

      // ── DOCX conversions ──
      case 'docx-txt': {
        const buf = fs.readFileSync(inputPath)
        const result = await mammoth.extractRawText({ buffer: buf })
        fs.writeFileSync(outputPath, result.value, 'utf-8')
        break
      }

      case 'docx-html': {
        const buf = fs.readFileSync(inputPath)
        const result = await mammoth.convertToHtml({ buffer: buf })
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Converted</title></head><body>${result.value}</body></html>`
        fs.writeFileSync(outputPath, html, 'utf-8')
        break
      }

      case 'docx-pdf': {
        const buf = fs.readFileSync(inputPath)
        const result = await mammoth.extractRawText({ buffer: buf })
        const pdfDoc = await PDFDocument.create()
        const page = pdfDoc.addPage()
        const { height } = page.getSize()
        const lines = result.value.split('\n')
        let y = height - 40
        for (const line of lines) {
          if (y < 40) { const np = pdfDoc.addPage(); y = np.getSize().height - 40 }
          page.drawText(line.substring(0, 80), { x: 40, y, size: 11 })
          y -= 16
        }
        const pdfBytes = await pdfDoc.save()
        fs.writeFileSync(outputPath, pdfBytes)
        break
      }

      // ── PDF conversions ──
      case 'pdf-txt': {
        const PDFParser = (await import('pdf2json')).default
        const pdfParser = new PDFParser()
        await new Promise((resolve, reject) => {
          pdfParser.on('pdfParser_dataReady', (pdfData) => {
            const text = pdfData.Pages.map(p =>
              p.Texts.map(t => t.R.map(r => decodeURIComponent(r.T)).join('')).join(' ')
            ).join('\n')
            fs.writeFileSync(outputPath, text, 'utf-8')
            resolve()
          })
          pdfParser.on('pdfParser_dataError', reject)
          pdfParser.loadPDF(inputPath)
        })
        break
      }

      case 'pdf-html': {
        const PDFParser = (await import('pdf2json')).default
        const pdfParser = new PDFParser()
        await new Promise((resolve, reject) => {
          pdfParser.on('pdfParser_dataReady', (pdfData) => {
            const text = pdfData.Pages.map(p =>
              p.Texts.map(t => t.R.map(r => decodeURIComponent(r.T)).join('')).join(' ')
            ).join('<br/>')
            const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Converted</title></head><body><p>${text}</p></body></html>`
            fs.writeFileSync(outputPath, html, 'utf-8')
            resolve()
          })
          pdfParser.on('pdfParser_dataError', reject)
          pdfParser.loadPDF(inputPath)
        })
        break
      }

      case 'pdf-docx': {
        const PDFParser = (await import('pdf2json')).default
        const pdfParser = new PDFParser()
        await new Promise((resolve, reject) => {
          pdfParser.on('pdfParser_dataReady', (pdfData) => {
            const text = pdfData.Pages.map(p =>
              p.Texts.map(t => t.R.map(r => decodeURIComponent(r.T)).join('')).join(' ')
            ).join('\n')
            fs.writeFileSync(outputPath, text, 'utf-8')
            resolve()
          })
          pdfParser.on('pdfParser_dataError', reject)
          pdfParser.loadPDF(inputPath)
        })
        break
      }

      // ── HTML conversions ──
      case 'html-pdf': {
        const htmlContent = fs.readFileSync(inputPath, 'utf-8')
        const textContent = htmlContent.replace(/<[^>]*>/g, '\n').replace(/\n{2,}/g, '\n').trim()
        const pdfDoc = await PDFDocument.create()
        const page = pdfDoc.addPage()
        const { height } = page.getSize()
        const lines = textContent.split('\n')
        let y = height - 40
        for (const line of lines) {
          if (y < 40) { const np = pdfDoc.addPage(); y = np.getSize().height - 40 }
          page.drawText(line.substring(0, 80), { x: 40, y, size: 11 })
          y -= 16
        }
        const pdfBytes = await pdfDoc.save()
        fs.writeFileSync(outputPath, pdfBytes)
        break
      }

      case 'html-txt': {
        const htmlContent = fs.readFileSync(inputPath, 'utf-8')
        const text = htmlContent.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim()
        fs.writeFileSync(outputPath, text, 'utf-8')
        break
      }

      case 'html-docx': {
        const htmlContent = fs.readFileSync(inputPath, 'utf-8')
        const text = htmlContent.replace(/<[^>]*>/g, '').trim()
        fs.writeFileSync(outputPath, text, 'utf-8')
        break
      }

      // ── CSV conversions ──
      case 'csv-xlsx': {
        const csvContent = fs.readFileSync(inputPath, 'utf-8')
        const parsed = Papa.parse(csvContent, { header: true })
        const ws = XLSX.utils.json_to_sheet(parsed.data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
        XLSX.writeFile(wb, outputPath)
        break
      }

      case 'csv-json': {
        const csvContent = fs.readFileSync(inputPath, 'utf-8')
        const parsed = Papa.parse(csvContent, { header: true })
        fs.writeFileSync(outputPath, JSON.stringify(parsed.data, null, 2), 'utf-8')
        break
      }

      // ── XLSX conversions ──
      case 'xlsx-csv': {
        const wb = XLSX.readFile(inputPath)
        const ws = wb.Sheets[wb.SheetNames[0]]
        const csv = XLSX.utils.sheet_to_csv(ws)
        fs.writeFileSync(outputPath, csv, 'utf-8')
        break
      }

      case 'xlsx-json': {
        const wb = XLSX.readFile(inputPath)
        const ws = wb.Sheets[wb.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(ws)
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8')
        break
      }

      // ── JSON conversions ──
      case 'json-csv': {
        const jsonContent = fs.readFileSync(inputPath, 'utf-8')
        const data = JSON.parse(jsonContent)
        const arr = Array.isArray(data) ? data : [data]
        const csv = Papa.unparse(arr)
        fs.writeFileSync(outputPath, csv, 'utf-8')
        break
      }

      case 'json-xlsx': {
        const jsonContent = fs.readFileSync(inputPath, 'utf-8')
        const data = JSON.parse(jsonContent)
        const arr = Array.isArray(data) ? data : [data]
        const ws = XLSX.utils.json_to_sheet(arr)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
        XLSX.writeFile(wb, outputPath)
        break
      }

      default:
        cleanupFiles(inputPath)
        return res.status(400).json({ error: `Conversão ${inputExt} → ${format} não suportada` })
    }

    const mimeMap = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      txt: 'text/plain',
      html: 'text/html',
      csv: 'text/csv',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      json: 'application/json',
    }

    res.setHeader('Content-Type', mimeMap[format] || 'application/octet-stream')
    res.setHeader('Content-Disposition', `attachment; filename="${finalFilename}"`)
    res.sendFile(outputPath, () => {
      cleanupFiles(inputPath, outputPath)
    })
  } catch (err) {
    console.error('Document conversion error:', err.message)
    cleanupFiles(inputPath, outputPath)
    res.status(500).json({ error: 'Erro na conversão de documento' })
  }
})

// =====================================================================
// BASE64 ROUTES
// =====================================================================

app.post('/api/base64/decode', (req, res) => {
  try {
    const { base64, format = 'png' } = req.body
    if (!base64) return res.status(400).json({ error: 'Base64 é obrigatório' })

    const cleaned = base64.replace(/^data:[^;]+;base64,/, '')
    const buffer = Buffer.from(cleaned, 'base64')

    const mimeMap = {
      png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp',
      mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg',
      mp4: 'video/mp4', webm: 'video/webm',
      pdf: 'application/pdf', txt: 'text/plain',
    }

    res.setHeader('Content-Type', mimeMap[format] || 'application/octet-stream')
    res.setHeader('Content-Disposition', `attachment; filename="decoded.${format}"`)
    res.send(buffer)
  } catch (err) {
    console.error('Base64 decode error:', err.message)
    res.status(500).json({ error: 'Erro ao decodificar Base64' })
  }
})

app.post('/api/base64/encode', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Arquivo é obrigatório' })

    const inputPath = req.file.path
    const buffer = fs.readFileSync(inputPath)
    const base64 = buffer.toString('base64')

    cleanupFiles(inputPath)
    res.json({ base64 })
  } catch (err) {
    console.error('Base64 encode error:', err.message)
    if (req.file) cleanupFiles(req.file.path)
    res.status(500).json({ error: 'Erro ao codificar Base64' })
  }
})

// ─── Serve static files (production) ────────────────────────────────
const distPath = path.join(__dirname, 'dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  console.log('[ConvertHub] Serving static files from dist/')
}

// ─── Health check ───────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── SPA catch-all (must be last) ───────────────────────────────────
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html')
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.status(404).send('Frontend not built. Run: npm run build')
  }
})

// ─── Start ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[ConvertHub] Backend rodando na porta ${PORT}`)
})
