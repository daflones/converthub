import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Video, Download, AlertCircle } from 'lucide-react'
import FileDropZone from '../components/shared/FileDropZone'
import FormatSelector from '../components/shared/FormatSelector'
import ProgressBar from '../components/shared/ProgressBar'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import useAdGate from '../hooks/useAdGate'
import useConverter from '../hooks/useConverter'

const inputFormats = ['mp4', 'avi', 'mov', 'mkv', 'ogg', 'webm', 'flv', '3gp']
const outputFormats = ['mp4', 'ogg', 'webm', 'avi', 'mkv', 'mov', 'flv', '3gp', 'ts', 'm4v']

export default function VideoConverter() {
  const [file, setFile] = useState(null)
  const [format, setFormat] = useState('mp4')
  const { convert, loading, progress, error, result, reset } = useConverter('/api/convert/video')
  const openAdGate = useAdGate()

  const handleConvert = async () => {
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    formData.append('format', format)
    await convert(formData)
  }

  const handleDownload = () => {
    if (result?.url) {
      openAdGate(result.url)
    }
  }

  const handleReset = () => {
    setFile(null)
    reset()
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
          <Video className="mr-3 inline h-8 w-8 text-blue-500" />
          Conversor de Vídeo
        </h1>
        <p className="text-gray-400">Converta vídeos entre diferentes formatos</p>
      </div>

      <div className="space-y-6">
        <FileDropZone
          accept={inputFormats}
          onFile={setFile}
          label="Arraste seu vídeo aqui ou clique para selecionar"
        />

        {file && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <FormatSelector
              label="Formato de saída"
              formats={outputFormats}
              selected={format}
              onSelect={setFormat}
            />

            {loading && (
              <div className="space-y-3">
                <ProgressBar progress={progress} />
                <LoadingSpinner message="Convertendo vídeo..." />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {result ? (
              <div className="flex gap-3">
                <motion.button
                  onClick={handleDownload}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-primary flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Baixar {format.toUpperCase()}
                </motion.button>
                <button onClick={handleReset} className="btn-secondary">
                  Nova conversão
                </button>
              </div>
            ) : (
              !loading && (
                <button
                  onClick={handleConvert}
                  disabled={!file}
                  className="btn-primary w-full text-center"
                >
                  Converter para {format.toUpperCase()}
                </button>
              )
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
