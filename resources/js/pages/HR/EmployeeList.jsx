import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import SearchableSelect from '../../components/SearchableSelect';
import { useConfirm } from '../../context/ConfirmContext';
import {

    Users,
    UserPlus,
    Search,
    CreditCard,
    Building2,
    Mail,
    Phone,
    MapPin,
    Calendar,
    CheckCircle2,
    XCircle,
    Edit3,
    Eye,
    Trash2,
    RefreshCw,
    X,
    Link as LinkIcon,
    Unlink,
    Key,
    ShieldCheck,
    Briefcase,
    Layers,
    Plus,
    Tag,
    List,
    LayoutGrid,
    SlidersHorizontal,
    ChevronUp,
    ChevronDown,
    FileText
} from 'lucide-react';

export default function EmployeeList() {
    const navigate = useNavigate();
    const { confirm, showAlert } = useConfirm();
    const [employees, setEmployees] = useState([]);
    const [unlinkedUsers, setUnlinkedUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [employmentStatuses, setEmploymentStatuses] = useState([]);
    const [systemRoles, setSystemRoles] = useState([]);
    const [activeDropdownId, setActiveDropdownId] = useState(null);
    const [dropUpMap, setDropUpMap] = useState({});
    
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showAdvanceFilter, setShowAdvanceFilter] = useState(false);
    const [viewMode, setViewMode] = useState('table'); // 'table' (default) | 'grid'

    const activeFilterCount = [
        deptFilter,
        statusFilter,
    ].filter(Boolean).length;

    const handleResetFilters = () => {
        setDeptFilter('');
        setStatusFilter('');
    };
    
    // Modals
    const [showFormModal, setShowFormModal] = useState(false);
    const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
    const [showLinkAccountModal, setShowLinkAccountModal] = useState(false);
    const [showMasterModal, setShowMasterModal] = useState(false);
    const [showContractModal, setShowContractModal] = useState(false);

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [contractTemplates, setContractTemplates] = useState([]);
    const [contractForm, setContractForm] = useState({
        template: 'formal',
        contract_number: '',
        contract_date: new Date().toISOString().split('T')[0],
        start_date: '',
        end_date: '',
        basic_salary: '',
        signer_name: '',
        signer_title: '',
        probation_period: '',
        work_location: '',
        additional_terms: '',
    });

    const [formTab, setFormTab] = useState('personal'); // 'personal' | 'bank'
    const [submitting, setSubmitting] = useState(false);

    // Master Data HR Modal State
    const [masterTab, setMasterTab] = useState('dep'); // 'dep' | 'pos' | 'status'
    const [masterDepForm, setMasterDepForm] = useState({ name: '', description: '' });
    const [masterPosForm, setMasterPosForm] = useState({ name: '', department_id: '', description: '' });
    const [masterStatusForm, setMasterStatusForm] = useState({ code: '', name: '', description: '' });

    // Form Employee
    const [form, setForm] = useState({
        full_name: '',
        nik: '',
        gender: 'MALE',
        birth_date: '',
        email: '',
        phone: '',
        address: '',
        position: 'Software Engineer',
        department: 'Teknologi Informasi',
        employment_status: 'PERMANENT',
        join_date: new Date().toISOString().split('T')[0],
        leave_balance: 12,
        bank_name: 'Bank BCA',
        bank_account_number: '',
        bank_account_holder: '',
    });

    // Form Create Account
    const [accountForm, setAccountForm] = useState({
        email: '',
        password: '',
        role: 'staff',
    });

    // Form Link Account
    const [linkUserId, setLinkUserId] = useState('');

    const fetchMasterData = async () => {
        try {
            const [depRes, posRes, statusRes, rolesRes] = await Promise.all([
                api.get('/hr/departments'),
                api.get('/hr/positions'),
                api.get('/hr/employment-statuses'),
                api.get('/roles'),
            ]);
            setDepartments(depRes.data.data || []);
            setPositions(posRes.data.data || []);
            setEmploymentStatuses(statusRes.data.data || []);
            setSystemRoles(rolesRes.data.data || []);
        } catch (err) {
            console.error('Error fetching HR master data & roles:', err);
        }
    };

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await api.get('/hr/employees', {
                params: { search: searchTerm, department: deptFilter }
            });
            setEmployees(res.data.data || []);
        } catch (err) {
            console.error('Error fetching employees:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnlinkedUsers = async () => {
        try {
            const res = await api.get('/hr/unlinked-users');
            setUnlinkedUsers(res.data.data || []);
        } catch (err) {
            console.error('Error fetching unlinked users:', err);
        }
    };

    useEffect(() => {
        fetchMasterData();
    }, []);

    useEffect(() => {
        const handleOutsideClick = () => setActiveDropdownId(null);
        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, []);

    const toggleDropdown = (e, empId) => {
        e.stopPropagation();
        if (activeDropdownId === empId) {
            setActiveDropdownId(null);
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const shouldDropUp = rect.top > windowHeight / 2;
            setDropUpMap(prev => ({ ...prev, [empId]: shouldDropUp }));
            setActiveDropdownId(empId);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchEmployees();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm, deptFilter]);

    const handleOpenFormModal = (emp = null) => {
        if (emp) {
            navigate(`/employees/${emp.id}/edit`);
        } else {
            navigate('/employees/create');
        }
    };

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingEmployee) {
                await api.put(`/hr/employees/${editingEmployee.id}`, form);
                alert('Data karyawan berhasil diperbarui!');
            } else {
                await api.post('/hr/employees', form);
                alert('Karyawan baru berhasil ditambahkan!');
            }
            setShowFormModal(false);
            fetchEmployees();
        } catch (err) {
            alert('Gagal menyimpan data karyawan: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteEmployee = async (emp) => {
        const confirmed = await confirm({
            title: 'Hapus Data Karyawan?',
            message: `Apakah Anda yakin ingin menghapus data karyawan ${emp.full_name}? Action ini tidak dapat dibatalkan.`,
            confirmText: 'Ya, Hapus Karyawan',
            cancelText: 'Batal',
            variant: 'danger',
        });
        if (!confirmed) return;

        try {
            await api.delete(`/hr/employees/${emp.id}`);
            showAlert({ title: 'Berhasil', message: 'Data karyawan berhasil dihapus.', variant: 'success' });
            fetchEmployees();
        } catch (err) {
            showAlert({ title: 'Gagal', message: 'Gagal menghapus data karyawan: ' + (err.response?.data?.message || err.message), variant: 'danger' });
        }
    };

    const handleOpenContractModal = async (emp) => {
        setSelectedEmployee(emp);
        setContractForm({
            template: 'formal',
            contract_number: '',
            contract_date: new Date().toISOString().split('T')[0],
            start_date: emp.join_date || new Date().toISOString().split('T')[0],
            end_date: '',
            basic_salary: '',
            signer_name: '',
            signer_title: '',
            probation_period: '',
            work_location: '',
            additional_terms: '',
        });
        setShowContractModal(true);

        try {
            const response = await api.get('/contract-templates');
            const templates = response.data.data || [];
            setContractTemplates(templates);
            if (templates.length && !templates.some((template) => template.key === 'formal')) {
                setContractForm((current) => ({ ...current, template: templates[0].key }));
            }
        } catch (err) {
            console.error('Error fetching contract templates:', err);
        }
    };

    const handleGenerateContract = async (e) => {
        e.preventDefault();
        if (!selectedEmployee) return;

        setSubmitting(true);
        const contractWindow = window.open('', '_blank');

        try {
            const params = Object.fromEntries(
                Object.entries(contractForm).filter(([, value]) => value !== '' && value !== null)
            );
            const response = await api.get(`/hr/employees/${selectedEmployee.id}/contract`, {
                params,
                responseType: 'blob',
            });
            const pdfUrl = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));

            if (contractWindow) {
                contractWindow.location.href = pdfUrl;
            } else {
                window.open(pdfUrl, '_blank', 'noopener,noreferrer');
            }

            setShowContractModal(false);
            window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60_000);
        } catch (err) {
            contractWindow?.close();
            showAlert({
                title: 'Gagal Membuat Surat Kontrak',
                message: err.response?.data?.message || 'PDF surat kontrak tidak dapat dibuat. Periksa isian dan coba lagi.',
                variant: 'danger',
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Account Creation & Linking Handlers
    const handleOpenCreateAccountModal = (emp) => {
        setSelectedEmployee(emp);
        setAccountForm({
            email: emp.email || '',
            password: 'password123',
            role: systemRoles[0]?.name || 'staff',
        });
        setShowCreateAccountModal(true);
    };

    const handleCreateAccountSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post(`/hr/employees/${selectedEmployee.id}/create-account`, accountForm);
            alert('Akun login user berhasil dibuat dan ditautkan!');
            setShowCreateAccountModal(false);
            fetchEmployees();
        } catch (err) {
            alert('Gagal membuat akun login: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenLinkAccountModal = (emp) => {
        setSelectedEmployee(emp);
        setLinkUserId('');
        fetchUnlinkedUsers();
        setShowLinkAccountModal(true);
    };

    const handleLinkAccountSubmit = async (e) => {
        e.preventDefault();
        if (!linkUserId) {
            alert('Pilih akun user terdaftar terlebih dahulu!');
            return;
        }
        setSubmitting(true);
        try {
            await api.post(`/hr/employees/${selectedEmployee.id}/link-account`, { user_id: linkUserId });
            alert('Akun user berhasil ditautkan!');
            setShowLinkAccountModal(false);
            fetchEmployees();
        } catch (err) {
            alert('Gagal menautkan akun: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleUnlinkAccount = async (emp) => {
        const ok = await confirm({
            title: 'Lepas Tautan Akun',
            message: `Apakah Anda yakin ingin melepas tautan akun login dari ${emp.full_name}? Karyawan tidak akan bisa login hingga ditautkan kembali.`,
            confirmText: 'Ya, Lepas Tautan',
            variant: 'warning',
        });
        if (!ok) return;
        try {
            await api.post(`/hr/employees/${emp.id}/unlink-account`);
            alert('Tautan akun user berhasil dilepas.');
            fetchEmployees();
        } catch (err) {
            alert('Gagal melepas tautan akun.');
        }
    };

    // Master Data HR Submit Handlers
    const handleAddDepartment = async (e) => {
        e.preventDefault();
        try {
            await api.post('/hr/departments', masterDepForm);
            setMasterDepForm({ name: '', description: '' });
            fetchMasterData();
        } catch (err) {
            alert('Gagal menambah departemen.');
        }
    };

    const handleDeleteDepartment = async (id) => {
        const ok = await confirm({
            title: 'Hapus Departemen',
            message: 'Hapus departemen ini? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/hr/departments/${id}`);
            fetchMasterData();
        } catch (err) {
            alert('Gagal menghapus departemen.');
        }
    };

    const handleAddPosition = async (e) => {
        e.preventDefault();
        try {
            await api.post('/hr/positions', masterPosForm);
            setMasterPosForm({ name: '', department_id: '', description: '' });
            fetchMasterData();
        } catch (err) {
            alert('Gagal menambah jabatan.');
        }
    };

    const handleDeletePosition = async (id) => {
        const ok = await confirm({
            title: 'Hapus Jabatan',
            message: 'Hapus jabatan ini? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/hr/positions/${id}`);
            fetchMasterData();
        } catch (err) {
            alert('Gagal menghapus jabatan.');
        }
    };

    const handleAddEmploymentStatus = async (e) => {
        e.preventDefault();
        try {
            await api.post('/hr/employment-statuses', masterStatusForm);
            setMasterStatusForm({ code: '', name: '', description: '' });
            fetchMasterData();
        } catch (err) {
            alert('Gagal menambah status kerja.');
        }
    };

    const handleDeleteEmploymentStatus = async (id) => {
        const ok = await confirm({
            title: 'Hapus Status Kerja',
            message: 'Hapus status kerja ini? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/hr/employment-statuses/${id}`);
            fetchMasterData();
        } catch (err) {
            alert('Gagal menghapus status kerja.');
        }
    };

    const statusBadges = {
        PERMANENT: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        CONTRACT: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        PROBATION: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        INTERN: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span>Direktori Karyawan & Master HR</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Kelola data pribadi karyawan, rekening bank, tautan akun user, serta master departemen & jabatan.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setShowMasterModal(true)}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center space-x-1.5 transition-all"
                    >
                        <Layers className="w-4 h-4 text-purple-500" />
                        <span>Master Data HR</span>
                    </button>
                    <button
                        onClick={() => handleOpenFormModal()}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Tambah Data Karyawan</span>
                    </button>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari NIK, nama, email, jabatan, atau departemen..."
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
                            onClick={fetchEmployees}
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
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-200">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Departemen Karyawan</label>
                            <SearchableSelect
                                options={[
                                    { value: '', label: 'Semua Departemen' },
                                    ...departments.map((d) => ({ value: d.name, label: d.name }))
                                ]}
                                value={deptFilter}
                                onChange={(val) => setDeptFilter(val)}
                                placeholder="Semua Departemen..."
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Status Kepegawaian</label>
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
                            <SearchableSelect
                                options={[
                                    { value: '', label: 'Semua Status Kerja' },
                                    ...employmentStatuses.map((s) => ({ value: s.code, label: s.name }))
                                ]}
                                value={statusFilter}
                                onChange={(val) => setStatusFilter(val)}
                                placeholder="Semua Status Kerja..."
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Employee List View */}
            {loading ? (
                <div className="flex justify-center p-12 text-xs text-slate-500 dark:text-slate-400">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2 text-blue-600 dark:text-blue-400" />
                    <span>Memuat direktori karyawan...</span>
                </div>
            ) : employees.length === 0 ? (
                <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 bg-white dark:bg-[#0f172a]">
                    Belum ada data karyawan terdaftar.
                </div>
            ) : viewMode === 'table' ? (
                /* TABLE VIEW (DEFAULT) */
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                    <th className="py-3 px-4">Kode &amp; NIK</th>
                                    <th className="py-3 px-4">Nama Karyawan</th>
                                    <th className="py-3 px-4">Jabatan &amp; Departemen</th>
                                    <th className="py-3 px-4">Status Kerja</th>
                                    <th className="py-3 px-4">Gaji Pokok</th>
                                    <th className="py-3 px-4">Kontak (Email / Telp)</th>
                                    <th className="py-3 px-4">Akun Sistem</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                {employees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3.5 px-4 font-mono">
                                            <Link
                                                to={`/employees/${emp.id}`}
                                                className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline block"
                                                title="Klik untuk lihat profil lengkap karyawan"
                                            >
                                                {emp.employee_code}
                                            </Link>
                                            {emp.nik && <span className="text-[10px] text-slate-400">NIK: {emp.nik}</span>}
                                        </td>
                                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                                            <Link
                                                to={`/employees/${emp.id}`}
                                                className="flex items-center space-x-2.5 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                                                title="Klik untuk lihat profil lengkap karyawan"
                                            >
                                                <div className="w-7 h-7 rounded-lg bg-blue-600/10 border border-blue-500/30 flex items-center justify-center font-bold text-blue-600 dark:text-blue-300 text-xs shrink-0 font-mono">
                                                    {emp.full_name.charAt(0).toUpperCase()}
                                                </div>
                                                <span>{emp.full_name}</span>
                                            </Link>
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                                            <div className="font-semibold">{emp.position}</div>
                                            <div className="text-[10px] text-slate-400">{emp.department}</div>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statusBadges[emp.employment_status] || statusBadges.PERMANENT}`}>
                                                {emp.employment_status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                                            {emp.salary ? 'Rp ' + parseFloat(emp.salary).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : 'Rp 0'}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-[11px]">
                                            {emp.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" />{emp.email}</div>}
                                            {emp.phone && <div className="flex items-center gap-1 text-slate-400"><Phone className="w-3 h-3 text-slate-400" />{emp.phone}</div>}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            {emp.user ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                                                    <ShieldCheck className="w-3 h-3" />
                                                    <span>{emp.user.name} ({emp.user.role})</span>
                                                </span>
                                            ) : (
                                                <div className="flex items-center space-x-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenCreateAccountModal(emp)}
                                                        className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-semibold text-[10px] flex items-center gap-1"
                                                        title="Buat Akun User Baru"
                                                    >
                                                        <Key className="w-3 h-3" />
                                                        <span>Buat Akun</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenLinkAccountModal(emp)}
                                                        className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                                                        title="Tautkan User Terdaftar"
                                                    >
                                                        <LinkIcon className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 text-right relative">
                                            {/* Opsi Aksi Dropdown Trigger Button */}
                                            <button
                                                type="button"
                                                onClick={(e) => toggleDropdown(e, emp.id)}
                                                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs inline-flex items-center space-x-1.5 shadow-sm transition-all"
                                            >
                                                <span>Opsi Aksi</span>
                                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${activeDropdownId === emp.id ? 'rotate-180' : ''}`} />
                                            </button>

                                            {/* Opsi Aksi Dropdown Popover Menu */}
                                            {activeDropdownId === emp.id && (
                                                <div
                                                    className={`absolute right-4 ${
                                                        dropUpMap[emp.id] ? 'bottom-full mb-1' : 'top-full mt-1'
                                                    } z-[999] w-52 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden py-1 text-left space-y-0.5`}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {/* 1. Lihat Profil */}
                                                    <Link
                                                        to={`/employees/${emp.id}`}
                                                        onClick={() => setActiveDropdownId(null)}
                                                        className="px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-2 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                                        <span>Lihat Profil Lengkap</span>
                                                    </Link>

                                                    {/* 2. Edit Data */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActiveDropdownId(null);
                                                            handleOpenFormModal(emp);
                                                        }}
                                                        className="w-full px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-2 transition-colors text-left"
                                                    >
                                                        <Edit3 className="w-4 h-4 text-amber-500 shrink-0" />
                                                        <span>Edit Karyawan</span>
                                                    </button>

                                                    {/* 3. Kelola Kontrak Kerja */}
                                                    <Link
                                                        to={`/hr/contracts?employee_id=${emp.id}`}
                                                        onClick={() => setActiveDropdownId(null)}
                                                        className="px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-2 transition-colors text-left"
                                                    >
                                                        <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                        <span>Kelola Kontrak Kerja</span>
                                                    </Link>

                                                    <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                                                    {/* 4. Hapus Karyawan */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActiveDropdownId(null);
                                                            handleDeleteEmployee(emp);
                                                        }}
                                                        className="w-full px-3.5 py-2 hover:bg-rose-500/10 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center space-x-2 transition-colors text-left"
                                                    >
                                                        <Trash2 className="w-4 h-4 shrink-0" />
                                                        <span>Hapus Karyawan</span>
                                                    </button>
                                                </div>
                                            )}
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
                    {employees.map((emp) => (
                        <div
                            key={emp.id}
                            className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4 shadow-sm flex flex-col justify-between"
                        >
                            <div className="space-y-3">
                                {/* Header Badge & Code */}
                                <div className="flex items-start justify-between">
                                    <div>
                                        <Link
                                            to={`/employees/${emp.id}`}
                                            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 hover:underline"
                                            title="Klik untuk lihat profil lengkap karyawan"
                                        >
                                            {emp.employee_code}
                                        </Link>
                                        {emp.nik && (
                                            <span className="text-[10px] font-mono text-slate-400 ml-1.5">
                                                NIK: {emp.nik}
                                            </span>
                                        )}
                                    </div>
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statusBadges[emp.employment_status] || statusBadges.PERMANENT}`}>
                                        {emp.employment_status}
                                    </span>
                                </div>

                                {/* Employee Profile */}
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center font-bold text-blue-600 dark:text-blue-300 text-sm shrink-0">
                                        {emp.full_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{emp.full_name}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{emp.position} &bull; {emp.department}</p>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                                    {emp.email && (
                                        <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span className="truncate">{emp.email}</span>
                                        </div>
                                    )}
                                    {emp.phone && (
                                        <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span>{emp.phone}</span>
                                        </div>
                                    )}
                                    {emp.join_date && (
                                        <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-[11px]">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span>Masuk: {emp.join_date} &bull; Cuti: {emp.leave_balance} hari</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Account Status / Actions */}
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[11px] font-semibold text-slate-500">Akun Login:</span>
                                    {emp.user ? (
                                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3" />
                                            {emp.user.name} ({emp.user.role})
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                            Belum Taut Akun
                                        </span>
                                    )}
                                </div>

                                {!emp.user && (
                                    <div className="flex space-x-2 pt-1">
                                        <button
                                            onClick={() => handleOpenCreateAccountModal(emp)}
                                            className="flex-1 py-1 px-2 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[11px] font-semibold flex items-center justify-center space-x-1 transition-all"
                                        >
                                            <Key className="w-3 h-3" />
                                            <span>Buat Akun Login</span>
                                        </button>
                                        <button
                                            onClick={() => handleOpenLinkAccountModal(emp)}
                                            className="py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold flex items-center space-x-1 transition-all"
                                            title="Tautkan User Terdaftar"
                                        >
                                            <LinkIcon className="w-3 h-3" />
                                            <span>Tautkan Akun</span>
                                        </button>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-2 pt-1">
                                    <Link
                                        to={`/employees/${emp.id}`}
                                        className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                                        title="Lihat Profil Lengkap, Presensi, & Cuti"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                    </Link>
                                    <button
                                        onClick={() => handleOpenFormModal(emp)}
                                        className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                                        title="Edit Data Karyawan"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleOpenContractModal(emp)}
                                        className="p-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-colors"
                                        title="Cetak Surat Kontrak"
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteEmployee(emp)}
                                        className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                        title="Hapus Karyawan"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Add/Edit Employee */}
            {showFormModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="w-full max-w-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-2xl space-y-4 my-8">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                {editingEmployee ? 'Edit Data Karyawan' : 'Tambah Data Karyawan Baru'}
                            </h3>
                            <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Tabs */}
                        <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-px text-xs font-semibold">
                            <button
                                type="button"
                                onClick={() => setFormTab('personal')}
                                className={`px-3 py-1.5 rounded-t-lg transition-all ${
                                    formTab === 'personal'
                                        ? 'bg-blue-600 text-white font-bold'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                1. Informasi Pribadi & Pekerjaan
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormTab('bank')}
                                className={`px-3 py-1.5 rounded-t-lg transition-all ${
                                    formTab === 'bank'
                                        ? 'bg-blue-600 text-white font-bold'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                2. Rekening Bank & Payroll
                            </button>
                        </div>

                        <form onSubmit={handleSubmitForm} className="space-y-3.5 text-xs">
                            {formTab === 'personal' ? (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nama Lengkap *</label>
                                            <input
                                                type="text"
                                                required
                                                value={form.full_name}
                                                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                                placeholder="ex: Rizky Pratama"
                                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">NIK / No. KTP</label>
                                            <input
                                                type="text"
                                                value={form.nik}
                                                onChange={(e) => setForm({ ...form, nik: e.target.value })}
                                                placeholder="3171234567890001"
                                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Jenis Kelamin</label>
                                            <SearchableSelect
                                                options={[
                                                    { value: 'MALE', label: 'Laki-Laki' },
                                                    { value: 'FEMALE', label: 'Perempuan' },
                                                ]}
                                                value={form.gender}
                                                onChange={(val) => setForm({ ...form, gender: val })}
                                                placeholder="Pilih Gender..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Email Karyawan</label>
                                            <input
                                                type="email"
                                                value={form.email}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                placeholder="rizky@mikrotek.id"
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">No. Telepon / WA</label>
                                            <input
                                                type="text"
                                                value={form.phone}
                                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                                placeholder="08123456789"
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Departemen *</label>
                                            <SearchableSelect
                                                required
                                                value={form.department}
                                                onChange={(val) => setForm({ ...form, department: val })}
                                                placeholder="-- Pilih Departemen --"
                                                options={departments.map(d => ({ value: d.name, label: d.name, code: d.code }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Jabatan *</label>
                                            <SearchableSelect
                                                required
                                                value={form.position}
                                                onChange={(val) => setForm({ ...form, position: val })}
                                                placeholder="-- Pilih Jabatan --"
                                                options={positions.map(p => ({ value: p.name, label: p.name, code: p.code }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Status Kerja *</label>
                                            <SearchableSelect
                                                required
                                                value={form.employment_status}
                                                onChange={(val) => setForm({ ...form, employment_status: val })}
                                                placeholder="-- Pilih Status --"
                                                options={employmentStatuses.map(s => ({ value: s.code, label: s.name, code: s.code }))}
                                            />
                                        </div>
                                    </div>


                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Tgl Bergabung</label>
                                            <input
                                                type="date"
                                                value={form.join_date}
                                                onChange={(e) => setForm({ ...form, join_date: e.target.value })}
                                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Tgl Lahir</label>
                                            <input
                                                type="date"
                                                value={form.birth_date}
                                                onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Alamat Tempat Tinggal</label>
                                        <textarea
                                            rows={2}
                                            value={form.address}
                                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                                            placeholder="Alamat domisili..."
                                            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nama Bank</label>
                                        <SearchableSelect
                                            options={[
                                                { value: 'Bank BCA', label: 'Bank BCA' },
                                                { value: 'Bank Mandiri', label: 'Bank Mandiri' },
                                                { value: 'Bank BNI', label: 'Bank BNI' },
                                                { value: 'Bank BRI', label: 'Bank BRI' },
                                                { value: 'Bank CIMB Niaga', label: 'Bank CIMB Niaga' },
                                                { value: 'Bank Permata', label: 'Bank Permata' },
                                                { value: 'Bank Syariah Indonesia (BSI)', label: 'Bank Syariah Indonesia (BSI)' },
                                                { value: 'Lainnya', label: 'Lainnya' },
                                            ]}
                                            value={form.bank_name}
                                            onChange={(val) => setForm({ ...form, bank_name: val })}
                                            placeholder="Pilih / Cari Bank..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nomor Rekening Bank</label>
                                            <input
                                                type="text"
                                                value={form.bank_account_number}
                                                onChange={(e) => setForm({ ...form, bank_account_number: e.target.value })}
                                                placeholder="ex: 8830192801"
                                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nama Pemilik Rekening</label>
                                            <input
                                                type="text"
                                                value={form.bank_account_holder}
                                                onChange={(e) => setForm({ ...form, bank_account_holder: e.target.value })}
                                                placeholder="ex: Rizky Pratama"
                                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                {formTab === 'personal' ? (
                                    <button
                                        type="button"
                                        onClick={() => setFormTab('bank')}
                                        className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                                    >
                                        Lanjut ke Rekening Bank &rarr;
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setFormTab('personal')}
                                        className="text-slate-500 hover:underline font-semibold"
                                    >
                                        &larr; Kembali ke Info Pribadi
                                    </button>
                                )}

                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowFormModal(false)}
                                        className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold flex items-center space-x-1"
                                    >
                                        {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Simpan Data</span>}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Create Account */}
            {showCreateAccountModal && selectedEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                Buat Akun Login untuk {selectedEmployee.full_name}
                            </h3>
                            <button onClick={() => setShowCreateAccountModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAccountSubmit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Email Akun Login *</label>
                                <input
                                    type="email"
                                    required
                                    value={accountForm.email}
                                    onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                                    placeholder="user@mikrotek.id"
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Kata Sandi Initial *</label>
                                <input
                                    type="password"
                                    required
                                    value={accountForm.password}
                                    onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Peranan Sistem (Role) *</label>
                                <SearchableSelect
                                    options={systemRoles.length === 0 ? [
                                        { value: 'staff', label: 'Staff Operasional (staff)' },
                                        { value: 'finance', label: 'Finance (finance)' },
                                        { value: 'hr', label: 'Human Resources (hr)' },
                                        { value: 'project_manager', label: 'Project Manager (project_manager)' },
                                        { value: 'admin', label: 'Administrator (admin)' },
                                    ] : systemRoles.map((r) => ({
                                        value: r.name,
                                        label: `${r.label || r.name} (${r.name})`
                                    }))}
                                    value={accountForm.role}
                                    onChange={(val) => setAccountForm({ ...accountForm, role: val })}
                                    placeholder="Pilih Role..."
                                    required
                                />
                            </div>

                            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateAccountModal(false)}
                                    className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold flex items-center space-x-1"
                                >
                                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Buat & Tautkan Akun</span>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Link Existing Account */}
            {showLinkAccountModal && selectedEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                Tautkan Akun User Terdaftar ke {selectedEmployee.full_name}
                            </h3>
                            <button onClick={() => setShowLinkAccountModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleLinkAccountSubmit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Pilih User Belum Terhubung *</label>
                                {unlinkedUsers.length === 0 ? (
                                    <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500">
                                        Tidak ada akun user bebas yang belum ditautkan.
                                    </div>
                                ) : (
                                    <SearchableSelect
                                        options={unlinkedUsers.map((u) => ({
                                            value: u.id,
                                            label: `${u.name} (${u.email})`,
                                            sublabel: `Role: ${u.role}`
                                        }))}
                                        value={linkUserId}
                                        onChange={(val) => setLinkUserId(val)}
                                        placeholder="-- Cari & Pilih Akun User --"
                                        required
                                    />
                                )}
                            </div>

                            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowLinkAccountModal(false)}
                                    className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || unlinkedUsers.length === 0}
                                    className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold flex items-center space-x-1 disabled:opacity-50"
                                >
                                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Tautkan Akun</span>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Contract Print Configuration */}
            {showContractModal && selectedEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="w-full max-w-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-2xl space-y-5 my-8">
                        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                            <div>
                                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-emerald-500" /> Cetak Surat Kontrak Kerja
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{selectedEmployee.full_name} · {selectedEmployee.position} · {selectedEmployee.department}</p>
                            </div>
                            <button type="button" onClick={() => setShowContractModal(false)} disabled={submitting} className="text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-50">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleGenerateContract} className="space-y-5 text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5"><span className="font-semibold text-slate-700 dark:text-slate-300">Template PDF</span>
                                    <SearchableSelect
                                        options={contractTemplates.length ? contractTemplates.map((template) => ({ value: template.key, label: template.name })) : [{ value: 'formal', label: 'Formal Resmi' }]}
                                        value={contractForm.template}
                                        onChange={(val) => setContractForm({ ...contractForm, template: val })}
                                        placeholder="Pilih Template..."
                                    />
                                </div>
                                <label className="space-y-1.5"><span className="font-semibold text-slate-700 dark:text-slate-300">Nomor Kontrak *</span>
                                    <input id="contract-number" required value={contractForm.contract_number} onChange={(e) => setContractForm({ ...contractForm, contract_number: e.target.value })} placeholder="Contoh: SPK/HR/001/VIII/2026" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg" />
                                </label>
                                <label className="space-y-1.5"><span className="font-semibold text-slate-700 dark:text-slate-300">Tanggal Kontrak</span>
                                    <input id="contract-date" type="date" value={contractForm.contract_date} onChange={(e) => setContractForm({ ...contractForm, contract_date: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg" />
                                </label>
                                <label className="space-y-1.5"><span className="font-semibold text-slate-700 dark:text-slate-300">Tanggal Mulai *</span>
                                    <input id="contract-start-date" required type="date" value={contractForm.start_date} onChange={(e) => setContractForm({ ...contractForm, start_date: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg" />
                                </label>
                                <label className="space-y-1.5"><span className="font-semibold text-slate-700 dark:text-slate-300">Tanggal Selesai</span>
                                    <input id="contract-end-date" type="date" min={contractForm.start_date} value={contractForm.end_date} onChange={(e) => setContractForm({ ...contractForm, end_date: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg" />
                                </label>
                                <label className="space-y-1.5"><span className="font-semibold text-slate-700 dark:text-slate-300">Gaji Pokok / Bulan</span>
                                    <input id="contract-basic-salary" type="number" min="0" value={contractForm.basic_salary} onChange={(e) => setContractForm({ ...contractForm, basic_salary: e.target.value })} placeholder="Contoh: 5000000" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg" />
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                <label className="space-y-1.5"><span className="font-semibold text-slate-700 dark:text-slate-300">Nama Penandatangan</span>
                                    <input id="contract-signer-name" value={contractForm.signer_name} onChange={(e) => setContractForm({ ...contractForm, signer_name: e.target.value })} placeholder="Gunakan pengaturan perusahaan bila kosong" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg" />
                                </label>
                                <label className="space-y-1.5"><span className="font-semibold text-slate-700 dark:text-slate-300">Jabatan Penandatangan</span>
                                    <input id="contract-signer-title" value={contractForm.signer_title} onChange={(e) => setContractForm({ ...contractForm, signer_title: e.target.value })} placeholder="Gunakan pengaturan perusahaan bila kosong" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg" />
                                </label>
                                <label className="space-y-1.5"><span className="font-semibold text-slate-700 dark:text-slate-300">Masa Percobaan</span>
                                    <input id="contract-probation" value={contractForm.probation_period} onChange={(e) => setContractForm({ ...contractForm, probation_period: e.target.value })} placeholder="Contoh: 3 (tiga) bulan" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg" />
                                </label>
                                <label className="space-y-1.5"><span className="font-semibold text-slate-700 dark:text-slate-300">Tempat Kerja</span>
                                    <input id="contract-work-location" value={contractForm.work_location} onChange={(e) => setContractForm({ ...contractForm, work_location: e.target.value })} placeholder="Contoh: Kantor Pusat Jakarta" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg" />
                                </label>
                            </div>

                            <label className="block space-y-1.5"><span className="font-semibold text-slate-700 dark:text-slate-300">Catatan / Ketentuan Tambahan</span>
                                <textarea id="contract-additional-terms" rows="3" value={contractForm.additional_terms} onChange={(e) => setContractForm({ ...contractForm, additional_terms: e.target.value })} placeholder="Opsional. Akan ditampilkan sebagai pasal tambahan di PDF." className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg resize-y" />
                            </label>

                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                                <button type="button" onClick={() => setShowContractModal(false)} disabled={submitting} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-50">Batal</button>
                                <button id="generate-contract-pdf" type="submit" disabled={submitting} className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 disabled:opacity-50">
                                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} {submitting ? 'Membuat PDF...' : 'Buat Surat Kontrak'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Master Data HR Manager */}
            {showMasterModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="w-full max-w-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-2xl space-y-4 my-8">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-purple-500" />
                                <span>Master Data HR (Departemen, Jabatan, & Status Kerja)</span>
                            </h3>
                            <button onClick={() => setShowMasterModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Master Tabs */}
                        <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-px text-xs font-semibold">
                            <button
                                onClick={() => setMasterTab('dep')}
                                className={`px-3.5 py-1.5 rounded-t-lg transition-all ${
                                    masterTab === 'dep'
                                        ? 'bg-purple-600 text-white font-bold'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                Departemen ({departments.length})
                            </button>
                            <button
                                onClick={() => setMasterTab('pos')}
                                className={`px-3.5 py-1.5 rounded-t-lg transition-all ${
                                    masterTab === 'pos'
                                        ? 'bg-purple-600 text-white font-bold'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                Jabatan ({positions.length})
                            </button>
                            <button
                                onClick={() => setMasterTab('status')}
                                className={`px-3.5 py-1.5 rounded-t-lg transition-all ${
                                    masterTab === 'status'
                                        ? 'bg-purple-600 text-white font-bold'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                Status Kerja ({employmentStatuses.length})
                            </button>
                        </div>

                        {/* Master Content */}
                        {masterTab === 'dep' && (
                            <div className="space-y-4 text-xs">
                                <form onSubmit={handleAddDepartment} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex gap-2">
                                    <input
                                        type="text"
                                        required
                                        value={masterDepForm.name}
                                        onChange={(e) => setMasterDepForm({ ...masterDepForm, name: e.target.value })}
                                        placeholder="Nama Departemen Baru..."
                                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-slate-200"
                                    />
                                    <input
                                        type="text"
                                        value={masterDepForm.description}
                                        onChange={(e) => setMasterDepForm({ ...masterDepForm, description: e.target.value })}
                                        placeholder="Deskripsi Singkat..."
                                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-slate-200"
                                    />
                                    <button type="submit" className="px-4 py-1.5 rounded bg-purple-600 text-white font-bold flex items-center space-x-1 shrink-0">
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Tambah</span>
                                    </button>
                                </form>

                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {departments.map((d) => (
                                        <div key={d.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-mono text-[10px] font-bold text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">{d.code}</span>
                                                    <span className="font-bold text-slate-900 dark:text-slate-100">{d.name}</span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{d.description || 'Tidak ada deskripsi'}</p>
                                            </div>
                                            <button onClick={() => handleDeleteDepartment(d.id)} className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {masterTab === 'pos' && (
                            <div className="space-y-4 text-xs">
                                <form onSubmit={handleAddPosition} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg grid grid-cols-3 gap-2">
                                    <input
                                        type="text"
                                        required
                                        value={masterPosForm.name}
                                        onChange={(e) => setMasterPosForm({ ...masterPosForm, name: e.target.value })}
                                        placeholder="Nama Jabatan Baru..."
                                        className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-slate-200"
                                    />
                                    <SearchableSelect
                                        options={[
                                            { value: '', label: '-- Pilih Departemen --' },
                                            ...departments.map((d) => ({ value: d.id, label: d.name }))
                                        ]}
                                        value={masterPosForm.department_id}
                                        onChange={(val) => setMasterPosForm({ ...masterPosForm, department_id: val })}
                                        placeholder="Pilih Departemen..."
                                    />
                                    <button type="submit" className="px-4 py-1.5 rounded bg-purple-600 text-white font-bold flex items-center justify-center space-x-1 shrink-0">
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Tambah Jabatan</span>
                                    </button>
                                </form>

                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {positions.map((p) => (
                                        <div key={p.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">{p.code}</span>
                                                    <span className="font-bold text-slate-900 dark:text-slate-100">{p.name}</span>
                                                    <span className="text-[10px] text-slate-500 dark:text-slate-400">({p.department?.name || 'Tanpa Departemen'})</span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{p.description || 'Tidak ada deskripsi'}</p>
                                            </div>
                                            <button onClick={() => handleDeletePosition(p.id)} className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {masterTab === 'status' && (
                            <div className="space-y-4 text-xs">
                                <form onSubmit={handleAddEmploymentStatus} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex gap-2">
                                    <input
                                        type="text"
                                        required
                                        value={masterStatusForm.code}
                                        onChange={(e) => setMasterStatusForm({ ...masterStatusForm, code: e.target.value.toUpperCase() })}
                                        placeholder="Kode Status (ex: PKWT)..."
                                        className="w-32 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-slate-200 font-mono"
                                    />
                                    <input
                                        type="text"
                                        required
                                        value={masterStatusForm.name}
                                        onChange={(e) => setMasterStatusForm({ ...masterStatusForm, name: e.target.value })}
                                        placeholder="Nama Status Kerja..."
                                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-slate-200"
                                    />
                                    <button type="submit" className="px-4 py-1.5 rounded bg-purple-600 text-white font-bold flex items-center space-x-1 shrink-0">
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Tambah Status</span>
                                    </button>
                                </form>

                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {employmentStatuses.map((s) => (
                                        <div key={s.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">{s.code}</span>
                                                    <span className="font-bold text-slate-900 dark:text-slate-100">{s.name}</span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{s.description || 'Status kerja aktif'}</p>
                                            </div>
                                            <button onClick={() => handleDeleteEmploymentStatus(s.id)} className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
