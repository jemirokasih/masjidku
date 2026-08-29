import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
    Receipt,
    ArrowLeft,
    Plus,
    Trash2,
    Save,
    RefreshCw,
    Building2,
    FolderKanban
} from 'lucide-react';

export default function VendorInvoiceFormPage() {
    const navigate = useNavigate();
    const [vendors, setVendors] = useState([]);
    const [projects, setProjects] = useState([]);
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        invoice_number: '',
        vendor_id: '',
        project_id: '',
        vendor_quote_id: '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: '',
        tax_amount: 0,
        status: 'UNPAID',
        notes: '',
        proof_file: null,
    });

    const [items, setItems] = useState([
        { item_name: '', description: '', quantity: 1, unit_price: 0 }
    ]);

    useEffect(() => {
        const loadDependencies = async () => {
            setLoading(true);
            try {
                const [vRes, pRes, qRes] = await Promise.all([
                    api.get('/vendors'),
                    api.get('/projects'),
                    api.get('/vendor-quotes'),
                ]);
                setVendors(vRes.data.data || []);
                setProjects(pRes.data.data || []);
                setQuotes(qRes.data.data || []);
            } catch (err) {
                console.error('Gagal memuat master data:', err);
            } finally {
                setLoading(false);
            }
        };
        loadDependencies();
    }, []);

    const addItem = () => {
        setItems([...items, { item_name: '', description: '', quantity: 1, unit_price: 0 }]);
    };

    const removeItem = (idx) => {
        if (items.length <= 1) return;
        setItems(items.filter((_, i) => i !== idx));
    };

    const updateItem = (idx, field, val) => {
        const newItems = [...items];
        newItems[idx][field] = val;
        setItems(newItems);
    };

    const subtotal = items.reduce((acc, item) => acc + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)), 0);
    const totalAmount = subtotal + (parseFloat(form.tax_amount) || 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.invoice_number || !form.vendor_id) {
            alert('No. Invoice Vendor & Vendor wajib diisi!');
            return;
        }

        if (items.some(i => !i.item_name || i.quantity <= 0)) {
            alert('Semua item barang wajib memiliki nama dan kuantitas valid!');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('invoice_number', form.invoice_number);
            formData.append('vendor_id', form.vendor_id);
            if (form.project_id) formData.append('project_id', form.project_id);
            if (form.vendor_quote_id) formData.append('vendor_quote_id', form.vendor_quote_id);
            formData.append('invoice_date', form.invoice_date);
            if (form.due_date) formData.append('due_date', form.due_date);
            formData.append('tax_amount', form.tax_amount);
            formData.append('status', form.status);
            if (form.notes) formData.append('notes', form.notes);
            if (form.proof_file) formData.append('proof_file', form.proof_file);

            items.forEach((item, index) => {
                formData.append(`items[${index}][item_name]`, item.item_name);
                if (item.description) formData.append(`items[${index}][description]`, item.description);
                formData.append(`items[${index}][quantity]`, item.quantity);
                formData.append(`items[${index}][unit_price]`, item.unit_price);
            });

            await api.post('/vendor-invoices', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            navigate('/vendor-invoices');
        } catch (err) {
            alert('Gagal mencatat tagihan vendor: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 text-xs">
            {/* Header */}
            <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-slate-800 pb-5">
                <button
                    onClick={() => navigate('/vendor-invoices')}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                        Catat Tagihan Vendor Baru (Invoice In)
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Isi informasi tagihan vendor, rincian item barang/jasa, serta alokasi ke proyek.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form Informasi Tagihan */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                        1. Informasi Dokumen Tagihan
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block font-semibold text-slate-700 dark:text-slate-300">Pilih Vendor / Supplier *</label>
                            <select
                                required
                                value={form.vendor_id}
                                onChange={(e) => setForm({ ...form, vendor_id: e.target.value })}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 text-slate-900 dark:text-slate-100"
                            >
                                <option value="">-- Pilih Vendor --</option>
                                {vendors.map((v) => (
                                    <option key={v.id} value={v.id}>{v.company_name} ({v.code})</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="block font-semibold text-slate-700 dark:text-slate-300">No. Invoice dari Vendor *</label>
                            <input
                                type="text"
                                required
                                placeholder="Contoh: INV-VND/2026/08/99"
                                value={form.invoice_number}
                                onChange={(e) => setForm({ ...form, invoice_number: e.target.value })}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono focus:outline-none focus:border-purple-500 text-slate-900 dark:text-slate-100"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block font-semibold text-slate-700 dark:text-slate-300">Alokasikan ke Proyek (Opsional)</label>
                            <select
                                value={form.project_id}
                                onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 text-slate-900 dark:text-slate-100"
                            >
                                <option value="">-- Pengeluaran Umum / Tidak Ditautkan --</option>
                                {projects.map((p) => (
                                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="block font-semibold text-slate-700 dark:text-slate-300">Penawaran Ref (Quote In)</label>
                            <select
                                value={form.vendor_quote_id}
                                onChange={(e) => setForm({ ...form, vendor_quote_id: e.target.value })}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 text-slate-900 dark:text-slate-100"
                            >
                                <option value="">-- Tanpa Referensi Penawaran --</option>
                                {quotes.map((q) => (
                                    <option key={q.id} value={q.id}>{q.quote_number} - {q.vendor?.company_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="block font-semibold text-slate-700 dark:text-slate-300">Tanggal Tagihan *</label>
                            <input
                                type="date"
                                required
                                value={form.invoice_date}
                                onChange={(e) => setForm({ ...form, invoice_date: e.target.value })}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono focus:outline-none focus:border-purple-500 text-slate-900 dark:text-slate-100"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block font-semibold text-slate-700 dark:text-slate-300">Jatuh Tempo Pembayaran</label>
                            <input
                                type="date"
                                value={form.due_date}
                                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono focus:outline-none focus:border-purple-500 text-slate-900 dark:text-slate-100"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block font-semibold text-slate-700 dark:text-slate-300">Unggah Berkas Tagihan / Penawaran (PDF/Gambar)</label>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => setForm({ ...form, proof_file: e.target.files[0] })}
                                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-900 dark:text-slate-100"
                            />
                        </div>

                        <div className="space-y-1 md:col-span-2">
                            <label className="block font-semibold text-slate-700 dark:text-slate-300">Catatan / Keterangan Tagihan</label>
                            <input
                                type="text"
                                placeholder="Catatan tambahan internal pengadaan..."
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 text-slate-900 dark:text-slate-100"
                            />
                        </div>
                    </div>
                </div>

                {/* Form Item Rincian Tagihan */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            2. Rincian Item Barang / Jasa Dibeli
                        </h3>
                        <button
                            type="button"
                            onClick={addItem}
                            className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 font-bold flex items-center space-x-1 border border-purple-200 dark:border-purple-800"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Tambah Item</span>
                        </button>
                    </div>

                    <div className="space-y-3">
                        {items.map((item, idx) => (
                            <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 grid grid-cols-12 gap-3 items-end">
                                <div className="col-span-5 space-y-1">
                                    <label className="block text-[11px] font-semibold text-slate-600">Nama Barang / Jasa *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Laptop Core i7 / Kabel LAN Cat6"
                                        value={item.item_name}
                                        onChange={(e) => updateItem(idx, 'item_name', e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                                    />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="block text-[11px] font-semibold text-slate-600">Qty *</label>
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="any"
                                        required
                                        value={item.quantity}
                                        onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-center"
                                    />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="block text-[11px] font-semibold text-slate-600">Harga Satuan (Rp) *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={item.unit_price}
                                        onChange={(e) => updateItem(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-right"
                                    />
                                </div>
                                <div className="col-span-2 text-right font-mono font-bold text-slate-900 dark:text-slate-100 pb-2">
                                    Rp {((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)).toLocaleString('id-ID')}
                                </div>
                                <div className="col-span-1 text-right pb-1">
                                    <button
                                        type="button"
                                        onClick={() => removeItem(idx)}
                                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary Totals */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                        <div className="w-64 space-y-2 text-slate-700 dark:text-slate-300 font-mono">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span className="font-bold">Rp {subtotal.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Pajak (PPN/PPh):</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.tax_amount}
                                    onChange={(e) => setForm({ ...form, tax_amount: parseFloat(e.target.value) || 0 })}
                                    className="w-28 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-right text-xs"
                                />
                            </div>
                            <div className="flex justify-between pt-2 border-t border-slate-300 dark:border-slate-700 text-sm font-black text-purple-600 dark:text-purple-400">
                                <span>TOTAL TAGIHAN:</span>
                                <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Bar */}
                <div className="flex justify-end space-x-3 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate('/vendor-invoices')}
                        className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-500/20 flex items-center space-x-2 disabled:opacity-50"
                    >
                        {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>Simpan Tagihan Vendor</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
