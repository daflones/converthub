import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ message = 'Carregando...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 className="h-10 w-10 text-accent-purple" />
      </motion.div>
      <p className="text-sm text-gray-400 font-medium">{message}</p>
    </div>
  )
}
