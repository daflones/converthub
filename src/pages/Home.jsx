import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Youtube,
  Instagram,
  Video,
  Music,
  Image,
  FileText,
  Binary,
  Type,
  Sparkles,
} from 'lucide-react'
import SEOHead from '../components/shared/SEOHead'

const homeSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://converthub.nanosync.com.br/#website",
      "url": "https://converthub.nanosync.com.br",
      "name": "ConvertHub",
      "description": "Plataforma de conversão de arquivos online gratuita",
      "inLanguage": ["pt-BR", "en"],
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://converthub.nanosync.com.br/?busca={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://converthub.nanosync.com.br/#organization",
      "name": "ConvertHub",
      "url": "https://converthub.nanosync.com.br",
      "logo": {
        "@type": "ImageObject",
        "url": "https://converthub.nanosync.com.br/favicon.svg",
        "width": 512,
        "height": 512
      }
    }
  ]
}

const categories = [
  {
    to: '/baixar-video-youtube',
    icon: Youtube,
    title: 'YouTube',
    desc: 'Baixe vídeos e Shorts do YouTube em MP4',
    gradient: 'from-red-500 to-red-700',
  },
  {
    to: '/baixar-video-instagram',
    icon: Instagram,
    title: 'Instagram',
    desc: 'Baixe vídeos, reels, fotos e posts do Instagram',
    gradient: 'from-pink-500 to-purple-700',
  },
  {
    to: '/baixar-video-tiktok',
    icon: Video,
    title: 'TikTok',
    desc: 'Baixe vídeos do TikTok sem marca d\'água',
    gradient: 'from-cyan-400 to-cyan-700',
  },
  {
    to: '/conversor-de-video',
    icon: Video,
    title: 'Vídeo',
    desc: 'Converta entre MP4, AVI, MKV, WebM e mais',
    gradient: 'from-blue-500 to-blue-700',
  },
  {
    to: '/conversor-de-audio',
    icon: Music,
    title: 'Áudio',
    desc: 'MP3, WAV, AAC, FLAC e extração de áudio',
    gradient: 'from-green-500 to-green-700',
  },
  {
    to: '/conversor-de-imagem',
    icon: Image,
    title: 'Imagem',
    desc: 'JPG, PNG, WebP, GIF, AVIF e mais formatos',
    gradient: 'from-purple-500 to-purple-700',
  },
  {
    to: '/conversor-de-documentos',
    icon: FileText,
    title: 'Documentos',
    desc: 'PDF, DOCX, TXT, CSV, XLSX, HTML e JSON',
    gradient: 'from-orange-500 to-orange-700',
  },
  {
    to: '/conversor-base64',
    icon: Binary,
    title: 'Base64',
    desc: 'Codifique e decodifique Base64 para qualquer formato',
    gradient: 'from-cyan-500 to-cyan-700',
  },
  {
    to: '/conversor-de-caracteres',
    icon: Type,
    title: 'Caracteres',
    desc: 'Cases, Morse, Binário, Hex, ROT13 e mais',
    gradient: 'from-pink-500 to-pink-700',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mx-auto max-w-5xl"
    >
      <SEOHead
        title="Conversor de Arquivos Online Grátis"
        description="ConvertHub: converta vídeos, áudios, imagens e documentos online e grátis. Baixe vídeos do YouTube, converta MP4 para MP3, JPG para PNG e muito mais."
        canonical="/"
        keywords="conversor de arquivos, converter vídeo, converter áudio, converter imagem, baixar youtube, mp4 para mp3"
        schema={homeSchema}
      />

      {/* Hero */}
      <section className="relative mb-16 overflow-hidden rounded-3xl bg-surface p-12 text-center">
        {/* Grid effect */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(108,99,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent-purple/30 bg-accent-purple/10 px-4 py-1.5">
            <Sparkles className="h-4 w-4 text-accent-purple" />
            <span className="text-sm font-medium text-accent-purple">Plataforma completa de conversão</span>
          </div>
          <h1 className="mb-4 font-display text-5xl font-extrabold leading-tight md:text-6xl">
            Converta qualquer coisa,{' '}
            <span className="gradient-text">em qualquer formato.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Vídeos, áudios, imagens, documentos e textos — tudo em um só lugar.
            Rápido, gratuito e sem complicação.
          </p>
        </motion.div>
      </section>

      {/* Categories Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {categories.map((cat) => (
          <motion.div key={cat.to} variants={item}>
            <Link
              to={cat.to}
              className="group block rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-accent-purple/40 hover:shadow-xl hover:shadow-accent-purple/5 card-hover"
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${cat.gradient} shadow-lg`}>
                <cat.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-1 font-display text-lg font-bold text-white">{cat.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{cat.desc}</p>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
