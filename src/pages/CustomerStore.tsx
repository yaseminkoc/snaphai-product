import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { ArrowLeft, Send, Mic, Sparkles } from 'lucide-react'
import type { Customer, Message, Product } from '@/types'
import { useStore } from '@/store/useStore'
import { formatTRY } from '@/lib/format'
import {
  speak,
  cancelSpeech,
  recognitionSupported,
  startRecognition,
} from '@/lib/voice'
import { Avatar, Button, Mascot } from '@/components/ui'
import { MessageBubble } from '@/components/chat/MessageBubble'

/** Demo boyunca müşteri rolünü üstlenen sabit ziyaretçi. */
const demoCustomer: Customer = {
  id: 'cust_demo',
  name: 'Ziyaretçi',
  handle: '@siz',
  avatarInitials: 'SZ',
  stance: 'kararsiz',
  isReturning: false,
}

/** Sohbeti tek tıkla ilerleten hazır yanıt çipleri. */
const quickReplies: string[] = [
  'Fiyatı nedir?',
  'Biraz pahalı, indirim olur mu?',
  '950 olur mu?',
  'Öğrenciyim',
  'Bedeni var mı?',
  'Tamam, alıyorum',
]

interface Recognizer {
  stop: () => void
}

export function CustomerStore() {
  const navigate = useNavigate()

  // Store — her alan için ayrı selector (sonsuz render'ı önler).
  const store = useStore((s) => s.store)
  const products = useStore((s) => s.products)
  const conversations = useStore((s) => s.conversations)
  const orders = useStore((s) => s.orders)
  const settings = useStore((s) => s.settings)
  const startConversation = useStore((s) => s.startConversation)
  const sendCustomerMessage = useStore((s) => s.sendCustomerMessage)
  const setConversationProduct = useStore((s) => s.setConversationProduct)
  const payOrder = useStore((s) => s.payOrder)

  const [convId, setConvId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [listening, setListening] = useState(false)

  const startedRef = useRef(false)
  const recognizerRef = useRef<Recognizer | null>(null)
  const threadEndRef = useRef<HTMLDivElement | null>(null)
  const lastSpokenRef = useRef<string | null>(null)

  const sttAvailable = recognitionSupported()

  // Mount'ta tek sefer sohbet oluştur (StrictMode çift çağrısına karşı ref guard).
  useEffect(() => {
    if (startedRef.current) return
    if (products.length === 0) return
    startedRef.current = true
    const id = startConversation(demoCustomer, products[0].id)
    setConvId(id)
  }, [products, startConversation])

  // Ayrılırken sesi durdur.
  useEffect(() => {
    return () => {
      cancelSpeech()
      recognizerRef.current?.stop()
    }
  }, [])

  const activeConv = conversations.find((c) => c.id === convId)
  const messages = activeConv?.messages ?? []
  const selectedProductId = activeConv?.linkedProductId

  // Yeni mesaj geldikçe en alta kaydır.
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length])

  // AI sesli yanıtını otomatik oynat (son mesaj ai + voice ise).
  useEffect(() => {
    if (messages.length === 0) return
    const last = messages[messages.length - 1]
    if (last.role !== 'ai' || last.type !== 'voice') return
    if (lastSpokenRef.current === last.id) return
    lastSpokenRef.current = last.id
    const text = last.transcript || last.text
    if (!text) return
    setPlayingId(last.id)
    speak(text, {
      onEnd: () => setPlayingId((p) => (p === last.id ? null : p)),
    })
  }, [messages])

  const productById = (id?: string): Product | undefined =>
    id ? products.find((p) => p.id === id) : undefined

  function handleSelectProduct(p: Product) {
    if (!convId) return
    setConversationProduct(convId, p.id)
    sendCustomerMessage(convId, { text: `${p.name} hakkında bilgi alabilir miyim?` })
  }

  function handleSend(text: string) {
    if (!convId) return
    const trimmed = text.trim()
    if (!trimmed) return
    sendCustomerMessage(convId, { text: trimmed })
    setDraft('')
  }

  function handlePlayVoice(m: Message) {
    const text = m.transcript || m.text
    if (!text) return
    if (playingId === m.id) {
      cancelSpeech()
      setPlayingId(null)
      return
    }
    setPlayingId(m.id)
    speak(text, {
      onEnd: () => setPlayingId((p) => (p === m.id ? null : p)),
    })
  }

  function handlePay() {
    if (!convId) return
    const pending = orders.find(
      (o) => o.status === 'pending' && o.customerHandle === demoCustomer.handle,
    )
    if (pending) {
      payOrder(pending.id, convId)
    }
  }

  function toggleMic() {
    if (!sttAvailable || !convId) return
    if (listening) {
      recognizerRef.current?.stop()
      return
    }
    setListening(true)
    const recognizer = startRecognition({
      onResult: (transcript, isFinal) => {
        if (isFinal && transcript.trim()) {
          sendCustomerMessage(convId, {
            transcript: transcript.trim(),
            isVoice: true,
            audioDurationSec: Math.max(3, Math.round(transcript.length / 12)),
          })
        }
      },
      onEnd: () => {
        setListening(false)
        recognizerRef.current = null
      },
      onError: () => {
        setListening(false)
        recognizerRef.current = null
      },
    })
    if (recognizer) {
      recognizerRef.current = recognizer
    } else {
      setListening(false)
    }
  }

  if (!convId || !activeConv) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-2 text-muted">
        <div className="flex items-center gap-2 text-[15px]">
          <Sparkles size={18} className="text-gold-600" />
          Deneyim hazırlanıyor…
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream-2">
      {/* Üst bar */}
      <header className="sticky top-0 z-20 border-b border-line bg-ivory/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-3">
          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault()
              navigate('/')
            }}
            className="flex flex-none items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] font-semibold text-navy-700 transition-colors hover:bg-navy-700/8"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Panele dön</span>
          </Link>

          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <Avatar initials={store.avatarInitials} tone="navy" size={40} />
            <div className="min-w-0">
              <p className="truncate font-semibold leading-tight text-ink">{store.name}</p>
              <div className="flex items-center gap-1.5 text-[12px] text-muted">
                <span className="relative flex h-2 w-2 flex-none">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="truncate">SnaphAI ile yanıtlıyor</span>
              </div>
            </div>
          </div>

          <span className="flex-none rounded-full bg-gold-grad px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-navy-900">
            Demo
          </span>
        </div>

        {/* Ürün şeridi */}
        <div className="border-t border-line/70">
          <div className="no-scrollbar mx-auto flex w-full max-w-2xl gap-2 overflow-x-auto px-4 py-2.5">
            {products.map((p) => {
              const active = p.id === selectedProductId
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectProduct(p)}
                  className={clsx(
                    'flex flex-none items-center gap-2 rounded-full border px-2.5 py-1.5 text-left transition-all',
                    active
                      ? 'border-gold-500 bg-gold-500/12 shadow-gold'
                      : 'border-line bg-white hover:border-gold-400',
                  )}
                >
                  <span
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-[16px]"
                    style={{
                      background: `linear-gradient(150deg, ${p.accent}22, ${p.accent}44)`,
                    }}
                  >
                    {p.emoji}
                  </span>
                  <span className="min-w-0">
                    <span className="block max-w-[130px] truncate text-[12px] font-semibold text-ink">
                      {p.name}
                    </span>
                    <span className="block text-[11px] font-semibold text-gold-text">
                      {formatTRY(p.price)}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Mesaj thread'i */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-2.5 px-4 py-5">
          {messages.length === 0 ? (
            <div className="mx-auto mt-14 max-w-sm rounded-[22px] border border-line bg-white/70 px-6 py-8 text-center shadow-card">
              <Mascot size={96} glow float className="mx-auto mb-3" />
              <p className="font-display text-[18px] font-semibold text-ink">
                Yapay zeka çalışanınız hazır
              </p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted">
                Bir ürün seçin veya yazın; yapay zeka çalışanı hemen yanıtlasın.
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                align={m.role === 'customer' ? 'right' : m.role === 'ai' ? 'left' : 'center'}
                product={productById(m.productId)}
                isPlaying={playingId === m.id}
                onPlayVoice={handlePlayVoice}
                onPay={handlePay}
              />
            ))
          )}
          <div ref={threadEndRef} />
        </div>
      </main>

      {/* Composer alanı */}
      <div className="sticky bottom-0 z-10 border-t border-line bg-ivory/95 backdrop-blur">
        <div className="mx-auto w-full max-w-2xl px-4 pb-3 pt-2.5">
          {/* Hızlı yanıt çipleri */}
          <div className="no-scrollbar -mx-1 mb-2.5 flex gap-2 overflow-x-auto px-1">
            {quickReplies.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="flex-none rounded-full border border-line bg-white px-3 py-1.5 text-[12.5px] font-semibold text-navy-700 transition-colors hover:border-gold-400 hover:bg-gold-500/10"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Giriş satırı */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend(draft)
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleMic}
              disabled={!sttAvailable}
              title={
                sttAvailable
                  ? 'Sesli mesaj gönderin'
                  : 'Tarayıcınız sesli mesajı desteklemiyor'
              }
              className={clsx(
                'flex h-11 w-11 flex-none items-center justify-center rounded-full border transition-all',
                listening
                  ? 'animate-pulse border-transparent bg-red-500 text-white'
                  : 'border-line bg-white text-navy-700 hover:border-gold-400',
                !sttAvailable && 'cursor-not-allowed opacity-45',
              )}
              aria-label="Sesli mesaj"
            >
              <Mic size={18} />
            </button>

            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Bir mesaj yazın…"
              className="h-11 min-w-0 flex-1 rounded-full border border-line bg-white px-4 text-[14px] text-ink outline-none transition-colors placeholder:text-muted focus:border-gold-400"
            />

            <Button
              type="submit"
              variant="gold"
              disabled={!draft.trim()}
              className="!h-11 !w-11 !p-0"
              aria-label="Gönder"
            >
              <Send size={18} />
            </Button>
          </form>

          {!settings.voiceReplies && (
            <p className="mt-1.5 text-center text-[11px] text-muted">
              Sesli yanıtlar ayarlardan kapalı — yanıtlar metin olarak gelir.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
