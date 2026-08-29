import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useConfirm } from '../../context/ConfirmContext';
import SearchableSelect from '../../components/SearchableSelect';
import {
    Truck,
    Plus,
    Search,
    RefreshCw,
    Printer,
    Eye,
    Edit,
    Trash2,
    CheckCircle2,
    Settings,
    Clock,
    AlertCircle,
    Calendar,
    Building2,
    Package,
    Navigation,
    UserCheck,
    FileText,
    ExternalLink,
    FileCheck,
    UploadCloud,
    X
} from 'lucide-react';

export default function DeliveryOrderList() {
    const navigate = useNavigate();
    const { confirm } = useConfirm();

    const [deliveryOrders, setDeliveryOrders] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        draft: 0,
        pending: 0,
        in_transit: 0,
        delivered: 0,
    });
    const [meta, setMeta] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 15,
    });

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchDeliveryOrders = async (page = 1) => {
        try {
            setLoading(true);
            const params = {
                page,
                per_page: 15,
                search: searchTerm,
                status: statusFilter,
                start_date: startDate,
                end_date: endDate,
            };

            const res = await api.get('/delivery-orders', { params });
            if (res.data && res.data.status === 'success') {
                setDeliveryOrders(res.data.data || []);
                setMeta(res.data.meta || {});
                setStats(res.data.stats || {});
            }
        } catch (err) {
            console.error('Failed to fetch delivery orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeliveryOrders(1);
    }, [statusFilter, startDate, endDate]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchDeliveryOrders(1);
    };

    const [selectedDoForProof, setSelectedDoForProof] = useState(null);
    const [showProofModal, setShowProofModal] = useState(false);
    const [proofFile, setProofFile] = useState(null);
    const [uploadingProof, setUploadingProof] = useState(false);
    const [proofError, setProofError] = useState(null);

    const handleStatusChange = async (id, newStatus) => {
        const doItem = deliveryOrders.find(d => String(d.id) === String(id));
        if (newStatus === 'DELIVERED' && !doItem?.proof_file_path) {
            setSelectedDoForProof(doItem);
            setShowProofModal(true);
            setProofError(null);
            return;
        }
        try {
            await api.put(`/delivery-orders/${id}/status`, { status: newStatus });
            fetchDeliveryOrders(meta.current_page);
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal mengubah status.');
        }
    };

    const handleUploadProofSubmit = async (e) => {
        e.preventDefault();
        if (!proofFile) {
            setProofError('Silakan pilih file scan/foto Surat Jalan TTD terlebih dahulu.');
            return;
        }
        try {
            setUploadingProof(true);
            setProofError(null);

            const formData = new FormData();
            formData.append('proof_file', proofFile);
            formData.append('set_delivered', '1');

            await api.post(`/delivery-orders/${selectedDoForProof.id}/upload-proof`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setShowProofModal(false);
            setProofFile(null);
            setSelectedDoForProof(null);
            fetchDeliveryOrders(meta.current_page);
        } catch (err) {
            setProofError(err.response?.data?.message || 'Gagal mengunggah file bukti TTD.');
        } finally {
            setUploadingProof(false);
        }
    };

    const handleDelete = async (id, doNumber) => {
        const isConfirmed = await confirm({
            title: 'Hapus Surat Jalan',
            message: `Apakah Anda yakin ingin menghapus Surat Jalan ${doNumber}? Tindakan ini tidak dapat dibatalkan.`,
            confirmText: 'Ya, Hapus',
            type: 'danger',
        });

        if (!isConfirmed) return;

        try {
            await api.delete(`/delivery-orders/${id}`);
            fetchDeliveryOrders(meta.current_page);
        } catch (err) {
            console.error('Failed to delete delivery order:', err);
        }
    };

    const handlePrintPdf = (doItem) => {
        const target = typeof doItem === 'object' ? doItem : deliveryOrders.find(d => String(d.id) === String(doItem));
        const url = target?.public_token
            ? `/api/v1/portal/delivery-orders/${target.public_token}/pdf`
            : `/api/v1/delivery-orders/${typeof doItem === 'object' ? doItem.id : doItem}/pdf`;
        window.open(url, '_blank');
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'DELIVERED':
                return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            case 'IN_TRANSIT':
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
            case 'PENDING_SHIPMENT':
                return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
            case 'CANCELLED':
                return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
            case 'DRAFT':
            default:
                return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
        }
    };

    const formatStatusText = (status) => {
        switch (status) {
            case 'DELIVERED': return 'Selesai Terkirim';
            case 'IN_TRANSIT': return 'Dalam Pengiriman';
            case 'PENDING_SHIPMENT': return 'Menunggu Kurir';
            case 'CANCELLED': return 'Dibatalkan';
            case 'DRAFT': default: return 'Draft';
        }
    };

    return (
        <div className="space-y-6">
            {/* Top Bar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
                        <Truck className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                            Surat Jalan (Delivery Order)
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Kelola pengiriman barang, lacak kurir/ekspedisi, dan cetak dokumen Surat Jalan resmi PDF.
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                    <Link
                        to="/settings?tab=delivery_order"
                        className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center space-x-1.5 text-xs font-bold border border-slate-200 dark:border-slate-700"
                        title="Pengaturan Layout & Tanda Tangan"
                    >
                        <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="hidden sm:inline">Pengaturan Surat Jalan</span>
                    </Link>
                    <button
                        onClick={() => fetchDeliveryOrders(meta.current_page)}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <Link
                        to="/delivery-orders/create"
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center space-x-1.5 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Buat Surat Jalan</span>
                    </Link>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Surat Jalan</p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{stats.total || 0}</h3>
                        <p className="text-[11px] text-slate-500 mt-1">Total pengiriman</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                        <Truck className="w-6 h-6" />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dalam Pengiriman</p>
                        <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats.in_transit || 0}</h3>
                        <p className="text-[11px] text-slate-500 mt-1">Sedang dikirim kurir</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                        <Navigation className="w-6 h-6 animate-pulse" />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Selesai Terkirim</p>
                        <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.delivered || 0}</h3>
                        <p className="text-[11px] text-slate-500 mt-1">Diterima oleh klien</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Menunggu / Draft</p>
                        <h3 className="text-2xl font-black text-amber-500 mt-1">{(stats.draft || 0) + (stats.pending || 0)}</h3>
                        <p className="text-[11px] text-slate-500 mt-1">Belum jalan kurir</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
                <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari No. Surat Jalan, Klien, Sopir, Resi..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-semibold"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 shrink-0 text-xs">
                        <div className="min-w-[150px]">
                            <SearchableSelect
                                options={[
                                    { value: '', label: 'Semua Status' },
                                    { value: 'DRAFT', label: 'Draft' },
                                    { value: 'PENDING_SHIPMENT', label: 'Menunggu Kurir' },
                                    { value: 'IN_TRANSIT', label: 'Dalam Pengiriman' },
                                    { value: 'DELIVERED', label: 'Selesai Terkirim' },
                                    { value: 'CANCELLED', label: 'Dibatalkan' },
                                ]}
                                value={statusFilter}
                                onChange={(val) => setStatusFilter(val)}
                                placeholder="Status DO..."
                            />
                        </div>

                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-semibold"
                            title="Tanggal Mulai"
                        />

                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-semibold"
                            title="Tanggal Selesai"
                        />
                    </div>
                </form>
            </div>

            {/* Data Table */}
            <div className="rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                                <th className="py-3.5 px-4">No. Surat Jalan</th>
                                <th className="py-3.5 px-4">Tujuan / Klien</th>
                                <th className="py-3.5 px-4">Ekspedisi &amp; Sopir</th>
                                <th className="py-3.5 px-4">Status Pengiriman</th>
                                <th className="py-3.5 px-4 text-center">Aksi Cetak &amp; Kelola</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-slate-400">
                                        <div className="flex items-center justify-center space-x-2">
                                            <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                                            <span>Memuat data Surat Jalan...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : deliveryOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-slate-400 space-y-2">
                                        <Truck className="w-8 h-8 mx-auto text-slate-400" />
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">Belum ada Surat Jalan (Delivery Order).</p>
                                        <p className="text-[11px]">Klik "Buat Surat Jalan" untuk membuat dokumen pengiriman baru.</p>
                                    </td>
                                </tr>
                            ) : (
                                deliveryOrders.map((doItem) => (
                                    <tr key={doItem.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                                        {/* No DO & Tanggal */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <Link to={`/delivery-orders/${doItem.id}`} className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
                                                {doItem.do_number}
                                            </Link>
                                            <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-0.5">
                                                <Calendar className="w-3 h-3" />
                                                <span>{new Date(doItem.do_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                            {doItem.invoice && (
                                                <span className="inline-block mt-1 font-mono text-[9px] text-slate-500 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                                                    Ref Inv: {doItem.invoice.invoice_number}
                                                </span>
                                            )}
                                        </td>

                                        {/* Tujuan / Klien */}
                                        <td className="py-3.5 px-4">
                                            <div className="font-bold text-slate-900 dark:text-slate-100">
                                                {doItem.client?.company_name || doItem.client?.name || 'Klien'}
                                            </div>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xs mt-0.5">
                                                {doItem.shipping_address}
                                            </p>
                                            {doItem.recipient_name && (
                                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                                    UP: {doItem.recipient_name} ({doItem.recipient_phone || '-'})
                                                </span>
                                            )}
                                        </td>

                                        {/* Ekspedisi & Sopir */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                                                {doItem.expedition_name || 'Kurir Internal'}
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">
                                                Sopir: <strong>{doItem.driver_name || '-'}</strong> ({doItem.vehicle_number || '-'})
                                            </div>
                                            {doItem.tracking_number && (
                                                <span className="font-mono text-[10px] text-blue-500 block">
                                                    Resi: {doItem.tracking_number}
                                                </span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <select
                                                value={doItem.status}
                                                onChange={(e) => handleStatusChange(doItem.id, e.target.value)}
                                                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border focus:outline-none cursor-pointer ${getStatusBadge(doItem.status)}`}
                                            >
                                                <option value="DRAFT">DRAFT</option>
                                                <option value="PENDING_SHIPMENT">MENUNGGU KURIR</option>
                                                <option value="IN_TRANSIT">DALAM PENGIRIMAN</option>
                                                <option value="DELIVERED">SELESAI TERKIRIM</option>
                                                <option value="CANCELLED">DIBATALKAN</option>
                                            </select>

                                            <div className="mt-1">
                                                {doItem.proof_file_url ? (
                                                    <a
                                                        href={doItem.proof_file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 hover:underline"
                                                        title="Lihat / Unduh Bukti Scan DO TTD"
                                                    >
                                                        <FileCheck className="w-3 h-3" /> Bukti TTD Ada
                                                    </a>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedDoForProof(doItem);
                                                            setShowProofModal(true);
                                                            setProofError(null);
                                                        }}
                                                        className="inline-flex items-center gap-1 text-[9px] text-amber-600 dark:text-amber-400 font-extrabold bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 hover:bg-amber-100"
                                                        title="Upload Bukti Scan DO TTD"
                                                    >
                                                        <UploadCloud className="w-3 h-3" /> Upload TTD
                                                    </button>
                                                )}
                                            </div>
                                        </td>

                                        {/* Aksi */}
                                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center space-x-1.5">
                                                <button
                                                    onClick={() => handlePrintPdf(doItem)}
                                                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-sm flex items-center space-x-1 transition-colors"
                                                    title="Cetak / Unduh PDF Surat Jalan (Delivery Order)"
                                                >
                                                    <Printer className="w-3.5 h-3.5" />
                                                    <span>Cetak DO</span>
                                                </button>

                                                <Link
                                                    to={`/delivery-orders/${doItem.id}`}
                                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                    title="Lihat Detail Surat Jalan"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>

                                                <Link
                                                    to={`/delivery-orders/${doItem.id}/edit`}
                                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                    title="Edit Surat Jalan"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>

                                                <button
                                                    onClick={() => handleDelete(doItem.id, doItem.do_number)}
                                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                                    title="Hapus Surat Jalan"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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

            {/* Modal Upload Bukti TTD */}
            {showProofModal && selectedDoForProof && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4 relative">
                        <button
                            onClick={() => {
                                setShowProofModal(false);
                                setProofFile(null);
                                setSelectedDoForProof(null);
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
                                    Upload Bukti Scan DO TTD
                                </h3>
                                <p className="text-xs text-slate-500">
                                    No. DO: <strong>{selectedDoForProof.do_number}</strong>
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
                                    Pilih File Scan / Foto Surat Jalan (PDF, JPG, PNG) *
                                </label>
                                <input
                                    type="file"
                                    required
                                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                                    onChange={(e) => setProofFile(e.target.files[0])}
                                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 dark:file:bg-purple-950/50 dark:file:text-purple-400 hover:file:bg-purple-100 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 p-1"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">
                                    Wajib diunggah sebelum status Surat Jalan diubah menjadi <strong>SELESAI TERKIRIM (DELIVERED)</strong>. Max 10MB.
                                </p>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowProofModal(false);
                                        setProofFile(null);
                                        setSelectedDoForProof(null);
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
                                            <span>Upload &amp; Set Terkirim</span>
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
