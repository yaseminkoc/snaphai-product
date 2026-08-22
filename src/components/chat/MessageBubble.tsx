import clsx from 'clsx'
import { Play, Pause, Tag, CreditCard, Check, ShieldCheck } from 'lucide-react'
import type { Message, Product } from '@/types'
import { formatTRY, formatTime, formatDuration } from '@/lib/format'
import { ProductThumb } from '@/components/ui'

interface MessageBubbleProps {
  message: Message
  align: 'left' | 'right' | 'center'
  product?: Product
  isPlaying?: boolean
  onPlayVoice?: (m: Message) => void
  onPay?: (m: Message) => void
}

/** Hem müşteri demosunda hem esnaf gelen kutusunda kullanılan ortak mesaj balonu. */
export function MessageBubble({
  message,
  align,
  product,
  isPlaying,
  onPlayVoice,
  onPay,
}: MessageBubbleProps) {
  const m = message

  if (m.role === 'system') {
    return (
      <div className="my-1 flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-700/8 px-3 py-1 text-[12px] font-semibold text-navy-700">
          <ShieldCheck size={13} /> {m.text}
        </span>
      </div>
    )
  }

  const right = align === 'right'

  return (
    <div className={clsx('flex w-full', right ? 'justify-end' : 'justify-start')}>
      <div className={clsx('max-w-[82%] sm:max-w-[70%]', right ? 'items-end' : 'items-start')}>
        <div
          className={clsx(
            'rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed shadow-sm',
            right
              ? 'rounded-br-md bg-navy-700 text-white'
              : 'rounded-bl-md border border-line bg-white text-ink',
          )}
        >
          {/* Metin */}
          {m.type === 'text' && <p className="whitespace-pre-wrap">{m.text}</p>}

          {/* Sesli mesaj */}
          {m.type === 'voice' && (
            <div className="min-w-[210px]">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => onPlayVoice?.(m)}
                  className={clsx(
                    'flex h-9 w-9 flex-none items-center justify-center rounded-full transition-colors',
                    right ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-navy-700 text-white hover:bg-navy-600',
                  )}
                  aria-label="Sesli mesajı oynat"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                </button>
                <div className="flex flex-1 items-center gap-[3px]">
                  {Array.from({ length: 22 }).map((_, i) => (
                    <span
                      key={i}
                      className={clsx('w-[3px] rounded-full', right ? 'bg-white/55' : 'bg-navy-700/40')}
                      style={{
                        height: `${6 + ((i * 7) % 16)}px`,
                        opacity: isPlaying ? 1 : 0.7,
                        transition: 'opacity .2s',
                      }}
                    />
                  ))}
                </div>
                <span className={clsx('text-[12px] font-semibold', right ? 'text-white/80' : 'text-muted')}>
                  {formatDuration(m.audioDurationSec ?? 6)}
                </span>
              </div>
              {m.transcript && (
                <p className={clsx('mt-2 border-t pt-2 text-[13px] italic', right ? 'border-white/20 text-white/85' : 'border-line text-muted')}>
                  “{m.transcript}”
                </p>
              )}
            </div>
          )}

          {/* İndirim çipi */}
          {m.type === 'discount' && (
            <div className="flex items-center gap-2">
              <Tag size={16} className={right ? 'text-gold-300' : 'text-gold-600'} />
              <span className="font-semibold">{m.text}</span>
              {m.amount != null && <span className="font-bold">· {formatTRY(m.amount)}</span>}
            </div>
          )}

          {/* Ürün kartı */}
          {m.type === 'product-card' && product && (
            <div className="flex items-center gap-3">
              <ProductThumb emoji={product.emoji} accent={product.accent} size={44} />
              <div>
                <p className="font-semibold leading-tight">{product.name}</p>
                <p className={clsx('text-[13px]', right ? 'text-white/80' : 'text-muted')}>
                  {formatTRY(product.price)}
                </p>
              </div>
            </div>
          )}

          {/* Ödeme linki */}
          {m.type === 'payment-link' && (
            <div className="min-w-[230px]">
              <p className={clsx('mb-2', right ? 'text-white' : 'text-ink')}>{m.text}</p>
              <div
                className={clsx(
                  'rounded-xl p-3',
                  right ? 'bg-white/12' : 'bg-cream-2 border border-line',
                )}
              >
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className={right ? 'text-gold-300' : 'text-gold-600'} />
                  <span className={clsx('text-[12px] font-semibold uppercase tracking-wide', right ? 'text-white/70' : 'text-muted')}>
                    Güvenli Ödeme
                  </span>
                </div>
                <p className="mt-1 font-display text-[22px] font-semibold">
                  {m.amount != null ? formatTRY(m.amount) : ''}
                </p>
                {m.paid ? (
                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1.5 text-[13px] font-bold text-white">
                    <Check size={14} /> Ödeme tamamlandı
                  </span>
                ) : onPay ? (
                  <button
                    onClick={() => onPay(m)}
                    className="mt-2 w-full rounded-full bg-gold-grad px-4 py-2 text-[13px] font-bold text-navy-900 transition-transform hover:-translate-y-0.5"
                  >
                    Ödemeyi Tamamla
                  </button>
                ) : (
                  <span className={clsx('mt-1 block text-[12px]', right ? 'text-white/70' : 'text-muted')}>
                    Bağlantı müşteriye gönderildi
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <span
          className={clsx(
            'mt-1 block px-1 text-[11px] text-muted',
            right ? 'text-right' : 'text-left',
          )}
        >
          {formatTime(m.createdAt)}
        </span>
      </div>
    </div>
  )
}
