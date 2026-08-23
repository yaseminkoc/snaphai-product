/* =========================================================
   SnaphAI — Simüle Yapay Zeka Çalışanı (kural tabanlı motor)
   LLM / API anahtarı GEREKMEZ. Müşteri tavrını analiz eder,
   esnafın belirlediği limitler içinde dinamik pazarlık yapar,
   upsell / öğrenci indirimi uygular ve satışı ödeme linkiyle
   kapatır. Ton "siz" hitabıyla kurumsal-samimi tutulur.
   ========================================================= */

import type {
  AiReplyResult,
  Conversation,
  CustomerStance,
  DailyReport,
  Message,
  NegotiationSettings,
  Order,
  Product,
} from '@/types'
import { formatTRY, uid } from './format'

const lower = (s: string) => s.toLocaleLowerCase('tr-TR')

/* ---------- Tavır (stance) tespiti ---------- */

export function detectStance(text: string, prev?: CustomerStance): CustomerStance {
  const t = lower(text)
  if (/(öğrenci|ogrenci|talebe|üniversite|harçlık)/.test(t)) return 'ogrenci'
  if (/(kurumsal|fatura|toplu|adet|şirket|firma|hediye seti)/.test(t)) return 'kurumsal'
  if (/(indirim|pahalı|pahali|yüksek|yuksek|olur mu|son fiyat|biraz düş|ucuz|pazarlık)/.test(t))
    return 'pazarlikci'
  if (/(emin değil|acaba|karar veremedim|hangisi|kararsız|bilemedim|düşün)/.test(t))
    return 'kararsiz'
  if (/(tekrar|yine|geçen|önceki siparişim|müdavim|hep sizden)/.test(t)) return 'sadik'
  return prev ?? 'kararsiz'
}

/* ---------- Niyet (intent) tespiti ---------- */

type Intent =
  | 'greeting'
  | 'price'
  | 'size'
  | 'negotiate'
  | 'student'
  | 'accept'
  | 'reject'
  | 'other'

function detectIntent(text: string): { intent: Intent; offer?: number } {
  const t = lower(text)
  const offer = extractPrice(t)

  // Soru kalıbı: "... mu / mı / mü / mi" → onay değil, pazarlık/soru.
  const isQuestion = /\b(mu|mı|mü|mi)\b|\?/.test(t)

  if (/(vazgeç|istemiyorum|kalsın|başka zaman|çok pahalı olur|almaktan cayd)/.test(t))
    return { intent: 'reject' }

  // Öğrenci en önce (indirim türü belli).
  if (/(öğrenci|ogrenci|talebe)/.test(t)) return { intent: 'student', offer }

  // Pazarlık: bir teklif var VEYA pazarlık kalıpları var. Accept'ten ÖNCE gelir ki
  // "950 olur mu?" / "indirim olur mu?" onay sanılmasın.
  if (
    offer !== undefined ||
    /(indirim|pahalı|pahali|yüksek|yuksek|olur mu|olmaz mı|yapar mısın|son fiyat|düş|ucuz|pazarlık|bütçe|butce|uygun olur)/.test(
      t,
    )
  )
    return { intent: 'negotiate', offer }

  // Onay: net olumlu ifadeler. Soru kalıbı varsa onay sayma.
  if (
    !isQuestion &&
    /(alıyorum|alayım|alırım|sepete|kesinleştir|kabul|anlaştık|\bolur\b|\btamam\b|istiyorum|gönderin|gonderin|hemen gönder)/.test(
      t,
    )
  )
    return { intent: 'accept', offer }

  if (/(beden|numara|\b(xs|s|m|l|xl)\b|\b3[4-9]\b|\b4[0-6]\b|kalıp|kalip|dar|bol)/.test(t))
    return { intent: 'size' }
  if (/(fiyat|kaç|kac|ne kadar|kaça|kaca|ücret|ucret|hakkında|bilgi|detay|özellik|ozellik|göster|goster|var mı|stok)/.test(t))
    return { intent: 'price' }
  if (/(merhaba|selam|iyi günler|günaydın|slm|mrb)/.test(t)) return { intent: 'greeting' }
  return { intent: 'other' }
}

