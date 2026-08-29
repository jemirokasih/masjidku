import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
    CheckSquare,
    Calendar,
    Clock,
    AlertCircle,
    RefreshCw,
    FolderKanban,
    CheckCircle2,
    List,
    LayoutGrid,
    Search,
    Building2
} from 'lucide-react';

export default function MyTasksPage() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED'
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'kanban'

    const fetchMyTasks = async () => {
        setLoading(true);
        try {
            const res = await api.get('/my-tasks');
            setTasks(res.data.data || []);
        } catch (err) {
            console.error('Error fetching my tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyTasks();
    }, []);

    const handleStatusChange = async (projectId, taskId, newStatus) => {
        try {
            await api.put(`/projects/${projectId}/tasks/${taskId}`, { status: newStatus });
            // Update local state
            setTasks(prevTasks =>
                prevTasks.map(t => (t.id === taskId ? { ...t, status: newStatus } : t))
            );
        } catch (err) {
            console.error('Error updating task status:', err);
            alert('Gagal memperbarui status tugas.');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getPriorityBadge = (p) => {
        switch (String(p).toUpperCase()) {
            case 'URGENT':
                return <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 font-extrabold text-[9px] uppercase tracking-wider">Urgent</span>;
            case 'HIGH':
                return <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold text-[9px] uppercase tracking-wider">Tinggi</span>;
            case 'MEDIUM':
                return <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 font-semibold text-[9px] uppercase tracking-wider">Sedang</span>;
            default:
                return <span className="px-2 py-0.5 rounded bg-slate-500/10 text-slate-500 border border-slate-500/20 text-[9px] uppercase tracking-wider">Rendah</span>;
        }
    };

    const filteredTasks = tasks.filter(t => {
        const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
        const matchesSearch =
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.project?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const kanbanColumns = [
        { id: 'TODO', title: 'TODO', bgColor: 'bg-slate-50 dark:bg-slate-900/40', headerColor: 'text-slate-600 dark:text-slate-400 border-slate-300/40' },
        { id: 'IN_PROGRESS', title: 'IN PROGRESS', bgColor: 'bg-blue-50/20 dark:bg-blue-950/10', headerColor: 'text-blue-600 dark:text-blue-400 border-blue-300/30' },
        { id: 'IN_REVIEW', title: 'IN REVIEW', bgColor: 'bg-amber-50/20 dark:bg-amber-950/10', headerColor: 'text-amber-600 dark:text-amber-400 border-amber-300/30' },
        { id: 'COMPLETED', title: 'COMPLETED', bgColor: 'bg-emerald-50/20 dark:bg-emerald-950/10', headerColor: 'text-emerald-600 dark:text-emerald-400 border-emerald-300/30' },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shadow-sm">
                        <CheckSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight animate-fade-in">
                            Tugas Saya (My Tasks)
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Kelola dan pantau semua tugas dari berbagai project yang ditugaskan kepada Anda.
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2 self-start md:self-auto">
                    {/* View Mode Toggle */}
                    <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-0.5 bg-slate-50 dark:bg-slate-900 shadow-sm mr-1">
                        <button
                            type="button"
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                                viewMode === 'list'
                                    ? 'bg-indigo-600 text-white shadow'
                                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                            title="Tampilan List"
                        >
                            <List className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline text-[10px]">Daftar</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('kanban')}
                            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                                viewMode === 'kanban'
                                    ? 'bg-indigo-600 text-white shadow'
                                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                            title="Tampilan Kanban Board"
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline text-[10px]">Kanban</span>
                        </button>
                    </div>

                    <button
                        onClick={fetchMyTasks}
                        className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 shadow-sm transition-colors"
                        title="Segarkan Data"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Filter Bar (Only shown for list view, kanban shows all by default) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari tugas, deskripsi, atau nama project..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                </div>

                {viewMode === 'list' && (
                    <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
                        {['ALL', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'].map((status) => (
                            <button
                                key={status}
                                type="button"
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                                    statusFilter === status
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/80'
                                }`}
                            >
                                {status === 'ALL' ? 'Semua' : status}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Area */}
            {loading ? (
                <div className="py-20 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center space-y-2">
                    <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-xs">Memuat tugas Anda...</p>
                </div>
            ) : viewMode === 'kanban' ? (
                /* Kanban Board View Layout */
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {kanbanColumns.map((col) => {
                        const colTasks = filteredTasks.filter(t => t.status === col.id) || [];
                        return (
                            <div
                                key={col.id}
                                onDragOver={(e) => e.preventDefault()}
                                id={col.id}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const rawData = e.dataTransfer.getData('text/plain');
                                    if (rawData) {
                                        try {
                                            const { taskId, projectId } = JSON.parse(rawData);
                                            handleStatusChange(projectId, taskId, col.id);
                                        } catch (err) {
                                            console.error('Drop parse error:', err);
                                        }
                                    }
                                }}
                                className={`rounded-2xl p-3 border border-slate-200 dark:border-slate-800/80 min-h-[450px] flex flex-col space-y-3 ${col.bgColor}`}
                            >
                                <div className={`flex items-center justify-between pb-2 border-b font-extrabold text-[10px] tracking-wider uppercase ${col.headerColor}`}>
                                    <span>{col.title}</span>
                                    <span className="px-2 py-0.5 rounded-full bg-slate-200/50 dark:bg-slate-800/60 font-mono text-[9px] font-bold text-slate-500">
                                        {colTasks.length}
                                    </span>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-2">
                                    {colTasks.length === 0 ? (
                                        <div className="h-full min-h-[80px] border border-dashed border-slate-200 dark:border-slate-800/50 rounded-xl flex items-center justify-center text-[10px] text-slate-400/80 italic">
                                            Tarik ke sini
                                        </div>
                                    ) : (
                                        colTasks.map((t) => (
                                            <div
                                                key={t.id}
                                                draggable
                                                onDragStart={(e) => {
                                                    e.dataTransfer.setData('text/plain', JSON.stringify({ taskId: t.id, projectId: t.project_id }));
                                                }}
                                                className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm space-y-2 hover:shadow transition-all cursor-grab active:cursor-grabbing relative"
                                            >
                                                <div className="space-y-1">
                                                    <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200 leading-tight block">
                                                        {t.title}
                                                    </span>
                                                    <div className="flex items-center space-x-1 py-0.5">
                                                        <Building2 className="w-3 h-3 text-indigo-500 shrink-0" />
                                                        <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                                                            {t.project?.name || 'Project Utama'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {t.description && (
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
                                                        {t.description}
                                                    </p>
                                                )}

                                                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800/60 text-[9px]">
                                                    <span className="text-slate-400 font-mono">
                                                        Tenggat: {t.due_date ? formatDate(t.due_date) : '-'}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between pt-1 text-[9px]">
                                                    {getPriorityBadge(t.priority)}
                                                    <select
                                                        value={t.status}
                                                        onChange={(e) => handleStatusChange(t.project_id, t.id, e.target.value)}
                                                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[9px] px-1 py-0.5 focus:outline-none cursor-pointer max-w-[70px]"
                                                    >
                                                        <option value="TODO">TODO</option>
                                                        <option value="IN_PROGRESS">WORK</option>
                                                        <option value="IN_REVIEW">REVIEW</option>
                                                        <option value="COMPLETED">DONE</option>
                                                    </select>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : tasks.length === 0 ? (
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center text-xs text-slate-500 dark:text-slate-400 space-y-3">
                    <CheckSquare className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">Tidak ada tugas untuk Anda</p>
                    <p className="text-slate-400">Anda belum ditugaskan pada tugas project apa pun saat ini.</p>
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-500 dark:text-slate-400">
                    Tidak ada tugas yang cocok dengan filter pencarian.
                </div>
            ) : (
                /* List View Layout */
                <div className="grid grid-cols-1 gap-3">
                    {filteredTasks.map((t) => (
                        <div
                            key={t.id}
                            className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                            <div className="space-y-1.5 flex-1">
                                <div className="flex items-center space-x-2">
                                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{t.title}</span>
                                    {getPriorityBadge(t.priority)}
                                </div>
                                {t.description && (
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{t.description}</p>
                                )}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-slate-400 pt-1">
                                    <span className="flex items-center space-x-1">
                                        <FolderKanban className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                        <span>Proyek: <strong className="text-slate-600 dark:text-slate-300 font-semibold">{t.project?.name || 'Project Utama'}</strong></span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span>Tenggat: <strong className="text-slate-600 dark:text-slate-300">{formatDate(t.due_date)}</strong></span>
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 self-end sm:self-auto min-w-[170px]">
                                <select
                                    value={t.status}
                                    onChange={(e) => handleStatusChange(t.project_id, t.id, e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500"
                                >
                                    <option value="TODO">TODO (Akan Dikerjakan)</option>
                                    <option value="IN_PROGRESS">IN PROGRESS (Sedang Dikerjakan)</option>
                                    <option value="IN_REVIEW">IN REVIEW (Pemeriksaan)</option>
                                    <option value="COMPLETED">COMPLETED (Selesai)</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

