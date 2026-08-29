import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useConfirm } from '../../context/ConfirmContext';
import {
    Building2,
    Plus,
    Search,
    RefreshCw,
    Edit3,
    Trash2,
    X,
    Save,
    Phone,
    Mail,
    MapPin,
    CreditCard,
    FileText,
    Receipt,
    CheckCircle2,
    XCircle,
    List,
    LayoutGrid,
    ArrowUpDown,
    ArrowUp,
    ArrowDown
} from 'lucide-react';

const emptyForm = {
    company_name: '',
    code: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    tax_number: '',
    bank_name: '',
    bank_account_number: '',
    bank_account_name: '',
    notes: '',
    is_active: true,
};

export default function VendorList() {
    const { confirm } = useConfirm();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem('mbs_vendor_view_mode') || 'table';
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchVendors = async () => {
        setLoading(true);
        try {
            const res = await api.get('/vendors', { params: { search } });
            setVendors(res.data.data || []);
        } catch (err) {
            console.error('Gagal memuat vendor:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        fetchVendors();
    }, [search]);

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        localStorage.setItem('mbs_vendor_view_mode', mode);
    };

    const openCreateModal = () => {
        setEditingId(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEditModal = (v) => {
        setEditingId(v.id);
        setForm({
            company_name: v.company_name || '',
            code: v.code || '',
            contact_person: v.contact_person || '',
            email: v.email || '',
            phone: v.phone || '',
            address: v.address || '',
            tax_number: v.tax_number || '',
            bank_name: v.bank_name || '',
            bank_account_number: v.bank_account_number || '',
            bank_account_name: v.bank_account_name || '',
            notes: v.notes || '',
            is_active: v.is_active ?? true,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.company_name) {
            alert('Nama Perusahaan Vendor wajib diisi!');
            return;
        }
        setSubmitting(true);
        try {
            if (editingId) {
                await api.put(`/vendors/${editingId}`, form);
            } else {
                await api.post('/vendors', form);
            }
            setShowModal(false);
            fetchVendors();
        } catch (err) {
            alert('Gagal menyimpan vendor: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, name) => {
        const ok = await confirm({
            title: 'Hapus Vendor',
            message: `Apakah Anda yakin ingin menghapus data vendor ${name}? Seluruh riwayat pengadaan terkait mungkin ikut terhapus.`,
            confirmText: 'Ya, Hapus',
            type: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/vendors/${id}`);
            fetchVendors();
        } catch (err) {
            alert('Gagal menghapus vendor: ' + (err.response?.data?.message || err.message));
        }
    };

    const [sortConfig, setSortConfig] = useState({ key: 'company_name', direction: 'asc' });

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

    const sortedVendors = React.useMemo(() => {
        if (!sortConfig.key) return vendors;
        return [...vendors].sort((a, b) => {
            let aVal = a;
            let bVal = b;
            const keys = sortConfig.key.split('.');
            for (const k of keys) {
                aVal = aVal?.[k];
                bVal = bVal?.[k];
            }

            if (aVal == null) return 1;
            if (bVal == null) return -1;

            if (typeof aVal === 'boolean') {
                return sortConfig.direction === 'asc' ? (aVal === bVal ? 0 : aVal ? -1 : 1) : (aVal === bVal ? 0 : aVal ? 1 : -1);
            }

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
            }

            const strA = String(aVal).toLowerCase();
            const strB = String(bVal).toLowerCase();
            if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [vendors, sortConfig]);

    const totalVendors = sortedVendors.length;
    const totalPages = Math.ceil(totalVendors / itemsPerPage) || 1;
    const currentVendors = sortedVendors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-6 text-xs animate-in fade-in duration-150">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                            Master Vendor (Mitra Supplier / Penyedia Service)
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Kelola data mitra penyedia jasa/barang, informasi rekening pembayaran, dan kontak person (PIC).
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={fetchVendors}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={openCreateModal}
                        className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-500/20 flex items-center space-x-1.5 transition-all text-xs"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Vendor Baru</span>
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Vendor</p>
                        <p className="text-xl font-black text-slate-900 dark:text-slate-100">{vendors.length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Vendor Aktif</p>
                        <p className="text-xl font-black text-slate-900 dark:text-slate-100">
                            {vendors.filter(v => v.is_active).length}
                        </p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
                        <XCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Vendor Non-Aktif</p>
                        <p className="text-xl font-black text-slate-900 dark:text-slate-100">
                            {vendors.filter(v => !v.is_active).length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter & View Mode Switcher */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
                <div className="relative flex-1 max-w-md w-full">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari kode vendor, nama perusahaan, email, atau PIC..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 text-slate-900 dark:text-slate-100"
                    />
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
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

            {/* List Content */}
            {loading ? (
                <div className="flex justify-center p-12 text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mr-2 text-blue-600" />
                    <span>Memuat data vendor...</span>
                </div>
            ) : vendors.length === 0 ? (
                <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#0f172a] text-slate-500 space-y-3 shadow-sm">
                    <Building2 className="w-10 h-10 mx-auto text-slate-400" />
                    <p className="font-semibold">Belum ada data vendor terdaftar.</p>
                </div>
            ) : viewMode === 'table' ? (
                /* Table view matching client list */
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                    <th onClick={() => handleSort('code')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group select-none">
                                        <span>Kode</span>
                                        {renderSortIcon('code')}
                                    </th>
                                    <th onClick={() => handleSort('company_name')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group select-none">
                                        <span>Nama Perusahaan Vendor</span>
                                        {renderSortIcon('company_name')}
                                    </th>
                                    <th onClick={() => handleSort('contact_person')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group select-none">
                                        <span>PIC / Kontak</span>
                                        {renderSortIcon('contact_person')}
                                    </th>
                                    <th className="py-3 px-4">Informasi Rekening</th>
                                    <th onClick={() => handleSort('is_active')} className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group select-none">
                                        <span>Status</span>
                                        {renderSortIcon('is_active')}
                                    </th>
                                    <th className="py-3 px-4 text-right pr-4">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                {currentVendors.map((v) => (
                                    <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                                            {v.code || '-'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span>{v.company_name}</span>
                                            </div>
                                            {v.address && <div className="text-[10px] text-slate-500 mt-0.5">{v.address}</div>}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-semibold text-slate-800 dark:text-slate-200">{v.contact_person || '-'}</div>
                                            <div className="text-[10px] text-slate-500 space-y-0.5 mt-0.5">
                                                {v.email && <div>{v.email}</div>}
                                                {v.phone && <div>{v.phone}</div>}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                                            {v.bank_account_number ? (
                                                <div>
                                                    <div className="font-bold text-slate-800 dark:text-slate-200">{v.bank_name}</div>
                                                    <div>{v.bank_account_number} (a/n {v.bank_account_name || '-'})</div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 font-italic">Belum diatur</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                                v.is_active
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                    : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400'
                                            }`}>
                                                {v.is_active ? 'Aktif' : 'Non-Aktif'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right pr-4">
                                            <div className="flex items-center justify-end space-x-1">
                                                <button
                                                    onClick={() => openEditModal(v)}
                                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 transition-colors"
                                                    title="Edit Vendor"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(v.id, v.company_name)}
                                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 transition-colors"
                                                    title="Hapus Vendor"
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
                /* Grid cards view */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentVendors.map((v) => (
                        <div
                            key={v.id}
                            className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-4"
                        >
                            <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-mono font-bold">
                                            {v.code}
                                        </span>
                                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{v.company_name}</h3>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                        v.is_active
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                                            : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400'
                                    }`}>
                                        {v.is_active ? 'Aktif' : 'Non-Aktif'}
                                    </span>
                                </div>

                                <div className="space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
                                    {v.contact_person && (
                                        <div className="flex items-center space-x-2">
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">PIC: {v.contact_person}</span>
                                        </div>
                                    )}
                                    {v.phone && (
                                        <div className="flex items-center space-x-2">
                                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{v.phone}</span>
                                        </div>
                                    )}
                                    {v.email && (
                                        <div className="flex items-center space-x-2">
                                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{v.email}</span>
                                        </div>
                                    )}
                                    {v.bank_account_number && (
                                        <div className="flex items-center space-x-2 pt-1 border-t border-slate-100 dark:border-slate-800/80 font-mono">
                                            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{v.bank_name} - {v.bank_account_number} (a/n {v.bank_account_name || '-'})</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                                <div className="flex space-x-3 font-mono">
                                    <span>Quotes: <strong className="text-slate-700 dark:text-slate-300">{v.quotes_count || 0}</strong></span>
                                    <span>Invoices: <strong className="text-slate-700 dark:text-slate-300">{v.invoices_count || 0}</strong></span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => openEditModal(v)}
                                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 transition-colors"
                                        title="Edit Vendor"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(v.id, v.company_name)}
                                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 transition-colors"
                                        title="Hapus Vendor"
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
            {!loading && totalVendors > 0 && (
                <div className="p-3.5 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm text-xs">
                    <div className="flex items-center space-x-3 text-slate-500">
                        <span>
                            Menampilkan <strong className="text-slate-800 dark:text-slate-200">{currentVendors.length}</strong> dari <strong className="text-slate-800 dark:text-slate-200">{totalVendors}</strong> vendor
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

            {/* Modal Form Vendor */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                {editingId ? 'Edit Data Vendor' : 'Tambah Vendor Baru'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                <X className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2 space-y-1">
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300">Nama Perusahaan Vendor *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: PT Hardware Perdana"
                                        value={form.company_name}
                                        onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300">Kode Vendor (Opsional)</label>
                                    <input
                                        type="text"
                                        placeholder="Auto: VND-0001"
                                        value={form.code}
                                        onChange={(e) => setForm({ ...form, code: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300">PIC / Penanggung Jawab</label>
                                    <input
                                        type="text"
                                        placeholder="Nama PIC"
                                        value={form.contact_person}
                                        onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300">Email Perusahaan</label>
                                    <input
                                        type="email"
                                        placeholder="vendor@email.com"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300">No. Telepon / HP</label>
                                    <input
                                        type="text"
                                        placeholder="0812345xxxxx"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                                    />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300">Alamat Lengkap</label>
                                    <textarea
                                        rows="2"
                                        placeholder="Alamat kantor vendor"
                                        value={form.address}
                                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                                    />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300">NPWP / No. Wajib Pajak (Opsional)</label>
                                    <input
                                        type="text"
                                        placeholder="00.000.000.0-000.000"
                                        value={form.tax_number}
                                        onChange={(e) => setForm({ ...form, tax_number: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                                    />
                                </div>

                                <div className="col-span-2 py-1 border-t border-slate-150 dark:border-slate-800 mt-2">
                                    <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Informasi Rekening Pembayaran</h4>
                                </div>

                                <div className="space-y-1">
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300">Nama Bank</label>
                                    <input
                                        type="text"
                                        placeholder="BCA, Mandiri, dll."
                                        value={form.bank_name}
                                        onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300">No. Rekening</label>
                                    <input
                                        type="text"
                                        placeholder="Nomor rekening"
                                        value={form.bank_account_number}
                                        onChange={(e) => setForm({ ...form, bank_account_number: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                                    />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300">Atas Nama Rekening (a/n)</label>
                                    <input
                                        type="text"
                                        placeholder="Nama pemilik rekening"
                                        value={form.bank_account_name}
                                        onChange={(e) => setForm({ ...form, bank_account_name: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                                    />
                                </div>

                                <div className="col-span-2 space-y-1">
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300">Catatan Internal</label>
                                    <textarea
                                        rows="2"
                                        placeholder="Catatan tambahan vendor..."
                                        value={form.notes}
                                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                                    />
                                </div>

                                <div className="col-span-2 flex items-center space-x-2 py-1">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={form.is_active}
                                        onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                        className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="is_active" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                                        Vendor ini aktif dan siap digunakan dalam transaksi.
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors font-bold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-blue-500/20"
                                >
                                    {submitting && <RefreshCw className="w-3 h-3 animate-spin" />}
                                    <Save className="w-4 h-4" />
                                    <span>{editingId ? 'Simpan Perubahan' : 'Daftarkan Vendor'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
