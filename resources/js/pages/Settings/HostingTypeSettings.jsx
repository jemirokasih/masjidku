import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useConfirm } from '../../context/ConfirmContext';
import { Server, Plus, Edit3, Trash2, Save, RefreshCw, X, Check, Layers, HardDrive } from 'lucide-react';

export default function HostingTypeSettings() {
    const { confirm } = useConfirm();
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Modal state for Type
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [typeForm, setTypeForm] = useState({ name: '', code: '', description: '', is_active: true });

    // Modal state for Provider
    const [showProviderModal, setShowProviderModal] = useState(false);
    const [editingProvider, setEditingProvider] = useState(null);
    const [activeTypeId, setActiveTypeId] = useState(null);
    const [providerForm, setProviderForm] = useState({ name: '', code: '', is_active: true });

    const fetchTypes = async () => {
        setLoading(true);
        try {
            const res = await api.get('/hosting-types');
            setTypes(res.data.data || []);
        } catch (e) {
            console.error('Gagal memuat master tipe hosting:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    // --- Type Actions ---
    const openTypeModal = (type = null) => {
        setEditingType(type);
        setTypeForm(type ? { name: type.name, code: type.code, description: type.description || '', is_active: !!type.is_active } : { name: '', code: '', description: '', is_active: true });
        setShowTypeModal(true);
    };

    const handleSaveType = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingType) {
                await api.put(`/hosting-types/${editingType.id}`, typeForm);
            } else {
                await api.post('/hosting-types', typeForm);
            }
            setShowTypeModal(false);
            fetchTypes();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menyimpan tipe hosting.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteType = async (type) => {
        if (!await confirm({
            title: 'Hapus Tipe Hosting',
            message: `Yakin ingin menghapus tipe hosting "${type.name}"? Semua provider yang terhubung akan terhapus.`,
            confirmText: 'Hapus',
            variant: 'danger',
        })) return;

        try {
            await api.delete(`/hosting-types/${type.id}`);
            fetchTypes();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menghapus tipe hosting.');
        }
    };

    // --- Provider Actions ---
    const openProviderModal = (typeId, provider = null) => {
        setActiveTypeId(typeId);
        setEditingProvider(provider);
        setProviderForm(provider ? { name: provider.name, code: provider.code || '', is_active: !!provider.is_active } : { name: '', code: '', is_active: true });
        setShowProviderModal(true);
    };

    const handleSaveProvider = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingProvider) {
                await api.put(`/hosting-providers/${editingProvider.id}`, providerForm);
            } else {
                await api.post(`/hosting-types/${activeTypeId}/providers`, providerForm);
            }
            setShowProviderModal(false);
            fetchTypes();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menyimpan provider hosting.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProvider = async (provider) => {
        if (!await confirm({
            title: 'Hapus Provider Hosting',
            message: `Hapus provider "${provider.name}"?`,
            confirmText: 'Hapus',
            variant: 'danger',
        })) return;

        try {
            await api.delete(`/hosting-providers/${provider.id}`);
            fetchTypes();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menghapus provider hosting.');
        }
    };

    return (
        <div className="space-y-6 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-3">
                <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Server className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Master Tipe &amp; Provider Hosting</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Kelola master data kategori tipe hosting dan penyedia jasa (provider) hosting yang saling terhubung.
                    </p>
                </div>
                <button
                    onClick={() => openTypeModal()}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Tipe Hosting</span>
                </button>
            </div>

            {loading ? (
                <div className="p-12 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin inline mr-2 text-blue-600" />
                    Memuat master data hosting...
                </div>
            ) : types.length === 0 ? (
                <div className="p-12 text-center text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
                    Belum ada master tipe hosting. Klik "Tambah Tipe Hosting" untuk membuat.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {types.map((type) => (
                        <div key={type.id} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{type.name}</span>
                                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase">
                                            {type.code}
                                        </span>
                                        {!type.is_active && (
                                            <span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 font-bold">
                                                Nonaktif
                                            </span>
                                        )}
                                    </div>
                                    {type.description && <p className="text-slate-500 text-[11px] mt-0.5">{type.description}</p>}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openProviderModal(type.id)}
                                        className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 font-bold flex items-center gap-1 hover:bg-emerald-100 transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Tambah Provider</span>
                                    </button>
                                    <button
                                        onClick={() => openTypeModal(type)}
                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteType(type)}
                                        className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Providers Linked to this Type */}
                            <div className="space-y-1.5 pl-2 border-l-2 border-slate-200 dark:border-slate-800">
                                <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                                    <HardDrive className="w-3.5 h-3.5" />
                                    <span>Penyedia Jasa (Hosting Providers):</span>
                                </div>

                                {type.hosting_providers?.length === 0 ? (
                                    <div className="text-[11px] text-slate-400 italic py-1">
                                        Belum ada provider untuk tipe ini. Klik "+ Tambah Provider".
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {type.hosting_providers?.map((p) => (
                                            <div
                                                key={p.id}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200"
                                            >
                                                <span className="font-semibold text-xs">{p.name}</span>
                                                {p.code && <span className="text-[10px] text-slate-400 font-mono">({p.code})</span>}
                                                <div className="flex items-center gap-1 ml-1 border-l border-slate-200 dark:border-slate-700 pl-1.5">
                                                    <button onClick={() => openProviderModal(type.id, p)} className="text-slate-400 hover:text-blue-600">
                                                        <Edit3 className="w-3 h-3" />
                                                    </button>
                                                    <button onClick={() => handleDeleteProvider(p)} className="text-slate-400 hover:text-rose-600">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Type */}
            {showTypeModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
                    <form onSubmit={handleSaveType} className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-2xl p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                {editingType ? 'Edit Tipe Hosting' : 'Tambah Tipe Hosting Baru'}
                            </h3>
                            <button type="button" onClick={() => setShowTypeModal(false)}><X className="w-4 h-4" /></button>
                        </div>
                        <div className="space-y-3">
                            <label className="block space-y-1">
                                <span className="font-semibold">Nama Tipe Hosting *</span>
                                <input
                                    required
                                    type="text"
                                    placeholder="Contoh: External Shared Hosting"
                                    value={typeForm.name}
                                    onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                                />
                            </label>
                            <label className="block space-y-1">
                                <span className="font-semibold">Kode Unik (Opsional)</span>
                                <input
                                    type="text"
                                    placeholder="Contoh: EXTERNAL_SHARED"
                                    value={typeForm.code}
                                    onChange={(e) => setTypeForm({ ...typeForm, code: e.target.value.toUpperCase() })}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-mono text-xs"
                                />
                            </label>
                            <label className="block space-y-1">
                                <span className="font-semibold">Keterangan / Deskripsi</span>
                                <textarea
                                    rows="2"
                                    placeholder="Penjelasan ringkas tipe hosting ini..."
                                    value={typeForm.description}
                                    onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                                />
                            </label>
                            <label className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    checked={typeForm.is_active}
                                    onChange={(e) => setTypeForm({ ...typeForm, is_active: e.target.checked })}
                                />
                                <span className="font-semibold">Status Aktif</span>
                            </label>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                            <button type="button" onClick={() => setShowTypeModal(false)} className="px-4 py-2 text-slate-600">Batal</button>
                            <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold flex items-center gap-1.5">
                                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                <span>Simpan</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal Provider */}
            {showProviderModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
                    <form onSubmit={handleSaveProvider} className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-2xl p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                {editingProvider ? 'Edit Provider Hosting' : 'Tambah Provider Hosting Baru'}
                            </h3>
                            <button type="button" onClick={() => setShowProviderModal(false)}><X className="w-4 h-4" /></button>
                        </div>
                        <div className="space-y-3">
                            <label className="block space-y-1">
                                <span className="font-semibold">Nama Provider / Penyedia *</span>
                                <input
                                    required
                                    type="text"
                                    placeholder="Contoh: Rumahweb, Niagahoster, Biznet Gio..."
                                    value={providerForm.name}
                                    onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                                />
                            </label>
                            <label className="block space-y-1">
                                <span className="font-semibold">Kode Provider (Opsional)</span>
                                <input
                                    type="text"
                                    placeholder="Contoh: RUMAHWEB"
                                    value={providerForm.code}
                                    onChange={(e) => setProviderForm({ ...providerForm, code: e.target.value.toUpperCase() })}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-mono text-xs"
                                />
                            </label>
                            <label className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    checked={providerForm.is_active}
                                    onChange={(e) => setProviderForm({ ...providerForm, is_active: e.target.checked })}
                                />
                                <span className="font-semibold">Status Aktif</span>
                            </label>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                            <button type="button" onClick={() => setShowProviderModal(false)} className="px-4 py-2 text-slate-600">Batal</button>
                            <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold flex items-center gap-1.5">
                                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                <span>Simpan</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

