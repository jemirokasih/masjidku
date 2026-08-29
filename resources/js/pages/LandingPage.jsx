import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
    CheckCircle2, ArrowRight, ShieldCheck, Sparkles, HeartHandshake, 
    BookOpenCheck, Palette, Globe, Users, Sun, Moon, MapPin, Phone, 
    Star, LayoutDashboard, ChevronRight
} from 'lucide-react';

export default function LandingPage() {
    const { isAuthenticated, user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070a12] text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-600 selection:text-white transition-colors duration-200">
            
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-[#070a12]/80 border-b border-slate-200 dark:border-slate-800/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-2.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-500/20 font-black">
                            🕌
                        </div>
                        <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Masjid<span className="text-emerald-600 dark:text-emerald-400">Ku</span>
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <a href="#fitur" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Fitur Utama</a>
                        <a href="#cara-kerja" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Cara Kerja</a>
                        <a href="#tema" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Marketplace Tema</a>
                        <a href="#harga" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Harga</a>
                    </nav>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            title="Ganti Mode Tampilan"
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                        </button>

                        {isAuthenticated ? (
                            <Link
                                to="/"
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-md shadow-emerald-500/20 flex items-center space-x-2 transition-all"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                <span>Dashboard</span>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-md shadow-emerald-500/20 flex items-center space-x-1.5 transition-all"
                                >
                                    <span>Daftar Gratis</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
                    <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Platform SaaS Website Masjid & Musholla No. 1</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
                        Modernisasi Sistem Informasi & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">Digitalisasi Masjid Anda</span>
                    </h1>

                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Buat website resmi masjid profesional dalam waktu singkat. Lengkap dengan fitur Donasi & Infaq QRIS, Jadwal Kajian, Berita Agenda, serta Marketplace Tema.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                        <Link
                            to="/register"
                            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-bold text-sm text-white shadow-xl shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
                        >
                            <span>Buat Website Masjid Gratis</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <a
                            href="/m/alikhlas"
                            target="_blank"
                            rel="noreferrer"
                            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center space-x-2 transition-all"
                        >
                            <Globe className="w-4 h-4 text-emerald-600" />
                            <span>Lihat Demo Website</span>
                        </a>
                    </div>

                    {/* Quick Stats Banner */}
                    <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm">
                            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">100%</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Gratis Subdomain</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm">
                            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">QRIS</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Donasi Instant</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm">
                            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">&lt; 3 Menit</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Proses Registrasi</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm">
                            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">Aman</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verifikasi Admin</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="fitur" className="py-20 bg-white dark:bg-[#0b0f19] border-y border-slate-200 dark:border-slate-800/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Fitur Unggulan</h2>
                        <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                            Semua Kebutuhan Website Masjid dalam Satu Platform
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                            Dirancang khusus untuk memudahkan pengurus masjid mengelola informasi jamaah dan transparansi kegiatan.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#121827] border border-slate-200/80 dark:border-slate-800/80 space-y-4 hover:border-emerald-500/50 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <HeartHandshake className="w-6 h-6" />
                            </div>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">Donasi & Infaq QRIS Direct</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                Publikasikan program infaq, target dana, rekening bank BSI/Muamalat, serta kode QRIS langsung ke jamaah tanpa potongan biaya.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#121827] border border-slate-200/80 dark:border-slate-800/80 space-y-4 hover:border-emerald-500/50 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <BookOpenCheck className="w-6 h-6" />
                            </div>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">Jadwal Kajian & Agenda</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                Kelola pengumuman sholat jumat, pemateri ustadz, kajian subuh rutin, dan dokumentasi foto kegiatan masjid.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#121827] border border-slate-200/80 dark:border-slate-800/80 space-y-4 hover:border-emerald-500/50 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <Palette className="w-6 h-6" />
                            </div>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">Marketplace Tema Website</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                Pilih berbagai pilihan template menarik (Clean, Islamic Modern, Gold Premium) yang siap pakai sesuai identitas masjid Anda.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#121827] border border-slate-200/80 dark:border-slate-800/80 space-y-4 hover:border-emerald-500/50 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <Globe className="w-6 h-6" />
                            </div>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">Subdomain / Custom Domain</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                Dapatkan subdomain gratis <code>masjidku.id/m/nama-masjid</code> atau gunakan domain sendiri (misal: <code>masjidalikhlas.com</code>).
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#121827] border border-slate-200/80 dark:border-slate-800/80 space-y-4 hover:border-emerald-500/50 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">Verifikasi Keamanan Admin</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                Sistem verifikasi dokumen resmi pengurus untuk memastikan setiap website masjid terpercaya dan valid.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#121827] border border-slate-200/80 dark:border-slate-800/80 space-y-4 hover:border-emerald-500/50 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <Users className="w-6 h-6" />
                            </div>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">Kolaborasi Pengurus DKM</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                Multi-role pengurus (Ketua DKM, Bendahara, Sekretaris, Humas) untuk mengelola konten website bersama-sama.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Step Onboarding Section */}
            <section id="cara-kerja" className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Cara Kerja Mudah</h2>
                        <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                            3 Langkah Cepat Miliki Website Masjid
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-lg relative">
                            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                                1
                            </div>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">Daftar Akun Pengurus</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Cukup masukkan Nama, Nomor WhatsApp, dan Email Anda. Akun langsung aktif!
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-lg relative">
                            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                                2
                            </div>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">Lengkapi Data & Pilih Tema</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Isi alamat masjid, profil singkat, rekening donasi, dan pilih desain template kesukaan Anda.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-lg relative">
                            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                                3
                            </div>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">Verifikasi & Website Live</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Tim Admin Masjidku memverifikasi pendaftaran Anda. Website resmi masjid langsung online!
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Theme Marketplace Preview */}
            <section id="tema" className="py-20 bg-white dark:bg-[#0b0f19] border-t border-slate-200 dark:border-slate-800/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Marketplace Tema</h2>
                        <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                            Pilih Template Sesuai Selera Masjid Anda
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900">
                            <div className="h-44 bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400 text-xs">
                                Preview Default Clean
                            </div>
                            <div className="p-5 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Default Clean</h4>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">GRATIS</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Desain minimalis, fokus pada keterbacaan berita & jadwal ibadah.</p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900">
                            <div className="h-44 bg-emerald-900/30 flex items-center justify-center font-bold text-emerald-500 text-xs">
                                Preview Green Islamic Modern
                            </div>
                            <div className="p-5 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Green Islamic Modern</h4>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">POPULER</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Nuansa hijau islami segar dengan banner kajian & widget donasi menonjol.</p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900">
                            <div className="h-44 bg-amber-900/30 flex items-center justify-center font-bold text-amber-400 text-xs">
                                Preview Gold Premium Elegant
                            </div>
                            <div className="p-5 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Gold Premium Elegant</h4>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-bold">PREMIUM</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Desain mewah emas dengan integrasi live stream kajian & galeri foto.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="harga" className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Pilihan Paket</h2>
                        <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                            Transparan Tanpa Biaya Tersembunyi
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl relative">
                            <div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Paket Gratis (Starter)</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Cocok untuk masjid/mushollah yang baru memulai digitalisasi.</p>
                                <div className="pt-4 text-3xl font-black text-slate-900 dark:text-white">Rp 0 <span className="text-xs font-normal text-slate-400">/ selamanya</span></div>
                            </div>
                            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>Subdomain Gratis <code>masjidku.id/m/slug</code></span></li>
                                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>Donasi & Infaq QRIS Direct</span></li>
                                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>Manajemen Berita & Kajian Unlimited</span></li>
                                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>Pilihan Tema Gratis</span></li>
                            </ul>
                            <Link
                                to="/register"
                                className="block w-full text-center py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs text-slate-900 dark:text-white transition-all"
                            >
                                Mulai Gratis
                            </Link>
                        </div>

                        <div className="p-8 rounded-3xl bg-emerald-950/20 dark:bg-emerald-950/30 border-2 border-emerald-500 space-y-6 shadow-xl relative">
                            <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-md">
                                Paling Diminati
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Paket Professional</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Untuk masjid agung/besar dengan kebutuhan domain mandiri.</p>
                                <div className="pt-4 text-3xl font-black text-emerald-600 dark:text-emerald-400">Rp 99.000 <span className="text-xs font-normal text-slate-400">/ bulan</span></div>
                            </div>
                            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>Semua Fitur Paket Gratis</span></li>
                                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>Support Custom Domain (<code>masjidalikhlas.com</code>)</span></li>
                                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>Akses Seluruh Tema Premium Marketplace</span></li>
                                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>Prioritas Verifikasi Fast-Track</span></li>
                            </ul>
                            <Link
                                to="/register"
                                className="block w-full text-center py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-lg shadow-emerald-500/25 transition-all"
                            >
                                Pilih Paket Pro
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white dark:bg-[#05080e] border-t border-slate-200 dark:border-slate-800/80 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-900 dark:text-white">MASJIDKU</span>
                        <span>&copy; 2026 PT Mikrotek Zemiro Indonesia. All rights reserved.</span>
                    </div>
                    <div className="flex space-x-6">
                        <Link to="/login" className="hover:text-emerald-600 dark:hover:text-emerald-400">Masuk</Link>
                        <Link to="/register" className="hover:text-emerald-600 dark:hover:text-emerald-400">Pendaftaran</Link>
                        <a href="/openapi.yaml" className="hover:text-emerald-600 dark:hover:text-emerald-400">OpenAPI Spec</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

