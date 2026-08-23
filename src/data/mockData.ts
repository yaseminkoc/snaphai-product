/* =========================================================
   SnaphAI — Mock Veri (demo için tek kaynak)
   Tüm veriler istemci tarafında; API anahtarı gerektirmez.
   ========================================================= */

import type {
  Conversation,
  DailyReport,
  Insight,
  NegotiationSettings,
  Order,
  PlanInfo,
  PlanTier,
  Product,
  RevenuePoint,
  StockAlert,
  Store,
} from '@/types'

const now = Date.now()
const minAgo = (m: number) => new Date(now - m * 60_000).toISOString()
const hrAgo = (h: number) => new Date(now - h * 3_600_000).toISOString()
const dayAgo = (d: number) => new Date(now - d * 86_400_000).toISOString()

/* ---------------- Mağaza ---------------- */

export const mockStore: Store = {
  id: 'store_zarif',
  name: 'Zarif Butik',
  handle: '@zarifbutik',
  category: 'Kadın Giyim',
  bio: 'Zamansız parçalar, özenli dikim. İstanbul’dan tüm Türkiye’ye.',
  avatarInitials: 'ZB',
  followers: 24_800,
  plan: 'profesyonel',
  connectedAt: dayAgo(28),
  city: 'İstanbul',
}

/* ---------------- Ürünler ---------------- */

export const mockProducts: Product[] = [
  {
    id: 'p_saten',
    name: 'Saten Elbise — Bordo',
    description: 'Işıltılı saten kumaş, midi boy, gizli fermuar. Davet ve özel günler için.',
    price: 1290,
    floorPrice: 990,
    cost: 620,
    stock: 8,
    emoji: '👗',
    accent: '#7d2836',
    category: 'Elbise',
    sourcePost: '2024 Kış Koleksiyonu • Gönderi #14',
    importedAt: dayAgo(28),
    tags: ['davet', 'saten', 'midi'],
    sold: 42,
    views: 3120,
  },
  {
    id: 'p_triko',
    name: 'Triko Kazak — Krem',
    description: 'Yumuşak akrilik karışım, boğazlı yaka, oversize kesim.',
    price: 690,
    floorPrice: 520,
    cost: 300,
    stock: 3,
    emoji: '🧥',
    accent: '#c9a24b',
    category: 'Üst Giyim',
    sourcePost: 'Sonbahar Bazikleri • Gönderi #9',
    importedAt: dayAgo(21),
    tags: ['triko', 'günlük', 'oversize'],
    sold: 67,
    views: 4890,
  },
  {
    id: 'p_kase',
    name: 'Kaşe Palto — Camel',
    description: 'Yün karışımı kaşe, çift sıra düğme, astarlı. Klasik ve şık.',
    price: 2450,
    floorPrice: 1990,
    cost: 1250,
    stock: 5,
    emoji: '🧥',
    accent: '#a97b3f',
    category: 'Dış Giyim',
    sourcePost: '2024 Kış Koleksiyonu • Gönderi #21',
    importedAt: dayAgo(18),
    tags: ['palto', 'kaşe', 'kış'],
    sold: 23,
    views: 2740,
  },
  {
    id: 'p_sifon',
    name: 'Şifon Bluz — Pudra',
    description: 'Hafif şifon, fırfır detay, uzun kol. Ofis ve günlük kombinlere.',
    price: 540,
    floorPrice: 420,
    cost: 240,
    stock: 12,
    emoji: '👚',
    accent: '#d8a7a1',
    category: 'Üst Giyim',
    sourcePost: 'Yeni Sezon • Gönderi #3',
    importedAt: dayAgo(12),
    tags: ['bluz', 'ofis', 'şifon'],
    sold: 38,
    views: 2210,
  },
  {
    id: 'p_deri',
    name: 'Deri Ceket — Siyah',
    description: 'Suni deri, fermuarlı, çıtçıt detaylı. Her kombinle uyumlu.',
    price: 2890,
    floorPrice: 2400,
    cost: 1600,
    stock: 0,
    emoji: '🧥',
    accent: '#2a2a2e',
    category: 'Dış Giyim',
    sourcePost: 'En Çok Beğenilenler • Gönderi #7',
    importedAt: dayAgo(9),
    tags: ['deri', 'ceket', 'çok satan'],
    sold: 91,
    views: 6410,
  },
  {
    id: 'p_etek',
    name: 'Midi Etek — Ekru',
    description: 'Pileli midi etek, beli lastikli, dökümlü kumaş.',
    price: 780,
    floorPrice: 640,
    cost: 360,
    stock: 6,
    emoji: '👗',
    accent: '#cdbfa3',
    category: 'Alt Giyim',
    sourcePost: 'Yeni Sezon • Gönderi #5',
    importedAt: dayAgo(7),
    tags: ['etek', 'midi', 'pileli'],
    sold: 29,
    views: 1980,
  },
  {
    id: 'p_esarp',
    name: 'İpek Eşarp — Desenli',
    description: '%100 ipek görünümlü, 90x90 cm, canlı desen. İdeal hediye.',
    price: 420,
    floorPrice: 350,
    cost: 180,
    stock: 20,
    emoji: '🧣',
    accent: '#3f6b7d',
    category: 'Aksesuar',
    sourcePost: 'Aksesuar • Gönderi #11',
    importedAt: dayAgo(5),
    tags: ['eşarp', 'hediye', 'ipek'],
    sold: 54,
    views: 3300,
  },
  {
    id: 'p_kot',
    name: 'Kot Pantolon — Yüksek Bel',
    description: 'Yüksek bel, hafif esnek, mom fit. Tüm bedenlerde mevcut.',
    price: 890,
    floorPrice: 720,
    cost: 420,
    stock: 9,
    emoji: '👖',
    accent: '#3b5a7a',
    category: 'Alt Giyim',
    sourcePost: 'Denim • Gönderi #17',
    importedAt: dayAgo(3),
    tags: ['kot', 'yüksek bel', 'mom'],
    sold: 46,
    views: 2870,
  },
]

