import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useConfirm } from '../../context/ConfirmContext';
import {
    Globe,
    Plus,
    RefreshCw,
    Search,
    Edit3,
    Trash2,
    X,
    Save,
    Server,
    Calendar,
    Lock,
    AlertCircle,
    Info,
    Clock,
    AlertTriangle,
    CheckCircle2,
    DollarSign,
    Layers,
    ArrowUpDown,
    ArrowUp,
    ArrowDown
} from 'lucide-react';

const blankForm = {
    domain_name: '',
    provider: 'manual',
    external_domain_id: '',
    registrar_name: '',
    registration_date: '',
    expiration_date: '',
    billing_date: '',
    auto_renew: false,
    status: 'active',
    nameservers: '',
    hosting_type: 'mikrotek',
    hosting_type_id: '',
    hosting_provider_id: '',
    hosting_provider_name: '',
    hosting_ip: '',
    client_id: '',
    project_id: '',
    notes: '',
};

const providerStyle = {
    rdash: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    srsx: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    manual: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
};

export default function DomainList() {
    const { confirm } = useConfirm();

    const [domains, setDomains] = useState([]);
    const [clients, setClients] = useState([]);
    const [projects, setProjects] = useState([]);
    const [hostingTypes, setHostingTypes] = useState([]);

    const [activeTab, setActiveTab] = useState('all'); // 'all', 'expiring', 'billing_due'
    const [days, setDays] = useState(30);
    const [meta, setMeta] = useState({ expiring_count: 0, billing_due_count: 0 });

    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingDomain, setEditingDomain] = useState(null);
    const [form, setForm] = useState(blankForm);

    const [filters, setFilters] = useState({ search: '', provider: '', hosting_type_id: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'domain_name', direction: 'asc' });

    const loadData = async () => {
        setLoading(true);
        try {
            const [dRes, cRes, pRes, hRes] = await Promise.all([
                api.get('/domains', { params: { ...filters, tab: activeTab, days } }),
                api.get('/clients'),
                api.get('/projects'),
                api.get('/hosting-types'),
            ]);
            setDomains(dRes.data.data || []);
            if (dRes.data.meta) {
                setMeta(dRes.data.meta);
            }
            setClients(cRes.data.data || []);
            setProjects(pRes.data.data || []);
            setHostingTypes(hRes.data.data || []);
        } catch (e) {
            console.error('Gagal memuat data domain:', e);
            alert(e.response?.data?.message || 'Gagal memuat data domain.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        const timer = setTimeout(loadData, 200);
        return () => clearTimeout(timer);
    }, [filters.search, filters.provider, filters.hosting_type_id, activeTab, days]);

    const openModal = (domain = null) => {
        setEditingDomain(domain);
        if (domain) {
            setForm({
                domain_name: domain.domain_name || '',
                provider: domain.provider || 'manual',
                external_domain_id: domain.external_domain_id || '',
                registrar_name: domain.registrar_name || '',
                registration_date: domain.registration_date || '',
                expiration_date: domain.expiration_date || '',
                billing_date: domain.billing_date || '',
                auto_renew: !!domain.auto_renew,
                status: domain.status || 'active',
                nameservers: (domain.nameservers || []).join(', '),
                hosting_type: domain.hosting_type || 'mikrotek',
                hosting_type_id: domain.hosting_type_id ? String(domain.hosting_type_id) : '',
                hosting_provider_id: domain.hosting_provider_id ? String(domain.hosting_provider_id) : '',
                hosting_provider_name: domain.hosting_provider_name || '',
                hosting_ip: domain.hosting_ip || '',
                client_id: domain.client_id ? String(domain.client_id) : '',
                project_id: domain.project_id ? String(domain.project_id) : '',
                notes: domain.notes || '',
            });
        } else {
            setForm(blankForm);
        }
        setShowModal(true);
    };

    const handleHostingTypeChange = (e) => {
        const typeId = e.target.value;
        const selectedType = hostingTypes.find(t => String(t.id) === String(typeId));
        const firstProvider = selectedType?.hosting_providers?.[0];

        setForm(prev => ({
            ...prev,
            hosting_type_id: typeId,
            hosting_provider_id: firstProvider ? String(firstProvider.id) : '',
            hosting_provider_name: firstProvider ? firstProvider.name : '',
        }));
    };

    const handleHostingProviderChange = (e) => {
        const providerId = e.target.value;
        const currentType = hostingTypes.find(t => String(t.id) === String(form.hosting_type_id));
        const selectedProvider = currentType?.hosting_providers?.find(p => String(p.id) === String(providerId));

        setForm(prev => ({
            ...prev,
            hosting_provider_id: providerId,
            hosting_provider_name: selectedProvider ? selectedProvider.name : prev.hosting_provider_name,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...form,
            domain_name: form.domain_name.trim().toLowerCase(),
            client_id: form.client_id ? parseInt(form.client_id) : null,
            project_id: form.project_id ? parseInt(form.project_id) : null,
            hosting_type_id: form.hosting_type_id ? parseInt(form.hosting_type_id) : null,
            hosting_provider_id: form.hosting_provider_id ? parseInt(form.hosting_provider_id) : null,
            registration_date: form.registration_date || null,
            expiration_date: form.expiration_date || null,
            billing_date: form.billing_date || null,
            nameservers: form.nameservers ? form.nameservers.split(',').map(x => x.trim()).filter(Boolean) : [],
        };

        try {
            if (editingDomain) {
                await api.put(`/domains/${editingDomain.id}`, payload);
            } else {
                await api.post('/domains', payload);
            }
            setShowModal(false);
            loadData();
        } catch (err) {
            alert(err.response?.data?.message || Object.values(err.response?.data?.errors || {}).flat()[0] || 'Gagal menyimpan domain.');
        }
    };

    const handleDelete = async (domain) => {
        const ok = await confirm({
            title: 'Hapus Domain',
            message: `Yakin ingin menghapus domain ${domain.domain_name}? Data dapat dipulihkan oleh administrator.`,
            confirmText: 'Hapus',
            variant: 'danger',
        });
        if (!ok) return;

        try {
            await api.delete(`/domains/${domain.id}`);
            loadData();
        } catch (e) {
            alert(e.response?.data?.message || 'Gagal menghapus domain.');
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await api.post('/domains/sync');
            const errors = Object.values(res.data.data?.errors || {});
            alert(errors.length ? `${res.data.message}\nCatatan Error: ${errors.join('\n')}` : res.data.message);
            loadData();
        } catch (e) {
            const errors = Object.values(e.response?.data?.data?.errors || {});
            alert(errors.length ? `${e.response?.data?.message || 'Sinkronisasi gagal.'}\nCatatan Error: ${errors.join('\n')}` : (e.response?.data?.message || 'Sinkronisasi gagal.'));
        } finally {
            setSyncing(false);
        }
    };

    const setField = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

    const isApiDomain = editingDomain && (editingDomain.provider === 'rdash' || editingDomain.provider === 'srsx');
    const activeHostingTypeObj = hostingTypes.find(t => String(t.id) === String(form.hosting_type_id));
    const availableProviders = activeHostingTypeObj?.hosting_providers || [];

    // Helper to calculate days remaining to expiration or billing
    const getDaysDifference = (targetDateStr) => {
        if (!targetDateStr) return null;
        const target = new Date(targetDateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        target.setHours(0, 0, 0, 0);
        const diffTime = target - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const renderSortIcon = (key) => {
        if (sortConfig.key !== key) {
            return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity inline ml-1" />;
        }
        return sortConfig.direction === 'asc' ? (
            <ArrowUp className="w-3 h-3 text-blue-600 dark:text-blue-400 inline ml-1" />
        ) : (
            <ArrowDown className="w-3 h-3 text-blue-600 dark:text-blue-400 inline ml-1" />
        );
    };

    const sortedDomains = React.useMemo(() => {
        if (!sortConfig.key) return domains;
        return [...domains].sort((a, b) => {
            let aVal = a;
            let bVal = b;
            const keys = sortConfig.key.split('.');
            for (const k of keys) {
                aVal = aVal?.[k];
                bVal = bVal?.[k];
            }

            if (aVal == null) return 1;
            if (bVal == null) return -1;

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
            }

            const strA = String(aVal).toLowerCase();
            const strB = String(bVal).toLowerCase();
            if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [domains, sortConfig]);

    const totalDomains = sortedDomains.length;
    const totalPages = Math.ceil(totalDomains / itemsPerPage) || 1;
    const currentDomains = sortedDomains.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-xs">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                        <Globe className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Manajemen Domain</h1>
                        <p className="text-slate-500 mt-0.5">Kelola domain klien/proyek, pemantauan tanggal kedaluwarsa &amp; penagihan, serta registrar API.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="px-3.5 py-2 rounded-xl border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-950/30 font-bold flex gap-1.5 items-center hover:bg-blue-100 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                        <span>Sinkron Registrar</span>
                    </button>
                    <button
                        onClick={() => openModal()}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex gap-1.5 items-center shadow-md shadow-blue-500/20 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Domain</span>
                    </button>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                            activeTab === 'all'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                    >
                        <Globe className="w-4 h-4" />
                        <span>Semua Domain</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('expiring')}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                            activeTab === 'expiring'
                                ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                    >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Domain Akan Expired</span>
                        {meta.expiring_count > 0 && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                activeTab === 'expiring' ? 'bg-white text-rose-700' : 'bg-rose-500 text-white'
                            }`}>
                                {meta.expiring_count}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('billing_due')}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                            activeTab === 'billing_due'
                                ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                    >
                        <Calendar className="w-4 h-4" />
                        <span>Tagihan Jatuh Tempo</span>
                        {meta.billing_due_count > 0 && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                activeTab === 'billing_due' ? 'bg-white text-amber-700' : 'bg-amber-500 text-white'
                            }`}>
                                {meta.billing_due_count}
                            </span>
                        )}
                    </button>
                </div>

                {/* Days Filter Selector for Expiring and Billing Due Tabs */}
                {activeTab !== 'all' && (
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-bold text-slate-500 pl-2">Rentang Waktu:</span>
                        {[7, 15, 30, 60, 90].map((d) => (
                            <button
                                key={d}
                                onClick={() => setDays(d)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                    days === d
                                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                            >
                                {d} Hari
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Filters & Search Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <label className="relative md:col-span-2">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                        value={filters.search}
                        onChange={e => setFilters({ ...filters, search: e.target.value })}
                        placeholder="Cari nama domain..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                </label>
                <select
                    value={filters.provider}
                    onChange={e => setFilters({ ...filters, provider: e.target.value })}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                >
                    <option value="">Semua Registrar</option>
                    <option value="rdash">RDASH</option>
                    <option value="srsx">SRS-X</option>
                    <option value="manual">Manual</option>
                </select>
                <select
                    value={filters.hosting_type_id}
                    onChange={e => setFilters({ ...filters, hosting_type_id: e.target.value })}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                >
                    <option value="">Semua Tipe Hosting</option>
                    {hostingTypes.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
            </div>

            {/* Main Domain Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm">
                {loading ? (
                    <div className="p-12 text-center text-slate-500">
                        <RefreshCw className="w-5 h-5 animate-spin inline mr-2 text-blue-600" />
                        Memuat data domain...
                    </div>
                ) : (
                    <table className="w-full min-w-[960px] text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                            <tr>
                                <th onClick={() => handleSort('domain_name')} className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group select-none">
                                    <span>Domain</span>
                                    {renderSortIcon('domain_name')}
                                </th>
                                <th onClick={() => handleSort('provider')} className="py-4 px-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group select-none">
                                    <span>Registrar</span>
                                    {renderSortIcon('provider')}
                                </th>
                                <th onClick={() => handleSort('client.company_name')} className="py-4 px-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group select-none">
                                    <span>Klien / Project</span>
                                    {renderSortIcon('client.company_name')}
                                </th>
                                <th onClick={() => handleSort('expiration_date')} className="py-4 px-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group select-none">
                                    <span>Tgl Kedaluwarsa</span>
                                    {renderSortIcon('expiration_date')}
                                </th>
                                <th onClick={() => handleSort('billing_date')} className="py-4 px-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group select-none">
                                    <span>Tgl Penagihan</span>
                                    {renderSortIcon('billing_date')}
                                </th>
                                <th className="py-4 px-3">Hosting &amp; Provider</th>
                                <th onClick={() => handleSort('status')} className="py-4 px-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group select-none">
                                    <span>Status</span>
                                    {renderSortIcon('status')}
                                </th>
                                <th className="text-right pr-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {domains.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-12 text-center text-slate-500">
                                        {activeTab === 'expiring'
                                            ? `Tidak ada domain yang akan expired dalam ${days} hari ke depan.`
                                            : activeTab === 'billing_due'
                                            ? `Tidak ada tagihan domain yang jatuh tempo dalam ${days} hari ke depan.`
                                            : 'Belum ada domain yang tersimpan.'}
                                    </td>
                                </tr>
                            ) : (
                                currentDomains.map(d => {
                                    const expDays = getDaysDifference(d.expiration_date);
                                    const billDays = getDaysDifference(d.billing_date);

                                    return (
                                        <tr key={d.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                    {d.domain_name}
                                                    {d.provider !== 'manual' && (
                                                        <Lock className="w-3 h-3 text-slate-400" title="Data dari API registrar (Read-only)" />
                                                    )}
                                                </div>
                                                <div className="font-normal text-[10px] text-slate-500 truncate max-w-[200px]">
                                                    {(d.nameservers || []).join(', ') || 'Tanpa nameserver'}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase border ${providerStyle[d.provider] || providerStyle.manual}`}>
                                                    {d.provider}
                                                </span>
                                            </td>
                                            <td className="text-slate-600 dark:text-slate-300">
                                                {d.client?.company_name || d.client?.name || '-'}
                                                {d.project && (
                                                    <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">{d.project.code} — {d.project.name}</div>
                                                )}
                                            </td>
                                            <td>
                                                <div className="font-semibold text-slate-900 dark:text-slate-100">{d.expiration_date || '-'}</div>
                                                {expDays !== null && expDays <= 30 && (
                                                    <div className={`text-[10px] font-bold mt-0.5 flex items-center gap-1 ${
                                                        expDays <= 7 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                                                    }`}>
                                                        <AlertTriangle className="w-3 h-3 inline" />
                                                        {expDays <= 0 ? 'Expired hari ini / lewat!' : `${expDays} hari lagi`}
                                                    </div>
                                                )}
                                                {d.auto_renew && <div className="text-[10px] text-emerald-600 font-bold">Auto renew</div>}
                                            </td>
                                            <td>
                                                <div className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                                                    {d.billing_date || '-'}
                                                </div>
                                                {billDays !== null && billDays <= 30 && (
                                                    <div className={`text-[10px] font-bold mt-0.5 ${
                                                        billDays <= 7 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                                                    }`}>
                                                        {billDays <= 0 ? 'Jatuh tempo hari ini / lewat!' : `${billDays} hari lagi`}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div className="font-bold text-slate-900 dark:text-slate-100">
                                                    {d.hosting_type_rel?.name || (d.hosting_type === 'mikrotek' ? 'Mikrotek Infrastructure' : 'External Hosting')}
                                                </div>
                                                <div className="text-[10px] text-slate-500">
                                                    {d.hosting_provider_rel?.name || d.hosting_provider_name || '-'} {d.hosting_ip ? `(${d.hosting_ip})` : ''}
                                                </div>
                                            </td>
                                            <td className="capitalize font-semibold text-slate-700 dark:text-slate-300">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                    d.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                                                }`}>
                                                    {d.status}
                                                </span>
                                            </td>
                                            <td className="pr-4 text-right">
                                                <div className="inline-flex items-center gap-1">
                                                    <button
                                                        onClick={() => openModal(d)}
                                                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400"
                                                        title="Edit domain"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(d)}
                                                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-600 dark:text-rose-400"
                                                        title="Hapus domain"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination Controls */}
            {!loading && totalDomains > 0 && (
                <div className="p-3.5 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm text-xs">
                    <div className="flex items-center space-x-3 text-slate-500">
                        <span>
                            Menampilkan <strong className="text-slate-800 dark:text-slate-200">{currentDomains.length}</strong> dari <strong className="text-slate-800 dark:text-slate-200">{totalDomains}</strong> domain
                        </span>
                        <div className="flex items-center space-x-1">
                            <span>Per Halaman:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold focus:outline-none text-slate-800 dark:text-slate-200"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition font-semibold"
                        >
                            Sebelumnya
                        </button>

                        <div className="flex items-center space-x-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                                        currentPage === page
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition font-semibold"
                        >
                            Selanjutnya
                        </button>
                    </div>
                </div>
            )}

            {/* Create / Edit Domain Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 overflow-y-auto p-4 flex justify-center items-center">
                    <form onSubmit={handleSubmit} className="my-auto w-full max-w-3xl bg-white dark:bg-[#0f172a] rounded-2xl p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-xs">
                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div>
                                <h2 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-blue-600" />
                                    {editingDomain ? 'Edit Domain' : 'Tambah Domain Baru'}
                                </h2>
                                <p className="text-slate-500 mt-0.5">
                                    Penyimpanan data lokal bersifat 1-Arah (tidak mengirimkan perubahan ke API registrar).
                                </p>
                            </div>
                            <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Read-only Alert Banner for API Domains */}
                        {isApiDomain && (
                            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                                <Lock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                                <div>
                                    <div className="font-bold text-xs">Data dari API Registrar ({editingDomain.provider.toUpperCase()})</div>
                                    <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                                        Field utama (Nama Domain, Registrar, ID External, Tanggal Registrasi, Kedaluwarsa, &amp; Status) dikunci karena disinkronkan 1-arah dari API. Untuk memperbarui data dari registrar, gunakan tombol <strong>"Sinkron Registrar"</strong>.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Domain Name */}
                            <label className="space-y-1 block">
                                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    Nama Domain *
                                    {isApiDomain && <Lock className="w-3 h-3 text-slate-400" />}
                                </span>
                                <input
                                    required
                                    disabled={isApiDomain}
                                    type="text"
                                    placeholder="contoh.com"
                                    value={form.domain_name}
                                    onChange={setField('domain_name')}
                                    className={`w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500 ${
                                        isApiDomain ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-900'
                                    }`}
                                />
                            </label>

                            {/* Provider Registrar */}
                            <label className="space-y-1 block">
                                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    Provider Registrar *
                                    {isApiDomain && <Lock className="w-3 h-3 text-slate-400" />}
                                </span>
                                <select
                                    disabled={isApiDomain}
                                    value={form.provider}
                                    onChange={setField('provider')}
                                    className={`w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500 ${
                                        isApiDomain ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-900'
                                    }`}
                                >
                                    <option value="manual">Manual Input</option>
                                    <option value="rdash">RDASH API</option>
                                    <option value="srsx">SRS-X API</option>
                                </select>
                            </label>

                            {/* External ID */}
                            <label className="space-y-1 block">
                                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    ID External Registrar
                                    {isApiDomain && <Lock className="w-3 h-3 text-slate-400" />}
                                </span>
                                <input
                                    disabled={isApiDomain}
                                    type="text"
                                    placeholder="Contoh: 478884"
                                    value={form.external_domain_id}
                                    onChange={setField('external_domain_id')}
                                    className={`w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500 ${
                                        isApiDomain ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-900'
                                    }`}
                                />
                            </label>

                            {/* Registrar Name */}
                            <label className="space-y-1 block">
                                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    Nama Registrar
                                    {isApiDomain && <Lock className="w-3 h-3 text-slate-400" />}
                                </span>
                                <input
                                    disabled={isApiDomain}
                                    type="text"
                                    placeholder="RDASH / SRS-X / Rumahweb / dll"
                                    value={form.registrar_name}
                                    onChange={setField('registrar_name')}
                                    className={`w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500 ${
                                        isApiDomain ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-900'
                                    }`}
                                />
                            </label>

                            {/* Registration Date */}
                            <label className="space-y-1 block">
                                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    Tanggal Registrasi
                                    {isApiDomain && <Lock className="w-3 h-3 text-slate-400" />}
                                </span>
                                <input
                                    disabled={isApiDomain}
                                    type="date"
                                    value={form.registration_date}
                                    onChange={setField('registration_date')}
                                    className={`w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500 ${
                                        isApiDomain ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-900'
                                    }`}
                                />
                            </label>

                            {/* Expiration Date */}
                            <label className="space-y-1 block">
                                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    Tanggal Kedaluwarsa (Expired)
                                    {isApiDomain && <Lock className="w-3 h-3 text-slate-400" />}
                                </span>
                                <input
                                    disabled={isApiDomain}
                                    type="date"
                                    value={form.expiration_date}
                                    onChange={setField('expiration_date')}
                                    className={`w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500 ${
                                        isApiDomain ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-900'
                                    }`}
                                />
                            </label>

                            {/* Billing Date */}
                            <label className="space-y-1 block">
                                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                                    Tanggal Penagihan (Billing Date)
                                </span>
                                <input
                                    type="date"
                                    value={form.billing_date}
                                    onChange={setField('billing_date')}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                                />
                                <span className="text-[10px] text-slate-400 block">Jadwal tanggal penagihan invoice ke klien untuk perpanjangan domain.</span>
                            </label>

                            {/* Domain Status */}
                            <label className="space-y-1 block">
                                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    Status Domain
                                    {isApiDomain && <Lock className="w-3 h-3 text-slate-400" />}
                                </span>
                                <select
                                    disabled={isApiDomain}
                                    value={form.status}
                                    onChange={setField('status')}
                                    className={`w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500 ${
                                        isApiDomain ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100'
                                    }`}
                                >
                                    <option value="active">Active</option>
                                    <option value="expired">Expired</option>
                                    <option value="pending">Pending</option>
                                    <option value="transferred">Transferred</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </label>

                            {/* MASTER DATA: Tipe Hosting */}
                            <label className="space-y-1 block">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">Tipe Hosting (Master Data)</span>
                                    <Link to="/settings?tab=hosting_types" className="text-[10px] text-blue-600 hover:underline">
                                        ⚙️ Kelola Master Tipe
                                    </Link>
                                </div>
                                <select
                                    value={form.hosting_type_id}
                                    onChange={handleHostingTypeChange}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">- Pilih Tipe Hosting -</option>
                                    {hostingTypes.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                                    ))}
                                </select>
                            </label>

                            {/* MASTER DATA: Provider Hosting (Connected to Tipe Hosting!) */}
                            <label className="space-y-1 block">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">Provider Hosting (Terhubung dengan Tipe)</span>
                                <select
                                    disabled={!form.hosting_type_id}
                                    value={form.hosting_provider_id}
                                    onChange={handleHostingProviderChange}
                                    className={`w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-500 ${
                                        !form.hosting_type_id ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-slate-50 dark:bg-slate-900'
                                    }`}
                                >
                                    <option value="">{!form.hosting_type_id ? 'Pilih Tipe Hosting terlebih dahulu' : '- Pilih Provider Hosting -'}</option>
                                    {availableProviders.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </label>

                            {/* IP Hosting */}
                            <label className="space-y-1 block">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">IP Server Hosting</span>
                                <input
                                    type="text"
                                    placeholder="Contoh: 103.150.190.10"
                                    value={form.hosting_ip}
                                    onChange={setField('hosting_ip')}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                                />
                            </label>

                            {/* Klien */}
                            <label className="space-y-1 block">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">Tautkan Klien</span>
                                <select
                                    value={form.client_id}
                                    onChange={setField('client_id')}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">- Tidak ditautkan -</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.company_name || c.name}</option>
                                    ))}
                                </select>
                            </label>

                            {/* Project */}
                            <label className="space-y-1 block md:col-span-2">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">Tautkan Proyek</span>
                                <select
                                    value={form.project_id}
                                    onChange={setField('project_id')}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">- Tidak ditautkan -</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        {/* Nameservers */}
                        <label className="block space-y-1">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Nameservers (Pisahkan dengan koma)</span>
                            <input
                                type="text"
                                placeholder="ns1.mzi.co.id, ns2.mzi.co.id"
                                value={form.nameservers}
                                onChange={setField('nameservers')}
                                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                            />
                        </label>

                        {/* Auto renew */}
                        <label className="flex gap-2 items-center text-slate-700 dark:text-slate-300">
                            <input
                                type="checkbox"
                                checked={!!form.auto_renew}
                                onChange={setField('auto_renew')}
                                className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="font-semibold">Perpanjangan Otomatis (Auto Renew)</span>
                        </label>

                        {/* Catatan */}
                        <label className="block space-y-1">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Catatan / Keterangan</span>
                            <textarea
                                rows="3"
                                placeholder="Catatan internal domain ini..."
                                value={form.notes}
                                onChange={setField('notes')}
                                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                            />
                        </label>

                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                            >
                                <Save className="w-4 h-4" />
                                <span>Simpan Data Domain</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
