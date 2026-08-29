import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useConfirm } from '../../context/ConfirmContext';
import SearchableSelect from '../../components/SearchableSelect';
import {
    Truck,
    ArrowLeft,
    Printer,
    Edit,
    Trash2,
    CheckCircle2,
    Calendar,
    Building2,
    UserCheck,
    Navigation,
    Package,
    FileText,
    ExternalLink,
    Clock,
    RefreshCw,
    FileCheck,
    UploadCloud,
    X,
    Eye,
    AlertCircle
} from 'lucide-react';

export default function DeliveryOrderDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { confirm } = useConfirm();

    const [deliveryOrder, setDeliveryOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDetail = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/delivery-orders/${id}`);
            if (res.data?.status === 'success') {
                setDeliveryOrder(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch delivery order detail:', err);
            setError('Surat Jalan tidak ditemukan.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const [showProofModal, setShowProofModal] = useState(false);
    const [proofFile, setProofFile] = useState(null);
    const [uploadingProof, setUploadingProof] = useState(false);
    const [proofError, setProofError] = useState(null);

    const handleStatusChange = async (newStatus) => {
        if (newStatus === 'DELIVERED' && !deliveryOrder?.proof_file_path) {
            setShowProofModal(true);
            setProofError(null);
            return;
        }
        try {
            await api.put(`/delivery-orders/${id}/status`, { status: newStatus });
            fetchDetail();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal mengubah status.');
        }
    };

    const handleUploadProofSubmit = async (e) => {
        e.preventDefault();
        if (!proofFile) {
            setProofError('Silakan pilih file scan/foto Surat Jalan TTD terlebih dahulu.');
            return;
        }
        try {
            setUploadingProof(true);
            setProofError(null);

            const formData = new FormData();
            formData.append('proof_file', proofFile);
            formData.append('set_delivered', '1');

            await api.post(`/delivery-orders/${id}/upload-proof`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setShowProofModal(false);
            setProofFile(null);
            fetchDetail();
        } catch (err) {
            setProofError(err.response?.data?.message || 'Gagal mengunggah file bukti TTD.');
        } finally {
            setUploadingProof(false);
        }
    };

    const handleDelete = async () => {
        if (!deliveryOrder) return;
        const isConfirmed = await confirm({
            title: 'Hapus Surat Jalan',
            message: `Apakah Anda yakin ingin menghapus Surat Jalan ${deliveryOrder.do_number}? Tindakan ini tidak dapat dibatalkan.`,
            confirmText: 'Ya, Hapus',
            type: 'danger',
        });

        if (!isConfirmed) return;

        try {
            await api.delete(`/delivery-orders/${id}`);
            navigate('/delivery-orders');
        } catch (err) {
            console.error('Failed to delete delivery order:', err);
        }
    };

    const pdfUrl = deliveryOrder?.public_token
        ? `/api/v1/portal/delivery-orders/${deliveryOrder.public_token}/pdf`
        : `/api/v1/delivery-orders/${id}/pdf`;

    const handlePrintPdf = () => {
        window.open(pdfUrl, '_blank');
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'DELIVERED':
                return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            case 'IN_TRANSIT':
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
            case 'PENDING_SHIPMENT':
                return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
            case 'CANCELLED':
                return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
            case 'DRAFT':
            default:
                return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
        }
    };

    if (loading) {
        return (
            <div className="p-12 text-center text-slate-400">
                <Truck className="w-8 h-8 animate-bounce mx-auto text-blue-500 mb-2" />
                <span>Memuat rincian Surat Jalan...</span>
            </div>
        );
    }

    if (error || !deliveryOrder) {
        return (
            <div className="p-8 max-w-lg mx-auto text-center space-y-4 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
                <p className="font-bold text-rose-500">{error || 'Data tidak ditemukan.'}</p>
                <Link to="/delivery-orders" className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs">
                    Kembali ke Daftar Surat Jalan
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center space-x-3.5">
                    <Link
                        to="/delivery-orders"
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center space-x-2">
                            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                                {deliveryOrder.do_number}
                            </h1>
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold border ${getStatusBadge(deliveryOrder.status)}`}>
                                {deliveryOrder.status}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Tanggal Pengiriman: <strong>{new Date(deliveryOrder.do_date + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                    <button
                        onClick={handlePrintPdf}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center space-x-1.5 transition-colors"
                    >
                        <Printer className="w-4 h-4" />
                        <span>Cetak PDF Surat Jalan</span>
                    </button>

                    <Link
                        to={`/delivery-orders/${id}/edit`}
                        className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center space-x-1.5 transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                    </Link>

                    <button
                        onClick={handleDelete}
                        className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
                        title="Hapus Surat Jalan"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Quick Status Update Bar */}
            <div className="p-4 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Status Pengiriman Barang:</span>
                <div className="flex flex-wrap items-center gap-2">
                    {['DRAFT', 'PENDING_SHIPMENT', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'].map((st) => (
                        <button
                            key={st}
                            onClick={() => handleStatusChange(st)}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-colors ${
                                deliveryOrder.status === st
                                    ? getStatusBadge(st) + ' ring-2 ring-blue-500'
                                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100'
                            }`}
                        >
                            {st}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Split Grid: Summary Details + Live PDF Viewer */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Side: Summary Details */}
                <div className="space-y-6">
                    {/* Destination & Logistics Info */}
                    <div className="p-6 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-500" /> Tujuan Pengiriman &amp; Ekspedisi
                        </h3>

                        <div className="space-y-2 text-xs">
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold block uppercase">Klien Penerima</span>
                                <strong className="text-slate-900 dark:text-slate-100 text-sm">
                                    {deliveryOrder.client?.company_name || deliveryOrder.client?.name || 'Klien'}
                                </strong>
                            </div>

                            <div>
                                <span className="text-[10px] text-slate-400 font-bold block uppercase">Alamat Pengiriman (Tujuan)</span>
                                <p className="text-slate-700 dark:text-slate-300 font-medium whitespace-pre-line bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                                    {deliveryOrder.shipping_address}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold block uppercase">UP / Penerima</span>
                                    <span className="font-bold text-slate-900 dark:text-slate-100">
                                        {deliveryOrder.recipient_name || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold block uppercase">No. Telepon Penerima</span>
                                    <span className="font-mono text-slate-900 dark:text-slate-100">
                                        {deliveryOrder.recipient_phone || '-'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Jasa Ekspedisi</span>
                                    <span className="font-bold text-blue-600 dark:text-blue-400">
                                        {deliveryOrder.expedition_name || 'Kurir Internal'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Nama Sopir / Driver</span>
                                    <span className="font-bold text-slate-900 dark:text-slate-100">
                                        {deliveryOrder.driver_name || '-'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold block uppercase">No. Plat Kendaraan</span>
                                    <span className="font-bold text-slate-900 dark:text-slate-100">
                                        {deliveryOrder.vehicle_number || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold block uppercase">No. Resi / Tracking</span>
                                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                                        {deliveryOrder.tracking_number || '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="p-6 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2">
                            <Package className="w-4 h-4 text-purple-500" /> Daftar Barang Dikirim
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold text-slate-500 uppercase">
                                        <th className="py-2 px-3">#</th>
                                        <th className="py-2 px-3">Nama Barang</th>
                                        <th className="py-2 px-3">Deskripsi</th>
                                        <th className="py-2 px-3 text-center">Satuan</th>
                                        <th className="py-2 px-3 text-center">Qty</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {deliveryOrder.items && deliveryOrder.items.map((item, idx) => (
                                        <tr key={item.id || idx}>
                                            <td className="py-2.5 px-3 font-bold text-slate-400">{idx + 1}</td>
                                            <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                                                {item.item_name}
                                                {item.notes && <span className="block text-[10px] text-slate-400 font-normal">({item.notes})</span>}
                                            </td>
                                            <td className="py-2.5 px-3 text-slate-500">{item.description || '-'}</td>
                                            <td className="py-2.5 px-3 text-center">{item.unit || 'Pcs'}</td>
                                            <td className="py-2.5 px-3 text-center font-extrabold text-blue-600 dark:text-blue-400">
                                                {Number(item.quantity).toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Proof Card */}
                    <div className="p-6 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <FileCheck className="w-4 h-4 text-emerald-500" /> Bukti Surat Jalan Ber-TTD (Scan / Foto)
                            </span>
                            {deliveryOrder.proof_file_url && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    TERVERIFIKASI TTD
                                </span>
                            )}
                        </h3>

                        {deliveryOrder.proof_file_url ? (
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                                        <FileCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                            Scan DO Ber-TTD Tersedia
                                        </h4>
                                        <p className="text-[10px] text-slate-500">
                                            Dokumen serah terima fisik yang ditandatangani penerima telah diunggah.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 shrink-0">
                                    <a
                                        href={deliveryOrder.proof_file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1 transition-colors"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>Lihat File</span>
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowProofModal(true);
                                            setProofError(null);
                                        }}
                                        className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 transition-colors"
                                    >
                                        Ganti
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                                            Bukti Scan TTD Belum Diunggah
                                        </h4>
                                        <p className="text-[10px] text-amber-700 dark:text-amber-400">
                                            Wajib mengunggah scan/foto Surat Jalan TTD untuk menyelesaikan pengiriman.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowProofModal(true);
                                        setProofError(null);
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center space-x-1 transition-colors shrink-0"
                                >
                                    <UploadCloud className="w-3.5 h-3.5" />
                                    <span>Upload Scan TTD</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Live PDF Stream Preview */}
                <div className="p-6 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col h-full min-h-[600px]">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <Printer className="w-4 h-4 text-blue-500" /> Pratinjau Cetak PDF Surat Jalan
                        </h3>
                        <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                        >
                            <span>Buka Jendela Baru</span>
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>

                    <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative">
                        <iframe
                            src={pdfUrl}
                            title="Pratinjau Surat Jalan PDF"
                            className="w-full h-full min-h-[550px]"
                        />
                    </div>
                </div>
            </div>

            {/* Modal Upload Bukti TTD */}
            {showProofModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4 relative">
                        <button
                            onClick={() => {
                                setShowProofModal(false);
                                setProofFile(null);
                            }}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold">
                                <FileCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                                    Upload Bukti Scan DO TTD
                                </h3>
                                <p className="text-xs text-slate-500">
                                    No. DO: <strong>{deliveryOrder.do_number}</strong>
                                </p>
                            </div>
                        </div>

                        {proofError && (
                            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{proofError}</span>
                            </div>
                        )}

                        <form onSubmit={handleUploadProofSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Pilih File Scan / Foto Surat Jalan (PDF, JPG, PNG) *
                                </label>
                                <input
                                    type="file"
                                    required
                                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                                    onChange={(e) => setProofFile(e.target.files[0])}
                                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 dark:file:bg-purple-950/50 dark:file:text-purple-400 hover:file:bg-purple-100 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 p-1"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">
                                    Wajib diunggah sebelum status Surat Jalan diubah menjadi <strong>SELESAI TERKIRIM (DELIVERED)</strong>. Max 10MB.
                                </p>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowProofModal(false);
                                        setProofFile(null);
                                    }}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploadingProof}
                                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 disabled:opacity-50"
                                >
                                    {uploadingProof ? (
                                        <span>Mengunggah...</span>
                                    ) : (
                                        <>
                                            <UploadCloud className="w-4 h-4" />
                                            <span>Upload &amp; Set Terkirim</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
