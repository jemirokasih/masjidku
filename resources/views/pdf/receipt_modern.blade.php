<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Kwitansi {{ $payment->payment_number }}</title>
    <style>
        @page {
            size: A5 portrait;
            margin-top: 20mm;
            margin-bottom: 15mm;
            margin-left: 15mm;
            margin-right: 15mm;
        }

        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            font-size: 11px;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }

        /* ── Header ─────────────────────────────── */
        .receipt-header {
            border-bottom: 3px solid #059669;
            padding-bottom: 10px;
            margin-bottom: 14px;
        }

        .header-table { width: 100%; border-collapse: collapse; }
        .header-table td { vertical-align: top; }

        .company-name {
            font-size: 17px;
            font-weight: bold;
            color: #059669;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .company-info {
            font-size: 9px;
            color: #475569;
            line-height: 1.4;
            margin-top: 2px;
        }

        .receipt-label {
            font-size: 20px;
            font-weight: bold;
            color: #111827;
            text-align: right;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .receipt-number {
            font-size: 12px;
            font-weight: bold;
            color: #059669;
            text-align: right;
            margin-top: 2px;
        }

        /* ── Body info rows ──────────────────────── */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
        }

        .info-table td {
            padding: 3px 0;
            vertical-align: top;
        }

        .info-table .label {
            width: 38%;
            color: #64748b;
            font-size: 10px;
        }

        .info-table .sep {
            width: 5%;
            color: #94a3b8;
        }

        .info-table .value {
            font-weight: 600;
            color: #111827;
        }

        /* ── Amount Box ──────────────────────────── */
        .amount-box {
            background-color: #f0fdf4;
            border: 2px solid #6ee7b7;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 14px;
        }

        .amount-label {
            font-size: 9px;
            font-weight: bold;
            color: #065f46;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }

        .amount-value {
            font-size: 22px;
            font-weight: bold;
            color: #059669;
            letter-spacing: 0.5px;
        }

        .terbilang-text {
            font-size: 9.5px;
            font-style: italic;
            color: #047857;
            margin-top: 4px;
        }

        /* ── Invoice reference box ───────────────── */
        .invoice-ref-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 8px 12px;
            margin-bottom: 14px;
            font-size: 10px;
        }

        .invoice-ref-box .ref-title {
            font-weight: bold;
            color: #334155;
            margin-bottom: 4px;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }

        .invoice-ref-table { width: 100%; border-collapse: collapse; }
        .invoice-ref-table td { padding: 2px 0; color: #475569; }
        .invoice-ref-table .val { font-weight: 600; color: #1e293b; text-align: right; }

        /* ── Signature & Footer ──────────────────── */
        .sig-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        .sig-table td { vertical-align: bottom; }

        .notes-box {
            font-size: 9.5px;
            color: #64748b;
            font-style: italic;
            border-left: 3px solid #a7f3d0;
            padding-left: 8px;
            line-height: 1.5;
        }

        .sig-block {
            text-align: center;
            width: 140px;
            float: right;
        }

        .sig-line {
            height: 55px;
            border-bottom: 1px dashed #94a3b8;
            margin-bottom: 4px;
        }

        .sig-name {
            font-weight: bold;
            font-size: 10px;
            color: #111827;
        }

        .sig-title {
            font-size: 8.5px;
            color: #64748b;
        }

        /* ── Divider ─────────────────────────────── */
        .divider {
            border: none;
            border-top: 1px solid #e2e8f0;
            margin: 10px 0;
        }

        /* ── Status badge ────────────────────────── */
        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .badge-paid     { background-color: #d1fae5; color: #065f46; }
        .badge-partial  { background-color: #fef3c7; color: #92400e; }
        .badge-sent     { background-color: #dbeafe; color: #1e40af; }
    </style>
</head>
<body>

    {{-- ════════ HEADER ════════ --}}
    <div class="receipt-header">
        <table class="header-table">
            <tr>
                <td style="width: 60%;">
                    <div class="company-name">{{ $company->company_name ?? 'MIKROTEK' }}</div>
                    <div class="company-info">
                        {{ $company->company_address ?? '' }}<br>
                        Email: {{ $company->company_email ?? '' }} | Telp: {{ $company->company_phone ?? '' }}
                        @if($company->tax_number)
                            <br>NPWP: {{ $company->tax_number }}
                        @endif
                    </div>
                </td>
                <td style="width: 40%;">
                    <div class="receipt-label">KWITANSI</div>
                    <div class="receipt-number">{{ $payment->payment_number }}</div>
                    <div style="text-align: right; margin-top: 3px;">
                        <span class="badge badge-paid">LUNAS</span>
                    </div>
                </td>
            </tr>
        </table>
    </div>

    {{-- ════════ DITERIMA DARI ════════ --}}
    <table class="info-table">
        <tr>
            <td class="label">Sudah Diterima dari</td>
            <td class="sep">:</td>
            <td class="value" style="font-size: 12px; color: #059669;">
                {{ $payment->invoice->client->company_name ?? $payment->invoice->client->name }}
            </td>
        </tr>
        <tr>
            <td class="label">U.P</td>
            <td class="sep">:</td>
            <td class="value">{{ $payment->invoice->client->name }}</td>
        </tr>
        <tr>
            <td class="label">Tanggal Pembayaran</td>
            <td class="sep">:</td>
            <td class="value">{{ \Carbon\Carbon::parse($payment->payment_date)->format('d F Y') }}</td>
        </tr>
        <tr>
            <td class="label">Metode Pembayaran</td>
            <td class="sep">:</td>
            <td class="value">{{ $payment->paymentMethod->name ?? 'Transfer Bank' }}</td>
        </tr>
        @if($payment->reference_number)
        <tr>
            <td class="label">No. Referensi / Bukti</td>
            <td class="sep">:</td>
            <td class="value" style="font-family: monospace; font-size: 10px;">{{ $payment->reference_number }}</td>
        </tr>
        @endif
    </table>

    {{-- ════════ NOMINAL BOX ════════ --}}
    <div class="amount-box">
        <div class="amount-label">Jumlah Pembayaran Diterima:</div>
        <div class="amount-value">
            Rp {{ number_format($payment->amount, 0, ',', '.') }}
        </div>
        <div class="terbilang-text">
            &ldquo;{{ App\Helpers\Terbilang::make($payment->amount) }}&rdquo;
        </div>
    </div>

    {{-- ════════ REFERENSI INVOICE ════════ --}}
    <div class="invoice-ref-box">
        <div class="ref-title">📄 Untuk Pembayaran Invoice:</div>
        <table class="invoice-ref-table">
            <tr>
                <td>Nomor Invoice</td>
                <td class="val" style="font-family: monospace; color: #4f46e5;">
                    {{ $payment->invoice->invoice_number }}
                </td>
            </tr>
            <tr>
                <td>Total Tagihan</td>
                <td class="val">Rp {{ number_format($payment->invoice->grand_total, 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td>Sudah Dibayar</td>
                <td class="val" style="color: #059669;">
                    Rp {{ number_format($payment->invoice->paid_amount, 0, ',', '.') }}
                </td>
            </tr>
            @php
                $remaining = $payment->invoice->grand_total - $payment->invoice->paid_amount;
            @endphp
            @if($remaining > 0)
            <tr>
                <td>Sisa Tagihan</td>
                <td class="val" style="color: #dc2626;">Rp {{ number_format($remaining, 0, ',', '.') }}</td>
            </tr>
            @else
            <tr>
                <td>Status Tagihan</td>
                <td class="val"><span class="badge badge-paid">LUNAS</span></td>
            </tr>
            @endif
        </table>
    </div>

    {{-- ════════ CATATAN ════════ --}}
    @if($payment->notes)
    <div class="notes-box">
        <strong>Catatan:</strong> {{ $payment->notes }}
    </div>
    @endif

    {{-- ════════ TANDA TANGAN ════════ --}}
    @php
        $signerName  = $company->signature_signer_name ?? ('Manajemen ' . ($company->company_name ?? 'MIKROTEK'));
        $signerTitle = $company->signature_signer_title ?? 'Bendahara / Finance';
        $sigType     = $payment->signature_type ?: ($company->signature_type ?? 'MANUAL');
    @endphp

    <table class="sig-table">
        <tr>
            <td style="width: 55%; vertical-align: bottom;">
                <div style="font-size: 8.5px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 6px;">
                    Kwitansi ini diterbitkan secara resmi oleh {{ $company->company_name ?? 'MIKROTEK' }}.<br>
                    Harap simpan dokumen ini sebagai bukti pembayaran yang sah.
                </div>
            </td>
            <td style="width: 45%; text-align: right; vertical-align: bottom;">
                <div class="sig-block">
                    <div style="font-size: 8.5px; color: #64748b; margin-bottom: 4px;">
                        {{ \Carbon\Carbon::parse($payment->payment_date)->format('d F Y') }}<br>
                        <strong>{{ $company->company_name ?? 'MIKROTEK' }}</strong>
                    </div>

                    @if($sigType === 'QR_CODE')
                        @php
                            $verifyUrl = url("/portal/invoice/{$payment->invoice->invoice_number}");
                            $qrSvg     = App\Helpers\QrCodeGenerator::generateSvgDataUri($verifyUrl, 80);
                        @endphp
                        <div style="margin: 4px 0;">
                            <img src="{{ $qrSvg }}" style="width: 70px; height: 70px; border: 1px solid #e2e8f0; padding: 3px; border-radius: 5px;">
                        </div>
                        <div style="font-size: 7.5px; color: #6b7280;">Scan untuk verifikasi</div>
                    @elseif($sigType === 'IMAGE' && !empty($company->signature_image_path) && file_exists(storage_path('app/public/' . $company->signature_image_path)))
                        <div style="margin: 4px 0;">
                            <img src="{{ storage_path('app/public/' . $company->signature_image_path) }}" style="max-height: 55px; max-width: 130px;">
                        </div>
                    @else
                        <div class="sig-line"></div>
                    @endif

                    <div class="sig-name">{{ $signerName }}</div>
                    <div class="sig-title">{{ $signerTitle }}</div>
                </div>
            </td>
        </tr>
    </table>

</body>
</html>
