import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Video, Download, AlertCircle } from 'lucide-react'
import FileDropZone from '../components/shared/FileDropZone'
import FormatSelector from '../components/shared/FormatSelector'
import ProgressBar from '../components/shared/ProgressBar'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import SEOHead from '../components/shared/SEOHead'
import FAQSection from '../components/shared/FAQSection'
import useAdGate from '../hooks/useAdGate'
import useConverter from '../hooks/useConverter'

const videoSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ConvertHub \u2014 Conversor de V\u00eddeo Online",
  "url": "https://converthub.nanosync.com.br/conversor-de-video",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Todos (via navegador)",
  "description": "Converta v\u00eddeos online gr\u00e1tis. Suporta MP4, AVI, MKV, MOV, WebM, FLV e mais.",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "BRL" },
  "featureList": ["Convers\u00e3o entre MP4, AVI, MKV, MOV, WebM, FLV, 3GP", "Sem instala\u00e7\u00e3o de software", "Processamento r\u00e1pido no servidor"],
  "inLanguage": "pt-BR"
}

const videoFaqs = [
  { q: 'Como converter um v\u00eddeo online?', a: 'Arraste seu arquivo de v\u00eddeo para a \u00e1rea de upload, selecione o formato de sa\u00edda desejado e clique em Converter. O download come\u00e7a automaticamente.' },
  { q: 'Quais formatos de v\u00eddeo s\u00e3o suportados?', a: 'Suportamos MP4, AVI, MOV, MKV, OGG, WebM, FLV, 3GP, TS e M4V tanto para entrada quanto para sa\u00edda.' },
  { q: 'Qual o tamanho m\u00e1ximo de arquivo?', a: 'Voc\u00ea pode converter v\u00eddeos de at\u00e9 500MB gratuitamente.' },
  { q: 'A convers\u00e3o perde qualidade?', a: 'A convers\u00e3o mant\u00e9m a melhor qualidade poss\u00edvel. Para formatos com compress\u00e3o (como MP4), pode haver uma leve redu\u00e7\u00e3o imperceptivel.' },
  { q: 'Preciso instalar algum programa?', a: 'N\u00e3o! A convers\u00e3o \u00e9 feita inteiramente online no navegador. Nenhum software precisa ser instalado.' },
]

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
      <SEOHead
        title="Conversor de V\u00eddeo Online Gr\u00e1tis \u2014 MP4, AVI, MKV, WebM"
        description="Converta v\u00eddeos online gr\u00e1tis. Suporta MP4, AVI, MKV, MOV, WebM, FLV e mais. Sem instalar software. Convers\u00e3o r\u00e1pida no navegador."
        canonical="/conversor-de-video"
        keywords="conversor de v\u00eddeo online, converter mp4, convert video online, mp4 para avi, converter mkv"
        schema={videoSchema}
      />

      <div className="mb-8">
        <h1 className="mb-2 font-display text-3xl font-bold text-white">
          <Video className="mr-3 inline h-8 w-8 text-blue-500" />
          Conversor de V\u00eddeo Online \u2014 MP4, AVI, MKV, WebM e Mais
        </h1>
        <p className="text-gray-400">
          Converta v\u00eddeos online gr\u00e1tis entre todos os formatos populares. Transforme MP4 em AVI, MKV em MP4, MOV em WebM
          e qualquer outra combina\u00e7\u00e3o. Processamento r\u00e1pido no servidor, sem instalar nenhum software.
        </p>
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
      <FAQSection faqs={videoFaqs} />
    </motion.div>
  )
}
