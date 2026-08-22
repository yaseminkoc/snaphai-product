import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Sparkles,
  Send,
  MessagesSquare,
  Inbox,
  Hand,
} from 'lucide-react'
import type { Conversation, Message, Product } from '@/types'
import { useStore } from '@/store/useStore'
import { formatTRY, timeAgo } from '@/lib/format'
import { conversationStatusMap, stanceMap } from '@/lib/labels'
import { speak, cancelSpeech, speechSupported } from '@/lib/voice'
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  PageHeader,
  ProductThumb,
} from '@/components/ui'
import { MessageBubble } from '@/components/chat/MessageBubble'

/** Bir sohbetin son mesajının kısa önizlemesi. */
function previewOf(conv: Conversation): string {
  const last = conv.messages[conv.messages.length - 1]
  if (!last) return 'Henüz mesaj yok'
  if (last.type === 'voice') return '🎤 Sesli mesaj'
  if (last.type === 'payment-link') return '💳 Ödeme linki'
  if (last.type === 'product-card') return '🛍️ Ürün paylaşıldı'
  if (last.type === 'discount') return '🏷️ İndirim teklifi'
  const prefix = last.role === 'customer' ? '' : 'Yapay zeka: '
  return prefix + (last.text || '…')
}

export function Conversations() {
  const conversations = useStore((s) => s.conversations)
  const products = useStore((s) => s.products)
  const markRead = useStore((s) => s.markRead)
  const appendManualReply = useStore((s) => s.appendManualReply)

  const { id } = useParams()
  const navigate = useNavigate()

  const [playingId, setPlayingId] = useState<string | null>(null)
  const [takeOver, setTakeOver] = useState(false)
  const [draft, setDraft] = useState('')

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)

  const findProduct = (pid?: string): Product | undefined =>
    pid ? products.find((p) => p.id === pid) : undefined

  const activeId = id ?? conversations[0]?.id
  const active = conversations.find((c) => c.id === activeId)

  // Aktif sohbet seçildiğinde okunmuş işaretle.
  useEffect(() => {
    if (activeId) markRead(activeId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId])

  // Yeni mesaj gelince en alta kaydır.
  const messageCount = active?.messages.length ?? 0
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messageCount, activeId])

  // Ekrandan çıkınca konuşan sesi durdur.
  useEffect(() => {
    return () => cancelSpeech()
  }, [])

  function openConversation(convId: string) {
    if (playingId) {
      cancelSpeech()
      setPlayingId(null)
    }
    navigate('/app/sohbetler/' + convId)
    markRead(convId)
  }

  function handlePlayVoice(m: Message) {
    if (!speechSupported()) return
    if (playingId === m.id) {
      cancelSpeech()
      setPlayingId(null)
      return
    }
    cancelSpeech()
    const text = m.transcript || m.text
    if (!text) return
    setPlayingId(m.id)
    speak(text, {
      onEnd: () => setPlayingId(null),
    })
  }

  function handleSend() {
    const text = draft.trim()
    if (!text || !activeId) return
    appendManualReply(activeId, text)
    setDraft('')
  }

  if (conversations.length === 0) {
    return (
      <>
        <PageHeader
          eyebrow="Gelen Kutusu"
          title="Sohbetler"
          subtitle="Yapay zeka çalışanınızın müşterilerinizle yürüttüğü tüm görüşmeler burada toplanır."
        />
        <EmptyState
          icon={<Inbox size={22} />}
          title="Henüz sohbet yok"
          detail="Mağazanıza yeni bir mesaj geldiğinde görüşme otomatik olarak burada listelenir."
        />
      </>
    )
  }

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0)

  return (
    <>
      <PageHeader
        eyebrow="Gelen Kutusu"
        title="Sohbetler"
        subtitle="Yapay zeka çalışanınızın yürüttüğü görüşmeleri izleyin, dilediğinizde devralın."
        actions={
          totalUnread > 0 ? (
            <Badge cls="bg-gold-grad text-navy-900">
              {totalUnread} okunmamış
            </Badge>
          ) : undefined
        }
      />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* SOL LİSTE */}
        <aside
          className={
            'flex-col gap-2 ' + (active ? 'hidden lg:flex' : 'flex')
          }
        >
          <div className="flex flex-col gap-2 overflow-y-auto rounded-[22px] border border-line bg-white p-2 shadow-card lg:max-h-[calc(100vh-220px)]">
            {conversations.map((c) => {
              const isActive = c.id === activeId
              return (
                <button
                  key={c.id}
                  onClick={() => openConversation(c.id)}
                  className={
                    'w-full rounded-2xl px-3 py-3 text-left transition-colors ' +
                    (isActive
                      ? 'bg-navy-700 text-white'
                      : 'hover:bg-navy-700/5 text-ink')
                  }
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      initials={c.customer.avatarInitials}
                      size={40}
                      tone={isActive ? 'gold' : 'soft'}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[14px] font-bold">
                          {c.customer.name}
                        </span>
                        <span
                          className={
                            'flex-none text-[11px] ' +
                            (isActive ? 'text-white/70' : 'text-muted')
                          }
                        >
                          {timeAgo(c.lastActivity)}
                        </span>
                      </div>
                      <span
                        className={
                          'block truncate text-[12px] ' +
                          (isActive ? 'text-white/70' : 'text-muted')
                        }
                      >
                        {c.customer.handle}
                      </span>
                      <p
                        className={
                          'mt-1 truncate text-[13px] ' +
                          (isActive ? 'text-white/85' : 'text-ink-soft')
                        }
                      >
                        {previewOf(c)}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Badge style={conversationStatusMap[c.status]} />
                        <Badge style={stanceMap[c.customer.stance]} />
                        {c.unread > 0 && (
                          <span className="ml-auto h-2.5 w-2.5 flex-none rounded-full bg-gold-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        {/* SAĞ THREAD */}
        <section className={active ? 'flex' : 'hidden lg:flex'}>
          {active ? (
            <div className="flex w-full flex-col overflow-hidden rounded-[22px] border border-line bg-cream-2 shadow-card lg:h-[calc(100vh-220px)]">
              {/* Başlık şeridi */}
              <div className="flex-none border-b border-line bg-white px-4 py-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate('/app/sohbetler')}
                    className="flex-none rounded-full p-1.5 text-navy-700 hover:bg-navy-700/5 lg:hidden"
                    aria-label="Sohbet listesine dön"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <Avatar
                    initials={active.customer.avatarInitials}
                    size={42}
                    tone="soft"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-display text-[16px] font-semibold text-navy-700">
                        {active.customer.name}
                      </span>
                      <Badge style={stanceMap[active.customer.stance]} />
                    </div>
                    <span className="block truncate text-[12px] text-muted">
                      {active.customer.handle}
                    </span>
                  </div>
                  <Badge style={conversationStatusMap[active.status]} />
                </div>

                {/* Niyet + bağlı ürün */}
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-muted">
                  <span>
                    Niyet:{' '}
                    <span className="font-semibold text-ink-soft">
                      {active.intent}
                    </span>
                  </span>
                  {(() => {
                    const linked = findProduct(active.linkedProductId)
                    if (!linked) return null
                    return (
                      <span className="flex items-center gap-2">
                        <ProductThumb
                          emoji={linked.emoji}
                          accent={linked.accent}
                          size={26}
                        />
                        <span className="font-semibold text-ink-soft">
                          {linked.name}
                        </span>
                        <span className="text-gold-600">
                          {formatTRY(linked.price)}
                        </span>
                      </span>
                    )
                  })()}
                </div>
              </div>

              {/* Mesaj alanı */}
              <div
                ref={scrollRef}
                className="flex-1 space-y-2 overflow-y-auto px-4 py-4"
              >
                {active.messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-center text-[13px] text-muted">
                    Bu görüşmede henüz mesaj bulunmuyor.
                  </div>
                ) : (
                  active.messages.map((m) => (
                    <MessageBubble
                      key={m.id}
                      message={m}
                      align={
                        m.role === 'ai'
                          ? 'right'
                          : m.role === 'system'
                            ? 'center'
                            : 'left'
                      }
                      product={findProduct(m.productId)}
                      isPlaying={playingId === m.id}
                      onPlayVoice={handlePlayVoice}
                    />
                  ))
                )}
                <div ref={endRef} />
              </div>

              {/* Composer */}
              <div className="flex-none border-t border-line bg-white px-4 py-3">
                <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-700/8 px-3 py-1 text-[12px] font-semibold text-navy-700">
                    <Sparkles size={13} />
                    Yapay zeka çalışanınız otomatik yanıtlıyor
                  </span>
                  <Button
                    variant={takeOver ? 'gold' : 'soft'}
                    size="sm"
                    onClick={() => setTakeOver((v) => !v)}
                  >
                    <Hand size={15} />
                    {takeOver ? 'Devraldınız' : 'Devral'}
                  </Button>
                </div>

                <div className="flex items-end gap-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    disabled={!takeOver}
                    rows={1}
                    placeholder={
                      takeOver
                        ? 'Mağazanız adına yanıt yazın…'
                        : 'Yapay zeka otonom yanıtlıyor'
                    }
                    className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-line bg-cream-2 px-4 py-3 text-[14px] text-ink outline-none transition-colors placeholder:text-muted focus:border-navy-700/40 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <Button
                    variant="navy"
                    size="md"
                    onClick={handleSend}
                    disabled={!takeOver || draft.trim().length === 0}
                    aria-label="Yanıtı gönder"
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <EmptyState
                icon={<MessagesSquare size={22} />}
                title="Bir sohbet seçin"
                detail="Görüntülemek istediğiniz görüşmeyi soldaki listeden seçebilirsiniz."
              />
            </div>
          )}
        </section>
      </div>
    </>
  )
}
