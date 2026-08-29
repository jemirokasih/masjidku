<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Penawaran Harga {{ $quote->quote_number }}</title>
    <style>
        @page {
            margin-top: 110px;
            margin-bottom: 25px;
            margin-left: 25px;
            margin-right: 25px;
        }

        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1f2937;
            font-size: 11px;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }

        /* Fixed Header on EVERY Page */
        header {
            position: fixed;
            top: -95px;
            left: 0px;
            right: 0px;
            height: 85px;
            border-bottom: 2px solid #7c3aed;
            padding-bottom: 8px;
        }

        .header-table {
            width: 100%;
        }

        .company-title {
            font-size: 18px;
            font-weight: bold;
            color: #7c3aed;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .company-info {
            font-size: 10px;
            color: #4b5563;
            line-height: 1.3;
        }

        .quote-title {
            font-size: 22px;
            font-weight: bold;
            text-align: right;
            color: #111827;
            letter-spacing: 1px;
        }

        .details-table {
            width: 100%;
            margin-bottom: 15px;
            margin-top: 5px;
        }

        .details-table td {
            vertical-align: top;
            width: 50%;
        }

        .section-title {
            font-size: 10px;
            font-weight: bold;
            color: #6b7280;
            text-transform: uppercase;
            margin-bottom: 4px;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }

        .items-table thead {
            display: table-header-group; /* Repeat table header on new pages */
        }

        .items-table tr {
            page-break-inside: avoid;
        }

        .items-table th {
            background-color: #f5f3ff;
            color: #5b21b6;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 9px;
            padding: 7px 8px;
            border-bottom: 1.5px solid #ddd6fe;
        }

        .items-table td {
            padding: 8px;
            border-bottom: 1px solid #f1f5f9;
        }

        .totals-table {
            width: 42%;
            float: right;
            border-collapse: collapse;
        }

        .totals-table td {
            padding: 4px 8px;
            text-align: right;
        }

        .totals-table .label {
            color: #4b5563;
        }

        .totals-table .amount {
            font-weight: bold;
        }

        .totals-table .grand-total {
            font-size: 13px;
            font-weight: bold;
            color: #7c3aed;
            border-top: 2px solid #ddd6fe;
            border-bottom: 2px solid #ddd6fe;
            padding: 6px 8px;
        }

        .terbilang-box {
            width: 52%;
            float: left;
            background-color: #f5f3ff;
            border: 1px solid #ddd6fe;
            border-radius: 6px;
            padding: 8px 12px;
            margin-top: 5px;
        }

        .terbilang-label {
            font-size: 9px;
            font-weight: bold;
            color: #6d28d9;
            text-transform: uppercase;
            margin-bottom: 2px;
        }

        .terbilang-text {
            font-size: 10px;
            font-weight: bold;
            color: #4c1d95;
            font-style: italic;
        }

        .terms-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 8px 12px;
            margin-top: 15px;
            font-size: 10px;
            color: #475569;
        }

        .signature-table {
            width: 100%;
            margin-top: 20px;
        }

        .signature-table td {
            vertical-align: top;
            width: 50%;
        }

        .signature-box {
            text-align: center;
            width: 220px;
            float: right;
        }

        .status-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .status-DRAFT { background-color: #e2e8f0; color: #475569; }
        .status-SENT { background-color: #dbeafe; color: #1e40af; }
        .status-VIEWED { background-color: #cff4fc; color: #055160; }
        .status-APPROVED { background-color: #d1fae5; color: #065f46; }
        .status-REJECTED { background-color: #ffe4e6; color: #9f1239; }
        .status-CANCELED { background-color: #fef3c7; color: #92400e; }
        .status-CONVERTED { background-color: #f3e8ff; color: #6b21a8; }
    </style>
</head>
<body>

    <!-- Fixed Header on EVERY Page -->
    <header>
        <table class="header-table">
            <tr>
                <td style="width: 55%; vertical-align: top;">
                    <div class="company-title">{{ $company->company_name ?? 'MIKROTEK' }}</div>
                    <div class="company-info">
                        {{ $company->company_address ?? '' }}<br>
                        Email: {{ $company->company_email ?? '' }} | Phone: {{ $company->company_phone ?? '' }}<br>
                        Website: {{ $company->website ?? '' }}
                    </div>
                </td>
                <td style="width: 45%; text-align: right; vertical-align: top;">
                    <div class="quote-title">PENAWARAN HARGA</div>
                    <div style="font-size: 12px; font-weight: bold; color: #4b5563; margin-top: 2px;">
                        #{{ $quote->quote_number }}
                    </div>
                    <div style="margin-top: 4px;">
                        <span class="status-badge status-{{ $quote->status }}">{{ $quote->status }}</span>
                    </div>
                </td>
            </tr>
        </table>
    </header>

    <!-- Content Body -->
    <div style="margin-top: 10px;">
        <table class="details-table">
            <tr>
                <td>
                    <div class="section-title">PENAWARAN KEPADA (CLIENT):</div>
                    <div style="font-size: 13px; font-weight: bold; color: #111827;">
                        {{ $quote->client ? ($quote->client->company_name ?? $quote->client->name) : 'Pelanggan Umum' }}
                    </div>
                    <div style="color: #4b5563;">
                        @if($quote->client)
                            U.P: {{ $quote->client->name }}<br>
                            {{ $quote->client->address ?? '' }}<br>
                            Email: {{ $quote->client->email ?? '-' }} | Telp: {{ $quote->client->phone ?? '-' }}
                        @else
                            -
                        @endif
                    </div>
                </td>
                <td style="text-align: right;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="text-align: right; color: #6b7280; padding: 2px 0;">Tanggal Terbit:</td>
                            <td style="text-align: right; font-weight: bold; width: 110px; padding: 2px 0;">
                                {{ $quote->quote_date ? \Carbon\Carbon::parse($quote->quote_date)->format('d M Y') : '-' }}
                            </td>
                        </tr>
                        <tr>
                            <td style="text-align: right; color: #6b7280; padding: 2px 0;">Berlaku Sampai:</td>
                            <td style="text-align: right; font-weight: bold; color: #9333ea; padding: 2px 0;">
                                {{ $quote->valid_until ? \Carbon\Carbon::parse($quote->valid_until)->format('d M Y') : '-' }}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 5%; text-align: center;">#</th>
                    <th style="width: 50%; text-align: left;">Deskripsi Barang / Jasa</th>
                    <th style="width: 10%; text-align: center;">Qty</th>
                    <th style="width: 17%; text-align: right;">Harga Satuan</th>
                    <th style="width: 18%; text-align: right;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($quote->items as $index => $item)
                <tr>
                    <td style="text-align: center; color: #6b7280;">{{ $index + 1 }}</td>
                    <td>
                        <strong style="color: #111827;">{{ $item->item_name }}</strong>
                        @if($item->description)
                            <div style="font-size: 10px; color: #6b7280; margin-top: 2px;">{{ $item->description }}</div>
                        @endif
                    </td>
                    <td style="text-align: center; font-weight: bold;">{{ $item->quantity }}</td>
                    <td style="text-align: right;">Rp {{ number_format($item->unit_price, 0, ',', '.') }}</td>
                    <td style="text-align: right; font-weight: bold;">Rp {{ number_format($item->subtotal, 0, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Summary Section -->
        <div style="width: 100%; overflow: hidden; margin-bottom: 15px;">
            <!-- Terbilang Box -->
            <div class="terbilang-box">
                <div class="terbilang-label">Terbilang Total Penawaran:</div>
                <div class="terbilang-text">"{{ App\Helpers\Terbilang::make($quote->grand_total) }}"</div>
            </div>

            <!-- Totals Table -->
            <table class="totals-table">
                <tr>
                    <td class="label">Subtotal Item:</td>
                    <td class="amount">Rp {{ number_format($quote->subtotal, 0, ',', '.') }}</td>
                </tr>
                @if($quote->discount_amount > 0)
                <tr>
                    <td class="label">Diskon:</td>
                    <td class="amount" style="color: #dc2626;">- Rp {{ number_format($quote->discount_amount, 0, ',', '.') }}</td>
                </tr>
                @endif
                @if($quote->tax_rate > 0)
                <tr>
                    <td class="label">PPN ({{ $quote->tax_rate }}%):</td>
                    <td class="amount">Rp {{ number_format($quote->tax_amount, 0, ',', '.') }}</td>
                </tr>
                @endif
                <tr>
                    <td class="label grand-total">Grand Total:</td>
                    <td class="amount grand-total">Rp {{ number_format($quote->grand_total, 0, ',', '.') }}</td>
                </tr>
            </table>
        </div>

        <div style="clear: both;"></div>

        <!-- Notes & Terms -->
        @if($quote->notes || $quote->terms)
        <div class="terms-box">
            @if($quote->notes)
                <strong>Catatan / Catatan Penawaran:</strong>
                <p style="margin: 3px 0 6px 0;">{{ $quote->notes }}</p>
            @endif
            @if($quote->terms)
                <strong>Syarat & Ketentuan:</strong>
                <p style="margin: 3px 0 0 0;">{{ $quote->terms }}</p>
            @endif
        </div>
        @endif

        <!-- Signature Section -->
        @php
            $sigType = $quote->signature_type ?: ($company->signature_type ?? 'MANUAL');
            $signerName = $company->signature_signer_name ?? 'Manajemen ' . ($company->company_name ?? 'MIKROTEK');
            $signerTitle = $company->signature_signer_title ?? 'Authorized Manager';
        @endphp

        <table class="signature-table">
            <tr>
                <td style="width: 50%;"></td>
                <td style="width: 50%;">
                    <div class="signature-box">
                        <div style="font-size: 10px; color: #4b5563; margin-bottom: 5px;">
                            Hormat Kami,<br>
                            <strong>{{ $company->company_name ?? 'MIKROTEK' }}</strong>
                        </div>

                        @if($sigType === 'QR_CODE')
                            @php
                                $verifyUrl = url("/portal/quote/" . ($quote->public_token ?? $quote->quote_number));
                                $qrSvg = App\Helpers\QrCodeGenerator::generateSvgDataUri($verifyUrl, 100);
                            @endphp
                            <div style="margin: 8px 0;">
                                <img src="{{ $qrSvg }}" style="width: 90px; height: 90px; border: 1px solid #e2e8f0; padding: 3px; border-radius: 6px;">
                            </div>
                            <div style="font-size: 8px; color: #6b7280;">Scan QR untuk verifikasi keabsahan</div>
                        @elseif($sigType === 'IMAGE' && !empty($company->signature_image_path))
                            @php
                                $cleanSigPath = ltrim(str_replace('/storage/', '', $company->signature_image_path), '/');
                                $fullSigFile = storage_path('app/public/' . $cleanSigPath);
                            @endphp
                            @if(file_exists($fullSigFile))
                                <div style="margin: 5px 0;">
                                    <img src="{{ $fullSigFile }}" style="max-height: 70px; max-width: 180px;">
                                </div>
                            @else
                                <div style="height: 65px; border-bottom: 1px dashed #cbd5e1; margin-bottom: 5px;"></div>
                            @endif
                        @else
                            <div style="height: 65px; border-bottom: 1px dashed #cbd5e1; margin-bottom: 5px;"></div>
                        @endif

                        <div style="font-size: 11px; font-weight: bold; color: #111827; margin-top: 4px;">
                            {{ $signerName }}
                        </div>
                        <div style="font-size: 9.5px; color: #6b7280;">
                            {{ $signerTitle }}
                        </div>
                    </div>
                </td>
            </tr>
        </table>
    </div>

</body>
</html>
