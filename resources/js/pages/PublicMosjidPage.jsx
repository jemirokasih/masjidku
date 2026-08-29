import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { 
    Globe, HeartHandshake, BookOpenCheck, Calendar, Clock, 
    MapPin, Phone, Mail, ShieldAlert, ArrowLeft, RefreshCw, 
    CreditCard, ExternalLink, CheckCircle2
} from 'lucide-react';

export default function PublicMosjidPage() {
    const { slug } = useParams();
    const [payload, setPayload] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchWebsiteData = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch public website payload with preview=1 parameter enabled
                const res = await api.get(`/public/masjid/${slug}?preview=1`);
                setPayload(res.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Gagal memuat website masjid.');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchWebsiteData();
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-6">
                <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
                <span className="text-sm font-semibold text-slate-400">Memuat website masjid...</span>
            </div>
        );
    }

    if (error || !payload) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 text-center">
                <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Website Tidak Ditemukan</h2>
                    <p className="text-xs text-slate-400">{error || 'Website masjid yang Anda cari tidak tersedia.'}</p>
                    <Link to="/" className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-400 hover:underline pt-2">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Beranda</span>
                    </Link>
                </div>
            </div>
        );
    }

    const { masjid, theme, recent_posts, donations, is_preview } = payload;
    const info = masjid?.info || {};

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-600 selection:text-white">
            
            {/* Top Preview Status Bar (If pending verification) */}
            {is_preview && (
                <div className="bg-amber-500 text-slate-950 px-4 py-2.5 text-xs font-bold text-center flex items-center justify-center space-x-2 shadow-md">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>
                        <strong>MODE PRATINJAU (PREVIEW):</strong> Website masjid ini saat ini sedang dalam proses verifikasi tim admin. Tampilan di bawah ini adalah pratinjau publik Anda.
                    </span>
                    <Link to="/setup" className="ml-2 underline font-black hover:text-slate-800">
                        Edit Setup
                    </Link>
                </div>
            )}

            {/* Navbar */}
            <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-500/20 font-black">
                            🕌
                        </div>
                        <div>
                            <h1 className="font-black text-base text-white leading-none tracking-tight">{masjid.name}</h1>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                                {masjid.city ? `${masjid.city}, ${masjid.province || ''}` : 'Official Website Masjid'}
                            </span>
                        </div>
                    </div>

                    <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-300">
                        <a href="#tentang" className="hover:text-emerald-400 transition">Profil</a>
                        <a href="#kajian" className="hover:text-emerald-400 transition">Berita & Kajian</a>
                        <a href="#donasi" className="hover:text-emerald-400 transition">Donasi QRIS</a>
                        <a href="#kontak" className="hover:text-emerald-400 transition">Lokasi & Kontak</a>
                    </nav>

                    <div className="flex items-center space-x-3">
                        <a
                            href="#donasi"
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center space-x-1.5 transition"
                        >
                            <HeartHandshake className="w-4 h-4" />
                            <span>Infaq / Donasi</span>
                        </a>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/80">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
                    <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold">
                        <span>✨ Official Website Resmi {masjid.name}</span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl font-black text-white max-w-3xl mx-auto leading-tight">
                        {info.description || `Selamat Datang di Official Portal Resmi ${masjid.name}`}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        {masjid.address ? `${masjid.address}, ${masjid.city || ''}` : 'Pusat kegiatan ibadah, dakwah, dan informasi jamaah.'}
                    </p>

                    {/* Sholat Schedule Widget Mock */}
                    <div className="pt-8 max-w-3xl mx-auto">
                        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
                            <div className="text-xs font-bold text-slate-400 mb-3 flex items-center justify-center space-x-1">
                                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Jadwal Sholat Hari Ini</span>
                            </div>
                            <div className="grid grid-cols-5 gap-2 text-center text-xs">
                                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                                    <div className="text-[10px] text-slate-500 font-bold uppercase">Subuh</div>
                                    <div className="font-mono font-bold text-white text-sm mt-0.5">04:42</div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                                    <div className="text-[10px] text-slate-500 font-bold uppercase">Dzuhur</div>
                                    <div className="font-mono font-bold text-white text-sm mt-0.5">12:01</div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                                    <div className="text-[10px] text-slate-500 font-bold uppercase">Ashar</div>
                                    <div className="font-mono font-bold text-white text-sm mt-0.5">15:20</div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 ring-1 ring-emerald-500/30">
                                    <div className="text-[10px] text-emerald-400 font-bold uppercase">Maghrib</div>
                                    <div className="font-mono font-bold text-white text-sm mt-0.5">18:03</div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                                    <div className="text-[10px] text-slate-500 font-bold uppercase">Isya</div>
                                    <div className="font-mono font-bold text-white text-sm mt-0.5">19:13</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Kajian & Berita Section */}
            <section id="kajian" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="text-center space-y-2">
                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Informasi & Kegiatan</h3>
                    <h4 className="text-2xl font-black text-white">Berita & Jadwal Kajian Terbaru</h4>
                </div>

                {recent_posts && recent_posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {recent_posts.map((post) => (
                            <div key={post.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-emerald-500/40 transition">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 uppercase">
                                    {post.type || 'Berita'}
                                </span>
                                <h5 className="font-bold text-base text-white">{post.title}</h5>
                                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{post.content}</p>
                                {post.speaker && (
                                    <div className="text-xs text-emerald-400 font-semibold pt-1">
                                        Pemateri: {post.speaker}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-500">
                        Belum ada artikel berita atau kajian yang dipublikasikan.
                    </div>
                )}
            </section>

            {/* Donasi QRIS Section */}
            <section id="donasi" className="py-16 bg-slate-900 border-y border-slate-800/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    <div className="text-center space-y-2">
                        <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Layanan Donasi</h3>
                        <h4 className="text-2xl font-black text-white">Infaq & Sedekah Digital QRIS Direct</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <h5 className="font-bold text-base text-white">Rekening Bank Official</h5>
                            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs space-y-1">
                                <div className="text-slate-400">Bank Syariah Indonesia (BSI)</div>
                                <div className="text-lg font-bold text-emerald-400">7700-1234-5678</div>
                                <div className="text-[11px] text-slate-500">a.n DKM {masjid.name}</div>
                            </div>
                        </div>

                        <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                                <Globe className="w-6 h-6" />
                            </div>
                            <h5 className="font-bold text-base text-white">Scan QRIS Direct</h5>
                            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
                                Gunakan GoPay, OVO, Dana, ShopeePay, atau Mobile Banking pilihan Anda.
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer / Location */}
            <footer id="kontak" className="py-12 border-t border-slate-800 text-xs text-slate-400">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">{masjid.name}</span>
                        <span>&copy; 2026. Powered by Masjidku SaaS.</span>
                    </div>
                    <div className="flex space-x-6">
                        {masjid.phone && <span>Telp: {masjid.phone}</span>}
                        {masjid.email && <span>Email: {masjid.email}</span>}
                    </div>
                </div>
            </footer>
        </div>
    );
}
