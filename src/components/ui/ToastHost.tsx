import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'
import { useStore } from '@/store/useStore'

const icons = {
  success: <CheckCircle2 size={18} className="text-emerald-600" />,
  info: <Info size={18} className="text-sky-600" />,
  warn: <AlertTriangle size={18} className="text-amber-600" />,
}

/** Sağ altta beliren bildirimler. Store'daki toasts'ı okur. */
export function ToastHost() {
  const toasts = useStore((s) => s.toasts)
  const dismiss = useStore((s) => s.dismissToast)

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[200] flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-2.5">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-line bg-white p-4 shadow-md animate-fade-up"
        >
          <span className="mt-0.5">{icons[t.tone]}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold text-navy-700">{t.title}</p>
            {t.detail && <p className="mt-0.5 text-[13px] text-muted">{t.detail}</p>}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="text-muted transition-colors hover:text-navy-700"
            aria-label="Kapat"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
