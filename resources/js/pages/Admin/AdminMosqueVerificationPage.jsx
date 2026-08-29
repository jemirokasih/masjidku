import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
    ShieldCheck, CheckCircle2, XCircle, Clock, Search, 
    FileText, Eye, ExternalLink, RefreshCw, AlertCircle, Phone, Mail, Building
} from 'lucide-react';

export default function AdminMosqueVerificationPage() {
    const [masjids, setMasjids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState(''); // '', 'pending', 'approved', 'rejected'
    const [selectedMasjid, setSelectedMasjid] = useState(null);
    const [verifying, setVerifying] = useState(false);
    const [verifyNote, setVerifyNote] = useState('');

    const fetchMasjids = async () => {
        setLoading(true);
        try {
            const url = statusFilter ? `/admin/masjids?status=${statusFilter}` : '/admin/masjids';
            const res = await api.get(url);
            setMasjids(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch masjids for admin verification', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMasjids();
    }, [statusFilter]);

    const handleVerify = async (id, status) => {
        setVerifying(true);
        try {
            await api.post(`/admin/masjids/${id}/verify`, {
                status: status,
                note: verifyNote
            });
            alert(`Berhasil mengubah status verifikasi masjid menjadi ${status.toUpperCase()}`);
            setSelectedMasjid(null);
            setVerifyNote('');
            fetchMasjids();
        } catch (err) {
            alert('Gagal memverifikasi: ' + (err.response?.data?.message || err.message));
        } finally {
            setVerifying(false);
        }
    };

    const statusPills = {
        pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        rejected: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    };

    return (
        <div className="space-y-6 font-sans max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <span>Verifikasi Pendaftaran Masjid — Panel Admin Masjidku.id</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Tinjau berkas SK Kepengurusan & verifikasi hak akses publik website masjid yang mendaftar.
                    </p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <button
                    onClick={() => setStatusFilter('')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                        statusFilter === '' 
                            ? 'bg-emerald-600 text-white shadow-md' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                >
                    Semua Masjid
                </button>
                <button
                    onClick={() => setStatusFilter('pending')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                        statusFilter === 'pending' 
                            ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Menunggu Approval (Pending)</span>
                </button>
                <button
                    onClick={() => setStatusFilter('approved')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                        statusFilter === 'approved' 
                            ? 'bg-emerald-600 text-white shadow-md' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Disetujui (Approved)</span>
                </button>
                <button
                    onClick={() => setStatusFilter('rejected')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                        statusFilter === 'rejected' 
                            ? 'bg-rose-600 text-white shadow-md' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Ditolak (Rejected)</span>
                </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                {loading ? (
                    <div className="flex justify-center p-12 text-xs text-slate-500">
                        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-emerald-600" />
                        <span>Memuat data verifikasi masjid...</span>
                    </div>
                ) : masjids.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                        Tidak ada data pendaftaran masjid pada kategori ini.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                    <th className="py-3 px-4">Nama Masjid & Subdomain</th>
                                    <th className="py-3 px-4">Pengurus & Kontak</th>
                                    <th className="py-3 px-4">Lokasi</th>
                                    <th className="py-3 px-4">Status Verifikasi</th>
                                    <th className="py-3 px-4 text-right">Aksi Peninjauan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                {masjids.map((m) => (
                                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                        <td className="py-3 px-4">
                                            <div className="font-bold text-slate-900 dark:text-white">{m.name}</div>
                                            <div className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">{m.slug}.masjidku.id</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-semibold text-slate-800 dark:text-slate-200">{m.user?.name || '-'}</div>
                                            <div className="text-[11px] text-slate-500">{m.phone || m.user?.phone || m.email}</div>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                                            {m.city ? `${m.city}, ${m.province || ''}` : '-'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase ${statusPills[m.verification_status] || statusPills.pending}`}>
                                                {m.verification_status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right space-x-2">
                                            <a
                                                href={`/m/${m.slug}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold text-[11px] inline-flex items-center space-x-1"
                                            >
                                                <Eye className="w-3.5 h-3.5 text-emerald-500" />
                                                <span>Pratinjau</span>
                                            </a>
                                            <button
                                                onClick={() => setSelectedMasjid(m)}
                                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] inline-flex items-center space-x-1 shadow"
                                            >
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                <span>Tinjau</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Detail & Verification Action */}
            {selectedMasjid && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-xl space-y-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div>
                                <h3 className="font-bold text-base text-slate-900 dark:text-white">Peninjauan Dokumen Pendaftaran</h3>
                                <p className="text-xs text-slate-500">{selectedMasjid.name} ({selectedMasjid.slug}.masjidku.id)</p>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase ${statusPills[selectedMasjid.verification_status]}`}>
                                {selectedMasjid.verification_status}
                            </span>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 space-y-2">
                                <div className="flex justify-between"><span className="text-slate-400">Pengurus:</span> <strong className="text-slate-900 dark:text-white">{selectedMasjid.user?.name}</strong></div>
                                <div className="flex justify-between"><span className="text-slate-400">Email:</span> <span>{selectedMasjid.email || selectedMasjid.user?.email}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">No. WhatsApp:</span> <span>{selectedMasjid.phone || selectedMasjid.user?.phone}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Alamat:</span> <span>{selectedMasjid.address || '-'}</span></div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan Peninjauan / Verifikasi</label>
                                <textarea
                                    rows="2"
                                    placeholder="Tuliskan alasan jika menolak atau instruksi jika disetujui..."
                                    value={verifyNote}
                                    onChange={(e) => setVerifyNote(e.target.value)}
                                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100"
                                ></textarea>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    onClick={() => setSelectedMasjid(null)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold"
                                >
                                    Tutup
                                </button>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleVerify(selectedMasjid.id, 'rejected')}
                                        disabled={verifying}
                                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center space-x-1.5 shadow"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        <span>Tolak Pendaftaran</span>
                                    </button>
                                    <button
                                        onClick={() => handleVerify(selectedMasjid.id, 'approved')}
                                        disabled={verifying}
                                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center space-x-1.5 shadow"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Setujui (Approve)</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
