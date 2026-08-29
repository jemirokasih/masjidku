<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Slip Gaji - {{ $payslip->payslip_number ?? 'DRAFT' }} - {{ $employee->full_name }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 15mm 15mm 15mm 15mm;
        }

        body {
            font-family: 'Times New Roman', Times, serif;
            color: #111827;
            font-size: 11px;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }

        /* ── Classic Formal Kop Surat ── */
        .kop-surat {
            text-align: center;
            border-bottom: 3px double #000000;
            padding-bottom: 8px;
            margin-bottom: 14px;
        }

        .company-title {
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .company-address {
            font-size: 9.5px;
            color: #374151;
            margin-top: 2px;
        }

        .slip-title {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            text-decoration: underline;
            text-transform: uppercase;
            margin-top: 8px;
            margin-bottom: 2px;
        }

        .slip-number {
            text-align: center;
            font-size: 10px;
            margin-bottom: 12px;
        }

        /* ── Info Table ── */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }

        .info-table td {
            font-size: 10px;
            padding: 3px 2px;
            vertical-align: top;
        }

        /* ── Detail Table ── */
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
        }

        .details-table th, .details-table td {
            border: 1px solid #374151;
            padding: 5px 8px;
            font-size: 10px;
        }

        .details-table th {
            background-color: #f3f4f6;
            text-align: center;
            font-weight: bold;
            text-transform: uppercase;
        }

        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }

        /* ── Terbilang & Total ── */
        .thp-row {
            background-color: #e5e7eb;
            font-weight: bold;
            font-size: 11px;
        }

        .terbilang-box {
            border: 1px dashed #4b5563;
            background-color: #f9fafb;
            padding: 6px 10px;
            font-style: italic;
            font-size: 9.5px;
            margin-bottom: 16px;
        }

        /* ── Signatures ── */
        .sign-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        .sign-table td {
            width: 50%;
            text-align: center;
            vertical-align: top;
            font-size: 10px;
        }

        .sign-space {
            height: 55px;
        }

        .sign-underline {
            font-weight: bold;
            text-decoration: underline;
        }
    </style>
