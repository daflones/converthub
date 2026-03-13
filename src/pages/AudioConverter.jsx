import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Music, Download, AlertCircle } from 'lucide-react'
import FileDropZone from '../components/shared/FileDropZone'
import FormatSelector from '../components/shared/FormatSelector'
import ProgressBar from '../components/shared/ProgressBar'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import SEOHead from '../components/shared/SEOHead'
import FAQSection from '../components/shared/FAQSection'
import AdGateOverlay from '../components/shared/AdGateOverlay'
import useAdGate from '../hooks/useAdGate'
import useConverter from '../hooks/useConverter'

const audioSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ConvertHub — Conversor de Áudio Online",
  "url": "https://converthub.nanosync.com.br/conversor-de-audio",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Todos (via navegador)",
  "description": "Extraia áudio de vídeos MP4 e converta entre formatos de áudio. MP3, WAV, FLAC, AAC e mais.",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "BRL" },
  "featureList": ["Conversão entre MP3, WAV, AAC, FLAC, M4A, Opus, WMA, OGG", "Extração de áudio de vídeos MP4", "Conversão MP4 para MP3 direta"],
  "inLanguage": "pt-BR"
}

const audioFaqs = [
  { q: 'Como converter MP4 para MP3?', a: 'Use a aba "MP4 → MP3", arraste seu arquivo de vídeo MP4 e clique em Extrair MP3. O áudio será extraído automaticamente.' },
  { q: 'Como extrair o áudio de um vídeo?', a: 'Use a aba "Vídeo → Áudio", selecione o vídeo, escolha o formato de áudio de saída (MP3, WAV, etc.) e clique em Converter.' },
  { q: 'Qual a diferença entre MP3 e WAV?', a: 'MP3 é comprimido e menor em tamanho, ideal para música. WAV é sem compressão, com qualidade máxima, ideal para edição profissional.' },
  { q: 'FLAC é melhor que MP3?', a: 'FLAC oferece qualidade superior ao MP3 por ser sem perdas (lossless), mas gera arquivos maiores. Ideal para audiófilos.' },
  { q: 'Qual o tamanho máximo de arquivo?', a: 'Você pode converter arquivos de áudio e vídeo de até 500MB gratuitamente.' },
]

const audioFormats = ['mp3', 'wav', 'aac', 'flac', 'm4a', 'opus', 'wma', 'ogg']
const audioInputFormats = ['mp3', 'wav', 'aac', 'flac', 'm4a', 'opus', 'wma', 'ogg']
const videoInputFormats = ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv']

const tabs = [
  { id: 'audio', label: 'Converter Áudio' },
  { id: 'mp4tomp3', label: 'MP4 → MP3' },
  { id: 'videotoaudio', label: 'Vídeo → Áudio' },
]

export default function AudioConverter() {
  const [activeTab, setActiveTab] = useState('audio')
  const [file, setFile] = useState(null)
  const [format, setFormat] = useState('mp3')
  const { openAdGate, triggerDownload, closeGate, gate } = useAdGate()

  const audioConverter = useConverter('/api/convert/audio')
  const extractConverter = useConverter('/api/convert/extract-audio')

  const currentConverter = activeTab === 'audio' ? audioConverter : extractConverter

  const handleConvert = async () => {
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    formData.append('format', activeTab === 'mp4tomp3' ? 'mp3' : format)
    await currentConverter.convert(formData)
  }

  const handleDownload = () => {
    if (currentConverter.result?.url) {
      const fname = currentConverter.result.filename || `converted.${activeTab === 'mp4tomp3' ? 'mp3' : format}`
      openAdGate(currentConverter.result.url, fname)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setFile(null)
    setFormat('mp3')
    audioConverter.reset()
    extractConverter.reset()
  }

  const getAcceptFormats = () => {
    if (activeTab === 'audio') return audioInputFormats
    return videoInputFormats
  }

  const getLabel = () => {
    if (activeTab === 'audio') return 'Arraste seu arquivo de áudio aqui'
    return 'Arraste seu arquivo de vídeo aqui'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mx-auto max-w-3xl"
    >
      <SEOHead
        title="Conversor de Áudio Online — MP4 para MP3, WAV, FLAC"
        description="Extraia áudio de vídeos MP4 e converta entre formatos de áudio. MP3, WAV, FLAC, AAC, OGG e mais. Ferramenta gratuita online."
        canonical="/conversor-de-audio"
        keywords="conversor de áudio, mp4 para mp3, convert mp4 to mp3, extrair áudio de vídeo, converter mp3 online"
        schema={audioSchema}
      />

      <div className="mb-8">
        <h1 className="mb-2 font-display text-3xl font-bold text-white">
          <Music className="mr-3 inline h-8 w-8 text-green-500" />
          Conversor de Áudio Online — MP4 para MP3, WAV, FLAC e Mais
        </h1>
        <p className="text-gray-400">
          Extraia áudio de vídeos MP4 ou converta entre todos os formatos de áudio online e grátis.
          Transforme MP4 em MP3, converta WAV para FLAC, OGG para AAC e muito mais. Processamento rápido e sem instalar programas.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'gradient-bg text-white shadow-lg shadow-accent-purple/25'
                : 'bg-card text-gray-400 border border-border hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <FileDropZone
          accept={getAcceptFormats()}
          onFile={setFile}
          label={getLabel()}
        />

        {file && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {activeTab !== 'mp4tomp3' && (
              <FormatSelector
                label="Formato de saída"
                formats={audioFormats}
                selected={format}
                onSelect={setFormat}
              />
            )}

            {activeTab === 'mp4tomp3' && (
              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="text-sm text-gray-400">
                  O áudio será extraído em formato <span className="font-bold text-white">MP3</span>
                </p>
              </div>
            )}

            {currentConverter.loading && (
              <div className="space-y-3">
                <ProgressBar progress={currentConverter.progress} />
                <LoadingSpinner message="Convertendo áudio..." />
              </div>
            )}

            {currentConverter.error && (
              <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{currentConverter.error}</p>
              </div>
            )}

            {currentConverter.result ? (
              <div className="flex gap-3">
                <motion.button
                  onClick={handleDownload}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-primary flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Baixar {activeTab === 'mp4tomp3' ? 'MP3' : format.toUpperCase()}
                </motion.button>
                <button onClick={() => handleTabChange(activeTab)} className="btn-secondary">
                  Nova conversão
                </button>
              </div>
            ) : (
              !currentConverter.loading && (
                <button
                  onClick={handleConvert}
                  disabled={!file}
                  className="btn-primary w-full text-center"
                >
                  {activeTab === 'mp4tomp3'
                    ? 'Extrair MP3'
                    : `Converter para ${format.toUpperCase()}`}
                </button>
              )
            )}
          </motion.div>
        )}
      </div>
      <FAQSection faqs={audioFaqs} />
      <AdGateOverlay visible={gate.visible} onDownload={triggerDownload} onClose={closeGate} />
    </motion.div>
  )
}
