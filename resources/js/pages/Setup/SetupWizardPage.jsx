import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { 
    ArrowLeft, ArrowRight, Check, CheckCircle2, ShieldCheck, 
    Upload, Building, Globe, Palette, FileText, CheckSquare, 
    Sparkles, RefreshCw, AlertCircle
} from 'lucide-react';

export default function SetupWizardPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [currentStep, setCurrentStep] = useState(1);
    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [checkingDomain, setCheckingDomain] = useState(false);
    const [domainAvailable, setDomainAvailable] = useState(null);

    // Form State for 7 Setup Steps
    const [formData, setFormData] = useState({
        masjid_slug: '',
        active_theme_id: 1,
        masjid_name: '',
        email: '',
        address: '',
        phone: '',
        description: '',
        province: '',
        city: '',
        district: '',
        village: '',
        postal_code: '',
        agreed_terms: false,
        package_plan: 'free',
    });

    const [skFile, setSkFile] = useState(null);
    const [wakafFile, setWakafFile] = useState(null);
    const [themesList, setThemesList] = useState([]);

    // Fetch existing masjid data on mount
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoadingData(true);
            try {
                const [themesRes, masjidRes] = await Promise.all([
                    api.get('/tenant/themes'),
                    api.get('/tenant/masjid')
                ]);

                setThemesList(themesRes.data.data || []);

                const m = masjidRes.data.data;
                if (m) {
                    setFormData(prev => ({
                        ...prev,
                        masjid_slug: m.slug || '',
                        active_theme_id: m.active_theme_id || m.active_theme?.id || 1,
                        masjid_name: m.name || '',
                        email: m.email || user?.email || '',
                        address: m.address || '',
                        phone: m.phone || user?.phone || '',
                        city: m.city || '',
                        province: m.province || '',
                        postal_code: m.postal_code || '',
                        description: m.info?.description || '',
                    }));
                }
            } catch (err) {
                console.error('Failed to load initial setup data', err);
            } finally {
                setLoadingData(false);
            }
        };

        fetchInitialData();
    }, [user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCheckDomain = async () => {
        if (!formData.masjid_slug) {
            alert('Harap isi nama domain yang ingin diperiksa.');
            return;
        }
        setCheckingDomain(true);
        setDomainAvailable(null);

        try {
            const res = await api.get(`/public/masjid/${formData.masjid_slug}?preview=1`);
            if (res.data?.data?.masjid && res.data.data.masjid.id !== user?.masjid?.id) {
                setDomainAvailable(false);
            } else {
                setDomainAvailable(true);
            }
        } catch (err) {
            setDomainAvailable(true);
        } finally {
            setCheckingDomain(false);
        }
    };

    const saveCurrentStepData = async () => {
        setSubmitting(true);
        try {
            // Send FormData via POST (compatible with multipart in Laravel)
            const data = new FormData();
            if (formData.masjid_name) data.append('name', formData.masjid_name);
            if (formData.masjid_slug) data.append('slug', formData.masjid_slug);
            if (formData.address) data.append('address', formData.address);
            if (formData.city) data.append('city', formData.city);
            if (formData.province) data.append('province', formData.province);
            if (formData.postal_code) data.append('postal_code', formData.postal_code);
            if (formData.phone) data.append('phone', formData.phone);
            if (formData.email) data.append('email', formData.email);

            if (skFile) {
                data.append('verification_document', skFile);
            }

            // Save basic profile
            await api.post('/tenant/masjid', data);

            // Save detailed info
            await api.post('/tenant/masjid/info', {
                description: formData.description || `Selamat datang di official website ${formData.masjid_name || 'Masjid'}`,
            });

            // Save selected theme
            if (formData.active_theme_id) {
                await api.post('/tenant/themes/select', {
                    theme_id: formData.active_theme_id
                });
            }
        } catch (err) {
            console.error('Save step failed:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleNextStep = async () => {
        if (currentStep === 1) {
            if (!formData.masjid_slug) {
                alert('Harap isi nama domain terlebih dahulu.');
                return;
            }
            await saveCurrentStepData();
        } else if (currentStep === 2) {
            await saveCurrentStepData();
        } else if (currentStep === 3) {
            if (!formData.masjid_name || !formData.email || !formData.address) {
                alert('Harap isi Nama Masjid, Email, dan Alamat Lengkap.');
                return;
            }
            await saveCurrentStepData();
        } else if (currentStep === 4) {
            await saveCurrentStepData();
        } else if (currentStep === 5) {
            if (!formData.agreed_terms) {
                alert('Anda harus menyetujui Syarat & Ketentuan untuk melanjutkan.');
                return;
            }
        } else if (currentStep === 6) {
            await saveCurrentStepData();
            setCurrentStep(7);
            return;
        }

        setCurrentStep(prev => Math.min(prev + 1, 7));
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const steps = [
        { id: 1, label: 'Nama Domain' },
        { id: 2, label: 'Template' },
        { id: 3, label: 'Info Masjid' },
        { id: 4, label: 'Verifikasi' },
        { id: 5, label: 'Ketentuan' },
        { id: 6, label: 'Pilih Paket' },
        { id: 7, label: 'Selesai' },
    ];

    if (loadingData) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6">
                <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
                <span className="text-sm font-semibold text-slate-400">Memuat data setup masjid Anda...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-[#070a12] text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-600 selection:text-white">
            
            {/* Header */}
            <header className="bg-[#064e3b] text-white px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-md">
                <div className="flex items-center space-x-3">
                    <Link to="/" className="px-3 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-xs font-semibold text-white flex items-center space-x-1.5 transition">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Kembali</span>
                    </Link>
                    <div className="flex items-center space-x-2 border-l border-emerald-700/60 pl-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-lg">🕌</div>
                        <div>
                            <h1 className="font-extrabold text-sm tracking-tight text-white leading-none">MasjidKu</h1>
                            <span className="text-[9px] font-bold tracking-widest uppercase text-emerald-300">SETUP WEBSITE</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-200">
                    <span>{user?.name || 'PENGURUS'}</span>
                    <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-black flex items-center justify-center text-xs border border-emerald-600">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'F'}
                    </div>
                </div>
            </header>

            {/* Stepper Progress Bar */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm py-4 px-4 overflow-x-auto">
                <div className="max-w-4xl mx-auto flex items-center justify-between min-w-[650px]">
                    {steps.map((s) => {
                        const isDone = currentStep > s.id;
                        const isCurrent = currentStep === s.id;
                        return (
                            <div key={s.id} className="flex items-center space-x-2">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                    isDone
                                        ? 'bg-amber-500 text-white'
                                        : isCurrent
                                            ? 'bg-emerald-700 text-white ring-4 ring-emerald-500/20'
                                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                                }`}>
                                    {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : s.id}
                                </div>
                                <span className={`text-xs font-bold whitespace-nowrap ${
                                    isCurrent ? 'text-emerald-800 dark:text-emerald-400 border-b-2 border-emerald-600 pb-0.5' : isDone ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'
                                }`}>
                                    {s.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Step Card Container */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">

                    {/* STEP 1: Nama Domain */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tentukan Nama Domain Website</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Domain ini akan menjadi alamat publik website masjid Anda dan tidak dapat diubah setelah terdaftar.
                                </p>
                            </div>

                            <div className="space-y-3 pt-2">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Nama Domain <span className="text-rose-500">*</span>
                                </label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        name="masjid_slug"
                                        value={formData.masjid_slug}
                                        onChange={handleChange}
                                        placeholder="nama-masjid-anda"
                                        className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                                    />
                                    <div className="px-4 py-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 rounded-xl font-mono text-xs font-bold flex items-center space-x-1.5">
                                        <Globe className="w-3.5 h-3.5" />
                                        <span>.masjidku.id</span>
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    Gunakan huruf kecil, angka, dan tanda hubung (-). Contoh: <code className="text-emerald-600 dark:text-emerald-400">masjid-al-furqon</code>
                                </p>

                                {domainAvailable !== null && (
                                    <div className={`p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
                                        domainAvailable 
                                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                                            : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                    }`}>
                                        {domainAvailable ? (
                                            <>
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>Domain <strong>{formData.masjid_slug}.masjidku.id</strong> tersedia!</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="w-4 h-4" />
                                                <span>Domain sudah digunakan oleh masjid lain. Silakan pilih nama lain.</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center space-x-3 pt-4">
                                <button
                                    onClick={handleCheckDomain}
                                    disabled={checkingDomain}
                                    className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition"
                                >
                                    {checkingDomain ? 'Memeriksa...' : 'Cek Ketersediaan'}
                                </button>
                                <button
                                    onClick={handleNextStep}
                                    disabled={submitting}
                                    className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-700/20 flex items-center space-x-2 transition"
                                >
                                    <span>Lanjutkan</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Template Desain */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pilih Template Desain</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Pilih tampilan visual untuk website masjid Anda. Template bisa diganti kapan saja dari dashboard.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                <div 
                                    onClick={() => setFormData({ ...formData, active_theme_id: 1 })}
                                    className={`rounded-2xl border p-4 cursor-pointer transition-all space-y-3 ${
                                        formData.active_theme_id === 1
                                            ? 'border-emerald-600 bg-emerald-500/5 ring-2 ring-emerald-500/20'
                                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                                    }`}
                                >
                                    <div className="h-36 rounded-xl bg-emerald-900/30 flex items-center justify-center font-bold text-emerald-500 text-xs relative">
                                        Preview Zamrud Harmoni
                                        {formData.active_theme_id === 1 && (
                                            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-[10px]">
                                                Dipilih
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Zamrud Harmoni</h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Nuansa hijau alami dengan aksen emas. Kesan bersih dan elegan.</p>
                                </div>

                                <div 
                                    onClick={() => setFormData({ ...formData, active_theme_id: 2 })}
                                    className={`rounded-2xl border p-4 cursor-pointer transition-all space-y-3 ${
                                        formData.active_theme_id === 2
                                            ? 'border-emerald-600 bg-emerald-500/5 ring-2 ring-emerald-500/20'
                                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                                    }`}
                                >
                                    <div className="h-36 rounded-xl bg-blue-900/30 flex items-center justify-center font-bold text-blue-400 text-xs relative">
                                        Preview Biru Andalusia
                                        {formData.active_theme_id === 2 && (
                                            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-[10px]">
                                                Dipilih
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Biru Andalusia</h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Biru safir elegan dengan sentuhan perak. Tampilan profesional.</p>
                                </div>

                                <div 
                                    className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 opacity-60 space-y-3 relative"
                                >
                                    <div className="h-36 rounded-xl bg-amber-900/30 flex items-center justify-center font-bold text-amber-400 text-xs">
                                        Pesona Hijaz (Segera Hadir)
                                    </div>
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Pesona Hijaz</h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Nuansa pasir hangat dengan ornamen kaligrafi.</p>
                                </div>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button onClick={handlePrevStep} className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs">
                                    Kembali
                                </button>
                                <button onClick={handleNextStep} disabled={submitting} className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md flex items-center space-x-2">
                                    <span>Lanjutkan</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Info Masjid */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Informasi Umum Masjid</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Lengkapi data profil masjid Anda. Informasi ini akan ditampilkan di website publik.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Masjid <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        name="masjid_name"
                                        required
                                        value={formData.masjid_name}
                                        onChange={handleChange}
                                        placeholder="Contoh: Masjid Al-Furqon"
                                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Masjid <span className="text-rose-500">*</span></label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="contact@furqon.com"
                                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Lengkap <span className="text-rose-500">*</span></label>
                                    <textarea
                                        name="address"
                                        rows="2"
                                        required
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Jalan, No. Bangunan, RT/RW..."
                                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">No. Telepon / HP</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="08123456789"
                                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kota / Kabupaten</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="Jakarta Selatan"
                                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Singkat (Opsional)</label>
                                    <textarea
                                        name="description"
                                        rows="2"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Ceritakan singkat tentang sejarah atau profil masjid ini..."
                                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button onClick={handlePrevStep} className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs">
                                    Kembali
                                </button>
                                <button onClick={handleNextStep} disabled={submitting} className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md flex items-center space-x-2">
                                    <span>Lanjutkan</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Verifikasi Berkas */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verifikasi Berkas</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Unggah dokumen resmi untuk memverifikasi keaslian kepengurusan masjid Anda.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs space-y-1">
                                <p className="font-bold">Ketentuan Berkas:</p>
                                <p className="text-[11px]">SK Kepengurusan bersifat <strong>wajib</strong>, sedangkan Akta Wakaf / IMB / Surat Keterangan bersifat <strong>opsional</strong>. Format: PDF, JPG, PNG (maks. 5MB).</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
                                    <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Akta Wakaf / IMB / Surat Keterangan</div>
                                    <input type="file" onChange={(e) => setWakafFile(e.target.files[0])} className="text-xs text-slate-500" />
                                </div>

                                <div className="p-6 rounded-2xl border-2 border-dashed border-emerald-500/50 bg-emerald-500/5 text-center space-y-3">
                                    <Upload className="w-8 h-8 text-emerald-600 mx-auto" />
                                    <div className="text-xs font-bold text-slate-900 dark:text-white">SK Kepengurusan *</div>
                                    <input type="file" onChange={(e) => setSkFile(e.target.files[0])} className="text-xs text-slate-500" />
                                </div>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button onClick={handlePrevStep} className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs">
                                    Kembali
                                </button>
                                <button onClick={handleNextStep} disabled={submitting} className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md flex items-center space-x-2">
                                    <span>Lanjutkan</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: Syarat & Ketentuan */}
                    {currentStep === 5 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Syarat & Ketentuan</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Baca dan setujui syarat ketentuan sebelum website Anda diaktifkan.
                                </p>
                            </div>

                            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs text-slate-600 dark:text-slate-300 max-h-60 overflow-y-auto">
                                <ol className="list-decimal list-inside space-y-2">
                                    <li>Pendaftar adalah pengurus resmi masjid/mushollah.</li>
                                    <li>Data yang diberikan adalah benar dan dapat dipertanggungjawabkan.</li>
                                    <li>Website tidak boleh digunakan untuk kegiatan yang melanggar hukum atau bertentangan dengan nilai-nilai Islam.</li>
                                    <li>Platform berhak menonaktifkan website jika ditemukan pelanggaran setelah verifikasi.</li>
                                    <li>Pengurus masjid bertanggung jawab atas konten yang dipublikasikan.</li>
                                </ol>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                <label className="flex items-center space-x-3 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    <input
                                        type="checkbox"
                                        name="agreed_terms"
                                        checked={formData.agreed_terms}
                                        onChange={handleChange}
                                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                                    />
                                    <span>Saya menyetujui seluruh Syarat & Ketentuan yang berlaku di atas</span>
                                </label>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button onClick={handlePrevStep} className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs">
                                    Kembali
                                </button>
                                <button onClick={handleNextStep} disabled={submitting} className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md flex items-center space-x-2">
                                    <span>Lanjutkan</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 6: Pilih Paket */}
                    {currentStep === 6 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pilih Paket Layanan</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Pilih paket langganan yang sesuai dengan kebutuhan masjid Anda.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <div 
                                    onClick={() => setFormData({ ...formData, package_plan: 'free' })}
                                    className={`p-6 rounded-2xl border cursor-pointer space-y-4 ${
                                        formData.package_plan === 'free'
                                            ? 'border-emerald-600 bg-emerald-500/5 ring-2 ring-emerald-500/20'
                                            : 'border-slate-200 dark:border-slate-800'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-base text-slate-900 dark:text-white">Paket Gratis</h3>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">SELAMANYA</span>
                                    </div>
                                    <div className="text-2xl font-black text-slate-900 dark:text-white">Rp 0</div>
                                    <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
                                        <li>✓ Subdomain <code>masjidku.id/m/slug</code></li>
                                        <li>✓ Donasi QRIS Direct</li>
                                        <li>✓ Berita & Update Kajian</li>
                                    </ul>
                                </div>

                                <div 
                                    onClick={() => setFormData({ ...formData, package_plan: 'pro' })}
                                    className={`p-6 rounded-2xl border cursor-pointer space-y-4 ${
                                        formData.package_plan === 'pro'
                                            ? 'border-emerald-600 bg-emerald-500/5 ring-2 ring-emerald-500/20'
                                            : 'border-slate-200 dark:border-slate-800'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-base text-slate-900 dark:text-white">Paket Professional</h3>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600">PRO</span>
                                    </div>
                                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">Rp 99.000 <span className="text-xs text-slate-400 font-normal">/bulan</span></div>
                                    <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
                                        <li>✓ Support Custom Domain (<code>masjidalikhlas.com</code>)</li>
                                        <li>✓ Seluruh Tema Premium</li>
                                        <li>✓ Prioritas Verifikasi Fast-Track</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button onClick={handlePrevStep} className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs">
                                    Kembali
                                </button>
                                <button 
                                    onClick={handleNextStep}
                                    disabled={submitting}
                                    className="px-8 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg flex items-center space-x-2"
                                >
                                    {submitting ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            <span>Menyimpan Setup...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Selesaikan Setup</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 7: Selesai */}
                    {currentStep === 7 && (
                        <div className="text-center py-10 space-y-6">
                            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-xl">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>

                            <div className="space-y-2 max-w-md mx-auto">
                                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">🎉 Setup Website Berhasil Diselesaikan!</h2>
                                {user?.masjid?.verification_status === 'approved' ? (
                                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                                        <span>Status: ✅ Telah Disetujui &amp; Aktif</span>
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs">
                                        <span>Status: ⏳ Menunggu Verifikasi Tim Admin</span>
                                    </div>
                                )}
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                                    {user?.masjid?.verification_status === 'approved'
                                        ? 'Selamat! Website masjid Anda telah disetujui oleh admin Masjidku dan dapat diakses publik oleh seluruh jamaah.'
                                        : 'Pengaturan domain, template, dan dokumen verifikasi Anda telah tersimpan dengan aman. Anda dapat melakukan pratinjau tampilan website publik Anda sekarang juga.'}
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-md mx-auto text-left text-xs space-y-2">
                                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                                    <span className="text-slate-500">Nama Domain Website:</span>
                                    <strong className="font-mono text-emerald-600 dark:text-emerald-400">{formData.masjid_slug || 'masjid'}.masjidku.id</strong>
                                </div>
                                <div className="flex justify-between pt-1">
                                    <span className="text-slate-500">Status Publik:</span>
                                    {user?.masjid?.verification_status === 'approved' ? (
                                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                                            🟢 Website Live (Aktif)
                                        </span>
                                    ) : (
                                        <span className="text-amber-500 font-bold flex items-center gap-1">
                                            ⏳ Menunggu Approve Admin
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2 max-w-md mx-auto flex flex-col sm:flex-row items-center justify-center gap-3">
                                <a
                                    href={`/m/${formData.masjid_slug || 'alikhlas'}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full sm:w-1/2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center justify-center space-x-2"
                                >
                                    <Globe className="w-4 h-4" />
                                    <span>Pratinjau Website</span>
                                </a>
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full sm:w-1/2 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center space-x-2"
                                >
                                    <span>Ke Dashboard</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
