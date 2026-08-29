import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
    Bell,
    Check,
    CheckCheck,
    Trash2,
    Search,
    Filter,
    FileText,
    Banknote,
    CalendarDays,
    AlertTriangle,
    Sparkles,
    CheckCircle2,
    FolderKanban,
    Truck,
    FileSignature,
    RefreshCw,
    ExternalLink,
    Clock,
    Layers,
    ChevronLeft,
    ChevronRight,
    Eraser
} from 'lucide-react';

export default function NotificationListPage() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // all, unread, hr, finance, project, system
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [actionLoading, setActionLoading] = useState(false);

    const fetchNotifications = async (targetPage = 1) => {
        try {
            setLoading(true);
            let url = `/notifications?page=${targetPage}&per_page=15`;
            
            if (search) {
                url += `&search=${encodeURIComponent(search)}`;
            }

            if (activeTab === 'unread') {
                url += '&unread_only=1';
            } else if (activeTab === 'hr') {
                url += '&type=leave';
            } else if (activeTab === 'finance') {
                url += '&type=invoice';
            } else if (activeTab === 'project') {
                url += '&type=project';
            } else if (activeTab === 'system') {
                url += '&type=system';
            }

            const res = await api.get(url);
            if (res.data && res.data.status === 'success') {
                setNotifications(res.data.data || []);
                setMeta(res.data.meta || { current_page: targetPage, last_page: 1, total: res.data.data?.length || 0 });
                setUnreadCount(res.data.unread_count || 0);
            }
        } catch (err) {
            console.error('Failed to load notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications(page);
    }, [page, activeTab]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchNotifications(1);
    };

    const handleMarkAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification read:', err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            setActionLoading(true);
            await api.post('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            const deletedItem = notifications.find(n => n.id === id);
            if (deletedItem && !deletedItem.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            setNotifications(prev => prev.filter(n => n.id !== id));
            setMeta(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    const handleClearRead = async () => {
        if (!window.confirm('Bersihkan semua notifikasi yang sudah dibaca?')) return;
        try {
            setActionLoading(true);
            await api.post('/notifications/clear-all', { only_read: true });
            fetchNotifications(1);
        } catch (err) {
            console.error('Failed to clear read notifications:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm('PERINGATAN: Apakah Anda yakin ingin menghapus SELURUH notifikasi?')) return;
        try {
            setActionLoading(true);
            await api.post('/notifications/clear-all', { only_read: false });
            fetchNotifications(1);
        } catch (err) {
            console.error('Failed to clear all notifications:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'payroll':
            case 'payment':
                return <Banknote className="w-5 h-5 text-emerald-400" />;
            case 'invoice':
            case 'quote':
                return <FileText className="w-5 h-5 text-blue-400" />;
            case 'leave':
                return <CalendarDays className="w-5 h-5 text-purple-400" />;
            case 'reimbursement':
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-amber-400" />;
            case 'delivery_order':
                return <Truck className="w-5 h-5 text-orange-400" />;
            case 'contract':
                return <FileSignature className="w-5 h-5 text-indigo-400" />;
            case 'project':
                return <FolderKanban className="w-5 h-5 text-cyan-400" />;
            case 'system':
            default:
                return <Sparkles className="w-5 h-5 text-indigo-400" />;
        }
    };

    const getIconBg = (type) => {
        switch (type) {
            case 'payroll':
            case 'payment':
                return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
            case 'invoice':
            case 'quote':
                return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
            case 'leave':
                return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
            case 'reimbursement':
            case 'warning':
                return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
            case 'delivery_order':
                return 'bg-orange-500/10 border-orange-500/20 text-orange-400';
            case 'contract':
                return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
            case 'project':
                return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400';
            case 'system':
            default:
                return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
        }
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffSeconds = Math.floor((now - date) / 1000);

        if (diffSeconds < 60) return 'Baru saja';
        if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} menit yang lalu`;
        if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} jam yang lalu`;
        if (diffSeconds < 172800) return 'Kemarin';
        return `${Math.floor(diffSeconds / 86400)} hari yang lalu (${date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })})`;
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex items-center space-x-4">
                    <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400">
                        <Bell className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="flex items-center space-x-3">
                            <h1 className="text-2xl font-bold text-white tracking-tight">Pusat Notifikasi</h1>
                            {unreadCount > 0 && (
                                <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse">
                                    {unreadCount} Belum Dibaca
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                            Pemberitahuan aktivitas sistem secara langsung dan terintegrasi dari seluruh modul.
                        </p>
                    </div>
                </div>

                {/* Bulk Actions */}
                <div className="relative z-10 flex flex-wrap items-center gap-2.5">
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 flex items-center space-x-2 transition-all"
                        >
                            <CheckCheck className="w-4 h-4" />
                            <span>Tandai Semua Dibaca</span>
                        </button>
                    )}
                    <button
                        onClick={handleClearRead}
                        disabled={actionLoading}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center space-x-2 transition-all"
                        title="Bersihkan notifikasi yang sudah dibaca"
                    >
                        <Eraser className="w-4 h-4" />
                        <span>Bersihkan Terbaca</span>
                    </button>
                    <button
                        onClick={handleClearAll}
                        disabled={actionLoading}
                        className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl border border-rose-500/20 flex items-center space-x-2 transition-all"
                        title="Hapus seluruh notifikasi"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Hapus Semua</span>
                    </button>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                    {[
                        { id: 'all', label: 'Semua' },
                        { id: 'unread', label: `Belum Dibaca (${unreadCount})` },
                        { id: 'finance', label: 'Keuangan & Tagihan' },
                        { id: 'hr', label: 'HR & Cuti' },
                        { id: 'project', label: 'Proyek' },
                        { id: 'system', label: 'Sistem' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                setPage(1);
                            }}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                                activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari notifikasi..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                </form>
            </div>

            {/* Notification List Container */}
            <div className="space-y-3">
                {loading ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
                        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                        <p className="text-sm font-medium">Memuat riwayat notifikasi...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="text-base font-bold text-white">Tidak ada notifikasi</h3>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            Semua pembaruan tiket, invoice, penggajian, dan cuti akan tampil di sini saat terjadi pembaruan.
                        </p>
                    </div>
                ) : (
                    notifications.map((item) => (
                        <div
                            key={item.id}
                            className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                                !item.is_read
                                    ? 'bg-slate-900/90 border-blue-500/40 shadow-lg shadow-blue-500/5'
                                    : 'bg-slate-900 border-slate-800/80 hover:border-slate-700'
                            }`}
                        >
                            <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                                {/* Icon Badge */}
                                <div className={`p-3 rounded-2xl border shrink-0 mt-0.5 ${getIconBg(item.type)}`}>
                                    {getIcon(item.type)}
                                </div>

                                {/* Content Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h4 className={`text-sm ${!item.is_read ? 'font-bold text-white' : 'font-semibold text-slate-300'}`}>
                                            {item.title}
                                        </h4>
                                        {!item.is_read && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500 text-white">
                                                BARU
                                            </span>
                                        )}
                                        <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{formatTimeAgo(item.created_at)}</span>
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                                        {item.message}
                                    </p>
                                    {item.link && (
                                        <button
                                            onClick={() => navigate(item.link)}
                                            className="inline-flex items-center space-x-1 text-xs font-bold text-blue-400 hover:text-blue-300 mt-2 hover:underline"
                                        >
                                            <span>Buka Dokumen / Halaman Terkait</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-2 self-end sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800 w-full sm:w-auto justify-end">
                                {!item.is_read && (
                                    <button
                                        onClick={() => handleMarkAsRead(item.id)}
                                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-all"
                                        title="Tandai telah dibaca"
                                    >
                                        <Check className="w-3.5 h-3.5 text-blue-400" />
                                        <span>Tandai Dibaca</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                                    title="Hapus notifikasi"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {meta.last_page > 1 && (
                <div className="flex items-center justify-between bg-slate-900 border border-slate-800 px-6 py-4 rounded-2xl text-xs font-semibold text-slate-400">
                    <div>
                        Menampilkan halaman <span className="text-white">{meta.current_page}</span> dari <span className="text-white">{meta.last_page}</span> ({meta.total} notifikasi)
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                            disabled={meta.current_page <= 1}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center space-x-1"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Sebelumnya</span>
                        </button>
                        <button
                            onClick={() => setPage(prev => Math.min(meta.last_page, prev + 1))}
                            disabled={meta.current_page >= meta.last_page}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center space-x-1"
                        >
                            <span>Berikutnya</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
