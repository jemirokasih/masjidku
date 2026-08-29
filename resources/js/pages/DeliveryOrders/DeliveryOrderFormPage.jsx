import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import SearchableSelect from '../../components/SearchableSelect';
import {
    Truck,
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Building2,
    UserCheck,
    Navigation,
    Package,
    FileText,
    Calendar,
    AlertCircle,
    MapPin
} from 'lucide-react';

export default function DeliveryOrderFormPage() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [clients, setClients] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [projects, setProjects] = useState([]);
    const [products, setProducts] = useState([]);

    const [useCustomAddress, setUseCustomAddress] = useState(false);
    const [customAddress, setCustomAddress] = useState('');
    const [proofFile, setProofFile] = useState(null);
    const [existingProofUrl, setExistingProofUrl] = useState(null);

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        do_number: '',
        do_date: new Date().toISOString().split('T')[0],
        client_id: '',
        invoice_id: '',
        project_id: '',
        shipping_address: '',
        recipient_name: '',
        recipient_phone: '',
        expedition_name: 'Kurir Internal',
        driver_name: '',
        vehicle_number: '',
        tracking_number: '',
        status: 'DRAFT',
        notes: '',
        items: [
            {
                product_id: '',
                item_name: '',
                description: '',
                unit: 'Pcs',
                quantity: 1,
                notes: '',
            }
        ]
    });

    useEffect(() => {
        fetchMasterData();
        if (isEdit) {
            fetchDeliveryOrderData();
        }
    }, [id]);

    const fetchMasterData = async () => {
        try {
            const [clientRes, invRes, projRes, prodRes] = await Promise.allSettled([
                api.get('/clients?per_page=100'),
                api.get('/invoices?per_page=100'),
                api.get('/projects?per_page=100'),
                api.get('/products?per_page=100'),
            ]);

            if (clientRes.status === 'fulfilled' && clientRes.value?.data?.data) {
                setClients(clientRes.value.data.data.map(c => ({
                    value: String(c.id),
                    label: c.company_name ? `${c.name} (${c.company_name})` : c.name,
                    code: c.code,
                    alias: c.alias,
                    sublabel: [c.alias ? `Alias: ${c.alias}` : null, c.address].filter(Boolean).join(' • '),
                    raw: c,
                })));
            }

            if (invRes.status === 'fulfilled' && invRes.value?.data?.data) {
                setInvoices(invRes.value.data.data.map(i => ({
                    value: String(i.id),
                    label: `${i.invoice_number} - ${i.client?.company_name || i.client?.name || ''}`,
                    raw: i,
                })));
            }

            if (projRes.status === 'fulfilled' && projRes.value?.data?.data) {
                setProjects(projRes.value.data.data.map(p => ({
                    value: String(p.id),
                    label: p.name,
                })));
            }

            if (prodRes.status === 'fulfilled' && prodRes.value?.data?.data) {
                setProducts(prodRes.value.data.data.map(pr => ({
                    value: String(pr.id),
                    label: pr.name,
                    code: pr.code,
                    sublabel: [
                        pr.type ? (pr.type === 'SERVICE' ? 'Jasa' : 'Barang') : null,
                        pr.unit ? `Satuan: ${pr.unit}` : null,
                        pr.price ? `Rp ${Number(pr.price).toLocaleString('id-ID')}` : null
                    ].filter(Boolean).join(' • '),
                    raw: pr,
                })));
            }
        } catch (err) {
            console.error('Failed to load master data:', err);
        }
    };

    const fetchDeliveryOrderData = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/delivery-orders/${id}`);
            if (res.data?.status === 'success') {
                const data = res.data.data;
                setExistingProofUrl(data.proof_file_url || null);
                setFormData({
                    do_number: data.do_number || '',
                    do_date: data.do_date ? data.do_date.split('T')[0] : new Date().toISOString().split('T')[0],
                    client_id: data.client_id ? String(data.client_id) : '',
                    invoice_id: data.invoice_id ? String(data.invoice_id) : '',
                    project_id: data.project_id ? String(data.project_id) : '',
                    shipping_address: data.shipping_address || '',
                    recipient_name: data.recipient_name || '',
                    recipient_phone: data.recipient_phone || '',
                    expedition_name: data.expedition_name || '',
                    driver_name: data.driver_name || '',
                    vehicle_number: data.vehicle_number || '',
                    tracking_number: data.tracking_number || '',
                    status: data.status || 'DRAFT',
                    notes: data.notes || '',
                    items: data.items && data.items.length > 0 ? data.items.map(item => ({
                        product_id: item.product_id ? String(item.product_id) : '',
                        item_name: item.item_name || '',
                        description: item.description || '',
                        unit: item.unit || 'Pcs',
                        quantity: Number(item.quantity) || 1,
                        notes: item.notes || '',
                    })) : [{ product_id: '', item_name: '', description: '', unit: 'Pcs', quantity: 1, notes: '' }]
                });
            }
        } catch (err) {
            console.error('Failed to fetch delivery order:', err);
            setError('Gagal memuat data Surat Jalan.');
        } finally {
            setLoading(false);
        }
    };

    const handleClientChange = (val) => {
        const selected = clients.find(c => String(c.value) === String(val));
        const clientAddr = selected?.raw?.address || '';
        setFormData(prev => ({
            ...prev,
            client_id: val,
            shipping_address: useCustomAddress ? (customAddress || clientAddr) : clientAddr,
            recipient_name: selected?.raw?.contact_person || selected?.raw?.name || prev.recipient_name,
            recipient_phone: selected?.raw?.phone || prev.recipient_phone,
        }));
    };

    const handleAddressModeToggle = (isCustom) => {
        setUseCustomAddress(isCustom);
        const selected = clients.find(c => String(c.value) === String(formData.client_id));
        const clientAddr = selected?.raw?.address || '';

        if (!isCustom) {
            setFormData(prev => ({ ...prev, shipping_address: clientAddr }));
        } else {
            const nextAddr = customAddress || formData.shipping_address || clientAddr;
            setCustomAddress(nextAddr);
            setFormData(prev => ({ ...prev, shipping_address: nextAddr }));
        }
    };

    const handleCustomAddressChange = (val) => {
        setCustomAddress(val);
        setFormData(prev => ({ ...prev, shipping_address: val }));
    };

    const handleItemProductChange = (index, prodId) => {
        const prod = products.find(p => String(p.value) === String(prodId));
        setFormData(prev => {
            const newItems = [...prev.items];
            newItems[index] = {
                ...newItems[index],
                product_id: prodId,
                item_name: prod?.raw?.name || newItems[index].item_name,
                description: prod?.raw?.description || newItems[index].description,
                unit: prod?.raw?.unit || newItems[index].unit || 'Pcs',
            };
            return { ...prev, items: newItems };
        });
    };

    const handleItemChange = (index, field, value) => {
        setFormData(prev => {
            const newItems = [...prev.items];
            newItems[index] = { ...newItems[index], [field]: value };
            return { ...prev, items: newItems };
        });
    };

    const addItemRow = () => {
        setFormData(prev => ({
            ...prev,
            items: [
                ...prev.items,
                { product_id: '', item_name: '', description: '', unit: 'Pcs', quantity: 1, notes: '' }
            ]
        }));
    };

    const removeItemRow = (index) => {
        if (formData.items.length <= 1) return;
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.client_id) {
            setError('Silakan pilih Klien penerima.');
            return;
        }

        if (!formData.shipping_address) {
            setError('Alamat pengiriman wajib diisi.');
            return;
        }

        if (!formData.items || formData.items.length === 0 || !formData.items[0].item_name) {
            setError('Minimal satu barang/produk wajib diisi.');
            return;
        }

        if (formData.status === 'DELIVERED' && !proofFile && !existingProofUrl) {
            setError('Untuk menyimpan Surat Jalan dengan status SELESAI TERKIRIM, Anda wajib mengunggah file scan/foto Surat Jalan yang telah ditandatangani.');
            return;
        }

        try {
            setSubmitting(true);

            const payload = new FormData();
            payload.append('do_number', formData.do_number || '');
            payload.append('do_date', formData.do_date);
            payload.append('client_id', formData.client_id);
            if (formData.invoice_id) payload.append('invoice_id', formData.invoice_id);
            if (formData.project_id) payload.append('project_id', formData.project_id);
            payload.append('shipping_address', formData.shipping_address);
            if (formData.recipient_name) payload.append('recipient_name', formData.recipient_name);
            if (formData.recipient_phone) payload.append('recipient_phone', formData.recipient_phone);
            if (formData.expedition_name) payload.append('expedition_name', formData.expedition_name);
            if (formData.driver_name) payload.append('driver_name', formData.driver_name);
            if (formData.vehicle_number) payload.append('vehicle_number', formData.vehicle_number);
            if (formData.tracking_number) payload.append('tracking_number', formData.tracking_number);
            payload.append('status', formData.status);
            if (formData.notes) payload.append('notes', formData.notes);
            if (proofFile) payload.append('proof_file', proofFile);

            formData.items.forEach((item, index) => {
                if (item.product_id) payload.append(`items[${index}][product_id]`, item.product_id);
                payload.append(`items[${index}][item_name]`, item.item_name);
                if (item.description) payload.append(`items[${index}][description]`, item.description);
                payload.append(`items[${index}][unit]`, item.unit || 'Pcs');
                payload.append(`items[${index}][quantity]`, item.quantity);
                if (item.notes) payload.append(`items[${index}][notes]`, item.notes);
            });

            if (isEdit) {
                payload.append('_method', 'PUT');
                await api.post(`/delivery-orders/${id}`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/delivery-orders', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            navigate('/delivery-orders');
        } catch (err) {
            console.error('Failed to save delivery order:', err);
            const msg = err.response?.data?.message || 'Gagal menyimpan Surat Jalan.';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-12 text-center text-slate-400">
                <Truck className="w-8 h-8 animate-bounce mx-auto text-blue-500 mb-2" />
                <span>Memuat formulir Surat Jalan...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto">
            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center space-x-3.5">
                    <Link
                        to="/delivery-orders"
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                            {isEdit ? `Edit Surat Jalan (${formData.do_number})` : 'Buat Surat Jalan Baru'}
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Isi rincian pengiriman barang, alamat tujuan, ekspedisi, dan item barang.
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Link
                        to="/delivery-orders"
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center space-x-1.5 disabled:opacity-50 transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        <span>{submitting ? 'Menyimpan...' : 'Simpan Surat Jalan'}</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Main Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Column 1: Dokumen & Klien Info */}
                <div className="p-6 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                        <FileText className="w-4 h-4 text-blue-500" /> Informasi Dokumen &amp; Penerima
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                No. Surat Jalan (Opsional)
                            </label>
                            <input
                                type="text"
                                value={formData.do_number}
                                onChange={(e) => setFormData(prev => ({ ...prev, do_number: e.target.value }))}
                                placeholder="Otomatis (contoh: 001/DO/08/2026)"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-mono font-semibold"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Tanggal Pengiriman *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.do_date}
                                onChange={(e) => setFormData(prev => ({ ...prev, do_date: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-semibold"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Pilih Klien / Tujuan *
                        </label>
                        <SearchableSelect
                            options={clients}
                            value={formData.client_id}
                            onChange={handleClientChange}
                            placeholder="Pilih Klien Penerima..."
                            required
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                Alamat Pengiriman (Tujuan) *
                            </label>
                            
                            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px]">
                                <button
                                    type="button"
                                    onClick={() => handleAddressModeToggle(false)}
                                    className={`px-2 py-1 rounded-md font-bold transition-all ${
                                        !useCustomAddress
                                            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                                >
                                    🏢 Alamat Utama Klien
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleAddressModeToggle(true)}
                                    className={`px-2 py-1 rounded-md font-bold transition-all ${
                                        useCustomAddress
                                            ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                                >
                                    📍 Kirim ke Alamat Lain
                                </button>
                            </div>
                        </div>

                        {!useCustomAddress ? (
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1">
                                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold">
                                        <MapPin className="w-3 h-3" /> Alamat Terdaftar Klien (Default)
                                    </span>
                                    <span className="text-[9px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.2 rounded border border-blue-500/20 font-bold">Auto-sync</span>
                                </div>
                                <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                                    {formData.shipping_address || (formData.client_id ? 'Belum ada alamat terdaftar pada informasi klien.' : 'Pilih klien terlebih dahulu untuk memuat alamat default.')}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[10px] font-bold text-purple-600 dark:text-purple-400">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> Masukkan Alamat Pengiriman Lain (Site / Gudang Tujuan)
                                    </span>
                                    <span className="text-[9px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-1.5 py-0.2 rounded border border-purple-500/20 font-bold">Custom Address</span>
                                </div>
                                <textarea
                                    rows="3"
                                    required
                                    value={formData.shipping_address}
                                    onChange={(e) => handleCustomAddressChange(e.target.value)}
                                    placeholder="Tuliskan alamat lengkap lokasi pengiriman baru / site gudang tujuan..."
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-purple-300 dark:border-purple-900/50 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-purple-500"
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                UP / Nama Penerima
                            </label>
                            <input
                                type="text"
                                value={formData.recipient_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, recipient_name: e.target.value }))}
                                placeholder="Contact Person Gudang/Penerima"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                No. Telepon Penerima
                            </label>
                            <input
                                type="text"
                                value={formData.recipient_phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, recipient_phone: e.target.value }))}
                                placeholder="Contoh: 08123456789"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Column 2: Logistik, Referensi & Status */}
                <div className="p-6 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                        <Navigation className="w-4 h-4 text-emerald-500" /> Ekspedisi &amp; Referensi Dokumen
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Jasa Ekspedisi / Transport
                            </label>
                            <input
                                type="text"
                                value={formData.expedition_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, expedition_name: e.target.value }))}
                                placeholder="Contoh: Kurir Internal, JNE, Deliveree"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Nama Sopir / Driver
                            </label>
                            <input
                                type="text"
                                value={formData.driver_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, driver_name: e.target.value }))}
                                placeholder="Nama pengemudi"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-medium"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                No. Plat Kendaraan
                            </label>
                            <input
                                type="text"
                                value={formData.vehicle_number}
                                onChange={(e) => setFormData(prev => ({ ...prev, vehicle_number: e.target.value }))}
                                placeholder="Contoh: B 1234 XYZ"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                No. Resi / Tracking
                            </label>
                            <input
                                type="text"
                                value={formData.tracking_number}
                                onChange={(e) => setFormData(prev => ({ ...prev, tracking_number: e.target.value }))}
                                placeholder="Nomor Resi / AWB"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-mono"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Hubungkan ke Invoice (Opsional)
                            </label>
                            <SearchableSelect
                                options={[{ value: '', label: '-- Tidak Terhubung --' }, ...invoices]}
                                value={formData.invoice_id}
                                onChange={(val) => setFormData(prev => ({ ...prev, invoice_id: val }))}
                                placeholder="Pilih Invoice..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Status Surat Jalan
                            </label>
                            <SearchableSelect
                                options={[
                                    { value: 'DRAFT', label: 'DRAFT' },
                                    { value: 'PENDING_SHIPMENT', label: 'MENUNGGU KURIR' },
                                    { value: 'IN_TRANSIT', label: 'DALAM PENGIRIMAN' },
                                    { value: 'DELIVERED', label: 'SELESAI TERKIRIM' },
                                    { value: 'CANCELLED', label: 'DIBATALKAN' },
                                ]}
                                value={formData.status}
                                onChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
                                placeholder="Pilih Status..."
                            />
                        </div>
                    </div>

                    {/* Proof File Upload Box */}
                    <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                                Scan / Foto Surat Jalan Ber-TTD {formData.status === 'DELIVERED' ? '*' : '(Opsional)'}
                            </label>
                            {formData.status === 'DELIVERED' && (
                                <span className="text-[10px] font-extrabold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                                    Wajib untuk Status Terkirim
                                </span>
                            )}
                        </div>

                        {existingProofUrl && !proofFile && (
                            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                                    <FileCheck className="w-4 h-4" /> Bukti Scan TTD Sudah Diunggah
                                </span>
                                <a href={existingProofUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                                    Lihat File
                                </a>
                            </div>
                        )}

                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                            onChange={(e) => setProofFile(e.target.files[0])}
                            className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-700 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 p-1"
                        />
                        <p className="text-[10px] text-slate-400">
                            Format yang didukung: PDF, JPG, PNG, WEBP (Maksimal 10MB).
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Catatan / Instruksi Pengiriman
                        </label>
                        <textarea
                            rows="2"
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Catatan khusus kondisi dus, instruksi bongkar muat..."
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Dynamic Items Table Section */}
            <div className="p-6 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Package className="w-4 h-4 text-purple-500" /> Daftar Barang / Produk Dikirim
                    </h3>
                    <button
                        type="button"
                        onClick={addItemRow}
                        className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-500/20 flex items-center space-x-1 transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Item Barang</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                                <th className="py-3 px-3 w-8">#</th>
                                <th className="py-3 px-3 w-64">Nama Barang / Produk *</th>
                                <th className="py-3 px-3">Spesifikasi / Deskripsi</th>
                                <th className="py-3 px-3 w-28">Satuan</th>
                                <th className="py-3 px-3 w-28">Qty Dikirim *</th>
                                <th className="py-3 px-3 w-40">Catatan / Serial No</th>
                                <th className="py-3 px-3 w-10 text-center">Hapus</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                            {formData.items.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="py-2.5 px-3 font-bold text-slate-400">{idx + 1}</td>

                                    {/* Nama Barang */}
                                    <td className="py-2.5 px-3 space-y-1.5">
                                        <SearchableSelect
                                            options={[{ value: '', label: '-- Pilih Dari Katalog Produk / Jasa --' }, ...products]}
                                            value={item.product_id}
                                            onChange={(val) => handleItemProductChange(idx, val)}
                                            placeholder="Cari Katalog Produk / Jasa..."
                                        />
                                        <input
                                            type="text"
                                            required
                                            value={item.item_name}
                                            onChange={(e) => handleItemChange(idx, 'item_name', e.target.value)}
                                            placeholder="Nama barang..."
                                            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold"
                                        />
                                    </td>

                                    {/* Deskripsi */}
                                    <td className="py-2.5 px-3">
                                        <textarea
                                            rows="2"
                                            value={item.description}
                                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                            placeholder="Deskripsi/spesifikasi barang..."
                                            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                                        />
                                    </td>

                                    {/* Satuan */}
                                    <td className="py-2.5 px-3">
                                        <input
                                            type="text"
                                            value={item.unit}
                                            onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                                            placeholder="Pcs/Box/Unit"
                                            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-center font-bold"
                                        />
                                    </td>

                                    {/* Qty */}
                                    <td className="py-2.5 px-3">
                                        <input
                                            type="number"
                                            min="0.01"
                                            step="any"
                                            required
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-center font-bold text-blue-600 dark:text-blue-400"
                                        />
                                    </td>

                                    {/* Catatan Item */}
                                    <td className="py-2.5 px-3">
                                        <input
                                            type="text"
                                            value={item.notes}
                                            onChange={(e) => handleItemChange(idx, 'notes', e.target.value)}
                                            placeholder="Kondisi/SN..."
                                            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                                        />
                                    </td>

                                    {/* Delete Row */}
                                    <td className="py-2.5 px-3 text-center">
                                        <button
                                            type="button"
                                            disabled={formData.items.length <= 1}
                                            onClick={() => removeItemRow(idx)}
                                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 disabled:opacity-30 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2">
                <Link
                    to="/delivery-orders"
                    className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                    Batal
                </Link>
                <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/20 flex items-center space-x-2 disabled:opacity-50 transition-colors"
                >
                    <Save className="w-4 h-4" />
                    <span>{submitting ? 'Menyimpan...' : 'Simpan Surat Jalan'}</span>
                </button>
            </div>
        </form>
    );
}
