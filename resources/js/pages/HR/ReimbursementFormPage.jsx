import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import SearchableSelect from '../../components/SearchableSelect';
import {
    Receipt,
    ArrowLeft,
    Save,
    RefreshCw,
    Paperclip,
    UploadCloud,
    FolderKanban,
    Calendar,
    DollarSign,
    User
} from 'lucide-react';

export default function ReimbursementFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const { user } = useAuth();
    const userRole = (user?.role || 'staff').toLowerCase();
    const isHrOrAdmin = ['superadmin', 'administrator', 'admin', 'hr', 'finance', 'project_manager'].includes(userRole);

    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);

    const [employees, setEmployees] = useState([]);
    const [projects, setProjects] = useState([]);

    const defaultCategories = [
        { code: 'TRANSPORTATION', name: 'Bensin & Transportasi', icon: '🚗' },
        { code: 'MEALS', name: 'Makan & Entertainment Klien', icon: '🍱' },
        { code: 'EQUIPMENT', name: 'Pembelian Alat & Equipment', icon: '🛠️' },
        { code: 'MEDICAL', name: 'Kesehatan & Medis', icon: '💊' },
        { code: 'OTHER', name: 'Operasional & Lain-Lain', icon: '📝' },
    ];
    const [categories, setCategories] = useState(defaultCategories);

    const [form, setForm] = useState({
        employee_id: '',
        project_id: '',
        category: 'TRANSPORTATION',
        title: '',
        claim_date: new Date().toISOString().split('T')[0],
        amount: '',
        description: '',
        receipt_file: null,
    });
    const [selectedFileName, setSelectedFileName] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [catRes, prjRes] = await Promise.all([
                    api.get('/hr/reimbursement-categories').catch(() => ({ data: { data: [] } })),
                    api.get('/projects').catch(() => ({ data: { data: [] } })),
                ]);

                if (catRes.data.data && catRes.data.data.length > 0) {
                    setCategories(catRes.data.data);
                }
                setProjects(prjRes.data.data || []);

                if (isHrOrAdmin) {
                    const empRes = await api.get('/hr/employees').catch(() => ({ data: { data: [] } }));
                    setEmployees(empRes.data.data || []);
                }

                if (isEdit) {
                    const res = await api.get(`/hr/reimbursements/${id}`);
                    const item = res.data.data;
                    if (item) {
                        setForm({
                            employee_id: item.employee_id || '',
                            project_id: item.project_id || '',
                            category: item.category || 'TRANSPORTATION',
                            title: item.title || '',
                            claim_date: item.claim_date ? item.claim_date.substring(0, 10) : new Date().toISOString().split('T')[0],
                            amount: item.amount || '',
                            description: item.description || '',
                            receipt_file: null,
                        });
                        setSelectedFileName(item.receipt_file_name || '');
                    }
                }
            } catch (err) {
                console.error('Error fetching reimbursement form data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [id, isEdit, isHrOrAdmin]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.amount) {
            alert('Judul dan nominal klaim wajib diisi!');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            if (form.employee_id) formData.append('employee_id', form.employee_id);
            if (form.project_id) formData.append('project_id', form.project_id);
            formData.append('category', form.category);
            formData.append('title', form.title);
            formData.append('claim_date', form.claim_date);
            formData.append('amount', form.amount);
            if (form.description) formData.append('description', form.description);
            if (form.receipt_file) formData.append('receipt_file', form.receipt_file);

            if (isEdit) {
                formData.append('_method', 'PUT');
                await api.post(`/hr/reimbursements/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                alert('Pengajuan reimbursement berhasil diperbarui!');
            } else {
                await api.post('/hr/reimbursements', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                alert('Pengajuan reimbursement baru berhasil dikirim!');
            }
            navigate('/hr/reimbursements');
        } catch (err) {
            alert('Gagal mengirim reimbursement: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px] text-xs text-slate-500">
                <RefreshCw className="w-5 h-5 animate-spin mr-2 text-blue-600" />
                <span>Memuat formulir reimbursement...</span>
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
                        onClick={() => navigate('/hr/reimbursements')}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        title="Kembali ke Daftar Reimbursement"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span>{isEdit ? 'Edit Pengajuan Reimbursement' : 'Formulir Pengajuan Reimbursement Baru'}</span>
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Isi detail rincian biaya operasional, pilih project terkait, &amp; unggah kelengkapan struk/nota.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Container */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5 text-xs">
                {isHrOrAdmin && (
                    <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Pilih Karyawan Pemohon *</label>
                        <SearchableSelect
                            options={[
                                { value: '', label: '-- Pilih Karyawan Pemohon --' },
                                ...employees.map(e => ({
                                    value: e.id,
                                    label: e.full_name,
                                    code: e.nik || e.employee_code,
                                    sublabel: typeof e.department === 'object' ? e.department?.name : (e.department || 'Umum'),
                                }))
                            ]}
                            value={form.employee_id}
                            onChange={(val) => setForm({ ...form, employee_id: val })}
                            placeholder="Cari & Pilih Karyawan Pemohon..."
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Kategori Biaya Reimbursement *</label>
                        <SearchableSelect
                            options={categories.map(c => ({
                                value: c.code || c.value,
                                label: `${c.icon || '📝'} ${c.name || c.label}`,
                            }))}
                            value={form.category}
                            onChange={(val) => setForm({ ...form, category: val })}
                            placeholder="Cari & Pilih Kategori..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Project Terkait (Opsional)</label>
                        <SearchableSelect
                            options={[
                                { value: '', label: '-- Tidak Terkait Project (Operasional Umum) --' },
                                ...projects.map(p => ({
                                    value: p.id,
                                    label: p.name,
                                    code: p.code,
                                    sublabel: p.client ? p.client.name : 'Internal',
                                }))
                            ]}
                            value={form.project_id}
                            onChange={(val) => setForm({ ...form, project_id: val })}
                            placeholder="Cari & Pilih Project..."
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Judul / Perihal Reimbursement *</label>
                    <input
                        type="text"
                        required
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Contoh: Bensin & Toll Perjalanan Dinas Klien Bandung"
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-200 font-semibold focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Tanggal Nota / Struk Pembelian *</label>
                        <input
                            type="date"
                            required
                            value={form.claim_date}
                            onChange={(e) => setForm({ ...form, claim_date: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-200 font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Nominal Diajukan (Rp) *</label>
                        <input
                            type="number"
                            step="1"
                            min="1"
                            required
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            placeholder="0"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-200 font-mono font-bold focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Upload Bukti Nota Dropzone */}
                <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Upload Bukti Nota / Kwitansi / Struk (PDF / Image)</label>
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors bg-slate-50 dark:bg-slate-900/40">
                        <UploadCloud className="w-10 h-10 mx-auto text-blue-500 mb-2" />
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-bold">
                            Klik di sini untuk memilih berkas struk / nota bukti pengeluaran
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">Format file diizinkan: PDF, JPG, PNG, ZIP (Maksimal 10MB)</p>
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.zip"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    setForm({ ...form, receipt_file: file });
                                    setSelectedFileName(file.name);
                                }
                            }}
                            className="mt-3 block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        />
                        {selectedFileName && (
                            <div className="mt-3 text-xs font-bold text-blue-600 flex items-center justify-center space-x-1.5 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
                                <Paperclip className="w-4 h-4 text-blue-600" />
                                <span>{selectedFileName}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Keterangan / Rincian Penggunaan Biaya</label>
                    <textarea
                        rows={3}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Tuliskan keterangan detail rincian pengeluaran operasional..."
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                </div>

                {/* Form Actions */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => navigate('/hr/reimbursements')}
                        className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 transition-all"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-500/20 flex items-center space-x-2 transition-all disabled:opacity-50"
                    >
                        {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{isEdit ? 'Simpan Perubahan' : 'Kirim Pengajuan Reimbursement'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
