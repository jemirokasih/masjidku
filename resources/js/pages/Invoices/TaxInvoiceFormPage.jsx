import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import SearchableSelect from '../../components/SearchableSelect';
import {
    FileText,
    ArrowLeft,
    Save,
    RefreshCw,
    UploadCloud,
    Paperclip,
    ExternalLink,
    CheckCircle2,
    X,
    FileCheck,
    AlertCircle
} from 'lucide-react';

export default function TaxInvoiceFormPage() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        tax_invoice_number: '',
        invoice_id: '',
        tax_date: new Date().toISOString().split('T')[0],
        dpp_amount: '',
        tax_rate_percent: '11',
        tax_amount: '',
        total_amount: '',
        status: 'VALID',
        notes: '',
        file: null,
    });

    const [existingFileUrl, setExistingFileUrl] = useState(null);
    const [existingFileName, setExistingFileName] = useState('');
    const [selectedFileName, setSelectedFileName] = useState('');

    const fetchInvoices = async () => {
        try {
            const res = await api.get('/invoices');
            setInvoices(res.data.data || []);
        } catch (err) {
            console.error('Error fetching sales invoices:', err);
        }
    };

    const fetchTaxInvoiceDetail = async () => {
        if (!isEdit) return;
        setLoading(true);
        try {
            const res = await api.get(`/tax-invoices/${id}`);
            const item = res.data.data;
            if (item) {
                setForm({
                    tax_invoice_number: item.tax_invoice_number || '',
                    invoice_id: item.invoice_id || '',
                    tax_date: item.tax_date ? item.tax_date.substring(0, 10) : new Date().toISOString().split('T')[0],
                    dpp_amount: item.dpp_amount || '',
                    tax_rate_percent: item.tax_rate_percent || '11',
                    tax_amount: item.tax_amount || '',
                    total_amount: item.total_amount || '',
                    status: item.status || 'VALID',
                    notes: item.notes || '',
                    file: null,
                });
                setExistingFileUrl(item.file_url);
                setExistingFileName(item.file_name);
            }
        } catch (err) {
            console.error('Error fetching tax invoice detail:', err);
            alert('Gagal memuat data Faktur Pajak.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
        if (isEdit) {
            fetchTaxInvoiceDetail();
        }
    }, [id]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const roundTwo = (num) => Math.round(num * 100) / 100;

    const handleInvoiceSelect = (invId) => {
        setForm(prev => {
            const updated = { ...prev, invoice_id: invId };
            if (invId) {
                const selectedInv = invoices.find(i => String(i.id) === String(invId));
                if (selectedInv) {
                    const subtotal = parseFloat(selectedInv.subtotal) || 0;
                    const rate = parseFloat(prev.tax_rate_percent) || 11;
                    const tax = roundTwo((subtotal * rate) / 100);
                    updated.dpp_amount = subtotal;
                    updated.tax_amount = tax;
                    updated.total_amount = roundTwo(subtotal + tax);
                    if (selectedInv.invoice_date) {
                        updated.tax_date = selectedInv.invoice_date.substring(0, 10);
                    }
                }
            }
            return updated;
        });
    };

    const handleDppOrRateChange = (field, value) => {
        setForm(prev => {
            const updated = { ...prev, [field]: value };
            const dpp = parseFloat(field === 'dpp_amount' ? value : prev.dpp_amount) || 0;
            const rate = parseFloat(field === 'tax_rate_percent' ? value : prev.tax_rate_percent) || 0;
            const tax = roundTwo((dpp * rate) / 100);
            updated.tax_amount = tax;
            updated.total_amount = roundTwo(dpp + tax);
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('tax_invoice_number', form.tax_invoice_number);
            if (form.invoice_id) formData.append('invoice_id', form.invoice_id);
            formData.append('tax_date', form.tax_date);
            formData.append('dpp_amount', form.dpp_amount);
            formData.append('tax_rate_percent', form.tax_rate_percent);
            formData.append('tax_amount', form.tax_amount);
            formData.append('total_amount', form.total_amount);
            formData.append('status', form.status);
            if (form.notes) formData.append('notes', form.notes);
            if (form.file) formData.append('file', form.file);

            if (isEdit) {
                formData.append('_method', 'PUT');
                await api.post(`/tax-invoices/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Faktur Pajak berhasil diperbarui!');
            } else {
                await api.post('/tax-invoices', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Faktur Pajak baru berhasil disimpan!');
            }

            navigate('/tax-invoices');
        } catch (err) {
            alert('Gagal menyimpan Faktur Pajak: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px] text-xs text-slate-500">
                <RefreshCw className="w-5 h-5 animate-spin mr-2 text-blue-500" />
                <span>Memuat formulir Faktur Pajak...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                    <Link
                        to="/tax-invoices"
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                            <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span>{isEdit ? 'Edit Data Faktur Pajak' : 'Tambah Faktur Pajak Baru (e-Faktur)'}</span>
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Formulir pencatatan &amp; unggah dokumen Faktur Pajak resmi yang terhubung dengan Invoice Penjualan.
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Link
                        to="/tax-invoices"
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        form="tax-invoice-form"
                        disabled={submitting}
                        className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all"
                    >
                        {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>Simpan Faktur Pajak</span>
                    </button>
                </div>
            </div>

            {/* Main Form Card */}
            <form id="tax-invoice-form" onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Link & Data Utama */}
                <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2.5 uppercase tracking-wider text-[11px] text-blue-600 dark:text-blue-400">
                        1. Informasi Utama &amp; Invoice Terkait
                    </h2>

                    <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Hubungkan ke Invoice / Tagihan Penjualan (Opsional)</label>
                        <SearchableSelect
                            options={[
                                { value: '', label: '-- Tidak Terhubung / Pilih Invoice Terkait --' },
                                ...invoices.map(inv => ({
                                    value: inv.id,
                                    label: inv.invoice_number,
                                    sublabel: `${inv.client?.name || 'Tanpa Klien'} (${formatCurrency(inv.grand_total)})`,
                                }))
                            ]}
                            value={form.invoice_id}
                            onChange={(val) => handleInvoiceSelect(val)}
                            placeholder="Cari & Pilih Invoice Terkait..."
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                            Memilih invoice akan mengisi otomatis nominal DPP, PPN, dan Tanggal Faktur dari invoice tersebut.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nomor Seri Faktur Pajak (NSFP) *</label>
                            <input
                                type="text"
                                required
                                value={form.tax_invoice_number}
                                onChange={(e) => setForm({ ...form, tax_invoice_number: e.target.value })}
                                placeholder="Contoh: 010.000-26.00000001"
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-200 font-mono font-bold text-xs focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Tanggal Terbit Faktur Pajak *</label>
                            <input
                                type="date"
                                required
                                value={form.tax_date}
                                onChange={(e) => setForm({ ...form, tax_date: e.target.value })}
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-200 font-bold text-xs focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Nominal & Pajak */}
                <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2.5 uppercase tracking-wider text-[11px] text-blue-600 dark:text-blue-400">
                        2. Perhitungan Nominal DPP &amp; PPN
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">DPP (Dasar Pengenaan Pajak) (Rp) *</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={form.dpp_amount}
                                onChange={(e) => handleDppOrRateChange('dpp_amount', e.target.value)}
                                placeholder="0"
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-200 font-mono font-bold text-xs focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Tarif PPN (%) *</label>
                            <SearchableSelect
                                options={[
                                    { value: '11', label: '11% (Standar PPN)' },
                                    { value: '12', label: '12% (UU HPP / Penyesuaian)' },
                                    { value: '0', label: '0% (Bebas PPN)' },
                                ]}
                                value={form.tax_rate_percent}
                                onChange={(val) => handleDppOrRateChange('tax_rate_percent', val)}
                                placeholder="Pilih Tarif PPN..."
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nominal PPN (Rp)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={form.tax_amount}
                                onChange={(e) => setForm({ ...form, tax_amount: e.target.value })}
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Total Nominal Faktur (Rp)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={form.total_amount}
                                onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
                                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-mono font-extrabold text-xs focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Status Validasi Faktur Pajak *</label>
                        <SearchableSelect
                            options={[
                                { value: 'VALID', label: 'VALID (Disetujui DJP)' },
                                { value: 'DRAFT', label: 'DRAFT (Konstruksi / Pembuatan)' },
                                { value: 'REJECTED', label: 'REJECTED (Ditolak DJP)' },
                                { value: 'CANCELLED', label: 'BATAL (Dibatalkan)' },
                            ]}
                            value={form.status}
                            onChange={(val) => setForm({ ...form, status: val })}
                            placeholder="Pilih Status..."
                            required
                        />
                    </div>
                </div>

                {/* 3. Upload Dokumen & Catatan */}
                <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2.5 uppercase tracking-wider text-[11px] text-blue-600 dark:text-blue-400">
                        3. Upload Dokumen e-Faktur &amp; Catatan Internal
                    </h2>

                    <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">Upload File Dokumen e-Faktur (PDF / Image / Zip)</label>
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors bg-slate-50 dark:bg-slate-900/40">
                            <UploadCloud className="w-10 h-10 mx-auto text-blue-500 mb-2" />
                            <p className="text-xs text-slate-700 dark:text-slate-300 font-bold">
                                Klik tombol di bawah untuk memilih file PDF Faktur Pajak dari komputer Anda
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1">Format didukung: PDF, JPG, PNG, ZIP (Maksimal 10MB)</p>

                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.zip"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setForm({ ...form, file });
                                        setSelectedFileName(file.name);
                                    }
                                }}
                                className="mt-4 block mx-auto text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                            />

                            {selectedFileName && (
                                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl font-bold flex items-center justify-center space-x-1.5 inline-flex">
                                    <Paperclip className="w-4 h-4" />
                                    <span>File Terpilih: {selectedFileName}</span>
                                </div>
                            )}

                            {!selectedFileName && existingFileUrl && (
                                <div className="mt-3 p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold flex items-center justify-center space-x-1.5 inline-flex">
                                    <Paperclip className="w-4 h-4 text-slate-400" />
                                    <span>File Saat Ini: {existingFileName || 'Dokumen Faktur Pajak'}</span>
                                    <a href={existingFileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-bold ml-2">Lihat File</a>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Catatan Internal / Keterangan</label>
                        <textarea
                            rows="3"
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            placeholder="Catatan internal perpajakan atau keterangan penyesuaian..."
                            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500 text-xs"
                        />
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-3 pt-2">
                    <Link
                        to="/tax-invoices"
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
                        <span>{isEdit ? 'Simpan Perubahan' : 'Simpan Faktur Pajak'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
