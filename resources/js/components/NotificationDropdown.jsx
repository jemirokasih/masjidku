import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
    Bell,
    Check,
    CheckCheck,
    Trash2,
    FileText,
    Banknote,
    CalendarDays,
    AlertTriangle,
    Sparkles,
    CheckCircle2,
    FolderKanban,
    RefreshCw,
    X,
    ExternalLink,
    Truck,
    FileSignature,
    ArrowRight
} from 'lucide-react';

export default function NotificationDropdown() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // 'all' or 'unread'
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get('/notifications?limit=30');
            if (res.data && res.data.status === 'success') {
                setNotifications(res.data.data || []);
                setUnreadCount(res.data.unread_count || 0);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Polling every 30 seconds for live updates
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark read:', err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.post('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all read:', err);
        }
    };

    const handleDelete = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            await api.delete(`/notifications/${id}`);
            const deletedItem = notifications.find(n => n.id === id);
            if (deletedItem && !deletedItem.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    const handleItemClick = (item) => {
        if (!item.is_read) {
            handleMarkAsRead(item.id);
        }
        setOpen(false);
        if (item.link) {
            navigate(item.link);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'payroll':
            case 'payment':
                return <Banknote className="w-4 h-4 text-emerald-400" />;
            case 'invoice':
            case 'quote':
                return <FileText className="w-4 h-4 text-blue-400" />;
            case 'leave':
                return <CalendarDays className="w-4 h-4 text-purple-400" />;
            case 'reimbursement':
            case 'warning':
                return <AlertTriangle className="w-4 h-4 text-amber-400" />;
            case 'delivery_order':
                return <Truck className="w-4 h-4 text-orange-400" />;
            case 'contract':
                return <FileSignature className="w-4 h-4 text-indigo-400" />;
            case 'project':
                return <FolderKanban className="w-4 h-4 text-cyan-400" />;
            case 'system':
            default:
                return <Sparkles className="w-4 h-4 text-indigo-400" />;
        }
    };

    const getIconBg = (type) => {
        switch (type) {
            case 'payroll':
            case 'payment':
                return 'bg-emerald-500/10 border-emerald-500/20';
            case 'invoice':
            case 'quote':
                return 'bg-blue-500/10 border-blue-500/20';
            case 'leave':
                return 'bg-purple-500/10 border-purple-500/20';
            case 'reimbursement':
            case 'warning':
                return 'bg-amber-500/10 border-amber-500/20';
            case 'delivery_order':
                return 'bg-orange-500/10 border-orange-500/20';
            case 'contract':
                return 'bg-indigo-500/10 border-indigo-500/20';
            case 'project':
                return 'bg-cyan-500/10 border-cyan-500/20';
            case 'system':
            default:
                return 'bg-indigo-500/10 border-indigo-500/20';
        }
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffSeconds = Math.floor((now - date) / 1000);

        if (diffSeconds < 60) return 'Baru saja';
        if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} menit lalu`;
        if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} jam lalu`;
        if (diffSeconds < 172800) return 'Kemarin';
        return `${Math.floor(diffSeconds / 86400)} hari lalu`;
    };

    const filteredNotifications = activeTab === 'unread'
        ? notifications.filter(n => !n.is_read)
        : notifications;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Trigger Button */}
            <button
                onClick={() => setOpen(!open)}
                className={`p-2 rounded-lg border transition-all relative ${
                    open
                        ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title="Notifikasi Sistem"
            >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-extrabold shadow-sm animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Popover */}
            {open && (
                <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    {/* Header */}
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Bell className="w-4 h-4 text-blue-500" />
                                <span>Notifikasi</span>
                            </h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                    {unreadCount} Baru
                                </span>
                            )}
                        </div>

                        <div className="flex items-center space-x-1">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors flex items-center space-x-1"
                                    title="Tandai Semua Telah Dibaca"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    <span>Dibaca Semua</span>
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex border-b border-slate-200 dark:border-slate-800 px-3 pt-2 bg-white dark:bg-[#0f172a] text-xs font-semibold">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`pb-2 px-3 border-b-2 transition-all ${
                                activeTab === 'all'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            Semua ({notifications.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('unread')}
                            className={`pb-2 px-3 border-b-2 transition-all ${
                                activeTab === 'unread'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            Belum Dibaca ({unreadCount})
                        </button>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                        {loading && notifications.length === 0 ? (
                            <div className="p-6 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
                                <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                                <span>Memuat notifikasi...</span>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="p-8 text-center space-y-2">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800/80 mx-auto flex items-center justify-center text-slate-400">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                </div>
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tidak ada notifikasi {activeTab === 'unread' ? 'belum dibaca' : ''}</p>
                                <p className="text-[11px] text-slate-400">Semua aktivitas dan informasi terbaru akan muncul di sini secara real-time.</p>
                            </div>
                        ) : (
                            filteredNotifications.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleItemClick(item)}
                                    className={`p-3.5 transition-colors cursor-pointer flex items-start space-x-3 group relative ${
                                        !item.is_read
                                            ? 'bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                    }`}
                                >
                                    {/* Icon Container */}
                                    <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${getIconBg(item.type)}`}>
                                        {getIcon(item.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 pr-6">
                                        <div className="flex items-center justify-between gap-1 mb-0.5">
                                            <p className={`text-xs truncate ${!item.is_read ? 'font-bold text-slate-900 dark:text-slate-100' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                                                {item.title}
                                            </p>
                                            <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                                                {formatTimeAgo(item.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                            {item.message}
                                        </p>
                                        {item.link && (
                                            <span className="inline-flex items-center space-x-1 text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-1 hover:underline">
                                                <span>Buka detail</span>
                                                <ExternalLink className="w-2.5 h-2.5" />
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Buttons & Unread Badge */}
                                    <div className="absolute right-2 top-3 flex items-center space-x-1 opacity-80 group-hover:opacity-100">
                                        {!item.is_read && (
                                            <button
                                                onClick={(e) => handleMarkAsRead(item.id, e)}
                                                className="p-1 rounded text-slate-400 hover:text-blue-500 hover:bg-blue-500/10"
                                                title="Tandai dibaca"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => handleDelete(item.id, e)}
                                            className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10"
                                            title="Hapus notifikasi"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {!item.is_read && (
                                        <span className="absolute left-1.5 top-1.5 w-2 h-2 rounded-full bg-blue-500 shadow-sm"></span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                        <button
                            onClick={fetchNotifications}
                            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center space-x-1"
                        >
                            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                            <span>Perbarui Feed</span>
                        </button>
                        <button
                            onClick={() => {
                                setOpen(false);
                                navigate('/notifications');
                            }}
                            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                        >
                            <span>Lihat Semua</span>
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
