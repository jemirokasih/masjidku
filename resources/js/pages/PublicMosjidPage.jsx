import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
import QuranPage from './QuranPage';
import DoaPage from './DoaPage';
import { 
    Globe, HeartHandshake, BookOpenCheck, Calendar, Clock, 
    MapPin, Phone, Mail, ShieldAlert, ArrowLeft, RefreshCw, 
    CreditCard, ExternalLink, CheckCircle2, Sparkles, Building, Info, MessageSquare, ChevronRight
} from 'lucide-react';

export default function PublicMosjidPage() {
    const { slug } = useParams();
    const location = useLocation();
    const [payload, setPayload] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Realtime Clock & Prayer Schedule State
    const [currentTime, setCurrentTime] = useState(new Date());
    const [prayerSchedule, setPrayerSchedule] = useState({
        subuh: '04:39',
        dzuhur: '11:57',
        ashar: '15:15',
        maghrib: '17:56',
        isya: '19:05',
        lokasi: 'KOTA JAKARTA'
    });

    // Live Clock Ticker
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Determine current sub-page based on pathname
    // pathname: /m/alikhlas/beranda or /m/alikhlas/profile or /m/alikhlas/berita etc.
    const rawPath = location.pathname.replace(new RegExp(`^/m/${slug}`), '').replace(/^\//, '').toLowerCase();
    let activeSubPage = rawPath || 'beranda';
    if (activeSubPage === 'profile' || activeSubPage === 'profil') activeSubPage = 'profil';
    if (activeSubPage === 'berita' || activeSubPage === 'kajian') activeSubPage = 'kajian';

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

    // Fetch Real Prayer Times API (MyQuran API v2)
    useEffect(() => {
        const fetchPrayerApi = async () => {
            try {
                const now = new Date();
                const y = now.getFullYear();
                const m = String(now.getMonth() + 1).padStart(2, '0');
                const d = String(now.getDate()).padStart(2, '0');

                let cityId = '1301'; // Default Kota Jakarta
                if (payload?.masjid?.city) {
                    try {
                        const searchRes = await axios.get(`https://api.myquran.com/v2/sholat/kota/cari/${payload.masjid.city}`);
                        if (searchRes.data?.data?.[0]?.id) {
                            cityId = searchRes.data.data[0].id;
                        }
                    } catch (e) {
                        console.log('City search fallback to 1301');
                    }
                }

                const res = await axios.get(`https://api.myquran.com/v2/sholat/jadwal/${cityId}/${y}/${m}/${d}`);
                const j = res.data?.data?.jadwal;
                if (j) {
                    setPrayerSchedule({
                        subuh: j.subuh || '04:39',
                        dzuhur: j.dzuhur || '11:57',
                        ashar: j.ashar || '15:15',
                        maghrib: j.maghrib || '17:56',
                        isya: j.isya || '19:05',
                        lokasi: res.data.data.lokasi || 'KOTA JAKARTA'
                    });
                }
            } catch (err) {
                console.error('Failed to fetch MyQuran prayer times API', err);
            }
        };

        if (payload) {
            fetchPrayerApi();
        }
    }, [payload]);

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

    // Helper to calculate next upcoming prayer
    const getNextPrayerKey = (now, schedule) => {
        if (!schedule) return 'subuh';
        const nowMinutes = now.getHours() * 60 + now.getMinutes();

        const timeToMinutes = (tStr) => {
            if (!tStr) return 0;
            const [h, m] = tStr.split(':').map(Number);
            return h * 60 + m;
        };

        const subuhM = timeToMinutes(schedule.subuh);
        const dzuhurM = timeToMinutes(schedule.dzuhur);
        const asharM = timeToMinutes(schedule.ashar);
        const maghribM = timeToMinutes(schedule.maghrib);
        const isyaM = timeToMinutes(schedule.isya);

        if (nowMinutes < subuhM) return 'subuh';
        if (nowMinutes < dzuhurM) return 'dzuhur';
        if (nowMinutes < asharM) return 'ashar';
        if (nowMinutes < maghribM) return 'maghrib';
        if (nowMinutes < isyaM) return 'isya';
        return 'subuh'; // After Isya, next is Subuh tomorrow
    };

    const nextPrayerKey = getNextPrayerKey(currentTime, prayerSchedule);

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
                        <Link to={`/m/${slug}/beranda`} className="flex items-center space-x-3">
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
                                to={`/m/${slug}/beranda`} 
                                className={`py-5 transition ${activeSubPage === 'beranda' ? currentStyle.navActive : 'hover:text-white'}`}
                            >
                                Beranda
                            </Link>
                            <Link 
                                to={`/m/${slug}/profile`} 
                                className={`py-5 transition ${activeSubPage === 'profil' ? currentStyle.navActive : 'hover:text-white'}`}
                            >
                                Profil Masjid
                            </Link>
                            {showPosts && (
                                <Link 
                                    to={`/m/${slug}/berita`} 
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
                    <div className="space-y-16 pb-16">
                        {/* SECTION 1: HERO BANNER */}
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

                                {/* SECTION 2: JADWAL SHOLAT WIDGET */}
                                {showSholat && (
                                    <div className="pt-6 max-w-3xl mx-auto">
                                        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs border-b border-slate-800 pb-2.5">
                                                <div className="flex items-center space-x-1.5 font-bold text-slate-300">
                                                    <Clock className={`w-4 h-4 ${currentStyle.textAccent}`} />
                                                    <span>Jadwal Sholat Hari Ini — <strong className="text-white uppercase">{prayerSchedule.lokasi}</strong></span>
                                                </div>
                                                <div className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-emerald-400 shadow">
                                                    ⏰ Jam Saat Ini: <span className="text-white font-mono font-black">{currentTime.toLocaleTimeString('id-ID')} WIB</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-5 gap-2 text-center text-xs">
                                                <div className={`p-3 rounded-xl bg-slate-950 border transition ${nextPrayerKey === 'subuh' ? `${currentStyle.borderAccent} shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500/30` : 'border-slate-800'}`}>
                                                    <div className={`text-[10px] font-extrabold uppercase ${nextPrayerKey === 'subuh' ? currentStyle.textAccent : 'text-slate-500'}`}>
                                                        Subuh {nextPrayerKey === 'subuh' && '✦'}
                                                    </div>
                                                    <div className="font-mono font-black text-white text-base mt-0.5">{prayerSchedule.subuh}</div>
                                                </div>

                                                <div className={`p-3 rounded-xl bg-slate-950 border transition ${nextPrayerKey === 'dzuhur' ? `${currentStyle.borderAccent} shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500/30` : 'border-slate-800'}`}>
                                                    <div className={`text-[10px] font-extrabold uppercase ${nextPrayerKey === 'dzuhur' ? currentStyle.textAccent : 'text-slate-500'}`}>
                                                        Dzuhur {nextPrayerKey === 'dzuhur' && '✦'}
                                                    </div>
                                                    <div className="font-mono font-black text-white text-base mt-0.5">{prayerSchedule.dzuhur}</div>
                                                </div>

                                                <div className={`p-3 rounded-xl bg-slate-950 border transition ${nextPrayerKey === 'ashar' ? `${currentStyle.borderAccent} shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500/30` : 'border-slate-800'}`}>
                                                    <div className={`text-[10px] font-extrabold uppercase ${nextPrayerKey === 'ashar' ? currentStyle.textAccent : 'text-slate-500'}`}>
                                                        Ashar {nextPrayerKey === 'ashar' && '✦'}
                                                    </div>
                                                    <div className="font-mono font-black text-white text-base mt-0.5">{prayerSchedule.ashar}</div>
                                                </div>

                                                <div className={`p-3 rounded-xl bg-slate-950 border transition ${nextPrayerKey === 'maghrib' ? `${currentStyle.borderAccent} shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500/30` : 'border-slate-800'}`}>
                                                    <div className={`text-[10px] font-extrabold uppercase ${nextPrayerKey === 'maghrib' ? currentStyle.textAccent : 'text-slate-500'}`}>
                                                        Maghrib {nextPrayerKey === 'maghrib' && '✦'}
                                                    </div>
                                                    <div className="font-mono font-black text-white text-base mt-0.5">{prayerSchedule.maghrib}</div>
                                                </div>

                                                <div className={`p-3 rounded-xl bg-slate-950 border transition ${nextPrayerKey === 'isya' ? `${currentStyle.borderAccent} shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500/30` : 'border-slate-800'}`}>
                                                    <div className={`text-[10px] font-extrabold uppercase ${nextPrayerKey === 'isya' ? currentStyle.textAccent : 'text-slate-500'}`}>
                                                        Isya {nextPrayerKey === 'isya' && '✦'}
                                                    </div>
                                                    <div className="font-mono font-black text-white text-base mt-0.5">{prayerSchedule.isya}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* SECTION 3: PROFIL SECTION */}
                        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="space-y-4 max-w-2xl">
                                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold ${currentStyle.badge}`}>
                                        <span>🕌 Profil Masjid</span>
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-black text-white">
                                        Mengenal {masjid.name}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                                        {info.description || `Portal informasi resmi kegiatan ibadah, sejarah, visi misi, serta sarana prasarana ${masjid.name}.`}
                                    </p>
                                </div>
                                <Link
                                    to={`/m/${slug}/profile`}
                                    className={`px-6 py-3 rounded-2xl font-bold text-xs shadow-lg flex items-center space-x-2 shrink-0 ${currentStyle.button}`}
                                >
                                    <span>Halaman Profil Lengkap</span>
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </section>

                        {/* SECTION 4: PROGRAM & DONASI SECTION */}
                        {showDonations && (
                            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                                        <div>
                                            <span className={`text-xs font-bold uppercase tracking-widest ${currentStyle.textAccent}`}>Infaq &amp; Shadaqah</span>
                                            <h3 className="text-2xl font-black text-white">Program Donasi Masjid</h3>
                                        </div>
                                        <Link
                                            to={`/m/${slug}/donasi`}
                                            className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md inline-flex items-center space-x-2 ${currentStyle.button}`}
                                        >
                                            <span>Ke Halaman Program Donasi</span>
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                                            <div className="text-xs font-bold text-slate-400">Rekening Bank Syariah Indonesia (BSI)</div>
                                            <div className={`text-2xl font-black font-mono ${currentStyle.textAccent}`}>7700-1234-5678</div>
                                            <div className="text-xs text-slate-400">a.n DKM {masjid.name}</div>
                                        </div>

                                        <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                                            <div className="text-xs font-bold text-slate-400">Scan QRIS Direct Infaq</div>
                                            <div className="text-xs text-slate-300 leading-relaxed">
                                                Menerima donasi via GoPay, OVO, Dana, ShopeePay, &amp; Mobile Banking tanpa biaya transaksi.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* SECTION 5: BERITA & KAJIAN SECTION */}
                        {showPosts && (
                            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className={`text-xs font-bold uppercase tracking-widest ${currentStyle.textAccent}`}>Dakwah &amp; Agenda</span>
                                        <h3 className="text-2xl font-black text-white">Berita &amp; Kajian Terbaru</h3>
                                    </div>
                                    <Link
                                        to={`/m/${slug}/berita`}
                                        className={`text-xs font-bold inline-flex items-center space-x-1 ${currentStyle.textAccent} hover:underline`}
                                    >
                                        <span>Lihat Semua Berita</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {recent_posts && recent_posts.length > 0 ? (
                                        recent_posts.map((post) => (
                                            <div key={post.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition">
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                                                    {post.category || 'Kajian'}
                                                </span>
                                                <h4 className="font-bold text-base text-white leading-snug">{post.title}</h4>
                                                <p className="text-xs text-slate-400 line-clamp-2">{post.content}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-3 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                                            Belum ada jadwal kajian atau berita terbaru yang dipublikasikan.
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* SECTION 6: LOKASI & KONTAK SECTION */}
                        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 text-center">
                                <div className="space-y-2 max-w-xl mx-auto">
                                    <span className={`text-xs font-bold uppercase tracking-widest ${currentStyle.textAccent}`}>Lokasi &amp; Kontak</span>
                                    <h3 className="text-2xl font-black text-white">Kunjungi &amp; Hubungi Kami</h3>
                                    <p className="text-xs text-slate-400">
                                        {masjid.address ? `${masjid.address}, ${masjid.city || ''}, ${masjid.province || ''}` : 'Alamat masjid belum diatur.'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-xs">
                                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                                        <div className="text-slate-500 font-bold mb-1">Telepon / WA</div>
                                        <div className="font-mono font-bold text-white">{masjid.phone || masjid.user?.phone || '-'}</div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                                        <div className="text-slate-500 font-bold mb-1">Email Official</div>
                                        <div className="font-mono font-bold text-white">{masjid.email || masjid.user?.email || '-'}</div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                                        <Link to={`/m/${slug}/kontak`} className={`font-bold ${currentStyle.textAccent} hover:underline`}>
                                            Detail Kontak &amp; Peta →
                                        </Link>
                                    </div>
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

                {/* PAGE 5: AL-QURAN DIGITAL */}
                {activeSubPage === 'quran' && (
                    <QuranPage embedded={true} />
                )}

                {/* PAGE 6: DOA HARIAN & DZIKIR */}
                {activeSubPage === 'doa' && (
                    <DoaPage embedded={true} />
                )}

                {/* PAGE 7: LOKASI & KONTAK */}
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