/* ---------------- Sohbetler ---------------- */

export const mockConversations: Conversation[] = [
  {
    id: 'c_elif',
    customer: {
      id: 'cust_elif',
      name: 'Elif Yıldız',
      handle: '@elifyildiz',
      avatarInitials: 'EY',
      stance: 'pazarlikci',
      isReturning: false,
    },
    status: 'closed-won',
    lastActivity: minAgo(18),
    intent: 'İndirim istiyor — Saten Elbise',
    linkedProductId: 'p_saten',
    negotiatedPrice: 1150,
    unread: 0,
    messages: [
      { id: 'm1', role: 'customer', type: 'text', text: 'Merhaba, bordo saten elbisenin fiyatı nedir?', createdAt: minAgo(34) },
      { id: 'm2', role: 'ai', type: 'text', text: 'Merhaba Elif Hanım 🌸 Bordo Saten Elbise’miz 1.290 ₺. Midi boy, davetler için ideal. Bedeninizi paylaşırsanız uygunluğu hemen kontrol edeyim.', createdAt: minAgo(33) },
      { id: 'm3', role: 'customer', type: 'text', text: '38 beden. Biraz yüksek geldi, 950 olur mu?', createdAt: minAgo(31) },
      { id: 'm4', role: 'ai', type: 'text', text: '38 beden stoğumuzda mevcut 👍 950 ₺ maalesef mümkün değil ancak size özel 1.150 ₺ yapabilirim. İsterseniz İpek Eşarp’ı da 350 ₺ yerine 300 ₺’ye ekleyerek şık bir kombin tamamlayabiliriz.', createdAt: minAgo(30) },
      { id: 'm5', role: 'customer', type: 'text', text: 'Tamam 1.150’ye alayım, eşarp gerek yok.', createdAt: minAgo(20) },
      { id: 'm6', role: 'ai', type: 'payment-link', text: 'Harika seçim! Siparişinizi hazırladım. Aşağıdaki güvenli bağlantıdan ödemenizi tamamlayabilirsiniz:', productId: 'p_saten', amount: 1150, paid: true, createdAt: minAgo(19) },
      { id: 'm7', role: 'system', type: 'text', text: 'Ödeme alındı • iyzico • 1.150 ₺', createdAt: minAgo(18) },
    ],
  },
  {
    id: 'c_mert',
    customer: {
      id: 'cust_mert',
      name: 'Mert Kaya',
      handle: '@mertkaya',
      avatarInitials: 'MK',
      stance: 'ogrenci',
      isReturning: false,
    },
    status: 'active',
    lastActivity: minAgo(4),
    intent: 'Öğrenci indirimi — Triko Kazak',
    linkedProductId: 'p_triko',
    unread: 2,
    messages: [
      { id: 'm1', role: 'customer', type: 'text', text: 'Krem triko kazak var mı? Öğrenciyim, uygun olur mu acaba?', createdAt: minAgo(9) },
      { id: 'm2', role: 'ai', type: 'text', text: 'Merhaba Mert Bey! Krem Triko Kazak stokta 👍 Liste fiyatı 690 ₺. Öğrencilerimize özel %10 indirimimiz mevcut — sizin için 621 ₺ olur.', createdAt: minAgo(8) },
      { id: 'm3', role: 'customer', type: 'text', text: 'Süper, M beden var mı peki?', createdAt: minAgo(4) },
    ],
  },
  {
    id: 'c_ayse',
    customer: {
      id: 'cust_ayse',
      name: 'Ayşe Demir',
      handle: '@aysedemir',
      avatarInitials: 'AD',
      stance: 'kurumsal',
      isReturning: false,
    },
    status: 'awaiting',
    lastActivity: hrAgo(2),
    intent: 'Toplu alım — Kaşe Palto',
    linkedProductId: 'p_kase',
    unread: 0,
    handoffReason: 'Yüksek tutarlı toplu sipariş (10.750 ₺) — fiyat onayınız gerekli',
    messages: [
      { id: 'm1', role: 'customer', type: 'text', text: 'İyi günler. Camel kaşe paltodan kurumsal hediye için 5 adet almak istiyoruz. Fatura kesebiliyor musunuz?', createdAt: hrAgo(3) },
      { id: 'm2', role: 'ai', type: 'text', text: 'İyi günler Ayşe Hanım. Elbette, kurumsal faturamız mevcut. 5 adet Kaşe Palto için toplu alım avantajı sunabiliriz: adedi 2.450 ₺ yerine 2.150 ₺ (toplam 10.750 ₺). Beden dağılımını iletirseniz stok ve teslim süresini netleştireyim.', createdAt: hrAgo(3) },
      { id: 'm3', role: 'customer', type: 'text', text: 'Teşekkürler, yönetimle görüşüp döneceğim.', createdAt: hrAgo(2) },
    ],
  },
  {
    id: 'c_zeynep',
    customer: {
      id: 'cust_zeynep',
      name: 'Zeynep Ak',
      handle: '@zeynepak',
      avatarInitials: 'ZA',
      stance: 'kararsiz',
      isReturning: false,
    },
    status: 'active',
    lastActivity: minAgo(11),
    intent: 'Sesli mesaj — ürün karşılaştırma',
    linkedProductId: 'p_sifon',
    unread: 1,
    messages: [
      { id: 'm1', role: 'customer', type: 'voice', text: '', transcript: 'Selam, pudra şifon bluz ile ekru midi etek birbirine uyar mı, kombinlemek istiyorum da emin olamadım.', audioDurationSec: 8, createdAt: minAgo(13) },
      { id: 'm2', role: 'ai', type: 'voice', text: 'Merhaba Zeynep Hanım! Pudra Şifon Bluz ile Ekru Midi Etek çok uyumlu bir ikili — yumuşak tonlar birbirini tamamlıyor. İkisini birlikte alırsanız kombin indirimiyle toplam 1.220 ₺ yerine 1.150 ₺ yapabilirim. Dilerseniz görsel de gönderebilirim.', audioDurationSec: 11, createdAt: minAgo(11) },
    ],
  },
  {
    id: 'c_can',
    customer: {
      id: 'cust_can',
      name: 'Can Öztürk',
      handle: '@canozturk',
      avatarInitials: 'CÖ',
      stance: 'sadik',
      isReturning: true,
    },
    status: 'closed-won',
    lastActivity: hrAgo(5),
    intent: 'Tekrar alım — Kot Pantolon',
    linkedProductId: 'p_kot',
    negotiatedPrice: 820,
    unread: 0,
    messages: [
      { id: 'm1', role: 'customer', type: 'text', text: 'Merhaba, geçen aldığım kot çok iyiydi. Bir tane daha lacivert alabilir miyim?', createdAt: hrAgo(6) },
      { id: 'm2', role: 'ai', type: 'text', text: 'Tekrar hoş geldiniz Can Bey 🙌 Sadık müşterimiz olarak size özel 890 ₺ yerine 820 ₺ uygulayayım. Yüksek bel mom fit, lacivert stokta mevcut.', createdAt: hrAgo(6) },
      { id: 'm3', role: 'customer', type: 'text', text: 'Harika, alıyorum.', createdAt: hrAgo(5) },
      { id: 'm4', role: 'ai', type: 'payment-link', text: 'Teşekkürler! Ödeme bağlantınız hazır:', productId: 'p_kot', amount: 820, paid: true, createdAt: hrAgo(5) },
    ],
  },
  {
    id: 'c_deniz',
    customer: {
      id: 'cust_deniz',
      name: 'Deniz Kılıç',
      handle: '@denizk',
      avatarInitials: 'DK',
      stance: 'kararsiz',
      isReturning: true,
    },
    status: 'awaiting',
    lastActivity: minAgo(6),
    intent: 'İade talebi — memnuniyetsiz müşteri',
    linkedProductId: 'p_sifon',
    unread: 1,
    handoffReason: 'Öfkeli müşteri + sıra dışı iade talebi — insan dokunuşu gerekli',
    messages: [
      { id: 'm1', role: 'customer', type: 'text', text: 'Ürün hiç beklediğim gibi çıkmadı, açıkçası çok kırgınım. İade etmek istiyorum.', createdAt: minAgo(8) },
      { id: 'm2', role: 'ai', type: 'text', text: 'Bunu duyduğuma çok üzüldüm Deniz Hanım; yaşadığınız deneyimi önemsiyoruz. Konuyu doğrudan mağaza sorumlumuza ilettim, size özel olarak en kısa sürede dönüş yapılacak.', createdAt: minAgo(7) },
    ],
  },
]

