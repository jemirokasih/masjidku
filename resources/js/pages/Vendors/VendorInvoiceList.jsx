import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useConfirm } from '../../context/ConfirmContext';
import {
    Receipt,
    Plus,
    Search,
    RefreshCw,
    Trash2,
    Building2,
    FolderKanban,
    Calendar,
    Download,
    CheckCircle2,
    Clock,
    XCircle,
    Upload,
    Eye,
    CreditCard,
    List,
    LayoutGrid,
    ArrowUpDown,
    ArrowUp,
    ArrowDown
} from 'lucide-react';

export default function VendorInvoiceList() {
    const { confirm } = useConfirm();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem('mbs_vendor_invoice_view_mode') || 'table';
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const res = await api.get('/vendor-invoices', {
                params: { search, status: statusFilter }
            });
            setInvoices(res.data.data || []);
        } catch (err) {
            console.error('Gagal memuat tagihan vendor:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        fetchInvoices();
    }, [search, statusFilter]);

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        localStorage.setItem('mbs_vendor_invoice_view_mode', mode);
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await api.put(`/vendor-invoices/${id}/status`, { status: newStatus });
            fetchInvoices();
        } catch (err) {
            alert('Gagal mengubah status tagihan: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDelete = async (id, num) => {
        const ok = await confirm({
            title: 'Hapus Tagihan Vendor',
            message: `Apakah Anda yakin ingin menghapus tagihan vendor ${num}?`,
            confirmText: 'Ya, Hapus',
            type: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/vendor-invoices/${id}`);
            fetchInvoices();
        } catch (err) {
            alert('Gagal menghapus tagihan vendor: ' + (err.response?.data?.message || err.message));
        }
    };

    const getStatusBadge = (st) => {
        switch (st) {
            case 'PAID':
                return <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 font-extrabold text-[10px]">LUNAS (PAID)</span>;
            case 'PARTIAL':
                return <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 font-extrabold text-[10px]">SEBAGIAN (PARTIAL)</span>;
            case 'CANCELLED':
                return <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 font-extrabold text-[10px]">DIBATALKAN</span>;
            case 'UNPAID':
            default:
                return <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 font-extrabold text-[10px]">BELUM BAYAR (UNPAID)</span>;
        }
    };

    const [sortConfig, setSortConfig] = useState({ key: 'invoice_number', direction: 'asc' });

    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const renderSortIcon = (key) => {
        if (sortConfig.key !== key) {
            return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity inline ml-1" />;
        }
        return sortConfig.direction === 'asc' ? (
            <ArrowUp className="w-3 h-3 text-purple-600 dark:text-purple-400 inline ml-1" />
        ) : (
            <ArrowDown className="w-3 h-3 text-purple-600 dark:text-purple-400 inline ml-1" />
        );
    };

    const sortedInvoices = React.useMemo(() => {
        if (!sortConfig.key) return invoices;
        return [...invoices].sort((a, b) => {
            let aVal = a;
            let bVal = b;
            const keys = sortConfig.key.split('.');
            for (const k of keys) {
                aVal = aVal?.[k];
                bVal = bVal?.[k];
            }

            if (aVal == null) return 1;
            if (bVal == null) return -1;

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
            }

            const strA = String(aVal).toLowerCase();
            const strB = String(bVal).toLowerCase();
            if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [invoices, sortConfig]);

    const totalAmountSum = invoices.reduce((acc, inv) => acc + (parseFloat(inv.total_amount) || 0), 0);
    const paidCount = invoices.filter(inv => inv.status === 'PAID').length;
    const unpaidCount = invoices.filter(inv => inv.status === 'UNPAID' || inv.status === 'PARTIAL').length;

    const totalInvoices = sortedInvoices.length;
    const totalPages = Math.ceil(totalInvoices / itemsPerPage) || 1;
    const currentInvoices = sortedInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-6 text-xs animate-in fade-in duration-150">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                        <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                            Tagihan Vendor (Invoice In / Bills)
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Catat tagihan masuk dari vendor, lacak status pembayaran, dan alokasikan pengeluaran ke Proyek.
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={fetchInvoices}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <Link
                        to="/vendor-invoices/create"
                        className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-500/20 flex items-center space-x-1.5 transition-all text-xs"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Catat Tagihan Vendor Baru</span>
                    </Link>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
                        <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Invoice Masuk</p>
                        <p className="text-xl font-black text-slate-900 dark:text-slate-100">{invoices.length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Nilai Tagihan</p>
                        <p className="text-xl font-black text-slate-900 dark:text-slate-100">
                            Rp {totalAmountSum.toLocaleString('id-ID')}
                        </p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Lunas (Paid)</p>
                        <p className="text-xl font-black text-slate-900 dark:text-slate-100">{paidCount}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
                        <XCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Belum Lunas</p>
                        <p className="text-xl font-black text-slate-900 dark:text-slate-100">{unpaidCount}</p>
                    </div>
                </div>
            </div>

            {/* Filter Search & Status */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
                <div className="relative flex-1 max-w-md w-full">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari no invoice vendor atau nama vendor..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 text-slate-900 dark:text-slate-100"
                    />
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none text-slate-800 dark:text-slate-200"
                    >
                        <option value="">Semua Status Bayar</option>
                        <option value="UNPAID">UNPAID (Belum Bayar)</option>
                        <option value="PAID">PAID (Lunas)</option>
                        <option value="CANCELLED">CANCELLED</option>
                    </select>

                    <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => handleViewModeChange('table')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                                viewMode === 'table'
                                    ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                            title="Tampilan Tabel"
                        >
                            <List className="w-3.5 h-3.5" />
                            <span>Tabel</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleViewModeChange('grid')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                                viewMode === 'grid'
                                    ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                            title="Tampilan Kartu / Grid"
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span>Kartu</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content List */}
            {loading ? (
                <div className="flex justify-center p-12 text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mr-2 text-purple-600" />
                    <span>Memuat tagihan vendor...</span>
                </div>
            ) : invoices.length === 0 ? (
                <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#0f172a] text-slate-500 space-y-3 shadow-sm">
                    <Receipt className="w-10 h-10 mx-auto text-slate-400" />
                    <p className="font-semibold">Belum ada tagihan vendor terdaftar.</p>
                </div>
            ) : viewMode === 'table' ? (
                /* Table View */
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th onClick={() => handleSort('invoice_number')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group select-none">
                                        <span>No. Invoice Vendor</span>
                                        {renderSortIcon('invoice_number')}
                                    </th>
                                    <th onClick={() => handleSort('vendor.company_name')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group select-none">
                                        <span>Nama Vendor</span>
                                        {renderSortIcon('vendor.company_name')}
                                    </th>
                                    <th onClick={() => handleSort('project.name')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group select-none">
                                        <span>Proyek Terkait</span>
                                        {renderSortIcon('project.name')}
                                    </th>
                                    <th onClick={() => handleSort('invoice_date')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group select-none">
                                        <span>Tgl Invoice / Tempo</span>
                                        {renderSortIcon('invoice_date')}
                                    </th>
                                    <th onClick={() => handleSort('total_amount')} className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group select-none">
                                        <span>Total Tagihan</span>
                                        {renderSortIcon('total_amount')}
                                    </th>
                                    <th onClick={() => handleSort('status')} className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group select-none">
                                        <span>Status Pembayaran</span>
                                        {renderSortIcon('status')}
                                    </th>
                                    <th className="py-3 px-4 text-right pr-4">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                {currentInvoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                                            <div className="flex items-center space-x-1.5">
                                                <span>{inv.invoice_number}</span>
                                                {inv.proof_file_path && (
                                                    <a href={inv.proof_file_path} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-purple-500 inline-block" title="Lihat Berkas Tagihan">
                                                        <Download className="w-3.5 h-3.5 inline" />
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                                            <div className="flex items-center gap-1.5">
                                                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span>{inv.vendor?.company_name || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                                            {inv.project ? (
                                                <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800">
                                                    {inv.project.name}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 font-italic">Tidak ditautkan</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                                            <div>{inv.invoice_date}</div>
                                            {inv.due_date && <div className="text-[10px] text-slate-400">Jth Tempo: {inv.due_date}</div>}
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                                            Rp {Number(inv.total_amount).toLocaleString('id-ID')}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {getStatusBadge(inv.status)}
                                        </td>
                                        <td className="py-3 px-4 text-right pr-4">
                                            <div className="flex items-center justify-end space-x-2">
                                                {inv.status === 'UNPAID' ? (
                                                    <button
                                                        onClick={() => handleUpdateStatus(inv.id, 'PAID')}
                                                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow"
                                                    >
                                                        Tandai Lunas
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleUpdateStatus(inv.id, 'UNPAID')}
                                                        className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px]"
                                                    >
                                                        Set Unpaid
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(inv.id, inv.invoice_number)}
                                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 transition-colors"
                                                    title="Hapus Tagihan"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Grid Card View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentInvoices.map((inv) => (
                        <div
                            key={inv.id}
                            className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-purple-500/50 transition-all flex flex-col justify-between space-y-4"
                        >
                            <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 text-[10px] font-mono font-bold">
                                            {inv.invoice_number}
                                        </span>
                                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                                            <span>{inv.vendor?.company_name || '-'}</span>
                                        </h3>
                                    </div>
                                    <div>{getStatusBadge(inv.status)}</div>
                                </div>

                                <div className="space-y-2 text-slate-600 dark:text-slate-400 text-[11px]">
                                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
                                        <span className="text-slate-400">Total Tagihan:</span>
                                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                                            Rp {Number(inv.total_amount).toLocaleString('id-ID')}
                                        </span>
                                    </div>

                                    {inv.project && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400">Proyek:</span>
                                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                                {inv.project.name}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between text-slate-500 font-mono">
                                        <span>Tgl: {inv.invoice_date}</span>
                                        {inv.due_date && <span>Jth Tempo: {inv.due_date}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                                <div>
                                    {inv.proof_file_path && (
                                        <a
                                            href={inv.proof_file_path}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400 font-semibold flex items-center space-x-1 hover:underline"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>Lampiran</span>
                                        </a>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    {inv.status === 'UNPAID' ? (
                                        <button
                                            onClick={() => handleUpdateStatus(inv.id, 'PAID')}
                                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow"
                                        >
                                            Tandai Lunas
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleUpdateStatus(inv.id, 'UNPAID')}
                                            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px]"
                                        >
                                            Set Unpaid
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(inv.id, inv.invoice_number)}
                                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 transition-colors"
                                        title="Hapus Tagihan"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {!loading && totalInvoices > 0 && (
                <div className="p-3.5 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm text-xs">
                    <div className="flex items-center space-x-3 text-slate-500">
                        <span>
                            Menampilkan <strong className="text-slate-800 dark:text-slate-200">{currentInvoices.length}</strong> dari <strong className="text-slate-800 dark:text-slate-200">{totalInvoices}</strong> tagihan
                        </span>
                        <div className="flex items-center space-x-1">
                            <span>Per Halaman:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold focus:outline-none text-slate-800 dark:text-slate-200"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition font-semibold"
                        >
                            Sebelumnya
                        </button>

                        <div className="flex items-center space-x-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                                        currentPage === page
                                            ? 'bg-purple-600 text-white shadow-md'
                                            : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition font-semibold"
                        >
                            Selanjutnya
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
