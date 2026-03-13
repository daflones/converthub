import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Binary, Download, AlertCircle } from 'lucide-react'
import FileDropZone from '../components/shared/FileDropZone'
import FormatSelector from '../components/shared/FormatSelector'
import CopyButton from '../components/shared/CopyButton'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import useAdGate from '../hooks/useAdGate'
import { getVisitorId } from '../hooks/useVisitorId'

const decodeFormats = ['png', 'jpg', 'webp', 'mp3', 'wav', 'ogg', 'mp4', 'webm', 'pdf', 'txt']

const tabs = [
  { id: 'decode', label: 'Base64 → Arquivo' },
  { id: 'encode', label: 'Arquivo → Base64' },
]

export default function Base64() {
  const [activeTab, setActiveTab] = useState('decode')
  const [base64Input, setBase64Input] = useState('')
  const [decodeFormat, setDecodeFormat] = useState('png')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [encodeResult, setEncodeResult] = useState('')
  const [decodeUrl, setDecodeUrl] = useState(null)
  const openAdGate = useAdGate()

  const handleDecode = async () => {
    if (!base64Input.trim()) return
    setLoading(true)
    setError(null)
    setDecodeUrl(null)

    try {
      const res = await fetch('/api/base64/decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-visitor-id': getVisitorId() },
        body: JSON.stringify({ base64: base64Input.trim(), format: decodeFormat }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Erro ao decodificar')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setDecodeUrl(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEncode = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setEncodeResult('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/base64/encode', {
        method: 'POST',
        headers: { 'x-visitor-id': getVisitorId() },
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Erro ao codificar')
      }

      const data = await res.json()
      setEncodeResult(data.base64)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setError(null)
    setBase64Input('')
    setFile(null)
    setEncodeResult('')
    setDecodeUrl(null)
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
          <Binary className="mr-3 inline h-8 w-8 text-cyan-500" />
          Conversor Base64
        </h1>
        <p className="text-gray-400">Codifique e decodifique Base64 para qualquer formato</p>
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
        {activeTab === 'decode' ? (
          <>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-400">
                String Base64
              </label>
              <textarea
                value={base64Input}
                onChange={(e) => setBase64Input(e.target.value)}
                placeholder="Cole aqui o conteúdo Base64..."
                rows={6}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-accent-purple/50 font-mono resize-y"
              />
            </div>

            <FormatSelector
              label="Tipo de saída"
              formats={decodeFormats}
              selected={decodeFormat}
              onSelect={setDecodeFormat}
            />

            {loading && <LoadingSpinner message="Decodificando..." />}

            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {decodeUrl ? (
              <div className="flex gap-3">
                <motion.button
                  onClick={() => openAdGate(decodeUrl)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-primary flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Baixar {decodeFormat.toUpperCase()}
                </motion.button>
              </div>
            ) : (
              !loading && (
                <button
                  onClick={handleDecode}
                  disabled={!base64Input.trim()}
                  className="btn-primary w-full text-center"
                >
                  Decodificar Base64
                </button>
              )
            )}
          </>
        ) : (
          <>
            <FileDropZone
              onFile={setFile}
              label="Arraste qualquer arquivo aqui para converter em Base64"
            />

            {file && !loading && !encodeResult && (
              <button
                onClick={handleEncode}
                className="btn-primary w-full text-center"
              >
                Converter para Base64
              </button>
            )}

            {loading && <LoadingSpinner message="Codificando..." />}

            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {encodeResult && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-400">Resultado Base64</p>
                  <CopyButton text={encodeResult} />
                </div>
                <textarea
                  value={encodeResult}
                  readOnly
                  rows={8}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-xs text-gray-300 outline-none font-mono resize-y"
                />
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}
