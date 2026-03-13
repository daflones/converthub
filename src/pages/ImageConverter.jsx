import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Image, Download, AlertCircle } from 'lucide-react'
import FileDropZone from '../components/shared/FileDropZone'
import FormatSelector from '../components/shared/FormatSelector'
import ProgressBar from '../components/shared/ProgressBar'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import useAdGate from '../hooks/useAdGate'
import useConverter from '../hooks/useConverter'

const inputFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'svg', 'ico', 'avif']
const outputFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'avif', 'ico']

export default function ImageConverter() {
  const [file, setFile] = useState(null)
  const [format, setFormat] = useState('png')
  const [quality, setQuality] = useState(85)
  const [preview, setPreview] = useState(null)
  const { convert, loading, progress, error, result, reset } = useConverter('/api/convert/image')
  const openAdGate = useAdGate()

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setPreview(null)
    }
  }, [file])

  const handleConvert = async () => {
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    formData.append('format', format)
    formData.append('quality', quality)
    await convert(formData)
  }

  const handleDownload = () => {
    if (result?.url) {
      openAdGate(result.url)
    }
  }

  const handleReset = () => {
    setFile(null)
    setPreview(null)
    reset()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mx-auto max-w-4xl"
    >
      <div className="mb-8">
        <h1 className="mb-2 font-display text-3xl font-bold text-white">
          <Image className="mr-3 inline h-8 w-8 text-purple-500" />
          Conversor de Imagem
        </h1>
        <p className="text-gray-400">Converta imagens entre JPG, PNG, WebP, GIF, AVIF e mais</p>
      </div>

      <div className="space-y-6">
        <FileDropZone
          accept={inputFormats}
          onFile={setFile}
          label="Arraste sua imagem aqui ou clique para selecionar"
        />

        {file && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Preview */}
            {preview && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Original</p>
                  <div className="flex items-center justify-center overflow-hidden rounded-xl bg-card" style={{ minHeight: 200 }}>
                    <img src={preview} alt="Original" className="max-h-64 max-w-full object-contain" />
                  </div>
                </div>
                {result?.url && (
                  <div className="rounded-2xl border border-accent-purple/30 bg-surface p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent-purple">Convertido</p>
                    <div className="flex items-center justify-center overflow-hidden rounded-xl bg-card" style={{ minHeight: 200 }}>
                      <img src={result.url} alt="Convertido" className="max-h-64 max-w-full object-contain" />
                    </div>
                  </div>
                )}
              </div>
            )}

            <FormatSelector
              label="Formato de saída"
              formats={outputFormats}
              selected={format}
              onSelect={setFormat}
            />

            {/* Quality Slider */}
            <div>
              <label className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-400">Qualidade</span>
                <span className="font-bold text-white">{quality}%</span>
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-accent-purple"
              />
            </div>

            {loading && (
              <div className="space-y-3">
                <ProgressBar progress={progress} />
                <LoadingSpinner message="Convertendo imagem..." />
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
