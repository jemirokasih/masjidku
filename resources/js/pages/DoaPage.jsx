import React, { useState } from 'react';
import { Heart, Search, BookOpenCheck, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';

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

    const containerClass = embedded 
        ? "py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6" 
        : "min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-8 space-y-6 max-w-5xl mx-auto";

    return (
        <div className={containerClass}>
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
}
