import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmContext';
import SearchableSelect from '../../components/SearchableSelect';
import {
    Receipt,
    Plus,
    Search,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Clock,
    DollarSign,
    Paperclip,
    Edit3,
    Trash2,
    X,
    UploadCloud,
    FileText,
    Check,
    AlertCircle,
    User,
    Calendar,
    ExternalLink,
    Filter,
    CreditCard,
    SlidersHorizontal,
    ChevronDown,
    ChevronUp,
    FolderKanban
} from 'lucide-react';

export default function ReimbursementPage() {
    const { confirm } = useConfirm();
    const navigate = useNavigate();
    const { user } = useAuth();
    const userRole = (user?.role || 'staff').toLowerCase();
    const isHrOrAdmin = ['superadmin', 'administrator', 'admin', 'hr', 'finance', 'project_manager'].includes(userRole);

    const [reimbursements, setReimbursements] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [projectFilter, setProjectFilter] = useState('');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');
    const [showAdvanceFilter, setShowAdvanceFilter] = useState(false);

    const activeFilterCount = [
        statusFilter,
        categoryFilter,
        projectFilter,
        startDateFilter,
        endDateFilter,
    ].filter(Boolean).length;

    const handleResetFilters = () => {
        setStatusFilter('');
        setCategoryFilter('');
        setProjectFilter('');
        setStartDateFilter('');
        setEndDateFilter('');
    };

    // Modal Create / Edit state
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Modal Approval / Action state
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [actionItem, setActionItem] = useState(null);
    const [approvedAmountInput, setApprovedAmountInput] = useState('');
    const [approvalNotes, setApprovalNotes] = useState('');
    const [rejectionReasonInput, setRejectionReasonInput] = useState('');
    const [submittingAction, setSubmittingAction] = useState(false);

    // Modal Detail view state
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailItem, setDetailItem] = useState(null);

    // Form state
    const [form, setForm] = useState({
        employee_id: '',
        project_id: '',
        category: 'TRANSPORTATION',
        title: '',
        claim_date: new Date().toISOString().split('T')[0],
        amount: '',
        description: '',
        receipt_file: null,
    });
    const [selectedFileName, setSelectedFileName] = useState('');

    const defaultCategories = [
        { code: 'TRANSPORTATION', name: 'Bensin & Transportasi', icon: '🚗' },
        { code: 'MEALS', name: 'Makan & Entertainment Klien', icon: '🍱' },
        { code: 'EQUIPMENT', name: 'Pembelian Alat & Equipment', icon: '🛠️' },
        { code: 'MEDICAL', name: 'Kesehatan & Medis', icon: '💊' },
        { code: 'OTHER', name: 'Operasional & Lain-Lain', icon: '📝' },
    ];

    const [categories, setCategories] = useState(defaultCategories);

    const fetchInitialData = async () => {
        try {
            const [catRes, prjRes] = await Promise.all([
                api.get('/hr/reimbursement-categories').catch(() => ({ data: { data: [] } })),
                api.get('/projects').catch(() => ({ data: { data: [] } })),
            ]);

            if (catRes.data.data && catRes.data.data.length > 0) {
                setCategories(catRes.data.data);
            }
            setProjects(prjRes.data.data || []);
        } catch (err) {
            console.error('Error fetching initial data:', err);
        }

        if (isHrOrAdmin) {
            try {
                const empRes = await api.get('/hr/employees');
                setEmployees(empRes.data.data || []);
            } catch (err) {
                console.error('Error fetching employees:', err);
            }
        }
    };

    const fetchReimbursements = async () => {
        setLoading(true);
        try {
            const res = await api.get('/hr/reimbursements', {
                params: {
                    search: searchTerm || undefined,
                    status: statusFilter || undefined,
                    category: categoryFilter || undefined,
                    project_id: projectFilter || undefined,
                    start_date: startDateFilter || undefined,
                    end_date: endDateFilter || undefined,
                }
            });
            setReimbursements(res.data.data || []);
        } catch (err) {
            console.error('Error fetching reimbursements:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchReimbursements();
    }, [searchTerm, statusFilter, categoryFilter, projectFilter, startDateFilter, endDateFilter]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    // Aggregates for stat cards
    const totalCount = reimbursements.length;
    const totalAmountSum = reimbursements.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    const pendingCount = reimbursements.filter(r => r.status === 'PENDING').length;
    const pendingAmountSum = reimbursements.filter(r => r.status === 'PENDING').reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    const approvedCount = reimbursements.filter(r => r.status === 'APPROVED').length;
    const approvedAmountSum = reimbursements.filter(r => r.status === 'APPROVED').reduce((sum, item) => sum + (parseFloat(item.approved_amount || item.amount) || 0), 0);

    const paidCount = reimbursements.filter(r => r.status === 'PAID').length;
    const paidAmountSum = reimbursements.filter(r => r.status === 'PAID').reduce((sum, item) => sum + (parseFloat(item.approved_amount || item.amount) || 0), 0);

    const handleOpenModal = (item = null) => {
        if (item) {
            navigate(`/hr/reimbursements/${item.id}/edit`);
        } else {
            navigate('/hr/reimbursements/create');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const formData = new FormData();
            if (form.employee_id) formData.append('employee_id', form.employee_id);
            if (form.project_id) formData.append('project_id', form.project_id);
            formData.append('category', form.category);
            formData.append('title', form.title);
            formData.append('claim_date', form.claim_date);
            formData.append('amount', form.amount);
            if (form.description) formData.append('description', form.description);
            if (form.receipt_file) formData.append('receipt_file', form.receipt_file);

            if (editingItem) {
                formData.append('_method', 'PUT');
                await api.post(`/hr/reimbursements/${editingItem.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Pengajuan reimbursement berhasil diperbarui.');
            } else {
                await api.post('/hr/reimbursements', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Pengajuan reimbursement berhasil dikirim!');
            }

            setShowModal(false);
            fetchReimbursements();
        } catch (err) {
            alert('Gagal menyimpan pengajuan: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenApproveModal = (item) => {
        setActionItem(item);
        setApprovedAmountInput(item.amount || '');
        setApprovalNotes('');
        setRejectionReasonInput('');
        setShowApproveModal(true);
    };

    const handleApproveSubmit = async () => {
        if (!actionItem) return;
        setSubmittingAction(true);
        try {
            await api.post(`/hr/reimbursements/${actionItem.id}/approve`, {
                approved_amount: approvedAmountInput,
                notes: approvalNotes,
            });
            alert('Pengajuan reimbursement berhasil DISETUJUI (APPROVED)!');
            setShowApproveModal(false);
            fetchReimbursements();
        } catch (err) {
            alert('Gagal menyetujui pengajuan: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmittingAction(false);
        }
    };

    const handleRejectSubmit = async () => {
        if (!actionItem) return;
        if (!rejectionReasonInput) {
            alert('Harap isi alasan penolakan.');
            return;
        }
        setSubmittingAction(true);
        try {
            await api.post(`/hr/reimbursements/${actionItem.id}/reject`, {
                rejection_reason: rejectionReasonInput,
            });
            alert('Pengajuan reimbursement telah DITOLAK.');
            setShowApproveModal(false);
            fetchReimbursements();
        } catch (err) {
            alert('Gagal menolak pengajuan: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmittingAction(false);
        }
    };

    const handleMarkPaid = async (item) => {
        const ok = await confirm({
            title: 'Tandai Lunas / Dicairkan',
            message: `Tandai reimbursement ${item.reimbursement_number} sebesar ${formatCurrency(item.approved_amount || item.amount)} telah LUNAS / DICAIRKAN?`,
            confirmText: 'Ya, Tandai Lunas',
            variant: 'success',
        });
        if (!ok) return;
        try {
            await api.post(`/hr/reimbursements/${item.id}/pay`);
            alert('Reimbursement telah berhasil ditandai LUNAS / DICAIRKAN!');
            fetchReimbursements();
        } catch (err) {
            alert('Gagal memperbarui status pencairan.');
        }
    };

    const handleDelete = async (id) => {
        const ok = await confirm({
            title: 'Hapus Pengajuan Reimbursement',
            message: 'Apakah Anda yakin ingin menghapus data pengajuan reimbursement ini? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/hr/reimbursements/${id}`);
            alert('Pengajuan reimbursement berhasil dihapus.');
            fetchReimbursements();
        } catch (err) {
            alert('Gagal menghapus pengajuan.');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING':
                return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> PENDING</span>;
            case 'APPROVED':
                return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> APPROVED</span>;
            case 'PAID':
                return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> LUNAS (PAID)</span>;
            case 'REJECTED':
                return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> DITOLAK</span>;
            default:
                return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">{status}</span>;
        }
    };

    const getCategoryBadge = (catKey) => {
        const found = categories.find(c => c.code === catKey || c.value === catKey);
        return (
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span>{found?.icon || '📝'}</span>
                <span>{found?.name || found?.label || catKey}</span>
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span>Pengajuan &amp; Manajemen Reimbursement</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Pengajuan klaim penggantian biaya operasional karyawan &amp; persetujuan oleh HR / Finance.
                    </p>
                </div>

                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all self-start md:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>+ Pengajuan Reimbursement Baru</span>
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Pengajuan Klaim</span>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalCount} Klaim</div>
                    <p className="text-[11px] text-slate-400 font-mono">{formatCurrency(totalAmountSum)}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Menunggu Persetujuan (Pending)</span>
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingCount} Klaim</div>
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-mono">{formatCurrency(pendingAmountSum)}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Disetujui (Approved)</span>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{approvedCount} Klaim</div>
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 font-mono">{formatCurrency(approvedAmountSum)}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Lunas / Dicairkan (Paid)</span>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{paidCount} Klaim</div>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">{formatCurrency(paidAmountSum)}</p>
                </div>
            </div>

            {/* Filter Bar & Expandable Advance Filter */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari Kode / Judul / Karyawan..."
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
                            onClick={fetchReimbursements}
                            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            title="Refresh Data"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Expandable Collapsible Filter Panel */}
                {showAdvanceFilter && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-4 gap-3 animate-in fade-in duration-200">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Kategori Reimbursement</label>
                            <SearchableSelect
                                options={[
                                    { value: '', label: 'Semua Kategori' },
                                    ...categories.map(c => ({ value: c.code || c.value, label: `${c.icon || '📝'} ${c.name || c.label}` }))
                                ]}
                                value={categoryFilter}
                                onChange={(val) => setCategoryFilter(val)}
                                placeholder="Semua Kategori..."
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Filter Project Terkait</label>
                            <SearchableSelect
                                options={[
                                    { value: '', label: 'Semua Project' },
                                    ...projects.map(p => ({ value: p.id, label: `${p.code ? `[${p.code}] ` : ''}${p.name}` }))
                                ]}
                                value={projectFilter}
                                onChange={(val) => setProjectFilter(val)}
                                placeholder="Semua Project..."
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Status Pengajuan</label>
                            <SearchableSelect
                                options={[
                                    { value: '', label: 'Semua Status' },
                                    { value: 'PENDING', label: 'PENDING (Menunggu)' },
                                    { value: 'APPROVED', label: 'APPROVED (Disetujui)' },
                                    { value: 'PAID', label: 'PAID (Lunas / Dicairkan)' },
                                    { value: 'REJECTED', label: 'REJECTED (Ditolak)' },
                                ]}
                                value={statusFilter}
                                onChange={(val) => setStatusFilter(val)}
                                placeholder="Semua Status..."
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Periode Durasi Klaim</label>
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
                                    title="Tanggal Mulai Klaim"
                                />
                                <span className="text-slate-400 shrink-0">s/d</span>
                                <input
                                    type="date"
                                    value={endDateFilter}
                                    onChange={(e) => setEndDateFilter(e.target.value)}
                                    className="bg-transparent border-0 focus:outline-none font-semibold text-slate-800 dark:text-slate-200 p-0 text-xs w-full cursor-pointer"
                                    title="Tanggal Selesai Klaim"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Reimbursements Table */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm text-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                <th className="py-3 px-4">Kode &amp; Tanggal</th>
                                <th className="py-3 px-4">Nama Karyawan</th>
                                <th className="py-3 px-4">Kategori &amp; Perihal</th>
                                <th className="py-3 px-4 text-right">Nominal Diajukan</th>
                                <th className="py-3 px-4 text-right">Nominal Disetujui</th>
                                <th className="py-3 px-4 text-center">Bukti Nota</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="py-8 text-center text-slate-400">
                                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-500" />
                                        <span>Memuat data pengajuan reimbursement...</span>
                                    </td>
                                </tr>
                            ) : reimbursements.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="py-12 text-center text-slate-500">
                                        Belum ada pengajuan reimbursement yang tercatat / sesuai filter.
                                    </td>
                                </tr>
                            ) : (
                                reimbursements.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3.5 px-4">
                                            <button
                                                onClick={() => { setDetailItem(item); setShowDetailModal(true); }}
                                                className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline block text-left"
                                            >
                                                {item.reimbursement_number}
                                            </button>
                                            <span className="text-[10px] text-slate-400">{item.claim_date}</span>
                                        </td>
                                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                                            <div>{item.employee?.full_name || 'Karyawan'}</div>
                                            <div className="text-[10px] font-normal text-slate-400">{typeof item.employee?.department === 'object' ? item.employee?.department?.name : (item.employee?.department || 'Umum')}</div>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{item.title}</div>
                                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                {getCategoryBadge(item.category)}
                                                {item.project && (
                                                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                                        <FolderKanban className="w-3 h-3" />
                                                        <span>{item.project.code ? `[${item.project.code}] ` : ''}{item.project.name}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                                            {formatCurrency(item.amount)}
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                            {item.approved_amount ? formatCurrency(item.approved_amount) : '-'}
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            {item.file_url ? (
                                                <a
                                                    href={item.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-semibold text-[11px]"
                                                >
                                                    <Paperclip className="w-3 h-3" />
                                                    <span>Struk Nota</span>
                                                </a>
                                            ) : (
                                                <span className="text-slate-400 text-[10px] italic">Tidak Ada File</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            {getStatusBadge(item.status)}
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end space-x-1">
                                                {/* HR / Admin Approval Button */}
                                                {isHrOrAdmin && item.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => handleOpenApproveModal(item)}
                                                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shadow-sm flex items-center space-x-1"
                                                        title="Proses Approval HR / Admin"
                                                    >
                                                        <Check className="w-3 h-3" />
                                                        <span>Proses HR</span>
                                                    </button>
                                                )}

                                                {/* Finance Mark as Paid Button */}
                                                {isHrOrAdmin && item.status === 'APPROVED' && (
                                                    <button
                                                        onClick={() => handleMarkPaid(item)}
                                                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm flex items-center space-x-1"
                                                        title="Tandai Sudah Dicairkan / Lunas"
                                                    >
                                                        <CreditCard className="w-3 h-3" />
                                                        <span>Cairkan</span>
                                                    </button>
                                                )}

                                                {/* Edit if Pending */}
                                                {item.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => handleOpenModal(item)}
                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                        title="Edit Pengajuan"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}

                                                {/* Delete button */}
                                                {(item.status === 'PENDING' || isHrOrAdmin) && (
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                        title="Hapus Pengajuan"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form Pengajuan Reimbursement */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <span>{editingItem ? 'Edit Pengajuan Reimbursement' : 'Form Pengajuan Reimbursement Baru'}</span>
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                            {isHrOrAdmin && (
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Pilih Karyawan Pemohon *</label>
                                    <SearchableSelect
                                        options={employees.map(e => ({
                                            value: e.id,
                                            label: `${e.full_name} (${e.nik || e.employee_code || 'Tanpa NIK'})`,
                                            sublabel: typeof e.department === 'object' ? e.department?.name : (e.department || 'Umum')
                                        }))}
                                        value={form.employee_id}
                                        onChange={(val) => setForm({ ...form, employee_id: val })}
                                        placeholder="Cari & Pilih Karyawan..."
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Kategori Biaya Reimbursement *</label>
                                <SearchableSelect
                                    options={categories.map(c => ({ value: c.code || c.value, label: `${c.icon || '📝'} ${c.name || c.label}` }))}
                                    value={form.category}
                                    onChange={(val) => setForm({ ...form, category: val })}
                                    placeholder="Pilih Kategori..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Project Terkait (Opsional)</label>
                                <SearchableSelect
                                    options={[
                                        { value: '', label: '-- Tidak Terkait Project (Umum) --' },
                                        ...projects.map(p => ({
                                            value: p.id,
                                            label: `${p.code ? `[${p.code}] ` : ''}${p.name}`,
                                            sublabel: p.client ? p.client.name : ''
                                        }))
                                    ]}
                                    value={form.project_id}
                                    onChange={(val) => setForm({ ...form, project_id: val })}
                                    placeholder="Pilih Project..."
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Judul / Perihal Reimbursement *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="Contoh: Bensin & Toll Dinas Klien Bandung"
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-semibold focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Tanggal Nota / Struk *</label>
                                    <input
                                        type="date"
                                        required
                                        value={form.claim_date}
                                        onChange={(e) => setForm({ ...form, claim_date: e.target.value })}
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-bold focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nominal Diajukan (Rp) *</label>
                                    <input
                                        type="number"
                                        step="1"
                                        min="1"
                                        required
                                        value={form.amount}
                                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                        placeholder="0"
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono font-bold focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Upload Bukti Nota Dropzone */}
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Upload Bukti Nota / Kwitansi / Struk (PDF / Image)</label>
                                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-blue-500 transition-colors bg-slate-50 dark:bg-slate-900/40">
                                    <UploadCloud className="w-8 h-8 mx-auto text-slate-400 mb-1" />
                                    <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                                        Klik untuk memilih file struk / nota pembeli
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Format: PDF, JPG, PNG (Maksimal 10MB)</p>
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png,.zip"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setForm({ ...form, receipt_file: file });
                                                setSelectedFileName(file.name);
                                            }
                                        }}
                                        className="mt-3 block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                    />
                                    {selectedFileName && (
                                        <div className="mt-2 text-xs font-bold text-blue-600 flex items-center justify-center space-x-1">
                                            <Paperclip className="w-3.5 h-3.5" />
                                            <span>{selectedFileName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Keterangan / Rincian Penggunaan Biaya</label>
                                <textarea
                                    rows="3"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Penjelasan singkat penggunaan biaya operasional..."
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all"
                                >
                                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
                                    <span>{editingItem ? 'Simpan Perubahan' : 'Kirim Pengajuan'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Approval / Reject HR & Admin */}
            {showApproveModal && actionItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <span>Proses Approval HR / Admin</span>
                            </h3>
                            <button onClick={() => setShowApproveModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                            <div className="flex justify-between font-semibold">
                                <span className="text-slate-500">Karyawan:</span>
                                <span className="font-bold text-slate-900 dark:text-slate-100">{actionItem.employee?.full_name}</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                                <span className="text-slate-500">Perihal:</span>
                                <span className="text-slate-800 dark:text-slate-200">{actionItem.title}</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                                <span className="text-slate-500">Nominal Diajukan:</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{formatCurrency(actionItem.amount)}</span>
                            </div>
                        </div>

                        {/* Approval Inputs */}
                        <div className="space-y-3">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nominal Disetujui (Rp)</label>
                                <input
                                    type="number"
                                    value={approvedAmountInput}
                                    onChange={(e) => setApprovedAmountInput(e.target.value)}
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-emerald-600 dark:text-emerald-400 font-mono font-bold focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Catatan Persetujuan (Opsional)</label>
                                <input
                                    type="text"
                                    value={approvalNotes}
                                    onChange={(e) => setApprovalNotes(e.target.value)}
                                    placeholder="Catatan persetujuan dari HR/Admin..."
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                                <label className="block font-semibold text-rose-600 dark:text-rose-400">Jika Ingin Menolak Pengajuan:</label>
                                <input
                                    type="text"
                                    value={rejectionReasonInput}
                                    onChange={(e) => setRejectionReasonInput(e.target.value)}
                                    placeholder="Tuliskan alasan penolakan di sini..."
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-rose-600 dark:text-rose-400 focus:outline-none focus:border-rose-500"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={handleRejectSubmit}
                                disabled={submittingAction}
                                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center space-x-1 transition-all"
                            >
                                <XCircle className="w-4 h-4" />
                                <span>Tolak Pengajuan</span>
                            </button>

                            <div className="flex items-center space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowApproveModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleApproveSubmit}
                                    disabled={submittingAction}
                                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center space-x-1.5 transition-all"
                                >
                                    {submittingAction ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    <span>Setujui (Approve)</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Detail Breakdown Reimbursement */}
            {showDetailModal && detailItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div>
                                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <span>Detail Reimbursement: {detailItem.reimbursement_number}</span>
                                </h3>
                                <p className="text-xs text-slate-500">Tanggal Nota: {detailItem.claim_date}</p>
                            </div>
                            <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                            <div>
                                <span className="text-slate-400 font-semibold block">Pemohon:</span>
                                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">{detailItem.employee?.full_name}</span>
                                <span className="text-slate-500">{typeof detailItem.employee?.department === 'object' ? detailItem.employee?.department?.name : (detailItem.employee?.department || 'Umum')}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 font-semibold block">Status Pengajuan:</span>
                                <div className="mt-1">{getStatusBadge(detailItem.status)}</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <span className="text-slate-400 font-semibold block">Perihal &amp; Kategori:</span>
                            <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{detailItem.title}</div>
                            <div className="flex items-center gap-2 flex-wrap">
                                {getCategoryBadge(detailItem.category)}
                                {detailItem.project && (
                                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                        <FolderKanban className="w-3.5 h-3.5" />
                                        <span>Project: {detailItem.project.code ? `[${detailItem.project.code}] ` : ''}{detailItem.project.name}</span>
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                            <div>
                                <span className="text-slate-400 font-semibold block">Nominal Diajukan:</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-base">{formatCurrency(detailItem.amount)}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 font-semibold block">Nominal Disetujui:</span>
                                <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-base">{detailItem.approved_amount ? formatCurrency(detailItem.approved_amount) : '-'}</span>
                            </div>
                        </div>

                        {detailItem.description && (
                            <div className="space-y-1">
                                <span className="text-slate-400 font-semibold block">Catatan / Keterangan:</span>
                                <p className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                                    {detailItem.description}
                                </p>
                            </div>
                        )}

                        {detailItem.rejection_reason && (
                            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 space-y-1">
                                <span className="font-bold block">Alasan Penolakan:</span>
                                <p>{detailItem.rejection_reason}</p>
                            </div>
                        )}

                        {/* File Preview */}
                        {detailItem.file_url && (
                            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                        <Paperclip className="w-4 h-4 text-blue-500" />
                                        <span>Bukti Struk / Kwitansi</span>
                                    </span>
                                    <a href={detailItem.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline flex items-center gap-1">
                                        <span>Buka File →</span>
                                    </a>
                                </div>
                                {detailItem.receipt_file_name?.toLowerCase().endsWith('.pdf') ? (
                                    <iframe src={detailItem.file_url} className="w-full h-80 rounded-xl border border-slate-200 dark:border-slate-800" title="Receipt PDF" />
                                ) : (
                                    <img src={detailItem.file_url} alt="Receipt" className="max-h-80 mx-auto rounded-xl shadow-sm border border-slate-200 dark:border-slate-800" />
                                )}
                            </div>
                        )}

                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowDetailModal(false)}
                                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
