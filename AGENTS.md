# Project Rules & Instruction Guidelines for AI Agents

Dokumen panduan wajib untuk **setiap AI Agent** (model apapun: Gemini, Claude, GPT, DeepSeek, Cursor, Windsurf, AGY, dll.) yang bekerja di repository **Mikrotek Business Suite Neo**.

---

## 1. Mode Komunikasi & Efisiensi (Caveman Mode)
- **Ringkas & Padat**: Selalu gunakan gaya komunikasi yang efisien (Caveman Mode). Potong kata-kata ramah tamah yang berlebihan dan fokus pada solusi teknis, kode, serta status perintah.
- **Jangan Membuang Token Context**: Cukup berikan rincian singkat perubahan dan instruksi selanjutnya.

---

## 2. Alur Kerja Build & Development (Dev vs Prod Flow)
- **Saat Pengembangan (Development)**:
  - Gunakan `npm run dev` untuk hot-reload dan testing lokal interface.
  - Untuk PHP backend, gunakan `/opt/homebrew/bin/php` (PHP 8.5+ Homebrew CLI).
- **Saat Fitur Selesai & Terverifikasi (Production Check)**:
  - Setelah kode selesai dan diuji, **WAJIB** jalankan perintah build produksi:
    ```bash
    npm run build
    ```
  - Wajib jalankan pengujian automated test suite:
    ```bash
    /opt/homebrew/bin/php artisan test
    ```
  - Dipastikan seluruh tes backend `PASS` dan `npm run build` menghasilkan `✓ built in ...s` tanpa error.

---

## 3. Versi & Tracking Changelog
- **Perbarui CHANGELOG.md**:
  - Setiap kali menyelesaikan pekerjaan fitur/bugfix baru, catat ringkasan perubahannya di [CHANGELOG.md](file:///Users/jemirokasih/Mikrotek-Business-Suite-Neo/CHANGELOG.md).
  - Sertakan tanggal dan nomor versi (Semantic Versioning: `v1.0.0`, `v1.1.0`, `v1.2.0`, dst.).

---

## 4. Struktur Stack & Arsitektur Utama
- **Backend**: Laravel 12 + Sanctum API + SQLite/MySQL.
- **Frontend**: React 19 + Vite 6 + Tailwind CSS v4 + React Query + Lucide Icons.
- **Modul Utama**:
  - CRM & Leads (`/leads`, `/clients`)
  - Transaksi & Keuangan (`/quotes`, `/invoices`, `/payments`, `/tax-invoices`, `/delivery-orders`)
  - Project Management & Documents (`/projects`, `/project-documents`, `/my-tasks`)
  - HR & Geofenced Attendance (`/hr`, `/hr/attendance-recap`, `/employees`, `/hr/contracts`)
  - Cuti, Reimbursement, & Lembur (`/hr/leaves`, `/hr/reimbursements`, `/hr/overtime`, `/hr/overtime-management`)
  - Payroll & Payslip PDF (`/hr/payroll`, `/hr/my-payslips`)
  - System Settings, Roles, Audit Logs, & Backup (`/settings`, `/users`, `/roles`, `/audit-logs`)
