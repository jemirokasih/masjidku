import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, BookOpenCheck, ArrowLeft, Sparkles, CheckCircle2, LogIn } from 'lucide-react';

export default function DoaPage({ embedded = false }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('semua');

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xl font-bold">
                        🤲
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white">Kumpulan Doa Harian &amp; Dzikir</h1>
                        <p className="text-xs text-slate-400">Kumpulan doa pilihan beserta teks Arab, Latin, dan Terjemahan Bahasa Indonesia</p>
                    </div>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                        type="text"
                        placeholder="Cari doa (e.g. Masuk Masjid, Makan)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                    />
                </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex space-x-2 border-b border-slate-800 pb-2">
                <button
                    onClick={() => setSelectedCategory('semua')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${selectedCategory === 'semua' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                >
                    Semua Doa
                </button>
                <button
                    onClick={() => setSelectedCategory('masjid')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${selectedCategory === 'masjid' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                >
                    Doa Adab Masjid
                </button>
                <button
                    onClick={() => setSelectedCategory('harian')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${selectedCategory === 'harian' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                >
                    Doa Harian
                </button>
                <button
                    onClick={() => setSelectedCategory('keselamatan')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${selectedCategory === 'keselamatan' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                >
                    Doa Keselamatan
                </button>
            </div>

            {/* Doa Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDoa.map((d) => (
                    <div key={d.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-emerald-500/50 transition">
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                            {d.title}
                        </span>
                        <div className="text-right text-xl font-serif text-white leading-loose pt-2">
                            {d.arabic}
                        </div>
                        <div className="text-xs text-emerald-400 font-semibold italic">{d.latin}</div>
                        <p className="text-xs text-slate-300 leading-relaxed">{d.translation}</p>
                    </div>
                ))}
            </div>
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
                                Portal Doa &amp; Dzikir
                            </span>
                        </div>
                    </Link>

                    <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-300">
                        <Link to="/" className="hover:text-white transition">Beranda</Link>
                        <Link to="/quran" className="hover:text-white transition">Al-Qur'an</Link>
                        <Link to="/doa" className="text-emerald-400 border-b-2 border-emerald-400 py-5">Doa Harian</Link>
                    </nav>

                    <div className="flex items-center space-x-3">
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
                        <span>&copy; 2026. Portal Doa &amp; Dzikir Digital.</span>
                    </div>
                    <div className="flex space-x-6">
                        <Link to="/register" className="hover:text-emerald-400">Buat Website Masjid Baru</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
