import { useState } from 'react'
import clsx from 'clsx'

interface LogoProps {
  size?: number
  showWord?: boolean
  className?: string
  wordClassName?: string
}

/** SnaphAI amblemi. /logo.png yüklenirse onu, yoksa SVG amblemi gösterir. */
export function Logo({ size = 40, showWord = true, className, wordClassName }: LogoProps) {
  const [imgOk, setImgOk] = useState(true)
  return (
    <span className={clsx('inline-flex items-center gap-3', className)}>
      <span
        className="relative flex-none overflow-hidden rounded-full"
        style={{ width: size, height: size }}
      >
        {imgOk ? (
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="SnaphAI"
            width={size}
            height={size}
            className="h-full w-full object-contain"
            style={{ transform: 'scale(1.55)' }}
            onError={() => setImgOk(false)}
          />
        ) : (
          <svg viewBox="0 0 120 120" fill="none" className="h-full w-full" aria-hidden>
            <circle cx="60" cy="60" r="55" stroke="#c9a24b" strokeWidth="3" />
            <path
              d="M78 46 C78 33 46 31 46 45 C46 57 78 58 78 74 C78 89 44 89 44 74"
              stroke="#0f2447"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
            />
            <g stroke="#c9a24b" strokeWidth="2.6" strokeLinecap="round">
              <line x1="70" y1="34" x2="63" y2="20" />
              <line x1="76" y1="34" x2="76" y2="16" />
              <line x1="82" y1="34" x2="89" y2="20" />
            </g>
            <g fill="#c9a24b">
              <circle cx="62.5" cy="19" r="3" />
              <circle cx="76" cy="14.5" r="3" />
              <circle cx="89.5" cy="19" r="3" />
            </g>
          </svg>
        )}
      </span>
      {showWord && (
        <span
          className={clsx(
            'font-display text-[22px] font-bold tracking-tight text-navy-700',
            wordClassName,
          )}
        >
          Snaph<span className="text-gold-600">AI</span>
        </span>
      )}
    </span>
  )
}
