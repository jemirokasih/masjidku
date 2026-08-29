import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
    BookOpen, Search, Play, Pause, Volume2, 
    ArrowLeft, RefreshCw, FileText, CheckCircle2, ChevronRight,
    Globe, HeartHandshake, LogIn
} from 'lucide-react';

export default function QuranPage({ embedded = false }) {
    const [surahList, setSurahList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Selected Surah State
    const [selectedSurahNo, setSelectedSurahNo] = useState(null);
    const [surahDetail, setSurahDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    
    // Audio Player State
    const [playingAudio, setPlayingAudio] = useState(null);

    // Fetch list of 114 Surah from EQuran API v2
    useEffect(() => {
        const fetchSurahs = async () => {
            setLoading(true);
            try {
                const res = await axios.get('https://equran.id/api/v2/surat');
                setSurahList(res.data.data || []);
            } catch (err) {
                console.error('Failed to fetch Quran surah list', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSurahs();
    }, []);

    // Fetch specific surah detail when selected
    const handleSelectSurah = async (nomor) => {
        setSelectedSurahNo(nomor);
        setLoadingDetail(true);
        setSurahDetail(null);
        try {
            const res = await axios.get(`https://equran.id/api/v2/surat/${nomor}`);
            setSurahDetail(res.data.data);
        } catch (err) {
            console.error('Failed to fetch surah detail', err);
        } finally {
            setLoadingDetail(false);
        }
    };

    // Toggle verse audio
    const toggleAudio = (audioUrl, verseNo) => {
        if (playingAudio === verseNo) {
            setPlayingAudio(null);
        } else {
            setPlayingAudio(verseNo);
            const audio = new Audio(audioUrl);
            audio.play();
            audio.onended = () => setPlayingAudio(null);
        }
    };

    const filteredSurahs = surahList.filter(s => 
        s.namaLatin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.arti.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nomor.toString() === searchQuery
    );

    const mainContent = (
        <div className={embedded ? "py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6"}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="flex items-center space-x-3">
                    {selectedSurahNo ? (
                        <button 
                            onClick={() => setSelectedSurahNo(null)}
                            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center space-x-1 text-xs font-bold"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Daftar Surah</span>
                        </button>
                    ) : (
                        <div className="w-11 h-11 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xl font-bold">
                            📖
                        </div>
                    )}
                    <div>
                        <h1 className="text-xl font-black text-white">Al-Qur'an Digital EQuran.id</h1>
                        <p className="text-xs text-slate-400">114 Surah dengan Teks Arab, Latin, Terjemahan &amp; Audio Qari</p>
                    </div>
                </div>

                {!selectedSurahNo && (
                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                        <input
                            type="text"
                            placeholder="Cari surah (e.g. Yasin, Al-Mulk)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                        />
                    </div>
                )}
            </div>

            {/* VIEW 1: SURAH READER */}
            {selectedSurahNo ? (
                <div>
                    {loadingDetail || !surahDetail ? (
                        <div className="flex justify-center p-16 text-xs text-slate-400">
                            <RefreshCw className="w-6 h-6 animate-spin mr-2 text-emerald-500" />
                            <span>Memuat teks ayat Al-Qur'an...</span>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Surah Header Card */}
                            <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/30 text-center space-y-3 relative overflow-hidden">
                                <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 uppercase tracking-widest">
                                    Surah Ke-{surahDetail.nomor} • {surahDetail.tempatTurun} • {surahDetail.jumlahAyat} Ayat
                                </span>
                                <h2 className="text-4xl font-extrabold text-white">{surahDetail.namaLatin}</h2>
                                <div className="text-3xl font-serif text-emerald-400">{surahDetail.nama}</div>
                                <p className="text-xs text-slate-300 max-w-xl mx-auto italic">"{surahDetail.arti}"</p>
                            </div>

                            {/* Bismillah Header */}
                            {surahDetail.nomor !== 1 && surahDetail.nomor !== 9 && (
                                <div className="text-center py-6 text-2xl font-serif text-emerald-400">
                                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                                </div>
                            )}

                            {/* Ayat Verses List */}
                            <div className="space-y-4">
                                {surahDetail.ayat?.map((a) => (
                                    <div key={a.nomorAyat} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition">
                                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
                                                {a.nomorAyat}
                                            </div>
                                            <button
                                                onClick={() => toggleAudio(a.audio?.['05'] || a.audio?.['01'], a.nomorAyat)}
                                                className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white text-xs font-bold flex items-center space-x-1.5 transition"
                                            >
                                                {playingAudio === a.nomorAyat ? (
                                                    <>
                                                        <Pause className="w-3.5 h-3.5 text-emerald-400" />
                                                        <span>Jeda Audio</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="w-3.5 h-3.5" />
                                                        <span>Audio Misyari</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {/* Arabic Script */}
                                        <div className="text-right text-2xl sm:text-3xl font-serif leading-loose text-white pt-2">
                                            {a.teksArab}
                                        </div>

                                        {/* Latin & Indonesian Translation */}
                                        <div className="space-y-1 text-xs pt-2">
                                            <div className="text-emerald-400 font-semibold italic leading-relaxed">{a.teksLatin}</div>
                                            <div className="text-slate-300 leading-relaxed">{a.teksIndonesia}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* VIEW 2: 114 SURAH GRID LIST */
                <div>
                    {loading ? (
                        <div className="flex justify-center p-16 text-xs text-slate-400">
                            <RefreshCw className="w-6 h-6 animate-spin mr-2 text-emerald-500" />
                            <span>Memuat daftar surah Al-Qur'an...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {filteredSurahs.map((s) => (
                                <div
                                    key={s.nomor}
                                    onClick={() => handleSelectSurah(s.nomor)}
                                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 cursor-pointer transition flex items-center justify-between group shadow-sm"
                                >
                                    <div className="flex items-center space-x-3.5">
                                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center group-hover:border-emerald-500/50">
                                            {s.nomor}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-white group-hover:text-emerald-400 transition">{s.namaLatin}</h3>
                                            <div className="text-[11px] text-slate-400">
                                                {s.arti} • {s.jumlahAyat} Ayat
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="font-serif text-lg text-emerald-400">{s.nama}</div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold">{s.tempatTurun}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    if (embedded) {
        return mainContent;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between">
            {/* Standalone Public Header Navbar */}
            <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-500/20 font-black">
                            🕌
                        </div>
                        <div>
                            <h1 className="font-black text-base text-white leading-none tracking-tight">Masjidku</h1>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                                Portal Al-Qur'an Digital
                            </span>
                        </div>
                    </Link>

                    <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-300">
                        <Link to="/" className="hover:text-white transition">Beranda</Link>
                        <Link to="/quran" className="text-emerald-400 border-b-2 border-emerald-400 py-5">Al-Qur'an</Link>
                        <Link to="/doa" className="hover:text-white transition">Doa Harian</Link>
                        <Link to="/tv" className="hover:text-white transition">Display TV</Link>
                    </nav>

                    <div className="flex items-center space-x-3">
                        <Link
                            to="/register"
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
                        >
                            Daftar Website
                        </Link>
                        <Link
                            to="/login"
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>Login Pengurus</span>
                        </Link>
                    </div>
                </div>
            </header>

            {mainContent}

            {/* Standalone Public Footer */}
            <footer className="py-8 border-t border-slate-800 text-xs text-slate-400">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">Masjidku.id</span>
                        <span>&copy; 2026. Powered by EQuran.id SDK API.</span>
                    </div>
                    <div className="flex space-x-6">
                        <Link to="/register" className="hover:text-emerald-400">Buat Website Masjid Baru</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
