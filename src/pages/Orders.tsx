import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mic, MessageSquare, Wallet, ShoppingBag, Receipt, PackageX } from 'lucide-react'
import type { Order, OrderStatus, Product } from '@/types'
import { useStore } from '@/store/useStore'
import { formatTRY, timeAgo } from '@/lib/format'
import { orderStatusMap } from '@/lib/labels'
import { PageHeader, StatCard, Card, Badge, ProductThumb, EmptyState, Button } from '@/components/ui'

type FilterKey = OrderStatus | 'all'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'paid', label: 'Ödendi' },
  { key: 'preparing', label: 'Hazırlanıyor' },
  { key: 'shipped', label: 'Kargolandı' },
  { key: 'awaiting-stock', label: 'Stok bekliyor' },
  { key: 'cancelled', label: 'İptal' },
  { key: 'pending', label: 'Ödeme bekliyor' },
]

const STATUS_OPTIONS: OrderStatus[] = [
  'pending',
  'paid',
  'preparing',
  'shipped',
  'awaiting-stock',
  'cancelled',
]

const REVENUE_STATUSES: OrderStatus[] = ['paid', 'preparing', 'shipped']

const DEFAULT_ACCENT = '#c99a3a'

export function Orders() {
  const orders = useStore((s) => s.orders)
  const products = useStore((s) => s.products)
  const updateOrderStatus = useStore((s) => s.updateOrderStatus)
  const pushToast = useStore((s) => s.pushToast)
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')

  const accentFor = (o: Order): string => {
    const p: Product | undefined = products.find((pr) => pr.id === o.productId)
    return p?.accent ?? DEFAULT_ACCENT
  }

  const revenue = useMemo(
    () =>
      orders
        .filter((o) => REVENUE_STATUSES.includes(o.status))
        .reduce((sum, o) => sum + o.total, 0),
    [orders],
  )

  const paidCount = useMemo(
    () => orders.filter((o) => REVENUE_STATUSES.includes(o.status)).length,
    [orders],
  )

  const avgBasket = paidCount > 0 ? revenue / paidCount : 0

  const counts = useMemo(() => {
    const map: Record<FilterKey, number> = {
      all: orders.length,
      pending: 0,
      paid: 0,
      preparing: 0,
      shipped: 0,
      cancelled: 0,
      'awaiting-stock': 0,
    }
    for (const o of orders) map[o.status] += 1
    return map
  }, [orders])

  const filtered = useMemo(
    () => (activeFilter === 'all' ? orders : orders.filter((o) => o.status === activeFilter)),
    [orders, activeFilter],
  )

  const handleStatusChange = (o: Order, next: OrderStatus) => {
    if (next === o.status) return
    updateOrderStatus(o.id, next)
    pushToast({
      title: 'Sipariş güncellendi',
      detail: `${o.productName} → ${orderStatusMap[next].label}`,
      tone: 'success',
    })
  }

  const ChannelTag = ({ channel }: { channel: Order['channel'] }) => (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-soft">
      {channel === 'voice' ? (
        <Mic size={15} className="text-gold-600" />
      ) : (
        <MessageSquare size={15} className="text-navy-600" />
      )}
      {channel === 'voice' ? 'Sesli' : 'DM'}
    </span>
  )

  const PriceCell = ({ o }: { o: Order }) => {
    if (o.unitPrice < o.listPrice) {
      return (
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-[12px] text-muted line-through">{formatTRY(o.listPrice)}</span>
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-ink">{formatTRY(o.unitPrice)}</span>
            <span className="rounded-full bg-gold-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-gold-600">
              indirim
            </span>
          </span>
        </div>
      )
    }
    return <span className="font-semibold text-ink">{formatTRY(o.unitPrice)}</span>
  }

  const StatusSelect = ({ o }: { o: Order }) => (
    <select
      value={o.status}
      onChange={(e) => handleStatusChange(o, e.target.value as OrderStatus)}
      className="rounded-xl border border-line bg-white px-2.5 py-1.5 text-[13px] font-medium text-ink outline-none transition-colors hover:border-navy-600/40 focus:border-navy-600"
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {orderStatusMap[s].label}
        </option>
      ))}
    </select>
  )

  return (
    <div>
      <PageHeader
        eyebrow="SATIŞ"
        title="Siparişler"
        subtitle="Tüm siparişler tek yerde. Yapay zeka çalışanınız DM ve sesli mesajlardan gelen satışları otomatik kaydeder."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Toplam ciro"
          value={formatTRY(revenue)}
          icon={<Wallet size={18} />}
          hint="Ödenen, hazırlanan ve kargolanan siparişler"
        />
        <StatCard
          label="Sipariş sayısı"
          value={orders.length}
          icon={<ShoppingBag size={18} />}
          hint="Tüm kanallardan"
        />
        <StatCard
          label="Ortalama sepet"
          value={formatTRY(avgBasket)}
          icon={<Receipt size={18} />}
          hint="Ciro / tamamlanan sipariş"
        />
      </div>

      <div className="mt-7 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = activeFilter === f.key
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setActiveFilter(f.key)}
              className={
                active
                  ? 'inline-flex items-center gap-1.5 rounded-full bg-navy-700 px-3.5 py-1.5 text-[13px] font-semibold text-white shadow-card'
                  : 'inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] font-medium text-ink-soft transition-colors hover:border-navy-600/40 hover:text-navy-700'
              }
            >
              {f.label}
              <span
                className={
                  active
                    ? 'rounded-full bg-white/20 px-1.5 text-[11px] font-semibold'
                    : 'rounded-full bg-navy-700/8 px-1.5 text-[11px] font-semibold text-navy-700'
                }
              >
                {counts[f.key]}
              </span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<PackageX size={22} />}
            title="Bu filtrede sipariş yok"
            detail="Seçtiğiniz duruma uygun sipariş bulunmuyor. Farklı bir filtre deneyebilirsiniz."
            action={
              activeFilter !== 'all' ? (
                <Button variant="outline" size="sm" onClick={() => setActiveFilter('all')}>
                  Tüm siparişleri göster
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <>
          {/* Desktop tablo */}
          <Card padded={false} className="mt-6 hidden overflow-hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line bg-cream-2/60 text-[12px] font-semibold uppercase tracking-wide text-muted">
                    <th className="px-5 py-3">Ürün</th>
                    <th className="px-5 py-3">Müşteri</th>
                    <th className="px-5 py-3">Kanal</th>
                    <th className="px-5 py-3">Fiyat</th>
                    <th className="px-5 py-3">Toplam</th>
                    <th className="px-5 py-3">Durum</th>
                    <th className="px-5 py-3">Tarih</th>
                    <th className="px-5 py-3">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={o.id} className="border-b border-line/70 last:border-0 hover:bg-cream-2/40">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <ProductThumb emoji={o.productEmoji} accent={accentFor(o)} size={40} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-ink">{o.productName}</p>
                            <span className="text-[12px] text-muted">x{o.qty}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-ink">{o.customerName}</p>
                        <p className="text-[12px] text-muted">{o.customerHandle}</p>
                      </td>
                      <td className="px-5 py-4">
                        <ChannelTag channel={o.channel} />
                      </td>
                      <td className="px-5 py-4">
                        <PriceCell o={o} />
                      </td>
                      <td className="px-5 py-4 font-semibold text-navy-700">{formatTRY(o.total)}</td>
                      <td className="px-5 py-4">
                        <Badge style={orderStatusMap[o.status]} />
                      </td>
                      <td className="px-5 py-4 text-[13px] text-muted">{timeAgo(o.createdAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <StatusSelect o={o} />
                          {o.status === 'awaiting-stock' && (
                            <Link to="/stok">
                              <Button variant="ghost" size="sm">
                                Stok Yönetimi
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobil kart listesi */}
          <div className="mt-6 flex flex-col gap-3 lg:hidden">
            {filtered.map((o) => (
              <Card key={o.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <ProductThumb emoji={o.productEmoji} accent={accentFor(o)} size={44} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{o.productName}</p>
                      <span className="text-[12px] text-muted">x{o.qty}</span>
                    </div>
                  </div>
                  <Badge style={orderStatusMap[o.status]} />
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-line/70 pt-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{o.customerName}</p>
                    <p className="text-[12px] text-muted">{o.customerHandle}</p>
                  </div>
                  <ChannelTag channel={o.channel} />
                </div>

                <div className="mt-3 flex items-end justify-between">
                  <PriceCell o={o} />
                  <div className="text-right">
                    <p className="text-[12px] text-muted">Toplam</p>
                    <p className="font-semibold text-navy-700">{formatTRY(o.total)}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 border-t border-line/70 pt-3">
                  <span className="text-[12px] text-muted">{timeAgo(o.createdAt)}</span>
                  <div className="flex items-center gap-2">
                    {o.status === 'awaiting-stock' && (
                      <Link to="/stok">
                        <Button variant="ghost" size="sm">
                          Stok
                        </Button>
                      </Link>
                    )}
                    <StatusSelect o={o} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
