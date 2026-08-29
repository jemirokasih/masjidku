import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import SearchableSelect from '../../components/SearchableSelect';
import {
    FolderKanban,
    ArrowLeft,
    Save,
    RefreshCw,
    Building2,
    Calendar,
    DollarSign,
    TrendingUp,
    Users,
    Check
} from 'lucide-react';

export default function ProjectFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);

    const [clients, setClients] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [form, setForm] = useState({
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
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [clientRes, empRes] = await Promise.all([
                    api.get('/clients').catch(() => ({ data: { data: [] } })),
                    api.get('/hr/employees').catch(() => ({ data: { data: [] } })),
                ]);
                setClients(clientRes.data.data || []);
                setEmployees(empRes.data.data || []);

                if (isEdit) {
                    const prjRes = await api.get(`/projects/${id}`);
                    const prj = prjRes.data.data;
                    if (prj) {
                        setForm({
                            name: prj.name || '',
                            client_id: prj.client_id || '',
                            status: prj.status || 'PLANNING',
                            budget: prj.budget || 0,
                            start_date: prj.start_date || '',
                            end_date: prj.end_date || '',
                            description: prj.description || '',
                            progress_percent: prj.progress_percent || 0,
                            is_all_employees_involved: Boolean(prj.is_all_employees_involved),
                            employee_ids: prj.members ? prj.members.map(m => m.id) : [],
                        });
                    }
                }
            } catch (err) {
                console.error('Error fetching project form data:', err);
                alert('Gagal memuat data formulir project.');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [id, isEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name) {
            alert('Nama project wajib diisi!');
            return;
        }

        setSubmitting(true);
        try {
            if (isEdit) {
                await api.put(`/projects/${id}`, form);
                alert('Project berhasil diperbarui!');
            } else {
                await api.post('/projects', form);
                alert('Project baru berhasil dibuat!');
            }
            navigate('/projects');
        } catch (err) {
            alert('Gagal menyimpan project: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px] text-xs text-slate-500">
                <RefreshCw className="w-5 h-5 animate-spin mr-2 text-indigo-600" />
                <span>Memuat formulir project...</span>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            {/* Header Page */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                    <button
                        type="button"
                        onClick={() => navigate('/projects')}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        title="Kembali ke Daftar Project"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                            <FolderKanban className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <span>{isEdit ? 'Edit Data Project' : 'Formulir Buat Project Baru'}</span>
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Isi detail informasi project, alokasi budget, jadwal pelaksanaan, &amp; penugasan tim.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Form Container */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 text-xs">
                {/* Informasi Utama Project */}
                <div className="space-y-4">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                        <FolderKanban className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>Informasi Utama Project</span>
                    </h3>

                    <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Nama Project *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Contoh: Development System Integration & Web E-Commerce Client A"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Klien Terkait (Opsional)
                            </label>
                            <SearchableSelect
                                options={[
                                    { value: '', label: '-- Tanpa Klien / Internal Enterprise --' },
                                    ...clients.map(c => ({
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
                                placeholder="Cari & Pilih Klien..."
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Status Pelaksanaan Project *
                            </label>
                            <SearchableSelect
                                options={[
                                    { value: 'PLANNING', label: 'PLANNING (Perencanaan)' },
                                    { value: 'IN_PROGRESS', label: 'IN_PROGRESS (Sedang Berjalan)' },
                                    { value: 'ON_HOLD', label: 'ON_HOLD (Ditunda)' },
                                    { value: 'COMPLETED', label: 'COMPLETED (Selesai)' },
                                    { value: 'CANCELLED', label: 'CANCELLED (Dibatalkan)' },
                                ]}
                                value={form.status}
                                onChange={(val) => setForm({ ...form, status: val })}
                                placeholder="Cari & Pilih Status..."
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Budget, Timeline, & Progress */}
                <div className="space-y-4 pt-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>Estimasi Budget &amp; Target Waktu</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Budget Nilai Project (Rp)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={form.budget}
                                onChange={(e) => setForm({ ...form, budget: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Progress Pekerjaan (%)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={form.progress_percent}
                                onChange={(e) => setForm({ ...form, progress_percent: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Tanggal Mulai Project
                            </label>
                            <input
                                type="date"
                                value={form.start_date}
                                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Target Selesai (End Date)
                            </label>
                            <input
                                type="date"
                                value={form.end_date}
                                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Deskripsi &amp; Ruang Lingkup Pekerjaan
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Jelaskan secara singkat detail kebutuhan project, ruang lingkup, dan catatan penting lainnya..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>

                {/* Penugasan Tim Karyawan */}
                <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span>Karyawan / Anggota Tim Terlibat</span>
                        </h3>

                        <label className="flex items-center space-x-2 cursor-pointer bg-indigo-50 dark:bg-indigo-900/30 px-3.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
                            <input
                                type="checkbox"
                                checked={form.is_all_employees_involved}
                                onChange={(e) => setForm({
                                    ...form,
                                    is_all_employees_involved: e.target.checked,
                                    employee_ids: e.target.checked ? [] : form.employee_ids,
                                })}
                                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                            />
                            <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">🌐 Semua Karyawan Terlibat</span>
                        </label>
                    </div>

                    {!form.is_all_employees_involved ? (
                        <div className="space-y-2">
                            <p className="text-xs text-slate-500">Pilih anggota karyawan yang ditugaskan dalam project ini:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                                {employees.map((emp) => {
                                    const isChecked = form.employee_ids.includes(emp.id);
                                    return (
                                        <label
                                            key={emp.id}
                                            className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                                                isChecked
                                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm'
                                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
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
                                                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                                            />
                                            <div className="truncate">
                                                <span className="block truncate font-bold">{emp.full_name}</span>
                                                <span className="text-[10px] text-slate-400 font-normal truncate block">{typeof emp.department === 'object' ? emp.department?.name : (emp.department || 'Umum')}</span>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-semibold text-xs flex items-center space-x-2">
                            <span>🌐 Project ini dapat diakses &amp; melibatkan seluruh karyawan perusahaan.</span>
                        </div>
                    )}
                </div>

                {/* Submit & Cancel Actions */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => navigate('/projects')}
                        className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/20 flex items-center space-x-2 transition-all disabled:opacity-50"
                    >
                        {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{isEdit ? 'Simpan Perubahan' : 'Buat Project'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
