import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Mail, Phone, ArrowRight, RefreshCw, Sun, Moon, CheckCircle2, ShieldCheck } from 'lucide-react';
import api from '../api/axios';

export default function Register() {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            const res = await api.post('/auth/register', formData);

            setSuccessMessage('Registrasi berhasil! Mengalihkan ke dashboard setup...');
            const { access_token, user } = res.data.data;
            if (access_token) {
                localStorage.setItem('mbs_token', access_token);
                localStorage.setItem('mbs_user', JSON.stringify(user));
            }

            setTimeout(() => {
                window.location.href = '/';
            }, 1200);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mendaftar. Periksa kembali email dan nomor HP Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex items-center justify-center p-4 font-sans text-slate-900 dark:text-slate-100 selection:bg-emerald-600 selection:text-white transition-colors duration-200 py-12">
            <div className="w-full max-w-md space-y-6">
                {/* Brand Header */}
                <div className="text-center space-y-2 relative">
                    <button
                        onClick={toggleTheme}
                        className="absolute right-0 top-0 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                        title="Ganti Mode Tampilan (Light / Dark)"
                    >
                        {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                    </button>

                    <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-600 font-black text-white text-xl shadow-lg shadow-emerald-500/20">
                        🕌
                    </Link>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Daftar <span className="text-emerald-600 dark:text-emerald-400">Masjidku</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Cukup isi Nama, Email & No. HP untuk langsung masuk ke sistem.
                    </p>
                </div>

                {/* Register Card */}
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-xl space-y-5">
                    {error && (
                        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                                Nama Lengkap Pengurus
                            </label>
                            <div className="relative">
                                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Contoh: H. Ahmad Dahlan"
                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                                Nomor WhatsApp / HP
                            </label>
                            <div className="relative">
                                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="08123456789"
                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                                Alamat Email
                            </label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="email@masjid.id"
                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Memproses Pendaftaran...</span>
                                </>
                            ) : (
                                <>
                                    <span>Daftar & Langsung Masuk</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Sudah memiliki akun pengurus?{' '}
                            <Link to="/login" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                                Masuk di sini
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
