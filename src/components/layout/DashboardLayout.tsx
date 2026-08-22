import { useState } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  MessagesSquare,
  Boxes,
  AudioLines,
  Settings,
  Store,
  Menu,
  X,
  Sparkles,
} from 'lucide-react'
import clsx from 'clsx'
import { Logo, Avatar, ToastHost } from '@/components/ui'
import { useStore } from '@/store/useStore'
import { planNameMap } from '@/lib/labels'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  end?: boolean
  badge?: 'unread' | 'stock'
}

const NAV: NavItem[] = [
  { to: '/', label: 'Genel Bakış', icon: LayoutDashboard, end: true },
  { to: '/conversations', label: 'Sohbetler', icon: MessagesSquare, badge: 'unread' },
  { to: '/orders', label: 'Siparişler', icon: ShoppingBag },
  { to: '/products', label: 'Ürünler', icon: Package },
  { to: '/stock', label: 'Stok Yönetimi', icon: Boxes, badge: 'stock' },
  { to: '/report', label: 'Sesli Rapor', icon: AudioLines },
  { to: '/settings', label: 'Ayarlar', icon: Settings },
]

export function DashboardLayout() {
  const [open, setOpen] = useState(false)
  const store = useStore((s) => s.store)
  const conversations = useStore((s) => s.conversations)
  const stockAlerts = useStore((s) => s.stockAlerts)
  const location = useLocation()

  const unread = conversations.reduce((n, c) => n + c.unread, 0)
  const openStock = stockAlerts.filter((a) => a.status === 'open').length

  const badgeValue = (b?: NavItem['badge']) =>
    b === 'unread' ? unread : b === 'stock' ? openStock : 0

  const navContent = (
    <>
      <div className="px-4 pb-2 pt-5">
        <Link to="/" onClick={() => setOpen(false)}>
          <Logo size={38} />
        </Link>
      </div>

      {/* mağaza kartı */}
      <div className="mx-3 mt-3 rounded-2xl border border-line bg-cream-2 p-3">
        <div className="flex items-center gap-3">
          <Avatar initials={store.avatarInitials} tone="navy" size={40} />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-bold text-navy-700">{store.name}</p>
            <p className="truncate text-[12px] text-muted">{store.handle}</p>
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5">
          <span className="pill bg-gold-grad text-[11px] text-navy-900">
            <Sparkles size={12} /> {planNameMap[store.plan]}
          </span>
          <span className="pill bg-emerald-50 text-[11px] text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Aktif
          </span>
        </div>
      </div>

      <nav className="mt-4 flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const val = badgeValue(item.badge)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition-colors',
                  isActive
                    ? 'bg-navy-700 text-white shadow-sm'
                    : 'text-ink-soft hover:bg-navy-700/6 hover:text-navy-700',
                )
              }
            >
              <item.icon size={18} className="flex-none" />
              <span className="flex-1">{item.label}</span>
              {val > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gold-500 px-1.5 text-[11px] font-bold text-navy-900">
                  {val}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="p-3">
        <Link
          to="/store"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-xl border border-gold-300 bg-gold-300/20 px-3 py-3 text-[13px] font-semibold text-gold-text transition-colors hover:bg-gold-300/35"
        >
          <Store size={18} className="flex-none" />
          <span className="flex-1 leading-tight">
            Müşteri Deneyimi
            <span className="block text-[11px] font-medium text-muted">
              Müşterileriniz ne görüyor?
            </span>
          </span>
        </Link>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-ivory">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-line bg-white lg:flex">
        {navContent}
      </aside>

      {/* Sidebar — mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[280px] flex-col border-r border-line bg-white animate-fade-up">
            {navContent}
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="lg:pl-[264px]">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line glass px-4 sm:px-6">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl text-navy-700 hover:bg-navy-700/6 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Menü"
          >
            <Menu size={20} />
          </button>

          <div className="hidden items-center gap-2 text-[13px] font-semibold text-muted sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Yapay zeka çalışanınız aktif — mesajları yanıtlıyor
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/store"
              className="hidden items-center gap-2 rounded-full border border-line px-3.5 py-2 text-[13px] font-semibold text-navy-700 transition-colors hover:bg-navy-700/5 sm:inline-flex"
            >
              <Store size={16} /> Müşteri Deneyimi
            </Link>
            <Avatar initials={store.avatarInitials} tone="gold" size={38} />
          </div>
        </header>

        {/* Page content */}
        <main key={location.pathname} className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 animate-fade-up">
          <Outlet />
        </main>
      </div>

      <ToastHost />
    </div>
  )
}
