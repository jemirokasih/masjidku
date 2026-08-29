import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { 
    Clock, Calendar, Maximize2, Minimize2, Volume2, 
    VolumeX, Sparkles, RefreshCw, AlertCircle, ShieldAlert
} from 'lucide-react';

export default function PublicMosqueTVPage() {
    const { slug } = useParams();
    const [payload, setPayload] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);

    // Fetch Mosque Public Payload
    useEffect(() => {
        const fetchWebsiteData = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/public/masjid/${slug}?preview=1`);
                setPayload(res.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Gagal memuat display TV masjid.');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchWebsiteData();
        }
    }, [slug]);

    // Live Clock Ticker
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Auto Rotate Content Slides every 7 seconds
    useEffect(() => {
        const slideTimer = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % 3);
        }, 7000);
        return () => clearInterval(slideTimer);
    }, []);

    // Toggle Fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => console.log(err));
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-6 font-sans">
                <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                <span className="text-base font-bold text-slate-400">Memuat Display TV Digital Masjid...</span>
            </div>
        );
    }

    if (error || !payload) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center font-sans">
                <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
                    <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
                    <h2 className="text-xl font-bold">Display TV Tidak Ditemukan</h2>
                    <p className="text-xs text-slate-400">{error || 'Data masjid tidak dapat dimuat.'}</p>
                </div>
            </div>
        );
    }

    const { masjid, recent_posts } = payload;
    const info = masjid?.info || {};

    // Prayer Schedule (Dynamic Mock for TV Display)
    const prayerTimes = [
        { name: 'SUBUH', time: '04:42', isNext: false },
        { name: 'SYURUQ', time: '05:58', isNext: false },
        { name: 'DZUHUR', time: '12:01', isNext: false },
        { name: 'ASHAR', time: '15:20', isNext: false },
        { name: 'MAGHRIB', time: '18:03', isNext: true },
        { name: 'ISYA', time: '19:13', isNext: false },
    ];

    // Format Digital Clock String
    const timeString = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateString = currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between overflow-hidden select-none">
            
            {/* TOP BAR: Mosque Branding & Large Digital Clock */}
            <header className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border-b border-emerald-500/30 px-8 py-5 flex items-center justify-between shadow-2xl">
                <div className="flex items-center space-x-5">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-3xl shadow-lg shadow-emerald-600/30 font-black">
                        🕌
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-white">{masjid.name}</h1>
                        <p className="text-xs font-bold text-emerald-400 tracking-widest uppercase">
                            {masjid.address ? `${masjid.address}, ${masjid.city || ''}` : 'Official Digital TV Display'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="text-right">
                        <div className="text-xs font-bold text-slate-400 flex items-center justify-end space-x-1.5">
                            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{dateString} / 16 Safar 1448 H</span>
                        </div>
                        <div className="text-4xl font-mono font-black text-emerald-400 tracking-wider pt-0.5">
                            {timeString}
                        </div>
                    </div>

                    <button
                        onClick={toggleFullscreen}
                        title="Toggle Fullscreen"
                        className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/50 transition"
                    >
                        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT AREA: Animated Carousel Slides */}
            <main className="flex-1 p-8 flex items-center justify-center relative">
                <div className="w-full max-w-6xl">

                    {/* SLIDE 0: Pengumuman / Kajian Rutin */}
                    {activeSlide === 0 && (
                        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-10 shadow-2xl space-y-6 animate-fadeIn">
                            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase tracking-wider">
                                <Sparkles className="w-4 h-4" />
                                <span>Informasi & Agenda Kajian Rutin</span>
                            </div>

                            {recent_posts && recent_posts.length > 0 ? (
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-black text-white leading-tight">
                                        {recent_posts[0].title}
                                    </h2>
                                    <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                                        {recent_posts[0].content}
                                    </p>
                                    {recent_posts[0].speaker && (
                                        <div className="text-base font-bold text-emerald-400 pt-2">
                                            Pemateri: {recent_posts[0].speaker}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <h2 className="text-3xl font-black text-white">Selamat Datang di {masjid.name}</h2>
                                    <p className="text-sm text-slate-300">
                                        Mari makmurkan masjid dengan mendirikan sholat berjamaah tepat waktu dan merapatkan shaf.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SLIDE 1: Himbauan Sholat Khusyu */}
                    {activeSlide === 1 && (
                        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-10 shadow-2xl text-center space-y-6 animate-fadeIn">
                            <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-3xl font-black">
                                📱
                            </div>
                            <h2 className="text-3xl font-black text-white">Himbauan Adab Sholat</h2>
                            <p className="text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
                                Mohon menonaktifkan atau mematikan nada dering Handphone (HP) Anda demi kekhusyukan ibadah sholat berjamaah.
                            </p>
                        </div>
                    )}

                    {/* SLIDE 2: Laporan Kas Masjid Transparan */}
                    {activeSlide === 2 && (
                        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-10 shadow-2xl space-y-6 animate-fadeIn">
                            <div className="flex items-center justify-between">
                                <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-extrabold uppercase tracking-wider">
                                    <span>Laporan Keuangan Kas Masjid Transparan</span>
                                </div>
                                <span className="text-xs text-slate-400 font-bold">Update Pekan Ini</span>
                            </div>

                            <div className="grid grid-cols-3 gap-6 pt-2">
                                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                                    <div className="text-xs text-slate-400 font-bold">Saldo Pekan Lalu</div>
                                    <div className="text-2xl font-mono font-black text-white">Rp 15.450.000</div>
                                </div>
                                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                                    <div className="text-xs text-emerald-400 font-bold">Penerimaan Infaq Juma't</div>
                                    <div className="text-2xl font-mono font-black text-emerald-400">+ Rp 4.200.000</div>
                                </div>
                                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                                    <div className="text-xs text-blue-400 font-bold">Saldo Akhir Kas</div>
                                    <div className="text-2xl font-mono font-black text-blue-400">Rp 19.650.000</div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>

            {/* BOTTOM AREA: Prayer Schedule 5 Waktu & Running Text Ticker */}
            <footer className="space-y-0">
                {/* 5 Prayer Schedule Cards */}
                <div className="bg-slate-900/95 border-t border-slate-800 px-8 py-4">
                    <div className="grid grid-cols-6 gap-4">
                        {prayerTimes.map((p, idx) => (
                            <div 
                                key={idx} 
                                className={`p-4 rounded-2xl border text-center transition-all ${
                                    p.isNext 
                                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-xl shadow-emerald-600/30 scale-105' 
                                        : 'bg-slate-950 border-slate-800 text-slate-300'
                                }`}
                            >
                                <div className="text-xs font-bold tracking-wider uppercase opacity-80">{p.name}</div>
                                <div className="text-2xl font-mono font-black mt-1">{p.time}</div>
                                {p.isNext && (
                                    <div className="text-[10px] font-black uppercase tracking-widest mt-1 bg-emerald-700 py-0.5 rounded text-white">
                                        Mendatang
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Running Text Marquee Ticker */}
                <div className="bg-emerald-950 border-t border-emerald-800/80 px-4 py-3 text-xs font-bold text-emerald-200 overflow-hidden flex items-center space-x-3">
                    <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-black uppercase shrink-0">
                        INFO DKM
                    </span>
                    <div className="whitespace-nowrap overflow-hidden tracking-wide animate-marquee">
                        Selamat datang para jamaah {masjid.name}. Pelaksanaan Sholat Jumat dimulai pukul 11:55 WIB. Harap merapatkan shaf dan menonaktifkan nada dering HP. DKM melayani pendaftaran hewan kurban & zakat fitrah.
                    </div>
                </div>
            </footer>

        </div>
    );
}

