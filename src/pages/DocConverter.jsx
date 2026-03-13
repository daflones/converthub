import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, AlertCircle } from 'lucide-react'
import FileDropZone from '../components/shared/FileDropZone'
import FormatSelector from '../components/shared/FormatSelector'
import ProgressBar from '../components/shared/ProgressBar'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import useAdGate from '../hooks/useAdGate'
import useConverter from '../hooks/useConverter'

const inputFormats = ['pdf', 'docx', 'txt', 'html', 'csv', 'xlsx', 'json']

const conversionMap = {
  pdf: ['docx', 'txt', 'html'],
  docx: ['pdf', 'txt', 'html'],
  txt: ['pdf', 'docx', 'html'],
  html: ['pdf', 'docx', 'txt'],
  csv: ['xlsx', 'json'],
  xlsx: ['csv', 'json'],
  json: ['csv', 'xlsx'],
}

export default function DocConverter() {
  const [file, setFile] = useState(null)
  const [format, setFormat] = useState('')
  const { convert, loading, progress, error, result, reset } = useConverter('/api/convert/document')
  const openAdGate = useAdGate()

  const detectedFormat = useMemo(() => {
    if (!file) return null
    const ext = file.name.split('.').pop().toLowerCase()
    return conversionMap[ext] ? ext : null
  }, [file])

  const availableOutputs = useMemo(() => {
    if (!detectedFormat) return []
    return conversionMap[detectedFormat] || []
  }, [detectedFormat])

  const handleFileChange = (f) => {
    setFile(f)
    setFormat('')
    reset()
  }

  const handleConvert = async () => {
    if (!file || !format) return
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
    setFormat('')
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
          <FileText className="mr-3 inline h-8 w-8 text-orange-500" />
          Conversor de Documentos
        </h1>
        <p className="text-gray-400">Converta entre PDF, DOCX, TXT, HTML, CSV, XLSX e JSON</p>
      </div>

      <div className="space-y-6">
        <FileDropZone
          accept={inputFormats}
          onFile={handleFileChange}
          label="Arraste seu documento aqui ou clique para selecionar"
        />

        {file && detectedFormat && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-sm text-gray-400">
                Formato detectado: <span className="font-bold text-white">{detectedFormat.toUpperCase()}</span>
              </p>
            </div>

            <FormatSelector
              label="Converter para"
              formats={availableOutputs}
              selected={format}
              onSelect={setFormat}
            />

            {loading && (
              <div className="space-y-3">
                <ProgressBar progress={progress} />
                <LoadingSpinner message="Convertendo documento..." />
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
              !loading && format && (
                <button
                  onClick={handleConvert}
                  disabled={!file || !format}
                  className="btn-primary w-full text-center"
                >
                  Converter {detectedFormat.toUpperCase()} → {format.toUpperCase()}
                </button>
              )
            )}
          </motion.div>
        )}

        {file && !detectedFormat && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">Formato não suportado. Use: {inputFormats.map(f => f.toUpperCase()).join(', ')}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
