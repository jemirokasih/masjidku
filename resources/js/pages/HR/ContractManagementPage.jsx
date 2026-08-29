import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { useConfirm } from '../../context/ConfirmContext';
import { useAuth } from '../../context/AuthContext';
import SearchableSelect from '../../components/SearchableSelect';
import {
    FileText,
    Plus,
    Search,
    RefreshCw,
    Edit3,
    Trash2,
    X,
    UploadCloud,
    Check,
    AlertCircle,
    Calendar,
    DollarSign,
    User,
    Download,
    ExternalLink,
    FileCheck,
    Briefcase,
    Building2,
    MapPin,
    PenTool
} from 'lucide-react';

export default function ContractManagementPage() {
    const { confirm } = useConfirm();
    const { user } = useAuth();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const employeeIdParam = queryParams.get('employee_id');

    const [contracts, setContracts] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [employeeFilter, setEmployeeFilter] = useState(employeeIdParam || '');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        endingSoon: 0,
        expired: 0
    });

    // View and modals state
    const [view, setView] = useState('list'); // 'list' or 'form'
    const [editingItem, setEditingItem] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [activeContractForUpload, setActiveContractForUpload] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    // Form state
    const [form, setForm] = useState({
        employee_id: '',
        contract_type: 'PKWT',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        base_salary: '',
        position: '',
        department: '',
        trial_period_months: 0,
        work_location: 'Kantor Pusat',
        signer_name: '',
        signer_position: '',
        status: 'ACTIVE',
        template_type: 'formal',
        additional_terms: '',
        contract_number: '',
        use_auto_number: true
    });

    const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: 'success' });

    const showAlert = (message, type = 'success') => {
        setAlertConfig({ show: true, message, type });
        setTimeout(() => setAlertConfig({ show: false, message: '', type: 'success' }), 5000);
    };

    // Load contracts
    const fetchContracts = async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                search: searchTerm,
                contract_type: typeFilter,
                status: statusFilter,
                employee_id: employeeFilter
            };
            const response = await api.get('/hr/contracts', { params });
            if (response.data?.status === 'success') {
                setContracts(response.data.data.data || []);
                setCurrentPage(response.data.data.current_page);
                setLastPage(response.data.data.last_page);
                setTotal(response.data.data.total);

                // Calculate local stats from payload or simple sums
                // In actual deployment, separate endpoint or aggregate query could be used.
                // We'll calculate mock/real-time stats from returned set for visual premium feel:
                const items = response.data.data.data || [];
                const active = items.filter(c => c.status === 'ACTIVE').length;
                const expired = items.filter(c => c.status === 'EXPIRED').length;
                const draft = items.filter(c => c.status === 'DRAFT').length;
                setStats({
                    total: response.data.data.total,
                    active: active,
                    endingSoon: items.filter(c => {
                        if (!c.end_date || c.status !== 'ACTIVE') return false;
                        const diffTime = new Date(c.end_date) - new Date();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays >= 0 && diffDays <= 30;
                    }).length,
                    expired: expired
                });
            }
        } catch (err) {
            console.error('Error fetching contracts:', err);
            showAlert('Gagal memuat daftar kontrak kerja.', 'danger');
        } finally {
            setLoading(false);
        }
    };

    // Load employees list for dropdown
    const fetchEmployees = async () => {
        try {
            const response = await api.get('/hr/employees', { params: { per_page: 100 } });
            if (response.data?.status === 'success') {
                setEmployees(response.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching employees:', err);
        }
    };

    // Fetch company settings default signer info
    const fetchDefaultSigner = async () => {
        try {
            const response = await api.get('/settings');
            if (response.data?.status === 'success' && response.data.data) {
                const s = response.data.data;
                setForm(prev => ({
                    ...prev,
                    signer_name: s.signature_signer_name || '',
                    signer_position: s.signature_signer_title || '',
                    template_type: s.contract_template || 'formal'
                }));
            }
        } catch (err) {
            console.error('Error fetching default settings signer:', err);
        }
    };

    useEffect(() => {
        fetchContracts(1);
        fetchEmployees();
        fetchDefaultSigner();
    }, [searchTerm, typeFilter, statusFilter, employeeFilter]);

    // Handle Employee Selection Change to auto-fill department, position, and salary
    const handleEmployeeChange = (empId) => {
        const emp = employees.find(e => e.id === parseInt(empId));
        if (emp) {
            setForm(prev => ({
                ...prev,
                employee_id: empId,
                position: emp.position || '',
                department: emp.department || '',
                base_salary: emp.salary !== undefined && emp.salary !== null ? Math.round(emp.salary) : prev.base_salary
            }));
        } else {
            setForm(prev => ({ ...prev, employee_id: empId }));
        }
    };

    // Open Modal Create
    const handleOpenCreateModal = () => {
        setEditingItem(null);
        setForm({
            employee_id: '',
            contract_type: 'PKWT',
            start_date: new Date().toISOString().split('T')[0],
            end_date: '',
            base_salary: '',
            position: '',
            department: '',
            trial_period_months: 0,
            work_location: 'Kantor Pusat',
            signer_name: '',
            signer_position: '',
            status: 'ACTIVE',
            template_type: 'formal',
            additional_terms: '',
            contract_number: '',
            use_auto_number: true
        });
        fetchDefaultSigner();
        setView('form');
    };

    // Open Modal Edit
    const handleOpenEditModal = (item) => {
        setEditingItem(item);
        setForm({
            employee_id: item.employee_id,
            contract_type: item.contract_type || 'PKWT',
            start_date: item.start_date ? item.start_date.substring(0, 10) : '',
            end_date: item.end_date ? item.end_date.substring(0, 10) : '',
            base_salary: Math.round(item.base_salary) || '',
            position: item.position || '',
            department: item.department || '',
            trial_period_months: item.trial_period_months || 0,
            work_location: item.work_location || 'Kantor Pusat',
            signer_name: item.signer_name || '',
            signer_position: item.signer_position || '',
            status: item.status || 'ACTIVE',
            template_type: item.template_type || 'formal',
            additional_terms: item.additional_terms || '',
            contract_number: item.contract_number || '',
            use_auto_number: false
        });
        setView('form');
    };

    // Submit Form (Create / Edit)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingItem) {
                // Update
                const response = await api.put(`/hr/contracts/${editingItem.id}`, form);
                if (response.data?.status === 'success') {
                    showAlert('Kontrak kerja berhasil diperbarui.');
                    setView('list');
                    fetchContracts(currentPage);
                }
            } else {
                // Create
                const response = await api.post('/hr/contracts', form);
                if (response.data?.status === 'success') {
                    showAlert('Kontrak kerja berhasil dibuat.');
                    setView('list');
                    fetchContracts(1);
                }
            }
        } catch (err) {
            console.error('Error submitting contract:', err);
            showAlert(err.response?.data?.message || 'Gagal menyimpan kontrak kerja.', 'danger');
        } finally {
            setSubmitting(false);
        }
    };

    // Delete Contract
    const handleDelete = async (id) => {
        const isConfirmed = await confirm({
            title: 'Hapus Kontrak Kerja',
            message: 'Apakah Anda yakin ingin menghapus kontrak kerja ini secara permanen dari sistem?',
            confirmLabel: 'Ya, Hapus',
            cancelLabel: 'Batal',
            variant: 'danger'
        });

        if (isConfirmed) {
            try {
                const response = await api.delete(`/hr/contracts/${id}`);
                if (response.data?.status === 'success') {
                    showAlert('Kontrak kerja berhasil dihapus.');
                    fetchContracts(currentPage);
                }
            } catch (err) {
                console.error('Error deleting contract:', err);
                showAlert('Gagal menghapus kontrak kerja.', 'danger');
            }
        }
    };

    // Print / Download Generated PDF
    const handlePrintPdf = async (id, code) => {
        const contractWindow = window.open('', '_blank');
        try {
            const response = await api.get(`/hr/contracts/${id}/pdf`, {
                responseType: 'blob'
            });
            const pdfUrl = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            if (contractWindow) {
                contractWindow.location.href = pdfUrl;
            } else {
                window.open(pdfUrl, '_blank', 'noopener,noreferrer');
            }
            window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
        } catch (err) {
            contractWindow?.close();
            console.error('Error printing contract PDF:', err);
            showAlert('Gagal membuat cetakan PDF kontrak.', 'danger');
        }
    };

    // Open Upload Modal
    const handleOpenUploadModal = (item) => {
        setActiveContractForUpload(item);
        setSelectedFile(null);
        setShowUploadModal(true);
    };

    // Submit Scan Upload
    const handleUploadScan = async (e) => {
        e.preventDefault();
        if (!selectedFile || !activeContractForUpload) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await api.post(`/hr/contracts/${activeContractForUpload.id}/upload-scan`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.data?.status === 'success') {
                showAlert('Salinan kontrak fisik berhasil diunggah.');
                setShowUploadModal(false);
                fetchContracts(currentPage);
            }
        } catch (err) {
            console.error('Error uploading contract scan:', err);
            showAlert(err.response?.data?.message || 'Gagal mengunggah salinan kontrak.', 'danger');
        } finally {
            setUploading(false);
        }
    };

    const formatRupiah = (num) => {
        if (!num) return 'Rp 0';
        return 'Rp ' + parseFloat(num).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    const typeBadges = {
        PKWT: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
        PKWTT: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
        INTERNSHIP: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        PROBATION: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
    };

    const statusBadges = {
        DRAFT: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
        ACTIVE: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        EXPIRED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        TERMINATED: 'bg-red-600/10 text-red-600 dark:text-red-400 border-red-600/20'
    };

    return (
        <div className="p-6 md:p-8 space-y-6">
            {/* Alert Toast Notification */}
            {alertConfig.show && (
                <div className={`p-4 rounded-xl border flex items-center space-x-3 text-xs font-semibold ${
                    alertConfig.type === 'danger'
                        ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400'
                        : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400'
                }`}>
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="flex-1">{alertConfig.message}</p>
                </div>
            )}

            {view === 'list' ? (
                <>
                    {/* Header Title */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                <span>Manajemen Kontrak Kerja Karyawan</span>
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Kelola data kontrak (PKWT, PKWTT, Magang), buat penomoran otomatis, cetak surat formal, dan simpan arsip digital.
                            </p>
                        </div>
                        <button
                            onClick={handleOpenCreateModal}
                            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/15 transition-all text-center self-start md:self-auto"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Buat Kontrak Baru</span>
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-2">
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Kontrak</p>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.total}</span>
                                <span className="text-xs text-slate-400">kontrak</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-2">
                            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Kontrak Aktif</p>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.active}</span>
                                <span className="text-xs text-slate-400">berjalan</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-2">
                            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Akan Berakhir (30 Hari)</p>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.endingSoon}</span>
                                <span className="text-xs text-slate-400">karyawan</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-2">
                            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Kontrak Berakhir</p>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{stats.expired}</span>
                                <span className="text-xs text-slate-400">habis masa</span>
                            </div>
                        </div>
                    </div>

                    {/* Filter Panel & Search */}
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                        <div className="relative flex-1 max-w-lg">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Cari nomor kontrak, nama karyawan, atau NIK..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {/* Employee Filter */}
                            <div className="min-w-[160px]">
                                <SearchableSelect
                                    options={[
                                        { value: '', label: 'Semua Karyawan' },
                                        ...employees.map(emp => ({ value: emp.id, label: emp.full_name }))
                                    ]}
                                    value={employeeFilter}
                                    onChange={(val) => setEmployeeFilter(val)}
                                    placeholder="Semua Karyawan..."
                                />
                            </div>

                            {/* Type Filter */}
                            <div className="min-w-[160px]">
                                <SearchableSelect
                                    options={[
                                        { value: '', label: 'Semua Tipe Kontrak' },
                                        { value: 'PKWT', label: 'PKWT (Kontrak)' },
                                        { value: 'PKWTT', label: 'PKWTT (Tetap)' },
                                        { value: 'INTERNSHIP', label: 'INTERNSHIP (Magang)' },
                                        { value: 'PROBATION', label: 'PROBATION (Percobaan)' },
                                    ]}
                                    value={typeFilter}
                                    onChange={(val) => setTypeFilter(val)}
                                    placeholder="Semua Tipe..."
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="min-w-[140px]">
                                <SearchableSelect
                                    options={[
                                        { value: '', label: 'Semua Status' },
                                        { value: 'DRAFT', label: 'DRAFT' },
                                        { value: 'ACTIVE', label: 'ACTIVE' },
                                        { value: 'EXPIRED', label: 'EXPIRED' },
                                        { value: 'TERMINATED', label: 'TERMINATED' },
                                    ]}
                                    value={statusFilter}
                                    onChange={(val) => setStatusFilter(val)}
                                    placeholder="Semua Status..."
                                />
                            </div>

                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setTypeFilter('');
                                    setStatusFilter('');
                                    setEmployeeFilter('');
                                }}
                                title="Reset filter & pencarian"
                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* List Contracts Table */}
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center space-y-3">
                                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                                <span>Memuat daftar kontrak...</span>
                            </div>
                        ) : contracts.length === 0 ? (
                            <div className="p-16 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center space-y-3">
                                <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                                <span className="font-bold text-sm text-slate-700 dark:text-slate-300">Belum Ada Kontrak Kerja</span>
                                <span>Klik tombol "Buat Kontrak Baru" untuk membuat dokumen kontrak kerja baru.</span>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse font-sans text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 text-slate-500 font-bold uppercase tracking-wider">
                                            <th className="px-4.5 py-3">No. Kontrak &amp; Tipe</th>
                                            <th className="px-4.5 py-3">Karyawan</th>
                                            <th className="px-4.5 py-3">Jabatan / Dept</th>
                                            <th className="px-4.5 py-3">Masa Berlaku</th>
                                            <th className="px-4.5 py-3">Gaji Pokok</th>
                                            <th className="px-4.5 py-3">Status</th>
                                            <th className="px-4.5 py-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {contracts.map((c) => (
                                            <tr
                                                key={c.id}
                                                className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                                            >
                                                <td className="px-4.5 py-3.5 space-y-1">
                                                    <p className="font-bold text-slate-800 dark:text-slate-200">{c.contract_number}</p>
                                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${typeBadges[c.contract_type] || typeBadges.PKWT}`}>
                                                        {c.contract_type}
                                                    </span>
                                                </td>
                                                <td className="px-4.5 py-3.5 space-y-1">
                                                    <p className="font-semibold text-slate-700 dark:text-slate-300">{c.employee?.full_name}</p>
                                                    <p className="text-[10px] font-mono text-slate-400">NIK: {c.employee?.nik || '-'}</p>
                                                </td>
                                                <td className="px-4.5 py-3.5 space-y-1">
                                                    <p className="text-slate-700 dark:text-slate-300 font-medium">{c.position || c.employee?.position || '-'}</p>
                                                    <p className="text-[10px] text-slate-400">{c.department || c.employee?.department || '-'}</p>
                                                </td>
                                                <td className="px-4.5 py-3.5 space-y-1">
                                                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                                                        {new Date(c.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400">
                                                        s/d {c.end_date ? new Date(c.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Seumur Hidup (Tetap)'}
                                                    </p>
                                                </td>
                                                <td className="px-4.5 py-3.5 font-bold text-slate-700 dark:text-slate-300">
                                                    {formatRupiah(c.base_salary)}
                                                </td>
                                                <td className="px-4.5 py-3.5">
                                                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusBadges[c.status] || statusBadges.ACTIVE}`}>
                                                        {c.status}
                                                    </span>
                                                </td>
                                                <td className="px-4.5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                                                    {/* Action PDF */}
                                                    <button
                                                        onClick={() => handlePrintPdf(c.id, c.contract_number)}
                                                        title="Cetak Surat Kontrak (PDF)"
                                                        className="p-1.5 rounded bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-all border border-blue-500/20"
                                                    >
                                                        <PenTool className="w-3.5 h-3.5" />
                                                    </button>

                                                    {/* Action Upload scan */}
                                                    <button
                                                        onClick={() => handleOpenUploadModal(c)}
                                                        title={c.file_path ? "Lihat/Ganti Scan Lampiran" : "Unggah Scan Fisik"}
                                                        className={`p-1.5 rounded border transition-all ${
                                                            c.file_path
                                                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20'
                                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 border-slate-200 dark:border-slate-700'
                                                        }`}
                                                    >
                                                        {c.file_path ? <Download className="w-3.5 h-3.5" /> : <UploadCloud className="w-3.5 h-3.5" />}
                                                    </button>

                                                    {/* Action Link Scan */}
                                                    {c.file_path && (
                                                        <a
                                                            href={c.file_path}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="Buka Scan Lampiran"
                                                            className="inline-block p-1.5 rounded bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 transition-all border border-indigo-500/20"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                    )}

                                                    {/* Action Edit */}
                                                    <button
                                                        onClick={() => handleOpenEditModal(c)}
                                                        title="Ubah Kontrak"
                                                        className="p-1.5 rounded bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-all border border-amber-500/20"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>

                                                    {/* Action Delete */}
                                                    <button
                                                        onClick={() => handleDelete(c.id)}
                                                        title="Hapus Kontrak"
                                                        className="p-1.5 rounded bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-all border border-rose-500/20"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {!loading && lastPage > 1 && (
                            <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                                <span className="text-[11px] text-slate-500">
                                    Menampilkan <strong className="font-semibold text-slate-800 dark:text-slate-200">{contracts.length}</strong> dari <strong className="font-semibold text-slate-800 dark:text-slate-200">{total}</strong> data
                                </span>

                                <div className="inline-flex space-x-1.5">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => fetchContracts(currentPage - 1)}
                                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50"
                                    >
                                        Sebelumnya
                                    </button>
                                    {[...Array(lastPage).keys()].map((p) => (
                                        <button
                                            key={p + 1}
                                            onClick={() => fetchContracts(p + 1)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                                                currentPage === p + 1
                                                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                                                    : 'border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                                            }`}
                                        >
                                            {p + 1}
                                        </button>
                                    ))}
                                    <button
                                        disabled={currentPage === lastPage}
                                        onClick={() => fetchContracts(currentPage + 1)}
                                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50"
                                    >
                                        Berikutnya
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Inline Form Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setView('list')}
                                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 transition-colors"
                                title="Kembali ke Daftar Kontrak"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div>
                                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    <span>{editingItem ? 'Ubah Kontrak Kerja Karyawan' : 'Buat Dokumen Kontrak Baru'}</span>
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {editingItem ? 'Ubah detail data kontrak kerja karyawan aktif' : 'Lengkapi formulir di bawah ini untuk menerbitkan kontrak kerja baru'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Inline Form */}
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Karyawan Dropdown */}
                                <div className="space-y-1">
                                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                                        Pilih Karyawan *
                                    </label>
                                    <SearchableSelect
                                        options={employees.map((emp) => ({
                                            value: emp.id,
                                            label: `${emp.full_name} (${emp.employee_code})`
                                        }))}
                                        value={form.employee_id}
                                        onChange={(val) => handleEmployeeChange(val)}
                                        disabled={!!editingItem}
                                        placeholder="Cari & Pilih Karyawan..."
                                        required
                                    />
                                </div>

                                {/* Tipe Kontrak */}
                                <div className="space-y-1">
                                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                                        Tipe Kontrak Kerja *
                                    </label>
                                    <SearchableSelect
                                        options={[
                                            { value: 'PKWT', label: 'PKWT (Kontrak Berjangka)' },
                                            { value: 'PKWTT', label: 'PKWTT (Pegawai Tetap)' },
                                            { value: 'INTERNSHIP', label: 'INTERNSHIP (Magang)' },
                                            { value: 'PROBATION', label: 'PROBATION (Percobaan)' },
                                        ]}
                                        value={form.contract_type}
                                        onChange={(val) => setForm({ ...form, contract_type: val })}
                                        placeholder="Pilih Tipe..."
                                        required
                                    />
                                </div>
                            </div>

                            {/* Nomor Kontrak Section */}
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="font-bold text-slate-700 dark:text-slate-300">
                                        Nomor Surat Kontrak
                                    </label>
                                    {!editingItem && (
                                        <label className="flex items-center space-x-1.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.use_auto_number}
                                                onChange={(e) => setForm({ ...form, use_auto_number: e.target.checked })}
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-[10px] font-semibold text-slate-500">Nomor Otomatis (Settings)</span>
                                        </label>
                                    )}
                                </div>

                                {(!form.use_auto_number || editingItem) ? (
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: 001/SPK-MDN/VIII/2026"
                                        value={form.contract_number}
                                        onChange={(e) => setForm({ ...form, contract_number: e.target.value })}
                                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                                    />
                                ) : (
                                    <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] text-slate-500 font-mono flex items-center space-x-2">
                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                        <span>Nomor akan digenerate otomatis saat disimpan berdasarkan format pengaturan.</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Start Date */}
                                <div className="space-y-1">
                                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                                        Tanggal Mulai Kontrak *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={form.start_date}
                                        onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                                    />
                                </div>

                                {/* End Date */}
                                <div className="space-y-1">
                                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                                        Tanggal Selesai Kontrak {form.contract_type !== 'PKWTT' && '*'}
                                    </label>
                                    <input
                                        type="date"
                                        required={form.contract_type !== 'PKWTT'}
                                        disabled={form.contract_type === 'PKWTT'}
                                        value={form.end_date}
                                        onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100 disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Base Salary */}
                                <div className="space-y-1">
                                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                                        Gaji Pokok Bulanan (Rp) *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        placeholder="Contoh: 7500000"
                                        value={form.base_salary}
                                        onChange={(e) => setForm({ ...form, base_salary: e.target.value })}
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                                    />
                                </div>

                                {/* Trial period */}
                                <div className="space-y-1">
                                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                                        Masa Percobaan (Bulan)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="12"
                                        value={form.trial_period_months}
                                        onChange={(e) => setForm({ ...form, trial_period_months: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                                    />
                                </div>

                                {/* Work Location */}
                                <div className="space-y-1">
                                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                                        Lokasi Penempatan Kerja
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Kantor Pusat, Jakarta"
                                        value={form.work_location}
                                        onChange={(e) => setForm({ ...form, work_location: e.target.value })}
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Position */}
                                <div className="space-y-1">
                                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                                        Jabatan di Kontrak
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Lead Web Developer"
                                        value={form.position}
                                        onChange={(e) => setForm({ ...form, position: e.target.value })}
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                                    />
                                </div>

                                {/* Department */}
                                <div className="space-y-1">
                                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                                        Departemen di Kontrak
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: IT / R&D"
                                        value={form.department}
                                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Signer Name */}
                                <div className="space-y-1">
                                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                                        Nama Penandatangan (Pihak 1)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Nama Direktur / HR Manager"
                                        value={form.signer_name}
                                        onChange={(e) => setForm({ ...form, signer_name: e.target.value })}
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                                    />
                                </div>

                                {/* Signer Position */}
                                <div className="space-y-1">
                                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                                        Jabatan Penandatangan (Pihak 1)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: HR Director"
                                        value={form.signer_position}
                                        onChange={(e) => setForm({ ...form, signer_position: e.target.value })}
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                                    />
                                </div>

                                {/* Template & Status */}
                                <div className="space-y-1">
                                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                                        Desain Layout PDF
                                    </label>
                                    <SearchableSelect
                                        options={[
                                            { value: 'formal', label: 'Formal Corporate Layout' },
                                            { value: 'modern', label: 'Modern Minimalist Layout' },
                                        ]}
                                        value={form.template_type}
                                        onChange={(val) => setForm({ ...form, template_type: val })}
                                        placeholder="Pilih Layout..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1">
                                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                                        Status Keaktifan Dokumen *
                                    </label>
                                    <SearchableSelect
                                        options={[
                                            { value: 'DRAFT', label: 'DRAFT' },
                                            { value: 'ACTIVE', label: 'ACTIVE' },
                                            { value: 'EXPIRED', label: 'EXPIRED (Masa berlaku habis)' },
                                            { value: 'TERMINATED', label: 'TERMINATED (Dihentikan di tengah jalan)' },
                                        ]}
                                        value={form.status}
                                        onChange={(val) => setForm({ ...form, status: val })}
                                        placeholder="Pilih Status..."
                                        required
                                    />
                                </div>
                            </div>

                            {/* Additional Terms */}
                            <div className="space-y-1">
                                <label className="block font-bold text-slate-700 dark:text-slate-300">
                                    Pasal / Ketentuan Tambahan Kontrak (Opsional)
                                </label>
                                <textarea
                                    rows="4"
                                    placeholder="Tuliskan pasal-pasal atau hak/kewajiban khusus yang ingin dicantumkan di PDF..."
                                    value={form.additional_terms}
                                    onChange={(e) => setForm({ ...form, additional_terms: e.target.value })}
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100 font-sans"
                                ></textarea>
                            </div>

                            {/* Form Footer */}
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setView('list')}
                                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-md shadow-blue-500/10"
                                >
                                    {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                                    <span>{editingItem ? 'Simpan Perubahan' : 'Buat Kontrak Kerja'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Upload Scan Copy */}
            {showUploadModal && activeContractForUpload && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <UploadCloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <span>Unggah Salinan Fisik Kontrak</span>
                            </h3>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUploadScan} className="p-5 space-y-4 text-xs">
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
                                <p className="font-semibold text-slate-700 dark:text-slate-300">Nomor Kontrak:</p>
                                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{activeContractForUpload.contract_number}</p>
                                <p className="text-[10px] text-slate-500">Karyawan: {activeContractForUpload.employee?.full_name}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="block font-bold text-slate-700 dark:text-slate-300">
                                    Pilih File Scan (PDF, JPG, PNG - Maks 10MB) *
                                </label>
                                <input
                                    type="file"
                                    required
                                    accept=".pdf,image/png,image/jpeg"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300"
                                />
                            </div>

                            <div className="pt-2 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading || !selectedFile}
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-md shadow-blue-500/10 disabled:opacity-60"
                                >
                                    {uploading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                                    <span>Unggah Lampiran</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
