import type { ReactNode } from 'react'
import clsx from 'clsx'
import type { LabelStyle } from '@/lib/labels'

interface BadgeProps {
  children?: ReactNode
  style?: LabelStyle
  cls?: string
  dot?: string
  className?: string
}

/** Durum rozeti. `style` (labels.ts eşlemesi) verirsen etiket+renk+nokta otomatik. */
export function Badge({ children, style, cls, dot, className }: BadgeProps) {
  const classes = style?.cls ?? cls ?? 'bg-navy-700/10 text-navy-700'
  const dotColor = dot ?? style?.dot
  const content = children ?? style?.label
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold',
        classes,
        className,
      )}
    >
      {dotColor && (
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: dotColor }} />
      )}
      {content}
    </span>
  )
}
