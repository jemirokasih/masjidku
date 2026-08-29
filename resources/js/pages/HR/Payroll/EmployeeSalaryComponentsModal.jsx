import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { useConfirm } from '../../../context/ConfirmContext';
import SearchableSelect from '../../../components/SearchableSelect';
import { X, Plus, Trash2, Edit3, DollarSign, Check, AlertCircle, RefreshCw, Layers } from 'lucide-react';

export default function EmployeeSalaryComponentsModal({ employee, onClose, onUpdated }) {
    const { confirm } = useConfirm();
    const [components, setComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        component_type: 'ALLOWANCE',
        calculation_type: 'FIXED',
        name: '',
        amount: '',
        is_active: true,
        notes: '',
    });

    const formatRp = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID');

    const fetchComponents = async () => {
        if (!employee?.id) return;
        setLoading(true);
        try {
            const res = await api.get(`/hr/employees/${employee.id}/salary-components`);
            setComponents(res.data.data || []);
        } catch (err) {
            console.error('Error fetching components:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComponents();
    }, [employee?.id]);

    const handleOpenCreate = (type = 'ALLOWANCE') => {
        setEditingId(null);
        setForm({
            component_type: type,
            calculation_type: type === 'ALLOWANCE' ? 'DAILY_ATTENDANCE' : 'PERCENTAGE',
            name: type === 'ALLOWANCE' ? 'Uang Makan Harian' : 'BPJS Ketenagakerjaan',
            amount: type === 'ALLOWANCE' ? '25000' : '2',
            is_active: true,
            notes: '',
        });
        setShowForm(true);
    };

    const handleOpenEdit = (comp) => {
        setEditingId(comp.id);
        setForm({
            component_type: comp.component_type,
            calculation_type: comp.calculation_type,
            name: comp.name,
            amount: comp.amount,
            is_active: comp.is_active,
            notes: comp.notes || '',
        });
        setShowForm(true);
    };

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingId) {
                await api.put(`/hr/salary-components/${editingId}`, form);
            } else {
                await api.post(`/hr/employees/${employee.id}/salary-components`, form);
            }
            setShowForm(false);
            fetchComponents();
            if (onUpdated) onUpdated();
        } catch (err) {
            alert('Gagal menyimpan komponen gaji: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (comp) => {
        const ok = await confirm({
            title: 'Hapus Komponen Gaji',
            message: `Hapus komponen "${comp.name}" dari profil ${employee.full_name}?`,
            confirmText: 'Ya, Hapus',
            type: 'danger',
        });
        if (!ok) return;

        try {
            await api.delete(`/hr/salary-components/${comp.id}`);
            fetchComponents();
            if (onUpdated) onUpdated();
        } catch (err) {
            alert('Gagal menghapus komponen: ' + (err.response?.data?.message || err.message));
        }
    };

    const allowances = components.filter(c => c.component_type === 'ALLOWANCE');
    const deductions = components.filter(c => c.component_type === 'DEDUCTION');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
            <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-base shadow-sm">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                Master Komponen Gaji: {employee.full_name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Gaji Pokok Saat Ini: <strong className="text-emerald-600 dark:text-emerald-400">{formatRp(employee.salary)}</strong>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                    
                    {/* Add/Edit Sub-Form */}
                    {showForm ? (
                        <form onSubmit={handleSubmitForm} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                                    {editingId ? 'Edit Komponen Gaji' : 'Tambah Komponen Gaji Baru'}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
                                >
                                    Batal
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Jenis Komponen
                                    </label>
                                    <SearchableSelect
                                        options={[
                                            { value: 'ALLOWANCE', label: 'Tunjangan / Pendapatan (+)' },
                                            { value: 'DEDUCTION', label: 'Potongan (-)' },
                                        ]}
                                        value={form.component_type}
                                        onChange={(val) => setForm({ ...form, component_type: val })}
                                        placeholder="Pilih Jenis..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Metode Perhitungan
                                    </label>
                                    <SearchableSelect
                                        options={[
                                            { value: 'FIXED', label: 'Nominal Tetap Bulanan (Rp)' },
                                            { value: 'DAILY_ATTENDANCE', label: 'Tarif Harian x Presensi (Daily)' },
                                            { value: 'PERCENTAGE', label: 'Persentase % dari Gaji Pokok' },
                                        ]}
                                        value={form.calculation_type}
                                        onChange={(val) => setForm({ ...form, calculation_type: val })}
                                        placeholder="Metode Perhitungan..."
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Nama Komponen
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Contoh: Tunjangan Jabatan, Uang Makan Harian, BPJS TK"
                                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Nominal / Persentase Nilai
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="any"
                                            value={form.amount}
                                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                            placeholder={form.calculation_type === 'PERCENTAGE' ? 'Contoh: 2 (% gaji pokok)' : 'Contoh: 25000'}
                                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                            required
                                        />
                                        <span className="absolute right-3 top-1.5 text-[10px] text-slate-400 font-semibold">
                                            {form.calculation_type === 'PERCENTAGE' ? '%' : form.calculation_type === 'DAILY_ATTENDANCE' ? 'Rp/hari' : 'Rp'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Status
                                    </label>
                                    <label className="flex items-center space-x-2 mt-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.is_active}
                                            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                        />
                                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Aktif dalam kalkulasi</span>
                                    </label>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Catatan / Keterangan (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={form.notes}
                                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                        placeholder="Keterangan tambahan..."
                                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
                                >
                                    {saving ? 'Menyimpan...' : 'Simpan Komponen'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500">Daftar tunjangan & potongan yang terpasang otomatis:</span>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleOpenCreate('ALLOWANCE')}
                                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>+ Tunjangan</span>
                                </button>
                                <button
                                    onClick={() => handleOpenCreate('DEDUCTION')}
                                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>+ Potongan</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="py-8 text-center text-slate-400">
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                            <span>Memuat komponen gaji...</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            
                            {/* Section Allowances */}
                            <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 overflow-hidden bg-emerald-50/10">
                                <div className="px-3 py-2 bg-emerald-500/10 border-b border-emerald-200 dark:border-emerald-900/40 font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
                                    <span>TUNJANGAN & PENDAPATAN TAMBAHAN ({allowances.length})</span>
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {allowances.length > 0 ? (
                                        allowances.map((comp) => (
                                            <div key={comp.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                                <div>
                                                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                                                        <span>{comp.name}</span>
                                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold">
                                                            {comp.calculation_type === 'DAILY_ATTENDANCE' ? 'Harian x Hadir' : comp.calculation_type === 'PERCENTAGE' ? '% Gaji' : 'Tetap'}
                                                        </span>
                                                        {!comp.is_active && (
                                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-bold">Non-aktif</span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 font-bold text-emerald-600 dark:text-emerald-400">
                                                        {comp.calculation_type === 'PERCENTAGE' ? `${comp.amount}% dari Gaji Pokok` : comp.calculation_type === 'DAILY_ATTENDANCE' ? `${formatRp(comp.amount)} / hari hadir` : formatRp(comp.amount)}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <button
                                                        onClick={() => handleOpenEdit(comp)}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(comp)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-slate-400 italic">Belum ada tunjangan kustom</div>
                                    )}
                                </div>
                            </div>

                            {/* Section Deductions */}
                            <div className="rounded-xl border border-rose-200 dark:border-rose-900/40 overflow-hidden bg-rose-50/10">
                                <div className="px-3 py-2 bg-rose-500/10 border-b border-rose-200 dark:border-rose-900/40 font-bold text-rose-700 dark:text-rose-400 flex items-center justify-between">
                                    <span>POTONGAN RUTIN ({deductions.length})</span>
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {deductions.length > 0 ? (
                                        deductions.map((comp) => (
                                            <div key={comp.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                                <div>
                                                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                                                        <span>{comp.name}</span>
                                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-bold">
                                                            {comp.calculation_type === 'PERCENTAGE' ? '% Gaji' : 'Tetap'}
                                                        </span>
                                                        {!comp.is_active && (
                                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-bold">Non-aktif</span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 font-bold text-rose-600 dark:text-rose-400">
                                                        {comp.calculation_type === 'PERCENTAGE' ? `${comp.amount}% dari Gaji Pokok` : formatRp(comp.amount)}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <button
                                                        onClick={() => handleOpenEdit(comp)}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(comp)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-slate-400 italic">Belum ada potongan rutin kustom</div>
                                    )}
                                </div>
                            </div>

                        </div>
                    )}

                </div>

                {/* Footer Modal */}
                <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                    >
                        Tutup
                    </button>
                </div>

            </div>
        </div>
    );
}
