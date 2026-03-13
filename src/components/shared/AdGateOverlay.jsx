import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'

export default function AdGateOverlay({ visible, onDownload, onClose }) {
  const [countdown, setCountdown] = useState(5)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!visible) {
      setCountdown(5)
      setReady(false)
      return
    }
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setReady(true)
    }
  }, [visible, countdown])

  if (!visible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && ready && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-2xl"
        >
          {/* Logo */}
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl gradient-bg">
            <span className="text-2xl font-bold text-white">C</span>
          </div>

          <h2 className="mb-2 font-display text-2xl font-bold text-white">
            Preparando seu download...
          </h2>
          <p className="mb-8 text-sm text-gray-400">
            Aguarde o contador para liberar o download.
          </p>

          {/* Countdown */}
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-center">
              <motion.span
                key={countdown}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="font-display text-6xl font-extrabold gradient-text"
              >
                {ready ? '✓' : countdown}
              </motion.span>
            </div>

            {/* Progress bar */}
            <div className="mx-auto h-2 max-w-xs overflow-hidden rounded-full bg-card">
              <motion.div
                className="h-full rounded-full gradient-bg"
                initial={{ width: '0%' }}
                animate={{ width: `${((5 - countdown) / 5) * 100}%` }}
                transition={{ duration: 1, ease: 'linear' }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <motion.button
              onClick={onDownload}
              disabled={!ready}
              whileHover={ready ? { scale: 1.03 } : {}}
              whileTap={ready ? { scale: 0.97 } : {}}
              className={`flex items-center justify-center gap-2 rounded-xl py-3.5 text-base font-bold transition-all ${
                ready
                  ? 'gradient-bg text-white cursor-pointer shadow-lg shadow-accent-purple/25'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Download className="h-5 w-5" />
              Baixar Agora
            </motion.button>

            {ready && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={onClose}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-medium text-gray-400 transition-colors hover:bg-surface hover:text-white"
              >
                <X className="h-4 w-4" />
                Fechar
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
