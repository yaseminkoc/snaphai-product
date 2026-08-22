import { Activity, HelpCircle, CheckCircle2, Check, X, PackageCheck, Bell, ShieldCheck } from 'lucide-react'
import type { StockAlert, Product } from '@/types'
import { useStore } from '@/store/useStore'
import { timeAgo } from '@/lib/format'
import { stockStatusMap } from '@/lib/labels'
import { PageHeader, Card, CardHeader, Badge, Button, ProductThumb, EmptyState } from '@/components/ui'

/** Talep/stok karşılaştırma barı. */
function DemandBar({
  label,
  value,
  max,
  tone,
}: {
  label: string
  value: number
  max: number
  tone: 'demand' | 'stock'
}) {
  const ratio = max > 0 ? Math.min(1, value / max) : 0
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[13px]">
        <span className="font-semibold text-ink-soft">{label}</span>
        <span className="font-bold text-navy-700">{value}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-navy-700/8">
        <div
          className={
            tone === 'demand'
              ? 'h-full rounded-full bg-navy-grad'
              : 'h-full rounded-full bg-gold-grad'
          }
          style={{ width: `${Math.max(ratio * 100, value > 0 ? 6 : 0)}%` }}
        />
      </div>
    </div>
  )
}

/** Karar bekleyen açık kartı. */
function OpenAlertCard({
  alert,
  accent,
  onRestock,
  onNotify,
}: {
  alert: StockAlert
  accent: string
  onRestock: () => void
  onNotify: () => void
}) {
  return (
    <Card className="relative overflow-hidden pl-6">
      <span className="absolute left-0 top-0 h-full w-1.5 bg-gold-grad" />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <ProductThumb emoji={alert.productEmoji} accent={accent} size={44} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-[16px] font-semibold text-navy-700">
            {alert.productName}
          </p>
          <p className="text-[12px] text-muted">{timeAgo(alert.createdAt)}</p>
        </div>
        <Badge style={stockStatusMap[alert.status]} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DemandBar label="Talep" value={alert.demand} max={alert.demand} tone="demand" />
        <DemandBar label="Stokta" value={alert.available} max={alert.demand} tone="stock" />
      </div>

      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-[13px] font-bold text-rose-600">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        {alert.shortage} adet açık
      </div>

      <blockquote className="mt-4 rounded-xl border border-line bg-cream-2 px-4 py-3 text-[14px] italic text-ink-soft">
        “{alert.shortage} adet açığımız var. Tedarik edebilir misiniz?”
      </blockquote>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        <Button variant="gold" size="lg" block onClick={onRestock}>
          <Check size={18} />
          Evet, tedarik edeceğim
        </Button>
        <Button variant="outline" size="lg" block onClick={onNotify}>
          <X size={18} />
          Hayır, mümkün değil
        </Button>
      </div>
    </Card>
  )
}

/** Karar verilmiş (sönük) uyarı kartı. */
function ResolvedAlertCard({ alert, accent }: { alert: StockAlert; accent: string }) {
  const restocking = alert.status === 'restocking'
  return (
    <Card className="bg-ivory">
      <div className="flex flex-wrap items-center gap-3">
        <ProductThumb emoji={alert.productEmoji} accent={accent} size={40} className="opacity-80" />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-navy-700">{alert.productName}</p>
          <p className="text-[12px] text-muted">{timeAgo(alert.createdAt)}</p>
        </div>
        <Badge style={stockStatusMap[alert.status]} />
      </div>
      <div
        className={
          restocking
            ? 'mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-[13px] font-medium text-emerald-700'
            : 'mt-3 flex items-center gap-2 rounded-xl bg-sky-50 px-3.5 py-2.5 text-[13px] font-medium text-sky-700'
        }
      >
        {restocking ? <PackageCheck size={16} /> : <Bell size={16} />}
        {restocking
          ? `Tedarik süreci başladı, +${alert.shortage} adet stoğa eklendi.`
          : `${alert.shortage} bekleyen müşteriye kibar “stok kalmadı” mesajı gönderildi.`}
      </div>
    </Card>
  )
}