/* ---------------- Siparişler ---------------- */

export const mockOrders: Order[] = [
  { id: 'o_1', customerName: 'Elif Yıldız', customerHandle: '@elifyildiz', productId: 'p_saten', productName: 'Saten Elbise — Bordo', productEmoji: '👗', qty: 1, unitPrice: 1150, listPrice: 1290, total: 1150, status: 'paid', channel: 'dm', paymentProvider: 'iyzico', createdAt: minAgo(18) },
  { id: 'o_2', customerName: 'Can Öztürk', customerHandle: '@canozturk', productId: 'p_kot', productName: 'Kot Pantolon — Yüksek Bel', productEmoji: '👖', qty: 1, unitPrice: 820, listPrice: 890, total: 820, status: 'preparing', channel: 'dm', paymentProvider: 'iyzico', createdAt: hrAgo(5) },
  { id: 'o_3', customerName: 'Selin Arı', customerHandle: '@selinari', productId: 'p_esarp', productName: 'İpek Eşarp — Desenli', productEmoji: '🧣', qty: 2, unitPrice: 400, listPrice: 420, total: 800, status: 'shipped', channel: 'voice', paymentProvider: 'paytr', createdAt: hrAgo(8) },
  { id: 'o_4', customerName: 'Deniz Kılıç', customerHandle: '@denizkilic', productId: 'p_triko', productName: 'Triko Kazak — Krem', productEmoji: '🧥', qty: 1, unitPrice: 621, listPrice: 690, total: 621, status: 'paid', channel: 'dm', paymentProvider: 'iyzico', createdAt: hrAgo(11) },
  { id: 'o_5', customerName: 'Buse Şahin', customerHandle: '@busesahin', productId: 'p_sifon', productName: 'Şifon Bluz — Pudra', productEmoji: '👚', qty: 1, unitPrice: 540, listPrice: 540, total: 540, status: 'shipped', channel: 'dm', paymentProvider: 'iyzico', createdAt: dayAgo(1) },
  { id: 'o_6', customerName: 'Merve Toprak', customerHandle: '@mervetoprak', productId: 'p_deri', productName: 'Deri Ceket — Siyah', productEmoji: '🧥', qty: 1, unitPrice: 2650, listPrice: 2890, total: 2650, status: 'awaiting-stock', channel: 'dm', paymentProvider: 'iyzico', createdAt: dayAgo(1) },
  { id: 'o_7', customerName: 'Gökçe Ünal', customerHandle: '@gokceunal', productId: 'p_etek', productName: 'Midi Etek — Ekru', productEmoji: '👗', qty: 1, unitPrice: 700, listPrice: 780, total: 700, status: 'paid', channel: 'voice', paymentProvider: 'paytr', createdAt: dayAgo(1) },
  { id: 'o_8', customerName: 'İrem Aydın', customerHandle: '@iremaydin', productId: 'p_kase', productName: 'Kaşe Palto — Camel', productEmoji: '🧥', qty: 1, unitPrice: 2200, listPrice: 2450, total: 2200, status: 'shipped', channel: 'dm', paymentProvider: 'iyzico', createdAt: dayAgo(2) },
  { id: 'o_9', customerName: 'Ceyda Yalçın', customerHandle: '@ceydayalcin', productId: 'p_deri', productName: 'Deri Ceket — Siyah', productEmoji: '🧥', qty: 1, unitPrice: 2890, listPrice: 2890, total: 2890, status: 'awaiting-stock', channel: 'dm', paymentProvider: 'iyzico', createdAt: dayAgo(2) },
  { id: 'o_10', customerName: 'Ahmet Er', customerHandle: '@ahmeter', productId: 'p_kot', productName: 'Kot Pantolon — Yüksek Bel', productEmoji: '👖', qty: 1, unitPrice: 890, listPrice: 890, total: 890, status: 'cancelled', channel: 'dm', paymentProvider: 'iyzico', createdAt: dayAgo(3) },
]

