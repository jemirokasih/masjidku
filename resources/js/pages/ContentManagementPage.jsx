import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    BookOpenCheck, Plus, RefreshCw, FileText, HeartHandshake, 
    Trash2, Layout, Sparkles, Clock, Image, Globe, Share2, 
    CheckCircle2, Save, Building, MapPin, Navigation, List, ChevronRight
} from 'lucide-react';

export default function ContentManagementPage({ defaultTab = 'hero' }) {
    const [posts, setPosts] = useState([]);
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // 9 CMS Tabs: header, hero, profil, program, kajian, sholat, berita, galeri, footer
    const [activeTab, setActiveTab] = useState(defaultTab);

    // General CMS Settings (saves to homepage_settings & masjid_infos)
    const [cmsSettings, setCmsSettings] = useState({
        // 1. Header & Navigasi
        topbar_text: 'Selamat Datang di Official Portal Resmi Masjidku',
        nav_show_berita: true,
        nav_show_kajian: true,
        nav_show_donasi: true,
        nav_show_galeri: true,
        nav_show_kontak: true,

        // 2. Hero/Banner & Seksi
        hero_title: '',
        hero_subtitle: '',
        hero_cta_text: 'Infaq / Donasi',
        hero_cta_link: '#donasi',
        show_sholat: true,
        show_about: true,
        show_posts: true,
        show_donations: true,

        // 3. Profil Masjid
        description: '',
        vision: '',
        mission: '',
        stats: [
            { label: 'Kapasitas Jamaah', value: '1.500+' },
            { label: 'Ber-AC & Karpet Premium', value: '100%' },
            { label: 'Program Kajian / Bulan', value: '12+' },
            { label: 'Operasional & Layanan', value: '24 Jam' }
        ],
        facilities: ['Ruang Sholat Ber-AC', 'Wudhu Clean & Higienis', 'Area Parkir Luas', 'Perpustakaan Islam', 'Layanan Ambulans', 'Wi-Fi Jamaah Gratis'],
        dkm_members: [
            { role: 'Ketua DKM', name: 'H. Ahmad Syarifuddin, S.E.', title: 'Penanggung Jawab Umum' },
            { role: 'Sekretaris DKM', name: 'Ustadz Ridwan, S.Pd.I', title: 'Administrasi & Surat' },
            { role: 'Bendahara DKM', name: 'H. Muhammad Zulkarnain', title: 'Keuangan & ZISWAF' },
            { role: 'Imam Utama & Marbot', name: 'Ustadz Al-Hafiz', title: 'Bimbingan Ibadah & Marbot' }
        ],

        // 4. Program & Donasi
        bank_name: 'Bank Syariah Indonesia (BSI)',
        bank_account: '7700-1234-5678',
        bank_holder: 'a.n DKM Masjid',

        // 6. Jadwal Sholat API
        sholat_city: 'jakarta',
        sholat_adjustment: 0,

        // 8. Galeri Media
        gallery_items: [
            { title: 'Kajian Rutin Sabtu Subuh', url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=600&auto=format&fit=crop&q=60' },
            { title: 'Kegiatan Santunan Anak Yatim', url: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=600&auto=format&fit=crop&q=60' }
        ],

        // 9. Footer & Sosmed
        instagram_url: '',
        youtube_url: '',
        facebook_url: '',
        whatsapp_number: '',
        copyright_text: 'Powered by Masjidku SaaS Platform'
    });

    // Modals for Berita & Kajian
    const [showPostModal, setShowPostModal] = useState(false);
    const [postForm, setPostForm] = useState({
        title: '',
        content: '',
        type: 'berita', // 'berita', 'kajian', 'agenda'
        speaker: '',
        event_date: '',
    });

    const fetchContent = async () => {
        setLoading(true);
        try {
            const [postsRes, donRes, masjidRes] = await Promise.all([
                api.get('/tenant/posts'),
                api.get('/tenant/donations'),
                api.get('/tenant/masjid')
            ]);
            setPosts(postsRes.data.data || []);
            setDonations(donRes.data.data || []);

            const info = masjidRes.data.data?.info;
            if (info) {
                const hp = info.homepage_settings || {};
                const soc = info.social_media || {};
                const bank = info.bank_accounts?.[0] || {};

                setCmsSettings(prev => ({
                    ...prev,
                    description: info.description || prev.description,
                    vision: info.vision || prev.vision,
                    mission: info.mission || prev.mission,
                    facilities: info.facilities && info.facilities.length > 0 ? info.facilities : prev.facilities,
                    stats: hp.stats && hp.stats.length > 0 ? hp.stats : prev.stats,
                    dkm_members: hp.dkm_members && hp.dkm_members.length > 0 ? hp.dkm_members : prev.dkm_members,
                    hero_title: hp.hero_title || `Selamat Datang di Official Portal Resmi ${masjidRes.data.data.name}`,
                    hero_subtitle: hp.hero_subtitle || masjidRes.data.data.address || '',
                    hero_cta_text: hp.hero_cta_text || prev.hero_cta_text,
                    hero_cta_link: hp.hero_cta_link || prev.hero_cta_link,
                    topbar_text: hp.topbar_text || prev.topbar_text,
                    sholat_city: hp.sholat_city || prev.sholat_city,
                    instagram_url: soc.instagram || '',
                    youtube_url: soc.youtube || '',
                    facebook_url: soc.facebook || '',
                    whatsapp_number: soc.whatsapp || masjidRes.data.data.phone || '',
                    bank_name: bank.bank_name || prev.bank_name,
                    bank_account: bank.account_number || prev.bank_account,
                    bank_holder: bank.account_holder || prev.bank_holder,
                }));
            }
        } catch (err) {
            console.error('Failed to load content', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContent();
    }, []);

    const handleSaveCMSSettings = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            await api.post('/tenant/masjid/info', {
                description: cmsSettings.description,
                vision: cmsSettings.vision,
                mission: cmsSettings.mission,
                facilities: cmsSettings.facilities,
                social_media: {
                    instagram: cmsSettings.instagram_url,
                    youtube: cmsSettings.youtube_url,
                    facebook: cmsSettings.facebook_url,
                    whatsapp: cmsSettings.whatsapp_number,
                },
                bank_accounts: [
                    {
                        bank_name: cmsSettings.bank_name,
                        account_number: cmsSettings.bank_account,
                        account_holder: cmsSettings.bank_holder,
                    }
                ],
                homepage_settings: {
                    topbar_text: cmsSettings.topbar_text,
                    hero_title: cmsSettings.hero_title,
                    hero_subtitle: cmsSettings.hero_subtitle,
                    hero_cta_text: cmsSettings.hero_cta_text,
                    hero_cta_link: cmsSettings.hero_cta_link,
                    sholat_city: cmsSettings.sholat_city,
                    sholat_adjustment: cmsSettings.sholat_adjustment,
                    nav_show_berita: cmsSettings.nav_show_berita,
                    nav_show_kajian: cmsSettings.nav_show_kajian,
                    nav_show_donasi: cmsSettings.nav_show_donasi,
                    nav_show_galeri: cmsSettings.nav_show_galeri,
                    nav_show_kontak: cmsSettings.nav_show_kontak,
                    stats: cmsSettings.stats,
                    dkm_members: cmsSettings.dkm_members,
                }
            });
            setMessage('Pengaturan konten berhasil disimpan!');
        } catch (err) {
            alert('Gagal menyimpan konten: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tenant/posts', postForm);
            setShowPostModal(false);
            setPostForm({ title: '', content: '', type: 'berita', speaker: '', event_date: '' });
            fetchContent();
        } catch (err) {
            alert('Gagal menambah konten: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeletePost = async (id) => {
        if (!confirm('Yakin ingin menghapus postingan ini?')) return;
        try {
            await api.delete(`/tenant/posts/${id}`);
            fetchContent();
        } catch (err) {
            alert('Gagal menghapus konten.');
        }
    };

    const tabs = [
        { id: 'header', label: '1. Header & Navigasi', icon: Navigation },
        { id: 'hero', label: '2. Hero / Banner', icon: Sparkles },
        { id: 'profil', label: '3. Profil Masjid', icon: Building },
        { id: 'program', label: '4. Program & Donasi', icon: HeartHandshake },
        { id: 'kajian', label: '5. Kajian & Agenda', icon: BookOpenCheck },
        { id: 'sholat', label: '6. Jadwal Sholat (API)', icon: Clock },
        { id: 'berita', label: '7. Berita Masjid', icon: FileText },
        { id: 'galeri', label: '8. Galeri Media', icon: Image },
        { id: 'footer', label: '9. Footer & Sosmed', icon: Share2 },
    ];

    if (loading) {
        return (
            <div className="flex justify-center p-12 text-xs text-slate-500 font-sans">
                <RefreshCw className="w-5 h-5 animate-spin mr-2 text-emerald-600" />
                <span>Memuat editor kelola konten masjid...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto font-sans">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <BookOpenCheck className="w-5 h-5 text-emerald-600" />
                        <span>CMS Pengelolaan Konten Website Masjid</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Atur struktur konten website: Header, Hero, Profil, Program, Kajian, Jadwal Sholat API, Berita, Galeri &amp; Footer.
                    </p>
                </div>
            </div>

            {/* Grid 2-Kolom: Left Vertical Tabs & Right Form Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Column: Vertical Sidebar Tabs */}
                <div className="lg:col-span-1 space-y-1.5 bg-white dark:bg-[#0f172a] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-fit sticky top-20">
                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                        Menu Kelola Konten
                    </div>
                    {tabs.map((t) => {
                        const Icon = t.icon;
                        const isActive = activeTab === t.id;
                        return (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setActiveTab(t.id)}
                                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold transition flex items-center justify-between group ${
                                    isActive
                                        ? 'bg-gradient-to-r from-[#164134] via-[#1c5242] to-[#226350] text-white shadow-md'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <div className="flex items-center space-x-2.5">
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#164134] dark:text-emerald-400 group-hover:scale-110 transition-transform'}`} />
                                    <span>{t.label}</span>
                                </div>
                                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                            </button>
                        );
                    })}
                </div>

                {/* Right Column: Content Editor Form Area */}
                <div className="lg:col-span-3 space-y-6">
                    {message && (
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{message}</span>
                        </div>
                    )}

                    {/* FORM WRAPPER FOR CMS SETTINGS */}
                    <form onSubmit={handleSaveCMSSettings} className="space-y-6">

                        {/* 1. HEADER & NAVIGASI */}
                        {activeTab === 'header' && (
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Navigation className="w-4 h-4 text-emerald-600" />
                            <span>Pengaturan Header & Topbar Running Text</span>
                        </h2>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Teks Running Bar Topbar</label>
                                <input
                                    type="text"
                                    value={cmsSettings.topbar_text}
                                    onChange={(e) => setCmsSettings({ ...cmsSettings, topbar_text: e.target.value })}
                                    placeholder="Teks pengumuman di paling atas website..."
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                                />
                            </div>

                            <div className="pt-2 space-y-2">
                                <label className="block font-bold">Menu Navigasi yang Ditampilkan</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    <label className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border flex items-center justify-between">
                                        <span>Profil Masjid</span>
                                        <input type="checkbox" checked={cmsSettings.nav_show_berita} onChange={(e) => setCmsSettings({ ...cmsSettings, nav_show_berita: e.target.checked })} className="w-4 h-4 text-emerald-600" />
                                    </label>
                                    <label className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border flex items-center justify-between">
                                        <span>Berita & Kajian</span>
                                        <input type="checkbox" checked={cmsSettings.nav_show_kajian} onChange={(e) => setCmsSettings({ ...cmsSettings, nav_show_kajian: e.target.checked })} className="w-4 h-4 text-emerald-600" />
                                    </label>
                                    <label className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border flex items-center justify-between">
                                        <span>Donasi QRIS</span>
                                        <input type="checkbox" checked={cmsSettings.nav_show_donasi} onChange={(e) => setCmsSettings({ ...cmsSettings, nav_show_donasi: e.target.checked })} className="w-4 h-4 text-emerald-600" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. HERO / BANNER */}
                {activeTab === 'hero' && (
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                            <span>Pengaturan Banner Utama (Hero Section)</span>
                        </h2>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="block font-bold mb-1">Judul Headline Hero *</label>
                                <input
                                    type="text"
                                    required
                                    value={cmsSettings.hero_title}
                                    onChange={(e) => setCmsSettings({ ...cmsSettings, hero_title: e.target.value })}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-1">Sub-Judul / Subtitle Banner</label>
                                <textarea
                                    rows="2"
                                    value={cmsSettings.hero_subtitle}
                                    onChange={(e) => setCmsSettings({ ...cmsSettings, hero_subtitle: e.target.value })}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold mb-1">Teks Tombol CTA</label>
                                    <input
                                        type="text"
                                        value={cmsSettings.hero_cta_text}
                                        onChange={(e) => setCmsSettings({ ...cmsSettings, hero_cta_text: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-1">Link Tujuan CTA</label>
                                    <input
                                        type="text"
                                        value={cmsSettings.hero_cta_link}
                                        onChange={(e) => setCmsSettings({ ...cmsSettings, hero_cta_link: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl font-mono"
                                    />
                                </div>
                            </div>

                            {/* Visibilitas Seksi Beranda */}
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                                <label className="block font-bold text-slate-900 dark:text-white">Pengaturan Visibilitas Seksi Beranda</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <label className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border flex items-center justify-between cursor-pointer font-bold">
                                        <span>Tampilkan Widget Jadwal Sholat</span>
                                        <input
                                            type="checkbox"
                                            checked={cmsSettings.show_sholat}
                                            onChange={(e) => setCmsSettings({ ...cmsSettings, show_sholat: e.target.checked })}
                                            className="w-4 h-4 text-emerald-600 rounded"
                                        />
                                    </label>
                                    <label className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border flex items-center justify-between cursor-pointer font-bold">
                                        <span>Tampilkan Seksi Profil &amp; Sejarah</span>
                                        <input
                                            type="checkbox"
                                            checked={cmsSettings.show_about}
                                            onChange={(e) => setCmsSettings({ ...cmsSettings, show_about: e.target.checked })}
                                            className="w-4 h-4 text-emerald-600 rounded"
                                        />
                                    </label>
                                    <label className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border flex items-center justify-between cursor-pointer font-bold">
                                        <span>Tampilkan Seksi Berita &amp; Kajian</span>
                                        <input
                                            type="checkbox"
                                            checked={cmsSettings.show_posts}
                                            onChange={(e) => setCmsSettings({ ...cmsSettings, show_posts: e.target.checked })}
                                            className="w-4 h-4 text-emerald-600 rounded"
                                        />
                                    </label>
                                    <label className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border flex items-center justify-between cursor-pointer font-bold">
                                        <span>Tampilkan Seksi Donasi QRIS</span>
                                        <input
                                            type="checkbox"
                                            checked={cmsSettings.show_donations}
                                            onChange={(e) => setCmsSettings({ ...cmsSettings, show_donations: e.target.checked })}
                                            className="w-4 h-4 text-emerald-600 rounded"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. PROFIL MASJID */}
                {activeTab === 'profil' && (
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-3 border-slate-200 dark:border-slate-800">
                            <Building className="w-4 h-4 text-emerald-600" />
                            <span>Pengaturan Profil, Visi Misi, Statistik & Struktur DKM</span>
                        </h2>

                        <div className="space-y-6 text-xs">
                            {/* Sejarah & Deskripsi */}
                            <div>
                                <label className="block font-bold mb-1">Deskripsi Sejarah & Profil Masjid</label>
                                <textarea
                                    rows="4"
                                    placeholder="Jelaskan sejarah berdirinya masjid, lokasi, dan latar belakang..."
                                    value={cmsSettings.description}
                                    onChange={(e) => setCmsSettings({ ...cmsSettings, description: e.target.value })}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                                ></textarea>
                            </div>

                            {/* Visi & Misi */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold mb-1">Visi Masjid</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Cita-cita & Visi utama masjid..."
                                        value={cmsSettings.vision}
                                        onChange={(e) => setCmsSettings({ ...cmsSettings, vision: e.target.value })}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block font-bold mb-1">Misi Keumatan (Bisa Teks / Poin-poin)</label>
                                    <textarea
                                        rows="3"
                                        placeholder="1. Menyelenggarakan ibadah khusyuk...&#10;2. Pendidikan Al-Qur'an..."
                                        value={cmsSettings.mission}
                                        onChange={(e) => setCmsSettings({ ...cmsSettings, mission: e.target.value })}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                                    ></textarea>
                                </div>
                            </div>

                            {/* 1. Dynamic Card Statistik (Tambah / Kurang) */}
                            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <Sparkles className="w-4 h-4 text-amber-500" />
                                        <span>Kartu Statistik Ringkas (Bisa Tambah / Hapus Card)</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const updated = [...(cmsSettings.stats || [])];
                                            updated.push({ label: 'Statistik Baru', value: '100+' });
                                            setCmsSettings({ ...cmsSettings, stats: updated });
                                        }}
                                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1 shadow-sm transition"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Tambah Card Statistik</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {(cmsSettings.stats || []).map((st, idx) => (
                                        <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900/60 border rounded-xl flex items-center gap-2">
                                            <div className="flex-1 space-y-1">
                                                <input
                                                    type="text"
                                                    placeholder="Label (e.g. Kapasitas)"
                                                    value={st.label}
                                                    onChange={(e) => {
                                                        const updated = [...cmsSettings.stats];
                                                        updated[idx].label = e.target.value;
                                                        setCmsSettings({ ...cmsSettings, stats: updated });
                                                    }}
                                                    className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg text-xs font-bold"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Nilai (e.g. 1.500+)"
                                                    value={st.value}
                                                    onChange={(e) => {
                                                        const updated = [...cmsSettings.stats];
                                                        updated[idx].value = e.target.value;
                                                        setCmsSettings({ ...cmsSettings, stats: updated });
                                                    }}
                                                    className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = cmsSettings.stats.filter((_, i) => i !== idx);
                                                    setCmsSettings({ ...cmsSettings, stats: updated });
                                                }}
                                                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                                                title="Hapus Stat Card ini"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 2. Dynamic Fasilitas Masjid (Tambah / Kurang) */}
                            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <Building className="w-4 h-4 text-blue-500" />
                                        <span>Kelola Fasilitas & Sarana Ibadah</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const updated = [...(cmsSettings.facilities || [])];
                                            updated.push('🕌 Fasilitas Baru');
                                            setCmsSettings({ ...cmsSettings, facilities: updated });
                                        }}
                                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1 shadow-sm transition"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Tambah Fasilitas</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {(cmsSettings.facilities || []).map((fac, idx) => (
                                        <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-900/60 border rounded-xl flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={fac}
                                                onChange={(e) => {
                                                    const updated = [...cmsSettings.facilities];
                                                    updated[idx] = e.target.value;
                                                    setCmsSettings({ ...cmsSettings, facilities: updated });
                                                }}
                                                className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg text-xs font-bold"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = cmsSettings.facilities.filter((_, i) => i !== idx);
                                                    setCmsSettings({ ...cmsSettings, facilities: updated });
                                                }}
                                                className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition shrink-0"
                                                title="Hapus Fasilitas ini"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 3. Dynamic Susunan Pengurus DKM (Tambah / Kurang) */}
                            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <FileText className="w-4 h-4 text-purple-500" />
                                        <span>Struktur Kepengurusan DKM (Tambah / Hapus Pengurus)</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const updated = [...(cmsSettings.dkm_members || [])];
                                            updated.push({ role: 'Anggota DKM', name: 'Nama Pengurus', title: 'Tugas Utama' });
                                            setCmsSettings({ ...cmsSettings, dkm_members: updated });
                                        }}
                                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1 shadow-sm transition"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Tambah Pengurus DKM</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {(cmsSettings.dkm_members || []).map((mb, idx) => (
                                        <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900/60 border rounded-xl space-y-2 relative group">
                                            <div className="flex items-center justify-between gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Jabatan / Peran (e.g. Ketua DKM)"
                                                    value={mb.role}
                                                    onChange={(e) => {
                                                        const updated = [...cmsSettings.dkm_members];
                                                        updated[idx].role = e.target.value;
                                                        setCmsSettings({ ...cmsSettings, dkm_members: updated });
                                                    }}
                                                    className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg text-xs font-extrabold text-[#164134] dark:text-emerald-400"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = cmsSettings.dkm_members.filter((_, i) => i !== idx);
                                                        setCmsSettings({ ...cmsSettings, dkm_members: updated });
                                                    }}
                                                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition shrink-0"
                                                    title="Hapus Pengurus DKM ini"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Nama Lengkap & Gelar"
                                                    value={mb.name}
                                                    onChange={(e) => {
                                                        const updated = [...cmsSettings.dkm_members];
                                                        updated[idx].name = e.target.value;
                                                        setCmsSettings({ ...cmsSettings, dkm_members: updated });
                                                    }}
                                                    className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg text-xs font-bold"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Keterangan Tugas / Subtitle"
                                                    value={mb.title}
                                                    onChange={(e) => {
                                                        const updated = [...cmsSettings.dkm_members];
                                                        updated[idx].title = e.target.value;
                                                        setCmsSettings({ ...cmsSettings, dkm_members: updated });
                                                    }}
                                                    className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg text-xs text-slate-500"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. PROGRAM & DONASI */}
                {activeTab === 'program' && (
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <HeartHandshake className="w-4 h-4 text-emerald-600" />
                            <span>Program DKM & Rekening Infaq QRIS</span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div>
                                <label className="block font-bold mb-1">Nama Bank Official</label>
                                <input
                                    type="text"
                                    value={cmsSettings.bank_name}
                                    onChange={(e) => setCmsSettings({ ...cmsSettings, bank_name: e.target.value })}
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1">Nomor Rekening</label>
                                <input
                                    type="text"
                                    value={cmsSettings.bank_account}
                                    onChange={(e) => setCmsSettings({ ...cmsSettings, bank_account: e.target.value })}
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl font-mono"
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1">Atas Nama (a.n)</label>
                                <input
                                    type="text"
                                    value={cmsSettings.bank_holder}
                                    onChange={(e) => setCmsSettings({ ...cmsSettings, bank_holder: e.target.value })}
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. KAJIAN & AGENDA */}
                {activeTab === 'kajian' && (
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                        <div className="flex justify-between items-center">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <BookOpenCheck className="w-4 h-4 text-emerald-600" />
                                <span>Daftar Jadwal Kajian Rutin & Agenda</span>
                            </h2>
                            <button
                                type="button"
                                onClick={() => {
                                    setPostForm({ title: '', content: '', type: 'kajian', speaker: '', event_date: '' });
                                    setShowPostModal(true);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white"
                            >
                                + Tambah Agenda Kajian
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            {posts.filter(p => p.type === 'kajian' || p.speaker).map(p => (
                                <div key={p.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border space-y-1">
                                    <div className="font-bold text-slate-900 dark:text-white">{p.title}</div>
                                    <div className="text-emerald-600 font-semibold">Pemateri: {p.speaker || 'Ustadz'}</div>
                                    <p className="text-slate-500 line-clamp-2">{p.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 6. JADWAL SHOLAT (API) */}
                {activeTab === 'sholat' && (
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Clock className="w-4 h-4 text-emerald-600" />
                            <span>Pengaturan API Integrasi Jadwal Sholat</span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                                <label className="block font-bold mb-1">Pilih Kota / Kabupaten (API Kemenag)</label>
                                <select
                                    value={cmsSettings.sholat_city}
                                    onChange={(e) => setCmsSettings({ ...cmsSettings, sholat_city: e.target.value })}
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl font-bold"
                                >
                                    <option value="jakarta">DKI Jakarta &amp; Sekitarnya</option>
                                    <option value="bandung">Kota Bandung &amp; Jawa Barat</option>
                                    <option value="surabaya">Kota Surabaya &amp; Jawa Timur</option>
                                    <option value="medan">Kota Medan &amp; Sumatera Utara</option>
                                    <option value="makassar">Kota Makassar &amp; Sulawesi Selatan</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-bold mb-1">Koreksi Menit Sholat (+/- Menit)</label>
                                <input
                                    type="number"
                                    value={cmsSettings.sholat_adjustment}
                                    onChange={(e) => setCmsSettings({ ...cmsSettings, sholat_adjustment: parseInt(e.target.value) || 0 })}
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* 7. BERITA MASJID */}
                {activeTab === 'berita' && (
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                        <div className="flex justify-between items-center">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <FileText className="w-4 h-4 text-emerald-600" />
                                <span>Artikel Berita & Pengumuman Jamaah</span>
                            </h2>
                            <button
                                type="button"
                                onClick={() => {
                                    setPostForm({ title: '', content: '', type: 'berita', speaker: '', event_date: '' });
                                    setShowPostModal(true);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white"
                            >
                                + Tulis Berita Baru
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            {posts.filter(p => p.type === 'berita' || !p.type).map(p => (
                                <div key={p.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border space-y-2">
                                    <div className="flex justify-between font-bold">
                                        <span className="text-slate-900 dark:text-white">{p.title}</span>
                                        <button type="button" onClick={() => handleDeletePost(p.id)} className="text-rose-500">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <p className="text-slate-500 line-clamp-2">{p.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 8. GALERI MEDIA */}
                {activeTab === 'galeri' && (
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Image className="w-4 h-4 text-emerald-600" />
                            <span>Galeri Dokumentasi Media Foto Masjid</span>
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            {cmsSettings.gallery_items.map((item, idx) => (
                                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border space-y-2">
                                    <img src={item.url} alt={item.title} className="w-full h-32 object-cover rounded-lg" />
                                    <div className="font-bold text-slate-900 dark:text-white">{item.title}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 9. FOOTER & SOSMED */}
                {activeTab === 'footer' && (
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Share2 className="w-4 h-4 text-emerald-600" />
                            <span>Link Social Media & Pengaturan Footer</span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                                <label className="block font-bold mb-1">Instagram URL</label>
                                <input
                                    type="text"
                                    value={cmsSettings.instagram_url}
                                    onChange={(e) => setCmsSettings({ ...cmsSettings, instagram_url: e.target.value })}
                                    placeholder="https://instagram.com/masjidalikhlas"
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1">YouTube Channel URL</label>
                                <input
                                    type="text"
                                    value={cmsSettings.youtube_url}
                                    onChange={(e) => setCmsSettings({ ...cmsSettings, youtube_url: e.target.value })}
                                    placeholder="https://youtube.com/@masjidalikhlas"
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1">No. WhatsApp DKM</label>
                                <input
                                    type="text"
                                    value={cmsSettings.whatsapp_number}
                                    onChange={(e) => setCmsSettings({ ...cmsSettings, whatsapp_number: e.target.value })}
                                    placeholder="081234567890"
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1">Facebook Page URL</label>
                                <input
                                    type="text"
                                    value={cmsSettings.facebook_url}
                                    onChange={(e) => setCmsSettings({ ...cmsSettings, facebook_url: e.target.value })}
                                    placeholder="https://facebook.com/masjidalikhlas"
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* SAVE BUTTON */}
                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-extrabold text-xs text-white shadow-lg shadow-emerald-600/20 flex items-center space-x-2 transition"
                    >
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>Simpan Pengaturan Konten</span>
                    </button>
                </div>
            </form>
        </div>
    </div>

            {/* Modal Create Post / Kajian */}
            {showPostModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0f172a] border rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
                        <h3 className="font-bold text-base">Tambah Berita / Kajian Baru</h3>
                        <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-bold mb-1">Judul Post *</label>
                                <input
                                    type="text"
                                    required
                                    value={postForm.title}
                                    onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1">Kategori Konten</label>
                                <select
                                    value={postForm.type}
                                    onChange={(e) => setPostForm({ ...postForm, type: e.target.value })}
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl font-bold"
                                >
                                    <option value="berita">Artikel Berita &amp; Pengumuman</option>
                                    <option value="kajian">Agenda Kajian Rutin</option>
                                </select>
                            </div>
                            {postForm.type === 'kajian' && (
                                <div>
                                    <label className="block font-bold mb-1">Nama Pemateri / Ustadz</label>
                                    <input
                                        type="text"
                                        value={postForm.speaker}
                                        onChange={(e) => setPostForm({ ...postForm, speaker: e.target.value })}
                                        placeholder="Contoh: Ustadz Dr. Abdullah, M.A."
                                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block font-bold mb-1">Isi Konten *</label>
                                <textarea
                                    rows="4"
                                    required
                                    value={postForm.content}
                                    onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                                ></textarea>
                            </div>
                            <div className="flex justify-end space-x-2 pt-2">
                                <button type="button" onClick={() => setShowPostModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold">
                                    Batal
                                </button>
                                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold">
                                    Publikasikan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
