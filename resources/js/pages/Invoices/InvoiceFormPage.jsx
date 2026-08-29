import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { openPdfPreview } from '../../utils/pdfPreview';
import { useConfirm } from '../../context/ConfirmContext';
import SearchableSelect from '../../components/SearchableSelect';
import { terbilang } from '../../utils/terbilang';

import {
    FileText,
    ArrowLeft,
    Plus,
    Trash2,
    Save,
    RefreshCw,
    Building2,
    Calendar,
    Percent,
    DollarSign,
    FileCheck,
    AlertCircle,
    Package,
    Search,
    X,
    ChevronDown,
    ChevronUp,
    GripVertical,
    Download,
    Mail,
    ExternalLink,
    FolderKanban,
    Printer,
    CreditCard
} from 'lucide-react';

export default function InvoiceFormPage() {
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
    const [taxRates, setTaxRates] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [enableTax, setEnableTax] = useState(true);
    const [savedTaxRate, setSavedTaxRate] = useState(11);

    // Catalog modal state
    const [showProductModal, setShowProductModal] = useState(false);
    const [catalogSearch, setCatalogSearch] = useState('');

    const [signedFile, setSignedFile] = useState(null);
    const [existingSignedUrl, setExistingSignedUrl] = useState(null);


    const [form, setForm] = useState({
        client_id: prefilledClientId || '',
        project_id: prefilledProjectId || '',
        reference_number: '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        status: 'SENT',
        tax_rate: 11,
        discount_amount: 0,
        signature_type: '',
        notes: 'Terima kasih atas kerja samanya. Pembayaran dapat ditransfer ke rekening bank perusahaan kami.',

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
                const [clientRes, prjRes, prodRes, taxRes] = await Promise.all([
                    api.get('/clients').catch(() => ({ data: { data: [] } })),
                    api.get('/projects').catch(() => ({ data: { data: [] } })),
                    api.get('/products').catch(() => ({ data: { data: [] } })),
                    api.get('/settings/tax-rates').catch(() => ({ data: { data: [] } }))
                ]);

                setClients(clientRes.data?.data || []);
                setProjects(prjRes.data?.data || []);
                setProducts(prodRes.data?.data || []);
                setTaxRates(taxRes.data?.data || []);

                if (isEdit) {
                    const invRes = await api.get(`/invoices/${id}`);
                    const inv = invRes.data.data;
                    setExistingSignedUrl(inv.signed_file_url || null);
                    const invTax = parseFloat(inv.tax_rate) || 0;
                    setEnableTax(invTax > 0);
                    if (invTax > 0) setSavedTaxRate(invTax);
                    setForm({
                        client_id: inv.client_id || '',
                        project_id: inv.project_id || '',
                        reference_number: inv.reference_number || '',
                        invoice_date: inv.invoice_date ? String(inv.invoice_date).split('T')[0].substring(0, 10) : new Date().toISOString().split('T')[0],
                        due_date: inv.due_date ? String(inv.due_date).split('T')[0].substring(0, 10) : new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
                        status: inv.status || 'UNPAID',
                        tax_rate: invTax,
                        discount_amount: inv.discount_amount ?? 0,
                        signature_type: inv.signature_type || '',
                        notes: inv.notes || '',
                        items: inv.items && inv.items.length > 0
                            ? inv.items.map(it => ({
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
                console.error('Error loading invoice form data:', err);
                alert('Gagal memuat data formulir invoice.');
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
            if (form.reference_number) payload.append('reference_number', form.reference_number);
            payload.append('invoice_date', form.invoice_date);
            payload.append('due_date', form.due_date);
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
                await api.post(`/invoices/${id}`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Invoice berhasil diperbarui!');
            } else {
                await api.post('/invoices', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Invoice baru berhasil dibuat!');
            }
            navigate('/invoices');
        } catch (err) {
            alert('Gagal menyimpan invoice: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteInvoice = async () => {
        setShowActionDropdown(false);
        const ok = await confirm({
            title: 'Hapus Invoice',
            message: 'Yakin ingin menghapus invoice ini? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/invoices/${id}`);
            alert('Invoice berhasil dihapus.');
            navigate('/invoices');
        } catch (err) {
            alert('Gagal menghapus invoice: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleSendEmail = async () => {
        setShowActionDropdown(false);
        const ok = await confirm({
            title: 'Kirim Email Invoice',
            message: 'Kirim PDF Invoice ini ke email klien?',
            confirmText: 'Ya, Kirim',
            variant: 'info',
        });
        if (!ok) return;
        try {
            await api.post(`/invoices/${id}/email`);
            alert('Email invoice berhasil dikirim ke klien!');
        } catch (err) {
            alert('Gagal mengirim email: ' + (err.response?.data?.message || err.message));
        }
    };

    const totals = calculateTotals();

    if (loadingData) {
        return (
            <div className="flex justify-center items-center p-16 text-xs text-slate-500 dark:text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin mr-2 text-blue-600 dark:text-blue-400" />
                <span>Memuat formulir Invoice...</span>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            {/* Top Navigation Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                    <Link
                        to="/invoices"
                        className="p-2 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
                        title="Kembali ke Daftar Invoice"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span>{isEdit ? `Edit Invoice (#${id})` : 'Buat Invoice Tagihan Baru'}</span>
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Isi detail rincian tagihan, barang/jasa, pajak PPN, diskon, & tanggal jatuh tempo.
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
                                <div className="absolute right-0 top-full mt-1.5 z-[999] w-52 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden py-1 text-left space-y-0.5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowActionDropdown(false);
                                            openPdfPreview(`/invoices/${id}/pdf`);
                                        }}
                                        className="w-full px-3.5 py-2 hover:bg-blue-500/10 text-xs font-semibold text-blue-700 dark:text-blue-400 flex items-center space-x-2 transition-colors text-left"
                                    >
                                        <Download className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                        <span>Preview &amp; Download Invoice PDF</span>
                                    </button>

                                    <Link
                                        to={`/payments/create?invoice_id=${id}`}
                                        onClick={() => setShowActionDropdown(false)}
                                        className="px-3.5 py-2 hover:bg-emerald-500/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-2 transition-colors"
                                    >
                                        <Printer className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                        <span>Buat Kwitansi Pembayaran</span>
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={handleSendEmail}
                                        className="w-full px-3.5 py-2 hover:bg-indigo-500/10 text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center space-x-2 transition-colors text-left"
                                    >
                                        <Mail className="w-4 h-4 shrink-0" />
                                        <span>Kirim Email ke Klien</span>
                                    </button>

                                    <a
                                        href={`/portal/invoice/${form.reference_number || id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={() => setShowActionDropdown(false)}
                                        className="px-3.5 py-2 hover:bg-slate-500/10 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-2 transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span>Portal Klien</span>
                                    </a>

                                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                                    <button
                                        type="button"
                                        onClick={handleDeleteInvoice}
                                        className="w-full px-3.5 py-2 hover:bg-rose-500/10 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center space-x-2 transition-colors text-left"
                                    >
                                        <Trash2 className="w-4 h-4 shrink-0" />
                                        <span>Hapus Invoice</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <Link
                        to="/invoices"
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                        Batal
                    </Link>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all"
                    >
                        {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{isEdit ? 'Simpan Perubahan' : 'Terbitkan Invoice'}</span>
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section 1: Information Klien & Dates */}
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>1. Informasi Penerima & Tanggal Tagihan</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                        <div className="md:col-span-1">
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                Pilih Klien Penerima Tagihan *
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
                                No. Referensi / PO Client
                            </label>
                            <input
                                type="text"
                                value={form.reference_number}
                                onChange={(e) => setForm({ ...form, reference_number: e.target.value })}
                                placeholder="ex: PO/2026/08/001"
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                Tanggal Invoice *
                            </label>
                            <input
                                type="date"
                                required
                                value={form.invoice_date}
                                onChange={(e) => setForm({ ...form, invoice_date: e.target.value })}
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                Tanggal Jatuh Tempo *
                            </label>
                            <input
                                type="date"
                                required
                                value={form.due_date}
                                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                                Status Invoice *
                            </label>
                            <SearchableSelect
                                options={[
                                    { value: 'SENT', label: 'SENT (Terkirim / Belum Lunas)' },
                                    { value: 'UNPAID', label: 'UNPAID (Belum Lunas)' },
                                    { value: 'DRAFT', label: 'DRAFT (Draft Tagihan)' },
                                    { value: 'PAID', label: 'PAID (Lunas)' },
                                    { value: 'OVERDUE', label: 'OVERDUE (Jatuh Tempo)' },
                                    { value: 'CANCELLED', label: 'CANCELLED (Dibatalkan)' },
                                ]}
                                value={form.status || 'SENT'}
                                onChange={(val) => setForm({ ...form, status: val })}
                                placeholder="Cari & Pilih Status..."
                                required
                            />
                        </div>
                    </div>

                </div>

                {/* Section 2: Items Table Multi-Row */}
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>2. Rincian Baris Barang & Jasa (Item Lines)</span>
                        </h3>
                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={() => setShowProductModal(true)}
                                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm shadow-blue-500/20 transition-all"
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
                                                draggedIndex === index ? 'opacity-40 bg-blue-500/10 border-2 border-dashed border-blue-500' : ''
                                            }`}
                                        >
                                            <td className="p-2.5 text-center font-mono font-semibold text-slate-400 pt-3 select-none">
                                                <div className="flex items-center justify-center space-x-1">
                                                    <span
                                                        className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-blue-500 p-0.5 rounded transition-colors"
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
                                                    placeholder="Nama item / jasa..."
                                                    value={item.item_name}
                                                    onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 text-xs font-semibold"
                                                />
                                                <textarea
                                                    rows={1}
                                                    placeholder="Deskripsi detail spesifikasi (opsional)..."
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
                                                            className="p-0.5 text-slate-400 hover:text-blue-500 disabled:opacity-20 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                                                            title="Naikkan urutan baris"
                                                        >
                                                            <ChevronUp className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMoveItem(index, 1)}
                                                            disabled={index === form.items.length - 1}
                                                            className="p-0.5 text-slate-400 hover:text-blue-500 disabled:opacity-20 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
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

                {/* Section 3: Summary, Tax, Discount & Notes */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Notes & Conditions */}
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-3">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                            <FileCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>3. Catatan & Syarat Ketentuan Invoice</span>
                        </h3>
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-xs">Catatan & Ketentuan Invoice</label>
                            <textarea
                                rows={3}
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                placeholder="Catatan untuk klien, informasi transfer bank, dll..."
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
                                    Upload Scan / Foto Berkas Invoice Ber-TTD Basah (Opsional)
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
                                Untuk tagihan invoice yang ditandatangani basah oleh klien/direksi, Anda dapat mengunggah berkas hasilnya. Format: PDF, JPG, PNG, WEBP (Max 10MB).
                            </p>
                        </div>
                    </div>


                    {/* Summary Totals */}
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-3 text-xs">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                            Kalkulasi Ringkasan Biaya
                        </h3>

                        <div className="space-y-2 pt-1">
                            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                                <span>Subtotal Kuantitas & Harga:</span>
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
                                            className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700 focus:ring-blue-500 cursor-pointer"
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
                                    <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Total Tagihan (Grand Total):</span>
                                    <span className="font-extrabold text-base font-mono text-blue-600 dark:text-blue-400">
                                        Rp {totals.grandTotal.toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-300 italic text-[11px]">
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
                        to="/invoices"
                        className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all"
                    >
                        {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{isEdit ? 'Simpan Perubahan Invoice' : 'Terbitkan Invoice Baru'}</span>
                    </button>
                </div>
            </form>

            {/* Modal Pilih Produk dari Katalog Master */}
            {showProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div className="flex items-center space-x-2">
                                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
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
                                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-blue-500/10 hover:border-blue-500/30 flex items-center justify-between cursor-pointer transition-all group"
                                    >
                                        <div className="space-y-0.5 max-w-lg">
                                            <div className="flex items-center space-x-2">
                                                {p.code && (
                                                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                                        {p.code}
                                                    </span>
                                                )}
                                                <span className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
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
                                            <span className="font-extrabold text-sm font-mono text-blue-600 dark:text-blue-400 block">
                                                Rp {parseFloat(p.unit_price || p.price || 0).toLocaleString('id-ID')}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-500 transition-colors">
                                                + Tambah ke Invoice &rarr;
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

