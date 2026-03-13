import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function FAQSection({ faqs }) {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section aria-label="Perguntas frequentes" className="mt-12">
      <h2 className="mb-6 font-display text-2xl font-bold text-white">Perguntas Frequentes</h2>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-surface overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-white hover:bg-card transition-colors"
            >
              <span>{faq.q}</span>
              <ChevronDown
                className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${
                  openIndex === i ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openIndex === i && (
              <div className="px-5 pb-4 text-sm leading-relaxed text-gray-400">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
