import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useConfirm } from '../../context/ConfirmContext';
import {
    Shield,
    ShieldCheck,
    Plus,
    Edit3,
    Trash2,
    RefreshCw,
    X,
    Save,
    Lock,
    Users,
    CheckSquare,
    Square,
    Info,
    CheckCircle2,
    Layers,
    Eye,
    PlusCircle,
    FileEdit,
    Trash,
    Check,
    MinusSquare,
    List,
    LayoutGrid,
    Search
} from 'lucide-react';

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

export default function RoleManagementPage() {
    const { confirm } = useConfirm();
    const [roles, setRoles] = useState([]);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('table'); // 'table' (default) | 'grid'
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        label: '',
        name: '',
        description: '',
        permissions: [],
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rolesRes, modulesRes] = await Promise.all([
                api.get('/roles'),
                api.get('/roles/modules')
            ]);
            setRoles(rolesRes.data.data || []);
            setModules(modulesRes.data.data || []);
        } catch (err) {
            console.error('Error fetching roles and modules:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (role = null) => {
        if (role) {
            setEditingRole(role);
            setForm({
                label: role.label || '',
                name: role.name || '',
                description: role.description || '',
                permissions: ensureArray(role.permissions),
            });
        } else {
            setEditingRole(null);
            setForm({
                label: '',
                name: '',
                description: '',
                permissions: [],
            });
        }
        setShowModal(true);
    };

    // Toggle single permission key e.g. 'invoices.view' or 'invoices'
    const handleTogglePerm = (permKey) => {
        setForm(prev => {
            const perms = ensureArray(prev.permissions);
            if (perms.includes(permKey)) {
                return { ...prev, permissions: perms.filter(k => k !== permKey) };
            } else {
                return { ...prev, permissions: [...perms, permKey] };
            }
        });
    };

    // Toggle all actions for a specific module
    const handleToggleModuleRow = (moduleObj) => {
        const modKeys = (moduleObj.actions || []).map(a => `${moduleObj.key}.${a.key}`);
        modKeys.push(moduleObj.key);

        setForm(prev => {
            const perms = ensureArray(prev.permissions);
            const hasAll = modKeys.every(k => perms.includes(k));

            if (hasAll) {
                return { ...prev, permissions: perms.filter(k => !modKeys.includes(k) && !k.startsWith(`${moduleObj.key}.`)) };
            } else {
                const newPerms = new Set([...perms, ...modKeys]);
                return { ...prev, permissions: Array.from(newPerms) };
            }
        });
    };

    // Global Selection Controls
    const handleSelectAllFull = () => {
        const allKeys = [];
        modules.forEach(m => {
            allKeys.push(m.key);
            (m.actions || []).forEach(a => {
                allKeys.push(`${m.key}.${a.key}`);
            });
        });
        setForm(prev => ({ ...prev, permissions: Array.from(new Set(allKeys)) }));
    };

    const handleSelectReadOnly = () => {
        const readKeys = [];
        modules.forEach(m => {
            readKeys.push(`${m.key}.view`);
            readKeys.push(m.key);
        });
        setForm(prev => ({ ...prev, permissions: Array.from(new Set(readKeys)) }));
    };

    const handleClearAll = () => {
        setForm(prev => ({ ...prev, permissions: [] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.label) {
            alert('Nama Label Role wajib diisi!');
            return;
        }

        setSubmitting(true);
        try {
            if (editingRole) {
                await api.put(`/roles/${editingRole.id}`, form);
                alert('Role berhasil diperbarui!');
            } else {
                await api.post('/roles', form);
                alert('Role dinamis baru berhasil dibuat!');
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            alert('Gagal menyimpan role: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteRole = async (role) => {
        if (role.is_system) {
            alert('Role sistem utama tidak dapat dihapus.');
            return;
        }
        const ok = await confirm({
            title: `Hapus Role "${role.label}"`,
            message: `Hapus role "${role.label}"? Role yang sudah dihapus tidak dapat dipulihkan.`,
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;

        try {
            await api.delete(`/roles/${role.id}`);
            alert('Role berhasil dihapus!');
            fetchData();
        } catch (err) {
            alert('Gagal menghapus role: ' + (err.response?.data?.message || err.message));
        }
    };

    const filteredRoles = roles.filter(r =>
        r.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalSystemRoles = roles.filter(r => r.is_system).length;
    const totalCustomRoles = roles.filter(r => !r.is_system).length;
    const totalUsersLinked = roles.reduce((sum, r) => sum + (r.users_count || 0), 0);

    return (
        <div className="space-y-6 pb-16 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span>Manajemen Role &amp; Matriks Hak Akses (RBAC)</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Buat role dinamis baru, atur matriks kewenangan (Lihat, Tambah, Edit, Hapus) per modul, &amp; batasi wewenang user.
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all self-start md:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Buat Role Dinamis Baru</span>
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Role Terdaftar</p>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{roles.length}</h3>
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">Role Sistem &amp; Kustom</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <Lock className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Role Proteksi Sistem</p>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{totalSystemRoles}</h3>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Protected System Roles</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                        <Layers className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Role Dinamis Kustom</p>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{totalCustomRoles}</h3>
                        <p className="text-[10px] text-purple-600 dark:text-purple-400 font-medium mt-0.5">Dibuat Oleh Admin</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Pengguna Terhubung</p>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{totalUsersLinked}</h3>
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">User Aktif Ter-assign</p>
                    </div>
                </div>
            </div>

            {/* Filter & View Switcher Bar */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari nama role, slug, atau deskripsi..."
                        className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
                    />
                </div>

                <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Total {filteredRoles.length} Role
                    </span>

                    {/* View Switcher: Tabel (Default) vs Card Grid */}
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 ml-2">
                        <button
                            type="button"
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
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
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
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

            {/* Roles List View (Table Default vs Card Grid) */}
            {loading ? (
                <div className="flex justify-center p-16 text-xs text-slate-500 dark:text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mr-2 text-blue-600 dark:text-blue-400" />
                    <span>Memuat matriks kewenangan role...</span>
                </div>
            ) : filteredRoles.length === 0 ? (
                <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 bg-white dark:bg-[#0f172a]">
                    Tidak ada role ditemukan.
                </div>
            ) : viewMode === 'table' ? (
                /* TABLE VIEW (DEFAULT) */
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                    <th className="py-3.5 px-4">Nama Role &amp; Kode Slug</th>
                                    <th className="py-3.5 px-4">Deskripsi Peran</th>
                                    <th className="py-3.5 px-4">Pengguna Terhubung</th>
                                    <th className="py-3.5 px-4">Matriks Kewenangan Modul (Ringkasan)</th>
                                    <th className="py-3.5 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                {filteredRoles.map((role) => {
                                    const perms = ensureArray(role.permissions);
                                    const isSystemRoot = ['admin', 'administrator', 'superadmin'].includes(role.name.toLowerCase());

                                    return (
                                        <tr key={role.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <div className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">
                                                    {role.label}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <span className="font-mono text-[9px] font-black uppercase px-2 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                                        {role.name}
                                                    </span>
                                                    {role.is_system && (
                                                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                            System Role
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                                                {role.description || '-'}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                                    {role.users_count || 0} User
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {isSystemRoot ? (
                                                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-[10px] inline-flex items-center gap-1">
                                                        <ShieldCheck className="w-3.5 h-3.5" />
                                                        <span>Full Root Access (100%)</span>
                                                    </span>
                                                ) : (
                                                    <div className="flex flex-wrap gap-1 max-w-md">
                                                        {modules.map(mod => {
                                                            const hasLegacy = perms.includes(mod.key);
                                                            const canView = hasLegacy || perms.includes(`${mod.key}.view`);
                                                            const canCreate = hasLegacy || perms.includes(`${mod.key}.create`);
                                                            const canEdit = hasLegacy || perms.includes(`${mod.key}.edit`);
                                                            const canDelete = hasLegacy || perms.includes(`${mod.key}.delete`);

                                                            if (!canView && !canCreate && !canEdit && !canDelete) return null;

                                                            const actionsTag = [
                                                                canView && 'Lihat',
                                                                canCreate && 'Tambah',
                                                                canEdit && 'Edit',
                                                                canDelete && 'Hapus'
                                                            ].filter(Boolean).join(', ');

                                                            return (
                                                                <span
                                                                    key={mod.key}
                                                                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold text-[10px]"
                                                                    title={`${mod.title}: ${actionsTag}`}
                                                                >
                                                                    <strong>{mod.title.split('&')[0]}</strong> <span className="text-slate-400 text-[9px]">({actionsTag})</span>
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-right space-x-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenModal(role)}
                                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                                                    title="Edit Wewenang Matriks Role"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                {!role.is_system && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteRole(role)}
                                                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                                        title="Hapus Role Ini"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* GRID CARD VIEW */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {filteredRoles.map((role) => {
                        const perms = ensureArray(role.permissions);
                        const isSystemRoot = ['admin', 'administrator', 'superadmin'].includes(role.name.toLowerCase());

                        return (
                            <div
                                key={role.id}
                                className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                                    {role.name}
                                                </span>
                                                {role.is_system && (
                                                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                        System Role
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                                                {role.label}
                                            </h3>
                                        </div>

                                        <div className="flex items-center space-x-1">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenModal(role)}
                                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                                                title="Edit Wewenang Matriks Role"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            {!role.is_system && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteRole(role)}
                                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                                    title="Hapus Role Ini"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        {role.description || 'Tidak ada deskripsi rincian peranan.'}
                                    </p>

                                    {/* Permission Breakdown Badges */}
                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                                            Rincian Matriks Kewenangan Modul:
                                        </span>

                                        {isSystemRoot ? (
                                            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center space-x-2">
                                                <ShieldCheck className="w-4 h-4" />
                                                <span>FULL ROOT ACCESS — Bebas Akses (Lihat, Tambah, Edit, Hapus) Seluruh Modul</span>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                                {modules.map((mod) => {
                                                    const hasLegacy = perms.includes(mod.key);
                                                    const canView = hasLegacy || perms.includes(`${mod.key}.view`);
                                                    const canCreate = hasLegacy || perms.includes(`${mod.key}.create`);
                                                    const canEdit = hasLegacy || perms.includes(`${mod.key}.edit`);
                                                    const canDelete = hasLegacy || perms.includes(`${mod.key}.delete`);

                                                    const hasAny = canView || canCreate || canEdit || canDelete;
                                                    if (!hasAny) return null;

                                                    return (
                                                        <div
                                                            key={mod.key}
                                                            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1"
                                                        >
                                                            <div className="font-bold text-[11px] text-slate-800 dark:text-slate-200">
                                                                {mod.title}
                                                            </div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {canView && <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Lihat</span>}
                                                                {canCreate && <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">Tambah</span>}
                                                                {canEdit && <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Edit</span>}
                                                                {canDelete && <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">Hapus</span>}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
                                    <span className="font-mono text-[11px]">
                                        Assigned to <strong className="text-slate-800 dark:text-slate-200 font-extrabold">{role.users_count || 0}</strong> Users
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create / Edit Role Modal with Action Checklist Matrix Table */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-5 my-8">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div>
                                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    <span>{editingRole ? `Edit Matriks Role: ${editingRole.label}` : 'Buat Role Dinamis Baru'}</span>
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Centang kewenangan spesifik (Lihat, Tambah, Edit, Hapus) untuk setiap modul sistem.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Nama Label Role *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={form.label}
                                        onChange={(e) => setForm({ ...form, label: e.target.value })}
                                        placeholder="ex: Finance Auditor / Sales Manager"
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Kode / Slug Role (Otomatis)
                                    </label>
                                    <input
                                        type="text"
                                        disabled={Boolean(editingRole && editingRole.is_system)}
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="ex: finance_auditor (Auto-generate)"
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-blue-500 disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Deskripsi Peranan
                                </label>
                                <input
                                    type="text"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Jelaskan ruang lingkup wewenang role ini..."
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* CHECKLIST MATRIX TABLE HEADER CONTROLS */}
                            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                                    <div className="font-extrabold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                                        <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        <span>Matriks Checklist Kewenangan Modul (Action-Level Matrix):</span>
                                    </div>
                                    <div className="flex items-center space-x-1.5">
                                        <button
                                            type="button"
                                            onClick={handleSelectAllFull}
                                            className="px-2.5 py-1 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold text-[11px] transition-all"
                                        >
                                            Pilih Semua (Full)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSelectReadOnly}
                                            className="px-2.5 py-1 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-[11px] transition-all"
                                        >
                                            Hanya Lihat (Read Only)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleClearAll}
                                            className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-600 dark:text-slate-400 font-bold text-[11px] transition-all"
                                        >
                                            Kosongkan
                                        </button>
                                    </div>
                                </div>

                                {/* CHECKLIST MATRIX TABLE */}
                                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-slate-900">
                                                <th className="py-3 px-4">Modul Sistem</th>
                                                <th className="py-3 px-3 text-center text-emerald-600 dark:text-emerald-400">
                                                    <span className="flex items-center justify-center gap-1">
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>Lihat</span>
                                                    </span>
                                                </th>
                                                <th className="py-3 px-3 text-center text-blue-600 dark:text-blue-400">
                                                    <span className="flex items-center justify-center gap-1">
                                                        <PlusCircle className="w-3.5 h-3.5" />
                                                        <span>Tambah</span>
                                                    </span>
                                                </th>
                                                <th className="py-3 px-3 text-center text-amber-600 dark:text-amber-400">
                                                    <span className="flex items-center justify-center gap-1">
                                                        <FileEdit className="w-3.5 h-3.5" />
                                                        <span>Edit</span>
                                                    </span>
                                                </th>
                                                <th className="py-3 px-3 text-center text-rose-600 dark:text-rose-400">
                                                    <span className="flex items-center justify-center gap-1">
                                                        <Trash className="w-3.5 h-3.5" />
                                                        <span>Hapus</span>
                                                    </span>
                                                </th>
                                                <th className="py-3 px-4 text-right">Opsi Baris</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                            {modules.map((mod) => {
                                                const actions = mod.actions || [];
                                                const hasView = actions.some(a => a.key === 'view');
                                                const hasCreate = actions.some(a => a.key === 'create');
                                                const hasEdit = actions.some(a => a.key === 'edit');
                                                const hasDelete = actions.some(a => a.key === 'delete');

                                                const formPerms = ensureArray(form.permissions);
                                                const isLegacyChecked = formPerms.includes(mod.key);
                                                const isViewChecked = isLegacyChecked || formPerms.includes(`${mod.key}.view`);
                                                const isCreateChecked = isLegacyChecked || formPerms.includes(`${mod.key}.create`);
                                                const isEditChecked = isLegacyChecked || formPerms.includes(`${mod.key}.edit`);
                                                const isDeleteChecked = isLegacyChecked || formPerms.includes(`${mod.key}.delete`);

                                                const modKeys = actions.map(a => `${mod.key}.${a.key}`);
                                                modKeys.push(mod.key);
                                                const isAllRowChecked = modKeys.length > 0 && modKeys.every(k => formPerms.includes(k));

                                                return (
                                                    <tr key={mod.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                                        <td className="py-3 px-4">
                                                            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                                                                <span>{mod.title}</span>
                                                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-normal">
                                                                    {mod.key}
                                                                </span>
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 mt-0.5">{mod.description}</p>
                                                        </td>

                                                        {/* VIEW CHECKBOX */}
                                                        <td className="py-3 px-3 text-center">
                                                            {hasView ? (
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isViewChecked}
                                                                    onChange={() => handleTogglePerm(`${mod.key}.view`)}
                                                                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                                                />
                                                            ) : (
                                                                <span className="text-slate-300 dark:text-slate-700">-</span>
                                                            )}
                                                        </td>

                                                        {/* CREATE CHECKBOX */}
                                                        <td className="py-3 px-3 text-center">
                                                            {hasCreate ? (
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isCreateChecked}
                                                                    onChange={() => handleTogglePerm(`${mod.key}.create`)}
                                                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                                />
                                                            ) : (
                                                                <span className="text-slate-300 dark:text-slate-700">-</span>
                                                            )}
                                                        </td>

                                                        {/* EDIT CHECKBOX */}
                                                        <td className="py-3 px-3 text-center">
                                                            {hasEdit ? (
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isEditChecked}
                                                                    onChange={() => handleTogglePerm(`${mod.key}.edit`)}
                                                                    className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                                                                />
                                                            ) : (
                                                                <span className="text-slate-300 dark:text-slate-700">-</span>
                                                            )}
                                                        </td>

                                                        {/* DELETE CHECKBOX */}
                                                        <td className="py-3 px-3 text-center">
                                                            {hasDelete ? (
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isDeleteChecked}
                                                                    onChange={() => handleTogglePerm(`${mod.key}.delete`)}
                                                                    className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                                                                />
                                                            ) : (
                                                                <span className="text-slate-300 dark:text-slate-700">-</span>
                                                            )}
                                                        </td>

                                                        {/* ROW ACTION */}
                                                        <td className="py-3 px-4 text-right">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleModuleRow(mod)}
                                                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-all"
                                                            >
                                                                {isAllRowChecked ? 'Batal' : 'Pilih Semua'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
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
                                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    <span>{editingRole ? 'Simpan Matriks Role' : 'Buat Role Baru'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