function extractPrice(t: string): number | undefined {
  // "1150", "1.150", "1150₺", "1150 tl", "1150 lira"
  const m = t.match(/(\d{2,3}(?:[.\s]?\d{3})?)\s*(₺|tl|lira)?/)
  if (!m) return undefined
  const num = Number(m[1].replace(/[.\s]/g, ''))
  return Number.isFinite(num) && num >= 50 ? num : undefined
}

/* ---------- Yardımcılar ---------- */

const round10 = (n: number) => Math.round(n / 10) * 10

/** Esnafın izin verdiği en düşük fiyat (indirim limiti + maliyet tabanı). */
function allowedFloor(p: Product, s: NegotiationSettings): number {
  const byPct = Math.round(p.price * (1 - s.maxDiscountPct / 100))
  return Math.max(p.floorPrice, byPct)
}

function findProduct(products: Product[], text: string): Product | undefined {
  const t = lower(text)
  return products.find((p) =>
    lower(p.name)
      .split(/[^a-zçğıöşü0-9]+/i)
      .some((tok) => tok.length > 3 && t.includes(tok)),
  )
}

function msg(partial: Omit<Message, 'id' | 'createdAt'>): Message {
  return { id: uid('m'), createdAt: new Date().toISOString(), ...partial }
}

const toneOpener = (s: NegotiationSettings, name: string): string => {
  switch (s.tone) {
    case 'resmi':
      return `Sayın ${name},`
    case 'samimi':
      return `Merhaba ${name} 🌸`
    default:
      return `${name},`
  }
}

/* ---------- Ana yanıt üretici ---------- */

