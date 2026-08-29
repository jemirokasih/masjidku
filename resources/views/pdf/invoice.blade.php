<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Invoice {{ $invoice->invoice_number }}</title>
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
            border-bottom: 2px solid #4f46e5;
            padding-bottom: 8px;
        }

        .header-table {
            width: 100%;
        }

        .company-title {
            font-size: 18px;
            font-weight: bold;
            color: #4f46e5;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .company-info {
            font-size: 10px;
            color: #4b5563;
            line-height: 1.3;
        }

        .invoice-title {
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
            background-color: #f1f5f9;
            color: #334155;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 9px;
            padding: 7px 8px;
            border-bottom: 1.5px solid #cbd5e1;
            text-align: left;
        }

        .items-table td {
            padding: 8px;
            border-bottom: 1px solid #f1f5f9;
        }

        .text-right {
            text-align: right;
        }

        .totals-table {
            width: 45%;
            margin-left: auto;
            border-collapse: collapse;
            page-break-inside: avoid;
        }

        .totals-table td {
            padding: 4px 8px;
        }

        .grand-total {
            font-size: 13px;
            font-weight: bold;
            color: #4f46e5;
            border-top: 2px solid #4f46e5;
            background-color: #eef2ff;
        }

        .terbilang-box {
            margin-top: 10px;
            margin-bottom: 15px;
            padding: 6px 10px;
            background-color: #f8fafc;
            border-left: 3px solid #4f46e5;
            font-size: 10px;
            font-style: italic;
            color: #334155;
            page-break-inside: avoid;
        }

        .footer-table {
            width: 100%;
            margin-top: 15px;
            border-top: 1px solid #e2e8f0;
            padding-top: 12px;
            font-size: 10px;
            color: #475569;
            page-break-inside: avoid;
        }

        .footer-table td {
            vertical-align: top;
        }

        .badge-paid {
            color: #059669;
            border: 1px solid #10b981;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 10px;
        }
    </style>
