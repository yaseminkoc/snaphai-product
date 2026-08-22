# SnaphAI — Ürün Paneli & Demo

Instagram butikleri için otonom **yapay zeka çalışanı** platformunun ürün arayüzü: esnaf paneli (dashboard), Magic Onboarding, müşteri sohbet demosu ve sesli özellikler.

> **Kadim Gelenek, Dijital Gelecek.**

Bu uygulama **tamamen istemci tarafında** çalışır — API anahtarı gerektirmez. Yapay zeka çalışanı (pazarlık, öğrenci indirimi, upsell, satış kapatma, günlük rapor) kural tabanlı bir motorla **simüle** edilir. Sesli özellikler tarayıcının **Web Speech API**'sini kullanır (anahtarsız, çevrimdışı).

## Özellikler

- **Magic Onboarding** (`/baglan`) — Instagram profilini "bağla", gönderiler taranır, ürünler/fiyatlar ayıklanır, mağaza otomatik kurulur.
- **Esnaf Paneli** (`/app`)
  - **Genel Bakış** — günün cirosu, sipariş/mesaj/dönüşüm istatistikleri, haftalık ciro grafiği, stok uyarıları.
  - **Sohbetler** — AI'ın müşterilerle yaptığı tüm yazışmalar; izleme ve gerektiğinde devralma.
  - **Siparişler** — DM ve sesli mesajdan gelen satışlar, durum yönetimi.
  - **Ürünler** — Instagram'dan içe aktarılan katalog; fiyat, alt limit ve stok düzenleme.
  - **Stok Yönetimi** — açık oluşunca AI kararı size sorar; "tedarik ederim" veya "bekleyen müşterileri bilgilendir".
  - **Sesli Rapor** — "Bugün ne oldu?" — günün özetini sesli dinleyin, sesli soru sorun.
  - **Ayarlar** — pazarlık motoru limitleri, öğrenci indirimi, üslup, ödeme sağlayıcı, plan.
- **Müşteri Demosu** (`/magaza`) — SnaphAI'ın müşteriyle nasıl konuşup pazarlık ettiğini ve satışı ödeme linkiyle kapattığını canlı gösterir. Yazılı ve **sesli** mesaj desteği.

## Teknoloji

Vite + React 18 + TypeScript + Tailwind CSS · Zustand (durum) · React Router · Recharts · lucide-react · Framer Motion.

## Geliştirme

```bash
npm install
npm run dev      # http://localhost:5175
```

Üretim derlemesi:

```bash
npm run build
npm run preview
```

## Dağıtım (Vercel)

Depo Vercel'e bağlandığında `vercel.json` otomatik algılanır (Vite, SPA yönlendirmeleri hazır). Ayrı bir yapılandırma gerekmez.

## Marka

- Renkler: Lacivert `#0f2447` + Altın `#c9a24b` + Fildişi/Krem.
- Yazı: Fraunces (başlık) + Plus Jakarta Sans (gövde).
- Dil: kurumsal Türkçe, "siz" hitabı.

---

Founders Create Hackathon için geliştirildi.
# snaphai-product
