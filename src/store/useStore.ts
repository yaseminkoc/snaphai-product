/* =========================================================
   SnaphAI — Global durum (Zustand + localStorage kalıcılığı)
   Tüm ekranların paylaştığı tek gerçek kaynak. Müşteri
   sohbetinde oluşan sipariş, dashboard'da ve stok ekranında
   anında görünür — demo "canlı" hissedilir.
   ========================================================= */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Conversation,
  Customer,
  DailyReport,
  Insight,
  InsightStatus,
  Message,
  NegotiationSettings,
  Order,
  OrderStatus,
  Product,
  StockAlert,
  Store,
} from '@/types'
import {
  defaultSettings,
  mockConversations,
  mockInsights,
  mockOrders,
  mockProducts,
  mockStockAlerts,
  mockStore,
} from '@/data/mockData'
import { generateDailyReport, generateReply } from '@/lib/aiEngine'
import { uid } from '@/lib/format'

interface Toast {
  id: string
  title: string
  detail?: string
  tone: 'success' | 'info' | 'warn'
}

interface AppState {
  onboarded: boolean
  store: Store
  products: Product[]
  orders: Order[]
  conversations: Conversation[]
  stockAlerts: StockAlert[]
  insights: Insight[]
  settings: NegotiationSettings
  sessionMessages: number
  sessionVoice: number
  toasts: Toast[]
  typingConvId: string | null

  /* onboarding */
  completeOnboarding: () => void
  resetOnboarding: () => void

  /* sohbet */
  sendCustomerMessage: (
    convId: string,
    payload: { text?: string; transcript?: string; audioDurationSec?: number; isVoice?: boolean },
  ) => void
  markRead: (convId: string) => void
  startConversation: (customer: Customer, productId: string) => string
  setConversationProduct: (convId: string, productId: string) => void
  appendManualReply: (convId: string, text: string) => void
  payOrder: (orderId: string, convId?: string) => void

  /* siparişler */
  updateOrderStatus: (orderId: string, status: OrderStatus) => void

  /* stok */
  resolveStockAlert: (alertId: string, decision: 'restock' | 'notify') => void

  /* proaktif devriye */
  resolveInsight: (id: string, status: InsightStatus) => void

  /* insana devret (handoff) */
  resolveHandoff: (convId: string) => void

  /* ürünler */
  updateProduct: (id: string, patch: Partial<Product>) => void

  /* ayarlar */
  updateSettings: (patch: Partial<NegotiationSettings>) => void

  /* rapor */
  computeReport: () => DailyReport

  /* toast */
  pushToast: (t: Omit<Toast, 'id'>) => void
  dismissToast: (id: string) => void

  /* demo */
  resetDemo: () => void
}

