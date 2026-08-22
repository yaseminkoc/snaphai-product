import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Instagram,
  Link2,
  Loader2,
  ShieldCheck,
  Sparkles,
  Store as StoreIcon,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { discoveredProducts, scanSteps } from '@/data/mockData'
import { Button, ProductThumb, Logo, Mascot } from '@/components/ui'
import { formatTRY } from '@/lib/format'

type Step = 'connect' | 'scanning' | 'done'

const TRUST_ITEMS = [
  'Kod bilgisi gerekmez',
  'Meta Graph API ile güvenli',
  'Kredi kartı istemez',
] as const

/** Tam ekran "Magic Onboarding" — Instagram profilini akıllı mağazaya dönüştürür. */
export function Onboarding() {
  const navigate = useNavigate()
  const completeOnboarding = useStore((s) => s.completeOnboarding)

  const [step, setStep] = useState<Step>('connect')
  const [handle, setHandle] = useState('zarifbutik')

  const categoryCount = useMemo(
    () => new Set(discoveredProducts.map((p) => p.category)).size,
    [],
  )

  return (
    <div className="relative min-h-screen overflow-hidden bg-navy-grad text-white">
      {/* Gold radyal glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-60 blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(201,162,75,0.45), transparent 65%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-[380px] w-[380px] translate-x-1/3 translate-y-1/3 rounded-full opacity-40 blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(28,64,118,0.7), transparent 65%)' }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-8 sm:py-12">
        {/* Üst logo (gerçek amblem) */}
        <header className="mb-6 flex items-center justify-center animate-fade-up">
          <Logo size={42} showWord wordClassName="text-white text-[24px]" />
        </header>

        <main className="flex flex-1 flex-col justify-center">
          {step === 'connect' && (
            <>
              {/* Maskot — parlayan küre, hero */}
              <div className="mb-2 flex justify-center animate-fade-up">
                <Mascot size={148} glow float />
              </div>
              <ConnectStep
                handle={handle}
                onHandleChange={setHandle}
                onConnect={() => setStep('scanning')}
              />
            </>
          )}
          {step === 'scanning' && (
            <ScanningStep handle={handle} onComplete={() => setStep('done')} />
          )}
          {step === 'done' && (
            <DoneStep
              productCount={discoveredProducts.length}
              categoryCount={categoryCount}
              onEnter={() => {
                completeOnboarding()
                navigate('/')
              }}
              onDemo={() => navigate('/store')}
            />
          )}
        </main>

        <footer className="mt-8 text-center text-[12px] text-white/40 animate-fade-up">
          SnaphAI • Instagram butikleri için yapay zeka çalışanı
        </footer>
      </div>
    </div>
  )
}

/* ============================ ADIM 1: Bağlan ============================ */

interface ConnectStepProps {
  handle: string
  onHandleChange: (v: string) => void
  onConnect: () => void
}

