import React, { useCallback, useState, useRef } from 'react'
import { Upload, File, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function FileDropZone({ accept, onFile, label }) {
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const inputRef = useRef(null)

  const acceptStr = accept ? accept.map(f => `.${f}`).join(',') : undefined

  const handleFile = useCallback((file) => {
    if (file) {
      setSelectedFile(file)
      onFile?.(file)
    }
  }, [onFile])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleClick = () => inputRef.current?.click()

  const handleChange = (e) => {
    const file = e.target.files[0]
    handleFile(file)
  }

  const removeFile = (e) => {
    e.stopPropagation()
    setSelectedFile(null)
    onFile?.(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  return (
    <motion.div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
        dragOver
          ? 'border-accent-purple bg-accent-purple/10'
          : selectedFile
          ? 'border-accent-purple/50 bg-card'
          : 'border-border bg-surface hover:border-accent-purple/30 hover:bg-card/50'
      }`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptStr}
        onChange={handleChange}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {selectedFile ? (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-purple/20">
              <File className="h-6 w-6 text-accent-purple" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-white">{selectedFile.name}</p>
              <p className="text-sm text-gray-400">{formatSize(selectedFile.size)}</p>
            </div>
            <button
              onClick={removeFile}
              className="ml-4 flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-red-400 transition-colors hover:bg-red-500/30"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Upload className="mx-auto mb-3 h-10 w-10 text-gray-500" />
            <p className="font-display text-lg font-semibold text-gray-300">
              {label || 'Arraste o arquivo aqui ou clique para selecionar'}
            </p>
            {accept && (
              <p className="mt-2 text-sm text-gray-500">
                Formatos aceitos: {accept.map(f => f.toUpperCase()).join(', ')}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
