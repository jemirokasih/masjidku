<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Slip Gaji - {{ $payslip->payslip_number ?? 'DRAFT' }} - {{ $employee->full_name }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 12mm 15mm 15mm 15mm;
        }

        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            font-size: 10px;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }

        /* ── Header ── */
        .payslip-header {
            border-bottom: 2px solid #4f46e5;
            padding-bottom: 10px;
            margin-bottom: 12px;
        }

        .header-table { width: 100%; border-collapse: collapse; }
        .header-table td { vertical-align: top; }

        .company-name {
            font-size: 16px;
            font-weight: bold;
            color: #4f46e5;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .company-info {
            font-size: 8.5px;
            color: #475569;
            line-height: 1.35;
            margin-top: 2px;
        }

        .doc-title {
            font-size: 17px;
            font-weight: 800;
            color: #0f172a;
            text-align: right;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 0;
        }

        .doc-subtitle {
            font-size: 10px;
            font-weight: 600;
            color: #4f46e5;
            text-align: right;
            margin-top: 2px;
        }

        .confidential-badge {
            display: inline-block;
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            color: #64748b;
            font-size: 7.5px;
            font-weight: bold;
            padding: 2px 6px;
            border-radius: 3px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 4px;
        }

        /* ── Employee Information Grid ── */
        .info-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 8px 12px;
            margin-bottom: 12px;
        }

        .info-table {
            width: 100%;
            border-collapse: collapse;
        }

        .info-table td {
            font-size: 9px;
            padding: 2.5px 4px;
            vertical-align: middle;
        }

        .info-label {
            color: #64748b;
            font-weight: 600;
            width: 18%;
        }

        .info-value {
            color: #0f172a;
            font-weight: bold;
            width: 32%;
        }

        /* ── Attendance Summary Ribbon ── */
        .attendance-ribbon {
            background-color: #eef2ff;
            border: 1px solid #c7d2fe;
            border-radius: 6px;
            padding: 6px 10px;
            margin-bottom: 12px;
        }

        .att-table {
            width: 100%;
            border-collapse: collapse;
            text-align: center;
        }

        .att-table td {
            padding: 2px 4px;
            font-size: 8.5px;
        }

        .att-num {
            font-size: 11px;
            font-weight: bold;
            color: #3730a3;
        }

        .att-lbl {
            font-size: 7.5px;
            color: #4b5563;
            text-transform: uppercase;
        }

        /* ── Two-Column Breakdown ── */
        .breakdown-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 8px 0;
            margin-bottom: 12px;
        }

        .breakdown-table > tbody > tr > td {
            width: 50%;
            vertical-align: top;
            padding: 0;
        }

        .section-box {
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            overflow: hidden;
        }

        .section-head-earn {
            background-color: #f0fdf4;
            border-bottom: 1px solid #bbf7d0;
            padding: 6px 10px;
            color: #15803d;
            font-weight: bold;
            font-size: 9.5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .section-head-deduct {
            background-color: #fef2f2;
            border-bottom: 1px solid #fecaca;
            padding: 6px 10px;
            color: #b91c1c;
            font-weight: bold;
            font-size: 9.5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .item-table {
            width: 100%;
            border-collapse: collapse;
            background-color: #ffffff;
        }

        .item-table td {
            padding: 5px 8px;
            font-size: 8.5px;
            border-bottom: 1px solid #f1f5f9;
        }

        .item-name {
            color: #1e293b;
            font-weight: 500;
        }

        .item-desc {
            font-size: 7.5px;
            color: #64748b;
            display: block;
        }

        .item-amount {
            text-align: right;
            font-weight: 600;
            color: #0f172a;
            white-space: nowrap;
        }

        .subtotal-row td {
            background-color: #f8fafc;
            font-weight: bold;
            font-size: 9px;
            border-top: 1px solid #cbd5e1;
            padding: 6px 8px;
        }

        /* ── Net Salary Callout ── */
        .thp-box {
            background: #4f46e5;
            color: #ffffff;
            border-radius: 6px;
            padding: 10px 14px;
            margin-bottom: 12px;
        }

        .thp-table {
            width: 100%;
            border-collapse: collapse;
        }

        .thp-label {
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .thp-terbilang {
            font-size: 8px;
            font-style: italic;
            color: #e0e7ff;
            margin-top: 2px;
        }

        .thp-amount {
            font-size: 18px;
            font-weight: 800;
            text-align: right;
            letter-spacing: 0.5px;
        }

        /* ── Signatures & Footer ── */
        .footer-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
        }

        .footer-table td {
            vertical-align: bottom;
            font-size: 8.5px;
        }

        .sign-box {
            text-align: center;
            width: 35%;
        }

        .sign-title {
            color: #475569;
            margin-bottom: 45px;
            font-size: 8.5px;
        }

        .sign-name {
            font-weight: bold;
            color: #0f172a;
            border-top: 1px solid #94a3b8;
            display: inline-block;
            min-width: 140px;
            padding-top: 3px;
        }

        .qr-section {
            text-align: center;
            width: 30%;
        }

        .qr-note {
            font-size: 7px;
            color: #64748b;
            margin-top: 2px;
        }

        .system-note {
            font-size: 7.5px;
            color: #94a3b8;
            text-align: center;
            margin-top: 15px;
            border-top: 1px dashed #e2e8f0;
            padding-top: 4px;
        }
    </style>
</head>
<body>

    <!-- Header Section -->
    <div class="payslip-header">
        <table class="header-table">
            <tr>
                <td style="width: 60%;">
                    <div class="company-name">{{ $company->company_name ?? 'PT MIKROTEK ZEMIRO INDONESIA' }}</div>
                    <div class="company-info">
                        {{ $company->company_address ?? 'Jakarta, Indonesia' }}<br>
                        Email: {{ $company->company_email ?? 'hr@mzi.co.id' }} | Telp: {{ $company->company_phone ?? '-' }}
                    </div>
                </td>
                <td style="width: 40%; text-align: right;">
                    <div class="doc-title">SLIP GAJI</div>
                    <div class="doc-subtitle">{{ $period->period_name }}</div>
                    <div style="margin-top: 3px; font-size: 8.5px; color: #475569;">
                        No: <strong>{{ $payslip->payslip_number ?? 'DRAFT' }}</strong>
                    </div>
                    <div>
                        <span class="confidential-badge">Rahasia / Confidential</span>
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Employee Information Card -->
    <div class="info-card">
        <table class="info-table">
            <tr>
                <td class="info-label">Nama Karyawan</td>
                <td class="info-value">: {{ $employee->full_name }}</td>
                <td class="info-label">Periode Kerja</td>
                <td class="info-value">: {{ date('d/m/Y', strtotime($period->start_date)) }} - {{ date('d/m/Y', strtotime($period->end_date)) }}</td>
            </tr>
            <tr>
                <td class="info-label">NIK / Kode Staff</td>
                <td class="info-value">: {{ $employee->nik ?: ($employee->employee_code ?: '-') }}</td>
                <td class="info-label">Tanggal Terbit</td>
                <td class="info-value">: {{ $payslip->payment_date ? date('d F Y', strtotime($payslip->payment_date)) : date('d F Y') }}</td>
            </tr>
            <tr>
                <td class="info-label">Jabatan & Dept</td>
                <td class="info-value">: {{ $employee->position ?? '-' }} ({{ $employee->department ?? '-' }})</td>
                <td class="info-label">Metode Pembayaran</td>
                <td class="info-value">: {{ $payslip->payment_method === 'CASH' ? 'Tunai (Cash)' : 'Transfer Bank' }}</td>
            </tr>
            <tr>
                <td class="info-label">Status Hubungan</td>
                <td class="info-value">: {{ $employee->employment_status ?? 'Karyawan Tetap' }}</td>
                <td class="info-label">Rekening Bank</td>
                <td class="info-value">: {{ $payslip->bank_name ?: ($employee->bank_name ?: '-') }} - {{ $payslip->bank_account_number ?: ($employee->bank_account_number ?: '-') }}</td>
            </tr>
        </table>
    </div>

    <!-- Attendance Summary Ribbon -->
    @php
        $att = $payslip->attendance_summary ?? [];
    @endphp
    <div class="attendance-ribbon">
        <table class="att-table">
            <tr>
                <td>
                    <div class="att-num">{{ $att['total_work_days'] ?? 0 }}</div>
                    <div class="att-lbl">Hari Kerja</div>
                </td>
                <td>
                    <div class="att-num" style="color: #16a34a;">{{ $att['present_days'] ?? 0 }}</div>
                    <div class="att-lbl">Hadir Tepat</div>
                </td>
                <td>
                    <div class="att-num" style="color: #d97706;">{{ $att['late_days'] ?? 0 }}</div>
                    <div class="att-lbl">Terlambat</div>
                </td>
                <td>
                    <div class="att-num" style="color: #2563eb;">{{ ($att['leave_days'] ?? 0) + ($att['permit_days'] ?? 0) + ($att['sick_days'] ?? 0) }}</div>
                    <div class="att-lbl">Cuti / Izin / Sakit</div>
                </td>
                <td>
                    <div class="att-num" style="color: #dc2626;">{{ $att['absent_days'] ?? 0 }}</div>
                    <div class="att-lbl">Alpa / Mangkir</div>
                </td>
                <td>
                    <div class="att-num">{{ $att['total_work_hours'] ?? 0 }} Jam</div>
                    <div class="att-lbl">Jam Kerja</div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Two-Column Breakdown: Pendapatan & Potongan -->
    <table class="breakdown-table">
        <tr>
            <!-- Left Box: Pendapatan (Earnings) -->
            <td>
                <div class="section-box">
                    <div class="section-head-earn">A. PENDAPATAN (EARNINGS)</div>
                    <table class="item-table">
                        <tr>
                            <td>
                                <span class="item-name">Gaji Pokok (Basic Salary)</span>
                            </td>
                            <td class="item-amount">Rp {{ number_format($payslip->basic_salary, 0, ',', '.') }}</td>
                        </tr>
                        @if(!empty($payslip->earnings_breakdown) && is_array($payslip->earnings_breakdown))
                            @foreach($payslip->earnings_breakdown as $item)
                                <tr>
                                    <td>
                                        <span class="item-name">{{ $item['name'] }}</span>
                                        @if(!empty($item['description']))
                                            <span class="item-desc">{{ $item['description'] }}</span>
                                        @endif
                                    </td>
                                    <td class="item-amount">Rp {{ number_format($item['amount'], 0, ',', '.') }}</td>
                                </tr>
                            @endforeach
                        @endif
                        <tr class="subtotal-row">
                            <td style="color: #15803d;">TOTAL PENDAPATAN (GROSS)</td>
                            <td class="item-amount" style="color: #15803d;">
                                Rp {{ number_format($payslip->basic_salary + $payslip->total_allowances + $payslip->total_reimbursements, 0, ',', '.') }}
                            </td>
                        </tr>
                    </table>
                </div>
            </td>

            <!-- Right Box: Potongan (Deductions) -->
            <td>
                <div class="section-box">
                    <div class="section-head-deduct">B. POTONGAN (DEDUCTIONS)</div>
                    <table class="item-table">
                        @if(!empty($payslip->deductions_breakdown) && is_array($payslip->deductions_breakdown) && count($payslip->deductions_breakdown) > 0)
                            @foreach($payslip->deductions_breakdown as $item)
                                <tr>
                                    <td>
                                        <span class="item-name">{{ $item['name'] }}</span>
                                        @if(!empty($item['description']))
                                            <span class="item-desc">{{ $item['description'] }}</span>
                                        @endif
                                    </td>
                                    <td class="item-amount" style="color: #b91c1c;">Rp {{ number_format($item['amount'], 0, ',', '.') }}</td>
                                </tr>
                            @endforeach
                        @else
                            <tr>
                                <td colspan="2" style="color: #94a3b8; text-align: center; padding: 12px 0;">
                                    Tidak ada potongan untuk periode ini
                                </td>
                            </tr>
                        @endif
                        <tr class="subtotal-row">
                            <td style="color: #b91c1c;">TOTAL POTONGAN</td>
                            <td class="item-amount" style="color: #b91c1c;">
                                Rp {{ number_format($payslip->total_deductions, 0, ',', '.') }}
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
        </tr>
    </table>

    <!-- Take Home Pay Highlight Box -->
    <div class="thp-box">
        <table class="thp-table">
            <tr>
                <td style="width: 55%;">
                    <div class="thp-label">GAJI BERSIH (TAKE HOME PAY)</div>
                    <div class="thp-terbilang">
                        Terbilang: {{ \App\Helpers\Terbilang::make($payslip->net_salary) }} Rupiah
                    </div>
                </td>
                <td style="width: 45%;">
                    <div class="thp-amount">Rp {{ number_format($payslip->net_salary, 0, ',', '.') }}</div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Signatures & Verification -->
    <table class="footer-table">
        <tr>
            <!-- Employee Signature -->
            <td class="sign-box">
                <div class="sign-title">Diterima Oleh Karyawan,</div>
                <div class="sign-name">{{ $employee->full_name }}</div>
            </td>

            <!-- QR Code Verification Center -->
            <td class="qr-section">
                @if(!empty($qrCodeSvg))
                    <img src="{{ $qrCodeSvg }}" width="70" height="70" alt="QR Code">
                    <div class="qr-note">Scan untuk verifikasi dokumen resmi</div>
                @else
                    <div style="font-size: 8px; color: #94a3b8;">[ Dokumen Terverifikasi Sistem ]</div>
                @endif
            </td>

            <!-- Company HR / Finance Signer -->
            <td class="sign-box">
                <div class="sign-title">Disahkan Oleh Management / HRD,</div>
                <div class="sign-name">{{ $company->signature_signer_name ?? 'HRD Manager' }}</div>
            </td>
        </tr>
    </table>

    <div class="system-note">
        Dokumen ini diterbitkan secara elektronik oleh Sistem Informasi Manajemen Mikrotek Business Suite Neo pada {{ date('d/m/Y H:i') }} WIB dan sah tanpa tanda tangan basah.
    </div>

</body>
</html>
