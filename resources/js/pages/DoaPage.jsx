import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, BookOpenCheck, ArrowLeft, Sparkles, CheckCircle2, LogIn, ChevronDown, Sun, Moon } from 'lucide-react';

export default function DoaPage({ embedded = false }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('semua');
    const [isDarkMode, setIsDarkMode] = useState(false);

    const doaList = [
        {
            id: 1,
            category: 'masjid',
            title: 'Doa Masuk Masjid',
            arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
            latin: 'Allahummaf-tah lii abwaaba rahmatik.',
            translation: 'Ya Allah, bukakanlah bagiku pintu-pintu rahmat-Mu.'
        },
        {
            id: 2,
            category: 'masjid',
            title: 'Doa Keluar Masjid',
            arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
            latin: 'Allahumma innii as-aluka min fadhlik.',
            translation: 'Ya Allah, sesungguhnya aku memohon keutamaan dari-Mu.'
        },
        {
            id: 3,
            category: 'harian',
            title: 'Doa Sebelum Makan',
            arabic: 'اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ',
            latin: 'Allahumma baarik lanaa fii maa razaqtanaa wa qinaa ‘adzaaban-naar.',
            translation: 'Ya Allah, berkahilah kami pada rezeki yang telah Engkau karuniakan dan lindungilah kami dari azab neraka.'
        },
        {
            id: 4,
            category: 'harian',
            title: 'Doa Sesudah Makan',
            arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
            latin: 'Alhamdulillahilladzii ath’amanaa wa saqaanaa wa ja’alanaa muslimiin.',
            translation: 'Segala puji bagi Allah yang telah memberi kami makan dan minum serta menjadikan kami termasuk orang-orang muslim.'
        },
        {
            id: 5,
            category: 'keluarga',
            title: 'Doa Untuk Kedua Orang Tua',
            arabic: 'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
            latin: 'Rabbighfir lii wa liwaalidayya warhamhumaa kamaa rabbayaanii shaghiiraa.',
            translation: 'Ya Tuhanku, ampunilah aku dan kedua orang tuaku, dan kasihilah keduanya sebagaimana mereka merawatku sewaktu kecil.'
        },
        {
            id: 6,
            category: 'keselamatan',
            title: 'Doa Sapu Jagad (Kebaikan Dunia & Akhirat)',
            arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
            latin: 'Rabbanaa aatinaa fid-dunyaa hasanatan wa fil-aakhirati hasanatan wa qinaa ‘adzaaban-naar.',
            translation: 'Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat serta lindungilah kami dari siksa neraka.'
        },
        {
            id: 7,
            category: 'sholat',
            title: 'Doa Qunut Subuh',
            arabic: 'اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ ، وَعَافِنِي فِيمَنْ عَافَيْتَ ...',
            latin: 'Allahummahdinii fii man hadait, wa ‘aafinii fii man ‘aafait ...',
            translation: 'Ya Allah, berilah aku petunjuk di antara orang-orang yang Engkau beri petunjuk, berilah aku kesehatan ...'
        }
    ];

    const filteredDoa = doaList.filter(d => {
        const matchesCategory = selectedCategory === 'semua' || d.category === selectedCategory;
        const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.translation.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const mainContent = (
        <div className={embedded ? "py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6"}>
            {/* Header */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#164134] to-[#226350] text-white flex items-center justify-center text-xl font-bold shadow-md">
                        🤲
                    </div>
                    <div>
                        <h1 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Kumpulan Doa Harian &amp; Dzikir</h1>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Kumpulan doa pilihan beserta teks Arab, Latin, dan Terjemahan Bahasa Indonesia</p>
                    </div>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                        type="text"
                        placeholder="Cari doa (e.g. Masuk Masjid, Makan)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-9 pr-4 py-2 border rounded-xl text-xs transition shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 focus:border-[#164134]'}`}
                    />
                </div>
            </div>

            {/* Category Filter Pills */}
            <div className={`flex space-x-2 border-b pb-3 overflow-x-auto ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                    onClick={() => setSelectedCategory('semua')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${selectedCategory === 'semua' ? 'bg-gradient-to-r from-[#164134] to-[#226350] text-white' : isDarkMode ? 'bg-slate-900 text-slate-400 border border-slate-800' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}`}
                >
                    Semua Doa
                </button>
                <button
                    onClick={() => setSelectedCategory('masjid')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${selectedCategory === 'masjid' ? 'bg-gradient-to-r from-[#164134] to-[#226350] text-white' : isDarkMode ? 'bg-slate-900 text-slate-400 border border-slate-800' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}`}
                >
                    Doa Adab Masjid
                </button>
                <button
                    onClick={() => setSelectedCategory('harian')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${selectedCategory === 'harian' ? 'bg-gradient-to-r from-[#164134] to-[#226350] text-white' : isDarkMode ? 'bg-slate-900 text-slate-400 border border-slate-800' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}`}
                >
                    Doa Harian
                </button>
                <button
                    onClick={() => setSelectedCategory('keselamatan')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${selectedCategory === 'keselamatan' ? 'bg-gradient-to-r from-[#164134] to-[#226350] text-white' : isDarkMode ? 'bg-slate-900 text-slate-400 border border-slate-800' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}`}
                >
                    Doa Keselamatan
                </button>
            </div>

            {/* Doa Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDoa.map((d) => (
                    <div key={d.id} className={`p-6 rounded-2xl border space-y-3 transition shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200/80 hover:border-[#164134]/40'}`}>
                        <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border uppercase ${isDarkMode ? 'bg-[#164134]/30 border-[#164134]/50 text-emerald-300' : 'bg-[#164134]/10 border-[#164134]/20 text-[#164134]'}`}>
                            {d.title}
                        </span>
                        <div className={`text-right text-xl font-serif leading-loose pt-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {d.arabic}
                        </div>
                        <div className={`text-xs font-semibold italic ${isDarkMode ? 'text-emerald-400' : 'text-[#164134]'}`}>{d.latin}</div>
                        <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{d.translation}</p>
                    </div>
                ))}
            </div>
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
                                Portal Doa &amp; Dzikir
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
                        <Link to="/m/alikhlas/donasi" className={`py-5 transition ${isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}>
                            Donasi QRIS
                        </Link>

                        {/* Dropdown Menu: Sumber Daya */}
                        <div className="relative py-5 group">
                            <button className="flex items-center space-x-1.5 text-[#164134] dark:text-emerald-400 border-b-2 border-[#164134] dark:border-emerald-400 font-bold">
                                <span>Sumber Daya</span>
                                <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <div className={`absolute top-full left-0 w-52 py-2 rounded-2xl border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}>
                                <Link to="/quran" className={`flex items-center space-x-3 px-4 py-2.5 text-xs font-bold transition ${isDarkMode ? 'hover:bg-slate-800 text-slate-300 hover:text-white' : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'}`}>
                                    <span className="text-base">📖</span>
                                    <div>
                                        <div>Al-Qur'an Digital</div>
                                        <div className="text-[10px] text-slate-400 font-normal">Teks Arab, Latin &amp; Audio</div>
                                    </div>
                                </Link>
                                <Link to="/doa" className={`flex items-center space-x-3 px-4 py-2.5 text-xs font-bold transition ${isDarkMode ? 'bg-slate-800 text-emerald-400' : 'bg-slate-50 text-[#164134]'}`}>
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
                            to="/register"
                            className={`px-4 py-2 rounded-xl border font-bold text-xs transition ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'}`}
                        >
                            Daftar Website
                        </Link>
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
                        <span>&copy; 2026. Portal Doa &amp; Dzikir Islami.</span>
                    </div>
                    <div className="flex space-x-6">
                        <Link to="/register" className="hover:text-[#164134] dark:hover:text-emerald-400 font-bold">Buat Website Masjid Baru</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
