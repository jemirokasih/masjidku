<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Invoice {{ $invoice->invoice_number }}</title>
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
            border: 4px double #1e293b;
            padding: 0;
            position: relative;
            min-height: 265mm;
        }

        .inner-frame {
            border: 1px solid #1e293b;
            margin: 4px;
            padding: 12px 16px 14px 16px;
            position: relative;
            min-height: calc(265mm - 18px);
        }

        /* ── Header ── */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 2.5px solid #1e293b;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }

        .header-table td { vertical-align: top; }

        .company-name {
            font-size: 18px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #0f172a;
        }

        .company-meta {
            font-size: 9.5px;
            color: #334155;
            line-height: 1.4;
            margin-top: 2px;
        }

        .invoice-title {
            font-size: 24px;
            font-weight: bold;
            color: #1e293b;
            text-align: right;
            letter-spacing: 2px;
            text-transform: uppercase;
        }

        .invoice-number {
            font-size: 13px;
            font-weight: bold;
            color: #1e293b;
            text-align: right;
            margin-top: 2px;
            font-family: Arial, sans-serif;
        }

        .badge-paid {
            display: inline-block;
            padding: 2px 8px;
            border: 1px solid #059669;
            color: #059669;
            font-family: Arial, sans-serif;
            font-[10px];
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
            background-color: #f1f5f9;
            color: #0f172a;
            font-weight: bold;
            font-size: 9.5px;
            text-transform: uppercase;
            padding: 6px 8px;
            border: 1px solid #475569;
            font-family: Arial, sans-serif;
        }

        .items-table td {
            padding: 6px 8px;
            border: 1px solid #94a3b8;
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
            border: 1px solid #94a3b8;
            background-color: #f8fafc;
            padding: 8px 10px;
            border-radius: 4px;
        }

        .terbilang-title {
            font-size: 9px;
            font-weight: bold;
            color: #475569;
            text-transform: uppercase;
            margin-bottom: 2px;
            font-family: Arial, sans-serif;
        }

        .terbilang-text {
            font-size: 10px;
            font-style: italic;
            color: #0f172a;
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
            color: #0f172a;
            border-top: 2px solid #0f172a;
            border-bottom: 2px solid #0f172a;
            padding: 5px 6px;
            background-color: #f1f5f9;
        }

        .clearfix { clear: both; }

        /* ── Payment Info & Terms ── */
        .info-box {
            border: 1px solid #cbd5e1;
            background-color: #fafafa;
            padding: 8px 12px;
            margin-bottom: 14px;
            border-radius: 4px;
        }

        .info-title {
            font-size: 9.5px;
            font-weight: bold;
            color: #1e293b;
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
            border-bottom: 1px dashed #475569;
            margin-bottom: 4px;
        }

        .sig-name {
            font-weight: bold;
            font-size: 11px;
            color: #0f172a;
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
                        <div class="company-name">{{ $company->company_name }}</div>
                        <div class="company-meta">
                            {{ $company->company_address }}<br>
                            Email: {{ $company->company_email }} | Telp: {{ $company->company_phone }}
                            @if($company->tax_number)
                                <br>NPWP: {{ $company->tax_number }}
                            @endif
                        </div>
                    </td>
                    <td style="width: 42%; text-align: right;">
                        <div class="invoice-title">INVOICE</div>
                        <div class="invoice-number"># {{ $invoice->invoice_number }}</div>
                        <div style="margin-top: 4px;">
                            <span class="badge-paid">{{ $invoice->status }}</span>
                        </div>
                    </td>
                </tr>
            </table>

            {{-- Client & Document Info --}}
            <table class="details-table">
                <tr>
                    <td style="padding-right: 15px;">
                        <div class="section-label">KEPADA YTH (CLIENT):</div>
                        <div class="client-name">{{ $invoice->client->company_name ?: $invoice->client->name }}</div>
                        <div>Attn / UP: {{ $invoice->client->name }}</div>
                        <div>{{ $invoice->client->address }} {{ $invoice->client->city }}</div>
                        <div>Email: {{ $invoice->client->email }} | Telp: {{ $invoice->client->phone }}</div>
                    </td>
                    <td style="padding-left: 15px;">
                        <div class="section-label">DETAIL TAGIHAN:</div>
                        @if($invoice->reference_number)
                            <div><strong>No. Referensi / PO:</strong> {{ $invoice->reference_number }}</div>
                        @endif
                        <div><strong>Tanggal Terbit:</strong> {{ $invoice->invoice_date->format('d F Y') }}</div>
                        <div><strong>Jatuh Tempo:</strong> {{ $invoice->due_date->format('d F Y') }}</div>
                        <div><strong>Mata Uang:</strong> {{ $company->currency_code }} ({{ $company->currency_symbol }})</div>
                    </td>
                </tr>
            </table>

            {{-- Items Table --}}
            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 6%; text-align: center;">NO</th>
                        <th style="width: 44%; text-align: left;">DESKRIPSI URAIAN BARANG / JASA</th>
                        <th style="width: 12%; text-align: center;">QTY</th>
                        <th style="width: 18%; text-align: right;">HARGA SATUAN</th>
                        <th style="width: 20%; text-align: right;">JUMLAH (RP)</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($invoice->items as $index => $item)
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
                    <div class="terbilang-title">Terbilang Jumlah Tagihan:</div>
                    <div class="terbilang-text">&ldquo;{{ \App\Helpers\Terbilang::make($invoice->grand_total) }}&rdquo;</div>
                </div>

                <table class="totals-table">
                    <tr>
                        <td style="color: #4b5563;">Subtotal:</td>
                        <td class="text-right">{{ $company->currency_symbol }} {{ number_format($invoice->subtotal, 0, ',', '.') }}</td>
                    </tr>
                    @if($invoice->discount_amount > 0)
                    <tr>
                        <td style="color: #dc2626;">Diskon:</td>
                        <td class="text-right" style="color: #dc2626;">- {{ $company->currency_symbol }} {{ number_format($invoice->discount_amount, 0, ',', '.') }}</td>
                    </tr>
                    @endif
                    @if($invoice->tax_rate > 0)
                    <tr>
                        <td style="color: #4b5563;">PPN ({{ $invoice->tax_rate }}%):</td>
                        <td class="text-right">{{ $company->currency_symbol }} {{ number_format($invoice->tax_amount, 0, ',', '.') }}</td>
                    </tr>
                    @endif
                    <tr class="grand-total-row">
                        <td>GRAND TOTAL:</td>
                        <td class="text-right">{{ $company->currency_symbol }} {{ number_format($invoice->grand_total, 0, ',', '.') }}</td>
                    </tr>
                </table>
                <div class="clearfix"></div>
            </div>

            {{-- Bank Instructions & Terms --}}
            <div class="info-box">
                @if(isset($bankAccounts) && count($bankAccounts) > 0)
                    <div class="info-title">Instruksi Pembayaran Rekening Bank Perusahaan:</div>
                    @foreach($bankAccounts as $acc)
                        <div style="font-family: monospace; font-size: 10px; margin-bottom: 2px;">
                            &bull; <strong>{{ $acc->bank_name }}</strong>: {{ $acc->account_number }} (a/n {{ $acc->account_holder }})
                            @if($acc->branch) - {{ $acc->branch }} @endif
                            @if($acc->is_primary) <strong>[REKENING UTAMA]</strong> @endif
                        </div>
                    @endforeach
                @elseif($company->bank_details)
                    <div class="info-title">Instruksi Pembayaran Bank:</div>
                    <div>{!! nl2br(e($company->bank_details)) !!}</div>
                @endif

                @if($invoice->terms)
                    <div style="margin-top: 6px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
                        <strong>Syarat & Ketentuan:</strong> {{ $invoice->terms }}
                    </div>
                @endif
            </div>

            {{-- Signature Section --}}
            @php
                $sigType = $invoice->signature_type ?: ($company->signature_type ?: 'QR_CODE');
                $signerName = $company->signature_signer_name ?: ('Manajemen ' . $company->company_name);
                $signerTitle = $company->signature_signer_title ?: 'Authorized Representative';
            @endphp

            <table class="signature-section">
                <tr>
                    <td style="width: 55%; font-size: 9px; color: #64748b;">
                        * Dokumen tagihan ini sah dan diterbitkan secara resmi oleh {{ $company->company_name }}.<br>
                        Mohon konfirmasi setelah melakukan pembayaran.
                    </td>
                    <td style="width: 45%; text-align: right;">
                        <div class="signature-box">
                            <div style="font-size: 9.5px; color: #475569; margin-bottom: 4px;">
                                Hormat Kami,<br>
                                <strong>{{ $company->company_name }}</strong>
                            </div>

                            @if($sigType === 'QR_CODE')
                                @php
                                    $verifyUrl = url("/portal/invoice/{$invoice->invoice_number}");
                                    $qrSvg = App\Helpers\QrCodeGenerator::generateSvgDataUri($verifyUrl, 85);
                                @endphp
                                <div style="margin: 4px 0;">
                                    <img src="{{ $qrSvg }}" style="width: 75px; height: 75px; border: 1px solid #cbd5e1; padding: 2px; border-radius: 4px;">
                                </div>
                                <div style="font-size: 8px; color: #64748b; font-family: Arial, sans-serif;">Scan untuk verifikasi keabsahan</div>
                            @elseif($sigType === 'IMAGE' && !empty($company->signature_image_path) && file_exists(storage_path('app/public/' . $company->signature_image_path)))
                                <div style="margin: 4px 0;">
                                    <img src="{{ storage_path('app/public/' . $company->signature_image_path) }}" style="max-height: 60px; max-width: 160px;">
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

        </div>
    </div>
</body>
</html>
