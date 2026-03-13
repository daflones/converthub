import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Type } from 'lucide-react'
import CopyButton from '../components/shared/CopyButton'
import { transformations, countStats } from '../utils/charConverter'

const transformKeys = Object.keys(transformations)

export default function CharConverter() {
  const [input, setInput] = useState('')
  const [selected, setSelected] = useState('uppercase')

  const output = useMemo(() => {
    if (!input) return ''
    try {
      return transformations[selected].fn(input)
    } catch {
      return 'Erro na conversão'
    }
  }, [input, selected])

  const stats = useMemo(() => countStats(input), [input])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mx-auto max-w-5xl"
    >
      <div className="mb-8">
        <h1 className="mb-2 font-display text-3xl font-bold text-white">
          <Type className="mr-3 inline h-8 w-8 text-pink-500" />
          Conversor de Caracteres
        </h1>
        <p className="text-gray-400">Transforme textos: cases, Morse, Binário, Hex, ROT13 e mais</p>
      </div>

      {/* Transformation Selector */}
      <div className="mb-6">
        <p className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-gray-400">
          Transformação
        </p>
        <div className="flex flex-wrap gap-2">
          {transformKeys.map((key) => (
            <motion.button
              key={key}
              onClick={() => setSelected(key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                selected === key
                  ? 'gradient-bg text-white shadow-lg shadow-accent-purple/25'
                  : 'bg-card text-gray-400 border border-border hover:text-white hover:border-accent-purple/40'
              }`}
            >
              {transformations[key].label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Two Panels */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Input */}
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Entrada</p>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite ou cole seu texto aqui..."
            rows={12}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-accent-purple/50 resize-y font-mono"
          />
          {/* Stats */}
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
            <span><strong className="text-gray-400">{stats.chars}</strong> caracteres</span>
            <span><strong className="text-gray-400">{stats.words}</strong> palavras</span>
            <span><strong className="text-gray-400">{stats.lines}</strong> linhas</span>
            <span><strong className="text-gray-400">{stats.bytes}</strong> bytes</span>
          </div>
        </div>

        {/* Output */}
        <div className="rounded-2xl border border-accent-purple/20 bg-surface p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-purple">Saída</p>
            {output && <CopyButton text={output} />}
          </div>
          <textarea
            value={output}
            readOnly
            rows={12}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-gray-300 outline-none resize-y font-mono"
          />
        </div>
      </div>
    </motion.div>
  )
}
