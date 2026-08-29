import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useConfirm } from '../../context/ConfirmContext';
import SearchableSelect from '../../components/SearchableSelect';
import { terbilang } from '../../utils/terbilang';
import {
    Receipt,
    ArrowLeft,
    Plus,
    Trash2,
    Save,
    RefreshCw,
    Building2,
    Calendar,
    Percent,
    DollarSign,
    FileCheck2,
    Package,
    Search,
    X,
    ChevronDown,
    ChevronUp,
    GripVertical,
    Download,
    Mail,
    FileText,
    FolderKanban,
    FileCheck,
    UploadCloud
} from 'lucide-react';

export default function QuoteFormPage() {
    const { confirm } = useConfirm();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const prefilledProjectId = searchParams.get('project_id');
    const prefilledClientId = searchParams.get('client_id');
    const [showActionDropdown, setShowActionDropdown] = useState(false);

    const [clients, setClients] = useState([]);
    const [projects, setProjects] = useState([]);
    const [products, setProducts] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [enableTax, setEnableTax] = useState(true);
    const [savedTaxRate, setSavedTaxRate] = useState(11);
    const [downloadingPdf, setDownloadingPdf] = useState(false);

    // Catalog modal state
    const [showProductModal, setShowProductModal] = useState(false);
    const [catalogSearch, setCatalogSearch] = useState('');

    const [signedFile, setSignedFile] = useState(null);
    const [existingSignedUrl, setExistingSignedUrl] = useState(null);


    const [form, setForm] = useState({
        client_id: prefilledClientId || '',
        project_id: prefilledProjectId || '',
        quote_date: new Date().toISOString().split('T')[0],
        valid_until: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        status: 'DRAFT',
        tax_rate: 11,
        discount_amount: 0,
        signature_type: '',
        notes: 'Penawaran harga ini berlaku selama 14 hari sejak tanggal diterbitkan.',

        terms: 'Harga belum termasuk biaya pengiriman/instalasi (jika ada). Syarat pembayaran 50% DP, 50% Pelunasan.',
        items: [
            { product_id: '', item_name: '', description: '', quantity: 1, unit_price: 0 }
        ]
    });

    const handleToggleTax = (checked) => {
        setEnableTax(checked);
        if (checked) {
            setForm({ ...form, tax_rate: savedTaxRate > 0 ? savedTaxRate : 11 });
        } else {
            if (form.tax_rate > 0) setSavedTaxRate(form.tax_rate);
            setForm({ ...form, tax_rate: 0 });
        }
    };

    useEffect(() => {
        const init = async () => {
            setLoadingData(true);
            try {
                const [cRes, prjRes, pRes] = await Promise.all([
                    api.get('/clients').catch(() => ({ data: { data: [] } })),
                    api.get('/projects').catch(() => ({ data: { data: [] } })),
                    api.get('/products').catch(() => ({ data: { data: [] } }))
                ]);

                setClients(cRes.data?.data || []);
                setProjects(prjRes.data?.data || []);
                setProducts(pRes.data?.data || []);

                if (isEdit) {
                    const qRes = await api.get(`/quotes/${id}`);
                    const q = qRes.data.data;
                    setExistingSignedUrl(q.signed_file_url || null);
                    const qTax = parseFloat(q.tax_rate) || 0;
                    setEnableTax(qTax > 0);
                    if (qTax > 0) setSavedTaxRate(qTax);
                    setForm({
                        client_id: q.client_id || '',
                        project_id: q.project_id || '',
                        quote_date: q.quote_date ? String(q.quote_date).split('T')[0].substring(0, 10) : new Date().toISOString().split('T')[0],
                        valid_until: q.valid_until ? String(q.valid_until).split('T')[0].substring(0, 10) : new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
                        status: q.status ? String(q.status).trim().toUpperCase() : 'DRAFT',
                        tax_rate: qTax,
                        discount_amount: q.discount_amount ?? 0,
                        signature_type: q.signature_type || '',
                        notes: q.notes || '',
                        terms: q.terms || '',
                        items: q.items && q.items.length > 0
                            ? q.items.map(it => ({
                                product_id: it.product_id || '',
                                item_name: it.item_name || '',
                                description: it.description || '',
                                quantity: parseFloat(it.quantity) || 1,
                                unit_price: parseFloat(it.unit_price) || 0
                            }))
                            : [{ product_id: '', item_name: '', description: '', quantity: 1, unit_price: 0 }]
                    });
                }
            } catch (err) {
                console.error('Error loading quote form data:', err);
                alert('Gagal memuat data formulir penawaran.');
            } finally {
                setLoadingData(false);
            }
        };

        init();
    }, [id, isEdit]);

    const filteredProjects = useMemo(() => {
        if (!form.client_id) return projects;
        return projects.filter(p => String(p.client_id) === String(form.client_id));
    }, [projects, form.client_id]);

    const handleAddItem = () => {
        setForm((prev) => ({
            ...prev,
            items: [
                ...(prev.items || []),
                { product_id: '', item_name: '', description: '', quantity: 1, unit_price: 0 }
            ]
        }));
    };

    const handleRemoveItem = (index) => {
        setForm((prev) => {
            if ((prev.items || []).length <= 1) return prev;
            return {
                ...prev,
                items: prev.items.filter((_, i) => i !== index)
            };
        });
    };

    const handleAddProductFromCatalog = (product) => {
        setForm((prev) => ({
            ...prev,
            items: [
                ...(prev.items || []),
                {
                    product_id: product.id,
                    item_name: product.name,
                    description: product.description || '',
                    quantity: 1,
                    unit_price: parseFloat(product.unit_price || product.price || 0)
                }
            ]
        }));
        setShowProductModal(false);
        setCatalogSearch('');
    };

    const filteredCatalogProducts = products.filter(p => {
        if (!catalogSearch) return true;
        const search = catalogSearch.toLowerCase();
        const nameMatch = p.name ? p.name.toLowerCase().includes(search) : false;
        const codeMatch = p.code ? p.code.toLowerCase().includes(search) : false;
        const descMatch = p.description ? p.description.toLowerCase().includes(search) : false;
        return nameMatch || codeMatch || descMatch;
    });

    const handleItemChange = (index, field, value) => {
        setForm((prev) => {
            const newItems = [...(prev.items || [])];
            newItems[index] = {
                ...newItems[index],
                [field]: value
            };
            return { ...prev, items: newItems };
        });
    };

    // Drag and Drop & Move Reorder Handlers
    const [draggedIndex, setDraggedIndex] = useState(null);

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        setForm((prev) => {
            const newItems = [...prev.items];
            const draggedItem = newItems[draggedIndex];
            newItems.splice(draggedIndex, 1);
            newItems.splice(index, 0, draggedItem);
            return { ...prev, items: newItems };
        });
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleMoveItem = (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= form.items.length) return;
        setForm((prev) => {
            const newItems = [...prev.items];
            const temp = newItems[index];
            newItems[index] = newItems[targetIndex];
            newItems[targetIndex] = temp;
            return { ...prev, items: newItems };
        });
    };



    const calculateTotals = () => {
        const subtotal = form.items.reduce((sum, item) => sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)), 0);
        const taxAmount = (subtotal * (parseFloat(form.tax_rate) || 0)) / 100;
        const grandTotal = Math.max(0, subtotal + taxAmount - (parseFloat(form.discount_amount) || 0));
        return { subtotal, taxAmount, grandTotal };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.client_id) {
            alert('Pilih Klien terlebih dahulu!');
            return;
        }

        setSubmitting(true);
        try {
            const payload = new FormData();
            payload.append('client_id', form.client_id);
            if (form.project_id) payload.append('project_id', form.project_id);
            payload.append('quote_date', form.quote_date);
            payload.append('valid_until', form.valid_until);
            if (form.status) payload.append('status', form.status);
            if (form.tax_rate !== undefined) payload.append('tax_rate', form.tax_rate);
            if (form.discount_amount !== undefined) payload.append('discount_amount', form.discount_amount);
            if (form.signature_type) payload.append('signature_type', form.signature_type);
            if (form.notes) payload.append('notes', form.notes);
            if (form.terms) payload.append('terms', form.terms);
            if (signedFile) payload.append('signed_file', signedFile);

            form.items.forEach((item, index) => {
                if (item.product_id) payload.append(`items[${index}][product_id]`, item.product_id);
                payload.append(`items[${index}][item_name]`, item.item_name);
                if (item.description) payload.append(`items[${index}][description]`, item.description);
                payload.append(`items[${index}][quantity]`, item.quantity);
                payload.append(`items[${index}][unit_price]`, item.unit_price);
            });

            if (isEdit) {
                payload.append('_method', 'PUT');
                await api.post(`/quotes/${id}`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Penawaran harga berhasil diperbarui!');
            } else {
                await api.post('/quotes', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Penawaran harga baru berhasil dibuat!');
            }
            navigate('/quotes');
        } catch (err) {
            alert('Gagal menyimpan penawaran: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteQuote = async () => {
        setShowActionDropdown(false);
        const ok = await confirm({
            title: 'Hapus Penawaran',
            message: 'Yakin ingin menghapus penawaran ini? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/quotes/${id}`);
            alert('Penawaran berhasil dihapus.');
            navigate('/quotes');
        } catch (err) {
            alert('Gagal menghapus penawaran: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDownloadPdf = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setDownloadingPdf(true);
        try {
            const response = await api.get(`/quotes/${id}/pdf`, {
                responseType: 'blob',
            });
            const file = new Blob([response.data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL, '_blank');
        } catch (err) {
            alert('Gagal membuka preview PDF Penawaran: ' + (err.response?.data?.message || err.message));
        } finally {
            setDownloadingPdf(false);
        }
    };

    const handleSendEmail = async () => {
        setShowActionDropdown(false);
        const ok = await confirm({
            title: 'Kirim Email Penawaran',
            message: 'Kirim PDF Penawaran ini ke email klien?',
            confirmText: 'Ya, Kirim',
            variant: 'info',
        });
        if (!ok) return;
        try {
            await api.post(`/quotes/${id}/email`);
            alert('Email penawaran berhasil dikirim ke klien!');
        } catch (err) {
            alert('Gagal mengirim email: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleConvertToInvoice = async () => {
        setShowActionDropdown(false);
        const ok = await confirm({
            title: 'Konversi ke Invoice',
            message: 'Konversi Penawaran ini menjadi Invoice Tagihan resmi? Penawaran akan ditandai sebagai sudah dikonversi.',
            confirmText: 'Ya, Konversi',
            variant: 'warning',
        });
        if (!ok) return;
        try {
            const res = await api.post(`/quotes/${id}/convert-to-invoice`);
            const inv = res.data.data;
            alert(`Berhasil dikonversi menjadi Invoice #${inv.invoice_number}!`);
            navigate(`/invoices/${inv.id}/edit`);
        } catch (err) {
            alert('Gagal mengkonversi penawaran: ' + (err.response?.data?.message || err.message));
        }
    };

    const totals = calculateTotals();

    if (loadingData) {
        return (
            <div className="flex justify-center items-center p-16 text-xs text-slate-500 dark:text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin mr-2 text-purple-600 dark:text-purple-400" />
                <span>Memuat formulir Penawaran Harga...</span>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            {/* Top Navigation Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                    <Link
                        to="/quotes"
                        className="p-2 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
                        title="Kembali ke Daftar Penawaran"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <span>{isEdit ? `Edit Penawaran (#${id})` : 'Buat Penawaran Harga (Quote) Baru'}</span>
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Kelola penawaran barang/jasa resmi untuk calon klien beserta syarat & ketentuan.
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-3 relative">
                    {/* Opsi Aksi Dropdown for Edit Mode */}
                    {isEdit && (
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowActionDropdown(!showActionDropdown)}
                                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition-all"
                            >
                                <span>Opsi Aksi</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showActionDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showActionDropdown && (
                                <div className="absolute right-0 top-full mt-1.5 z-[999] w-56 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden py-1 text-left space-y-0.5">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            setShowActionDropdown(false);
                                            handleDownloadPdf(e);
                                        }}
                                        disabled={downloadingPdf}
                                        className="w-full px-3.5 py-2 hover:bg-purple-500/10 text-xs font-semibold text-purple-700 dark:text-purple-400 flex items-center space-x-2 transition-colors text-left disabled:opacity-50"
                                    >
                                        {downloadingPdf ? (
                                            <RefreshCw className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 animate-spin" />
                                        ) : (
                                            <Download className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                                        )}
                                        <span>{downloadingPdf ? 'Mengunduh...' : 'Download PDF Penawaran'}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleSendEmail}
                                        className="w-full px-3.5 py-2 hover:bg-indigo-500/10 text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center space-x-2 transition-colors text-left"
                                    >
                                        <Mail className="w-4 h-4 shrink-0" />
                                        <span>Kirim Email ke Klien</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleConvertToInvoice}
                                        className="w-full px-3.5 py-2 hover:bg-blue-500/10 text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center space-x-2 transition-colors text-left"
                                    >
                                        <FileText className="w-4 h-4 shrink-0 text-blue-500" />
                                        <span>Convert ke Invoice</span>
                                    </button>

                                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                                    <button
                                        type="button"
                                        onClick={handleDeleteQuote}
                                        className="w-full px-3.5 py-2 hover:bg-rose-500/10 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center space-x-2 transition-colors text-left"
                                    >
                                        <Trash2 className="w-4 h-4 shrink-0" />
                                        <span>Hapus Penawaran</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <Link
                        to="/quotes"
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                        Batal
                    </Link>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center space-x-1.5 transition-all"
                    >
                        {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{isEdit ? 'Simpan Perubahan' : 'Terbitkan Penawaran'}</span>
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section 1: Information Klien & Dates */}
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span>1. Informasi Calon Klien & Masa Berlaku Penawaran</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                        <div className="md:col-span-1">
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                Pilih Klien Penerima Penawaran *
                            </label>
                            <SearchableSelect
                                required
                                value={form.client_id}
                                onChange={(val) => {
                                    setForm(prev => {
                                        const projValid = val && prev.project_id && projects.some(p => String(p.id) === String(prev.project_id) && String(p.client_id) === String(val));
                                        return {
                                            ...prev,
                                            client_id: val,
                                            project_id: projValid ? prev.project_id : '',
                                        };
                                    });
                                }}
                                placeholder="-- Cari / Pilih Klien Terdaftar --"
                                options={clients.map(cli => ({
                                    value: cli.id,
                                    label: cli.company_name || cli.name,
                                    code: cli.code,
                                    alias: cli.alias,
                                    sublabel: cli.company_name && cli.name !== cli.company_name ? cli.name : '',
                                    raw: cli,
                                }))}
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1">
                                <FolderKanban className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Pilih Project (Opsional)</span>
                            </label>
                            <SearchableSelect
                                options={[
                                    { value: '', label: '-- Tanpa Project / Umum --' },
                                    ...filteredProjects.map(p => ({
                                        value: p.id,
                                        label: p.name,
                                        code: p.code,
                                    }))
                                ]}
                                value={form.project_id}
                                onChange={(val) => setForm({ ...form, project_id: val })}
                                placeholder={form.client_id && filteredProjects.length === 0 ? "Tidak ada project untuk klien ini" : "Cari & Pilih Project..."}
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                Status Penawaran
                            </label>
                            <SearchableSelect
                                options={[
                                    { value: 'DRAFT', label: 'Draft' },
                                    { value: 'SENT', label: 'Sent (Terkirim)' },
                                    { value: 'VIEWED', label: 'Viewed (Dilihat Klien)' },
                                    { value: 'APPROVED', label: 'Approved (Disetujui)' },
                                    { value: 'REJECTED', label: 'Rejected (Ditolak)' },
                                    { value: 'CANCELED', label: 'Canceled (Dibatalkan)' },
                                    { value: 'CONVERTED', label: 'Converted (Dikonversi ke Invoice)' },
                                ]}
                                value={form.status}
                                onChange={(val) => setForm({ ...form, status: val })}
                                placeholder="Cari & Pilih Status..."
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                Tanggal Penawaran *
                            </label>
                            <input
                                type="date"
                                required
                                value={form.quote_date}
                                onChange={(e) => setForm({ ...form, quote_date: e.target.value })}
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                Berlaku Sampai *
                            </label>
                            <input
                                type="date"
                                required
                                value={form.valid_until}
                                onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                            />
                        </div>
                    </div>

                </div>

                {/* Section 2: Items Table Multi-Row */}
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span>2. Rincian Baris Barang & Jasa Penawaran (Item Lines)</span>
                        </h3>
                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={() => setShowProductModal(true)}
                                className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm shadow-purple-500/20 transition-all"
                            >
                                <Package className="w-3.5 h-3.5" />
                                <span>Pilih dari Katalog Produk</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center space-x-1 transition-all"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tambah Baris Kosong</span>
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                                    <th className="py-2.5 px-3">Nama Baris Item & Deskripsi *</th>
                                    <th className="py-2.5 px-3 w-28 text-center">Qty</th>
                                    <th className="py-2.5 px-3 w-40 text-right">Harga Satuan (Rp)</th>
                                    <th className="py-2.5 px-3 w-40 text-right">Subtotal Baris</th>
                                    <th className="py-2.5 px-3 w-14 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                {form.items.map((item, index) => {
                                    const rowSubtotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
                                    return (
                                        <tr
                                            key={index}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDragEnd={handleDragEnd}
                                            className={`align-top hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all ${
                                                draggedIndex === index ? 'opacity-40 bg-purple-500/10 border-2 border-dashed border-purple-500' : ''
                                            }`}
                                        >
                                            <td className="p-2.5 text-center font-mono font-semibold text-slate-400 pt-3 select-none">
                                                <div className="flex items-center justify-center space-x-1">
                                                    <span
                                                        className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-purple-500 p-0.5 rounded transition-colors"
                                                        title="Geser / Drag untuk mengubah urutan baris"
                                                    >
                                                        <GripVertical className="w-4 h-4" />
                                                    </span>
                                                    <span>{index + 1}</span>
                                                </div>
                                            </td>

                                            <td className="p-2.5 space-y-1.5">
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Nama item penawaran..."
                                                    value={item.item_name}
                                                    onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 text-xs font-semibold"
                                                />
                                                <textarea
                                                    rows={1}
                                                    placeholder="Deskripsi detail lingkup kerja / spesifikasi..."
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 text-[11px]"
                                                />
                                            </td>

                                            <td className="p-2.5">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    step="any"
                                                    required
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 text-xs font-mono text-center font-bold"
                                                />
                                            </td>

                                            <td className="p-2.5">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="any"
                                                    required
                                                    value={item.unit_price}
                                                    onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 text-xs font-mono text-right font-bold"
                                                />
                                            </td>

                                            <td className="p-2.5 text-right font-mono font-extrabold text-slate-900 dark:text-slate-100 pt-3.5">
                                                Rp {rowSubtotal.toLocaleString('id-ID')}
                                            </td>

                                            <td className="p-2.5 text-center pt-2">
                                                <div className="flex items-center justify-center space-x-1">
                                                    <div className="flex flex-col space-y-0.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMoveItem(index, -1)}
                                                            disabled={index === 0}
                                                            className="p-0.5 text-slate-400 hover:text-purple-500 disabled:opacity-20 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                                                            title="Naikkan urutan baris"
                                                        >
                                                            <ChevronUp className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMoveItem(index, 1)}
                                                            disabled={index === form.items.length - 1}
                                                            className="p-0.5 text-slate-400 hover:text-purple-500 disabled:opacity-20 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                                                            title="Turunkan urutan baris"
                                                        >
                                                            <ChevronDown className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(index)}
                                                        disabled={form.items.length === 1}
                                                        className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                                                        title="Hapus baris item ini"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
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

                {/* Section 3: Notes, Terms & Calculation Totals */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Terms & Notes */}
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                            <FileCheck2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span>3. Catatan & Syarat Ketentuan Penawaran</span>
                        </h3>
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-xs">Catatan Penawaran</label>
                            <textarea
                                rows={2}
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                placeholder="Catatan singkat..."
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-xs">Syarat & Ketentuan Pembayaran (Terms)</label>
                            <textarea
                                rows={2}
                                value={form.terms}
                                onChange={(e) => setForm({ ...form, terms: e.target.value })}
                                placeholder="Syarat pembayaran, DP, garansi, pengiriman..."
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-xs">Mode Tanda Tangan PDF</label>
                            <SearchableSelect
                                options={[
                                    { value: '', label: '-- Ikuti Settingan Utama Perusahaan --' },
                                    { value: 'QR_CODE', label: 'Signature QR Code (Digital Verification)' },
                                    { value: 'IMAGE', label: 'Signature Image (Stempel/TTD Gambar Upload)' },
                                    { value: 'MANUAL', label: 'Signature Manual (Kotak Kosong TTD Basah)' },
                                ]}
                                value={form.signature_type || ''}
                                onChange={(val) => setForm({ ...form, signature_type: val })}
                                placeholder="Pilih Mode Signature..."
                            />
                        </div>

                        {/* Scan Berkas TTD Physical File Upload */}
                        <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                                    Upload Scan / Foto Berkas Penawaran Ber-TTD Basah (Opsional)
                                </label>
                                {form.signature_type === 'MANUAL' && (
                                    <span className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                                        Mode TTD Fisik / Basah
                                    </span>
                                )}
                            </div>

                            {existingSignedUrl && !signedFile && (
                                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                                        <FileCheck className="w-4 h-4" /> Berkas Scan TTD Fisik Tersimpan
                                    </span>
                                    <a href={existingSignedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                                        Lihat File
                                    </a>
                                </div>
                            )}

                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.webp"
                                onChange={(e) => setSignedFile(e.target.files[0])}
                                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-700 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 p-1"
                            />
                            <p className="text-[10px] text-slate-400">
                                Untuk penawaran harga yang ditandatangani basah oleh klien/direksi, Anda dapat mengunggah berkas hasilnya. Format: PDF, JPG, PNG, WEBP (Max 10MB).
                            </p>
                        </div>
                    </div>


                    {/* Summary Totals */}
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-3 text-xs">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                            Kalkulasi Biaya Penawaran
                        </h3>

                        <div className="space-y-2 pt-1">
                            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                                <span>Subtotal Item Lines:</span>
                                <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                                    Rp {totals.subtotal.toLocaleString('id-ID')}
                                </span>
                            </div>

                            {/* Toggle PPN Box */}
                            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center space-x-2 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={enableTax}
                                            onChange={(e) => handleToggleTax(e.target.checked)}
                                            className="w-4 h-4 text-purple-600 rounded border-slate-300 dark:border-slate-700 focus:ring-purple-500 cursor-pointer"
                                        />
                                        <span>Kenakan PPN (Pajak Pertambahan Nilai)</span>
                                    </label>

                                    {enableTax ? (
                                        <div className="flex items-center space-x-1">
                                            <span className="text-slate-500 font-medium">Tarif:</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="any"
                                                value={form.tax_rate}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setForm({ ...form, tax_rate: val });
                                                    if (parseFloat(val) > 0) setSavedTaxRate(parseFloat(val));
                                                }}
                                                className="w-16 px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-right font-mono font-bold text-xs"
                                            />
                                            <span className="font-bold text-slate-600 dark:text-slate-400">%</span>
                                        </div>
                                    ) : (
                                        <span className="text-[11px] font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                                            Non-PPN (0%)
                                        </span>
                                    )}
                                </div>

                                {enableTax && (
                                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                                        <span>Nilai Pajak PPN ({form.tax_rate}%):</span>
                                        <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                                            Rp {totals.taxAmount.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                )}
                            </div>


                            <div className="flex justify-between items-center gap-3">
                                <span className="text-slate-600 dark:text-slate-400 shrink-0">Potongan Diskon (Rp):</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={form.discount_amount}
                                    onChange={(e) => setForm({ ...form, discount_amount: e.target.value })}
                                    className="w-36 px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-right font-mono text-xs"
                                />
                            </div>

                            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Total Penawaran (Grand Total):</span>
                                    <span className="font-extrabold text-base font-mono text-purple-600 dark:text-purple-400">
                                        Rp {totals.grandTotal.toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-800 dark:text-purple-300 italic text-[11px]">
                                    <span className="font-bold not-italic">Terbilang: </span>
                                    <span>{terbilang(totals.grandTotal)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <Link
                        to="/quotes"
                        className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center space-x-1.5 transition-all"
                    >
                        {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{isEdit ? 'Simpan Perubahan Penawaran' : 'Terbitkan Penawaran Baru'}</span>
                    </button>
                </div>
            </form>

            {/* Modal Pilih Produk dari Katalog Master */}
            {showProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div className="flex items-center space-x-2">
                                <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                                    Cari & Pilih Produk dari Katalog Master
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowProductModal(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                autoFocus
                                value={catalogSearch}
                                onChange={(e) => setCatalogSearch(e.target.value)}
                                placeholder="Cari berdasarkan nama produk, kode SKU, atau deskripsi..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
                            />
                        </div>

                        {/* Products List */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[250px]">
                            {filteredCatalogProducts.length === 0 ? (
                                <div className="p-8 text-center text-xs text-slate-400 italic">
                                    Tidak ada produk katalog yang cocok dengan "{catalogSearch}"
                                </div>
                            ) : (
                                filteredCatalogProducts.map((p) => (
                                    <div
                                        key={p.id}
                                        onClick={() => handleAddProductFromCatalog(p)}
                                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-purple-500/10 hover:border-purple-500/30 flex items-center justify-between cursor-pointer transition-all group"
                                    >
                                        <div className="space-y-0.5 max-w-lg">
                                            <div className="flex items-center space-x-2">
                                                {p.code && (
                                                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                                        {p.code}
                                                    </span>
                                                )}
                                                <span className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                                                    {p.name}
                                                </span>
                                            </div>
                                            {p.description && (
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                                    {p.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="text-right shrink-0">
                                            <span className="font-extrabold text-sm font-mono text-purple-600 dark:text-purple-400 block">
                                                Rp {parseFloat(p.unit_price || p.price || 0).toLocaleString('id-ID')}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-purple-500 transition-colors">
                                                + Tambah ke Penawaran &rarr;
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

