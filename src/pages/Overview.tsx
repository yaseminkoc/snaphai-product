import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Wallet,
  ShoppingBag,
  MessagesSquare,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import type { TooltipProps } from 'recharts'

import { useStore } from '@/store/useStore'
import { mockRevenueWeek } from '@/data/mockData'
import { formatTRY, formatDate, formatNumber, pct } from '@/lib/format'
import { orderStatusMap } from '@/lib/labels'
import {
  PageHeader,
  StatCard,
  Card,
  CardHeader,
  Button,
  Badge,
  ProductThumb,
  Mascot,
} from '@/components/ui'

/* Grafik tooltip'i — sadece ciro tutarını gösterir. */
function RevenueTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null
  const value = payload[0]?.value ?? 0
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 shadow-md">
      <p className="text-[12px] font-semibold text-muted">{label}</p>
      <p className="font-display text-[15px] font-semibold text-navy-700">
        {formatTRY(typeof value === 'number' ? value : 0)}
      </p>
    </div>
  )
}

export function Overview() {
  const navigate = useNavigate()

  const store = useStore((s) => s.store)
  const products = useStore((s) => s.products)
  const orders = useStore((s) => s.orders)
  const stockAlerts = useStore((s) => s.stockAlerts)
  const computeReport = useStore((s) => s.computeReport)

  const report = computeReport()

  const openAlerts = useMemo(
    () => stockAlerts.filter((a) => a.status === 'open'),
    [stockAlerts],
  )

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders])

  const topProducts = useMemo(
    () => [...products].sort((a, b) => b.sold - a.sold).slice(0, 5),
    [products],
  )

  const today = formatDate(new Date().toISOString())

  return (
    <div>
      <PageHeader
        eyebrow="GENEL BAKIŞ"
        title={`Merhaba, ${store.name}`}
        subtitle={`${today} — yapay zeka çalışanınız bugün mağazanızı sizin için yönetiyor.`}
        actions={
          <>
            <Button variant="gold" onClick={() => navigate('/store')}>
              Müşteri Demosu
            </Button>
            <Button variant="soft" onClick={() => navigate('/report')}>
              Sesli Rapor
            </Button>
          </>
        }
      />

      {/* Stok uyarı bandı */}
      {openAlerts.length > 0 && (
        <div className="mb-6 flex flex-col gap-3 rounded-[20px] border border-gold-400/50 bg-gold-300/25 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-gold-400/40 text-gold-600">
              <AlertTriangle size={20} />
            </span>
            <div>
              <p className="font-display text-[15px] font-semibold text-navy-700">
                {openAlerts.length} üründe stok açığı — kararınız bekleniyor
              </p>
              <p className="mt-0.5 text-[13px] text-ink-soft">
                Talebi karşılamak için tedarik veya müşteri bilgilendirme kararınızı bekliyoruz.
              </p>
            </div>
          </div>
          <Button variant="navy" size="sm" onClick={() => navigate('/stock')}>
            Stok Yönetimi
          </Button>
        </div>
      )}

      {/* Özet kartları */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Bugünkü ciro"
          value={formatTRY(report.revenue)}
          icon={<Wallet size={18} />}
          delta="bu hafta"
          deltaTone="up"
        />
        <StatCard
          label="Sipariş"
          value={formatNumber(report.orderCount)}
          icon={<ShoppingBag size={18} />}
        />
        <StatCard
          label="Yanıtlanan mesaj"
          value={formatNumber(report.messagesHandled)}
          icon={<MessagesSquare size={18} />}
          hint={`${report.voiceMessages} sesli`}
        />
        <StatCard
          label="Dönüşüm"
          value={pct(report.conversionRate)}
          icon={<TrendingUp size={18} />}
          delta="istikrarlı"
          deltaTone="up"
        />
      </div>

      {/* Grafik + AI özeti */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader title="Haftalık ciro" subtitle="Son 7 gün" />
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockRevenueWeek} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d8b96a" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#d8b96a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#e9e2d3" strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: '#8a8578' }}
                  dy={6}
                />
                <YAxis
                  width={0}
                  tick={false}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 'dataMax + 2000']}
                />
                <Tooltip content={<RevenueTooltip />} cursor={{ stroke: '#b8862f', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#b8862f"
                  strokeWidth={2.5}
                  fill="url(#revenueFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Yapay zeka çalışanı bugün"
            subtitle="Günün öne çıkanları"
            action={<Mascot size={46} float />}
          />
          <ul className="flex flex-col gap-3">
            {report.highlights.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 size={18} className="mt-0.5 flex-none text-gold-600" />
                <span className="text-[14px] leading-snug text-ink-soft">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-navy-700/6 px-3.5 py-2.5">
            <span className="relative flex h-2.5 w-2.5 flex-none">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-navy-700">
              <Sparkles size={15} className="text-gold-600" /> AI aktif — mesajlarınız otomatik yanıtlanıyor
            </span>
          </div>
        </Card>
      </div>

      {/* Alt satır: son siparişler + en çok satanlar */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Son siparişler"
            subtitle="En güncel işlemler"
            action={
              <Link
                to="/orders"
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-gold-600 transition-colors hover:text-gold-500"
              >
                Tümü <ArrowRight size={15} />
              </Link>
            }
          />
          <ul className="flex flex-col divide-y divide-line">
            {recentOrders.map((o) => (
              <li key={o.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <ProductThumb emoji={o.productEmoji} accent="#0f2447" size={42} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-ink">{o.productName}</p>
                  <p className="truncate text-[12px] text-muted">{o.customerName}</p>
                </div>
                <div className="flex flex-none flex-col items-end gap-1">
                  <span className="font-display text-[14px] font-semibold text-navy-700">
                    {formatTRY(o.total)}
                  </span>
                  <Badge style={orderStatusMap[o.status]} />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="En çok satanlar"
            subtitle="Bu ayın öne çıkan ürünleri"
            action={
              <Link
                to="/products"
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-gold-600 transition-colors hover:text-gold-500"
              >
                Tümü <ArrowRight size={15} />
              </Link>
            }
          />
          <ul className="flex flex-col divide-y divide-line">
            {topProducts.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-navy-700/8 font-display text-[13px] font-semibold text-navy-700">
                  {i + 1}
                </span>
                <ProductThumb emoji={p.emoji} accent={p.accent} size={42} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-ink">{p.name}</p>
                  <p className="truncate text-[12px] text-muted">{formatNumber(p.sold)} satış</p>
                </div>
                <span className="flex-none font-display text-[14px] font-semibold text-navy-700">
                  {formatTRY(p.price)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
