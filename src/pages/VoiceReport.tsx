import { useEffect, useRef, useState } from 'react'
import {
  AudioLines,
  Play,
  Pause,
  Mic,
  MicOff,
  TrendingUp,
  ShoppingBag,
  MessageSquare,
  Volume2,
  UserPlus,
  Target,
  Sparkles,
  Star,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import {
  formatTRY,
  formatNumber,
  formatDate,
  pct,
} from '@/lib/format'
import { PageHeader, Card, CardHeader, StatCard, Button } from '@/components/ui'
import {
  speak,
  cancelSpeech,
  speechSupported,
  recognitionSupported,
  startRecognition,
} from '@/lib/voice'

interface Recognizer {
  stop: () => void
}

interface QuestionChip {
  key: string
  label: string
  answer: (r: ReturnType<typeof buildAnswers>) => string
}

function buildAnswers(report: {
  revenue: number
  orderCount: number
  narrative: string
  topProductName: string
}) {
  return report
}

export function VoiceReport() {
  const computeReport = useStore((s) => s.computeReport)
  const [report] = useState(() => computeReport())

  const [playing, setPlaying] = useState(false)
  const [listening, setListening] = useState(false)
  const [heard, setHeard] = useState('')
  const [answer, setAnswer] = useState('')
  const [micNote, setMicNote] = useState('')

  const recognizerRef = useRef<Recognizer | null>(null)

  const canSpeak = speechSupported()
  const canListen = recognitionSupported()

  // Temizlik: bileşen kaldırılırken sesi ve dinlemeyi durdur.
  useEffect(() => {
    return () => {
      cancelSpeech()
      recognizerRef.current?.stop()
      recognizerRef.current = null
    }
  }, [])

  function togglePlay() {
    if (playing) {
      cancelSpeech()
      setPlaying(false)
      return
    }
    speak(report.narrative, {
      onStart: () => setPlaying(true),
      onEnd: () => setPlaying(false),
    })
  }

  function answerFor(text: string): string {
    const q = text.toLocaleLowerCase('tr-TR')
    if (q.includes('ciro') || q.includes('kazan') || q.includes('gelir')) {
      return `Bugünün cirosu ${formatTRY(report.revenue)}.`
    }
    if (q.includes('sipariş') || q.includes('satış') || q.includes('satis')) {
      return `Bugün ${formatNumber(report.orderCount)} sipariş tamamlandı.`
    }
    if (q.includes('stok')) {
      return `Stok tarafında en çok ilgi gören ürününüz ${report.topProductName}. Yeniden tedarik gerektiren kalemleri Stok ekranından takip edebilirsiniz.`
    }
    if (q.includes('mesaj') || q.includes('müşteri') || q.includes('musteri')) {
      return `Bugün ${formatNumber(report.messagesHandled)} mesaj yanıtlandı ve ${formatNumber(report.newCustomers)} yeni müşteri kazanıldı.`
    }
    // Varsayılan: tam günlük özet.
    return report.narrative
  }

  function askAndSpeak(text: string) {
    const a = answerFor(text)
    setHeard(text)
    setAnswer(a)
    speak(a, {
      onStart: () => setPlaying(true),
      onEnd: () => setPlaying(false),
    })
  }

  function toggleListen() {
    if (listening) {
      recognizerRef.current?.stop()
      recognizerRef.current = null
      setListening(false)
      return
    }
    setMicNote('')
    setHeard('')
    const rec = startRecognition({
      onResult: (transcript, isFinal) => {
        setHeard(transcript)
        if (isFinal) {
          setListening(false)
          recognizerRef.current = null
          askAndSpeak(transcript)
        }
      },
      onEnd: () => {
        setListening(false)
        recognizerRef.current = null
      },
      onError: () => {
        setListening(false)
        recognizerRef.current = null
        setMicNote('Mikrofona erişilemedi veya ses algılanamadı. Lütfen tekrar deneyin.')
      },
    })
    if (!rec) {
      setMicNote('Tarayıcınız sesli soru özelliğini desteklemiyor.')
      return
    }
    recognizerRef.current = rec
    setListening(true)
  }

  const chips: QuestionChip[] = [
    { key: 'summary', label: 'Bugün ne oldu?', answer: (r) => r.narrative },
    {
      key: 'revenue',
      label: 'Ciro ne kadar?',
      answer: (r) => `Bugünün cirosu ${formatTRY(r.revenue)}.`,
    },
    {
      key: 'stock',
      label: 'Stok durumu nedir?',
      answer: (r) =>
        `En çok ilgi gören ürününüz ${r.topProductName}. Yeniden tedarik gereken kalemleri Stok ekranından görebilirsiniz.`,
    },
  ]

  const [imgOk, setImgOk] = useState(true)

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="SESLİ ASİSTAN"
        title="Sesli Rapor"
        subtitle="Gün içinde meşgulken 'Bugün ne oldu?' diye sorun; yapay zeka çalışanınız günün özetini sesli olarak iletsin."
      />

      {/* Büyük oynatıcı */}
      <div className="relative overflow-hidden rounded-[22px] bg-navy-grad px-6 py-8 text-white shadow-card sm:px-10">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
          {/* Küre / maskot */}
          <div className="relative flex h-[130px] w-[130px] shrink-0 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-gold-grad opacity-30 blur-xl" />
            {imgOk ? (
              <img
                src="/mascot.png"
                alt=""
                className={`relative h-[120px] w-[120px] object-contain drop-shadow-lg ${
                  playing ? 'animate-pulse' : ''
                }`}
                onError={() => setImgOk(false)}
              />
            ) : (
              <span
                className={`relative flex h-[120px] w-[120px] items-center justify-center rounded-full bg-gold-grad shadow-gold ${
                  playing ? 'animate-pulse' : ''
                }`}
              >
                <AudioLines size={48} className="text-navy-900" />
              </span>
            )}
          </div>

          {/* Orta blok */}
          <div className="flex flex-1 flex-col items-center text-center sm:items-start sm:text-left">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-300">
              Günlük Rapor
            </span>
            <span className="mt-1 font-display text-2xl text-white">
              {formatDate(report.date)}
            </span>

            {playing && (
              <div className="mt-4 flex h-8 items-end gap-1" aria-hidden>
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

            {!canSpeak && (
              <p className="mt-4 max-w-md text-sm text-gold-100/80">
                Tarayıcınız sesli okumayı desteklemiyor; metni aşağıda
                okuyabilirsiniz.
              </p>
            )}
          </div>

          {/* Oynat butonu */}
          {canSpeak && (
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? 'Durdur' : 'Oynat'}
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gold-grad text-navy-900 shadow-gold transition-transform hover:scale-105 active:scale-95"
            >
              {playing ? (
                <Pause size={34} fill="currentColor" />
              ) : (
                <Play size={34} fill="currentColor" className="ml-1" />
              )}
            </button>
          )}
        </div>

        <style>{`
          @keyframes snap-wave {
            0%, 100% { transform: scaleY(0.4); }
            50% { transform: scaleY(1.4); }
          }
        `}</style>
      </div>

      {/* Rapor metni */}
      <Card>
        <CardHeader
          title="Günün Özeti"
          subtitle="Yapay zeka çalışanınızın hazırladığı rapor metni"
        />
        <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-ink">
          {report.narrative}
        </p>
      </Card>

      {/* İstatistik grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          label="Ciro"
          value={formatTRY(report.revenue)}
          icon={<TrendingUp size={18} />}
        />
        <StatCard
          label="Sipariş"
          value={formatNumber(report.orderCount)}
          icon={<ShoppingBag size={18} />}
        />
        <StatCard
          label="Yanıtlanan Mesaj"
          value={formatNumber(report.messagesHandled)}
          icon={<MessageSquare size={18} />}
        />
        <StatCard
          label="Sesli Mesaj"
          value={formatNumber(report.voiceMessages)}
          icon={<Volume2 size={18} />}
        />
        <StatCard
          label="Yeni Müşteri"
          value={formatNumber(report.newCustomers)}
          icon={<UserPlus size={18} />}
        />
        <StatCard
          label="Dönüşüm"
          value={pct(report.conversionRate)}
          icon={<Target size={18} />}
        />
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

      {/* Sesli soru sorun */}
      <Card>
        <CardHeader
          title="Sesli Soru Sorun"
          subtitle="Mikrofona basıp sorunuzu söyleyin ya da hazır sorulardan birini seçin."
        />

        <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <button
            type="button"
            onClick={toggleListen}
            disabled={!canListen}
            aria-label={listening ? 'Dinlemeyi durdur' : 'Dinlemeyi başlat'}
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full shadow-md transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
              listening ? 'bg-gold-grad text-navy-900' : 'bg-navy-700 text-white'
            }`}
          >
            {canListen ? (
              listening ? (
                <span className="relative flex items-center justify-center">
                  <span className="absolute h-16 w-16 animate-ping rounded-full bg-gold-400/40" />
                  <Mic size={26} />
                </span>
              ) : (
                <Mic size={26} />
              )
            ) : (
              <MicOff size={26} />
            )}
          </button>

          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm font-medium text-ink">
              {listening
                ? 'Dinliyorum...'
                : canListen
                  ? 'Sormak için mikrofona dokunun'
                  : 'Tarayıcınız sesli soru sormayı desteklemiyor. Aşağıdaki hazır sorulardan yararlanabilirsiniz.'}
            </p>
            {micNote && <p className="mt-1 text-sm text-muted">{micNote}</p>}
          </div>
        </div>

        {/* Hazır soru çipleri */}
        <div className="mt-5 flex flex-wrap gap-2">
          {chips.map((c) => (
            <Button
              key={c.key}
              variant="soft"
              size="sm"
              onClick={() => {
                const a = c.answer(buildAnswers(report))
                setHeard(c.label)
                setAnswer(a)
                speak(a, {
                  onStart: () => setPlaying(true),
                  onEnd: () => setPlaying(false),
                })
              }}
            >
              {c.label}
            </Button>
          ))}
        </div>

        {/* Tanınan soru ve yanıt */}
        {(heard || answer) && (
          <div className="mt-5 space-y-3 rounded-2xl border border-line bg-ivory p-4">
            {heard && (
              <p className="text-sm text-muted">
                <span className="font-semibold text-ink-soft">Sorunuz:</span>{' '}
                {heard}
              </p>
            )}
            {answer && (
              <p className="text-ink">
                <span className="font-semibold text-navy-700">Yanıt:</span>{' '}
                {answer}
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
