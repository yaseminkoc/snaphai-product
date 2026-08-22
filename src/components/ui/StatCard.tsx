import type { ReactNode } from 'react'
import clsx from 'clsx'

interface StatCardProps {
  label: string
  value: ReactNode
  icon?: ReactNode
  delta?: string
  deltaTone?: 'up' | 'down' | 'flat'
  hint?: string
  className?: string
}

export function StatCard({
  label,
  value,
  icon,
  delta,
  deltaTone = 'up',
  hint,
  className,
}: StatCardProps) {
  return (
    <div
      className={clsx(
        'rounded-[20px] border border-line bg-white p-5 shadow-card transition-shadow hover:shadow-md',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-muted">{label}</span>
        {icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-700/8 text-navy-700">
            {icon}
          </span>
        )}
      </div>
      <div className="mt-3 font-display text-[28px] font-semibold leading-none text-navy-700">
        {value}
      </div>
      <div className="mt-2 flex items-center gap-2">
        {delta && (
          <span
            className={clsx(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold',
              deltaTone === 'up' && 'bg-emerald-50 text-emerald-700',
              deltaTone === 'down' && 'bg-rose-50 text-rose-600',
              deltaTone === 'flat' && 'bg-slate-100 text-slate-500',
            )}
          >
            {deltaTone === 'up' ? '↑' : deltaTone === 'down' ? '↓' : '→'} {delta}
          </span>
        )}
        {hint && <span className="text-[12px] text-muted">{hint}</span>}
      </div>
    </div>
  )
}
