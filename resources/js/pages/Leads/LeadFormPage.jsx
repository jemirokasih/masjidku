import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import SearchableSelect from '../../components/SearchableSelect';
import {
    UserPlus,
    ArrowLeft,
    Save,
    RefreshCw,
    Building2,
    DollarSign,
    UserCheck,
    Phone,
    Mail,
    FileText
} from 'lucide-react';

export default function LeadFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [clients, setClients] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [form, setForm] = useState({
        title: '',
        client_name: '',
        client_id: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        source: 'OTHER',
        estimated_value: 0,
        status: 'NEW',
        assigned_to: '',
        notes: '',
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cliRes, empRes] = await Promise.all([
                api.get('/clients?per_page=100').catch(() => ({ data: { data: [] } })),
                api.get('/employees?per_page=100').catch(() => ({ data: { data: [] } })),
            ]);

            setClients(cliRes.data.data || []);
            setEmployees(empRes.data.data || []);

            if (isEdit) {
                const leadRes = await api.get(`/leads/${id}`);
                if (leadRes.data?.status === 'success') {
                    const l = leadRes.data.data;
                    setForm({
                        title: l.title || '',
                        client_name: l.client_name || '',
                        client_id: l.client_id || '',
                        contact_name: l.contact_name || '',
                        contact_email: l.contact_email || '',
                        contact_phone: l.contact_phone || '',
                        source: l.source || 'OTHER',
                        estimated_value: l.estimated_value || 0,
                        status: l.status || 'NEW',
                        assigned_to: l.assigned_to || '',
                        notes: l.notes || '',
                    });
                }
            }
        } catch (err) {
            console.error('Failed to fetch lead form metadata:', err);
            alert('Gagal memuat data formulir.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleClientSelect = (clientId) => {
        setForm(prev => {
            const selected = clients.find(c => String(c.id) === String(clientId));
            return {
                ...prev,
                client_id: clientId,
                client_name: selected ? (selected.company_name || selected.name) : prev.client_name,
                contact_name: selected?.contact_person || prev.contact_name,
                contact_email: selected?.email || prev.contact_email,
                contact_phone: selected?.phone || prev.contact_phone,
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (isEdit) {
                await api.put(`/leads/${id}`, form);
            } else {
                await api.post('/leads', form);
            }
            navigate('/leads');
        } catch (err) {
            alert('Gagal menyimpan data Lead: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                <span>Memuat data formulir...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-16">
            {/* Header */}
            <div className="flex items-center space-x-3.5 border-b border-slate-200 dark:border-slate-800 pb-4">
                <Link
                    to="/leads"
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                        {isEdit ? 'Edit Data Prospek (Lead)' : 'Tambah Prospek (Lead) Baru'}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Isi detail rincian prospek penjualan calon klien baru.
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 text-xs">
                {/* Section 1: Informasi Prospek */}
                <div className="space-y-4">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>Judul &amp; Informasi Prospek</span>
                    </h3>

                    <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Judul / Kebutuhan Prospek *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="ex: Pengadaan Server &amp; Lisensi Software E-Procurement"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Pilih Klien Terdaftar (Opsional)
                            </label>
                            <SearchableSelect
                                options={[
                                    { value: '', label: '-- Input Manual / Tanpa Klien Existing --' },
                                    ...clients.map(c => ({
                                        value: c.id,
                                        label: c.company_name || c.name,
                                        sublabel: c.code ? `[${c.code}] ${c.email || ''}` : c.email
                                    }))
                                ]}
                                value={form.client_id}
                                onChange={handleClientSelect}
                                placeholder="Pilih Klien Existing..."
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Nama Perusahaan / Instansi Calon Klien *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="ex: PT Nusantara Megah Perkasa"
                                value={form.client_name}
                                onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Kontak PIC */}
                <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-5">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Kontak Personal (PIC Calon Klien)</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Nama Kontak PIC
                            </label>
                            <input
                                type="text"
                                placeholder="ex: Bpk. Hendra Gunawan"
                                value={form.contact_name}
                                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Email Kontak PIC
                            </label>
                            <input
                                type="email"
                                placeholder="hendra@nusantara.co.id"
                                value={form.contact_email}
                                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                No. HP / Telepon PIC
                            </label>
                            <input
                                type="text"
                                placeholder="0812-3456-7890"
                                value={form.contact_phone}
                                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 3: Estimasi & Parameter Prospek */}
                <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-5">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Estimasi Transaksi &amp; Status Lead</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Estimasi Nilai Prospek (Rp)
                            </label>
                            <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={form.estimated_value}
                                onChange={(e) => setForm({ ...form, estimated_value: e.target.value })}
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-bold font-mono focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Sumber Prospek (Source)
                            </label>
                            <SearchableSelect
                                options={[
                                    { value: 'WEBSITE', label: 'Website Company' },
                                    { value: 'REFERRAL', label: 'Referral / Rekomendasi' },
                                    { value: 'COLD_CALL', label: 'Cold Call / Outbound' },
                                    { value: 'EXHIBITION', label: 'Pameran / Event' },
                                    { value: 'SOCIAL_MEDIA', label: 'Social Media' },
                                    { value: 'OTHER', label: 'Lain-lain' },
                                ]}
                                value={form.source}
                                onChange={(val) => setForm({ ...form, source: val })}
                                placeholder="Pilih Sumber..."
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Status Tahapan Prospek
                            </label>
                            <SearchableSelect
                                options={[
                                    { value: 'NEW', label: 'NEW (Baru Masuk)' },
                                    { value: 'CONTACTED', label: 'CONTACTED (Sudah Dihubungi)' },
                                    { value: 'QUALIFIED', label: 'QUALIFIED (Prospek Layak)' },
                                    { value: 'PROPOSAL', label: 'PROPOSAL (Tahap Penawaran)' },
                                    { value: 'NEGOTIATION', label: 'NEGOTIATION (Tahap Nego)' },
                                    { value: 'WON', label: 'WON (Berhasil Deal)' },
                                    { value: 'LOST', label: 'LOST (Gagal/Batal)' },
                                ]}
                                value={form.status}
                                onChange={(val) => setForm({ ...form, status: val })}
                                placeholder="Pilih Status..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Penanggung Jawab Sales (Assignee)
                        </label>
                        <SearchableSelect
                            options={[
                                { value: '', label: '-- Pilih Karyawan Tim Sales/PM --' },
                                ...employees.map(emp => ({
                                    value: emp.id,
                                    label: emp.full_name,
                                    sublabel: emp.position || 'Staff'
                                }))
                            ]}
                            value={form.assigned_to}
                            onChange={(val) => setForm({ ...form, assigned_to: val })}
                            placeholder="Pilih Assignee..."
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Catatan / Ruang Lingkup Kebutuhan Prospek
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Rincian kebutuhan sistem, latar belakang prospek, atau catatan follow up..."
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
                        />
                    </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                    <Link
                        to="/leads"
                        className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center space-x-2 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-60"
                    >
                        {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{isEdit ? 'Simpan Perubahan' : 'Simpan Prospek (Lead)'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
