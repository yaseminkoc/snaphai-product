import { useMemo, useState } from 'react'
import { RefreshCw, Search, Instagram, Eye, ShoppingBag, Tag } from 'lucide-react'
import type { Product } from '@/types'
import { useStore } from '@/store/useStore'
import { formatTRY, formatCompact } from '@/lib/format'
import {
  Button,
  Card,
  PageHeader,
  ProductThumb,
  Badge,
  EmptyState,
} from '@/components/ui'

interface StockBadge {
  label: string
  cls: string
}

function stockBadge(stock: number): StockBadge {
  if (stock === 0) return { label: 'Tükendi', cls: 'bg-rose-500/12 text-rose-600' }
  if (stock <= 3) return { label: `Son ${stock}`, cls: 'bg-amber-500/14 text-amber-700' }
  return { label: `${stock} adet`, cls: 'bg-emerald-500/12 text-emerald-700' }
}

export function Products() {
  const products = useStore((s) => s.products)
  const store = useStore((s) => s.store)
  const updateProduct = useStore((s) => s.updateProduct)
  const pushToast = useStore((s) => s.pushToast)

  const [activeCategory, setActiveCategory] = useState<string>('Tümü')
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftPrice, setDraftPrice] = useState<number>(0)
  const [draftStock, setDraftStock] = useState<number>(0)

  const categories = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => set.add(p.category))
    return ['Tümü', ...Array.from(set)]
  }, [products])

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR')
    return products.filter((p) => {
      if (activeCategory !== 'Tümü' && p.category !== activeCategory) return false
      if (!q) return true
      const haystack = [p.name, ...p.tags].join(' ').toLocaleLowerCase('tr-TR')
      return haystack.includes(q)
    })
  }, [products, activeCategory, query])

  function startEdit(p: Product) {
    setEditingId(p.id)
    setDraftPrice(p.price)
    setDraftStock(p.stock)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  function saveEdit(p: Product) {
    const nextPrice = Number.isFinite(draftPrice) ? Math.max(0, Math.round(draftPrice)) : p.price
    const nextStock = Number.isFinite(draftStock) ? Math.max(0, Math.round(draftStock)) : p.stock
    updateProduct(p.id, { price: nextPrice, stock: nextStock })
    setEditingId(null)
    pushToast({
      title: 'Ürün güncellendi',
      detail: `${p.name} için yeni değerler kaydedildi.`,
      tone: 'success',
    })
  }

  function rescan() {
    pushToast({
      title: 'Tarama başlatıldı',
      detail: 'Yeni gönderiler analiz ediliyor…',
      tone: 'info',
    })
  }

  return (
    <div>
      <PageHeader
        eyebrow="KATALOG"
        title="Ürünler"
        subtitle="Instagram profilinizden otomatik ayıklandı. Fiyat, alt limit ve stok değerlerini buradan güncelleyebilirsiniz."
        actions={
          <Button variant="soft" onClick={rescan}>
            <RefreshCw size={16} />
            Profili yeniden tara
          </Button>
        }
      />

      {/* Bilgi şeridi */}
      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-line bg-cream-2 px-4 py-3 text-[13px] text-ink-soft">
        <span className="flex h-8 w-8 flex-none items-center justify-center rounded-xl bg-gold-grad text-navy-900">
          <Instagram size={16} />
        </span>
        <span>
          <span className="font-semibold text-navy-700">{products.length} ürün</span> •{' '}
          {categories.length - 1} kategori{' '}
          <span className="font-semibold text-navy-700">{store.handle}</span> profilinden içe
          aktarıldı
        </span>
      </div>

      {/* Filtre + arama */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = cat === activeCategory
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={
                  'rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ' +
                  (active
                    ? 'bg-navy-700 text-white'
                    : 'bg-navy-700/8 text-navy-700 hover:bg-navy-700/14')
                }
              >
                {cat}
              </button>
            )
          })}
        </div>
        <div className="relative lg:w-72">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="İsim veya etikete göre ara…"
            className="w-full rounded-full border border-line bg-white py-2.5 pl-9 pr-4 text-[14px] text-ink placeholder:text-muted focus-ring"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search size={20} />}
          title="Ürün bulunamadı"
          detail="Arama veya kategori filtrenizle eşleşen ürün yok. Filtreleri değiştirmeyi deneyebilirsiniz."
          action={
            <Button
              variant="soft"
              size="sm"
              onClick={() => {
                setQuery('')
                setActiveCategory('Tümü')
              }}
            >
              Filtreleri temizle
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const sb = stockBadge(p.stock)
            const editing = editingId === p.id
            return (
              <Card key={p.id} className="flex flex-col">
                {/* Başlık satırı */}
                <div className="flex items-start gap-3">
                  <ProductThumb emoji={p.emoji} accent={p.accent} size={56} />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-[16px] font-semibold leading-tight text-navy-700">
                      {p.name}
                    </h3>
                    <p className="mt-0.5 text-[12px] text-muted">{p.category}</p>
                  </div>
                  <Badge cls={sb.cls}>{sb.label}</Badge>
                </div>

                {/* Açıklama */}
                <p className="mt-3 max-h-[40px] overflow-hidden text-[13px] leading-snug text-ink-soft">
                  {p.description}
                </p>

                {/* Kaynak */}
                <p className="mt-2 text-[12px] text-muted">Kaynak: {p.sourcePost}</p>

                {/* Fiyat / istatistik */}
                {editing ? (
                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4">
                    <label className="text-[12px] font-semibold text-ink-soft">
                      Fiyat (₺)
                      <input
                        type="number"
                        min={0}
                        value={draftPrice}
                        onChange={(e) => setDraftPrice(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-[14px] font-normal text-ink focus-ring"
                      />
                    </label>
                    <label className="text-[12px] font-semibold text-ink-soft">
                      Stok (adet)
                      <input
                        type="number"
                        min={0}
                        value={draftStock}
                        onChange={(e) => setDraftStock(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-[14px] font-normal text-ink focus-ring"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="mt-4 flex items-end justify-between border-t border-line pt-4">
                    <div>
                      <p className="font-display text-[22px] font-semibold text-navy-700">
                        {formatTRY(p.price)}
                      </p>
                      <p className="mt-0.5 text-[12px] text-muted">
                        Alt limit: {formatTRY(p.floorPrice)}
                      </p>
                    </div>
                    <div className="text-right text-[12px] text-muted">
                      <span className="inline-flex items-center gap-1">
                        <ShoppingBag size={13} />
                        {p.sold} satış
                      </span>
                      <br />
                      <span className="inline-flex items-center gap-1">
                        <Eye size={13} />
                        {formatCompact(p.views)} görüntülenme
                      </span>
                    </div>
                  </div>
                )}

                {/* Etiketler */}
                {p.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded-full bg-navy-700/6 px-2 py-0.5 text-[11px] font-medium text-ink-soft"
                      >
                        <Tag size={10} />
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Aksiyonlar */}
                <div className="mt-4 flex gap-2">
                  {editing ? (
                    <>
                      <Button variant="gold" size="sm" onClick={() => saveEdit(p)}>
                        Kaydet
                      </Button>
                      <Button variant="ghost" size="sm" onClick={cancelEdit}>
                        Vazgeç
                      </Button>
                    </>
                  ) : (
                    <Button variant="soft" size="sm" onClick={() => startEdit(p)}>
                      Düzenle
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
