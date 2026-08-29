import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useConfirm } from '../../context/ConfirmContext';
import SearchableSelect from '../../components/SearchableSelect';
import {
    Users,
    UserPlus,
    Search,
    Building2,
    Mail,
    Phone,
    MapPin,
    Globe,
    FileText,
    CreditCard,
    Plus,
    Trash2,
    Edit3,
    Eye,
    X,
    RefreshCw,
    ShieldCheck,
    Briefcase,
    UserCheck,
    Star,
    CheckCircle2,
    LayoutGrid,
    List,
    Tag,
    SlidersHorizontal,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

export default function ClientList() {
    const { confirm } = useConfirm();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

    const [showFormModal, setShowFormModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [editingClient, setEditingClient] = useState(null);
    const [formTab, setFormTab] = useState('general'); // 'general' | 'contact' | 'pics'
    const [submitting, setSubmitting] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalClientsCount, setTotalClientsCount] = useState(0);
    const [perPage, setPerPage] = useState(10);

    const [showAdvanceFilter, setShowAdvanceFilter] = useState(false);
    const [statusFilter, setStatusFilter] = useState(''); // '' | '1' | '0'
    const [sortBy, setSortBy] = useState('latest');
    const [industryFilter, setIndustryFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');

    const activeFilterCount = [
        typeFilter,
        statusFilter,
        sortBy !== 'latest' ? sortBy : '',
        industryFilter,
        cityFilter,
    ].filter(Boolean).length;

    const handleResetFilters = () => {
        setTypeFilter('');
        setStatusFilter('');
        setSortBy('latest');
        setIndustryFilter('');
        setCityFilter('');
    };

    const [form, setForm] = useState({
        name: '',
        company_name: '',
        alias: '',
        industry: '',
        client_type: 'CORPORATE',
        tax_number: '',
        website: '',
        email: '',
        phone: '',
        alt_phone: '',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        is_active: true,
        pics: [
            { name: '', position: 'Procurement Manager', email: '', phone: '', is_primary: true, notes: '' }
        ]
    });

    const fetchClients = async (page = 1, currentPerPage = perPage) => {
        setLoading(true);
        try {
            const res = await api.get('/clients', {
                params: {
                    paginate: 1,
                    page: page,
                    per_page: currentPerPage,
                    search: searchTerm,
                    client_type: typeFilter,
                    status: statusFilter,
                    sort_by: sortBy,
                    industry: industryFilter,
                    city: cityFilter
                }
            });
            const paginatedData = res.data.data || {};
            setClients(paginatedData.data || []);
            setCurrentPage(paginatedData.current_page || 1);
            setLastPage(paginatedData.last_page || 1);
            setTotalClientsCount(paginatedData.total || 0);
        } catch (err) {
            console.error('Error fetching clients:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchClients(1);
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm, typeFilter, perPage, statusFilter, sortBy, industryFilter, cityFilter]);

    const handleOpenFormModal = (cli = null) => {
        setFormTab('general');
        if (cli) {
            setEditingClient(cli);
            setForm({
                name: cli.name || '',
                company_name: cli.company_name || '',
                alias: cli.alias || '',
                industry: cli.industry || '',
                client_type: cli.client_type || 'CORPORATE',
                tax_number: cli.tax_number || '',
                website: cli.website || '',
                email: cli.email || '',
                phone: cli.phone || '',
                alt_phone: cli.alt_phone || '',
                address: cli.address || '',
                city: cli.city || '',
                province: cli.province || '',
                postal_code: cli.postal_code || '',
                is_active: cli.is_active ?? true,
                pics: cli.pics && cli.pics.length > 0
                    ? cli.pics.map(p => ({
                        name: p.name || '',
                        position: p.position || '',
                        email: p.email || '',
                        phone: p.phone || '',
                        is_primary: p.is_primary ?? false,
                        notes: p.notes || ''
                    }))
                    : [{ name: '', position: 'Procurement Manager', email: '', phone: '', is_primary: true, notes: '' }]
            });
        } else {
            setEditingClient(null);
            setForm({
                name: '',
                company_name: '',
                alias: '',
                industry: 'Teknologi Informasi & Software',
                client_type: 'CORPORATE',
                tax_number: '',
                website: '',
                email: '',
                phone: '',
                alt_phone: '',
                address: '',
                city: 'Jakarta',
                province: 'DKI Jakarta',
                postal_code: '',
                is_active: true,
                pics: [
                    { name: '', position: 'Procurement Manager', email: '', phone: '', is_primary: true, notes: '' }
                ]
            });
        }
        setShowFormModal(true);
    };

    const handleAddPic = () => {
        setForm({
            ...form,
            pics: [
                ...form.pics,
                { name: '', position: 'Finance / Purchasing', email: '', phone: '', is_primary: form.pics.length === 0, notes: '' }
            ]
        });
    };

    const handleRemovePic = (index) => {
        if (form.pics.length === 1) return;
        const newPics = form.pics.filter((_, i) => i !== index);
        setForm({ ...form, pics: newPics });
    };

    const handlePicChange = (index, field, value) => {
        const newPics = [...form.pics];
        if (field === 'is_primary' && value) {
            newPics.forEach((p, i) => { p.is_primary = i === index; });
        } else {
            newPics[index][field] = value;
        }
        setForm({ ...form, pics: newPics });
    };

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const filteredPics = form.pics.filter(pic => pic.name && pic.name.trim() !== '');
        const payload = {
            ...form,
            name: form.company_name || form.name,
            pics: filteredPics
        };
        try {
            if (editingClient) {
                await api.put(`/clients/${editingClient.id}`, payload);
                alert('Data Klien & PIC berhasil diperbarui!');
            } else {
                await api.post('/clients', payload);
                alert('Klien & PIC baru berhasil ditambahkan!');
            }
            setShowFormModal(false);
            fetchClients();
        } catch (err) {
            alert('Gagal menyimpan data klien: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClient = async (cli) => {
        const displayName = cli.company_name || cli.name;
        const ok = await confirm({
            title: 'Hapus Data Klien',
            message: `Apakah Anda yakin ingin menghapus data Klien "${displayName}"? Tindakan ini tidak dapat dibatalkan.`,
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/clients/${cli.id}`);
            fetchClients();
        } catch (err) {
            alert('Gagal menghapus data klien.');
        }
    };

    // Metrics calculation
    const totalClients = clients.length;
    const corporateClients = clients.filter(c => c.client_type === 'CORPORATE').length;
    const totalPics = clients.reduce((acc, c) => acc + (c.pics?.length || 0), 0);
    const activeClients = clients.filter(c => c.is_active).length;

    const typeBadges = {
        CORPORATE: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        INDIVIDUAL: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        GOVERNMENT: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span>Klien & Penanggung Jawab (PIC)</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Manajemen data utama Perusahaan / Instansi / Klien, alias brand, alamat kantor, serta penanggung jawab (PIC).
                    </p>
                </div>
                <Link
                    to="/clients/create"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all"
                >
                    <UserPlus className="w-4 h-4" />
                    <span>Tambah Klien Baru</span>
                </Link>
            </div>

            {/* Metric Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Klien Terdaftar</p>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{totalClientsCount}</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Perusahaan & Instansi</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Klien Korporat</p>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{corporateClients}</h3>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Entitas Badan Hukum</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                        <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Contact PIC</p>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{totalPics}</h3>
                        <p className="text-[10px] text-purple-600 dark:text-purple-400 font-medium mt-0.5">Kontak Person Terdaftar</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Status Klien Aktif</p>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{activeClients}</h3>
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">Siap Melakukan Transaksi</p>
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari kode, nama perusahaan, alias, email, atau PIC..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
                        />
                    </div>

                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
                        <button
                            type="button"
                            onClick={() => setShowAdvanceFilter(!showAdvanceFilter)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all border ${
                                showAdvanceFilter || activeFilterCount > 0
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 shadow-sm'
                                    : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                            }`}
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span>Filter Lanjutan</span>
                            {activeFilterCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white">
                                    {activeFilterCount}
                                </span>
                            )}
                            {showAdvanceFilter ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        <button
                            type="button"
                            onClick={() => fetchClients(1)}
                            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            title="Refresh Data"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>

                        {/* View Switcher: Tabel (Default) vs Card Grid */}
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 ml-1">
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                                    viewMode === 'table'
                                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                                title="Tampilan Tabel (Default)"
                            >
                                <List className="w-3.5 h-3.5" />
                                <span>Tabel</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                                    viewMode === 'grid'
                                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                                title="Tampilan Kartu / Grid"
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                <span>Kartu</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Expandable Collapsible Filter Panel */}
                {showAdvanceFilter && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in duration-200">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Tipe Klien</label>
                            <SearchableSelect
                                options={[
                                    { value: '', label: 'Semua Tipe Klien' },
                                    { value: 'CORPORATE', label: 'CORPORATE (Perusahaan)' },
                                    { value: 'INDIVIDUAL', label: 'INDIVIDUAL (Perorangan)' },
                                    { value: 'GOVERNMENT', label: 'GOVERNMENT (Pemerintah/BUMN)' },
                                ]}
                                value={typeFilter}
                                onChange={(val) => setTypeFilter(val)}
                                placeholder="Semua Tipe..."
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Status Keaktifan</label>
                            <SearchableSelect
                                options={[
                                    { value: '', label: 'Semua Status' },
                                    { value: '1', label: 'Aktif' },
                                    { value: '0', label: 'Nonaktif' },
                                ]}
                                value={statusFilter}
                                onChange={(val) => setStatusFilter(val)}
                                placeholder="Semua Status..."
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Urutan Data (Sort)</label>
                            <SearchableSelect
                                options={[
                                    { value: 'latest', label: 'Terbaru Terdaftar' },
                                    { value: 'oldest', label: 'Terlama Terdaftar' },
                                    { value: 'name_asc', label: 'Nama (A - Z)' },
                                    { value: 'name_desc', label: 'Nama (Z - A)' },
                                ]}
                                value={sortBy}
                                onChange={(val) => setSortBy(val)}
                                placeholder="Urutan Data..."
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Pencarian Detail</label>
                                {activeFilterCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleResetFilters}
                                        className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-0.5"
                                    >
                                        <X className="w-3 h-3" />
                                        <span>Reset Filter</span>
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center space-x-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-600 dark:text-slate-300">
                                <input
                                    type="text"
                                    value={industryFilter}
                                    onChange={(e) => setIndustryFilter(e.target.value)}
                                    placeholder="Industri..."
                                    className="bg-transparent border-0 focus:outline-none font-semibold text-slate-800 dark:text-slate-200 p-0 text-xs w-full"
                                />
                                <span className="text-slate-400 shrink-0">/</span>
                                <input
                                    type="text"
                                    value={cityFilter}
                                    onChange={(e) => setCityFilter(e.target.value)}
                                    placeholder="Kota..."
                                    className="bg-transparent border-0 focus:outline-none font-semibold text-slate-800 dark:text-slate-200 p-0 text-xs w-full"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Display: Data Table (Default) OR Card Grid */}
            {loading ? (
                <div className="flex justify-center p-12 text-xs text-slate-500 dark:text-slate-400">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2 text-blue-600 dark:text-blue-400" />
                    <span>Memuat daftar klien...</span>
                </div>
            ) : clients.length === 0 ? (
                <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 bg-white dark:bg-[#0f172a]">
                    Belum ada data klien terdaftar.
                </div>
            ) : viewMode === 'table' ? (
                /* Table View (Default) */
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                    <th className="py-3 px-4">Kode</th>
                                    <th className="py-3 px-4">Nama Perusahaan / Instansi / Klien</th>
                                    <th className="py-3 px-4">Alias / Brand</th>
                                    <th className="py-3 px-4">Tipe & Industri</th>
                                    <th className="py-3 px-4">Kontak Perusahaan</th>
                                    <th className="py-3 px-4">Penanggung Jawab (PIC Utama)</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                {clients.map((cli) => {
                                    const primaryPic = cli.pics?.find(p => p.is_primary) || cli.pics?.[0];
                                    const mainName = cli.company_name || cli.name;
                                    return (
                                        <tr key={cli.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="py-3 px-4 font-mono font-bold">
                                                <Link
                                                    to={`/clients/${cli.id}`}
                                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 hover:underline text-left"
                                                    title="Klik untuk lihat detail lengkap Klien"
                                                >
                                                    {cli.code}
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Link
                                                    to={`/clients/${cli.id}`}
                                                    className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 hover:underline flex items-center gap-1.5 text-left"
                                                    title="Klik untuk lihat detail lengkap Klien"
                                                >
                                                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span>{mainName}</span>
                                                </Link>
                                                {cli.name && cli.name !== mainName && (
                                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 pl-5">{cli.name}</div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                {cli.alias ? (
                                                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                        {cli.alias}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic text-[11px]">-</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${typeBadges[cli.client_type] || typeBadges.CORPORATE}`}>
                                                    {cli.client_type || 'CORPORATE'}
                                                </span>
                                                {cli.industry && (
                                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{cli.industry}</div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                                                <div className="font-mono">{cli.email || '-'}</div>
                                                <div className="text-[11px] text-slate-500">{cli.phone || '-'}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                {primaryPic ? (
                                                    <div>
                                                        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                                            {primaryPic.is_primary && <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                                                            <span>{primaryPic.name}</span>
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 font-mono">{primaryPic.position} {primaryPic.phone ? `(${primaryPic.phone})` : ''}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic text-[11px]">- Belum ada PIC</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end space-x-1.5">
                                                    <Link
                                                        to={`/clients/${cli.id}`}
                                                        className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                                                        title="Lihat Detail Lengkap Klien"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <Link
                                                        to={`/clients/${cli.id}/edit`}
                                                        className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                                                        title="Edit Data Klien"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeleteClient(cli)}
                                                        className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                                        title="Hapus Klien"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Card Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clients.map((cli) => {
                        const mainName = cli.company_name || cli.name;
                        return (
                            <div
                                key={cli.id}
                                className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4 shadow-sm flex flex-col justify-between"
                            >
                                <div className="space-y-3">
                                    {/* Top Badge & Type */}
                                    <div className="flex items-start justify-between">
                                        <Link
                                            to={`/clients/${cli.id}`}
                                            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 hover:underline"
                                            title="Klik untuk lihat detail lengkap Klien"
                                        >
                                            {cli.code}
                                        </Link>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${typeBadges[cli.client_type] || typeBadges.CORPORATE}`}>
                                            {cli.client_type || 'CORPORATE'}
                                        </span>
                                    </div>

                                    {/* Client Header */}
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{mainName}</h3>
                                            {cli.alias && (
                                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                    {cli.alias}
                                                </span>
                                            )}
                                        </div>
                                        {cli.industry && <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{cli.industry}</p>}
                                    </div>

                                    {/* Contact Details */}
                                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                                        {cli.email && (
                                            <div className="flex items-center space-x-2">
                                                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span className="truncate">{cli.email}</span>
                                            </div>
                                        )}
                                        {cli.phone && (
                                            <div className="flex items-center space-x-2">
                                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span>{cli.phone}</span>
                                            </div>
                                        )}
                                        {cli.address && (
                                            <div className="flex items-start space-x-2 text-[11px] text-slate-500 dark:text-slate-400">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                                <span className="line-clamp-2">{cli.address}, {cli.city || ''}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Multi PIC Badges */}
                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-slate-400 font-semibold">Penanggung Jawab / PIC:</span>
                                            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                                                {cli.pics?.length || 0} PIC
                                            </span>
                                        </div>

                                        {cli.pics && cli.pics.length > 0 ? (
                                            <div className="space-y-1">
                                                {cli.pics.slice(0, 2).map((p, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px]">
                                                        <div className="flex items-center space-x-1.5 truncate">
                                                            {p.is_primary && <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                                                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{p.name}</span>
                                                            <span className="text-[10px] text-slate-400">({p.position || 'PIC'})</span>
                                                        </div>
                                                        {p.phone && <span className="font-mono text-[10px] text-slate-500 shrink-0">{p.phone}</span>}
                                                    </div>
                                                ))}
                                                {cli.pics.length > 2 && (
                                                    <p className="text-[10px] text-slate-400 text-right">+ {cli.pics.length - 2} PIC lainnya</p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-[11px] text-slate-400 italic">Belum ada data PIC.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Card Footer Actions */}
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <span className="text-[10px] font-mono text-slate-400">
                                        {cli.invoices_count ?? 0} Transaksi Invoice
                                    </span>
                                    <div className="flex space-x-1.5">
                                        <Link
                                            to={`/clients/${cli.id}`}
                                            className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                                            title="Lihat Detail Lengkap Klien"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                        </Link>
                                        <Link
                                            to={`/clients/${cli.id}/edit`}
                                            className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                                            title="Edit Data Klien"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteClient(cli)}
                                            className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                            title="Hapus Klien"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination Controls */}
            {!loading && totalClientsCount > 0 && (
                <div className="mt-4 p-4 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
                    <div className="flex items-center space-x-4">
                        <span className="text-[11px] text-slate-500">
                            Menampilkan <strong className="font-semibold text-slate-800 dark:text-slate-200">{clients.length}</strong> dari <strong className="font-semibold text-slate-800 dark:text-slate-200">{totalClientsCount}</strong> klien
                        </span>

                        <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
                            <span>Tampilkan:</span>
                            <div className="w-20">
                                <SearchableSelect
                                    options={[
                                        { value: 10, label: '10' },
                                        { value: 25, label: '25' },
                                        { value: 50, label: '50' },
                                        { value: 100, label: '100' },
                                    ]}
                                    value={perPage}
                                    onChange={(val) => {
                                        const num = parseInt(val);
                                        setPerPage(num);
                                        fetchClients(1, num);
                                    }}
                                    placeholder="10"
                                />
                            </div>
                        </div>
                    </div>

                    {lastPage > 1 && (
                        <div className="inline-flex space-x-1.5">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => fetchClients(currentPage - 1)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50 text-slate-700 dark:text-slate-300"
                            >
                                Sebelumnya
                            </button>
                            {[...Array(lastPage).keys()].map((p) => (
                                <button
                                    key={p + 1}
                                    onClick={() => fetchClients(p + 1)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                                        currentPage === p + 1
                                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                                            : 'border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                                    }`}
                                >
                                    {p + 1}
                                </button>
                            ))}
                            <button
                                disabled={currentPage === lastPage}
                                onClick={() => fetchClients(currentPage + 1)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50 text-slate-700 dark:text-slate-300"
                            >
                                Berikutnya
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modal Add/Edit Client with 3 Tabs */}
            {showFormModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="w-full max-w-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-2xl space-y-4 my-8">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                {editingClient ? `Edit Data Klien: ${editingClient.company_name || editingClient.name}` : 'Tambah Klien Baru'}
                            </h3>
                            <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Tabs */}
                        <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-px text-xs font-semibold">
                            <button
                                type="button"
                                onClick={() => setFormTab('general')}
                                className={`px-3.5 py-1.5 rounded-t-lg transition-all ${formTab === 'general'
                                        ? 'bg-blue-600 text-white font-bold'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                1. Informasi Perusahaan / Klien
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormTab('contact')}
                                className={`px-3.5 py-1.5 rounded-t-lg transition-all ${formTab === 'contact'
                                        ? 'bg-blue-600 text-white font-bold'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                2. Kontak & Alamat Kantor
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormTab('pics')}
                                className={`px-3.5 py-1.5 rounded-t-lg transition-all ${formTab === 'pics'
                                        ? 'bg-purple-600 text-white font-bold'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                3. Penanggung Jawab / PIC ({form.pics.length})
                            </button>
                        </div>

                        <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
                            {/* Tab 1: Informasi Perusahaan / Klien & Alias */}
                            {formTab === 'general' && (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Tipe Klien *</label>
                                            <SearchableSelect
                                                options={[
                                                    { value: 'CORPORATE', label: 'CORPORATE (Perusahaan)' },
                                                    { value: 'INDIVIDUAL', label: 'INDIVIDUAL (Perorangan)' },
                                                    { value: 'GOVERNMENT', label: 'GOVERNMENT (Pemerintah/BUMN)' },
                                                ]}
                                                value={form.client_type}
                                                onChange={(val) => setForm({ ...form, client_type: val })}
                                                placeholder="Pilih Tipe..."
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                                Nama Perusahaan / Instansi / Klien *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={form.company_name || form.name}
                                                onChange={(e) => setForm({ ...form, company_name: e.target.value, name: e.target.value })}
                                                placeholder="ex: PT Mikrotek Zemiro Indonesia"
                                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-semibold"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                                Alias / Brand Alias
                                            </label>
                                            <input
                                                type="text"
                                                value={form.alias}
                                                onChange={(e) => setForm({ ...form, alias: e.target.value })}
                                                placeholder="ex: MIKROTEK"
                                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono uppercase"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Industri / Sektor</label>
                                            <input
                                                type="text"
                                                value={form.industry}
                                                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                                                placeholder="ex: IT, Perbankan, Konstruksi"
                                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nomor NPWP Klien</label>
                                            <input
                                                type="text"
                                                value={form.tax_number}
                                                onChange={(e) => setForm({ ...form, tax_number: e.target.value })}
                                                placeholder="01.234.567.8-012.000"
                                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Website Resmi</label>
                                        <input
                                            type="text"
                                            value={form.website}
                                            onChange={(e) => setForm({ ...form, website: e.target.value })}
                                            placeholder="https://www.mikrotek.co.id"
                                            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Tab 2: Contact Information */}
                            {formTab === 'contact' && (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Email Resmi Perusahaan</label>
                                            <input
                                                type="email"
                                                value={form.email}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                placeholder="info@mikrotek.co.id"
                                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">No. Telepon Kantor</label>
                                            <input
                                                type="text"
                                                value={form.phone}
                                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                                placeholder="021-5550192"
                                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">No. Telepon Alternatif / Fax</label>
                                            <input
                                                type="text"
                                                value={form.alt_phone}
                                                onChange={(e) => setForm({ ...form, alt_phone: e.target.value })}
                                                placeholder="08123456789"
                                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Alamat Lengkap Kantor</label>
                                        <textarea
                                            rows={2}
                                            value={form.address}
                                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                                            placeholder="Gedung Mega Tower Lt. 12, Jl. Jend. Sudirman Kav. 50..."
                                            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200"
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Kota / Kabupaten</label>
                                            <input
                                                type="text"
                                                value={form.city}
                                                onChange={(e) => setForm({ ...form, city: e.target.value })}
                                                placeholder="Jakarta Selatan"
                                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Provinsi</label>
                                            <input
                                                type="text"
                                                value={form.province}
                                                onChange={(e) => setForm({ ...form, province: e.target.value })}
                                                placeholder="DKI Jakarta"
                                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Kode Pos</label>
                                            <input
                                                type="text"
                                                value={form.postal_code}
                                                onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                                                placeholder="12190"
                                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 3: Multi PIC (Person in Charge) */}
                            {formTab === 'pics' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                                <UserCheck className="w-4 h-4 text-purple-500" />
                                                <span>Daftar Penanggung Jawab / PIC (Person in Charge)</span>
                                            </h4>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                Kelola kontak perorangan penanggung jawab (Procurement, Finance, CTO, dll).
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddPic}
                                            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Tambah PIC</span>
                                        </button>
                                    </div>

                                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                                        {form.pics.map((pic, index) => (
                                            <div
                                                key={index}
                                                className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${pic.is_primary
                                                        ? 'bg-purple-500/5 border-purple-500/30'
                                                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                                        <span>PIC #{index + 1}</span>
                                                        {pic.is_primary && (
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 inline-flex items-center gap-1">
                                                                <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                                                <span>PIC Utama</span>
                                                            </span>
                                                        )}
                                                    </span>
                                                    <div className="flex items-center space-x-2">
                                                        <label className="flex items-center space-x-1.5 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="primary_pic_radio"
                                                                checked={pic.is_primary}
                                                                onChange={() => handlePicChange(index, 'is_primary', true)}
                                                                className="text-purple-600 focus:ring-purple-500"
                                                            />
                                                            <span>Jadikan PIC Utama</span>
                                                        </label>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemovePic(index)}
                                                            disabled={form.pics.length === 1}
                                                            className="text-slate-400 hover:text-rose-600 p-1 disabled:opacity-30"
                                                            title="Hapus PIC ini"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2.5">
                                                    <div>
                                                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nama Lengkap PIC</label>
                                                        <input
                                                            type="text"
                                                            placeholder="ex: Dian Sastro"
                                                            value={pic.name}
                                                            onChange={(e) => handlePicChange(index, 'name', e.target.value)}
                                                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-slate-200 text-xs"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Jabatan / Peranan PIC</label>
                                                        <input
                                                            type="text"
                                                            placeholder="ex: Procurement Lead"
                                                            value={pic.position}
                                                            onChange={(e) => handlePicChange(index, 'position', e.target.value)}
                                                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-slate-200 text-xs"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2.5">
                                                    <div>
                                                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Email Direct PIC</label>
                                                        <input
                                                            type="email"
                                                            placeholder="dian@mikrotek.co.id"
                                                            value={pic.email}
                                                            onChange={(e) => handlePicChange(index, 'email', e.target.value)}
                                                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-slate-200 text-xs font-mono"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">No. WA / Telepon Direct</label>
                                                        <input
                                                            type="text"
                                                            placeholder="081299887766"
                                                            value={pic.phone}
                                                            onChange={(e) => handlePicChange(index, 'phone', e.target.value)}
                                                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-slate-200 text-xs font-mono"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Modal Footer Controls */}
                            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                {formTab === 'general' ? (
                                    <button
                                        type="button"
                                        onClick={() => setFormTab('contact')}
                                        className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                                    >
                                        Lanjut ke Kontak & Alamat Kantor &rarr;
                                    </button>
                                ) : formTab === 'contact' ? (
                                    <button
                                        type="button"
                                        onClick={() => setFormTab('pics')}
                                        className="text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                                    >
                                        Lanjut ke Kelola PIC &rarr;
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setFormTab('contact')}
                                        className="text-slate-500 hover:underline font-semibold"
                                    >
                                        &larr; Kembali ke Kontak Kantor
                                    </button>
                                )}

                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowFormModal(false)}
                                        className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold flex items-center space-x-1"
                                    >
                                        {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Simpan Data Klien</span>}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Detail Klien & All PICs */}
            {showDetailModal && selectedClient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="w-full max-w-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-2xl space-y-4 my-8">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                        {selectedClient.code}
                                    </span>
                                    {selectedClient.alias && (
                                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                            ALIAS: {selectedClient.alias}
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-1">
                                    {selectedClient.company_name || selectedClient.name}
                                </h3>
                            </div>
                            <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 text-xs">
                            {/* General & Contact Info */}
                            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Informasi Klien</span>
                                    <p className="text-slate-700 dark:text-slate-300"><strong>Tipe:</strong> {selectedClient.client_type}</p>
                                    <p className="text-slate-700 dark:text-slate-300"><strong>Industri:</strong> {selectedClient.industry || '-'}</p>
                                    <p className="text-slate-700 dark:text-slate-300 font-mono"><strong>NPWP:</strong> {selectedClient.tax_number || '-'}</p>
                                    {selectedClient.website && (
                                        <p className="text-slate-700 dark:text-slate-300"><strong>Website:</strong> <a href={selectedClient.website} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{selectedClient.website}</a></p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Kontak & Alamat Kantor</span>
                                    <p className="text-slate-700 dark:text-slate-300"><strong>Email:</strong> {selectedClient.email || '-'}</p>
                                    <p className="text-slate-700 dark:text-slate-300"><strong>Telepon:</strong> {selectedClient.phone || '-'}</p>
                                    <p className="text-slate-700 dark:text-slate-300"><strong>Alamat:</strong> {selectedClient.address || '-'}</p>
                                    <p className="text-slate-700 dark:text-slate-300"><strong>Kota/Provinsi:</strong> {selectedClient.city || ''} {selectedClient.province ? `, ${selectedClient.province}` : ''}</p>
                                </div>
                            </div>

                            {/* Multi PIC List */}
                            <div className="space-y-2">
                                <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                    <UserCheck className="w-4 h-4 text-purple-500" />
                                    <span>Penanggung Jawab / Person in Charge (PIC)</span>
                                </h4>

                                {selectedClient.pics && selectedClient.pics.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {selectedClient.pics.map((p, idx) => (
                                            <div key={idx} className={`p-3.5 rounded-xl border space-y-1 ${p.is_primary ? 'bg-purple-500/5 border-purple-500/30' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-slate-900 dark:text-slate-100">{p.name}</span>
                                                    {p.is_primary && (
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 inline-flex items-center gap-1">
                                                            <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                                            <span>PIC Utama</span>
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-slate-500 dark:text-slate-400 text-[11px]">{p.position || 'Staff Contact'}</p>
                                                {p.email && <p className="font-mono text-[11px] text-slate-600 dark:text-slate-300">{p.email}</p>}
                                                {p.phone && <p className="font-mono text-[11px] text-blue-600 dark:text-blue-400">WA: {p.phone}</p>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-400 italic">Belum ada PIC terdaftar untuk klien ini.</p>
                                )}
                            </div>
                        </div>

                        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
