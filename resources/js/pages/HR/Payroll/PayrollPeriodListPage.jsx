import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../api/axios';
import { useConfirm } from '../../../context/ConfirmContext';
import { useAuth } from '../../../context/AuthContext';
import SearchableSelect from '../../../components/SearchableSelect';
import {
    Banknote,
    Plus,
    Search,
    RefreshCw,
    Calendar,
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronRight,
    Trash2,
    Calculator,
    Check,
    CreditCard,
    DollarSign,
    FileSpreadsheet,
    Users,
    ArrowRight
} from 'lucide-react';

export default function PayrollPeriodListPage() {
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const { user } = useAuth();

    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
    const [monthFilter, setMonthFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);

    // Modal Create
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createForm, setCreateForm] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        start_date: '',
        end_date: '',
        payment_date: '',
        period_name: '',
        notes: '',
        auto_calculate: true,
    });

    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const formatRp = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID');

    const fetchPeriods = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                search: searchTerm,
                year: yearFilter,
                month: monthFilter,
                status: statusFilter,
            };
            const res = await api.get('/hr/payroll-periods', { params });
            const data = res.data.data;
            setPeriods(data.data || []);
            setLastPage(data.last_page || 1);
            setTotal(data.total || 0);
        } catch (err) {
            console.error('Error fetching payroll periods:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPeriods();
    }, [currentPage, yearFilter, monthFilter, statusFilter]);

    // Handle Cutoff Dates Calculation for Create Modal
    const handleOpenCreateModal = () => {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        // Calculate default cutoff: 21 of prev month to 20 of current month
        let prevMonth = currentMonth - 1;
        let prevYear = currentYear;
        if (prevMonth === 0) {
            prevMonth = 12;
            prevYear = currentYear - 1;
        }

        const startStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-21`;
        const endStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-20`;
        const payStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-25`;

        setCreateForm({
            month: currentMonth,
            year: currentYear,
            start_date: startStr,
            end_date: endStr,
            payment_date: payStr,
            period_name: `Gaji Periode ${monthNames[currentMonth - 1]} ${currentYear}`,
            notes: '',
            auto_calculate: true,
        });
        setShowCreateModal(true);
    };

    const handleMonthYearChange = (newMonth, newYear) => {
        const m = parseInt(newMonth, 10);
        const y = parseInt(newYear, 10);

        let prevM = m - 1;
        let prevY = y;
        if (prevM === 0) {
            prevM = 12;
            prevY = y - 1;
        }

        const startStr = `${prevY}-${String(prevM).padStart(2, '0')}-21`;
        const endStr = `${y}-${String(m).padStart(2, '0')}-20`;
        const payStr = `${y}-${String(m).padStart(2, '0')}-25`;

        setCreateForm({
            ...createForm,
            month: m,
            year: y,
            start_date: startStr,
            end_date: endStr,
            payment_date: payStr,
            period_name: `Gaji Periode ${monthNames[m - 1]} ${y}`,
        });
    };

    const handleCreatePeriod = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const res = await api.post('/hr/payroll-periods', createForm);
            setShowCreateModal(false);
            fetchPeriods();
            // Redirect to detail sheet
            if (res.data?.data?.id) {
                navigate(`/hr/payroll/${res.data.data.id}`);
            }
        } catch (err) {
            alert('Gagal membuat periode penggajian: ' + (err.response?.data?.message || err.message));
        } finally {
            setCreating(false);
        }
    };

    const handleDeletePeriod = async (period) => {
        const ok = await confirm({
            title: 'Hapus Periode Penggajian',
            message: `Hapus periode "${period.period_name}" beserta seluruh draf slip gaji di dalamnya? Tindakan ini tidak dapat dibatalkan.`,
            confirmText: 'Ya, Hapus Periode',
            type: 'danger',
        });
        if (!ok) return;

        try {
            await api.delete(`/hr/payroll-periods/${period.id}`);
            fetchPeriods();
        } catch (err) {
            alert('Gagal menghapus periode: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleRecalculate = async (periodId) => {
        try {
            await api.post(`/hr/payroll-periods/${periodId}/calculate`);
            fetchPeriods();
        } catch (err) {
            alert('Gagal menghitung ulang: ' + (err.response?.data?.message || err.message));
        }
    };

    const statusBadge = (status) => {
        switch (status) {
            case 'PAID':
                return (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>DIBAYAR (PAID)</span>
                    </span>
                );
            case 'APPROVED':
                return (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                        <Check className="w-3 h-3" />
                        <span>DISETUJUI (APPROVED)</span>
                    </span>
                );
            case 'CALCULATED':
                return (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                        <Calculator className="w-3 h-3" />
                        <span>TERHITUNG (CALCULATED)</span>
                    </span>
                );
            case 'CANCELLED':
                return (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase tracking-wider">
                        <AlertCircle className="w-3 h-3" />
                        <span>DIBATALKAN</span>
                    </span>
                );
            default: // DRAFT
                return (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 uppercase tracking-wider">
                        <Clock className="w-3 h-3" />
                        <span>DRAFT</span>
                    </span>
                );
        }
    };

    // Calculate sum statistics
    const totalNetExpense = periods.reduce((sum, p) => sum + (p.total_net_amount || 0), 0);
    const paidPeriodsCount = periods.filter(p => p.status === 'PAID').length;

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-sm">
                            <Banknote className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                                Penggajian Karyawan (Payroll)
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Kelola siklus penggajian bulanan, kalkulasi otomatis presensi & tunjangan, approval, dan penerbitan slip gaji resmi.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2.5">
                    <button
                        onClick={fetchPeriods}
                        className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 shadow-sm transition-colors"
                        title="Segarkan Data"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={handleOpenCreateModal}
                        className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all hover:shadow-lg hover:shadow-blue-600/30"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Buat Periode Gaji Baru</span>
                    </button>
                </div>
            </div>

            {/* Metric Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Periode Tercatat</span>
                        <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{total} Batch</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                        <Calendar className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Gaji Bersih Periode Ditampilkan</span>
                        <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatRp(totalNetExpense)}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <DollarSign className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Periode Selesai Dibayar</span>
                        <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{paidPeriodsCount} Periode</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Akses Portal Karyawan</span>
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Slip Gaji Digital Aktif</div>
                        <Link to="/hr/my-payslips" className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1">
                            <span>Buka Portal Saya</span>
                            <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                        <FileSpreadsheet className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchPeriods()}
                        placeholder="Cari nama periode penggajian..."
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <div className="min-w-[130px]">
                        <SearchableSelect
                            options={[
                                { value: '', label: 'Semua Tahun' },
                                { value: '2026', label: '2026' },
                                { value: '2025', label: '2025' },
                                { value: '2024', label: '2024' },
                            ]}
                            value={yearFilter}
                            onChange={(val) => setYearFilter(val)}
                            placeholder="Semua Tahun..."
                        />
                    </div>

                    <div className="min-w-[140px]">
                        <SearchableSelect
                            options={[
                                { value: '', label: 'Semua Bulan' },
                                ...monthNames.map((m, idx) => ({ value: idx + 1, label: m }))
                            ]}
                            value={monthFilter}
                            onChange={(val) => setMonthFilter(val)}
                            placeholder="Semua Bulan..."
                        />
                    </div>

                    <div className="min-w-[150px]">
                        <SearchableSelect
                            options={[
                                { value: '', label: 'Semua Status' },
                                { value: 'DRAFT', label: 'DRAFT' },
                                { value: 'CALCULATED', label: 'TERHITUNG (CALCULATED)' },
                                { value: 'APPROVED', label: 'DISETUJUI (APPROVED)' },
                                { value: 'PAID', label: 'DIBAYAR (PAID)' },
                            ]}
                            value={statusFilter}
                            onChange={(val) => setStatusFilter(val)}
                            placeholder="Semua Status..."
                        />
                    </div>
                </div>
            </div>

            {/* List / Table of Periods */}
            <div className="rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                                <th className="px-4 py-3.5">Periode Penggajian</th>
                                <th className="px-4 py-3.5">Rentang Cutoff</th>
                                <th className="px-4 py-3.5">Karyawan</th>
                                <th className="px-4 py-3.5">Total Gaji Pokok</th>
                                <th className="px-4 py-3.5">Tunjangan & Klaim</th>
                                <th className="px-4 py-3.5">Potongan</th>
                                <th className="px-4 py-3.5">Total Take Home Pay</th>
                                <th className="px-4 py-3.5">Status</th>
                                <th className="px-4 py-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="px-4 py-12 text-center text-slate-400">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                                        <span>Memuat daftar periode penggajian...</span>
                                    </td>
                                </tr>
                            ) : periods.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-4 py-12 text-center text-slate-400">
                                        <Banknote className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                                        <div className="font-semibold text-slate-600 dark:text-slate-400 text-sm">Belum ada periode penggajian</div>
                                        <p className="text-xs text-slate-400 mt-1">Klik tombol "Buat Periode Gaji Baru" untuk memulai siklus penggajian pertama.</p>
                                    </td>
                                </tr>
                            ) : (
                                periods.map((period) => (
                                    <tr 
                                        key={period.id}
                                        className="hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-colors group cursor-pointer"
                                        onClick={() => navigate(`/hr/payroll/${period.id}`)}
                                    >
                                        <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-slate-100">
                                            <div className="flex items-center space-x-2">
                                                <span>{period.period_name}</span>
                                            </div>
                                            <div className="text-[10px] font-normal text-slate-400">
                                                Bulan: {monthNames[period.month - 1]} {period.year}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                            <div>{period.start_date} s/d {period.end_date}</div>
                                            {period.payment_date && (
                                                <div className="text-[10px] text-blue-600 dark:text-blue-400">
                                                    Bayar: {period.payment_date}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px]">
                                                <Users className="w-3 h-3 text-slate-400" />
                                                <span>{period.total_employees || 0} orang</span>
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300">
                                            {formatRp(period.total_basic_salary)}
                                        </td>
                                        <td className="px-4 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">
                                            +{formatRp((period.total_allowances_amount || 0) + (period.total_reimbursements_amount || 0))}
                                        </td>
                                        <td className="px-4 py-3.5 font-semibold text-rose-600 dark:text-rose-400">
                                            -{formatRp(period.total_deductions_amount)}
                                        </td>
                                        <td className="px-4 py-3.5 font-black text-slate-900 dark:text-slate-100 text-sm">
                                            {formatRp(period.total_net_amount)}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {statusBadge(period.status)}
                                        </td>
                                        <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end space-x-1.5">
                                                <button
                                                    onClick={() => navigate(`/hr/payroll/${period.id}`)}
                                                    className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 text-xs font-semibold flex items-center space-x-1 transition-colors"
                                                >
                                                    <span>Lembar Gaji</span>
                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                </button>
                                                {['DRAFT', 'CANCELLED'].includes(period.status) && (
                                                    <button
                                                        onClick={() => handleDeletePeriod(period)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                                                        title="Hapus Periode"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Create Payroll Period */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
                    <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden">
                        
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                                    <Plus className="w-4 h-4" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                    Buat Periode Penggajian Baru
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleCreatePeriod} className="p-6 space-y-4 text-xs">
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Bulan Gaji
                                    </label>
                                    <SearchableSelect
                                        options={monthNames.map((m, idx) => ({ value: idx + 1, label: m }))}
                                        value={createForm.month}
                                        onChange={(val) => handleMonthYearChange(val, createForm.year)}
                                        placeholder="Pilih Bulan..."
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Tahun
                                    </label>
                                    <input
                                        type="number"
                                        value={createForm.year}
                                        onChange={(e) => handleMonthYearChange(createForm.month, e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Nama Periode (Label)
                                </label>
                                <input
                                    type="text"
                                    value={createForm.period_name}
                                    onChange={(e) => setCreateForm({ ...createForm, period_name: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        Awal Cutoff Absensi
                                    </label>
                                    <input
                                        type="date"
                                        value={createForm.start_date}
                                        onChange={(e) => setCreateForm({ ...createForm, start_date: e.target.value })}
                                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        Akhir Cutoff Absensi
                                    </label>
                                    <input
                                        type="date"
                                        value={createForm.end_date}
                                        onChange={(e) => setCreateForm({ ...createForm, end_date: e.target.value })}
                                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Tanggal Rencana Pembayaran Gaji
                                </label>
                                <input
                                    type="date"
                                    value={createForm.payment_date}
                                    onChange={(e) => setCreateForm({ ...createForm, payment_date: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                />
                            </div>

                            <div>
                                <label className="flex items-center space-x-2.5 cursor-pointer p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                                    <input
                                        type="checkbox"
                                        checked={createForm.auto_calculate}
                                        onChange={(e) => setCreateForm({ ...createForm, auto_calculate: e.target.checked })}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                    />
                                    <div>
                                        <span className="font-bold text-slate-900 dark:text-slate-100 block">Kalkulasi Otomatis Seketika</span>
                                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                            Sistem langsung menarik presensi, gaji pokok, tunjangan kehadiran, potongan keterlambatan/alpa, dan klaim reimbursement.
                                        </span>
                                    </div>
                                </label>
                            </div>

                            <div className="flex justify-end space-x-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 flex items-center space-x-1.5"
                                >
                                    {creating ? (
                                        <>
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                            <span>Mengkalkulasi & Menyimpan...</span>
                                        </>
                                    ) : (
                                        <span>Proses Buat Periode</span>
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
