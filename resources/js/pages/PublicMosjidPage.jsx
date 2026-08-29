import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { 
    Globe, HeartHandshake, BookOpenCheck, Calendar, Clock, 
    MapPin, Phone, Mail, ShieldAlert, ArrowLeft, RefreshCw, 
    CreditCard, ExternalLink, CheckCircle2, Sparkles, Building, Info, MessageSquare
} from 'lucide-react';

export default function PublicMosjidPage() {
    const { slug } = useParams();
    const location = useLocation();
    const [payload, setPayload] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Determine current sub-page based on pathname
    // pathname: /m/alikhlas or /m/alikhlas/profil or /m/alikhlas/kajian etc.
    const currentPath = location.pathname.replace(new RegExp(`^/m/${slug}`), '').replace(/^\//, '');
    const activeSubPage = currentPath || 'beranda'; // 'beranda', 'profil', 'kajian', 'donasi', 'kontak'

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
            <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 text-center font-sans">
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
    const hp = info?.homepage_settings || {};

    const heroTitle = hp.hero_title || `Selamat Datang di Official Portal Resmi ${masjid.name}`;
    const heroSubtitle = hp.hero_subtitle || (masjid.address ? `${masjid.address}, ${masjid.city || ''}` : 'Pusat kegiatan ibadah, dakwah, dan informasi jamaah.');
    const ctaText = hp.hero_cta_text || 'Infaq / Donasi';
    const showSholat = hp.show_sholat !== false;
    const showPosts = hp.show_posts !== false;
    const showDonations = hp.show_donations !== false;

    const themeSlug = theme?.slug || masjid?.active_theme?.slug || 'default-clean';

    // Theme Color Styles
    const themeStyles = {
        'green-islamic': {
            badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
            button: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20',
            textAccent: 'text-emerald-400',
            borderAccent: 'border-emerald-500/40',
            bgGlow: 'bg-emerald-500/10',
            navActive: 'text-emerald-400 border-b-2 border-emerald-400',
        },
        'blue-andalusia': {
            badge: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
            button: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20',
            textAccent: 'text-blue-400',
            borderAccent: 'border-blue-500/40',
            bgGlow: 'bg-blue-500/10',
            navActive: 'text-blue-400 border-b-2 border-blue-400',
        },
        'gold-premium': {
            badge: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
            button: 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold shadow-amber-500/20',
            textAccent: 'text-amber-400',
            borderAccent: 'border-amber-500/40',
            bgGlow: 'bg-amber-500/10',
            navActive: 'text-amber-400 border-b-2 border-amber-400',
        },
        'default-clean': {
            badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
            button: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20',
            textAccent: 'text-emerald-400',
            borderAccent: 'border-emerald-500/40',
            bgGlow: 'bg-emerald-500/10',
            navActive: 'text-emerald-400 border-b-2 border-emerald-400',
        }
    };

    const currentStyle = themeStyles[themeSlug] || themeStyles['default-clean'];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-600 selection:text-white flex flex-col justify-between">
            <div>
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

                {/* Navbar Multi-Page Navigation */}
                <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <Link to={`/m/${slug}`} className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-500/20 font-black">
                                🕌
                            </div>
                            <div>
                                <h1 className="font-black text-base text-white leading-none tracking-tight">{masjid.name}</h1>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${currentStyle.textAccent}`}>
                                    {masjid.city ? `${masjid.city}, ${masjid.province || ''}` : 'Official Website Masjid'}
                                </span>
                            </div>
                        </Link>

                        <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-300">
                            <Link 
                                to={`/m/${slug}`} 
                                className={`py-5 transition ${activeSubPage === 'beranda' ? currentStyle.navActive : 'hover:text-white'}`}
                            >
                                Beranda
                            </Link>
                            <Link 
                                to={`/m/${slug}/profil`} 
                                className={`py-5 transition ${activeSubPage === 'profil' ? currentStyle.navActive : 'hover:text-white'}`}
                            >
                                Profil Masjid
                            </Link>
                            {showPosts && (
                                <Link 
                                    to={`/m/${slug}/kajian`} 
                                    className={`py-5 transition ${activeSubPage === 'kajian' ? currentStyle.navActive : 'hover:text-white'}`}
                                >
                                    Berita & Kajian
                                </Link>
                            )}
                            {showDonations && (
                                <Link 
                                    to={`/m/${slug}/donasi`} 
                                    className={`py-5 transition ${activeSubPage === 'donasi' ? currentStyle.navActive : 'hover:text-white'}`}
                                >
                                    Donasi QRIS
                                </Link>
                            )}
                            <Link 
                                to={`/m/${slug}/quran`} 
                                className={`py-5 transition ${activeSubPage === 'quran' ? currentStyle.navActive : 'hover:text-white'}`}
                            >
                                Al-Qur'an
                            </Link>
                            <Link 
                                to={`/m/${slug}/doa`} 
                                className={`py-5 transition ${activeSubPage === 'doa' ? currentStyle.navActive : 'hover:text-white'}`}
                            >
                                Doa Harian
                            </Link>
                            <Link 
                                to={`/m/${slug}/kontak`} 
                                className={`py-5 transition ${activeSubPage === 'kontak' ? currentStyle.navActive : 'hover:text-white'}`}
                            >
                                Lokasi & Kontak
                            </Link>
                        </nav>

                        <div className="flex items-center space-x-3">
                            <Link
                                to={`/m/${slug}/donasi`}
                                className={`px-4 py-2 rounded-xl font-bold text-xs shadow-md flex items-center space-x-1.5 transition ${currentStyle.button}`}
                            >
                                <HeartHandshake className="w-4 h-4" />
                                <span>{ctaText}</span>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* PAGE 1: BERANDA (HOME PAGE) */}
                {activeSubPage === 'beranda' && (
                    <div>
                        <section className="relative py-20 overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/80">
                            <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] ${currentStyle.bgGlow} rounded-full blur-3xl pointer-events-none`}></div>

                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
                                <div className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-bold ${currentStyle.badge}`}>
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Official Website Resmi {masjid.name}</span>
                                </div>

                                <h2 className="text-3xl sm:text-5xl font-black text-white max-w-3xl mx-auto leading-tight">
                                    {heroTitle}
                                </h2>

                                <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
                                    {heroSubtitle}
                                </p>

                                {/* Sholat Schedule Widget */}
                                {showSholat && (
                                    <div className="pt-8 max-w-3xl mx-auto">
                                        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
                                            <div className="text-xs font-bold text-slate-400 mb-3 flex items-center justify-center space-x-1">
                                                <Clock className={`w-3.5 h-3.5 ${currentStyle.textAccent}`} />
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
                                                <div className={`p-2.5 rounded-xl bg-slate-950 border ${currentStyle.borderAccent}`}>
                                                    <div className={`text-[10px] font-bold uppercase ${currentStyle.textAccent}`}>Maghrib</div>
                                                    <div className="font-mono font-bold text-white text-sm mt-0.5">18:03</div>
                                                </div>
                                                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                                                    <div className="text-[10px] text-slate-500 font-bold uppercase">Isya</div>
                                                    <div className="font-mono font-bold text-white text-sm mt-0.5">19:13</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Quick Highlights Section */}
                        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center font-bold">
                                        🕌
                                    </div>
                                    <h3 className="font-bold text-base text-white">Profil & Sejarah</h3>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        Mengenal lebih dekat struktur kepengurusan DKM, visi-misi, serta fasilitas ibadah.
                                    </p>
                                    <Link to={`/m/${slug}/profil`} className={`inline-flex items-center text-xs font-bold pt-2 ${currentStyle.textAccent}`}>
                                        Selengkapnya →
                                    </Link>
                                </div>

                                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-800 text-blue-400 flex items-center justify-center font-bold">
                                        📖
                                    </div>
                                    <h3 className="font-bold text-base text-white">Berita & Kajian</h3>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        Jadwal ceramah rutin, tabligh akbar, serta berita pengumuman kegiatan jamaah.
                                    </p>
                                    <Link to={`/m/${slug}/kajian`} className={`inline-flex items-center text-xs font-bold pt-2 ${currentStyle.textAccent}`}>
                                        Lihat Jadwal →
                                    </Link>
                                </div>

                                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center font-bold">
                                        💳
                                    </div>
                                    <h3 className="font-bold text-base text-white">Infaq & Donasi QRIS</h3>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        Salurkan donasi & infaq jariyah secara aman langsung via QRIS Direct atau Rekening BSI.
                                    </p>
                                    <Link to={`/m/${slug}/donasi`} className={`inline-flex items-center text-xs font-bold pt-2 ${currentStyle.textAccent}`}>
                                        Donasi Sekarang →
                                    </Link>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* PAGE 2: PROFIL MASJID */}
                {activeSubPage === 'profil' && (
                    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                        <div className="text-center space-y-2 max-w-2xl mx-auto">
                            <span className={`text-xs font-bold uppercase tracking-widest ${currentStyle.textAccent}`}>Profil & Sejarah</span>
                            <h2 className="text-3xl font-black text-white">Tentang {masjid.name}</h2>
                            <p className="text-xs text-slate-400 leading-relaxed">{info.description || 'Pusat ibadah dan pembinaan muamalah umat.'}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                    <Sparkles className={`w-5 h-5 ${currentStyle.textAccent}`} />
                                    <span>Visi Masjid</span>
                                </h3>
                                <p className="text-xs text-slate-300 leading-relaxed">{info.vision || 'Menjadi pusat peradaban dan ibadah yang memakmurkan jamaah serta lingkungan sekitar.'}</p>
                            </div>

                            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                    <CheckCircle2 className={`w-5 h-5 ${currentStyle.textAccent}`} />
                                    <span>Misi Utama</span>
                                </h3>
                                <p className="text-xs text-slate-300 leading-relaxed">{info.mission || '1. Menyelenggarakan ibadah sholat fardhu secara tertib & nyaman.\n2. Mengadakan kajian keislaman rutin berbasis Al-Quran & Sunnah.'}</p>
                            </div>
                        </div>

                        {/* Fasilitas */}
                        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                            <h3 className="font-bold text-lg text-white">Fasilitas Masjid</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center font-bold">Ruang Sholat Ber-AC</div>
                                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center font-bold">Tempat Wudhu Luas</div>
                                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center font-bold">Parkir Motor & Mobil</div>
                                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center font-bold">Layanan Ambulans</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PAGE 3: BERITA & KAJIAN */}
                {activeSubPage === 'kajian' && (
                    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                        <div className="text-center space-y-2 max-w-2xl mx-auto">
                            <span className={`text-xs font-bold uppercase tracking-widest ${currentStyle.textAccent}`}>Agenda & Pengumuman</span>
                            <h2 className="text-3xl font-black text-white">Berita & Jadwal Kajian Rutin</h2>
                            <p className="text-xs text-slate-400">Informasi kegiatan keagamaan dan pengumuman DKM {masjid.name}.</p>
                        </div>

                        {recent_posts && recent_posts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {recent_posts.map((post) => (
                                    <div key={post.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${currentStyle.badge}`}>
                                            {post.type || 'Berita'}
                                        </span>
                                        <h5 className="font-bold text-base text-white">{post.title}</h5>
                                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{post.content}</p>
                                        {post.speaker && (
                                            <div className={`text-xs font-semibold pt-1 ${currentStyle.textAccent}`}>
                                                Pemateri: {post.speaker}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-500">
                                Belum ada artikel berita atau kajian yang dipublikasikan saat ini.
                            </div>
                        )}
                    </div>
                )}

                {/* PAGE 4: DONASI QRIS */}
                {activeSubPage === 'donasi' && (
                    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                        <div className="text-center space-y-2 max-w-2xl mx-auto">
                            <span className={`text-xs font-bold uppercase tracking-widest ${currentStyle.textAccent}`}>Layanan Infaq Jariyah</span>
                            <h2 className="text-3xl font-black text-white">Donasi & Infaq Digital QRIS Direct</h2>
                            <p className="text-xs text-slate-400">Salurkan donasi terbaik Anda untuk operasional dan pemeliharaan {masjid.name}.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-slate-950 text-emerald-400 flex items-center justify-center mx-auto">
                                    <CreditCard className="w-6 h-6" />
                                </div>
                                <h5 className="font-bold text-base text-white">Rekening Bank Official</h5>
                                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1">
                                    <div className="text-slate-400">Bank Syariah Indonesia (BSI)</div>
                                    <div className={`text-xl font-black ${currentStyle.textAccent}`}>7700-1234-5678</div>
                                    <div className="text-[11px] text-slate-500">a.n DKM {masjid.name}</div>
                                </div>
                            </div>

                            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-slate-950 text-emerald-400 flex items-center justify-center mx-auto">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <h5 className="font-bold text-base text-white">Scan QRIS Direct</h5>
                                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                                    Gunakan GoPay, OVO, Dana, ShopeePay, atau Mobile Banking pilihan Anda.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PAGE 5: LOKASI & KONTAK */}
                {activeSubPage === 'kontak' && (
                    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                        <div className="text-center space-y-2 max-w-2xl mx-auto">
                            <span className={`text-xs font-bold uppercase tracking-widest ${currentStyle.textAccent}`}>Informasi Alamat</span>
                            <h2 className="text-3xl font-black text-white">Lokasi Masjid & Kontak DKM</h2>
                            <p className="text-xs text-slate-400">Hubungi pengurus atau kunjungi lokasi masjid kami.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 text-center">
                                <MapPin className={`w-6 h-6 mx-auto ${currentStyle.textAccent}`} />
                                <h4 className="font-bold text-sm text-white">Alamat Lengkap</h4>
                                <p className="text-xs text-slate-400">{masjid.address ? `${masjid.address}, ${masjid.city || ''}, ${masjid.province || ''}` : 'Alamat belum diatur.'}</p>
                            </div>

                            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 text-center">
                                <Phone className={`w-6 h-6 mx-auto ${currentStyle.textAccent}`} />
                                <h4 className="font-bold text-sm text-white">No. Telepon / WhatsApp</h4>
                                <p className="text-xs text-slate-400 font-mono">{masjid.phone || masjid.user?.phone || '-'}</p>
                            </div>

                            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 text-center">
                                <Mail className={`w-6 h-6 mx-auto ${currentStyle.textAccent}`} />
                                <h4 className="font-bold text-sm text-white">Email Official</h4>
                                <p className="text-xs text-slate-400 font-mono">{masjid.email || masjid.user?.email || '-'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="py-8 border-t border-slate-800 text-xs text-slate-400">
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
