import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useConfirm } from '../../context/ConfirmContext';
import SearchableSelect from '../../components/SearchableSelect';
import {
    UserPlus,
    Plus,
    Search,
    RefreshCw,
    Eye,
    Edit,
    Trash2,
    CheckCircle2,
    Clock,
    AlertCircle,
    Building2,
    Phone,
    Mail,
    DollarSign,
    FolderKanban,
    ArrowRight,
    X,
    Save,
    Sparkles,
    Filter
} from 'lucide-react';

export default function LeadList() {
    const navigate = useNavigate();
    const { confirm } = useConfirm();

    const [leads, setLeads] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        new: 0,
        in_progress: 0,
        won: 0,
        converted: 0,
        lost: 0,
    });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sourceFilter, setSourceFilter] = useState('');
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
    });

    // Convert Modal State
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [converting, setConverting] = useState(false);
    const [convertForm, setConvertForm] = useState({
        project_name: '',
        budget: 0,
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        create_client_if_missing: true,
    });

    const fetchLeads = async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                search,
                status: statusFilter,
                source: sourceFilter,
            };
            const res = await api.get('/leads', { params });
            if (res.data?.status === 'success') {
                setLeads(res.data.data || []);
                setStats(res.data.stats || {
                    total: 0, new: 0, in_progress: 0, won: 0, converted: 0, lost: 0,
                });
                if (res.data.meta) {
                    setPagination({
                        current_page: res.data.meta.current_page,
                        last_page: res.data.meta.last_page,
                        total: res.data.meta.total,
                    });
                }
            }
        } catch (err) {
            console.error('Failed to fetch leads:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads(1);
    }, [search, statusFilter, sourceFilter]);

    const formatRp = (val) => 'Rp ' + new Intl.NumberFormat('id-ID').format(val || 0);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'WON':
                return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300';
            case 'NEW':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-300';
            case 'CONTACTED':
                return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-300';
            case 'QUALIFIED':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 border-purple-300';
            case 'PROPOSAL':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300';
            case 'NEGOTIATION':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300 border-orange-300';
            case 'LOST':
                return 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-300';
            default:
                return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300';
        }
    };

    const handleDelete = async (id, title) => {
        const ok = await confirm({
            title: 'Hapus Lead Prospek',
            message: `Apakah Anda yakin ingin menghapus prospek "${title}"?`,
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;

        try {
            await api.delete(`/leads/${id}`);
            fetchLeads(pagination.current_page);
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menghapus lead.');
        }
    };

    const openConvertModal = (lead) => {
        setSelectedLead(lead);
        setConvertForm({
            project_name: lead.title,
            budget: lead.estimated_value || 0,
            start_date: new Date().toISOString().split('T')[0],
            end_date: '',
            create_client_if_missing: true,
        });
        setShowConvertModal(true);
    };

    const handleConvertSubmit = async (e) => {
        e.preventDefault();
        if (!selectedLead) return;

        setConverting(true);
        try {
            const res = await api.post(`/leads/${selectedLead.id}/convert-to-project`, convertForm);
            if (res.data?.status === 'success') {
                setShowConvertModal(false);
                const newProject = res.data.data?.project;
                if (newProject?.id) {
                    navigate(`/projects/${newProject.id}`);
                } else {
                    fetchLeads(pagination.current_page);
                }
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal mengonversi Lead menjadi Project.');
        } finally {
            setConverting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-2">
                        <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                            Manajemen Prospek (Leads)
                        </h1>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Kelola calon klien &amp; prospek penjualan, dan ubah menjadi Project aktif secara otomatis.
                    </p>
                </div>

                <Link
                    to="/leads/create"
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center space-x-2 transition-all w-fit"
                >
                    <Plus className="w-4 h-4" />
                    <span>+ Tambah Prospek Baru</span>
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Prospek</span>
                    <span className="text-xl font-black font-mono text-slate-900 dark:text-slate-100">{stats.total}</span>
                </div>

                <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">Prospek Baru</span>
                    <span className="text-xl font-black font-mono text-blue-600 dark:text-blue-400">{stats.new}</span>
                </div>

                <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">Dalam Proses</span>
                    <span className="text-xl font-black font-mono text-amber-600 dark:text-amber-400">{stats.in_progress}</span>
                </div>

                <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">Deal / Won</span>
                    <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">{stats.won}</span>
                </div>

                <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">Jadi Project</span>
                    <span className="text-xl font-black font-mono text-indigo-600 dark:text-indigo-400">{stats.converted}</span>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari kode lead, nama prospek, instansi, email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                </div>

                <div className="w-full sm:w-48">
                    <SearchableSelect
                        options={[
                            { value: '', label: 'Semua Status Prospek' },
                            { value: 'NEW', label: 'NEW (Baru Masuk)' },
                            { value: 'CONTACTED', label: 'CONTACTED (Sudah Dihubungi)' },
                            { value: 'QUALIFIED', label: 'QUALIFIED (Layak Prospek)' },
                            { value: 'PROPOSAL', label: 'PROPOSAL (Penawaran)' },
                            { value: 'NEGOTIATION', label: 'NEGOTIATION (Nego)' },
                            { value: 'WON', label: 'WON (Berhasil Deal)' },
                            { value: 'LOST', label: 'LOST (Gagal)' },
                        ]}
                        value={statusFilter}
                        onChange={(val) => setStatusFilter(val)}
                        placeholder="Filter Status..."
                    />
                </div>

                <div className="w-full sm:w-44">
                    <SearchableSelect
                        options={[
                            { value: '', label: 'Semua Sumber' },
                            { value: 'WEBSITE', label: 'Website Company' },
                            { value: 'REFERRAL', label: 'Referral / Rekomendasi' },
                            { value: 'COLD_CALL', label: 'Cold Call / Outbound' },
                            { value: 'EXHIBITION', label: 'Pameran / Event' },
                            { value: 'SOCIAL_MEDIA', label: 'Social Media' },
                            { value: 'OTHER', label: 'Lain-lain' },
                        ]}
                        value={sourceFilter}
                        onChange={(val) => setSourceFilter(val)}
                        placeholder="Filter Sumber..."
                    />
                </div>
            </div>

            {/* Leads Table */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                        <span>Memuat daftar prospek (leads)...</span>
                    </div>
                ) : leads.length === 0 ? (
                    <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 space-y-3">
                        <UserPlus className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                        <p className="font-bold text-slate-700 dark:text-slate-300">Belum ada prospek (Lead) ditemukan</p>
                        <p className="text-slate-400">Gunakan tombol "+ Tambah Prospek Baru" untuk memasukkan calon lead baru.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                                    <th className="py-3 px-4">Kode &amp; Prospek</th>
                                    <th className="py-3 px-4">Calon Klien / Instansi</th>
                                    <th className="py-3 px-4">Kontak PIC</th>
                                    <th className="py-3 px-4">Estimasi Value</th>
                                    <th className="py-3 px-4">Sumber</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Aksi &amp; Konversi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                {leads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                                    #{lead.code}
                                                </span>
                                            </div>
                                            <Link to={`/leads/${lead.id}`} className="font-bold text-slate-900 dark:text-slate-100 hover:underline block mt-0.5">
                                                {lead.title}
                                            </Link>
                                        </td>

                                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                                            <div className="flex items-center space-x-1.5">
                                                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span>{lead.client_name}</span>
                                            </div>
                                        </td>

                                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                                            <div>{lead.contact_name || '-'}</div>
                                            {lead.contact_phone && (
                                                <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-1 mt-0.5">
                                                    <Phone className="w-3 h-3 text-slate-400" />
                                                    <span>{lead.contact_phone}</span>
                                                </div>
                                            )}
                                        </td>

                                        <td className="py-3.5 px-4 font-bold font-mono text-slate-900 dark:text-slate-100">
                                            {formatRp(lead.estimated_value)}
                                        </td>

                                        <td className="py-3.5 px-4 font-semibold text-[10px] text-slate-500">
                                            {lead.source || 'OTHER'}
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${getStatusBadge(lead.status)}`}>
                                                {lead.status}
                                            </span>
                                        </td>

                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end space-x-1.5">
                                                {/* Convert to Project Action */}
                                                {lead.converted_project ? (
                                                    <Link
                                                        to={`/projects/${lead.converted_project.id}`}
                                                        className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-bold text-[10px] flex items-center space-x-1 hover:underline"
                                                    >
                                                        <FolderKanban className="w-3.5 h-3.5" />
                                                        <span>Lihat Project</span>
                                                    </Link>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => openConvertModal(lead)}
                                                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow-sm flex items-center space-x-1 transition-all"
                                                        title="Ubah Lead ini menjadi Project baru"
                                                    >
                                                        <Sparkles className="w-3 h-3" />
                                                        <span>Ubah Jadi Project</span>
                                                    </button>
                                                )}

                                                <Link
                                                    to={`/leads/${lead.id}`}
                                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                    title="Lihat Rincian"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </Link>

                                                <Link
                                                    to={`/leads/${lead.id}/edit`}
                                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                    title="Edit Lead"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(lead.id, lead.title)}
                                                    className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                                                    title="Hapus Lead"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Convert Lead to Project */}
            {showConvertModal && selectedLead && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="w-full max-w-md bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-500" />
                                <span>Konversi Prospek ke Project Baru</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowConvertModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleConvertSubmit} className="space-y-3.5 text-xs">
                            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-200">
                                <span className="font-bold block text-[11px]">Prospek: {selectedLead.code}</span>
                                <div className="font-semibold">{selectedLead.title}</div>
                                <div className="text-[10px] text-emerald-600 dark:text-emerald-400">Instansi/Klien: {selectedLead.client_name}</div>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Nama Project Baru *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={convertForm.project_name}
                                    onChange={(e) => setConvertForm({ ...convertForm, project_name: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Budget Project (Rp)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={convertForm.budget}
                                    onChange={(e) => setConvertForm({ ...convertForm, budget: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Tanggal Mulai
                                    </label>
                                    <input
                                        type="date"
                                        value={convertForm.start_date}
                                        onChange={(e) => setConvertForm({ ...convertForm, start_date: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Tenggat Selesai
                                    </label>
                                    <input
                                        type="date"
                                        value={convertForm.end_date}
                                        onChange={(e) => setConvertForm({ ...convertForm, end_date: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={convertForm.create_client_if_missing}
                                        onChange={(e) => setConvertForm({ ...convertForm, create_client_if_missing: e.target.checked })}
                                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span>Buatkan profil Klien baru otomatis jika belum ada di sistem</span>
                                </label>
                            </div>

                            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowConvertModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={converting}
                                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-60"
                                >
                                    {converting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                    <span>Konversi ke Project</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
