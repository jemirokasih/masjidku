<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Surat Perjanjian Kerja - {{ $employee->full_name }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 25mm 20mm 25mm 20mm;
        }

        body {
            font-family: 'Times New Roman', Times, serif;
            color: #111827;
            font-size: 12px;
            line-height: 1.6;
            margin: 0;
            padding: 0;
        }

        /* ── Header ─────────────────────────────── */
        .contract-header {
            text-align: center;
            border-bottom: 2px double #000;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }

        .company-name {
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0;
        }

        .company-address {
            font-size: 10px;
            color: #374151;
            margin: 4px 0 0 0;
            font-style: italic;
        }

        /* ── Document Title ──────────────────────── */
        .document-title {
            text-align: center;
            margin-bottom: 25px;
        }

        .document-title h2 {
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            text-decoration: underline;
            margin: 0;
        }

        .document-title p {
            font-size: 11px;
            margin: 5px 0 0 0;
            font-weight: bold;
        }

        /* ── Section Content ──────────────────────── */
        .section-intro {
            margin-bottom: 20px;
            text-align: justify;
        }

        .parties-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            margin-left: 15px;
        }

        .parties-table td {
            padding: 4px 0;
            vertical-align: top;
        }

        .parties-table .label {
            width: 25%;
        }

        .parties-table .separator {
            width: 3%;
            text-align: center;
        }

        .parties-table .value {
            width: 72%;
            font-weight: bold;
        }

        /* ── Clauses / Pasal-Pasal ────────────────── */
        .clause-title {
            text-align: center;
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 5px;
            text-transform: uppercase;
        }

        .clause-body {
            text-align: justify;
            margin-bottom: 15px;
        }

        .clause-list {
            margin-top: 5px;
            padding-left: 20px;
        }

        .clause-list li {
            margin-bottom: 4px;
        }

        /* ── Signatures ──────────────────────────── */
        .signatures-container {
            margin-top: 50px;
            width: 100%;
        }

        .signature-table {
            width: 100%;
            border-collapse: collapse;
        }

        .signature-table td {
            width: 50%;
            text-align: center;
            vertical-align: top;
        }

        .signature-title {
            margin-bottom: 60px;
        }

        .signature-name {
            font-weight: bold;
            text-decoration: underline;
        }

        .signature-role {
            font-size: 11px;
            color: #4b5563;
        }
    </style>
