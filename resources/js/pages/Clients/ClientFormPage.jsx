import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import SearchableSelect from '../../components/SearchableSelect';
import {
    Users,
    ArrowLeft,
    Plus,
    Trash2,
    Save,
    RefreshCw,
    Building2,
    Mail,
    Phone,
    MapPin,
    Globe,
    FileText,
    UserCheck,
    Star,
    CheckCircle2,
    ShieldCheck,
    Briefcase
} from 'lucide-react';

export default function ClientFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [loadingData, setLoadingData] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('general'); // 'general' | 'contact' | 'pics'

    const [form, setForm] = useState({
        name: '',
        company_name: '',
        alias: '',
        industry: '',
        client_type: 'CORPORATE',
        tax_number: '',
        website: '',
        email: '',
        phone: '',
        alt_phone: '',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        is_active: true,
        pics: [
            { name: '', position: 'Procurement Manager', email: '', phone: '', is_primary: true, notes: '' }
        ]
    });

    useEffect(() => {
        if (isEdit) {
            const fetchClient = async () => {
                setLoadingData(true);
                try {
                    const res = await api.get(`/clients/${id}`);
                    const cli = res.data.data;
                    setForm({
                        name: cli.name || '',
                        company_name: cli.company_name || '',
                        alias: cli.alias || '',
                        industry: cli.industry || '',
                        client_type: cli.client_type || 'CORPORATE',
                        tax_number: cli.tax_number || '',
                        website: cli.website || '',
                        email: cli.email || '',
                        phone: cli.phone || '',
                        alt_phone: cli.alt_phone || '',
                        address: cli.address || '',
                        city: cli.city || '',
                        province: cli.province || '',
                        postal_code: cli.postal_code || '',
                        is_active: cli.is_active ?? true,
                        pics: cli.pics && cli.pics.length > 0
                            ? cli.pics.map(p => ({
                                id: p.id,
                                name: p.name || '',
                                position: p.position || '',
                                email: p.email || '',
                                phone: p.phone || '',
                                is_primary: Boolean(p.is_primary),
                                notes: p.notes || ''
                            }))
                            : [{ name: '', position: 'Procurement Manager', email: '', phone: '', is_primary: true, notes: '' }]
                    });
                } catch (err) {
                    console.error('Error fetching client data:', err);
                    alert('Gagal memuat data klien.');
                    navigate('/clients');
                } finally {
                    setLoadingData(false);
                }
            };

            fetchClient();
        }
    }, [id, isEdit]);

    const handleAddPic = () => {
        setForm(prev => ({
            ...prev,
            pics: [
                ...prev.pics,
                { name: '', position: '', email: '', phone: '', is_primary: prev.pics.length === 0, notes: '' }
            ]
        }));
    };

    const handleRemovePic = (index) => {
        setForm(prev => {
            if (prev.pics.length <= 1) return prev;
            const newPics = prev.pics.filter((_, i) => i !== index);
            if (!newPics.some(p => p.is_primary) && newPics.length > 0) {
                newPics[0].is_primary = true;
            }
            return { ...prev, pics: newPics };
        });
    };

    const handlePicChange = (index, field, value) => {
        setForm(prev => {
            const newPics = [...prev.pics];
            if (field === 'is_primary' && value) {
                newPics.forEach((p, i) => {
                    p.is_primary = i === index;
                });
            } else {
                newPics[index] = { ...newPics[index], [field]: value };
            }
            return { ...prev, pics: newPics };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.company_name) {
            alert('Nama Perusahaan atau Nama Klien wajib diisi!');
            return;
        }

        setSubmitting(true);
        const filteredPics = form.pics.filter(pic => pic.name && pic.name.trim() !== '');
        const payload = {
            ...form,
            name: form.company_name, // sync name with company_name
            pics: filteredPics
        };

        try {
            if (isEdit) {
                await api.put(`/clients/${id}`, payload);
                alert('Data klien berhasil diperbarui!');
            } else {
                await api.post('/clients', payload);
                alert('Klien baru berhasil ditambahkan!');
            }
            navigate('/clients');
        } catch (err) {
            alert('Gagal menyimpan data klien: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex justify-center items-center p-16 text-xs text-slate-500 dark:text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin mr-2 text-blue-600 dark:text-blue-400" />
                <span>Memuat formulir Klien...</span>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            {/* Top Bar Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                    <Link
                        to="/clients"
                        className="p-2 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
                        title="Kembali ke Daftar Klien"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span>{isEdit ? `Edit Data Klien (#${id})` : 'Tambah Klien Baru'}</span>
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Isi informasi perusahaan, kontak utama, alamat penagihan, &amp; daftar Penanggung Jawab (PIC).
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <Link
                        to="/clients"
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                        Batal
                    </Link>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all"
                    >
                        {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{isEdit ? 'Simpan Perubahan' : 'Simpan Klien Baru'}</span>
                    </button>
                </div>
            </div>

            {/* Main Form Body */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section 1: General Info */}
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>1. Informasi Utama Klien &amp; Identitas Perusahaan</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                Tipe Klien *
                            </label>
                            <SearchableSelect
                                options={[
                                    { value: 'CORPORATE', label: 'CORPORATE (Perusahaan Swasta / Korporat)' },
                                    { value: 'INDIVIDUAL', label: 'INDIVIDUAL (Perorangan / Personal)' },
                                    { value: 'GOVERNMENT', label: 'GOVERNMENT (Instansi Pemerintah / BUMN)' },
                                ]}
                                value={form.client_type}
                                onChange={(val) => setForm({ ...form, client_type: val })}
                                placeholder="Cari & Pilih Tipe Klien..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                Nama Perusahaan / Instansi *
                            </label>
                            <input
                                type="text"
                                required
                                value={form.company_name}
                                onChange={(e) => setForm({ ...form, company_name: e.target.value, name: e.target.value })}
                                placeholder="ex: PT Mikrotek Zemiro Indonesia"
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                Alias / Nama Singkat / Brand
                            </label>
                            <input
                                type="text"
                                value={form.alias}
                                onChange={(e) => setForm({ ...form, alias: e.target.value })}
                                placeholder="ex: MZI"
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                Industri / Sektor Usaha
                            </label>
                            <input
                                type="text"
                                value={form.industry}
                                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                                placeholder="ex: Teknologi Informasi / Konstruksi"
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                Nomor NPWP Perusahaan
                            </label>
                            <input
                                type="text"
                                value={form.tax_number}
                                onChange={(e) => setForm({ ...form, tax_number: e.target.value })}
                                placeholder="ex: 012345678901000"
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Contact & Address */}
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>2. Informasi Kontak &amp; Alamat Domisili</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                Email Perusahaan / Tagihan
                            </label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="info@mzi.co.id"
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                Telepon Utama (Kantor/WA)
                            </label>
                            <input
                                type="text"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                placeholder="0215551234 / 08123456789"
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                Website Perusahaan
                            </label>
                            <input
                                type="text"
                                value={form.website}
                                onChange={(e) => setForm({ ...form, website: e.target.value })}
                                placeholder="https://mzi.co.id"
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="md:col-span-3">
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                Alamat Lengkap Perusahaan
                            </label>
                            <textarea
                                rows={2}
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                placeholder="Plaza Kaha Lt 4. Ruang 402A, Jl. Abdullah Syafei No. 20A"
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Kota / Kabupaten</label>
                            <input
                                type="text"
                                value={form.city}
                                onChange={(e) => setForm({ ...form, city: e.target.value })}
                                placeholder="Jakarta Selatan"
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Provinsi</label>
                            <input
                                type="text"
                                value={form.province}
                                onChange={(e) => setForm({ ...form, province: e.target.value })}
                                placeholder="DKI Jakarta"
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Kode Pos</label>
                            <input
                                type="text"
                                value={form.postal_code}
                                onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                                placeholder="12190"
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 3: Person In Charge (PICs) */}
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>3. Daftar Penanggung Jawab / Person in Charge (PIC)</span>
                        </h3>
                        <button
                            type="button"
                            onClick={handleAddPic}
                            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Tambah Kontak PIC</span>
                        </button>
                    </div>

                    <div className="space-y-3">
                        {form.pics.map((pic, idx) => (
                            <div
                                key={idx}
                                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 relative"
                            >
                                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-2">
                                    <div className="flex items-center space-x-2">
                                        <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold flex items-center justify-center font-mono">
                                            {idx + 1}
                                        </span>
                                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                                            {pic.name || `PIC #${idx + 1}`}
                                        </span>
                                        {pic.is_primary && (
                                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-amber-500" />
                                                <span>PIC Utama</span>
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <label className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="primary_pic_radio"
                                                checked={pic.is_primary}
                                                onChange={() => handlePicChange(idx, 'is_primary', true)}
                                                className="w-3.5 h-3.5 text-blue-600"
                                            />
                                            <span className="font-semibold text-[11px]">Jadikan PIC Utama</span>
                                        </label>

                                        {form.pics.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemovePic(idx)}
                                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 rounded transition-colors"
                                                title="Hapus PIC ini"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                                    <div>
                                        <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Nama Lengkap PIC</label>
                                        <input
                                            type="text"
                                            value={pic.name}
                                            onChange={(e) => handlePicChange(idx, 'name', e.target.value)}
                                            placeholder="ex: Bpk. Budi Santoso"
                                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-semibold"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Jabatan / Posisi</label>
                                        <input
                                            type="text"
                                            value={pic.position}
                                            onChange={(e) => handlePicChange(idx, 'position', e.target.value)}
                                            placeholder="ex: Manager IT / Purchasing"
                                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Email PIC</label>
                                        <input
                                            type="email"
                                            value={pic.email}
                                            onChange={(e) => handlePicChange(idx, 'email', e.target.value)}
                                            placeholder="budi@majutech.co.id"
                                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">No. Handphone / WA</label>
                                        <input
                                            type="text"
                                            value={pic.phone}
                                            onChange={(e) => handlePicChange(idx, 'phone', e.target.value)}
                                            placeholder="081234567890"
                                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <Link
                        to="/clients"
                        className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all"
                    >
                        {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{isEdit ? 'Simpan Perubahan Klien' : 'Simpan Klien Baru'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
