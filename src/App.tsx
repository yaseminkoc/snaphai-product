import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useStore } from '@/store/useStore'

import { Onboarding } from '@/pages/Onboarding'
import { Overview } from '@/pages/Overview'
import { Conversations } from '@/pages/Conversations'
import { Orders } from '@/pages/Orders'
import { Products } from '@/pages/Products'
import { Stock } from '@/pages/Stock'
import { VoiceReport } from '@/pages/VoiceReport'
import { Settings } from '@/pages/Settings'
import { CustomerStore } from '@/pages/CustomerStore'

// Router basename "/app" olduğu için tüm yollar snaphai.com/app altında çözülür.
// Panel, base'in köküne ("/") oturur → snaphai.com/app, snaphai.com/app/siparisler …

function RequireOnboarded({ children }: { children: ReactNode }) {
  const onboarded = useStore((s) => s.onboarded)
  if (!onboarded) return <Navigate to="/baglan" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/baglan" element={<Onboarding />} />
      <Route path="/magaza" element={<CustomerStore />} />

      <Route
        path="/"
        element={
          <RequireOnboarded>
            <DashboardLayout />
          </RequireOnboarded>
        }
      >
        <Route index element={<Overview />} />
        <Route path="sohbetler" element={<Conversations />} />
        <Route path="sohbetler/:id" element={<Conversations />} />
        <Route path="siparisler" element={<Orders />} />
        <Route path="urunler" element={<Products />} />
        <Route path="stok" element={<Stock />} />
        <Route path="rapor" element={<VoiceReport />} />
        <Route path="ayarlar" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