/* ---------------- Stok uyarıları ---------------- */

export const mockStockAlerts: StockAlert[] = [
  { id: 's_deri', productId: 'p_deri', productName: 'Deri Ceket — Siyah', productEmoji: '🧥', demand: 12, available: 0, shortage: 12, status: 'open', createdAt: hrAgo(3) },
  { id: 's_triko', productId: 'p_triko', productName: 'Triko Kazak — Krem', productEmoji: '🧥', demand: 9, available: 3, shortage: 6, status: 'open', createdAt: hrAgo(6) },
]

/* ---------------- Proaktif Devriye (kimse mesaj atmasa bile) ---------------- */

export const mockInsights: Insight[] = [
  {
    id: 'i_newpost',
    kind: 'new-post',
    title: 'Yeni gönderi mağazaya dönüştü',
    detail:
      '@zarifbutik yeni bir gönderi paylaştı; “İpek Eşarp — Lacivert” otomatik olarak kataloğa çıkarıldı. Onayınızla yayına alınır.',
    productId: 'p_esarp',
    productName: 'İpek Eşarp — Lacivert',
    productEmoji: '🧣',
    severity: 'action',
    actionLabel: 'Yayına al',
    createdAt: minAgo(22),
    status: 'open',
  },
  {
    id: 'i_reorder',
    kind: 'reorder',
    title: 'Sadık müşteri için tekrar alışveriş zamanı',
    detail:
      'Can Öztürk son siparişini 34 gün önce verdi; benzer ritimde yeni alım bekleniyor. Nazik bir hatırlatma dönüşü artırabilir.',
    severity: 'action',
    actionLabel: 'Hatırlatma gönder',
    createdAt: hrAgo(1),
    status: 'open',
  },
  {
    id: 'i_slow',
    kind: 'slow-mover',
    title: '10 gündür hiç satış yok',
    detail:
      'Kaşe Palto — Camel 10 gündür sipariş almadı ve görüntülenme düşüyor. Hedefli bir kampanya stok devir hızını artırabilir.',
    productId: 'p_kase',
    productName: 'Kaşe Palto — Camel',
    productEmoji: '🧥',
    severity: 'warn',
    actionLabel: 'Kampanya öner',
    createdAt: hrAgo(3),
    status: 'open',
  },
  {
    id: 'i_predict',
    kind: 'low-stock',
    title: 'Hızlı tükeniyor — tedarik zamanı',
    detail:
      'Kot Pantolon — Yüksek Bel günde ~2 satış hızında; mevcut 9 adet yaklaşık 4 günde biter. Şimdi tedarik ederseniz satış kaybı yaşanmaz.',
    productId: 'p_kot',
    productName: 'Kot Pantolon — Yüksek Bel',
    productEmoji: '👖',
    severity: 'action',
    actionLabel: 'Tedarik başlat',
    createdAt: hrAgo(7),
    status: 'open',
  },
  {
    id: 'i_margin',
    kind: 'margin',
    title: 'Marj eşiğine yaklaşıldı',
    detail:
      'Deri Ceket — Siyah’ta son pazarlıklar belirlediğiniz alt limite dayandı. Alt limiti gözden geçirerek kârlılığı koruyabilirsiniz.',
    productId: 'p_deri',
    productName: 'Deri Ceket — Siyah',
    productEmoji: '🧥',
    severity: 'warn',
    actionLabel: 'Alt limiti gözden geçir',
    createdAt: hrAgo(9),
    status: 'open',
  },
  {
    id: 'i_price',
    kind: 'price-change',
    title: 'Gönderide fiyat değişikliği algılandı',
    detail:
      'Kaşe Palto — Camel için son gönderide fiyat 2.450 ₺ → 2.650 ₺ güncellenmiş görünüyor. Kataloğu eşitlemek ister misiniz?',
    productId: 'p_kase',
    productName: 'Kaşe Palto — Camel',
    productEmoji: '🧥',
    severity: 'info',
    actionLabel: 'Kataloğu güncelle',
    createdAt: dayAgo(1),
    status: 'open',
  },
]

