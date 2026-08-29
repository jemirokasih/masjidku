<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Penawaran Harga {{ $quote->quote_number }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 12mm 14mm 12mm 14mm;
        }

        * { box-sizing: border-box; }

        body {
            font-family: 'Times New Roman', Times, serif;
            color: #111827;
            font-size: 11px;
            line-height: 1.4;
            margin: 0;
            padding: 0;
            background: #fff;
        }

        /* ── Outer border double-line frame ── */
        .outer-frame {
            border: 4px double #581c87;
            padding: 0;
            position: relative;
            min-height: 265mm;
        }

        .inner-frame {
            border: 1px solid #581c87;
            margin: 4px;
            padding: 12px 16px 14px 16px;
            position: relative;
            min-height: calc(265mm - 18px);
        }

        /* ── Header ── */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 2.5px solid #581c87;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }

        .header-table td { vertical-align: top; }

        .company-name {
            font-size: 18px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #581c87;
        }

        .company-meta {
            font-size: 9.5px;
            color: #334155;
            line-height: 1.4;
            margin-top: 2px;
        }

        .quote-title {
            font-size: 22px;
            font-weight: bold;
            color: #3b0764;
            text-align: right;
            letter-spacing: 1.5px;
            text-transform: uppercase;
        }

        .quote-number {
            font-size: 13px;
            font-weight: bold;
            color: #581c87;
            text-align: right;
            margin-top: 2px;
            font-family: Arial, sans-serif;
        }

        .status-badge {
            display: inline-block;
            padding: 2px 8px;
            border: 1px solid #7c3aed;
            color: #6d28d9;
            font-family: Arial, sans-serif;
            font-size: 9.5px;
            font-weight: bold;
            text-transform: uppercase;
            border-radius: 3px;
        }

        /* ── Client & Details Table ── */
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
        }

        .details-table td {
            vertical-align: top;
            width: 50%;
        }

        .section-label {
            font-size: 9.5px;
            font-weight: bold;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 3px;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 2px;
        }

        .client-name {
            font-size: 13px;
            font-weight: bold;
            color: #0f172a;
            margin-top: 3px;
        }

        /* ── Items Table ── */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
        }

        .items-table th {
            background-color: #f3e8ff;
            color: #4c1d95;
            font-weight: bold;
            font-size: 9.5px;
            text-transform: uppercase;
            padding: 6px 8px;
            border: 1px solid #6b21a8;
            font-family: Arial, sans-serif;
        }

        .items-table td {
            padding: 6px 8px;
            border: 1px solid #d8b4fe;
            font-size: 10.5px;
        }

        .text-right { text-align: right; }
        .text-center { text-align: center; }

        /* ── Totals & Terbilang Section ── */
        .summary-wrapper {
            width: 100%;
            margin-bottom: 14px;
        }

        .terbilang-box {
            width: 54%;
            float: left;
            border: 1px solid #c084fc;
            background-color: #faf5ff;
            padding: 8px 10px;
            border-radius: 4px;
        }

        .terbilang-title {
            font-size: 9px;
            font-weight: bold;
            color: #6b21a8;
            text-transform: uppercase;
            margin-bottom: 2px;
            font-family: Arial, sans-serif;
        }

        .terbilang-text {
            font-size: 10px;
            font-style: italic;
            color: #3b0764;
            font-weight: bold;
        }

        .totals-table {
            width: 42%;
            float: right;
            border-collapse: collapse;
        }

        .totals-table td {
            padding: 3px 6px;
            font-size: 10.5px;
        }

        .totals-table .grand-total-row td {
            font-size: 12px;
            font-weight: bold;
            color: #3b0764;
            border-top: 2px solid #581c87;
            border-bottom: 2px solid #581c87;
            padding: 5px 6px;
            background-color: #f3e8ff;
        }

        .clearfix { clear: both; }

        /* ── Terms Box ── */
        .terms-box {
            border: 1px solid #e9d5ff;
            background-color: #faf5ff;
            padding: 8px 12px;
            margin-bottom: 14px;
            border-radius: 4px;
            font-size: 10px;
            color: #334155;
        }

        .terms-title {
            font-size: 9.5px;
            font-weight: bold;
            color: #581c87;
            text-transform: uppercase;
            margin-bottom: 4px;
            font-family: Arial, sans-serif;
        }

        /* ── Signatures ── */
        .signature-section {
            width: 100%;
            margin-top: 15px;
            border-collapse: collapse;
        }

        .signature-section td {
            vertical-align: bottom;
        }

        .signature-box {
            width: 180px;
            text-align: center;
            float: right;
        }

        .sig-line {
            height: 55px;
            border-bottom: 1px dashed #581c87;
            margin-bottom: 4px;
        }

        .sig-name {
            font-weight: bold;
            font-size: 11px;
            color: #111827;
        }

        .sig-title {
            font-size: 9px;
            color: #475569;
        }
    </style>
