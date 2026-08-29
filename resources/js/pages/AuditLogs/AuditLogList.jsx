import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useConfirm } from '../../context/ConfirmContext';
import SearchableSelect from '../../components/SearchableSelect';
import {
    ScrollText,
    History,
    Search,
    RefreshCw,
    Filter,
    Calendar,
    UserCheck,
    ShieldCheck,
    AlertTriangle,
    Eye,
    Trash2,
    Globe,
    Monitor,
    X,
    Clock,
    CheckCircle2,
    FileText,
    Layers,
    ArrowRight,
    Code
} from 'lucide-react';

export default function AuditLogList() {
    const { confirm } = useConfirm();
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({
        total_logs: 0,
        today_logs: 0,
        changes_logs: 0,
        auth_logs: 0,
    });
    const [meta, setMeta] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 20,
    });

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [moduleFilter, setModuleFilter] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [perPage, setPerPage] = useState(20);

    // Detail Modal State
    const [selectedLog, setSelectedLog] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showClearModal, setShowClearModal] = useState(false);
    const [clearDays, setClearDays] = useState('30');
    const [clearing, setClearing] = useState(false);

    const fetchAuditLogs = async (page = 1) => {
        try {
            setLoading(true);
            const params = {
                page,
                per_page: perPage,
                search: searchTerm,
                module: moduleFilter,
                action: actionFilter,
                date_from: dateFrom,
                date_to: dateTo,
            };

            const res = await api.get('/audit-logs', { params });
            if (res.data && res.data.status === 'success') {
                setLogs(res.data.data || []);
                setMeta(res.data.meta || {});
                setStats(res.data.stats || {});
            }
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuditLogs(1);
    }, [moduleFilter, actionFilter, dateFrom, dateTo, perPage]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchAuditLogs(1);
    };

    const handleClearLogs = async () => {
        try {
            setClearing(true);
            const res = await api.delete('/audit-logs/clear', { params: { days: clearDays } });
            if (res.data && res.data.status === 'success') {
                setShowClearModal(false);
                fetchAuditLogs(1);
            }
        } catch (err) {
            console.error('Failed to clear audit logs:', err);
        } finally {
            setClearing(false);
        }
    };

    const getActionBadge = (action) => {
        switch (action) {
            case 'CREATE':
            case 'CLOCK_IN':
                return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            case 'UPDATE':
            case 'APPROVE':
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
            case 'DELETE':
            case 'REJECT':
            case 'CANCEL':
                return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
            case 'LOGIN':
            case 'LOGOUT':
                return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
            default:
                return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        const d = new Date(dateString);
        return d.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffSeconds = Math.floor((now - date) / 1000);

        if (diffSeconds < 60) return 'Baru saja';
        if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} mnt lalu`;
        if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} jam lalu`;
        return `${Math.floor(diffSeconds / 86400)} hari lalu`;
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
                        <History className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                            Audit Trail &amp; Log Aktivitas Sistem
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Jejak riwayat lengkap seluruh aktivitas pengguna, perubahan data, transaksi, autentikasi, dan keamanan sistem Mikrotek Neo.
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                    <button
                        onClick={() => fetchAuditLogs(meta.current_page)}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                        title="Segarkan Log Aktivitas"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={() => setShowClearModal(true)}
                        className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-bold flex items-center space-x-1.5 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Bersihkan Log</span>
                    </button>
                </div>
            </div>

            {/* Metrics Overview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Audit Log</p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{stats.total_logs || 0}</h3>
                        <p className="text-[11px] text-slate-500 mt-1">Catatan tersimpan</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                        <ScrollText className="w-6 h-6" />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aktivitas Hari Ini</p>
                        <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.today_logs || 0}</h3>
                        <p className="text-[11px] text-slate-500 mt-1">Aktivitas baru hari ini</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                        <Calendar className="w-6 h-6" />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Perubahan Data</p>
                        <h3 className="text-2xl font-black text-amber-500 mt-1">{stats.changes_logs || 0}</h3>
                        <p className="text-[11px] text-slate-500 mt-1">Update, Delete, &amp; Reject</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aktivitas Keamanan</p>
                        <h3 className="text-2xl font-black text-blue-500 mt-1">{stats.auth_logs || 0}</h3>
                        <p className="text-[11px] text-slate-500 mt-1">Login &amp; Absensi Presensi</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
                <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari berdasarkan nama user, deskripsi, IP Address, atau ID entitas..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-semibold"
                        />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0 text-xs">
                        <div className="min-w-[130px]">
                            <SearchableSelect
                                options={[
                                    { value: '', label: 'Semua Modul' },
                                    { value: 'HR', label: 'Modul HR' },
                                    { value: 'INVOICES', label: 'Modul Invoices' },
                                    { value: 'PAYMENTS', label: 'Modul Pembayaran' },
                                    { value: 'PROJECTS', label: 'Modul Projects' },
                                    { value: 'QUOTES', label: 'Modul Quotes' },
                                    { value: 'CLIENTS', label: 'Modul Clients' },
                                    { value: 'PRODUCTS', label: 'Modul Produk' },
                                    { value: 'USERS', label: 'Modul User' },
                                    { value: 'SETTINGS', label: 'Modul Settings' },
                                    { value: 'AUTH', label: 'Modul Autentikasi' },
                                ]}
                                value={moduleFilter}
                                onChange={(val) => setModuleFilter(val)}
                                placeholder="Semua Modul..."
                            />
                        </div>

                        <div className="min-w-[130px]">
                            <SearchableSelect
                                options={[
                                    { value: '', label: 'Semua Aksi' },
                                    { value: 'CREATE', label: 'CREATE (Tambah)' },
                                    { value: 'UPDATE', label: 'UPDATE (Ubah)' },
                                    { value: 'DELETE', label: 'DELETE (Hapus)' },
                                    { value: 'LOGIN', label: 'LOGIN (Masuk)' },
                                    { value: 'LOGOUT', label: 'LOGOUT (Keluar)' },
                                    { value: 'APPROVE', label: 'APPROVE (Setuju)' },
                                    { value: 'REJECT', label: 'REJECT (Tolak)' },
                                    { value: 'CLOCK_IN', label: 'CLOCK_IN (Presensi)' },
                                ]}
                                value={actionFilter}
                                onChange={(val) => setActionFilter(val)}
                                placeholder="Semua Aksi..."
                            />
                        </div>

                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            title="Tanggal Mulai"
                            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-semibold"
                        />

                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            title="Tanggal Selesai"
                            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-semibold"
                        />
                    </div>
                </form>
            </div>

            {/* Audit Log Data Table */}
            <div className="rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                                <th className="py-3.5 px-4">Waktu</th>
                                <th className="py-3.5 px-4">Pengguna (User)</th>
                                <th className="py-3.5 px-4">Modul &amp; Aksi</th>
                                <th className="py-3.5 px-4">Deskripsi Aktivitas</th>
                                <th className="py-3.5 px-4">Metadata Perangkat &amp; IP</th>
                                <th className="py-3.5 px-4 text-center">Rincian</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-slate-400">
                                        <div className="flex items-center justify-center space-x-2">
                                            <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
                                            <span>Memuat data audit trail...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-slate-400 space-y-2">
                                        <History className="w-8 h-8 mx-auto text-slate-400" />
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">Tidak ada data audit log ditemukan.</p>
                                        <p className="text-[11px]">Coba sesuaikan filter pencarian atau rentang tanggal Anda.</p>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                                        {/* Waktu */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                                                {formatDateTime(log.created_at)}
                                            </div>
                                            <span className="text-[10px] text-slate-400">
                                                {formatTimeAgo(log.created_at)}
                                            </span>
                                        </td>

                                        {/* Pengguna */}
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center space-x-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 font-bold flex items-center justify-center text-xs shrink-0">
                                                    {log.user_name ? log.user_name.charAt(0).toUpperCase() : 'S'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{log.user_name || 'System'}</p>
                                                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                                                        {log.user_role || 'system'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Modul & Aksi */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <div className="flex flex-col space-y-1">
                                                <span className="font-mono text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                                                    {log.module}
                                                </span>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold border w-fit ${getActionBadge(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Deskripsi */}
                                        <td className="py-3.5 px-4">
                                            <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed max-w-md">
                                                {log.description}
                                            </p>
                                            {log.entity_type && (
                                                <span className="inline-block mt-1 font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                                                    Entity: {log.entity_type} #{log.entity_id || '-'}
                                                </span>
                                            )}
                                        </td>

                                        {/* Metadata IP & User-Agent */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <div className="space-y-1 text-[11px]">
                                                <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 font-mono font-semibold">
                                                    <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                    <span>{log.ip_address || '127.0.0.1'}</span>
                                                </div>
                                                <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] max-w-[180px] truncate" title={log.user_agent}>
                                                    <Monitor className="w-3 h-3 shrink-0" />
                                                    <span className="truncate">{log.user_agent || 'Browser Client'}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Action Button */}
                                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                            <button
                                                onClick={() => {
                                                    setSelectedLog(log);
                                                    setShowDetailModal(true);
                                                }}
                                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                                                title="Lihat Detail Rincian Audit Log"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && meta.total > 0 && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
                        <span className="text-xs text-slate-500">
                            Menampilkan <strong className="font-semibold text-slate-800 dark:text-slate-200">{logs.length}</strong> dari <strong className="font-semibold text-slate-800 dark:text-slate-200">{meta.total}</strong> catatan audit log
                        </span>

                        <div className="flex items-center space-x-2">
                            <button
                                disabled={meta.current_page <= 1}
                                onClick={() => fetchAuditLogs(meta.current_page - 1)}
                                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-50"
                            >
                                Sebelumnya
                            </button>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-2">
                                {meta.current_page} / {meta.last_page}
                            </span>
                            <button
                                disabled={meta.current_page >= meta.last_page}
                                onClick={() => fetchAuditLogs(meta.current_page + 1)}
                                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-50"
                            >
                                Selanjutnya
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Detail Inspection (Diff Viewer) */}
            {showDetailModal && selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="w-full max-w-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 my-8">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div>
                                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <Code className="w-5 h-5 text-indigo-500" /> Rincian Log Audit #{selectedLog.id}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {formatDateTime(selectedLog.created_at)} · {selectedLog.user_name} ({selectedLog.user_role})
                                </p>
                            </div>
                            <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Log Meta Highlights */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                            <div>
                                <span className="text-[10px] text-slate-400 font-semibold block">Modul</span>
                                <strong className="font-bold text-slate-900 dark:text-slate-100">{selectedLog.module}</strong>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-semibold block">Aksi</span>
                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${getActionBadge(selectedLog.action)}`}>
                                    {selectedLog.action}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-semibold block">IP Address</span>
                                <span className="font-mono text-slate-900 dark:text-slate-100">{selectedLog.ip_address || '127.0.0.1'}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-semibold block">Entitas</span>
                                <span className="font-mono text-slate-900 dark:text-slate-100">{selectedLog.entity_type || '-'} #{selectedLog.entity_id || ''}</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Aktivitas</label>
                            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200">
                                {selectedLog.description}
                            </div>
                        </div>

                        {/* JSON Diff Inspector (Old vs New Values) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                                    <span>Data Sebelum (Old Values)</span>
                                    <span className="text-[10px] text-rose-500 font-semibold">Previous State</span>
                                </label>
                                <pre className="p-3.5 bg-slate-950 text-rose-400 font-mono text-[11px] rounded-xl overflow-x-auto border border-slate-800 max-h-56 leading-relaxed">
                                    {selectedLog.old_values ? JSON.stringify(selectedLog.old_values, null, 2) : '// Tidak ada data sebelumnya'}
                                </pre>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                                    <span>Data Sesudah (New Values)</span>
                                    <span className="text-[10px] text-emerald-400 font-semibold">Updated State</span>
                                </label>
                                <pre className="p-3.5 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto border border-slate-800 max-h-56 leading-relaxed">
                                    {selectedLog.new_values ? JSON.stringify(selectedLog.new_values, null, 2) : '// Tidak ada data perubahannya'}
                                </pre>
                            </div>
                        </div>

                        {/* User Agent Info */}
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3">
                            <span className="font-semibold block mb-0.5">User-Agent Perangkat:</span>
                            <span className="font-mono text-[10px] block break-all bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                                {selectedLog.user_agent || '-'}
                            </span>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Clear Audit Logs */}
            {showClearModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center space-x-3 text-rose-500">
                            <AlertTriangle className="w-6 h-6 shrink-0" />
                            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Bersihkan Audit Log Lama</h3>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Penghapusan ini akan membersihkan seluruh log aktivitas sistem yang lebih lama dari jumlah hari yang Anda tentukan di bawah ini. Tindakan ini tidak dapat dibatalkan.
                        </p>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Hapus Log Lebih Lama Dari:
                            </label>
                            <select
                                value={clearDays}
                                onChange={(e) => setClearDays(e.target.value)}
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-bold"
                            >
                                <option value="7">Lebih lama dari 7 Hari</option>
                                <option value="30">Lebih lama dari 30 Hari (1 Bulan)</option>
                                <option value="90">Lebih lama dari 90 Hari (3 Bulan)</option>
                                <option value="180">Lebih lama dari 180 Hari (6 Bulan)</option>
                            </select>
                        </div>

                        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => setShowClearModal(false)}
                                disabled={clearing}
                                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleClearLogs}
                                disabled={clearing}
                                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center space-x-1.5 disabled:opacity-50"
                            >
                                {clearing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                <span>{clearing ? 'Memproses...' : 'Ya, Hapus Log'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
