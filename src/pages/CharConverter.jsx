import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Type } from 'lucide-react'
import CopyButton from '../components/shared/CopyButton'
import SEOHead from '../components/shared/SEOHead'
import FAQSection from '../components/shared/FAQSection'
import AdSlot from '../components/shared/AdSlot'
import { transformations, countStats } from '../utils/charConverter'

const charSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ConvertHub \u2014 Conversor de Texto Online",
  "url": "https://converthub.nanosync.com.br/conversor-de-caracteres",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Todos (via navegador)",
  "description": "Converta texto entre diferentes formatos: mai\u00fasculas, min\u00fasculas, bin\u00e1rio, hexadecimal, Morse, Base64, ROT13 e mais.",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "BRL" },
  "featureList": ["Convers\u00e3o mai\u00fasculas/min\u00fasculas", "Texto para Bin\u00e1rio e Hexadecimal", "C\u00f3digo Morse", "ROT13", "Contagem de caracteres e palavras"],
  "inLanguage": "pt-BR"
}

const charFaqs = [
  { q: 'Como converter texto para mai\u00fasculas?', a: 'Digite ou cole seu texto no campo de entrada, selecione a transforma\u00e7\u00e3o "UPPER CASE" e o resultado aparecer\u00e1 automaticamente no campo de sa\u00edda.' },
  { q: 'Como converter texto para bin\u00e1rio?', a: 'Selecione a transforma\u00e7\u00e3o "Bin\u00e1rio" e digite seu texto. Cada caractere ser\u00e1 convertido para sua representa\u00e7\u00e3o bin\u00e1ria de 8 bits.' },
  { q: 'O que \u00e9 c\u00f3digo Morse?', a: 'C\u00f3digo Morse \u00e9 um sistema de comunica\u00e7\u00e3o que representa letras e n\u00fameros usando pontos (.) e tra\u00e7os (-). Foi inventado por Samuel Morse.' },
  { q: 'O que \u00e9 ROT13?', a: 'ROT13 \u00e9 uma cifra simples que substitui cada letra pela letra 13 posi\u00e7\u00f5es \u00e0 frente no alfabeto. \u00c9 usada para ofuscar textos.' },
  { q: 'Posso copiar o resultado?', a: 'Sim! Use o bot\u00e3o de copiar ao lado do campo de sa\u00edda para copiar o resultado para a \u00e1rea de transfer\u00eancia.' },
]

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
      <SEOHead
        title="Conversor de Texto Online \u2014 Mai\u00fasculas, Bin\u00e1rio, Morse, Hex"
        description="Converta texto entre diferentes formatos: mai\u00fasculas, min\u00fasculas, bin\u00e1rio, hexadecimal, Morse, Base64, ROT13 e mais. Gr\u00e1tis online."
        canonical="/conversor-de-caracteres"
        keywords="conversor de texto, texto para bin\u00e1rio, texto para morse, converter caracteres, text converter online"
        schema={charSchema}
      />

      <div className="mb-8">
        <h1 className="mb-2 font-display text-3xl font-bold text-white">
          <Type className="mr-3 inline h-8 w-8 text-pink-500" />
          Conversor de Texto Online \u2014 Mai\u00fasculas, Bin\u00e1rio, Morse, Hex
        </h1>
        <p className="text-gray-400">
          Converta texto entre diferentes formatos: mai\u00fasculas, min\u00fasculas, bin\u00e1rio, hexadecimal, Morse, Base64, ROT13 e mais.
          Ferramenta gratuita com contagem de caracteres, palavras e bytes.
        </p>
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
      <AdSlot />
      <FAQSection faqs={charFaqs} />
      <AdSlot />
    </motion.div>
  )
}
