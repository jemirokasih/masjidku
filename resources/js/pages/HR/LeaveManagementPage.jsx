import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmContext';
import SearchableSelect from '../../components/SearchableSelect';
import {
    CalendarDays,
    Plus,
    RefreshCw,
    Search,
    UserCheck,
    CheckCircle2,
    XCircle,
    Clock,
    Calendar,
    Edit3,
    Trash2,
    List,
    LayoutGrid,
    Check,
    X,
    AlertCircle,
    User,
    FileText,
    Save,
    SlidersHorizontal,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

export default function LeaveManagementPage() {
    const { confirm } = useConfirm();
    const navigate = useNavigate();
    const { user } = useAuth();
    const userRole = (user?.role || 'staff').toLowerCase();
    const isHrOrAdmin = ['superadmin', 'administrator', 'admin', 'hr', 'finance', 'project_manager'].includes(userRole);

    const [leaves, setLeaves] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');
    const [showAdvanceFilter, setShowAdvanceFilter] = useState(false);
    const [viewMode, setViewMode] = useState('table'); // 'table' (default) | 'grid'

    const activeFilterCount = [
        statusFilter,
        typeFilter,
        startDateFilter,
        endDateFilter,
    ].filter(Boolean).length;

    const handleResetFilters = () => {
        setStatusFilter('');
        setTypeFilter('');
        setStartDateFilter('');
        setEndDateFilter('');
    };

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelTargetId, setCancelTargetId] = useState(null);
    const [cancellationReasonInput, setCancellationReasonInput] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [processingApprovalId, setProcessingApprovalId] = useState(null);

    const emptyForm = {
        employee_id: '',
        leave_type: 'ANNUAL',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        reason: '',
    };
    const [form, setForm] = useState(emptyForm);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [leaveRes, empRes] = await Promise.all([
                api.get('/hr/leaves', {
                    params: {
                        search: searchTerm,
                        status: statusFilter,
                        leave_type: typeFilter,
                        start_date: startDateFilter || undefined,
                        end_date: endDateFilter || undefined,
                    }
                }),
                api.get('/employees').catch(() => ({ data: { data: [] } })),
            ]);

            setLeaves(leaveRes.data.data || []);
            setEmployees(empRes.data.data || []);
        } catch (err) {
            console.error('Error fetching leave data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm, statusFilter, typeFilter, startDateFilter, endDateFilter]);

    const formatDate = (d) => {
        if (!d) return '-';
        return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
        });
    };

    const calculateDays = (start, end) => {
        if (!start || !end) return 0;
        const s = new Date(start);
        const e = new Date(end);
        const diffTime = e - s;
        if (diffTime < 0) return 0;
        return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    const currentEmployee = employees.find(e => e.user_id === user?.id || (user?.email && e.email === user?.email));

    const handleOpenCreate = () => {
        navigate('/hr/leaves/create');
    };

    const handleOpenEdit = (leave) => {
        if (leave.status !== 'PENDING') {
            alert('Hanya pengajuan cuti berstatus PENDING yang dapat diubah.');
            return;
        }
        setEditingId(leave.id);
        setForm({
            employee_id: leave.employee_id || '',
            leave_type: leave.leave_type || 'ANNUAL',
            start_date: leave.start_date || new Date().toISOString().split('T')[0],
            end_date: leave.end_date || new Date().toISOString().split('T')[0],
            reason: leave.reason || '',
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.reason) {
            alert('Alasan pengajuan cuti wajib diisi!');
            return;
        }

        const submitData = { ...form };
        if (!isHrOrAdmin && currentEmployee) {
            submitData.employee_id = currentEmployee.id;
        }

        setSubmitting(true);
        try {
            if (editingId) {
                await api.put(`/hr/leaves/${editingId}`, submitData);
            } else {
                await api.post('/hr/leaves', submitData);
            }
            setShowModal(false);
            setForm(emptyForm);
            setEditingId(null);
            fetchData();
        } catch (err) {
            alert('Gagal menyimpan pengajuan cuti: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleApproval = async (id, status) => {
        const actionText = status === 'APPROVED' ? 'MENYETUJUI' : 'MENOLAK';
        const ok = await confirm({
            title: `${actionText} Pengajuan Cuti`,
            message: `Apakah Anda yakin ingin ${actionText} pengajuan cuti ini?`,
            confirmText: status === 'APPROVED' ? 'Ya, Setujui' : 'Ya, Tolak',
            variant: status === 'APPROVED' ? 'success' : 'danger',
        });
        if (!ok) return;

        setProcessingApprovalId(id);
        try {
            await api.post(`/hr/leaves/${id}/approve`, { status });
            fetchData();
        } catch (err) {
            alert('Gagal memproses approval: ' + (err.response?.data?.message || err.message));
        } finally {
            setProcessingApprovalId(null);
        }
    };

    const handleDelete = async (id) => {
        const ok = await confirm({
            title: 'Hapus Pengajuan Cuti',
            message: 'Yakin ingin menghapus data pengajuan cuti ini? Sisa kuota cuti akan dikembalikan jika sebelumnya disetujui.',
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/hr/leaves/${id}`);
            fetchData();
        } catch (err) {
            alert('Gagal menghapus cuti: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleOpenCancelModal = (id) => {
        setCancelTargetId(id);
        setCancellationReasonInput('');
        setShowCancelModal(true);
    };

    const handleConfirmCancelLeave = async (e) => {
        e.preventDefault();
        if (!cancellationReasonInput.trim()) {
            alert('Alasan pembatalan cuti wajib diisi!');
            return;
        }

        setSubmitting(true);
        try {
            await api.post(`/hr/leaves/${cancelTargetId}/cancel`, {
                cancellation_reason: cancellationReasonInput,
            });
            alert('Pengajuan cuti berhasil dibatalkan.');
            setShowCancelModal(false);
            setCancelTargetId(null);
            setCancellationReasonInput('');
            fetchData();
        } catch (err) {
            alert('Gagal membatalkan pengajuan cuti: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const getLeaveTypeBadge = (type) => {
        switch (type) {
            case 'ANNUAL':
                return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">CUTI TAHUNAN</span>;
            case 'SICK':
                return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">CUTI SAKIT</span>;
            case 'SPECIAL':
            default:
                return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">CUTI KHUSUS / IZIN</span>;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"><Clock className="w-3 h-3" /> PENDING</span>;
            case 'APPROVED':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"><CheckCircle2 className="w-3 h-3" /> APPROVED</span>;
            case 'REJECTED':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"><XCircle className="w-3 h-3" /> REJECTED</span>;
            case 'CANCELLED':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"><XCircle className="w-3 h-3 text-slate-400" /> DIBATALKAN</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">{status}</span>;
        }
    };

    const pendingCount = leaves.filter(l => l.status === 'PENDING').length;
    const approvedCount = leaves.filter(l => l.status === 'APPROVED').length;
    const rejectedCount = leaves.filter(l => l.status === 'REJECTED').length;

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span>Manajemen &amp; Pengajuan Cuti Karyawan</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Pengajuan cuti tahunan, cuti sakit, persetujuan (approval), &amp; rekapitulasi kuota sisa cuti.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all self-start md:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Ajukan Cuti Baru</span>
                </button>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Pengajuan</span>
                        <span className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">{leaves.length}</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Menunggu Approval</span>
                        <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">{pendingCount}</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Disetujui (Approved)</span>
                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">{approvedCount}</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                        <XCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Ditolak (Rejected)</span>
                        <span className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono">{rejectedCount}</span>
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
                            placeholder="Cari karyawan atau alasan cuti..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
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
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-200">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Status Approval</label>
                            <SearchableSelect
                                options={[
                                    { value: '', label: 'Semua Status Approval' },
                                    { value: 'PENDING', label: 'PENDING (Menunggu)' },
                                    { value: 'APPROVED', label: 'APPROVED (Disetujui)' },
                                    { value: 'REJECTED', label: 'REJECTED (Ditolak)' },
                                    { value: 'CANCELLED', label: 'CANCELLED (Dibatalkan)' },
                                ]}
                                value={statusFilter}
                                onChange={(val) => setStatusFilter(val)}
                                placeholder="Semua Status..."
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Tipe / Jenis Cuti</label>
                            <SearchableSelect
                                options={[
                                    { value: '', label: 'Semua Tipe Cuti' },
                                    { value: 'ANNUAL', label: 'Cuti Tahunan' },
                                    { value: 'SICK', label: 'Cuti Sakit' },
                                    { value: 'SPECIAL', label: 'Cuti Khusus / Izin' },
                                ]}
                                value={typeFilter}
                                onChange={(val) => setTypeFilter(val)}
                                placeholder="Semua Tipe..."
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Periode Durasi Tanggal</label>
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

            {/* List / Table or Grid View */}
            {loading ? (
                <div className="flex justify-center items-center min-h-[300px] text-xs text-slate-500 dark:text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mr-2 text-blue-600 dark:text-blue-400" />
                    <span>Memuat data permohonan cuti...</span>
                </div>
            ) : leaves.length === 0 ? (
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-xs text-slate-500 dark:text-slate-400 space-y-3">
                    <CalendarDays className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">Belum ada pengajuan cuti terdaftar</p>
                    <p className="text-slate-400">Klik &quot;Ajukan Cuti Baru&quot; untuk mengirimkan permohonan cuti.</p>
                </div>
            ) : viewMode === 'table' ? (
                /* TABLE VIEW (DEFAULT) */
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                    <th className="py-3 px-4">Nama Karyawan</th>
                                    <th className="py-3 px-4">Tipe Cuti</th>
                                    <th className="py-3 px-4">Periode Tanggal</th>
                                    <th className="py-3 px-4">Durasi</th>
                                    <th className="py-3 px-4">Alasan Pengajuan</th>
                                    <th className="py-3 px-4">Status Approval</th>
                                    <th className="py-3 px-4 text-right">Aksi &amp; Persetujuan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                {leaves.map((l) => (
                                    <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                                            <div>{l.employee?.full_name || 'Karyawan'}</div>
                                            <div className="text-[10px] font-mono text-slate-400">{l.employee?.position} &bull; Sisa Cuti: {l.employee?.leave_balance ?? '-'} Hari</div>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            {getLeaveTypeBadge(l.leave_type)}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                                            <div className="font-semibold">{formatDate(l.start_date)} s/d {formatDate(l.end_date)}</div>
                                        </td>
                                        <td className="py-3.5 px-4 font-extrabold font-mono text-slate-900 dark:text-slate-100">
                                            {l.total_days} Hari
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-xs">
                                            <span className="line-clamp-2">{l.reason}</span>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            {getStatusBadge(l.status)}
                                            {l.approver && (
                                                <div className="text-[10px] text-slate-400 mt-1">Oleh: {l.approver.name}</div>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end space-x-1.5">
                                                {/* Approval Buttons (HR / Admin Only) */}
                                                {isHrOrAdmin && l.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            disabled={processingApprovalId === l.id}
                                                            onClick={() => handleApproval(l.id, 'APPROVED')}
                                                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow-sm flex items-center gap-1 transition-all disabled:opacity-60"
                                                            title="Setujui (Approve) & Potong Sisa Cuti"
                                                        >
                                                            <Check className="w-3 h-3" />
                                                            <span>Setujui</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={processingApprovalId === l.id}
                                                            onClick={() => handleApproval(l.id, 'REJECTED')}
                                                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] shadow-sm flex items-center gap-1 transition-all disabled:opacity-60"
                                                            title="Tolak (Reject)"
                                                        >
                                                            <X className="w-3 h-3" />
                                                            <span>Tolak</span>
                                                        </button>
                                                    </>
                                                )}

                                                 {/* Batalkan Cuti (Available for Staff / Employee ONLY if status is PENDING) */}
                                                 {!isHrOrAdmin && l.status === 'PENDING' && (
                                                     <button
                                                         type="button"
                                                         onClick={() => handleOpenCancelModal(l.id)}
                                                         className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 font-bold text-[10px] flex items-center gap-1 transition-colors border border-amber-500/20"
                                                         title="Batalkan Pengajuan Cuti (Hanya jika PENDING)"
                                                     >
                                                         <XCircle className="w-3 h-3" />
                                                         <span>Batalkan</span>
                                                     </button>
                                                 )}

                                                 {/* Edit (HR / Admin Only) */}
                                                 {isHrOrAdmin && l.status === 'PENDING' && (
                                                     <button
                                                         type="button"
                                                         onClick={() => handleOpenEdit(l)}
                                                         className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                         title="Edit Pengajuan"
                                                     >
                                                         <Edit3 className="w-3.5 h-3.5" />
                                                     </button>
                                                 )}

                                                 {/* Hapus Permanent (HR / Admin Only) */}
                                                 {isHrOrAdmin && (
                                                     <button
                                                         type="button"
                                                         onClick={() => handleDelete(l.id)}
                                                         className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                                                         title="Hapus Pengajuan (Permanen)"
                                                     >
                                                         <Trash2 className="w-3.5 h-3.5" />
                                                     </button>
                                                 )}
                                            </div>
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
                    {leaves.map((l) => (
                        <div key={l.id} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3 shadow-sm flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    {getLeaveTypeBadge(l.leave_type)}
                                    {getStatusBadge(l.status)}
                                </div>

                                <div>
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{l.employee?.full_name || 'Karyawan'}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{l.employee?.position} &bull; Sisa Cuti: {l.employee?.leave_balance ?? '-'} Hari</p>
                                </div>

                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{formatDate(l.start_date)} s/d {formatDate(l.end_date)} ({l.total_days} Hari)</span>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 text-[11px] line-clamp-2">
                                        &quot;{l.reason}&quot;
                                    </p>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <span className="text-[10px] text-slate-400">
                                    {l.approver ? `Approver: ${l.approver.name}` : 'Menunggu respon HR'}
                                </span>

                                <div className="flex items-center space-x-1.5">
                                    {isHrOrAdmin && l.status === 'PENDING' && (
                                        <>
                                            <button
                                                type="button"
                                                disabled={processingApprovalId === l.id}
                                                onClick={() => handleApproval(l.id, 'APPROVED')}
                                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow-sm flex items-center gap-1 transition-all disabled:opacity-60"
                                                title="Setujui (Approve)"
                                            >
                                                <Check className="w-3 h-3" />
                                                <span>Setujui</span>
                                            </button>
                                            <button
                                                type="button"
                                                disabled={processingApprovalId === l.id}
                                                onClick={() => handleApproval(l.id, 'REJECTED')}
                                                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] shadow-sm flex items-center gap-1 transition-all disabled:opacity-60"
                                                title="Tolak (Reject)"
                                            >
                                                <X className="w-3 h-3" />
                                                <span>Tolak</span>
                                            </button>
                                        </>
                                    )}

                                    {l.status === 'PENDING' && (
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEdit(l)}
                                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                            title="Edit Pengajuan"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => handleDelete(l.id)}
                                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                                        title="Hapus Pengajuan"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Quick Create / Edit Cuti */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span>{editingId ? 'Edit Permohonan Cuti' : 'Form Pengajuan Cuti Baru'}</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                            {/* Pilih Karyawan */}
                            <div>
                                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Pemohon Cuti (Karyawan) *
                                </label>
                                {!isHrOrAdmin ? (
                                    <div>
                                        <SearchableSelect
                                            disabled
                                            options={[{
                                                value: currentEmployee?.id || form.employee_id || '',
                                                label: currentEmployee ? `${currentEmployee.full_name} (${currentEmployee.employee_code || 'NIP'}) - Sisa Cuti: ${currentEmployee.leave_balance ?? 0} Hari` : (user?.name || 'Profil Karyawan Anda')
                                            }]}
                                            value={currentEmployee ? currentEmployee.id : form.employee_id}
                                            onChange={() => {}}
                                            placeholder="Profil Karyawan Anda"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            * Pengajuan cuti otomatis terhubung dengan profil karyawan Anda.
                                        </p>
                                    </div>
                                ) : (
                                    <SearchableSelect
                                        options={employees.map((emp) => ({
                                            value: emp.id,
                                            label: `${emp.full_name} (${emp.employee_code})`,
                                            sublabel: `Sisa Cuti: ${emp.leave_balance} Hari`
                                        }))}
                                        value={form.employee_id}
                                        onChange={(val) => setForm({ ...form, employee_id: val })}
                                        placeholder="Cari & Pilih Karyawan..."
                                        required
                                    />
                                )}
                            </div>

                            {/* Tipe Cuti */}
                            <div>
                                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Tipe / Jenis Cuti *
                                </label>
                                <SearchableSelect
                                    options={[
                                        { value: 'ANNUAL', label: 'Cuti Tahunan (Memotong Kuota Sisa Cuti)' },
                                        { value: 'SICK', label: 'Cuti Sakit (Laporan Surat Dokter)' },
                                        { value: 'SPECIAL', label: 'Cuti Khusus / Izin Penting' },
                                    ]}
                                    value={form.leave_type}
                                    onChange={(val) => setForm({ ...form, leave_type: val })}
                                    placeholder="Pilih Tipe Cuti..."
                                    required
                                />
                            </div>

                            {/* Tanggal Mulai & Tanggal Selesai */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Tanggal Mulai *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={form.start_date}
                                        onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Tanggal Selesai *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={form.end_date}
                                        onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Kalkulasi Durasi */}
                            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between text-blue-700 dark:text-blue-300">
                                <span>Durasi Cuti Diajukan:</span>
                                <span className="font-extrabold font-mono text-sm">
                                    {calculateDays(form.start_date, form.end_date)} Hari Kerja
                                </span>
                            </div>

                            {/* Alasan */}
                            <div>
                                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Alasan Pengajuan Cuti *
                                </label>
                                <textarea
                                    rows={3}
                                    required
                                    placeholder="Jelaskan alasan keperluan pengajuan cuti..."
                                    value={form.reason}
                                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                                />
                            </div>

                            {/* Modal Action Buttons */}
                            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center space-x-1.5 transition-colors disabled:opacity-60 text-xs shadow-md shadow-blue-500/20"
                                >
                                    {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                    <span>{editingId ? 'Simpan Perubahan' : 'Kirim Pengajuan Cuti'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Alasan Pembatalan Cuti */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-amber-500" />
                                <span>Konfirmasi Pembatalan Cuti</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowCancelModal(false)}
                                className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleConfirmCancelLeave} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Alasan Pembatalan Cuti *
                                </label>
                                <textarea
                                    required
                                    rows="3"
                                    value={cancellationReasonInput}
                                    onChange={(e) => setCancellationReasonInput(e.target.value)}
                                    placeholder="Contoh: Jadwal acara keluarga ditunda / perubahan rencana kerja..."
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 font-semibold"
                                ></textarea>
                            </div>

                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCancelModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center space-x-1"
                                >
                                    {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Proses Batalkan Cuti</span>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
