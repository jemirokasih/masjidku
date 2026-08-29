import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import { useConfirm } from '../../../context/ConfirmContext';
import SearchableSelect from '../../../components/SearchableSelect';
import {
    Clock,
    Plus,
    RefreshCw,
    Trash2,
    Edit3,
    X,
    Save,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Calendar,
    Timer,
    FileText
} from 'lucide-react';

const STATUS_BADGE = {
    PENDING:  { label: 'Menunggu Persetujuan', cls: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300/40', icon: <AlertCircle className="w-3 h-3" /> },
    APPROVED: { label: 'Disetujui',            cls: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300/40', icon: <CheckCircle2 className="w-3 h-3" /> },
    REJECTED: { label: 'Ditolak',              cls: 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-300/40', icon: <XCircle className="w-3 h-3" /> },
};

const emptyForm = {
    date: '',
    start_time: '',
    end_time: '',
    reason: '',
};

function computeDuration(start, end) {
    if (!start || !end) return null;
    const [sh, sm] = start.split(':').map(Number);
    let [eh, em] = end.split(':').map(Number);
    let totalMin = (eh * 60 + em) - (sh * 60 + sm);
    if (totalMin <= 0) totalMin += 24 * 60; // past midnight
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return m > 0 ? `${h} jam ${m} menit` : `${h} jam`;
}

export default function OvertimeRequestPage() {
    const { user } = useAuth();
    const { confirm } = useConfirm();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
    const [statusFilter, setStatusFilter] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {};
            if (yearFilter) params.year = yearFilter;
            if (statusFilter) params.status = statusFilter;
            const res = await api.get('/hr/overtime-requests', { params });
            setRequests(res.data.data || []);
        } catch (err) {
            console.error('Gagal memuat pengajuan lembur:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [yearFilter, statusFilter]);

    const openCreate = () => {
        setEditingId(null);
        setForm({ ...emptyForm, date: new Date().toISOString().split('T')[0] });
        setShowModal(true);
    };

    const openEdit = (req) => {
        setEditingId(req.id);
        setForm({
            date: req.date,
            start_time: req.start_time?.substring(0, 5) || '',
            end_time: req.end_time?.substring(0, 5) || '',
            reason: req.reason || '',
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.date || !form.start_time || !form.end_time) {
            alert('Tanggal, jam mulai, dan jam selesai wajib diisi!');
            return;
        }
        setSubmitting(true);
        try {
            if (editingId) {
                await api.put(`/hr/overtime-requests/${editingId}`, form);
                alert('Pengajuan lembur berhasil diperbarui!');
            } else {
                await api.post('/hr/overtime-requests', form);
                alert('Pengajuan lembur berhasil dikirim!');
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            alert('Gagal menyimpan: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        const ok = await confirm({
            title: 'Batalkan Pengajuan Lembur',
            message: 'Yakin ingin membatalkan pengajuan lembur ini?',
            confirmText: 'Ya, Batalkan',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/hr/overtime-requests/${id}`);
            fetchData();
        } catch (err) {
            alert('Gagal membatalkan: ' + (err.response?.data?.message || err.message));
        }
    };

    const duration = computeDuration(form.start_time, form.end_time);

    const years = ['2026', '2025', '2024'].map(y => ({ value: y, label: `Tahun ${y}` }));
    const statuses = [
        { value: '', label: 'Semua Status' },
        { value: 'PENDING', label: 'Menunggu' },
        { value: 'APPROVED', label: 'Disetujui' },
        { value: 'REJECTED', label: 'Ditolak' },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Pengajuan Lembur</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Ajukan lembur dan pantau status persetujuan.</p>
                    </div>
                </div>
                <button
                    onClick={openCreate}
                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center space-x-2 shadow-md shadow-orange-500/20 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    <span>Ajukan Lembur</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="w-36">
                    <SearchableSelect options={years} value={yearFilter} onChange={setYearFilter} placeholder="Tahun..." />
                </div>
                <div className="w-44">
                    <SearchableSelect options={statuses} value={statusFilter} onChange={setStatusFilter} placeholder="Status..." />
                </div>
                <button onClick={fetchData} className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="py-16 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-500" />
                        <span>Memuat data...</span>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="py-16 text-center text-slate-400">
                        <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                        <div className="font-semibold text-slate-600 dark:text-slate-400 text-sm">Belum ada pengajuan lembur</div>
                        <p className="text-xs text-slate-400 mt-1">Klik tombol "Ajukan Lembur" untuk membuat pengajuan baru.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-400">Tanggal</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-400">Waktu</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-400">Durasi</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-400">Alasan</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-400">Status</th>
                                    <th className="py-3 px-4 text-left font-semibold text-slate-600 dark:text-slate-400">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {requests.map((req) => {
                                    const badge = STATUS_BADGE[req.status] || STATUS_BADGE.PENDING;
                                    return (
                                        <tr key={req.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
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
                                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-[200px] truncate">
                                                {req.reason || '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold border text-[10px] uppercase ${badge.cls}`}>
                                                    {badge.icon}
                                                    {badge.label}
                                                </span>
                                                {req.status === 'REJECTED' && req.rejected_reason && (
                                                    <div className="text-[10px] text-rose-500 mt-0.5 italic">"{req.rejected_reason}"</div>
                                                )}
                                                {req.status === 'APPROVED' && req.payroll_period_id && (
                                                    <div className="text-[10px] text-emerald-500 mt-0.5">✓ Sudah masuk payroll</div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                {req.status === 'PENDING' && (
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            onClick={() => openEdit(req)}
                                                            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(req.id)}
                                                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                                                            title="Batalkan"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
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

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-orange-500" />
                                {editingId ? 'Edit Pengajuan Lembur' : 'Ajukan Lembur Baru'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            {/* Tanggal */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Tanggal Lembur *</label>
                                <input
                                    type="date"
                                    required
                                    value={form.date}
                                    onChange={e => setForm({ ...form, date: e.target.value })}
                                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                                />
                            </div>

                            {/* Jam mulai & selesai */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Jam Mulai *</label>
                                    <input
                                        type="time"
                                        required
                                        value={form.start_time}
                                        onChange={e => setForm({ ...form, start_time: e.target.value })}
                                        className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Jam Selesai *</label>
                                    <input
                                        type="time"
                                        required
                                        value={form.end_time}
                                        onChange={e => setForm({ ...form, end_time: e.target.value })}
                                        className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                            </div>

                            {/* Preview durasi */}
                            {duration && (
                                <div className="px-3.5 py-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/40 text-xs text-orange-800 dark:text-orange-300 flex items-center gap-2">
                                    <Timer className="w-3.5 h-3.5 text-orange-500" />
                                    <span>Durasi lembur: <strong>{duration}</strong></span>
                                </div>
                            )}

                            {/* Alasan */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Alasan / Keterangan</label>
                                <textarea
                                    rows={3}
                                    placeholder="Contoh: Penyelesaian deadline proyek Sistem Informasi XYZ..."
                                    value={form.reason}
                                    onChange={e => setForm({ ...form, reason: e.target.value })}
                                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500 resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                    Batal
                                </button>
                                <button type="submit" disabled={submitting}
                                    className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-orange-500/20 disabled:opacity-60 transition-all">
                                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {editingId ? 'Simpan Perubahan' : 'Kirim Pengajuan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
