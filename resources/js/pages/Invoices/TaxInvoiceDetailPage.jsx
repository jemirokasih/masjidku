import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useConfirm } from '../../context/ConfirmContext';
import {
    FileText,
    ArrowLeft,
    Download,
    Paperclip,
    ExternalLink,
    Building2,
    Calendar,
    DollarSign,
    CheckCircle2,
    Edit3,
    Trash2,
    RefreshCw,
    User
} from 'lucide-react';

export default function TaxInvoiceDetailPage() {
    const { confirm } = useConfirm();
    const { id } = useParams();
    const navigate = useNavigate();
    const [taxInvoice, setTaxInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchTaxInvoiceDetail = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/tax-invoices/${id}`);
            setTaxInvoice(res.data.data);
        } catch (err) {
            console.error('Error fetching tax invoice detail:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTaxInvoiceDetail();
    }, [id]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const handleDelete = async () => {
        const ok = await confirm({
            title: 'Hapus Faktur Pajak',
            message: 'Apakah Anda yakin ingin menghapus data Faktur Pajak ini? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/tax-invoices/${id}`);
            alert('Faktur Pajak berhasil dihapus.');
            navigate('/tax-invoices');
        } catch (err) {
            alert('Gagal menghapus Faktur Pajak.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-xs text-slate-500">
                <RefreshCw className="w-5 h-5 animate-spin mr-2 text-blue-500" />
                <span>Memuat detail Faktur Pajak...</span>
            </div>
        );
    }

    if (!taxInvoice) {
        return (
            <div className="p-8 text-center border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#0f172a] space-y-3">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Data Faktur Pajak tidak ditemukan.</p>
                <Link to="/tax-invoices" className="inline-block px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md">
                    Kembali ke Daftar Faktur Pajak
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                    <Link
                        to="/tax-invoices"
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <span>NSFP: {taxInvoice.tax_invoice_number}</span>
                        </h1>
                        <p className="text-xs text-slate-500">Tanggal Faktur: {taxInvoice.tax_date}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    {taxInvoice.file_url && (
                        <a
                            href={taxInvoice.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all"
                        >
                            <Download className="w-4 h-4" />
                            <span>Download PDF Dokumen</span>
                        </a>
                    )}
                    <button
                        onClick={handleDelete}
                        className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center space-x-1 transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Hapus</span>
                    </button>
                </div>
            </div>

            {/* Main Content Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left 2 Cols: Details & Breakdown */}
                <div className="md:col-span-2 space-y-6">
                    <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ringkasan Perpajakan</span>
                            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                Status: {taxInvoice.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <span className="text-slate-400 font-semibold block mb-1">Nomor Seri Faktur Pajak (NSFP)</span>
                                <span className="font-mono font-bold text-base text-blue-600 dark:text-blue-400">{taxInvoice.tax_invoice_number}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 font-semibold block mb-1">Tanggal Terbit</span>
                                <span className="font-bold text-slate-900 dark:text-slate-100">{taxInvoice.tax_date}</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                            <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                                <span>DPP (Dasar Pengenaan Pajak):</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{formatCurrency(taxInvoice.dpp_amount)}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                                <span>Tarif PPN ({taxInvoice.tax_rate_percent}%):</span>
                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(taxInvoice.tax_amount)}</span>
                            </div>
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm font-extrabold text-slate-900 dark:text-slate-100">
                                <span>Total Nominal Faktur:</span>
                                <span className="font-mono text-blue-600 dark:text-blue-400">{formatCurrency(taxInvoice.total_amount)}</span>
                            </div>
                        </div>

                        {taxInvoice.notes && (
                            <div className="text-xs space-y-1">
                                <span className="text-slate-400 font-semibold block">Catatan Internal / Keterangan:</span>
                                <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                                    {taxInvoice.notes}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* PDF Preview Frame if Available */}
                    {taxInvoice.file_url && (
                        <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                    <Paperclip className="w-4 h-4 text-blue-500" />
                                    <span>Lampiran Dokumen Faktur Pajak</span>
                                </h3>
                                <a
                                    href={taxInvoice.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                                >
                                    <span>Buka di Tab Baru</span>
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>

                            {taxInvoice.file_name?.toLowerCase().endsWith('.pdf') ? (
                                <iframe
                                    src={taxInvoice.file_url}
                                    className="w-full h-[500px] rounded-xl border border-slate-200 dark:border-slate-800"
                                    title="Faktur Pajak PDF Preview"
                                />
                            ) : (
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl text-center">
                                    <img
                                        src={taxInvoice.file_url}
                                        alt="Faktur Pajak Document"
                                        className="max-h-[500px] mx-auto rounded-lg shadow-sm"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right 1 Col: Linked Invoice & Creator Info */}
                <div className="space-y-6">
                    {/* Linked Invoice Card */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
                            Invoice / Tagihan Terkait
                        </h3>

                        {taxInvoice.invoice ? (
                            <div className="space-y-3 text-xs">
                                <div>
                                    <span className="text-slate-400 font-semibold block">Nomor Invoice</span>
                                    <Link
                                        to={`/invoices/${taxInvoice.invoice.id}`}
                                        className="font-bold text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center gap-1 mt-0.5"
                                    >
                                        <span>{taxInvoice.invoice.invoice_number}</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </Link>
                                </div>

                                <div>
                                    <span className="text-slate-400 font-semibold block">Klien / Pelanggan</span>
                                    <span className="font-bold text-slate-900 dark:text-slate-100">{taxInvoice.invoice.client?.name || '-'}</span>
                                </div>

                                <div>
                                    <span className="text-slate-400 font-semibold block">Tanggal Invoice</span>
                                    <span className="text-slate-700 dark:text-slate-300 font-mono">{taxInvoice.invoice.invoice_date || '-'}</span>
                                </div>

                                <div>
                                    <span className="text-slate-400 font-semibold block">Grand Total Invoice</span>
                                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{formatCurrency(taxInvoice.invoice.grand_total)}</span>
                                </div>

                                <div>
                                    <span className="text-slate-400 font-semibold block">Status Pembayaran Invoice</span>
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20 inline-block mt-1">
                                        {taxInvoice.invoice.status}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-center text-xs text-slate-400">
                                Faktur Pajak ini tidak dihubungkan dengan invoice manapun.
                            </div>
                        )}
                    </div>

                    {/* Creator Card */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
                        <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
                            Informasi Pengunggah
                        </h3>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                                {taxInvoice.creator?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <span className="font-bold text-slate-900 dark:text-slate-100 block">{taxInvoice.creator?.name || 'Administrator'}</span>
                                <span className="text-[10px] text-slate-400">{taxInvoice.creator?.email || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
