import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { openPdfPreview } from '../../utils/pdfPreview';
import { useConfirm } from '../../context/ConfirmContext';
import {
    CreditCard,
    ArrowLeft,
    Download,
    Edit3,
    Trash2,
    CheckCircle2,
    Building2,
    Calendar,
    FileText,
    Printer,
    RefreshCw,
    ShieldCheck,
    User,
    Tag,
    FileCheck,
    UploadCloud,
    AlertCircle,
    X
} from 'lucide-react';

export default function PaymentDetailPage() {
    const { confirm } = useConfirm();
    const { id } = useParams();
    const navigate = useNavigate();

    const [payment, setPayment] = useState(null);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showProofModal, setShowProofModal] = useState(false);
    const [proofFile, setProofFile] = useState(null);
    const [uploadingProof, setUploadingProof] = useState(false);
    const [proofError, setProofError] = useState(null);

    const handleUploadProofSubmit = async (e) => {
        e.preventDefault();
        if (!proofFile) {
            setProofError('Silakan pilih file scan/foto bukti pembayaran terlebih dahulu.');
            return;
        }
        try {
            setUploadingProof(true);
            setProofError(null);

            const formData = new FormData();
            formData.append('proof_file', proofFile);

            await api.post(`/payments/${id}/upload-proof`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setShowProofModal(false);
            setProofFile(null);
            fetchData();
        } catch (err) {
            setProofError(err.response?.data?.message || 'Gagal mengunggah file bukti pembayaran.');
        } finally {
            setUploadingProof(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [payRes, compRes] = await Promise.all([
                api.get(`/payments/${id}`),
                api.get('/settings').catch(() => ({ data: { data: {} } })),
            ]);
            setPayment(payRes.data.data || null);
            setCompany(compRes.data.data || {});
        } catch (err) {
            console.error('Error fetching payment detail:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleDelete = async () => {
        const ok = await confirm({
            title: 'Hapus Data Pembayaran',
            message: 'Apakah Anda yakin ingin menghapus data pembayaran ini? Status pembayaran pada Invoice terkait akan dihitung ulang.',
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/payments/${id}`);
            alert('Pembayaran berhasil dihapus.');
            navigate('/payments');
        } catch (err) {
            alert('Gagal menghapus pembayaran: ' + (err.response?.data?.message || err.message));
        }
    };

    const formatRp = (val) => 'Rp ' + new Intl.NumberFormat('id-ID').format(val ?? 0);

    const formatDate = (d) => {
        if (!d) return '-';
        return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', {
            day: '2-digit', month: 'long', year: 'numeric',
        });
    };

    // Terbilang helper in Indonesian
    const terbilang = (n) => {
        const angka = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
        n = Math.floor(Math.abs(n));
        if (n < 12) return angka[n];
        if (n < 20) return terbilang(n - 10) + " Belas";
        if (n < 100) return terbilang(Math.floor(n / 10)) + " Puluh " + (n % 10 ? " " + terbilang(n % 10) : "");
        if (n < 200) return "Seratus" + (n - 100 ? " " + terbilang(n - 100) : "");
        if (n < 1000) return terbilang(Math.floor(n / 100)) + " Ratus" + (n % 100 ? " " + terbilang(n % 100) : "");
        if (n < 2000) return "Seribu" + (n - 1000 ? " " + terbilang(n - 1000) : "");
        if (n < 1000000) return terbilang(Math.floor(n / 1000)) + " Ribu" + (n % 1000 ? " " + terbilang(n % 1000) : "");
        if (n < 1000000000) return terbilang(Math.floor(n / 1000000)) + " Juta" + (n % 1000000 ? " " + terbilang(n % 1000000) : "");
        if (n < 1000000000000) return terbilang(Math.floor(n / 1000000000)) + " Miliar" + (n % 1000000000 ? " " + terbilang(n % 1000000000) : "");
        return "";
    };

    const getTerbilangRupiah = (amount) => {
        if (!amount || amount <= 0) return "Nol Rupiah";
        return terbilang(amount).trim() + " Rupiah";
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-16 text-xs text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 dark:text-emerald-400 mb-3" />
                <span>Memuat detail kwitansi pembayaran...</span>
            </div>
        );
    }

    if (!payment) {
        return (
            <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#0f172a] space-y-4">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Data Pembayaran Tidak Ditemukan</h3>
                <p className="text-xs text-slate-500">Pembayaran yang Anda cari mungkin telah dihapus.</p>
                <Link to="/payments" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl">
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
                </Link>
            </div>
        );
    }

    const invoice = payment.invoice || {};
    const client = invoice.client || {};
    const paymentMethod = payment.payment_method || payment.paymentMethod || {};
    const grandTotal = parseFloat(invoice.grand_total || 0);
    const paidAmount = parseFloat(invoice.paid_amount || 0);
    const remainingBalance = Math.max(0, grandTotal - paidAmount);
    const progressPercent = grandTotal > 0 ? Math.min(100, Math.round((paidAmount / grandTotal) * 100)) : 100;

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* Header Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => navigate('/payments')}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
                        title="Kembali ke Riwayat Pembayaran"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center space-x-2.5">
                            <h1 className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 tracking-tight">
                                {payment.payment_number}
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                Lunas Diterima
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Kwitansi Pembayaran Resmi untuk Invoice <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{invoice.invoice_number}</span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => openPdfPreview(`/payments/${payment.id}/receipt`)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center space-x-1.5 transition-all cursor-pointer"
                    >
                        <Printer className="w-4 h-4" />
                        <span>Preview &amp; Cetak Kwitansi</span>
                    </button>
                    <button
                        onClick={() => navigate(`/payments/${payment.id}/edit`)}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 flex items-center space-x-1.5 transition-all"
                    >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit</span>
                    </button>
                    <button
                        onClick={handleDelete}
                        className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold text-xs border border-rose-500/20 flex items-center space-x-1.5 transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Hapus</span>
                    </button>
                </div>
            </div>

            {/* Official Receipt Paper Card View */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden relative">
                {/* Decorative Top Accent Border */}
                <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600" />

                <div className="p-6 md:p-10 space-y-8">
                    {/* Kwitansi Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-6 gap-4">
                        <div>
                            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 mb-1">
                                <Building2 className="w-5 h-5" />
                                <span className="font-extrabold tracking-wide uppercase text-sm">{company.company_name || 'PT MIKROTEK ZEMIRO INDONESIA'}</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
                                {company.company_address || 'Jl. Raya Utama No. 88, Jakarta Selatan'}
                                {company.company_phone && ` • Telp: ${company.company_phone}`}
                                {company.company_email && ` • Email: ${company.company_email}`}
                            </p>
                        </div>
                        <div className="text-left sm:text-right border-l sm:border-l-0 border-slate-200 dark:border-slate-800 pl-4 sm:pl-0">
                            <span className="text-lg font-black tracking-wider uppercase text-slate-900 dark:text-slate-100 block">
                                KWITANSI PEMBAYARAN
                            </span>
                            <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                                NO: {payment.payment_number}
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-1">
                                Tanggal: <strong className="text-slate-700 dark:text-slate-300">{formatDate(payment.payment_date)}</strong>
                            </span>
                        </div>
                    </div>

                    {/* Official Receipt Content Grid */}
                    <div className="space-y-6 text-xs text-slate-700 dark:text-slate-300">
                        {/* Telah Diterima Dari */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-baseline bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[11px]">Telah Diterima Dari</span>
                            <div className="md:col-span-3 font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>{client.company_name ? `${client.company_name} (${client.name || 'Klien'})` : (client.name || '-')}</span>
                            </div>
                        </div>

                        {/* Uang Sejumlah (Terbilang) */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-baseline bg-emerald-500/5 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase text-[11px]">Uang Sejumlah</span>
                            <div className="md:col-span-3 font-extrabold text-sm italic text-emerald-700 dark:text-emerald-300">
                                "{getTerbilangRupiah(payment.amount)}"
                            </div>
                        </div>

                        {/* Untuk Pembayaran */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-start bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[11px]">Untuk Pembayaran</span>
                            <div className="md:col-span-3 space-y-1.5">
                                <div className="font-bold text-slate-900 dark:text-slate-100">
                                    Pembayaran Invoice <span className="font-mono text-indigo-600 dark:text-indigo-400">#{invoice.invoice_number}</span>
                                </div>
                                {payment.notes && (
                                    <p className="text-slate-500 dark:text-slate-400 text-xs italic">
                                        Catatan: {payment.notes}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Metode & Referensi Transaksi */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1">
                                <span className="text-[10px] font-bold uppercase text-slate-400 block">Metode Pembayaran</span>
                                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                    <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    {paymentMethod.name || 'Transfer Bank'}
                                </span>
                                {paymentMethod.description && (
                                    <span className="text-[11px] text-slate-500 block leading-tight">{paymentMethod.description}</span>
                                )}
                            </div>
                            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1">
                                <span className="text-[10px] font-bold uppercase text-slate-400 block">No. Referensi / Bank Ref</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                                    {payment.reference_number || '-'}
                                </span>
                                <span className="text-[11px] text-slate-500 block leading-tight">Kode bukti transaksi perbankan</span>
                            </div>
                        </div>

                        {/* Total Nominal Box & Stamp Section */}
                        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
                            {/* Large Nominal Display */}
                            <div className="bg-slate-900 dark:bg-slate-950 text-white p-4 px-6 rounded-2xl shadow-md border border-slate-800 flex items-center space-x-4 w-full sm:w-auto">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">JUMLAH TERIMA</span>
                                    <span className="text-2xl font-black font-mono tracking-tight text-white">{formatRp(payment.amount)}</span>
                                </div>
                            </div>

                            {/* Cashier/Finance Signature Block */}
                            <div className="text-center sm:text-right space-y-1 self-end">
                                <span className="text-[11px] text-slate-500 block">Diterbitkan oleh Kasir / Keuangan:</span>
                                <div className="h-14 flex items-center justify-center sm:justify-end">
                                    <div className="px-3 py-1 rounded-lg border-2 border-dashed border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                        <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED OFFICIAL RECEIPT
                                    </div>
                                </div>
                                <span className="font-bold text-slate-900 dark:text-slate-100 block">
                                    {company.company_name || 'PT MIKROTEK ZEMIRO INDONESIA'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Proof Scan Card */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span>Scan / Foto Bukti Pembayaran &amp; Kwitansi TTD</span>
                    </h3>
                    {payment.proof_file_url && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            BERKAS TTD TERSEDIA
                        </span>
                    )}
                </div>

                {payment.proof_file_url ? (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold">
                                <FileCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                    Scan Bukti Transfer / Kwitansi TTD Tersedia
                                </h4>
                                <p className="text-[10px] text-slate-500">
                                    File bukti transaksi perbankan atau kwitansi fisik bertanda tangan telah diunggah.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <a
                                href={payment.proof_file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center space-x-1 transition-colors"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>Lihat / Download File</span>
                            </a>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowProofModal(true);
                                    setProofError(null);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 transition-colors"
                            >
                                Ganti
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                                    Scan Bukti Transfer / Kwitansi TTD Belum Diunggah
                                </h4>
                                <p className="text-[10px] text-amber-700 dark:text-amber-400">
                                    Anda dapat mengunggah bukti fisik pembayaran untuk keperluan dokumentasi audit.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setShowProofModal(true);
                                setProofError(null);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center space-x-1 transition-colors shrink-0"
                        >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Upload Scan Bukti</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Linked Invoice & Payment Status Summary Card */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Status Invoice Terkait</span>
                    </h3>
                    <Link
                        to={`/invoices`}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        Lihat Semua Invoice →
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Nomor Invoice</span>
                        <div className="font-mono font-bold text-slate-900 dark:text-slate-100">{invoice.invoice_number}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Tagihan</span>
                        <div className="font-mono font-bold text-slate-900 dark:text-slate-100">{formatRp(grandTotal)}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Terbayar</span>
                        <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatRp(paidAmount)}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Sisa Tagihan</span>
                        <div className="font-mono font-bold text-rose-600 dark:text-rose-400">{formatRp(remainingBalance)}</div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                        <span>Progres Pelunasan Invoice</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${progressPercent >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Modal Upload Bukti Pembayaran / Kwitansi TTD */}
            {showProofModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4 relative">
                        <button
                            onClick={() => {
                                setShowProofModal(false);
                                setProofFile(null);
                            }}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold">
                                <FileCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                                    Upload Scan Bukti Pembayaran / TTD
                                </h3>
                                <p className="text-xs text-slate-500">
                                    No. Kwitansi: <strong>{payment.payment_number}</strong>
                                </p>
                            </div>
                        </div>

                        {proofError && (
                            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{proofError}</span>
                            </div>
                        )}

                        <form onSubmit={handleUploadProofSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Pilih File Scan Bukti Transfer / Kwitansi TTD (PDF, JPG, PNG) *
                                </label>
                                <input
                                    type="file"
                                    required
                                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                                    onChange={(e) => setProofFile(e.target.files[0])}
                                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 dark:file:bg-purple-950/50 dark:file:text-purple-400 hover:file:bg-purple-100 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 p-1"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">
                                    Maksimal ukuran file 10MB.
                                </p>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowProofModal(false);
                                        setProofFile(null);
                                    }}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploadingProof}
                                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 disabled:opacity-50"
                                >
                                    {uploadingProof ? (
                                        <span>Mengunggah...</span>
                                    ) : (
                                        <>
                                            <UploadCloud className="w-4 h-4" />
                                            <span>Upload Berkas</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
