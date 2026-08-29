import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Lock, Mail, ArrowRight, Shield, RefreshCw, Sun, Moon } from 'lucide-react';

export default function Login() {
    const { login } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [email, setEmail] = useState('admin@masjidku.com');
    const [password, setPassword] = useState('password123');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal login. Periksa email dan kata sandi Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex items-center justify-center p-4 font-sans text-slate-900 dark:text-slate-100 selection:bg-emerald-600 selection:text-white transition-colors duration-200">
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

                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-600 font-black text-white text-xl shadow-lg shadow-emerald-500/20">
                        🕌
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                        MASJID<span className="text-emerald-600 dark:text-emerald-400">KU</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Platform SaaS Website Masjid / Mushollah
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-xl">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Masuk ke Akun Platform</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Masukkan email dan kata sandi pengurus / admin platform.</p>

                    {error && (
                        <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                                Alamat Email
                            </label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@masjidku.com"
                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                                Kata Sandi
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Memproses Login...</span>
                                </>
                            ) : (
                                <>
                                    <span>Masuk ke Dashboard</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Quick Info Footer */}
                    <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center space-x-1.5">
                            <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Sanctum Token Secured</span>
                        </div>
                        <span className="font-mono text-[10px]">v1.0 SaaS</span>
                    </div>
                </div>

                <p className="text-center text-[11px] text-slate-500 dark:text-slate-400">
                    &copy; 2026 Masjidku Platform.
                </p>
            </div>
        </div>
    );
}
