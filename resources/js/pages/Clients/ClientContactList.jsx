import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useConfirm } from '../../context/ConfirmContext';
import SearchableSelect from '../../components/SearchableSelect';
import {
    UserCheck,
    Search,
    Building2,
    Mail,
    Phone,
    Star,
    RefreshCw,
    Edit3,
    Trash2,
    X,
    Users,
    Briefcase,
    ExternalLink
} from 'lucide-react';

export default function ClientContactList() {
    const { confirm } = useConfirm();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [primaryFilter, setPrimaryFilter] = useState('');

    const [editingPic, setEditingPic] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: '',
        position: '',
        email: '',
        phone: '',
        is_primary: false,
        notes: ''
    });

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/client-contacts', {
                params: { search: searchTerm, is_primary: primaryFilter }
            });
            setContacts(res.data.data || []);
        } catch (err) {
            console.error('Error fetching client contacts:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchContacts();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm, primaryFilter]);

    const handleEditPic = (pic) => {
        setEditingPic(pic);
        setForm({
            name: pic.name || '',
            position: pic.position || '',
            email: pic.email || '',
            phone: pic.phone || '',
            is_primary: pic.is_primary ?? false,
            notes: pic.notes || ''
        });
    };

    const handleUpdatePic = async (e) => {
        e.preventDefault();
        if (!editingPic) return;
        setSubmitting(true);
        try {
            await api.put(`/client-contacts/${editingPic.id}`, form);
            setEditingPic(null);
            fetchContacts();
            alert('Kontak PIC berhasil diperbarui!');
        } catch (err) {
            alert('Gagal memperbarui kontak: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeletePic = async (pic) => {
        const ok = await confirm({
            title: 'Hapus Kontak PIC',
            message: `Apakah Anda yakin ingin menghapus kontak PIC "${pic.name}" dari ${pic.client?.company_name || pic.client?.name}? Tindakan ini tidak dapat dibatalkan.`,
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/client-contacts/${pic.id}`);
            fetchContacts();
        } catch (err) {
            alert('Gagal menghapus kontak PIC.');
        }
    };

    // Metric Calculations
    const totalContacts = contacts.length;
    const primaryContacts = contacts.filter(c => c.is_primary).length;
    const emailContacts = contacts.filter(c => c.email).length;
    const uniqueClients = new Set(contacts.map(c => c.client_id)).size;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <span>Direktori Kontak Klien (PIC)</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Daftar seluruh Person in Charge (PIC), perorangan, & penanggung jawab transaksi dari perusahaan klien terdaftar.
                    </p>
                </div>
                <Link
                    to="/clients"
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center space-x-1.5 transition-all self-start md:self-auto"
                >
                    <Users className="w-4 h-4 text-blue-500" />
                    <span>Kelola Data Klien</span>
                </Link>
            </div>

            {/* Metric Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                        <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Kontak PIC</p>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{totalContacts}</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Penanggung Jawab Klien</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                        <Star className="w-5 h-5 fill-amber-500" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">PIC Utama (Primary)</p>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{primaryContacts}</h3>
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">Kontak Prioritas Perusahaan</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Entitas Klien Terhubung</p>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{uniqueClients}</h3>
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">Perusahaan Klien Memiliki PIC</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <Mail className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Kontak Ber-Email Direct</p>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{emailContacts}</h3>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Siap Pengiriman Invoice</p>
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-3 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari nama PIC, jabatan, email, WA, atau perusahaan..."
                            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    <div className="min-w-[170px]">
                        <SearchableSelect
                            options={[
                                { value: '', label: 'Semua Peranan PIC' },
                                { value: 'true', label: 'PIC Utama (Primary)' },
                                { value: 'false', label: 'PIC Tambahan / Pendukung' },
                            ]}
                            value={primaryFilter}
                            onChange={(val) => setPrimaryFilter(val)}
                            placeholder="Semua Peranan..."
                        />
                    </div>
                </div>

                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Total {contacts.length} Kontak PIC Terdaftar
                </span>
            </div>

            {/* Data Table */}
            {loading ? (
                <div className="flex justify-center p-12 text-xs text-slate-500 dark:text-slate-400">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2 text-purple-600 dark:text-purple-400" />
                    <span>Memuat direktori kontak PIC...</span>
                </div>
            ) : contacts.length === 0 ? (
                <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 bg-white dark:bg-[#0f172a]">
                    Belum ada kontak PIC terdaftar di sistem.
                </div>
            ) : (
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                    <th className="py-3 px-4">Nama Person / PIC</th>
                                    <th className="py-3 px-4">Jabatan / Peranan</th>
                                    <th className="py-3 px-4">Perusahaan / Instansi (Klien)</th>
                                    <th className="py-3 px-4">Email Direct</th>
                                    <th className="py-3 px-4">No. WA / Telepon Direct</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                {contacts.map((pic) => {
                                    const clientName = pic.client?.company_name || pic.client?.name || '-';
                                    return (
                                        <tr key={pic.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                                                <div className="flex items-center space-x-1.5">
                                                    {pic.is_primary && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" title="PIC Utama (Primary Contact)" />}
                                                    <span>{pic.name}</span>
                                                    {pic.is_primary && (
                                                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 inline-flex items-center gap-0.5">
                                                            <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                                            <span>Utama</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                                                <div className="flex items-center space-x-1.5">
                                                    <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span>{pic.position || 'PIC Contact'}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center space-x-1.5">
                                                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span className="font-bold text-slate-800 dark:text-slate-200">{clientName}</span>
                                                    {pic.client?.alias && (
                                                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                            {pic.client.alias}
                                                        </span>
                                                    )}
                                                </div>
                                                {pic.client?.code && (
                                                    <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400 pl-5">{pic.client.code}</div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                                                {pic.email ? (
                                                    <div className="flex items-center space-x-1">
                                                        <Mail className="w-3 h-3 text-slate-400" />
                                                        <span>{pic.email}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic text-[11px]">-</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                                                {pic.phone ? (
                                                    <div className="flex items-center space-x-1 text-purple-600 dark:text-purple-400 font-semibold">
                                                        <Phone className="w-3 h-3 text-slate-400" />
                                                        <span>{pic.phone}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic text-[11px]">-</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end space-x-1.5">
                                                    <button
                                                        onClick={() => handleEditPic(pic)}
                                                        className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                                                        title="Edit Kontak PIC"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePic(pic)}
                                                        className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                                        title="Hapus Kontak PIC"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Edit PIC */}
            {editingPic && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-2xl space-y-4 my-8">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div>
                                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                    Edit Kontak PIC: {editingPic.name}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Klien: {editingPic.client?.company_name || editingPic.client?.name}
                                </p>
                            </div>
                            <button onClick={() => setEditingPic(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdatePic} className="space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nama Lengkap PIC *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Jabatan / Peranan PIC</label>
                                <input
                                    type="text"
                                    value={form.position}
                                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                                    placeholder="ex: Procurement Lead"
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Email Direct PIC</label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">No. WA / Telepon Direct</label>
                                    <input
                                        type="text"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.is_primary}
                                        onChange={(e) => setForm({ ...form, is_primary: e.target.checked })}
                                        className="rounded text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">Jadikan Kontak PIC Utama Perusahaan ini</span>
                                </label>
                            </div>

                            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingPic(null)}
                                    className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 rounded-lg bg-purple-600 text-white font-bold flex items-center space-x-1"
                                >
                                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Simpan Perubahan</span>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
