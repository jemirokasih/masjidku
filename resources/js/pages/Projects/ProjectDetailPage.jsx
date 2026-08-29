import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { openPdfPreview } from '../../utils/pdfPreview';
import { useConfirm } from '../../context/ConfirmContext';
import { useAuth } from '../../context/AuthContext';
import SearchableSelect from '../../components/SearchableSelect';
import {
    FolderKanban,
    ArrowLeft,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    AlertCircle,
    Plus,
    RefreshCw,
    Download,
    Trash2,
    FileText,
    Receipt,
    CreditCard,
    DollarSign,
    UserCheck,
    UploadCloud,
    Paperclip,
    ExternalLink,
    FileCheck2,
    X,
    Save,
    CheckSquare,
    AlertTriangle,
    Truck,
    FileCheck,
    LayoutGrid,
    List
} from 'lucide-react';

export default function ProjectDetailPage() {
    const { user } = useAuth();
    const { confirm } = useConfirm();
    const { id } = useParams();
    const navigate = useNavigate();

    const userRole = (user?.role || 'staff').toLowerCase();

    const ensureArray = (val) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') {
            try {
                const parsed = JSON.parse(val);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                return [];
            }
        }
        return [];
    };

    const hasModuleAccess = (moduleKey, allowedRoles = []) => {
        if (['administrator', 'admin', 'superadmin'].includes(userRole)) return true;

        const userPermissions = ensureArray(user?.permissions);
        if (moduleKey && userPermissions.length > 0) {
            return userPermissions.some(p => p === '*' || p === moduleKey || p.startsWith(`${moduleKey}.`));
        }

        if (!allowedRoles || allowedRoles.length === 0) return true;
        return allowedRoles.map(r => r.toLowerCase()).includes(userRole);
    };

    const canViewQuotes = hasModuleAccess('quotes', ['superadmin', 'admin', 'finance', 'project_manager', 'quotes']);
    const canViewInvoices = hasModuleAccess('invoices', ['superadmin', 'admin', 'finance', 'project_manager', 'invoices']);
    const canViewPayments = hasModuleAccess('payments', ['superadmin', 'admin', 'finance', 'payments']);
    const canViewTaxInvoices = hasModuleAccess('tax_invoices', ['superadmin', 'admin', 'finance', 'tax_invoices']);
    const canViewDeliveryOrders = hasModuleAccess('delivery_orders', ['superadmin', 'admin', 'finance', 'project_manager', 'delivery_orders']);

    const canViewFinancialsTab = canViewQuotes || canViewInvoices || canViewPayments || canViewTaxInvoices || canViewDeliveryOrders;

    const [project, setProject] = useState(null);
    const [financialSummary, setFinancialSummary] = useState({
        total_quotes: 0,
        total_invoices: 0,
        total_paid: 0,
        remaining: 0,
    });
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'tasks' | 'documents' | 'financials'
    const [taskViewMode, setTaskViewMode] = useState('list'); // 'list' | 'kanban'

    // Task Modal state
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [submittingTask, setSubmittingTask] = useState(false);
    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        assigned_employee_id: '',
        status: 'TODO',
        priority: 'MEDIUM',
        due_date: '',
    });

    // Document Upload state
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [documentTypes, setDocumentTypes] = useState([]);
    const [docForm, setDocForm] = useState({
        document_type_id: '',
        title: '',
        file: null,
        notes: '',
    });

    const fetchProjectDetails = async () => {
        setLoading(true);
        try {
            const [prjRes, empRes, dtRes] = await Promise.all([
                api.get(`/projects/${id}`),
                api.get('/hr/employees').catch(() => ({ data: { data: [] } })),
                api.get('/document-types').catch(() => ({ data: { data: [] } })),
            ]);

            setProject(prjRes.data.data);
            setFinancialSummary(prjRes.data.financial_summary || {
                total_quotes: 0, total_invoices: 0, total_paid: 0, remaining: 0
            });
            setEmployees(empRes.data.data || []);
            setDocumentTypes(dtRes.data.data || []);
        } catch (err) {
            console.error('Error fetching project detail:', err);
            alert('Gagal memuat detail project: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectDetails();
    }, [id]);

    const formatRp = (val) => 'Rp ' + new Intl.NumberFormat('id-ID').format(val || 0);
    const formatDate = (d) => {
        if (!d) return '-';
        return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
        });
    };
    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // Task Management Actions
    const handleOpenCreateTask = (defaultStatus = 'TODO') => {
        setEditingTaskId(null);
        setTaskForm({
            title: '',
            description: '',
            assigned_employee_id: '',
            status: defaultStatus,
            priority: 'MEDIUM',
            due_date: '',
        });
        setShowTaskModal(true);
    };

    const handleSaveTask = async (e) => {
        e.preventDefault();
        if (!taskForm.title) {
            alert('Judul tugas wajib diisi!');
            return;
        }

        setSubmittingTask(true);
        try {
            if (editingTaskId) {
                await api.put(`/projects/${id}/tasks/${editingTaskId}`, taskForm);
            } else {
                await api.post(`/projects/${id}/tasks`, taskForm);
            }
            setShowTaskModal(false);
            fetchProjectDetails();
        } catch (err) {
            alert('Gagal menyimpan tugas: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmittingTask(false);
        }
    };

    const handleTaskStatusChange = async (taskId, newStatus) => {
        try {
            await api.put(`/projects/${id}/tasks/${taskId}`, { status: newStatus });
            fetchProjectDetails();
        } catch (err) {
            alert('Gagal memperbarui status tugas: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteTask = async (taskId) => {
        const ok = await confirm({
            title: 'Hapus Tugas',
            message: 'Yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/projects/${id}/tasks/${taskId}`);
            fetchProjectDetails();
        } catch (err) {
            alert('Gagal menghapus tugas: ' + (err.response?.data?.message || err.message));
        }
    };

    // Document Upload & Delete Actions
    const handleUploadDoc = async (e) => {
        e.preventDefault();
        if (!docForm.title || !docForm.file) {
            alert('Pilih berkas dokumen dan isi judul dokumen!');
            return;
        }

        setUploadingDoc(true);
        try {
            const formData = new FormData();
            if (docForm.document_type_id) formData.append('document_type_id', docForm.document_type_id);
            formData.append('title', docForm.title);
            formData.append('file', docForm.file);
            if (docForm.notes) formData.append('notes', docForm.notes);

            await api.post(`/projects/${id}/documents`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setDocForm({ document_type_id: '', title: '', file: null, notes: '' });
            alert('Dokumen berhasil diunggah!');
            fetchProjectDetails();
        } catch (err) {
            alert('Gagal mengunggah dokumen: ' + (err.response?.data?.message || err.message));
        } finally {
            setUploadingDoc(false);
        }
    };

    const handleDeleteDoc = async (docId) => {
        const ok = await confirm({
            title: 'Hapus Dokumen',
            message: 'Yakin ingin menghapus dokumen ini? File di server akan dihapus secara permanen.',
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/projects/${id}/documents/${docId}`);
            fetchProjectDetails();
        } catch (err) {
            alert('Gagal menghapus dokumen: ' + (err.response?.data?.message || err.message));
        }
    };

    const getTaskPriorityBadge = (priority) => {
        switch (priority) {
            case 'URGENT':
                return <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400">URGENT</span>;
            case 'HIGH':
                return <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">HIGH</span>;
            case 'MEDIUM':
                return <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">MEDIUM</span>;
            case 'LOW':
            default:
                return <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">LOW</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px] text-xs text-slate-500 dark:text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin mr-2 text-indigo-600 dark:text-indigo-400" />
                <span>Memuat detail project...</span>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="text-center py-12 space-y-3">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Project tidak ditemukan</p>
                <Link to="/projects" className="text-xs text-indigo-600 underline">Kembali ke Daftar Project</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-16">
            {/* Top Navigation & Status Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                    <Link
                        to="/projects"
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        title="Kembali ke Daftar Project"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded border border-indigo-500/20">
                                {project.code}
                            </span>
                            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                                {project.name}
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Klien: {project.client?.company_name || project.client?.name || 'Internal / Tanpa Klien'}</span>
                        </p>
                    </div>
                </div>

                {/* Progress & Budget Summary Header */}
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Nilai Budget</span>
                        <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100 font-mono">
                            {formatRp(project.budget)}
                        </span>
                    </div>

                    <div className="w-32 text-right">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                            <span>PROGRESS</span>
                            <span className="font-mono">{project.progress_percent || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                            <div
                                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, Math.max(0, project.progress_percent || 0))}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Interactive Tabs Header */}
            <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        activeTab === 'overview'
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                    <FolderKanban className="w-3.5 h-3.5" />
                    <span>Ikhtisar Project</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('tasks')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        activeTab === 'tasks'
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Task Management ({project.tasks?.length || 0})</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('documents')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        activeTab === 'documents'
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Dokumen Project ({project.documents?.length || 0})</span>
                </button>

                {canViewFinancialsTab && (
                    <button
                        type="button"
                        onClick={() => setActiveTab('financials')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                            activeTab === 'financials'
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Keuangan &amp; Dokumen Terkait</span>
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => setActiveTab('vendors')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        activeTab === 'vendors'
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Vendor &amp; Pembelian ({(project.vendor_invoices?.length || 0) + (project.vendor_quotes?.length || 0)})</span>
                </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <span>Deskripsi &amp; Scope Ruang Lingkup Pekerjaan</span>
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                                {project.description || 'Belum ada deskripsi rinci untuk project ini.'}
                            </p>
                        </div>

                        {/* Financial Snapshot */}
                        {canViewFinancialsTab && (
                            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        <span>Ringkasan Keuangan &amp; Dokumen Project</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('financials')}
                                        className="text-xs font-semibold text-indigo-600 hover:underline"
                                    >
                                        Lihat Detail Transaksi &rarr;
                                    </button>
                                </h3>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                    {canViewQuotes && (
                                        <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40">
                                            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold block uppercase">Total Quote</span>
                                            <span className="font-extrabold font-mono text-purple-900 dark:text-purple-200 text-sm">
                                                {formatRp(financialSummary.total_quotes)}
                                            </span>
                                        </div>
                                    )}

                                    {canViewInvoices && (
                                        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40">
                                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block uppercase">Total Invoice</span>
                                            <span className="font-extrabold font-mono text-blue-900 dark:text-blue-200 text-sm">
                                                {formatRp(financialSummary.total_invoices)}
                                            </span>
                                        </div>
                                    )}

                                    {canViewPayments && (
                                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block uppercase">Uang Diterima</span>
                                            <span className="font-extrabold font-mono text-emerald-900 dark:text-emerald-200 text-sm">
                                                {formatRp(financialSummary.total_paid)}
                                            </span>
                                        </div>
                                    )}

                                    {canViewPayments && (
                                        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40">
                                            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold block uppercase">Sisa Piutang</span>
                                            <span className="font-extrabold font-mono text-rose-900 dark:text-rose-200 text-sm">
                                                {formatRp(financialSummary.remaining)}
                                            </span>
                                        </div>
                                    )}

                                    {canViewDeliveryOrders && (
                                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
                                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block uppercase">Surat Jalan</span>
                                            <span className="font-extrabold font-mono text-amber-900 dark:text-amber-200 text-sm">
                                                {financialSummary.total_delivery_orders || 0} Dokumen
                                            </span>
                                        </div>
                                    )}

                                    {canViewTaxInvoices && (
                                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40">
                                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold block uppercase">E-Faktur</span>
                                            <span className="font-extrabold font-mono text-indigo-900 dark:text-indigo-200 text-sm">
                                                {financialSummary.total_tax_invoices || 0} Berkas
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Side Card Info */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 text-xs">
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                                Informasi Klien &amp; Jadwal
                            </h4>

                            <div className="space-y-3">
                                <div>
                                    <span className="text-slate-400 text-[10px] block">Klien Perusahaan:</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                                        {project.client?.company_name || project.client?.name || 'Internal / Tanpa Klien'}
                                    </span>
                                    {project.client?.email && (
                                        <span className="text-slate-500 block text-[11px] mt-0.5">{project.client.email}</span>
                                    )}
                                </div>

                                <div>
                                    <span className="text-slate-400 text-[10px] block">Status Project:</span>
                                    <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">
                                        {project.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                                    <div>
                                        <span className="text-slate-400 text-[10px] block">Tgl Mulai:</span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                                            {formatDate(project.start_date)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 text-[10px] block">Target Selesai:</span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                                            {formatDate(project.end_date)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: TASK MANAGEMENT */}
            {activeTab === 'tasks' && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center space-x-3 text-xs">
                            <span className="font-bold text-slate-800 dark:text-slate-200">Total Tugas ({project.tasks?.length || 0}):</span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-300">
                                {project.tasks?.filter(t => t.status === 'COMPLETED').length || 0} Selesai
                            </span>
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* Toggle View Mode */}
                            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-0.5 bg-slate-50 dark:bg-slate-900 mr-2">
                                <button
                                    type="button"
                                    onClick={() => setTaskViewMode('list')}
                                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                                        taskViewMode === 'list'
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
                                    onClick={() => setTaskViewMode('kanban')}
                                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                                        taskViewMode === 'kanban'
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
                                type="button"
                                onClick={handleOpenCreateTask}
                                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center space-x-1.5 transition-all self-start sm:self-auto"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Tambah Tugas Project</span>
                            </button>
                        </div>
                    </div>

                    {/* Task List Table / Kanban */}
                    {taskViewMode === 'kanban' ? (
                        /* Kanban Board View */
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[
                                { id: 'TODO', title: 'TODO', bgColor: 'bg-slate-50 dark:bg-slate-900/40', headerColor: 'text-slate-600 dark:text-slate-400 border-slate-300/40' },
                                { id: 'IN_PROGRESS', title: 'IN PROGRESS', bgColor: 'bg-blue-50/20 dark:bg-blue-950/10', headerColor: 'text-blue-600 dark:text-blue-400 border-blue-300/30' },
                                { id: 'IN_REVIEW', title: 'IN REVIEW', bgColor: 'bg-amber-50/20 dark:bg-amber-950/10', headerColor: 'text-amber-600 dark:text-amber-400 border-amber-300/30' },
                                { id: 'COMPLETED', title: 'COMPLETED', bgColor: 'bg-emerald-50/20 dark:bg-emerald-950/10', headerColor: 'text-emerald-600 dark:text-emerald-400 border-emerald-300/30' },
                            ].map((col) => {
                                const colTasks = project.tasks?.filter(t => t.status === col.id) || [];
                                return (
                                    <div
                                        key={col.id}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            const taskId = e.dataTransfer.getData('text/plain');
                                            if (taskId) {
                                                handleTaskStatusChange(taskId, col.id);
                                            }
                                        }}
                                        className={`rounded-2xl p-3 border border-slate-200 dark:border-slate-800/80 min-h-[400px] flex flex-col space-y-3 ${col.bgColor}`}
                                    >
                                        <div className={`flex items-center justify-between pb-2 border-b font-extrabold text-[10px] tracking-wider uppercase ${col.headerColor}`}>
                                            <div className="flex items-center space-x-1.5">
                                                <span>{col.title}</span>
                                                <span className="px-2 py-0.5 rounded-full bg-slate-200/50 dark:bg-slate-800/60 font-mono text-[9px] font-bold text-slate-500">
                                                    {colTasks.length}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleOpenCreateTask(col.id)}
                                                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                                                title={`Tambah tugas baru ke status ${col.title}`}
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
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
                                                        onDragStart={(e) => e.dataTransfer.setData('text/plain', t.id)}
                                                        className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm space-y-2 hover:shadow transition-all cursor-grab active:cursor-grabbing relative group"
                                                    >
                                                        <div className="flex items-start justify-between gap-1.5">
                                                            <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200 leading-tight">
                                                                {t.title}
                                                            </span>
                                                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setEditingTaskId(t.id);
                                                                        setTaskForm({
                                                                            title: t.title || '',
                                                                            description: t.description || '',
                                                                            assigned_employee_id: t.assigned_employee_id || '',
                                                                            status: t.status || 'TODO',
                                                                            priority: t.priority || 'MEDIUM',
                                                                            due_date: t.due_date || '',
                                                                        });
                                                                        setShowTaskModal(true);
                                                                    }}
                                                                    className="p-0.5 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                                                    title="Edit"
                                                                >
                                                                    <FileText className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteTask(t.id)}
                                                                    className="p-0.5 rounded bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-500"
                                                                    title="Hapus"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {t.description && (
                                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
                                                                {t.description}
                                                            </p>
                                                        )}

                                                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800/60 text-[9px] gap-2">
                                                            <span className="text-slate-400 truncate max-w-[90px]" title={t.assigned_employee?.full_name || 'Belum di-assign'}>
                                                                PJ: <strong className="text-slate-600 dark:text-slate-300">{t.assigned_employee?.full_name || 'Belum di-assign'}</strong>
                                                            </span>
                                                            <span className="text-slate-400 font-mono shrink-0">
                                                                {t.due_date ? formatDate(t.due_date) : '-'}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center justify-between pt-1 text-[9px]">
                                                            {getTaskPriorityBadge(t.priority)}
                                                            <select
                                                                value={t.status}
                                                                onChange={(e) => handleTaskStatusChange(t.id, e.target.value)}
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
                    ) : project.tasks?.length === 0 ? (
                        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
                            <CheckSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                            <p className="font-semibold text-slate-700 dark:text-slate-300">Belum ada tugas di project ini</p>
                            <p className="text-slate-400">Klik &quot;Tambah Tugas Project&quot; untuk mulai menambahkan pekerjaan.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {project.tasks?.map((t) => (
                                <div
                                    key={t.id}
                                    className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{t.title}</span>
                                            {getTaskPriorityBadge(t.priority)}
                                        </div>
                                        {t.description && (
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{t.description}</p>
                                        )}
                                        <div className="flex items-center space-x-4 text-[10px] text-slate-400 pt-1">
                                            <span>Penanggung Jawab: <strong className="text-slate-600 dark:text-slate-300">{t.assigned_employee?.full_name || 'Belum di-assign'}</strong></span>
                                            <span>Tenggat: <strong className="text-slate-600 dark:text-slate-300">{formatDate(t.due_date)}</strong></span>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 self-end sm:self-auto min-w-[170px]">
                                        <SearchableSelect
                                            options={[
                                                { value: 'TODO', label: 'TODO (Akan Dikerjakan)' },
                                                { value: 'IN_PROGRESS', label: 'IN PROGRESS (Sedang Dikerjakan)' },
                                                { value: 'IN_REVIEW', label: 'IN REVIEW (Pemeriksaan)' },
                                                { value: 'COMPLETED', label: 'COMPLETED (Selesai)' },
                                            ]}
                                            value={t.status}
                                            onChange={(val) => handleTaskStatusChange(t.id, val)}
                                            placeholder="Status Task..."
                                        />

                                        <button
                                            type="button"
                                            onClick={() => handleDeleteTask(t.id)}
                                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                                            title="Hapus Tugas"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 3: DOCUMENTS & FILES */}
            {activeTab === 'documents' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Upload Form Box */}
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 text-xs h-fit">
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                            <UploadCloud className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span>Unggah Dokumen Project</span>
                        </h4>

                        <form onSubmit={handleUploadDoc} className="space-y-3">
                            <div>
                                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Jenis Dokumen (Opsional)
                                </label>
                                <SearchableSelect
                                    options={[
                                        { value: '', label: '-- Tanpa Jenis / Umum --' },
                                        ...documentTypes.map(dt => ({
                                            value: dt.id,
                                            label: dt.name,
                                            code: dt.code,
                                        }))
                                    ]}
                                    value={docForm.document_type_id}
                                    onChange={(val) => setDocForm({ ...docForm, document_type_id: val })}
                                    placeholder="Pilih Jenis Dokumen..."
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Judul Dokumen *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="ex: Kontrak Kerjasama / SPK Pekerjaan"
                                    value={docForm.title}
                                    onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Pilih Berkas File * (Maks. 20MB)
                                </label>
                                <input
                                    type="file"
                                    required
                                    onChange={(e) => setDocForm({ ...docForm, file: e.target.files[0] })}
                                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/40 dark:file:text-indigo-300 hover:file:bg-indigo-100"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Catatan / Keterangan File
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Catatan versi atau dokumen rujukan..."
                                    value={docForm.notes}
                                    onChange={(e) => setDocForm({ ...docForm, notes: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={uploadingDoc}
                                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-60"
                            >
                                {uploadingDoc ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                                <span>Unggah Berkas</span>
                            </button>
                        </form>
                    </div>

                    {/* Document List Table */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                            {project.documents?.length === 0 ? (
                                <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
                                    <Paperclip className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                                    <p className="font-semibold text-slate-700 dark:text-slate-300">Belum ada berkas dokumen diunggah</p>
                                    <p className="text-slate-400">Gunakan form di samping untuk mengunggah dokumen project.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                                <th className="py-3 px-4">Nama Dokumen</th>
                                                <th className="py-3 px-4">Jenis Dokumen</th>
                                                <th className="py-3 px-4">Nama Berkas</th>
                                                <th className="py-3 px-4">Ukuran</th>
                                                <th className="py-3 px-4">Diunggah Oleh</th>
                                                <th className="py-3 px-4 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                            {project.documents?.map((doc) => (
                                                <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                                                        <div>{doc.title}</div>
                                                        {doc.notes && <div className="text-[10px] font-normal text-slate-400">{doc.notes}</div>}
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        {doc.document_type ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                                                                {doc.document_type.name}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 text-[10px] italic">Umum</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                                                        {doc.file_name}
                                                    </td>
                                                    <td className="py-3.5 px-4 font-mono text-slate-500">
                                                        {formatFileSize(doc.file_size)}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                                                        {doc.uploader?.name || 'Sistem'}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <a
                                                                href={`/api/v1/projects/${id}/documents/${doc.id}/download`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                                                                title="Unduh Berkas"
                                                            >
                                                                <Download className="w-3.5 h-3.5" />
                                                            </a>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteDoc(doc.id)}
                                                                className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                                                                title="Hapus Berkas"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: FINANCIALS & RELATED DOCUMENTS (QUOTES, INVOICES, PAYMENTS, E-FAKTUR, SURAT JALAN) */}
            {activeTab === 'financials' && canViewFinancialsTab && (
                <div className="space-y-6">
                    {/* Action Bar to Create Linked Financial & Operations Documents */}
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Buat dokumen transaksi &amp; operasional baru khusus untuk project ini:
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {canViewQuotes && (
                                <Link
                                    to={`/quotes/create?project_id=${project.id}${project.client_id ? `&client_id=${project.client_id}` : ''}`}
                                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center space-x-1 transition-all"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>+ Quote</span>
                                </Link>
                            )}

                            {canViewInvoices && (
                                <Link
                                    to={`/invoices/create?project_id=${project.id}${project.client_id ? `&client_id=${project.client_id}` : ''}`}
                                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1 transition-all"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>+ Invoice</span>
                                </Link>
                            )}

                            {canViewPayments && (
                                <Link
                                    to={`/payments/create?project_id=${project.id}`}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center space-x-1 transition-all"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>+ Pembayaran</span>
                                </Link>
                            )}

                            {canViewDeliveryOrders && (
                                <Link
                                    to={`/delivery-orders/create?project_id=${project.id}${project.client_id ? `&client_id=${project.client_id}` : ''}`}
                                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 flex items-center space-x-1 transition-all"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>+ Surat Jalan</span>
                                </Link>
                            )}

                            {canViewTaxInvoices && (
                                <Link
                                    to={`/tax-invoices/create`}
                                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center space-x-1 transition-all"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>+ E-Faktur</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Section 1: Linked Quotes */}
                    {canViewQuotes && (
                        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                            <h4 className="font-bold text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <Receipt className="w-4 h-4" />
                                    <span>Penawaran Harga (Quotes) Terhubung ({project.quotes?.length || 0})</span>
                                </span>
                                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                    Total: {formatRp(financialSummary.total_quotes)}
                                </span>
                            </h4>

                            {project.quotes?.length === 0 ? (
                                <p className="text-xs text-slate-400 italic py-2">Belum ada dokumen penawaran (Quote) terhubung ke project ini.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                                                <th className="py-2 px-3">No. Quote</th>
                                                <th className="py-2 px-3">Tanggal Valid</th>
                                                <th className="py-2 px-3">Grand Total</th>
                                                <th className="py-2 px-3">Status</th>
                                                <th className="py-2 px-3 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                            {project.quotes?.map((q) => (
                                                <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                                    <td className="py-2 px-3 font-mono font-bold text-purple-600 dark:text-purple-400">
                                                        <Link to={`/quotes/${q.id}/edit`} className="hover:underline">
                                                            #{q.quote_number}
                                                        </Link>
                                                    </td>
                                                    <td className="py-2 px-3 text-slate-500">{formatDate(q.valid_until)}</td>
                                                    <td className="py-2 px-3 font-bold font-mono">{formatRp(q.grand_total)}</td>
                                                    <td className="py-2 px-3 font-bold text-[10px]">{q.status}</td>
                                                    <td className="py-2 px-3 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => openPdfPreview(`/quotes/${q.id}/pdf`)}
                                                            className="text-purple-600 hover:underline font-semibold text-[11px] cursor-pointer"
                                                        >
                                                            Preview PDF
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Section 2: Linked Invoices */}
                    {canViewInvoices && (
                        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                            <h4 className="font-bold text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <FileText className="w-4 h-4" />
                                    <span>Invoice Tagihan Terhubung ({project.invoices?.length || 0})</span>
                                </span>
                                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                    Total: {formatRp(financialSummary.total_invoices)}
                                </span>
                            </h4>

                            {project.invoices?.length === 0 ? (
                                <p className="text-xs text-slate-400 italic py-2">Belum ada invoice tagihan terhubung ke project ini.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                                                <th className="py-2 px-3">No. Invoice</th>
                                                <th className="py-2 px-3">Jatuh Tempo</th>
                                                <th className="py-2 px-3">Grand Total</th>
                                                <th className="py-2 px-3">Sudah Dibayar</th>
                                                <th className="py-2 px-3">Status</th>
                                                <th className="py-2 px-3 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                            {project.invoices?.map((inv) => (
                                                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                                    <td className="py-2 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                                                        <Link to={`/invoices/${inv.id}/edit`} className="hover:underline">
                                                            #{inv.invoice_number}
                                                        </Link>
                                                    </td>
                                                    <td className="py-2 px-3 text-slate-500">{formatDate(inv.due_date)}</td>
                                                    <td className="py-2 px-3 font-bold font-mono">{formatRp(inv.grand_total)}</td>
                                                    <td className="py-2 px-3 font-bold font-mono text-emerald-600">{formatRp(inv.paid_amount)}</td>
                                                    <td className="py-2 px-3 font-bold text-[10px]">{inv.status}</td>
                                                    <td className="py-2 px-3 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => openPdfPreview(`/invoices/${inv.id}/pdf`)}
                                                            className="text-blue-600 hover:underline font-semibold text-[11px] cursor-pointer"
                                                        >
                                                            Preview PDF
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Section 3: Linked Payments & Kwitansi */}
                    {canViewPayments && (
                        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                            <h4 className="font-bold text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <CreditCard className="w-4 h-4" />
                                    <span>Kwitansi Pembayaran Terhubung ({project.payments?.length || 0})</span>
                                </span>
                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                    Total Diterima: {formatRp(financialSummary.total_paid)}
                                </span>
                            </h4>

                            {project.payments?.length === 0 ? (
                                <p className="text-xs text-slate-400 italic py-2">Belum ada pembayaran/kwitansi terhubung ke project ini.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                                                <th className="py-2 px-3">No. Kwitansi</th>
                                                <th className="py-2 px-3">Ref Invoice</th>
                                                <th className="py-2 px-3">Tgl Bayar</th>
                                                <th className="py-2 px-3">Metode</th>
                                                <th className="py-2 px-3">Jumlah Uang</th>
                                                <th className="py-2 px-3 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                            {project.payments?.map((pay) => (
                                                <tr key={pay.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                                    <td className="py-2 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                        <Link to={`/payments/${pay.id}/edit`} className="hover:underline">
                                                            #{pay.payment_number}
                                                        </Link>
                                                    </td>
                                                    <td className="py-2 px-3 font-mono text-slate-500">{pay.invoice?.invoice_number || '-'}</td>
                                                    <td className="py-2 px-3 text-slate-500">{formatDate(pay.payment_date)}</td>
                                                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{pay.payment_method?.name || '-'}</td>
                                                    <td className="py-2 px-3 font-extrabold font-mono text-emerald-600">{formatRp(pay.amount)}</td>
                                                    <td className="py-2 px-3 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => openPdfPreview(`/payments/${pay.id}/receipt`)}
                                                            className="text-emerald-600 hover:underline font-semibold text-[11px] cursor-pointer"
                                                        >
                                                            Cetak Kwitansi
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Section 4: Linked E-Faktur / Tax Invoices */}
                    {canViewTaxInvoices && (
                        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                            <h4 className="font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <FileCheck className="w-4 h-4" />
                                    <span>E-Faktur / Faktur Pajak Terhubung ({project.taxInvoices?.length || 0})</span>
                                </span>
                            </h4>

                            {project.taxInvoices?.length === 0 ? (
                                <p className="text-xs text-slate-400 italic py-2">Belum ada berkas E-Faktur terhubung ke project ini.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                                                <th className="py-2 px-3">No. Faktur Pajak</th>
                                                <th className="py-2 px-3">Ref Invoice</th>
                                                <th className="py-2 px-3">Tanggal Pajak</th>
                                                <th className="py-2 px-3">DPP</th>
                                                <th className="py-2 px-3">PPN</th>
                                                <th className="py-2 px-3">Total</th>
                                                <th className="py-2 px-3">Status</th>
                                                <th className="py-2 px-3 text-right">Berkas</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                            {project.taxInvoices?.map((ti) => (
                                                <tr key={ti.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                                    <td className="py-2 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                                        #{ti.tax_invoice_number}
                                                    </td>
                                                    <td className="py-2 px-3 font-mono text-slate-500">{ti.invoice?.invoice_number || '-'}</td>
                                                    <td className="py-2 px-3 text-slate-500">{formatDate(ti.tax_date)}</td>
                                                    <td className="py-2 px-3 font-mono">{formatRp(ti.dpp_amount)}</td>
                                                    <td className="py-2 px-3 font-mono text-emerald-600">{formatRp(ti.tax_amount)}</td>
                                                    <td className="py-2 px-3 font-bold font-mono">{formatRp(ti.total_amount)}</td>
                                                    <td className="py-2 px-3 font-bold text-[10px]">{ti.status}</td>
                                                    <td className="py-2 px-3 text-right">
                                                        {ti.file_url ? (
                                                            <a href={ti.file_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-semibold text-[11px]">
                                                                Download File
                                                            </a>
                                                        ) : (
                                                            <span className="text-slate-400 text-[10px]">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Section 5: Linked Delivery Orders / Surat Jalan */}
                    {canViewDeliveryOrders && (
                        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                            <h4 className="font-bold text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <Truck className="w-4 h-4" />
                                    <span>Surat Jalan / Delivery Orders Terhubung ({project.deliveryOrders?.length || 0})</span>
                                </span>
                            </h4>

                            {project.deliveryOrders?.length === 0 ? (
                                <p className="text-xs text-slate-400 italic py-2">Belum ada dokumen Surat Jalan terhubung ke project ini.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                                                <th className="py-2 px-3">No. Surat Jalan</th>
                                                <th className="py-2 px-3">Tanggal Kirim</th>
                                                <th className="py-2 px-3">Penerima / Alamat</th>
                                                <th className="py-2 px-3">Ekspedisi / Driver</th>
                                                <th className="py-2 px-3">Status</th>
                                                <th className="py-2 px-3 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                            {project.deliveryOrders?.map((doItem) => (
                                                <tr key={doItem.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                                    <td className="py-2 px-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                                                        <Link to={`/delivery-orders/${doItem.id}/edit`} className="hover:underline">
                                                            #{doItem.do_number}
                                                        </Link>
                                                    </td>
                                                    <td className="py-2 px-3 text-slate-500">{formatDate(doItem.do_date)}</td>
                                                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">
                                                        <div className="font-bold">{doItem.recipient_name || '-'}</div>
                                                        <div className="text-[10px] text-slate-400 truncate max-w-xs">{doItem.shipping_address}</div>
                                                    </td>
                                                    <td className="py-2 px-3 text-slate-600 dark:text-slate-300">
                                                        {doItem.expedition_name || doItem.driver_name || '-'}
                                                    </td>
                                                    <td className="py-2 px-3 font-bold text-[10px]">{doItem.status}</td>
                                                    <td className="py-2 px-3 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => openPdfPreview(`/delivery-orders/${doItem.id}/pdf`)}
                                                            className="text-amber-600 hover:underline font-semibold text-[11px] cursor-pointer"
                                                        >
                                                            Preview PDF
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 5: VENDOR & PEMBELIAN */}
            {activeTab === 'vendors' && (
                <div className="space-y-6 text-xs">
                    {/* Stat Card Pengeluaran Vendor */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                <span>Pengeluaran &amp; Pengadaan Vendor Proyek</span>
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Seluruh tagihan masuk (Invoice In) dan penawaran harga (Quote In) dari vendor/mitra yang dialokasikan ke proyek ini.
                            </p>
                        </div>
                        <div className="px-4 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-right shrink-0">
                            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">Total Tagihan Vendor</span>
                            <span className="text-base font-black font-mono text-purple-700 dark:text-purple-300">
                                Rp {Number(financialSummary.total_vendor_invoices || 0).toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>

                    {/* Table Tagihan Vendor (Invoice In) */}
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-purple-500" />
                                <span>Tagihan Vendor (Invoice In / Bills) ({project.vendor_invoices?.length || 0})</span>
                            </h4>
                            <Link
                                to="/vendor-invoices/create"
                                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center space-x-1 shadow-md shadow-purple-500/20 text-xs"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tambah Tagihan Vendor</span>
                            </Link>
                        </div>

                        {(!project.vendor_invoices || project.vendor_invoices.length === 0) ? (
                            <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                Belum ada tagihan vendor yang dialokasikan ke proyek ini.
                            </div>
                        ) : (
                            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                                            <th className="p-3">No. Invoice Vendor</th>
                                            <th className="p-3">Nama Vendor</th>
                                            <th className="p-3">Tgl Invoice</th>
                                            <th className="p-3 text-right">Total Tagihan</th>
                                            <th className="p-3 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                        {project.vendor_invoices.map((inv) => (
                                            <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                                <td className="p-3 font-mono font-bold text-purple-600 dark:text-purple-400">{inv.invoice_number}</td>
                                                <td className="p-3 font-semibold">{inv.vendor?.company_name || '-'}</td>
                                                <td className="p-3 font-mono">{inv.invoice_date}</td>
                                                <td className="p-3 text-right font-mono font-bold">Rp {Number(inv.total_amount).toLocaleString('id-ID')}</td>
                                                <td className="p-3 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                        inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                    }`}>
                                                        {inv.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Table Penawaran Vendor (Quote In) */}
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-500" />
                                <span>Penawaran Vendor (Quote In) ({project.vendor_quotes?.length || 0})</span>
                            </h4>
                            <Link
                                to="/vendor-quotes"
                                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center space-x-1 shadow-md shadow-blue-500/20 text-xs"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Kelola Penawaran Vendor</span>
                            </Link>
                        </div>

                        {(!project.vendor_quotes || project.vendor_quotes.length === 0) ? (
                            <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                Belum ada penawaran vendor yang dialokasikan ke proyek ini.
                            </div>
                        ) : (
                            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                                            <th className="p-3">No. Penawaran</th>
                                            <th className="p-3">Nama Vendor</th>
                                            <th className="p-3">Tanggal</th>
                                            <th className="p-3 text-right">Nilai Penawaran</th>
                                            <th className="p-3 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                        {project.vendor_quotes.map((q) => (
                                            <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                                <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">{q.quote_number}</td>
                                                <td className="p-3 font-semibold">{q.vendor?.company_name || '-'}</td>
                                                <td className="p-3 font-mono">{q.quote_date}</td>
                                                <td className="p-3 text-right font-mono font-bold">Rp {Number(q.total_amount).toLocaleString('id-ID')}</td>
                                                <td className="p-3 text-center">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                                        {q.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal Create / Edit Task */}
            {showTaskModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <span>{editingTaskId ? 'Edit Tugas Project' : 'Tambah Tugas Project Baru'}</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowTaskModal(false)}
                                className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveTask} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Judul Tugas *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="ex: Desain Wireframe Layout Dashboard Admin"
                                    value={taskForm.title}
                                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Penanggung Jawab (Assignee)
                                    </label>
                                    <SearchableSelect
                                        options={[
                                            { value: '', label: '-- Pilih Karyawan Tim --' },
                                            ...(project?.is_all_employees_involved ? employees : (project?.members || [])).map((emp) => ({
                                                value: emp.id,
                                                label: emp.full_name,
                                                sublabel: emp.position || 'Staff'
                                            }))
                                        ]}
                                        value={taskForm.assigned_employee_id}
                                        onChange={(val) => setTaskForm({ ...taskForm, assigned_employee_id: val })}
                                        placeholder="Pilih Assignee..."
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Prioritas Tugas *
                                    </label>
                                    <SearchableSelect
                                        options={[
                                            { value: 'LOW', label: 'LOW (Rendah)' },
                                            { value: 'MEDIUM', label: 'MEDIUM (Sedang)' },
                                            { value: 'HIGH', label: 'HIGH (Tinggi)' },
                                            { value: 'URGENT', label: 'URGENT (Sangat Penting)' },
                                        ]}
                                        value={taskForm.priority}
                                        onChange={(val) => setTaskForm({ ...taskForm, priority: val })}
                                        placeholder="Pilih Prioritas..."
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Status Pekerjaan *
                                    </label>
                                    <SearchableSelect
                                        options={[
                                            { value: 'TODO', label: 'TODO (Akan Dikerjakan)' },
                                            { value: 'IN_PROGRESS', label: 'IN PROGRESS (Sedang Dikerjakan)' },
                                            { value: 'IN_REVIEW', label: 'IN REVIEW (Pemeriksaan)' },
                                            { value: 'COMPLETED', label: 'COMPLETED (Selesai)' },
                                        ]}
                                        value={taskForm.status}
                                        onChange={(val) => setTaskForm({ ...taskForm, status: val })}
                                        placeholder="Pilih Status..."
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Tanggal Tenggat (Due Date)
                                    </label>
                                    <input
                                        type="date"
                                        value={taskForm.due_date}
                                        onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Deskripsi Tugas (Opsional)
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Rincian petunjuk pengerjaan tugas..."
                                    value={taskForm.description}
                                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
                                />
                            </div>

                            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowTaskModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingTask}
                                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center space-x-1.5 transition-colors disabled:opacity-60 text-xs shadow-md shadow-indigo-500/20"
                                >
                                    {submittingTask ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                    <span>{editingTaskId ? 'Simpan Perubahan' : 'Simpan Tugas'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