</head>
<body>

    <!-- Kop Surat Formal -->
    <div class="kop-surat">
        <div class="company-title">{{ $company->company_name ?? 'PT MIKROTEK ZEMIRO INDONESIA' }}</div>
        <div class="company-address">
            {{ $company->company_address ?? 'Jakarta, Indonesia' }}<br>
            Telp: {{ $company->company_phone ?? '-' }} | Email: {{ $company->company_email ?? 'billing@mzi.co.id' }}
        </div>
    </div>

    <!-- Title -->
    <div class="slip-title">SLIP PEMBAYARAN GAJI</div>
    <div class="slip-number">Nomor: {{ $payslip->payslip_number ?? 'DRAFT' }} | Periode: {{ $period->period_name }}</div>

    <!-- Employee Information -->
    <table class="info-table">
        <tr>
            <td style="width: 18%;">Nama Karyawan</td>
            <td style="width: 32%;">: <strong>{{ $employee->full_name }}</strong></td>
            <td style="width: 18%;">Periode Kerja</td>
            <td style="width: 32%;">: {{ date('d/m/Y', strtotime($period->start_date)) }} s/d {{ date('d/m/Y', strtotime($period->end_date)) }}</td>
        </tr>
        <tr>
            <td>NIK / Kode</td>
            <td>: {{ $employee->nik ?: ($employee->employee_code ?: '-') }}</td>
            <td>Status Kepegawaian</td>
            <td>: {{ $employee->employment_status ?? 'Karyawan' }}</td>
        </tr>
        <tr>
            <td>Jabatan / Dept</td>
            <td>: {{ $employee->position ?? '-' }} / {{ $employee->department ?? '-' }}</td>
            <td>Rekening Pembayaran</td>
            <td>: {{ $payslip->bank_name ?: ($employee->bank_name ?: '-') }} ({{ $payslip->bank_account_number ?: ($employee->bank_account_number ?: '-') }})</td>
        </tr>
    </table>

    <!-- Kehadiran Singkat -->
    @php
        $att = $payslip->attendance_summary ?? [];
    @endphp
    <div style="font-size: 9.5px; margin-bottom: 8px; color: #374151;">
        <strong>Rekapitulasi Kehadiran:</strong> 
        Hari Kerja: {{ $att['total_work_days'] ?? 0 }} hari | 
        Hadir: {{ $att['present_days'] ?? 0 }} | 
        Terlambat: {{ $att['late_days'] ?? 0 }} | 
        Cuti/Izin/Sakit: {{ ($att['leave_days'] ?? 0) + ($att['permit_days'] ?? 0) + ($att['sick_days'] ?? 0) }} | 
        Alpa: {{ $att['absent_days'] ?? 0 }} | 
        Total Jam: {{ $att['total_work_hours'] ?? 0 }} Jam
    </div>

    <!-- Main Table -->
    <table class="details-table">
        <thead>
            <tr>
                <th style="width: 50%;">I. PENDAPATAN</th>
                <th style="width: 50%;">II. POTONGAN</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <!-- Pendapatan -->
                <td style="vertical-align: top; padding: 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="border: none; padding: 4px;">Gaji Pokok</td>
                            <td style="border: none; padding: 4px; text-align: right; font-weight: bold;">Rp {{ number_format($payslip->basic_salary, 0, ',', '.') }}</td>
                        </tr>
                        @if(!empty($payslip->earnings_breakdown) && is_array($payslip->earnings_breakdown))
                            @foreach($payslip->earnings_breakdown as $item)
                                <tr>
                                    <td style="border: none; padding: 4px;">
                                        {{ $item['name'] }}
                                        @if(!empty($item['description']))
                                            <span style="font-size: 8px; color: #6b7280; display: block;">({{ $item['description'] }})</span>
                                        @endif
                                    </td>
                                    <td style="border: none; padding: 4px; text-align: right;">Rp {{ number_format($item['amount'], 0, ',', '.') }}</td>
                                </tr>
                            @endforeach
                        @endif
                    </table>
                </td>

                <!-- Potongan -->
                <td style="vertical-align: top; padding: 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        @if(!empty($payslip->deductions_breakdown) && is_array($payslip->deductions_breakdown) && count($payslip->deductions_breakdown) > 0)
                            @foreach($payslip->deductions_breakdown as $item)
                                <tr>
                                    <td style="border: none; padding: 4px;">
                                        {{ $item['name'] }}
                                        @if(!empty($item['description']))
                                            <span style="font-size: 8px; color: #6b7280; display: block;">({{ $item['description'] }})</span>
                                        @endif
                                    </td>
                                    <td style="border: none; padding: 4px; text-align: right; color: #991b1b;">Rp {{ number_format($item['amount'], 0, ',', '.') }}</td>
                                </tr>
                            @endforeach
                        @else
                            <tr>
                                <td colspan="2" style="border: none; padding: 8px; text-align: center; color: #6b7280;">- Tidak ada potongan -</td>
                            </tr>
                        @endif
                    </table>
                </td>
            </tr>
            <!-- Subtotals -->
            <tr style="background-color: #f9fafb; font-weight: bold;">
                <td style="padding: 5px 8px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="border: none; padding: 0;">Total Pendapatan (Gross)</td>
                            <td style="border: none; padding: 0; text-align: right;">Rp {{ number_format($payslip->basic_salary + $payslip->total_allowances + $payslip->total_reimbursements, 0, ',', '.') }}</td>
                        </tr>
                    </table>
                </td>
                <td style="padding: 5px 8px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="border: none; padding: 0; color: #991b1b;">Total Potongan</td>
                            <td style="border: none; padding: 0; text-align: right; color: #991b1b;">Rp {{ number_format($payslip->total_deductions, 0, ',', '.') }}</td>
                        </tr>
                    </table>
                </td>
            </tr>
            <!-- Final Take Home Pay -->
            <tr class="thp-row">
                <td colspan="2" style="padding: 8px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="border: none; padding: 0; font-size: 12px;">GAJI BERSIH DITERIMA (TAKE HOME PAY)</td>
                            <td style="border: none; padding: 0; text-align: right; font-size: 13px; font-weight: bold;">Rp {{ number_format($payslip->net_salary, 0, ',', '.') }}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Terbilang -->
    <div class="terbilang-box">
        <strong>Terbilang:</strong> {{ \App\Helpers\Terbilang::make($payslip->net_salary) }} Rupiah
    </div>

    <!-- Signatures -->
    <table class="sign-table">
        <tr>
            <td>
                <div>Penerima,</div>
                <div class="sign-space"></div>
                <div class="sign-underline">{{ $employee->full_name }}</div>
            </td>
            <td>
                <div>{{ $company->company_name ?? 'Management' }},</div>
                <div class="sign-space"></div>
                <div class="sign-underline">{{ $company->signature_signer_name ?? 'HRD Manager' }}</div>
                <div style="font-size: 8.5px; color: #4b5563;">{{ $company->signature_signer_title ?? 'HRD & Finance' }}</div>
            </td>
        </tr>
    </table>

</body>
</html>
