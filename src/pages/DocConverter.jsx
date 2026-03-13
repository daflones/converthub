import React, { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, AlertCircle } from 'lucide-react'
import FileDropZone from '../components/shared/FileDropZone'
import FormatSelector from '../components/shared/FormatSelector'
import ProgressBar from '../components/shared/ProgressBar'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import SEOHead from '../components/shared/SEOHead'
import FAQSection from '../components/shared/FAQSection'
import AdGateOverlay from '../components/shared/AdGateOverlay'
import AdSlot from '../components/shared/AdSlot'
import useAdGate from '../hooks/useAdGate'
import useConverter from '../hooks/useConverter'

const docSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ConvertHub \u2014 Conversor de Documentos Online",
  "url": "https://converthub.nanosync.com.br/conversor-de-documentos",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Todos (via navegador)",
  "description": "Converta documentos online gr\u00e1tis. PDF para Word, Word para PDF, CSV para Excel e mais.",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "BRL" },
  "featureList": ["Convers\u00e3o entre PDF, DOCX, TXT, HTML", "Convers\u00e3o entre CSV, XLSX, JSON", "Detec\u00e7\u00e3o autom\u00e1tica de formato"],
  "inLanguage": "pt-BR"
}

const docFaqs = [
  { q: 'Como converter PDF para Word?', a: 'Arraste seu arquivo PDF para a \u00e1rea de upload, o formato ser\u00e1 detectado automaticamente. Selecione DOCX como formato de sa\u00edda e clique em Converter.' },
  { q: 'Como converter Word para PDF?', a: 'Arraste seu arquivo DOCX, selecione PDF como formato de sa\u00edda e clique em Converter. O PDF ser\u00e1 gerado instantaneamente.' },
  { q: 'Quais formatos de documento s\u00e3o suportados?', a: 'Suportamos PDF, DOCX, TXT, HTML para convers\u00e3o entre si, e tamb\u00e9m CSV, XLSX e JSON para dados tabulares.' },
  { q: 'A convers\u00e3o mant\u00e9m a formata\u00e7\u00e3o?', a: 'A convers\u00e3o preserva o texto e a estrutura b\u00e1sica. Formata\u00e7\u00f5es complexas como tabelas e imagens podem ter pequenas diferen\u00e7as.' },
  { q: 'Posso converter CSV para Excel?', a: 'Sim! Arraste seu arquivo CSV e selecione XLSX como formato de sa\u00edda. O arquivo Excel ser\u00e1 gerado com os dados organizados em colunas.' },
]

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
  const { openAdGate, triggerDownload, closeGate, gate } = useAdGate()

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
      openAdGate(result.url, result.filename || `converted.${format}`)
    }
  }

  const handleReset = () => {
    setFile(null)
    setFormat('')
    reset()
  }

  // Auto-convert quando trocar formato
  useEffect(() => {
    if (file && format && !loading && !result) {
      handleConvert()
    }
  }, [format])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mx-auto max-w-3xl"
    >
      <SEOHead
        title="Conversor de Documentos Online \u2014 PDF, Word, Excel, CSV"
        description="Converta documentos online gr\u00e1tis. PDF para Word, Word para PDF, CSV para Excel e mais. R\u00e1pido, seguro e sem instalar software."
        canonical="/conversor-de-documentos"
        keywords="conversor de documentos, converter pdf para word, pdf to word, converter pdf online, word para pdf"
        schema={docSchema}
      />

      <div className="mb-8">
        <h1 className="mb-2 font-display text-3xl font-bold text-white">
          <FileText className="mr-3 inline h-8 w-8 text-orange-500" />
          Conversor de Documentos Online \u2014 PDF, Word, Excel, CSV
        </h1>
        <p className="text-gray-400">
          Converta documentos online gr\u00e1tis. PDF para Word, Word para PDF, CSV para Excel e mais.
          R\u00e1pido, seguro e sem instalar nenhum software. Suporte a PDF, DOCX, TXT, HTML, CSV, XLSX e JSON.
        </p>
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
      <AdSlot />
      <FAQSection faqs={docFaqs} />
      <AdSlot />
      <AdGateOverlay visible={gate.visible} onDownload={triggerDownload} onClose={closeGate} />
    </motion.div>
  )
}
