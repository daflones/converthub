import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const searchItems = [
  { label: 'YouTube Download', path: '/youtube', keywords: 'youtube video download shorts mp4' },
  { label: 'Conversor de Vídeo', path: '/video-converter', keywords: 'video mp4 avi mov mkv webm converter' },
  { label: 'Conversor de Áudio', path: '/audio-converter', keywords: 'audio mp3 wav aac flac converter music' },
  { label: 'Conversor de Imagem', path: '/image-converter', keywords: 'image jpg png webp gif converter foto' },
  { label: 'Conversor de Documentos', path: '/doc-converter', keywords: 'document pdf docx txt csv xlsx converter' },
  { label: 'Base64', path: '/base64', keywords: 'base64 encode decode converter' },
  { label: 'Conversor de Caracteres', path: '/char-converter', keywords: 'text char case morse binary hex converter' },
]

export default function Header() {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const navigate = useNavigate()

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return searchItems.filter(
      (item) => item.label.toLowerCase().includes(q) || item.keywords.includes(q)
    )
  }, [query])

  const handleSelect = (path) => {
    navigate(path)
    setQuery('')
    setFocused(false)
  }

  return (
    <header className="fixed top-0 right-0 left-[240px] z-20 flex h-16 items-center border-b border-border bg-surface/80 backdrop-blur-xl px-6">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Buscar funcionalidade..."
          className="w-full rounded-xl border border-border bg-card py-2 pl-10 pr-10 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-accent-purple/50 focus:ring-1 focus:ring-accent-purple/25"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <AnimatePresence>
          {focused && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute top-full left-0 right-0 mt-2 overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
            >
              {results.map((item) => (
                <button
                  key={item.path}
                  onMouseDown={() => handleSelect(item.path)}
                  className="flex w-full items-center px-4 py-3 text-left text-sm text-gray-300 transition-colors hover:bg-card hover:text-white"
                >
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
