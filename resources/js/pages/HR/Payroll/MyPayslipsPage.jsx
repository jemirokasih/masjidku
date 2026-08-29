import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { openPdfPreview } from '../../../utils/pdfPreview';
import { useAuth } from '../../../context/AuthContext';
import SearchableSelect from '../../../components/SearchableSelect';
import PayslipPreviewModal from './PayslipPreviewModal';
import {
    FileSpreadsheet,
    Download,
    Eye,
    Calendar,
    DollarSign,
    CheckCircle2,
    Clock,
    RefreshCw,
    Building2,
    User,
    CreditCard,
    ArrowDownRight,
    ArrowUpRight,
    Banknote,
    FileText
} from 'lucide-react';

export default function MyPayslipsPage() {
    const { user } = useAuth();
    const [employee, setEmployee] = useState(null);
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
    const [selectedPayslip, setSelectedPayslip] = useState(null);

    const formatRp = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID');

    const fetchMyPayslips = async () => {
        setLoading(true);
        try {
            const res = await api.get('/hr/my-payslips', {
                params: { year: yearFilter }
            });
            setEmployee(res.data.data?.employee || null);
            setPayslips(res.data.data?.payslips || []);
        } catch (err) {
            console.error('Error fetching my payslips:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyPayslips();
    }, [yearFilter]);

    const handleDownloadPdf = (payslipId) => {
        openPdfPreview(`/hr/payslips/${payslipId}/pdf`);
    };

    const latestPayslip = payslips.length > 0 ? payslips[0] : null;

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in font-sans">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shadow-sm">
                        <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                            Slip Gaji Saya (My Payslips)
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Portal mandiri karyawan untuk melihat riwayat penerimaan gaji, rincian tunjangan/potongan, dan mengunduh file slip gaji resmi berformat PDF.
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2 min-w-[140px]">
                    <SearchableSelect
                        options={[
                            { value: '2026', label: 'Tahun 2026' },
                            { value: '2025', label: 'Tahun 2025' },
                            { value: '2024', label: 'Tahun 2024' },
                        ]}
                        value={yearFilter}
                        onChange={(val) => setYearFilter(val)}
                        placeholder="Pilih Tahun..."
                    />

                    <button
                        onClick={fetchMyPayslips}
                        className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 shadow-sm transition-colors"
                        title="Segarkan Data"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Employee Profile Info Card */}
            {employee && (
                <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-indigo-600/20">
                            {employee.full_name ? employee.full_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center space-x-2">
                                <span>{employee.full_name}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold">
                                    {employee.employment_status || 'Karyawan'}
                                </span>
                            </div>
                            <div className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
                                <span>{employee.position || 'Staff'}</span>
                                <span>•</span>
                                <span>{employee.department || 'Operasional'}</span>
                                <span>•</span>
                                <span>NIK: {employee.nik || employee.employee_code || '-'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800/80">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Rekening Payroll</span>
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                            {employee.bank_name || 'BCA'} • {employee.bank_account_number || '-'}
                        </div>
                        <div className="text-[10px] text-slate-500">a/n {employee.bank_account_holder || employee.full_name}</div>
                    </div>
                </div>
            )}

            {/* Latest Payslip Spotlight Card (If Available) */}
            {latestPayslip && (
                <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl shadow-indigo-950/30 border border-indigo-900/40 relative overflow-hidden">
                    
                    {/* Background subtle decoration */}
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider border border-indigo-500/30">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>SLIP GAJI TERBARU • {latestPayslip.period?.period_name}</span>
                            </div>
                            <div>
                                <span className="text-xs text-indigo-200/80 block font-medium">Gaji Bersih Diterima (Take Home Pay)</span>
                                <div className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-1">
                                    {formatRp(latestPayslip.net_salary)}
                                </div>
                            </div>
                            <p className="text-xs text-slate-300 flex items-center space-x-2">
                                <span>No: <strong>{latestPayslip.payslip_number || 'RESMI'}</strong></span>
                                <span>•</span>
                                <span>Tanggal Terbit: <strong>{latestPayslip.payment_date || '-'}</strong></span>
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={() => setSelectedPayslip(latestPayslip)}
                                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center space-x-2 border border-white/10"
                            >
                                <Eye className="w-4 h-4" />
                                <span>Lihat Rincian</span>
                            </button>
                            <button
                                onClick={() => handleDownloadPdf(latestPayslip.id)}
                                className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-colors flex items-center space-x-2 shadow-lg shadow-indigo-500/30"
                            >
                                <Download className="w-4 h-4" />
                                <span>Download PDF Slip Gaji</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* List / History of Payslips */}
            <div className="rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-5">
                
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                            Riwayat Slip Gaji ({payslips.length})
                        </h3>
                        <p className="text-xs text-slate-500">Daftar arsip slip gaji bulanan yang telah diterbitkan dan disahkan.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                        <span>Memuat arsip slip gaji...</span>
                    </div>
                ) : payslips.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                        <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                        <div className="font-semibold text-slate-600 dark:text-slate-400 text-sm">Belum ada slip gaji diterbitkan pada tahun {yearFilter}</div>
                        <p className="text-xs text-slate-400 mt-1">Slip gaji akan muncul otomatis di sini setelah disahkan dan diterbitkan oleh HR/Finance.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {payslips.map((p) => {
                            const att = p.attendance_summary || {};
                            return (
                                <div key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-900/40 p-3 rounded-xl transition-colors">
                                    
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                                                {p.period?.period_name}
                                            </span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 uppercase">
                                                {p.payment_status === 'PAID' ? 'LUNAS (PAID)' : 'DISAHKAN'}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                                            <span>No: <strong className="text-indigo-600 dark:text-indigo-400">{p.payslip_number || '-'}</strong></span>
                                            <span>•</span>
                                            <span>Tanggal: {p.payment_date || '-'}</span>
                                            <span>•</span>
                                            <span>Presensi: {att.present_days || 0} Hadir, {att.late_days || 0} Telat, {att.absent_days || 0} Alpa</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end space-x-4">
                                        <div className="text-right">
                                            <span className="text-[10px] text-slate-400 block uppercase font-medium">Gaji Bersih</span>
                                            <div className="font-black text-slate-900 dark:text-slate-100 text-base">
                                                {formatRp(p.net_salary)}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-1.5">
                                            <button
                                                onClick={() => setSelectedPayslip(p)}
                                                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center space-x-1 transition-colors shadow-sm"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Rincian</span>
                                            </button>

                                            <button
                                                onClick={() => handleDownloadPdf(p.id)}
                                                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm shadow-indigo-600/20"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                <span>PDF</span>
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}

            </div>

            {/* Payslip Preview Modal */}
            {selectedPayslip && (
                <PayslipPreviewModal
                    payslip={selectedPayslip}
                    period={selectedPayslip.period}
                    onClose={() => setSelectedPayslip(null)}
                    onDownload={(payslipId) => handleDownloadPdf(payslipId)}
                />
            )}

        </div>
    );
}
