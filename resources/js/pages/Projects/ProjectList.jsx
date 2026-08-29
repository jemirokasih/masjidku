import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmContext';
import SearchableSelect from '../../components/SearchableSelect';
import {
    FolderKanban,
    Plus,
    RefreshCw,
    Search,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronDown,
    MoreVertical,
    Edit3,
    Trash2,
    Eye,
    TrendingUp,
    DollarSign,
    X,
    Save,
    List,
    LayoutGrid,
    SlidersHorizontal,
    ChevronUp
} from 'lucide-react';

export default function ProjectList() {
    const navigate = useNavigate();
    const { confirm, showAlert } = useConfirm();
    const [projects, setProjects] = useState([]);
    const [clients, setClients] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [clientFilter, setClientFilter] = useState('');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');
    const [showAdvanceFilter, setShowAdvanceFilter] = useState(false);
    const [viewMode, setViewMode] = useState('table'); // 'table' (default) | 'grid'

    const activeFilterCount = [
        statusFilter,
        clientFilter,
        startDateFilter,
        endDateFilter,
    ].filter(Boolean).length;

    const handleResetFilters = () => {
        setStatusFilter('');
        setClientFilter('');
        setStartDateFilter('');
        setEndDateFilter('');
    };

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const emptyForm = {
        name: '',
        client_id: '',
        status: 'PLANNING',
        budget: 0,
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        description: '',
        progress_percent: 0,
        is_all_employees_involved: false,
        employee_ids: [],
    };
    const [form, setForm] = useState(emptyForm);

    // Dropdown state per row
    const [activeDropdownId, setActiveDropdownId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [prjRes, clientRes, empRes] = await Promise.all([
                api.get('/projects', {
                    params: {
                        search: searchTerm || undefined,
                        status: statusFilter || undefined,
                        client_id: clientFilter || undefined,
                        start_date: startDateFilter || undefined,
                        end_date: endDateFilter || undefined,
                    }
                }),
                api.get('/clients').catch(() => ({ data: { data: [] } })),
                api.get('/hr/employees').catch(() => ({ data: { data: [] } })),
            ]);
            setProjects(prjRes.data.data || []);
            setClients(clientRes.data.data || []);
            setEmployees(empRes.data.data || []);
        } catch (err) {
            console.error('Error fetching projects data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm, statusFilter, clientFilter, startDateFilter, endDateFilter]);

    useEffect(() => {
        const handleOutsideClick = () => setActiveDropdownId(null);
        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, []);

    const formatRp = (val) => 'Rp ' + new Intl.NumberFormat('id-ID').format(val || 0);
    const formatDate = (d) => {
        if (!d) return '-';
        return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
        });
    };

    const handleOpenCreate = () => {
        navigate('/projects/create');
    };

    const handleOpenEdit = (e, project) => {
        e.stopPropagation();
        navigate(`/projects/${project.id}/edit`);
    };



    const handleDelete = async (e, id) => {
        e.stopPropagation();
        setActiveDropdownId(null);
        const confirmed = await confirm({
            title: 'Hapus Project?',
            message: 'Yakin ingin menghapus project ini beserta seluruh tugas & berkasnya? Action ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Hapus Project',
            cancelText: 'Batal',
            variant: 'danger',
        });
        if (!confirmed) return;

        try {
            await api.delete(`/projects/${id}`);
            showAlert({ title: 'Berhasil', message: 'Project berhasil dihapus.', variant: 'success' });
            fetchData();
        } catch (err) {
            showAlert({ title: 'Gagal', message: 'Gagal menghapus project: ' + (err.response?.data?.message || err.message), variant: 'danger' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name) {
            alert('Nama project wajib diisi!');
            return;
        }

        setSubmitting(true);
        try {
            if (editingId) {
                await api.put(`/projects/${editingId}`, form);
            } else {
                await api.post('/projects', form);
            }
            setShowModal(false);
            setForm(emptyForm);
            setEditingId(null);
            fetchData();
        } catch (err) {
            alert('Gagal menyimpan project: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PLANNING':
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">PERENCANAAN</span>;
            case 'IN_PROGRESS':
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">SEDANG BERJALAN</span>;
            case 'ON_HOLD':
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">DITUNDA</span>;
            case 'COMPLETED':
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">SELESAI</span>;
            case 'CANCELLED':
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">DIBATALKAN</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">{status}</span>;
        }
    };

    const filteredProjects = projects.filter(p => {
        const q = searchTerm.toLowerCase();
        const matchesSearch = p.name?.toLowerCase().includes(q) ||
                              p.code?.toLowerCase().includes(q) ||
                              p.client?.company_name?.toLowerCase().includes(q) ||
                              p.client?.name?.toLowerCase().includes(q);
        const matchesStatus = statusFilter ? p.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    const totalBudgetSum = projects.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0);
    const activeProjectsCount = projects.filter(p => p.status === 'IN_PROGRESS').length;
    const completedProjectsCount = projects.filter(p => p.status === 'COMPLETED').length;

    return (
        <div className="space-y-6 pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                        <FolderKanban className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <span>Manajemen Project & Operasional</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Kelola project klien, pantau progres pekerjaan, task management, dokumen berkas, &amp; dokumen keuangan.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center space-x-1.5 transition-all self-start md:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Buat Project Baru</span>
                </button>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                        <FolderKanban className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Project</span>
                        <span className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">{projects.length}</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Sedang Berjalan</span>
                        <span className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono">{activeProjectsCount}</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Project Selesai</span>
                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">{completedProjectsCount}</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Nilai Budget Total</span>
                        <span className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">{formatRp(totalBudgetSum)}</span>
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari kode, nama project, atau klien..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
                        />
                    </div>

                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
                        <button
                            type="button"
                            onClick={() => setShowAdvanceFilter(!showAdvanceFilter)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all border ${
                                showAdvanceFilter || activeFilterCount > 0
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 shadow-sm'
                                    : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                            }`}
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span>Filter Lanjutan</span>
                            {activeFilterCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white">
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
                                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
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
                                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
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
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Status Project</label>
                            <SearchableSelect
                                options={[
                                    { value: '', label: 'Semua Status Project' },
                                    { value: 'PLANNING', label: 'PLANNING (Perencanaan)' },
                                    { value: 'IN_PROGRESS', label: 'IN_PROGRESS (Sedang Berjalan)' },
                                    { value: 'ON_HOLD', label: 'ON_HOLD (Ditunda)' },
                                    { value: 'COMPLETED', label: 'COMPLETED (Selesai)' },
                                    { value: 'CANCELLED', label: 'CANCELLED (Dibatalkan)' },
                                ]}
                                value={statusFilter}
                                onChange={(val) => setStatusFilter(val)}
                                placeholder="Semua Status..."
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Filter Klien</label>
                            <SearchableSelect
                                options={[
                                    { value: '', label: 'Semua Klien' },
                                    ...clients.map(c => ({
                                        value: c.id,
                                        label: c.company_name || c.name,
                                        code: c.code,
                                        alias: c.alias,
                                        sublabel: c.company_name && c.name !== c.company_name ? c.name : '',
                                        raw: c,
                                    }))
                                ]}
                                value={clientFilter}
                                onChange={(val) => setClientFilter(val)}
                                placeholder="Semua Klien..."
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Periode Tanggal Mulai</label>
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
                                <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
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

            {/* Table / List View */}
            {loading ? (
                <div className="flex justify-center items-center min-h-[300px] text-xs text-slate-500 dark:text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mr-2 text-indigo-600 dark:text-indigo-400" />
                    <span>Memuat daftar project...</span>
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-xs text-slate-500 dark:text-slate-400 space-y-3">
                    <FolderKanban className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">Belum ada data project ditemukan</p>
                    <p className="text-slate-400">Klik &quot;Buat Project Baru&quot; untuk menambahkan data project baru.</p>
                </div>
            ) : viewMode === 'table' ? (
                /* TABLE VIEW (DEFAULT) */
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                    <th className="py-3 px-4">Kode Project</th>
                                    <th className="py-3 px-4">Nama Project</th>
                                    <th className="py-3 px-4">Klien</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Tim Terlibat</th>
                                    <th className="py-3 px-4">Progress %</th>
                                    <th className="py-3 px-4">Budget</th>
                                    <th className="py-3 px-4">Target Selesai</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                {filteredProjects.map((p) => (
                                    <tr
                                        key={p.id}
                                        onClick={() => navigate(`/projects/${p.id}`)}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                                    >
                                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                            {p.code}
                                        </td>
                                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                                            <div>{p.name}</div>
                                            <div className="text-[10px] font-normal text-slate-400 line-clamp-1 mt-0.5">
                                                {p.description || 'Tidak ada deskripsi'}
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                                            {p.client?.company_name || p.client?.name || '-'}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            {getStatusBadge(p.status)}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            {p.is_all_employees_involved ? (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                                                    🌐 Semua Karyawan
                                                </span>
                                            ) : p.members && p.members.length > 0 ? (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                                    👥 {p.members.length} Karyawan
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-slate-400 italic">Belum Di-assign</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 w-36">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                                                        style={{ width: `${Math.min(100, Math.max(0, p.progress_percent || 0))}%` }}
                                                    />
                                                </div>
                                                <span className="font-mono font-bold text-[10px] text-slate-600 dark:text-slate-400">
                                                    {p.progress_percent || 0}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 font-extrabold font-mono text-slate-800 dark:text-slate-200">
                                            {formatRp(p.budget)}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                                            {formatDate(p.end_date)}
                                        </td>
                                        <td className="py-3.5 px-4 text-right relative">
                                            <div className="flex items-center justify-end space-x-1">
                                                <Link
                                                    to={`/projects/${p.id}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                                                    title="Lihat Detail Project"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleOpenEdit(e, p)}
                                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                    title="Edit Project"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleDelete(e, p.id)}
                                                    className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                                                    title="Hapus Project"
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
                </div>
            ) : (
                /* CARD / GRID VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProjects.map((p) => (
                        <div
                            key={p.id}
                            onClick={() => navigate(`/projects/${p.id}`)}
                            className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3 shadow-sm cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded border border-indigo-500/20">
                                    {p.code}
                                </span>
                                <div>{getStatusBadge(p.status)}</div>
                            </div>

                            <div>
                                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{p.name}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{p.description || 'Tidak ada deskripsi'}</p>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                                <div className="text-slate-600 dark:text-slate-300 flex items-center space-x-1.5">
                                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="font-semibold">{p.client?.company_name || p.client?.name || 'Internal'}</span>
                                </div>
                                {p.is_all_employees_involved ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                                        🌐 Semua Karyawan
                                    </span>
                                ) : p.members && p.members.length > 0 ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                        👥 {p.members.length} Karyawan
                                    </span>
                                ) : null}
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1 pt-1">
                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                                    <span>PROGRESS</span>
                                    <span className="font-mono">{p.progress_percent || 0}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                                        style={{ width: `${Math.min(100, Math.max(0, p.progress_percent || 0))}%` }}
                                    />
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                                <div>
                                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Budget</span>
                                    <span className="font-extrabold font-mono text-slate-900 dark:text-slate-100">{formatRp(p.budget)}</span>
                                </div>

                                <div className="flex items-center space-x-1">
                                    <Link
                                        to={`/projects/${p.id}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                                        title="Lihat Detail Project"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={(e) => handleOpenEdit(e, p)}
                                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                        title="Edit Project"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => handleDelete(e, p.id)}
                                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                                        title="Hapus Project"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Quick Create / Edit Project */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <FolderKanban className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <span>{editingId ? 'Edit Data Project' : 'Buat Project Baru'}</span>
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
                            {/* Nama Project */}
                            <div>
                                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Nama Project *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="ex: Pengembangan Sistem Website E-Commerce Client A"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            {/* Klien & Status */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Pilih Klien (Opsional)
                                    </label>
                                    <SearchableSelect
                                        options={[
                                            { value: '', label: '-- Tanpa Klien / Internal --' },
                                            ...clients.map((c) => ({
                                                value: c.id,
                                                label: c.company_name || c.name,
                                                code: c.code,
                                                alias: c.alias,
                                                sublabel: c.company_name && c.name !== c.company_name ? c.name : '',
                                                raw: c,
                                            }))
                                        ]}
                                        value={form.client_id}
                                        onChange={(val) => setForm({ ...form, client_id: val })}
                                        placeholder="Pilih Klien..."
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Status Project *
                                    </label>
                                    <SearchableSelect
                                        options={[
                                            { value: 'PLANNING', label: 'Perencanaan (PLANNING)' },
                                            { value: 'IN_PROGRESS', label: 'Sedang Berjalan (IN_PROGRESS)' },
                                            { value: 'ON_HOLD', label: 'Ditunda (ON_HOLD)' },
                                            { value: 'COMPLETED', label: 'Selesai (COMPLETED)' },
                                            { value: 'CANCELLED', label: 'Dibatalkan (CANCELLED)' },
                                        ]}
                                        value={form.status}
                                        onChange={(val) => setForm({ ...form, status: val })}
                                        placeholder="Pilih Status..."
                                        required
                                    />
                                </div>
                            </div>

                            {/* Budget & Progress */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Budget Nilai Project (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={form.budget}
                                        onChange={(e) => setForm({ ...form, budget: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Progress Manual (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={form.progress_percent}
                                        onChange={(e) => setForm({ ...form, progress_percent: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Tanggal Mulai & Selesai */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Tanggal Mulai
                                    </label>
                                    <input
                                        type="date"
                                        value={form.start_date}
                                        onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Target Selesai (End Date)
                                    </label>
                                    <input
                                        type="date"
                                        value={form.end_date}
                                        onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Deskripsi */}
                            <div>
                                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Deskripsi / Catatan Project
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Deskripsi ruang lingkup pekerjaan project..."
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
                                />
                            </div>

                            {/* Anggota Tim / Karyawan Terlibat */}
                            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                        <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                        <span>Karyawan / Anggota Tim Terlibat</span>
                                    </label>

                                    <label className="flex items-center space-x-2 cursor-pointer bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <input
                                            type="checkbox"
                                            checked={form.is_all_employees_involved}
                                            onChange={(e) => setForm({
                                                ...form,
                                                is_all_employees_involved: e.target.checked,
                                                employee_ids: e.target.checked ? [] : form.employee_ids,
                                            })}
                                            className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                                        />
                                        <span className="font-bold text-[11px] text-indigo-600 dark:text-indigo-400">Semua Karyawan Terlibat</span>
                                    </label>
                                </div>

                                {!form.is_all_employees_involved && (
                                    <div className="space-y-2 pt-1">
                                        <span className="text-[11px] text-slate-500 font-semibold block">Pilih Karyawan Spesifik:</span>
                                        <div className="max-h-36 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                                            {employees.map((emp) => {
                                                const isChecked = form.employee_ids.includes(emp.id);
                                                return (
                                                    <label
                                                        key={emp.id}
                                                        className={`flex items-center space-x-2 p-2 rounded-md border text-xs cursor-pointer transition-all ${
                                                            isChecked
                                                                ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold'
                                                                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setForm({ ...form, employee_ids: [...form.employee_ids, emp.id] });
                                                                } else {
                                                                    setForm({ ...form, employee_ids: form.employee_ids.filter(id => id !== emp.id) });
                                                                }
                                                             }}
                                                            className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                                                        />
                                                        <div className="truncate">
                                                            <span className="block truncate">{emp.full_name}</span>
                                                            <span className="text-[10px] text-slate-400 font-normal truncate block">{typeof emp.department === 'object' ? emp.department?.name : (emp.department || 'Umum')}</span>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
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
                                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center space-x-1.5 transition-colors disabled:opacity-60 text-xs shadow-md shadow-indigo-500/20"
                                >
                                    {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                    <span>{editingId ? 'Simpan Perubahan' : 'Simpan Project'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
