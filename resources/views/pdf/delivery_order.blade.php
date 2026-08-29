<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Surat Jalan - {{ $do->do_number }}</title>
    <style>
        @page {
            margin: 25pt 30pt;
            size: a4 portrait;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            font-size: 11px;
            line-height: 1.4;
        }
        .table-full {
            width: 100%;
            border-collapse: collapse;
        }
        /* Header Kop */
        .header-table {
            width: 100%;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 12px;
            margin-bottom: 15px;
        }
        .company-name {
            font-size: 18px;
            font-weight: 800;
            color: #1e3a8a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .company-sub {
            font-size: 10px;
            color: #64748b;
        }
        .doc-title {
            font-size: 20px;
            font-weight: 900;
            color: #2563eb;
            text-align: right;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .doc-number {
            font-size: 12px;
            font-weight: 700;
            color: #0f172a;
            text-align: right;
        }

        /* Info Section Boxes */
        .info-box-table {
            width: 100%;
            margin-bottom: 15px;
        }
        .info-card {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 10px;
            background-color: #f8fafc;
            vertical-align: top;
        }
        .card-title {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            color: #2563eb;
            margin-bottom: 6px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 3px;
        }

        /* Item Table */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .items-table th {
            background-color: #1e3a8a;
            color: #ffffff;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            padding: 8px 10px;
            border: 1px solid #1e3a8a;
        }
        .items-table td {
            padding: 8px 10px;
            border: 1px solid #cbd5e1;
            font-size: 11px;
            vertical-align: top;
        }
        .items-table tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }

        /* Notes Box */
        .notes-box {
            border: 1px dashed #94a3b8;
            padding: 8px 12px;
            background-color: #f1f5f9;
            border-radius: 6px;
            margin-bottom: 20px;
            font-size: 10px;
        }

        /* Signatures Grid (4 Columns) */
        .signatures-table {
            width: 100%;
            margin-top: 25px;
            border-collapse: collapse;
        }
        .signature-cell {
            width: 25%;
            text-align: center;
            vertical-align: top;
            padding: 5px;
        }
        .sig-title {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            color: #475569;
            margin-bottom: 50px;
        }
        .sig-name {
            font-size: 11px;
            font-weight: 700;
            color: #0f172a;
            border-top: 1px solid #94a3b8;
            padding-top: 4px;
            display: inline-block;
            width: 85%;
        }
        .sig-sub {
            font-size: 9px;
            color: #64748b;
        }

        .stamp-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .badge-delivered { background-color: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
        .badge-transit { background-color: #dbeafe; color: #1d4ed8; border: 1px solid #bfdbfe; }
        .badge-pending { background-color: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
    </style>
</head>
<body>

    <!-- Header Kop Perusahaan & Judul Surat Jalan -->
    <table class="header-table">
        <tr>
            <td style="width: 55%; vertical-align: top;">
                @if(!empty($company->logo_url))
                    <img src="{{ public_path($company->logo_url) }}" style="max-height: 45px; margin-bottom: 5px;" alt="Logo"><br>
                @endif
                <div class="company-name">{{ $company->name ?? 'PT MIKROTEK ZEMIRO INDONESIA' }}</div>
                <div class="company-sub">
                    {{ $company->address ?? 'Jl. Raya Mikrotek No. 88, Jakarta' }}<br>
                    Telp: {{ $company->phone ?? '(021) 555-0199' }} | Email: {{ $company->email ?? 'info@mikrotek.co.id' }}
                </div>
            </td>
            <td style="width: 45%; vertical-align: top; text-align: right;">
                <div class="doc-title">SURAT JALAN</div>
                <div class="doc-number">No: {{ $do->do_number }}</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 4px;">
                    Tanggal Pengiriman: <strong>{{ \Carbon\Carbon::parse($do->do_date)->format('d F Y') }}</strong>
                </div>
                <div style="margin-top: 6px;">
                    @if($do->status === 'DELIVERED')
                        <span class="stamp-badge badge-delivered">TERKIRIM (DELIVERED)</span>
                    @elseif($do->status === 'IN_TRANSIT')
                        <span class="stamp-badge badge-transit">DALAM PENGIRIMAN</span>
                    @else
                        <span class="stamp-badge badge-pending">PENDING / DRAFT</span>
                    @endif
                </div>
            </td>
        </tr>
    </table>

    <!-- Informasi Tujuan & Ekspedisi -->
    <table class="info-box-table">
        <tr>
            <!-- Tujuan Pengiriman (Klien) -->
            <td style="width: 50%; padding-right: 8px;">
                <div class="info-card">
                    <div class="card-title">TUJUAN PENGIRIMAN (PENERIMA):</div>
                    <div style="font-size: 12px; font-weight: bold; color: #0f172a;">
                        {{ $do->client->company_name ?? $do->client->name }}
                    </div>
                    <div style="margin-top: 4px; color: #334155; font-size: 10.5px; white-space: pre-line;">
                        {{ $do->shipping_address }}
                    </div>
                    <div style="margin-top: 6px; font-size: 10px; color: #475569;">
                        UP / Penerima: <strong>{{ $do->recipient_name ?? $do->client->contact_person ?? '-' }}</strong><br>
                        No. HP / Telepon: <strong>{{ $do->recipient_phone ?? $do->client->phone ?? '-' }}</strong>
                    </div>
                </div>
            </td>

            <!-- Logistik & Ekspedisi -->
            <td style="width: 50%; padding-left: 8px;">
                <div class="info-card">
                    <div class="card-title">INFORMASI EKSPEDISI &amp; DOKUMEN:</div>
                    <table style="width: 100%; font-size: 10.5px;">
                        <tr>
                            <td style="width: 40%; color: #64748b;">No. Invoice Ref:</td>
                            <td style="font-weight: bold;">{{ $do->invoice->invoice_number ?? '-' }}</td>
                        </tr>
                        <tr>
                            <td style="color: #64748b;">No. Proyek Ref:</td>
                            <td style="font-weight: bold;">{{ $do->project->name ?? '-' }}</td>
                        </tr>
                        <tr>
                            <td style="color: #64748b;">Jasa Kurir / Ekspedisi:</td>
                            <td style="font-weight: bold; color: #2563eb;">{{ $do->expedition_name ?? 'Kurir Internal' }}</td>
                        </tr>
                        <tr>
                            <td style="color: #64748b;">Nama Sopir / Driver:</td>
                            <td style="font-weight: bold;">{{ $do->driver_name ?? '-' }}</td>
                        </tr>
                        <tr>
                            <td style="color: #64748b;">No. Plat Kendaraan:</td>
                            <td style="font-weight: bold;">{{ $do->vehicle_number ?? '-' }}</td>
                        </tr>
                        <tr>
                            <td style="color: #64748b;">No. Resi / Tracking:</td>
                            <td style="font-weight: bold;">{{ $do->tracking_number ?? '-' }}</td>
                        </tr>
                    </table>
                </div>
            </td>
        </tr>
    </table>

    <!-- Tabel Daftar Barang Dikirim -->
    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 6%;">NO</th>
                <th style="width: 34%; text-align: left;">NAMA BARANG / PRODUK</th>
                <th style="width: 32%; text-align: left;">SPESIFIKASI / KETERANGAN</th>
                <th style="width: 12%;">SATUAN</th>
                <th style="width: 16%;">QTY DIKIRIM</th>
            </tr>
        </thead>
        <tbody>
            @php $totalQty = 0; @endphp
            @forelse($do->items as $index => $item)
                @php $totalQty += $item->quantity; @endphp
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td class="font-bold">
                        {{ $item->item_name }}
                        @if(!empty($item->notes))
                            <br><span style="font-size: 9px; color: #64748b; font-weight: normal;">({{ $item->notes }})</span>
                        @endif
                    </td>
                    <td style="color: #475569;">{{ $item->description ?? '-' }}</td>
                    <td class="text-center">{{ $item->unit ?? 'Pcs' }}</td>
                    <td class="text-center font-bold" style="font-size: 12px; color: #1e3a8a;">
                        {{ number_format($item->quantity, 0, ',', '.') }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" class="text-center" style="color: #94a3b8; padding: 15px;">
                        Tidak ada barang terdaftar pada pengiriman ini.
                    </td>
                </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr style="background-color: #f1f5f9; font-weight: bold;">
                <td colspan="4" class="text-right" style="padding: 8px 10px; font-size: 11px;">TOTAL BARANG DIKIRIM:</td>
                <td class="text-center" style="font-size: 13px; color: #2563eb; padding: 8px 10px;">
                    {{ number_format($totalQty, 0, ',', '.') }}
                </td>
            </tr>
        </tfoot>
    </table>

    <!-- Catatan Tambahan / Instruksi Khusus -->
    <div class="notes-box">
        <strong>CATATAN PENGIRIMAN:</strong><br>
        1. Harap periksa kondisi fisik barang saat diterima sebelum menandatangani Surat Jalan ini.<br>
        2. Barang yang telah diterima dengan tanda tangan dianggap lengkap dan dalam kondisi baik.<br>
        @if(!empty($do->notes))
            3. Catatan Khusus: <em>{{ $do->notes }}</em>
        @endif
    </div>

    <!-- Grid Tanda Tangan Resmi (Dinamis dari Pengaturan Sistem) -->
    @php
        $settings = $companySettings ?? \App\Modules\Settings\Models\CompanySetting::instance();
        
        $sigCols = [];
        if ($settings->do_show_sender ?? true) {
            $sigCols[] = [
                'title' => $settings->do_title_sender ?? 'Pengirim (Mikrotek)',
                'name'  => $company->name ?? 'PT Mikrotek Zemiro',
                'sub'   => 'Pengirim Barang',
            ];
        }
        if ($settings->do_show_receiver ?? true) {
            $sigCols[] = [
                'title' => $settings->do_title_receiver ?? 'Penerima (Klien)',
                'name'  => $do->recipient_name ?? 'Cap & Tanda Tangan',
                'sub'   => 'Tanggal: ..../..../2026',
            ];
        }
        if ($settings->do_show_driver ?? false) {
            $sigCols[] = [
                'title' => $settings->do_title_driver ?? 'Pengemudi / Kurir',
                'name'  => $do->driver_name ?? 'Sopir / Ekspedisi',
                'sub'   => 'Tanggal: ..../..../2026',
            ];
        }
        if ($settings->do_show_logistics ?? false) {
            $sigCols[] = [
                'title' => $settings->do_title_logistics ?? 'Petugas Logistik',
                'name'  => 'Bagian Gudang',
                'sub'   => 'Petugas Logistik',
            ];
        }
        if ($settings->do_show_manager ?? false) {
            $sigCols[] = [
                'title' => $settings->do_title_manager ?? 'Mengetahui (Manager)',
                'name'  => 'Manager Logistik',
                'sub'   => $company->name ?? 'PT Mikrotek Zemiro',
            ];
        }
        if (count($sigCols) === 0) {
            $sigCols[] = [
                'title' => 'Pengirim (Mikrotek)',
                'name'  => $company->name ?? 'PT Mikrotek Zemiro',
                'sub'   => 'Pengirim Barang',
            ];
            $sigCols[] = [
                'title' => 'Penerima (Klien)',
                'name'  => $do->recipient_name ?? 'Cap & Tanda Tangan',
                'sub'   => 'Tanggal: ..../..../2026',
            ];
        }
        $colWidth = (100 / count($sigCols)) . '%';
    @endphp

    <table class="signatures-table">
        <tr>
            @foreach($sigCols as $col)
                <td class="signature-cell" style="width: {{ $colWidth }};">
                    <div class="sig-title">{{ $col['title'] }}</div>
                    <br><br><br>
                    <div class="sig-name">( {{ $col['name'] }} )</div>
                    <div class="sig-sub">{{ $col['sub'] }}</div>
                </td>
            @endforeach
        </tr>
    </table>

</body>
</html>
