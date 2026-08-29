<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Surat Kontrak Kerja - {{ $employee->full_name }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 20mm 18mm 20mm 18mm;
        }

        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            color: #0f172a;
            font-size: 11px;
            line-height: 1.65;
            margin: 0;
            padding: 0;
        }

        /* ── Header ─────────────────────────────── */
        .header-bar {
            background: #4f46e5;
            color: #fff;
            padding: 14px 18px;
            border-radius: 4px;
            margin-bottom: 18px;
        }

        .header-bar .company-name {
            font-size: 15px;
            font-weight: bold;
            letter-spacing: 0.5px;
            margin: 0;
        }

        .header-bar .company-meta {
            font-size: 9px;
            opacity: 0.85;
            margin: 3px 0 0 0;
        }

        /* ── Document Badge ──────────────────────── */
        .doc-badge-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            border-bottom: 1.5px solid #4f46e5;
            padding-bottom: 8px;
        }

        .doc-title {
            font-size: 13px;
            font-weight: bold;
            color: #4f46e5;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .doc-meta {
            font-size: 9px;
            text-align: right;
            color: #475569;
        }

        /* ── Info Cards ──────────────────────────── */
        .cards-row {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 18px;
        }

        .cards-row td {
            width: 50%;
            vertical-align: top;
            padding: 10px 12px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
        }

        .cards-row td:first-child {
            margin-right: 8px;
        }

        .card-label {
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
            color: #64748b;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }

        .card-value {
            font-size: 11px;
            font-weight: bold;
            color: #0f172a;
            margin: 2px 0;
        }

        .card-sub {
            font-size: 9.5px;
            color: #475569;
            margin: 1px 0;
        }

        /* ── Employee Data Table ─────────────────── */
        .employee-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 18px;
            font-size: 10.5px;
        }

        .employee-table th {
            background: #4f46e5;
            color: #fff;
            padding: 6px 10px;
            text-align: left;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .employee-table td {
            padding: 5px 10px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: top;
        }

        .employee-table tr:nth-child(even) td {
            background: #f8fafc;
        }

        .employee-table .td-label {
            color: #475569;
            width: 38%;
            font-weight: 600;
        }

        .employee-table .td-sep {
            width: 4%;
            color: #94a3b8;
        }

        /* ── Clauses ─────────────────────────────── */
        .clause {
            margin-bottom: 14px;
        }

        .clause-title {
            font-size: 10.5px;
            font-weight: bold;
            color: #4f46e5;
            border-left: 3px solid #4f46e5;
            padding-left: 8px;
            margin-bottom: 6px;
        }

        .clause-body {
            text-align: justify;
            font-size: 10.5px;
            color: #334155;
            padding-left: 11px;
        }

        /* ── Footer note ─────────────────────────── */
        .footer-note {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 4px;
            padding: 8px 12px;
            font-size: 9.5px;
            color: #1e40af;
            margin-bottom: 20px;
            margin-top: 10px;
        }

        /* ── Signatures ──────────────────────────── */
        .signatures-container {
            margin-top: 30px;
        }

        .signature-table {
            width: 100%;
            border-collapse: collapse;
        }

        .signature-table td {
            width: 50%;
            text-align: center;
            vertical-align: top;
            padding: 0 12px;
        }

        .sig-label {
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #4f46e5;
            padding: 5px 12px;
            border: 1px solid #4f46e5;
            border-radius: 20px;
            display: inline-block;
            margin-bottom: 50px;
        }

        .sig-name {
            font-weight: bold;
            border-top: 1.5px solid #334155;
            padding-top: 4px;
            font-size: 11px;
        }

        .sig-role {
            font-size: 9.5px;
            color: #475569;
        }

        .sig-place-date {
            font-size: 10px;
            color: #334155;
            margin-bottom: 4px;
        }
    </style>
</head>
<body>

    <!-- Header Bar -->
    <div class="header-bar">
        <p class="company-name">{{ $company->company_name }}</p>
        <p class="company-meta">{{ $company->company_address }} &bull; Telp: {{ $company->company_phone }} &bull; {{ $company->company_email }}</p>
    </div>

    <!-- Document Title Row -->
    <div class="doc-badge-row">
        <div class="doc-title">Surat Kontrak Kerja</div>
        <div class="doc-meta">
            No: {{ $contract['number'] ?? $contract['contract_number'] ?? '-' }}<br>
            Tanggal: {{ \Carbon\Carbon::parse($contract['date'])->translatedFormat('d F Y') }}
        </div>
    </div>

    <!-- Party Cards -->
    <table class="cards-row">
        <tr>
            <td>
                <div class="card-label">Pihak Pertama (Pemberi Kerja)</div>
                <div class="card-value">{{ $company->company_name }}</div>
                <div class="card-sub">{{ $company->company_address }}</div>
                <div class="card-sub">Diwakili: <strong>{{ $contract['signer_name'] }}</strong></div>
                <div class="card-sub">Jabatan: {{ $contract['signer_title'] }}</div>
            </td>
            <td>
                <div class="card-label">Pihak Kedua (Penerima Kerja)</div>
                <div class="card-value">{{ $employee->full_name }}</div>
                <div class="card-sub">NIK / KTP: {{ $employee->nik ?: '-' }}</div>
                <div class="card-sub">Jenis Kelamin: {{ $employee->gender === 'MALE' ? 'Laki-laki' : 'Perempuan' }}</div>
                <div class="card-sub">Telepon: {{ $employee->phone ?: '-' }}</div>
            </td>
        </tr>
    </table>

    <!-- Employee Employment Details -->
    <table class="employee-table">
        <thead>
            <tr>
                <th colspan="3">Detail Penempatan &amp; Kepegawaian</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="td-label">Kode Karyawan</td>
                <td class="td-sep">:</td>
                <td>{{ $employee->employee_code ?? '-' }}</td>
            </tr>
            <tr>
                <td class="td-label">Jabatan / Posisi</td>
                <td class="td-sep">:</td>
                <td><strong>{{ $employee->position }}</strong></td>
            </tr>
            <tr>
                <td class="td-label">Departemen</td>
                <td class="td-sep">:</td>
                <td>{{ $employee->department }}</td>
            </tr>
            <tr>
                <td class="td-label">Status Kepegawaian</td>
                <td class="td-sep">:</td>
                <td><strong>{{ $employee->employment_status }}</strong></td>
            </tr>
            <tr>
                <td class="td-label">Tanggal Mulai Bekerja</td>
                <td class="td-sep">:</td>
                <td>{{ \Carbon\Carbon::parse($contract['start_date'])->translatedFormat('d F Y') }}</td>
            </tr>
            @if($contract['end_date'])
            <tr>
                <td class="td-label">Tanggal Berakhir</td>
                <td class="td-sep">:</td>
                <td>{{ \Carbon\Carbon::parse($contract['end_date'])->translatedFormat('d F Y') }}</td>
            </tr>
            @endif
            @if($contract['work_location'])
            <tr>
                <td class="td-label">Lokasi Kerja</td>
                <td class="td-sep">:</td>
                <td>{{ $contract['work_location'] }}</td>
            </tr>
            @endif
        </tbody>
    </table>

    <!-- Clauses -->
    <div class="clause">
        <div class="clause-title">Pasal 1 — Hubungan &amp; Status Kerja</div>
        <div class="clause-body">
            PIHAK PERTAMA menerima PIHAK KEDUA sebagai karyawan dengan status <strong>{{ $employee->employment_status }}</strong> pada Departemen <strong>{{ $employee->department }}</strong> dengan jabatan <strong>{{ $employee->position }}</strong>, terhitung sejak <strong>{{ \Carbon\Carbon::parse($contract['start_date'])->translatedFormat('d F Y') }}</strong>@if($contract['end_date']) sampai dengan <strong>{{ \Carbon\Carbon::parse($contract['end_date'])->translatedFormat('d F Y') }}</strong>@endif.@if($contract['work_location']) Lokasi kerja PIHAK KEDUA adalah <strong>{{ $contract['work_location'] }}</strong>.@endif
        </div>
    </div>

    <div class="clause">
        <div class="clause-title">Pasal 2 — Tugas &amp; Tanggung Jawab</div>
        <div class="clause-body">
            PIHAK KEDUA berkewajiban melaksanakan tugas dan tanggung jawab sesuai arahan atasan serta peraturan perusahaan dengan dedikasi dan profesionalisme. PIHAK KEDUA wajib menjaga kerahasiaan seluruh informasi penting internal perusahaan (non-disclosure agreement berlaku).
        </div>
    </div>

    <div class="clause">
        <div class="clause-title">Pasal 3 — Waktu Kerja &amp; Disiplin</div>
        <div class="clause-body">
            PIHAK KEDUA setuju mengikuti ketentuan hari dan jam kerja perusahaan serta melakukan pencatatan kehadiran (presensi) harian secara resmi pada sistem yang disediakan PIHAK PERTAMA.
        </div>
    </div>

    @if($contract['basic_salary'])
    <div class="clause">
        <div class="clause-title">Pasal 4 — Kompensasi</div>
        <div class="clause-body">
            PIHAK KEDUA menerima gaji pokok sebesar <strong>Rp {{ number_format($contract['basic_salary'], 0, ',', '.') }}</strong> per bulan, sesuai ketentuan perusahaan dan peraturan yang berlaku.
        </div>
    </div>
    @endif

    @if($contract['probation_period'])
    <div class="clause">
        <div class="clause-title">Pasal {{ $contract['basic_salary'] ? 5 : 4 }} — Masa Percobaan</div>
        <div class="clause-body">
            Masa percobaan kerja berlaku selama <strong>{{ $contract['probation_period'] }}</strong> sejak tanggal mulai bekerja.
        </div>
    </div>
    @endif

    <div class="clause">
        <div class="clause-title">Pasal {{ 4 + ($contract['basic_salary'] ? 1 : 0) + ($contract['probation_period'] ? 1 : 0) }} — Pemutusan Hubungan Kerja</div>
        <div class="clause-body">
            Perjanjian ini dapat diakhiri atas kesepakatan kedua belah pihak, atau bila terjadi pelanggaran berat terhadap tata tertib perusahaan, atau performa di bawah standar minimal setelah evaluasi tertulis.
        </div>
    </div>

    @if($contract['additional_terms'])
    <div class="clause">
        <div class="clause-title">Ketentuan Tambahan</div>
        <div class="clause-body">{!! nl2br(e($contract['additional_terms'])) !!}</div>
    </div>
    @endif

    <div class="footer-note">
        Surat kontrak ini dibuat dengan itikad baik dan tanpa paksaan dari pihak mana pun. Dokumen ini sah berlaku sejak tanggal penandatanganan oleh kedua belah pihak.
    </div>

    <!-- Signatures -->
    <div class="signatures-container">
        <table class="signature-table">
            <tr>
                <td>
                    <div class="sig-place-date">{{ $contract['work_location'] ?: $company->company_address }}, {{ \Carbon\Carbon::parse($contract['date'])->translatedFormat('d F Y') }}</div>
                    <div class="sig-label">Pihak Pertama</div>
                    <p class="sig-name">{{ $contract['signer_name'] }}</p>
                    <p class="sig-role">{{ $contract['signer_title'] }}</p>
                    <p class="sig-role">{{ $company->company_name }}</p>
                </td>
                <td>
                    <div class="sig-place-date">{{ $contract['work_location'] ?: $company->company_address }}, {{ \Carbon\Carbon::parse($contract['date'])->translatedFormat('d F Y') }}</div>
                    <div class="sig-label">Pihak Kedua</div>
                    <p class="sig-name">{{ $employee->full_name }}</p>
                    <p class="sig-role">{{ $employee->position }}</p>
                    <p class="sig-role">Karyawan</p>
                </td>
            </tr>
        </table>
    </div>

</body>
</html>