/* ---------------- Haftalık ciro ---------------- */

export const mockRevenueWeek: RevenuePoint[] = [
  { label: 'Pzt', revenue: 4820, orders: 6 },
  { label: 'Sal', revenue: 6310, orders: 9 },
  { label: 'Çar', revenue: 5580, orders: 7 },
  { label: 'Per', revenue: 8140, orders: 11 },
  { label: 'Cum', revenue: 9760, orders: 14 },
  { label: 'Cmt', revenue: 12480, orders: 18 },
  { label: 'Bugün', revenue: 7231, orders: 10 },
]

/* ---------------- Günlük rapor ---------------- */

export const mockDailyReport: DailyReport = {
  date: new Date(now).toISOString(),
  revenue: 7231,
  profit: 3180,
  orderCount: 10,
  messagesHandled: 47,
  voiceMessages: 8,
  newCustomers: 6,
  conversionRate: 34,
  avgResponseSec: 12,
  topProductName: 'Deri Ceket — Siyah',
  narrative:
    'Bugün toplam 47 mesaj yanıtladım ve 10 sipariş oluşturdum. Günün cirosu 7.231 lira. En çok ilgi gören ürün Siyah Deri Ceket oldu; ancak stoğumuz tükendiği için 12 müşteri sırada bekliyor. Ayrıca Krem Triko Kazak için 6 adetlik bir açık var. Bu iki ürün için tedarik kararınızı bekliyorum.',
  highlights: [
    '10 sipariş, 7.231 ₺ ciro',
    '47 mesaj yanıtlandı (8 sesli)',
    'Dönüşüm oranı %34',
    '2 üründe stok açığı — kararınız bekleniyor',
  ],
}

