import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useConfirm } from '../../context/ConfirmContext';
import SearchableSelect from '../../components/SearchableSelect';
import {
    FileText,
    Plus,
    Search,
    RefreshCw,
    Edit3,
    Trash2,
    Paperclip,
    ExternalLink,
    FileCheck,
    Eye
} from 'lucide-react';

export default function TaxInvoiceList() {
    const { confirm } = useConfirm();
    const navigate = useNavigate();
    const [taxInvoices, setTaxInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const fetchTaxInvoices = async () => {
        setLoading(true);
        try {
            const res = await api.get('/tax-invoices', {
                params: {
                    search: searchTerm || undefined,
                    status: statusFilter || undefined,
                }
            });
            setTaxInvoices(res.data.data || []);
        } catch (err) {
            console.error('Error fetching tax invoices:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTaxInvoices();
    }, [searchTerm, statusFilter]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    // Stat aggregates
    const totalCount = taxInvoices.length;
    const totalDpp = taxInvoices.reduce((sum, item) => sum + (parseFloat(item.dpp_amount) || 0), 0);
    const totalTax = taxInvoices.reduce((sum, item) => sum + (parseFloat(item.tax_amount) || 0), 0);
    const totalGrand = taxInvoices.reduce((sum, item) => sum + (parseFloat(item.total_amount) || 0), 0);

    const handleDelete = async (id) => {
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
            fetchTaxInvoices();
        } catch (err) {
            alert('Gagal menghapus Faktur Pajak.');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'VALID':
                return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">VALID</span>;
            case 'DRAFT':
                return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">DRAFT</span>;
            case 'REJECTED':
                return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">REJECTED</span>;
            case 'CANCELLED':
                return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">BATAL</span>;
            default:
                return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">{status}</span>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                        <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span>Faktur Pajak (e-Faktur)</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Pencatatan &amp; upload dokumen Faktur Pajak elektronik yang terhubung dengan Invoice / Tagihan Penjualan.
                    </p>
                </div>

                <Link
                    to="/tax-invoices/create"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all self-start md:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Upload Faktur Pajak Baru</span>
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Faktur Pajak</span>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalCount} Dokumen</div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total DPP (Dasar Pengenaan)</span>
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalDpp)}</div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total PPN (Pajak Pertambahan Nilai)</span>
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalTax)}</div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Grand Total Nominal</span>
                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(totalGrand)}</div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm text-xs">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-72">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari NSFP / Invoice / Nama Klien..."
                            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="flex items-center space-x-2 min-w-[150px]">
                        <SearchableSelect
                            options={[
                                { value: '', label: 'Semua Status' },
                                { value: 'VALID', label: 'VALID' },
                                { value: 'DRAFT', label: 'DRAFT' },
                                { value: 'REJECTED', label: 'REJECTED' },
                                { value: 'CANCELLED', label: 'BATAL (CANCELLED)' },
                            ]}
                            value={statusFilter}
                            onChange={(val) => setStatusFilter(val)}
                            placeholder="Semua Status..."
                        />
                    </div>
                </div>

                <button
                    onClick={fetchTaxInvoices}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center space-x-1"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Tax Invoices Table */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm text-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                <th className="py-3 px-4">Nomor Seri Faktur Pajak (NSFP)</th>
                                <th className="py-3 px-4">Tanggal Faktur</th>
                                <th className="py-3 px-4">Linked Invoice / Klien</th>
                                <th className="py-3 px-4 text-right">DPP (Rp)</th>
                                <th className="py-3 px-4 text-right">PPN (%)</th>
                                <th className="py-3 px-4 text-right">Nominal PPN (Rp)</th>
                                <th className="py-3 px-4 text-right">Total Nominal</th>
                                <th className="py-3 px-4 text-center">Dokumen PDF</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                            {loading ? (
                                <tr>
                                    <td colSpan="10" className="py-8 text-center text-slate-400">
                                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-500" />
                                        <span>Memuat data Faktur Pajak...</span>
                                    </td>
                                </tr>
                            ) : taxInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="py-12 text-center text-slate-500">
                                        Belum ada data Faktur Pajak yang tercatat / sesuai filter.
                                    </td>
                                </tr>
                            ) : (
                                taxInvoices.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                                            <Link to={`/tax-invoices/${item.id}`} className="hover:underline flex items-center space-x-1">
                                                <span>{item.tax_invoice_number}</span>
                                            </Link>
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                                            {item.tax_date}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            {item.invoice ? (
                                                <div>
                                                    <Link
                                                        to={`/invoices/${item.invoice.id}`}
                                                        className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 hover:underline flex items-center space-x-1"
                                                    >
                                                        <span>{item.invoice.invoice_number}</span>
                                                        <ExternalLink className="w-3 h-3 text-slate-400" />
                                                    </Link>
                                                    <div className="text-[10px] text-slate-500">{item.invoice.client?.name || '-'}</div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">Tanpa Link Invoice</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                                            {formatCurrency(item.dpp_amount)}
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                                            {item.tax_rate_percent}%
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(item.tax_amount)}
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                                            {formatCurrency(item.total_amount)}
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            {item.file_url ? (
                                                <a
                                                    href={item.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-semibold text-[11px]"
                                                >
                                                    <Paperclip className="w-3 h-3" />
                                                    <span>Preview PDF</span>
                                                </a>
                                            ) : (
                                                <span className="text-slate-400 text-[10px] italic">Tidak ada file</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            {getStatusBadge(item.status)}
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end space-x-1">
                                                <Link
                                                    to={`/tax-invoices/${item.id}`}
                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                    title="Lihat Detail Faktur Pajak"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </Link>
                                                <Link
                                                    to={`/tax-invoices/${item.id}/edit`}
                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                    title="Edit Faktur Pajak"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                    title="Hapus Faktur Pajak"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
