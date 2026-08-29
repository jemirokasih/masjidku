# Changelog - Mikrotek Business Suite Neo

Semua perubahan penting pada proyek ini dicatat secara berkala dalam dokumen ini.

---

## [v2.2.0] - 2026-08-30
### Added & Enhanced
- **Sidebar Accordion Kelola Konten Per Halaman**:
  - Mengubah label menu accordion sidebar dari *Kelola CMS & Tampilan* menjadi **📝 Kelola Konten** di bawah grup **CMS WEBSITE** (`MainLayout.jsx`).
  - Menghadirkan submenu dropdown langsung per halaman website: *Beranda, Profile Masjid, Program DKM, Berita & Kajian, Jadwal Sholat, Galeri Media, Kontak & Footer*.
- **Pengelompokan CMS Kelola Konten Halaman per Halaman**:
  - Mengorganisir menu kelola konten pada `ContentManagementPage.jsx` menjadi 7 kategori tab **Halaman per Halaman** yang intuitif (*🏠 Halaman Beranda, 🕌 Halaman Profil Masjid, 📋 Halaman Program DKM, 📰 Halaman Berita & Kajian, ⏰ Halaman Jadwal Sholat, 🖼️ Halaman Galeri Media, 📍 Halaman Kontak & Footer*).
- **Unifikasi Pengaturan Hero Banner CMS**:
  - Menyatukan 2 form pengaturan banner menjadi 1 pusat kendali tunggal di `ContentManagementPage.jsx` pada tab *2. Banner Utama (Hero Section)*.
  - Form kini mencakup Judul Headline, Sub-judul, Teks CTA & Link Tujuan, serta saklar visibilitas seksi beranda (*Jadwal Sholat, Profil & Sejarah, Berita & Kajian, Donasi QRIS*).
- **Sidebar Dropdown & Pengelompokan Menu CMS**:
  - Menggabungkan **Hero & Tema Tampilan (`/cms-pages`)** dan **Kelola Konten Website (`/content`)** ke dalam satu grup menu dropdown accordion **🎨 CMS & TAMPILAN WEBSITE** di sidebar admin (`MainLayout.jsx`).
  - Menghadirkan dukungan sub-menu bertingkat (*nested sub-items*) dengan panah chevron indikator status *open/close*.
- **Dynamic Content Management (CMS) untuk Profil Masjid**:
  - Halaman **Kelola Konten CMS (`ContentManagementPage.jsx`)** pada tab *3. Profil Masjid* kini dilengkapi dengan form dinamis interaktif untuk menambah/menghapus/mengedit:
    - **Kartu Statistik Ringkas** (e.g. *Kapasitas Jamaah*, *Karpet Premium*, *Program Kajian/Bulan*, *Operasional & Layanan*).
    - **Daftar Fasilitas & Sarana Ibadah** (e.g. *Ruang Sholat Ber-AC*, *Tempat Wudhu Luas*, *Perpustakaan*, *Layanan Ambulans*, *Wi-Fi Jamaah*).
    - **Struktur Kepengurusan DKM** (e.g. *Ketua DKM*, *Sekretaris*, *Bendahara*, *Imam Utama & Marbot*).
  - Halaman publik **Profil Masjid (`PublicMosjidPage.jsx`)** secara otomatis membaca dan menampilkan data statistik, fasilitas, serta struktur DKM yang dikelola melalui CMS.
- **Penyelarasan Design System & Halaman Al-Qur'an & Doa**:
  - Menyelaraskan tampilan `QuranPage.jsx` dan `DoaPage.jsx` dengan kanvas eye-friendly `#f6f8f7`, gradien base `#164134`, serta toggle Mode Light & Dark.
  - Menambahkan tombol navigasi **⬅️ Surah Sebelumya** dan **➡️ Surah Selanjutnya** di bagian atas dan bawah pembaca Al-Qur'an.
  - Merapikan struktur menu Navbarpublik agar 100% identik dengan halaman Beranda utama.

---

## [v1.8.0] - 2026-08-25
### Added & Changed
- **Collapsible Navigation Groups & Sidebar Accordion**:
  - Setiap grup navigasi sidebar (RINGKASAN, KLIEN, PROJECT, IT, TRANSAKSI, VENDOR, HR, PRODUK, SISTEM) kini dapat di-collapse / di-expand secara interaktif dengan indikator panah chevron animasi.
  - Status collapse grup tersimpan otomatis di `localStorage` (`mbs_collapsed_groups`), dan grup yang memiliki halaman aktif selalu terbuka otomatis.
  - Memperbaiki tombol minimize sidebar menjadi **satu tombol toggle tunggal yang rapi di header sidebar**.