export function Stock() {
  const stockAlerts = useStore((s) => s.stockAlerts)
  const products = useStore((s) => s.products)
  const resolveStockAlert = useStore((s) => s.resolveStockAlert)

  const accentOf = (productId: string): string =>
    products.find((p) => p.id === productId)?.accent ?? '#c79a3a'

  const openAlerts = stockAlerts.filter((a) => a.status === 'open')
  const resolvedAlerts = stockAlerts.filter((a) => a.status !== 'open')
  const lowStock: Product[] = products.filter((p) => p.stock <= 3)

  const steps: { icon: typeof Activity; title: string; detail: string }[] = [
    {
      icon: Activity,
      title: 'Talebi izler',
      detail: 'Gelen mesajları ve siparişleri sürekli takip ederek her ürünün gerçek talebini ölçer.',
    },
    {
      icon: HelpCircle,
      title: 'Açığı size sorar',
      detail: 'Stok talebi karşılamadığında karar sizindir; açığı net rakamlarla önünüze getirir.',
    },
    {
      icon: CheckCircle2,
      title: 'Kararınızı uygular',
      detail: 'Tercihinize göre tedarik sürecini başlatır ya da bekleyen müşterileri kibarca bilgilendirir.',
    },
  ]

  return (
    <div>
      <PageHeader
        eyebrow="OTONOM KARAR"
        title="Stok Yönetimi"
        subtitle="Yapay zeka çalışanınız talebi ve stoğu sürekli izler. Açık oluştuğunda kararı size sorar; kararınıza göre ya tedarik sürecini başlatır ya da bekleyen müşterilere kibarca bilgi verir."
      />

      {/* Nasıl çalışır */}
      <Card className="mb-6">
        <CardHeader
          title="Nasıl çalışır?"
          subtitle="Stok kararlarında son söz her zaman sizde."
        />
        <div className="grid gap-3 sm:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div
                key={step.title}
                className="rounded-2xl border border-line bg-ivory p-4"
              >
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-700/8 text-navy-700">
                    <Icon size={18} />
                  </span>
                  <span className="text-[12px] font-bold text-gold-600">0{i + 1}</span>
                </div>
                <p className="font-display text-[15px] font-semibold text-navy-700">
                  {step.title}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{step.detail}</p>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Karar bekleyen açıklar */}
      <section className="mb-6">
        <h2 className="mb-3 font-display text-[18px] font-semibold text-navy-700">
          Karar bekleyen açıklar
        </h2>
        {openAlerts.length === 0 ? (
          <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-[14px] font-medium text-emerald-700">
            <ShieldCheck size={18} />
            Şu an karar bekleyen stok açığı yok.
          </div>
        ) : (
          <div className="grid gap-4">
            {openAlerts.map((a) => (
              <OpenAlertCard
                key={a.id}
                alert={a}
                accent={accentOf(a.productId)}
                onRestock={() => resolveStockAlert(a.id, 'restock')}
                onNotify={() => resolveStockAlert(a.id, 'notify')}
              />
            ))}
          </div>
        )}
      </section>

      {/* Karar verilmiş uyarılar */}
      {resolvedAlerts.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 font-display text-[18px] font-semibold text-navy-700">
            Sonuçlanan kararlar
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {resolvedAlerts.map((a) => (
              <ResolvedAlertCard key={a.id} alert={a} accent={accentOf(a.productId)} />
            ))}
          </div>
        </section>
      )}

      {/* Düşük stok izleme */}
      <Card padded={false}>
        <div className="p-5 sm:p-6">
          <CardHeader
            title="Düşük stok izleme"
            subtitle="Kalan adedi 3 ve altına düşen ürünler."
          />
        </div>
        {lowStock.length === 0 ? (
          <div className="px-5 pb-6 sm:px-6">
            <EmptyState
              icon={<PackageCheck size={22} />}
              title="Tüm ürünlerde stok sağlıklı"
              detail="Şu anda kritik seviyeye inen bir ürün bulunmuyor."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-[14px]">
              <thead>
                <tr className="border-y border-line bg-ivory text-[12px] uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-semibold sm:px-6">Ürün</th>
                  <th className="px-4 py-3 font-semibold">Stok</th>
                  <th className="px-4 py-3 font-semibold">Satılan</th>
                  <th className="px-5 py-3 font-semibold sm:px-6">Not</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((p) => {
                  const out = p.stock === 0
                  return (
                    <tr key={p.id} className="border-b border-line last:border-0">
                      <td className="px-5 py-3.5 sm:px-6">
                        <div className="flex items-center gap-3">
                          <ProductThumb emoji={p.emoji} accent={p.accent} size={38} />
                          <span className="font-semibold text-navy-700">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          cls={out ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-700'}
                          dot={out ? '#e11d48' : '#d97706'}
                        >
                          {out ? 'Tükendi' : `${p.stock} adet`}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-ink-soft">{p.sold}</td>
                      <td className="px-5 py-3.5 text-[13px] text-muted sm:px-6">
                        {out
                          ? 'Yapay zeka çalışanınız talep geldiğinde kararınızı soracak.'
                          : 'Yakında tükenebilir; talep izleniyor.'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
