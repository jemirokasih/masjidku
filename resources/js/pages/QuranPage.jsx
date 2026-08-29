import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
    BookOpen, Search, Play, Pause, Volume2, 
    ArrowLeft, RefreshCw, FileText, CheckCircle2, ChevronRight,
    Globe, HeartHandshake, LogIn, ChevronDown, Sun, Moon
} from 'lucide-react';

export default function QuranPage({ embedded = false }) {
    const [surahList, setSurahList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    
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
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="flex items-center space-x-3">
                    {selectedSurahNo ? (
                        <button 
                            onClick={() => setSelectedSurahNo(null)}
                            className={`p-2.5 rounded-xl border flex items-center space-x-1 text-xs font-bold transition ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm'}`}
                        >
                            <ArrowLeft className="w-4 h-4 text-[#164134]" />
                            <span>Daftar Surah</span>
                        </button>
                    ) : (
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#164134] to-[#226350] text-white flex items-center justify-center text-xl font-bold shadow-md">
                            📖
                        </div>
                    )}
                    <div>
                        <h1 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Al-Qur'an Digital EQuran.id</h1>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>114 Surah dengan Teks Arab, Latin, Terjemahan &amp; Audio Qari</p>
                    </div>
                </div>

                {!selectedSurahNo && (
                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                            type="text"
                            placeholder="Cari surah (e.g. Yasin, Al-Mulk)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-9 pr-4 py-2 border rounded-xl text-xs transition shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 focus:border-[#164134]'}`}
                        />
                    </div>
                )}
            </div>

            {/* VIEW 1: SURAH READER */}
            {selectedSurahNo ? (
                <div>
                    {loadingDetail || !surahDetail ? (
                        <div className="flex justify-center p-16 text-xs text-slate-400">
                            <RefreshCw className="w-6 h-6 animate-spin mr-2 text-[#164134]" />
                            <span>Memuat teks ayat Al-Qur'an...</span>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Surah Header Card */}
                            <div className="p-8 rounded-3xl bg-gradient-to-r from-[#164134] via-[#1c5242] to-[#226350] text-white shadow-xl text-center space-y-3 relative overflow-hidden">
                                <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-white/20 border border-white/30 text-emerald-100 uppercase tracking-widest">
                                    Surah Ke-{surahDetail.nomor} • {surahDetail.tempatTurun} • {surahDetail.jumlahAyat} Ayat
                                </span>
                                <h2 className="text-4xl font-extrabold text-white">{surahDetail.namaLatin}</h2>
                                <div className="text-3xl font-serif text-emerald-200">{surahDetail.nama}</div>
                                <p className="text-xs text-slate-200 max-w-xl mx-auto italic">"{surahDetail.arti}"</p>
                            </div>

                            {/* Bismillah Header */}
                            {surahDetail.nomor !== 1 && surahDetail.nomor !== 9 && (
                                <div className={`text-center py-6 text-2xl font-serif ${isDarkMode ? 'text-emerald-400' : 'text-[#164134] font-bold'}`}>
                                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                                </div>
                            )}

                            {/* Ayat Verses List */}
                            <div className="space-y-4">
                                {surahDetail.ayat?.map((a) => (
                                    <div key={a.nomorAyat} className={`p-6 rounded-2xl border space-y-4 transition shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200/80 hover:border-[#164134]/40'}`}>
                                        <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#164134] to-[#226350] text-white font-mono font-bold text-xs flex items-center justify-center shadow">
                                                {a.nomorAyat}
                                            </div>
                                            <button
                                                onClick={() => toggleAudio(a.audio?.['05'] || a.audio?.['01'], a.nomorAyat)}
                                                className={`p-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition ${playingAudio === a.nomorAyat ? 'bg-amber-500 text-slate-950 font-black' : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-[#164134] hover:text-white' : 'bg-slate-100 text-slate-700 hover:bg-[#164134] hover:text-white'}`}
                                            >
                                                {playingAudio === a.nomorAyat ? (
                                                    <>
                                                        <Pause className="w-3.5 h-3.5 text-slate-950" />
                                                        <span>Jeda Audio</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="w-3.5 h-3.5 text-[#164134] group-hover:text-white" />
                                                        <span>Audio Misyari</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {/* Arabic Script */}
                                        <div className={`text-right text-2xl sm:text-3xl font-serif leading-loose pt-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                            {a.teksArab}
                                        </div>

                                        {/* Latin & Indonesian Translation */}
                                        <div className="space-y-1 text-xs pt-2">
                                            <div className={`font-semibold italic leading-relaxed ${isDarkMode ? 'text-emerald-400' : 'text-[#164134]'}`}>{a.teksLatin}</div>
                                            <div className={`leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{a.teksIndonesia}</div>
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
                            <RefreshCw className="w-6 h-6 animate-spin mr-2 text-[#164134]" />
                            <span>Memuat daftar surah Al-Qur'an...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {filteredSurahs.map((s) => (
                                <div
                                    key={s.nomor}
                                    onClick={() => handleSelectSurah(s.nomor)}
                                    className={`p-5 rounded-2xl border cursor-pointer transition flex items-center justify-between group shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850' : 'bg-white border-slate-200/80 hover:border-[#164134] hover:shadow-md'}`}
                                >
                                    <div className="flex items-center space-x-3.5">
                                        <div className={`w-10 h-10 rounded-xl font-mono font-bold text-xs flex items-center justify-center transition border ${isDarkMode ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-slate-100 border-slate-200 text-[#164134] group-hover:bg-[#164134] group-hover:text-white'}`}>
                                            {s.nomor}
                                        </div>
                                        <div>
                                            <h3 className={`font-bold text-sm transition ${isDarkMode ? 'text-white group-hover:text-emerald-400' : 'text-slate-900 group-hover:text-[#164134]'}`}>{s.namaLatin}</h3>
                                            <div className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {s.arti} • {s.jumlahAyat} Ayat
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className={`font-serif text-lg ${isDarkMode ? 'text-emerald-400' : 'text-[#164134] font-bold'}`}>{s.nama}</div>
                                        <div className={`text-[10px] uppercase font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{s.tempatTurun}</div>
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
        <div className={`min-h-screen font-sans flex flex-col justify-between transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#f6f8f7] text-slate-900'}`}>
            {/* Standalone Public Header Navbar */}
            <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200 shadow-sm'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#164134] to-[#226350] flex items-center justify-center text-white text-xl shadow-md font-black">
                            🕌
                        </div>
                        <div>
                            <h1 className={`font-black text-base leading-none tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Masjidku</h1>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#164134] dark:text-emerald-400">
                                Portal Al-Qur'an Digital
                            </span>
                        </div>
                    </Link>

                    <nav className={`hidden md:flex items-center space-x-6 text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        <Link to="/" className={`py-5 transition ${isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}>
                            Beranda
                        </Link>
                        <Link to="/m/alikhlas/profile" className={`py-5 transition ${isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}>
                            Profil Masjid
                        </Link>
                        <Link to="/m/alikhlas/program" className={`py-5 transition ${isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}>
                            Program Kegiatan
                        </Link>
                        <Link to="/m/alikhlas/berita" className={`py-5 transition ${isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}>
                            Berita &amp; Kajian
                        </Link>

                        {/* Dropdown Menu: Sumber Daya */}
                        <div className="relative py-5 group">
                            <button className="flex items-center space-x-1.5 text-[#164134] dark:text-emerald-400 border-b-2 border-[#164134] dark:border-emerald-400 font-bold">
                                <span>Sumber Daya</span>
                                <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <div className={`absolute top-full left-0 w-52 py-2 rounded-2xl border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}>
                                <Link to="/quran" className={`flex items-center space-x-3 px-4 py-2.5 text-xs font-bold transition ${isDarkMode ? 'bg-slate-800 text-emerald-400' : 'bg-slate-50 text-[#164134]'}`}>
                                    <span className="text-base">📖</span>
                                    <div>
                                        <div>Al-Qur'an Digital</div>
                                        <div className="text-[10px] text-slate-400 font-normal">Teks Arab, Latin &amp; Audio</div>
                                    </div>
                                </Link>
                                <Link to="/doa" className={`flex items-center space-x-3 px-4 py-2.5 text-xs font-bold transition ${isDarkMode ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'}`}>
                                    <span className="text-base">🤲</span>
                                    <div>
                                        <div>Doa Harian &amp; Dzikir</div>
                                        <div className="text-[10px] text-slate-400 font-normal">Kumpulan Doa Adab &amp; Dzikir</div>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        <Link to="/m/alikhlas/kontak" className={`py-5 transition ${isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}>
                            Lokasi &amp; Kontak
                        </Link>
                    </nav>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={`p-2 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition ${isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'}`}
                            title={isDarkMode ? 'Beralih ke Mode Terang (Light)' : 'Beralih ke Mode Gelap (Dark)'}
                        >
                            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                            <span className="hidden sm:inline">{isDarkMode ? 'Light' : 'Dark'}</span>
                        </button>

                        <Link
                            to="/login"
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#164134] via-[#1c5242] to-[#226350] hover:from-[#1c5242] hover:to-[#164134] text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition border border-[#164134]/30"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>Login Pengurus</span>
                        </Link>
                    </div>
                </div>
            </header>

            {mainContent}

            {/* Standalone Public Footer */}
            <footer className={`py-8 border-t text-xs transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-inner'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-2">
                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Masjidku.id</span>
                        <span>&copy; 2026. Powered by EQuran.id SDK API.</span>
                    </div>
                    <div className="flex space-x-6">
                        <Link to="/register" className="hover:text-[#164134] dark:hover:text-emerald-400 font-bold">Buat Website Masjid Baru</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
