import React, { useEffect, useRef } from 'react'

export default function AdSlot({ className = '' }) {
  const adRef = useRef(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    try {
      if (adRef.current && window.adsbygoogle) {
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
        pushed.current = true
      }
    } catch (e) {
      // adsbygoogle not available (e.g. ad blocker)
    }
  }, [])

  return (
    <div className={`ad-container my-6 flex justify-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-4861547568821741"
        data-ad-slot="6240002763"
        data-ad-format="auto"
        data-full-width-responsive="true"
        ref={adRef}
      />
    </div>
  )
}
