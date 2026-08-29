import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useConfirm } from '../../context/ConfirmContext';
import SearchableSelect from '../../components/SearchableSelect';
import {
    UserPlus,
    ArrowLeft,
    Save,
    RefreshCw,
    Building2,
    DollarSign,
    UserCheck,
    Phone,
    Mail,
    FileText,
    Edit,
    Trash2,
    CheckCircle2,
    Clock,
    AlertCircle,
    FolderKanban,
    ArrowRight,
    X,
    Sparkles,
    Eye,
    Calendar,
    MapPin,
    Tag,
    Loader2,
} from 'lucide-react';

export default function LeadDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { confirm } = useConfirm();

    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [converting, setConverting] = useState(false);
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [convertForm, setConvertForm] = useState({
        project_name: '',
        budget: 0,
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        create_client_if_missing: true,
    });

    const fetchLead = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/leads/${id}`);
            if (res.data?.status === 'success') {
                setLead(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch lead:', err);
            alert('Gagal memuat data prospek.');
            navigate('/leads');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLead();
    }, [id]);

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

    const getSourceBadge = (source) => {
        const sources = {
            WEBSITE: 'Website Company',
            REFERRAL: 'Referral / Rekomendasi',
            COLD_CALL: 'Cold Call / Outbound',
            EXHIBITION: 'Pameran / Event',
            SOCIAL_MEDIA: 'Social Media',
            OTHER: 'Lain-lain',
        };
        return sources[source] || source;
    };

    const handleStatusChange = async (newStatus) => {
        setUpdating(true);
        try {
            await api.put(`/leads/${id}`, { status: newStatus });
            fetchLead();
        } catch (err) {
            alert('Gagal mengubah status: ' + (err.response?.data?.message || err.message));
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        const ok = await confirm({
            title: 'Hapus Lead Prospek',
            message: `Apakah Anda yakin ingin menghapus prospek "${lead?.title}"? Tindakan ini tidak dapat dibatalkan.`,
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;

        setDeleting(true);
        try {
            await api.delete(`/leads/${id}`);
            navigate('/leads');
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menghapus lead.');
        } finally {
            setDeleting(false);
        }
    };

    const openConvertModal = () => {
        if (!lead) return;
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
        setConverting(true);
        try {
            const res = await api.post(`/leads/${id}/convert-to-project`, convertForm);
            if (res.data?.status === 'success') {
                setShowConvertModal(false);
                const newProject = res.data.data?.project;
                if (newProject?.id) {
                    navigate(`/projects/${newProject.id}`);
                } else {
                    fetchLead();
                }
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal mengonversi Lead menjadi Project.');
        } finally {
            setConverting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                <span>Memuat detail prospek...</span>
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 space-y-3">
                <AlertCircle className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="font-bold text-slate-700 dark:text-slate-300">Prospek tidak ditemukan</p>
                <Link to="/leads" className="inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs">
                    Kembali ke Daftar Prospek
                </Link>
            </div>
        );
    }

    const statusOptions = [
        { value: 'NEW', label: 'NEW (Baru Masuk)' },
        { value: 'CONTACTED', label: 'CONTACTED (Sudah Dihubungi)' },
        { value: 'QUALIFIED', label: 'QUALIFIED (Prospek Layak)' },
        { value: 'PROPOSAL', label: 'PROPOSAL (Tahap Penawaran)' },
        { value: 'NEGOTIATION', label: 'NEGOTIATION (Tahap Nego)' },
        { value: 'WON', label: 'WON (Berhasil Deal)' },
        { value: 'LOST', label: 'LOST (Gagal/Batal)' },
    ];

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                    <Link
                        to="/leads"
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center space-x-2">
                            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
                                <UserPlus className="w-5 h-5" />
                            </div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                                {lead.title}
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Kode: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{lead.code}</span>
                            {lead.converted_at && (
                                <>
                                    <span className="mx-1">•</span>
                                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                        Dikonversi ke Project pada {new Date(lead.converted_at).toLocaleDateString('id-ID')}
                                    </span>
                                </>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Link
                        to={`/leads/${lead.id}/edit`}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center space-x-2"
                    >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                    </Link>

                    {lead.converted_project_id ? (
                        <Link
                            to={`/projects/${lead.converted_project.id}`}
                            className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-bold flex items-center space-x-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                        >
                            <FolderKanban className="w-4 h-4" />
                            <span>Lihat Project</span>
                        </Link>
                    ) : (
                        <button
                            type="button"
                            onClick={openConvertModal}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center space-x-2 shadow-md shadow-emerald-600/20 transition-all"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>Ubah Jadi Project</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-bold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors flex items-center space-x-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Hapus</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status & Quick Info */}
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                            <div className="flex items-center space-x-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getStatusBadge(lead.status)}`}>
                                    {lead.status}
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                    Sumber: {getSourceBadge(lead.source)}
                                </span>
                            </div>

                            <div className="flex items-center space-x-2">
                                {statusOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleStatusChange(opt.value)}
                                        disabled={updating || lead.status === opt.value || lead.converted_project_id}
                                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                                            lead.status === opt.value
                                                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        } ${lead.converted_project_id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        title={lead.status === opt.value ? 'Status saat ini' : `Ubah ke ${opt.label}`}
                                    >
                                        {opt.value}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Estimated Value */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estimasi Nilai Transaksi</p>
                                    <p className="text-2xl font-extrabold font-mono text-emerald-700 dark:text-emerald-300">{formatRp(lead.estimated_value)}</p>
                                </div>
                            </div>
                            {lead.converted_project && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
                                    Sudah Dikonversi
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Detail Sections */}
                    <div className="space-y-6">
                        {/* Client & Company Info */}
                        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span>Informasi Klien / Instansi</span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nama Perusahaan / Instansi</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">{lead.client_name}</p>
                                </div>
                                {lead.client && (
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Profil Klien Terdaftar</p>
                                        <Link to={`/clients/${lead.client.id}`} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-1">
                                            {lead.client.company_name || lead.client.name}
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                                <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span>Kontak Personal (PIC)</span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {lead.contact_name && (
                                    <div className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                        <UserCheck className="w-4 h-4 text-slate-400" />
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nama PIC</p>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{lead.contact_name}</p>
                                        </div>
                                    </div>
                                )}
                                {lead.contact_email && (
                                    <div className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        <a href={`mailto:${lead.contact_email}`} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline break-all">
                                            {lead.contact_email}
                                        </a>
                                    </div>
                                )}
                                {lead.contact_phone && (
                                    <div className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <a href={`tel:${lead.contact_phone}`} className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300 hover:underline">
                                            {lead.contact_phone}
                                        </a>
                                    </div>
                                )}
                                {!lead.contact_name && !lead.contact_email && !lead.contact_phone && (
                                    <div className="col-span-3 text-center py-8 text-slate-400 text-sm">
                                        Belum ada data kontak PIC
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Assignee */}
                        {lead.assignedEmployee && (
                            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                                    <Tag className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                    <span>Penanggung Jawab Sales</span>
                                </h3>
                                <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                        {lead.assignedEmployee.name?.charAt(0)?.toUpperCase() || 'A'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-slate-100">{lead.assignedEmployee.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{lead.assignedEmployee.position || 'Staff'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {lead.notes && (
                            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                                    <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                    <span>Catatan & Ruang Lingkup</span>
                                </h3>
                                <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                    {lead.notes}
                                </div>
                            </div>
                        )}

                        {/* Audit Info */}
                        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                                <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                <span>Informasi Sistem</span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div>
                                    <p className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dibuat Oleh</p>
                                    <p className="text-slate-700 dark:text-slate-300 mt-1">{lead.creator?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tanggal Dibuat</p>
                                    <p className="text-slate-700 dark:text-slate-300 mt-1">{lead.created_at ? new Date(lead.created_at).toLocaleString('id-ID') : 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Terakhir Diperbarui</p>
                                    <p className="text-slate-700 dark:text-slate-300 mt-1">{lead.updated_at ? new Date(lead.updated_at).toLocaleString('id-ID') : 'N/A'}</p>
                                </div>
                                {lead.converted_at && (
                                    <div>
                                        <p className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dikonversi ke Project</p>
                                        <p className="text-emerald-700 dark:text-emerald-300 font-semibold mt-1">{new Date(lead.converted_at).toLocaleString('id-ID')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Convert to Project Card (if not converted) */}
                    {!lead.converted_project_id && (
                        <div className="bg-white dark:bg-[#0f172a] border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 shadow-sm space-y-4 bg-emerald-50/50 dark:bg-emerald-950/20">
                            <div className="flex items-center space-x-2">
                                <Sparkles className="w-5 h-5 text-emerald-500" />
                                <h3 className="font-bold text-sm text-emerald-700 dark:text-emerald-300">Konversi ke Project Aktif</h3>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                Ubah prospek ini menjadi Project aktif. Data klien & estimasi akan terbawa otomatis.
                            </p>
                            <button
                                onClick={openConvertModal}
                                className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20 transition-all"
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>Konversi Sekarang</span>
                            </button>
                        </div>
                    )}

                    {/* Converted Project Link */}
                    {lead.converted_project && (
                        <div className="bg-white dark:bg-[#0f172a] border border-indigo-200 dark:border-indigo-800 rounded-2xl p-5 shadow-sm space-y-4 bg-indigo-50/50 dark:bg-indigo-950/20">
                            <div className="flex items-center space-x-2">
                                <FolderKanban className="w-5 h-5 text-indigo-500" />
                                <h3 className="font-bold text-sm text-indigo-700 dark:text-indigo-300">Sudah Jadi Project</h3>
                            </div>
                            <div className="space-y-2 text-xs">
                                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                                    <Tag className="w-3.5 h-3.5" />
                                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{lead.converted_project.code}</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-slate-100">{lead.converted_project.name}</p>
                                </div>
                                <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{lead.converted_project.start_date ? new Date(lead.converted_project.start_date).toLocaleDateString('id-ID') : '-'}</span>
                                </div>
                            </div>
                            <Link
                                to={`/projects/${lead.converted_project.id}`}
                                className="w-full px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-center transition-colors"
                            >
                                Buka Detail Project
                            </Link>
                        </div>
                    )}

                    {/* Quick Stats Card */}
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                            <span>Ringkasan Cepat</span>
                        </h3>
                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <span className="text-slate-500 dark:text-slate-400">Status</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${getStatusBadge(lead.status)}`}>
                                    {lead.status}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <span className="text-slate-500 dark:text-slate-400">Sumber</span>
                                <span className="font-semibold text-slate-900 dark:text-slate-100">{getSourceBadge(lead.source)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <span className="text-slate-500 dark:text-slate-400">Estimasi</span>
                                <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{formatRp(lead.estimated_value)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <span className="text-slate-500 dark:text-slate-400">PIC</span>
                                <span className="font-semibold text-slate-900 dark:text-slate-100">{lead.contact_name || '-'}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <span className="text-slate-500 dark:text-slate-400">Assignee</span>
                                <span className="font-semibold text-slate-900 dark:text-slate-100">{lead.assignedEmployee?.name || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Convert Modal */}
            {showConvertModal && (
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
                                <span className="font-bold block text-[11px]">Prospek: {lead.code}</span>
                                <div className="font-semibold">{lead.title}</div>
                                <div className="text-[10px] text-emerald-600 dark:text-emerald-400">Instansi/Klien: {lead.client_name}</div>
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
                                    {converting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
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
