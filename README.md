# Masjidku - Platform SaaS Website Masjid / Musholla

**Masjidku** adalah platform SaaS (Software as a Service) multi-tenant berbasis Laravel RESTful API yang dirancang untuk membantu pengurus masjid dan musholah memiliki serta mengelola website resmi secara mudah.

---

## 🌟 Fitur Utama

- **Multi-Tenant & Domain**:
  - Pendaftaran gratis dengan subdomain (`alikhlas.masjidku.com`) atau path (`masjidku.com/m/alikhlas`).
  - Siap untuk integrasi custom domain berbayar (`custom_domain`).
- **Workflow Verifikasi Admin**:
  - Pendaftaran pengurus masuk antrean `pending` verifikasi.
  - Super Admin Masjidku meninjau dan melakukan Approve/Reject sebelum website dipublikasikan.
- **Marketplace Tema Website**:
  - Katalog template website masjid (Gratis & Berbayar).
  - Pengurus masjid bebas memilih & mengganti tema website aktif.
- **Manajemen Konten (Decoupled RESTful API)**:
  - Profil masjid, lokasi koordinat (GPS), visi & misi, fasilitas, sosial media.
  - Berita, Update Kajian (Pemateri/Ustadz, jadwal), & Agenda masjid.
  - Program Infaq & Donasi (Target, rekening bank, & QRIS).
- **Decoupled Architecture**:
  - Backend Laravel RESTful API dengan Sanctum Authentication.
  - Responsif & siap dikonsumsi oleh frontend terpisah (React / Vue / Mobile App).

---

## 🚀 Panduan Pengembangan (Local Setup)

### 1. Prerequisites
- **PHP >= 8.2**
- **Composer**
- **Node.js & npm**
- **SQLite / MySQL**

### 2. Install Dependencies
```bash
composer install
npm install
```

### 3. Konfigurasi Environment & Database
```bash
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate:fresh --seed
```

### 4. Jalankan Server Lokal
```bash
php artisan serve
```
API endpoint siap diakses di `http://127.0.0.1:8000/api/v1/`.

### 5. Jalankan Automated Tests
```bash
php artisan test
```

---

## 📚 Endpoint API Utama

- **Auth**: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`
- **Platform Admin**: `GET /api/v1/admin/masjids`, `POST /api/v1/admin/masjids/{id}/verify`, `CRUD /api/v1/admin/themes`
- **Mosque Admin**: `GET/PUT /api/v1/tenant/masjid`, `CRUD /api/v1/tenant/posts`, `CRUD /api/v1/tenant/donations`, `POST /api/v1/tenant/themes/select`
- **Public Website**: `GET /api/v1/public/masjid/{identifier}`, `GET /api/v1/public/masjid/{identifier}/posts`, `GET /api/v1/public/masjid/{identifier}/donations`

Spesifikasi lengkap OpenAPI ada di [openapi.yaml](openapi.yaml).
