import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { openPdfPreview } from '../../utils/pdfPreview';
import { useConfirm } from '../../context/ConfirmContext';
import {
    Users,
    ArrowLeft,
    Building2,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    FileText,
    RefreshCw,
    ShieldCheck,
    CreditCard,
    UserCheck,
    Award,
    Edit3,
    Banknote,
    Plus,
    Download,
    Eye,
    DollarSign,
    Building
} from 'lucide-react';
import EmployeeSalaryComponentsModal from './Payroll/EmployeeSalaryComponentsModal';
import PayslipPreviewModal from './Payroll/PayslipPreviewModal';

export default function EmployeeDetailPage() {
    const { confirm } = useConfirm();
    const { id } = useParams();
    const navigate = useNavigate();

    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'attendance' | 'leaves' | 'contracts' | 'payroll'
    const [showComponentsModal, setShowComponentsModal] = useState(false);
    const [selectedPayslipPreview, setSelectedPayslipPreview] = useState(null);

    const fetchEmployeeDetail = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/hr/employees/${id}`);
            setEmployee(res.data.data);
        } catch (err) {
            console.error('Error fetching employee detail:', err);
            alert('Gagal memuat detail karyawan.');
            navigate('/employees');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployeeDetail();
    }, [id]);

    const handleApproveLeave = async (leaveId, status) => {
        const ok = await confirm({
            title: status === 'APPROVED' ? 'Setujui Pengajuan Cuti' : 'Tolak Pengajuan Cuti',
            message: `Apakah Anda yakin ingin ${status === 'APPROVED' ? 'MENYETUJUI' : 'MENOLAK'} pengajuan cuti ini?`,
            confirmText: status === 'APPROVED' ? 'Ya, Setujui' : 'Ya, Tolak',
            variant: status === 'APPROVED' ? 'success' : 'danger',
        });
        if (!ok) return;
        try {
            await api.post(`/hr/leaves/${leaveId}/approve`, { status });
            alert(`Pengajuan cuti berhasil di-${status === 'APPROVED' ? 'setujui' : 'tolak'}!`);
            fetchEmployeeDetail();
        } catch (err) {
            alert('Gagal memproses pengajuan cuti: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-20 text-xs text-slate-500 dark:text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin mr-2 text-blue-600 dark:text-blue-400" />
                <span>Memuat profil karyawan...</span>
            </div>
        );
    }

    if (!employee) return null;

    const attendances = employee.attendances || [];
    const leaves = employee.leaves || [];
    const contractsList = employee.contracts || [];
    const salaryComponents = employee.salary_components || [];
    const payslipsList = employee.payslips || [];
    const stats = employee.stats || {};

    const employmentBadges = {
        PERMANENT: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        CONTRACT: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        PROBATION: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        INTERN: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    };

    const attendanceStatusBadges = {
        PRESENT: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        LATE: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        PERMISSION: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        SICK: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        ABSENT: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    };

    const leaveStatusBadges = {
        PENDING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        APPROVED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        REJECTED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-16">
            {/* Header Profile Card */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/employees"
                            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm shrink-0"
                            title="Kembali ke Daftar Karyawan"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>

                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0 uppercase font-mono">
                            {employee.full_name?.substring(0, 2) || 'EMP'}
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                    {employee.employee_code || 'EMP'}
                                </span>
                                {employee.nik && (
                                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                        NIK: {employee.nik}
                                    </span>
                                )}
                                <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase border ${employmentBadges[employee.employment_status] || employmentBadges.PERMANENT}`}>
                                    {employee.employment_status || 'PERMANENT'}
                                </span>
                            </div>

                            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                                {employee.full_name}
                            </h1>

                            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-2">
                                <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                                <span>{employee.position} &bull; <strong className="text-slate-800 dark:text-slate-200">{employee.department}</strong></span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            type="button"
                            onClick={() => openPdfPreview(`/hr/employees/${employee.id}/contract`)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-sm cursor-pointer"
                            title="Unduh / Cetak Surat Perjanjian Kerja Karyawan"
                        >
                            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>Cetak Kontrak Kerja</span>
                        </button>

                        {employee.user ? (
                            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-xs flex items-center space-x-1.5">
                                <ShieldCheck className="w-4 h-4" />
                                <span>Akun Login Terhubung ({employee.user.role})</span>
                            </span>
                        ) : (
                            <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold text-xs border border-slate-200 dark:border-slate-700">
                                Belum Ada Akun Login
                            </span>
                        )}
                    </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                    <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Total Kehadiran</span>
                        </span>
                        <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                            {stats.total_present || 0} Hari
                        </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/10 space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>Terlambat Masuk</span>
                        </span>
                        <div className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                            {stats.total_late || 0} Kali
                        </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-blue-500" />
                            <span>Izin / Sakit</span>
                        </span>
                        <div className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono">
                            {stats.total_permission || 0} Hari
                        </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/10 space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-purple-500" />
                            <span>Sisa Saldo Cuti</span>
                        </span>
                        <div className="text-lg font-black text-purple-600 dark:text-purple-400 font-mono">
                            {employee.leave_balance ?? 12} Hari
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 overflow-x-auto pb-0">
                <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 flex items-center space-x-2 ${
                        activeTab === 'profile'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#0f172a]'
                            : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Profil &amp; Biodata</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('attendance')}
                    className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 flex items-center space-x-2 ${
                        activeTab === 'attendance'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#0f172a]'
                            : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Riwayat Presensi ({attendances.length})</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('leaves')}
                    className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 flex items-center space-x-2 ${
                        activeTab === 'leaves'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#0f172a]'
                            : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Pengajuan Cuti ({leaves.length})</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('contracts')}
                    className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 flex items-center space-x-2 ${
                        activeTab === 'contracts'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#0f172a]'
                            : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Kontrak Kerja ({contractsList.length})</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('payroll')}
                    className={`px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 flex items-center space-x-2 ${
                        activeTab === 'payroll'
                            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#0f172a]'
                            : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                    <Banknote className="w-3.5 h-3.5" />
                    <span>Penggajian &amp; Slip Gaji ({salaryComponents.length})</span>
                </button>
            </div>

            {/* TAB CONTENTS */}
            {/* TAB 1: PROFILE & BIODATA */}
            {activeTab === 'profile' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>Biodata Pribadi &amp; Kontak</span>
                        </h3>

                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">Nama Lengkap</span>
                                <span className="font-bold text-slate-900 dark:text-slate-100">{employee.full_name}</span>
                            </div>

                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">Jenis Kelamin</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {employee.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}
                                </span>
                            </div>

                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">Tanggal Lahir</span>
                                <span className="font-mono text-slate-800 dark:text-slate-200">{employee.birth_date || '-'}</span>
                            </div>

                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">Email Karyawan</span>
                                <span className="font-mono text-slate-800 dark:text-slate-200">{employee.email || '-'}</span>
                            </div>

                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">No. HP / WhatsApp</span>
                                <span className="font-mono text-slate-800 dark:text-slate-200">{employee.phone || '-'}</span>
                            </div>

                            <div className="py-1.5 space-y-1">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold block">Alamat Tinggal</span>
                                <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                                    {employee.address || '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>Informasi Pekerjaan &amp; Rekening Payroll</span>
                        </h3>

                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">Jabatan</span>
                                <span className="font-bold text-slate-900 dark:text-slate-100">{employee.position}</span>
                            </div>

                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">Departemen</span>
                                <span className="font-bold text-blue-600 dark:text-blue-400">{employee.department}</span>
                            </div>

                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">Status Kepegawaian</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{employee.employment_status}</span>
                            </div>

                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">Tanggal Masuk (Join Date)</span>
                                <span className="font-mono text-slate-800 dark:text-slate-200">{employee.join_date || '-'}</span>
                            </div>

                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">Gaji Pokok</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                    {employee.salary ? 'Rp ' + parseFloat(employee.salary).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : 'Rp 0'}
                                </span>
                            </div>

                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">Nama Bank</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{employee.bank_name || '-'}</span>
                            </div>

                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">Nomor Rekening Bank</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{employee.bank_account_number || '-'}</span>
                            </div>

                            <div className="flex justify-between py-1.5">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">Pemilik Rekening</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.bank_account_holder || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: ATTENDANCE */}
            {activeTab === 'attendance' && (
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-emerald-600" />
                            <span>Riwayat Presensi &amp; Kehadiran ({attendances.length} Catatan Terakhir)</span>
                        </h3>
                    </div>

                    {attendances.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500">Belum ada catatan presensi untuk karyawan ini.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                        <th className="py-3 px-4">Tanggal Presensi</th>
                                        <th className="py-3 px-4">Jam Masuk (Clock In)</th>
                                        <th className="py-3 px-4">Jam Keluar (Clock Out)</th>
                                        <th className="py-3 px-4">Status Kehadiran</th>
                                        <th className="py-3 px-4">Catatan / Lokasi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                    {attendances.map((att) => (
                                        <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                                                {att.date}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                                                {att.clock_in || '-'}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                                                {att.clock_out || '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${attendanceStatusBadges[att.status] || attendanceStatusBadges.PRESENT}`}>
                                                    {att.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                                                {att.notes || att.location || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 3: LEAVES */}
            {activeTab === 'leaves' && (
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-600" />
                            <span>Riwayat Pengajuan Cuti &amp; Izin ({leaves.length})</span>
                        </h3>
                    </div>

                    {leaves.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500">Belum ada pengajuan cuti terdaftar untuk karyawan ini.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                        <th className="py-3 px-4">Tipe Cuti</th>
                                        <th className="py-3 px-4">Tanggal Mulai</th>
                                        <th className="py-3 px-4">Tanggal Selesai</th>
                                        <th className="py-3 px-4">Total Hari</th>
                                        <th className="py-3 px-4">Alasan Cuti</th>
                                        <th className="py-3 px-4">Status Approval</th>
                                        <th className="py-3 px-4 text-right">Aksi HR</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                    {leaves.map((l) => (
                                        <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="py-3 px-4 font-bold text-purple-600 dark:text-purple-400">
                                                {l.leave_type || 'ANNUAL'}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                                                {l.start_date}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                                                {l.end_date}
                                            </td>
                                            <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                                                {l.total_days || 1} Hari
                                            </td>
                                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                                                {l.reason || '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${leaveStatusBadges[l.status] || leaveStatusBadges.PENDING}`}>
                                                    {l.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                {l.status === 'PENDING' && (
                                                    <div className="flex items-center justify-end space-x-1.5">
                                                        <button
                                                            onClick={() => handleApproveLeave(l.id, 'APPROVED')}
                                                            className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/20 transition-all"
                                                        >
                                                            Setujui
                                                        </button>
                                                        <button
                                                            onClick={() => handleApproveLeave(l.id, 'REJECTED')}
                                                            className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-[10px] border border-rose-500/20 transition-all"
                                                        >
                                                            Tolak
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'contracts' && (
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>Riwayat &amp; Salinan Kontrak Kerja</span>
                        </h3>
                        <Link
                            to={`/hr/contracts?employee_id=${employee.id}`}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] transition-all"
                        >
                            Kelola Semua Kontrak Karyawan Ini
                        </Link>
                    </div>

                    {contractsList.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500">Belum ada kontrak kerja terdaftar untuk karyawan ini.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                        <th className="py-3 px-4">No. Kontrak</th>
                                        <th className="py-3 px-4">Tipe</th>
                                        <th className="py-3 px-4">Jabatan</th>
                                        <th className="py-3 px-4">Masa Berlaku</th>
                                        <th className="py-3 px-4">Gaji Pokok</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 text-right">Lampiran / PDF</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                    {contractsList.map((c) => (
                                        <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                                                {c.contract_number}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="font-semibold text-slate-600 dark:text-slate-400">{c.contract_type}</span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                                                {c.position || '-'}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                                                {c.start_date ? c.start_date.substring(0, 10) : '-'} s/d {c.end_date ? c.end_date.substring(0, 10) : 'Permanent'}
                                            </td>
                                            <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">
                                                {c.base_salary ? 'Rp ' + parseFloat(c.base_salary).toLocaleString('id-ID') : '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                                    c.status === 'ACTIVE'
                                                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                        : c.status === 'EXPIRED'
                                                        ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                                        : 'bg-slate-500/10 text-slate-600 border-slate-500/20'
                                                }`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right space-x-2">
                                                <button
                                                    onClick={async () => {
                                                        const win = window.open('', '_blank');
                                                        try {
                                                            const res = await api.get(`/hr/contracts/${c.id}/pdf`, { responseType: 'blob' });
                                                            const pdfUrl = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                                                            if (win) win.location.href = pdfUrl;
                                                        } catch {
                                                            win?.close();
                                                            alert('Gagal cetak kontrak.');
                                                        }
                                                    }}
                                                    className="px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-[10px] border border-blue-500/20 transition-all"
                                                >
                                                    Cetak
                                                </button>
                                                {c.file_path && (
                                                    <a
                                                        href={c.file_path}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-block px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/20 transition-all"
                                                    >
                                                        Scan
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 5: INFORMASI PENGGAJIAN & SLIP GAJI */}
            {activeTab === 'payroll' && (
                <div className="space-y-6">
                    {/* Ringkasan Gaji & Rekening Bank */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
                            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                                <DollarSign className="w-4 h-4 text-emerald-500" />
                                <span>Gaji Pokok (Base Salary)</span>
                            </div>
                            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                                Rp {parseFloat(employee.salary || 0).toLocaleString('id-ID')}
                            </div>
                            <p className="text-[11px] text-slate-500">Nominal dasar sebelum tunjangan &amp; potongan.</p>
                        </div>

                        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
                            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                                <CreditCard className="w-4 h-4 text-blue-500" />
                                <span>Rekening Bank Transfer</span>
                            </div>
                            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
                                {employee.bank_name || 'BCA'} — {employee.bank_account_number || '-'}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">a/n {employee.bank_account_holder || employee.full_name}</p>
                        </div>

                        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                                    <Banknote className="w-4 h-4 text-indigo-500" />
                                    <span>Komponen Tunjangan / Potongan</span>
                                </div>
                                <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono mt-1">
                                    {salaryComponents.length} <span className="text-xs font-normal text-slate-500">Komponen Aktif</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowComponentsModal(true)}
                                className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center space-x-1.5 transition-all"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Kelola Komponen Gaji</span>
                            </button>
                        </div>
                    </div>

                    {/* Master Komponen Gaji Karyawan */}
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div>
                                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <Banknote className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    <span>Master Komponen Tunjangan &amp; Potongan Default</span>
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Daftar tunjangan harian/tetap dan potongan rutin untuk perhitungan penggajian bulanan.</p>
                            </div>
                            <button
                                onClick={() => setShowComponentsModal(true)}
                                className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 font-bold text-xs border border-indigo-200 dark:border-indigo-800 flex items-center space-x-1 transition-all"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>+ Komponen Gaji</span>
                            </button>
                        </div>

                        {salaryComponents.length === 0 ? (
                            <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500">
                                Belum ada komponen tunjangan atau potongan khusus untuk karyawan ini.
                                <br />
                                <button
                                    onClick={() => setShowComponentsModal(true)}
                                    className="mt-3 text-indigo-600 font-bold hover:underline"
                                >
                                    + Tambah Komponen Pertama
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                            <th className="py-3 px-4">Nama Komponen</th>
                                            <th className="py-3 px-4">Kategori</th>
                                            <th className="py-3 px-4">Metode Perhitungan</th>
                                            <th className="py-3 px-4 text-right">Nominal / Nilai</th>
                                            <th className="py-3 px-4 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                        {salaryComponents.map((comp) => (
                                            <tr key={comp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                                <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{comp.name}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                                        comp.component_type === 'ALLOWANCE'
                                                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                            : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                                    }`}>
                                                        {comp.component_type === 'ALLOWANCE' ? 'PENDAPATAN' : 'POTONGAN'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                                                    {comp.calculation_type === 'DAILY_ATTENDANCE' ? 'Harian x Absensi (Daily)' : comp.calculation_type === 'PERCENTAGE' ? '% dari Gaji Pokok' : 'Nominal Tetap (Fixed)'}
                                                </td>
                                                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                                                    {comp.calculation_type === 'PERCENTAGE' ? `${comp.amount}%` : `Rp ${parseFloat(comp.amount).toLocaleString('id-ID')}`}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${comp.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                        {comp.is_active ? 'AKTIF' : 'NONAKTIF'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Riwayat Slip Gaji Terbit */}
                    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span>Riwayat Slip Gaji Terbit ({payslipsList.length})</span>
                            </h3>
                        </div>

                        {payslipsList.length === 0 ? (
                            <div className="p-8 text-center border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500">
                                Belum ada slip gaji yang diterbitkan untuk karyawan ini.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60">
                                            <th className="py-3 px-4">No. Slip / Periode</th>
                                            <th className="py-3 px-4">Tgl Pembayaran</th>
                                            <th className="py-3 px-4 text-right">Gaji Pokok</th>
                                            <th className="py-3 px-4 text-right">Tunjangan</th>
                                            <th className="py-3 px-4 text-right">Potongan</th>
                                            <th className="py-3 px-4 text-right">Take Home Pay</th>
                                            <th className="py-3 px-4 text-center">Status</th>
                                            <th className="py-3 px-4 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                        {payslipsList.map((slip) => (
                                            <tr key={slip.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 font-mono">
                                                <td className="py-3 px-4">
                                                    <div className="font-bold text-slate-900 dark:text-slate-100">{slip.payslip_number || 'DRAFT'}</div>
                                                    <div className="text-[10px] font-sans text-slate-400">{slip.period?.period_name || 'Periode Penggajian'}</div>
                                                </td>
                                                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{slip.payment_date || '-'}</td>
                                                <td className="py-3 px-4 text-right font-bold">Rp {parseFloat(slip.basic_salary).toLocaleString('id-ID')}</td>
                                                <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">+Rp {parseFloat(slip.total_allowances).toLocaleString('id-ID')}</td>
                                                <td className="py-3 px-4 text-right text-rose-600 dark:text-rose-400 font-bold">-Rp {parseFloat(slip.total_deductions).toLocaleString('id-ID')}</td>
                                                <td className="py-3 px-4 text-right text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">Rp {parseFloat(slip.net_salary).toLocaleString('id-ID')}</td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${slip.payment_status === 'PAID' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'}`}>
                                                        {slip.payment_status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right space-x-1.5 font-sans">
                                                    <button
                                                        onClick={() => setSelectedPayslipPreview(slip)}
                                                        className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-bold text-[10px] border border-blue-200 dark:border-blue-800"
                                                    >
                                                        Preview
                                                    </button>
                                                    <button
                                                         type="button"
                                                         onClick={() => openPdfPreview(`/hr/payslips/${slip.id}/pdf`)}
                                                         className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 font-bold text-[10px] border border-emerald-200 dark:border-emerald-800 cursor-pointer"
                                                     >
                                                         <Download className="w-3 h-3" />
                                                         <span>PDF</span>
                                                     </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal Master Salary Components */}
            {showComponentsModal && employee && (
                <EmployeeSalaryComponentsModal
                    employee={employee}
                    onClose={() => {
                        setShowComponentsModal(false);
                        fetchEmployeeDetail();
                    }}
                />
            )}

            {/* Modal Payslip Preview */}
            {selectedPayslipPreview && (
                <PayslipPreviewModal
                    payslip={selectedPayslipPreview}
                    onClose={() => setSelectedPayslipPreview(null)}
                />
            )}
        </div>
    );
}
