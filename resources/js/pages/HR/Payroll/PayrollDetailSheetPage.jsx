import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../../api/axios';
import { openPdfPreview } from '../../../utils/pdfPreview';
import { useConfirm } from '../../../context/ConfirmContext';
import { useAuth } from '../../../context/AuthContext';
import SearchableSelect from '../../../components/SearchableSelect';
import PayslipPreviewModal from './PayslipPreviewModal';
import EmployeeSalaryComponentsModal from './EmployeeSalaryComponentsModal';
import {
    ArrowLeft,
    Banknote,
    Calculator,
    Check,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    Edit3,
    Eye,
    FileSpreadsheet,
    FileText,
    Layers,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    Users,
    X,
    AlertCircle,
    Building2,
    Briefcase
} from 'lucide-react';

export default function PayrollDetailSheetPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const { user } = useAuth();

    const [period, setPeriod] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    
    // Actions states
    const [recalculating, setRecalculating] = useState(false);
    const [approving, setApproving] = useState(false);

    // Modals
    const [selectedPayslipForPreview, setSelectedPayslipForPreview] = useState(null);
    const [selectedEmployeeForComponents, setSelectedEmployeeForComponents] = useState(null);
    const [editingPayslip, setEditingPayslip] = useState(null);
    const [editForm, setEditForm] = useState({
        basic_salary: 0,
        earnings_breakdown: [],
        deductions_breakdown: [],
        bank_name: '',
        bank_account_number: '',
        bank_account_holder: '',
        notes: '',
    });
    const [savingPayslip, setSavingPayslip] = useState(false);

    // Mark Paid Modal
    const [showPaidModal, setShowPaidModal] = useState(false);
    const [paidForm, setPaidForm] = useState({
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'BANK_TRANSFER',
        notes: '',
    });
    const [processingPayment, setProcessingPayment] = useState(false);

    const formatRp = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID');

    const fetchPeriodDetail = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/hr/payroll-periods/${id}`);
            setPeriod(res.data.data);
        } catch (err) {
            console.error('Error fetching payroll period detail:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPeriodDetail();
    }, [id]);

    const handleRecalculate = async () => {
        const ok = await confirm({
            title: 'Kalkulasi Ulang Penggajian',
            message: 'Kalkulasi ulang akan memproses ulang data presensi harian, tunjangan kehadiran, potongan keterlambatan/alpa, dan klaim reimbursement yang disetujui. Lanjutkan?',
            confirmText: 'Ya, Kalkulasi Ulang',
            type: 'info',
        });
        if (!ok) return;

        setRecalculating(true);
        try {
            await api.post(`/hr/payroll-periods/${id}/calculate`);
            fetchPeriodDetail();
        } catch (err) {
            alert('Gagal mengkalkulasi ulang: ' + (err.response?.data?.message || err.message));
        } finally {
            setRecalculating(false);
        }
    };

    const handleApprove = async () => {
        const ok = await confirm({
            title: 'Sahkan & Setujui Penggajian',
            message: `Sahkan seluruh perhitungan gaji untuk "${period.period_name}"? Setelah disahkan, slip gaji siap diterbitkan dan dibayarkan.`,
            confirmText: 'Ya, Sahkan Penggajian',
            type: 'success',
        });
        if (!ok) return;

        setApproving(true);
        try {
            await api.post(`/hr/payroll-periods/${id}/approve`);
            fetchPeriodDetail();
        } catch (err) {
            alert('Gagal mengesahkan penggajian: ' + (err.response?.data?.message || err.message));
        } finally {
            setApproving(false);
        }
    };

    const handleOpenPaidModal = () => {
        setPaidForm({
            payment_date: period?.payment_date || new Date().toISOString().split('T')[0],
            payment_method: 'BANK_TRANSFER',
            notes: 'Pembayaran gaji telah ditransfer ke rekening masing-masing karyawan.',
        });
        setShowPaidModal(true);
    };

    const handleProcessPayment = async (e) => {
        e.preventDefault();
        setProcessingPayment(true);
        try {
            await api.post(`/hr/payroll-periods/${id}/pay`, paidForm);
            setShowPaidModal(false);
            fetchPeriodDetail();
        } catch (err) {
            alert('Gagal memproses pembayaran: ' + (err.response?.data?.message || err.message));
        } finally {
            setProcessingPayment(false);
        }
    };

    // Open Edit Payslip Modal
    const handleOpenEditPayslip = (payslip) => {
        setEditingPayslip(payslip);
        setEditForm({
            basic_salary: payslip.basic_salary || 0,
            earnings_breakdown: JSON.parse(JSON.stringify(payslip.earnings_breakdown || [])),
            deductions_breakdown: JSON.parse(JSON.stringify(payslip.deductions_breakdown || [])),
            bank_name: payslip.bank_name || payslip.employee?.bank_name || '',
            bank_account_number: payslip.bank_account_number || payslip.employee?.bank_account_number || '',
            bank_account_holder: payslip.bank_account_holder || payslip.employee?.bank_account_holder || payslip.employee?.full_name || '',
            notes: payslip.notes || '',
        });
    };

    const handleAddEarningsItem = () => {
        setEditForm({
            ...editForm,
            earnings_breakdown: [
                ...editForm.earnings_breakdown,
                { name: 'Bonus / Insentif Kustom', amount: 0, calculation_type: 'CUSTOM_BONUS', description: '' }
            ]
        });
    };

    const handleRemoveEarningsItem = (idx) => {
        const updated = [...editForm.earnings_breakdown];
        updated.splice(idx, 1);
        setEditForm({ ...editForm, earnings_breakdown: updated });
    };

    const handleAddDeductionsItem = () => {
        setEditForm({
            ...editForm,
            deductions_breakdown: [
                ...editForm.deductions_breakdown,
                { name: 'Potongan / Kasbon Lainnya', amount: 0, calculation_type: 'CUSTOM_DEDUCTION', description: '' }
            ]
        });
    };

    const handleRemoveDeductionsItem = (idx) => {
        const updated = [...editForm.deductions_breakdown];
        updated.splice(idx, 1);
        setEditForm({ ...editForm, deductions_breakdown: updated });
    };

    const handleSavePayslipOverride = async (e) => {
        e.preventDefault();
        setSavingPayslip(true);
        try {
            await api.put(`/hr/payslips/${editingPayslip.id}`, editForm);
            setEditingPayslip(null);
            fetchPeriodDetail();
        } catch (err) {
            alert('Gagal menyimpan penyesuaian: ' + (err.response?.data?.message || err.message));
        } finally {
            setSavingPayslip(false);
        }
    };

    const handleDownloadPdf = (payslipId) => {
        openPdfPreview(`/hr/payslips/${payslipId}/pdf`);
    };

    const filteredPayslips = (period?.payslips || []).filter((p) => {
        const emp = p.employee || {};
        const matchSearch = (
            emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.employee_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.nik?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.payslip_number?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchDept = departmentFilter ? emp.department === departmentFilter : true;
        return matchSearch && matchDept;
    });

    const uniqueDepartments = Array.from(
        new Set((period?.payslips || []).map(p => p.employee?.department).filter(Boolean))
    );

    if (loading && !period) {
        return (
            <div className="p-8 max-w-7xl mx-auto text-center text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
                <p className="text-sm font-semibold">Memuat Lembar Penggajian...</p>
            </div>
        );
    }

    if (!period) {
        return (
            <div className="p-8 max-w-lg mx-auto text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Periode Tidak Ditemukan</h2>
                <Link to="/hr/payroll" className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Daftar Periode</span>
                </Link>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
            
            {/* Top Navigation & Status Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <Link
                        to="/hr/payroll"
                        className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 shadow-sm transition-colors"
                        title="Kembali ke Daftar"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <div className="flex items-center space-x-2.5">
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                                {period.period_name}
                            </h1>
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                period.status === 'PAID'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                    : period.status === 'APPROVED'
                                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                    : period.status === 'CALCULATED'
                                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                                    : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                            }`}>
                                {period.status}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Cutoff Presensi: <strong>{period.start_date} s/d {period.end_date}</strong> • Rencana Bayar: <strong>{period.payment_date || '-'}</strong>
                        </p>
                    </div>
                </div>

                {/* Main Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                    {period.status !== 'PAID' && (
                        <button
                            onClick={handleRecalculate}
                            disabled={recalculating}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-sm transition-colors"
                        >
                            <Calculator className={`w-3.5 h-3.5 text-indigo-500 ${recalculating ? 'animate-spin' : ''}`} />
                            <span>{recalculating ? 'Mengkalkulasi...' : 'Kalkulasi Ulang'}</span>
                        </button>
                    )}

                    {['CALCULATED', 'DRAFT'].includes(period.status) && (
                        <button
                            onClick={handleApprove}
                            disabled={approving}
                            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
                        >
                            <Check className="w-3.5 h-3.5" />
                            <span>{approving ? 'Mengesahkan...' : 'Sahkan (Approve)'}</span>
                        </button>
                    )}

                    {['APPROVED', 'CALCULATED'].includes(period.status) && (
                        <button
                            onClick={handleOpenPaidModal}
                            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
                        >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Bayar & Terbitkan Slip Gaji</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Aggregation Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Jumlah Karyawan</span>
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{period.total_employees || 0} Orang</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Gaji Pokok Total</span>
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatRp(period.total_basic_salary)}</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Total Tunjangan</span>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+{formatRp(period.total_allowances_amount)}</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Klaim Reimbursement</span>
                    <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">+{formatRp(period.total_reimbursements_amount)}</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Total Potongan</span>
                    <div className="text-sm font-bold text-rose-600 dark:text-rose-400">-{formatRp(period.total_deductions_amount)}</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/20">
                    <span className="text-[10px] font-bold text-indigo-100 uppercase">Total Take Home Pay</span>
                    <div className="text-base font-black">{formatRp(period.total_net_amount)}</div>
                </div>
            </div>

            {/* Filter Search within sheet */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari nama karyawan, NIK, nomor slip..."
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div className="flex items-center space-x-2 min-w-[170px]">
                    <SearchableSelect
                        options={[
                            { value: '', label: 'Semua Departemen' },
                            ...uniqueDepartments.map((dept) => ({ value: dept, label: dept }))
                        ]}
                        value={departmentFilter}
                        onChange={(val) => setDepartmentFilter(val)}
                        placeholder="Semua Departemen..."
                    />
                </div>
            </div>

            {/* Main Interactive Table */}
            <div className="rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                                <th className="px-4 py-3.5">Karyawan</th>
                                <th className="px-4 py-3.5">Rekap Kehadiran</th>
                                <th className="px-4 py-3.5">Gaji Pokok</th>
                                <th className="px-4 py-3.5">Tunjangan</th>
                                <th className="px-4 py-3.5">Reimbursement</th>
                                <th className="px-4 py-3.5">Potongan</th>
                                <th className="px-4 py-3.5">Take Home Pay</th>
                                <th className="px-4 py-3.5">No Slip</th>
                                <th className="px-4 py-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            {filteredPayslips.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-4 py-8 text-center text-slate-400">
                                        Tidak ada data karyawan yang cocok dengan pencarian.
                                    </td>
                                </tr>
                            ) : (
                                filteredPayslips.map((p) => {
                                    const emp = p.employee || {};
                                    const att = p.attendance_summary || {};
                                    return (
                                        <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-colors">
                                            
                                            {/* Employee info */}
                                            <td className="px-4 py-3.5">
                                                <div className="font-bold text-slate-900 dark:text-slate-100">{emp.full_name}</div>
                                                <div className="text-[10px] text-slate-400 flex items-center space-x-1.5">
                                                    <span>{emp.position || '-'}</span>
                                                    <span>•</span>
                                                    <span>{emp.department || '-'}</span>
                                                </div>
                                            </td>

                                            {/* Attendance mini summary */}
                                            <td className="px-4 py-3.5 text-[11px] whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold" title="Hadir">{att.present_days || 0}H</span>
                                                    <span className="text-amber-600 dark:text-amber-400 font-semibold" title="Terlambat">{att.late_days || 0}T</span>
                                                    <span className="text-blue-600 dark:text-blue-400 font-semibold" title="Cuti/Izin/Sakit">
                                                        {(att.leave_days || 0) + (att.permit_days || 0) + (att.sick_days || 0)}C
                                                    </span>
                                                    <span className="text-rose-600 dark:text-rose-400 font-bold" title="Alpa">{att.absent_days || 0}A</span>
                                                </div>
                                                <div className="text-[10px] text-slate-400">{att.total_work_hours || 0} Jam Kerja</div>
                                            </td>

                                            {/* Basic Salary */}
                                            <td className="px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                                                {formatRp(p.basic_salary)}
                                            </td>

                                            {/* Allowances */}
                                            <td className="px-4 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">
                                                +{formatRp(p.total_allowances)}
                                            </td>

                                            {/* Reimbursements */}
                                            <td className="px-4 py-3.5 font-semibold text-indigo-600 dark:text-indigo-400">
                                                +{formatRp(p.total_reimbursements)}
                                            </td>

                                            {/* Deductions */}
                                            <td className="px-4 py-3.5 font-semibold text-rose-600 dark:text-rose-400">
                                                -{formatRp(p.total_deductions)}
                                            </td>

                                            {/* Net Salary (THP) */}
                                            <td className="px-4 py-3.5 font-black text-slate-900 dark:text-slate-100 text-sm">
                                                {formatRp(p.net_salary)}
                                            </td>

                                            {/* Payslip Number */}
                                            <td className="px-4 py-3.5 text-[11px] whitespace-nowrap">
                                                {p.payslip_number ? (
                                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                                        {p.payslip_number}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic">Belum terbit</span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end space-x-1">
                                                    
                                                    {/* Master Component settings opener */}
                                                    <button
                                                        onClick={() => setSelectedEmployeeForComponents(emp)}
                                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                                                        title="Kelola Master Komponen Gaji Karyawan"
                                                    >
                                                        <Layers className="w-3.5 h-3.5" />
                                                    </button>

                                                    {/* Override adjustment button (if not paid) */}
                                                    {period.status !== 'PAID' && (
                                                        <button
                                                            onClick={() => handleOpenEditPayslip(p)}
                                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                                                            title="Edit Penyesuaian / Bonus / Potongan"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}

                                                    {/* Preview modal */}
                                                    <button
                                                        onClick={() => setSelectedPayslipForPreview(p)}
                                                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                        title="Lihat Preview Slip Gaji"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>

                                                    {/* Download PDF button */}
                                                    <button
                                                        onClick={() => handleDownloadPdf(p.id)}
                                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                                                        title="Download PDF Slip Gaji"
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                    </button>

                                                </div>
                                            </td>

                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Edit Payslip Override */}
            {editingPayslip && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
                    <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                    Penyesuaian Slip Gaji: {editingPayslip.employee?.full_name}
                                </h3>
                                <p className="text-xs text-slate-500">{period.period_name}</p>
                            </div>
                            <button
                                onClick={() => setEditingPayslip(null)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSavePayslipOverride} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
                            
                            {/* Gaji Pokok Override */}
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Gaji Pokok (Basic Salary)
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={editForm.basic_salary}
                                    onChange={(e) => setEditForm({ ...editForm, basic_salary: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                                    required
                                />
                            </div>

                            {/* Pendapatan (Earnings Breakdown) */}
                            <div className="p-3.5 rounded-xl bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-emerald-800 dark:text-emerald-400">Rincian Pendapatan (Tunjangan & Bonus)</span>
                                    <button
                                        type="button"
                                        onClick={handleAddEarningsItem}
                                        className="text-[11px] text-emerald-600 font-bold hover:underline flex items-center space-x-1"
                                    >
                                        <Plus className="w-3 h-3" />
                                        <span>+ Tambah Baris</span>
                                    </button>
                                </div>
                                
                                {editForm.earnings_breakdown.map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                        <div className="col-span-6">
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => {
                                                    const updated = [...editForm.earnings_breakdown];
                                                    updated[idx].name = e.target.value;
                                                    setEditForm({ ...editForm, earnings_breakdown: updated });
                                                }}
                                                placeholder="Nama Tunjangan / Bonus"
                                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-5">
                                            <input
                                                type="number"
                                                step="any"
                                                value={item.amount}
                                                onChange={(e) => {
                                                    const updated = [...editForm.earnings_breakdown];
                                                    updated[idx].amount = e.target.value;
                                                    setEditForm({ ...editForm, earnings_breakdown: updated });
                                                }}
                                                placeholder="Nominal"
                                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-1 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveEarningsItem(idx)}
                                                className="p-1 text-rose-500 hover:text-rose-700"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Potongan (Deductions Breakdown) */}
                            <div className="p-3.5 rounded-xl bg-rose-50/30 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-rose-800 dark:text-rose-400">Rincian Potongan (Deductions)</span>
                                    <button
                                        type="button"
                                        onClick={handleAddDeductionsItem}
                                        className="text-[11px] text-rose-600 font-bold hover:underline flex items-center space-x-1"
                                    >
                                        <Plus className="w-3 h-3" />
                                        <span>+ Tambah Baris</span>
                                    </button>
                                </div>

                                {editForm.deductions_breakdown.map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                        <div className="col-span-6">
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => {
                                                    const updated = [...editForm.deductions_breakdown];
                                                    updated[idx].name = e.target.value;
                                                    setEditForm({ ...editForm, deductions_breakdown: updated });
                                                }}
                                                placeholder="Nama Potongan (Kasbon/Penalti)"
                                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-5">
                                            <input
                                                type="number"
                                                step="any"
                                                value={item.amount}
                                                onChange={(e) => {
                                                    const updated = [...editForm.deductions_breakdown];
                                                    updated[idx].amount = e.target.value;
                                                    setEditForm({ ...editForm, deductions_breakdown: updated });
                                                }}
                                                placeholder="Nominal"
                                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold text-rose-600"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-1 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveDeductionsItem(idx)}
                                                className="p-1 text-rose-500 hover:text-rose-700"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Bank Details Override */}
                            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Nama Bank</label>
                                    <input
                                        type="text"
                                        value={editForm.bank_name}
                                        onChange={(e) => setEditForm({ ...editForm, bank_name: e.target.value })}
                                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">No Rekening</label>
                                    <input
                                        type="text"
                                        value={editForm.bank_account_number}
                                        onChange={(e) => setEditForm({ ...editForm, bank_account_number: e.target.value })}
                                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Nama Pemilik</label>
                                    <input
                                        type="text"
                                        value={editForm.bank_account_holder}
                                        onChange={(e) => setEditForm({ ...editForm, bank_account_holder: e.target.value })}
                                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Catatan Slip Gaji
                                </label>
                                <input
                                    type="text"
                                    value={editForm.notes}
                                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                    placeholder="Catatan tambahan di slip gaji..."
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setEditingPayslip(null)}
                                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingPayslip}
                                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20"
                                >
                                    {savingPayslip ? 'Menyimpan...' : 'Simpan Penyesuaian'}
                                </button>
                            </div>

                        </form>

                    </div>
                </div>
            )}

            {/* Modal Process Payment & Generate Document Numbers */}
            {showPaidModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
                    <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
                        
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                                    <Check className="w-4 h-4" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                    Finalisasi Pembayaran & Terbitkan Slip
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowPaidModal(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleProcessPayment} className="p-6 space-y-4 text-xs">
                            
                            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-1 text-emerald-800 dark:text-emerald-300">
                                <div className="font-bold text-xs">Total Gaji yang Dibayarkan:</div>
                                <div className="text-xl font-black">{formatRp(period.total_net_amount)}</div>
                                <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                                    Untuk {period.total_employees} karyawan dalam periode ini.
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Tanggal Realisasi Pembayaran
                                </label>
                                <input
                                    type="date"
                                    value={paidForm.payment_date}
                                    onChange={(e) => setPaidForm({ ...paidForm, payment_date: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Metode Pembayaran
                                </label>
                                <SearchableSelect
                                    options={[
                                        { value: 'BANK_TRANSFER', label: 'Transfer Bank (Payroll BCA/Mandiri/BRI)' },
                                        { value: 'CASH', label: 'Tunai (Kas Perusahaan)' },
                                    ]}
                                    value={paidForm.payment_method}
                                    onChange={(val) => setPaidForm({ ...paidForm, payment_method: val })}
                                    placeholder="Metode Pembayaran..."
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Catatan Pembayaran
                                </label>
                                <textarea
                                    rows="2"
                                    value={paidForm.notes}
                                    onChange={(e) => setPaidForm({ ...paidForm, notes: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowPaidModal(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processingPayment}
                                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20"
                                >
                                    {processingPayment ? 'Memproses...' : 'Konfirmasi & Terbitkan'}
                                </button>
                            </div>

                        </form>

                    </div>
                </div>
            )}

            {/* Payslip Preview Modal */}
            {selectedPayslipForPreview && (
                <PayslipPreviewModal
                    payslip={selectedPayslipForPreview}
                    period={period}
                    onClose={() => setSelectedPayslipForPreview(null)}
                    onDownload={(payslipId) => handleDownloadPdf(payslipId)}
                />
            )}

            {/* Master Salary Component Modal */}
            {selectedEmployeeForComponents && (
                <EmployeeSalaryComponentsModal
                    employee={selectedEmployeeForComponents}
                    onClose={() => setSelectedEmployeeForComponents(null)}
                    onUpdated={() => fetchPeriodDetail()}
                />
            )}

        </div>
    );
}
