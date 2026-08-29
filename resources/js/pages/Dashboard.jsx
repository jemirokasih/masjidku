import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    HeartHandshake, BookOpenCheck, Globe, ShieldCheck, 
    ArrowRight, Sparkles, Building, Palette, RefreshCw, 
    Plus, CheckCircle2, Clock, AlertTriangle
} from 'lucide-react';
import api from '../api/axios';

export default function Dashboard() {
    const { user } = useAuth();
    const [masjidData, setMasjidData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMasjidProfile = async () => {
            setLoading(true);
            try {
                const res = await api.get('/tenant/masjid');
                setMasjidData(res.data.data);
            } catch (err) {
                console.error('Error fetching masjid profile', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMasjidProfile();
    }, []);

    const masjid = masjidData || user?.masjid;
    const isApproved = masjid?.verification_status === 'approved';

    return (
        <div className="space-y-6 font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                        <span>Panel Pengurus — {masjid?.name || 'Masjidku'}</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Selamat datang, <strong>{user?.name}</strong>. Kelola website, donasi QRIS, berita & kajian masjid Anda.
                    </p>
                </div>

                <div className="flex items-center space-x-2.5">
                    <Link
                        to="/setup"
                        className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-700/20 flex items-center space-x-1.5 transition-all"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Mulai / Edit Setup</span>
                    </Link>
                    {masjid?.slug && (
                        <a
                            href={`/m/${masjid.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center space-x-1.5 transition-all"
                        >
                            <Globe className="w-4 h-4 text-emerald-600" />
                            <span>Lihat Website Publik</span>
                        </a>
                    )}
                </div>
            </div>

            {/* Onboarding Setup Progress Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-slate-900 border border-emerald-500/30 shadow-xl space-y-4 relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                    <div className="space-y-1">
                        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            <span>Panduan Onboarding Pengurus</span>
                        </div>
                        <h2 className="text-lg font-extrabold text-white">
                            Selesaikan 7 Langkah Setup Website Masjid Anda
                        </h2>
                        <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                            Lengkapi domain, pilih template desain, isi informasi umum masjid, dan unggah berkas verifikasi untuk mengaktifkan website resmi.
                        </p>
                    </div>

                    <Link
                        to="/setup"
                        className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-lg shadow-emerald-500/25 flex items-center space-x-2 transition-all shrink-0"
                    >
                        <span>Mulai Setup Sekarang</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* 7-Step Progress Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 border-t border-emerald-800/40 text-[11px] font-bold">
                    <div className="p-2 rounded-xl bg-slate-900/70 border border-emerald-500/30 text-emerald-300 text-center">1. Domain</div>
                    <div className="p-2 rounded-xl bg-slate-900/70 border border-emerald-500/30 text-emerald-300 text-center">2. Template</div>
                    <div className="p-2 rounded-xl bg-slate-900/70 border border-emerald-500/30 text-emerald-300 text-center">3. Info Masjid</div>
                    <div className="p-2 rounded-xl bg-slate-900/70 border border-emerald-500/30 text-emerald-300 text-center">4. Verifikasi</div>
                    <div className="p-2 rounded-xl bg-slate-900/70 border border-emerald-500/30 text-emerald-300 text-center">5. Ketentuan</div>
                    <div className="p-2 rounded-xl bg-slate-900/70 border border-emerald-500/30 text-emerald-300 text-center">6. Pilih Paket</div>
                    <div className="p-2 rounded-xl bg-slate-900/70 border border-emerald-500/30 text-emerald-300 text-center">7. Selesai</div>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 border-l-4 border-l-emerald-500">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>ALAMAT SUBDOMAIN</span>
                        <Globe className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-lg font-black text-slate-900 dark:text-white font-mono truncate">
                        {masjid?.slug ? `${masjid.slug}.masjidku.id` : 'Belum Setup'}
                    </div>
                    <div className="text-[11px] text-slate-400">Subdomain Resmi Masjid</div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>TEMPLATE AKTIF</span>
                        <Palette className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-lg font-black text-slate-900 dark:text-white truncate">
                        {masjid?.active_theme?.name || 'Default Clean'}
                    </div>
                    <div className="text-[11px] text-slate-400">Desain Visual Website</div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 border-l-4 border-l-amber-500">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>STATUS VERIFIKASI</span>
                        <ShieldCheck className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-lg font-black text-amber-500 capitalize">
                        {masjid?.verification_status || 'Pending'}
                    </div>
                    <div className="text-[11px] text-slate-400">Persetujuan Tim Admin</div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 border-l-4 border-l-purple-500">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>TOTAL KONTEN / KAJIAN</span>
                        <BookOpenCheck className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="text-lg font-black text-slate-900 dark:text-white font-mono">
                        {masjid?.posts_count || 0} Artikel / Agenda
                    </div>
                    <div className="text-[11px] text-slate-400">Publikasi Realtime</div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                    to="/masjid-profile"
                    className="p-6 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-sm space-y-3 transition group"
                >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                        <Building className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
                        Profile Masjid
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Kelola data umum, alamat lokasi, kontak pengurus, dan data rekening donasi/QRIS.
                    </p>
                </Link>

                <Link
                    to="/content"
                    className="p-6 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-sm space-y-3 transition group"
                >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                        <BookOpenCheck className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
                        Kelola Konten
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Tulis berita masjid, pengumuman kajian rutin ustadz, dan buat program infaq/donasi.
                    </p>
                </Link>

                <Link
                    to="/settings"
                    className="p-6 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-sm space-y-3 transition group"
                >
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                        <Palette className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
                        Pengaturan
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Ganti tema template website, atur subdomain, serta kelola akun pengurus masjid.
                    </p>
                </Link>
            </div>
        </div>
    );
}
