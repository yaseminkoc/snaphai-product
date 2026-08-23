import {
  Radar,
  TrendingDown,
  PackageSearch,
  Repeat,
  ImagePlus,
  Percent,
  Tag,
  Check,
  X,
  Sparkles,
} from 'lucide-react'
import type { InsightKind } from '@/types'
import { useStore } from '@/store/useStore'
import { timeAgo } from '@/lib/format'
import { PageHeader, Card, Button, Badge, ProductThumb, EmptyState } from '@/components/ui'

interface KindMeta {
  icon: typeof Radar
  label: string
}

const KIND_META: Record<InsightKind, KindMeta> = {
  'slow-mover': { icon: TrendingDown, label: 'Yavaş satan' },
  'low-stock': { icon: PackageSearch, label: 'Stok / talep' },
  'new-post': { icon: ImagePlus, label: 'İçerik → mağaza' },
  reorder: { icon: Repeat, label: 'Tekrar alım' },
  'price-change': { icon: Tag, label: 'Fiyat değişimi' },
  margin: { icon: Percent, label: 'Kâr / marj' },
}

const SEVERITY_CLS: Record<string, string> = {
  action: 'bg-gold-500/15 text-gold-text',
  warn: 'bg-amber-50 text-amber-700',
  info: 'bg-sky-50 text-sky-700',
}

export function Patrol() {
  const insights = useStore((s) => s.insights)
  const resolveInsight = useStore((s) => s.resolveInsight)

  const open = insights.filter((i) => i.status === 'open')
  const done = insights.filter((i) => i.status !== 'open')

  return (
    <div>
      <PageHeader
        eyebrow="PROAKTİF İZLEME"
        title="Proaktif İçgörüler"
        subtitle="SnaphAI yalnızca gelen mesajı yanıtlamaz; kimse yazmasa bile işletmenizi izler ve önünüze hazır aksiyon getirir. Reaktif değil, proaktif."
      />

      {/* Fark vurgusu */}
      <Card className="mb-6 border-gold-300 bg-cream-2">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-navy-700 text-gold-300">
            <Radar size={20} />
          </span>
          <div>
            <p className="font-display text-[16px] font-semibold text-navy-700">
              Rakipler müşteriyi yönetir; SnaphAI ticaret döngüsünü yönetir.
            </p>
            <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">
              Satış, stok, fiyat, müşteri sadakati ve kâr sinyallerini sürekli tarar; içeriği veriye,
              veriyi aksiyona dönüştürür. Aşağıdaki her kart, sizin adınıza hazırladığı bir sonraki adımdır.
            </p>
          </div>
        </div>
      </Card>

      {/* Açık aksiyonlar */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-[18px] font-semibold text-navy-700">
          Bekleyen aksiyonlar
        </h2>
        {open.length > 0 && (
          <span className="rounded-full bg-navy-700/8 px-2.5 py-1 text-[12px] font-semibold text-navy-700">
            {open.length} sinyal
          </span>
        )}
      </div>

      {open.length === 0 ? (
        <EmptyState
          icon={<Radar size={22} />}
          title="Şu an bekleyen içgörü yok"
          detail="Aksiyon gerektiren bir sinyal bulunmuyor. SnaphAI işletmenizi izlemeyi sürdürüyor."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {open.map((it) => {
            const meta = KIND_META[it.kind]
            const Icon = meta.icon
            return (
              <Card key={it.id} className="flex flex-col">
                <div className="flex items-start gap-3">
                  <span
                    className={
                      'flex h-11 w-11 flex-none items-center justify-center rounded-xl ' +
                      (SEVERITY_CLS[it.severity] ?? SEVERITY_CLS.info)
                    }
                  >
                    <Icon size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge cls="bg-navy-700/8 text-navy-700">{meta.label}</Badge>
                      <span className="text-[12px] text-muted">{timeAgo(it.createdAt)}</span>
                    </div>
                    <p className="mt-1.5 font-display text-[16px] font-semibold text-navy-700">
                      {it.title}
                    </p>
                  </div>
                  {it.productId && it.productEmoji && (
                    <ProductThumb emoji={it.productEmoji} accent="#c9a24b" size={40} />
                  )}
                </div>

                <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">{it.detail}</p>

                <div className="mt-4 flex-1" />
                <div className="flex items-center gap-2">
                  <Button variant="gold" size="sm" onClick={() => resolveInsight(it.id, 'done')}>
                    <Check size={15} /> {it.actionLabel}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => resolveInsight(it.id, 'dismissed')}>
                    <X size={15} /> Yoksay
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Sonuçlanan aksiyonlar */}
      {done.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 font-display text-[18px] font-semibold text-navy-700">
            Sonuçlananlar
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {done.map((it) => (
              <div
                key={it.id}
                className="flex items-center gap-3 rounded-2xl border border-line bg-ivory px-4 py-3"
              >
                <span
                  className={
                    'flex h-8 w-8 flex-none items-center justify-center rounded-lg ' +
                    (it.status === 'done' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500')
                  }
                >
                  {it.status === 'done' ? <Check size={16} /> : <X size={16} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-navy-700">{it.title}</p>
                  <p className="text-[12px] text-muted">
                    {it.status === 'done' ? `Uygulandı: ${it.actionLabel}` : 'Yoksayıldı'}
                  </p>
                </div>
                <Sparkles size={15} className="flex-none text-gold-500" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
