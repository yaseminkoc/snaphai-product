import { useState } from 'react'
import clsx from 'clsx'

interface MascotProps {
  size?: number
  className?: string
  glow?: boolean
  float?: boolean
}

/** SnaphAI maskotu (parlayan küre). /mascot.png yüklenemezse zarifçe gizlenir. */
export function Mascot({ size = 120, className, glow = false, float = false }: MascotProps) {
  const [ok, setOk] = useState(true)
  if (!ok) return null
  return (
    <span
      className={clsx('relative inline-flex flex-none items-center justify-center', float && 'animate-float', className)}
      style={{ width: size, height: size }}
    >
      {glow && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ background: 'radial-gradient(circle, rgba(201,162,75,0.55), transparent 70%)' }}
        />
      )}
      <img
        src={`${import.meta.env.BASE_URL}mascot.png`}
        alt="SnaphAI maskotu"
        className="relative h-full w-full object-contain drop-shadow-[0_10px_30px_rgba(201,162,75,0.35)]"
        onError={() => setOk(false)}
      />
    </span>
  )
}
