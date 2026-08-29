import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
    CheckCircle2, AlertTriangle, ShieldCheck, Server, Building, Key, 
    Database, Sparkles, Layers, ArrowRight, ArrowLeft, RefreshCw, Lock, 
    Clock, Check, Box, FileText, Users, DollarSign, ChevronRight
} from 'lucide-react';

export default function SetupWizardPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loadingRequirements, setLoadingRequirements] = useState(true);
    const [requirements, setRequirements] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [installed, setInstalled] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        company_name: 'PT Mikrotek Zemiro Indonesia',
        company_email: 'admin@mikrotek.co.id',
        company_phone: '021-5550192',
        company_address: 'Jl. TB Simatupang No. 88, Jakarta Selatan',
        timezone: 'Asia/Jakarta',
        currency_code: 'IDR',
        currency_symbol: 'Rp',

        admin_name: 'Super Administrator',
        admin_email: 'admin@mikrotek.co.id',
        admin_password: '',
        admin_password_confirmation: '',

        data_mode: 'minimal', // 'empty', 'minimal', 'sample'
    });

    const [agreed, setAgreed] = useState(false);

    const fetchRequirements = async () => {
        setLoadingRequirements(true);
        try {
            const res = await api.get('/setup/status');
            setRequirements(res.data.data);
            if (res.data.data?.is_installed) {
                setInstalled(true);
            }
        } catch (err) {
            console.error('Error fetching setup requirements:', err);
        } finally {
            setLoadingRequirements(false);
        }
    };

    useEffect(() => {
        fetchRequirements();
    }, []);

    const handleNextStep = () => {
        if (currentStep === 2) {
            if (!formData.company_name || !formData.company_email || !formData.admin_name || !formData.admin_email || !formData.admin_password) {
                alert('Harap lengkapi semua bidang wajib (Nama Perusahaan, Email Perusahaan, Nama Admin, Email Admin, & Password).');
                return;
            }
            if (formData.admin_password.length < 8) {
                alert('Password admin minimal 8 karakter.');
                return;
            }
            if (formData.admin_password !== formData.admin_password_confirmation) {
                alert('Konfirmasi password tidak cocok dengan password admin.');
                return;
            }
        }
        setCurrentStep(prev => Math.min(prev + 1, 5));
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleRunSetup = async () => {
        setSubmitting(true);
        try {
            const res = await api.post('/setup/run', formData);
            setInstalled(true);
            setCurrentStep(5);
        } catch (err) {
            alert('Gagal menjalankan instalasi: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingRequirements) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                <span className="text-sm font-semibold text-slate-400">Memeriksa kelayakan server &amp; status instalasi...</span>
            </div>
        );
    }

    if (installed && currentStep !== 5) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 text-center">
                <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                        <Lock className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">Wizard Instalasi Terkunci</h2>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                            Sistem Mikrotek Business Suite Neo telah selesai diinstal dan terkunci demi keamanan. Halaman setup tidak dapat diakses kembali.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center space-x-2"
                    >
                        <span>Masuk ke Halaman Login</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto w-full space-y-8">
                {/* Brand Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>MBS NEO INSTALLATION WIZARD</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                        Mikrotek Business Suite Neo
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
                        Panduan instalasi awal &amp; inisialisasi basis data sistem manajemen perusahaan ERP/CRM enterprise.
                    </p>
                </div>

                {/* Stepper Bar */}
                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-xl">
                    <div className="flex justify-between items-center max-w-2xl mx-auto relative">
                        {[
                            { step: 1, label: 'Persyaratan' },
                            { step: 2, label: 'Profil & Admin' },
                            { step: 3, label: 'Opsi Data' },
                            { step: 4, label: 'Konfirmasi' },
                            { step: 5, label: 'Selesai' },
                        ].map((s) => {
                            const isDone = currentStep > s.step;
                            const isCurrent = currentStep === s.step;
                            return (
                                <div key={s.step} className="flex flex-col items-center relative z-10">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                                        isDone
                                            ? 'bg-emerald-500 text-slate-950 font-extrabold'
                                            : isCurrent
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 font-extrabold ring-4 ring-blue-500/20'
                                                : 'bg-slate-800 text-slate-500 border border-slate-700'
                                    }`}>
                                        {isDone ? <Check className="w-5 h-5 stroke-[3]" /> : s.step}
                                    </div>
                                    <span className={`text-[11px] font-bold mt-1.5 hidden sm:block ${
                                        isCurrent ? 'text-blue-400' : isDone ? 'text-emerald-400' : 'text-slate-500'
                                    }`}>
                                        {s.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Card Content */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                    {/* STEP 1: System Requirements Check */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Server className="w-5 h-5 text-blue-400" />
                                    <span>Langkah 1: Pemeriksaan Kelayakan Server &amp; Lingkungan</span>
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    Memastikan PHP, ekstensi, hak akses direktori, dan koneksi basis data server Anda siap digunakan.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                {/* PHP Version Card */}
                                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-slate-300">Versi PHP Server</span>
                                        {requirements?.php?.satisfied ? (
                                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 text-[10px]">Pass</span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20 text-[10px]">Fail</span>
                                        )}
                                    </div>
                                    <div className="text-slate-400 font-mono text-[11px]">
                                        Versi: <strong className="text-white">{requirements?.php?.version}</strong> (Minimal {requirements?.php?.min_required})
                                    </div>
                                </div>

                                {/* Database Connection Card */}
                                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-slate-300">Koneksi Database PDO</span>
                                        {requirements?.database?.connected ? (
                                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 text-[10px]">Connected</span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20 text-[10px]">Disconnected</span>
                                        )}
                                    </div>
                                    <div className="text-slate-400 font-mono text-[11px] truncate">
                                        Status: <strong className="text-white">{requirements?.database?.connected ? 'Terhubung dengan Baik' : requirements?.database?.error || 'Gagal terhubung'}</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Required Extensions */}
                            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                                <h4 className="font-bold text-xs text-slate-200">Ekstensi PHP Wajib</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                                    {Object.entries(requirements?.extensions || {}).map(([ext, pass]) => (
                                        <div key={ext} className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                                            <span className="font-mono text-slate-300">{ext}</span>
                                            {pass ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Permissions */}
                            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                                <h4 className="font-bold text-xs text-slate-200">Hak Akses Direktori (Writable Permissions)</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                                        <span className="text-slate-300">storage/</span>
                                        {requirements?.permissions?.storage_writable ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                                    </div>
                                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                                        <span className="text-slate-300">bootstrap/cache/</span>
                                        {requirements?.permissions?.bootstrap_cache_writable ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                                    </div>
                                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                                        <span className="text-slate-300">.env File</span>
                                        {requirements?.permissions?.env_writable ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleNextStep}
                                    disabled={!requirements?.can_proceed}
                                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center space-x-2 transition-all"
                                >
                                    <span>Lanjut ke Langkah 2: Profil &amp; Admin</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Company Profile & Superadmin Credentials */}
                    {currentStep === 2 && (
                        <div className="space-y-6 text-xs">
                            <div>
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Building className="w-5 h-5 text-blue-400" />
                                    <span>Langkah 2: Profil Perusahaan &amp; Akun Superadmin</span>
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    Isi data identitas bisnis utama dan kredensial akun administrator pertama Anda.
                                </p>
                            </div>

                            {/* Section: Company Profile */}
                            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                                <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                                    <Building className="w-4 h-4 text-blue-400" />
                                    <span>Identitas Perusahaan</span>
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-bold text-slate-300 mb-1">Nama Perusahaan *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.company_name}
                                            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 font-semibold text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-300 mb-1">Email Perusahaan *</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.company_email}
                                            onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
                                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 font-semibold text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-300 mb-1">Telepon</label>
                                        <input
                                            type="text"
                                            value={formData.company_phone}
                                            onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 font-semibold text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-300 mb-1">Zona Waktu Perusahaan</label>
                                        <select
                                            value={formData.timezone}
                                            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 font-semibold text-xs"
                                        >
                                            <option value="Asia/Jakarta">WIB — Asia/Jakarta (UTC+7)</option>
                                            <option value="Asia/Makassar">WITA — Asia/Makassar (UTC+8)</option>
                                            <option value="Asia/Jayapura">WIT — Asia/Jayapura (UTC+9)</option>
                                            <option value="Asia/Singapore">SGT — Asia/Singapore (UTC+8)</option>
                                            <option value="UTC">UTC — GMT (UTC+0)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-300 mb-1">Alamat Perusahaan</label>
                                    <textarea
                                        rows="2"
                                        value={formData.company_address}
                                        onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
                                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 font-semibold text-xs"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Section: Superadmin Account */}
                            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                                <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                                    <Key className="w-4 h-4 text-blue-400" />
                                    <span>Akun Akun Super Administrator</span>
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-bold text-slate-300 mb-1">Nama Lengkap Admin *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.admin_name}
                                            onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 font-semibold text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-300 mb-1">Email Login Admin *</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.admin_email}
                                            onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 font-semibold text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-300 mb-1">Password Admin * (Min 8 Karakter)</label>
                                        <input
                                            type="password"
                                            required
                                            value={formData.admin_password}
                                            onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 font-semibold text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-300 mb-1">Konfirmasi Password *</label>
                                        <input
                                            type="password"
                                            required
                                            value={formData.admin_password_confirmation}
                                            onChange={(e) => setFormData({ ...formData, admin_password_confirmation: e.target.value })}
                                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 font-semibold text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button
                                    onClick={handlePrevStep}
                                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center space-x-1.5 transition-all"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span>Kembali</span>
                                </button>
                                <button
                                    onClick={handleNextStep}
                                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center space-x-2 transition-all"
                                >
                                    <span>Lanjut ke Langkah 3: Mode Data</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Data Initialization Options */}
                    {currentStep === 3 && (
                        <div className="space-y-6 text-xs">
                            <div>
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Database className="w-5 h-5 text-blue-400" />
                                    <span>Langkah 3: Opsi Inisialisasi Basis Data</span>
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    Pilih opsi penyemaian data awal sesuai kebutuhan lingkungan penginstalan Anda.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Option 1: Data Kosong */}
                                <div
                                    onClick={() => setFormData({ ...formData, data_mode: 'empty' })}
                                    className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 flex flex-col justify-between ${
                                        formData.data_mode === 'empty'
                                            ? 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30'
                                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                    }`}
                                >
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300">
                                                <Box className="w-5 h-5" />
                                            </div>
                                            {formData.data_mode === 'empty' && (
                                                <span className="px-2 py-0.5 rounded-full bg-blue-500 text-slate-950 font-extrabold text-[10px]">Terpilih</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-white">1. Data Kosong</h3>
                                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                                Hanya membuat akun Superadmin &amp; profil perusahaan. Tanpa master data atau sample data.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
                                        Cocok untuk: Production Baru
                                    </div>
                                </div>

                                {/* Option 2: Data Minimal */}
                                <div
                                    onClick={() => setFormData({ ...formData, data_mode: 'minimal' })}
                                    className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 flex flex-col justify-between ${
                                        formData.data_mode === 'minimal'
                                            ? 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30'
                                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                    }`}
                                >
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                <Layers className="w-5 h-5" />
                                            </div>
                                            {formData.data_mode === 'minimal' && (
                                                <span className="px-2 py-0.5 rounded-full bg-blue-500 text-slate-950 font-extrabold text-[10px]">Terpilih</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-white">2. Data Minimal</h3>
                                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                                Termasuk akun Admin, master Departemen, Jabatan, Status Kerja, Tarif Pajak (PPN 11%), &amp; Metode Pembayaran.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-slate-800/80 text-[10px] text-indigo-400 font-mono font-bold">
                                        Rekomendasi Siap Pakai
                                    </div>
                                </div>

                                {/* Option 3: Import Data Sample */}
                                <div
                                    onClick={() => setFormData({ ...formData, data_mode: 'sample' })}
                                    className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 flex flex-col justify-between ${
                                        formData.data_mode === 'sample'
                                            ? 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30'
                                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                    }`}
                                >
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                <Sparkles className="w-5 h-5" />
                                            </div>
                                            {formData.data_mode === 'sample' && (
                                                <span className="px-2 py-0.5 rounded-full bg-blue-500 text-slate-950 font-extrabold text-[10px]">Terpilih</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-white">3. Import Data Sample</h3>
                                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                                Semua data minimal + sample Klien CRM, Produk IT, Proyek, Invoice, &amp; Karyawan untuk demonstrasi penuh.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-slate-800/80 text-[10px] text-emerald-400 font-mono">
                                        Cocok untuk: Testing &amp; Demo
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button
                                    onClick={handlePrevStep}
                                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center space-x-1.5 transition-all"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span>Kembali</span>
                                </button>
                                <button
                                    onClick={handleNextStep}
                                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center space-x-2 transition-all"
                                >
                                    <span>Lanjut ke Langkah 4: Konfirmasi</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Review Summary & Execution */}
                    {currentStep === 4 && (
                        <div className="space-y-6 text-xs">
                            <div>
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                                    <span>Langkah 4: Konfirmasi Ringkasan &amp; Eksekusi Instalasi</span>
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    Periksa kembali ringkasan konfigurasi sebelum memulai proses penginstalan.
                                </p>
                            </div>

                            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Perusahaan</span>
                                        <div className="text-sm font-bold text-white mt-0.5">{formData.company_name}</div>
                                        <div className="text-[11px] text-slate-400">{formData.company_email}</div>
                                    </div>

                                    <div>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Superadmin Login</span>
                                        <div className="text-sm font-bold text-white mt-0.5">{formData.admin_name}</div>
                                        <div className="text-[11px] text-slate-400">{formData.admin_email}</div>
                                    </div>

                                    <div>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Zona Waktu &amp; Mata Uang</span>
                                        <div className="text-xs font-mono text-slate-300 mt-0.5">{formData.timezone} ({formData.currency_symbol} - {formData.currency_code})</div>
                                    </div>

                                    <div>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Mode Inisialisasi Data</span>
                                        <div className="text-xs font-bold text-blue-400 mt-0.5 uppercase tracking-wide">
                                            {formData.data_mode === 'empty' ? '1. Data Kosong' : formData.data_mode === 'minimal' ? '2. Data Minimal (Default)' : '3. Import Data Sample (Full Demo)'}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-800">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={agreed}
                                            onChange={(e) => setAgreed(e.target.checked)}
                                            className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                        />
                                        <span className="text-slate-300 font-medium">Saya mengonfirmasi data konfigurasi di atas sudah benar dan siap untuk diproses.</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button
                                    onClick={handlePrevStep}
                                    disabled={submitting}
                                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-bold text-xs flex items-center space-x-1.5 transition-all"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span>Kembali</span>
                                </button>
                                <button
                                    onClick={handleRunSetup}
                                    disabled={!agreed || submitting}
                                    className="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all"
                                >
                                    {submitting ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            <span>Memproses Instalasi &amp; Database...</span>
                                        </>
                                    ) : (
                                        <>
                                            <RocketIcon className="w-4 h-4" />
                                            <span>Mulai Instalasi Sekarang</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: Installation Complete Celebration */}
                    {currentStep === 5 && (
                        <div className="text-center py-8 space-y-6">
                            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>

                            <div className="space-y-2 max-w-md mx-auto">
                                <h2 className="text-2xl font-extrabold text-white">🎉 Instalasi Berhasil Diselesaikan!</h2>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Basis data telah berhasil dikonfigurasi dan dikunci secara otomatis. Akun Superadmin Anda telah siap digunakan.
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto text-left text-xs space-y-2">
                                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                                    <span className="text-slate-400">Email Superadmin:</span>
                                    <strong className="text-white font-mono">{formData.admin_email}</strong>
                                </div>
                                <div className="flex justify-between pt-1">
                                    <span className="text-slate-400">Status Keamanan:</span>
                                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                                        <Lock className="w-3.5 h-3.5" /> Wizard Locked
                                    </span>
                                </div>
                            </div>

                            <div className="pt-4 max-w-xs mx-auto">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center space-x-2"
                                >
                                    <span>Masuk ke System (Login)</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function RocketIcon(props) {
    return (
        <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.41m5.96 5.96a14.926 14.926 0 01-5.84 2.58m0 0a14.926 14.926 0 01-2.58-5.84m0 0A14.98 14.98 0 0115.59 2.59a14.98 14.98 0 01-12.12 6.16m5.96 5.96l-3.18 3.18" />
        </svg>
    );
}