const seed = () => ({
  onboarded: false,
  store: mockStore,
  products: mockProducts,
  orders: mockOrders,
  conversations: mockConversations,
  stockAlerts: mockStockAlerts,
  insights: mockInsights,
  settings: defaultSettings,
  sessionMessages: 0,
  sessionVoice: 0,
  toasts: [] as Toast[],
  typingConvId: null as string | null,
})

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...seed(),

      completeOnboarding: () => set({ onboarded: true }),
      resetOnboarding: () => set({ onboarded: false }),

      sendCustomerMessage: (convId, payload) => {
        const state = get()
        const conv = state.conversations.find((c) => c.id === convId)
        if (!conv) return

        const isVoice = !!payload.isVoice
        const userText = payload.transcript ?? payload.text ?? ''

        const userMsg: Message = {
          id: uid('m'),
          role: 'customer',
          type: isVoice ? 'voice' : 'text',
          text: isVoice ? '' : userText,
          transcript: isVoice ? userText : undefined,
          audioDurationSec: payload.audioDurationSec,
          createdAt: new Date().toISOString(),
        }

        const withUser: Conversation = {
          ...conv,
          messages: [...conv.messages, userMsg],
          lastActivity: userMsg.createdAt,
        }

        const result = generateReply(withUser, userText, {
          products: state.products,
          settings: state.settings,
        })

        // Sesli yanıt ayarı açıksa AI metin yanıtını sese çevir (tip=voice)
        const aiMessages = result.messages.map((m) =>
          isVoice && state.settings.voiceReplies && m.type === 'text'
            ? { ...m, type: 'voice' as const, transcript: m.text, text: m.text }
            : m,
        )

        // 1) Müşteri mesajını hemen ekle + "yazıyor…" göstergesini aç.
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === convId ? { ...withUser, unread: 0 } : c,
          ),
          typingConvId: convId,
          sessionMessages: s.sessionMessages + 1,
          sessionVoice: s.sessionVoice + (isVoice ? 1 : 0),
        }))

        // 2) AI yanıtlarını insan gibi, gecikmeli ve tek tek ekle (gerçekçi his).
        const createdOrder = result.createdOrder
        const firstDelay = 750
        const perMsg = 950
        aiMessages.forEach((m, i) => {
          const isLast = i === aiMessages.length - 1
          setTimeout(() => {
            set((s) => ({
              conversations: s.conversations.map((c) =>
                c.id === convId
                  ? {
                      ...c,
                      messages: [
                        ...c.messages,
                        { ...m, createdAt: new Date().toISOString() },
                      ],
                      customer: { ...c.customer, stance: result.detectedStance },
                      intent: result.intent,
                      negotiatedPrice: result.negotiatedPrice ?? c.negotiatedPrice,
                      handoffReason: result.handoffReason ?? c.handoffReason,
                      status: result.handoffReason || createdOrder ? 'awaiting' : 'active',
                      lastActivity: new Date().toISOString(),
                    }
                  : c,
              ),
              typingConvId: isLast ? null : convId,
            }))
          }, firstDelay + i * perMsg)
        })

        // 3) Sipariş + bildirim, son mesaj göründükten sonra.
        if (createdOrder) {
          setTimeout(() => {
            set((s) => ({ orders: [createdOrder, ...s.orders] }))
            get().pushToast({
              title: 'Yeni sipariş oluşturuldu',
              detail: `${createdOrder.customerName} • ${createdOrder.productName}`,
              tone: 'success',
            })
          }, firstDelay + aiMessages.length * perMsg)
        }

        // İnsana devret bildirimi (öfkeli müşteri, yüksek tutar vb.).
        if (result.handoffReason) {
          setTimeout(() => {
            get().pushToast({
              title: 'Onayınız bekleniyor',
              detail: result.handoffReason,
              tone: 'warn',
            })
          }, firstDelay + aiMessages.length * perMsg + 150)
        }

        if (aiMessages.length === 0) set({ typingConvId: null })
      },

      markRead: (convId) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === convId ? { ...c, unread: 0 } : c,
          ),
        })),

      startConversation: (customer, productId) => {
        const id = uid('c')
        const conv: Conversation = {
          id,
          customer,
          messages: [],
          status: 'active',
          lastActivity: new Date().toISOString(),
          intent: 'Yeni sohbet',
          linkedProductId: productId,
          unread: 0,
        }
        set((s) => ({ conversations: [conv, ...s.conversations] }))
        return id
      },

      setConversationProduct: (convId, productId) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === convId ? { ...c, linkedProductId: productId } : c,
          ),
        })),

      appendManualReply: (convId, text) => {
        const reply: Message = {
          id: uid('m'),
          role: 'ai',
          type: 'text',
          text,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: [...c.messages, reply],
                  status: 'active',
                  lastActivity: reply.createdAt,
                }
              : c,
          ),
        }))
      },

      payOrder: (orderId, convId) => {
        const state = get()
        const order = state.orders.find((o) => o.id === orderId)
        if (!order) return

        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId ? { ...o, status: 'paid' } : o,
          ),
          products: s.products.map((p) =>
            p.id === order.productId
              ? { ...p, stock: Math.max(0, p.stock - order.qty), sold: p.sold + order.qty }
              : p,
          ),
          conversations: s.conversations.map((c) => {
            if (convId ? c.id === convId : c.customer.handle === order.customerHandle) {
              const sys: Message = {
                id: uid('m'),
                role: 'system',
                type: 'text',
                text: `Ödeme alındı • ${order.paymentProvider} • ${order.total.toLocaleString('tr-TR')} ₺`,
                createdAt: new Date().toISOString(),
              }
              // ilgili payment-link mesajını paid işaretle
              const messages = c.messages.map((m) =>
                m.type === 'payment-link' && !m.paid ? { ...m, paid: true } : m,
              )
              return { ...c, messages: [...messages, sys], status: 'closed-won' }
            }
            return c
          }),
        }))

        get().pushToast({
          title: 'Ödeme alındı 🎉',
          detail: `${order.customerName} • ${order.total.toLocaleString('tr-TR')} ₺`,
          tone: 'success',
        })
      },

      updateOrderStatus: (orderId, status) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
        })),

      resolveStockAlert: (alertId, decision) => {
        const state = get()
        const alert = state.stockAlerts.find((a) => a.id === alertId)
        if (!alert) return

        if (decision === 'restock') {
          set((s) => ({
            stockAlerts: s.stockAlerts.map((a) =>
              a.id === alertId ? { ...a, status: 'restocking', available: a.demand } : a,
            ),
            products: s.products.map((p) =>
              p.id === alert.productId ? { ...p, stock: p.stock + alert.shortage } : p,
            ),
            orders: s.orders.map((o) =>
              o.productId === alert.productId && o.status === 'awaiting-stock'
                ? { ...o, status: 'preparing' }
                : o,
            ),
          }))
          get().pushToast({
            title: 'Tedarik onaylandı',
            detail: `${alert.productName} • +${alert.shortage} adet stoğa eklendi`,
            tone: 'success',
          })
        } else {
          set((s) => ({
            stockAlerts: s.stockAlerts.map((a) =>
              a.id === alertId ? { ...a, status: 'notified' } : a,
            ),
            orders: s.orders.map((o) =>
              o.productId === alert.productId && o.status === 'awaiting-stock'
                ? { ...o, status: 'cancelled' }
                : o,
            ),
          }))
          get().pushToast({
            title: 'Müşteriler bilgilendirildi',
            detail: `${alert.shortage} müşteriye kibar “stok kalmadı” mesajı gönderildi`,
            tone: 'info',
          })
        }
      },

      updateProduct: (id, patch) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),

      resolveInsight: (id, status) => {
        const insight = get().insights.find((i) => i.id === id)
        set((s) => ({
          insights: s.insights.map((i) => (i.id === id ? { ...i, status } : i)),
        }))
        if (insight && status === 'done') {
          get().pushToast({
            title: `Aksiyon uygulandı: ${insight.actionLabel}`,
            detail: insight.title,
            tone: 'success',
          })
        }
      },

      resolveHandoff: (convId) => {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === convId
              ? { ...c, handoffReason: undefined, status: 'active', unread: 0 }
              : c,
          ),
        }))
        get().pushToast({
          title: 'Sohbeti devraldınız',
          detail: 'Konuşma yönetiminiz altında; yapay zeka destek olmayı sürdürüyor.',
          tone: 'success',
        })
      },

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      computeReport: () => {
        const s = get()
        const openStockShortages = s.stockAlerts
          .filter((a) => a.status === 'open')
          .map((a) => ({ name: a.productName, shortage: a.shortage }))
        return generateDailyReport({
          orders: s.orders,
          products: s.products,
          messagesHandled: 47 + s.sessionMessages,
          voiceMessages: 8 + s.sessionVoice,
          openStockShortages,
        })
      },

      pushToast: (t) => {
        const id = uid('t')
        set((s) => ({ toasts: [...s.toasts, { ...t, id }] }))
        setTimeout(() => get().dismissToast(id), 4200)
      },
      dismissToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      resetDemo: () => set({ ...seed() }),
    }),
    {
      name: 'snaphai-demo',
      version: 3,
      // Eski sürüm state'i, yeni alanlar (insights, handoff vb.) için seed ile birleştir.
      migrate: (persisted) => ({ ...seed(), ...(persisted as object) }) as never,
      partialize: (s) => ({
        onboarded: s.onboarded,
        store: s.store,
        products: s.products,
        orders: s.orders,
        conversations: s.conversations,
        stockAlerts: s.stockAlerts,
        insights: s.insights,
        settings: s.settings,
      }),
    },
  ),
)
