import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/axios';
import { useConfirm } from '../../../context/ConfirmContext';
import SearchableSelect from '../../../components/SearchableSelect';
import {
    Clock,
    RefreshCw,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Calendar,
    Timer,
    User,
    Search,
    FileText,
    Settings,
    X
} from 'lucide-react';

const STATUS_BADGE = {
    PENDING:  { label: 'Menunggu', cls: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300/40', icon: <AlertCircle className="w-3 h-3" /> },
    APPROVED: { label: 'Disetujui', cls: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300/40', icon: <CheckCircle2 className="w-3 h-3" /> },
    REJECTED: { label: 'Ditolak', cls: 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-300/40', icon: <XCircle className="w-3 h-3" /> },
};

export default function OvertimeManagementPage() {
    const { confirm } = useConfirm();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('PENDING');
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
    const [search, setSearch] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectTarget, setRejectTarget] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [processing, setProcessing] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter) params.status = statusFilter;
            if (yearFilter) params.year = yearFilter;
            const res = await api.get('/hr/overtime-requests', { params });
            setRequests(res.data.data || []);
        } catch (err) {
            console.error('Gagal memuat data lembur:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [statusFilter, yearFilter]);

    const handleApprove = async (id, employeeName) => {
        const ok = await confirm({
            title: 'Setujui Pengajuan Lembur',
            message: `Setujui pengajuan lembur dari ${employeeName}? Lembur ini akan otomatis dihitung saat payroll periode terkait dikalkulasi.`,
            confirmText: 'Ya, Setujui',
            type: 'success',
        });
        if (!ok) return;
        setProcessing(true);
        try {
            await api.post(`/hr/overtime-requests/${id}/approve`);
            fetchData();
        } catch (err) {
            alert('Gagal menyetujui: ' + (err.response?.data?.message || err.message));
        } finally {
            setProcessing(false);
        }
    };

    const openRejectModal = (req) => {
        setRejectTarget(req);
        setRejectReason('');
        setShowRejectModal(true);
    };

    const handleReject = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await api.post(`/hr/overtime-requests/${rejectTarget.id}/reject`, { rejected_reason: rejectReason });
            setShowRejectModal(false);
            fetchData();
        } catch (err) {
            alert('Gagal menolak: ' + (err.response?.data?.message || err.message));
        } finally {
            setProcessing(false);
        }
    };

    const filtered = requests.filter(r => {
        if (!search) return true;
        const name = r.employee?.full_name?.toLowerCase() || '';
        const code = r.employee?.employee_code?.toLowerCase() || '';
        return name.includes(search.toLowerCase()) || code.includes(search.toLowerCase());
    });

    const statuses = [
        { value: 'PENDING', label: 'Menunggu Persetujuan' },
        { value: 'APPROVED', label: 'Disetujui' },
        { value: 'REJECTED', label: 'Ditolak' },
        { value: '', label: 'Semua Status' },
    ];

    const years = ['2026', '2025', '2024'].map(y => ({ value: y, label: `Tahun ${y}` }));

    const pendingCount = requests.filter(r => r.status === 'PENDING').length;

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                            Manajemen Lembur
                            {pendingCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold">{pendingCount}</span>
                            )}
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Review dan setujui pengajuan lembur karyawan.</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 self-start">
                    <Link
                        to="/settings?tab=overtime"
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors font-semibold text-xs flex items-center space-x-1.5 shadow-sm"
                    >
                        <Settings className="w-3.5 h-3.5 text-orange-500" />
                        <span>Pengaturan Lembur</span>
                    </Link>
                    <button onClick={fetchData} className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 hover:text-slate-900 transition-colors">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="w-52">
                    <SearchableSelect options={statuses} value={statusFilter} onChange={setStatusFilter} placeholder="Filter Status..." />
                </div>
                <div className="w-36">
                    <SearchableSelect options={years} value={yearFilter} onChange={setYearFilter} placeholder="Tahun..." />
                </div>
                <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari nama karyawan..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-8 pr-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="py-16 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-500" />
                        <span>Memuat data...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center text-slate-400">
                        <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                        <div className="font-semibold text-slate-600 dark:text-slate-400 text-sm">Tidak ada data lembur</div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-400">Karyawan</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-400">Tanggal</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-400">Waktu</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-400">Durasi</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-400">Alasan</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-400">Status</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-400">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filtered.map((req) => {
                                    const badge = STATUS_BADGE[req.status] || STATUS_BADGE.PENDING;
                                    return (
                                        <tr key={req.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-[11px]">
                                                        {req.employee?.full_name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-900 dark:text-slate-100">{req.employee?.full_name}</div>
                                                        <div className="text-[10px] text-slate-400">{req.employee?.employee_code}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-orange-500" />
                                                    {req.date}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                                                {req.start_time?.substring(0,5)} – {req.end_time?.substring(0,5)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                                                    <Timer className="w-3.5 h-3.5" />
                                                    {req.duration_hours} jam
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-[180px] truncate">
                                                {req.reason || '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold border text-[10px] uppercase ${badge.cls}`}>
                                                    {badge.icon} {badge.label}
                                                </span>
                                                {req.status === 'REJECTED' && req.rejected_reason && (
                                                    <div className="text-[10px] text-rose-500 mt-0.5 italic max-w-[180px] truncate">"{req.rejected_reason}"</div>
                                                )}
                                                {req.status === 'APPROVED' && req.payroll_period_id && (
                                                    <div className="text-[10px] text-emerald-500 mt-0.5">✓ Masuk payroll</div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                {req.status === 'PENDING' && (
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            onClick={() => handleApprove(req.id, req.employee?.full_name)}
                                                            disabled={processing}
                                                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm disabled:opacity-60 transition-colors"
                                                        >
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Setujui
                                                        </button>
                                                        <button
                                                            onClick={() => openRejectModal(req)}
                                                            disabled={processing}
                                                            className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-[10px] font-bold flex items-center gap-1 border border-rose-200 dark:border-rose-800/40 hover:bg-rose-100 disabled:opacity-60 transition-colors"
                                                        >
                                                            <XCircle className="w-3 h-3" />
                                                            Tolak
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            {showRejectModal && rejectTarget && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-rose-500" />
                                Tolak Pengajuan Lembur
                            </h3>
                            <button onClick={() => setShowRejectModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleReject} className="p-5 space-y-4">
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                Tolak pengajuan lembur dari <strong>{rejectTarget.employee?.full_name}</strong> pada {rejectTarget.date} ({rejectTarget.duration_hours} jam).
                            </p>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Alasan Penolakan (Opsional)</label>
                                <textarea
                                    rows={3}
                                    placeholder="Contoh: Tidak ada pekerjaan mendesak pada tanggal tersebut..."
                                    value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)}
                                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500 resize-none"
                                />
                            </div>
                            <div className="flex items-center justify-end gap-3">
                                <button type="button" onClick={() => setShowRejectModal(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                    Batal
                                </button>
                                <button type="submit" disabled={processing}
                                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-md disabled:opacity-60 transition-all">
                                    {processing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                    Tolak Pengajuan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
