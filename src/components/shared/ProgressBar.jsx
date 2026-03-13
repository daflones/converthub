import React from 'react'
import { motion } from 'framer-motion'

export default function ProgressBar({ progress = 0 }) {
  return (
    <div className="w-full overflow-hidden rounded-full bg-surface h-3">
      <motion.div
        className="h-full rounded-full gradient-bg"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  )
}
