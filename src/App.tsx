import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useStore } from '@/store/useStore'

import { Onboarding } from '@/pages/Onboarding'
import { Overview } from '@/pages/Overview'
import { Patrol } from '@/pages/Patrol'
import { Conversations } from '@/pages/Conversations'
import { Orders } from '@/pages/Orders'
import { Products } from '@/pages/Products'
import { Stock } from '@/pages/Stock'
import { VoiceReport } from '@/pages/VoiceReport'
import { Settings } from '@/pages/Settings'
import { CustomerStore } from '@/pages/CustomerStore'

// Router basename "/app" olduğu için tüm yollar snaphai.com/app altında çözülür.
// Panel, base'in köküne ("/") oturur → snaphai.com/app, snaphai.com/app/orders …
// URL segmentleri İngilizce; arayüz metinleri Türkçe kalır.

function RequireOnboarded({ children }: { children: ReactNode }) {
  const onboarded = useStore((s) => s.onboarded)
  if (!onboarded) return <Navigate to="/connect" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/connect" element={<Onboarding />} />
      <Route path="/store" element={<CustomerStore />} />

      <Route
        path="/"
        element={
          <RequireOnboarded>
            <DashboardLayout />
          </RequireOnboarded>
        }
      >
        <Route index element={<Overview />} />
        <Route path="patrol" element={<Patrol />} />
        <Route path="conversations" element={<Conversations />} />
        <Route path="conversations/:id" element={<Conversations />} />
        <Route path="orders" element={<Orders />} />
        <Route path="products" element={<Products />} />
        <Route path="stock" element={<Stock />} />
        <Route path="report" element={<VoiceReport />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
