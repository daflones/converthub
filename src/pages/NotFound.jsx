import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, AlertTriangle } from 'lucide-react'

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex min-h-[60vh] flex-col items-center justify-center text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-accent-purple/10"
      >
        <AlertTriangle className="h-12 w-12 text-accent-purple" />
      </motion.div>

      <h1 className="mb-2 font-display text-6xl font-extrabold gradient-text">404</h1>
      <p className="mb-8 text-lg text-gray-400">Página não encontrada</p>

      <Link
        to="/"
        className="btn-primary flex items-center gap-2"
      >
        <Home className="h-4 w-4" />
        Voltar para o Início
      </Link>
    </motion.div>
  )
}
