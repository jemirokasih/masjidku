import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { openPdfPreview } from '../../utils/pdfPreview';
import { useConfirm } from '../../context/ConfirmContext';
import SearchableSelect from '../../components/SearchableSelect';
import { terbilang } from '../../utils/terbilang';
import {
    CreditCard,
    ArrowLeft,
    Save,
    RefreshCw,
    FileText,
    Calendar,
    DollarSign,
    CheckCircle2,
    Building2,
    FileCheck2,
    Hash,
    HelpCircle,
    ChevronDown,
    Download,
    Trash2,
    FolderKanban,
    FileCheck,
    UploadCloud,
    X
} from 'lucide-react';

export default function PaymentFormPage() {
    const { confirm } = useConfirm();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const prefilledInvoiceId = searchParams.get('invoice_id');
    const prefilledProjectId = searchParams.get('project_id');
    const [showActionDropdown, setShowActionDropdown] = useState(false);

    const [invoices, setInvoices] = useState([]);
    const [projects, setProjects] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        invoice_id: prefilledInvoiceId || '',
        project_id: prefilledProjectId || '',
        payment_method_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        amount: '',
        reference_number: '',
        signature_type: '',
        notes: '',
    });

    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [proofFile, setProofFile] = useState(null);
    const [existingProofUrl, setExistingProofUrl] = useState(null);

    const formatRp = (val) => 'Rp ' + new Intl.NumberFormat('id-ID').format(val || 0);

    useEffect(() => {
        const init = async () => {
            setLoadingData(true);
            try {
                const [invRes, prjRes, pmRes] = await Promise.all([
                    api.get('/invoices'),
                    api.get('/projects').catch(() => ({ data: { data: [] } })),
                    api.get('/payment-methods'),
                ]);

                const fetchedInvoices = invRes.data.data || [];
                const fetchedProjects = prjRes.data.data || [];
                const fetchedPms = pmRes.data.data || [];

                setInvoices(fetchedInvoices);
                setProjects(fetchedProjects);
                setPaymentMethods(fetchedPms);

                // Set default payment method if available
                let defaultPmId = '';
                if (fetchedPms.length > 0) {
                    defaultPmId = fetchedPms[0].id;
                }

                if (isEdit) {
                    const payRes = await api.get(`/payments/${id}`);
                    const pay = payRes.data.data;
                    setExistingProofUrl(pay.proof_file_url || null);

                    setForm({
                        invoice_id: pay.invoice_id || '',
                        project_id: pay.project_id || '',
                        payment_method_id: pay.payment_method_id || defaultPmId,
                        payment_date: pay.payment_date ? String(pay.payment_date).split('T')[0].substring(0, 10) : new Date().toISOString().split('T')[0],
                        amount: pay.amount || 0,
                        reference_number: pay.reference_number || '',
                        signature_type: pay.signature_type || '',
                        notes: pay.notes || '',
                    });

                    if (pay.invoice) {
                        setSelectedInvoice(pay.invoice);
                    } else {
                        const invMatch = fetchedInvoices.find(i => i.id === pay.invoice_id);
                        if (invMatch) setSelectedInvoice(invMatch);
                    }
                } else {
                    setForm(prev => ({
                        ...prev,
                        payment_method_id: prev.payment_method_id || defaultPmId,
                    }));

                    if (prefilledInvoiceId) {
                        const invMatch = fetchedInvoices.find(i => String(i.id) === String(prefilledInvoiceId));
                        if (invMatch) {
                            setSelectedInvoice(invMatch);
                            const remaining = Math.max(0, (invMatch.grand_total || 0) - (invMatch.paid_amount || 0));
                            setForm(prev => ({ ...prev, amount: remaining }));
                        }
                    }
                }
            } catch (err) {
                console.error('Gagal memuat data pembayaran:', err);
                alert('Gagal memuat data formulir pembayaran: ' + (err.response?.data?.message || err.message));
            } finally {
                setLoadingData(false);
            }
        };

        init();
    }, [id, isEdit, prefilledInvoiceId]);

    // Handle invoice selection change
    const handleInvoiceChange = (invId) => {
        const invMatch = invoices.find(i => String(i.id) === String(invId));
        setSelectedInvoice(invMatch || null);

        if (invMatch && !isEdit) {
            const remaining = Math.max(0, (invMatch.grand_total || 0) - (invMatch.paid_amount || 0));
            setForm(prev => ({
                ...prev,
                invoice_id: invId,
                amount: remaining > 0 ? remaining : invMatch.grand_total
            }));
        } else {
            setForm(prev => ({ ...prev, invoice_id: invId }));
        }
    };

    const handleDelete = async () => {
        setShowActionDropdown(false);
        const ok = await confirm({
            title: 'Hapus Data Pembayaran',
            message: 'Yakin ingin menghapus data pembayaran ini? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Hapus',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`/payments/${id}`);
            alert('Data pembayaran berhasil dihapus.');
            navigate('/payments');
        } catch (err) {
            alert('Gagal menghapus pembayaran: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.invoice_id) {
            alert('Pilih invoice tagihan terlebih dahulu!');
            return;
        }
        if (!form.payment_method_id) {
            alert('Pilih metode pembayaran terlebih dahulu!');
            return;
        }
        if (!form.amount || parseFloat(form.amount) <= 0) {
            alert('Masukkan nominal pembayaran yang valid (lebih dari 0)!');
            return;
        }

        setSubmitting(true);
        try {
            const payload = new FormData();
            payload.append('invoice_id', form.invoice_id);
            if (form.project_id) payload.append('project_id', form.project_id);
            payload.append('payment_method_id', form.payment_method_id);
            payload.append('payment_date', form.payment_date);
            payload.append('amount', form.amount);
            if (form.reference_number) payload.append('reference_number', form.reference_number);
            if (form.signature_type) payload.append('signature_type', form.signature_type);
            if (form.notes) payload.append('notes', form.notes);
            if (proofFile) payload.append('proof_file', proofFile);

            if (isEdit) {
                payload.append('_method', 'PUT');
                await api.post(`/payments/${id}`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Data pembayaran berhasil diperbarui!');
            } else {
                await api.post('/payments', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Pembayaran baru & kwitansi berhasil dicatat!');
            }
            navigate('/payments');
        } catch (err) {
            console.error('Gagal menyimpan pembayaran:', err);
            alert('Gagal menyimpan pembayaran: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex justify-center items-center min-h-[400px] text-xs text-slate-500 dark:text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin mr-2 text-emerald-600 dark:text-emerald-400" />
                <span>Memuat formulir pembayaran...</span>
            </div>
        );
    }

    const grandTotal = selectedInvoice?.grand_total || 0;
    const paidAmount = selectedInvoice?.paid_amount || 0;
    const remainingBalance = Math.max(0, grandTotal - paidAmount);

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            {/* Header Page */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                    <Link
                        to={prefilledInvoiceId ? `/invoices/${prefilledInvoiceId}/edit` : '/payments'}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        title={prefilledInvoiceId ? 'Kembali ke Invoice' : 'Kembali ke Riwayat Pembayaran'}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <span>
                                {isEdit
                                    ? 'Edit Data Pembayaran'
                                    : prefilledInvoiceId
                                        ? 'Buat Kwitansi Pembayaran'
                                        : 'Catat Pembayaran Baru'}
                            </span>
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {isEdit
                                ? 'Perbarui informasi transaksi & cetak ulang kwitansi resmi.'
                                : prefilledInvoiceId
                                    ? 'Isi detail pembayaran untuk menerbitkan kwitansi resmi atas invoice ini.'
                                    : 'Input penerimaan uang masuk dari klien & terbitkan kwitansi resmi.'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2 relative">
                    {/* Opsi Aksi (Visible on Edit mode) */}
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
                                <div className="absolute right-0 top-full mt-1.5 z-[999] w-48 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden py-1 text-left space-y-0.5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowActionDropdown(false);
                                            openPdfPreview(`/payments/${id}/receipt`);
                                        }}
                                        className="w-full px-3.5 py-2 hover:bg-emerald-500/10 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center space-x-2 transition-colors text-left"
                                    >
                                        <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                        <span>Preview &amp; Cetak Kwitansi</span>
                                    </button>

                                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="w-full px-3.5 py-2 hover:bg-rose-500/10 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center space-x-2 transition-colors text-left"
                                    >
                                        <Trash2 className="w-4 h-4 shrink-0" />
                                        <span>Hapus Pembayaran</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <Link
                        to="/payments"
                        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                        Batal
                    </Link>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center space-x-1.5 transition-all disabled:opacity-60"
                    >
                        {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{isEdit ? 'Simpan Perubahan' : 'Simpan Pembayaran'}</span>
                    </button>
                </div>
            </div>

            {/* Form Main Container */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2">
                        <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Informasi Pembayaran & Tagihan Referensi</span>
                    </h3>

                    {/* Step 1: Select Invoice */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Pilih Invoice Tagihan Klien *
                        </label>
                        <SearchableSelect
                            options={invoices.map((inv) => {
                                const remaining = Math.max(0, (inv.grand_total || 0) - (inv.paid_amount || 0));
                                const clientName = inv.client?.company_name || inv.client?.name || 'Klien';
                                return {
                                    value: inv.id,
                                    label: `${inv.invoice_number} - ${clientName}`,
                                    code: inv.status,
                                    sublabel: `Sisa: ${formatRp(remaining)}`,
                                };
                            })}
                            value={form.invoice_id}
                            onChange={(val) => handleInvoiceChange(val)}
                            placeholder="Cari & Pilih Invoice Tagihan..."
                            required
                        />
                    </div>

                    {/* Step 1.5: Select Project (Optional) */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <FolderKanban className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Pilih Project Terhubung (Opsional)</span>
                        </label>
                        <SearchableSelect
                            options={[
                                { value: '', label: '-- Otomatis Mengikuti Project dari Invoice / Umum --' },
                                ...projects.map(p => ({
                                    value: p.id,
                                    label: p.name,
                                    code: p.code,
                                }))
                            ]}
                            value={form.project_id}
                            onChange={(val) => setForm({ ...form, project_id: val })}
                            placeholder="Cari & Pilih Project..."
                        />
                    </div>

                    {/* Selected Invoice Details Card */}
                    {selectedInvoice && (
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                            <div className="flex items-center justify-between text-xs border-b border-slate-200 dark:border-slate-800 pb-2">
                                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                    <Building2 className="w-4 h-4 text-blue-500" />
                                    {selectedInvoice.client?.company_name || selectedInvoice.client?.name}
                                </span>
                                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded border border-blue-500/20">
                                    #{selectedInvoice.invoice_number}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                <div>
                                    <span className="text-[11px] text-slate-400 block">Total Tagihan:</span>
                                    <span className="font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                                        {formatRp(selectedInvoice.grand_total)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[11px] text-slate-400 block">Sudah Dibayar:</span>
                                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                                        {formatRp(selectedInvoice.paid_amount)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[11px] text-slate-400 block">Sisa Tagihan:</span>
                                    <span className={`font-extrabold font-mono ${remainingBalance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                        {formatRp(remainingBalance)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Payment Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {/* Tanggal Pembayaran */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Tanggal Pembayaran *
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    required
                                    value={form.payment_date}
                                    onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
                                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                        </div>

                        {/* Metode Pembayaran */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Metode Pembayaran *
                            </label>
                            <SearchableSelect
                                options={paymentMethods.map(pm => ({
                                    value: pm.id,
                                    label: pm.name,
                                    code: pm.code,
                                }))}
                                value={form.payment_method_id}
                                onChange={(val) => setForm({ ...form, payment_method_id: val })}
                                placeholder="Cari & Pilih Metode Pembayaran..."
                                required
                            />
                        </div>
                    </div>

                    {/* Step 3: Nominal Amount & Reference */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Jumlah Pembayaran */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Jumlah Uang Diterima (Rp) *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-extrabold text-xs text-slate-400">Rp</span>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    step="any"
                                    placeholder="0"
                                    value={form.amount}
                                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-bold font-mono focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                        </div>

                        {/* Nomor Referensi / Bukti */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                No. Referensi / Bukti Transfer (Opsional)
                            </label>
                            <input
                                type="text"
                                placeholder="ex: TRX-98210398 / BCA-1920"
                                value={form.reference_number}
                                onChange={(e) => setForm({ ...form, reference_number: e.target.value })}
                                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Terbilang Preview */}
                    {form.amount && parseFloat(form.amount) > 0 && (
                        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                Terbilang Uang Masuk:
                            </div>
                            <div className="font-semibold italic text-emerald-800 dark:text-emerald-300">
                                &ldquo;{terbilang(parseFloat(form.amount))}&rdquo;
                            </div>
                        </div>
                    )}

                    {/* Catatan / Notes */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Catatan Pembayaran (Opsional)
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Catatan tambahan untuk kwitansi (misal: Pembayaran Termin 1 / Lunas)..."
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                        />
                    </div>

                    {/* Upload Proof File Section */}
                    <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-2">
                        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                            Upload Scan / Foto Bukti Transfer &amp; Kwitansi TTD (Opsional)
                        </label>

                        {existingProofUrl && !proofFile && (
                            <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                                    <FileCheck className="w-4 h-4" /> File Scan Tersimpan
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

                    {/* Jenis Signature Kwitansi */}
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                            Jenis Tanda Tangan Kwitansi
                        </label>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                            Kosongkan untuk mengikuti pengaturan default perusahaan.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {[
                                { value: '', label: 'Default Perusahaan', desc: 'Ikuti pengaturan Settings', icon: '🏢' },
                                { value: 'QR_CODE', label: 'QR Code', desc: 'Scan untuk verifikasi digital', icon: '📱' },
                                { value: 'IMAGE', label: 'Stempel / Gambar', desc: 'Tanda tangan & stempel scan', icon: '🖼️' },
                                { value: 'MANUAL', label: 'Tanda Tangan Basah', desc: 'Ruang TTD manual', icon: '✍️' },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setForm({ ...form, signature_type: opt.value })}
                                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                                        form.signature_type === opt.value
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-sm'
                                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                                    }`}
                                >
                                    <span className="text-lg leading-none mt-0.5">{opt.icon}</span>
                                    <div>
                                        <div className={`text-xs font-bold ${form.signature_type === opt.value ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                            {opt.label}
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Form Action Footer */}
                <div className="flex items-center justify-end space-x-3 pt-2">
                    <Link
                        to="/payments"
                        className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center space-x-2 transition-all disabled:opacity-60"
                    >
                        {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{isEdit ? 'Simpan Perubahan' : 'Simpan Pembayaran'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
