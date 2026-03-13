import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Music, Download, AlertCircle } from 'lucide-react'
import FileDropZone from '../components/shared/FileDropZone'
import FormatSelector from '../components/shared/FormatSelector'
import ProgressBar from '../components/shared/ProgressBar'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import useAdGate from '../hooks/useAdGate'
import useConverter from '../hooks/useConverter'

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
  const openAdGate = useAdGate()

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
      openAdGate(currentConverter.result.url)
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
      <div className="mb-8">
        <h1 className="mb-2 font-display text-3xl font-bold text-white">
          <Music className="mr-3 inline h-8 w-8 text-green-500" />
          Conversor de Áudio
        </h1>
        <p className="text-gray-400">Converta áudios, extraia MP3 de vídeos e mais</p>
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
    </motion.div>
  )
}
