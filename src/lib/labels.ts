/* Durum → Türkçe etiket + renk sınıfı eşlemeleri. Tüm ekranlar buradan okur. */

import type {
  ConversationStatus,
  CustomerStance,
  OrderStatus,
  PlanTier,
  StockAlertStatus,
} from '@/types'

export interface LabelStyle {
  label: string
  cls: string // tailwind sınıfları (bg + text)
  dot?: string // nokta rengi
}

export const orderStatusMap: Record<OrderStatus, LabelStyle> = {
  pending: { label: 'Ödeme bekliyor', cls: 'bg-amber-50 text-amber-700', dot: '#d97706' },
  paid: { label: 'Ödendi', cls: 'bg-emerald-50 text-emerald-700', dot: '#059669' },
  preparing: { label: 'Hazırlanıyor', cls: 'bg-sky-50 text-sky-700', dot: '#0284c7' },
  shipped: { label: 'Kargolandı', cls: 'bg-navy-700/10 text-navy-700', dot: '#0f2447' },
  cancelled: { label: 'İptal', cls: 'bg-rose-50 text-rose-600', dot: '#e11d48' },
  'awaiting-stock': { label: 'Stok bekliyor', cls: 'bg-orange-50 text-orange-700', dot: '#ea580c' },
}

export const conversationStatusMap: Record<ConversationStatus, LabelStyle> = {
  active: { label: 'Aktif', cls: 'bg-emerald-50 text-emerald-700', dot: '#059669' },
  awaiting: { label: 'Bekliyor', cls: 'bg-amber-50 text-amber-700', dot: '#d97706' },
  'closed-won': { label: 'Satış tamam', cls: 'bg-navy-700/10 text-navy-700', dot: '#0f2447' },
  'closed-lost': { label: 'Kapandı', cls: 'bg-slate-100 text-slate-500', dot: '#64748b' },
}

export const stockStatusMap: Record<StockAlertStatus, LabelStyle> = {
  open: { label: 'Karar bekliyor', cls: 'bg-orange-50 text-orange-700', dot: '#ea580c' },
  restocking: { label: 'Tedarik ediliyor', cls: 'bg-emerald-50 text-emerald-700', dot: '#059669' },
  notified: { label: 'Müşteriler bilgilendirildi', cls: 'bg-sky-50 text-sky-700', dot: '#0284c7' },
}

export const stanceMap: Record<CustomerStance, LabelStyle> = {
  kurumsal: { label: 'Kurumsal', cls: 'bg-navy-700/10 text-navy-700' },
  pazarlikci: { label: 'Pazarlıkçı', cls: 'bg-amber-50 text-amber-700' },
  ogrenci: { label: 'Öğrenci', cls: 'bg-sky-50 text-sky-700' },
  kararsiz: { label: 'Kararsız', cls: 'bg-slate-100 text-slate-600' },
  sadik: { label: 'Sadık müşteri', cls: 'bg-emerald-50 text-emerald-700' },
}

export const planNameMap: Record<PlanTier, string> = {
  baslangic: 'Başlangıç',
  profesyonel: 'Profesyonel',
  kurumsal: 'Kurumsal',
}
