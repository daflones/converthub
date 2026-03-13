import React from 'react'

const positions = {
  'top-left': { top: '64px', left: 0, width: '160px', height: '600px' },
  'top-right': { top: '64px', right: 0, width: '160px', height: '600px' },
  'bottom-left': { bottom: 0, left: 0, width: '728px', height: '90px' },
  'bottom-right': { bottom: 0, right: 0, width: '300px', height: '250px' },
}

export default function AdSlot({ position }) {
  const style = positions[position]
  if (!style) return null

  return (
    <div
      id={`adsense-${position}`}
      className="adsense-slot pointer-events-none"
      style={{ position: 'fixed', zIndex: 10, ...style }}
    >
      {/* Cole aqui o script do Google AdSense */}
    </div>
  )
}
