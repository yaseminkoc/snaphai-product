import { useEffect, useRef, useState } from 'react'
import {
  AudioLines,
  Mic,
  Power,
  Hand,
  TrendingUp,
  ShoppingBag,
  MessageSquare,
  Volume2,
  UserPlus,
  Target,
  Sparkles,
  Star,
  Play,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatTRY, formatNumber, formatDate, pct } from '@/lib/format'
import { PageHeader, Card, CardHeader, StatCard, Button } from '@/components/ui'
import {
  speak,
  cancelSpeech,
  speechSupported,
  recognitionSupported,
  startRecognition,
} from '@/lib/voice'
import { startClapListener, type ClapListener } from '@/lib/clap'

interface Recognizer {
  stop: () => void
}

/** Yazıyor gibi kademeli beliren metin (animasyonlu yanıt). */
function Typewriter({ text }: { text: string }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    setN(0)
    if (!text) return
    let i = 0
    const id = window.setInterval(() => {
      i += 2
      setN(i)
      if (i >= text.length) window.clearInterval(id)
    }, 24)
    return () => window.clearInterval(id)
  }, [text])
  return (
    <>
      {text.slice(0, n)}
      {n < text.length && <span className="animate-pulse">▍</span>}
    </>
  )
}

export function VoiceReport() {
  const computeReport = useStore((s) => s.computeReport)
  const [report] = useState(() => computeReport())

  const [active, setActive] = useState(false) // Lumi dinleme modu
  const [speaking, setSpeaking] = useState(false)
  const [awake, setAwake] = useState(false) // alkış sonrası uyanık
  const [heard, setHeard] = useState('')
  const [answer, setAnswer] = useState('')
  const [note, setNote] = useState('')

  const activeRef = useRef(false)
  const speakingRef = useRef(false)
  const awakeRef = useRef(false)
  const recRef = useRef<Recognizer | null>(null)
  const clapRef = useRef<ClapListener | null>(null)
  const awakeTimer = useRef<number | null>(null)

  const canSpeak = speechSupported()
  const canListen = recognitionSupported()

  useEffect(() => {
    return () => stopLumi()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function answerFor(text: string): string {
    const q = text.toLocaleLowerCase('tr-TR')
    if (q.includes('ciro') || q.includes('kazan') || q.includes('gelir')) {
      return `Bugünün cirosu ${formatTRY(report.revenue)}.`
    }
    if (q.includes('sipariş') || q.includes('satış') || q.includes('satis')) {
      return `Bugün ${formatNumber(report.orderCount)} sipariş tamamlandı.`
    }
    if (q.includes('stok')) {
      return `En çok ilgi gören ürününüz ${report.topProductName}. Yeniden tedarik gereken kalemleri Stok ekranından takip edebilirsiniz.`
    }
    if (q.includes('mesaj') || q.includes('müşteri') || q.includes('musteri')) {
      return `Bugün ${formatNumber(report.messagesHandled)} mesaj yanıtlandı ve ${formatNumber(report.newCustomers)} yeni müşteri kazanıldı.`
    }
    return report.narrative
  }

  function speakOut(text: string, afterEnd?: () => void) {
    speakingRef.current = true
    setSpeaking(true)
    speak(text, {
      onEnd: () => {
        speakingRef.current = false
        setSpeaking(false)
        afterEnd?.()
      },
    })
  }

  function respond(text: string) {
    const a = answerFor(text)
    setHeard(text)
    setAnswer(a)
    // Konuşurken dinlemeyi durdur (Lumi kendi sesini duymasın).
    recRef.current?.stop()
    recRef.current = null
    awakeRef.current = false
    setAwake(false)
    speakOut(a, () => {
      if (activeRef.current) startRec()
    })
  }

  function handleFinal(t: string) {
    const low = t.toLocaleLowerCase('tr-TR')
    // "Lumi" dendiyse ya da yeni alkışlanıp uyanıksa komutu işле.
    if (low.includes('lumi') || low.includes('lümi') || awakeRef.current) {
      respond(t)
    }
  }

  function startRec() {
    if (!recognitionSupported()) return
    const rec = startRecognition({
      onResult: (t, isFinal) => {
        setHeard(t)
        if (isFinal) handleFinal(t)
      },
      onEnd: () => {
        recRef.current = null
        if (activeRef.current && !speakingRef.current) startRec()
      },
      onError: (err) => {
        recRef.current = null
        if (err === 'not-allowed' || err === 'service-not-allowed') {
          setNote('Mikrofon izni verilmedi. Tarayıcı ayarlarından izin verip tekrar deneyin.')
          stopLumi()
          return
        }
        if (activeRef.current && !speakingRef.current) window.setTimeout(startRec, 500)
      },
    })
    recRef.current = rec
  }

  function onClap() {
    awakeRef.current = true
    setAwake(true)
    if (awakeTimer.current) window.clearTimeout(awakeTimer.current)
    awakeTimer.current = window.setTimeout(() => {
      awakeRef.current = false
      setAwake(false)
    }, 7000)
    if (activeRef.current && !speakingRef.current && !recRef.current) startRec()
  }

  async function startLumi() {
    setNote('')
    setHeard('')
    setAnswer('')
    if (!canListen) {
      setNote('Tarayıcınız sesli komutları desteklemiyor; aşağıdaki hazır sorulardan yararlanabilirsiniz.')
      return
    }
    activeRef.current = true
    setActive(true)
    clapRef.current = await startClapListener(onClap) // izin yoksa null; tanıma yine denenir
    startRec()
  }

  function stopLumi() {
    activeRef.current = false
    setActive(false)
    awakeRef.current = false
    setAwake(false)
    speakingRef.current = false
    setSpeaking(false)
    recRef.current?.stop()
    recRef.current = null
    clapRef.current?.stop()
    clapRef.current = null
    if (awakeTimer.current) window.clearTimeout(awakeTimer.current)
    cancelSpeech()
  }

  function playChip(label: string, text: string) {
    const wasActive = activeRef.current
    setHeard(label)
    setAnswer(text)
    recRef.current?.stop()
    recRef.current = null
    speakOut(text, () => {
      if (wasActive) startRec()
    })
  }

  const [imgOk, setImgOk] = useState(true)

  const statusText = !active
    ? 'Lumi uykuda'
    : speaking
      ? 'Lumi konuşuyor…'
      : awake
        ? 'Sizi dinliyorum 👂'
        : 'Uyandırmak için el çırpın 👏'

  const chips = [
    { key: 'summary', label: 'Bugün ne oldu?', text: report.narrative },
    { key: 'revenue', label: 'Ciro ne kadar?', text: `Bugünün cirosu ${formatTRY(report.revenue)}.` },
    {
      key: 'stock',
      label: 'Stok durumu nedir?',
      text: `En çok ilgi gören ürününüz ${report.topProductName}. Yeniden tedarik gereken kalemleri Stok ekranından görebilirsiniz.`,
    },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="SESLİ ASİSTAN"
        title="Sesli Rapor"
        subtitle="Lumi'yi uyandırın; el çırpıp “Hey Lumi, bana rapor ver” deyin. Günün özetini sizinle sesli konuşarak paylaşsın."
      />

      {/* Lumi — sesli etkileşim paneli */}
      <div className="relative overflow-hidden rounded-[22px] bg-navy-grad px-6 py-8 text-white shadow-card sm:px-10">
        {/* dinleme halkası */}
        {active && !speaking && (
          <span
            aria-hidden
            className="pointer-events-none absolute left-[65px] top-[70px] h-[120px] w-[120px] animate-ping rounded-full bg-gold-400/20 sm:left-[105px]"
          />
        )}

        <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
          {/* Maskot (Lumi) */}
          <div className="relative flex h-[130px] w-[130px] shrink-0 items-center justify-center">
            <span
              className={`absolute inset-0 rounded-full bg-gold-grad blur-xl transition-opacity ${
                speaking ? 'opacity-60' : active ? 'opacity-40' : 'opacity-25'
              }`}
            />
            {imgOk ? (
              <img
                src={`${import.meta.env.BASE_URL}mascot.png`}
                alt="Lumi"
                className={`relative h-[120px] w-[120px] object-contain drop-shadow-lg ${
                  speaking ? 'animate-pulse' : active ? 'animate-float' : ''
                }`}
                onError={() => setImgOk(false)}
              />
            ) : (
              <span
                className={`relative flex h-[120px] w-[120px] items-center justify-center rounded-full bg-gold-grad shadow-gold ${
                  speaking ? 'animate-pulse' : ''
                }`}
              >
                <AudioLines size={48} className="text-navy-900" />
              </span>
            )}
          </div>

          {/* Orta blok */}
          <div className="flex flex-1 flex-col items-center text-center sm:items-start sm:text-left">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-300">
              Lumi • Günlük Rapor
            </span>
            <span className="mt-1 font-display text-2xl text-white">{formatDate(report.date)}</span>

            <p className="mt-2 flex items-center gap-2 text-[15px] font-medium text-gold-100">
              {active && !speaking && <Hand size={16} className="text-gold-300" />}
              {statusText}
            </p>

            {speaking && (
              <div className="mt-3 flex h-8 items-end gap-1" aria-hidden>
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 rounded-full bg-gold-400"
                    style={{
                      height: `${8 + ((i * 7) % 20)}px`,
                      animation: 'snap-wave 900ms ease-in-out infinite',
                      animationDelay: `${i * 90}ms`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Kontrol */}
          {canListen ? (
            <button
              type="button"
              onClick={active ? stopLumi : startLumi}
              aria-label={active ? 'Lumi’yi uykuya al' : 'Lumi’yi uyandır'}
              className={`flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-0.5 rounded-full shadow-gold transition-transform hover:scale-105 active:scale-95 ${
                active ? 'bg-white text-navy-700' : 'bg-gold-grad text-navy-900'
              }`}
            >
              {active ? <Power size={26} /> : <Mic size={26} />}
              <span className="text-[10px] font-bold uppercase tracking-wide">
                {active ? 'Uyut' : 'Uyandır'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => playChip('Bugün ne oldu?', report.narrative)}
              aria-label="Raporu dinle"
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gold-grad text-navy-900 shadow-gold transition-transform hover:scale-105 active:scale-95"
            >
              <Play size={32} fill="currentColor" className="ml-1" />
            </button>
          )}
        </div>

        {/* Komut ipucu */}
        {canListen && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-white/8 px-4 py-3 text-center text-sm text-gold-100 sm:justify-start">
            <Hand size={16} className="text-gold-300" />
            <span>
              {active
                ? 'El çırpın 👏 ve “Hey Lumi, bana rapor ver” deyin. “Ciro ne kadar?”, “Stok durumu?” de sorabilirsiniz.'
                : '“Uyandır”a bir kez dokunun (mikrofon izni). Sonra el çırpıp Lumi ile konuşun.'}
            </span>
          </div>
        )}

        {note && <p className="mt-3 text-center text-sm text-gold-100/90 sm:text-left">{note}</p>}
        {!canSpeak && (
          <p className="mt-3 text-center text-sm text-gold-100/80 sm:text-left">
            Tarayıcınız sesli okumayı desteklemiyor; raporu aşağıda metin olarak okuyabilirsiniz.
          </p>
        )}

        <style>{`
          @keyframes snap-wave {
            0%, 100% { transform: scaleY(0.4); }
            50% { transform: scaleY(1.4); }
          }
        `}</style>
      </div>

      {/* Konuşma — soru & animasyonlu yanıt */}
      {(heard || answer) && (
        <div className="space-y-3 rounded-2xl border border-line bg-ivory p-5">
          {heard && (
            <div className="flex justify-end">
              <span className="max-w-[80%] rounded-2xl rounded-br-md bg-navy-700 px-4 py-2.5 text-[14px] text-white">
                {heard}
              </span>
            </div>
          )}
          {answer && (
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-gold-grad text-navy-900">
                <Sparkles size={15} />
              </span>
              <span className="max-w-[85%] rounded-2xl rounded-bl-md border border-line bg-white px-4 py-2.5 text-[14px] leading-relaxed text-ink">
                <Typewriter text={answer} />
              </span>
            </div>
          )}
        </div>
      )}

      {/* Hazır sorular (sesli komuta alternatif) */}
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <Button key={c.key} variant="soft" size="sm" onClick={() => playChip(c.label, c.text)}>
            <Play size={13} /> {c.label}
          </Button>
        ))}
      </div>

      {/* Rapor metni */}
      <Card>
        <CardHeader title="Günün Özeti" subtitle="Lumi'nin hazırladığı rapor metni" />
        <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-ink">
          {report.narrative}
        </p>
      </Card>

      {/* İstatistik grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Ciro" value={formatTRY(report.revenue)} icon={<TrendingUp size={18} />} />
        <StatCard label="Sipariş" value={formatNumber(report.orderCount)} icon={<ShoppingBag size={18} />} />
        <StatCard label="Yanıtlanan Mesaj" value={formatNumber(report.messagesHandled)} icon={<MessageSquare size={18} />} />
        <StatCard label="Sesli Mesaj" value={formatNumber(report.voiceMessages)} icon={<Volume2 size={18} />} />
        <StatCard label="Yeni Müşteri" value={formatNumber(report.newCustomers)} icon={<UserPlus size={18} />} />
        <StatCard label="Dönüşüm" value={pct(report.conversionRate)} icon={<Target size={18} />} />
      </div>

      {/* En çok ilgi gören ürün */}
      <div className="flex items-center gap-4 rounded-2xl border border-line bg-cream-2 px-5 py-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-grad text-navy-900 shadow-gold">
          <Star size={20} fill="currentColor" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            En çok ilgi gören ürün
          </p>
          <p className="font-display text-xl text-ink">{report.topProductName}</p>
        </div>
      </div>

      {/* Öne çıkanlar */}
      {report.highlights.length > 0 && (
        <Card>
          <CardHeader title="Öne Çıkanlar" />
          <ul className="mt-4 space-y-3">
            {report.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-700 text-gold-300">
                  <Sparkles size={14} />
                </span>
                <span className="text-ink-soft">{h}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