</head>
<body>

    <!-- Header Perusahaan -->
    <div class="contract-header">
        <p class="company-name">{{ $company->company_name }}</p>
        <p class="company-address">{{ $company->company_address }} &bull; Telp: {{ $company->company_phone }} &bull; Email: {{ $company->company_email }}</p>
    </div>

    <!-- Judul Dokumen -->
    <div class="document-title">
        <h2>PERJANJIAN KERJA SAMA</h2>
        <p>Nomor: SPK/{{ date('Y') }}/{{ str_pad($employee->id, 4, '0', STR_PAD_LEFT) }}</p>
    </div>

    <div class="section-intro">
        Yang bertanda tangan di bawah ini:
    </div>

    <!-- Pihak Pertama (Perusahaan) -->
    <table class="parties-table">
        <tr>
            <td class="label">Nama Perusahaan</td>
            <td class="separator">:</td>
            <td class="value">{{ $company->company_name }}</td>
        </tr>
        <tr>
            <td class="label">Alamat</td>
            <td class="separator">:</td>
            <td class="value" style="font-weight: normal;">{{ $company->company_address }}</td>
        </tr>
        <tr>
            <td class="label">Perwakilan</td>
            <td class="separator">:</td>
            <td class="value">{{ $company->signature_signer_name ?: 'Direktur Utama' }}</td>
        </tr>
        <tr>
            <td class="label">Jabatan</td>
            <td class="separator">:</td>
            <td class="value">{{ $company->signature_signer_title ?: 'Direktur' }}</td>
        </tr>
    </table>

    <div class="section-intro">
        Dalam hal ini bertindak untuk dan atas nama <strong>{{ $company->company_name }}</strong>, selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong>.
    </div>

    <!-- Pihak Kedua (Karyawan) -->
    <table class="parties-table">
        <tr>
            <td class="label">Nama Lengkap</td>
            <td class="separator">:</td>
            <td class="value">{{ $employee->full_name }}</td>
        </tr>
        <tr>
            <td class="label">No. NIK / KTP</td>
            <td class="separator">:</td>
            <td class="value">{{ $employee->nik ?: '-' }}</td>
        </tr>
        <tr>
            <td class="label">Jenis Kelamin</td>
            <td class="separator">:</td>
            <td class="value" style="font-weight: normal;">{{ $employee->gender === 'MALE' ? 'Laki-laki' : 'Perempuan' }}</td>
        </tr>
        <tr>
            <td class="label">No. Telepon</td>
            <td class="separator">:</td>
            <td class="value" style="font-weight: normal;">{{ $employee->phone ?: '-' }}</td>
        </tr>
        <tr>
            <td class="label">Alamat Tinggal</td>
            <td class="separator">:</td>
            <td class="value" style="font-weight: normal;">{{ $employee->address ?: '-' }}</td>
        </tr>
    </table>

    <div class="section-intro">
        Dalam hal ini bertindak untuk dan atas nama diri sendiri, selanjutnya disebut sebagai <strong>PIHAK KEDUA</strong>.
    </div>

    <div class="section-intro">
        Pada hari ini, telah disepakati perjanjian kerja antara PIHAK PERTAMA dan PIHAK KEDUA dengan ketentuan-ketentuan sebagai berikut:
    </div>

    <!-- Pasal 1: Hubungan Kerja -->
    <div class="clause-title">Pasal 1<br>Hubungan & Status Kerja</div>
    <div class="clause-body">
        PIHAK PERTAMA menerima PIHAK KEDUA sebagai karyawan dengan status <strong>{{ $employee->employment_status }}</strong> pada departemen <strong>{{ $employee->department }}</strong> dengan jabatan sebagai <strong>{{ $employee->position }}</strong> terhitung sejak tanggal <strong>{{ $employee->join_date ?: date('d-m-Y') }}</strong>.
    </div>

    <!-- Pasal 2: Hak & Kewajiban -->
    <div class="clause-title">Pasal 2<br>Tugas & Tanggung Jawab</div>
    <div class="clause-body">
        PIHAK KEDUA berkewajiban untuk menjalankan tugas dan tanggung jawab sesuai dengan arahan atasan serta peraturan perusahaan yang berlaku dengan dedikasi penuh dan profesionalisme tinggi. PIHAK KEDUA wajib menjaga kerahasiaan seluruh informasi penting internal perusahaan (non-disclosure).
    </div>

    <!-- Pasal 3: Hari & Waktu Kerja -->
    <div class="clause-title">Pasal 3<br>Waktu Kerja & Disiplin</div>
    <div class="clause-body">
        PIHAK KEDUA setuju untuk mengikuti ketentuan hari dan waktu kerja serta melakukan pencatatan kehadiran (presensi) resmi harian pada sistem Mikrotek Business Suite yang telah disediakan oleh PIHAK PERTAMA.
    </div>

    <!-- Pasal 4: Berakhirnya Perjanjian -->
    <div class="clause-title">Pasal 4<br>Pemutusan & Berakhirnya Hubungan Kerja</div>
    <div class="clause-body">
        Perjanjian kerja ini dapat diakhiri atas kesepakatan kedua belah pihak atau apabila terjadi pelanggaran berat terhadap tata tertib perusahaan oleh PIHAK KEDUA, atau performa kerja yang tidak memenuhi kriteria minimal setelah diberikan evaluasi tertulis.
    </div>

    <!-- Penutup -->
    <div class="clause-body" style="margin-top: 20px;">
        Demikian Surat Perjanjian Kerja ini dibuat secara sadar, tanpa paksaan dari pihak mana pun, untuk dipatuhi dan dilaksanakan oleh kedua belah pihak.
    </div>

    <!-- Tanda Tangan -->
    <div class="signatures-container">
        <table class="signature-table">
            <tr>
                <td>
                    <p class="signature-title"><strong>PIHAK PERTAMA</strong><br>Perwakilan Perusahaan</p>
                    <p class="signature-name">{{ $company->signature_signer_name ?: 'Direktur Utama' }}</p>
                    <p class="signature-role">{{ $company->signature_signer_title ?: 'PT Mikrotek Zemiro Indonesia' }}</p>
                </td>
                <td>
                    <p class="signature-title"><strong>PIHAK KEDUA</strong><br>Karyawan Bersangkutan</p>
                    <p class="signature-name">{{ $employee->full_name }}</p>
                    <p class="signature-role">Karyawan</p>
                </td>
            </tr>
        </table>
    </div>

</body>
</html>
