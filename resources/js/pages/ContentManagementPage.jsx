import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { BookOpenCheck, Plus, RefreshCw, FileText, HeartHandshake, Trash2 } from 'lucide-react';

export default function ContentManagementPage() {
    const [posts, setPosts] = useState([]);
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'donations'

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
            const [postsRes, donRes] = await Promise.all([
                api.get('/tenant/posts'),
                api.get('/tenant/donations')
            ]);
            setPosts(postsRes.data.data || []);
            setDonations(donRes.data.data || []);
        } catch (err) {
            console.error('Failed to load content', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContent();
    }, []);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tenant/posts', postForm);
            setShowPostModal(false);
            setPostForm({ title: '', content: '', type: 'berita', speaker: '', event_date: '' });
            fetchContent();
        } catch (err) {
            alert('Gagal menambah postingan: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeletePost = async (id) => {
        if (!confirm('Yakin ingin menghapus konten ini?')) return;
        try {
            await api.delete(`/tenant/posts/${id}`);
            fetchContent();
        } catch (err) {
            alert('Gagal menghapus konten.');
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <BookOpenCheck className="w-5 h-5 text-emerald-600" />
                        <span>Kelola Konten & Agenda</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Publikasikan artikel berita, jadwal kajian ustadz, dan program infaq/donasi.
                    </p>
                </div>

                <button
                    onClick={() => setShowPostModal(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-md flex items-center space-x-1.5 transition"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Berita / Kajian</span>
                </button>
            </div>

            {/* Tabs Navigation */}
            <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('posts')}
                    className={`px-4 py-2 text-xs font-bold transition border-b-2 ${
                        activeTab === 'posts'
                            ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Berita & Kajian ({posts.length})
                </button>
                <button
                    onClick={() => setActiveTab('donations')}
                    className={`px-4 py-2 text-xs font-bold transition border-b-2 ${
                        activeTab === 'donations'
                            ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Program Infaq & Donasi ({donations.length})
                </button>
            </div>

            {/* Content List */}
            {loading ? (
                <div className="flex justify-center p-12 text-xs text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mr-2 text-emerald-600" />
                    <span>Memuat konten...</span>
                </div>
            ) : activeTab === 'posts' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {posts.length === 0 ? (
                        <div className="md:col-span-2 p-8 text-center bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-500">
                            Belum ada postingan berita atau kajian. Klik "Tambah Berita / Kajian" untuk membuat.
                        </div>
                    ) : (
                        posts.map((p) => (
                            <div key={p.id} className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 space-y-3 relative shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                        {p.type}
                                    </span>
                                    <button
                                        onClick={() => handleDeletePost(p.id)}
                                        className="text-slate-400 hover:text-rose-500 transition"
                                        title="Hapus Konten"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{p.title}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{p.content}</p>
                                {p.speaker && <div className="text-[11px] text-emerald-600 font-semibold">Pemateri: {p.speaker}</div>}
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {donations.length === 0 ? (
                        <div className="md:col-span-2 p-8 text-center bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-500">
                            Belum ada program infaq atau donasi terdaftar.
                        </div>
                    ) : (
                        donations.map((d) => (
                            <div key={d.id} className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{d.title}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{d.description}</p>
                                <div className="text-xs font-mono font-bold text-emerald-600">
                                    Terkumpul: Rp {new Intl.NumberFormat('id-ID').format(d.current_amount || 0)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal Add Post */}
            {showPostModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">Tambah Berita / Kajian Baru</h3>
                        <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-bold mb-1">Judul *</label>
                                <input
                                    type="text"
                                    required
                                    value={postForm.title}
                                    onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1">Kategori *</label>
                                <select
                                    value={postForm.type}
                                    onChange={(e) => setPostForm({ ...postForm, type: e.target.value })}
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                                >
                                    <option value="berita">Berita Masjid</option>
                                    <option value="kajian">Jadwal Kajian</option>
                                    <option value="agenda">Agenda Kegiatan</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-bold mb-1">Konten / Isi *</label>
                                <textarea
                                    rows="3"
                                    required
                                    value={postForm.content}
                                    onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                                ></textarea>
                            </div>
                            {postForm.type === 'kajian' && (
                                <div>
                                    <label className="block font-bold mb-1">Pemateri / Ustadz</label>
                                    <input
                                        type="text"
                                        value={postForm.speaker}
                                        onChange={(e) => setPostForm({ ...postForm, speaker: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                                    />
                                </div>
                            )}
                            <div className="flex justify-end space-x-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPostModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold"
                                >
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

