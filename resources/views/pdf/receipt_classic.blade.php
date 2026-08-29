<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Kwitansi {{ $payment->payment_number }}</title>
    <style>
        @page {
            size: A5 landscape;
            margin: 12mm 14mm 12mm 14mm;
        }

        * { box-sizing: border-box; }

        body {
            font-family: 'Times New Roman', Times, serif;
            color: #111;
            font-size: 11px;
            line-height: 1.5;
            margin: 0;
            padding: 0;
            background: #fff;
        }

        /* ── Outer border double-line frame ── */
        .outer-frame {
            border: 4px double #1a1a1a;
            padding: 0;
            position: relative;
            height: 100%;
            min-height: 185mm;
        }

        .inner-frame {
            border: 1px solid #1a1a1a;
            margin: 4px;
            padding: 8px 14px 10px 14px;
            position: relative;
            min-height: calc(185mm - 20px);
        }

        /* ── LUNAS diagonal watermark stamp ── */
        .stamp-lunas {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-28deg);
            font-size: 72px;
            font-weight: 900;
            color: rgba(5, 150, 105, 0.12);
            letter-spacing: 6px;
            text-transform: uppercase;
            font-family: 'Arial Black', Arial, sans-serif;
            pointer-events: none;
            white-space: nowrap;
            z-index: 0;
        }

        /* ── Header ── */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 2px solid #111;
            padding-bottom: 6px;
            margin-bottom: 8px;
        }

        .header-table td { vertical-align: middle; }

        .company-name {
            font-size: 15px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #111;
        }

        .company-meta {
            font-size: 9px;
            color: #444;
            line-height: 1.4;
        }

        .kwitansi-title-box {
            text-align: center;
            border: 2px solid #111;
            padding: 4px 10px;
            display: inline-block;
        }

        .kwitansi-title {
            font-size: 20px;
            font-weight: 900;
            letter-spacing: 6px;
            text-transform: uppercase;
            color: #111;
            display: block;
        }

        .kwitansi-sub {
            font-size: 8px;
            letter-spacing: 2px;
            color: #555;
            text-transform: uppercase;
        }

        .nomor-box {
            font-size: 9px;
            color: #555;
            text-align: right;
            margin-top: 4px;
        }

        .nomor-value {
            display: inline-block;
            border-bottom: 1px solid #111;
            font-weight: bold;
            font-family: 'Courier New', Courier, monospace;
            font-size: 11px;
            color: #111;
            min-width: 120px;
            padding: 0 4px;
        }

        /* ── Form Fields ── */
        .form-section {
            position: relative;
            z-index: 1;
            margin-top: 6px;
        }

        .form-row {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5px;
        }

        .form-row td { vertical-align: bottom; padding: 0; }

        .field-label {
            white-space: nowrap;
            padding-right: 6px;
            font-size: 10.5px;
            color: #333;
            width: 1%;
        }

        .field-colon {
            width: 12px;
            font-size: 10.5px;
            color: #333;
            text-align: center;
        }

        .field-line {
            border-bottom: 1px solid #555;
            width: 100%;
            padding: 0 4px 1px 4px;
            font-size: 11px;
            font-weight: bold;
            color: #111;
        }

        /* ── Amount Box ── */
        .amount-section {
            position: relative;
            z-index: 1;
            margin: 8px 0;
        }

        .amount-outer {
            border: 2px solid #111;
            padding: 0;
            display: flex;
        }

        .amount-label-bar {
            background: #111;
            color: #fff;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            writing-mode: vertical-rl;
            text-orientation: mixed;
            transform: rotate(180deg);
            padding: 6px 5px;
            white-space: nowrap;
        }

        .amount-content {
            flex: 1;
            padding: 5px 10px;
        }

        .amount-nominal {
            font-size: 24px;
            font-weight: 900;
            color: #111;
            font-family: 'Arial Black', Arial, sans-serif;
            letter-spacing: 1px;
        }

        .amount-terbilang {
            font-size: 9.5px;
            font-style: italic;
            color: #333;
            margin-top: 2px;
            border-top: 1px dashed #bbb;
            padding-top: 3px;
        }

        /* ── Invoice reference ── */
        .untuk-section {
            font-size: 10px;
            color: #333;
            margin-bottom: 4px;
            position: relative;
            z-index: 1;
        }

        .untuk-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #ccc;
            font-size: 9.5px;
        }

        .untuk-table td {
            padding: 2px 8px;
            border-bottom: 1px solid #e5e5e5;
            vertical-align: middle;
        }

        .untuk-table tr:last-child td { border-bottom: none; }

        .untuk-table .key { color: #555; width: 38%; }
        .untuk-table .sep { width: 10px; color: #888; }
        .untuk-table .val { font-weight: bold; color: #111; }

        /* ── Footer / Signature ── */
        .footer-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            position: relative;
            z-index: 1;
        }

        .footer-table td { vertical-align: top; }

        .legal-note {
            font-size: 8px;
            color: #777;
            font-style: italic;
            line-height: 1.5;
            max-width: 55%;
        }

        .sig-area {
            text-align: center;
        }

        .sig-date {
            font-size: 9px;
            color: #555;
            margin-bottom: 2px;
        }

        .sig-space {
            height: 52px;
            border-bottom: 1px solid #555;
            margin: 2px auto;
            width: 140px;
            position: relative;
        }

        /* ── LUNAS circle stamp ── */
        .lunas-circle {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 52px;
            height: 52px;
            border: 3px solid rgba(5, 150, 105, 0.55);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        }

        .lunas-circle-text {
            font-size: 11px;
            font-weight: 900;
            color: rgba(5, 150, 105, 0.7);
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .lunas-circle-sub {
            font-size: 6.5px;
            color: rgba(5, 150, 105, 0.7);
            letter-spacing: 0.5px;
        }

        .sig-name {
            font-size: 10px;
            font-weight: bold;
            color: #111;
            margin-top: 3px;
        }

        .sig-title {
            font-size: 8.5px;
            color: #555;
        }

        /* ── Perforated dots (decorative) ── */
        .perf-top {
            text-align: center;
            font-size: 7px;
            color: #ccc;
            letter-spacing: 3px;
            margin-bottom: 6px;
        }

        .perf-bottom {
            text-align: center;
            font-size: 7px;
            color: #ccc;
            letter-spacing: 3px;
            margin-top: 6px;
        }

        .divider-dashed {
            border: none;
            border-top: 1px dashed #bbb;
            margin: 6px 0;
        }
    </style>
</head>
<body>

    <div class="outer-frame">
        <div class="inner-frame">

            {{-- Big LUNAS watermark --}}
            <div class="stamp-lunas">LUNAS</div>

            {{-- Perforated top --}}
            <div class="perf-top">
                · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·
            </div>

            {{-- ════ HEADER ════ --}}
            <table class="header-table">
                <tr>
                    {{-- Company info left --}}
                    <td style="width: 50%;">
                        <div class="company-name">{{ $company->company_name ?? 'MIKROTEK' }}</div>
                        <div class="company-meta">
                            {{ $company->company_address ?? '' }}<br>
                            Telp: {{ $company->company_phone ?? '' }} | {{ $company->company_email ?? '' }}
                            @if($company->tax_number)
                                &nbsp;|&nbsp; NPWP: {{ $company->tax_number }}
                            @endif
                        </div>
                    </td>

                    {{-- KWITANSI title center --}}
                    <td style="width: 30%; text-align: center;">
                        <div class="kwitansi-title-box">
                            <span class="kwitansi-title">KWITANSI</span>
                            <span class="kwitansi-sub">Receipt / Official Payment</span>
                        </div>
                    </td>

                    {{-- Number right --}}
                    <td style="width: 20%; text-align: right; vertical-align: bottom;">
                        <div class="nomor-box">
                            No. <span class="nomor-value">{{ $payment->payment_number }}</span>
                        </div>
                    </td>
                </tr>
            </table>

            {{-- ════ FORM FIELDS ════ --}}
            <div class="form-section">

                {{-- Sudah Terima Dari --}}
                <table class="form-row">
                    <tr>
                        <td class="field-label">Sudah Terima dari</td>
                        <td class="field-colon">:</td>
                        <td class="field-line" style="font-size: 12px; font-style: italic;">
                            {{ $payment->invoice->client->company_name ?? $payment->invoice->client->name }}
                            <small style="font-size: 9px; font-weight: normal; color: #555;">
                                (U.P: {{ $payment->invoice->client->name }})
                            </small>
                        </td>
                    </tr>
                </table>

                {{-- Amount Box --}}
                <div class="amount-section">
                    <div class="amount-outer">
                        <div class="amount-label-bar">Jumlah</div>
                        <div class="amount-content">
                            <div class="amount-nominal">Rp {{ number_format($payment->amount, 0, ',', '.') }}</div>
                            <div class="amount-terbilang">
                                &ldquo;{{ App\Helpers\Terbilang::make($payment->amount) }}&rdquo;
                            </div>
                        </div>

                        {{-- LUNAS circle stamp inside amount box --}}
                        <div style="padding: 8px 10px; display: flex; align-items: center;">
                            <div class="lunas-circle">
                                <div class="lunas-circle-text">LUNAS</div>
                                <div class="lunas-circle-sub">{{ \Carbon\Carbon::parse($payment->payment_date)->format('d/m/Y') }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- Untuk Pembayaran --}}
                <table class="form-row">
                    <tr>
                        <td class="field-label">Untuk Pembayaran</td>
                        <td class="field-colon">:</td>
                        <td class="field-line">
                            Invoice {{ $payment->invoice->invoice_number }}
                        </td>
                    </tr>
                </table>

                {{-- Metode & Referensi --}}
                <table class="form-row">
                    <tr>
                        <td class="field-label">Cara Pembayaran</td>
                        <td class="field-colon">:</td>
                        <td class="field-line" style="width: 40%;">
                            {{ $payment->paymentMethod->name ?? 'Transfer Bank' }}
                        </td>
                        <td class="field-label" style="padding-left: 16px;">No. Ref / Bukti</td>
                        <td class="field-colon">:</td>
                        <td class="field-line" style="font-family: 'Courier New', Courier, monospace;">
                            {{ $payment->reference_number ?? '-' }}
                        </td>
                    </tr>
                </table>

            </div>{{-- /form-section --}}

            <hr class="divider-dashed">

            {{-- ════ INVOICE DETAILS TABLE ════ --}}
            <div class="untuk-section">
                <table class="untuk-table">
                    <tr>
                        <td class="key">No. Invoice</td>
                        <td class="sep">:</td>
                        <td class="val" style="font-family: 'Courier New', Courier, monospace; color: #1e40af;">
                            {{ $payment->invoice->invoice_number }}
                        </td>
                        <td class="key">Total Tagihan</td>
                        <td class="sep">:</td>
                        <td class="val">Rp {{ number_format($payment->invoice->grand_total, 0, ',', '.') }}</td>
                    </tr>
                    <tr>
                        <td class="key">Tanggal Pembayaran</td>
                        <td class="sep">:</td>
                        <td class="val">{{ \Carbon\Carbon::parse($payment->payment_date)->format('d F Y') }}</td>
                        @php $remaining = $payment->invoice->grand_total - $payment->invoice->paid_amount; @endphp
                        <td class="key">{{ $remaining > 0 ? 'Sisa Tagihan' : 'Status' }}</td>
                        <td class="sep">:</td>
                        <td class="val" style="color: {{ $remaining > 0 ? '#dc2626' : '#059669' }};">
                            {{ $remaining > 0 ? 'Rp ' . number_format($remaining, 0, ',', '.') : '✓ LUNAS' }}
                        </td>
                    </tr>
                    @if($payment->notes)
                    <tr>
                        <td class="key">Catatan</td>
                        <td class="sep">:</td>
                        <td class="val" colspan="4" style="font-style: italic; color: #555;">
                            {{ $payment->notes }}
                        </td>
                    </tr>
                    @endif
                </table>
            </div>

            {{-- ════ SIGNATURE FOOTER ════ --}}
            @php
                $signerName  = $company->signature_signer_name ?? ('Manajemen ' . ($company->company_name ?? 'MIKROTEK'));
                $signerTitle = $company->signature_signer_title ?? 'Bendahara / Finance';
                $sigType     = $payment->signature_type ?: ($company->signature_type ?? 'MANUAL');
            @endphp

            <table class="footer-table">
                <tr>
                    <td style="width: 58%;">
                        <div class="legal-note">
                            * Kwitansi ini merupakan bukti pembayaran yang sah dan resmi dari
                            <strong>{{ $company->company_name ?? 'MIKROTEK' }}</strong>.
                            Harap simpan dokumen ini dengan baik sebagai arsip keuangan Anda.
                            Apabila ada pertanyaan, hubungi kami di {{ $company->company_email ?? '' }}.
                        </div>
                    </td>
                    <td style="width: 42%;">
                        <div class="sig-area">
                            <div class="sig-date">
                                {{ \Carbon\Carbon::parse($payment->payment_date)->translatedFormat('d F Y') }},
                                <strong>{{ $company->company_name ?? 'MIKROTEK' }}</strong>
                            </div>

                            <div class="sig-space">
                                @if($sigType === 'QR_CODE')
                                    @php
                                        $verifyUrl = url("/portal/invoice/{$payment->invoice->invoice_number}");
                                        $qrSvg     = App\Helpers\QrCodeGenerator::generateSvgDataUri($verifyUrl, 75);
                                    @endphp
                                    <img src="{{ $qrSvg }}" style="width: 55px; height: 55px; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);">
                                @elseif($sigType === 'IMAGE' && !empty($company->signature_image_path) && file_exists(storage_path('app/public/' . $company->signature_image_path)))
                                    <img src="{{ storage_path('app/public/' . $company->signature_image_path) }}" style="max-height: 48px; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);">
                                @endif
                            </div>

                            <div class="sig-name">{{ $signerName }}</div>
                            <div class="sig-title">{{ $signerTitle }}</div>
                        </div>
                    </td>
                </tr>
            </table>

            {{-- Perforated bottom --}}
            <div class="perf-bottom">
                · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·
            </div>

        </div>{{-- /inner-frame --}}
    </div>{{-- /outer-frame --}}

</body>
</html>
