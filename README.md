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

## Dağıtım (Vercel) — `snaphai.com/app` altında

Uygulama `/app` yolu altında yayınlanacak şekilde yapılandırıldı: Vite `base: '/app/'`,
React Router `basename="/app"`, çıktı `dist/app/` klasörüne düşer.

### Yöntem A — İki ayrı Vercel projesi + rewrite (önerilen)

Marka sitesi (`snaphai`) ve ürün (`snaphai_product`) **ayrı klasör/repo olarak kalır.**

1. `snaphai_product`'ı ayrı bir Vercel projesi olarak deploy edin → örn. `snaphai-product.vercel.app`
   (bu projeye özel domain gerekmez; `vercel.json` hazır).
2. Marka sitesinin (`snaphai`) `vercel.json`'una şu rewrite'ları ekleyin:
   ```json
   "rewrites": [
     { "source": "/app", "destination": "https://snaphai-product.vercel.app/app" },
     { "source": "/app/(.*)", "destination": "https://snaphai-product.vercel.app/app/$1" }
   ]
   ```
3. Marka sitesini yeniden deploy edin. Artık `snaphai.com/app` ürünü gösterir.

### Yöntem B — Tek deploy (ürünü marka klasörüne göm)

1. `snaphai_product`'ta `npm run build` → `dist/app/` üretilir.
2. `dist/app` klasörünü `snaphai/app` içine kopyalayın.
3. `snaphai/vercel.json`'a SPA fallback ekleyin:
   ```json
   "rewrites": [{ "source": "/app/(.*)", "destination": "/app/index.html" }]
   ```
4. Marka reposunu push edin. Her ürün güncellemesinde 1-2. adımları tekrarlayın.

## Marka

- Renkler: Lacivert `#0f2447` + Altın `#c9a24b` + Fildişi/Krem.
- Yazı: Fraunces (başlık) + Plus Jakarta Sans (gövde).
- Dil: kurumsal Türkçe, "siz" hitabı.

---

Founders Create Hackathon için geliştirildi.
