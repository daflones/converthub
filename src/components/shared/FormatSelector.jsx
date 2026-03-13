import React from 'react'
import { motion } from 'framer-motion'

export default function FormatSelector({ formats, selected, onSelect, label }) {
  return (
    <div>
      {label && (
        <p className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-gray-400">
          {label}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {formats.map((fmt) => (
          <motion.button
            key={fmt}
            onClick={() => onSelect(fmt)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`rounded-xl px-4 py-2 text-sm font-semibold uppercase transition-all duration-200 ${
              selected === fmt
                ? 'gradient-bg text-white shadow-lg shadow-accent-purple/25'
                : 'bg-card text-gray-400 border border-border hover:text-white hover:border-accent-purple/40'
            }`}
          >
            {fmt}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