- **Stabilisasi Iframe Webmail (Cegah Auto-Reload & Layar Blank)**:
  - Mengunci URL iframe ke state statis `iframeSrc` yang hanya di-set sekali ketika komponen me-mount, serta menyertakan `key` unik React pada elemen `<iframe />`. Ini mencegah Roundcube ter-reload sendiri saat pengguna beralih tab, membiarkan aplikasi idle, atau ketika state layout terupdate di background.
  - Menambahkan penanganan error (resilient fallback) jika request pemuatan pengaturan `/settings/company` gagal atau mengembalikan error. Iframe tetap dimuat menggunakan default url `/webmail/` dengan token autentikasi sehingga tidak akan memunculkan layar putih kosong (blank).
- **Perbaikan Redirect Salah Alamat (Mencegah Redirect ke Root `/`)**:
  - Meng-override variabel global `$_SERVER['SCRIPT_NAME']`, `$_SERVER['PHP_SELF']`, dan `$_SERVER['SCRIPT_FILENAME']` pada [routes/web.php](file:///Users/jemirokasih/Mikrotek-Business-Suite-Neo/routes/web.php#L88-L94) sebelum mengeksekusi Roundcube. Ini memastikan form actions dan redirect Roundcube (misalnya ketika session expired) diarahkan dengan benar ke `/webmail/` dan tidak lari ke root domain utama (`http://localhost:8000/`).
- **Fitur Pengurutan Kolom Tabel Interaktif (Interactive Table Column Sorting)**:
  - Header kolom tabel (`<th>`) pada [DomainList.jsx](file:///Users/jemirokasih/Mikrotek-Business-Suite-Neo/resources/js/pages/Domains/DomainList.jsx), [VendorList.jsx](file:///Users/jemirokasih/Mikrotek-Business-Suite-Neo/resources/js/pages/Vendors/VendorList.jsx), [VendorQuoteList.jsx](file:///Users/jemirokasih/Mikrotek-Business-Suite-Neo/resources/js/pages/Vendors/VendorQuoteList.jsx), dan [VendorInvoiceList.jsx](file:///Users/jemirokasih/Mikrotek-Business-Suite-Neo/resources/js/pages/Vendors/VendorInvoiceList.jsx) kini dapat diklik untuk melakukan pengurutan data (*Ascending* / *Descending*).
  - Dilengkapi dengan indikator ikon visual pengurutan (`ArrowUp` / `ArrowDown` / `ArrowUpDown`).
- **Penyelarasan UI/UX & Paginasi Standar pada Seluruh Tabel Vendor & Domain**:
  - Menambahkan **Komponen Paginasi Interaktif** (informasi total data, pemilih item per halaman 5/10/25/50, nomor halaman, tombol Sebelumnya & Selanjutnya) pada [DomainList.jsx](file:///Users/jemirokasih/Mikrotek-Business-Suite-Neo/resources/js/pages/Domains/DomainList.jsx) (Manajemen Domain), [VendorList.jsx](file:///Users/jemirokasih/Mikrotek-Business-Suite-Neo/resources/js/pages/Vendors/VendorList.jsx), [VendorQuoteList.jsx](file:///Users/jemirokasih/Mikrotek-Business-Suite-Neo/resources/js/pages/Vendors/VendorQuoteList.jsx), dan [VendorInvoiceList.jsx](file:///Users/jemirokasih/Mikrotek-Business-Suite-Neo/resources/js/pages/Vendors/VendorInvoiceList.jsx).
  - Menyediakan **Pengalih Tampilan Mode (Table & Grid/Kartu)** interaktif yang terintegrasi dengan `localStorage`.
  - Menambahkan **Field Upload Berkas Lampiran Tagihan / Penawaran** (`.pdf`, `.jpg`, `.png`) serta catatan internal pada formulir pencatatan Tagihan Vendor ([VendorInvoiceFormPage.jsx](file:///Users/jemirokasih/Mikrotek-Business-Suite-Neo/resources/js/pages/Vendors/VendorInvoiceFormPage.jsx)).
  - Menghadirkan **Summary Cards Statistik** & Filter Bar Terintegrasi untuk melihat ringkasan total nilai penawaran, total tagihan masuk, serta status pembayaran (Paid / Unpaid).
  - Merapikan desain tabel, form modal, opsi status, dan elemen visual seluruh modul vendor agar 100% konsisten dengan design system utama aplikasi.
- **Edge-to-Edge Webmail Viewport (No Padding & Border)**:
  - Seluruh padding, margin, shadow, dan border-radius pada container halaman Webmail (`/webmail`) telah dihapus.
  - Iframe Roundcube kini menempel secara presisi (edge-to-edge) di samping sidebar dan di bawah topbar, memberikan visualisasi bersih dan luas yang setara dengan mode layar penuh (fullscreen).
- **Official Roundcube Webmail Client (MySQL & Protected Access Integration)**:
  - Mengintegrasikan rilis resmi **Roundcube Webmail Client v1.7.3 (Complete Package)** langsung ke dalam sistem.
  - **Database MySQL Terintegrasi**: Menggunakan database MySQL utama aplikasi (`mikrotek_neo`) dengan tabel berprefix `rc_*` melalui migrasi `2026_08_25_950000_create_roundcube_mysql_tables.php`.
  - **Proteksi Akses & Autentikasi**: Endpoint `/webmail` diproteksi ketat dengan pengecekan token/sesi aktif; pengguna publik atau anonim tidak dapat mengakses webmail (otomatis dialihkan ke `/login`).
  - **Perbaikan Jalur Eksekusi & Aset Statis**: Memperbaiki pemanggilan path `iniset.php` dan mengaktifkan direct asset delivery (`assets_path = '/webmail/'`) sehingga seluruh stylesheet (CSS), dependency bootstrap, JavaScript (JS), font, dan icon Elastic Skin termuat sempurna.
  - **Keamanan Izin File**: Hak akses file diperbaiki ke standar aman (direktori `755`, file `644`, folder temp/logs `775`, tanpa `777`).
  - **Koneksi IMAP & SMTP Dinamis**: [public/webmail/config/config.inc.php](file:///Users/jemirokasih/Mikrotek-Business-Suite-Neo/public/webmail/config/config.inc.php) dikonfigurasi membaca setting IMAP & SMTP secara dinamis dari `mbs_company_settings` dengan opsi TLS/SSL otomatis.
- **Konfigurasi URL Webmail**:
  - Migrasi `2026_08_25_800000_add_webmail_settings_to_mbs_company_settings_table` untuk menyimpan `webmail_url` (default `/webmail/`).
  - Pengaturan URL Webmail di tab **Pengaturan > SMTP & Webmail** (`/settings?tab=smtp`).
  - Integrasi form pengaturan Webmail & Server Email pada halaman **Pengaturan Sistem > SMTP & Webmail** (`/settings?tab=smtp`).

## [v1.7.0] - 2026-08-25
### Added & Changed
- **Tab Pemantauan Domain (Expired & Tagihan)**:
  - Tab **Domain Akan Expired** (`/domains?tab=expiring`) dengan badge jumlah domain mendekati expired.
  - Tab **Tagihan Jatuh Tempo** (`/domains?tab=billing_due`) dengan badge jumlah penagihan domain mendekati jatuh tempo.
  - Filter rentang waktu hari: `7`, `15`, `30`, `60`, `90` Hari.
  - Pengurutan default otomatis: Tanggal terdekat kedaluwarsa (`expiration_date ASC`) atau jatuh tempo (`billing_date ASC`).
  - Indikator badge sisa hari pada tabel (`rose` untuk <= 7 hari, `amber` untuk <= 30 hari).

## [v1.6.0] - 2026-08-25
### Added & Changed
- **Sinkronisasi 1-Arah (Read-Only Local Data)**:
  - Penyimpanan data domain di sistem lokal murni 1-arah (hanya membaca dari API RDASH/SRS-X saat sinkronisasi). Pengeditan lokal di sistem tidak mengirimkan permintaan outbound balik ke provider registrar.
  - Untuk domain yang bersumber dari API (`rdash` / `srsx`), field utama (Nama Domain, Registrar, ID External, Tanggal Registrasi & Kedaluwarsa) dikunci/disabled di form edit dengan badge pemberitahuan `🔒 Data bersumber dari API Registrar`. Field lokal (Klien, Proyek, Hosting, Tanggal Penagihan, Catatan) tetap dapat diubah bebas.
- **Master Data Tipe & Provider Hosting**:
  - Migrasi database `2026_08_25_700000_create_mbs_hosting_types_and_add_billing_date`.
  - Halaman Master Data **Tipe & Provider Hosting** (`/settings?tab=hosting_types`) untuk mengelola jenis hosting (Mikrotek Infra, External Shared, External VPS/Cloud) beserta penyedia jasa (Rumahweb, Niagahoster, Biznet Gio, AWS, DigitalOcean, dll.).
  - Di modal form domain, pemilihan Tipe Hosting secara otomatis menghubungkan dan menyaring opsi dropdown Provider Hosting terkait.
- **Kolom Tanggal Penagihan (Billing Date)**:
  - Penambahan kolom `billing_date` pada tabel database `mbs_domains` & tampilan tabel domain untuk mencatat jadwal invoice perpanjangan ke klien.

## [v1.5.3] - 2026-08-25
### Fixed
- **Format Tanggal Sync Domain (MySQL Strict Mode)**: Menambahkan sanitasi otomatis string ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`) menjadi format `YYYY-MM-DD` pada mutator model `Domain` (`registration_date` & `expiration_date`) serta service `RdashService` & `SrsxService`. Memperbaiki error `SQLSTATE[22007]: Invalid datetime format: 1292 Incorrect date value` pada MySQL.

## [v1.5.2] - 2026-08-25
### Fixed
- **Integrasi Registrar Domain (RDASH & SRS-X)**:
  - `SrsxService`: Mengekstrak informasi domain (`domain`, `api_id`, `startdate`, `enddate`, `status`, `nameservers`) secara langsung dari XML daftar `/domain/list`, dengan fallback aman ke `/domain/info` jika diperlukan. Mencegah domain gugur saat pemanggilan detail API individual gagal.
  - `RdashService`: Menangkap HTTP status error (misal: HTTP 422 IP Whitelist error) dan menyajikan pesan error teknis dari API RDASH secara transparan tanpa menghentikan pemrosesan provider lain.
  - Penanganan error sinkronisasi diperjelas sehingga pengguna mengetahui penyebab pasti saat sinkronisasi mengembalikan `0 domain disinkronkan` (misal: IP server belum di-whitelist di dashboard reseller atau kredensial belum diisi).

## [v1.5.1] - 2026-08-25
### Fixed
- **Sinkronisasi Domain**: Perbaikan gagal sync tanpa pesan jelas (`0 domain disinkronkan.`). Error per-provider kini ditampilkan detail di notifikasi (frontend + pesan API).
- **Resilience Sync**: Satu kegagalan domain/detail tidak lagi menghentikan seluruh batch provider. Provider yang berhasil tetap tersimpan meski provider lain gagal (kembali `200 partial`).
- **Test**: Tambah `DomainManagementTest` untuk kasus kredensial kosong (422 + errors detail) dan partial sync satu provider.

## [v1.5.0] - 2026-08-25
### Added
- **Manajemen Domain**: CRUD domain soft-delete, tautan klien/proyek, registrar, nameserver, masa berlaku, dan status hosting Mikrotek/external.
- **Integrasi Registrar**: Sinkronisasi daftar domain RDASH dan SRS-X, lalu detail kedaluwarsa/nameserver. Konfigurasi kredensial pada Pengaturan Sistem > Registrar Domain.
- **UI Domain**: Halaman `/domains`, filter registrar/hosting, badge status, input manual, dan tombol sinkronisasi.
- **Test**: `DomainManagementTest.php` mencakup CRUD, unique validation, serta filter.

## [v1.4.0] - 2026-08-25
### Added
- **Modul Vendor & Pengadaan**:
  - Migrasi database `2026_08_25_500000_create_mbs_vendors_tables` (`mbs_vendors`, `mbs_vendor_quotes`, `mbs_vendor_invoices`, `mbs_vendor_invoice_items`).
  - Halaman Master Vendor (`/vendors`) untuk mencatat kontak, NPWP, & rekening bank vendor.
  - Halaman Penawaran Vendor / Quote In (`/vendor-quotes`) untuk mengunggah berkas penawaran & penautan ke proyek.
  - Halaman Tagihan Vendor / Invoice In / Bills (`/vendor-invoices` & `/vendor-invoices/create`) untuk mencatat item pengadaan, PPN, dan pelacakan status pembayaran (`UNPAID` / `PAID`).
  - Integrasi tab **Vendor & Pembelian** pada Detail Proyek (`/projects/:id`) untuk merekap total pengeluaran vendor per proyek.
  - Test suite `VendorTest.php` (3/3 passed, total tests: 96/96 passed).

## [v1.3.0] - 2026-08-25
### Added & Changed
- **Pengaturan & Layout Kustom Surat Jalan (Delivery Order PDF)**:
  - Migrasi database `2026_08_25_400000_add_delivery_order_settings_to_mbs_company_settings_table`.
  - Opsi toggle tampilkan/sembunyikan kolom tanda tangan: `Pengirim (Mikrotek)`, `Penerima (Klien)`, `Pengemudi / Kurir`, `Petugas Logistik`, & `Mengetahui (Manager)`.
  - Judul kolom tanda tangan dapat dikustomisasi bebas per perusahaan.
  - Preset Mikrotek (2 Kolom: Pengirim & Penerima) & Preset Lengkap (5 Kolom).
  - Integrasi tab **Pengaturan Surat Jalan** (`/settings?tab=delivery_order`) dan tombol pintas di list Surat Jalan.
  - Test suite `DeliveryOrderTest.php` (6/6 passed).

## [v1.2.2] - 2026-08-25
### Fixed & Changed
- **Penyimpanan Pengaturan Lembur**: Ditambahkan validasi backend `SettingsController.php` untuk `overtime_calculation_type`, `overtime_flat_rate`, `overtime_multiplier`, & `overtime_work_hours_per_day` (fix tidak tersimpan).
- **Relokasi Tab Pengaturan**: Memindahkan tab **Pengaturan Uang Lembur** ke dalam grup `HR & KEPEGAWAIAN` pada Pengaturan Sistem (`/settings`).

## [v1.2.1] - 2026-08-25
### Changed
- **Pembaruan Tab Pengaturan Uang Lembur**:
  - Memisahkan pengaturan kompensasi & tarif lembur menjadi tab tersendiri **Pengaturan Uang Lembur** (`/settings?tab=overtime`) pada Pengaturan Sistem.
  - Menambahkan tombol akses cepat `⚙️ Pengaturan Lembur` di header halaman Manajemen Lembur (`OvertimeManagementPage.jsx`).

## [v1.2.0] - 2026-08-25
### Added
- **Modul Pengajuan & Persetujuan Lembur (Overtime)**:
  - Portal pengajuan lembur karyawan (`OvertimeRequestPage.jsx`) dengan kalkulasi durasi jam otomatis.
  - Portal persetujuan lembur oleh HR / Admin (`OvertimeManagementPage.jsx`) dengan alasan penolakan.
  - Integrasi rute SPA React `/hr/overtime` dan `/hr/overtime-management`.
  - Integrasi menu navigasi sidebar & tombol aksi cepat di HR Dashboard.
  - Test suite otomatis `OvertimeTest.php` (4 test cases passed).
- **Aturan Agent & Panduan Workflow**:
  - Dibuat `AGENTS.md`, `CLAUDE.md`, dan `.agents/rules/project-workflow.md` untuk menginstruksikan seluruh AI Agent menggunakan Caveman Mode, alur `npm run dev` saat dev, `npm run build` saat selesai, dan pencatatan changelog berkala.

---

## [v1.1.0] - 2026-08-24
### Added
- **HR & Payroll Engine**:
  - Komponen gaji karyawan, perhitungan periode penggajian otomatis, dan cetak PDF Slip Gaji.
  - Geofencing presensi (Radius kantor & mode bypass WFH) serta rekap absensi bulanan.
  - Manajemen Cuti Tahunan & Pengajuan Reimbursement klaim karyawan.
- **Transaksi & Keuangan**:
  - Surat Jalan / Delivery Order dengan unggah bukti serah terima barang.
  - e-Faktur Pajak (Tax Invoice) & Kwitansi Pembayaran PDF.
- **Sistem & Audit**:
  - Fitur Backup Data (Manual trigger & auto cleanup settings).
  - Audit Trail / Log Aktivitas pengguna & Pusat Notifikasi real-time.

---

## [v1.0.0] - 2026-08-22
### Added
- **Rilis Perdana (Initial Release)**:
  - Arsitektur Laravel 12 + Sanctum + React 19 SPA dengan Vite 6.
  - Manajemen Klien, Leads, Penawaran (Quotes), Tagihan (Invoices), & Manajemen Project.
  - Manajemen User & Access Role-based Permissions.
