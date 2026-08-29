import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Mail, Lock, Phone, Building, MapPin, FileText, ArrowRight, RefreshCw, Sun, Moon, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';

export default function Register() {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        masjid_name: '',
        masjid_slug: '',
        address: '',
        city: '',
        province: '',
    });
    const [documentFile, setDocumentFile] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setDocumentFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });

        if (documentFile) {
            data.append('verification_document', documentFile);
        }

        try {
            const res = await api.post('/auth/register', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSuccessMessage(res.data.message || 'Pendaftaran berhasil. Silakan tunggu verifikasi admin.');
            const { access_token, user } = res.data.data;
            if (access_token) {
                localStorage.setItem('mbs_token', access_token);
                localStorage.setItem('mbs_user', JSON.stringify(user));
            }

            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mendaftar. Periksa kembali kelengkapan data Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex items-center justify-center p-4 font-sans text-slate-900 dark:text-slate-100 selection:bg-emerald-600 selection:text-white transition-colors duration-200 py-12">
            <div className="w-full max-w-2xl space-y-6">
                {/* Brand Header */}
                <div className="text-center space-y-2 relative">
                    <button
                        onClick={toggleTheme}
                        className="absolute right-0 top-0 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                        title="Ganti Mode Tampilan (Light / Dark)"
                    >
                        {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                    </button>

                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-600 font-black text-white text-xl shadow-lg shadow-emerald-500/20">
                        🕌
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Pendaftaran Website <span className="text-emerald-600 dark:text-emerald-400">Masjidku</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Daftarkan masjid/mushollah Anda untuk mendapatkan website & sistem manajemen jamaah.
                    </p>
                </div>

                {/* Register Card */}
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-xl space-y-6">
                    {error && (
                        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center space-x-2">
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Section 1: Data Pengurus */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                                1. Data Pengurus / Admin Masjid
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                                    <div className="relative">
                                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Nama Pengurus"
                                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Email</label>
                                    <div className="relative">
                                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="email@masjid.id"
                                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">No. WhatsApp / HP</label>
                                    <div className="relative">
                                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="08123456789"
                                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Kata Sandi</label>
                                    <div className="relative">
                                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="password"
                                            name="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Minimal 8 karakter"
                                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Konfirmasi Kata Sandi</label>
                                    <div className="relative">
                                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="password"
                                            name="password_confirmation"
                                            required
                                            value={formData.password_confirmation}
                                            onChange={handleChange}
                                            placeholder="Ulangi kata sandi"
                                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Data Masjid & Subdomain */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                                2. Data Masjid / Mushollah
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Masjid / Mushollah</label>
                                    <div className="relative">
                                        <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            name="masjid_name"
                                            required
                                            value={formData.masjid_name}
                                            onChange={handleChange}
                                            placeholder="Contoh: Masjid Al-Ikhlas"
                                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Pilihan Subdomain / Path Gratis</label>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs text-slate-400 font-mono">masjidku.id/m/</span>
                                        <input
                                            type="text"
                                            name="masjid_slug"
                                            required
                                            value={formData.masjid_slug}
                                            onChange={handleChange}
                                            placeholder="alikhlas"
                                            className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">Gunakan huruf kecil dan tanda hubung tanpa spasi (misal: <code>al-ikhlas-jakarta</code>).</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Lengkap</label>
                                    <textarea
                                        name="address"
                                        rows="2"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Jl. Merdeka No. 45..."
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Kota / Kabupaten</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="Jakarta Selatan"
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Provinsi</label>
                                    <input
                                        type="text"
                                        name="province"
                                        value={formData.province}
                                        onChange={handleChange}
                                        placeholder="DKI Jakarta"
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Dokumen Verifikasi (SK Pengurus / Foto Masjid)</label>
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={handleFileChange}
                                        className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Mengajukan Pendaftaran...</span>
                                </>
                            ) : (
                                <>
                                    <span>Daftarkan Masjid Sekarang</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center pt-2">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Sudah memiliki akun pengurus?{' '}
                            <Link to="/login" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                                Masuk ke Halaman Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
