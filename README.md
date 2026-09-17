# ANTEN Business Manager (v1.0.0)

Aplikasi manajemen bisnis dan penjualan ISP:
- Dashboard Penjualan & Alokasi Fee Marketing
- Manajemen Pelanggan, Layanan Aktif, Penawaran (Quotation), dan Invoice
- Multi-role: Super Admin, Finance, Sales, Network Engineer

---

## 🚀 Cara Menjalankan Project (Local / GitHub Clone)

Aplikasi ini adalah project web modern berbasis **React 18 + Vite + Tailwind CSS**.

### 1. Prasyarat
- **Node.js**: Versi 18+ atau 20+ (rekomendasi LTS)
- **npm** (atau pnpm / yarn)

### 2. Instalasi Dependensi
Buka terminal di dalam folder project dan jalankan:
```bash
npm install
```

### 3. Menjalankan di Mode Development
Untuk membuka aplikasi di browser dengan hot-reload:
```bash
npm run dev
```
Buka browser di alamat yang tertera di terminal, biasanya:
```
http://localhost:3000
```
*(atau http://localhost:5173)*

### 4. Build dan Jalankan Mode Produksi
```bash
npm run build
npm start
```

---

## ⚠️ Catatan Penting: Mengapa Halaman Kosong (Blank Putih)?

Jika Anda membuka file `index.html` secara langsung dengan klik ganda di file explorer (`file:///...`), browser akan memblokir modul JavaScript (`CORS / Module policy`) sehingga halaman tampil putih kosong.

**Solusi:**
Pastikan selalu menjalankan server lokal dengan:
```bash
npm run dev
```
atau jika ingin membuka hasil build statis:
```bash
npm run preview
```

### Deploy ke GitHub Pages / Vercel / Netlify:
- **Vercel / Netlify**: Hubungkan repository GitHub Anda, pilih framework preset `Vite`, dan biarkan perintah build default `npm run build` dengan output folder `dist`.
- **GitHub Pages**: Jika menggunakan GitHub Pages dengan subpath (misalnya `username.github.io/anten`), pastikan menambahkan `base: './'` di `vite.config.ts`.
