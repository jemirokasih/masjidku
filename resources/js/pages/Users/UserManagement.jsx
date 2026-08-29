import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useConfirm } from '../../context/ConfirmContext';
import SearchableSelect from '../../components/SearchableSelect';
import {
    Users,
    UserPlus,
    Search,
    Shield,
    ShieldCheck,
    CheckCircle2,
    XCircle,
    Edit3,
    Trash2,
    RefreshCw,
    X,
    Key,
    Phone,
    Mail,
    Lock,
    UserCheck,
    Layers
} from 'lucide-react';

export default function UserManagement() {
    const { confirm } = useConfirm();
    const [users, setUsers] = useState([]);
    const [rolesList, setRolesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'staff',
        phone: '',
        is_active: true,
    });

    const fetchUsersAndRoles = async () => {
        setLoading(true);
        try {
            const [usersRes, rolesRes] = await Promise.all([
                api.get('/users'),
                api.get('/roles')
            ]);
            setUsers(usersRes.data.data || []);
            setRolesList(rolesRes.data.data || []);
        } catch (err) {
            console.error('Error fetching users/roles:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsersAndRoles();
    }, []);

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setForm({
                name: user.name,
                email: user.email,
                password: '',
                role: user.role || 'staff',
                phone: user.phone || '',
                is_active: user.is_active ?? true,
            });
        } else {
            setEditingUser(null);
            setForm({
                name: '',
                email: '',
                password: '',
                role: rolesList[0]?.name || 'staff',
                phone: '',
                is_active: true,
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingUser) {
                const payload = { ...form };
                if (!payload.password) delete payload.password;
                await api.put(`/users/${editingUser.id}`, payload);
                alert('Data pengguna berhasil diperbarui!');
            } else {
                await api.post('/users', form);
                alert('Pengguna baru berhasil ditambahkan!');
            }
            setShowModal(false);
            fetchUsersAndRoles();
        } catch (err) {
            alert('Gagal menyimpan data pengguna: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (user) => {
        const newStatus = !user.is_active;
        try {
            await api.put(`/users/${user.id}`, {
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                is_active: newStatus
            });
            fetchUsersAndRoles();
        } catch (err) {
            alert('Gagal mengubah status pengguna.');
        }
    };

    const handleDelete = async (user) => {
        const ok = await confirm({
            title: 'Hapus Akun Pengguna',
            message: `Apakah Anda yakin ingin menghapus akun pengguna "${user.name}"? Tindakan ini tidak dapat dibatalkan.`,
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/users/${user.id}`);
            fetchUsersAndRoles();
        } catch (err) {
            alert('Gagal menghapus pengguna: ' + (err.response?.data?.message || err.message));
        }
    };

    const filteredUsers = users.filter((u) => {
        const matchesSearch =
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.phone && u.phone.includes(searchTerm));
        const matchesRole = roleFilter ? u.role === roleFilter : true;
        return matchesSearch && matchesRole;
    });

    const roleBadges = {
        administrator: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        admin: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        finance: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        project_manager: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        hr: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
        staff: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        client: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Header Title Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span>Manajemen Pengguna &amp; Akun Sistem</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Kelola kredensial pengguna, pengelompokan peranan (roles), &amp; status aktivasi akun.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Link
                        to="/roles"
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center space-x-1.5 transition-all"
                    >
                        <Shield className="w-4 h-4 text-purple-500" />
                        <span>Kelola Role &amp; Hak Akses</span>
                    </Link>
                    <button
                        onClick={() => handleOpenModal()}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Tambah Pengguna Baru</span>
                    </button>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center space-x-3 w-full md:w-auto">
                    <div className="relative w-full md:w-72">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari nama, email, atau no telepon..."
                            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="min-w-[170px]">
                        <SearchableSelect
                            options={[
                                { value: '', label: 'Semua Peranan (Roles)' },
                                ...rolesList.map(r => ({ value: r.name, label: `${r.label} (${r.name})` }))
                            ]}
                            value={roleFilter}
                            onChange={(val) => setRoleFilter(val)}
                            placeholder="Semua Roles..."
                        />
                    </div>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Total {filteredUsers.length} Pengguna Terdaftar
                </span>
            </div>

            {/* Users Table */}
            {loading ? (
                <div className="flex justify-center p-16 text-xs text-slate-500 dark:text-slate-400">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2 text-blue-600 dark:text-blue-400" />
                    <span>Memuat direktori pengguna...</span>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 bg-white dark:bg-[#0f172a]">
                    Tidak ada pengguna ditemukan.
                </div>
            ) : (
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                    <th className="py-3.5 px-4">Pengguna</th>
                                    <th className="py-3.5 px-4">Alamat Email</th>
                                    <th className="py-3.5 px-4">No. Telepon</th>
                                    <th className="py-3.5 px-4">Peranan (Role)</th>
                                    <th className="py-3.5 px-4">Status Akun</th>
                                    <th className="py-3.5 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                {filteredUsers.map((u) => {
                                    const matchedRole = rolesList.find(r => r.name === u.role);
                                    const roleLabel = matchedRole ? matchedRole.label : u.role;

                                    return (
                                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-xs shrink-0 font-mono">
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-bold">{u.name}</span>
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">{u.email}</td>
                                            <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono">{u.phone || '-'}</td>
                                            <td className="py-3.5 px-4">
                                                <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${roleBadges[u.role] || roleBadges.staff}`}>
                                                    {roleLabel}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleStatus(u)}
                                                    className="focus:outline-none"
                                                    title="Klik untuk mengubah status aktif/nonaktif"
                                                >
                                                    {u.is_active ?? true ? (
                                                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-max">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            <span>Aktif</span>
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1 w-max">
                                                            <XCircle className="w-3 h-3" />
                                                            <span>Nonaktif</span>
                                                        </span>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="py-3.5 px-4 text-right space-x-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenModal(u)}
                                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                                                    title="Edit Data User"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(u)}
                                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                                    title="Hapus Akun User"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Create / Edit User */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                                {editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nama Lengkap *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="ex: Ahmad Fauzi"
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-semibold focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Alamat Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        placeholder="fauzi@mikrotek.id"
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">No. Telepon / WA</label>
                                    <input
                                        type="text"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        placeholder="08123456789"
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                    {editingUser ? 'Kata Sandi Baru (Kosongkan jika tidak diubah)' : 'Kata Sandi *'}
                                </label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Peranan (Role) *</label>
                                    <SearchableSelect
                                        options={rolesList.length > 0 ? rolesList.map(r => ({ value: r.name, label: `${r.label} (${r.name})` })) : [
                                            { value: 'admin', label: 'Administrator (admin)' },
                                            { value: 'finance', label: 'Finance (finance)' },
                                            { value: 'project_manager', label: 'Project Manager (project_manager)' },
                                            { value: 'hr', label: 'HR (hr)' },
                                            { value: 'staff', label: 'Staff (staff)' },
                                        ]}
                                        value={form.role}
                                        onChange={(val) => setForm({ ...form, role: val })}
                                        placeholder="Pilih Role..."
                                        required
                                    />
                                </div>
                                <div className="flex items-center pt-5">
                                    <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.is_active}
                                            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>Status Akun Aktif</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
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
                                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Simpan User</span>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
