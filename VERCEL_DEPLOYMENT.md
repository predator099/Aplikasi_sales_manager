# Panduan Deployment ke Vercel (Production Ready)

Aplikasi **ANTEN ISP Business & Billing Manager** telah dikonfigurasi penuh dan siap untuk di-deploy ke **Vercel** dengan PostgreSQL database persistent dan otentikasi JWT yang aman.

---

## 1. Persiapan Database PostgreSQL

Aplikasi ini menggunakan **Prisma ORM** yang mendukung provider PostgreSQL modern:
- **Vercel Postgres / Neon** (Sangat direkomendasikan untuk Vercel)
- **Supabase**
- **Aiven / Railway / Cloud SQL**

### Langkah Mendapatkan `DATABASE_URL`:
1. Jika menggunakan **Vercel Storage**:
   - Di dashboard Vercel project Anda, buka tab **Storage** -> pilih **Postgres (Neon)**.
   - Klik **Create Database**.
   - Salin connection string `POSTGRES_PRISMA_URL` atau `DATABASE_URL`.
2. Atau jika menggunakan **Neon.tech / Supabase**:
   - Buat database baru, salin connection string berformat:
     `postgresql://user:password@host/database?sslmode=require`

---

## 2. Environment Variables di Vercel

Pada dashboard proyek Vercel Anda (**Settings** > **Environment Variables**), tambahkan variabel berikut:

| Key | Value / Contoh | Deskripsi |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://...` | Connection string PostgreSQL Anda |
| `JWT_SECRET` | `anten_super_secret_jwt_key_random_32char` | Kunci rahasia enkripsi token sesi login |
| `NODE_ENV` | `production` | Mode production |

---

## 3. Langkah Deploy ke Vercel

### Opsi A: Menggunakan Vercel CLI (Paling Cepat)
```bash
# 1. Install Vercel CLI jika belum ada
npm i -g vercel

# 2. Login ke Vercel
vercel login

# 3. Deploy
vercel

# 4. Deploy ke Production
vercel --prod
```

### Opsi B: Menggunakan Git (GitHub / GitLab / Bitbucket)
1. Push repositori ini ke GitHub / GitLab Anda:
   ```bash
   git add .
   git commit -m "Production-ready build for Vercel"
   git push origin main
   ```
2. Buka [https://vercel.com/new](https://vercel.com/new), pilih repositori Anda.
3. Di bagian **Build & Development Settings**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Masukkan Environment Variables (`DATABASE_URL`, `JWT_SECRET`).
5. Klik **Deploy**!

---

## 4. Migrasi Schema & Seeding Database

Setelah deployment pertama selesai atau saat menghubungkan database baru, jalankan migrasi schema dan initial seeding:

```bash
# Push schema tabel ke PostgreSQL
npx prisma db push

# Isi data awal (seed users, master tariff, initial customers, etc.)
npm run db:seed
```

---

## 5. Kredensial Default Login Sistem

| Peran (Role) | Username | Password Default | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | Akses Penuh: Konfigurasi Rumus, Master Tarif, Manajemen User, Log Audit |
| **Finance** | `finance` | `finance123` | Penagihan (Billing), Invoice, Rekap Pembayaran, Pencairan Fee Sales |
| **Sales** | `sales` | `sales123` | Pelanggan, Input Layanan, Penawaran Harga (Quotation), Komisi |
| **NOC / Teknik** | `noc` | `noc123` | Datek Teknis, IP Publik, Konfigurasi Metro Ethernet, BAST |
