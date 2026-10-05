import { useState } from 'react'
import { cn } from '../../utils/helpers'

export function Accordion({ items, className = '' }) {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div className={cn('accordion', className)}>
      {items.map((item, index) => (
        <div key={index} className={cn('accordion-item', openIndex === index && 'accordion-item-open')}>
          <button
            className="accordion-trigger"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <span className="accordion-title">{item.title}</span>
            <span className={cn('accordion-chevron', openIndex === index && 'accordion-chevron-open')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </button>
          <div className="accordion-content">
            {item.content}
          </div>
        </div>
      ))}
    </div>
  )
}