</head>
<body>
    <!-- FIXED HEADER (Repeats on EVERY page automatically) -->
    <header>
        <table class="header-table">
            <tr>
                <td>
                    <div class="company-title">{{ $company->company_name }}</div>
                    <div class="company-info">{{ $company->company_address }}</div>
                    <div class="company-info">Email: {{ $company->company_email }} | Telp: {{ $company->company_phone }}</div>
                    @if($company->tax_number)
                        <div class="company-info">NPWP: {{ $company->tax_number }}</div>
                    @endif
                </td>
                <td class="text-right">
                    <div class="invoice-title">INVOICE</div>
                    <div style="font-size: 13px; font-weight: bold; color: #4f46e5; margin-top: 2px;">{{ $invoice->invoice_number }}</div>
                    <div style="margin-top: 3px;">
                        Status: <span class="badge-paid">{{ $invoice->status }}</span>
                    </div>
                </td>
            </tr>
        </table>
    </header>

    <!-- MAIN BODY CONTENT -->
    <main>
        <table class="details-table">
            <tr>
                <td>
                    <div class="section-title">TAGIHAN KEPADA (KLIEN):</div>
                    <div style="font-weight: bold; font-size: 12px; color: #0f172a;">{{ $invoice->client->company_name ?: $invoice->client->name }}</div>
                    <div>Up: {{ $invoice->client->name }}</div>
                    <div>{{ $invoice->client->address }} {{ $invoice->client->city }}</div>
                    <div>Email: {{ $invoice->client->email }} | Telp: {{ $invoice->client->phone }}</div>
                </td>
                <td class="text-right">
                    <div class="section-title">DETAIL DOKUMEN:</div>
                    @if($invoice->reference_number)
                        <div><strong>No. Ref / PO:</strong> {{ $invoice->reference_number }}</div>
                    @endif
                    <div><strong>Tanggal Terbit:</strong> {{ $invoice->invoice_date->format('d F Y') }}</div>
                    <div><strong>Jatuh Tempo:</strong> {{ $invoice->due_date->format('d F Y') }}</div>
                    <div><strong>Mata Uang:</strong> {{ $company->currency_code }} ({{ $company->currency_symbol }})</div>
                </td>
            </tr>
        </table>

        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 5%;">#</th>
                    <th style="width: 45%;">Deskripsi Produk / Jasa</th>
                    <th class="text-right" style="width: 15%;">Satuan</th>
                    <th class="text-right" style="width: 15%;">Harga (@)</th>
                    <th class="text-right" style="width: 20%;">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($invoice->items as $index => $item)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>
                            <strong>{{ $item->item_name }}</strong>
                            @if($item->description)
                                <br><small style="color: #64748b;">{{ $item->description }}</small>
                            @endif
                        </td>
                        <td class="text-right">{{ $item->quantity }}</td>
                        <td class="text-right">{{ $company->currency_symbol }} {{ number_format($item->unit_price, 0, ',', '.') }}</td>
                        <td class="text-right">{{ $company->currency_symbol }} {{ number_format($item->subtotal, 0, ',', '.') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <table class="totals-table">
            <tr>
                <td>Subtotal:</td>
                <td class="text-right">{{ $company->currency_symbol }} {{ number_format($invoice->subtotal, 0, ',', '.') }}</td>
            </tr>
            @if($invoice->discount_amount > 0)
                <tr>
                    <td>Diskon:</td>
                    <td class="text-right">- {{ $company->currency_symbol }} {{ number_format($invoice->discount_amount, 0, ',', '.') }}</td>
                </tr>
            @endif
            @if($invoice->tax_rate > 0)
                <tr>
                    <td>PPN ({{ $invoice->tax_rate }}%):</td>
                    <td class="text-right">{{ $company->currency_symbol }} {{ number_format($invoice->tax_amount, 0, ',', '.') }}</td>
                </tr>
            @else
                <tr>
                    <td>PPN:</td>
                    <td class="text-right" style="color: #64748b;">Non-PPN (0%)</td>
                </tr>
            @endif

            <tr class="grand-total">
                <td><strong>GRAND TOTAL:</strong></td>
                <td class="text-right"><strong>{{ $company->currency_symbol }} {{ number_format($invoice->grand_total, 0, ',', '.') }}</strong></td>
            </tr>
        </table>

        <div class="terbilang-box">
            <strong>Terbilang:</strong> {{ \App\Helpers\Terbilang::make($invoice->grand_total) }}
        </div>

        <table class="footer-table">
            <tr>
                <td style="width: 60%;">
                    @if(isset($bankAccounts) && count($bankAccounts) > 0)
                        <div style="margin-bottom: 10px;">
                            <strong>INSTRUKSI PEMBAYARAN REKENING BANK PERUSAHAAN:</strong><br>
                            @foreach($bankAccounts as $acc)
                                <div style="margin-top: 3px; font-family: monospace; font-size: 10px;">
                                    &bull; <strong>{{ $acc->bank_name }}</strong>: {{ $acc->account_number }} (a/n {{ $acc->account_holder }})
                                    @if($acc->branch) - {{ $acc->branch }} @endif
                                    @if($acc->is_primary) <span style="color: #2563eb; font-weight: bold;">[REKENING UTAMA]</span> @endif
                                </div>
                            @endforeach
                        </div>
                    @elseif($company->bank_details)
                        <div style="margin-bottom: 10px;">
                            <strong>INSTRUKSI PEMBAYARAN REKENING BANK:</strong><br>
                            {!! nl2br(e($company->bank_details)) !!}
                        </div>
                    @endif

                    @if($invoice->terms)
                        <div>
                            <strong>Syarat & Ketentuan:</strong><br>
                            {{ $invoice->terms }}
                        </div>
                    @endif
                </td>

                <td class="text-right" style="width: 40%;">
                    @php
                        $sigType = $invoice->signature_type ?: ($company->signature_type ?: 'QR_CODE');
                        $signerName = $company->signature_signer_name ?: $company->company_name;
                        $signerTitle = $company->signature_signer_title ?: 'Hormat Kami,';
                    @endphp

                    <div style="text-align: right; margin-left: auto; width: 170px;">
                        <div style="font-size: 10px; color: #64748b; margin-bottom: 4px;">{{ $company->company_name }}</div>

                        @if($sigType === 'IMAGE' && $company->signature_image_path)
                            <div style="height: 65px; display: flex; align-items: center; justify-content: flex-end;">
                                <img src="{{ public_path($company->signature_image_path) }}" style="max-height: 60px; max-width: 150px; object-fit: contain;" />
                            </div>
                        @elseif($sigType === 'MANUAL')
                            <div style="height: 60px; border: 1.5px dashed #cbd5e1; border-radius: 6px; text-align: center; line-height: 60px; color: #94a3b8; font-size: 9px; background-color: #f8fafc;">
                                [ Kotak TTD & Stempel ]
                            </div>
                        @else
                            {{-- Default QR_CODE --}}
                            <div style="text-align: right;">
                                <img src="{{ \App\Helpers\QrCodeGenerator::generateSvgDataUri(url('/portal/invoice/' . $invoice->invoice_number), 85) }}" style="width: 75px; height: 75px; display: inline-block;" />
                                <div style="color: #2563eb; font-weight: bold; font-size: 8px; margin-top: 1px;">VERIFIED DIGITAL SIGNATURE</div>
                            </div>
                        @endif

                        <div style="font-weight: bold; font-size: 11px; color: #0f172a; margin-top: 6px; border-top: 1px solid #cbd5e1; padding-top: 3px;">
                            {{ $signerName }}
                        </div>
                        <div style="color: #64748b; font-size: 9px;">
                            {{ $signerTitle }}
                        </div>
                    </div>
                </td>
            </tr>
        </table>
    </main>
</body>
</html>
