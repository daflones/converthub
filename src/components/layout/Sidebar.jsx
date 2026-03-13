import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Youtube,
  Instagram,
  Video,
  Music,
  Image,
  FileText,
  Binary,
  Type,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

// TikTok icon component
const TikTokIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
)

const navItems = [
  { to: '/', icon: Home, label: 'Início' },
  { to: '/baixar-video-youtube', icon: Youtube, label: 'YouTube' },
  { to: '/baixar-video-instagram', icon: Instagram, label: 'Instagram' },
  { to: '/baixar-video-tiktok', icon: TikTokIcon, label: 'TikTok' },
  { to: '/conversor-de-video', icon: Video, label: 'Vídeo' },
  { to: '/conversor-de-audio', icon: Music, label: 'Áudio' },
  { to: '/conversor-de-imagem', icon: Image, label: 'Imagem' },
  { to: '/conversor-de-documentos', icon: FileText, label: 'Documentos' },
  { to: '/conversor-base64', icon: Binary, label: 'Base64' },
  { to: '/conversor-de-caracteres', icon: Type, label: 'Caracteres' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-border bg-surface"
    >
      <div className="flex h-16 items-center justify-between px-4">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
                <span className="text-sm font-bold text-white">C</span>
              </div>
              <span className="font-display text-lg font-bold gradient-text">ConvertHub</span>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
            <span className="text-sm font-bold text-white">C</span>
          </div>
        )}
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-accent-purple/15 text-accent-purple'
                  : 'text-gray-400 hover:bg-card hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-accent-purple' : ''}`} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-3 mb-4 flex items-center justify-center gap-2 rounded-xl border border-border py-2 text-sm text-gray-400 transition-colors hover:bg-card hover:text-white"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Recolher
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </motion.aside>
  )
}