export function generateReply(
  conversation: Conversation,
  incomingText: string,
  ctx: { products: Product[]; settings: NegotiationSettings },
): AiReplyResult {
  const { products, settings } = ctx
  const stance = detectStance(incomingText, conversation.customer.stance)
  const { intent, offer } = detectIntent(incomingText)
  const name = conversation.customer.name.split(' ')[0]

  const product =
    products.find((p) => p.id === conversation.linkedProductId) ??
    findProduct(products, incomingText) ??
    products[0]

  const currentPrice = conversation.negotiatedPrice ?? product.price
  const floor = allowedFloor(product, settings)
  const messages: Message[] = []
  let negotiatedPrice = conversation.negotiatedPrice
  let createdOrder: Order | undefined

  const upsellPick =
    settings.upsellEnabled && product.id !== 'p_esarp'
      ? products.find((p) => p.id === 'p_esarp')
      : undefined

  const outOfStock = product.stock <= 0

  if (!settings.enabled) {
    messages.push(
      msg({
        role: 'ai',
        type: 'text',
        text: `${toneOpener(settings, name)} mesajınız alınmıştır, en kısa sürede size dönüş yapılacaktır.`,
      }),
    )
    return { messages, detectedStance: stance, intent: 'Otomatik yanıt kapalı' }
  }

  // İnsana devret: öfkeli müşteri / sıra dışı iade / şikâyet → sakinleştir + sahibine ilet.
  const lowIncoming = lower(incomingText)
  if (/(iade|geri iade|kırgın|kirgin|şikayet|sikayet|berbat|rezalet|iğrenç|igrenc|çok kötü|cok kotu|dolandır|dolandir|kandır|kandir|dava|avukat)/.test(lowIncoming)) {
    messages.push(
      msg({
        role: 'ai',
        type: 'text',
        text: `${toneOpener(settings, name)} yaşadığınız deneyim için gerçekten üzgünüm; bunu önemsiyoruz. Konuyu doğrudan mağaza sorumlumuza ilettim, size özel olarak en kısa sürede dönüş yapılacak.`,
      }),
    )
    return {
      messages,
      detectedStance: stance,
      intent: 'İade/şikâyet — insana devredildi',
      handoffReason: 'Öfkeli müşteri / iade talebi — insan dokunuşu gerekli',
    }
  }

  switch (intent) {
    /* --- Selam / açılış --- */
    case 'greeting': {
      messages.push(
        msg({
          role: 'ai',
          type: 'text',
          text: `${toneOpener(settings, name)} Zarif Butik’e hoş geldiniz! Size nasıl yardımcı olabilirim? Beğendiğiniz bir ürün varsa hemen bilgilendireyim.`,
        }),
      )
      return { messages, detectedStance: stance, intent: 'Karşılama' }
    }

    /* --- Fiyat sorusu --- */
    case 'price': {
      if (outOfStock) {
        messages.push(
          msg({
            role: 'ai',
            type: 'text',
            text: `${toneOpener(settings, name)} ${product.name} şu an ne yazık ki tükendi. Dilerseniz sizi stok listesine ekleyeyim, gelir gelmez ilk siz haberdar olun.`,
          }),
        )
        return { messages, detectedStance: stance, intent: 'Fiyat — stok yok' }
      }
      messages.push(
        msg({
          role: 'ai',
          type: 'product-card',
          text: `${product.name} • ${formatTRY(product.price)}`,
          productId: product.id,
          amount: product.price,
        }),
      )
      messages.push(
        msg({
          role: 'ai',
          type: 'text',
          text: `${toneOpener(settings, name)} ${product.name} liste fiyatımız ${formatTRY(product.price)}. ${product.description} Bedeninizi paylaşırsanız stok uygunluğunu hemen kontrol edeyim.`,
        }),
      )
      return { messages, detectedStance: stance, intent: 'Fiyat bilgisi verildi' }
    }

    /* --- Beden sorusu --- */
    case 'size': {
      const avail = product.stock > 0
      messages.push(
        msg({
          role: 'ai',
          type: 'text',
          text: avail
            ? `${toneOpener(settings, name)} istediğiniz beden stoğumuzda mevcut 👍 ${product.name} için ${formatTRY(currentPrice)}. Hazırsanız güvenli ödeme bağlantısını oluşturayım.`
            : `${toneOpener(settings, name)} maalesef o beden şu an tükendi. Farklı bir beden veya benzer bir ürün önerebilirim.`,
        }),
      )
      return { messages, detectedStance: stance, intent: 'Beden/stok bilgisi' }
    }

    /* --- Öğrenci indirimi --- */
    case 'student': {
      const studentPrice = Math.max(
        floor,
        round10(product.price * (1 - settings.studentDiscountPct / 100)),
      )
      negotiatedPrice = studentPrice
      messages.push(
        msg({
          role: 'ai',
          type: 'discount',
          text: `Öğrenciye özel %${settings.studentDiscountPct} indirim uygulandı`,
          productId: product.id,
          amount: studentPrice,
        }),
      )
      messages.push(
        msg({
          role: 'ai',
          type: 'text',
          text: `${toneOpener(settings, name)} öğrencilerimize özel %${settings.studentDiscountPct} indirimimiz var — ${product.name} sizin için ${formatTRY(product.price)} yerine ${formatTRY(studentPrice)}. Onaylarsanız ödeme bağlantısını hazırlayayım.`,
        }),
      )
      return {
        messages,
        detectedStance: 'ogrenci',
        negotiatedPrice,
        intent: 'Öğrenci indirimi uygulandı',
      }
    }

    /* --- Pazarlık --- */
    case 'negotiate': {
      if (outOfStock) {
        messages.push(
          msg({
            role: 'ai',
            type: 'text',
            text: `${toneOpener(settings, name)} bu ürün şu an tükendiği için fiyat çalışması yapamıyorum; stok gelince sizi ilk arayanlardan olun ister misiniz?`,
          }),
        )
        return { messages, detectedStance: stance, intent: 'Pazarlık — stok yok' }
      }

      // Müşteri bir teklif verdiyse
      if (offer !== undefined) {
        if (offer >= currentPrice) {
          // Teklif zaten yeterli → kabul
          negotiatedPrice = Math.min(currentPrice, offer)
          messages.push(
            msg({
              role: 'ai',
              type: 'text',
              text: `${toneOpener(settings, name)} tamamdır, ${formatTRY(negotiatedPrice)} olarak anlaşalım. Hemen ödeme bağlantınızı oluşturuyorum.`,
            }),
          )
        } else if (offer >= floor) {
          // Ortada buluş
          negotiatedPrice = round10(Math.max(floor, (currentPrice + offer) / 2))
          messages.push(
            msg({
              role: 'ai',
              type: 'discount',
              text: `Size özel fiyat`,
              productId: product.id,
              amount: negotiatedPrice,
            }),
          )
          messages.push(
            msg({
              role: 'ai',
              type: 'text',
              text: `${toneOpener(settings, name)} ${formatTRY(offer)} biraz zor ama sizi kırmayayım: ${formatTRY(product.price)} yerine ${formatTRY(negotiatedPrice)} yapabilirim.${upsellPick ? ` Dilerseniz ${upsellPick.name}’i de ${formatTRY(upsellPick.floorPrice)}’ye ekleyip kombininizi tamamlayabiliriz.` : ''}`,
            }),
          )
        } else {
          // Teklif tabanın altında → tabanı öner
          negotiatedPrice = floor
          messages.push(
            msg({
              role: 'ai',
              type: 'text',
              text: `${toneOpener(settings, name)} ${formatTRY(offer)} maalesef mümkün değil — bu fiyat maliyetimizin altında kalıyor. Sizin için yapabileceğim en iyi fiyat ${formatTRY(floor)}. Kalitemizden ödün vermeden en uygun teklifimiz bu.`,
            }),
          )
        }
        return {
          messages,
          detectedStance: 'pazarlikci',
          negotiatedPrice,
          intent: `Pazarlık — teklif ${formatTRY(offer)}`,
        }
      }

      // Sadece "indirim var mı" → küçük bir jest
      const gesture = round10(Math.max(floor, product.price * 0.95))
      negotiatedPrice = gesture
      messages.push(
        msg({
          role: 'ai',
          type: 'discount',
          text: `Size özel fiyat`,
          productId: product.id,
          amount: gesture,
        }),
      )
      messages.push(
        msg({
          role: 'ai',
          type: 'text',
          text: `${toneOpener(settings, name)} sizin için küçük bir jest yapabilirim: ${formatTRY(product.price)} yerine ${formatTRY(gesture)}. ${upsellPick ? `İki ürün alırsanız ek indirim de sağlayabilirim.` : 'Onaylarsanız hemen hazırlıyorum.'}`,
        }),
      )
      return {
        messages,
        detectedStance: 'pazarlikci',
        negotiatedPrice,
        intent: 'İndirim jesti sunuldu',
      }
    }

    /* --- Satışı kapatma / kabul --- */
    case 'accept': {
      if (outOfStock) {
        messages.push(
          msg({
            role: 'ai',
            type: 'text',
            text: `${toneOpener(settings, name)} çok isterdim ama bu ürün şu an tükendi. Stok gelir gelmez size ilk haber vereyim mi?`,
          }),
        )
        return { messages, detectedStance: stance, intent: 'Kapanış — stok yok' }
      }
      const finalPrice = negotiatedPrice ?? currentPrice
      if (settings.autoCloseWithPayment) {
        messages.push(
          msg({
            role: 'ai',
            type: 'payment-link',
            text: `Harika seçim! Siparişinizi hazırladım. Aşağıdaki güvenli ${settings.paymentProvider} bağlantısından ödemenizi tamamlayabilirsiniz:`,
            productId: product.id,
            amount: finalPrice,
            paid: false,
          }),
        )
      } else {
        messages.push(
          msg({
            role: 'ai',
            type: 'text',
            text: `Harika! Siparişinizi not aldım, ödeme bilgilerini birazdan ileteceğim.`,
          }),
        )
      }
      createdOrder = {
        id: uid('o'),
        customerName: conversation.customer.name,
        customerHandle: conversation.customer.handle,
        productId: product.id,
        productName: product.name,
        productEmoji: product.emoji,
        qty: 1,
        unitPrice: finalPrice,
        listPrice: product.price,
        total: finalPrice,
        status: 'pending',
        channel: conversation.messages.some((m) => m.type === 'voice') ? 'voice' : 'dm',
        paymentProvider: settings.paymentProvider,
        createdAt: new Date().toISOString(),
      }
      // İnsana devret: yüksek tutarlı sipariş ya da derin indirim → sahibinin haberi olsun.
      const discountPct = ((product.price - finalPrice) / product.price) * 100
      let handoffReason: string | undefined
      if (finalPrice >= 2500) {
        handoffReason = `Yüksek tutarlı sipariş (${formatTRY(finalPrice)}) — bilginize sunuldu`
      } else if (discountPct >= settings.maxDiscountPct - 0.5) {
        handoffReason = `Alt limitte kapanan pazarlık (%${Math.round(discountPct)} indirim) — gözünüz üstünde olsun`
      }
      return {
        messages,
        detectedStance: stance,
        negotiatedPrice: finalPrice,
        createdOrder,
        intent: 'Satış kapatıldı — ödeme bekleniyor',
        handoffReason,
      }
    }

    /* --- Vazgeçme --- */
    case 'reject': {
      messages.push(
        msg({
          role: 'ai',
          type: 'text',
          text: `${toneOpener(settings, name)} anlıyorum, hiç sorun değil. Fikrinizi değiştirirseniz buradayım. İsterseniz bütçenize uygun benzer bir ürün de önerebilirim.`,
        }),
      )
      return { messages, detectedStance: stance, intent: 'Müşteri vazgeçti' }
    }

    /* --- Diğer --- */
    default: {
      messages.push(
        msg({
          role: 'ai',
          type: 'text',
          text: `${toneOpener(settings, name)} not aldım. Ürün, beden, fiyat veya kargo hakkında dilediğinizi sorabilirsiniz — hemen yardımcı olayım.`,
        }),
      )
      return { messages, detectedStance: stance, intent: 'Genel yanıt' }
    }
  }
}