/* ---------------- Ayarlar ---------------- */

export const defaultSettings: NegotiationSettings = {
  enabled: true,
  maxDiscountPct: 15,
  studentDiscountPct: 10,
  upsellEnabled: true,
  autoCloseWithPayment: true,
  paymentProvider: 'iyzico',
  tone: 'dengeli',
  voiceReplies: true,
  workingHours: '09:00 - 22:00',
}

/* ---------------- Planlar ---------------- */

// Fiyatlar marka sitesi (snaphai.com/#fiyat) ile birebir uyumludur.
export const plans: Record<PlanTier, PlanInfo> = {
  baslangic: {
    tier: 'baslangic',
    name: 'Başlangıç',
    tagline: 'Yeni başlayan butikler',
    priceMonthly: 899,
    color: '#5f6a80',
  },
  profesyonel: {
    tier: 'profesyonel',
    name: 'Profesyonel',
    tagline: 'Büyüyen butikler',
    priceMonthly: 1899,
    color: '#c9a24b',
  },
  kurumsal: {
    tier: 'kurumsal',
    name: 'Kurumsal',
    tagline: 'Yüksek hacim ve ajanslar',
    priceMonthly: 0,
    priceLabel: 'Size Özel',
    color: '#0f2447',
  },
}

/* ---------------- Onboarding tarama adımları ---------------- */

export const scanSteps = [
  { label: 'Instagram profiline bağlanılıyor', detail: '@zarifbutik • Meta Graph API' },
  { label: 'Gönderiler taranıyor', detail: '184 gönderi analiz ediliyor' },
  { label: 'Ürünler ayıklanıyor', detail: 'Görsel + açıklama eşleştirme' },
  { label: 'Fiyatlar ve bedenler okunuyor', detail: 'Yorumlardan fiyat tespiti' },
  { label: 'Mağaza veritabanı kuruluyor', detail: '8 ürün, 3 kategori' },
]

/* Onboarding sırasında "keşfedilen" ürünler (kademeli görünür). */
export const discoveredProducts = mockProducts
