import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { 
    ShieldCheck, Building, Users, Clock, CheckCircle2, 
    XCircle, ArrowRight, RefreshCw, Eye, Sparkles
} from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalMasjids: 0,
        pendingMasjids: 0,
        approvedMasjids: 0,
        rejectedMasjids: 0,
        recentMasjids: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminStats = async () => {
            setLoading(true);
            try {
                const res = await api.get('/admin/masjids');
                const masjids = res.data.data || [];
                const total = res.data.meta?.total || masjids.length;

                const pending = masjids.filter(m => m.verification_status === 'pending').length;
                const approved = masjids.filter(m => m.verification_status === 'approved').length;
                const rejected = masjids.filter(m => m.verification_status === 'rejected').length;

                setStats({
                    totalMasjids: total,
                    pendingMasjids: pending,
                    approvedMasjids: approved,
                    rejectedMasjids: rejected,
                    recentMasjids: masjids.slice(0, 5),
                });
            } catch (err) {
                console.error('Failed to load admin dashboard stats', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminStats();
    }, []);

    return (
        <div className="space-y-6 font-sans max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <span>Dashboard Platform Admin — Masjidku.id</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Kelola pendaftaran pengurus masjid, verifikasi berkas, dan marketplace tema platform SaaS.
                    </p>
                </div>

                <Link
                    to="/admin/verifikasi-masjid"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition"
                >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verifikasi Pendaftaran</span>
                </Link>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>TOTAL MASJID TERDAFTAR</span>
                        <Building className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                        {stats.totalMasjids} Masjid
                    </div>
                    <div className="text-[11px] text-slate-400">Pengguna Platform SaaS</div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 border-l-4 border-l-amber-500">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>MENUNGGU VERIFIKASI</span>
                        <Clock className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-black text-amber-500 font-mono">
                        {stats.pendingMasjids} Permohonan
                    </div>
                    <div className="text-[11px] text-slate-400">Perlu Peninjauan Dokumen</div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 border-l-4 border-l-emerald-500">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>DISERTAI & APPROVED</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-black text-emerald-500 font-mono">
                        {stats.approvedMasjids} Masjid
                    </div>
                    <div className="text-[11px] text-slate-400">Website Publik Online</div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 border-l-4 border-l-rose-500">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>DITOLAK (REJECTED)</span>
                        <XCircle className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="text-2xl font-black text-rose-500 font-mono">
                        {stats.rejectedMasjids} Permohonan
                    </div>
                    <div className="text-[11px] text-slate-400">Dokumen Tidak Sesuai</div>
                </div>
            </div>

            {/* Recent Registrations Table */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pendaftaran Masjid Terbaru</h3>
                        <p className="text-xs text-slate-500">Daftar permohonan pendaftaran website masjid terkini.</p>
                    </div>
                    <Link to="/admin/verifikasi-masjid" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                        <span>Lihat Semua Verifikasi</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center p-8 text-xs text-slate-500">
                        <RefreshCw className="w-4 h-4 animate-spin mr-2 text-emerald-600" />
                        <span>Memuat data...</span>
                    </div>
                ) : stats.recentMasjids.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                        Belum ada pendaftaran masjid terbaru.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/60">
                                    <th className="py-3 px-4">Nama Masjid</th>
                                    <th className="py-3 px-4">Subdomain</th>
                                    <th className="py-3 px-4">Pengurus</th>
                                    <th className="py-3 px-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {stats.recentMasjids.map((m) => (
                                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{m.name}</td>
                                        <td className="py-3 px-4 font-mono text-emerald-600">{m.slug}.masjidku.id</td>
                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{m.user?.name || '-'}</td>
                                        <td className="py-3 px-4 uppercase font-bold text-[10px] text-amber-500">{m.verification_status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

