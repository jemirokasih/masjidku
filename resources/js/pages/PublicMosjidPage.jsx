import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
import QuranPage from './QuranPage';
import DoaPage from './DoaPage';
import { 
    Globe, HeartHandshake, BookOpenCheck, Calendar, Clock, 
    MapPin, Phone, Mail, ShieldAlert, ArrowLeft, RefreshCw, 
    CreditCard, ExternalLink, CheckCircle2, Sparkles, Building, Info, MessageSquare, ChevronRight,
    Sun, Moon, ChevronDown
} from 'lucide-react';

export default function PublicMosjidPage() {
    const { slug } = useParams();
    const location = useLocation();
    const [payload, setPayload] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false); // Default Light Mode!
    const [isResourcesOpen, setIsResourcesOpen] = useState(false); // Dropdown state

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
    // pathname: /m/alikhlas/beranda or /m/alikhlas/profile or /m/alikhlas/program or /m/alikhlas/berita etc.
    const rawPath = location.pathname.replace(new RegExp(`^/m/${slug}`), '').replace(/^\//, '').toLowerCase();
    let activeSubPage = rawPath || 'beranda';
    if (activeSubPage === 'profile' || activeSubPage === 'profil') activeSubPage = 'profil';
    if (activeSubPage === 'program' || activeSubPage === 'kegiatan') activeSubPage = 'program';
    if (activeSubPage === 'berita' || activeSubPage === 'kajian') activeSubPage = 'kajian';

    const samplePrograms = [
        {
            id: 1,
            title: 'Taman Pendidikan Al-Qur\'an (TPQ / TPA)',
            category: 'Pendidikan Anak',
            schedule: 'Setiap Senin - Jumat (15.30 - 17.00 WIB)',
            description: 'Pembelajaran membaca Al-Qur\'an metode Iqro, tajwid, hafalan doa harian, dan pembentukan adab Islami untuk anak-anak usia 5-12 tahun.',
            status: 'Pendaftaran Buka'
        },
        {
            id: 2,
            title: 'Jumat Berkah — Berbagi Nasi & Sembako',
            category: 'Sosial & Umat',
            schedule: 'Setiap Hari Jumat Ba\'da Sholat Jumat',
            description: 'Pembagian paket makan siang gratis dan bantuan sembako untuk jamaah sholat jumat, musafir, serta warga sekitar yang membutuhkan.',
            status: 'Rutin Mingguan'
        },
        {
            id: 3,
            title: 'Pesantren Kilat & Mabit Ramadhan',
            category: 'Karakter & Remaja',
            schedule: 'Bulan Suci Ramadhan',
            description: 'Kegiatan pembinaan iman, tadarus Al-Qur\'an 30 juz, ceramah kebangsaan & akhlak, serta mabit malam 10 terakhir Ramadhan.',
            status: 'Program Tahunan'
        },
        {
            id: 4,
            title: 'Kajian Subuh Berjamaah & Sarapan Bersama',
            category: 'Dakwah & Keilmuan',
            schedule: 'Setiap Ahad / Minggu Subuh',
            description: 'Kajian kitab fiqih & tafsir oleh ustadz tamu dilanjutkan ramah tamah dan sarapan bersama jamaah.',
            status: 'Rutin Mingguan'
        }
    ];

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

    // Dynamic Theme Color Styles with Base #164134 Emerald Gradient
    const currentStyle = {
        badge: isDarkMode 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : 'bg-[#164134]/10 border-[#164134]/20 text-[#164134] font-bold',
        button: 'bg-gradient-to-r from-[#164134] via-[#1c5242] to-[#226350] hover:from-[#1c5242] hover:to-[#164134] text-white shadow-md shadow-[#164134]/20 border border-[#164134]/30',
        textAccent: isDarkMode ? 'text-emerald-400' : 'text-[#164134]',
        borderAccent: isDarkMode ? 'border-emerald-500/40' : 'border-[#164134]/50',
        bgGlow: isDarkMode ? 'bg-[#164134]/30' : 'bg-[#164134]/15',
        navActive: isDarkMode 
            ? 'text-emerald-400 border-b-2 border-emerald-400 font-bold' 
            : 'text-[#164134] border-b-2 border-[#164134] font-black',
    };

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
        <div className={`min-h-screen font-sans selection:bg-[#164134] selection:text-white flex flex-col justify-between transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#f6f8f7] text-slate-900'}`}>
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
                <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200 shadow-sm'}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <Link to={`/m/${slug}/beranda`} className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#164134] to-[#226350] flex items-center justify-center text-white text-xl shadow-md font-black">
                                🕌
                            </div>
                            <div>
                                <h1 className={`font-black text-base leading-none tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{masjid.name}</h1>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${currentStyle.textAccent}`}>
                                    {masjid.city ? `${masjid.city}, ${masjid.province || ''}` : 'Official Website Masjid'}
                                </span>
                            </div>
                        </Link>

                        <nav className={`hidden md:flex items-center space-x-6 text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            <Link 
                                to={`/m/${slug}/beranda`} 
                                className={`py-5 transition ${activeSubPage === 'beranda' ? currentStyle.navActive : isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}
                            >
                                Beranda
                            </Link>
                            <Link 
                                to={`/m/${slug}/profile`} 
                                className={`py-5 transition ${activeSubPage === 'profil' ? currentStyle.navActive : isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}
                            >
                                Profil Masjid
                            </Link>
                            <Link 
                                to={`/m/${slug}/program`} 
                                className={`py-5 transition ${activeSubPage === 'program' ? currentStyle.navActive : isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}
                            >
                                Program Kegiatan
                            </Link>
                            {showPosts && (
                                <Link 
                                    to={`/m/${slug}/berita`} 
                                    className={`py-5 transition ${activeSubPage === 'kajian' ? currentStyle.navActive : isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}
                                >
                                    Berita & Kajian
                                </Link>
                            )}
                            {showDonations && (
                                <Link 
                                    to={`/m/${slug}/donasi`} 
                                    className={`py-5 transition ${activeSubPage === 'donasi' ? currentStyle.navActive : isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}
                                >
                                    Donasi QRIS
                                </Link>
                            )}
                            {/* Dropdown Menu: Sumber Daya (Al-Qur'an & Doa Harian) */}
                            <div 
                                className="relative py-5" 
                                onMouseEnter={() => setIsResourcesOpen(true)} 
                                onMouseLeave={() => setIsResourcesOpen(false)}
                            >
                                <button className={`flex items-center space-x-1.5 transition ${activeSubPage === 'quran' || activeSubPage === 'doa' ? currentStyle.navActive : isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}>
                                    <span>Sumber Daya</span>
                                    <ChevronDown className="w-3.5 h-3.5" />
                                </button>

                                <div className={`absolute top-full left-0 w-52 py-2 rounded-2xl border shadow-xl transition-all duration-200 z-50 ${isResourcesOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'} ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}>
                                    <Link
                                        to={`/m/${slug}/quran`}
                                        className={`flex items-center space-x-3 px-4 py-2.5 text-xs font-bold transition ${isDarkMode ? 'hover:bg-slate-800 hover:text-emerald-400' : 'hover:bg-slate-100 hover:text-emerald-700'}`}
                                    >
                                        <span className="text-base">📖</span>
                                        <div>
                                            <div>Al-Qur'an Digital</div>
                                            <div className="text-[10px] text-slate-400 font-normal">Teks Arab, Latin &amp; Audio</div>
                                        </div>
                                    </Link>
                                    <Link
                                        to={`/m/${slug}/doa`}
                                        className={`flex items-center space-x-3 px-4 py-2.5 text-xs font-bold transition ${isDarkMode ? 'hover:bg-slate-800 hover:text-emerald-400' : 'hover:bg-slate-100 hover:text-emerald-700'}`}
                                    >
                                        <span className="text-base">🤲</span>
                                        <div>
                                            <div>Doa Harian &amp; Dzikir</div>
                                            <div className="text-[10px] text-slate-400 font-normal">Kumpulan Doa Adab &amp; Dzikir</div>
                                        </div>
                                    </Link>
                                </div>
                            </div>

                            <Link 
                                to={`/m/${slug}/kontak`} 
                                className={`py-5 transition ${activeSubPage === 'kontak' ? currentStyle.navActive : isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}
                            >
                                Lokasi & Kontak
                            </Link>
                        </nav>

                        <div className="flex items-center space-x-3">
                            {/* Dark Mode / Light Mode Toggle Button */}
                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className={`p-2 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition ${isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'}`}
                                title={isDarkMode ? 'Beralih ke Mode Terang (Light)' : 'Beralih ke Mode Gelap (Dark)'}
                            >
                                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                                <span className="hidden sm:inline">{isDarkMode ? 'Light' : 'Dark'}</span>
                            </button>

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
                        {/* SECTION 1: HERO BANNER (ISLAMIC ARTWORK & GEOMETRY PATTERN) */}
                        <section className={`relative py-24 overflow-hidden border-b transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-slate-800/80' : 'bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 border-slate-200/80'}`}>
                            {/* Islamic Background Radial Glow & Geometry Pattern */}
                            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] ${currentStyle.bgGlow} rounded-full blur-[120px] pointer-events-none`}></div>
                            <div className={`absolute inset-0 opacity-[0.04] ${isDarkMode ? 'bg-[radial-gradient(#34d399_1px,transparent_1px)]' : 'bg-[radial-gradient(#059669_1px,transparent_1px)]'} [background-size:24px_24px] pointer-events-none`}></div>

                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
                                {/* Calligraphy Bismillah Header */}
                                <div className={`font-serif text-2xl sm:text-4xl tracking-widest pt-2 pb-1 drop-shadow-md select-none ${isDarkMode ? 'text-emerald-400' : 'text-emerald-800 font-bold'}`}>
                                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                                </div>

                                <div className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border text-xs font-bold ${currentStyle.badge} backdrop-blur-md`}>
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Official Website Resmi {masjid.name}</span>
                                </div>

                                <h2 className={`text-3xl sm:text-5xl font-black max-w-3xl mx-auto leading-tight tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {heroTitle}
                                </h2>

                                <p className={`text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {heroSubtitle}
                                </p>

                                {/* Ayat Scroll Ticker */}
                                <div className="pt-2">
                                    <div className={`inline-block px-5 py-2 rounded-2xl text-xs font-serif italic shadow-sm border ${isDarkMode ? 'bg-slate-900/80 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-300/80 text-amber-900 font-bold'}`}>
                                        "Hanyalah yang memakmurkan masjid Allah ialah orang yang beriman kepada Allah &amp; Hari Kemudian" — (QS. At-Taubah: 18)
                                    </div>
                                </div>

                                {/* SECTION 2: JADWAL SHOLAT WIDGET */}
                                {showSholat && (
                                    <div className="pt-6 max-w-3xl mx-auto">
                                        <div className={`border rounded-3xl p-6 shadow-2xl space-y-4 backdrop-blur-md relative overflow-hidden transition-colors ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80 shadow-xl'}`}>
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
                                            
                                            <div className={`flex flex-col sm:flex-row items-center justify-between gap-2 text-xs border-b pb-3 ${isDarkMode ? 'border-slate-800/80 text-slate-300' : 'border-slate-100 text-slate-700'}`}>
                                                <div className="flex items-center space-x-2 font-bold">
                                                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-serif text-sm">🕌</div>
                                                    <span>Jadwal Sholat Realtime — <strong className={`uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{prayerSchedule.lokasi}</strong></span>
                                                </div>
                                                <div className={`text-xs font-mono font-bold px-3 py-1 rounded-full border shadow ${isDarkMode ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-slate-50 border-slate-200 text-emerald-700'}`}>
                                                    ⏰ Jam Saat Ini: <span className={`font-mono font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{currentTime.toLocaleTimeString('id-ID')} WIB</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-5 gap-2 text-center text-xs">
                                                <div className={`p-3 rounded-xl border transition ${nextPrayerKey === 'subuh' ? `${currentStyle.borderAccent} shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500/30 ${isDarkMode ? 'bg-slate-950' : 'bg-emerald-50/50'}` : isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                                    <div className={`text-[10px] font-extrabold uppercase ${nextPrayerKey === 'subuh' ? currentStyle.textAccent : 'text-slate-500'}`}>
                                                        Subuh {nextPrayerKey === 'subuh' && '✦'}
                                                    </div>
                                                    <div className={`font-mono font-black text-base mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{prayerSchedule.subuh}</div>
                                                </div>

                                                <div className={`p-3 rounded-xl border transition ${nextPrayerKey === 'dzuhur' ? `${currentStyle.borderAccent} shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500/30 ${isDarkMode ? 'bg-slate-950' : 'bg-emerald-50/50'}` : isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                                    <div className={`text-[10px] font-extrabold uppercase ${nextPrayerKey === 'dzuhur' ? currentStyle.textAccent : 'text-slate-500'}`}>
                                                        Dzuhur {nextPrayerKey === 'dzuhur' && '✦'}
                                                    </div>
                                                    <div className={`font-mono font-black text-base mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{prayerSchedule.dzuhur}</div>
                                                </div>

                                                <div className={`p-3 rounded-xl border transition ${nextPrayerKey === 'ashar' ? `${currentStyle.borderAccent} shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500/30 ${isDarkMode ? 'bg-slate-950' : 'bg-emerald-50/50'}` : isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                                    <div className={`text-[10px] font-extrabold uppercase ${nextPrayerKey === 'ashar' ? currentStyle.textAccent : 'text-slate-500'}`}>
                                                        Ashar {nextPrayerKey === 'ashar' && '✦'}
                                                    </div>
                                                    <div className={`font-mono font-black text-base mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{prayerSchedule.ashar}</div>
                                                </div>

                                                <div className={`p-3 rounded-xl border transition ${nextPrayerKey === 'maghrib' ? `${currentStyle.borderAccent} shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500/30 ${isDarkMode ? 'bg-slate-950' : 'bg-emerald-50/50'}` : isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                                    <div className={`text-[10px] font-extrabold uppercase ${nextPrayerKey === 'maghrib' ? currentStyle.textAccent : 'text-slate-500'}`}>
                                                        Maghrib {nextPrayerKey === 'maghrib' && '✦'}
                                                    </div>
                                                    <div className={`font-mono font-black text-base mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{prayerSchedule.maghrib}</div>
                                                </div>

                                                <div className={`p-3 rounded-xl border transition ${nextPrayerKey === 'isya' ? `${currentStyle.borderAccent} shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500/30 ${isDarkMode ? 'bg-slate-950' : 'bg-emerald-50/50'}` : isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                                    <div className={`text-[10px] font-extrabold uppercase ${nextPrayerKey === 'isya' ? currentStyle.textAccent : 'text-slate-500'}`}>
                                                        Isya {nextPrayerKey === 'isya' && '✦'}
                                                    </div>
                                                    <div className={`font-mono font-black text-base mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{prayerSchedule.isya}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* SECTION 3: PROFIL SECTION (MIHRAB ARCH STYLING) */}
                        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className={`p-8 sm:p-12 rounded-3xl border transition shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 ${isDarkMode ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-slate-800 hover:border-amber-500/30' : 'bg-white border-slate-200/80 hover:border-amber-500/40 shadow-lg'}`}>
                                <div className="absolute top-0 left-0 w-32 h-1 bg-gradient-to-r from-emerald-500 to-amber-500"></div>
                                <div className="space-y-4 max-w-2xl">
                                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold ${currentStyle.badge}`}>
                                        <span>🕌 Profil &amp; Sejarah</span>
                                    </div>
                                    <h3 className={`text-2xl sm:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                        Mengenal {masjid.name}
                                    </h3>
                                    <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
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

                        {/* SECTION 4: PROGRAM KEGIATAN MASJID & MUSHOLAH */}
                        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                                <div>
                                    <span className={`text-xs font-bold uppercase tracking-widest ${currentStyle.textAccent}`}>Aktivitas &amp; Pembinaan Umat</span>
                                    <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Program Kegiatan Masjid</h3>
                                </div>
                                <Link
                                    to={`/m/${slug}/program`}
                                    className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md inline-flex items-center space-x-2 ${currentStyle.button}`}
                                >
                                    <span>Lihat Semua Program</span>
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {samplePrograms.map((prog) => (
                                    <div 
                                        key={prog.id} 
                                        className={`p-6 rounded-3xl border space-y-3 transition-all duration-300 shadow-md flex flex-col justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-[#164134]' : 'bg-white border-slate-200/80 hover:border-[#164134] hover:shadow-xl'}`}
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-[10px] font-bold">
                                                <span className={`px-2.5 py-0.5 rounded-full border uppercase ${currentStyle.badge}`}>
                                                    {prog.category}
                                                </span>
                                                <span className="text-amber-600 dark:text-amber-400 font-mono">{prog.status}</span>
                                            </div>

                                            <h4 className={`font-black text-base leading-snug ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{prog.title}</h4>
                                            <p className={`text-xs leading-relaxed line-clamp-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{prog.description}</p>
                                        </div>

                                        <div className={`pt-3 border-t text-[11px] font-medium flex items-center space-x-1.5 ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                                            <Clock className="w-3.5 h-3.5 shrink-0 text-[#164134]" />
                                            <span>{prog.schedule}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* SECTION 5: BERITA & KAJIAN SECTION */}
                        {showPosts && (
                            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                                <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200'}`}>
                                    <div>
                                        <span className={`text-xs font-bold uppercase tracking-widest ${currentStyle.textAccent}`}>Dakwah &amp; Agenda Keilmuan</span>
                                        <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Berita &amp; Kajian Terbaru</h3>
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
                                            <div key={post.id} className={`p-6 rounded-3xl border space-y-3 transition shadow-lg ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-amber-500/30' : 'bg-white border-slate-200 hover:border-amber-500/40'}`}>
                                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                                                    {post.category || 'Kajian'}
                                                </span>
                                                <h4 className={`font-bold text-base leading-snug ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{post.title}</h4>
                                                <p className={`text-xs line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{post.content}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className={`col-span-3 p-8 rounded-3xl border text-center text-xs ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
                                            Belum ada jadwal kajian atau berita terbaru yang dipublikasikan.
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* SECTION 6: LOKASI & KONTAK SECTION */}
                        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className={`p-8 sm:p-12 rounded-3xl border space-y-6 text-center shadow-xl relative overflow-hidden transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-lg'}`}>
                                <div className="space-y-2 max-w-xl mx-auto">
                                    <span className={`text-xs font-bold uppercase tracking-widest ${currentStyle.textAccent}`}>Lokasi &amp; Kontak DKM</span>
                                    <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Kunjungi &amp; Hubungi Kami</h3>
                                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                        {masjid.address ? `${masjid.address}, ${masjid.city || ''}, ${masjid.province || ''}` : 'Alamat masjid belum diatur.'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-xs">
                                    <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                        <div className={`font-bold mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Telepon / WA</div>
                                        <div className={`font-mono font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{masjid.phone || masjid.user?.phone || '-'}</div>
                                    </div>
                                    <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                        <div className={`font-bold mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Email Official</div>
                                        <div className={`font-mono font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{masjid.email || masjid.user?.email || '-'}</div>
                                    </div>
                                    <div className={`p-4 rounded-2xl border flex items-center justify-center ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
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

                {/* PAGE 2.5: PROGRAM KEGIATAN MASJID & MUSHOLAH */}
                {activeSubPage === 'program' && (
                    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                        <div className="text-center space-y-2 max-w-2xl mx-auto">
                            <span className={`text-xs font-bold uppercase tracking-widest ${currentStyle.textAccent}`}>Pembinaan &amp; Aktivitas Umat</span>
                            <h2 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Program Kegiatan {masjid.name}</h2>
                            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Program rutin &amp; bertema sosial keagamaan yang diselenggarakan oleh DKM {masjid.name}.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                            {samplePrograms.map((prog) => (
                                <div 
                                    key={prog.id} 
                                    className={`p-8 rounded-3xl border space-y-4 transition shadow-md ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-[#164134]' : 'bg-white border-slate-200/80 hover:border-[#164134] hover:shadow-xl'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${currentStyle.badge}`}>
                                            {prog.category}
                                        </span>
                                        <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300">
                                            {prog.status}
                                        </span>
                                    </div>

                                    <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{prog.title}</h3>
                                    <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{prog.description}</p>

                                    <div className={`pt-4 border-t text-xs font-semibold flex items-center space-x-2 ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                                        <Clock className="w-4 h-4 text-[#164134] shrink-0" />
                                        <span>Waktu / Jadwal: <strong>{prog.schedule}</strong></span>
                                    </div>
                                </div>
                            ))}
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
            <footer className={`py-8 border-t text-xs transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-inner'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-2">
                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{masjid.name}</span>
                        <span>&copy; 2026. Powered by Masjidku.id</span>
                    </div>
                    <div className="flex space-x-6">
                        <Link to="/" className="hover:text-emerald-500">Website Platform Masjidku</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
