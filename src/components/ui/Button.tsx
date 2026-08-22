import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type Variant = 'gold' | 'navy' | 'outline' | 'ghost' | 'soft'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  block?: boolean
}

const variants: Record<Variant, string> = {
  gold: 'text-navy-900 bg-gold-grad shadow-gold hover:-translate-y-0.5',
  navy: 'bg-navy-700 text-white hover:bg-navy-600',
  outline: 'border-[1.6px] border-navy-700 text-navy-700 bg-transparent hover:bg-navy-700 hover:text-white',
  ghost: 'text-navy-700 hover:bg-navy-700/5',
  soft: 'bg-navy-700/8 text-navy-700 hover:bg-navy-700/14',
}

const sizes: Record<Size, string> = {
  sm: 'px-3.5 py-2 text-[13px]',
  md: 'px-5 py-2.5 text-[14px]',
  lg: 'px-6 py-3.5 text-[15px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'navy', size = 'md', block, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-full font-bold tracking-tight transition-all duration-200 ease-brand focus-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0',
        variants[variant],
        sizes[size],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
})