</head>
<body>
    <div class="outer-frame">
        <div class="inner-frame">
            
            {{-- Header --}}
            <table class="header-table">
                <tr>
                    <td style="width: 58%;">
                        <div class="company-name">{{ $company->company_name ?? 'MIKROTEK' }}</div>
                        <div class="company-meta">
                            {{ $company->company_address ?? '' }}<br>
                            Email: {{ $company->company_email ?? '' }} | Telp: {{ $company->company_phone ?? '' }}
                        </div>
                    </td>
                    <td style="width: 42%; text-align: right;">
                        <div class="quote-title">PENAWARAN HARGA</div>
                        <div class="quote-number"># {{ $quote->quote_number }}</div>
                        <div style="margin-top: 4px;">
                            <span class="status-badge">{{ $quote->status }}</span>
                        </div>
                    </td>
                </tr>
            </table>

            {{-- Client & Document Info --}}
            <table class="details-table">
                <tr>
                    <td style="padding-right: 15px;">
                        <div class="section-label">PENAWARAN KEPADA (CLIENT):</div>
                        <div class="client-name">{{ $quote->client ? ($quote->client->company_name ?? $quote->client->name) : 'Pelanggan Umum' }}</div>
                        @if($quote->client)
                            <div>Attn / UP: {{ $quote->client->name }}</div>
                            <div>{{ $quote->client->address ?? '' }}</div>
                            <div>Email: {{ $quote->client->email ?? '-' }} | Telp: {{ $quote->client->phone ?? '-' }}</div>
                        @else
                            <div>-</div>
                        @endif
                    </td>
                    <td style="padding-left: 15px;">
                        <div class="section-label">DETAIL DOKUMEN PENAWARAN:</div>
                        <div><strong>Tanggal Terbit:</strong> {{ $quote->quote_date ? \Carbon\Carbon::parse($quote->quote_date)->format('d F Y') : '-' }}</div>
                        <div><strong>Berlaku Sampai:</strong> {{ $quote->valid_until ? \Carbon\Carbon::parse($quote->valid_until)->format('d F Y') : '-' }}</div>
                        <div><strong>Mata Uang:</strong> IDR (Rp)</div>
                    </td>
                </tr>
            </table>

            {{-- Items Table --}}
            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 6%; text-align: center;">NO</th>
                        <th style="width: 44%; text-align: left;">DESKRIPSI BARANG / JASA</th>
                        <th style="width: 12%; text-align: center;">QTY</th>
                        <th style="width: 18%; text-align: right;">HARGA SATUAN</th>
                        <th style="width: 20%; text-align: right;">SUBTOTAL (RP)</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($quote->items as $index => $item)
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td>
                            <strong>{{ $item->item_name }}</strong>
                            @if($item->description)
                                <div style="font-size: 9.5px; color: #4b5563; margin-top: 2px;">{{ $item->description }}</div>
                            @endif
                        </td>
                        <td class="text-center">{{ $item->quantity }}</td>
                        <td class="text-right">{{ number_format($item->unit_price, 0, ',', '.') }}</td>
                        <td class="text-right"><strong>{{ number_format($item->subtotal, 0, ',', '.') }}</strong></td>
                    </tr>
                    @endforeach
                </tbody>
            </table>

            {{-- Summary & Totals --}}
            <div class="summary-wrapper">
                <div class="terbilang-box">
                    <div class="terbilang-title">Terbilang Total Penawaran:</div>
                    <div class="terbilang-text">&ldquo;{{ \App\Helpers\Terbilang::make($quote->grand_total) }}&rdquo;</div>
                </div>

                <table class="totals-table">
                    <tr>
                        <td style="color: #4b5563;">Subtotal:</td>
                        <td class="text-right">Rp {{ number_format($quote->subtotal, 0, ',', '.') }}</td>
                    </tr>
                    @if($quote->discount_amount > 0)
                    <tr>
                        <td style="color: #dc2626;">Diskon:</td>
                        <td class="text-right" style="color: #dc2626;">- Rp {{ number_format($quote->discount_amount, 0, ',', '.') }}</td>
                    </tr>
                    @endif
                    @if($quote->tax_rate > 0)
                    <tr>
                        <td style="color: #4b5563;">PPN ({{ $quote->tax_rate }}%):</td>
                        <td class="text-right">Rp {{ number_format($quote->tax_amount, 0, ',', '.') }}</td>
                    </tr>
                    @endif
                    <tr class="grand-total-row">
                        <td>GRAND TOTAL:</td>
                        <td class="text-right">Rp {{ number_format($quote->grand_total, 0, ',', '.') }}</td>
                    </tr>
                </table>
                <div class="clearfix"></div>
            </div>

            {{-- Notes & Terms --}}
            @if($quote->notes || $quote->terms)
            <div class="terms-box">
                @if($quote->notes)
                    <div class="terms-title">Catatan Penawaran:</div>
                    <p style="margin: 2px 0 6px 0;">{{ $quote->notes }}</p>
                @endif
                @if($quote->terms)
                    <div class="terms-title">Syarat & Ketentuan:</div>
                    <p style="margin: 2px 0 0 0;">{{ $quote->terms }}</p>
                @endif
            </div>
            @endif

            {{-- Signature Section --}}
            @php
                $sigType = $quote->signature_type ?: ($company->signature_type ?? 'MANUAL');
                $signerName = $company->signature_signer_name ?? ('Manajemen ' . ($company->company_name ?? 'MIKROTEK'));
                $signerTitle = $company->signature_signer_title ?? 'Authorized Manager';
            @endphp

            <table class="signature-section">
                <tr>
                    <td style="width: 55%; font-size: 9px; color: #64748b;">
                        * Surat Penawaran Harga ini berlaku sampai tanggal {{ \Carbon\Carbon::parse($quote->valid_until)->format('d F Y') }}.<br>
                        Silakan hubungi kami untuk informasi dan konfirmasi pemesanan.
                    </td>
                    <td style="width: 45%; text-align: right;">
                        <div class="signature-box">
                            <div style="font-size: 9.5px; color: #475569; margin-bottom: 4px;">
                                Hormat Kami,<br>
                                <strong>{{ $company->company_name ?? 'MIKROTEK' }}</strong>
                            </div>

                            @if($sigType === 'QR_CODE')
                                @php
                                    $verifyUrl = url("/portal/quote/" . ($quote->public_token ?? $quote->quote_number));
                                    $qrSvg = App\Helpers\QrCodeGenerator::generateSvgDataUri($verifyUrl, 85);
                                @endphp
                                <div style="margin: 4px 0;">
                                    <img src="{{ $qrSvg }}" style="width: 75px; height: 75px; border: 1px solid #d8b4fe; padding: 2px; border-radius: 4px;">
                                </div>
                                <div style="font-size: 8px; color: #64748b; font-family: Arial, sans-serif;">Scan QR untuk verifikasi</div>
                            @elseif($sigType === 'IMAGE' && !empty($company->signature_image_path))
                                @php
                                    $cleanSigPath = ltrim(str_replace('/storage/', '', $company->signature_image_path), '/');
                                    $fullSigFile = storage_path('app/public/' . $cleanSigPath);
                                @endphp
                                @if(file_exists($fullSigFile))
                                    <div style="margin: 4px 0;">
                                        <img src="{{ $fullSigFile }}" style="max-height: 60px; max-width: 160px;">
                                    </div>
                                @else
                                    <div class="sig-line"></div>
                                @endif
                            @else
                                <div class="sig-line"></div>
                            @endif

                            <div class="sig-name">{{ $signerName }}</div>
                            <div class="sig-title">{{ $signerTitle }}</div>
                        </div>
                    </td>
                </tr>
            </table>

        </div>
    </div>
</body>
</html>
