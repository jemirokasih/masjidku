import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { openPdfPreview } from '../../utils/pdfPreview';
import { useConfirm } from '../../context/ConfirmContext';
import SearchableSelect from '../../components/SearchableSelect';
import {
    FileText,
    Plus,
    Printer,
    Trash2,
    Search,
    RefreshCw,
    ExternalLink,
    Edit3,
    ChevronDown,
    Mail,
    Download,
    Send,
    X,
    List,
    LayoutGrid,
    CheckCircle2,
    Clock,
    AlertTriangle,
    CreditCard,
    SlidersHorizontal,
    ChevronUp,
    Calendar,
    FileCheck,
    UploadCloud,
    AlertCircle
} from 'lucide-react';

export default function InvoiceList() {
    const { confirm, showAlert } = useConfirm();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');
    const [showAdvanceFilter, setShowAdvanceFilter] = useState(false);
    const [viewMode, setViewMode] = useState('table'); // 'table' (default) | 'grid'

    const activeFilterCount = [
        statusFilter,
        startDateFilter,
        endDateFilter,
    ].filter(Boolean).length;

    const handleResetFilters = () => {
        setStatusFilter('');
        setStartDateFilter('');
        setEndDateFilter('');
    };

    // Dropdown state per row ID & smart direction map
    const [activeDropdownId, setActiveDropdownId] = useState(null);
    const [dropUpMap, setDropUpMap] = useState({});

    // Email Modal State
    const [selectedInvoiceForEmail, setSelectedInvoiceForEmail] = useState(null);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);

    // Upload Signed Scan Modal State
    const [showSignedModal, setShowSignedModal] = useState(false);
    const [selectedInvoiceForSigned, setSelectedInvoiceForSigned] = useState(null);
    const [signedFile, setSignedFile] = useState(null);
    const [uploadingSigned, setUploadingSigned] = useState(false);
    const [signedError, setSignedError] = useState(null);

    const handleOpenSignedModal = (invoice) => {
        setSelectedInvoiceForSigned(invoice);
        setSignedFile(null);
        setSignedError(null);
        setShowSignedModal(true);
    };

    const handleUploadSignedSubmit = async (e) => {
        e.preventDefault();
        if (!signedFile) {
            setSignedError('Silakan pilih file scan invoice ber-TTD fisik terlebih dahulu.');
            return;
        }
        try {
            setUploadingSigned(true);
            setSignedError(null);

            const formData = new FormData();
            formData.append('signed_file', signedFile);

            await api.post(`/invoices/${selectedInvoiceForSigned.id}/upload-signed-scan`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setShowSignedModal(false);
            setSelectedInvoiceForSigned(null);
            setSignedFile(null);
            fetchData();
        } catch (err) {
            setSignedError(err.response?.data?.message || 'Gagal mengunggah berkas scan invoice.');
        } finally {
            setUploadingSigned(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/invoices', {
                params: {
                    search: searchTerm || undefined,
                    status: statusFilter || undefined,
                    start_date: startDateFilter || undefined,
                    end_date: endDateFilter || undefined,
                }
            });
            setInvoices(res.data.data || []);
        } catch (err) {
            console.error('Error fetching invoices:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleOutsideClick = () => setActiveDropdownId(null);
        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm, statusFilter, startDateFilter, endDateFilter]);

    const toggleDropdown = (e, invId) => {
        e.stopPropagation();
        if (activeDropdownId === invId) {
            setActiveDropdownId(null);
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            setDropUpMap(prev => ({ ...prev, [invId]: spaceBelow < 280 }));
            setActiveDropdownId(invId);
        }
    };

    const handleOpenEmailModal = (invoice) => {
        setSelectedInvoiceForEmail(invoice);
        setRecipientEmail(invoice.client?.email || '');
        setEmailMessage(`Halo ${invoice.client?.company_name || invoice.client?.name || 'Klien'},\n\nTerlampir dokumen Tagihan Invoice resmi (#${invoice.invoice_number}) dari kami. Silakan periksa rincian pembayaran terlampir.\n\nTerima kasih.`);
    };

    const handleSendEmailSubmit = async (e) => {
        e.preventDefault();
        if (!selectedInvoiceForEmail) return;

        setSendingEmail(true);
        try {
            const res = await api.post(`/invoices/${selectedInvoiceForEmail.id}/send-email`, {
                recipient_email: recipientEmail,
                message_text: emailMessage,
            });
            showAlert({ title: 'Berhasil', message: res.data.message || 'Email invoice berhasil dikirim!', variant: 'success' });
            setSelectedInvoiceForEmail(null);
            fetchData();
        } catch (err) {
            showAlert({ title: 'Gagal', message: 'Gagal mengirim email invoice: ' + (err.response?.data?.message || err.message), variant: 'danger' });
        } finally {
            setSendingEmail(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm({
            title: 'Hapus Tagihan Invoice?',
            message: 'Apakah Anda yakin ingin menghapus tagihan invoice ini? Action ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Hapus Invoice',
            cancelText: 'Batal',
            variant: 'danger',
        });
        if (!confirmed) return;

        try {
            await api.delete(`/invoices/${id}`);
            showAlert({ title: 'Berhasil', message: 'Invoice berhasil dihapus.', variant: 'success' });
            fetchData();
        } catch (err) {
            showAlert({ title: 'Gagal', message: 'Gagal menghapus invoice: ' + (err.response?.data?.message || err.message), variant: 'danger' });
        }
    };

    const statusBadges = {
        PAID: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        SENT: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        DRAFT: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
        OVERDUE: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    };

    // Metric Summary Calculation
    const totalInvoices = invoices.length;
    const paidCount = invoices.filter(i => i.status === 'PAID').length;
    const pendingCount = invoices.filter(i => i.status === 'SENT' || i.status === 'DRAFT').length;
    const overdueCount = invoices.filter(i => i.status === 'OVERDUE').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span>Daftar Tagihan Invoice &amp; Cetak PDF</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Kelola tagihan, pembuatan invoice multi-item, &amp; streaming PDF.</p>
                </div>
                <Link
                    to="/invoices/create"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all self-start md:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Buat Invoice Baru</span>
                </Link>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Invoice</p>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-mono">{totalInvoices}</h3>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Tagihan Diterbitkan</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Menunggu Pembayaran</p>
                        <h3 className="text-base font-extrabold text-amber-600 dark:text-amber-400 font-mono">{pendingCount}</h3>
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">Draft / Terkirim Ke Klien</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Invoice Lunas (Paid)</p>
                        <h3 className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{paidCount}</h3>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Pembayaran Diterima</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Jatuh Tempo (Overdue)</p>
                        <h3 className="text-base font-extrabold text-rose-600 dark:text-rose-400 font-mono">{overdueCount}</h3>
                        <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium mt-0.5">Melewati Tanggal Tempo</p>
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar & View Switcher */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari no invoice, no ref, atau nama klien..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
                        />
                    </div>

                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
                        <button
                            type="button"
                            onClick={() => setShowAdvanceFilter(!showAdvanceFilter)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all border ${
                                showAdvanceFilter || activeFilterCount > 0
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 shadow-sm'
                                    : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                            }`}
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Filter Lanjutan</span>
                            {activeFilterCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white">
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

                        {/* View Switcher: Tabel (Default) vs Card Grid */}
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 ml-1">
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                                    viewMode === 'table'
                                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
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
                                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
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

                {/* Expandable Collapsible Filter Panel */}
                {showAdvanceFilter && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-200">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Status Invoice</label>
                            <SearchableSelect
                                options={[
                                    { value: '', label: 'Semua Status Invoice' },
                                    { value: 'DRAFT', label: 'DRAFT (Draft)' },
                                    { value: 'SENT', label: 'SENT (Terkirim)' },
                                    { value: 'PAID', label: 'PAID (Lunas)' },
                                    { value: 'OVERDUE', label: 'OVERDUE (Jatuh Tempo)' },
                                ]}
                                value={statusFilter}
                                onChange={(val) => setStatusFilter(val)}
                                placeholder="Semua Status..."
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Periode Tanggal Invoice</label>
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
                                <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                <input
                                    type="date"
                                    value={startDateFilter}
                                    onChange={(e) => setStartDateFilter(e.target.value)}
                                    className="bg-transparent border-0 focus:outline-none font-semibold text-slate-800 dark:text-slate-200 p-0 text-xs w-full cursor-pointer"
                                    title="Tanggal Mulai"
                                />
                                <span className="text-slate-400 shrink-0">s/d</span>
                                <input
                                    type="date"
                                    value={endDateFilter}
                                    onChange={(e) => setEndDateFilter(e.target.value)}
                                    className="bg-transparent border-0 focus:outline-none font-semibold text-slate-800 dark:text-slate-200 p-0 text-xs w-full cursor-pointer"
                                    title="Tanggal Selesai"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Invoices List Display */}
            {loading ? (
                <div className="flex justify-center p-12 text-xs text-slate-500 dark:text-slate-400">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2 text-blue-600 dark:text-blue-400" />
                    <span>Memuat data invoice...</span>
                </div>
            ) : invoices.length === 0 ? (
                <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 bg-white dark:bg-[#0f172a]">
                    Belum ada transaksi invoice terdaftar.
                </div>
            ) : viewMode === 'table' ? (
                /* TABLE VIEW (DEFAULT) */
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm min-h-[360px]">
                    <div>
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                    <th className="py-3 px-4">No. Invoice</th>
                                    <th className="py-3 px-4">No. Ref / PO</th>
                                    <th className="py-3 px-4">Klien Perusahaan</th>
                                    <th className="py-3 px-4">Tgl Terbit</th>
                                    <th className="py-3 px-4">Jatuh Tempo</th>
                                    <th className="py-3 px-4">Total Tagihan</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                {invoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3.5 px-4 font-mono font-bold">
                                            <Link
                                                to={`/invoices/${inv.id}/edit`}
                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 hover:underline"
                                                title="Klik untuk melihat &amp; edit Invoice"
                                            >
                                                {inv.invoice_number}
                                            </Link>
                                        </td>
                                        <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                                            {inv.reference_number ? (
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">{inv.reference_number}</span>
                                            ) : (
                                                <span className="text-slate-400 italic text-[11px]">-</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{inv.client?.company_name || inv.client?.name}</td>

                                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{inv.invoice_date}</td>
                                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{inv.due_date}</td>
                                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 font-mono">
                                            Rp {new Intl.NumberFormat('id-ID').format(inv.grand_total)}
                                        </td>
                                        <td className="py-3.5 px-4 space-y-1">
                                            <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${statusBadges[inv.status] || statusBadges.SENT}`}>
                                                {inv.status}
                                            </span>
                                            {inv.signed_file_url ? (
                                                <a href={inv.signed_file_url} target="_blank" rel="noopener noreferrer" className="block text-[10px] font-extrabold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1">
                                                    <FileCheck className="w-3 h-3" /> Berkas TTD Ada
                                                </a>
                                            ) : inv.signature_type === 'MANUAL' ? (
                                                <button type="button" onClick={() => handleOpenSignedModal(inv)} className="block text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
                                                    <UploadCloud className="w-3 h-3" /> Upload Scan TTD
                                                </button>
                                            ) : null}
                                        </td>
                                        <td className="py-3.5 px-4 text-right relative">
                                            {/* Opsi Aksi Dropdown Trigger Button */}
                                            <button
                                                type="button"
                                                onClick={(e) => toggleDropdown(e, inv.id)}
                                                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs inline-flex items-center space-x-1.5 shadow-sm transition-all"
                                            >
                                                <span>Opsi Aksi</span>
                                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${activeDropdownId === inv.id ? 'rotate-180' : ''}`} />
                                            </button>

                                            {/* Opsi Aksi Dropdown Popover Menu */}
                                            {activeDropdownId === inv.id && (
                                                <div
                                                    className={`absolute right-4 ${
                                                        dropUpMap[inv.id] ? 'bottom-full mb-1' : 'top-full mt-1'
                                                    } z-[999] w-52 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden py-1 text-left space-y-0.5`}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {/* 1. Download PDF */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActiveDropdownId(null);
                                                            openPdfPreview(`/invoices/${inv.id}/pdf`);
                                                        }}
                                                        className="w-full px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-2 transition-colors text-left"
                                                    >
                                                        <Download className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                                        <span>Preview &amp; Download Invoice PDF</span>
                                                    </button>

                                                    {/* 2. Download / Cetak Kwitansi PDF */}
                                                    <Link
                                                        to={`/payments/create?invoice_id=${inv.id}`}
                                                        onClick={() => setActiveDropdownId(null)}
                                                        className="px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-2 transition-colors"
                                                    >
                                                        <Printer className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                        <span>Preview &amp; Cetak Kwitansi</span>
                                                    </Link>

                                                    {/* 2. Kirim Email ke Klien */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActiveDropdownId(null);
                                                            handleOpenEmailModal(inv);
                                                        }}
                                                        className="w-full px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-2 transition-colors text-left"
                                                    >
                                                        <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                                        <span>Kirim Email</span>
                                                    </button>

                                                    {/* 3. Catat Pembayaran */}
                                                    {inv.status !== 'PAID' && (
                                                        <Link
                                                            to={`/payments/create?invoice_id=${inv.id}`}
                                                            onClick={() => setActiveDropdownId(null)}
                                                            className="px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-2 transition-colors"
                                                        >
                                                            <CreditCard className="w-4 h-4 shrink-0" />
                                                            <span>Catat Pembayaran</span>
                                                        </Link>
                                                    )}

                                                    {/* 4. Edit Invoice */}
                                                    <Link
                                                        to={`/invoices/${inv.id}/edit`}
                                                        onClick={() => setActiveDropdownId(null)}
                                                        className="px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-2 transition-colors"
                                                    >
                                                        <Edit3 className="w-4 h-4 text-amber-500 shrink-0" />
                                                        <span>Edit Invoice</span>
                                                    </Link>

                                                    {/* 5. Hapus Invoice */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActiveDropdownId(null);
                                                            handleDelete(inv.id);
                                                        }}
                                                        className="w-full px-3.5 py-2 hover:bg-rose-500/10 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center space-x-2 transition-colors text-left"
                                                    >
                                                        <Trash2 className="w-4 h-4 shrink-0" />
                                                        <span>Hapus Invoice</span>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* CARD / GRID VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {invoices.map((inv) => (
                        <div key={inv.id} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4 shadow-sm flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 block">
                                            {inv.invoice_number}
                                        </span>
                                        {inv.reference_number && (
                                            <span className="text-[10px] font-mono text-slate-400">Ref: {inv.reference_number}</span>
                                        )}
                                    </div>
                                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${statusBadges[inv.status] || statusBadges.SENT}`}>
                                        {inv.status}
                                    </span>
                                </div>

                                <div>
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{inv.client?.company_name || inv.client?.name || 'Klien'}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tgl Terbit: {inv.invoice_date} &bull; Tempo: {inv.due_date}</p>
                                </div>

                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-500">Total Tagihan:</span>
                                    <span className="text-sm font-extrabold font-mono text-slate-900 dark:text-slate-100">
                                        Rp {new Intl.NumberFormat('id-ID').format(inv.grand_total)}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <Link
                                    to={`/invoices/${inv.id}/edit`}
                                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>Detail Invoice</span>
                                </Link>

                                <div className="flex items-center space-x-1.5">
                                    <button
                                        type="button"
                                        onClick={() => openPdfPreview(`/invoices/${inv.id}/pdf`)}
                                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                        title="Preview &amp; Download Invoice PDF"
                                    >
                                        <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                    </button>
                                    <Link
                                        to={`/payments/create?invoice_id=${inv.id}`}
                                        className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                                        title="Preview &amp; Cetak Kwitansi (Buat Pembayaran)"
                                    >
                                        <Printer className="w-3.5 h-3.5" />
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => handleOpenEmailModal(inv)}
                                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                        title="Kirim Email"
                                    >
                                        <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(inv.id)}
                                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                                        title="Hapus Invoice"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Email Modal */}
            {selectedInvoiceForEmail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span>Kirim Email Invoice #{selectedInvoiceForEmail.invoice_number}</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setSelectedInvoiceForEmail(null)}
                                className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSendEmailSubmit} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Alamat Email Tujuan *</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="client@example.com"
                                    value={recipientEmail}
                                    onChange={(e) => setRecipientEmail(e.target.value)}
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pesan Pengantar Email *</label>
                                <textarea
                                    rows={4}
                                    required
                                    value={emailMessage}
                                    onChange={(e) => setEmailMessage(e.target.value)}
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                                />
                            </div>

                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedInvoiceForEmail(null)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={sendingEmail}
                                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center space-x-1.5 transition-colors disabled:opacity-60 shadow-md shadow-blue-500/20"
                                >
                                    {sendingEmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                    <span>Kirim Email Invoice</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Upload Scan TTD Invoice */}
            {showSignedModal && selectedInvoiceForSigned && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4 relative">
                        <button
                            onClick={() => {
                                setShowSignedModal(false);
                                setSelectedInvoiceForSigned(null);
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
                                    Upload Scan Invoice Ber-TTD
                                </h3>
                                <p className="text-xs text-slate-500">
                                    No. Invoice: <strong>{selectedInvoiceForSigned.invoice_number}</strong>
                                </p>
                            </div>
                        </div>

                        {signedError && (
                            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{signedError}</span>
                            </div>
                        )}

                        <form onSubmit={handleUploadSignedSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Pilih File Scan / Foto Invoice Ber-TTD Fisik *
                                </label>
                                <input
                                    type="file"
                                    required
                                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                                    onChange={(e) => setSignedFile(e.target.files[0])}
                                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 dark:file:bg-purple-950/50 dark:file:text-purple-400 hover:file:bg-purple-100 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 p-1"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">
                                    Format file: PDF, JPG, PNG, WEBP. Maksimal 10MB.
                                </p>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowSignedModal(false);
                                        setSelectedInvoiceForSigned(null);
                                    }}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploadingSigned}
                                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 disabled:opacity-50"
                                >
                                    {uploadingSigned ? (
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
