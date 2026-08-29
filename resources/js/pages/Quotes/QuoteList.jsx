import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useConfirm } from '../../context/ConfirmContext';
import SearchableSelect from '../../components/SearchableSelect';
import {
    Receipt,
    Plus,
    ArrowRight,
    Search,
    RefreshCw,
    CheckCircle2,
    Clock,
    FileCheck2,
    Trash2,
    Edit3,
    FileText,
    DollarSign,
    ExternalLink,
    Mail,
    Download,
    XCircle,
    Send,
    X,
    ChevronDown,
    SlidersHorizontal,
    ChevronUp,
    Calendar,
    List,
    LayoutGrid,
    FileCheck,
    UploadCloud,
    AlertCircle
} from 'lucide-react';

export default function QuoteList() {
    const { confirm } = useConfirm();
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');
    const [showAdvanceFilter, setShowAdvanceFilter] = useState(false);
    const [convertingId, setConvertingId] = useState(null);
    const [cancelingId, setCancelingId] = useState(null);
    const [viewMode, setViewMode] = useState('table'); // 'table' (default) | 'grid'
    const [downloadingPdfId, setDownloadingPdfId] = useState(null);

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

    // Dropdown state per row ID & smart position direction map
    const [activeDropdownId, setActiveDropdownId] = useState(null);
    const [dropUpMap, setDropUpMap] = useState({});

    const toggleDropdown = (e, qId) => {
        e.stopPropagation();
        if (activeDropdownId === qId) {
            setActiveDropdownId(null);
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            setDropUpMap(prev => ({ ...prev, [qId]: spaceBelow < 280 }));
            setActiveDropdownId(qId);
        }
    };


    // Email Modal State
    const [selectedQuoteForEmail, setSelectedQuoteForEmail] = useState(null);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);

    // Upload Signed Scan Modal State
    const [showSignedModal, setShowSignedModal] = useState(false);
    const [selectedQuoteForSigned, setSelectedQuoteForSigned] = useState(null);
    const [signedFile, setSignedFile] = useState(null);
    const [uploadingSigned, setUploadingSigned] = useState(false);
    const [signedError, setSignedError] = useState(null);

    const handleOpenSignedModal = (quote) => {
        setSelectedQuoteForSigned(quote);
        setSignedFile(null);
        setSignedError(null);
        setShowSignedModal(true);
    };

    const handleUploadSignedSubmit = async (e) => {
        e.preventDefault();
        if (!signedFile) {
            setSignedError('Silakan pilih file scan penawaran ber-TTD fisik terlebih dahulu.');
            return;
        }
        try {
            setUploadingSigned(true);
            setSignedError(null);

            const formData = new FormData();
            formData.append('signed_file', signedFile);

            await api.post(`/quotes/${selectedQuoteForSigned.id}/upload-signed-scan`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setShowSignedModal(false);
            setSelectedQuoteForSigned(null);
            setSignedFile(null);
            fetchData();
        } catch (err) {
            setSignedError(err.response?.data?.message || 'Gagal mengunggah berkas scan penawaran.');
        } finally {
            setUploadingSigned(false);
        }
    };

    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/quotes', {
                params: {
                    search: searchTerm || undefined,
                    status: statusFilter || undefined,
                    start_date: startDateFilter || undefined,
                    end_date: endDateFilter || undefined,
                }
            });
            setQuotes(res.data.data || []);
        } catch (err) {
            console.error('Error fetching quotes:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPdf = async (e, id, quoteNumber) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setDownloadingPdfId(id);
        try {
            const response = await api.get(`/quotes/${id}/pdf`, {
                responseType: 'blob',
            });
            const file = new Blob([response.data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL, '_blank');
        } catch (err) {
            alert('Gagal membuka preview PDF Penawaran: ' + (err.response?.data?.message || err.message));
        } finally {
            setDownloadingPdfId(null);
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

    const handleConvertToInvoice = async (quote) => {
        const ok = await confirm({
            title: 'Konversi ke Invoice',
            message: `Apakah Anda yakin ingin mengonversi Penawaran ${quote.quote_number} menjadi Invoice Tagihan? Penawaran akan ditandai sebagai sudah dikonversi.`,
            confirmText: 'Ya, Konversi',
            variant: 'warning',
        });
        if (!ok) return;
        setConvertingId(quote.id);
        try {
            const res = await api.post(`/quotes/${quote.id}/convert`);
            const invoiceId = res.data?.data?.invoice?.id;
            if (invoiceId) {
                navigate(`/invoices/${invoiceId}/edit`);
            } else {
                alert(res.data.message || 'Penawaran berhasil dikonversi menjadi Invoice Tagihan!');
                fetchData();
            }
        } catch (err) {
            alert('Gagal mengonversi penawaran: ' + (err.response?.data?.message || err.message));
        } finally {
            setConvertingId(null);
        }
    };


    const handleCancelQuote = async (quote) => {
        const ok = await confirm({
            title: 'Batalkan Penawaran',
            message: `Apakah Anda yakin ingin membatalkan Penawaran ${quote.quote_number}? Tindakan ini tidak dapat dibatalkan.`,
            confirmText: 'Ya, Batalkan',
            variant: 'warning',
        });
        if (!ok) return;
        setCancelingId(quote.id);
        try {
            const res = await api.patch(`/quotes/${quote.id}/cancel`);
            alert(res.data.message || 'Penawaran berhasil dibatalkan.');
            fetchData();
        } catch (err) {
            alert('Gagal membatalkan penawaran: ' + (err.response?.data?.message || err.message));
        } finally {
            setCancelingId(null);
        }
    };

    const handleOpenEmailModal = (quote) => {
        setSelectedQuoteForEmail(quote);
        setRecipientEmail(quote.client?.email || '');
        setEmailMessage(`Halo ${quote.client?.company_name || quote.client?.name || 'Klien'},\n\nTerlampir surat penawaran harga resmi (${quote.quote_number}) dari kami. Silakan periksa dokumen terlampir.\n\nTerima kasih.`);
    };

    const handleSendEmailSubmit = async (e) => {
        e.preventDefault();
        if (!selectedQuoteForEmail) return;

        setSendingEmail(true);
        try {
            const res = await api.post(`/quotes/${selectedQuoteForEmail.id}/send-email`, {
                recipient_email: recipientEmail,
                message_text: emailMessage,
            });
            alert(res.data.message || 'Email penawaran berhasil dikirim!');
            setSelectedQuoteForEmail(null);
            fetchData();
        } catch (err) {
            alert('Gagal mengirim email penawaran: ' + (err.response?.data?.message || err.message));
        } finally {
            setSendingEmail(false);
        }
    };

    const handleDeleteQuote = async (id) => {
        const ok = await confirm({
            title: 'Hapus Penawaran',
            message: 'Apakah Anda yakin ingin menghapus data penawaran ini? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/quotes/${id}`);
            fetchData();
        } catch (err) {
            alert('Gagal menghapus penawaran.');
        }
    };

    const statusBadges = {
        DRAFT: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
        SENT: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        VIEWED: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
        APPROVED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        ACCEPTED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        REJECTED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        DECLINED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        CANCELED: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        CONVERTED: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    };

    // Metric Calculations
    const totalQuotes = quotes.length;
    const pendingQuotes = quotes.filter(q => q.status === 'SENT' || q.status === 'VIEWED' || q.status === 'DRAFT').length;
    const approvedQuotes = quotes.filter(q => q.status === 'APPROVED' || q.status === 'ACCEPTED').length;
    const convertedQuotes = quotes.filter(q => q.status === 'CONVERTED').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <span>Penawaran Harga (Quotes)</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Kelola penawaran resmi untuk calon klien & konversi 1-Klik menjadi Invoice Tagihan.
                    </p>
                </div>
                <Link
                    to="/quotes/create"
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-500/20 flex items-center space-x-1.5 transition-all self-start md:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Buat Penawaran Baru</span>
                </Link>
            </div>

            {/* Metric Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Penawaran</p>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{totalQuotes}</h3>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Penawaran Diterbitkan</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Menunggu Respon</p>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{pendingQuotes}</h3>
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">Draft / Terkirim Ke Klien</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Penawaran Disetujui</p>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{approvedQuotes}</h3>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Approved Oleh Klien</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                        <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Dikonversi ke Invoice</p>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{convertedQuotes}</h3>
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">Sudah Menjadi Tagihan</p>
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari no penawaran atau nama klien..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-purple-500 font-medium"
                        />
                    </div>

                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
                        <button
                            type="button"
                            onClick={() => setShowAdvanceFilter(!showAdvanceFilter)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all border ${
                                showAdvanceFilter || activeFilterCount > 0
                                    ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 shadow-sm'
                                    : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                            }`}
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                            <span>Filter Lanjutan</span>
                            {activeFilterCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-purple-600 text-white">
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
                                        ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm'
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
                                        ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm'
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
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-200">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Status Penawaran</label>
                            <SearchableSelect
                                options={[
                                    { value: '', label: 'Semua Status Penawaran' },
                                    { value: 'DRAFT', label: 'DRAFT (Draft)' },
                                    { value: 'SENT', label: 'SENT (Terkirim)' },
                                    { value: 'VIEWED', label: 'VIEWED (Dilihat Klien)' },
                                    { value: 'APPROVED', label: 'APPROVED (Disetujui)' },
                                    { value: 'REJECTED', label: 'REJECTED (Ditolak)' },
                                    { value: 'CANCELED', label: 'CANCELED (Dibatalkan)' },
                                    { value: 'CONVERTED', label: 'CONVERTED (Dikonversi)' },
                                ]}
                                value={statusFilter}
                                onChange={(val) => setStatusFilter(val)}
                                placeholder="Semua Status..."
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Periode Tanggal Penawaran</label>
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
                                <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
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

            {/* Quotes Data Table Card */}
            {loading ? (
                <div className="flex justify-center p-12 text-xs text-slate-500 dark:text-slate-400">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2 text-purple-600 dark:text-purple-400" />
                    <span>Memuat daftar penawaran...</span>
                </div>
            ) : quotes.length === 0 ? (
                <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 bg-white dark:bg-[#0f172a]">
                    Belum ada data penawaran harga terdaftar.
                </div>
            ) : viewMode === 'table' ? (
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm min-h-[360px]">
                    <div>
                        <table className="w-full text-left text-xs border-collapse">

                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                    <th className="py-3 px-4">No. Penawaran</th>
                                    <th className="py-3 px-4">Klien Perusahaan</th>
                                    <th className="py-3 px-4">Tgl Diterbitkan</th>
                                    <th className="py-3 px-4">Berlaku Sampai</th>
                                    <th className="py-3 px-4">Total Penawaran</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Aksi & Konversi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                {quotes.map((q) => (
                                    <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3.5 px-4 font-mono font-bold">
                                            <Link
                                                to={`/quotes/${q.id}/edit`}
                                                className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 hover:underline"
                                                title="Klik untuk membuka & edit data Penawaran"
                                            >
                                                {q.quote_number}
                                            </Link>
                                        </td>


                                        <td className="py-3.5 px-4">
                                            <div className="font-bold text-slate-800 dark:text-slate-200">{q.client?.company_name || q.client?.name}</div>
                                            {q.client?.code && <div className="text-[10px] font-mono text-slate-400">{q.client.code}</div>}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{q.quote_date}</td>
                                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{q.valid_until}</td>
                                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 font-mono">
                                            Rp {new Intl.NumberFormat('id-ID').format(q.grand_total)}
                                        </td>
                                        <td className="py-3.5 px-4 space-y-1">
                                            <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border ${statusBadges[q.status] || statusBadges.DRAFT}`}>
                                                {q.status}
                                            </span>
                                            {q.signed_file_url ? (
                                                <a href={q.signed_file_url} target="_blank" rel="noopener noreferrer" className="block text-[10px] font-extrabold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1">
                                                    <FileCheck className="w-3 h-3" /> Berkas TTD Ada
                                                </a>
                                            ) : q.signature_type === 'MANUAL' ? (
                                                <button type="button" onClick={() => handleOpenSignedModal(q)} className="block text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
                                                    <UploadCloud className="w-3 h-3" /> Upload Scan TTD
                                                </button>
                                            ) : null}
                                        </td>
                                        <td className="py-3.5 px-4 text-right relative">
                                            {/* Opsi Aksi Dropdown Trigger Button */}
                                            <button
                                                type="button"
                                                onClick={(e) => toggleDropdown(e, q.id)}
                                                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs inline-flex items-center space-x-1.5 shadow-sm transition-all"
                                            >
                                                <span>Opsi Aksi</span>
                                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${activeDropdownId === q.id ? 'rotate-180' : ''}`} />
                                            </button>

                                            {/* Opsi Aksi Dropdown Popover Menu */}
                                            {activeDropdownId === q.id && (
                                                <div
                                                    className={`absolute right-4 ${
                                                        dropUpMap[q.id] ? 'bottom-full mb-1' : 'top-full mt-1'
                                                    } z-[999] w-52 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden py-1 text-left space-y-0.5`}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {/* 1. Download PDF */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            setActiveDropdownId(null);
                                                            handleDownloadPdf(e, q.id, q.quote_number);
                                                        }}
                                                        disabled={downloadingPdfId === q.id}
                                                        className="w-full px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-2 transition-colors text-left disabled:opacity-50"
                                                    >
                                                        {downloadingPdfId === q.id ? (
                                                            <RefreshCw className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 animate-spin" />
                                                        ) : (
                                                            <Download className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                                                        )}
                                                        <span>{downloadingPdfId === q.id ? 'Mengunduh...' : 'Download PDF'}</span>
                                                    </button>

                                                    {/* 1.5. Upload Scan TTD Basah */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActiveDropdownId(null);
                                                            handleOpenSignedModal(q);
                                                        }}
                                                        className="w-full px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center space-x-2 transition-colors text-left"
                                                    >
                                                        <UploadCloud className="w-4 h-4 shrink-0" />
                                                        <span>Upload Scan TTD Basah</span>
                                                    </button>

                                                    {/* 2. Email ke Klien */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActiveDropdownId(null);
                                                            handleOpenEmailModal(q);
                                                        }}
                                                        className="w-full px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-2 transition-colors text-left"
                                                    >
                                                        <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                                        <span>Email ke Klien</span>
                                                    </button>

                                                    {/* 3. Ubah jadi Invoice */}
                                                    {q.status !== 'CONVERTED' ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setActiveDropdownId(null);
                                                                handleConvertToInvoice(q);
                                                            }}
                                                            disabled={convertingId === q.id || q.status === 'CANCELED'}
                                                            className="w-full px-3.5 py-2 hover:bg-purple-500/10 text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center space-x-2 transition-colors text-left disabled:opacity-40"
                                                        >
                                                            {convertingId === q.id ? (
                                                                <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                                                            ) : (
                                                                <ArrowRight className="w-4 h-4 shrink-0" />
                                                            )}
                                                            <span>Ubah jadi Invoice</span>
                                                        </button>
                                                    ) : (
                                                        <div className="px-3.5 py-1.5 text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 flex items-center space-x-1.5">
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            <span>Sudah Dikonversi</span>
                                                        </div>
                                                    )}

                                                    <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                                                    {/* 4. Edit Penawaran */}
                                                    <Link
                                                        to={`/quotes/${q.id}/edit`}
                                                        onClick={() => setActiveDropdownId(null)}
                                                        className="px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-2 transition-colors"
                                                    >
                                                        <Edit3 className="w-4 h-4 text-slate-500 shrink-0" />
                                                        <span>Edit Penawaran</span>
                                                    </Link>

                                                    {/* 5. Cancel Quote */}
                                                    {q.status !== 'CONVERTED' && q.status !== 'CANCELED' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setActiveDropdownId(null);
                                                                handleCancelQuote(q);
                                                            }}
                                                            disabled={cancelingId === q.id}
                                                            className="w-full px-3.5 py-2 hover:bg-amber-500/10 text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center space-x-2 transition-colors text-left"
                                                        >
                                                            {cancelingId === q.id ? (
                                                                <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                                                            ) : (
                                                                <XCircle className="w-4 h-4 shrink-0" />
                                                            )}
                                                            <span>Cancel Quote</span>
                                                        </button>
                                                    )}

                                                    {/* 6. Hapus Penawaran */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActiveDropdownId(null);
                                                            handleDeleteQuote(q.id);
                                                        }}
                                                        className="w-full px-3.5 py-2 hover:bg-rose-500/10 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center space-x-2 transition-colors text-left"
                                                    >
                                                        <Trash2 className="w-4 h-4 shrink-0" />
                                                        <span>Hapus Penawaran</span>
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
                    {quotes.map((q) => (
                        <div key={q.id} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4 shadow-sm flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 block">
                                            {q.quote_number}
                                        </span>
                                    </div>
                                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${statusBadges[q.status] || statusBadges.DRAFT}`}>
                                        {q.status}
                                    </span>
                                </div>

                                <div>
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{q.client?.company_name || q.client?.name || 'Klien'}</h3>
                                    {q.client?.code && <div className="text-[10px] font-mono text-slate-400">Kode: {q.client.code}</div>}
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tgl: {q.quote_date} &bull; Valid: {q.valid_until}</p>
                                </div>

                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-500">Total Penawaran:</span>
                                    <span className="text-sm font-extrabold font-mono text-slate-900 dark:text-slate-100">
                                        Rp {new Intl.NumberFormat('id-ID').format(q.grand_total)}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <Link
                                    to={`/quotes/${q.id}/edit`}
                                    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>Detail / Edit</span>
                                </Link>

                                <div className="flex items-center space-x-1.5">
                                    <button
                                        type="button"
                                        onClick={(e) => handleDownloadPdf(e, q.id, q.quote_number)}
                                        disabled={downloadingPdfId === q.id}
                                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                                        title="Download PDF"
                                    >
                                        {downloadingPdfId === q.id ? (
                                            <RefreshCw className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 animate-spin" />
                                        ) : (
                                            <Download className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleOpenEmailModal(q)}
                                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                        title="Kirim Email ke Klien"
                                    >
                                        <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteQuote(q.id)}
                                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
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

            {/* Modal Kirim Email Penawaran ke Klien */}
            {selectedQuoteForEmail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div className="flex items-center space-x-2">
                                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                                    Kirim Email Penawaran ({selectedQuoteForEmail.quote_number})
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedQuoteForEmail(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSendEmailSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Email Tujuan Klien *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={recipientEmail}
                                    onChange={(e) => setRecipientEmail(e.target.value)}
                                    placeholder="contoh: client@perusahaan.com"
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Pesan Email (Opsional)
                                </label>
                                <textarea
                                    rows={4}
                                    value={emailMessage}
                                    onChange={(e) => setEmailMessage(e.target.value)}
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs flex items-center space-x-2">
                                <Download className="w-4 h-4 shrink-0" />
                                <span>Dokumen PDF Penawaran <strong>Penawaran_{selectedQuoteForEmail.quote_number}.pdf</strong> akan dilampirkan secara otomatis.</span>
                            </div>

                            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setSelectedQuoteForEmail(null)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={sendingEmail}
                                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all"
                                >
                                    {sendingEmail ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    <span>Kirim Surat Penawaran</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Upload Scan TTD Penawaran */}
            {showSignedModal && selectedQuoteForSigned && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4 relative">
                        <button
                            onClick={() => {
                                setShowSignedModal(false);
                                setSelectedQuoteForSigned(null);
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
                                    Upload Scan Penawaran Ber-TTD
                                </h3>
                                <p className="text-xs text-slate-500">
                                    No. Quote: <strong>{selectedQuoteForSigned.quote_number}</strong>
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
                                    Pilih File Scan / Foto Penawaran Ber-TTD Fisik *
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
                                        setSelectedQuoteForSigned(null);
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
