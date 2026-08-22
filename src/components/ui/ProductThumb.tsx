import clsx from 'clsx'

interface ProductThumbProps {
  emoji: string
  accent: string
  size?: number
  className?: string
}

/** Ürün görseli placeholder'ı — marka renginde gradyan + emoji. */
export function ProductThumb({ emoji, accent, size = 48, className }: ProductThumbProps) {
  return (
    <span
      className={clsx('flex flex-none items-center justify-center rounded-2xl', className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.5,
        background: `linear-gradient(150deg, ${accent}22, ${accent}44)`,
        border: `1px solid ${accent}33`,
      }}
    >
      {emoji}
    </span>
  )
}
