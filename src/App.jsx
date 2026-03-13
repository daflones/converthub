import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import Home from './pages/Home'
import YouTube from './pages/YouTube'
import VideoConverter from './pages/VideoConverter'
import AudioConverter from './pages/AudioConverter'
import ImageConverter from './pages/ImageConverter'
import DocConverter from './pages/DocConverter'
import Base64 from './pages/Base64'
import CharConverter from './pages/CharConverter'
import Instagram from './pages/Instagram'
import TikTok from './pages/TikTok'
import AdGate from './pages/AdGate'
import NotFound from './pages/NotFound'
import AdBlockOverlay from './components/shared/AdBlockOverlay'
import AdSenseManager from './components/shared/AdSenseManager'

export default function App() {
  const location = useLocation()
  const isAdGate = location.pathname === '/ad-gate'

  if (isAdGate) {
    return <AdGate />
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdSenseManager />
      <AdBlockOverlay />
      <Sidebar />
      <div className="flex flex-1 flex-col ml-[240px]">
        <Header />
        <main className="flex-1 overflow-auto px-6 pb-8 pt-20">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/baixar-video-youtube" element={<YouTube />} />
              <Route path="/baixar-video-instagram" element={<Instagram />} />
              <Route path="/baixar-video-tiktok" element={<TikTok />} />
              <Route path="/conversor-de-video" element={<VideoConverter />} />
              <Route path="/conversor-de-audio" element={<AudioConverter />} />
              <Route path="/conversor-de-imagem" element={<ImageConverter />} />
              <Route path="/conversor-de-documentos" element={<DocConverter />} />
              <Route path="/conversor-base64" element={<Base64 />} />
              <Route path="/conversor-de-caracteres" element={<CharConverter />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
