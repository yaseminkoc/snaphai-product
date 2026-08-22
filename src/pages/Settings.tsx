import { useNavigate } from 'react-router-dom'
import type { ChangeEvent } from 'react'
import { RotateCcw, Trash2, Check, Store as StoreIcon } from 'lucide-react'
import type { NegotiationSettings, PlanTier } from '@/types'
import { useStore } from '@/store/useStore'
import { plans } from '@/data/mockData'
import { formatDate, formatNumber, formatTRY } from '@/lib/format'
import { planNameMap } from '@/lib/labels'
import { Avatar, Badge, Button, Card, CardHeader, PageHeader } from '@/components/ui'

/* ---- Lokal küçük Toggle bileşeni ---- */
interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  hint?: string
}

function Toggle({ checked, onChange, label, hint }: ToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <div>
        <p className="text-[14px] font-medium text-ink">{label}</p>
        {hint && <p className="mt-0.5 text-[12.5px] text-muted">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={
          'relative mt-0.5 h-6 w-11 flex-none rounded-full transition-colors ' +
          (checked ? 'bg-gold-grad' : 'bg-navy-700/15')
        }
      >
        <span
          className={
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all ' +
            (checked ? 'left-[22px]' : 'left-0.5')
          }
        />
      </button>
    </div>
  )
}

/* ---- Lokal Range satırı ---- */
interface RangeRowProps {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
  hint?: string
}

function RangeRow({ label, value, min, max, onChange, hint }: RangeRowProps) {
  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between">
        <label className="text-[14px] font-medium text-ink">{label}</label>
        <span className="rounded-full bg-navy-700/8 px-2.5 py-0.5 text-[13px] font-semibold text-navy-700">
          %{value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))}
        className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-navy-700/15 accent-gold-500"
      />
      {hint && <p className="mt-1.5 text-[12.5px] text-muted">{hint}</p>}
    </div>
  )
}

/* ---- Lokal Select satırı ---- */
interface SelectRowProps {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}

function SelectRow({ label, value, options, onChange }: SelectRowProps) {
  return (
    <div className="py-2.5">
      <label className="mb-1.5 block text-[14px] font-medium text-ink">{label}</label>
      <select
        value={value}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-ivory px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-gold-400"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

/* ---- Mağaza bilgi satırı ---- */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-line py-2.5 first:border-t-0">
      <span className="text-[13px] text-muted">{label}</span>
      <span className="text-right text-[14px] font-medium text-ink">{value}</span>
    </div>
  )
}

/* ---- Plan özellikleri (lokal, kurumsal ton) ---- */
const planFeatures: Record<PlanTier, string[]> = {
  baslangic: [
    'Aylık 200 mesaja kadar otomatik yanıt',
    'Temel ürün kataloğu senkronizasyonu',
    'Metin tabanlı müşteri iletişimi',
  ],
  profesyonel: [
    'Sınırsız otomatik mesaj ve pazarlık motoru',
    'Sesli mesaj ve sesli yanıt desteği',
    'Ödeme bağlantısıyla otomatik satış kapama',
    'Günlük performans raporları',
  ],
  kurumsal: [
    'Profesyonel plandaki tüm özellikler',
    'Öncelikli destek ve özel entegrasyonlar',
    'Gelişmiş stok ve talep tahmini',
    'Çoklu mağaza yönetimi',
  ],
}

const planOrder: PlanTier[] = ['baslangic', 'profesyonel', 'kurumsal']

