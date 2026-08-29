import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useConfirm } from '../../context/ConfirmContext';
import {
    FileText,
    Plus,
    Search,
    RefreshCw,
    Edit3,
    Trash2,
    X,
    Save,
    Building2,
    FolderKanban,
    Calendar,
    Download,
    CheckCircle2,
    Clock,
    XCircle,
    Receipt,
    List,
    LayoutGrid,
    ArrowUpDown,
    ArrowUp,
    ArrowDown
} from 'lucide-react';

export default function VendorQuoteList() {
    const { confirm } = useConfirm();
    const [quotes, setQuotes] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem('mbs_vendor_quote_view_mode') || 'table';
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [form, setForm] = useState({
        quote_number: '',
        vendor_id: '',
        project_id: '',
        quote_date: new Date().toISOString().split('T')[0],
        valid_until: '',
        total_amount: 0,
        status: 'RECEIVED',
        notes: '',
        quote_file: null,
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [qRes, vRes, pRes] = await Promise.all([
                api.get('/vendor-quotes', { params: { search, status: statusFilter } }),
                api.get('/vendors'),
                api.get('/projects'),
            ]);
            setQuotes(qRes.data.data || []);
            setVendors(vRes.data.data || []);
            setProjects(pRes.data.data || []);
        } catch (err) {
            console.error('Gagal memuat penawaran vendor:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        fetchData();
    }, [search, statusFilter]);

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        localStorage.setItem('mbs_vendor_quote_view_mode', mode);
    };

    const openCreateModal = () => {
        setEditingId(null);
        setForm({
            quote_number: '',
            vendor_id: vendors[0]?.id || '',
            project_id: '',
            quote_date: new Date().toISOString().split('T')[0],
            valid_until: '',
            total_amount: 0,
            status: 'RECEIVED',
            notes: '',
            quote_file: null,
        });
        setShowModal(true);
    };

    const openEditModal = (q) => {
        setEditingId(q.id);
        setForm({
            quote_number: q.quote_number || '',
            vendor_id: q.vendor_id || '',
            project_id: q.project_id || '',
            quote_date: q.quote_date || '',
            valid_until: q.valid_until || '',
            total_amount: q.total_amount || 0,
            status: q.status || 'RECEIVED',
            notes: q.notes || '',
            quote_file: null,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.quote_number || !form.vendor_id) {
            alert('No. Penawaran & Vendor wajib diisi!');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('quote_number', form.quote_number);
            formData.append('vendor_id', form.vendor_id);
            if (form.project_id) formData.append('project_id', form.project_id);
            formData.append('quote_date', form.quote_date);
            if (form.valid_until) formData.append('valid_until', form.valid_until);
            formData.append('total_amount', form.total_amount);
            formData.append('status', form.status);
            if (form.notes) formData.append('notes', form.notes);
            if (form.quote_file) formData.append('quote_file', form.quote_file);

            if (editingId) {
                formData.append('_method', 'PUT');
                await api.post(`/vendor-quotes/${editingId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/vendor-quotes', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            setShowModal(false);
            fetchData();
        } catch (err) {
            alert('Gagal menyimpan penawaran vendor: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, num) => {
        const ok = await confirm({
            title: 'Hapus Penawaran Vendor',
            message: `Apakah Anda yakin ingin menghapus penawaran ${num}?`,
            confirmText: 'Ya, Hapus',
            type: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/vendor-quotes/${id}`);
            fetchData();
        } catch (err) {
            alert('Gagal menghapus penawaran: ' + (err.response?.data?.message || err.message));
        }
    };

    const getStatusBadge = (st) => {
        switch (st) {
            case 'ACCEPTED':
            case 'APPROVED':
                return <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 font-extrabold text-[10px]">DISETUJUI (ACCEPTED)</span>;
            case 'REJECTED':
                return <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 font-extrabold text-[10px]">DITOLAK (REJECTED)</span>;
            case 'RECEIVED':
            default:
                return <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 font-extrabold text-[10px]">DITERIMA (RECEIVED)</span>;
        }
    };

    const [sortConfig, setSortConfig] = useState({ key: 'quote_number', direction: 'asc' });

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
            <ArrowUp className="w-3 h-3 text-blue-600 dark:text-blue-400 inline ml-1" />
        ) : (
            <ArrowDown className="w-3 h-3 text-blue-600 dark:text-blue-400 inline ml-1" />
        );
    };

    const sortedQuotes = React.useMemo(() => {
        if (!sortConfig.key) return quotes;
        return [...quotes].sort((a, b) => {
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
    }, [quotes, sortConfig]);

    const approvedCount = quotes.filter(q => q.status === 'ACCEPTED' || q.status === 'APPROVED').length;
    const totalAmountSum = quotes.reduce((acc, q) => acc + (parseFloat(q.total_amount) || 0), 0);

    const totalQuotes = sortedQuotes.length;
    const totalPages = Math.ceil(totalQuotes / itemsPerPage) || 1;
    const currentQuotes = sortedQuotes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-6 text-xs animate-in fade-in duration-150">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                            Penawaran Vendor (Quote In / PO)
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Catat berkas penawaran harga dari vendor/supplier dan tautkan langsung ke Proyek.
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={fetchData}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={openCreateModal}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all text-xs"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Catat Penawaran Baru</span>
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Penawaran</p>
                        <p className="text-xl font-black text-slate-900 dark:text-slate-100">{quotes.length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Nilai Penawaran</p>
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
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Disetujui (Approved)</p>
                        <p className="text-xl font-black text-slate-900 dark:text-slate-100">
                            {approvedCount}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter Search & Status */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
                <div className="relative flex-1 max-w-md w-full">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari no penawaran atau nama vendor..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                    />
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none text-slate-800 dark:text-slate-200"
                    >
                        <option value="">Semua Status</option>
                        <option value="RECEIVED">DITERIMA (RECEIVED)</option>
                        <option value="ACCEPTED">DISETUJUI (ACCEPTED)</option>
                        <option value="REJECTED">DITOLAK (REJECTED)</option>
                    </select>

                    <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => handleViewModeChange('table')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                                viewMode === 'table'
                                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
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
                                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
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
                    <RefreshCw className="w-5 h-5 animate-spin mr-2 text-blue-600" />
                    <span>Memuat penawaran vendor...</span>
                </div>
            ) : quotes.length === 0 ? (
                <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#0f172a] text-slate-500 space-y-3 shadow-sm">
                    <FileText className="w-10 h-10 mx-auto text-slate-400" />
                    <p className="font-semibold">Belum ada berkas penawaran vendor terdaftar.</p>
                </div>
            ) : viewMode === 'table' ? (
                /* Table View */
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th onClick={() => handleSort('quote_number')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group select-none">
                                        <span>No. Penawaran</span>
                                        {renderSortIcon('quote_number')}
                                    </th>
                                    <th onClick={() => handleSort('vendor.company_name')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group select-none">
                                        <span>Nama Vendor</span>
                                        {renderSortIcon('vendor.company_name')}
                                    </th>
                                    <th onClick={() => handleSort('project.name')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group select-none">
                                        <span>Proyek Terkait</span>
                                        {renderSortIcon('project.name')}
                                    </th>
                                    <th onClick={() => handleSort('quote_date')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group select-none">
                                        <span>Tanggal / Masa Berlaku</span>
                                        {renderSortIcon('quote_date')}
                                    </th>
                                    <th onClick={() => handleSort('total_amount')} className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group select-none">
                                        <span>Total Nilai</span>
                                        {renderSortIcon('total_amount')}
                                    </th>
                                    <th onClick={() => handleSort('status')} className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group select-none">
                                        <span>Status</span>
                                        {renderSortIcon('status')}
                                    </th>
                                    <th className="py-3 px-4 text-right pr-4">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                {currentQuotes.map((q) => (
                                    <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                                            <div className="flex items-center space-x-1.5">
                                                <span>{q.quote_number}</span>
                                                {q.file_path && (
                                                    <a href={q.file_path} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-500 inline-block" title="Unduh Berkas PDF/Gambar">
                                                        <Download className="w-3.5 h-3.5 inline" />
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                                            <div className="flex items-center gap-1.5">
                                                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span>{q.vendor?.company_name || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                                            {q.project ? (
                                                <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800">
                                                    {q.project.name}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 font-italic">Tidak ditautkan</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                                            <div>{q.quote_date}</div>
                                            {q.valid_until && <div className="text-[10px] text-slate-400">s/d {q.valid_until}</div>}
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                                            Rp {Number(q.total_amount).toLocaleString('id-ID')}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {getStatusBadge(q.status)}
                                        </td>
                                        <td className="py-3 px-4 text-right pr-4">
                                            <div className="flex items-center justify-end space-x-1">
                                                <button
                                                    onClick={() => openEditModal(q)}
                                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 transition-colors"
                                                    title="Edit Penawaran"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(q.id, q.quote_number)}
                                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 transition-colors"
                                                    title="Hapus Penawaran"
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
                    {currentQuotes.map((q) => (
                        <div
                            key={q.id}
                            className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-4"
                        >
                            <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-bold">
                                            {q.quote_number}
                                        </span>
                                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                                            <span>{q.vendor?.company_name || '-'}</span>
                                        </h3>
                                    </div>
                                    <div>{getStatusBadge(q.status)}</div>
                                </div>

                                <div className="space-y-2 text-slate-600 dark:text-slate-400 text-[11px]">
                                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
                                        <span className="text-slate-400">Nilai Penawaran:</span>
                                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                                            Rp {Number(q.total_amount).toLocaleString('id-ID')}
                                        </span>
                                    </div>

                                    {q.project && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400">Proyek:</span>
                                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                                {q.project.name}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between text-slate-500 font-mono">
                                        <span>Tgl: {q.quote_date}</span>
                                        {q.valid_until && <span>Valid s/d: {q.valid_until}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                                <div>
                                    {q.file_path && (
                                        <a
                                            href={q.file_path}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold flex items-center space-x-1 hover:underline"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>Lampiran</span>
                                        </a>
                                    )}
                                </div>
                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => openEditModal(q)}
                                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 transition-colors"
                                        title="Edit Penawaran"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(q.id, q.quote_number)}
                                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 transition-colors"
                                        title="Hapus Penawaran"
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
            {!loading && totalQuotes > 0 && (
                <div className="p-3.5 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm text-xs">
                    <div className="flex items-center space-x-3 text-slate-500">
                        <span>
                            Menampilkan <strong className="text-slate-800 dark:text-slate-200">{currentQuotes.length}</strong> dari <strong className="text-slate-800 dark:text-slate-200">{totalQuotes}</strong> penawaran
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
                                            ? 'bg-blue-600 text-white shadow-md'
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

            {/* Modal Form Quote In */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                {editingId ? 'Edit Penawaran Vendor' : 'Catat Penawaran Vendor Baru'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                <X className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300">Pilih Vendor *</label>
                                    <select
                                        required
                                        value={form.vendor_id}
                                        onChange={(e) => setForm({ ...form, vendor_id: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                                    >
                                        <option value="">-- Pilih Vendor --</option>
                                        {vendors.map((v) => (
                                            <option key={v.id} value={v.id}>{v.company_name} ({v.code})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300">No. Penawaran Vendor *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: QUO-VND/2026/001"
                                        value={form.quote_number}
                                        onChange={(e) => setForm({ ...form, quote_number: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block font-semibold text-slate-700 dark:text-slate-300">Tautkan ke Proyek (Opsional)</label>
                                <select
                                    value={form.project_id}
                                    onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                                >
                                    <option value="">-- Tidak Ditautkan ke Proyek --</option>
                                    {projects.map((p) => (
                                        <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300">Tanggal Penawaran *</label>
                                    <input
                                        type="date"
                                        required
                                        value={form.quote_date}
                                        onChange={(e) => setForm({ ...form, quote_date: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300">Berlaku Sampai</label>
                                    <input
                                        type="date"
                                        value={form.valid_until}
                                        onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300">Total Nilai Penawaran (Rp) *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        placeholder="0"
                                        value={form.total_amount}
                                        onChange={(e) => setForm({ ...form, total_amount: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300">Status Penawaran</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                                    >
                                        <option value="RECEIVED">DITERIMA (RECEIVED)</option>
                                        <option value="ACCEPTED">DISETUJUI (ACCEPTED)</option>
                                        <option value="REJECTED">DITOLAK (REJECTED)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block font-semibold text-slate-700 dark:text-slate-300">Unggah File Penawaran (PDF/Gambar)</label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setForm({ ...form, quote_file: e.target.files[0] })}
                                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-900 dark:text-slate-100"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block font-semibold text-slate-700 dark:text-slate-300">Catatan Tambahan</label>
                                <textarea
                                    rows="2"
                                    placeholder="Rincian / syarat & ketentuan penawaran..."
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                                ></textarea>
                            </div>

                            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md flex items-center space-x-1.5 disabled:opacity-50"
                                >
                                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    <span>Simpan Penawaran</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
