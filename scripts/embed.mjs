// Ürünün build çıktısını (dist/app) marka sitesinin reposuna (../snaphai/app) kopyalar.
// Böylece snaphai.com/app tek deploy ile ürünü gösterir.
// Kullanım: npm run build:embed
import { rmSync, cpSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const src = resolve(here, '..', 'dist', 'app')
const dest = resolve(here, '..', '..', 'snaphai', 'app')

if (!existsSync(src)) {
  console.error('✗ dist/app bulunamadı. Önce "npm run build" çalıştırın.')
  process.exit(1)
}

rmSync(dest, { recursive: true, force: true })
cpSync(src, dest, { recursive: true })
console.log('✓ Ürün derlemesi kopyalandı → ' + dest)
console.log('  Şimdi marka sitesini (snaphai) deploy edin; snaphai.com/app güncellenir.')
