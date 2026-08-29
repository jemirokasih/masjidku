import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useConfirm } from '../../context/ConfirmContext';
import SearchableSelect from '../../components/SearchableSelect';
import { Package, Plus, Tag, Search, X, RefreshCw, Trash2, List, LayoutGrid, Edit3, CheckCircle2, Save, Filter, Layers } from 'lucide-react';

export default function ProductList() {
    const { confirm } = useConfirm();
    const location = useLocation();
    const navigate = useNavigate();
    const queryTab = new URLSearchParams(location.search).get('tab') || 'catalog';
    const [activeTab, setActiveTab] = useState(queryTab);

    useEffect(() => {
        if (queryTab) {
            setActiveTab(queryTab);
        }
    }, [queryTab]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        navigate(`/products?tab=${tabId}`);
    };

    // Product state
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [viewMode, setViewMode] = useState('table'); // 'table' (default) | 'grid'

    // Categories state (initial defaults + dynamic from products)
    const defaultCategories = [
        'Web Development',
        'Mobile App Development',
        'Cloud & Infrastructure',
        'IT Consulting & Audit',
        'Maintenance & Support',
        'Hardware & Networking',
        'Software License',
        'Lainnya'
    ];
    const [categoryList, setCategoryList] = useState(defaultCategories);
    const [showCatModal, setShowCatModal] = useState(false);
    const [catForm, setCatForm] = useState({ name: '', description: '' });
    const [editingCatIndex, setEditingCatIndex] = useState(null);

    // Units state
    const defaultUnits = [
        { name: 'Paket', code: 'PKT', example: 'Penawaran 1 Paket Web Apps' },
        { name: 'Bulan', code: 'BLN', example: 'Langganan Sewa Server / Bulan' },
        { name: 'Tahun', code: 'THN', example: 'Lisensi Domain & SSL / Tahun' },
        { name: 'Jam', code: 'JAM', example: 'Tarif Konsultasi IT @ Rp 500rb / Jam' },
        { name: 'Hari', code: 'HRI', example: 'Jasa Programmer Onsite / Hari' },
        { name: 'Unit', code: 'UNT', example: 'Pembelian Perangkat Hardware' },
        { name: 'Lisensi', code: 'LSN', example: 'Lisensi Software Per User' },
        { name: 'Pcs', code: 'PCS', example: 'Komponen Pendukung' },
    ];
    const [unitList, setUnitList] = useState(defaultUnits);
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [unitForm, setUnitForm] = useState({ name: '', code: '', example: '' });
    const [editingUnitIndex, setEditingUnitIndex] = useState(null);

    const [form, setForm] = useState({
        code: '',
        name: '',
        category: 'Web Development',
        description: '',
        unit: 'Paket',
        unit_price: 1000000,
        is_active: true,
    });

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/products', { params: { search: searchTerm } });
            const fetched = res.data.data || [];
            setProducts(fetched);

            // Merge dynamic categories from DB products
            const DBcats = fetched.map(p => p.category).filter(Boolean);
            setCategoryList(prev => Array.from(new Set([...prev, ...DBcats])));
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    const filteredProducts = products.filter(p => {
        if (!selectedCategory) return true;
        return p.category === selectedCategory;
    });

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setForm({
                code: product.code || '',
                name: product.name || '',
                category: product.category || 'Web Development',
                description: product.description || '',
                unit: product.unit || 'Paket',
                unit_price: product.unit_price || 0,
                is_active: product.is_active ?? true,
            });
        } else {
            setEditingProduct(null);
            setForm({
                code: '',
                name: '',
                category: categoryList[0] || 'Web Development',
                description: '',
                unit: unitList[0]?.name || 'Paket',
                unit_price: 1000000,
                is_active: true,
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct.id}`, form);
                alert('Data produk / layanan berhasil diperbarui!');
            } else {
                await api.post('/products', form);
                alert('Produk / layanan baru berhasil ditambahkan!');
            }
            setShowModal(false);
            fetchProducts();
        } catch (err) {
            alert('Gagal menyimpan produk: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (product) => {
        try {
            await api.put(`/products/${product.id}`, {
                ...product,
                is_active: !product.is_active,
            });
            fetchProducts();
        } catch (err) {
            alert('Gagal mengubah status produk.');
        }
    };

    const handleDelete = async (id) => {
        const ok = await confirm({
            title: 'Hapus Produk / Layanan',
            message: 'Apakah Anda yakin ingin menghapus produk / layanan ini? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/products/${id}`);
            alert('Produk berhasil dihapus.');
            fetchProducts();
        } catch (err) {
            alert('Gagal menghapus produk: ' + (err.response?.data?.message || err.message));
        }
    };

    // Category Handlers
    const handleOpenCatModal = (catName = null, index = null) => {
        if (catName !== null) {
            setEditingCatIndex(index);
            setCatForm({ name: catName, description: 'Kategori produk & layanan transaksi' });
        } else {
            setEditingCatIndex(null);
            setCatForm({ name: '', description: '' });
        }
        setShowCatModal(true);
    };

    const handleSubmitCategory = (e) => {
        e.preventDefault();
        if (!catForm.name.trim()) return;

        if (editingCatIndex !== null) {
            const updated = [...categoryList];
            updated[editingCatIndex] = catForm.name.trim();
            setCategoryList(updated);
        } else {
            if (!categoryList.includes(catForm.name.trim())) {
                setCategoryList([...categoryList, catForm.name.trim()]);
            }
        }
        setShowCatModal(false);
        alert('Kategori berhasil disimpan!');
    };

    const handleDeleteCategory = async (catName) => {
        const ok = await confirm({
            title: 'Hapus Kategori',
            message: `Apakah Anda yakin ingin menghapus kategori "${catName}"? Tindakan ini tidak dapat dibatalkan.`,
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        setCategoryList(categoryList.filter(c => c !== catName));
    };

    // Unit Handlers
    const handleOpenUnitModal = (unit = null, index = null) => {
        if (unit) {
            setEditingUnitIndex(index);
            setUnitForm({ name: unit.name, code: unit.code, example: unit.example });
        } else {
            setEditingUnitIndex(null);
            setUnitForm({ name: '', code: '', example: '' });
        }
        setShowUnitModal(true);
    };

    const handleSubmitUnit = (e) => {
        e.preventDefault();
        if (!unitForm.name.trim()) return;

        if (editingUnitIndex !== null) {
            const updated = [...unitList];
            updated[editingUnitIndex] = { ...unitForm };
            setUnitList(updated);
        } else {
            setUnitList([...unitList, { ...unitForm }]);
        }
        setShowUnitModal(false);
        alert('Satuan unit berhasil disimpan!');
    };

    const handleDeleteUnit = async (index) => {
        const ok = await confirm({
            title: 'Hapus Satuan Unit',
            message: 'Apakah Anda yakin ingin menghapus satuan unit ini? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        setUnitList(unitList.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span>Manajemen Produk & Layanan Jasa</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Kelola katalog produk, pengelompokan kategori, dan tarif satuan unit transaksi perusahaan.
                    </p>
                </div>

                {activeTab === 'catalog' && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all self-start md:self-auto"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Produk / Jasa</span>
                    </button>
                )}

                {activeTab === 'categories' && (
                    <button
                        onClick={() => handleOpenCatModal()}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all self-start md:self-auto"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Kategori Baru</span>
                    </button>
                )}

                {activeTab === 'units' && (
                    <button
                        onClick={() => handleOpenUnitModal()}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all self-start md:self-auto"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Satuan Unit</span>
                    </button>
                )}
            </div>

            {/* Navigation Sub-Tabs */}
            <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto">
                <button
                    onClick={() => handleTabChange('catalog')}
                    className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center space-x-2 transition-all ${
                        activeTab === 'catalog'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                >
                    <Package className="w-4 h-4" />
                    <span>Katalog Produk & Jasa</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'catalog' ? 'bg-blue-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                        {products.length}
                    </span>
                </button>

                <button
                    onClick={() => handleTabChange('categories')}
                    className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center space-x-2 transition-all ${
                        activeTab === 'categories'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                >
                    <Tag className="w-4 h-4" />
                    <span>Kategori</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'categories' ? 'bg-blue-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                        {categoryList.length}
                    </span>
                </button>

                <button
                    onClick={() => handleTabChange('units')}
                    className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center space-x-2 transition-all ${
                        activeTab === 'units'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                >
                    <Layers className="w-4 h-4" />
                    <span>Satuan Unit</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'units' ? 'bg-blue-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                        {unitList.length}
                    </span>
                </button>
            </div>

            {/* TAB 1: KATALOG PRODUK & JASA */}
            {activeTab === 'catalog' && (
                <div className="space-y-4">
                    {/* Search Bar & Filter Controls */}
                    <div className="p-4 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                            <div className="relative w-full sm:w-72">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Cari nama produk, kode, atau kategori..."
                                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="w-full sm:w-48">
                                <SearchableSelect
                                    options={[
                                        { value: '', label: 'Semua Kategori' },
                                        ...categoryList.map((cat) => ({ value: cat, label: cat }))
                                    ]}
                                    value={selectedCategory}
                                    onChange={(val) => setSelectedCategory(val)}
                                    placeholder="Semua Kategori..."
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                Total {filteredProducts.length} Produk / Layanan
                            </span>

                            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('table')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                                        viewMode === 'table'
                                            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
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
                                            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
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

                    {loading ? (
                        <div className="flex justify-center p-12 text-xs text-slate-500 dark:text-slate-400">
                            <RefreshCw className="w-4 h-4 animate-spin mr-2 text-blue-600 dark:text-blue-400" />
                            <span>Memuat data katalog produk...</span>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 bg-white dark:bg-[#0f172a]">
                            Belum ada katalog produk terdaftar yang sesuai.
                        </div>
                    ) : viewMode === 'table' ? (
                        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                            <th className="py-3 px-4">Kode</th>
                                            <th className="py-3 px-4">Nama Produk / Layanan</th>
                                            <th className="py-3 px-4">Kategori</th>
                                            <th className="py-3 px-4">Satuan Unit</th>
                                            <th className="py-3 px-4 font-mono">Harga Unit (@ Rp)</th>
                                            <th className="py-3 px-4">Status Aktif</th>
                                            <th className="py-3 px-4 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                        {filteredProducts.map((p) => (
                                            <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="py-3.5 px-4 font-mono font-bold">
                                                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[11px]">
                                                        {p.code}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                                                    <div>{p.name}</div>
                                                    <div className="text-[10px] font-normal text-slate-400 line-clamp-1 mt-0.5">{p.description || 'Tidak ada deskripsi'}</div>
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                                                    <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                                        <Tag className="w-3 h-3 text-blue-500" />
                                                        {p.category || 'Umum'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-semibold">
                                                    {p.unit}
                                                </td>
                                                <td className="py-3.5 px-4 font-extrabold font-mono text-blue-600 dark:text-blue-400 text-sm">
                                                    Rp {new Intl.NumberFormat('id-ID').format(p.unit_price)}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleStatus(p)}
                                                        className="focus:outline-none"
                                                        title="Klik untuk mengubah status aktif"
                                                    >
                                                        {p.is_active ?? true ? (
                                                            <span className="px-2.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 flex items-center gap-1">
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                <span>Aktif</span>
                                                            </span>
                                                        ) : (
                                                            <span className="px-2.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold border border-slate-200 dark:border-slate-700">
                                                                Nonaktif
                                                            </span>
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="py-3.5 px-4 text-right space-x-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenModal(p)}
                                                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                                                        title="Edit Produk / Layanan"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(p.id)}
                                                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                                        title="Hapus Produk"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {filteredProducts.map((p) => (
                                <div key={p.id} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3 shadow-sm flex flex-col justify-between">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">{p.code}</span>
                                            <div className="flex items-center space-x-1">
                                                <button onClick={() => handleOpenModal(p)} className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Edit Produk">
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => handleDelete(p.id)} className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors" title="Hapus Produk">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{p.name}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[32px] line-clamp-2">{p.description || 'Tidak ada deskripsi'}</p>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                                        <span className="text-slate-500 dark:text-slate-400">Satuan: <strong className="text-slate-700 dark:text-slate-300">{p.unit}</strong></span>
                                        <span className="font-extrabold text-blue-600 dark:text-blue-400 font-mono text-sm">Rp {new Intl.NumberFormat('id-ID').format(p.unit_price)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: KATEGORI */}
            {activeTab === 'categories' && (
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto text-xs">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                    <th className="py-3 px-4">#</th>
                                    <th className="py-3 px-4">Nama Kategori</th>
                                    <th className="py-3 px-4">Total Produk Terkait</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                {categoryList.map((catName, idx) => {
                                    const productCount = products.filter(p => p.category === catName).length;
                                    return (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="py-3.5 px-4 font-mono text-slate-400 font-bold">{idx + 1}</td>
                                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-blue-500" />
                                                <span>{catName}</span>
                                            </td>
                                            <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                                                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">
                                                    {productCount} Produk / Jasa
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="px-2.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 flex items-center gap-1 w-max">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    <span>Aktif</span>
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right space-x-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenCatModal(catName, idx)}
                                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                                                    title="Edit Kategori"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteCategory(catName)}
                                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                                    title="Hapus Kategori"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: SATUAN UNIT */}
            {activeTab === 'units' && (
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto text-xs">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                    <th className="py-3 px-4">#</th>
                                    <th className="py-3 px-4">Nama Satuan</th>
                                    <th className="py-3 px-4">Kode Singkatan</th>
                                    <th className="py-3 px-4">Contoh Penggunaan Transaksi</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                {unitList.map((unit, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3.5 px-4 font-mono text-slate-400 font-bold">{idx + 1}</td>
                                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                                            {unit.name}
                                        </td>
                                        <td className="py-3.5 px-4 font-mono font-bold">
                                            <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[11px]">
                                                {unit.code}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                                            {unit.example || '-'}
                                        </td>
                                        <td className="py-3.5 px-4 text-right space-x-1.5">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenUnitModal(unit, idx)}
                                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                                                title="Edit Satuan Unit"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteUnit(idx)}
                                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                                title="Hapus Satuan Unit"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Add / Edit Produk */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <span>{editingProduct ? 'Edit Katalog Produk / Jasa' : 'Tambah Produk / Jasa Baru'}</span>
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nama Produk / Layanan *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="ex: Pembuatan Sistem POS Cloud / Maintenance Server"
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-semibold focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Kode Produk / Layanan</label>
                                    <input
                                        type="text"
                                        value={form.code}
                                        onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                        placeholder="ex: PRD-001 (Kosongkan untuk auto-generate)"
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono font-bold uppercase focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Kategori Produk *</label>
                                    <SearchableSelect
                                        options={categoryList.map((cat) => ({ value: cat, label: cat }))}
                                        value={form.category}
                                        onChange={(val) => setForm({ ...form, category: val })}
                                        placeholder="Pilih Kategori..."
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Satuan Unit Transaksi *</label>
                                    <SearchableSelect
                                        options={unitList.map((u) => ({ value: u.name, label: `${u.name} (${u.code})` }))}
                                        value={form.unit}
                                        onChange={(val) => setForm({ ...form, unit: val })}
                                        placeholder="Pilih Satuan..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Harga Satuan (@ Rp) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={form.unit_price}
                                        onChange={(e) => setForm({ ...form, unit_price: parseFloat(e.target.value) || 0 })}
                                        placeholder="1000000"
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono font-bold focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Deskripsi Singkat / Spesifikasi</label>
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Penjelasan rincian fitur atau cakupan layanan..."
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="flex items-center pt-1">
                                <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.is_active}
                                        onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>Status Produk / Layanan Aktif</span>
                                </label>
                            </div>

                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all"
                                >
                                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    <span>{editingProduct ? 'Simpan Perubahan' : 'Tambah Produk / Jasa'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Add / Edit Category */}
            {showCatModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span>{editingCatIndex !== null ? 'Edit Kategori Produk' : 'Tambah Kategori Produk Baru'}</span>
                            </h3>
                            <button onClick={() => setShowCatModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitCategory} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nama Kategori *</label>
                                <input
                                    type="text"
                                    required
                                    value={catForm.name}
                                    onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                                    placeholder="ex: Mobile App Development / Cyber Security"
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-semibold focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCatModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{editingCatIndex !== null ? 'Simpan Perubahan' : 'Tambah Kategori'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Add / Edit Satuan Unit */}
            {showUnitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                <span>{editingUnitIndex !== null ? 'Edit Satuan Unit' : 'Tambah Satuan Unit Baru'}</span>
                            </h3>
                            <button onClick={() => setShowUnitModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitUnit} className="space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nama Satuan *</label>
                                <input
                                    type="text"
                                    required
                                    value={unitForm.name}
                                    onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
                                    placeholder="ex: Paket / Bulan / Lisensi"
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-semibold focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Kode Singkatan *</label>
                                <input
                                    type="text"
                                    required
                                    value={unitForm.code}
                                    onChange={(e) => setUnitForm({ ...unitForm, code: e.target.value.toUpperCase() })}
                                    placeholder="ex: PKT / BLN / LSN"
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono font-bold uppercase focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Contoh Penggunaan Transaksi</label>
                                <input
                                    type="text"
                                    value={unitForm.example}
                                    onChange={(e) => setUnitForm({ ...unitForm, example: e.target.value })}
                                    placeholder="ex: Penawaran 1 Paket Web Application"
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowUnitModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center space-x-1.5 transition-all"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{editingUnitIndex !== null ? 'Simpan Perubahan' : 'Tambah Satuan Unit'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