function ConnectStep({ handle, onHandleChange, onConnect }: ConnectStepProps) {
  const clean = (v: string) => v.replace(/[^a-zA-Z0-9._]/g, '').toLowerCase()

  return (
    <div className="animate-fade-up rounded-3xl bg-white p-7 text-ink shadow-md sm:p-10">
      <span className="eyebrow">
        <Sparkles size={13} />
        Kadim gelenek, dijital gelecek
      </span>

      <h1 className="mt-4 text-[26px] leading-[1.12] text-navy-700 sm:text-[32px]">
        Instagram butiğinizi 60 saniyede akıllı mağazaya dönüştürün.
      </h1>

      <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
        Profilinizi bağlayın, gerisini yapay zeka çalışanınız halletsin. Ürünlerinizi
        gönderilerinizden otomatik çıkarır, mesajları yanıtlar ve siparişleri sizin için tamamlar.
      </p>

      <label htmlFor="ig-handle" className="mt-7 block text-[13px] font-semibold text-ink">
        Instagram kullanıcı adınız
      </label>
      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-line bg-cream-2 px-4 py-3 transition-colors focus-within:border-gold-500">
        <Instagram size={18} className="flex-none text-gold-600" />
        <span className="select-none text-[15px] font-semibold text-muted">@</span>
        <input
          id="ig-handle"
          type="text"
          value={handle}
          onChange={(e) => onHandleChange(clean(e.target.value))}
          placeholder="kullaniciadi"
          spellCheck={false}
          autoComplete="off"
          className="w-full bg-transparent text-[15px] font-semibold text-ink outline-none placeholder:font-normal placeholder:text-muted"
        />
      </div>

      <div className="mt-6">
        <Button
          variant="gold"
          size="lg"
          block
          disabled={handle.trim().length === 0}
          onClick={onConnect}
        >
          <Link2 size={18} />
          Profilimi Bağla
        </Button>
      </div>

      <ul className="mt-6 grid gap-2.5 sm:grid-cols-3">
        {TRUST_ITEMS.map((item) => (
          <li key={item} className="flex items-center gap-2 text-[12.5px] text-ink-soft">
            <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-gold-500/15 text-gold-600">
              <Check size={13} strokeWidth={3} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ============================ ADIM 2: Tarama ============================ */

interface ScanningStepProps {
  handle: string
  onComplete: () => void
}

function ScanningStep({ handle, onComplete }: ScanningStepProps) {
  // -1: henüz başlamadı; 0..n-1: o adım aktif; n: hepsi tamamlandı
  const [current, setCurrent] = useState(0)
  const [revealed, setRevealed] = useState(0)
  const doneRef = useRef(false)

  const stepsDone = current >= scanSteps.length

  // Adımları sırayla ilerlet
  useEffect(() => {
    if (stepsDone) return
    const t = setTimeout(() => setCurrent((c) => c + 1), 900)
    return () => clearTimeout(t)
  }, [current, stepsDone])

  // Adımlar bitince ürünleri kademeli göster
  useEffect(() => {
    if (!stepsDone) return
    if (revealed >= discoveredProducts.length) return
    const t = setTimeout(() => setRevealed((r) => r + 1), 250)
    return () => clearTimeout(t)
  }, [stepsDone, revealed])

  // Her şey bitince done adımına geç
  useEffect(() => {
    if (!stepsDone) return
    if (revealed < discoveredProducts.length) return
    if (doneRef.current) return
    doneRef.current = true
    const t = setTimeout(onComplete, 600)
    return () => clearTimeout(t)
  }, [stepsDone, revealed, onComplete])

  const total = scanSteps.length
  const progress = Math.round((Math.min(current, total) / total) * 100)

  return (
    <div className="animate-fade-up rounded-3xl bg-white p-7 text-ink shadow-md sm:p-10">
      <div className="flex items-center gap-3">
        <Mascot size={52} float />
        <div className="min-w-0">
          <p className="truncate text-[16px] font-bold text-navy-700">@{handle} taranıyor</p>
          <p className="text-[13px] text-muted">Yapay zeka mağazanızı kuruyor…</p>
        </div>
        <span className="ml-auto font-display text-[22px] font-bold text-gold-600">%{progress}</span>
      </div>

      {/* İlerleme çubuğu */}
      <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-navy-700/8">
        <div
          className="h-full rounded-full bg-gold-grad transition-all duration-500 ease-brand"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Adımlar */}
      <ul className="mt-6 space-y-3">
        {scanSteps.map((s, i) => {
          const isDone = i < current
          const isActive = i === current
          return (
            <li key={s.label} className="flex items-start gap-3">
              <span className="mt-0.5 flex-none">
                {isDone ? (
                  <CheckCircle2 size={20} className="text-emerald-500" />
                ) : isActive ? (
                  <Loader2 size={20} className="animate-spin text-gold-600" />
                ) : (
                  <span className="block h-5 w-5 rounded-full border-2 border-line" />
                )}
              </span>
              <div className="min-w-0">
                <p
                  className={
                    'text-[14px] font-semibold ' +
                    (isDone || isActive ? 'text-ink' : 'text-muted')
                  }
                >
                  {s.label}
                </p>
                <p className="text-[12.5px] text-muted">{s.detail}</p>
              </div>
            </li>
          )
        })}
      </ul>

      {/* Keşfedilen ürünler */}
      {stepsDone && (
        <div className="mt-7 border-t border-line pt-6">
          <p className="mb-3 text-[13px] font-semibold text-ink-soft">
            Keşfedilen ürünler
            <span className="ml-1 text-muted">({revealed}/{discoveredProducts.length})</span>
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {discoveredProducts.slice(0, revealed).map((p) => (
              <div
                key={p.id}
                className="animate-fade-up flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-cream-2 px-2 py-3 text-center"
              >
                <ProductThumb emoji={p.emoji} accent={p.accent} size={40} />
                <p className="mt-0.5 line-clamp-1 w-full text-[11.5px] font-semibold text-ink">
                  {p.name.split(' — ')[0]}
                </p>
                <p className="text-[11px] font-bold text-gold-600">{formatTRY(p.price)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ============================ ADIM 3: Hazır ============================ */

interface DoneStepProps {
  productCount: number
  categoryCount: number
  onEnter: () => void
  onDemo: () => void
}

function DoneStep({ productCount, categoryCount, onEnter, onDemo }: DoneStepProps) {
  const stats: { label: string; value: string }[] = [
    { label: 'Ürün', value: String(productCount) },
    { label: 'Kategori', value: String(categoryCount) },
    { label: 'Kurulum', value: '58 sn' },
  ]

  return (
    <div className="animate-fade-up rounded-3xl bg-white p-7 text-center text-ink shadow-md sm:p-10">
      <span
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-500 animate-pulse-ring"
        aria-hidden
      >
        <CheckCircle2 size={38} />
      </span>

      <h2 className="mt-5 text-[26px] text-navy-700 sm:text-[30px]">Mağazanız hazır!</h2>

      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink-soft">
        {productCount} ürün ve {categoryCount} kategori bulundu. Yapay zeka çalışanınız şu andan
        itibaren mesajları yanıtlamaya hazır.
      </p>

      {/* Özet istatistik */}
      <div className="mx-auto mt-7 grid max-w-md grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-cream-2 px-2 py-4">
            <p className="font-display text-[24px] font-bold text-navy-700">{s.value}</p>
            <p className="mt-0.5 text-[12px] text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Ürün önizleme */}
      <div className="mt-7 flex flex-wrap justify-center gap-2">
        {discoveredProducts.map((p) => (
          <ProductThumb key={p.id} emoji={p.emoji} accent={p.accent} size={40} />
        ))}
      </div>

      <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3">
        <Button variant="gold" size="lg" block onClick={onEnter}>
          <StoreIcon size={18} />
          Panele Git
          <ArrowRight size={18} />
        </Button>
        <Button variant="ghost" size="md" block onClick={onDemo}>
          <CreditCard size={16} />
          Müşteri demosunu gör
        </Button>
      </div>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-[12px] text-muted">
        <ShieldCheck size={14} className="text-gold-600" />
        Verileriniz güvende — dilediğiniz an bağlantıyı kaldırabilirsiniz.
      </p>
    </div>
  )
}