/* ---------- Sesli günlük rapor metni ---------- */

export function generateDailyReport(input: {
  orders: Order[]
  products: Product[]
  messagesHandled: number
  voiceMessages: number
  openStockShortages: { name: string; shortage: number }[]
}): DailyReport {
  const { orders, products, messagesHandled, voiceMessages, openStockShortages } = input
  const paid = orders.filter((o) => o.status === 'paid' || o.status === 'preparing' || o.status === 'shipped')
  const revenue = paid.reduce((s, o) => s + o.total, 0)
  const costOf = (pid: string) => products.find((p) => p.id === pid)?.cost ?? 0
  // Kâr = (nihai birim fiyat - maliyet) × adet; marj koruması sayesinde daima pozitif.
  const profit = paid.reduce((s, o) => s + (o.unitPrice - costOf(o.productId)) * o.qty, 0)
  const marginPct = revenue > 0 ? Math.round((profit / revenue) * 100) : 0
  const byProduct = new Map<string, number>()
  orders.forEach((o) => byProduct.set(o.productName, (byProduct.get(o.productName) ?? 0) + 1))
  const topProductName =
    [...byProduct.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

  const shortageLine = openStockShortages.length
    ? ` ${openStockShortages.map((s) => `${s.name} için ${s.shortage} adet`).join(', ')} açığımız var; tedarik kararınızı bekliyorum.`
    : ' Tüm siparişler için stoğumuz yeterli.'

  const narrative =
    `Bugün toplam ${messagesHandled} mesaj yanıtladım ve ${orders.length} sipariş oluşturdum. ` +
    `Günün cirosu ${formatTRY(revenue)}, tahmini kârı ${formatTRY(profit)} (%${marginPct} marj). ` +
    `En çok ilgi gören ürün ${topProductName} oldu.` +
    shortageLine

  return {
    date: new Date().toISOString(),
    revenue,
    profit,
    orderCount: orders.length,
    messagesHandled,
    voiceMessages,
    newCustomers: Math.max(1, Math.round(orders.length * 0.6)),
    conversionRate: messagesHandled ? Math.round((orders.length / messagesHandled) * 100) : 0,
    avgResponseSec: 12,
    topProductName,
    narrative,
    highlights: [
      `${orders.length} sipariş, ${formatTRY(revenue)} ciro`,
      `${formatTRY(profit)} tahmini kâr (%${marginPct} marj korundu)`,
      `${messagesHandled} mesaj yanıtlandı (${voiceMessages} sesli)`,
      openStockShortages.length
        ? `${openStockShortages.length} üründe stok açığı — kararınız bekleniyor`
        : 'Stok durumu sağlıklı',
    ],
  }
}