export function Settings() {
  const navigate = useNavigate()
  const settings = useStore((s) => s.settings)
  const store = useStore((s) => s.store)
  const updateSettings = useStore((s) => s.updateSettings)
  const resetOnboarding = useStore((s) => s.resetOnboarding)
  const resetDemo = useStore((s) => s.resetDemo)
  const pushToast = useStore((s) => s.pushToast)

  const patch = (p: Partial<NegotiationSettings>) => updateSettings(p)

  const handleReplay = () => {
    resetOnboarding()
    navigate('/connect')
  }

  const handleResetDemo = () => {
    resetDemo()
    pushToast({ title: 'Demo sıfırlandı', tone: 'success' })
  }

  return (
    <div>
      <PageHeader
        eyebrow="Ayarlar"
        title="Çalışanınızı yapılandırın"
        subtitle="Yapay zeka çalışanınızın pazarlık davranışını, mağaza bilgilerinizi ve aboneliğinizi buradan yönetirsiniz."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* 1) Pazarlık Motoru */}
        <Card className="lg:row-span-2">
          <CardHeader
            title="Pazarlık Motoru"
            subtitle="Yapay zeka çalışanınızın müşterilerle nasıl anlaşacağını belirleyin."
          />
          <div className="divide-y divide-line">
            <Toggle
              label="Otomatik pazarlık ve yanıt"
              hint="Kapalıyken mesajlar yalnızca size iletilir, otomatik yanıt verilmez."
              checked={settings.enabled}
              onChange={(v) => patch({ enabled: v })}
            />

            <RangeRow
              label="En yüksek indirim"
              value={settings.maxDiscountPct}
              min={0}
              max={40}
              onChange={(v) => patch({ maxDiscountPct: v })}
              hint="Yapay zeka çalışanınız bu oranın altına inmez."
            />

            <RangeRow
              label="Öğrenci indirimi"
              value={settings.studentDiscountPct}
              min={0}
              max={25}
              onChange={(v) => patch({ studentDiscountPct: v })}
              hint="Öğrenci olduğunu belirten müşterilere uygulanır."
            />

            <Toggle
              label="Sepet büyütme (upsell) önerileri"
              hint="Uygun durumlarda tamamlayıcı ürünler önerilir."
              checked={settings.upsellEnabled}
              onChange={(v) => patch({ upsellEnabled: v })}
            />

            <Toggle
              label="Satışı ödeme linkiyle otomatik kapat"
              hint="Anlaşma sağlandığında güvenli ödeme bağlantısı gönderilir."
              checked={settings.autoCloseWithPayment}
              onChange={(v) => patch({ autoCloseWithPayment: v })}
            />

            <Toggle
              label="Sesli mesaja sesli yanıt"
              hint="Sesli gelen mesajlara sesli olarak karşılık verilir."
              checked={settings.voiceReplies}
              onChange={(v) => patch({ voiceReplies: v })}
            />

            <SelectRow
              label="Üslup"
              value={settings.tone}
              onChange={(v) => patch({ tone: v as NegotiationSettings['tone'] })}
              options={[
                { value: 'resmi', label: 'Resmi' },
                { value: 'dengeli', label: 'Dengeli' },
                { value: 'samimi', label: 'Samimi' },
              ]}
            />

            <SelectRow
              label="Ödeme sağlayıcı"
              value={settings.paymentProvider}
              onChange={(v) =>
                patch({ paymentProvider: v as NegotiationSettings['paymentProvider'] })
              }
              options={[
                { value: 'iyzico', label: 'iyzico' },
                { value: 'paytr', label: 'PayTR' },
              ]}
            />

            <div className="py-2.5">
              <label className="mb-1.5 block text-[14px] font-medium text-ink">
                Çalışma saatleri
              </label>
              <input
                type="text"
                value={settings.workingHours}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  patch({ workingHours: e.target.value })
                }
                placeholder="09:00 - 22:00"
                className="w-full rounded-xl border border-line bg-ivory px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-gold-400"
              />
              <p className="mt-1.5 text-[12.5px] text-muted">
                Bu saatler dışında gelen mesajlar için otomatik bilgilendirme yapılır.
              </p>
            </div>
          </div>
        </Card>

        {/* 2) Mağaza Bilgileri */}
        <Card>
          <CardHeader title="Mağaza Bilgileri" />
          <div className="mb-4 flex items-center gap-3">
            <Avatar initials={store.avatarInitials} size={48} tone="gold" />
            <div>
              <p className="font-display text-[16px] font-semibold text-navy-700">{store.name}</p>
              <p className="text-[13px] text-muted">{store.handle}</p>
            </div>
          </div>
          <div>
            <InfoRow label="Kategori" value={store.category} />
            <InfoRow label="Şehir" value={store.city} />
            <InfoRow label="Takipçi" value={formatNumber(store.followers)} />
            <InfoRow label="Bağlanma tarihi" value={formatDate(store.connectedAt)} />
          </div>
          <p className="mt-4 flex gap-2 rounded-xl bg-cream-2 p-3.5 text-[13px] leading-relaxed text-ink-soft">
            <StoreIcon size={16} className="mt-0.5 flex-none text-gold-500" />
            <span>{store.bio}</span>
          </p>
        </Card>

        {/* 4) Demo Kontrolleri */}
        <Card>
          <CardHeader
            title="Demo Kontrolleri"
            subtitle="Bu kontroller yalnızca tanıtım amaçlıdır; gerçek verilerinizi etkilemez."
          />
          <div className="flex flex-col gap-3">
            <Button variant="outline" onClick={handleReplay}>
              <RotateCcw size={16} />
              Kurulumu tekrar izle
            </Button>
            <Button variant="ghost" className="text-rose-600 hover:text-rose-700" onClick={handleResetDemo}>
              <Trash2 size={16} />
              Demoyu sıfırla
            </Button>
          </div>
        </Card>

        {/* 3) Aboneliğiniz */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Aboneliğiniz"
            subtitle={`Mevcut planınız: ${planNameMap[store.plan]}`}
            action={<Badge cls="bg-gold-grad text-navy-900">{planNameMap[store.plan]}</Badge>}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {planOrder.map((tier) => {
              const plan = plans[tier]
              const isCurrent = tier === store.plan
              return (
                <div
                  key={tier}
                  className={
                    'flex flex-col rounded-2xl border p-5 transition-shadow ' +
                    (isCurrent
                      ? 'border-gold-400 bg-cream-2 shadow-gold'
                      : 'border-line bg-white')
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-display text-[17px] font-semibold text-navy-700">
                      {plan.name}
                    </h4>
                    {isCurrent && (
                      <Badge cls="bg-navy-700 text-white">
                        <Check size={13} />
                        Aktif plan
                      </Badge>
                    )}
                  </div>
                  <p className="mt-2 font-display text-[24px] font-semibold text-navy-700">
                    {plan.priceMonthly === 0 ? (
                      'Ücretsiz'
                    ) : (
                      <>
                        {formatTRY(plan.priceMonthly)}
                        <span className="text-[14px] font-medium text-muted">/ay</span>
                      </>
                    )}
                  </p>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {planFeatures[tier].map((f) => (
                      <li key={f} className="flex gap-2 text-[13px] text-ink-soft">
                        <Check size={15} className="mt-0.5 flex-none text-gold-500" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 flex-1" />
                  {isCurrent ? (
                    <Button variant="soft" block disabled>
                      Kullanımda
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      block
                      onClick={() =>
                        pushToast({ title: 'Plan talebiniz alındı', tone: 'info' })
                      }
                    >
                      Planı değiştir
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
