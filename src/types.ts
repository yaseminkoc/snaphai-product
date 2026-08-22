/* =========================================================
   SnaphAI — Domain Types (single source of truth)
   Tüm ekranlar ve mock veriler bu tiplere uyar.
   ========================================================= */

export type PlanTier = 'baslangic' | 'profesyonel' | 'kurumsal'

export interface PlanInfo {
  tier: PlanTier
  name: string // "Başlangıç" | "Profesyonel" | "Kurumsal"
  priceMonthly: number
  color: string
}

export interface Store {
  id: string
  name: string
  handle: string // "@zarifbutik"
  category: string // "Kadın Giyim"
  bio: string
  avatarInitials: string
  followers: number
  plan: PlanTier
  connectedAt: string // ISO
  city: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number // liste fiyatı (TRY)
  floorPrice: number // pazarlıkta kabul edilebilir alt limit
  cost: number // maliyet (kâr marjı için)
  stock: number
  emoji: string // görsel placeholder
  accent: string // kart arka plan gradyanı için hex
  category: string
  sourcePost: string // geldiği Instagram gönderisi (ör. "2024 Kış • Post #14")
  importedAt: string // ISO
  tags: string[]
  sold: number
  views: number
}

export type CustomerStance =
  | 'kurumsal'
  | 'pazarlikci'
  | 'ogrenci'
  | 'kararsiz'
  | 'sadik'

export interface Customer {
  id: string
  name: string
  handle: string
  avatarInitials: string
  stance: CustomerStance
  isReturning: boolean
}

export type MessageRole = 'customer' | 'ai' | 'system'
export type MessageType =
  | 'text'
  | 'voice'
  | 'payment-link'
  | 'product-card'
  | 'discount'

export interface Message {
  id: string
  role: MessageRole
  type: MessageType
  text: string
  audioDurationSec?: number // sesli mesaj süresi
  transcript?: string // sesli mesajın metne çevrilmiş hali
  productId?: string
  amount?: number // ödeme linki tutarı
  paid?: boolean
  createdAt: string // ISO
}

export type ConversationStatus =
  | 'active'
  | 'awaiting' // esnaf/müşteri yanıtı bekliyor
  | 'closed-won'
  | 'closed-lost'

export interface Conversation {
  id: string
  customer: Customer
  messages: Message[]
  status: ConversationStatus
  lastActivity: string // ISO
  intent: string // "İndirim istiyor", "Beden soruyor"
  linkedProductId?: string
  negotiatedPrice?: number
  unread: number
}

export type OrderStatus =
  | 'pending' // ödeme bekliyor
  | 'paid'
  | 'preparing'
  | 'shipped'
  | 'cancelled'
  | 'awaiting-stock' // stok açığı nedeniyle beklemede

export type OrderChannel = 'dm' | 'voice'

export interface Order {
  id: string
  customerName: string
  customerHandle: string
  productId: string
  productName: string
  productEmoji: string
  qty: number
  unitPrice: number // pazarlık sonrası nihai birim fiyat
  listPrice: number // pazarlık öncesi liste fiyatı
  total: number
  status: OrderStatus
  channel: OrderChannel
  paymentProvider: 'iyzico' | 'paytr'
  createdAt: string // ISO
}

export type StockAlertStatus =
  | 'open' // esnaf kararı bekliyor
  | 'restocking' // esnaf "tedarik ederim" dedi
  | 'notified' // kalan müşterilere "stok kalmadı" mesajı gönderildi

export interface StockAlert {
  id: string
  productId: string
  productName: string
  productEmoji: string
  demand: number // gelen sipariş/talep adedi
  available: number // stoktaki adet
  shortage: number // demand - available
  status: StockAlertStatus
  createdAt: string // ISO
}

export interface DailyReport {
  date: string // ISO (gün)
  revenue: number
  orderCount: number
  messagesHandled: number
  voiceMessages: number
  newCustomers: number
  conversionRate: number // 0-100
  avgResponseSec: number
  topProductName: string
  narrative: string // sesli okunacak özet metni
  highlights: string[]
}

export interface RevenuePoint {
  label: string // "Pzt", "Sal" ...
  revenue: number
  orders: number
}

export type NegotiationTone = 'resmi' | 'dengeli' | 'samimi'

export interface NegotiationSettings {
  enabled: boolean
  maxDiscountPct: number // esnafın izin verdiği en yüksek indirim
  studentDiscountPct: number // öğrenciye özel indirim
  upsellEnabled: boolean
  autoCloseWithPayment: boolean
  paymentProvider: 'iyzico' | 'paytr'
  tone: NegotiationTone
  voiceReplies: boolean // gelen sesli mesaja sesli yanıt
  workingHours: string // "09:00 - 22:00"
}

/* ---- AI engine dönüş tipleri ---- */

export interface AiReplyResult {
  messages: Message[] // AI'nın ürettiği yanıt(lar)
  detectedStance: CustomerStance
  negotiatedPrice?: number
  createdOrder?: Order
  intent: string
}

export interface ScanProgressStep {
  label: string
  detail: string
}
