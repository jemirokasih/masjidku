import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Layout, Sparkles, FileText, Plus, Save, RefreshCw, 
    CheckCircle2, Trash2, Edit3, Eye, ToggleLeft, ToggleRight, Globe
} from 'lucide-react';

export default function CMSPageManager() {
    const [activeTab, setActiveTab] = useState('homepage'); // 'homepage' or 'pages'
    const [loading, setLoading] = useState(true);
    const [savingHero, setSavingHero] = useState(false);
    const [message, setMessage] = useState('');

    // Homepage Hero & Sections State
    const [homepageSettings, setHomepageSettings] = useState({
        hero_title: '',
        hero_subtitle: '',
        hero_cta_text: 'Infaq / Donasi',
        hero_cta_link: '#donasi',
        show_sholat: true,
        show_about: true,
        show_posts: true,
        show_donations: true,
    });

    // Custom Pages State
    const [pages, setPages] = useState([]);
    const [showPageModal, setShowPageModal] = useState(false);
    const [editingPageId, setEditingPageId] = useState(null);
    const [pageForm, setPageForm] = useState({
        title: '',
        slug: '',
        content: '',
        is_published: true,
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [masjidRes, pagesRes] = await Promise.all([
                api.get('/tenant/masjid'),
                api.get('/tenant/pages')
            ]);

            const info = masjidRes.data.data?.info;
            if (info?.homepage_settings) {
                setHomepageSettings(prev => ({ ...prev, ...info.homepage_settings }));
            } else if (masjidRes.data.data) {
                setHomepageSettings(prev => ({
                    ...prev,
                    hero_title: `Selamat Datang di Official Portal Resmi ${masjidRes.data.data.name}`,
                    hero_subtitle: masjidRes.data.data.address || '',
                }));
            }

            setPages(pagesRes.data.data || []);
        } catch (err) {
            console.error('Failed to load CMS settings', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSaveHomepage = async (e) => {
        e.preventDefault();
        setSavingHero(true);
        setMessage('');
        try {
            await api.post('/tenant/masjid/info', {
                homepage_settings: homepageSettings
            });
            setMessage('Pengaturan Hero Banner & Seksi Beranda berhasil disimpan!');
        } catch (err) {
            alert('Gagal menyimpan pengaturan beranda: ' + (err.response?.data?.message || err.message));
        } finally {
            setSavingHero(false);
        }
    };

    const handleSavePage = async (e) => {
        e.preventDefault();
        try {
            if (editingPageId) {
                await api.put(`/tenant/pages/${editingPageId}`, pageForm);
            } else {
                await api.post('/tenant/pages', pageForm);
            }
            setShowPageModal(false);
            setEditingPageId(null);
            setPageForm({ title: '', slug: '', content: '', is_published: true });
            fetchData();
        } catch (err) {
            alert('Gagal menyimpan halaman: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeletePage = async (id) => {
        if (!confirm('Yakin ingin menghapus halaman statis ini?')) return;
        try {
            await api.delete(`/tenant/pages/${id}`);
            fetchData();
        } catch (err) {
            alert('Gagal menghapus halaman.');
        }
    };

    const openEditPage = (page) => {
        setEditingPageId(page.id);
        setPageForm({
            title: page.title,
            slug: page.slug,
            content: page.content,
            is_published: page.is_published,
        });
        setShowPageModal(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12 text-xs text-slate-500">
                <RefreshCw className="w-5 h-5 animate-spin mr-2 text-emerald-600" />
                <span>Memuat pengaturan CMS halaman...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto font-sans">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Layout className="w-5 h-5 text-emerald-600" />
                        <span>CMS Pengaturan Halaman & Banner</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Atur tampilan hero banner beranda dan kelola halaman profil/statis kustom masjid Anda.
                    </p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('homepage')}
                    className={`px-4 py-2.5 text-xs font-bold transition border-b-2 ${
                        activeTab === 'homepage'
                            ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Pengaturan Beranda & Hero Banner
                </button>
                <button
                    onClick={() => setActiveTab('pages')}
                    className={`px-4 py-2.5 text-xs font-bold transition border-b-2 ${
                        activeTab === 'pages'
                            ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Halaman Statis Kustom ({pages.length})
                </button>
            </div>

            {message && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{message}</span>
                </div>
            )}

            {/* TAB 1: HOMEPAGE & HERO BANNER CONFIGURATOR */}
            {activeTab === 'homepage' && (
                <form onSubmit={handleSaveHomepage} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                            <span>Konfigurasi Hero Banner Beranda</span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="md:col-span-2">
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Hero (Headline) *</label>
                                <input
                                    type="text"
                                    required
                                    value={homepageSettings.hero_title}
                                    onChange={(e) => setHomepageSettings({ ...homepageSettings, hero_title: e.target.value })}
                                    placeholder="Contoh: Selamat Datang di Official Portal Resmi Masjid Al-Furqon"
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sub-Judul / Deskripsi Singkat</label>
                                <textarea
                                    rows="2"
                                    value={homepageSettings.hero_subtitle}
                                    onChange={(e) => setHomepageSettings({ ...homepageSettings, hero_subtitle: e.target.value })}
                                    placeholder="Deskripsi singkat yang tampil di bawah judul utama..."
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Teks Tombol CTA</label>
                                <input
                                    type="text"
                                    value={homepageSettings.hero_cta_text}
                                    onChange={(e) => setHomepageSettings({ ...homepageSettings, hero_cta_text: e.target.value })}
                                    placeholder="Contoh: Infaq / Donasi"
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Link Tujuan Tombol</label>
                                <input
                                    type="text"
                                    value={homepageSettings.hero_cta_link}
                                    onChange={(e) => setHomepageSettings({ ...homepageSettings, hero_cta_link: e.target.value })}
                                    placeholder="Contoh: #donasi atau /p/laporan"
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-slate-100"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section Visibility Toggles */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Pengaturan Tampilan Seksi Beranda</h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <label className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer">
                                <span>Tampilkan Widget Jadwal Sholat</span>
                                <input
                                    type="checkbox"
                                    checked={homepageSettings.show_sholat}
                                    onChange={(e) => setHomepageSettings({ ...homepageSettings, show_sholat: e.target.checked })}
                                    className="w-4 h-4 rounded text-emerald-600"
                                />
                            </label>

                            <label className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer">
                                <span>Tampilkan Seksi Berita & Kajian</span>
                                <input
                                    type="checkbox"
                                    checked={homepageSettings.show_posts}
                                    onChange={(e) => setHomepageSettings({ ...homepageSettings, show_posts: e.target.checked })}
                                    className="w-4 h-4 rounded text-emerald-600"
                                />
                            </label>

                            <label className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer">
                                <span>Tampilkan Seksi Donasi QRIS</span>
                                <input
                                    type="checkbox"
                                    checked={homepageSettings.show_donations}
                                    onChange={(e) => setHomepageSettings({ ...homepageSettings, show_donations: e.target.checked })}
                                    className="w-4 h-4 rounded text-emerald-600"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={savingHero}
                            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-md flex items-center space-x-2 transition"
                        >
                            {savingHero ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            <span>Simpan Pengaturan Beranda</span>
                        </button>
                    </div>
                </form>
            )}

            {/* TAB 2: CUSTOM PAGES MANAGEMENT */}
            {activeTab === 'pages' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button
                            onClick={() => {
                                setEditingPageId(null);
                                setPageForm({ title: '', slug: '', content: '', is_published: true });
                                setShowPageModal(true);
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-md flex items-center space-x-1.5 transition"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Buat Halaman Kustom Baru</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pages.length === 0 ? (
                            <div className="md:col-span-2 p-8 text-center bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-500">
                                Belum ada halaman statis kustom. Contoh halaman: Profil Sejarah Masjid, Struktur DKM, atau Laporan Keuangan.
                            </div>
                        ) : (
                            pages.map((page) => (
                                <div key={page.id} className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm relative">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-[11px] text-emerald-600 font-bold">/p/{page.slug}</span>
                                        <div className="flex space-x-2">
                                            <button onClick={() => openEditPage(page)} className="text-slate-400 hover:text-blue-500 transition">
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeletePage(page.id)} className="text-slate-400 hover:text-rose-500 transition">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{page.title}</h3>
                                    <p className="text-xs text-slate-500 line-clamp-2">{page.content || 'Tanpa isi konten.'}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Modal Add / Edit Custom Page */}
            {showPageModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">
                            {editingPageId ? 'Edit Halaman Statis' : 'Buat Halaman Statis Baru'}
                        </h3>
                        <form onSubmit={handleSavePage} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-bold mb-1">Judul Halaman *</label>
                                <input
                                    type="text"
                                    required
                                    value={pageForm.title}
                                    onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })}
                                    placeholder="Contoh: Sejarah & Profil Masjid"
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1">Slug URL (Opsional)</label>
                                <input
                                    type="text"
                                    value={pageForm.slug}
                                    onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })}
                                    placeholder="sejarah"
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl font-mono"
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1">Isi Konten Halaman</label>
                                <textarea
                                    rows="6"
                                    value={pageForm.content}
                                    onChange={(e) => setPageForm({ ...pageForm, content: e.target.value })}
                                    placeholder="Tuliskan isi informasi halaman statis di sini..."
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                                ></textarea>
                            </div>
                            <div className="flex justify-end space-x-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPageModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold"
                                >
                                    Simpan Halaman
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

