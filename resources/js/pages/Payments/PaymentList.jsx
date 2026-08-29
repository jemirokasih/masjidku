import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { openPdfPreview } from '../../utils/pdfPreview';
import { useConfirm } from '../../context/ConfirmContext';
import {
    CreditCard,
    Plus,
    RefreshCw,
    Download,
    Edit3,
    Trash2,
    ChevronDown,
    FileText,
    CheckCircle2,
    Clock,
    Search,
    SlidersHorizontal,
    ChevronUp,
    Calendar,
    X,
    List,
    LayoutGrid,
    FileCheck,
    UploadCloud,
    AlertCircle
} from 'lucide-react';

export default function PaymentList() {
    const { confirm } = useConfirm();
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');
    const [showAdvanceFilter, setShowAdvanceFilter] = useState(false);
    const [viewMode, setViewMode] = useState('table'); // 'table' (default) | 'grid'

    const activeFilterCount = [
        startDateFilter,
        endDateFilter,
    ].filter(Boolean).length;

    const handleResetFilters = () => {
        setStartDateFilter('');
        setEndDateFilter('');
    };

    // Dropdown per-row (same pattern as QuoteList)
    const [activeDropdownId, setActiveDropdownId] = useState(null);
    const [dropUpMap, setDropUpMap] = useState({});

    const toggleDropdown = (e, pId) => {
        e.stopPropagation();
        if (activeDropdownId === pId) {
            setActiveDropdownId(null);
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            setDropUpMap(prev => ({ ...prev, [pId]: spaceBelow < 200 }));
            setActiveDropdownId(pId);
        }
    };

    const [selectedPaymentForProof, setSelectedPaymentForProof] = useState(null);
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

            await api.post(`/payments/${selectedPaymentForProof.id}/upload-proof`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setShowProofModal(false);
            setProofFile(null);
            setSelectedPaymentForProof(null);
            fetchData();
        } catch (err) {
            setProofError(err.response?.data?.message || 'Gagal mengunggah file bukti pembayaran.');
        } finally {
            setUploadingProof(false);
        }
    };

    const emptyForm = {
        invoice_id: '',
        payment_method_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        amount: 0,
        reference_number: '',
        notes: '',
    };
    const [form, setForm] = useState(emptyForm);

    const fetchData = async () => {
        setLoading(true);
        try {
            const payRes = await api.get('/payments', {
                params: {
                    search: searchTerm || undefined,
                    start_date: startDateFilter || undefined,
                    end_date: endDateFilter || undefined,
                }
            });
            setPayments(payRes.data.data || []);
        } catch (err) {
            console.error('Error fetching payments:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm, startDateFilter, endDateFilter]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleOutsideClick = () => setActiveDropdownId(null);
        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, []);

    const handleEdit = (payment) => {
        setActiveDropdownId(null);
        navigate(`/payments/${payment.id}/edit`);
    };

    const handleDelete = async (id) => {
        setActiveDropdownId(null);
        const ok = await confirm({
            title: 'Hapus Data Pembayaran',
            message: 'Yakin ingin menghapus data pembayaran ini? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/payments/${id}`);
            fetchData();
        } catch (err) {
            alert('Gagal menghapus pembayaran: ' + (err.response?.data?.message || err.message));
        }
    };

    const formatRp = (val) => 'Rp ' + new Intl.NumberFormat('id-ID').format(val ?? 0);
    const formatDate = (d) => {
        if (!d) return '-';
        return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
        });
    };

    // Metrics
    const totalAmount   = payments.reduce((s, p) => s + parseFloat(p.amount || 0), 0);
    const totalCount    = payments.length;
    const thisMonthPays = payments.filter(p => p.payment_date?.startsWith(new Date().toISOString().slice(0,7))).length;

    // Search filter
    const filtered = payments.filter(p => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
            p.payment_number?.toLowerCase().includes(q) ||
            p.invoice?.invoice_number?.toLowerCase().includes(q) ||
            p.invoice?.client?.company_name?.toLowerCase().includes(q) ||
            p.invoice?.client?.name?.toLowerCase().includes(q) ||
            p.reference_number?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="space-y-6">

            {/* ── Page Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <span>Riwayat Pembayaran &amp; Kwitansi</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Pencatatan uang masuk, metode transfer, &amp; cetak kwitansi PDF resmi.
                    </p>
                </div>
                <Link
                    id="btn-catat-pembayaran"
                    to="/payments/create"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 flex items-center space-x-1.5 transition-all self-start md:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Catat Pembayaran Baru</span>
                </Link>
            </div>

            {/* ── Metric Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Transaksi</p>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{totalCount}</h3>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Pembayaran Dicatat</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Diterima</p>
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono">{formatRp(totalAmount)}</h3>
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">Keseluruhan Uang Masuk</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Bulan Ini</p>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{thisMonthPays}</h3>
                        <p className="text-[10px] text-purple-600 dark:text-purple-400 font-medium mt-0.5">Transaksi Bulan Berjalan</p>
                    </div>
                </div>
            </div>

            {/* ── Search Bar & Filter ── */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari no. kwitansi, invoice, klien..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
                        />
                    </div>

                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
                        <button
                            type="button"
                            onClick={() => setShowAdvanceFilter(!showAdvanceFilter)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all border ${
                                showAdvanceFilter || activeFilterCount > 0
                                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 shadow-sm'
                                    : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                            }`}
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Filter Lanjutan</span>
                            {activeFilterCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">
                                    {activeFilterCount}
                                </span>
                            )}
                            {showAdvanceFilter ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        <button
                            type="button"
                            onClick={fetchData}
                            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            title="Refresh Data"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>

                        {/* View Mode Switcher */}
                        <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 space-x-0.5 ml-2">
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                                    viewMode === 'table'
                                        ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                                title="Tampilan Tabel (Default)"
                            >
                                <List className="w-3.5 h-3.5" />
                                <span>Tabel</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                                    viewMode === 'grid'
                                        ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                                title="Tampilan Kartu / Grid"
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                <span>Kartu</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Expandable Collapsible Filter Panel */}
                {showAdvanceFilter && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-1 gap-3 animate-in fade-in duration-200">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Periode Tanggal Pembayaran</label>
                                {activeFilterCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleResetFilters}
                                        className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-0.5"
                                    >
                                        <X className="w-3 h-3" />
                                        <span>Reset Filter</span>
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center space-x-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-600 dark:text-slate-300">
                                <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <input
                                    type="date"
                                    value={startDateFilter}
                                    onChange={(e) => setStartDateFilter(e.target.value)}
                                    className="bg-transparent border-0 focus:outline-none font-semibold text-slate-800 dark:text-slate-200 p-0 text-xs w-full cursor-pointer"
                                    title="Tanggal Mulai Pembayaran"
                                />
                                <span className="text-slate-400 shrink-0">s/d</span>
                                <input
                                    type="date"
                                    value={endDateFilter}
                                    onChange={(e) => setEndDateFilter(e.target.value)}
                                    className="bg-transparent border-0 focus:outline-none font-semibold text-slate-800 dark:text-slate-200 p-0 text-xs w-full cursor-pointer"
                                    title="Tanggal Selesai Pembayaran"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Data Table ── */}
            {loading ? (
                <div className="flex justify-center p-12 text-xs text-slate-500 dark:text-slate-400">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2 text-emerald-600 dark:text-emerald-400" />
                    <span>Memuat data pembayaran...</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 bg-white dark:bg-[#0f172a]">
                    {searchTerm ? `Tidak ada hasil untuk "${searchTerm}"` : 'Belum ada pencatatan transaksi pembayaran.'}
                </div>
            ) : viewMode === 'table' ? (
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                <th className="py-3 px-4">No. Kwitansi</th>
                                <th className="py-3 px-4">Ref. Invoice</th>
                                <th className="py-3 px-4">Klien</th>
                                <th className="py-3 px-4">Tgl Bayar</th>
                                <th className="py-3 px-4">Metode</th>
                                <th className="py-3 px-4">Jumlah Diterima</th>
                                <th className="py-3 px-4">No. Referensi</th>
                                <th className="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                            {filtered.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="py-3.5 px-4 font-mono font-bold">
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/payments/${p.id}`)}
                                            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 hover:underline text-left font-mono font-bold cursor-pointer"
                                            title="Klik untuk lihat detail kwitansi pembayaran"
                                        >
                                            {p.payment_number}
                                        </button>
                                    </td>
                                    <td className="py-3.5 px-4 font-mono text-indigo-600 dark:text-indigo-400">
                                        {p.invoice?.invoice_number || '-'}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                                            {p.invoice?.client?.company_name || p.invoice?.client?.name || '-'}
                                        </div>
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                                        {formatDate(p.payment_date)}
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                                        {p.payment_method?.name || p.paymentMethod?.name || '-'}
                                    </td>
                                    <td className="py-3.5 px-4 font-extrabold text-emerald-600 dark:text-emerald-300 font-mono">
                                        {formatRp(p.amount)}
                                    </td>
                                    <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                                        <div>{p.reference_number || '-'}</div>
                                        <div className="mt-1">
                                            {p.proof_file_url ? (
                                                <a
                                                    href={p.proof_file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-[9px] text-purple-600 dark:text-purple-400 font-extrabold bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800 hover:underline"
                                                    title="Lihat / Unduh File Scan Bukti Pembayaran / Kwitansi TTD"
                                                >
                                                    <FileCheck className="w-3 h-3" /> Scan Bukti Ada
                                                </a>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedPaymentForProof(p);
                                                        setShowProofModal(true);
                                                        setProofError(null);
                                                    }}
                                                    className="inline-flex items-center gap-1 text-[9px] text-amber-600 dark:text-amber-400 font-extrabold bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 hover:bg-amber-100"
                                                    title="Upload Scan Bukti Pembayaran / Kwitansi TTD"
                                                >
                                                    <UploadCloud className="w-3 h-3" /> Upload Scan
                                                </button>
                                            )}
                                        </div>
                                    </td>

                                    {/* ── Action Dropdown (same pattern as QuoteList) ── */}
                                    <td className="py-3.5 px-4 text-right relative">
                                        <button
                                            type="button"
                                            onClick={(e) => toggleDropdown(e, p.id)}
                                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs inline-flex items-center space-x-1.5 shadow-sm transition-all"
                                        >
                                            <span>Opsi Aksi</span>
                                            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${activeDropdownId === p.id ? 'rotate-180' : ''}`} />
                                        </button>

                                        {activeDropdownId === p.id && (
                                            <div
                                                className={`absolute right-4 ${dropUpMap[p.id] ? 'bottom-full mb-1' : 'top-full mt-1'} z-[999] w-64 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden py-1 text-left`}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                    {/* View Detail */}
                                                    <button
                                                        type="button"
                                                        onClick={() => { setActiveDropdownId(null); navigate(`/payments/${p.id}`); }}
                                                        className="w-full px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-2 transition-colors text-left"
                                                    >
                                                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                                        <span>Lihat Detail Kwitansi</span>
                                                    </button>

                                                    {/* ── Download PDF (Default Template) ── */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActiveDropdownId(null);
                                                            openPdfPreview(`/payments/${p.id}/receipt`);
                                                        }}
                                                        className="w-full px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-2 transition-colors text-left"
                                                    >
                                                        <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                        <span>Preview &amp; Cetak Kwitansi</span>
                                                    </button>

                                                    {/* Upload Scan Bukti TTD */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActiveDropdownId(null);
                                                            setSelectedPaymentForProof(p);
                                                            setShowProofModal(true);
                                                            setProofError(null);
                                                        }}
                                                        className="w-full px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-2 transition-colors text-left"
                                                    >
                                                        <UploadCloud className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                                                        <span>Upload Scan Bukti TTD</span>
                                                    </button>

                                                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                                                {/* Edit */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(p)}
                                                    className="w-full px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-2 transition-colors text-left"
                                                >
                                                    <Edit3 className="w-4 h-4 text-slate-500 shrink-0" />
                                                    <span>Edit Pembayaran</span>
                                                </button>

                                                {/* Delete */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(p.id)}
                                                    className="w-full px-3.5 py-2 hover:bg-rose-500/10 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center space-x-2 transition-colors text-left"
                                                >
                                                    <Trash2 className="w-4 h-4 shrink-0" />
                                                    <span>Hapus Pembayaran</span>
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* CARD / GRID VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((p) => (
                        <div key={p.id} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4 shadow-sm flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                                            {p.payment_number}
                                        </span>
                                        {p.invoice?.invoice_number && (
                                            <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">Inv: {p.invoice.invoice_number}</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{p.invoice?.client?.company_name || p.invoice?.client?.name || '-'}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tgl: {formatDate(p.payment_date)} &bull; Metode: {p.payment_method?.name || p.paymentMethod?.name || '-'}</p>
                                </div>

                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-500">Jumlah Bayar:</span>
                                    <span className="text-sm font-extrabold font-mono text-emerald-600 dark:text-emerald-300">
                                        {formatRp(p.amount)}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/payments/${p.id}`)}
                                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Detail Kwitansi</span>
                                </button>

                                <div className="flex items-center space-x-1.5">
                                    <button
                                        type="button"
                                        onClick={() => openPdfPreview(`/payments/${p.id}/receipt`)}
                                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                        title="Preview &amp; Cetak PDF Kwitansi"
                                    >
                                        <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleEdit(p)}
                                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                        title="Edit Pembayaran"
                                    >
                                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(p.id)}
                                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                                        title="Hapus Pembayaran"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Upload Bukti Pembayaran / Kwitansi TTD */}
            {showProofModal && selectedPaymentForProof && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4 relative">
                        <button
                            onClick={() => {
                                setShowProofModal(false);
                                setProofFile(null);
                                setSelectedPaymentForProof(null);
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
                                    No. Kwitansi: <strong>{selectedPaymentForProof.payment_number}</strong>
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
                                        setSelectedPaymentForProof(null);
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
