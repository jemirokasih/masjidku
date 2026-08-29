import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { openPdfPreview } from '../../utils/pdfPreview';
import {
    Users,
    ArrowLeft,
    Building2,
    Mail,
    Phone,
    MapPin,
    Globe,
    FileText,
    Receipt,
    CreditCard,
    Briefcase,
    FolderKanban,
    UserCheck,
    Star,
    Plus,
    Edit3,
    Eye,
    Download,
    RefreshCw,
    CheckCircle2,
    Clock,
    AlertCircle,
    Calendar,
    DollarSign
} from 'lucide-react';

export default function ClientDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'projects' | 'quotes' | 'invoices' | 'payments' | 'pics'

    const fetchClientDetail = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/clients/${id}`);
            setClient(res.data.data);
        } catch (err) {
            console.error('Error fetching client detail:', err);
            alert('Gagal memuat detail klien.');
            navigate('/clients');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-20 text-xs text-slate-500 dark:text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin mr-2 text-blue-600 dark:text-blue-400" />
                <span>Memuat data lengkap klien...</span>
            </div>
        );
    }

    if (!client) return null;

    const mainName = client.company_name || client.name;
    const pics = client.pics || [];
    const projects = client.projects || [];
    const quotes = client.quotes || [];
    const invoices = client.invoices || [];
    const payments = client.payments || [];

    // Financial Stats
    const totalQuoteAmount = quotes.reduce((sum, q) => sum + (parseFloat(q.grand_total) || 0), 0);
    const totalInvoiceAmount = invoices.reduce((sum, i) => sum + (parseFloat(i.grand_total) || 0), 0);
    const totalPaymentAmount = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    const typeBadges = {
        CORPORATE: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        INDIVIDUAL: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        GOVERNMENT: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    };

    const statusBadgesInvoice = {
        DRAFT: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
        SENT: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        UNPAID: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        PAID: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        OVERDUE: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        CANCELLED: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-16">
            {/* Top Navigation & Profile Header */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
                    <div className="flex items-start space-x-3.5">
                        <Link
                            to="/clients"
                            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm shrink-0"
                            title="Kembali ke Daftar Klien"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                    {client.code}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase border ${typeBadges[client.client_type] || typeBadges.CORPORATE}`}>
                                    {client.client_type || 'CORPORATE'}
                                </span>
                                {client.industry && (
                                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                        {client.industry}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />
                                <span>{mainName}</span>
                            </h1>

                            {client.name && client.name !== mainName && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                                    UP / Kontak Sapaan: <span className="text-slate-800 dark:text-slate-200">{client.name}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 flex-wrap">
                        <Link
                            to={`/clients/${client.id}/edit`}
                            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 border border-slate-200 dark:border-slate-700 transition-all"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Klien</span>
                        </Link>

                        <Link
                            to={`/quotes/create?client_id=${client.id}`}
                            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm shadow-purple-500/20 transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Buat Penawaran</span>
                        </Link>

                        <Link
                            to={`/invoices/create?client_id=${client.id}`}
                            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm shadow-blue-500/20 transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Terbitkan Invoice</span>
                        </Link>
                    </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <FolderKanban className="w-3.5 h-3.5 text-blue-500" />
                            <span>Total Project</span>
                        </span>
                        <div className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
                            {projects.length}
                        </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Receipt className="w-3.5 h-3.5 text-purple-500" />
                            <span>Total Penawaran</span>
                        </span>
                        <div className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
                            Rp {totalQuoteAmount.toLocaleString('id-ID')}
                        </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-blue-500" />
                            <span>Total Tagihan (Invoice)</span>
                        </span>
                        <div className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
                            Rp {totalInvoiceAmount.toLocaleString('id-ID')}
                        </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Terkumpul (Kwitansi)</span>
                        </span>
                        <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                            Rp {totalPaymentAmount.toLocaleString('id-ID')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 overflow-x-auto pb-0">
                <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 flex items-center space-x-2 ${
                        activeTab === 'overview'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#0f172a]'
                            : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Profil &amp; Kontak</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('pics')}
                    className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 flex items-center space-x-2 ${
                        activeTab === 'pics'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#0f172a]'
                            : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>PIC ({pics.length})</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('projects')}
                    className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 flex items-center space-x-2 ${
                        activeTab === 'projects'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#0f172a]'
                            : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                    <FolderKanban className="w-3.5 h-3.5" />
                    <span>Project ({projects.length})</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('quotes')}
                    className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 flex items-center space-x-2 ${
                        activeTab === 'quotes'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#0f172a]'
                            : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Penawaran / Quote ({quotes.length})</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('invoices')}
                    className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 flex items-center space-x-2 ${
                        activeTab === 'invoices'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#0f172a]'
                            : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Invoice ({invoices.length})</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('payments')}
                    className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 flex items-center space-x-2 ${
                        activeTab === 'payments'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#0f172a]'
                            : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Kwitansi &amp; Pembayaran ({payments.length})</span>
                </button>
            </div>

            {/* Tab Contents */}
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>Informasi Identitas &amp; Perpajakan</span>
                        </h3>

                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">Kode Klien</span>
                                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{client.code}</span>
                            </div>

                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">Nama Perusahaan</span>
                                <span className="font-bold text-slate-900 dark:text-slate-100">{client.company_name || '-'}</span>
                            </div>

                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">Alias / Brand</span>
                                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{client.alias || '-'}</span>
                            </div>

                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">Tipe Klien</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{client.client_type || 'CORPORATE'}</span>
                            </div>

                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">Industri</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">{client.industry || '-'}</span>
                            </div>

                            <div className="flex justify-between py-1.5">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">Nomor NPWP</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{client.tax_number || '-'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>Informasi Kontak &amp; Alamat Lengkap</span>
                        </h3>

                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">Email Perusahaan</span>
                                <span className="font-mono text-slate-800 dark:text-slate-200">{client.email || '-'}</span>
                            </div>

                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">Telepon Utama</span>
                                <span className="font-mono text-slate-800 dark:text-slate-200">{client.phone || '-'}</span>
                            </div>

                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">Website</span>
                                {client.website ? (
                                    <a
                                        href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-mono text-blue-600 hover:underline"
                                    >
                                        {client.website}
                                    </a>
                                ) : (
                                    <span className="text-slate-400">-</span>
                                )}
                            </div>

                            <div className="py-1.5 space-y-1">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold block">Alamat Domisili</span>
                                <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                                    {client.address || '-'}<br />
                                    {client.city && `${client.city}, `}{client.province && `${client.province} `}{client.postal_code || ''}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: PICS */}
            {activeTab === 'pics' && (
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span>Daftar Penanggung Jawab (Person in Charge / PIC)</span>
                    </h3>

                    {pics.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500">Belum ada data PIC terdaftar untuk klien ini.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pics.map((pic, idx) => (
                                <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 relative">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{pic.name}</h4>
                                        {pic.is_primary && (
                                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-amber-500" />
                                                <span>PIC Utama</span>
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-mono">{pic.position || 'Person in Charge'}</p>
                                    <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                                        {pic.email && (
                                            <div className="flex items-center space-x-1.5">
                                                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span className="truncate">{pic.email}</span>
                                            </div>
                                        )}
                                        {pic.phone && (
                                            <div className="flex items-center space-x-1.5 font-mono">
                                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span>{pic.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 3: PROJECTS */}
            {activeTab === 'projects' && (
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <FolderKanban className="w-4 h-4 text-blue-600" />
                            <span>Daftar Project Terkait ({projects.length})</span>
                        </h3>
                    </div>

                    {projects.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500">Belum ada project terdaftar untuk klien ini.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                        <th className="py-3 px-4">Kode</th>
                                        <th className="py-3 px-4">Nama Project</th>
                                        <th className="py-3 px-4">Status &amp; Progress</th>
                                        <th className="py-3 px-4 text-right">Budget (Rp)</th>
                                        <th className="py-3 px-4 text-right">Periode</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                    {projects.map((proj) => (
                                        <tr key={proj.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                                                {proj.code}
                                            </td>
                                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                                                {proj.name}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center space-x-2">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-600 border border-blue-500/20">
                                                        {proj.status || 'ACTIVE'}
                                                    </span>
                                                    <span className="font-mono text-[11px] text-slate-500 font-bold">{proj.progress_percent || 0}%</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                                                Rp {(parseFloat(proj.budget) || 0).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-500">
                                                {proj.start_date || '-'} s/d {proj.end_date || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 4: QUOTES */}
            {activeTab === 'quotes' && (
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-purple-600" />
                            <span>Daftar Penawaran / Quote Terkait ({quotes.length})</span>
                        </h3>
                        <Link
                            to={`/quotes/create?client_id=${client.id}`}
                            className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1 shadow-sm transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Buat Penawaran</span>
                        </Link>
                    </div>

                    {quotes.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500">Belum ada penawaran terdaftar untuk klien ini.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                        <th className="py-3 px-4">Nomor Quote</th>
                                        <th className="py-3 px-4">Tanggal Penawaran</th>
                                        <th className="py-3 px-4">Masa Berlaku</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 text-right">Grand Total (Rp)</th>
                                        <th className="py-3 px-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                    {quotes.map((q) => (
                                        <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="py-3 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                                                <Link to={`/quotes/${q.id}/edit`} className="hover:underline">
                                                    {q.quote_number}
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                                                {q.quote_date}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-slate-500">
                                                {q.valid_until || '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/10 text-purple-600 border border-purple-500/20">
                                                    {q.status || 'DRAFT'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900 dark:text-slate-100">
                                                Rp {(parseFloat(q.grand_total) || 0).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Link
                                                    to={`/quotes/${q.id}/edit`}
                                                    className="p-1.5 inline-block rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                                                    title="Edit Quote"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 5: INVOICES */}
            {activeTab === 'invoices' && (
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span>Daftar Invoice Terkait ({invoices.length})</span>
                        </h3>
                        <Link
                            to={`/invoices/create?client_id=${client.id}`}
                            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1 shadow-sm transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Terbitkan Invoice</span>
                        </Link>
                    </div>

                    {invoices.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500">Belum ada invoice terdaftar untuk klien ini.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                        <th className="py-3 px-4">Nomor Invoice</th>
                                        <th className="py-3 px-4">Tanggal Terbit</th>
                                        <th className="py-3 px-4">Jatuh Tempo</th>
                                        <th className="py-3 px-4">Status Pembayaran</th>
                                        <th className="py-3 px-4 text-right">Grand Total (Rp)</th>
                                        <th className="py-3 px-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                    {invoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                                                <Link to={`/invoices/${inv.id}/edit`} className="hover:underline">
                                                    {inv.invoice_number}
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                                                {inv.invoice_date}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-slate-500">
                                                {inv.due_date}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statusBadgesInvoice[inv.status] || statusBadgesInvoice.UNPAID}`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900 dark:text-slate-100">
                                                Rp {(parseFloat(inv.grand_total) || 0).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Link
                                                    to={`/invoices/${inv.id}/edit`}
                                                    className="p-1.5 inline-block rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                                                    title="Edit Invoice"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 6: PAYMENTS & KWITANSI */}
            {activeTab === 'payments' && (
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-emerald-600" />
                            <span>Daftar Kwitansi &amp; Pembayaran Terkait ({payments.length})</span>
                        </h3>
                    </div>

                    {payments.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500">Belum ada transaksi pembayaran / kwitansi terdaftar untuk klien ini.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                        <th className="py-3 px-4">No. Kwitansi / Pembayaran</th>
                                        <th className="py-3 px-4">Invoice / Ref</th>
                                        <th className="py-3 px-4">Tanggal Pembayaran</th>
                                        <th className="py-3 px-4">Metode Pembayaran</th>
                                        <th className="py-3 px-4 text-right">Nominal Diterima (Rp)</th>
                                        <th className="py-3 px-4 text-right">Kwitansi PDF</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                    {payments.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                {p.payment_number}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                                                {p.invoice?.invoice_number || p.reference_number || '-'}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                                                {p.payment_date}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                    {p.payment_method?.name || 'Bank Transfer'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                                                Rp {(parseFloat(p.amount) || 0).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => openPdfPreview(`/payments/${p.id}/receipt`)}
                                                    className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] inline-flex items-center space-x-1 transition-all border border-emerald-500/20 cursor-pointer"
                                                    title="Preview &amp; Cetak Kwitansi Resmi PDF"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    <span>Kwitansi</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
