import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  detail?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, detail, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[22px] border border-dashed border-line bg-white/60 px-6 py-14 text-center">
      {icon && (
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-700/8 text-navy-700">
          {icon}
        </span>
      )}
      <p className="font-display text-[17px] font-semibold text-navy-700">{title}</p>
      {detail && <p className="mt-1 max-w-sm text-[14px] text-muted">{detail}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
